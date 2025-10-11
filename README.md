# Healthcare Desert Analysis - Talladega County, Alabama

## The Problem: "Deserts of Care"

**Healthcare deserts** are neighborhoods where residents face severe barriers to accessing healthcare, even when facilities exist nearby. These barriers include:

- **Geographic isolation**: Long drive times to nearest hospitals/clinics
- **Economic barriers**: High uninsured rates and income inequality  
- **Infrastructure gaps**: Limited transportation and commercial diversity
- **Social vulnerability**: Communities with compounding disadvantages

## Our Discovery: Dramatic Disparities Within a Single County

Using **Mastercard's Inclusive Growth Score (IGS)** data, we discovered that **Talladega County, Alabama** contains both severe healthcare deserts and areas with adequate access—all within the same county boundaries.

**Key Finding**: IGS scores range from **21 to 56** (35-point difference) across 8 census tracts, proving healthcare deserts exist even within single counties.

## Project Goals

- **Identify healthcare deserts** within Talladega County using IGS + accessibility metrics
- **Calculate accessibility scores** (distance/drive-time to nearest healthcare facilities)
- **Build composite Health Desert Index** combining socioeconomic and geographic factors
- **Create interactive map** showing intra-county disparities for policy intervention

## Data Sources

### ✅ Complete
- **Mastercard Inclusive Growth Score (IGS)**: 8 census tracts in Talladega County (2017-2024)
  - Health insurance coverage, Gini coefficient, commercial diversity, labor engagement
  - **35-point disparity**: Tract 1121010500 (24.0) vs Tract 1121010400 (50.6)

### 🔄 In Progress  
- **Healthcare facilities**: CMS hospitals, HRSA clinics, pharmacies in Talladega County
- **Tract boundaries**: Census TIGER/Line shapefiles for mapping
- **Accessibility analysis**: Distance/drive-time calculations to nearest facilities

## Project Structure

```
.
├── data/                                    # All data files
│   ├── igs_talladega_tracts.csv            # ✅ Complete IGS data (8 tracts)
│   ├── tl_2023_01_tract.zip               # 🔄 Alabama tract boundaries  
│   └── [facilities data pending]           # 🔄 Healthcare facilities
├── notebooks/
│   └── healthcare_desert_analysis.ipynb    # ✅ Complete analysis framework
├── frontend/                               # ✅ React app with Mapbox GL
├── src/                                    # ✅ Python utilities
├── config.yaml                             # ✅ Talladega County configuration
└── requirements.txt                        # ✅ Dependencies
```

## Installation

```bash
# Clone the repository
git clone https://github.com/Thabhelo/mastercard-data-challenge-2025.git
cd mastercard-data-challenge-2025

# Switch to healthcare desert branch
git checkout healthcare-desert-pivot

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Set up frontend
cd frontend
npm install
```

## Usage

### Data Analysis
```bash
# Launch Jupyter notebook
jupyter notebook notebooks/healthcare_desert_analysis.ipynb
```

The notebook contains:
- ✅ **IGS data analysis** (8 tracts, 35-point disparity)
- 🔄 **Healthcare facilities collection** (manual download instructions)
- 🔄 **Accessibility calculations** (distance/drive-time to facilities)
- 🔄 **Health Desert Index** (composite scoring)

### Frontend Dashboard
```bash
cd frontend
npm run dev
```
Open http://localhost:5173 to view the interactive map.

## Methodology

### Health Desert Index Formula
```
Desert_Score = w1*(Accessibility_Score) + w2*(Economic_Score) + w3*(Coverage_Score)

Where:
- Accessibility_Score = normalized(min_drive_time) [0-100, higher = worse]
- Economic_Score = normalized(Gini + Poverty_Rate - Median_Income) [0-100]  
- Coverage_Score = 100 - Insurance_Coverage_Pct
- Weights: w1=0.4, w2=0.3, w3=0.3
```

### Classification Thresholds
- **0-25**: Low desert severity (adequate access)
- **26-50**: Moderate desert  
- **51-75**: High desert (intervention priority)
- **76-100**: Extreme desert (urgent action needed)

### Key Insights from Talladega County
- **35-point IGS disparity** across 8 tracts (21-56 range)
- **Tract 1121010500**: Most vulnerable (avg IGS: 24.0)
- **Tract 1121010400**: Least vulnerable (avg IGS: 50.6)
- **Intra-county analysis** reveals healthcare deserts exist within single counties

## Key Features

- **Intra-county healthcare desert identification** using IGS + accessibility metrics
- **35-point disparity analysis** within Talladega County, Alabama
- **Interactive Mapbox visualization** showing tract-level desert severity
- **Policy intervention targeting** for mobile clinics and outreach programs

## Roadmap

- [x] ✅ **IGS data collection** (8 tracts, 35-point disparity identified)
- [x] ✅ **Project structure** and analysis framework
- [ ] 🔄 **Healthcare facilities data** (hospitals, clinics, pharmacies)
- [ ] 🔄 **Accessibility calculations** (distance/drive-time to facilities)
- [ ] 🔄 **Health Desert Index** (composite scoring algorithm)
- [ ] 🔄 **Interactive map** (Mapbox GL visualization)
- [ ] 🔄 **Policy recommendations** (targeted intervention strategies)

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

