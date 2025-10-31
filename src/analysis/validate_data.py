"""
Data Validation Utility

Validates the integrity and quality of IGS and ACS data files.
"""

import pandas as pd
import numpy as np
import os
from typing import Dict, List, Tuple


def validate_igs_data(file_path: str) -> Tuple[bool, List[str]]:
    """
    Validate IGS (Inclusive Growth Score) data
    
    Args:
        file_path: Path to IGS CSV file
        
    Returns:
        Tuple of (is_valid, list_of_issues)
    """
    issues = []
    
    try:
        df = pd.read_csv(file_path)
    except FileNotFoundError:
        return False, [f"File not found: {file_path}"]
    except Exception as e:
        return False, [f"Error reading file: {e}"]
    
    # Check required columns
    required_columns = ['Census Tract FIPS code', 'Year', 'Inclusive Growth Score']
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        issues.append(f"Missing required columns: {missing_columns}")
        return False, issues
    
    # Check for null values in key columns
    for col in required_columns:
        null_count = df[col].isnull().sum()
        if null_count > 0:
            issues.append(f"Column '{col}' has {null_count} null values")
    
    # Validate FIPS codes
    fips_col = df['Census Tract FIPS code'].astype(str)
    invalid_fips = fips_col[~fips_col.str.match(r'^\d{10,11}$')]
    if len(invalid_fips) > 0:
        issues.append(f"Found {len(invalid_fips)} invalid FIPS codes")
    
    # Validate years
    years = df['Year'].dropna()
    if len(years) > 0:
        min_year = years.min()
        max_year = years.max()
        if min_year < 2000 or max_year > 2100:
            issues.append(f"Suspicious year range: {min_year} to {max_year}")
    
    # Validate IGS scores
    scores = df['Inclusive Growth Score'].dropna()
    if len(scores) > 0:
        min_score = scores.min()
        max_score = scores.max()
        if min_score < 0 or max_score > 100:
            issues.append(
                f"IGS scores outside expected range [0, 100]: "
                f"min={min_score:.2f}, max={max_score:.2f}"
            )
    
    # Check for duplicates
    duplicates = df.duplicated(subset=['Census Tract FIPS code', 'Year']).sum()
    if duplicates > 0:
        issues.append(f"Found {duplicates} duplicate tract-year combinations")
    
    is_valid = len(issues) == 0
    return is_valid, issues


def validate_acs_data(file_path: str) -> Tuple[bool, List[str]]:
    """
    Validate ACS (American Community Survey) data
    
    Args:
        file_path: Path to ACS CSV file
        
    Returns:
        Tuple of (is_valid, list_of_issues)
    """
    issues = []
    
    try:
        # Read with tract_fips as string to preserve leading zeros
        df = pd.read_csv(file_path, dtype={'tract_fips': str})
    except FileNotFoundError:
        return False, [f"File not found: {file_path}"]
    except Exception as e:
        return False, [f"Error reading file: {e}"]
    
    # Check required columns
    required_columns = [
        'tract_fips',
        'median_household_income',
        'poverty_rate',
        'unemployment_rate',
        'labor_force_participation_rate'
    ]
    
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        issues.append(f"Missing required columns: {missing_columns}")
        return False, issues
    
    # Check for null values in tract_fips
    null_fips = df['tract_fips'].isnull().sum()
    if null_fips > 0:
        issues.append(f"tract_fips has {null_fips} null values")
    
    # Validate FIPS codes
    fips_col = df['tract_fips'].astype(str).str.strip()  # Strip any whitespace
    invalid_fips = fips_col[~fips_col.str.match(r'^\d{11}$')]
    if len(invalid_fips) > 0:
        issues.append(f"Found {len(invalid_fips)} invalid FIPS codes (should be 11 digits)")
        # Show some examples for debugging
        examples = invalid_fips.head(3).tolist()
        issues.append(f"  Examples: {examples}")
    
    # Validate percentage fields (should be between 0 and 100)
    percentage_fields = [
        'poverty_rate',
        'unemployment_rate',
        'labor_force_participation_rate',
        'housing_cost_burden_rate',
        'broadband_access_rate',
        'computer_access_rate'
    ]
    
    for field in percentage_fields:
        if field in df.columns:
            values = df[field].dropna()
            if len(values) > 0:
                min_val = values.min()
                max_val = values.max()
                if min_val < 0 or max_val > 100:
                    issues.append(
                        f"Field '{field}' has values outside [0, 100]: "
                        f"min={min_val:.2f}, max={max_val:.2f}"
                    )
    
    # Check for excessive null values
    for col in df.columns:
        null_pct = (df[col].isnull().sum() / len(df)) * 100
        if null_pct > 50:
            issues.append(f"Column '{col}' has {null_pct:.1f}% null values")
    
    # Check for duplicates
    duplicates = df.duplicated(subset=['tract_fips']).sum()
    if duplicates > 0:
        issues.append(f"Found {duplicates} duplicate tract FIPS codes")
    
    is_valid = len(issues) == 0
    return is_valid, issues


def print_validation_report(
    data_type: str,
    is_valid: bool,
    issues: List[str],
    file_path: str
):
    """Print a formatted validation report"""
    print(f"\n{'='*60}")
    print(f"{data_type} Data Validation")
    print(f"{'='*60}")
    print(f"File: {file_path}")
    print(f"Status: {'✓ VALID' if is_valid else '✗ INVALID'}")
    
    if issues:
        print(f"\nIssues Found ({len(issues)}):")
        for i, issue in enumerate(issues, 1):
            print(f"  {i}. {issue}")
    else:
        print("\n✓ No issues found!")


def main():
    """Run data validation on all data files"""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    
    # Validate IGS data
    igs_path = os.path.join(base_dir, 'data/igs_talladega_tracts.csv')
    igs_valid, igs_issues = validate_igs_data(igs_path)
    print_validation_report("IGS", igs_valid, igs_issues, igs_path)
    
    # Validate ACS data
    acs_path = os.path.join(base_dir, 'data/acs_talladega_tracts.csv')
    acs_valid, acs_issues = validate_acs_data(acs_path)
    print_validation_report("ACS", acs_valid, acs_issues, acs_path)
    
    # Overall summary
    print(f"\n{'='*60}")
    print("Overall Summary")
    print(f"{'='*60}")
    
    if igs_valid and acs_valid:
        print("✓ All data files are valid!")
        return 0
    else:
        print("✗ Some data files have issues that should be addressed.")
        return 1


if __name__ == '__main__':
    import sys
    sys.exit(main())

