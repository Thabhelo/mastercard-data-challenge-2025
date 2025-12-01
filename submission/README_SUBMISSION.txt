# Team Tornadoes - Mastercard Data Challenge Submission

## Contents

1. **Sample_submission.csv**
   - Comprehensive timeline containing both historical data (2017-2024) and future model predictions (2025-2029).
   - Includes predictions for "Baseline" (Status Quo) and "Full Intervention" scenarios.

2. **Notebooks/**
   - `Interactive_Analysis.ipynb`: A Jupyter notebook that walks through our data ingestion, visualization of the "Gap", and runs our ML model live to forecast future impact.

3. **Input_Datasets/**
   - Raw and processed datasets used for analysis.
   - `unified_ml_dataset.csv`: The merged training dataset with 78 variables across all sources (IGS, ACS, BLS, HUD, SVI).

4. **Code/**
   - `ml/`: Machine Learning models (Constrained Predictor, Ensemble).
   - `src/`: Data processing and analysis scripts.
   - `api/`: Serverless API for real-time predictions.
   - `train_model.py`: Main script to train models.

## How to Run

1. Install dependencies:
   ```bash
   pip install -r Code/requirements.txt
   ```

2. Run the Interactive Notebook:
   - Open `Notebooks/Interactive_Analysis.ipynb` in Jupyter Lab or VS Code.
   - Run all cells to see the analysis and live predictions.

3. Train model (optional):
   ```bash
   python Code/train_model.py
   ```

4. Generate predictions CSV (optional):
   ```bash
   python Code/generate_full_timeline_csv.py
   ```
