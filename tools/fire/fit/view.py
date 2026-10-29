#!/usr/bin/env python3
"""view.py sheet out.png [x0 y0 x1 y1] [step] [maxw]: grid crop scaled down to maxw (default 1300) for reading."""
import sys,subprocess,os
from PIL import Image
a=sys.argv; tmp=a[2]+'.tmp.png'
subprocess.run([sys.executable,os.path.dirname(__file__)+'/grid.py',a[1],tmp]+a[3:8],check=True)
im=Image.open(tmp); mw=int(a[8]) if len(a)>8 else 1300
if im.width>mw: im=im.resize((mw,round(im.height*mw/im.width)),Image.LANCZOS)
im.save(a[2]); os.remove(tmp)
