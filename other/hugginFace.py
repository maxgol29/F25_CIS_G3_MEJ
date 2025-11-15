import pandas as pd
import json

df = pd.read_parquet(r"C:\Users\User\Downloads\0000.parquet", engine='pyarrow')
df = df.drop(columns=["sub_dt"])
df = df[df["camera_or_phone_prob"] >= 0.8]
df = df[df["food_prob"] >= 0.9]
df = df.drop(columns=["camera_or_phone_prob"])
df = df.drop(columns=["food_prob"])

df['ingredients'] = df['ingredients'].apply(lambda x: json.dumps(x) if isinstance(x, list) else x)
df['portion_size'] = df['portion_size'].apply(lambda x: json.dumps(x) if isinstance(x, list) else x)

# df = df.drop(columns=["review_length"])
# df = df.rename(columns={"text": "review_text"})


csv_path = r"C:\Users\User\Downloads\item.csv"
df.to_csv(csv_path, index=False, header=False)

print(df[['ingredients', 'portion_size']].head())
print(df.head())  
print(df.info())  
print(df.shape) 
print(df.columns)

