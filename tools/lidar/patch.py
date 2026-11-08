#!/usr/bin/env python3
"""LiDAR view layer (Nov 2026): adds "LiDAR view (bare ground)" to the layers list, a USGS 3DEP / Iowa 2020 LiDAR hillshade
overlay with a see-through slider. Usage: python3 -I tools/lidar/patch.py <index.html> [out]. Idempotent (marker OGLIDAR).
Works on the Claude atlas page and on the app build; the block goes just before </body>."""
import sys, os
src = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else src
s = open(src, encoding='utf-8').read()
if 'OGLIDAR' in s: sys.exit('already has OGLIDAR')
for need in ('function tileLayer(', 'function renderLayers(', 'const ogMerc='):
    if need not in s: sys.exit('page has no ' + need)
block = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lidar.html'), encoding='utf-8').read()
i = s.rfind('</body>')
if i < 0: sys.exit('no </body>')
s = s[:i] + block + s[i:]
open(out, 'w', encoding='utf-8').write(s)
print('OGLIDAR added', out)
