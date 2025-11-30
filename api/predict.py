"""
Vercel Serverless Function for IGS Predictions

Uses the new constrained ML predictor for realistic predictions.
Supports both GET and POST requests.

Endpoints:
    POST /api/predict - Predict IGS with interventions
    GET /api/predict?tract=...&interventions=...&years_ahead=5
"""

import json
import os
import sys
from http.server import BaseHTTPRequestHandler
from typing import Dict, Any, List, Optional

# Add project root to path
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, REPO_ROOT)

# Try to import new ML module first, fall back to old
try:
    from ml.models.constrained_predictor import ConstrainedIGSPredictor
    USE_NEW_MODEL = True
    print("Using new constrained ML predictor")
except ImportError:
    try:
        from src.analysis.predict_future_igs import IGSPredictor as ConstrainedIGSPredictor
        USE_NEW_MODEL = False
        print("Falling back to legacy predictor")
    except ImportError as e:
        print(f"Import error: {e}")
        raise

DEFAULT_YEARS = 5
MIN_YEARS = 1
MAX_YEARS = 15

_predictor = None


def get_predictor() -> ConstrainedIGSPredictor:
    """Get or initialize the predictor singleton"""
    global _predictor
    if _predictor is None:
        _predictor = ConstrainedIGSPredictor()
        try:
            if USE_NEW_MODEL:
                _predictor.load()
            else:
                _predictor.load_model()
        except FileNotFoundError:
            print("Model not found. Training new model...")
            if USE_NEW_MODEL:
                _predictor.train()
            else:
                _predictor.train_model()
    return _predictor


def parse_years(value: Any) -> int:
    """Parse and validate years parameter"""
    try:
        years = int(value)
        return max(MIN_YEARS, min(years, MAX_YEARS))
    except (ValueError, TypeError):
        return DEFAULT_YEARS


def validate_tract(tract: Any) -> str:
    """Validate and normalize tract FIPS code"""
    if not tract:
        raise ValueError("Tract FIPS code is required")
    tract_str = ''.join(c for c in str(tract).strip() if c.isdigit()).zfill(10)
    if len(tract_str) < 10:
        raise ValueError("Invalid tract FIPS code")
    return tract_str


def validate_interventions(interventions: Any) -> List[str]:
    """Validate and normalize interventions list"""
    if not interventions:
        return []
    if isinstance(interventions, str):
        # Handle comma-separated string
        if ',' in interventions:
            interventions = [i.strip() for i in interventions.split(',')]
        else:
            interventions = [interventions]
    if not isinstance(interventions, list):
        raise ValueError("Interventions must be a list")
    
    valid = {'digital', 'housing', 'entrepreneurship', 'workforce', 'health', 'policy'}
    out: List[str] = []
    for i in interventions:
        i_str = str(i).lower().strip()
        if i_str in valid:
            out.append(i_str)
    return out


def handle_prediction_request(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handle a prediction request.
    
    Args:
        data: Dict with 'tract', 'interventions', 'years_ahead'
        
    Returns:
        Dict with prediction results
    """
    tract = validate_tract(data.get('tract'))
    interventions = validate_interventions(data.get('interventions', []))
    years_ahead = parse_years(data.get('years_ahead', DEFAULT_YEARS))
    
    predictor = get_predictor()
    predictions = predictor.predict(tract, interventions, years_ahead)
    
    # Also get baseline for comparison
    baseline = predictor.predict(tract, [], years_ahead)
    
    # Calculate deltas - convert numpy types to native Python floats
    deltas = [float(round(p - b, 2)) for p, b in zip(predictions, baseline)]
    
    return {
        'success': True,
        'tract': tract,
        'interventions': interventions,
        'years_ahead': years_ahead,
        'predictions': [float(round(p, 2)) for p in predictions],
        'baseline': [float(round(b, 2)) for b in baseline],
        'deltas': deltas,
        'years': list(range(1, years_ahead + 1)),
        'model': 'constrained_bayesian_ridge' if USE_NEW_MODEL else 'legacy'
    }


def handle_health_check() -> Dict[str, Any]:
    """Health check endpoint"""
    return {
        'status': 'healthy',
        'model_loaded': _predictor is not None,
        'model_type': 'constrained_bayesian_ridge' if USE_NEW_MODEL else 'legacy'
    }


class handler(BaseHTTPRequestHandler):
    """HTTP request handler for Vercel serverless"""
    
    def _set_cors(self):
        """Set CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def _send_json(self, status: int, payload: Dict[str, Any]):
        """Send JSON response"""
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self._set_cors()
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))

    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self._set_cors()
        self.end_headers()

    def do_POST(self):
        """Handle POST requests"""
        try:
            length = int(self.headers.get('Content-Length', 0))
            if length == 0:
                self._send_json(400, {'success': False, 'error': 'Empty request body'})
                return
            
            body = self.rfile.read(length).decode('utf-8')
            data = json.loads(body)
            result = handle_prediction_request(data)
            self._send_json(200, result)
            
        except json.JSONDecodeError as e:
            self._send_json(400, {'success': False, 'error': f'Invalid JSON: {e}'})
        except ValueError as e:
            self._send_json(400, {'success': False, 'error': str(e)})
        except Exception as e:
            self._send_json(500, {'success': False, 'error': f'Internal error: {type(e).__name__}'})

    def do_GET(self):
        """Handle GET requests"""
        try:
            from urllib.parse import urlparse, parse_qs
            parsed = urlparse(self.path)
            
            # Health check
            if parsed.path.endswith('/health'):
                self._send_json(200, handle_health_check())
                return
            
            # Prediction request
            qs = parse_qs(parsed.query)
            data = {
                'tract': qs.get('tract', [''])[0],
                'interventions': qs.get('interventions', []),
                'years_ahead': qs.get('years_ahead', [DEFAULT_YEARS])[0]
            }
            result = handle_prediction_request(data)
            self._send_json(200, result)
            
        except ValueError as e:
            self._send_json(400, {'success': False, 'error': str(e)})
        except Exception as e:
            self._send_json(500, {'success': False, 'error': f'Internal error: {type(e).__name__}'})


def run_local_server(port: int = 8000):
    """Run local development server"""
    from http.server import HTTPServer
    
    print(f"\n{'=' * 50}")
    print(f"IGS Prediction API Server")
    print(f"{'=' * 50}")
    print(f"\nStarting server on http://localhost:{port}")
    print(f"Model type: {'Constrained Bayesian Ridge' if USE_NEW_MODEL else 'Legacy'}")
    print(f"\nEndpoints:")
    print(f"  POST /api/predict")
    print(f"  GET  /api/predict?tract=1121010500&interventions=digital,housing")
    print(f"  GET  /api/predict/health")
    print(f"\nPress Ctrl+C to stop\n")
    
    # Pre-load model
    print("Loading model...")
    get_predictor()
    print("Model loaded successfully!\n")
    
    server = HTTPServer(('localhost', port), handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='IGS Prediction API Server')
    parser.add_argument('--port', type=int, default=8000, help='Port to run on')
    args = parser.parse_args()
    
    run_local_server(args.port)
