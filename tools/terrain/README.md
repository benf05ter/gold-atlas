# Map tools (atlas v209)

Swipe compare, covered-ground pass shading, slope and benches, viewshed and terrain profile. Opened from the layers sheet under **Compare and terrain**.

Apply (both the app build and the claude.ai atlas page; safe to re-run, already-patched files are skipped):

    python3 -I tools/terrain/patch.py a-f218a76394f8/index.html a-f218a76394f8/sw.js <claude-atlas-page.html>

`tools/sw.js` (the template build.py stamps) already carries the `atlas-dem` cache. Restamp VERSION after patching the built sw.js.

- Elevation: Terrarium tiles (`s3.amazonaws.com/elevation-tiles-prod`, CORS open; USGS 3DEP 1/3 arc-second in WI), fetched only while a terrain tool is on; the app caches them in `atlas-dem`.
- Compare: tile layer `cmp` kept last in `.ogtiles`, clipped at the slider; SVG old-map groups and the plain land fill get `#cmpCP`. Off in 3D.
- Coverage: tracks grouped by overlap, stamped on a grid at swing width; a cell counts a new pass when the track comes back (gap > 2.5 x swing) or another hunt crosses it. Zoomed in, the raster replaces the plain green bands (not while recording). Card adds % of the 40 m circle swung.
- Test: `serviceWorkers:'block'` in Playwright, otherwise the app's service worker bypasses page.route.
