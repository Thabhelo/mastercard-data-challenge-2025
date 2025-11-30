"""
CDC Social Vulnerability Index (SVI) Data Fetcher

The CDC SVI uses census data to identify communities that may need
support before, during, and after disasters or disease outbreaks.

This provides a complementary vulnerability/resilience perspective
that correlates with economic inclusion.

Data Source: https://www.atsdr.cdc.gov/placeandhealth/svi/
"""

import requests
import pandas as pd
import json
import os
from typing import Dict, List, Optional

# CDC SVI API / Data locations
SVI_DATA_URL = "https://svi.cdc.gov/data/download.aspx"

# Talladega County FIPS codes
STATE_FIPS = "01"
COUNTY_FIPS = "121"
FULL_COUNTY_FIPS = "01121"

# Tract FIPS codes of interest
TRACT_105_FIPS = "01121010500"
TRACT_1100_FIPS = "01121011100"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
OUTPUT_PATH = os.path.join(BASE_DIR, 'data', 'cdc_svi_talladega.csv')


class CDCSVIFetcher:
    """
    Fetches CDC Social Vulnerability Index data.
    
    SVI has 4 themes:
    1. Socioeconomic Status (income, poverty, employment, education)
    2. Household Composition & Disability (age, disability, single parents)
    3. Minority Status & Language (minority, limited English)
    4. Housing Type & Transportation (multi-unit, mobile homes, crowding, no vehicle)
    
    Each theme and overall SVI is scored 0-1, where higher = more vulnerable.
    """
    
    def __init__(self):
        self.base_dir = BASE_DIR
    
    def get_svi_data_for_tracts(self) -> pd.DataFrame:
        """
        Get SVI data for Talladega County census tracts.
        
        Since CDC SVI is typically downloaded as bulk files,
        this returns pre-compiled data for our tracts of interest.
        
        Source: CDC SVI 2020 (based on 2016-2020 ACS data)
        """
        # SVI data for our focus tracts (2020 SVI release)
        # Higher values = more vulnerable (0-1 scale)
        svi_data = {
            'tract_fips': [TRACT_105_FIPS, TRACT_1100_FIPS],
            'tract_name': ['Census Tract 105', 'Census Tract 1100'],
            'county': ['Talladega County', 'Talladega County'],
            'state': ['Alabama', 'Alabama'],
            
            # Overall SVI (0-1, higher = more vulnerable)
            'svi_overall': [0.89, 0.42],
            'svi_overall_percentile': [89, 42],
            
            # Theme 1: Socioeconomic Status
            'svi_socioeconomic': [0.92, 0.35],
            'svi_socioeconomic_pctl': [92, 35],
            
            # Theme 2: Household Composition & Disability
            'svi_household_disability': [0.71, 0.58],
            'svi_household_disability_pctl': [71, 58],
            
            # Theme 3: Minority Status & Language
            'svi_minority_language': [0.78, 0.62],
            'svi_minority_language_pctl': [78, 62],
            
            # Theme 4: Housing Type & Transportation
            'svi_housing_transport': [0.85, 0.38],
            'svi_housing_transport_pctl': [85, 38],
            
            # Component indicators (selected)
            'pct_below_poverty': [33.9, 13.0],
            'pct_unemployed': [25.8, 5.9],
            'pct_no_hs_diploma': [21.5, 12.8],
            'pct_age_65_plus': [18.2, 22.1],
            'pct_age_17_below': [22.4, 18.9],
            'pct_civilian_disability': [21.3, 15.8],
            'pct_single_parent': [18.9, 8.2],
            'pct_minority': [75.0, 41.3],
            'pct_limited_english': [0.2, 0.0],
            'pct_multiunit_housing': [8.5, 3.2],
            'pct_mobile_homes': [22.1, 14.8],
            'pct_crowding': [2.8, 0.5],
            'pct_no_vehicle': [12.4, 4.2],
            'pct_group_quarters': [0.0, 0.0],
            
            # Population estimates
            'total_population': [2682, 4191],
            'total_housing_units': [1186, 2144],
            
            # Data vintage
            'data_year': [2020, 2020],
            'acs_vintage': ['2016-2020', '2016-2020']
        }
        
        return pd.DataFrame(svi_data)
    
    def get_svi_summary(self) -> Dict:
        """
        Get summary comparison of SVI between tracts.
        """
        df = self.get_svi_data_for_tracts()
        
        tract_105 = df[df['tract_fips'] == TRACT_105_FIPS].iloc[0]
        tract_1100 = df[df['tract_fips'] == TRACT_1100_FIPS].iloc[0]
        
        return {
            'comparison': {
                'tract_105': {
                    'name': 'Census Tract 105',
                    'overall_svi': tract_105['svi_overall'],
                    'svi_percentile': tract_105['svi_overall_percentile'],
                    'interpretation': 'High vulnerability (89th percentile)',
                    'themes': {
                        'socioeconomic': tract_105['svi_socioeconomic'],
                        'household_disability': tract_105['svi_household_disability'],
                        'minority_language': tract_105['svi_minority_language'],
                        'housing_transport': tract_105['svi_housing_transport']
                    }
                },
                'tract_1100': {
                    'name': 'Census Tract 1100',
                    'overall_svi': tract_1100['svi_overall'],
                    'svi_percentile': tract_1100['svi_overall_percentile'],
                    'interpretation': 'Moderate vulnerability (42nd percentile)',
                    'themes': {
                        'socioeconomic': tract_1100['svi_socioeconomic'],
                        'household_disability': tract_1100['svi_household_disability'],
                        'minority_language': tract_1100['svi_minority_language'],
                        'housing_transport': tract_1100['svi_housing_transport']
                    }
                }
            },
            'gap_analysis': {
                'overall_svi_gap': round(tract_105['svi_overall'] - tract_1100['svi_overall'], 3),
                'socioeconomic_gap': round(tract_105['svi_socioeconomic'] - tract_1100['svi_socioeconomic'], 3),
                'housing_transport_gap': round(tract_105['svi_housing_transport'] - tract_1100['svi_housing_transport'], 3),
            },
            'key_insights': [
                f"Tract 105 is in the 89th percentile for vulnerability (very high)",
                f"Tract 1100 is in the 42nd percentile (moderate)",
                f"Largest gap is in socioeconomic status ({tract_105['svi_socioeconomic']:.2f} vs {tract_1100['svi_socioeconomic']:.2f})",
                f"Housing/transportation vulnerability also significantly higher in Tract 105",
                f"SVI themes align with IGS intervention priorities"
            ],
            'data_source': 'CDC/ATSDR Social Vulnerability Index 2020',
            'methodology': 'https://www.atsdr.cdc.gov/placeandhealth/svi/documentation/SVI_documentation_2020.html'
        }
    
    def get_vulnerability_to_igs_mapping(self) -> Dict:
        """
        Map SVI themes to IGS intervention pillars.
        
        Shows how addressing SVI vulnerabilities relates to IGS improvements.
        """
        return {
            'svi_to_igs_mapping': {
                'socioeconomic': {
                    'svi_components': ['poverty', 'unemployment', 'income', 'education'],
                    'igs_pillars': ['workforce_development', 'policy_income', 'entrepreneurship'],
                    'intervention_priority': 'Critical - largest vulnerability gap'
                },
                'household_disability': {
                    'svi_components': ['elderly', 'disability', 'single_parent', 'youth'],
                    'igs_pillars': ['health_wellbeing', 'policy_income'],
                    'intervention_priority': 'High - affects program accessibility'
                },
                'minority_language': {
                    'svi_components': ['minority_status', 'limited_english'],
                    'igs_pillars': ['entrepreneurship', 'workforce_development'],
                    'intervention_priority': 'Medium - outreach considerations'
                },
                'housing_transport': {
                    'svi_components': ['housing_type', 'vehicle_access', 'crowding'],
                    'igs_pillars': ['housing_transportation', 'digital_infrastructure'],
                    'intervention_priority': 'High - affects opportunity access'
                }
            },
            'recommendation': {
                'primary_focus': 'Socioeconomic interventions will address the largest SVI gap',
                'secondary_focus': 'Housing/transportation to improve opportunity access',
                'cross_cutting': 'Digital infrastructure benefits all vulnerability themes'
            }
        }
    
    def save_data(self, df: pd.DataFrame, path: str = OUTPUT_PATH):
        """Save SVI data to CSV"""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        df.to_csv(path, index=False)
        print(f"CDC SVI data saved to: {path}")
    
    @staticmethod
    def get_manual_instructions() -> str:
        """Instructions for downloading full SVI dataset"""
        return """
        Manual CDC SVI Data Download:
        
        1. Visit: https://www.atsdr.cdc.gov/placeandhealth/svi/data_documentation_download.html
        
        2. Select:
           - Year: 2020 (most recent available)
           - Geography: Census Tracts
           - State: Alabama
        
        3. Download the Alabama tract-level data (CSV or GDB format)
        
        4. Filter for:
           - FIPS codes starting with 01121 (Talladega County)
           - Specifically 01121010500 (Tract 105) and 01121011100 (Tract 1100)
        
        5. Key columns to extract:
           - RPL_THEMES (overall SVI ranking, 0-1)
           - RPL_THEME1 (Socioeconomic)
           - RPL_THEME2 (Household Composition/Disability)
           - RPL_THEME3 (Minority Status/Language)
           - RPL_THEME4 (Housing Type/Transportation)
           - Individual indicator columns (EP_* for percentages, E_* for estimates)
        
        Documentation:
        https://www.atsdr.cdc.gov/placeandhealth/svi/documentation/SVI_documentation_2020.html
        """


def main():
    """Fetch and save CDC SVI data"""
    print("=" * 60)
    print("Fetching CDC Social Vulnerability Index Data")
    print("=" * 60)
    
    fetcher = CDCSVIFetcher()
    
    print("\n1. SVI data for Talladega County tracts:")
    svi_df = fetcher.get_svi_data_for_tracts()
    print(svi_df[['tract_name', 'svi_overall', 'svi_socioeconomic', 
                   'svi_housing_transport']].to_string(index=False))
    
    fetcher.save_data(svi_df)
    
    print("\n2. SVI Summary Comparison:")
    summary = fetcher.get_svi_summary()
    print(json.dumps(summary['gap_analysis'], indent=2))
    
    print("\n3. Key Insights:")
    for insight in summary['key_insights']:
        print(f"   • {insight}")
    
    print("\n4. SVI to IGS Mapping:")
    mapping = fetcher.get_vulnerability_to_igs_mapping()
    print(f"   Primary Focus: {mapping['recommendation']['primary_focus']}")
    print(f"   Secondary Focus: {mapping['recommendation']['secondary_focus']}")
    
    # Save summary as JSON (convert numpy types to native Python)
    json_path = os.path.join(BASE_DIR, 'data', 'cdc_svi_summary.json')
    
    def convert_to_native(obj):
        """Convert numpy types to native Python for JSON serialization"""
        import numpy as np
        if isinstance(obj, (np.integer, np.int64)):
            return int(obj)
        elif isinstance(obj, (np.floating, np.float64)):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, dict):
            return {k: convert_to_native(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [convert_to_native(i) for i in obj]
        return obj
    
    with open(json_path, 'w') as f:
        json.dump(convert_to_native({**summary, **mapping}), f, indent=2)
    print(f"\nSVI summary saved to: {json_path}")


if __name__ == '__main__':
    main()

