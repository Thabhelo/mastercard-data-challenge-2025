import json
import os
import joblib
import pandas as pd
from http.server import BaseHTTPRequestHandler
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../src/analysis'))
from predict_future_igs import predict_igs_tract

DEFAULT_YEARS = 5
FRONTEND_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../'))
MODEL_PATH = os.path.join(FRONTEND_ROOT, 'src/model_predict_igs.joblib')
ACS_PATH = os.path.join(FRONTEND_ROOT, 'data/acs_talladega_tracts.csv')

acs_df = pd.read_csv(ACS_PATH)


def parse_years(body):
    ya = body.get('years_ahead', DEFAULT_YEARS)
    try:
        return max(1, min(int(ya), 15))
    except Exception:
        return DEFAULT_YEARS

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers['Content-Length'])
        body = self.rfile.read(length).decode('utf-8')
        data = json.loads(body)
        tract = data.get('tract')
        interventions_on = data.get('interventions', [])
        years_ahead = parse_years(data)
        try:
            preds = predict_igs_tract(tract, interventions_on, years_ahead)
            out = { 'predictions': preds, 'years': [i+1 for i in range(len(preds))] }
        except Exception as e:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
            return
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(out).encode())

    def do_GET(self):
        from urllib.parse import parse_qs, urlparse
        qs = parse_qs(urlparse(self.path).query)
        tract = qs.get('tract', ['1121010500'])[0]
        interventions_on = qs.get('interventions', [])
        years_ahead = int(qs.get('years_ahead', [DEFAULT_YEARS])[0])
        try:
            preds = predict_igs_tract(tract, interventions_on, years_ahead)
            out = { 'predictions': preds, 'years': [i+1 for i in range(len(preds))] }
        except Exception as e:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(json.dumps({'error': str(e)}).encode())
            return
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(out).encode())
