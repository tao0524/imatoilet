import requests
import json

BASE_URL = "https://imatoilet-production.up.railway.app/api/toilets"

# 茨城県を十分にカバーする外側マージン込みのbbox（過不足があっても
# 後続の重複判定に影響しないよう、やや広めに設定している）
PARAMS = {
    "minLat": 35.7,
    "maxLat": 36.95,
    "minLng": 139.6,
    "maxLng": 140.9,
    "size": 200,
}

def fetch_all():
    all_toilets = []
    page = 0
    while True:
        params = dict(PARAMS)
        params["page"] = page
        resp = requests.get(BASE_URL, params=params, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        content = data.get("content", [])
        all_toilets.extend(content)
        print(f"page {page}: {len(content)}件 (total so far: {len(all_toilets)})")
        if data.get("last", True):
            break
        page += 1
    return all_toilets

if __name__ == "__main__":
    toilets = fetch_all()
    with open("output/existing_ibaraki_toilets.json", "w", encoding="utf-8") as f:
        json.dump(toilets, f, ensure_ascii=False, indent=2)
    print(f"既存トイレ件数: {len(toilets)}件を保存しました")
