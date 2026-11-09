#!/usr/bin/env python3
"""LiDAR switch with the map types (Nov 2026): puts a LiDAR tile in the map-type sheet next to Default / Satellite / Old maps,
with the see-through slider under it. Usage: python3 -I tools/lidar/patch_top.py <index.html> [out]. Idempotent (marker OGLIDTOP).
Needs the OGLIDAR block (tools/lidar/patch.py) first; the block goes just before </body>, after it."""
import sys, os
src = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else src
s = open(src, encoding='utf-8').read()
if 'OGLIDTOP' in s: sys.exit('already has OGLIDTOP')
if 'OGLIDAR' not in s: sys.exit('page has no OGLIDAR block; run tools/lidar/patch.py first')
block = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'top.html'), encoding='utf-8').read()
i = s.rfind('</body>')
if i < 0: sys.exit('no </body>')
s = s[:i] + block + s[i:]
open(out, 'w', encoding='utf-8').write(s)
print('OGLIDTOP added', out)
