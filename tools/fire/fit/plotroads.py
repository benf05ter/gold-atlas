#!/usr/bin/env python3
"""plotroads.py roads.json out.png lon lat r_m : today's named roads around a point, north up, 0.5 m/px... labelled."""
import sys,json,math
from PIL import Image,ImageDraw
R=json.load(open(sys.argv[1])); lon,lat,r=map(float,sys.argv[3:6]); k=math.cos(math.radians(lat))*111320
W=1000; s=W/(2*r)
im=Image.new('RGB',(W,W),'white'); d=ImageDraw.Draw(im)
P=lambda p:((p[0]-lon)*k*s+W/2, W/2-(p[1]-lat)*110540*s)
segs=R if isinstance(R,list) else R.get('segs',R)
for sg in segs:
    g=sg['g']; pts=[P(p) for p in g]
    d.line(pts,fill=(200,0,0) if sg.get('n') else (200,200,200),width=2)
    if sg.get('n') and len(pts)>1:
        m=pts[len(pts)//2]; d.text(m,sg['n'],fill=(0,0,0))
d.line([(20,W-20),(20+100*s,W-20)],fill='black',width=3); d.text((20,W-40),'100 m',fill='black')
im.save(sys.argv[2])
