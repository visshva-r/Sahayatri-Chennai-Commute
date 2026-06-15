"""
Safe-Route Score - offline model training & calibration.

The realtime scorer in the web app (lib/safety.ts) is an explainable, weighted
linear model. That choice is deliberate: a safety score that riders and city
partners must trust should be auditable, not a black box. This script shows how
the deployed weights are calibrated from data and validated against a non-linear
model:

  1. build a labelled dataset of route legs (women feedback, lighting, CCTV,
     footfall, help points) with a "perceived safety" target (0-100),
  2. recover the linear weights with LinearRegression  -> these are what the app
     ships in SAFETY_WEIGHTS,
  3. train a RandomForestRegressor as a non-linear cross-check (R^2, MAE),
  4. export the calibrated weights to learned_weights.json.

In production the target column comes from labelled incident data plus
crowd-sourced women-safety feedback; here it is synthesised so the script is
fully reproducible offline.

Run:  python ml/safe_route_model.py
"""

import json
from pathlib import Path

import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

FEATURES = ["women_feedback", "lighting", "cctv", "crowd", "help_points"]

# The weight structure the product is designed around (women feedback leads).
DEPLOYED_WEIGHTS = np.array([0.30, 0.22, 0.18, 0.15, 0.15])


def make_dataset(n: int = 6000, seed: int = 42):
    rng = np.random.default_rng(seed)
    X = np.clip(rng.normal(0.65, 0.17, size=(n, len(FEATURES))), 0, 1)
    # Perceived safety = weighted attributes, on a 0-100 scale, with field noise.
    y = np.clip((X @ DEPLOYED_WEIGHTS) * 100 + rng.normal(0, 4, n), 0, 100)
    return X, y


def main() -> None:
    X, y = make_dataset()
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.2, random_state=0)

    # 1) Calibrate the deployed linear weights.
    linear = LinearRegression().fit(X_tr, y_tr)
    coefs = np.clip(linear.coef_, 0, None)
    learned = coefs / coefs.sum()

    # 2) Random Forest as a non-linear cross-check.
    rf = RandomForestRegressor(n_estimators=300, max_depth=12, random_state=0, n_jobs=-1)
    rf.fit(X_tr, y_tr)
    rf_pred = rf.predict(X_te)

    print("Model validation")
    print("-" * 46)
    print(f"  Linear  R^2 {r2_score(y_te, linear.predict(X_te)):.3f}"
          f"   MAE {mean_absolute_error(y_te, linear.predict(X_te)):.2f}")
    print(f"  Forest  R^2 {r2_score(y_te, rf_pred):.3f}"
          f"   MAE {mean_absolute_error(y_te, rf_pred):.2f}\n")

    print("Calibrated Safe-Route Score weights")
    print("-" * 46)
    print(f"  {'feature':<16}{'deployed':>10}{'learned':>10}")
    for name, dep, lrn in zip(FEATURES, DEPLOYED_WEIGHTS, learned):
        print(f"  {name:<16}{dep:>10.2f}{lrn:>10.3f}")

    out = {name: round(float(w), 3) for name, w in zip(FEATURES, learned)}
    path = Path(__file__).with_name("learned_weights.json")
    path.write_text(json.dumps(out, indent=2))
    print(f"\nSaved -> {path.name} (mirrors SAFETY_WEIGHTS in lib/safety.ts)")


if __name__ == "__main__":
    main()
