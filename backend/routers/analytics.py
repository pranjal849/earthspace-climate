"""Analytics router — replaces api/analytics."""
import csv
import io
import math
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Query, File, UploadFile, Form, HTTPException
from database import get_db
from ml.anomaly_detection import detect_anomalies
from ml.trend_prediction import predict_trend
from ml.correlation_analysis import compute_correlation_matrix

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


def parse_date(date_str: str) -> datetime:
    for fmt in ("%Y-%m-%d", "%Y/%m/%d", "%d/%m/%Y", "%m/%d/%Y", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M:%S.%f", "%Y"):
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            continue
    # Try parsing as float timestamp or integer year
    try:
        val = float(date_str.strip())
        if 1800 <= val <= 2100:  # treat as year
            return datetime(int(val), 1, 1)
        return datetime.fromtimestamp(val)
    except Exception:
        pass
    raise ValueError(f"Unknown date format: {date_str}")


@router.get("")
async def get_analytics(
    country: Optional[str] = None,
    metric: str = Query("temperature"),
    months: int = Query(6, ge=1, le=60),
):
    try:
        db = await get_db()

        filter_query = {}
        if country:
            filter_query["country.isoCode"] = country.upper()

        cursor = db.climatereadings.find(filter_query).sort("timestamp", 1)
        readings = []
        async for r in cursor:
            r["_id"] = str(r["_id"])
            readings.append(r)

        if not readings:
            return {
                "success": True,
                "data": {
                    "anomalies": {"anomalies": [], "stats": {}},
                    "trend": {"predictions": [], "regression": {}, "trend": "insufficient_data"},
                    "correlation": {"matrix": {}, "pairs": [], "metrics": []},
                },
            }

        # Anomaly detection on selected metric
        values = [
            r["metrics"][metric]
            for r in readings
            if r.get("metrics", {}).get(metric) is not None
        ]
        anomaly_results = detect_anomalies(values)

        # Trend prediction for selected metric
        trend_data = [
            {"timestamp": r["timestamp"], "value": r["metrics"][metric]}
            for r in readings
            if r.get("metrics", {}).get(metric) is not None
        ]
        trend_results = predict_trend(trend_data, months)

        # Correlation matrix
        correlation_results = compute_correlation_matrix(readings)

        # Format timestamps in trend_data to ISO strings for JSON serialization
        historical_formatted = []
        for r in trend_data:
            ts = r["timestamp"]
            ts_str = ts.isoformat() if isinstance(ts, datetime) else str(ts)
            historical_formatted.append({"timestamp": ts_str, "value": r["value"]})

        return {
            "success": True,
            "data": {
                "anomalies": anomaly_results,
                "trend": trend_results,
                "correlation": correlation_results,
                "dataPoints": len(readings),
                "metric": metric,
                "historical": historical_formatted,
            },
        }

    except Exception as e:
        print(f"Analytics GET error: {e}")
        return {"success": False, "error": "Failed to compute analytics"}


@router.post("/predict-csv")
async def predict_csv(
    file: UploadFile = File(...),
    months: int = Form(6, ge=1, le=60),
):
    try:
        content = await file.read()
        csv_data = content.decode("utf-8")
        csv_reader = csv.DictReader(io.StringIO(csv_data))

        fields = csv_reader.fieldnames
        if not fields:
            raise HTTPException(status_code=400, detail="Empty CSV file")

        # Find date/timestamp column
        date_col = None
        for f in fields:
            if f.lower() in ("timestamp", "date", "time", "year", "month", "dt", "datetime"):
                date_col = f
                break
        if not date_col:
            # Fallback to the first column
            date_col = fields[0]

        # Find numeric columns (all other columns)
        numeric_cols = []
        for f in fields:
            if f == date_col:
                continue
            numeric_cols.append(f)

        if not numeric_cols:
            raise HTTPException(status_code=400, detail="CSV must contain at least one numeric metric column")

        rows = []
        for row in csv_reader:
            if not row.get(date_col):
                continue
            try:
                dt = parse_date(row[date_col])
                parsed_row = {
                    "timestamp": dt,
                    "metrics": {}
                }
                for col in numeric_cols:
                    val_str = row.get(col, "")
                    if val_str.strip() != "":
                        parsed_row["metrics"][col] = float(val_str.strip())
                rows.append(parsed_row)
            except Exception:
                # Skip invalid rows silently
                continue

        if len(rows) < 2:
            raise HTTPException(status_code=400, detail="CSV must contain at least 2 valid data rows with dates and metrics")

        # Sort rows by timestamp
        rows.sort(key=lambda r: r["timestamp"])

        # Run ML analysis for each metric column
        results = {}
        for col in numeric_cols:
            col_values = []
            trend_data = []

            for r in rows:
                val = r["metrics"].get(col)
                if val is not None:
                    col_values.append(val)
                    trend_data.append({
                        "timestamp": r["timestamp"].isoformat(),
                        "value": val
                    })

            if len(col_values) < 2:
                continue

            anomaly_results = detect_anomalies(col_values)
            trend_results = predict_trend(trend_data, months)

            # Generate historical array with anomaly details
            historical_list = []
            anomaly_map = {a["index"]: a for a in anomaly_results["anomalies"]}

            for idx, r in enumerate(rows):
                val = r["metrics"].get(col)
                if val is not None:
                    anomaly_detail = anomaly_map.get(idx)
                    historical_list.append({
                        "timestamp": r["timestamp"].isoformat(),
                        "value": val,
                        "anomaly": anomaly_detail is not None,
                        "anomalySeverity": anomaly_detail["severity"] if anomaly_detail else None,
                        "anomalyDeviation": anomaly_detail["deviation"] if anomaly_detail else 0,
                    })

            results[col] = {
                "anomalies": anomaly_results,
                "trend": trend_results,
                "dataPoints": len(col_values),
                "historical": historical_list,
            }

        # Calculate a simple correlation matrix if multiple metrics exist
        correlation_matrix = {}
        if len(results) >= 2:
            metric_keys = list(results.keys())
            correlation_matrix = {m: {} for m in metric_keys}
            for m1 in metric_keys:
                for m2 in metric_keys:
                    if m1 == m2:
                        correlation_matrix[m1][m2] = 1.0
                        continue
                    # Match values by timestamp
                    shared_dates = []
                    v1_list = []
                    v2_list = []
                    
                    r_map_1 = {r["timestamp"]: r["value"] for r in results[m1]["historical"]}
                    r_map_2 = {r["timestamp"]: r["value"] for r in results[m2]["historical"]}
                    
                    for ts, v1 in r_map_1.items():
                        if ts in r_map_2:
                            v1_list.append(v1)
                            v2_list.append(r_map_2[ts])
                            
                    if len(v1_list) >= 3:
                        # compute Pearson
                        n = len(v1_list)
                        sum1 = sum(v1_list)
                        sum2 = sum(v2_list)
                        sum1Sq = sum(x*x for x in v1_list)
                        sum2Sq = sum(x*x for x in v2_list)
                        pSum = sum(v1_list[i]*v2_list[i] for i in range(n))
                        num = pSum - (sum1 * sum2 / n)
                        den = math.sqrt((sum1Sq - sum1**2 / n) * (sum2Sq - sum2**2 / n))
                        r = num / den if den != 0 else 0.0
                        correlation_matrix[m1][m2] = round(r, 4)
                    else:
                        correlation_matrix[m1][m2] = 0.0

        return {
            "success": True,
            "data": {
                "results": results,
                "correlation": correlation_matrix,
                "totalRows": len(rows),
                "columns": list(results.keys()),
            }
        }

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"CSV Analysis error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process CSV file: {str(e)}")

