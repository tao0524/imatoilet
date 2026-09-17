import requests
import json
import time
from datetime import datetime

# 2026年に overpass-api.de は無許可のUser-Agent/Refererを持つリクエストを
# 406 Not Acceptable で拒否するようになっている。両方を必ず設定すること。
HEADERS = {
    "User-Agent": "SuguQuest-DataResearch/0.1 (contact: taoworks dev)",
    "Referer": "https://github.com/tao0524/imatoilet",
}

PRIMARY_URL = "https://overpass-api.de/api/interpreter"
FALLBACK_URL = "https://overpass.private.coffee/api/interpreter"

QUERY = """
[out:json][timeout:90];
area["ISO3166-2"="JP-08"]->.searchArea;
(
  node["amenity"="toilets"](area.searchArea);
  way["amenity"="toilets"](area.searchArea);
);
out center tags;
"""

def fetch(url):
    resp = requests.post(url, data={"data": QUERY}, headers=HEADERS, timeout=120)
    resp.raise_for_status()
    return resp.json()

def main():
    try:
        print(f"Trying primary: {PRIMARY_URL}")
        data = fetch(PRIMARY_URL)
    except Exception as e:
        print(f"Primary failed: {e}")
        print(f"Trying fallback: {FALLBACK_URL}")
        time.sleep(2)
        data = fetch(FALLBACK_URL)

    elements = data.get("elements", [])
    print(f"取得件数: {len(elements)}")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_path = f"output/ibaraki_toilets_{timestamp}.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"保存先: {out_path}")

    # タグの充実度を簡易集計
    tag_keys = {}
    for el in elements:
        for k in el.get("tags", {}).keys():
            tag_keys[k] = tag_keys.get(k, 0) + 1
    print("\n--- タグ出現頻度（上位20件） ---")
    for k, v in sorted(tag_keys.items(), key=lambda x: -x[1])[:20]:
        print(f"{k}: {v}件 ({v/len(elements)*100:.1f}%)" if elements else f"{k}: {v}件")

if __name__ == "__main__":
    main()
