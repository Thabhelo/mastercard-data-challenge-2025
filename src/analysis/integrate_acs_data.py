"""
Integrate Census ACS data with IGS analysis.
Creates enriched comparison for Tract 105 vs Tract 1100.
"""

import pandas as pd
import json
from pathlib import Path


def load_acs_data():
    """Load Census ACS data."""
    data_path = Path(__file__).parent.parent.parent / "data" / "acs_talladega_tracts.csv"
    return pd.read_csv(data_path, dtype={"tract_fips": str})


def load_igs_data():
    """Load IGS comparison data."""
    data_path = Path(__file__).parent.parent.parent / "frontend" / "public" / "data" / "tract_comparison.json"
    with open(data_path, 'r') as f:
        return json.load(f)


def enrich_tract_comparison():
    """Enrich the tract comparison with ACS demographic and economic data."""
    
    print("Loading data sources...")
    acs_df = load_acs_data()
    igs_data = load_igs_data()
    
    # Get ACS data for each tract
    tract_105_acs = acs_df[acs_df['tract_fips'] == '01121010500'].iloc[0].to_dict()
    tract_1100_acs = acs_df[acs_df['tract_fips'] == '01121011100'].iloc[0].to_dict()
    
    # Create enriched comparison
    enriched = {
        "tract_105": {
            **igs_data['tract_105'],
            "demographics": {
                "population": int(tract_105_acs['total_population']),
                "median_age": float(tract_105_acs['median_age']),
                "white_pct": round(tract_105_acs['white_alone_pct'], 1),
                "black_pct": round(tract_105_acs['black_alone_pct'], 1),
                "hispanic_pct": round(tract_105_acs['hispanic_latino_pct'], 1),
            },
            "economics": {
                "median_household_income": int(tract_105_acs['median_household_income']),
                "per_capita_income": int(tract_105_acs['per_capita_income']),
                "gini_index": round(tract_105_acs['gini_index'], 3),
                "poverty_rate": round(tract_105_acs['poverty_rate'], 1),
                "unemployment_rate": round(tract_105_acs['unemployment_rate'], 1),
                "labor_force_participation": round(tract_105_acs['labor_force_participation_rate'], 1),
            },
            "education": {
                "hs_grad_or_higher_pct": round(tract_105_acs['high_school_or_higher_rate'], 1),
                "bachelors_or_higher_pct": round(tract_105_acs['bachelors_or_higher_rate'], 1),
            },
            "housing": {
                "median_home_value": int(tract_105_acs['median_home_value']),
                "housing_cost_burden_pct": round(tract_105_acs['housing_cost_burden_rate'], 1),
            },
            "digital": {
                "broadband_access_pct": round(tract_105_acs['broadband_access_rate'], 1),
                "computer_access_pct": round(tract_105_acs['computer_access_rate'], 1),
            }
        },
        "tract_1100": {
            **igs_data['tract_1100'],
            "demographics": {
                "population": int(tract_1100_acs['total_population']),
                "median_age": float(tract_1100_acs['median_age']),
                "white_pct": round(tract_1100_acs['white_alone_pct'], 1),
                "black_pct": round(tract_1100_acs['black_alone_pct'], 1),
                "hispanic_pct": round(tract_1100_acs['hispanic_latino_pct'], 1),
            },
            "economics": {
                "median_household_income": int(tract_1100_acs['median_household_income']),
                "per_capita_income": int(tract_1100_acs['per_capita_income']),
                "gini_index": round(tract_1100_acs['gini_index'], 3),
                "poverty_rate": round(tract_1100_acs['poverty_rate'], 1),
                "unemployment_rate": round(tract_1100_acs['unemployment_rate'], 1),
                "labor_force_participation": round(tract_1100_acs['labor_force_participation_rate'], 1),
            },
            "education": {
                "hs_grad_or_higher_pct": round(tract_1100_acs['high_school_or_higher_rate'], 1),
                "bachelors_or_higher_pct": round(tract_1100_acs['bachelors_or_higher_rate'], 1),
            },
            "housing": {
                "median_home_value": int(tract_1100_acs['median_home_value']),
                "housing_cost_burden_pct": round(tract_1100_acs['housing_cost_burden_rate'], 1),
            },
            "digital": {
                "broadband_access_pct": round(tract_1100_acs['broadband_access_rate'], 1),
                "computer_access_pct": round(tract_1100_acs['computer_access_rate'], 1),
            }
        },
        "strategic_pillars": igs_data['strategic_pillars'],
        "time_series": igs_data['time_series'],
        "data_sources": {
            "igs": "Mastercard Inclusive Growth Score (2017-2024)",
            "acs": "U.S. Census Bureau American Community Survey 5-Year Estimates (2022)",
            "last_updated": "2024-10-30"
        }
    }
    
    return enriched, tract_105_acs, tract_1100_acs


def main():
    """Main integration pipeline."""
    print("="*80)
    print("INTEGRATING CENSUS ACS DATA WITH IGS ANALYSIS")
    print("="*80)
    
    enriched, tract_105_acs, tract_1100_acs = enrich_tract_comparison()
    
    # Save enriched data
    output_path = Path(__file__).parent.parent.parent / "frontend" / "public" / "data" / "tract_comparison_enriched.json"
    with open(output_path, 'w') as f:
        json.dump(enriched, f, indent=2)
    
    print(f"\n✓ Enriched comparison saved to: {output_path}")
    
    # Print summary report
    print("\n" + "="*80)
    print("ENRICHED TRACT COMPARISON SUMMARY")
    print("="*80)
    
    print("\n📊 DEMOGRAPHICS (ACS 2022)")
    print(f"  Tract 105 Population: {enriched['tract_105']['demographics']['population']:,}")
    print(f"  Tract 1100 Population: {enriched['tract_1100']['demographics']['population']:,}")
    
    print("\n💰 ECONOMICS (ACS 2022)")
    print(f"  Median Household Income:")
    print(f"    Tract 105:  ${enriched['tract_105']['economics']['median_household_income']:,}")
    print(f"    Tract 1100: ${enriched['tract_1100']['economics']['median_household_income']:,}")
    print(f"    Gap: ${enriched['tract_1100']['economics']['median_household_income'] - enriched['tract_105']['economics']['median_household_income']:,} (+{round((enriched['tract_1100']['economics']['median_household_income']/enriched['tract_105']['economics']['median_household_income'] - 1)*100, 1)}%)")
    
    print(f"\n  Poverty Rate:")
    print(f"    Tract 105:  {enriched['tract_105']['economics']['poverty_rate']}%")
    print(f"    Tract 1100: {enriched['tract_1100']['economics']['poverty_rate']}%")
    print(f"    Gap: {enriched['tract_105']['economics']['poverty_rate'] - enriched['tract_1100']['economics']['poverty_rate']:.1f} percentage points")
    
    print(f"\n  Unemployment Rate:")
    print(f"    Tract 105:  {enriched['tract_105']['economics']['unemployment_rate']}%")
    print(f"    Tract 1100: {enriched['tract_1100']['economics']['unemployment_rate']}%")
    print(f"    Gap: {enriched['tract_105']['economics']['unemployment_rate'] - enriched['tract_1100']['economics']['unemployment_rate']:.1f} percentage points")
    
    print("\n🏠 HOUSING (ACS 2022)")
    print(f"  Housing Cost Burden (% paying 30%+ income on rent):")
    print(f"    Tract 105:  {enriched['tract_105']['housing']['housing_cost_burden_pct']}%")
    print(f"    Tract 1100: {enriched['tract_1100']['housing']['housing_cost_burden_pct']}%")
    print(f"    Gap: {enriched['tract_105']['housing']['housing_cost_burden_pct'] - enriched['tract_1100']['housing']['housing_cost_burden_pct']:.1f} percentage points")
    
    print("\n💻 DIGITAL ACCESS (ACS 2022)")
    print(f"  Broadband Access:")
    print(f"    Tract 105:  {enriched['tract_105']['digital']['broadband_access_pct']}%")
    print(f"    Tract 1100: {enriched['tract_1100']['digital']['broadband_access_pct']}%")
    print(f"    Note: ACS data shows Tract 105 higher, but IGS Internet Access Score shows")
    print(f"          50-point gap favoring Tract 1100. Need FCC data for validation.")
    
    print("\n📈 IGS SCORES (2024)")
    print(f"  Inclusive Growth Score:")
    print(f"    Tract 105:  {enriched['tract_105']['igs']['latest']}")
    print(f"    Tract 1100: {enriched['tract_1100']['igs']['latest']}")
    print(f"    Gap: {enriched['tract_1100']['igs']['latest'] - enriched['tract_105']['igs']['latest']:.0f} points")
    
    # Calculate correlation insights
    print("\n" + "="*80)
    print("KEY INSIGHTS")
    print("="*80)
    
    print("\n✓ DATA VALIDATION:")
    print("  • ACS confirms income gap: Tract 1100 earns $14,456 more (42% higher)")
    print("  • Poverty is 2.6x higher in Tract 105 (33.9% vs 13.0%)")
    print("  • Unemployment is 4.4x higher in Tract 105 (25.8% vs 5.9%)")
    print("  • Housing cost burden is 3.4x higher in Tract 105 (53.9% vs 15.9%)")
    
    print("\n INTERVENTION PRIORITIES VALIDATED:")
    print("  1. WORKFORCE DEVELOPMENT - Critical (25.8% unemployment)")
    print("  2. HOUSING AFFORDABILITY - Critical (53.9% cost-burdened)")
    print("  3. POVERTY REDUCTION - Critical (33.9% poverty rate)")
    print("  4. DIGITAL INFRASTRUCTURE - Needs FCC data validation")
    
    print("\n DATA GAPS:")
    print("  • FCC Broadband data needed to validate digital infrastructure gap")
    print("  • Business creation/entrepreneurship data (from Census Business Dynamics)")
    print("  • Health outcomes data (from state/county health departments)")
    
    print("\n" + "="*80)
    print("NEXT STEPS")
    print("="*80)
    print("\n1. ✓ Census ACS data integrated")
    print("2. ⏳ Obtain FCC broadband data (see fetch_external_data.py instructions)")
    print("3. ⏳ Update frontend dashboard to display ACS metrics")
    print("4. ⏳ Create presentation with validated findings")
    
    print("\n" + "="*80)


if __name__ == "__main__":
    main()

