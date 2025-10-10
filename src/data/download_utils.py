"""
Small helper utilities for reliable HTTP downloads to data/raw/.
"""

from pathlib import Path
import requests


def download_file(url: str, dest_path: str, chunk_size: int = 1024 * 1024) -> str:
    """Stream download a file to dest_path. Returns the saved path.

    Creates parent directories as needed.
    """
    dest = Path(dest_path)
    dest.parent.mkdir(parents=True, exist_ok=True)
    with requests.get(url, stream=True, timeout=300) as r:
        r.raise_for_status()
        with open(dest, "wb") as f:
            for chunk in r.iter_content(chunk_size=chunk_size):
                if chunk:
                    f.write(chunk)
    return str(dest)


