#!/usr/bin/env python3
"""check.py spec.json mosaic.webp out.png [grp]: draw today's roads (red) over a fitted mosaic, downscaled, to eyeball the fit."""
import sys,json
from PIL import Image,ImageDraw
S=json.load(open(sys.argv[1])); g=sys.argv[4] if len(sys.argv)>4 else None
b=S['groups'][g]['b'] if g else S['b']
im=Image.open(sys.argv[2]).convert('RGBA'); W,H=im.size
bg=Image.new('RGBA',im.size,(255,255,255,255)); im=Image.alpha_composite(bg,im)
d=ImageDraw.Draw(im)
R=json.load(open(f"{sys.path[0]}/../roads/{S['id']}.json"))
f=lambda p:((p[0]-b[0])/(b[1]-b[0])*W,(b[3]-p[1])/(b[3]-b[2])*H)
for s in R:
    if s['c'] in ('footway','cycleway','path','steps'): continue
    d.line([f(p) for p in s['g']],fill=(255,0,0,255),width=3)
sc=1400/max(W,H); im.convert('RGB').resize((int(W*sc),int(H*sc))).save(sys.argv[3])
