"""
Utilities to fetch ACS 5-year estimates for census tracts.
Minimal, dependency-light implementation to construct URLs and document expected workflow.
"""

from typing import List, Dict


def build_census_api_url(dataset: str, year: int, state_fips: str, variables: List[str]) -> str:
    """Return a Census API URL for tract-level variables in the given state.

    Example dataset: "acs/acs5"; year: 2023; variables: ["B19013_001E"].
    """
    var_clause = ",".join(["NAME"] + variables)
    base = f"https://api.census.gov/data/{year}/{dataset}"
    # Tract-level geography within a state
    return f"{base}?get={var_clause}&for=tract:*&in=state:{state_fips}"


def fetch_acs_tract_data(state_fips: str, variables: List[str], dataset: str = "acs/acs5", year: int = 2023):
    """Fetch ACS tract-level data for a state and return a tidy DataFrame.

    Notes:
      - Caller will handle requests.get(url).json() to avoid network in restricted envs.
      - Expected to convert rows => DataFrame and append FIPS (state+county+tract).
    """
    import pandas as pd  # local import to avoid hard dependency if unused
    import requests

    url = build_census_api_url(dataset=dataset, year=year, state_fips=state_fips, variables=variables)
    resp = requests.get(url, timeout=60)
    resp.raise_for_status()
    data = resp.json()
    header, rows = data[0], data[1:]
    df = pd.DataFrame(rows, columns=header)
    # Compose full tract FIPS
    df["state_fips"] = df["state"]
    df["county_fips"] = df["county"]
    df["tract_fips"] = df["state"] + df["county"] + df["tract"]
    return df


def normalize_acs_columns(df, rename_map: Dict[str, str]):
    """Rename and standardize ACS columns for downstream use.

    Example rename_map:
      {"B19013_001E": "median_income", "B19083_001E": "gini"}
    """
    out = df.rename(columns=rename_map).copy()
    return out


