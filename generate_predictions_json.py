import json
import sys
import os
from itertools import combinations

# Add project root to path
REPO_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, REPO_ROOT)

try:
    from ml.models.constrained_predictor import ConstrainedIGSPredictor
    print("Using ConstrainedIGSPredictor")
except ImportError:
    from src.analysis.predict_future_igs import IGSPredictor as ConstrainedIGSPredictor
    print("Using IGSPredictor")

def generate_all_scenarios():
    predictor = ConstrainedIGSPredictor()
    try:
        predictor.load()
    except:
        predictor.load_model()
    
    tract_id = "1121010500"
    years_ahead = 5
    interventions_list = ["digital", "housing", "entrepreneurship", "workforce"]
    
    results = {}
    
    # Generate for all combinations
    for r in range(len(interventions_list) + 1):
        for combo in combinations(interventions_list, r):
            combo_key = ",".join(sorted(combo))
            preds = predictor.predict(tract_id, list(combo), years_ahead)
            # Convert numpy floats to python floats
            results[combo_key] = [float(round(p, 2)) for p in preds]
            
    # Also store baseline separately for convenience
    baseline = results[""]
    
    output = {
        "tract": tract_id,
        "years": [1, 2, 3, 4, 5],
        "baseline": baseline,
        "scenarios": results
    }
    
    os.makedirs("web/public/data", exist_ok=True)
    with open("web/public/data/predictions_105.json", "w") as f:
        json.dump(output, f, indent=2)
    
    print("Generated predictions_105.json")

if __name__ == "__main__":
    generate_all_scenarios()

