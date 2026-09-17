import json
import math

DUPLICATE_RADIUS_KM = 0.05  # 前回までと同じ50m基準


def haversine_km(lat1, lng1, lat2, lng2):
    r = 6371.0
    lat1r, lat2r = math.radians(lat1), math.radians(lat2)
    v = (math.cos(lat1r) * math.cos(lat2r) * math.cos(math.radians(lng2) - math.radians(lng1))
         + math.sin(lat1r) * math.sin(lat2r))
    v = max(-1.0, min(1.0, v))
    return r * math.acos(v)


class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))

    def find(self, x):
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.parent[ra] = rb


def pick_representative(members):
    # node優先、同種ならタグ数が多い方を残す
    def score(m):
        is_node = 1 if m["osm_type"] == "node" else 0
        tag_count = len(m.get("rawTags", {}))
        return (is_node, tag_count)
    return max(members, key=score)


def merge_equipment_hints(members):
    merged = set()
    for m in members:
        merged.update(m.get("equipmentHints", []))
    return sorted(merged)


def main():
    with open("output/ibaraki_candidates.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    new_items = [d for d in data if d["dedupStatus"] == "new"]
    other_items = [d for d in data if d["dedupStatus"] != "new"]

    n = len(new_items)
    uf = UnionFind(n)
    for i in range(n):
        for j in range(i + 1, n):
            if haversine_km(new_items[i]["lat"], new_items[i]["lng"],
                             new_items[j]["lat"], new_items[j]["lng"]) <= DUPLICATE_RADIUS_KM:
                uf.union(i, j)

    clusters = {}
    for i in range(n):
        root = uf.find(i)
        clusters.setdefault(root, []).append(new_items[i])

    merged_new = []
    merged_away_count = 0
    for members in clusters.values():
        if len(members) == 1:
            merged_new.append(members[0])
        else:
            rep = pick_representative(members)
            rep = dict(rep)
            rep["equipmentHints"] = merge_equipment_hints(members)
            rep["mergedFrom"] = [f"{m['osm_type']}/{m['osm_id']}" for m in members if m is not rep or True]
            merged_new.append(rep)
            merged_away_count += len(members) - 1

    final_data = other_items + merged_new

    with open("output/ibaraki_candidates_final.json", "w", encoding="utf-8") as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)

    print(f"統合前の新規候補: {n}件")
    print(f"統合後の新規候補: {len(merged_new)}件（{merged_away_count}件を統合により削減）")
    print(f"重複疑い（既存DB分、変更なし）: {len(other_items)}件")
    print(f"保存先: output/ibaraki_candidates_final.json")


if __name__ == "__main__":
    main()
