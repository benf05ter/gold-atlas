# Smart sorts (atlas v185)

`ss.js` is the script block added at the end of index.html; `inject.py <in.html> <out.html>` adds it plus one hook line in renderList (run from this folder). WATERD inside ss.js comes from `ovwater.py pins.json water.parquet` (Overture base/water) and `wdist.py pins.json water.parquet waterd.json`; pins without it fall back to the drawn rivers and lakes.
