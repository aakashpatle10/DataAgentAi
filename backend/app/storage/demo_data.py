from pathlib import Path
from datetime import datetime, timedelta
import pandas as pd
import numpy as np

def generate_demo_dataset() -> pd.DataFrame:
    """
    Returns the real retail sales dataset provided by user if available,
    otherwise generates a synthetic retail sales analytics dataset.
    """
    sample_csv = Path(__file__).resolve().parent / "retail_sales_sample.csv"
    if sample_csv.exists():
        return pd.read_csv(sample_csv)
    np.random.seed(42)
    categories = {
        "Technology": ["Laptop Pro 15", "Wireless Mouse", "Mechanical Keyboard", "4K Monitor", "USB-C Hub"],
        "Office Supplies": ["Ergonomic Chair", "Standing Desk Mat", "Gel Pen Set", "Notebook Pack", "Paper Shredder"],
        "Electronics": ["Noise-Cancel Headphones", "Bluetooth Speaker", "Smart Watch", "Webcam HD", "Power Bank 20k"]
    }
    
    regions = ["North America", "Europe", "Asia-Pacific", "Latin America"]
    segments = ["Consumer", "Corporate", "Small Business"]
    
    records = []
    base_date = datetime(2024, 1, 15)
    
    order_num = 1001
    for i in range(150):
        cat = np.random.choice(list(categories.keys()))
        prod = np.random.choice(categories[cat])
        region = np.random.choice(regions)
        segment = np.random.choice(segments)
        
        # pricing rules in INR (₹)
        if cat == "Technology":
            unit_price = round(float(np.random.uniform(4000, 85000)), 2)
            margin = float(np.random.uniform(0.20, 0.45))
        elif cat == "Office Supplies":
            unit_price = round(float(np.random.uniform(400, 12000)), 2)
            margin = float(np.random.uniform(0.25, 0.50))
        else:
            unit_price = round(float(np.random.uniform(1200, 28000)), 2)
            margin = float(np.random.uniform(0.20, 0.40))
            
        units_sold = int(np.random.randint(1, 15))
        revenue = round(unit_price * units_sold, 2)
        cost = round(revenue * (1 - margin), 2)
        profit = round(revenue - cost, 2)
        
        order_date = base_date + timedelta(days=int(np.random.randint(0, 240)))
        
        records.append({
            "Order_ID": f"ORD-{order_num}",
            "Order_Date": order_date.strftime("%Y-%m-%d"),
            "Product": prod,
            "Category": cat,
            "Region": region,
            "Customer_Segment": segment,
            "Units_Sold": units_sold,
            "Unit_Price": unit_price,
            "Revenue": revenue,
            "Cost": cost,
            "Profit": profit
        })
        order_num += 1

    df = pd.DataFrame(records)
    
    # Deliberate minor quality issues for realistic data profiling & cleaning:
    # 1. 2 duplicate rows
    df = pd.concat([df, df.iloc[[12, 45]]], ignore_index=True)
    
    # 2. 3 missing customer segments (NaN)
    df.loc[18, "Customer_Segment"] = np.nan
    df.loc[62, "Customer_Segment"] = np.nan
    df.loc[99, "Customer_Segment"] = np.nan
    
    # 3. 1 untrimmed whitespace string
    df.loc[25, "Category"] = " Technology "
    
    # 4. 1 outlier transaction
    df.loc[70, "Units_Sold"] = 95
    df.loc[70, "Revenue"] = round(df.loc[70, "Unit_Price"] * 95, 2)
    df.loc[70, "Cost"] = round(df.loc[70, "Revenue"] * 0.7, 2)
    df.loc[70, "Profit"] = round(df.loc[70, "Revenue"] - df.loc[70, "Cost"], 2)

    return df
