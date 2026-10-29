#!/usr/bin/env python3
"""near.py roads.json lon lat [r_m]: named road segments near a point (to identify old streets)."""
import sys,json,math
R=json.load(open(sys.argv[1]));lo,la=float(sys.argv[2]),float(sys.argv[3]);r=float(sys.argv[4]) if len(sys.argv)>4 else 400
k=math.cos(math.radians(la))
for s in R:
    g=s['g']
    if any(math.hypot((p[0]-lo)*k*111320,(p[1]-la)*110540)<r for p in g):
        print('%-26s %-12s %s -> %s'%(s['n'],s['c'],g[0],g[-1]))
