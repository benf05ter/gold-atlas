#!/usr/bin/env python3
"""grid.py sheet.jpg out.png [x0 y0 x1 y1] [step] : crop of a sheet with a labelled pixel grid (sheet pixel coords), for reading control points."""
import sys
from PIL import Image, ImageDraw
im=Image.open(sys.argv[1]).convert('RGB')
x0,y0,x1,y1=(map(int,sys.argv[3:7]) if len(sys.argv)>6 else (0,0,*im.size))
step=int(sys.argv[7]) if len(sys.argv)>7 else 100
c=im.crop((x0,y0,x1,y1)); d=ImageDraw.Draw(c)
for gx in range((x0//step+1)*step, x1, step):
    d.line([(gx-x0,0),(gx-x0,y1-y0)],fill=(255,0,255) if gx%500 else (255,0,0),width=1)
    for gy in range(y0+20,y1,300): d.text((gx-x0+2,gy-y0),str(gx),fill=(200,0,200))
for gy in range((y0//step+1)*step, y1, step):
    d.line([(0,gy-y0),(x1-x0,gy-y0)],fill=(0,160,255) if gy%500 else (0,0,255),width=1)
    for gx in range(x0+5,x1,300): d.text((gx-x0,gy-y0+2),str(gy),fill=(0,0,200))
c.save(sys.argv[2])
