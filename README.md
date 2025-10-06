# Disaster Risk Management in the U.S. South: Data-Driven Roadmap

## Overview

A comprehensive data-driven solution for disaster risk assessment in southern U.S. states, integrating hazard data with socioeconomic indicators to identify vulnerable communities and inform resilience strategies.

## Project Goals

- Analyze multi-hazard disaster risk across southern states (Florida, Mississippi, Louisiana, Texas, Alabama)
- Integrate Mastercard Inclusive Growth Score (IGS) to identify economically vulnerable communities
- Build predictive ML models for disaster risk assessment
- Provide interactive visualizations for decision-makers and stakeholders

## Data Sources

- **NOAA Storm Events Database (1950-2025)**: Comprehensive severe weather events
- **FEMA Disaster Declarations (OpenFEMA API)**: Federal disaster declarations
- **CDC Social Vulnerability Index (SVI)**: Community vulnerability metrics
- **Mastercard Inclusive Growth Score (IGS)**: Economic health and inclusion indicators
- **Billion-Dollar Disasters Dataset**: Major economic loss events

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
├── models/              # Trained model artifacts
├── dashboard/           # Web dashboard application
├── tests/               # Unit tests
└── docs/                # Documentation

```

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd mastercard-data-challenge-2025

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Usage

### Data Collection
```bash
python src/data/fetch_noaa_data.py
python src/data/fetch_fema_data.py
python src/data/fetch_svi_data.py
```

### Model Training
```bash
python src/models/train_risk_model.py
```

### Run Dashboard
```bash
python dashboard/app.py
```

## Methodology

### Data Processing
- Aggregate disaster events by county and year
- Merge hazard data with socioeconomic indicators
- Create composite vulnerability indices

### Machine Learning Pipeline
- **Predictive Risk Modeling**: Regression models to predict disaster impact metrics
- **Risk Classification**: Classify counties as high-risk vs low-risk
- **Feature Engineering**: Incorporate IGS, SVI, historical event data

### Visualization
- Interactive county-level risk maps
- Time series analysis of disaster trends
- Correlation analysis between vulnerability and impact
- Disaster and county profile pages

## Key Features

- Multi-hazard analysis (hurricanes, tornadoes, floods, severe storms)
- Integration of economic inclusion metrics (IGS)
- Spatial risk assessment at county level
- Predictive modeling for risk estimation
- Interactive web dashboard for exploration

## Roadmap

- [x] Phase 1: Project initialization
- [ ] Phase 2: Data acquisition and processing
- [ ] Phase 3: Exploratory analysis and feature engineering
- [ ] Phase 4: Model development and validation
- [ ] Phase 5: Web dashboard development
- [ ] Phase 6: Testing and deployment

## Contributing

This project is part of the Mastercard Data Challenge 2025.

## License

MIT License

## Contact

For questions or collaboration inquiries, please open an issue in this repository.

## Acknowledgments

- NOAA National Centers for Environmental Information
- FEMA OpenFEMA Initiative
- CDC/ATSDR Social Vulnerability Index
- Mastercard Center for Inclusive Growth

