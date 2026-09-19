"""
Trend Prediction using Linear Regression.
Predicts future values with confidence bands.
Direct Python port of lib/ml/trend-prediction.js
"""
import math
from datetime import datetime, timedelta


def linear_regression(data: list[dict]) -> dict:
    """
    Simple linear regression.

    Args:
        data: List of dicts with 'x' and 'y' keys.

    Returns:
        dict with slope, intercept, r2.
    """
    n = len(data)
    if n < 2:
        return {"slope": 0, "intercept": data[0]["y"] if data else 0, "r2": 0}

    sum_x = sum_y = sum_xy = sum_x2 = sum_y2 = 0.0

    for point in data:
        x, y = point["x"], point["y"]
        sum_x += x
        sum_y += y
        sum_xy += x * y
        sum_x2 += x * x
        sum_y2 += y * y

    denominator = n * sum_x2 - sum_x * sum_x
    if denominator == 0:
        return {"slope": 0, "intercept": sum_y / n, "r2": 0}

    slope = (n * sum_xy - sum_x * sum_y) / denominator
    intercept = (sum_y - slope * sum_x) / n

    # R-squared
    y_mean = sum_y / n
    ss_tot = sum((point["y"] - y_mean) ** 2 for point in data)
    ss_res = sum((point["y"] - (slope * point["x"] + intercept)) ** 2 for point in data)
    r2 = 0.0 if ss_tot == 0 else 1 - ss_res / ss_tot

    return {
        "slope": round(slope, 6),
        "intercept": round(intercept, 4),
        "r2": round(r2, 4),
    }


def prediction_std_error(data: list[dict], slope: float, intercept: float) -> float:
    n = len(data)
    if n < 3:
        return 0.0

    residuals = [point["y"] - (slope * point["x"] + intercept) for point in data]
    sse = sum(r * r for r in residuals)
    return math.sqrt(sse / (n - 2))


def _parse_timestamp(ts) -> datetime:
    """Parse a timestamp that may be a string or datetime."""
    if isinstance(ts, datetime):
        return ts
    return datetime.fromisoformat(str(ts).replace("Z", "+00:00"))


def predict_trend(data: list[dict], months: int = 6) -> dict:
    """
    Predict future trend values.

    Args:
        data: List of dicts with 'timestamp' and 'value' keys.
        months: Number of months to predict ahead.

    Returns:
        dict with predictions, regression info, and trend direction.
    """
    if len(data) < 2:
        return {
            "predictions": [],
            "regression": {"slope": 0, "intercept": 0, "r2": 0},
            "trend": "insufficient_data",
        }

    # Sort by timestamp
    sorted_data = sorted(data, key=lambda d: _parse_timestamp(d["timestamp"]))
    base_time = _parse_timestamp(sorted_data[0]["timestamp"]).timestamp()
    ms_per_month = 30.44 * 24 * 60 * 60  # seconds

    points = [
        {
            "x": (_parse_timestamp(d["timestamp"]).timestamp() - base_time) / ms_per_month,
            "y": d["value"],
        }
        for d in sorted_data
    ]

    reg = linear_regression(points)
    std_error = prediction_std_error(points, reg["slope"], reg["intercept"])

    # Generate predictions
    last_x = points[-1]["x"]
    last_date = _parse_timestamp(sorted_data[-1]["timestamp"])
    predictions = []

    for i in range(1, months + 1):
        future_x = last_x + i
        predicted_y = reg["slope"] * future_x + reg["intercept"]

        # Calculate future date
        future_date = last_date + timedelta(days=30.44 * i)

        predictions.append({
            "timestamp": future_date.isoformat(),
            "value": round(predicted_y, 2),
            "upperBound": round(predicted_y + 1.96 * std_error, 2),
            "lowerBound": round(predicted_y - 1.96 * std_error, 2),
            "monthsAhead": i,
        })

    # Determine trend direction
    slope = reg["slope"]
    if slope > 0.01:
        trend = "increasing"
    elif slope < -0.01:
        trend = "decreasing"
    else:
        trend = "stable"

    rate_per_year = round(slope * 12, 3)
    r2 = reg["r2"]

    return {
        "predictions": predictions,
        "regression": {**reg, "stdError": round(std_error, 4)},
        "trend": trend,
        "ratePerYear": rate_per_year,
        "confidence": "high" if r2 > 0.7 else "medium" if r2 > 0.4 else "low",
    }


def get_trend_line(data: list[dict]) -> list[dict]:
    """Get historical trend line points for charting."""
    sorted_data = sorted(data, key=lambda d: _parse_timestamp(d["timestamp"]))
    base_time = _parse_timestamp(sorted_data[0]["timestamp"]).timestamp()
    ms_per_month = 30.44 * 24 * 60 * 60

    points = [
        {
            "x": (_parse_timestamp(d["timestamp"]).timestamp() - base_time) / ms_per_month,
            "y": d["value"],
        }
        for d in sorted_data
    ]

    reg = linear_regression(points)

    return [
        {
            "timestamp": d["timestamp"],
            "actual": d["value"],
            "trend": round(reg["slope"] * points[i]["x"] + reg["intercept"], 2),
        }
        for i, d in enumerate(sorted_data)
    ]
