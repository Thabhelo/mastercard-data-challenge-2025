"""
Fetch Census TIGER/Line tract boundaries for Alabama and Mississippi.
Downloads state-level shapefiles and leaves them in data/raw/.
"""

from pathlib import Path
from .download_utils import download_file


TIGER_BASE = "https://www2.census.gov/geo/tiger/TIGER2023/TRACT/"
STATE_FILES = {
    "AL": "tl_2023_01_tract.zip",
    "MS": "tl_2023_28_tract.zip",
}


def fetch_state_tract_zip(state_abbr: str) -> str:
    filename = STATE_FILES[state_abbr]
    url = f"{TIGER_BASE}{filename}"
    dest = Path("data/raw") / filename
    return download_file(url, str(dest))


def fetch_all():
    paths = []
    for abbr in ("AL", "MS"):
        paths.append(fetch_state_tract_zip(abbr))
    return paths


