"""
Accessibility calculations for healthcare facilities.
Outputs per-tract minimum distance/drive-time and facility density metrics.
"""


def compute_min_distance_to_facility(tract_centroids_gdf, facilities_gdf):
    """Return a Series of minimum distances (km) from each tract centroid to nearest facility."""
    raise NotImplementedError


def estimate_drive_time_minutes(tract_centroids_gdf, facilities_gdf):
    """Approximate drive-time minutes (placeholder; replace with OSRM/Matrix service)."""
    raise NotImplementedError


