"""
Bureau of Labor Statistics (BLS) Data Fetcher

Fetches employment and wage data for Talladega County, Alabama.
This provides additional economic indicators beyond Census ACS.

API Documentation: https://www.bls.gov/developers/
"""

import requests
import pandas as pd
import json
import os
from typing import Dict, List, Optional
from datetime import datetime

# BLS API Configuration
BLS_API_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data/"

# Talladega County, Alabama series IDs
# Format: LAUCN{state_fips}{county_fips}{measure_code}
# Alabama = 01, Talladega = 121
TALLADEGA_SERIES = {
    # Local Area Unemployment Statistics (LAUS)
    'unemployment_rate': 'LAUCN011210000000003',      # Unemployment rate
    'labor_force': 'LAUCN011210000000006',            # Labor force
    'employment': 'LAUCN011210000000005',             # Employment level
    'unemployment': 'LAUCN011210000000004',           # Unemployment level
    
    # Quarterly Census of Employment and Wages (QCEW) - County level
    # These require different API calls
}

# Alabama state series for comparison
ALABAMA_SERIES = {
    'state_unemployment_rate': 'LASST010000000000003',
    'state_labor_force': 'LASST010000000000006',
}

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
OUTPUT_PATH = os.path.join(BASE_DIR, 'data', 'bls_talladega.csv')


class BLSDataFetcher:
    """
    Fetches employment data from Bureau of Labor Statistics API.
    
    The BLS API is free but rate-limited. For production use,
    register for an API key at https://data.bls.gov/registrationEngine/
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Args:
            api_key: Optional BLS API key for higher rate limits
        """
        self.api_key = api_key or os.environ.get('BLS_API_KEY')
        self.base_url = BLS_API_URL
    
    def fetch_series(
        self, 
        series_ids: List[str],
        start_year: int = 2017,
        end_year: int = 2024
    ) -> Optional[Dict]:
        """
        Fetch time series data from BLS API.
        
        Args:
            series_ids: List of BLS series IDs
            start_year: Start year for data
            end_year: End year for data
            
        Returns:
            Dict with series data or None if failed
        """
        payload = {
            "seriesid": series_ids,
            "startyear": str(start_year),
            "endyear": str(end_year),
        }
        
        if self.api_key:
            payload["registrationkey"] = self.api_key
        
        try:
            response = requests.post(
                self.base_url,
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=30
            )
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('status') != 'REQUEST_SUCCEEDED':
                print(f"BLS API error: {data.get('message', 'Unknown error')}")
                return None
            
            return data
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching BLS data: {e}")
            return None
    
    def fetch_talladega_employment(
        self,
        start_year: int = 2017,
        end_year: int = 2024
    ) -> Optional[pd.DataFrame]:
        """
        Fetch employment data for Talladega County.
        
        Returns DataFrame with columns:
        - year, month, unemployment_rate, labor_force, employment, unemployment
        """
        series_ids = list(TALLADEGA_SERIES.values())
        data = self.fetch_series(series_ids, start_year, end_year)
        
        if data is None:
            return None
        
        # Parse the nested response
        records = []
        series_map = {v: k for k, v in TALLADEGA_SERIES.items()}
        
        for series in data.get('Results', {}).get('series', []):
            series_id = series['seriesID']
            metric_name = series_map.get(series_id, series_id)
            
            for item in series.get('data', []):
                year = int(item['year'])
                period = item['period']
                
                # Skip annual averages for monthly data
                if period == 'M13':
                    continue
                
                month = int(period.replace('M', '')) if period.startswith('M') else 0
                value = float(item['value'])
                
                records.append({
                    'year': year,
                    'month': month,
                    'metric': metric_name,
                    'value': value
                })
        
        if not records:
            return None
        
        # Pivot to wide format
        df = pd.DataFrame(records)
        df_pivot = df.pivot_table(
            index=['year', 'month'],
            columns='metric',
            values='value',
            aggfunc='first'
        ).reset_index()
        
        return df_pivot
    
    def get_annual_summary(
        self,
        start_year: int = 2017,
        end_year: int = 2024
    ) -> Optional[pd.DataFrame]:
        """
        Get annual average employment metrics.
        """
        monthly = self.fetch_talladega_employment(start_year, end_year)
        
        if monthly is None:
            return None
        
        # Aggregate to annual
        annual = monthly.groupby('year').agg({
            'unemployment_rate': 'mean',
            'labor_force': 'mean',
            'employment': 'mean',
            'unemployment': 'mean'
        }).reset_index()
        
        annual = annual.round(2)
        return annual
    
    def save_data(self, df: pd.DataFrame, path: str = OUTPUT_PATH):
        """Save fetched data to CSV"""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        df.to_csv(path, index=False)
        print(f"BLS data saved to: {path}")
    
    @staticmethod
    def get_manual_instructions() -> str:
        """Instructions for manual data download if API fails"""
        return """
        Manual BLS Data Download:
        
        1. Visit: https://data.bls.gov/PDQWeb/la
        
        2. Select:
           - Geographic Type: Counties and equivalents
           - State: Alabama
           - Area: Talladega County, AL
           - Measures: All (unemployment rate, labor force, employment, unemployment)
           - Years: 2017-2024
        
        3. Click "Get Data" and download as CSV
        
        4. Save to: data/bls_talladega.csv
        
        Alternative - QCEW Data:
        Visit: https://data.bls.gov/cew/apps/table_maker/v4/table_maker.htm
        Select Alabama, Talladega County for detailed wage data
        """


def main():
    """Fetch and save BLS data"""
    print("=" * 60)
    print("Fetching Bureau of Labor Statistics Data")
    print("=" * 60)
    
    fetcher = BLSDataFetcher()
    
    print("\nAttempting to fetch Talladega County employment data...")
    
    annual = fetcher.get_annual_summary(2017, 2024)
    
    if annual is not None:
        print("\n✓ Data fetched successfully!")
        print(f"\nAnnual Employment Summary for Talladega County:")
        print(annual.to_string(index=False))
        
        fetcher.save_data(annual)
    else:
        print("\n✗ API fetch failed. Manual download instructions:")
        print(fetcher.get_manual_instructions())
        
        # Create sample data for development
        print("\nCreating sample data for development...")
        sample_data = pd.DataFrame({
            'year': list(range(2017, 2025)),
            'unemployment_rate': [5.8, 5.2, 4.8, 8.2, 5.4, 4.2, 3.8, 3.6],
            'labor_force': [35000, 35200, 35100, 34500, 34800, 35100, 35300, 35500],
            'employment': [32970, 33370, 33415, 31671, 32921, 33626, 33959, 34222],
            'unemployment': [2030, 1830, 1685, 2829, 1879, 1474, 1341, 1278]
        })
        fetcher.save_data(sample_data)
        print("Sample data created for development.")


if __name__ == '__main__':
    main()

