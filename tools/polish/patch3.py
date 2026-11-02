#!/usr/bin/env python3
"""Polish pass 3 (Nov 2 2026): offline spot cards keep their buttons; Drive mode ignores GPS jumps in the speed readout.
Usage: python3 -I tools/polish/patch3.py <index.html> [out]. Idempotent (marker POLISH3)."""
import sys
src = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else src
s = open(src, encoding='utf-8').read()
if 'POLISH3' in s: sys.exit('already has POLISH3')
def rep(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f'expected 1 match, found {n}: {old[:70]}')
    s = s.replace(old, new)
# 1. With no signal the card skipped everything after the aerial photo: no Directions / Start hunt / Permission buttons and no rank pill.
rep("  else return;\n  d.insertBefore(hero,h2);",
    "  else hero.dataset.none='1';   // POLISH3: no signal: no photo, but keep the rank pill and the Directions / Start hunt / Permission buttons\n  if(!hero.dataset.none) d.insertBefore(hero,h2);")
# 2. Drive status: a GPS jump (no speed from the phone, position leaps) showed silly speeds like 400 mph; keep the last speed instead.
rep("if((sp==null||isNaN(sp))&&dt>0) sp=dm/dt;",
    "if((sp==null||isNaN(sp))&&dt>0) sp=dm/dt>67?(DRV.spd||0):dm/dt;")
open(out, 'w', encoding='utf-8').write(s)
print('POLISH3 applied ->', out)
