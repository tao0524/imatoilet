import psycopg2

env = {}
with open(".env.production", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if line and "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            env[k] = v

required = ["DATABASE_PUBLIC_URL"]
missing = [k for k in required if k not in env]
if missing:
    print(f"不足しているキー: {missing}")
else:
    try:
        conn = psycopg2.connect(env["DATABASE_PUBLIC_URL"])
        cur = conn.cursor()
        cur.execute("SELECT count(*) FROM toilet;")
        count = cur.fetchone()[0]
        print(f"接続成功。toiletテーブル件数: {count}")
        cur.close()
        conn.close()
    except Exception as e:
        # エラーメッセージに接続情報の断片が含まれる可能性があるため、
        # エラーの型名だけを報告し、詳細メッセージは出力しない
        print(f"接続失敗。エラー種別: {type(e).__name__}")
