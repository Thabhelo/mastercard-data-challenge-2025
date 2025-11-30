"""
Machine Learning Module for IGS Prediction

This module provides constrained, realistic ML models for predicting
Inclusive Growth Scores with gradual, believable improvements.
"""

from .models.constrained_predictor import ConstrainedIGSPredictor
from .models.ensemble_predictor import EnsembleIGSPredictor

__all__ = ['ConstrainedIGSPredictor', 'EnsembleIGSPredictor']

