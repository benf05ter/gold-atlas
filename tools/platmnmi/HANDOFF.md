# Minnesota + Michigan plat books: hand-off for the app (2026-10-30)

Thread "Mine Minnesota and Michigan plat books". Same pin format as the WI plat pins
(id, L, n, la, lo, y, pl, co, stt, v, c, s, p, st, t, src, pinconf, pinev, plus a flag field = prefix).

## Pins (560) and enrich text
| County | Book | Prefix / flag | Pins | Enrich | Map picture |
|---|---|---|---|---|---|
| Ramsey + Washington MN | 1887 wall map (LoC 2012593067) | prw87 | 204 | 6 | plat_ramsey_washington_1887.webp |
| Dakota MN | 1874 wall map (LoC 2012593028) | pdk74 | 2 | 0 | plat_dakota_1874.webp |
| Chisago MN | 1888 plat book (UMN 5098) | pch88 | 33 | 0 | none (page book) |
| Houston MN | 1871 wall map (LoC 2012593030) | pho71 | 28 | 3 | plat_houston_1871.webp |
| Goodhue MN | 1894 plat book (UMN 1864) | pgo94 | 81 | 2 | none (page book) |
| Wabasha MN | 1896 plat book (UMN 10509) | pwa96 | 63 | 5 | none (page book) |
| Winona MN | 1867 atlas (UMN 6860) | pwi67 | 70 | 6 | none (page book) |
| Menominee MI | 1898 wall map (LoC 2012593145) | pmi98 | 57 | 7 | plat_menominee_1898.webp |
| Gogebic + Ontonagon MI | 1887 mineral-regions map (LoC 2012593363) | pgo87 | 22 | 8 | plat_gogebic_ontonagon_1887.webp |

- pins-<prefix>.json: new pins. enrich-<prefix>.json: {existing atlas pin id: text to append to its card}.
  Enrich covers features that are the same place as a pin already in the atlas (vs-, d-ghost-, cmine-, g87-, hist-, fr-, ob-).
- `stt` is MN or MI; `pl` names the right state.
- Places with a USGS (GNIS) point within 700 m sit on that point (pinconf A); the rest sit where the map puts them (pinconf B, 50-300 m; Gogebic mines 200-500 m).

## Map pictures (app only, pre-tile like the WI plats)
Each webp has a .json with `b: [lon0, lon1, lat0, lat1]` (plain lon/lat box, north up) and pixel size.
These are warped to lon/lat (thin-plate spline on BLM section corners, masked to the mapped townships, transparent outside).
Suggested layers: p-ramseywash87, p-dakota74, p-houston71, p-menominee98, p-gogebic87 (z8-13, as the WI plats).
Fit checks (leave-one-out): Ramsey/Washington median 59 m, Dakota 24 m, Houston 41 m, Menominee 43 m, Gogebic 5 px on 2,524 corners.

## Gaps
- Pine MN: no plat book online anywhere (UMN, MHS, LoC). Andreas 1874 county page is too coarse.
- Iron, Dickinson, Marquette, Houghton, Keweenaw MI: no reachable book (Michigan Tech and quod.lib.umich.edu block bots).
- Delta MI 1913 (archive.org) is outside the 4 h ring, skipped.
- Page-book counties (Chisago, Goodhue, Wabasha, Winona) have pins only, no overlay mosaic yet.

Working files: ../w-*/ (cfg, feats, pages, raw reads), tools ../bin/, re-merge list ../w-merges.txt.
