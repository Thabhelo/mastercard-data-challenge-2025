# Healthcare Desert Analysis (Mississippi & Alabama)

## Overview

A data-first project to identify and explain "Deserts of Care"—neighborhoods with poor access to healthcare—by combining Inclusive Growth Score (IGS) metrics, Census/ACS indicators, and healthcare facility accessibility. Primary focus: Mississippi and Alabama.

## Project Goals

- Measure healthcare accessibility at census-tract level (drive-time/distance to facilities)
- Link accessibility with IGS metrics (insurance coverage, income inequality, commercial diversity)
- Build a composite Health Desert Index and predictive model for desert severity
- Deliver an interactive React (Vite) dashboard with Mapbox GL visualization

## Data Sources

- **Mastercard Inclusive Growth Score (IGS)**: tract-level insurance coverage, Gini, commercial diversity, labor metrics
- **Census/ACS 5-year**: B27020 (insurance), B19083 (Gini), B19013 (income), B17001 (poverty)
- **Healthcare facilities**: CMS Hospital General Info; HRSA Health Centers; pharmacy datasets
- **HPSA**: HRSA shortage areas (validation)
- **Census TIGER/Line**: tract boundaries; OpenStreetMap roads (for drive-time)

## Project Structure

```
.
├── data/
│   ├── raw/              # Raw data from sources
│   ├── processed/        # Cleaned and merged datasets
│   └── external/         # External reference data
├── notebooks/            # Jupyter notebooks for analysis
├── src/
│   ├── data/            # Data processing scripts
│   ├── models/          # ML model implementations
│   ├── visualization/   # Visualization components
│   └── utils/           # Utility functions
├── dashboard-react/     # Vite + React dashboard (Mapbox GL)
├── tests/               # Unit tests
└── docs/                # Documentation

```

## Installation

```bash
# Clone the repository
git clone https://github.com/Thabhelo/mastercard-data-challenge-2025.git
cd mastercard-data-challenge-2025

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

## Usage

### Notebooks (analysis pipeline)
- `notebooks/01_data_collection_healthcare.ipynb`
- `notebooks/02_exploratory_analysis.ipynb`
- `notebooks/03_desert_index_modeling.ipynb`
- `notebooks/04_spatial_analysis.ipynb`

### React Dashboard (Vite)
```bash
cd dashboard-react
npm install
npm run dev
```

## Methodology

### Data Processing
- Join IGS/ACS tract metrics with facility accessibility
- Normalize metrics and compute composite Health Desert Index
- Prepare tract GeoJSON with attributes for the dashboard

### Machine Learning Pipeline
- Predict Desert Severity from IGS + accessibility features (baseline regression, Random Forest)
- Validate against HPSA and hold-out state

### Visualization
- Mapbox GL choropleth of Health Desert Index at tract level
- Facility markers, 30-minute isochrones (optional)
- Correlation and feature-importance charts

## Key Features

- Healthcare access measurement via distance/drive-time
- Integration of IGS metrics (insurance, inequality, diversity)
- Tract-level desert classification and model explainability
- Interactive dashboard for prioritizing interventions

## Roadmap

- [x] Pivot branch scaffolding
- [ ] Collect IGS/ACS and facility data (MS/AL)
- [ ] Build Health Desert Index and baseline model
- [ ] Export GeoJSON and wire Mapbox choropleth
- [ ] Insights and policy brief

## Contributing

This project is part of the Mastercard Data Challenge 2025.

## License

MIT License

## Contact

For questions or collaboration inquiries, please open an issue in this repository.

## Acknowledgments

- Mastercard Inclusive Growth Score
- U.S. Census Bureau (ACS)
- CMS, HRSA datasets

