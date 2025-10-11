"""
Fetch Census TIGER/Line tract boundaries for Alabama (Talladega County focus).
Downloads state-level shapefiles and leaves them in data/.
"""

from pathlib import Path
from .download_utils import download_file


TIGER_BASE = "https://www2.census.gov/geo/tiger/TIGER2023/TRACT/"
ALABAMA_FILE = "tl_2023_01_tract.zip"


def fetch_alabama_tract_zip() -> str:
    """Fetch Alabama tract boundaries for Talladega County analysis."""
    url = f"{TIGER_BASE}{ALABAMA_FILE}"
    dest = Path("data") / ALABAMA_FILE
    return download_file(url, str(dest))


