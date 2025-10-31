"""
Predict Future Inclusive Growth Scores (IGS)

This module trains a Ridge regression model to predict future IGS scores
based on historical IGS data and ACS (American Community Survey) features.
"""

import pandas as pd
import numpy as np
from sklearn.linear_model import Ridge
from sklearn.preprocessing import StandardScaler
import joblib
import os
from typing import List, Dict, Tuple, Optional
import warnings

warnings.filterwarnings('ignore')

# Paths configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
IGS_PATH = os.path.join(BASE_DIR, 'data/igs_talladega_tracts.csv')
ACS_PATH = os.path.join(BASE_DIR, 'data/acs_talladega_tracts.csv')
MODEL_PATH = os.path.join(os.path.dirname(__file__), '../model_predict_igs.joblib')

# Feature configuration
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

# Intervention configurations
INTERVENTIONS = {
    'digital': ['broadband_access_rate', 'computer_access_rate'],
    'housing': ['housing_cost_burden_rate', 'median_home_value'],
    'entrepreneurship': ['per_capita_income', 'median_household_income'],
    'workforce': ['labor_force_participation_rate', 'unemployment_rate']
}

# Expected impact deltas for interventions (percentage points or relative changes)
INTERVENTION_DELTAS = {
    'broadband_access_rate': +6.0,
    'computer_access_rate': +5.0,
    'housing_cost_burden_rate': -5.0,
    'median_home_value': +5.0,
    'per_capita_income': +7.0,
    'median_household_income': +5.0,
    'labor_force_participation_rate': +5.0,
    'unemployment_rate': -3.0
}


class IGSPredictor:
    """Predictor class for Inclusive Growth Scores"""
    
    def __init__(self, model_path: str = MODEL_PATH):
        """Initialize the predictor with model path"""
        self.model_path = model_path
        self.model = None
        self.features = FEATURES
        self.igs_df = None
        self.acs_df = None
        self._load_data()
        
    def _load_data(self):
        """Load IGS and ACS data"""
        try:
            # Read with FIPS codes as strings to preserve leading zeros
            self.igs_df = pd.read_csv(IGS_PATH, dtype={'Census Tract FIPS code': str})
            self.acs_df = pd.read_csv(ACS_PATH, dtype={'tract_fips': str})
            
            # Normalize FIPS codes
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
        except FileNotFoundError as e:
            raise FileNotFoundError(f"Required data file not found: {e}")
        except Exception as e:
            raise RuntimeError(f"Error loading data: {e}")
    
    def train_model(self, alpha: float = 1.0):
        """Train the Ridge regression model"""
        X, y = [], []
        
        for tract in self.igs_df['Census Tract FIPS code'].unique():
            # Match tract with ACS data
            tract_acs_cand = self.acs_df[
                self.acs_df['tract_fips'].str[-10:] == tract
            ]
            
            if tract_acs_cand.empty:
                continue
            
            acs_features = tract_acs_cand.iloc[0]
            tract_df = self.igs_df[
                self.igs_df['Census Tract FIPS code'] == tract
            ].sort_values('Year')
            
            years = tract_df['Year'].values
            igs_scores = tract_df['Inclusive Growth Score'].values
            
            # Create sequential training examples
            for i in range(len(years) - 1):
                feature_vector = [acs_features.get(fk, np.nan) for fk in self.features]
                # Input: year, ACS features, and current IGS score
                X.append([years[i]] + feature_vector + [igs_scores[i]])
                # Target: next year's IGS score
                y.append(igs_scores[i + 1])
        
        X = np.array(X)
        y = np.array(y)
        
        # Handle missing values
        X = np.nan_to_num(X, nan=0.0)
        
        # Train model
        self.model = Ridge(alpha=alpha)
        self.model.fit(X, y)
        
        # Save model
        joblib.dump((self.model, self.features), self.model_path)
        print(f"Model trained successfully with {len(X)} samples")
        print(f"Model saved to: {self.model_path}")
        
        return self.model
    
    def load_model(self):
        """Load the trained model from disk"""
        if not os.path.exists(self.model_path):
            raise FileNotFoundError(
                f"Model file not found at {self.model_path}. "
                "Please train the model first."
            )
        
        self.model, self.features = joblib.load(self.model_path)
        return self.model
    
    def predict(
        self,
        tract: str,
        interventions: Optional[List[str]] = None,
        years_ahead: int = 5
    ) -> List[float]:
        """
        Predict future IGS scores for a tract
        
        Args:
            tract: Census tract FIPS code (10 digits)
            interventions: List of intervention types to apply
            years_ahead: Number of years to predict into the future
            
        Returns:
            List of predicted IGS scores
        """
        # Load model if not already loaded
        if self.model is None:
            self.load_model()
        
        # Normalize tract code
        tract = str(tract).zfill(10)
        
        # Get ACS features for the tract
        tract_acs_cand = self.acs_df[
            self.acs_df['tract_fips'].str[-10:] == tract
        ]
        
        if tract_acs_cand.empty:
            raise ValueError(f"No ACS data found for tract {tract}")
        
        acs_features = tract_acs_cand.iloc[0]
        
        # Get the most recent IGS data for the tract
        tract_igs = self.igs_df[
            self.igs_df['Census Tract FIPS code'] == tract
        ].sort_values('Year')
        
        if tract_igs.empty:
            raise ValueError(f"No IGS data found for tract {tract}")
        
        last_record = tract_igs.iloc[-1]
        current_year = int(last_record['Year'])
        current_igs = float(last_record['Inclusive Growth Score'])
        
        # Build feature vector
        feature_vector = [acs_features.get(fk, 0.0) for fk in self.features]
        
        # Apply interventions if specified
        if interventions:
            feature_vector = self._apply_interventions(
                feature_vector,
                interventions
            )
        
        # Generate predictions
        predictions = []
        prev_igs = current_igs
        
        for step in range(1, years_ahead + 1):
            # Construct input: year, features, previous IGS
            input_row = [current_year + step] + feature_vector + [prev_igs]
            
            # Predict
            pred = float(self.model.predict([input_row])[0])
            
            # Ensure predictions stay within reasonable bounds
            pred = max(0.0, min(100.0, pred))
            
            predictions.append(pred)
            prev_igs = pred
        
        return predictions
    
    def _apply_interventions(
        self,
        feature_vector: List[float],
        interventions: List[str]
    ) -> List[float]:
        """Apply intervention deltas to features"""
        modified_features = feature_vector.copy()
        
        for intervention_type in interventions:
            if intervention_type not in INTERVENTIONS:
                print(f"Warning: Unknown intervention type '{intervention_type}'")
                continue
            
            # Get features affected by this intervention
            affected_features = INTERVENTIONS[intervention_type]
            
            for feature_name in affected_features:
                if feature_name in self.features:
                    idx = self.features.index(feature_name)
                    current_value = modified_features[idx]
                    delta = INTERVENTION_DELTAS.get(feature_name, 0.0)
                    modified_features[idx] = current_value + delta
        
        return modified_features


def predict_igs_tract(
    tract: str,
    interventions_on: Optional[List[str]] = None,
    years_ahead: int = 5
) -> List[float]:
    """
    Convenience function to predict IGS for a tract
    
    Args:
        tract: Census tract FIPS code
        interventions_on: List of intervention types
        years_ahead: Number of years to predict
        
    Returns:
        List of predicted IGS scores
    """
    predictor = IGSPredictor()
    return predictor.predict(tract, interventions_on, years_ahead)


def main():
    """Main function for training and testing"""
    print("Initializing IGS Predictor...")
    predictor = IGSPredictor()
    
    # Train model
    print("\nTraining model...")
    predictor.train_model(alpha=1.0)
    
    # Test prediction
    print("\n" + "="*50)
    print("Testing prediction...")
    print("="*50)
    
    test_tract = '1121010500'
    test_interventions = ['digital', 'housing']
    
    print(f"\nTract: {test_tract}")
    print(f"Interventions: {test_interventions}")
    print(f"Years ahead: 5")
    
    predictions = predictor.predict(
        test_tract,
        test_interventions,
        years_ahead=5
    )
    
    print(f"\nPredicted IGS scores:")
    for i, pred in enumerate(predictions, 1):
        print(f"  Year +{i}: {pred:.2f}")


if __name__ == '__main__':
    main()
