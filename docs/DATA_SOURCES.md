# Data Sources Documentation

## Primary Data Sources

### 1. NOAA Storm Events Database
**URL**: https://www.ncei.noaa.gov/stormevents/

**Description**: Comprehensive record of U.S. severe weather events (1950-2025)

**Coverage**:
- 48 event types since 1996
- County-level location data
- Event magnitude, date, duration
- Fatalities, injuries
- Property and crop damage estimates

**Format**: CSV files by year and event type

**Update Frequency**: Monthly

### 2. FEMA Disaster Declarations
**URL**: https://www.fema.gov/openfema-data-page/disaster-declarations-summaries-v2

**Description**: Federal disaster declarations (1953-present)

**Coverage**:
- Disaster type (Major Disaster, Emergency, Fire Management)
- Incident type (hurricane, flood, tornado, etc.)
- Declaration date
- Affected counties
- Disaster ID for cross-referencing

**Format**: JSON via API or CSV bulk download

**Update Frequency**: Real-time

### 3. CDC Social Vulnerability Index (SVI)
**URL**: https://www.atsdr.cdc.gov/placeandhealth/svi/

**Description**: County and tract-level vulnerability metrics

**Coverage**:
- 15 U.S. Census variables
- Poverty, unemployment, income
- Housing characteristics
- Minority status, language
- Disability and age factors

**Format**: CSV, Shapefile, GeoJSON

**Update Frequency**: Biennial

### 4. Mastercard Inclusive Growth Score (IGS)
**Description**: Economic health and inclusion metric (0-100 scale)

**Coverage**:
- Census tract level
- 18 socioeconomic indicators
- Measures: place, economy, community, inclusion, growth
- Combines open data with anonymized transaction insights

**Format**: To be determined based on access

**Update Frequency**: Annual

### 5. NOAA Billion-Dollar Disasters
**URL**: https://www.ncei.noaa.gov/access/billions/

**Description**: Major events causing $1B+ losses by state

**Coverage**:
- Event summaries
- Economic impact
- State-level aggregation
- Historical trends (1980-present)

**Format**: CSV, Interactive web tool

**Update Frequency**: Quarterly

## Additional Data Sources

### U.S. Census TIGER/Line Shapefiles
**URL**: https://www.census.gov/geographies/mapping-files/time-series/geo/tiger-line-file.html

**Purpose**: Geographic boundaries for mapping

### NOAA HURDAT2
**URL**: https://www.nhc.noaa.gov/data/hurdat/

**Purpose**: Hurricane track data for exposure analysis

### NOAA Tornado Data
**URL**: https://www.spc.noaa.gov/wcm/

**Purpose**: Tornado path and intensity data

## Data Processing Notes

- All datasets require geographic standardization (FIPS codes)
- Temporal alignment needed for trend analysis
- Missing data handling strategies documented in processing scripts
- Data quality validation checks implemented

