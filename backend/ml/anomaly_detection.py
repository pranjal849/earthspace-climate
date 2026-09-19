"""
Anomaly Detection using Z-score method.
Identifies values that deviate significantly from the mean.
Direct Python port of lib/ml/anomaly-detection.js
"""
import math


def mean(values: list[float]) -> float:
    if not values:
        return 0.0
    return sum(values) / len(values)


def standard_deviation(values: list[float]) -> float:
    if len(values) < 2:
        return 0.0
    avg = mean(values)
    squared_diffs = [(v - avg) ** 2 for v in values]
    return math.sqrt(sum(squared_diffs) / (len(values) - 1))


def detect_anomalies(values: list[float], threshold: float = 2.0) -> dict:
    """
    Detect anomalies using Z-score.

    Args:
        values: Array of numeric values.
        threshold: Z-score threshold (default: 2.0).

    Returns:
        dict with anomalies list and stats.
    """
    if len(values) < 3:
        return {"anomalies": [], "stats": {"mean": 0, "stdDev": 0, "count": len(values)}}

    avg = mean(values)
    std_dev = standard_deviation(values)

    if std_dev == 0:
        return {"anomalies": [], "stats": {"mean": avg, "stdDev": 0, "count": len(values)}}

    anomalies = []

    for index, value in enumerate(values):
        z_score = abs((value - avg) / std_dev)

        if z_score >= threshold:
            if z_score >= threshold * 2:
                severity = "critical"
            elif z_score >= threshold * 1.5:
                severity = "high"
            elif z_score >= threshold * 1.2:
                severity = "medium"
            else:
                severity = "low"

            anomalies.append({
                "index": index,
                "value": round(value, 2),
                "zScore": round(z_score, 3),
                "severity": severity,
                "deviation": round((value - avg) / avg * 100, 1) if avg != 0 else 0,
            })

    return {
        "anomalies": anomalies,
        "stats": {
            "mean": round(avg, 2),
            "stdDev": round(std_dev, 2),
            "count": len(values),
            "anomalyRate": round(len(anomalies) / len(values) * 100, 1),
        },
    }


def detect_time_series_anomalies(series: list[dict], threshold: float = 2.0) -> dict:
    """
    Detect anomalies in a time series with timestamps.

    Args:
        series: List of dicts with 'timestamp' and 'value' keys.
        threshold: Z-score threshold.
    """
    values = [s["value"] for s in series]
    result = detect_anomalies(values, threshold)

    result["anomalies"] = [
        {**a, "timestamp": series[a["index"]]["timestamp"]}
        for a in result["anomalies"]
    ]

    return result
