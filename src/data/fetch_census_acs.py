"""
Utilities to fetch ACS 5-year estimates for census tracts in Mississippi and Alabama.
This is a lightweight stub with function signatures and docstrings.
"""

from typing import List, Dict


def build_census_api_url(state_fips: str, table_variables: List[str]) -> str:
    """Return a Census API URL for tract-level variables in the given state.

    Args:
        state_fips: Two-digit FIPS code string (e.g., "01" for Alabama, "28" for Mississippi).
        table_variables: List of ACS variable codes to request.

    Returns:
        A string URL that can be requested with requests.get.
    """
    # Implementation to be added in execution phase
    return ""


def fetch_acs_tract_data(state_fips: str, variables: List[str]) -> "pd.DataFrame":
    """Fetch ACS tract-level data for a state and return a tidy DataFrame.

    Variables examples:
      - B27020 (Insurance), B19083 (Gini), B19013 (Median Income), B17001 (Poverty)
    """
    raise NotImplementedError


def normalize_acs_columns(df: "pd.DataFrame", rename_map: Dict[str, str]) -> "pd.DataFrame":
    """Rename and standardize ACS columns for downstream use."""
    raise NotImplementedError


