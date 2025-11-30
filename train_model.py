#!/usr/bin/env python3
"""
Train the IGS Prediction Models

This script trains the constrained ML models for predicting Inclusive Growth Scores.
Uses the new ml/ module with:
- Constrained Bayesian Ridge (realistic bounds)
- Ensemble predictor (combines multiple approaches)
- Multi-source data pipeline

Usage:
    python train_model.py [--ensemble] [--test-tract TRACT_ID]
"""

import sys
import os
import argparse

# Add project root to path
sys.path.insert(0, os.path.dirname(__file__))

from ml.models.constrained_predictor import ConstrainedIGSPredictor
from ml.models.ensemble_predictor import EnsembleIGSPredictor
from ml.data_sources.data_pipeline import UnifiedDataPipeline


def train_constrained_model():
    """Train the constrained Bayesian Ridge model"""
    print("\n" + "=" * 60)
    print("Training Constrained IGS Predictor")
    print("=" * 60)
    
    predictor = ConstrainedIGSPredictor()
    predictor.train()
    
    return predictor


def train_ensemble_model():
    """Train the ensemble model (all components)"""
    print("\n" + "=" * 60)
    print("Training Ensemble IGS Predictor")
    print("=" * 60)
    
    ensemble = EnsembleIGSPredictor()
    ensemble.fit()
    
    return ensemble


def build_unified_dataset():
    """Build the unified ML dataset from all sources"""
    print("\n" + "=" * 60)
    print("Building Unified Dataset")
    print("=" * 60)
    
    pipeline = UnifiedDataPipeline()
    pipeline.merge_all_sources()
    pipeline.save_unified_dataset()
    
    return pipeline


def test_predictions(predictor, tract_id: str = '1121010500'):
    """Test model predictions"""
    print("\n" + "=" * 60)
    print(f"Testing Predictions for Tract {tract_id}")
    print("=" * 60)
    
    # Baseline prediction
    print("\n1. Baseline (no interventions):")
    baseline = predictor.predict(tract_id, interventions=[], years_ahead=5)
    for i, pred in enumerate(baseline, 1):
        print(f"   Year +{i}: {pred:.2f}")
    
    # With interventions
    print("\n2. With digital + housing interventions:")
    with_interventions = predictor.predict(
        tract_id,
        interventions=['digital', 'housing'],
        years_ahead=5
    )
    for i, pred in enumerate(with_interventions, 1):
        diff = pred - baseline[i-1]
        print(f"   Year +{i}: {pred:.2f} (+{diff:.2f} vs baseline)")
    
    # All interventions
    print("\n3. With ALL interventions:")
    all_interventions = predictor.predict(
        tract_id,
        interventions=['digital', 'housing', 'entrepreneurship', 'workforce'],
        years_ahead=5
    )
    for i, pred in enumerate(all_interventions, 1):
        diff = pred - baseline[i-1]
        print(f"   Year +{i}: {pred:.2f} (+{diff:.2f} vs baseline)")
    
    # Summary
    print("\n" + "-" * 40)
    print("Summary:")
    print(f"   Starting IGS: ~23 (Tract 105 current)")
    print(f"   Baseline 5-year: {baseline[-1]:.2f}")
    print(f"   With interventions: {all_interventions[-1]:.2f}")
    print(f"   Total improvement potential: +{all_interventions[-1] - baseline[-1]:.2f} pts")


def main():
    parser = argparse.ArgumentParser(description='Train IGS prediction models')
    parser.add_argument('--ensemble', action='store_true', 
                       help='Train ensemble model instead of constrained model')
    parser.add_argument('--test-tract', type=str, default='1121010500',
                       help='Tract ID for testing predictions')
    parser.add_argument('--build-data', action='store_true',
                       help='Build unified dataset before training')
    parser.add_argument('--skip-test', action='store_true',
                       help='Skip prediction testing')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("IGS Prediction Model Training Pipeline")
    print("=" * 60)
    
    try:
        # Optionally build unified dataset
        if args.build_data:
            build_unified_dataset()
        
        # Train model
        if args.ensemble:
            predictor = train_ensemble_model()
        else:
            predictor = train_constrained_model()
        
        # Test predictions
        if not args.skip_test:
            test_predictions(predictor, args.test_tract)
        
        # Copy model to appropriate location for API
        print("\n" + "=" * 60)
        print("Finalizing")
        print("=" * 60)
        
        print("\n✓ Training completed successfully!")
        print("\nModel files created:")
        print("   • ml/models/igs_constrained_model.joblib")
        if args.ensemble:
            print("   • Ensemble components trained in memory")
        
        print("\nNext steps:")
        print("   1. Run 'python api/predict.py' to start local API server")
        print("   2. Or deploy to Vercel for production")
        
        return 0
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == '__main__':
    sys.exit(main())
