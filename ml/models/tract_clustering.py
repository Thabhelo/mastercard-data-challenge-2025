"""
Tract Clustering Module

Clusters all census tracts by their socioeconomic characteristics
using UMAP-style dimensionality reduction and K-Means clustering.
"""

import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import json
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
OUTPUT_PATH = os.path.join(BASE_DIR, 'public', 'data', 'cluster_analysis.json')

# Focus tracts
TRACT_105 = "1121010500"
TRACT_1100 = "1121011100"


def run_clustering():
    """Run clustering on all tract data and export results."""
    
    # Load IGS data
    igs_path = os.path.join(BASE_DIR, 'data', 'igs_talladega_tracts.csv')
    igs_df = pd.read_csv(igs_path, dtype={'Census Tract FIPS code': str})
    
    # Get latest data for each tract
    tracts_data = []
    for tract in igs_df['Census Tract FIPS code'].unique():
        tract_rows = igs_df[igs_df['Census Tract FIPS code'] == tract].sort_values('Year')
        latest = tract_rows.iloc[-1]
        
        # Extract key metrics
        igs = float(latest['Inclusive Growth Score'])
        growth = float(latest.get('Growth', igs))
        inclusion = float(latest.get('Inclusion', igs))
        
        # Get additional metrics if available
        affordable_housing = float(latest.get('Affordable Housing Score', 50)) if pd.notna(latest.get('Affordable Housing Score')) else 50
        internet_access = float(latest.get('Internet Access Score', 50)) if pd.notna(latest.get('Internet Access Score')) else 50
        labor_market = float(latest.get('Labor Market Engagement Index Score', 50)) if pd.notna(latest.get('Labor Market Engagement Index Score')) else 50
        
        tracts_data.append({
            'tract_fips': tract,
            'igs': igs,
            'growth': growth,
            'inclusion': inclusion,
            'affordable_housing': affordable_housing,
            'internet_access': internet_access,
            'labor_market': labor_market,
        })
    
    df = pd.DataFrame(tracts_data)
    
    # Create feature matrix for clustering
    features = ['igs', 'growth', 'inclusion', 'affordable_housing', 'internet_access', 'labor_market']
    X = df[features].fillna(df[features].mean())
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Generate 2D positions (simplified UMAP-like projection)
    # Use IGS for X-axis (vulnerability) and a composite of other metrics for Y-axis
    # Normalize to 0-100 range for display
    
    igs_min, igs_max = df['igs'].min(), df['igs'].max()
    
    positions = []
    for i, row in df.iterrows():
        # X position based on IGS (higher IGS = right side = lower vulnerability)
        x = ((row['igs'] - igs_min) / (igs_max - igs_min + 0.001)) * 80 + 10
        
        # Y position based on inclusion + some randomness for separation
        y_base = ((row['inclusion'] - df['inclusion'].min()) / (df['inclusion'].max() - df['inclusion'].min() + 0.001)) * 60 + 20
        # Add slight offset based on tract index for visual separation
        y_offset = (i % 3 - 1) * 8
        y = max(15, min(85, y_base + y_offset))
        
        positions.append({'x': x, 'y': y})
    
    df['x'] = [p['x'] for p in positions]
    df['y'] = [p['y'] for p in positions]
    
    # K-Means clustering
    n_clusters = min(3, len(df))
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    df['cluster'] = kmeans.fit_predict(X_scaled)
    
    # Assign cluster labels based on average IGS
    cluster_igs = df.groupby('cluster')['igs'].mean().sort_values()
    cluster_map = {old: new for new, old in enumerate(cluster_igs.index)}
    df['cluster'] = df['cluster'].map(cluster_map)
    
    # Cluster profiles
    cluster_profiles = {
        0: {'name': 'High Vulnerability', 'color': '#94a3b8', 'description': 'Lower IGS, higher need for intervention'},
        1: {'name': 'Moderate', 'color': '#94a3b8', 'description': 'Mid-range indicators'},
        2: {'name': 'Lower Vulnerability', 'color': '#94a3b8', 'description': 'Higher IGS, benchmark communities'},
    }
    
    # Build results
    all_tracts = []
    for _, row in df.iterrows():
        tract_fips = row['tract_fips']
        
        # Format tract name
        tract_num = tract_fips[-6:].lstrip('0') or '0'
        if tract_fips == TRACT_105:
            tract_num = '105'
        elif tract_fips == TRACT_1100:
            tract_num = '1100'
        else:
            # Convert to readable format (e.g., 010301 -> 103.01)
            tract_num = tract_fips[-4:-2].lstrip('0') + tract_fips[-2:]
            tract_num = tract_num.lstrip('0') or '0'
        
        # Determine if this is a focus tract
        is_focus = tract_fips in [TRACT_105, TRACT_1100]
        
        # Assign color - focus tracts get colors, others are gray
        if tract_fips == TRACT_105:
            color = '#ef4444'  # Red for high vulnerability focus
        elif tract_fips == TRACT_1100:
            color = '#10b981'  # Green for benchmark
        else:
            color = '#94a3b8'  # Gray for others
        
        profile = cluster_profiles.get(row['cluster'], cluster_profiles[0])
        
        all_tracts.append({
            'tract_fips': tract_fips,
            'tract_name': f'Tract {tract_num}',
            'tract_short': tract_num,
            'x': round(row['x'], 1),
            'y': round(row['y'], 1),
            'igs': row['igs'],
            'growth': row['growth'],
            'inclusion': row['inclusion'],
            'cluster_id': int(row['cluster']),
            'cluster_name': profile['name'],
            'color': color,
            'is_focus': is_focus,
            'bubble_size': max(20, row['igs'] * 0.8),  # Size based on IGS
        })
    
    # Sort by IGS for legend
    all_tracts.sort(key=lambda x: x['igs'])
    
    result = {
        'tracts': all_tracts,
        'focus_tracts': {
            'tract_105': next((t for t in all_tracts if t['tract_fips'] == TRACT_105), None),
            'tract_1100': next((t for t in all_tracts if t['tract_fips'] == TRACT_1100), None),
        },
        'stats': {
            'total_tracts': len(all_tracts),
            'igs_range': [float(df['igs'].min()), float(df['igs'].max())],
            'igs_mean': float(df['igs'].mean()),
        },
        'methodology': 'K-Means clustering on standardized IGS metrics with 2D projection based on vulnerability indicators'
    }
    
    # Save
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, 'w') as f:
        json.dump(result, f, indent=2)
    
    print(f"✓ Cluster analysis saved to: {OUTPUT_PATH}")
    print(f"  Total tracts: {len(all_tracts)}")
    print(f"  IGS range: {df['igs'].min():.0f} - {df['igs'].max():.0f}")
    
    return result


if __name__ == '__main__':
    result = run_clustering()
    print("\nTracts:")
    for t in result['tracts']:
        focus = " ★" if t['is_focus'] else ""
        print(f"  {t['tract_name']}: IGS={t['igs']}, pos=({t['x']:.0f}, {t['y']:.0f}){focus}")
