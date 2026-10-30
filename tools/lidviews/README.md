# LiDAR views and ground changed since the old topo (atlas v222)

Neb approved 2026-10-30 11:42Z (coordinator's list, items 1 and 6). Two things, both on spot cards that already have a LiDAR picture:

1. **Sharper LiDAR views.** Under each card LiDAR picture: Shaded (the existing picture), Local relief, Sky-view. One grey
   local-relief picture per spot (`img/<chunk>.r.json`, "cl|webp", 128 = level, +-120 = +-cl m, 256 px) is coloured on the phone
   (blue hollow / red raised on a light hillshade) and the sky-view (16 directions, ~11 m radius, blended with slope) is worked from
   it on the phone too, so one 4-5 KB file serves both views. 7,399 pictures, 33 MB in 29 files beside the existing m-N / l-N bundles,
   same ids, loaded only when a view is tapped. The app remembers the last view (localStorage `ogLidView`).
2. **Changed ground since the old topo.** The oldest USGS historical topo (1:24,000-1:48,000 if there is one dated 1964 or earlier,
   else the oldest 1:62,500) covering each spot is read at full resolution from the USGS GeoTIFFs (prd-tnm.s3, windowed reads),
   laid on the spot's 600 m, 1 m LiDAR window, and its brown contour lines are traced. Each line's own height is its median LiDAR
   height; where a stretch of it on sloping ground now sits more than 3 m + slope x map error lower or higher, the ground was cut or
   filled since. `img/tc.json` (123 KB): `id -> [year, I|D, m checked within 150 m, cut m, fill m, 0, deepest cut m, highest fill m,
   nearest change m, bearing, [x/3, y/3, 0 cut|1 fill, ...]]` (x, y on the 600 m window, pin at 300,300).
   Card note "Ground intact since the 19xx topo" / "Ground changed since the 19xx topo", a **Changed** view marking the stretches,
   and a layer **Ground changed since the old topo (rings)** (green intact, red changed; loads when switched on).

## Results (6,688 spots with a picture and a covering sheet, atlas v225)
- 1,986 intact (>=150 m of old contour on slopes within 150 m, <=3% off), 21 changed (>=20 m and >=5% off).
- 3,137 too little sloping contour to say (level farmland), 1,486 no usable contours (town tint, one-colour sheets, LiDAR gaps), 58 map misfit.
- The 21 changed were checked by eye (sheets/changed-*.png): freeway cuts (Savage Lake camping ground, Hudson mills), a levelled
  drive-in lot (Cottage View), the Johnston stone quarry, Kaposia bluff cuts, Hennepin village road banks; weak ones: Edina mill creek,
  Spring sec 7, Eau Claire abandoned farm 44673, Arcola school; v225 adds Valley Creek store (road bank across the valley), Mounds View school 22 (interchange), Langdon (building pad). Kept all 21 with "worth a look" wording; the card says level ground can't be tested.

## What did not work (so nobody repeats it)
- Fitting a shift per spot to line the topo up: the best shifts were random within a sheet (the fit slid lines into agreement on any
  ground), so the sheet's own georeferencing is trusted and the map error goes into the slope tolerance instead (15 m at 1:24k, 30 m
  at 1:62.5k; 25/40 m in the second look, tc.py `tighten`).
- Flooding: hydro-flattened rivers make every contour crossing look "flooded", and old-style sheets put text over lakes. Dropped;
  needs the old map's own water (blue) as well. Lake Altoona / flowage checks would need that.
- One-colour sheets (1890s-1930s brown printings, e.g. Osseo 1935): roads, text and section lines are in the contour ink. Skipped by
  sheet: mono.json = share of blue in 9 full-res sample windows (< 0.0008 = one colour).
- Town tint (pink-red built-up areas) reads as contour brown; masked (tdiff.tint).
- The HTMC GeoTIFF bounds include the white collar: pick.py snaps to the 7.5' / 15' / 30' neatline.
- Full-colour local relief and sky-view pictures were 195 MB for 6,866 spots (WebP can't squeeze the 1 m texture); hence the single
  grey picture coloured on the phone.

## Re-run
    python3 htmc_list.py; python3 htmc_bounds.py          # USGS historical topo index (htmc.json, htmc_b.json)
    node dump.js                                          # pts.json + lidimg.json from the running app (research/lidar-views/dump.js)
    python3 fetch.py                                      # 600 m 1 m-LiDAR windows -> dem/<id>.npz (lidar-pass dem.py + tiles1m*.json)
    python3 views.py lidimg.json pts.json out/img         # img/<chunk>.r.json
    python3 pick.py; python3 mono.py; python3 runtd.py    # td.jsonl (about 25 min on 4 cores)
    python3 tc.py out/img/tc.json
    python3 -I patch.py <atlas index.html> ...            # page code; skips files already patched
`show.py out.png <id> ...` draws review sheets (old topo | today's hillshade with the changed stretches).

Shared with the 1938 stereo / Sentinel-2 pass: `topowin.onto()` puts any GeoTIFF onto a LiDAR window's UTM grid, `deriv.py` has
hillshade / LRM / SVF, `fetch.py` + lidar-pass `dem.py` read 1 m LiDAR windows.
