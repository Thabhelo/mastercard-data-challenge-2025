# Reducing Income Inequality in Talladega County, Alabama

## Overview

A comprehensive data-driven solution for addressing income inequality and improving financial inclusion in Talladega County, Alabama, with a focus on Census Tract 105 (FIPS: 01121010500), which scores 23 on the IGS scale, well below the 45 threshold for financial inclusion.

**Competition:** Mastercard Data Challenge 2025 - Turn Data Into Impact

## Project Goals

- Analyze income inequality and Inclusive Growth Score (IGS) gaps in Talladega County census tracts
- Identify proven interventions through comparative analysis (Tract 105 vs Tract 1100)
- Develop evidence-based strategies across 6 intervention pillars
- Provide interactive visualizations and quantifiable impact projections

## The Problem

Census Tract 105 faces severe economic challenges:
- **IGS Score: 23** (Target: Above 45)
- **Population:** ~2,953 residents
- **Median Income:** $27,828 (below county and state averages)
- **Key Gaps:** Digital infrastructure (50-point deficit), entrepreneurship (32-point deficit), housing affordability (33-point deficit)

## Our Approach

We use comparative analysis between Census Tract 105 (IGS: 23) and Census Tract 1100 (IGS: 50) within the same county to identify proven interventions that can raise inclusive growth scores.

### Strategic Intervention Pillars

1. **Digital Infrastructure** - Broadband expansion, digital literacy, device access
2. **Workforce Development** - Sector-aligned training, apprenticeships, adult education
3. **Entrepreneurship** - Micro-loans, business incubators, minority/women-owned business support
4. **Housing & Transportation** - Affordable housing, transit system, mobility solutions
5. **Health & Wellbeing** - Health insurance coverage, preventive care, wellness programs
6. **Policy & Income** - Living wage advocacy, tax incentives, federal funding coordination

## Data Sources

### Primary Data
- **Mastercard Inclusive Growth Score (IGS)** - 8 census tracts in Talladega County (2017-2024)
  - Time series analysis showing 27-point gap between Tract 105 and Tract 1100
  - Comprehensive metrics across Place, Economy, and Community dimensions

### Augmentation Data (Planned)
- **U.S. Census ACS** - Demographics, income, education, employment
- **FCC Broadband Data** - Internet access and adoption rates
- **Bureau of Labor Statistics** - Wage data by sector
- **HUD Housing Data** - Affordability and subsidy programs
- **Alabama State Data** - Health outcomes, business registrations

## Project Structure

```
.
├── data/
│   ├── igs_talladega_tracts.csv          # IGS data (2017-2024)
│   └── tract_comparison.json             # Analysis output for frontend
├── src/
│   └── analysis/
│       └── tract_comparison.py           # Comparative analysis script
├── frontend/                             # React dashboard
│   ├── src/
│   │   ├── components/
│   │   │   ├── TractComparisonDashboard.jsx
│   │   │   ├── TimeSeriesComparison.jsx
│   │   │   ├── StrategyPillarsView.jsx
│   │   │   └── InterventionRecommendations.jsx
│   │   └── App.jsx
│   └── public/
│       └── data/                         # Data files for frontend
├── docs/
│   ├── data_augmentation_plan.md         # Augmentation strategy
│   └── presentation_outline.md           # 10-slide presentation plan
└── requirements.txt                      # Python dependencies
```

## Installation

```bash
# Clone the repository
git clone https://github.com/Thabhelo/mastercard-data-challenge-2025.git
cd mastercard-data-challenge-2025

# Python setup
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
cd frontend
npm install
```

## Usage

### Run Analysis
```bash
# Generate tract comparison data
python src/analysis/tract_comparison.py
```

Output:
- Comparative metrics for Tract 105 vs Tract 1100
- Strategic pillar gap analysis
- JSON export for dashboard: `frontend/public/data/tract_comparison.json`

### Launch Dashboard
```bash
cd frontend
npm run dev
```
Access at: http://localhost:5173

### Dashboard Features
- Side-by-side tract comparison cards
- IGS time series trends (2017-2024)
- Strategic pillar gap visualization (6 dimensions)
- Evidence-based intervention recommendations
- Priority scoring and impact estimates

## Key Findings

**Digital Infrastructure Gap: 50 points**
- Only 38% broadband access in Tract 105 vs 88% in Tract 1100
- ACP awareness below 20%

**Entrepreneurship Gap: 32 points**
- Minority/Women-owned business score disparity
- Limited access to capital and business support

**Housing Affordability Gap: 33 points**
- Housing cost burden: 45% of income vs 28% in Tract 1100
- Limited transit options (27.5 min average commute)

**Workforce Gap: 6.8 points**
- Skills mismatch despite manufacturing job availability
- Low labor market engagement

## Intervention Impact Projections

**Year 1 (Digital + Entrepreneurship):** +13-20 IGS points
- Connect 300+ households to broadband
- Launch 15-20 new minority/women-owned businesses
- Establish digital literacy programs

**Year 2 (Housing + Workforce):** +10-15 IGS points
- Create 50+ affordable housing units
- Deploy sector-aligned training programs
- Launch county-wide transit system

**Year 3 (Sustainability):** Target IGS > 50
- Scale successful interventions
- Measure outcomes and adjust strategy

## Methodology

### Analysis Techniques
- **Time series analysis** - 8-year trend identification (2017-2024)
- **Comparative analysis** - Tract 105 vs Tract 1100 gap analysis
- **Correlation analysis** - IGS drivers and causal pathways
- **Evidence-based prioritization** - Proven interventions from Tract 1100

## Competition Alignment

**Scoring Criteria:**
- **Augmentation (7 pts):** 6+ credible data sources planned
- **Analysis Richness (6 pts):** Time series, correlation, gap analysis, recommendations
- **Practicality (4 pts):** Quantified, actionable interventions with timelines and impact estimates
- **Visualization Novelty (3 pts):** Interactive React dashboard with strategic pillars view
- **Presentation (5 pts):** 10-slide deck with data story and C-suite focus

## License

MIT License

## Roadmap

- [x] Phase 1: Project initialization and data acquisition
- [x] Phase 2: Exploratory analysis and tract comparison
- [x] Phase 3: Strategic intervention pillar development
- [x] Phase 4: Interactive dashboard development
- [ ] Phase 5: Data augmentation with external sources
- [ ] Phase 6: Impact projection modeling and validation

## Acknowledgments

- Mastercard Center for Inclusive Growth
- U.S. Census Bureau American Community Survey
- FCC Broadband Data
- Bureau of Labor Statistics
- HUD Housing Data
- Talladega County community stakeholders

## Contact

For questions or collaboration inquiries, please open an issue in this repository.
