# grid.py x0 y0 x1 y1 step scale -> grid crop of full-res page 1 with labelled lines (full-res coords)
import sys
from PIL import Image,ImageDraw
x0,y0,x1,y1,st=map(int,sys.argv[1:6]); sc=float(sys.argv[6])
im=Image.open('p-000.png').convert('RGB').crop((x0,y0,x1,y1)); im=im.resize((int((x1-x0)*sc),int((y1-y0)*sc)))
d=ImageDraw.Draw(im)
for X in range((x0//st+1)*st,x1,st):
    px=(X-x0)*sc; d.line([(px,0),(px,im.size[1])],fill=(0,140,255),width=1); d.text((px+2,2),str(X),fill=(0,0,255))
for Y in range((y0//st+1)*st,y1,st):
    py=(Y-y0)*sc; d.line([(0,py),(im.size[0],py)],fill=(0,140,255),width=1); d.text((2,py+2),str(Y),fill=(0,0,255))
im.save(f'g_{x0}_{y0}.png')
