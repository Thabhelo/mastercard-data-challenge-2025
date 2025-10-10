"""
Stubs for acquiring healthcare facility point locations (hospitals, clinics, pharmacies).
Expected output format: GeoDataFrame with columns [name, type, latitude, longitude, state, tract_fips].
"""

from typing import Literal

FacilityType = Literal["hospital", "clinic", "pharmacy"]


def load_facilities_from_csv(csv_path: str, facility_type: FacilityType):
    """Load facility CSV with lat/long and annotate type. Returns a GeoDataFrame.

    The CSV is expected to include columns: name, latitude, longitude, state.
    """
    raise NotImplementedError


def attach_tract_fips(geo_df, tract_boundaries):
    """Spatially join facility points to census tracts to assign tract FIPS."""
    raise NotImplementedError


