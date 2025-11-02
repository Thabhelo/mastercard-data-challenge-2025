import json
import os
import sys
import logging
from http.server import BaseHTTPRequestHandler
from typing import Dict, Any, List, Optional

import pandas as pd
import numpy as np
from sklearn.linear_model import Ridge
import joblib

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

API_DIR = os.path.dirname(os.path.abspath(__file__))
IGS_PATH = os.path.join(API_DIR, 'igs_talladega_tracts.csv')
ACS_PATH = os.path.join(API_DIR, 'acs_talladega_tracts.csv')
MODEL_PATH = os.path.join(API_DIR, 'model_predict_igs.joblib')

DEFAULT_YEARS = 5
MIN_YEARS = 1
MAX_YEARS = 15

FEATURES = [
    'median_household_income',
    'gini_index',
    'per_capita_income',
    'poverty_rate',
    'unemployment_rate',
    'labor_force_participation_rate',
    'housing_cost_burden_rate',
    'broadband_access_rate',
    'computer_access_rate',
    'median_home_value',
    'white_alone_pct',
    'black_alone_pct',
    'hispanic_latino_pct'
]

INTERVENTIONS = {
    'digital': ['broadband_access_rate', 'computer_access_rate'],
    'housing': ['housing_cost_burden_rate', 'median_home_value'],
    'entrepreneurship': ['per_capita_income', 'median_household_income'],
    'workforce': ['labor_force_participation_rate', 'unemployment_rate']
}

INTERVENTION_DELTAS = {
    'broadband_access_rate': 6.0,
    'computer_access_rate': 5.0,
    'housing_cost_burden_rate': -5.0,
    'median_home_value': 5.0,
    'per_capita_income': 7.0,
    'median_household_income': 5.0,
    'labor_force_participation_rate': 5.0,
    'unemployment_rate': -3.0
}

_predictor = None


def normalize_fips(fips: str) -> str:
    if not fips:
        raise ValueError("FIPS code is required")
    fips_clean = ''.join(c for c in str(fips) if c.isdigit())
    if len(fips_clean) > 11:
        raise ValueError("Invalid FIPS code: too long")
    return fips_clean.zfill(10)


class IGSPredictor:
    def __init__(self):
        self.model = None
        self.features = FEATURES
        self.igs_df = None
        self.acs_df = None
        self._load_data()

    def _load_data(self):
        try:
            self.igs_df = pd.read_csv(IGS_PATH, dtype={'Census Tract FIPS code': str})
            self.acs_df = pd.read_csv(ACS_PATH, dtype={'tract_fips': str})

            self.igs_df['Census Tract FIPS code'] = (
                self.igs_df['Census Tract FIPS code']
                .astype(str)
                .str.zfill(10)
            )
            self.acs_df['tract_fips'] = (
                self.acs_df['tract_fips']
                .astype(str)
                .str.zfill(11)
            )
            logger.info("Data loaded successfully")
        except Exception as e:
            logger.error(f"Error loading data: {e}")
            raise RuntimeError("Failed to load data files")

    def train_model(self, alpha: float = 1.0):
        X, y = [], []

        for tract in self.igs_df['Census Tract FIPS code'].unique():
            tract_acs = self.acs_df[
                self.acs_df['tract_fips'].str[-10:] == tract
            ]

            if tract_acs.empty:
                continue

            acs_features = tract_acs.iloc[0]
            tract_df = self.igs_df[
                self.igs_df['Census Tract FIPS code'] == tract
            ].sort_values('Year')

            years = tract_df['Year'].values
            igs_scores = tract_df['Inclusive Growth Score'].values

            for i in range(len(years) - 1):
                feature_vector = [acs_features.get(fk, np.nan) for fk in self.features]
                X.append([years[i]] + feature_vector + [igs_scores[i]])
                y.append(igs_scores[i + 1])

        X = np.array(X)
        y = np.array(y)
        X = np.nan_to_num(X, nan=0.0)

        self.model = Ridge(alpha=alpha)
        self.model.fit(X, y)

        joblib.dump((self.model, self.features), MODEL_PATH)
        logger.info(f"Model trained with {len(X)} samples")
        return self.model

    def load_model(self):
        if not os.path.exists(MODEL_PATH):
            logger.warning("Model not found, training new model")
            return self.train_model()

        self.model, self.features = joblib.load(MODEL_PATH)
        logger.info("Model loaded successfully")
        return self.model

    def predict(
        self,
        tract: str,
        interventions: Optional[List[str]] = None,
        years_ahead: int = 5
    ) -> List[float]:
        if self.model is None:
            self.load_model()

        tract = normalize_fips(tract)

        tract_acs = self.acs_df[
            self.acs_df['tract_fips'].str[-10:] == tract
        ]

        if tract_acs.empty:
            raise ValueError("No data found for specified tract")

        acs_features = tract_acs.iloc[0]

        tract_igs = self.igs_df[
            self.igs_df['Census Tract FIPS code'] == tract
        ].sort_values('Year')

        if tract_igs.empty:
            raise ValueError("No IGS data found for specified tract")

        last_record = tract_igs.iloc[-1]
        current_year = int(last_record['Year'])
        current_igs = float(last_record['Inclusive Growth Score'])

        feature_vector = [acs_features.get(fk, 0.0) for fk in self.features]

        if interventions:
            feature_vector = self._apply_interventions(feature_vector, interventions)

        predictions = []
        prev_igs = current_igs

        for step in range(1, years_ahead + 1):
            input_row = [current_year + step] + feature_vector + [prev_igs]
            pred = float(self.model.predict([input_row])[0])
            pred = max(0.0, min(100.0, pred))
            predictions.append(pred)
            prev_igs = pred

        return predictions

    def _apply_interventions(
        self,
        feature_vector: List[float],
        interventions: List[str]
    ) -> List[float]:
        modified = feature_vector.copy()

        for intervention_type in interventions:
            if intervention_type not in INTERVENTIONS:
                continue

            for feature_name in INTERVENTIONS[intervention_type]:
                if feature_name in self.features:
                    idx = self.features.index(feature_name)
                    delta = INTERVENTION_DELTAS.get(feature_name, 0.0)
                    modified[idx] = modified[idx] + delta

        return modified


def get_predictor() -> IGSPredictor:
    global _predictor
    if _predictor is None:
        _predictor = IGSPredictor()
        try:
            _predictor.load_model()
        except Exception as e:
            logger.error(f"Error loading predictor: {e}")
            _predictor.train_model()
    return _predictor


def validate_request(data: Dict[str, Any]) -> Dict[str, Any]:
    if not data:
        raise ValueError("Request body is required")

    tract = data.get('tract')
    if not tract:
        raise ValueError("Tract FIPS code is required")

    interventions = data.get('interventions', [])
    if isinstance(interventions, str):
        interventions = [interventions]
    if not isinstance(interventions, list):
        raise ValueError("Interventions must be a list")

    valid_interventions = set(INTERVENTIONS.keys())
    validated_interventions = [
        i for i in interventions
        if i in valid_interventions
    ]

    years_ahead = data.get('years_ahead', DEFAULT_YEARS)
    try:
        years_ahead = int(years_ahead)
        years_ahead = max(MIN_YEARS, min(years_ahead, MAX_YEARS))
    except (ValueError, TypeError):
        years_ahead = DEFAULT_YEARS

    return {
        'tract': tract,
        'interventions': validated_interventions,
        'years_ahead': years_ahead
    }


def handle_prediction_request(data: Dict[str, Any]) -> Dict[str, Any]:
    try:
        validated = validate_request(data)
        predictor = get_predictor()
        predictions = predictor.predict(
            validated['tract'],
            validated['interventions'],
            validated['years_ahead']
        )

        return {
            'success': True,
            'tract': normalize_fips(validated['tract']),
            'interventions': validated['interventions'],
            'years_ahead': validated['years_ahead'],
            'predictions': [round(p, 2) for p in predictions],
            'years': list(range(1, validated['years_ahead'] + 1))
        }

    except ValueError as e:
        raise ValueError(str(e))
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise RuntimeError("Prediction failed")


class handler(BaseHTTPRequestHandler):
    def _set_headers(self, status_code: int):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def _send_json(self, status_code: int, data: Dict[str, Any]):
        self._set_headers(status_code)
        self.wfile.write(json.dumps(data).encode('utf-8'))

    def _send_error(self, status_code: int, message: str):
        self._send_json(status_code, {
            'success': False,
            'error': message
        })

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self._send_error(400, "Empty request body")
                return

            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body)

            result = handle_prediction_request(data)
            self._send_json(200, result)

        except json.JSONDecodeError:
            self._send_error(400, "Invalid JSON")
        except ValueError as e:
            self._send_error(400, str(e))
        except Exception as e:
            logger.error(f"Server error: {e}")
            self._send_error(500, "Internal server error")

    def do_GET(self):
        try:
            from urllib.parse import parse_qs, urlparse

            parsed = urlparse(self.path)
            params = parse_qs(parsed.query)

            data = {
                'tract': params.get('tract', [''])[0],
                'interventions': params.get('interventions', []),
                'years_ahead': params.get('years_ahead', [DEFAULT_YEARS])[0]
            }

            result = handle_prediction_request(data)
            self._send_json(200, result)

        except ValueError as e:
            self._send_error(400, str(e))
        except Exception as e:
            logger.error(f"Server error: {e}")
            self._send_error(500, "Internal server error")
