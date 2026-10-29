# Old-map tiles

`tiler.py` cuts the old maps into 512 px webp tiles at build time, so a phone never has to draw a whole 30,000 px sheet when zoomed in.

    pip install rasterio pyproj        # only for the 1936 GeoTIFFs
    python3 -I tools/tiles/tiler.py tools/tiles/spec.json <out>/ot

Source paths in `spec.json` are relative to the spec file. Put the atlas side folders (`om/`, `om19/`, `oldmap/`) next to it,
plus the two 1936 USGS GeoTIFFs (Elk Mound and Chippewa Falls 1:62,500, from the USGS historical topo collection,
`historicaltopo.csv`). The 1936 layer is cut from those full scans (about 5 m per pixel), with a light contrast stretch and sharpening,
so the place names stay readable at street zoom.

Layers: `o250` 1:250,000 sheets, `o15` 15-minute sheets, `o19` 1889-1900 sheets (1800s map type), `ogt` ground today,
`o72` 1972 topo, `o36` 1936 topo. `index.json` lists every tile, so the page never asks for one that does not exist.
Pass the output folder to `tools/build.py` as its 7th argument. The page code that reads the tiles is `tools/perf/ogt.html`
(added to the atlas by `tools/perf/speed.py`); without `ot/` (the Claude artifact) the atlas falls back to the whole sheets.
