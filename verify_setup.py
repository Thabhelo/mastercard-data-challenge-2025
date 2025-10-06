"""
Verification script to check that all dependencies are installed correctly.
"""

import sys

def check_imports():
    """Check that all required packages can be imported."""
    packages = [
        'pandas',
        'numpy',
        'geopandas',
        'shapely',
        'requests',
        'bs4',
        'sklearn',
        'xgboost',
        'matplotlib',
        'seaborn',
        'plotly',
        'folium',
        'streamlit',
        'dash',
        'pyproj',
        'scipy',
        'statsmodels',
        'yaml',
    ]
    
    failed = []
    for package in packages:
        try:
            __import__(package)
            print(f"✓ {package}")
        except ImportError as e:
            print(f"✗ {package} - {e}")
            failed.append(package)
    
    if failed:
        print(f"\nFailed to import: {', '.join(failed)}")
        return False
    else:
        print("\nAll packages imported successfully!")
        return True

def check_python_version():
    """Check Python version."""
    version = sys.version_info
    print(f"Python version: {version.major}.{version.minor}.{version.micro}")
    if version.major == 3 and version.minor == 12:
        print("✓ Python 3.12 confirmed")
        return True
    else:
        print("✗ Expected Python 3.12")
        return False

if __name__ == "__main__":
    print("="*50)
    print("Environment Setup Verification")
    print("="*50 + "\n")
    
    python_ok = check_python_version()
    print("\n" + "-"*50 + "\n")
    imports_ok = check_imports()
    
    print("\n" + "="*50)
    if python_ok and imports_ok:
        print("Setup verification completed successfully!")
    else:
        print("Setup verification failed. Please check errors above.")
    print("="*50)

