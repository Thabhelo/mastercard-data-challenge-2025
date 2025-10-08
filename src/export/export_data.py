"""Export processed data to JSON for dashboard consumption."""

import json
from pathlib import Path

OUTPUT_DIR = Path(__file__).parent.parent.parent / 'dashboard' / 'data'
OUTPUT_DIR.mkdir(exist_ok=True)

def export_overview_stats():
    """Export overview statistics."""
    stats = {
        'totalEvents': 0,
        'highRiskCounties': 0,
        'avgIGS': 0.0,
        'totalDamage': 0.0
    }
    
    output_file = OUTPUT_DIR / 'overview-stats.json'
    with open(output_file, 'w') as f:
        json.dump(stats, f, indent=2)
    
    print(f'Exported overview stats to {output_file}')

def export_county_risk():
    """Export county-level risk data."""
    county_data = []
    
    output_file = OUTPUT_DIR / 'county-risk.json'
    with open(output_file, 'w') as f:
        json.dump(county_data, f, indent=2)
    
    print(f'Exported county risk data to {output_file}')

def export_time_series():
    """Export time series data."""
    time_series = []
    
    output_file = OUTPUT_DIR / 'time-series.json'
    with open(output_file, 'w') as f:
        json.dump(time_series, f, indent=2)
    
    print(f'Exported time series data to {output_file}')

def export_vulnerability():
    """Export vulnerability correlation data."""
    vulnerability = []
    
    output_file = OUTPUT_DIR / 'vulnerability.json'
    with open(output_file, 'w') as f:
        json.dump(vulnerability, f, indent=2)
    
    print(f'Exported vulnerability data to {output_file}')

if __name__ == '__main__':
    export_overview_stats()
    export_county_risk()
    export_time_series()
    export_vulnerability()
    print('All data exported successfully')

