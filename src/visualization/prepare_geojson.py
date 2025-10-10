"""
Prepare final GeoJSON with tract polygons and attributes for Mapbox visualization.
"""


def export_geojson(tracts_gdf, attributes_df, out_path: str):
    """Merge attributes into tract polygons and write to GeoJSON for the React app.

    tracts_gdf: GeoDataFrame with column 'GEOID' (tract FIPS) and geometry
    attributes_df: DataFrame with column 'tract_fips' and metric columns
    out_path: file path to write the combined GeoJSON
    """
    import geopandas as gpd

    if "GEOID" not in tracts_gdf.columns:
        raise ValueError("tracts_gdf must include GEOID column")
    if "tract_fips" not in attributes_df.columns:
        raise ValueError("attributes_df must include tract_fips column")

    merged = tracts_gdf.merge(attributes_df, left_on="GEOID", right_on="tract_fips", how="left")
    gpd.GeoDataFrame(merged, geometry=merged.geometry, crs=tracts_gdf.crs).to_file(out_path, driver="GeoJSON")


