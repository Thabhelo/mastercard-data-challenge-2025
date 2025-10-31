#!/usr/bin/env python3
"""
Train the IGS Prediction Model

This script trains the Ridge regression model for predicting Inclusive Growth Scores.
Run this script before deploying to ensure the model is up to date.

Usage:
    python train_model.py
"""

import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from analysis.predict_future_igs import IGSPredictor


def main():
    """Train and save the IGS prediction model"""
    print("=" * 60)
    print("IGS Prediction Model Training")
    print("=" * 60)
    
    try:
        # Initialize predictor
        print("\n1. Initializing predictor...")
        predictor = IGSPredictor()
        print("   ✓ Data loaded successfully")
        
        # Train model
        print("\n2. Training Ridge regression model...")
        model = predictor.train_model(alpha=1.0)
        print("   ✓ Model trained successfully")
        
        # Test prediction
        print("\n3. Testing model with sample prediction...")
        test_tract = '1121010500'
        test_predictions = predictor.predict(
            test_tract,
            interventions=['digital', 'housing'],
            years_ahead=5
        )
        print(f"   ✓ Sample prediction for tract {test_tract}:")
        for i, pred in enumerate(test_predictions, 1):
            print(f"     Year +{i}: {pred:.2f}")
        
        # Copy model to frontend directory
        print("\n4. Copying model to frontend directory...")
        import shutil
        frontend_model_path = os.path.join(
            os.path.dirname(__file__),
            'frontend/src/model_predict_igs.joblib'
        )
        shutil.copy(predictor.model_path, frontend_model_path)
        print(f"   ✓ Model copied to {frontend_model_path}")
        
        print("\n" + "=" * 60)
        print("Training completed successfully!")
        print("=" * 60)
        print("\nThe model is ready for deployment.")
        
        return 0
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())

