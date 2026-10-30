#!/usr/bin/env python3
"""Add the extra card LiDAR views and the changed-ground check (v222): local relief / sky-view / changed buttons on LiDAR pictures,
the "ground intact / changed since the 19xx topo" card note and the "Ground changed since the old topo" ring layer.
Usage: python3 -I patch.py <atlas index.html> [...]
  Appends lidviews.css before <div class="app">, lidviews.js as its own <script> after the last </script> (it must come after the
  vanished-features script, v215, so its layer sits beside "When it vanished"), and a "Reading the LiDAR views" section in Field skills.
  Data files are separate: img/<chunk>.r.json (one per picture bundle) and img/tc.json (copy from research/lidar-views/out/img/).
Skips a file that already has it, so it is safe to run on a list."""
import sys, os
here = os.path.dirname(os.path.abspath(__file__))
SEC = '''<h2 id="k-lidv">Reading the LiDAR views</h2>
        <p>Each LiDAR picture on a spot's card has buttons under it. They all show the same square of 1 m bare-earth LiDAR, drawn three ways; the app remembers the one you used last.</p>
        <ul>
          <li><b>Shaded.</b> Light from three directions with a red-blue tint for raised and hollow ground. Good for roads, banks and the lie of the land.</li>
          <li><b>Local relief.</b> Each spot compared with the ground 25 m around it. Blue = lower (cellar holes, wells, privies, ditches), red = higher (foundations, banks, mounds, spoil). The colours stretch to the ground in view, so a 1 ft rim shows even on flat farmland or a hillside.</li>
          <li><b>Sky-view.</b> How much open sky each spot sees. Hollows, ditches, sunken lanes and pit edges go dark, open level ground stays light. Best for small features under trees, where light from one side hides them.</li>
          <li><b>Changed.</b> Shown when the old USGS topo disagrees with today's ground: the old contour lines are laid on the LiDAR, and where they now sit lower the ground was cut (red: road cut, gravel pit, quarry, levelling) or higher it was filled (orange: road bank, dam, dump, building pad). The card says <b>Ground intact since the 19xx topo</b> when the old contours within 150 m still fit. Level ground has no contours to test, and lakes and rivers are not tested, so no note is not a verdict.</li>
          <li>The map layer <b>Ground changed since the old topo</b> rings the checked spots: green intact, red changed.</li>
        </ul>

        '''
for f in sys.argv[1:]:
    s = open(f, encoding='utf-8').read()
    if 'window.LIDV=' in s: print('skip', f, '(already patched)'); continue
    assert 'function lidarHTML(' in s and 'function liFill(' in s and 'function lidKey(' in s, f + ': no LiDAR card pictures (v199+)'
    css = open(os.path.join(here, 'lidviews.css'), encoding='utf-8').read()
    js = open(os.path.join(here, 'lidviews.js'), encoding='utf-8').read()
    a = s.index('<div class="app">')
    s = s[:a] + '<style>\n' + css + '</style>\n' + s[a:]
    i = s.rindex('</script>') + len('</script>')
    s = s[:i] + '\n<script>\n' + js + '</script>' + s[i:]
    toc = '<a class="chip small" href="#k-legend">'
    if s.count(toc) == 1: s = s.replace(toc, '<a class="chip small" href="#k-lidv">LiDAR views</a>' + toc)
    h = '<h2 id="k-legend">'
    if s.count(h) == 1: s = s.replace(h, SEC + h)
    open(f, 'w', encoding='utf-8').write(s)
    print('ok', f, len(s))
