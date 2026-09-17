import json
import re
import time
import math
from datetime import date

import requests

DUPLICATE_RADIUS_KM = 0.05  # 既存のToiletRepository.findNearbyToiletIdsと同じ50m基準

GSI_REVERSE_URL = "https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress"
GSI_HEADERS = {
    "User-Agent": "SuguQuest-DataResearch/0.1 (contact: taoworks dev)",
}


def load_muni_table(path="muni.js"):
    table = {}
    pattern = re.compile(r'GSI\.MUNI_ARRAY\["(\d+)"\]\s*=\s*\'([^\']+)\'')
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            m = pattern.search(line)
            if m:
                table[m.group(1)] = m.group(2)
    print(f"muniテーブル読み込み: {len(table)}件")
    return table


def haversine_km(lat1, lng1, lat2, lng2):
    # 既存バックエンドのネイティブSQL(6371*acos(...))と同一の式
    r = 6371.0
    lat1r, lat2r = math.radians(lat1), math.radians(lat2)
    v = (math.cos(lat1r) * math.cos(lat2r) * math.cos(math.radians(lng2) - math.radians(lng1))
         + math.sin(lat1r) * math.sin(lat2r))
    v = max(-1.0, min(1.0, v))
    return r * math.acos(v)


def reverse_geocode(lat, lng, muni_table):
    try:
        resp = requests.get(
            GSI_REVERSE_URL,
            params={"lat": lat, "lon": lng},
            headers=GSI_HEADERS,
            timeout=15,
        )
        resp.raise_for_status()
        data = resp.json()
        results = data.get("results")
        if not results:
            return None
        muni_cd = str(int(results.get("muniCd", "0")))  # 先頭ゼロを除去してキーに合わせる
        lv01 = results.get("lv01Nm", "")
        muni_info = muni_table.get(muni_cd)
        if not muni_info:
            return lv01 or None
        _, pref, _, city = muni_info.split(",")
        return f"{pref}{city}{lv01}"
    except Exception as e:
        print(f"逆ジオコーディング失敗 lat={lat} lng={lng}: {e}")
        return None


def get_osm_coords(el):
    if el["type"] == "node":
        return el["lat"], el["lon"]
    center = el.get("center")
    if center:
        return center["lat"], center["lon"]
    return None, None


def build_equipment_hints(tags):
    hints = []
    if tags.get("wheelchair") == "yes":
        hints.append("wheelchair")
    if tags.get("changing_table") == "yes":
        hints.append("changing_table")
    if tags.get("toilets:disposal") == "flush":
        hints.append("flush")
    return hints


def main():
    muni_table = load_muni_table()

    with open("output/ibaraki_toilets_20260906_115253.json", "r", encoding="utf-8") as f:
        osm_data = json.load(f)
    with open("output/existing_ibaraki_toilets.json", "r", encoding="utf-8") as f:
        existing = json.load(f)

    candidates = []
    new_count = 0
    dup_count = 0

    for i, el in enumerate(osm_data["elements"]):
        lat, lng = get_osm_coords(el)
        if lat is None:
            continue

        # 50m以内に既存トイレがあるか判定
        dup_id = None
        for ex in existing:
            if ex.get("lat") is None or ex.get("lng") is None:
                continue
            if haversine_km(lat, lng, ex["lat"], ex["lng"]) <= DUPLICATE_RADIUS_KM:
                dup_id = ex.get("id")
                break

        status = "possible_duplicate" if dup_id else "new"
        if dup_id:
            dup_count += 1
        else:
            new_count += 1

        address = reverse_geocode(lat, lng, muni_table)
        time.sleep(0.3)  # GSI APIへの配慮（連続打ちすぎない）

        tags = el.get("tags", {})
        osm_type = el["type"]
        osm_id = el["id"]

        candidates.append({
            "osm_type": osm_type,
            "osm_id": osm_id,
            "name": tags.get("name", "トイレ"),
            "lat": lat,
            "lng": lng,
            "address": address,
            "facilityCategory": "other",
            "source": "osm_import",
            "sourceUrl": f"https://www.openstreetmap.org/{osm_type}/{osm_id}",
            "lastVerified": date.today().isoformat(),
            "dedupStatus": status,
            "existingToiletId": dup_id,
            "equipmentHints": build_equipment_hints(tags),
            "rawTags": tags,
        })

        if (i + 1) % 50 == 0:
            print(f"進捗: {i + 1}/{len(osm_data['elements'])}")

    with open("output/ibaraki_candidates.json", "w", encoding="utf-8") as f:
        json.dump(candidates, f, ensure_ascii=False, indent=2)

    print(f"\n完了: 合計{len(candidates)}件")
    print(f"新規候補: {new_count}件")
    print(f"重複疑い: {dup_count}件")
    print("保存先: output/ibaraki_candidates.json")


if __name__ == "__main__":
    main()
