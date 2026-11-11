#!/usr/bin/env python3
"""Smoothing pass 1 (Nov 11 2026, marker OGSMOOTH1): white screen when zooming out on iPhone.
Usage: python3 -I tools/smooth/patch.py <index.html> [out]. Refuses to run twice. Restamp sw.js VERSION afterwards.

Cause: every map tile faded in with its own CSS opacity transition. On iPhone (WebKit) an element with a running opacity
transition gets its own graphics layer, and every tile drawn above it gets one too (overlap). A zoom-out swaps the whole
screen of tiles at once, in up to four tile layers (street, relief, LiDAR, Iowa LiDAR), so ~150 layers were alive together,
many of them stand-in tiles drawn 4-16x bigger than 256 px (the z-3 backdrop and the overzoomed relief/LiDAR tiles since
the deeper zoom). Each gets a backing store up to a screen at 3x, which is ~1 GB and iOS kills the page (white screen).
Fix: tiles appear without a per-tile fade (the old tiles stay underneath until the new ones are in, so nothing flashes),
and the farthest zoom-out is 1.6x the region instead of 2.5x (the region was a small blob in a sea of blank world tiles)."""
import sys
src = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else src
s = open(src, encoding='utf-8').read()
if 'OGSMOOTH1' in s: sys.exit('already has OGSMOOTH1')
def rep(old, new, n=1):
    global s
    c = s.count(old)
    if c != n: sys.exit(f'expected {n} match(es), found {c}: {old[:80]}')
    s = s.replace(old, new)
# 1. no per-tile fade (one graphics layer per fading tile on iPhone)
rep('.ogtile{position:absolute;display:block;max-width:none;max-height:none;opacity:0;transition:opacity .18s ease;image-rendering:auto;-webkit-user-drag:none}',
    '.ogtile{position:absolute;display:block;max-width:none;max-height:none;opacity:0;image-rendering:auto;-webkit-user-drag:none}/*OGSMOOTH1: no per-tile fade*/')
# 2. farthest zoom-out: 1.6x the region (was 2.5x)
rep('V.WI.w*2.5', 'V.WI.w*1.6', 3)
open(out, 'w', encoding='utf-8').write(s)
print('OGSMOOTH1 applied ->', out)
