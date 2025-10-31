"""
Vercel Serverless Function for IGS Predictions

This API endpoint handles prediction requests for Inclusive Growth Scores.
"""

import json
import os
import sys
from http.server import BaseHTTPRequestHandler
from typing import Dict, Any, List, Optional

# Add src directory to path for imports
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(BASE_DIR, 'src')  # Use frontend/src, not ../src
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

try:
    from analysis.predict_future_igs import IGSPredictor
except ImportError as e:
    print(f"Import error: {e}")
    print(f"BASE_DIR: {BASE_DIR}")
    print(f"SRC_DIR: {SRC_DIR}")
    print(f"sys.path: {sys.path}")
    print(f"Contents of SRC_DIR: {os.listdir(SRC_DIR) if os.path.exists(SRC_DIR) else 'NOT FOUND'}")
    raise

# Constants
DEFAULT_YEARS = 5
MIN_YEARS = 1
MAX_YEARS = 15

# Initialize predictor (singleton pattern for efficiency)
_predictor = None


def get_predictor() -> IGSPredictor:
    """Get or create predictor instance"""
    global _predictor
    if _predictor is None:
        _predictor = IGSPredictor()
        try:
            _predictor.load_model()
        except FileNotFoundError:
            # Train model if it doesn't exist
            print("Model not found. Training new model...")
            _predictor.train_model()
    return _predictor


def parse_years(value: Any) -> int:
    """Parse and validate years_ahead parameter"""
    try:
        years = int(value)
        return max(MIN_YEARS, min(years, MAX_YEARS))
    except (ValueError, TypeError):
        return DEFAULT_YEARS


def validate_tract(tract: Any) -> str:
    """Validate and normalize tract FIPS code"""
    if not tract:
        raise ValueError("Tract FIPS code is required")
    
    tract_str = str(tract).strip()
    
    # Remove any non-digit characters
    tract_str = ''.join(c for c in tract_str if c.isdigit())
    
    # Pad to 10 digits
    tract_str = tract_str.zfill(10)
    
    if len(tract_str) > 11:
        raise ValueError(f"Invalid tract FIPS code: {tract} (too long)")
    
    return tract_str


def validate_interventions(interventions: Any) -> List[str]:
    """Validate interventions parameter"""
    if not interventions:
        return []
    
    if isinstance(interventions, str):
        interventions = [interventions]
    
    if not isinstance(interventions, list):
        raise ValueError("Interventions must be a list")
    
    valid_interventions = {'digital', 'housing', 'entrepreneurship', 'workforce'}
    validated = []
    
    for intervention in interventions:
        intervention = str(intervention).lower().strip()
        if intervention in valid_interventions:
            validated.append(intervention)
        else:
            print(f"Warning: Unknown intervention '{intervention}' ignored")
    
    return validated


def handle_prediction_request(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handle prediction request
    
    Args:
        data: Request data with keys: tract, interventions, years_ahead
        
    Returns:
        Dictionary with predictions and metadata
    """
    try:
        # Validate and parse inputs
        tract = validate_tract(data.get('tract'))
        interventions = validate_interventions(data.get('interventions', []))
        years_ahead = parse_years(data.get('years_ahead', DEFAULT_YEARS))
        
        # Get predictor and make predictions
        predictor = get_predictor()
        predictions = predictor.predict(tract, interventions, years_ahead)
        
        # Format response
        response = {
            'success': True,
            'tract': tract,
            'interventions': interventions,
            'years_ahead': years_ahead,
            'predictions': [round(p, 2) for p in predictions],
            'years': list(range(1, years_ahead + 1))
        }
        
        return response
        
    except ValueError as e:
        raise ValueError(f"Validation error: {str(e)}")
    except Exception as e:
        raise RuntimeError(f"Prediction error: {str(e)}")


class handler(BaseHTTPRequestHandler):
    """Vercel serverless function handler"""
    
    def _set_cors_headers(self):
        """Set CORS headers for cross-origin requests"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def _send_json_response(self, status_code: int, data: Dict[str, Any]):
        """Send JSON response with proper headers"""
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self._set_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def _send_error_response(self, status_code: int, error_message: str):
        """Send error response"""
        self._send_json_response(status_code, {
            'success': False,
            'error': error_message
        })
    
    def do_OPTIONS(self):
        """Handle OPTIONS request for CORS preflight"""
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()
    
    def do_POST(self):
        """Handle POST request"""
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self._send_error_response(400, "Empty request body")
                return
            
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)
            
            # Process request
            result = handle_prediction_request(data)
            self._send_json_response(200, result)
            
        except json.JSONDecodeError as e:
            self._send_error_response(400, f"Invalid JSON: {str(e)}")
        except ValueError as e:
            self._send_error_response(400, str(e))
        except Exception as e:
            print(f"Server error: {e}")
            self._send_error_response(500, f"Internal server error: {str(e)}")
    
    def do_GET(self):
        """Handle GET request"""
        try:
            from urllib.parse import parse_qs, urlparse
            
            # Parse query string
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            
            # Extract parameters
            data = {
                'tract': query_params.get('tract', [''])[0],
                'interventions': query_params.get('interventions', []),
                'years_ahead': query_params.get('years_ahead', [DEFAULT_YEARS])[0]
            }
            
            # Process request
            result = handle_prediction_request(data)
            self._send_json_response(200, result)
            
        except ValueError as e:
            self._send_error_response(400, str(e))
        except Exception as e:
            print(f"Server error: {e}")
            self._send_error_response(500, f"Internal server error: {str(e)}")


# For local testing
if __name__ == '__main__':
    from http.server import HTTPServer
    
    print("Starting local test server on port 8000...")
    print("Test with: curl 'http://localhost:8000?tract=1121010500&interventions=digital&years_ahead=5'")
    
    server = HTTPServer(('localhost', 8000), handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
