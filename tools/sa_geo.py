#!/usr/bin/env python3
"""Build ui/data/sa-geo.json — the customer map's geography of Saudi Arabia.

Regions: the 13 administrative regions from Natural Earth's admin-1 boundaries (public domain,
naturalearthdata.com), simplified and projected for SVG. Cities and districts: approximate centre points
(the map says so) — the districts are drawn as cells around those points, not as surveyed boundaries.

usage: python3 tools/sa_geo.py ne_10m_admin_1_states_provinces.geojson
(the source file: github.com/nvkelso/natural-earth-vector, geojson/ne_10m_admin_1_states_provinces.geojson)
"""
import json, math, sys
from pathlib import Path

LAT0 = 24.0
K = 100.0  # projected units per degree of latitude
COS0 = math.cos(math.radians(LAT0))


def proj(lng, lat):
    return (round((lng - 34.0) * COS0 * K, 2), round((33.0 - lat) * K, 2))


def dp(points, eps):
    """Douglas-Peucker on projected points."""
    if len(points) < 3:
        return points
    (x1, y1), (x2, y2) = points[0], points[-1]
    dx, dy = x2 - x1, y2 - y1
    L = math.hypot(dx, dy) or 1e-9
    idx, dmax = 0, 0.0
    for i in range(1, len(points) - 1):
        x, y = points[i]
        d = abs(dy * x - dx * y + x2 * y1 - y2 * x1) / L
        if d > dmax:
            idx, dmax = i, d
    if dmax > eps:
        return dp(points[: idx + 1], eps)[:-1] + dp(points[idx:], eps)
    return [points[0], points[-1]]


def ring_area(r):
    return abs(sum(r[i][0] * r[i - 1][1] - r[i - 1][0] * r[i][1] for i in range(len(r)))) / 2


REGION_AR = {
    "SA-01": "منطقة الرياض", "SA-02": "منطقة مكة المكرمة", "SA-03": "منطقة المدينة المنورة", "SA-04": "المنطقة الشرقية",
    "SA-05": "منطقة القصيم", "SA-06": "منطقة حائل", "SA-07": "منطقة تبوك", "SA-08": "منطقة الحدود الشمالية",
    "SA-09": "منطقة جازان", "SA-10": "منطقة نجران", "SA-11": "منطقة الباحة", "SA-12": "منطقة الجوف", "SA-14": "منطقة عسير",
}
# city: (lat, lng, region, aliases)
CITIES = {
    "الرياض": (24.7136, 46.6753, "SA-01", ["riyadh"]),
    "الخرج": (24.1556, 47.3120, "SA-01", []),
    "جدة": (21.4858, 39.1925, "SA-02", ["جده", "jeddah"]),
    "مكة المكرمة": (21.3891, 39.8579, "SA-02", ["مكة", "مكه", "makkah", "mecca"]),
    "الطائف": (21.2703, 40.4158, "SA-02", ["taif"]),
    "رابغ": (22.7986, 39.0349, "SA-02", []),
    "المدينة المنورة": (24.5247, 39.5692, "SA-03", ["المدينة", "المدينه", "madinah", "medina"]),
    "ينبع": (24.0895, 38.0618, "SA-03", ["yanbu"]),
    "الدمام": (26.4207, 50.0888, "SA-04", ["dammam"]),
    "الخبر": (26.2172, 50.1971, "SA-04", ["khobar"]),
    "الظهران": (26.2361, 50.0393, "SA-04", ["dhahran"]),
    "القطيف": (26.5196, 50.0115, "SA-04", []),
    "الجبيل": (27.0046, 49.6460, "SA-04", ["jubail"]),
    "الأحساء": (25.3833, 49.5867, "SA-04", ["الاحساء", "الهفوف", "hofuf"]),
    "حفر الباطن": (28.4328, 45.9708, "SA-04", []),
    "بريدة": (26.3260, 43.9750, "SA-05", ["buraidah"]),
    "عنيزة": (26.0840, 43.9940, "SA-05", []),
    "حائل": (27.5114, 41.7208, "SA-06", ["hail"]),
    "تبوك": (28.3838, 36.5550, "SA-07", ["tabuk"]),
    "عرعر": (30.9753, 41.0381, "SA-08", []),
    "جازان": (16.8894, 42.5706, "SA-09", ["جيزان", "jazan"]),
    "نجران": (17.4924, 44.1277, "SA-10", ["najran"]),
    "الباحة": (20.0129, 41.4677, "SA-11", []),
    "سكاكا": (29.9697, 40.2064, "SA-12", []),
    "أبها": (18.2164, 42.5053, "SA-14", ["ابها", "abha"]),
    "خميس مشيط": (18.3000, 42.7333, "SA-14", []),
}
# approximate district centres (lat, lng)
DISTRICTS = {
    "جدة": {
        "البلد": (21.4858, 39.1860), "الشرفية": (21.5100, 39.1980), "البغدادية": (21.4960, 39.1840), "الرويس": (21.5180, 39.1700),
        "الحمراء": (21.5300, 39.1600), "الأندلس": (21.5420, 39.1500), "الروضة": (21.5580, 39.1580), "الخالدية": (21.5550, 39.1400),
        "الزهراء": (21.5780, 39.1400), "الشاطئ": (21.5920, 39.1100), "السلامة": (21.5860, 39.1600), "النعيم": (21.6100, 39.1450),
        "المحمدية": (21.6300, 39.1330), "البساتين": (21.6470, 39.1200), "أبحر الشمالية": (21.7400, 39.1050), "أبحر الجنوبية": (21.7000, 39.1150),
        "المرجان": (21.6200, 39.1150), "الصفا": (21.5800, 39.2100), "المروة": (21.6200, 39.2000), "الربوة": (21.5700, 39.1900),
        "النسيم": (21.5250, 39.2200), "العزيزية": (21.5500, 39.2000), "الفيصلية": (21.5650, 39.1750), "مشرفة": (21.5450, 39.1850),
        "البوادي": (21.5950, 39.1800), "الرحاب": (21.5500, 39.2300), "السامر": (21.6000, 39.2350), "الأجواد": (21.6350, 39.2350),
        "الجامعة": (21.4900, 39.2350), "الثغر": (21.4700, 39.2400), "الكندرة": (21.4990, 39.1960), "الفيحاء": (21.4800, 39.2250),
        "السنابل": (21.4000, 39.2800), "الحرازات": (21.4200, 39.3200), "الواحة": (21.6420, 39.2100),
    },
    "الرياض": {
        "العليا": (24.6950, 46.6850), "السليمانية": (24.7050, 46.7000), "الملز": (24.6650, 46.7300), "الروضة": (24.7350, 46.7700),
        "النخيل": (24.7450, 46.6450), "الملقا": (24.8050, 46.6150), "النرجس": (24.8350, 46.6700), "الياسمين": (24.8250, 46.6400),
        "حطين": (24.7650, 46.6000), "الربوة": (24.6800, 46.7600), "المروج": (24.7550, 46.6600), "الصحافة": (24.8000, 46.6400),
        "العارض": (24.8700, 46.6200), "السويدي": (24.5850, 46.6700), "الشفا": (24.5650, 46.7100), "النسيم": (24.7300, 46.8300),
        "البطحاء": (24.6300, 46.7150), "قرطبة": (24.8000, 46.7300), "المونسية": (24.8200, 46.7800), "الشوقية": (24.5750, 46.7350),
    },
    "مكة المكرمة": {
        "العزيزية": (21.4000, 39.8900), "الشوقية": (21.3700, 39.7900), "العوالي": (21.3700, 39.8600), "الزاهر": (21.4300, 39.8050),
        "النسيم": (21.3950, 39.8650), "الرصيفة": (21.4200, 39.7800), "الششة": (21.3850, 39.8400), "العتيبية": (21.4200, 39.8150), "كدي": (21.4050, 39.8250),
    },
    "المدينة المنورة": {
        "قباء": (24.4400, 39.6150), "العزيزية": (24.4300, 39.5700), "الحرة الشرقية": (24.4700, 39.6300), "العوالي": (24.4300, 39.6400),
        "سلطانة": (24.4900, 39.5850), "العيون": (24.5400, 39.5700), "الخالدية": (24.5150, 39.6300), "قربان": (24.4550, 39.6200),
    },
    "الدمام": {
        "الشاطئ": (26.4500, 50.1100), "الفيصلية": (26.4200, 50.0500), "النزهة": (26.4050, 50.0750), "الريان": (26.3950, 50.0600),
        "الفيحاء": (26.4000, 50.0300), "المزروعية": (26.4150, 50.1000), "الجلوية": (26.4400, 50.0950), "العدامة": (26.4330, 50.1050),
    },
    "الخبر": {
        "العقربية": (26.2900, 50.2000), "الراكة": (26.3500, 50.1900), "الثقبة": (26.2700, 50.1900), "الخبر الشمالية": (26.3000, 50.2100), "اليرموك": (26.3100, 50.1800),
    },
    "الطائف": {"الحوية": (21.4400, 40.4900), "شهار": (21.2600, 40.3700), "الفيصلية": (21.2800, 40.4200)},
    "أبها": {"المنسك": (18.2300, 42.5000), "الخالدية": (18.2200, 42.5100)},
}


def main(src):
    d = json.load(open(src, encoding="utf-8"))
    regions = []
    for f in d["features"]:
        p = f["properties"]
        if p.get("adm0_a3") != "SAU":
            continue
        code = p["iso_3166_2"]
        g = f["geometry"]
        polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        parts = []
        for poly in polys:
            ring = [proj(x, y) for x, y in poly[0]]
            if ring_area(ring) < 4:  # small islands
                continue
            # a closed ring: simplify the two halves split at the point farthest from the start
            far = max(range(len(ring)), key=lambda i: math.hypot(ring[i][0] - ring[0][0], ring[i][1] - ring[0][1]))
            s = dp(ring[: far + 1], 0.9)[:-1] + dp(ring[far:], 0.9)
            if len(s) >= 4:
                parts.append("M" + "L".join(f"{x:g},{y:g}" for x, y in s[:-1]) + "Z")
        xs = [x for poly in polys for x, _ in (proj(a, b) for a, b in poly[0])]
        ys = [y for poly in polys for _, y in (proj(a, b) for a, b in poly[0])]
        regions.append({"id": code, "name": REGION_AR.get(code, p.get("name_ar") or p["name"]), "en": p["name"], "d": "".join(parts),
                        "box": [round(min(xs), 1), round(min(ys), 1), round(max(xs) - min(xs), 1), round(max(ys) - min(ys), 1)]})
    regions.sort(key=lambda r: r["id"])
    cities = [{"name": n, "region": r, "xy": proj(lng, lat), "aka": aka} for n, (lat, lng, r, aka) in CITIES.items()]
    districts = {c: {n: proj(lng, lat) for n, (lat, lng) in ds.items()} for c, ds in DISTRICTS.items()}
    out = {"source": "Natural Earth admin-1 (public domain); city and district points are approximate", "k": K, "lat0": LAT0,
           "regions": regions, "cities": cities, "districts": districts}
    Path("ui/data/sa-geo.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("regions", len(regions), "cities", len(cities), "districts", sum(len(v) for v in districts.values()),
          "bytes", Path("ui/data/sa-geo.json").stat().st_size)


if __name__ == "__main__":
    main(sys.argv[1])
