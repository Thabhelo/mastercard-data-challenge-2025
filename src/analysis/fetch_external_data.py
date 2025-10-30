"""
Fetch external data for Talladega County Census Tracts 105 and 1100
- U.S. Census ACS 5-Year Data (demographics, income, education, employment, housing)
- FCC Broadband Data (internet access and adoption)
"""

import requests
import pandas as pd
import json
from pathlib import Path
from typing import Dict, List

# Census Tract FIPS codes
COUNTY_FIPS = "121"  # Talladega County, Alabama (without state prefix)
STATE_FIPS = "01"  # Alabama
TRACT_105 = "010500"  # Census Tract 105
TRACT_1100 = "011100"  # Census Tract 1100

# ACS 5-Year API endpoint (2022 is most recent available)
ACS_BASE_URL = "https://api.census.gov/data/2022/acs/acs5"


class CensusDataFetcher:
    """Fetch Census ACS data for specific tracts."""
    
    def __init__(self):
        self.base_url = ACS_BASE_URL
        # Key variables for inequality analysis
        self.variables = {
            # Income & Inequality
            "B19013_001E": "median_household_income",
            "B19083_001E": "gini_index",
            "B19301_001E": "per_capita_income",
            
            # Poverty
            "B17001_001E": "total_pop_poverty_status",
            "B17001_002E": "income_below_poverty",
            
            # Education
            "B15003_001E": "total_pop_education",
            "B15003_017E": "high_school_graduate",
            "B15003_022E": "bachelors_degree",
            "B15003_023E": "masters_degree",
            "B15003_024E": "professional_degree",
            "B15003_025E": "doctorate_degree",
            
            # Employment
            "B23025_001E": "total_pop_employment_status",
            "B23025_003E": "in_labor_force",
            "B23025_004E": "employed",
            "B23025_005E": "unemployed",
            
            # Housing Cost
            "B25070_001E": "total_renter_households",
            "B25070_007E": "rent_30_35_percent_income",
            "B25070_008E": "rent_35_40_percent_income",
            "B25070_009E": "rent_40_50_percent_income",
            "B25070_010E": "rent_50_plus_percent_income",
            
            # Housing Value
            "B25077_001E": "median_home_value",
            
            # Internet Access
            "B28002_001E": "total_households_internet",
            "B28002_002E": "has_computer_with_broadband",
            "B28002_004E": "has_computer_no_internet",
            "B28002_013E": "no_computer",
            
            # Demographics
            "B01003_001E": "total_population",
            "B01002_001E": "median_age",
            
            # Race/Ethnicity
            "B02001_001E": "total_pop_race",
            "B02001_002E": "white_alone",
            "B02001_003E": "black_alone",
            "B03003_003E": "hispanic_latino",
            
            # Female-headed households (poverty indicator)
            "B17012_001E": "total_families_poverty",
            "B17012_002E": "families_below_poverty",
            "B17012_014E": "female_householder_below_poverty",
        }
    
    def fetch_tract_data(self, tract_code: str) -> Dict:
        """Fetch ACS data for a specific census tract."""
        # Build variable list
        var_codes = ",".join(self.variables.keys())
        
        # API request
        params = {
            "get": f"NAME,{var_codes}",
            "for": f"tract:{tract_code}",
            "in": f"state:{STATE_FIPS} county:{COUNTY_FIPS}"
        }
        
        try:
            response = requests.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            data = response.json()
            
            if len(data) < 2:
                print(f"Warning: No data returned for tract {tract_code}")
                return None
            
            # Parse response (first row is headers, second row is data)
            headers = data[0]
            values = data[1]
            
            # Create dictionary with readable names (full FIPS: state + county + tract)
            full_county_fips = f"{STATE_FIPS}{COUNTY_FIPS}"  # "01121"
            result = {"tract_fips": f"{full_county_fips}{tract_code}"}
            for i, header in enumerate(headers):
                if header in self.variables:
                    readable_name = self.variables[header]
                    result[readable_name] = values[i]
            
            # Add NAME field
            result["tract_name"] = values[0]
            
            return result
            
        except requests.exceptions.RequestException as e:
            print(f"Error fetching data for tract {tract_code}: {e}")
            return None
    
    def calculate_derived_metrics(self, data: Dict) -> Dict:
        """Calculate derived metrics from raw ACS data."""
        if not data:
            return data
        
        try:
            # Poverty rate
            total_poverty = float(data.get("total_pop_poverty_status", 0))
            below_poverty = float(data.get("income_below_poverty", 0))
            data["poverty_rate"] = (below_poverty / total_poverty * 100) if total_poverty > 0 else None
            
            # High school graduation rate (% of pop 25+ with HS diploma or higher)
            total_ed = float(data.get("total_pop_education", 0))
            hs_grad = float(data.get("high_school_graduate", 0))
            bachelors = float(data.get("bachelors_degree", 0))
            masters = float(data.get("masters_degree", 0))
            professional = float(data.get("professional_degree", 0))
            doctorate = float(data.get("doctorate_degree", 0))
            
            educated_pop = hs_grad + bachelors + masters + professional + doctorate
            data["high_school_or_higher_rate"] = (educated_pop / total_ed * 100) if total_ed > 0 else None
            data["bachelors_or_higher_rate"] = ((bachelors + masters + professional + doctorate) / total_ed * 100) if total_ed > 0 else None
            
            # Unemployment rate
            labor_force = float(data.get("in_labor_force", 0))
            unemployed = float(data.get("unemployed", 0))
            data["unemployment_rate"] = (unemployed / labor_force * 100) if labor_force > 0 else None
            
            # Labor force participation rate
            total_emp_status = float(data.get("total_pop_employment_status", 0))
            data["labor_force_participation_rate"] = (labor_force / total_emp_status * 100) if total_emp_status > 0 else None
            
            # Housing cost burden (% paying 30%+ of income on rent)
            total_renters = float(data.get("total_renter_households", 0))
            cost_burdened = (
                float(data.get("rent_30_35_percent_income", 0)) +
                float(data.get("rent_35_40_percent_income", 0)) +
                float(data.get("rent_40_50_percent_income", 0)) +
                float(data.get("rent_50_plus_percent_income", 0))
            )
            data["housing_cost_burden_rate"] = (cost_burdened / total_renters * 100) if total_renters > 0 else None
            
            # Internet access rate
            total_hh = float(data.get("total_households_internet", 0))
            has_broadband = float(data.get("has_computer_with_broadband", 0))
            data["broadband_access_rate"] = (has_broadband / total_hh * 100) if total_hh > 0 else None
            
            # Computer access rate
            no_computer = float(data.get("no_computer", 0))
            data["computer_access_rate"] = ((total_hh - no_computer) / total_hh * 100) if total_hh > 0 else None
            
            # Demographic percentages
            total_pop = float(data.get("total_pop_race", 0))
            if total_pop > 0:
                data["white_alone_pct"] = (float(data.get("white_alone", 0)) / total_pop * 100)
                data["black_alone_pct"] = (float(data.get("black_alone", 0)) / total_pop * 100)
                data["hispanic_latino_pct"] = (float(data.get("hispanic_latino", 0)) / total_pop * 100)
            
        except (ValueError, TypeError) as e:
            print(f"Error calculating derived metrics: {e}")
        
        return data


class FCCBroadbandFetcher:
    """
    Provide instructions for FCC broadband data acquisition.
    Note: Manual download recommended for tract-level data.
    """
    
    def get_instructions(self) -> str:
        """Return instructions for getting FCC broadband data."""
        return """
        FCC Broadband Data:
        
        Option 1 - FCC Broadband Map (Recommended for MVP):
        1. Visit: https://broadbandmap.fcc.gov/home
        2. Search for: "Talladega County, Alabama"
        3. Use the "View Data" feature to download tract-level data
        
        Option 2 - FCC Bulk Data Downloads:
        1. Visit: https://www.fcc.gov/general/broadband-deployment-data-fcc-form-477
        2. Download the most recent Form 477 deployment data
        3. Filter for Alabama (FIPS: 01) and Talladega County (FIPS: 01121)
        
        Option 3 - National Broadband Map API:
        The FCC provides an API but it requires specific geographic queries.
        For tract-level data, the manual download is more straightforward for MVP.
        
        Key metrics to extract:
        - % of population with access to 25/3 Mbps broadband
        - % of population with access to 100/20 Mbps broadband
        - Number of broadband providers
        - Fixed vs. mobile broadband availability
        """


def main():
    """Fetch and save external data for analysis."""
    print("=== Fetching External Data for Talladega County Tracts ===\n")
    
    # Create data directory if it doesn't exist
    data_dir = Path(__file__).parent.parent.parent / "data"
    data_dir.mkdir(exist_ok=True)
    
    # Fetch Census ACS data
    print("1. Fetching U.S. Census ACS Data...")
    census = CensusDataFetcher()
    
    tract_105_data = census.fetch_tract_data(TRACT_105)
    tract_1100_data = census.fetch_tract_data(TRACT_1100)
    
    if tract_105_data:
        tract_105_data = census.calculate_derived_metrics(tract_105_data)
        print(f"   ✓ Census Tract 105 data fetched")
    
    if tract_1100_data:
        tract_1100_data = census.calculate_derived_metrics(tract_1100_data)
        print(f"   ✓ Census Tract 1100 data fetched")
    
    # Save Census data
    if tract_105_data and tract_1100_data:
        census_df = pd.DataFrame([tract_105_data, tract_1100_data])
        census_output = data_dir / "acs_talladega_tracts.csv"
        census_df.to_csv(census_output, index=False)
        print(f"   ✓ Saved to: {census_output}\n")
        
        # Print key comparison metrics
        print("Key Comparison Metrics (ACS 2022):")
        print(f"\n{'Metric':<40} {'Tract 105':<15} {'Tract 1100':<15} {'Gap':<15}")
        print("-" * 85)
        
        metrics_to_compare = [
            ("total_population", "Population"),
            ("median_household_income", "Median Household Income"),
            ("gini_index", "Gini Index"),
            ("poverty_rate", "Poverty Rate (%)"),
            ("unemployment_rate", "Unemployment Rate (%)"),
            ("labor_force_participation_rate", "Labor Force Participation (%)"),
            ("high_school_or_higher_rate", "HS Graduation Rate (%)"),
            ("bachelors_or_higher_rate", "Bachelor's or Higher (%)"),
            ("broadband_access_rate", "Broadband Access (%)"),
            ("housing_cost_burden_rate", "Housing Cost Burden (%)"),
        ]
        
        for key, label in metrics_to_compare:
            val_105 = tract_105_data.get(key)
            val_1100 = tract_1100_data.get(key)
            
            if val_105 is not None and val_1100 is not None:
                try:
                    val_105 = float(val_105)
                    val_1100 = float(val_1100)
                    gap = val_1100 - val_105
                    
                    # Format based on whether it's a rate/percentage or absolute number
                    if "rate" in key.lower() or "pct" in key.lower():
                        print(f"{label:<40} {val_105:>14.1f} {val_1100:>14.1f} {gap:>+14.1f}")
                    elif key == "gini_index":
                        print(f"{label:<40} {val_105:>14.3f} {val_1100:>14.3f} {gap:>+14.3f}")
                    else:
                        print(f"{label:<40} {val_105:>14,.0f} {val_1100:>14,.0f} {gap:>+14,.0f}")
                except (ValueError, TypeError):
                    pass
        
        # Also save detailed JSON for frontend
        census_json = {
            "tract_105": tract_105_data,
            "tract_1100": tract_1100_data,
            "source": "U.S. Census Bureau American Community Survey 5-Year Estimates (2022)",
            "retrieved": "2024"
        }
        json_output = data_dir / "acs_talladega_tracts.json"
        with open(json_output, 'w') as f:
            json.dump(census_json, f, indent=2)
        print(f"\n   ✓ Also saved JSON to: {json_output}\n")
    
    # FCC Broadband data instructions
    print("\n2. FCC Broadband Data:")
    fcc = FCCBroadbandFetcher()
    print(fcc.get_instructions())
    
    print("\n" + "="*85)
    print("Data Fetching Complete!")
    print("="*85)
    print("\nNext Steps:")
    print("1. Review the ACS data in: data/acs_talladega_tracts.csv")
    print("2. Follow the instructions above to download FCC broadband data manually")
    print("3. Run tract_comparison.py to regenerate analysis with augmented data")


if __name__ == "__main__":
    main()

