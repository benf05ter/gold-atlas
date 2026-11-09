# Low water now (heat map + alerts)

`lowwater.js` is the atlas section (appended as its own `<script>` just before `</body>` in `a-f218a76394f8/index.html`).
It adds:
- overlay `_lowwater` "Low water now (heat map)" in *Your finds and conditions* (on in Detecting, Gold and My stuff modes);
- a tap card per gauge (reading, percentile for the date, normal and record low, atlas spots near it);
- go-now alerts on Start here for gauges at or below the 10th percentile and for Great Lakes wind setdown of 0.5 ft or more,
  with orange go-now rings on the water spots near them;
- a "Lowest water now" list under Conditions now, every gauge, lowest first, grouped by band;
- it also feeds the older four-gauge river alerts (`FT.cond`) so they stop going stale.

Data: `https://raw.githubusercontent.com/benf05ter/gold-atlas-maps/lowwater-data/lowwater.json`, rebuilt every 3 hours by the
"Low water" GitHub Action in benf05ter/gold-atlas-maps (`lowwater/build.py`, `lowwater/sites.json`). raw.githubusercontent is a
different origin, so the service worker never pins an old copy; the last copy is kept in localStorage (`atlas-lowwater`).

Bands: vlow <= 5th percentile (deep red), low <= 10th (orange), blow <= 25th (yellow), norm (grey dot, no glow), high > 75th (blue).
Re-apply after a rebuild: insert the file as a new `<script>` before `</body></html>` (it checks nothing else; do not insert twice: grep `OGLW`).
