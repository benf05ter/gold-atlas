#!/usr/bin/env python3
"""Deeper zoom (Nov 2026): the closest zoom was a map 0.015 units wide (about 1.7 km across a phone screen). Two more levels:
0.00375 (about 420 m across a phone). Tiles over-zoom past each source's own top level (tileLayer max), so nothing goes blank.
Usage: python3 -I tools/zoom/deeper.py <index.html> [out]. Idempotent (marker OGZMIN). tools/build.py calls deepen()."""
import sys
A = 'function zoomAt(f,cx,cy){ let nw=vb.w/f; if(!(nw>0)) return; const lo=Math.min(0.015,vb.w),'
B = 'if(nw>=0.015&&nw<=V.WI.w*2.5){'
def deepen(s):
    if 'OGZMIN' in s: return s
    for n in (A, B):
        if s.count(n) != 1: raise SystemExit('deeper.py: expected one copy of: ' + n)
    s = s.replace(A, 'var OGZMIN=0.00375;   // closest zoom, map units wide (was 0.015; two levels deeper, Nov 2026)\n'
                  + A.replace('Math.min(0.015,vb.w)', 'Math.min(OGZMIN,vb.w)'))
    return s.replace(B, 'if(nw>=Math.min(OGZMIN,vb.w)&&nw<=V.WI.w*2.5){')
if __name__ == '__main__':
    src = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else src
    s = open(src, encoding='utf-8').read()
    if 'OGZMIN' in s: sys.exit('already has OGZMIN')
    open(out, 'w', encoding='utf-8').write(deepen(s)); print('OGZMIN added', out)
