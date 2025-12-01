# IGS Prediction Model - Backend Documentation

## Overview

This directory contains the machine learning components for predicting future Inclusive Growth Scores (IGS) for census tracts in Talladega County, Alabama.

## Components

### 1. `predict_future_igs.py`

The main prediction module implementing a Ridge regression model.

**Key Features:**
- Trains on historical IGS data combined with ACS (American Community Survey) demographic features
- Supports intervention modeling (digital access, housing, entrepreneurship, workforce)
- Predicts 1-15 years into the future
- Automatic model persistence with joblib

**Usage:**

```python
from analysis.predict_future_igs import IGSPredictor

# Initialize predictor
predictor = IGSPredictor()

# Train model (if not already trained)
predictor.train_model(alpha=1.0)

# Make predictions
predictions = predictor.predict(
    tract='1121010500',
    interventions=['digital', 'housing'],
    years_ahead=5
)

print(predictions)  # [27.48, 28.16, 28.81, 29.45, 30.10]
```

**Convenience Function:**

```python
from analysis.predict_future_igs import predict_igs_tract

predictions = predict_igs_tract('1121010500', ['digital', 'housing'], 5)
```

### 2. `validate_data.py`

Data validation utility to ensure data quality and integrity.

**Features:**
- Validates FIPS code format (10 digits for IGS, 11 for ACS)
- Checks for missing values and duplicates
- Validates value ranges for percentages and scores
- Provides detailed error reports

**Usage:**

```bash
python src/analysis/validate_data.py
```

### 3. `clean_data.py`

Data cleaning utility to normalize and clean data files.

**Features:**
- Normalizes FIPS codes with proper leading zeros
- Removes duplicate records
- Handles missing values
- Creates automatic backups before cleaning
- Preserves leading zeros with CSV quoting

**Usage:**

```bash
python src/analysis/clean_data.py
```

### 4. Model Files

- `model_predict_igs.joblib`: Trained Ridge regression model with feature list

## Model Architecture

### Features Used

The model uses 13 ACS demographic features:

1. **Economic Indicators:**
   - median_household_income
   - per_capita_income
   - poverty_rate
   - gini_index

2. **Employment:**
   - unemployment_rate
   - labor_force_participation_rate

3. **Housing:**
   - housing_cost_burden_rate
   - median_home_value

4. **Digital Access:**
   - broadband_access_rate
   - computer_access_rate

5. **Demographics:**
   - white_alone_pct
   - black_alone_pct
   - hispanic_latino_pct

### Model Input

For each prediction step:
- Current year
- 13 ACS features (potentially modified by interventions)
- Previous IGS score

### Intervention Modeling

The model supports four types of interventions:

1. **Digital Access** (`digital`)
   - +6% broadband access
   - +5% computer access

2. **Housing** (`housing`)
   - -5% housing cost burden
   - +5% median home value

3. **Entrepreneurship** (`entrepreneurship`)
   - +7% per capita income
   - +5% median household income

4. **Workforce Development** (`workforce`)
   - +5% labor force participation
   - -3% unemployment

### Training Process

The model is trained on year-to-year transitions:
1. For each census tract, extract time series of IGS scores
2. Create training examples: (year, features, current_igs) → next_igs
3. Train Ridge regression with alpha=1.0
4. Save model to joblib file

## API Endpoint

The model is exposed via a serverless function at `frontend/api/predict.py`.

### Endpoint: `/api/predict`

**Methods:** GET, POST

**Request (POST):**

```json
{
  "tract": "1121010500",
  "interventions": ["digital", "housing"],
  "years_ahead": 5
}
```

**Request (GET):**

```
/api/predict?tract=1121010500&interventions=digital&interventions=housing&years_ahead=5
```

**Response:**

```json
{
  "success": true,
  "tract": "1121010500",
  "interventions": ["digital", "housing"],
  "years_ahead": 5,
  "predictions": [27.48, 28.16, 28.81, 29.45, 30.10],
  "years": [1, 2, 3, 4, 5]
}
```

**Error Response:**

```json
{
  "success": false,
  "error": "Error message"
}
```

## Data Requirements

### IGS Data (`data/igs_talladega_tracts.csv`)

Required columns:
- `Census Tract FIPS code`: 10-digit FIPS code
- `Year`: Year of observation
- `Inclusive Growth Score`: Score value (0-100)

### ACS Data (`data/acs_talladega_tracts.csv`)

Required columns:
- `tract_fips`: 11-digit FIPS code
- All 13 feature columns listed above

## Deployment

### Local Development

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Clean and validate data:
```bash
python src/analysis/clean_data.py
python src/analysis/validate_data.py
```

3. Train model:
```bash
python train_model.py
```

4. Test locally:
```bash
python -c "from src.analysis.predict_future_igs import predict_igs_tract; print(predict_igs_tract('1121010500', ['digital'], 5))"
```

### Vercel Deployment

The frontend includes everything needed for Vercel deployment:

1. Model training happens during build (see `frontend/train_model.py`)
2. API function at `frontend/api/predict.py`
3. Configuration in `frontend/vercel.json`

Requirements file: `frontend/requirements.txt`

## Model Performance

The model is trained on historical year-to-year transitions. Given the limited training data (14 samples from 2 tracts over multiple years), the model:

- Captures basic trends in IGS evolution
- Models the impact of demographic features on score changes
- Provides reasonable projections for policy planning

**Limitations:**
- Small training dataset (only 2 census tracts with time series)
- Linear model may not capture complex non-linear effects
- Intervention impacts are modeled as fixed deltas

## Troubleshooting

### Common Issues

1. **FIPS Code Format Errors**
   - Solution: Run `python src/analysis/clean_data.py` to normalize codes

2. **Model Not Found**
   - Solution: Run `python train_model.py` to train the model

3. **Import Errors in API**
   - Check that paths are correct in `frontend/api/predict.py`
   - Ensure model file exists in `frontend/src/model_predict_igs.joblib`

4. **Data Validation Failures**
   - Run `python src/analysis/validate_data.py` for detailed error report
   - Check data file formats and column names

## Future Enhancements

1. **Model Improvements:**
   - Expand training data to more census tracts
   - Try ensemble methods (Random Forest, Gradient Boosting)
   - Add cross-validation and hyperparameter tuning
   - Implement confidence intervals for predictions

2. **Feature Engineering:**
   - Add temporal features (trend, seasonality)
   - Create interaction features between demographics
   - Add external data sources (business statistics, education data)

3. **Intervention Modeling:**
   - Learn intervention effects from historical data
   - Model intervention costs and ROI
   - Add time-dependent intervention effects
   - Support custom intervention scenarios

4. **Production Features:**
   - Add model versioning
   - Implement A/B testing framework
   - Add monitoring and logging
   - Create automated retraining pipeline

## Contact

For questions or issues, please refer to the main project README.

