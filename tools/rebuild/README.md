# Old Ground engine rebuild (atlas v120)

`rebuild.py` turns a saved v117-style atlas (one 4.4 MB page) into the v120 layout:

    python3 -I tools/rebuild/rebuild.py Upper-Midwest-Gold-Atlas.html out/

Output: `out/index.html` (code only, about 1 MB), `out/og-data.js` (pins, towns, schools, about 3 MB)
and `out/og/mag.webp`, `out/og/prosp.png` (the two heat-map pictures, loaded only when switched on).
Then build the home-screen app as before: `python3 tools/build.py out/index.html ...` (it copies og-data.js and og/ too).

Files here:
- `engine.js` / `engine.css`: the map engine (render pipeline, gesture controller, image tiles, pin canvas, streams, offline quads).
- `vs-lazy.js`: vanished-site card text built on first read instead of at startup.
- `canvas-land.js`: park outlines and trails painted on the pin canvas.
- `boot.js`: first paint and idle work.
- `test.js`: headless Playwright checks (desktop and iPhone size): `node tools/rebuild/test.js http://127.0.0.1:8765/index.html`.

From v120 on, edit `out/index.html` (or the published atlas) directly; the old patch scripts that searched the v117 page no longer apply.
