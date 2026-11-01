# Speed pass (atlas v137-v138)

`speed.py` patches a published atlas page in place (`python3 -I tools/perf/speed.py <atlas.html> <out.html>`); it refuses to run twice
(marker `SPEED137`). It paints the map and pins first and builds hidden lists and panels after, replaces non-scaling SVG strokes
(which made every pinch frame re-lay out the page), skips label work that hasn't changed, caches the best-spot ranking, moves
the satellite to Esri World Imagery (USGS as the retry), draws the 1890 railway map only at state zoom, and adds `ogt.html`,
which shows the old maps as tiles from `ot/` (see `tools/tiles/README.md`).

# Start-up patch index (atlas v466)

`dclindex.py` rewrites og-data.js so the ~350 card patches that wait for DOMContentLoaded visit only their own pins through one shared
id index, instead of each walking all ~48,700 pins (`python3 -I tools/perf/dclindex.py <in> <out>`, safe to re-run). `build.py` runs it on
the app copy of every `og-data*.js`; the Claude atlas copy is untouched, so new patches keep the same form. Measured on the v465 app
(local server, Chromium): DOMContentLoaded work 2.6 s -> 0.07 s on a desktop CPU and 12.1 s -> 0.3 s at 4x CPU slowdown (phone-like);
map ready 6.1 s -> 3.4 s and 26.8 s -> 14.3 s. Checked: all 48,715 pins and the 30 other data tables come out byte-identical after load,
and `detailHTML` gives the identical card for every pin.
