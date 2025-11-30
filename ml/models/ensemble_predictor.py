"""
Ensemble IGS Predictor

Combines multiple prediction strategies for robust results:
1. Constrained Bayesian Ridge (ML-based)
2. Trend Extrapolation (historical momentum)
3. Benchmark Convergence (closing gap with better tracts)

The ensemble averages these approaches with learned weights.
"""

import numpy as np
import pandas as pd
from typing import List, Dict, Optional
import os
import joblib

from .constrained_predictor import (
    ConstrainedIGSPredictor,
    YEARLY_CHANGE_BOUNDS,
    INTERVENTION_MULTIPLIERS
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
IGS_PATH = os.path.join(BASE_DIR, 'data/igs_talladega_tracts.csv')


class TrendExtrapolator:
    """Simple trend-based prediction using exponential smoothing"""
    
    def __init__(self, alpha: float = 0.3):
        self.alpha = alpha  # Smoothing factor
        self.trends = {}
    
    def fit(self, igs_df: pd.DataFrame) -> 'TrendExtrapolator':
        """Compute smoothed trends for each tract"""
        for tract in igs_df['Census Tract FIPS code'].unique():
            tract_data = igs_df[
                igs_df['Census Tract FIPS code'] == tract
            ].sort_values('Year')
            
            igs_scores = tract_data['Inclusive Growth Score'].values
            
            if len(igs_scores) < 2:
                self.trends[tract] = {'smoothed_trend': 0, 'latest': igs_scores[-1]}
                continue
            
            # Exponential smoothing on changes
            changes = np.diff(igs_scores)
            smoothed = changes[0]
            for change in changes[1:]:
                smoothed = self.alpha * change + (1 - self.alpha) * smoothed
            
            self.trends[tract] = {
                'smoothed_trend': smoothed,
                'latest': igs_scores[-1],
                'mean': np.mean(igs_scores)
            }
        
        return self
    
    def predict(self, tract: str, years_ahead: int = 5) -> List[float]:
        """Predict using exponential smoothing trend"""
        tract = str(tract).zfill(10)
        info = self.trends.get(tract, {'smoothed_trend': 0.5, 'latest': 23})
        
        trend = info['smoothed_trend']
        current = info['latest']
        
        predictions = []
        for year in range(years_ahead):
            # Trend decays slightly over time (mean reversion)
            decay = 0.9 ** year
            change = trend * decay
            
            # Bound the change
            change = np.clip(change, YEARLY_CHANGE_BOUNDS['min'], 
                           YEARLY_CHANGE_BOUNDS['max'])
            
            current += change
            current = np.clip(current, 0, 100)
            predictions.append(round(current, 2))
        
        return predictions


class BenchmarkConverger:
    """
    Predicts by modeling convergence toward benchmark tract.
    
    Idea: Lower-performing tracts should gradually close the gap
    with higher-performing ones at a realistic rate.
    """
    
    def __init__(self, convergence_rate: float = 0.08):
        """
        Args:
            convergence_rate: Fraction of gap closed per year (0.08 = 8%)
        """
        self.convergence_rate = convergence_rate
        self.tracts = {}
        self.benchmark_igs = 50  # Default benchmark
    
    def fit(self, igs_df: pd.DataFrame, benchmark_tract: str = '1121011100') -> 'BenchmarkConverger':
        """Fit using a benchmark tract"""
        benchmark_tract = str(benchmark_tract).zfill(10)
        
        for tract in igs_df['Census Tract FIPS code'].unique():
            tract_data = igs_df[
                igs_df['Census Tract FIPS code'] == tract
            ].sort_values('Year')
            
            if len(tract_data) == 0:
                continue
            
            self.tracts[tract] = {
                'latest': tract_data['Inclusive Growth Score'].values[-1]
            }
        
        # Get benchmark
        if benchmark_tract in self.tracts:
            self.benchmark_igs = self.tracts[benchmark_tract]['latest']
        
        return self
    
    def predict(
        self, 
        tract: str, 
        interventions: Optional[List[str]] = None,
        years_ahead: int = 5
    ) -> List[float]:
        """Predict by converging toward benchmark"""
        tract = str(tract).zfill(10)
        interventions = interventions or []
        
        info = self.tracts.get(tract, {'latest': 23})
        current = info['latest']
        
        # Interventions increase convergence rate
        rate = self.convergence_rate
        if interventions:
            rate *= (1 + 0.15 * len(interventions))
        
        predictions = []
        for year in range(years_ahead):
            gap = self.benchmark_igs - current
            
            # Close portion of the gap
            change = gap * rate
            
            # Diminishing returns as we approach benchmark
            if current > self.benchmark_igs * 0.85:
                change *= 0.5
            
            # Bound the change
            change = np.clip(change, YEARLY_CHANGE_BOUNDS['min'],
                           YEARLY_CHANGE_BOUNDS['max'])
            
            current += change
            current = np.clip(current, 0, 100)
            predictions.append(round(current, 2))
        
        return predictions


class EnsembleIGSPredictor:
    """
    Ensemble predictor combining multiple approaches.
    
    Weights can be adjusted based on validation performance.
    """
    
    def __init__(
        self,
        weights: Optional[Dict[str, float]] = None,
        model_path: Optional[str] = None
    ):
        """
        Args:
            weights: Dict of model weights {'ml': 0.5, 'trend': 0.3, 'benchmark': 0.2}
        """
        self.weights = weights or {
            'ml': 0.50,         # Constrained Bayesian Ridge
            'trend': 0.30,      # Exponential smoothing trend
            'benchmark': 0.20   # Convergence to benchmark
        }
        
        self.ml_predictor = ConstrainedIGSPredictor(model_path) if model_path else ConstrainedIGSPredictor()
        self.trend_predictor = TrendExtrapolator(alpha=0.35)
        self.benchmark_predictor = BenchmarkConverger(convergence_rate=0.08)
        
        self.is_fitted = False
    
    def fit(self) -> 'EnsembleIGSPredictor':
        """Train all component predictors"""
        try:
            igs_df = pd.read_csv(IGS_PATH, dtype={'Census Tract FIPS code': str})
            igs_df['Census Tract FIPS code'] = (
                igs_df['Census Tract FIPS code'].astype(str).str.zfill(10)
            )
        except FileNotFoundError:
            print("Warning: IGS data not found")
            return self
        
        print("Training ensemble components...")
        
        # Train ML predictor
        print("  1. Training constrained Bayesian Ridge...")
        self.ml_predictor.train()
        
        # Fit trend predictor
        print("  2. Fitting trend extrapolator...")
        self.trend_predictor.fit(igs_df)
        
        # Fit benchmark converger
        print("  3. Fitting benchmark converger...")
        self.benchmark_predictor.fit(igs_df)
        
        self.is_fitted = True
        print("Ensemble training complete!")
        
        return self
    
    def predict(
        self,
        tract: str,
        interventions: Optional[List[str]] = None,
        years_ahead: int = 5
    ) -> List[float]:
        """
        Ensemble prediction combining all models.
        
        Returns weighted average of:
        - ML-based constrained prediction
        - Trend extrapolation
        - Benchmark convergence
        """
        if not self.is_fitted:
            self.fit()
        
        interventions = interventions or []
        
        # Get predictions from each model
        ml_pred = self.ml_predictor.predict(tract, interventions, years_ahead)
        trend_pred = self.trend_predictor.predict(tract, years_ahead)
        benchmark_pred = self.benchmark_predictor.predict(tract, interventions, years_ahead)
        
        # Weighted ensemble
        ensemble = []
        for i in range(years_ahead):
            weighted = (
                self.weights['ml'] * ml_pred[i] +
                self.weights['trend'] * trend_pred[i] +
                self.weights['benchmark'] * benchmark_pred[i]
            )
            ensemble.append(round(weighted, 2))
        
        return ensemble
    
    def predict_with_breakdown(
        self,
        tract: str,
        interventions: Optional[List[str]] = None,
        years_ahead: int = 5
    ) -> Dict:
        """
        Get predictions with breakdown by model.
        
        Useful for understanding what's driving the prediction.
        """
        if not self.is_fitted:
            self.fit()
        
        interventions = interventions or []
        
        ml_pred = self.ml_predictor.predict(tract, interventions, years_ahead)
        trend_pred = self.trend_predictor.predict(tract, years_ahead)
        benchmark_pred = self.benchmark_predictor.predict(tract, interventions, years_ahead)
        
        ensemble = []
        for i in range(years_ahead):
            weighted = (
                self.weights['ml'] * ml_pred[i] +
                self.weights['trend'] * trend_pred[i] +
                self.weights['benchmark'] * benchmark_pred[i]
            )
            ensemble.append(round(weighted, 2))
        
        return {
            'ensemble': ensemble,
            'ml_prediction': ml_pred,
            'trend_prediction': trend_pred,
            'benchmark_prediction': benchmark_pred,
            'weights': self.weights,
            'interventions': interventions,
            'years': list(range(1, years_ahead + 1))
        }
    
    def compare_scenarios(
        self,
        tract: str,
        scenarios: Dict[str, List[str]],
        years_ahead: int = 5
    ) -> Dict:
        """
        Compare multiple intervention scenarios.
        
        Args:
            tract: Tract FIPS code
            scenarios: Dict of scenario_name -> intervention list
            years_ahead: Prediction horizon
            
        Returns:
            Dict with predictions for each scenario
        """
        results = {}
        
        for name, interventions in scenarios.items():
            results[name] = self.predict(tract, interventions, years_ahead)
        
        return {
            'tract': tract,
            'years': list(range(1, years_ahead + 1)),
            'scenarios': results
        }


def main():
    """Test the ensemble predictor"""
    print("=" * 60)
    print("Testing Ensemble IGS Predictor")
    print("=" * 60)
    
    predictor = EnsembleIGSPredictor()
    predictor.fit()
    
    test_tract = '1121010500'
    
    print(f"\n1. Breakdown for Tract {test_tract} (no interventions):")
    breakdown = predictor.predict_with_breakdown(test_tract, [], 5)
    
    print(f"\n   Model Weights: {breakdown['weights']}")
    print(f"\n   {'Year':<8} {'Ensemble':<12} {'ML':<12} {'Trend':<12} {'Benchmark':<12}")
    print("   " + "-" * 50)
    for i in range(5):
        print(f"   +{breakdown['years'][i]:<7} "
              f"{breakdown['ensemble'][i]:<12} "
              f"{breakdown['ml_prediction'][i]:<12} "
              f"{breakdown['trend_prediction'][i]:<12} "
              f"{breakdown['benchmark_prediction'][i]:<12}")
    
    print(f"\n2. Scenario Comparison for Tract {test_tract}:")
    scenarios = {
        'Baseline': [],
        'Digital Only': ['digital'],
        'Digital + Housing': ['digital', 'housing'],
        'All Interventions': ['digital', 'housing', 'entrepreneurship', 'workforce']
    }
    
    comparison = predictor.compare_scenarios(test_tract, scenarios, 5)
    
    print(f"\n   {'Scenario':<25} {'Y1':<8} {'Y2':<8} {'Y3':<8} {'Y4':<8} {'Y5':<8}")
    print("   " + "-" * 60)
    for name, preds in comparison['scenarios'].items():
        row = f"   {name:<25}"
        for p in preds:
            row += f" {p:<8}"
        print(row)


if __name__ == '__main__':
    main()

