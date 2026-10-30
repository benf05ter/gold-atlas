#!/usr/bin/env python3
"""Add the map tools (v209: swipe compare, covered-ground pass shading, slope and benches, viewshed, terrain profile).
Usage: python3 -I patch.py <file> [<file> ...]
  - an atlas page (the app's index.html or the claude.ai atlas page): appends terrain.css before <div class="app">,
    terrain.js as its own <script> after the last </script>, and a "Map tools" section in Field skills.
  - a sw.js (tools/sw.js or the built one): adds the atlas-dem cache for the elevation tiles.
Skips a file that already has them, so it is safe to run on a list."""
import sys, os
here = os.path.dirname(os.path.abspath(__file__))
SW_OLD = "  if(/(^|\\.)fonts\\.(googleapis|gstatic)\\.com$/.test(u.hostname)){"
SW_NEW = """  // elevation tiles for the terrain tools (Terrarium, AWS open data): saved once, then served from the phone
  if(u.hostname==='s3.amazonaws.com'&&u.pathname.startsWith('/elevation-tiles-prod/')){ e.respondWith((async()=>{ let c=null, hit=null;
    try{ c=await caches.open('atlas-dem'); hit=await c.match(r.url); if(hit) return hit; }catch(_){ c=null; }
    try{ const res=await fetch(r.url,{mode:'cors',credentials:'omit'}); if(c&&res.ok) c.put(r.url,res.clone()).catch(()=>{}); return res; }catch(_){ return Response.error(); } })()); return; }
"""
SEC = '''<h2 id="k-tools">Map tools: compare, coverage and terrain</h2>
        <p>Open the <b>layers</b> button, then <b>Compare and terrain</b>. One tool runs at a time; the bar at the foot of the map explains it and the × closes it.</p>
        <ul>
          <li><b>Swipe compare.</b> Drag the round handle. The left side is the map type you pick (old maps, 1800s, plat books, fire maps, survey plats), the right side is today as satellite or street map. Line up a vanished schoolhouse, a road that moved or a picnic grove that is now a cornfield.</li>
          <li><b>Covered ground.</b> Record hunts or import GPX, KML or GeoJSON tracks from other apps (Finds log &gt; Your hunts, or the layers sheet). Zoomed in, light green is ground you swung once, darker green twice, darkest three times or more. A spot's card says what share of the ground within 130 ft of the pin you have covered.</li>
          <li><b>Slope and benches.</b> Shades the ground in view: gold for level benches 10-100 ft above nearby low ground at the rim of a terrace or bluff (where people camped, picnicked and built), light gold for sunny south-facing slopes, blue for low flats that flood, red for steep ground. Zoom in to a few miles across.</li>
          <li><b>Viewshed.</b> Tap a point: gold ground can see it. Tap the river or lake to find the banks with a view of the water, the places people chose to sit. Trees and buildings are not counted.</li>
          <li><b>Terrain profile.</b> Tap out a route. The chart shows the climbs and drops, total climb and the steepest grade; slide along the chart to see each point on the map.</li>
          <li>Elevation is the USGS 3DEP 1/3 arc-second model (about 30 ft detail, made from the county LiDAR), loaded only while a terrain tool is on. In the home-screen app, places you have shaded once work again without signal.</li>
        </ul>

        '''
for f in sys.argv[1:]:
    s = open(f, encoding='utf-8').read()
    if "self.addEventListener('fetch'" in s:
        if 'atlas-dem' in s: print('skip', f, '(already patched)'); continue
        assert s.count(SW_OLD) == 1, f + ': sw.js fonts branch not found'
        s = s.replace(SW_OLD, SW_NEW + SW_OLD)
    else:
        if 'window.TR=TR' in s: print('skip', f, '(already patched)'); continue
        assert 'function hrDraw(' in s and 'function findPick(' in s and 'function tilesUpdate(' in s, f + ': not a v120+ atlas page'
        css = open(os.path.join(here, 'terrain.css'), encoding='utf-8').read()
        js = open(os.path.join(here, 'terrain.js'), encoding='utf-8').read()
        a = s.index('<div class="app">')
        s = s[:a] + '<style>\n' + css + '</style>\n' + s[a:]
        i = s.rindex('</script>') + len('</script>')
        s = s[:i] + '\n<script>\n' + js + '</script>' + s[i:]
        toc = '<a class="chip small" href="#k-legend">'
        if s.count(toc) == 1: s = s.replace(toc, '<a class="chip small" href="#k-tools">Map tools</a>' + toc)
        h = '<h2 id="k-legend">'
        if s.count(h) == 1: s = s.replace(h, SEC + h)
    open(f, 'w', encoding='utf-8').write(s)
    print('ok', f, len(s))
