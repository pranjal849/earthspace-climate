"""
Correlation Analysis using Pearson Correlation.
Computes pairwise correlations between climate metrics.
Direct Python port of lib/ml/correlation-analysis.js
"""
import math


def pearson_correlation(x: list[float], y: list[float]) -> float:
    """
    Calculate Pearson correlation coefficient between two arrays.

    Returns:
        Correlation coefficient (-1 to 1).
    """
    n = min(len(x), len(y))
    if n < 3:
        return 0.0

    sum_x = sum_y = sum_xy = sum_x2 = sum_y2 = 0.0

    for i in range(n):
        sum_x += x[i]
        sum_y += y[i]
        sum_xy += x[i] * y[i]
        sum_x2 += x[i] * x[i]
        sum_y2 += y[i] * y[i]

    numerator = n * sum_xy - sum_x * sum_y
    denominator = math.sqrt(
        (n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y)
    )

    if denominator == 0:
        return 0.0
    return round(numerator / denominator, 4)


def interpret_correlation(r: float) -> str:
    """Interpret correlation strength."""
    abs_r = abs(r)
    if abs_r >= 0.8:
        return "very strong"
    if abs_r >= 0.6:
        return "strong"
    if abs_r >= 0.4:
        return "moderate"
    if abs_r >= 0.2:
        return "weak"
    return "negligible"


def compute_correlation_matrix(readings: list[dict]) -> dict:
    """
    Compute correlation matrix across all metrics in readings.

    Args:
        readings: List of ClimateReading documents.

    Returns:
        dict with matrix, pairs, metrics, and insights.
    """
    metrics = [
        "temperature", "co2Level", "humidity", "seaLevel",
        "precipitation", "windSpeed", "uvIndex", "airQualityIndex",
    ]

    # Extract metric arrays, filtering out nulls
    metric_arrays = {}
    for metric in metrics:
        metric_arrays[metric] = [
            r.get("metrics", {}).get(metric) if isinstance(r.get("metrics"), dict) else r.get(metric)
            for r in readings
        ]
        metric_arrays[metric] = [
            v for v in metric_arrays[metric]
            if v is not None and not (isinstance(v, float) and math.isnan(v))
        ]

    # Compute pairwise correlations
    matrix = {}
    pairs = []

    for m1 in metrics:
        matrix[m1] = {}
        for m2 in metrics:
            if m1 == m2:
                matrix[m1][m2] = 1.0
                continue

            length = min(len(metric_arrays[m1]), len(metric_arrays[m2]))
            x = metric_arrays[m1][:length]
            y = metric_arrays[m2][:length]

            correlation = pearson_correlation(x, y)
            matrix[m1][m2] = correlation

            # Only add unique pairs
            if metrics.index(m1) < metrics.index(m2):
                direction = "positive" if correlation > 0 else "negative" if correlation < 0 else "none"
                pairs.append({
                    "metric1": m1,
                    "metric2": m2,
                    "correlation": correlation,
                    "strength": interpret_correlation(correlation),
                    "direction": direction,
                })

    # Sort pairs by absolute correlation
    pairs.sort(key=lambda p: abs(p["correlation"]), reverse=True)

    # Top insights
    strong_correlations = [
        p for p in pairs if p["strength"] in ("strong", "very strong")
    ]

    return {
        "matrix": matrix,
        "pairs": pairs,
        "metrics": metrics,
        "insights": {
            "strongCorrelations": strong_correlations,
            "totalPairs": len(pairs),
            "strongCount": len(strong_correlations),
        },
    }


def compute_pairwise_correlation(readings: list[dict], metric1: str, metric2: str) -> dict:
    """Compute correlation between two specific metrics."""
    x = [
        r.get("metrics", {}).get(metric1) if isinstance(r.get("metrics"), dict) else r.get(metric1)
        for r in readings
    ]
    y = [
        r.get("metrics", {}).get(metric2) if isinstance(r.get("metrics"), dict) else r.get(metric2)
        for r in readings
    ]
    x = [v for v in x if v is not None]
    y = [v for v in y if v is not None]
    length = min(len(x), len(y))

    correlation = pearson_correlation(x[:length], y[:length])

    return {
        "correlation": correlation,
        "strength": interpret_correlation(correlation),
        "direction": "positive" if correlation > 0 else "negative" if correlation < 0 else "none",
        "dataPoints": length,
    }
