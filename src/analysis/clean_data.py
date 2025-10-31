"""
Data Cleaning Utility

Cleans and normalizes data files to ensure consistency.
"""

import pandas as pd
import os
import shutil
from datetime import datetime


def clean_acs_data(input_path: str, output_path: str = None, backup: bool = True):
    """
    Clean ACS data file
    
    Args:
        input_path: Path to input ACS CSV file
        output_path: Path to output file (defaults to overwriting input)
        backup: Whether to create a backup of the original file
    """
    if output_path is None:
        output_path = input_path
    
    # Create backup if needed
    if backup and output_path == input_path:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_path = f"{input_path}.backup_{timestamp}"
        shutil.copy(input_path, backup_path)
        print(f"Created backup: {backup_path}")
    
    # Load data
    df = pd.read_csv(input_path)
    original_count = len(df)
    
    # Clean FIPS codes - ensure 11 digits with leading zeros
    if 'tract_fips' in df.columns:
        # Convert to string and pad with zeros, then add quotes to preserve leading zeros
        df['tract_fips'] = df['tract_fips'].astype(str).str.zfill(11)
        print(f"✓ Normalized {len(df)} tract_fips codes to 11 digits")
    
    # Remove any rows with null FIPS codes
    if 'tract_fips' in df.columns:
        df = df[df['tract_fips'].notnull()]
        removed = original_count - len(df)
        if removed > 0:
            print(f"✓ Removed {removed} rows with null tract_fips")
    
    # Remove duplicate tract FIPS codes (keep first occurrence)
    if 'tract_fips' in df.columns:
        before = len(df)
        df = df.drop_duplicates(subset=['tract_fips'], keep='first')
        removed = before - len(df)
        if removed > 0:
            print(f"✓ Removed {removed} duplicate tract records")
    
    # Save cleaned data with proper quoting to preserve leading zeros
    df.to_csv(output_path, index=False, quoting=1)  # QUOTE_ALL = 1
    print(f"✓ Saved cleaned data to: {output_path}")
    
    return df


def clean_igs_data(input_path: str, output_path: str = None, backup: bool = True):
    """
    Clean IGS data file
    
    Args:
        input_path: Path to input IGS CSV file
        output_path: Path to output file (defaults to overwriting input)
        backup: Whether to create a backup of the original file
    """
    if output_path is None:
        output_path = input_path
    
    # Create backup if needed
    if backup and output_path == input_path:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_path = f"{input_path}.backup_{timestamp}"
        shutil.copy(input_path, backup_path)
        print(f"Created backup: {backup_path}")
    
    # Load data
    df = pd.read_csv(input_path)
    original_count = len(df)
    
    # Clean FIPS codes - ensure 10 digits with leading zeros
    if 'Census Tract FIPS code' in df.columns:
        df['Census Tract FIPS code'] = (
            df['Census Tract FIPS code'].astype(str).str.zfill(10)
        )
        print(f"✓ Normalized {len(df)} FIPS codes to 10 digits")
    
    # Remove rows with null critical values
    critical_cols = ['Census Tract FIPS code', 'Year', 'Inclusive Growth Score']
    for col in critical_cols:
        if col in df.columns:
            before = len(df)
            df = df[df[col].notnull()]
            removed = before - len(df)
            if removed > 0:
                print(f"✓ Removed {removed} rows with null {col}")
    
    # Remove duplicate tract-year combinations (keep first occurrence)
    if all(col in df.columns for col in ['Census Tract FIPS code', 'Year']):
        before = len(df)
        df = df.drop_duplicates(
            subset=['Census Tract FIPS code', 'Year'],
            keep='first'
        )
        removed = before - len(df)
        if removed > 0:
            print(f"✓ Removed {removed} duplicate tract-year records")
    
    # Sort by tract and year for better organization
    if all(col in df.columns for col in ['Census Tract FIPS code', 'Year']):
        df = df.sort_values(['Census Tract FIPS code', 'Year'])
        print(f"✓ Sorted data by tract and year")
    
    # Save cleaned data with proper quoting to preserve leading zeros
    df.to_csv(output_path, index=False, quoting=1)  # QUOTE_ALL = 1
    print(f"✓ Saved cleaned data to: {output_path}")
    
    return df


def main():
    """Clean all data files"""
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    
    print("="*60)
    print("Data Cleaning Utility")
    print("="*60)
    
    # Clean ACS data
    print("\nCleaning ACS data...")
    acs_path = os.path.join(base_dir, 'data/acs_talladega_tracts.csv')
    try:
        clean_acs_data(acs_path, backup=True)
        
        # Also clean frontend copy
        frontend_acs_path = os.path.join(base_dir, 'frontend/data/acs_talladega_tracts.csv')
        if os.path.exists(frontend_acs_path):
            print("\nCleaning frontend ACS data copy...")
            clean_acs_data(frontend_acs_path, backup=False)
    except Exception as e:
        print(f"✗ Error cleaning ACS data: {e}")
    
    # Clean IGS data
    print("\nCleaning IGS data...")
    igs_path = os.path.join(base_dir, 'data/igs_talladega_tracts.csv')
    try:
        clean_igs_data(igs_path, backup=True)
        
        # Also clean frontend copy
        frontend_igs_path = os.path.join(base_dir, 'frontend/data/igs_talladega_tracts.csv')
        if os.path.exists(frontend_igs_path):
            print("\nCleaning frontend IGS data copy...")
            clean_igs_data(frontend_igs_path, backup=False)
    except Exception as e:
        print(f"✗ Error cleaning IGS data: {e}")
    
    print("\n" + "="*60)
    print("Data cleaning completed!")
    print("="*60)


if __name__ == '__main__':
    main()

