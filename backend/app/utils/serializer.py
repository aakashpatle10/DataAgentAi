import math
import numpy as np
import pandas as pd
from typing import Any

def clean_value(val: Any) -> Any:
    """Recursively converts NaN, Inf, Timestamps, and Numpy types into JSON-safe types."""
    if val is None:
        return None
    if isinstance(val, (float, np.floating)):
        if math.isnan(val) or np.isnan(val):
            return None
        if math.isinf(val) or np.isinf(val):
            return None
        return float(val)
    if isinstance(val, (int, np.integer)):
        return int(val)
    if isinstance(val, (bool, np.bool_)):
        return bool(val)
    if isinstance(val, (pd.Timestamp, np.datetime64)):
        return val.isoformat() if hasattr(val, "isoformat") else str(val)
    if pd.isna(val):
        return None
    if isinstance(val, dict):
        return {str(k): clean_value(v) for k, v in val.items()}
    if isinstance(val, (list, tuple, np.ndarray)):
        return [clean_value(x) for x in val]
    return val

def clean_record_dict(record: dict) -> dict:
    return {k: clean_value(v) for k, v in record.items()}
