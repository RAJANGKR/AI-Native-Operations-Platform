# test_conn.py
import psycopg
import time

DATABASE_URL = "postgresql://postgres.xevyuyvhbljwawuykglb:Rajang1239939M@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=require"

print("Connecting...")
start = time.time()
try:
    conn = psycopg.connect(DATABASE_URL, connect_timeout=10)
    print(f"✅ Connected in {time.time()-start:.2f}s")
    conn.close()
except Exception as e:
    print(f"❌ Failed after {time.time()-start:.2f}s: {e}")