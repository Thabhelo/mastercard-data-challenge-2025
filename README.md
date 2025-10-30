# Reducing Income Inequality in Talladega County, Alabama

## Executive Summary

This project addresses severe income inequality in Census Tract 105 of Talladega County, Alabama, using data-driven comparative analysis to identify proven interventions. By comparing Tract 105 (IGS: 23) with Tract 1100 (IGS: 50) within the same county, we validate disparities and prioritize evidence-based strategies to raise inclusive growth scores above the 45 threshold.

**Key Statistics:**
- **IGS Gap:** 27 points (Tract 105: 23 vs Tract 1100: 50)
- **Income Gap:** $14,456 (42% difference)
- **Poverty:** 2.6x higher in Tract 105 (33.9% vs 13.0%)
- **Unemployment:** 4.4x higher in Tract 105 (25.8% vs 5.9%)
- **Housing Crisis:** 53.9% of Tract 105 renters are cost-burdened

**Solution:** Six-pillar intervention strategy targeting digital infrastructure, workforce development, entrepreneurship, housing affordability, health access, and income policy, projected to raise IGS by 22-35 points over 3 years.

---

## The Problem

### Geographic Context

**Location:** Talladega County, Alabama  
**Target Area:** Census Tract 105 (FIPS: 01121010500)  
**Comparison Area:** Census Tract 1100 (FIPS: 01121011100)

### Crisis Metrics

**Census Tract 105 faces severe economic challenges:**

| Challenge | Tract 105 Status | National Context |
|-----------|------------------|------------------|
| **IGS Score** | 23 (Critical) | Target: >45 for financial inclusion |
| **Population** | ~2,682 residents | Small, vulnerable community |
| **Median Income** | $34,207 | 30% below county average |
| **Poverty Rate** | 33.9% | 2.6x county comparison tract |
| **Unemployment** | 25.8% | 4.4x county comparison tract |
| **Housing Burden** | 53.9% cost-burdened | 3.4x county comparison tract |

### Critical Gaps (vs. Tract 1100)

1. **Digital Infrastructure:** 50-point IGS score deficit
2. **Entrepreneurship:** 32-point deficit in minority/women-owned businesses
3. **Housing Affordability:** 33-point deficit, 38 percentage point cost burden gap
4. **Workforce Development:** 6.8-point gap, 19.9 pp unemployment difference
5. **Income Inequality:** 42% median income gap ($14,456 difference)

## Our Approach

### Comparative Analysis Framework

We use **within-county comparative analysis** to identify proven interventions:

**Why Tract 1100 as Benchmark?**
- Same county (shared economic conditions, services, policies)
- Similar demographic composition (rural Alabama)
- Achieves IGS >50 (financial inclusion threshold)
- Represents attainable target for Tract 105

**Analysis Methodology:**
1. **Time Series Analysis:** 8-year IGS trends (2017-2024)
2. **Gap Analysis:** Identify specific metric disparities
3. **Cross-Validation:** Census ACS data confirms IGS findings
4. **Evidence-Based Prioritization:** Focus on largest, most addressable gaps
5. **Impact Modeling:** Project outcomes based on gap closure

### Strategic Intervention Pillars

**Six interconnected intervention areas:**

1. **Digital Infrastructure** - Foundation for modern economy
2. **Workforce Development** - Skills for available jobs
3. **Entrepreneurship** - Business creation and ownership
4. **Housing & Transportation** - Affordable living and mobility
5. **Health & Wellbeing** - Healthcare access and coverage
6. **Policy & Income** - Living wages and economic support

## Data Sources

### Primary Data: Mastercard Inclusive Growth Score (IGS)

**Source:** Mastercard Center for Inclusive Growth  
**URL:** https://inclusivegrowthscore.com/  
**Coverage:** 8 census tracts in Talladega County, 2017-2024  

**IGS Framework:**
- **Growth Dimension:** Economic expansion (GDP, employment, business creation)
- **Inclusion Dimension:** Equitable distribution (Gini, poverty, access)
- **Three Pillars:** Place, Economy, Community

**Key IGS Metrics:**
- Inclusive Growth Score (0-100 composite)
- Internet Access Score
- Affordable Housing Score
- Labor Market Engagement Index
- Minority/Women Owned Businesses Score
- Small Business Loans Score
- Personal Income Score
- Gini Coefficient Score
- Health Insurance Coverage Score

### Augmentation Data: U.S. Census ACS (2022)

[The American Community Survey (ACS) is a continuous, nationwide survey by the U.S. Census Bureau that provides annual, detailed data on social, economic, housing, and demographic characteristics of the U.S. population.]

**Source:** U.S. Census Bureau API  
**API Endpoint:** https://api.census.gov/data/2022/acs/acs5  

**ACS Variables Collected:**

**Income & Inequality:**
- B19013_001E: Median household income
- B19083_001E: Gini index
- B19301_001E: Per capita income

**Poverty:**
- B17001: Poverty status by demographics
- Derived: Poverty rate

**Education:**
- B15003: Educational attainment distribution
- Derived: HS graduation rate, bachelor's degree rate

**Employment:**
- B23025: Labor force status
- Derived: Unemployment rate, labor force participation

**Housing:**
- B25070: Rent as percentage of household income
- B25077: Median home value
- Derived: Housing cost burden rate

**Digital Access:**
- B28002: Computer and internet subscription
- Derived: Broadband access rate, computer access rate

**Demographics:**
- B01003: Total population
- B01002: Median age
- B02001: Race distribution
- B03003: Hispanic/Latino origin
---

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

## References

### Data Sources

**Mastercard Inclusive Growth Score**
- Mastercard Center for Inclusive Growth. (2024). *Inclusive Growth Score*. Retrieved from https://inclusivegrowthscore.com/
- Methodology: https://www.mastercardcenter.org/insights/inclusive-growth-score-methodology

**U.S. Census Bureau**
- U.S. Census Bureau. (2022). *American Community Survey 5-Year Estimates, 2018-2022*. Retrieved October 30, 2024, from https://api.census.gov/data/2022/acs/acs5
- Documentation: https://www.census.gov/programs-surveys/acs/technical-documentation.html

## Acknowledgments

- **Mastercard Center for Inclusive Growth** - IGS data and methodology
- **U.S. Census Bureau** - American Community Survey data
- **Talladega County, Alabama** - Geographic focus
- **Community Stakeholders** - (Future) implementation partners

---

## License

MIT License - See LICENSE file for details

---

## Contact

For questions, collaboration, or more information:
- **GitHub:** Open an issue at https://github.com/Thabhelo/mastercard-data-challenge-2025
- **Competition:** Mastercard Data Challenge 2025

---

*This documentation provides a comprehensive overview of the entire project from problem identification through technical implementation to expected impact. All data, analysis, and recommendations are evidence-based and actionable*