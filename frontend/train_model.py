#!/usr/bin/env python3
"""
Train the IGS Prediction Model for Frontend Deployment

This script is used by Vercel during build to train the model.
"""

import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

try:
    from analysis.predict_future_igs import IGSPredictor
    
    print("Training IGS prediction model...")
    predictor = IGSPredictor()
    predictor.train_model(alpha=1.0)
    print("Model trained successfully!")
    
except Exception as e:
    print(f"Warning: Could not train model during build: {e}")
    print("Model will be trained on first API request if needed.")
    # Don't fail the build if model training fails
    sys.exit(0)

