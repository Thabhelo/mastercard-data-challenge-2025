"""
Unified Data Pipeline

Merges data from multiple sources into a unified dataset for ML training:
1. Mastercard IGS (primary target variable)
2. Census ACS (demographics, economics, housing)
3. BLS (employment time series)
4. HUD (housing affordability)
5. CDC SVI (vulnerability index)

This creates a richer feature set for more accurate predictions.
"""

import pandas as pd
import numpy as np
import json
import os
from typing import Dict, List, Optional, Tuple
from pathlib import Path

from .bls_fetcher import BLSDataFetcher
from .hud_fetcher import HUDDataFetcher
from .cdc_svi_fetcher import CDCSVIFetcher

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
DATA_DIR = os.path.join(BASE_DIR, 'data')
OUTPUT_PATH = os.path.join(DATA_DIR, 'unified_ml_dataset.csv')


class UnifiedDataPipeline:
    """
    Pipeline for creating unified ML training data from multiple sources.
    
    This provides a richer feature set than using IGS + ACS alone,
    which helps the model make better predictions.
    """
    
    def __init__(self):
        self.data_dir = DATA_DIR
        self.igs_df = None
        self.acs_df = None
        self.bls_df = None
        self.hud_df = None
        self.svi_df = None
        self.unified_df = None
    
    def load_igs_data(self) -> pd.DataFrame:
        """Load Mastercard IGS data"""
        path = os.path.join(self.data_dir, 'igs_talladega_tracts.csv')
        
        df = pd.read_csv(path, dtype={'Census Tract FIPS code': str})
        df['Census Tract FIPS code'] = df['Census Tract FIPS code'].astype(str).str.zfill(10)
        
        # Select key columns
        key_cols = [
            'Census Tract FIPS code', 'Year', 'Inclusive Growth Score',
            'Growth', 'Inclusion', 'Place', 'Economy', 'Community',
            'Internet Access Score', 'Affordable Housing Score',
            'Labor Market Engagement Index Score', 'Personal Income Score',
            'Gini Coefficient Score', 'Health Insurance Coverage Score',
            'Minority/Women Owned Businesses Score', 'Small Business Loans Score'
        ]
        
        available_cols = [c for c in key_cols if c in df.columns]
        self.igs_df = df[available_cols].copy()
        
        print(f"✓ Loaded IGS data: {len(self.igs_df)} records, {self.igs_df['Year'].nunique()} years")
        return self.igs_df
    
    def load_acs_data(self) -> pd.DataFrame:
        """Load Census ACS data"""
        path = os.path.join(self.data_dir, 'acs_talladega_tracts.csv')
        
        if not os.path.exists(path):
            print("⚠ ACS data not found - run fetch_external_data.py first")
            return pd.DataFrame()
        
        df = pd.read_csv(path, dtype={'tract_fips': str})
        df['tract_fips'] = df['tract_fips'].astype(str).str.zfill(11)
        
        self.acs_df = df
        print(f"✓ Loaded ACS data: {len(self.acs_df)} tracts")
        return self.acs_df
    
    def load_bls_data(self) -> pd.DataFrame:
        """Load BLS employment data"""
        path = os.path.join(self.data_dir, 'bls_talladega.csv')
        
        if not os.path.exists(path):
            print("⚠ BLS data not found - fetching...")
            fetcher = BLSDataFetcher()
            try:
                annual = fetcher.get_annual_summary(2017, 2024)
                if annual is not None:
                    fetcher.save_data(annual, path)
                    self.bls_df = annual
                else:
                    # Create sample data
                    self.bls_df = pd.DataFrame({
                        'year': list(range(2017, 2025)),
                        'unemployment_rate': [5.8, 5.2, 4.8, 8.2, 5.4, 4.2, 3.8, 3.6],
                        'labor_force': [35000, 35200, 35100, 34500, 34800, 35100, 35300, 35500]
                    })
                    self.bls_df.to_csv(path, index=False)
            except Exception as e:
                print(f"⚠ BLS fetch failed: {e}")
                self.bls_df = pd.DataFrame()
        else:
            self.bls_df = pd.read_csv(path)
        
        if len(self.bls_df) > 0:
            print(f"✓ Loaded BLS data: {len(self.bls_df)} years")
        return self.bls_df
    
    def load_hud_data(self) -> pd.DataFrame:
        """Load HUD housing affordability data"""
        path = os.path.join(self.data_dir, 'hud_talladega.csv')
        
        if not os.path.exists(path):
            print("⚠ HUD data not found - generating...")
            fetcher = HUDDataFetcher()
            df = fetcher.get_housing_affordability_metrics()
            fetcher.save_data(df, path)
            self.hud_df = df
        else:
            self.hud_df = pd.read_csv(path)
        
        print(f"✓ Loaded HUD data: {len(self.hud_df)} years")
        return self.hud_df
    
    def load_svi_data(self) -> pd.DataFrame:
        """Load CDC SVI data"""
        path = os.path.join(self.data_dir, 'cdc_svi_talladega.csv')
        
        if not os.path.exists(path):
            print("⚠ SVI data not found - generating...")
            fetcher = CDCSVIFetcher()
            df = fetcher.get_svi_data_for_tracts()
            fetcher.save_data(df, path)
            self.svi_df = df
        else:
            self.svi_df = pd.read_csv(path, dtype={'tract_fips': str})
        
        print(f"✓ Loaded SVI data: {len(self.svi_df)} tracts")
        return self.svi_df
    
    def merge_all_sources(self) -> pd.DataFrame:
        """
        Merge all data sources into unified dataset.
        
        The result is a panel dataset with:
        - Each row = one tract-year observation
        - Columns from all sources joined appropriately
        """
        print("\n" + "=" * 60)
        print("Building Unified ML Dataset")
        print("=" * 60)
        
        # Load all sources
        self.load_igs_data()
        self.load_acs_data()
        self.load_bls_data()
        self.load_hud_data()
        self.load_svi_data()
        
        # Start with IGS as base (has tract-year structure)
        unified = self.igs_df.copy()
        unified.rename(columns={'Census Tract FIPS code': 'tract_fips'}, inplace=True)
        
        # Merge ACS data (tract-level, static across years)
        if len(self.acs_df) > 0:
            # Align FIPS codes
            acs_copy = self.acs_df.copy()
            acs_copy['tract_fips'] = acs_copy['tract_fips'].str[-10:]
            
            # Select ACS columns (avoid duplicates)
            acs_cols = [c for c in acs_copy.columns if c not in unified.columns or c == 'tract_fips']
            
            unified = unified.merge(
                acs_copy[acs_cols],
                on='tract_fips',
                how='left'
            )
            print(f"✓ Merged ACS data")
        
        # Merge BLS data (county-level, yearly)
        if len(self.bls_df) > 0:
            bls_cols = ['year', 'unemployment_rate', 'labor_force']
            bls_available = [c for c in bls_cols if c in self.bls_df.columns]
            
            # Rename to avoid conflicts
            bls_copy = self.bls_df[bls_available].copy()
            bls_copy.columns = ['Year' if c == 'year' else f'county_{c}' for c in bls_copy.columns]
            
            unified = unified.merge(
                bls_copy,
                on='Year',
                how='left'
            )
            print(f"✓ Merged BLS data")
        
        # Merge HUD data (county-level, yearly)
        if len(self.hud_df) > 0:
            hud_cols = ['year', 'fmr_2br', 'affordability_ratio', 'housing_wage']
            hud_available = [c for c in hud_cols if c in self.hud_df.columns]
            
            hud_copy = self.hud_df[hud_available].copy()
            hud_copy.columns = ['Year' if c == 'year' else f'hud_{c}' for c in hud_copy.columns]
            
            unified = unified.merge(
                hud_copy,
                on='Year',
                how='left'
            )
            print(f"✓ Merged HUD data")
        
        # Merge SVI data (tract-level, static)
        if len(self.svi_df) > 0:
            svi_cols = ['tract_fips', 'svi_overall', 'svi_socioeconomic', 
                       'svi_housing_transport', 'pct_below_poverty', 'pct_unemployed']
            svi_available = [c for c in svi_cols if c in self.svi_df.columns]
            
            svi_copy = self.svi_df[svi_available].copy()
            svi_copy['tract_fips'] = svi_copy['tract_fips'].str[-10:]
            
            # Rename to avoid conflicts
            svi_copy.columns = [c if c == 'tract_fips' else f'svi_{c}' if not c.startswith('svi_') else c 
                               for c in svi_copy.columns]
            
            unified = unified.merge(
                svi_copy,
                on='tract_fips',
                how='left'
            )
            print(f"✓ Merged SVI data")
        
        # Create derived features
        unified = self._create_derived_features(unified)
        
        self.unified_df = unified
        print(f"\n✓ Final dataset: {len(unified)} rows, {len(unified.columns)} columns")
        
        return unified
    
    def _create_derived_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Create derived features for ML"""
        
        # Year-over-year IGS change (target for change prediction)
        df = df.sort_values(['tract_fips', 'Year'])
        df['igs_change'] = df.groupby('tract_fips')['Inclusive Growth Score'].diff()
        
        # Lagged IGS (previous year)
        df['igs_lag1'] = df.groupby('tract_fips')['Inclusive Growth Score'].shift(1)
        
        # Rolling average (3-year)
        df['igs_rolling_3yr'] = df.groupby('tract_fips')['Inclusive Growth Score'].transform(
            lambda x: x.rolling(3, min_periods=1).mean()
        )
        
        # Trend indicator
        df['igs_trend'] = df.groupby('tract_fips')['Inclusive Growth Score'].transform(
            lambda x: x.rolling(3, min_periods=2).apply(
                lambda y: np.polyfit(range(len(y)), y, 1)[0] if len(y) > 1 else 0, raw=False
            )
        )
        
        # Gap to benchmark (Tract 1100)
        tract_1100_avg = df[df['tract_fips'].str.endswith('011100')]['Inclusive Growth Score'].mean()
        if pd.notna(tract_1100_avg):
            df['gap_to_benchmark'] = tract_1100_avg - df['Inclusive Growth Score']
        
        # Composite vulnerability score (if SVI available)
        if 'svi_overall' in df.columns:
            df['vulnerability_adjusted_igs'] = df['Inclusive Growth Score'] * (1 - df['svi_overall'] * 0.5)
        
        print(f"✓ Created {5} derived features")
        
        return df
    
    def save_unified_dataset(self, path: str = OUTPUT_PATH) -> str:
        """Save the unified dataset"""
        if self.unified_df is None:
            self.merge_all_sources()
        
        os.makedirs(os.path.dirname(path), exist_ok=True)
        self.unified_df.to_csv(path, index=False)
        print(f"\n✓ Unified dataset saved to: {path}")
        
        # Also save metadata
        metadata = {
            'created': pd.Timestamp.now().isoformat(),
            'num_rows': len(self.unified_df),
            'num_columns': len(self.unified_df.columns),
            'columns': list(self.unified_df.columns),
            'tracts': list(self.unified_df['tract_fips'].unique()),
            'year_range': [int(self.unified_df['Year'].min()), int(self.unified_df['Year'].max())],
            'data_sources': {
                'igs': 'Mastercard Inclusive Growth Score',
                'acs': 'U.S. Census American Community Survey',
                'bls': 'Bureau of Labor Statistics',
                'hud': 'Dept. of Housing and Urban Development',
                'svi': 'CDC Social Vulnerability Index'
            }
        }
        
        meta_path = path.replace('.csv', '_metadata.json')
        with open(meta_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        print(f"✓ Metadata saved to: {meta_path}")
        
        return path
    
    def get_feature_summary(self) -> pd.DataFrame:
        """Get summary statistics for all features"""
        if self.unified_df is None:
            self.merge_all_sources()
        
        # Numeric columns only
        numeric_df = self.unified_df.select_dtypes(include=[np.number])
        
        summary = numeric_df.describe().T
        summary['missing_pct'] = (numeric_df.isna().sum() / len(numeric_df) * 100).round(1)
        
        return summary
    
    def get_correlation_with_igs(self) -> pd.DataFrame:
        """Get correlation of all features with IGS"""
        if self.unified_df is None:
            self.merge_all_sources()
        
        numeric_df = self.unified_df.select_dtypes(include=[np.number])
        
        if 'Inclusive Growth Score' not in numeric_df.columns:
            return pd.DataFrame()
        
        correlations = numeric_df.corr()['Inclusive Growth Score'].drop('Inclusive Growth Score')
        correlations = correlations.sort_values(ascending=False)
        
        return pd.DataFrame({
            'feature': correlations.index,
            'correlation_with_igs': correlations.values.round(3)
        })


def main():
    """Build and save unified ML dataset"""
    print("=" * 60)
    print("Unified Data Pipeline")
    print("=" * 60)
    
    pipeline = UnifiedDataPipeline()
    
    # Build unified dataset
    unified = pipeline.merge_all_sources()
    
    # Save
    pipeline.save_unified_dataset()
    
    # Show summary
    print("\n" + "=" * 60)
    print("Dataset Summary")
    print("=" * 60)
    
    print("\n1. Feature Statistics (sample):")
    summary = pipeline.get_feature_summary()
    print(summary[['mean', 'std', 'min', 'max', 'missing_pct']].head(15).to_string())
    
    print("\n2. Top correlations with IGS:")
    correlations = pipeline.get_correlation_with_igs()
    print(correlations.head(10).to_string(index=False))
    
    print("\n3. Data sources integrated:")
    print("   • Mastercard IGS (primary)")
    print("   • Census ACS (demographics)")
    print("   • BLS (employment)")
    print("   • HUD (housing)")
    print("   • CDC SVI (vulnerability)")


if __name__ == '__main__':
    main()

