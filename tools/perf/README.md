# Speed pass (atlas v137-v138)

`speed.py` patches a published atlas page in place (`python3 -I tools/perf/speed.py <atlas.html> <out.html>`); it refuses to run twice
(marker `SPEED137`). It paints the map and pins first and builds hidden lists and panels after, replaces non-scaling SVG strokes
(which made every pinch frame re-lay out the page), skips label work that hasn't changed, caches the best-spot ranking, moves
the satellite to Esri World Imagery (USGS as the retry), draws the 1890 railway map only at state zoom, and adds `ogt.html`,
which shows the old maps as tiles from `ot/` (see `tools/tiles/README.md`).
