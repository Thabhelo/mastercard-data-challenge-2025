"""
Comparative analysis of Census Tract 105 vs Tract 1100 in Talladega County, Alabama.
Analyzes IGS metrics to identify gaps and opportunities for reducing income inequality.
"""

import pandas as pd
import json
from pathlib import Path

# Census Tract FIPS codes
TRACT_105 = "1121010500"
TRACT_1100 = "1121011100"

def load_data():
    """Load IGS data for Talladega County census tracts."""
    data_path = Path(__file__).parent.parent.parent / "data" / "igs_talladega_tracts.csv"
    df = pd.read_csv(data_path, index_col=0, dtype={"Census Tract FIPS code": str})
    df = df.reset_index(drop=True)
    return df

def filter_tracts(df, tract_fips_list):
    """Filter dataframe for specific census tracts."""
    return df[df["Census Tract FIPS code"].isin(tract_fips_list)]

def calculate_trends(df, tract_fips, metric_col):
    """Calculate trend statistics for a metric over time."""
    tract_data = df[df["Census Tract FIPS code"] == tract_fips].sort_values("Year")
    
    if metric_col not in tract_data.columns or tract_data[metric_col].isna().all():
        return {
            "mean": None,
            "min": None,
            "max": None,
            "latest": None,
            "trend": None
        }
    
    values = tract_data[metric_col].dropna()
    if len(values) == 0:
        return {
            "mean": None,
            "min": None,
            "max": None,
            "latest": None,
            "trend": None
        }
    
    latest_value = values.iloc[-1] if len(values) > 0 else None
    first_value = values.iloc[0] if len(values) > 0 else None
    trend = "increasing" if latest_value > first_value else "decreasing" if latest_value < first_value else "stable"
    
    return {
        "mean": float(values.mean()),
        "min": float(values.min()),
        "max": float(values.max()),
        "latest": float(latest_value) if latest_value is not None else None,
        "trend": trend
    }

def calculate_gap(df, metric_col):
    """Calculate the gap between Tract 105 and Tract 1100 for a given metric."""
    tract_105_data = df[df["Census Tract FIPS code"] == TRACT_105]
    tract_1100_data = df[df["Census Tract FIPS code"] == TRACT_1100]
    
    if metric_col not in df.columns:
        return None
    
    tract_105_latest = tract_105_data.sort_values("Year")[metric_col].dropna()
    tract_1100_latest = tract_1100_data.sort_values("Year")[metric_col].dropna()
    
    if len(tract_105_latest) == 0 or len(tract_1100_latest) == 0:
        return None
    
    gap = float(tract_1100_latest.iloc[-1] - tract_105_latest.iloc[-1])
    return gap

def analyze_strategic_pillars(df):
    """Analyze metrics for the 6 strategic pillars."""
    
    pillars = {
        "digital_infrastructure": {
            "metrics": {
                "Internet Access Score": calculate_gap(df, "Internet Access Score"),
            },
            "description": "Digital connectivity and broadband access"
        },
        "workforce_development": {
            "metrics": {
                "Labor Market Engagement Index Score": calculate_gap(df, "Labor Market Engagement Index Score"),
                "New Businesses Score": calculate_gap(df, "New Businesses Score"),
            },
            "description": "Employment opportunities and business creation"
        },
        "entrepreneurship": {
            "metrics": {
                "Minority/Women Owned Businesses Score": calculate_gap(df, "Minority/Women Owned Businesses Score"),
                "Small Business Loans Score": calculate_gap(df, "Small Business Loans Score"),
            },
            "description": "Small business support and ownership diversity"
        },
        "housing_transportation": {
            "metrics": {
                "Affordable Housing Score": calculate_gap(df, "Affordable Housing Score"),
                "Travel Time to Work Score": calculate_gap(df, "Travel Time to Work Score"),
            },
            "description": "Housing affordability and mobility"
        },
        "health_wellbeing": {
            "metrics": {
                "Health Insurance Coverage Score": calculate_gap(df, "Health Insurance Coverage Score"),
            },
            "description": "Health access and outcomes"
        },
        "policy_income": {
            "metrics": {
                "Personal Income Score": calculate_gap(df, "Personal Income Score"),
                "Gini Coefficient Score": calculate_gap(df, "Gini Coefficient Score"),
                "Female Above Poverty Score": calculate_gap(df, "Female Above Poverty Score"),
            },
            "description": "Income equality and poverty reduction"
        }
    }
    
    return pillars

def generate_comparison_data(df):
    """Generate comprehensive comparison data for Tract 105 vs Tract 1100."""
    
    tract_105 = filter_tracts(df, [TRACT_105])
    tract_1100 = filter_tracts(df, [TRACT_1100])
    
    # Core IGS metrics
    comparison = {
        "tract_105": {
            "fips": TRACT_105,
            "name": "Census Tract 105",
            "igs": calculate_trends(df, TRACT_105, "Inclusive Growth Score"),
            "growth": calculate_trends(df, TRACT_105, "Growth"),
            "inclusion": calculate_trends(df, TRACT_105, "Inclusion"),
            "gini_coefficient": calculate_trends(df, TRACT_105, "Gini Coefficient Score"),
            "is_opportunity_zone": str(tract_105["Is an Opportunity Zone"].iloc[0]) if len(tract_105) > 0 and pd.notna(tract_105["Is an Opportunity Zone"].iloc[0]) else None
        },
        "tract_1100": {
            "fips": TRACT_1100,
            "name": "Census Tract 1100",
            "igs": calculate_trends(df, TRACT_1100, "Inclusive Growth Score"),
            "growth": calculate_trends(df, TRACT_1100, "Growth"),
            "inclusion": calculate_trends(df, TRACT_1100, "Inclusion"),
            "gini_coefficient": calculate_trends(df, TRACT_1100, "Gini Coefficient Score"),
            "is_opportunity_zone": str(tract_1100["Is an Opportunity Zone"].iloc[0]) if len(tract_1100) > 0 and pd.notna(tract_1100["Is an Opportunity Zone"].iloc[0]) else None
        },
        "strategic_pillars": analyze_strategic_pillars(df),
        "time_series": {
            "years": sorted(df["Year"].unique().tolist()),
            "tract_105_igs": tract_105.sort_values("Year")["Inclusive Growth Score"].tolist(),
            "tract_1100_igs": tract_1100.sort_values("Year")["Inclusive Growth Score"].tolist()
        }
    }
    
    return comparison

def export_to_json(data, output_path):
    """Export comparison data to JSON for frontend consumption."""
    with open(output_path, 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Data exported to {output_path}")

def main():
    """Main analysis pipeline."""
    print("Loading IGS data...")
    df = load_data()
    
    print(f"Analyzing {len(df)} records across {df['Year'].nunique()} years...")
    print(f"Census tracts: {df['Census Tract FIPS code'].nunique()}")
    
    print("\nGenerating comparison analysis...")
    comparison = generate_comparison_data(df)
    
    # Export to JSON
    output_path = Path(__file__).parent.parent.parent / "frontend" / "public" / "data" / "tract_comparison.json"
    export_to_json(comparison, output_path)
    
    # Print summary
    print("\n=== TRACT COMPARISON SUMMARY ===")
    tract_105_igs = comparison['tract_105']['igs']['latest']
    tract_1100_igs = comparison['tract_1100']['igs']['latest']
    print(f"Tract 105 IGS (latest): {tract_105_igs}")
    print(f"Tract 1100 IGS (latest): {tract_1100_igs}")
    
    if tract_105_igs is not None and tract_1100_igs is not None:
        print(f"IGS Gap: {tract_1100_igs - tract_105_igs:.1f} points")
    
    print("\nStrategic Pillar Gaps (Tract 1100 - Tract 105):")
    for pillar_name, pillar_data in comparison['strategic_pillars'].items():
        print(f"\n{pillar_name.replace('_', ' ').title()}:")
        for metric, gap in pillar_data['metrics'].items():
            if gap is not None:
                print(f"  {metric}: {gap:+.1f}")

if __name__ == "__main__":
    main()

