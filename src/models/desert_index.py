"""
Compute the Health Desert Index from standardized components.
"""


def compute_desert_score_row(accessibility_score: float, economic_score: float, coverage_score: float,
                              weights=(0.4, 0.3, 0.3)) -> float:
    """Weighted sum of normalized components.

    Returns a score in [0, 100]. Caller must ensure inputs are normalized to [0, 100].
    """
    w1, w2, w3 = weights
    score = w1 * accessibility_score + w2 * economic_score + w3 * coverage_score
    return float(score)


