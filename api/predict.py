"""
Vercel Serverless Function for IGS Predictions (root /api)

This file is placed under /api so Vercel auto-routes it to /api/predict.
It imports the predictor from the frontend's src/analysis directory.
"""

import json
import os
import sys
from http.server import BaseHTTPRequestHandler
from typing import Dict, Any, List, Optional

# Add frontend/src to path for imports
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_SRC = os.path.join(REPO_ROOT, 'frontend', 'src')
if FRONTEND_SRC not in sys.path:
    sys.path.insert(0, FRONTEND_SRC)

try:
    from analysis.predict_future_igs import IGSPredictor  # type: ignore
except ImportError as e:
    print(f"Import error: {e}")
    print(f"REPO_ROOT: {REPO_ROOT}")
    print(f"FRONTEND_SRC: {FRONTEND_SRC}")
    print(f"sys.path head: {sys.path[:5]}")
    raise

DEFAULT_YEARS = 5
MIN_YEARS = 1
MAX_YEARS = 15

_predictor = None


def get_predictor() -> IGSPredictor:
    global _predictor
    if _predictor is None:
        _predictor = IGSPredictor()
        try:
            _predictor.load_model()
        except FileNotFoundError:
            print("Model not found. Training new model in memory...")
            _predictor.train_model()
    return _predictor


def parse_years(value: Any) -> int:
    try:
        years = int(value)
        return max(MIN_YEARS, min(years, MAX_YEARS))
    except (ValueError, TypeError):
        return DEFAULT_YEARS


def validate_tract(tract: Any) -> str:
    if not tract:
        raise ValueError("Tract FIPS code is required")
    tract_str = ''.join(c for c in str(tract).strip() if c.isdigit()).zfill(10)
    if len(tract_str) < 10:
        raise ValueError("Invalid tract FIPS code")
    return tract_str


def validate_interventions(interventions: Any) -> List[str]:
    if not interventions:
        return []
    if isinstance(interventions, str):
        interventions = [interventions]
    if not isinstance(interventions, list):
        raise ValueError("Interventions must be a list")
    valid = {'digital', 'housing', 'entrepreneurship', 'workforce'}
    out: List[str] = []
    for i in interventions:
        i_str = str(i).lower().strip()
        if i_str in valid:
            out.append(i_str)
    return out


def handle_prediction_request(data: Dict[str, Any]) -> Dict[str, Any]:
    tract = validate_tract(data.get('tract'))
    interventions = validate_interventions(data.get('interventions', []))
    years_ahead = parse_years(data.get('years_ahead', DEFAULT_YEARS))
    pred = get_predictor()
    predictions = pred.predict(tract, interventions, years_ahead)
    return {
        'success': True,
        'tract': tract,
        'interventions': interventions,
        'years_ahead': years_ahead,
        'predictions': [round(p, 2) for p in predictions],
        'years': list(range(1, years_ahead + 1))
    }


class handler(BaseHTTPRequestHandler):
    def _set_cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')

    def _send_json(self, status: int, payload: Dict[str, Any]):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self._set_cors()
        self.end_headers()
        self.wfile.write(json.dumps(payload).encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors()
        self.end_headers()

    def do_POST(self):
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
            self._send_json(500, {'success': False, 'error': f'Internal server error: {e}'})

    def do_GET(self):
        try:
            from urllib.parse import urlparse, parse_qs
            qs = parse_qs(urlparse(self.path).query)
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
            self._send_json(500, {'success': False, 'error': f'Internal server error: {e}'})


if __name__ == '__main__':
    from http.server import HTTPServer
    server = HTTPServer(('localhost', 8000), handler)
    print('Serving on http://localhost:8000')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass

