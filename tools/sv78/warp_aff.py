# warp_aff.py img gcps.json outname q : affine (>=3 GCPs [x,y,lon,lat]) page -> lon/lat RGBA webp, optional polygon mask
import sys,json,math,numpy as np
from PIL import Image,ImageDraw
img,gj,out=sys.argv[1],json.load(open(sys.argv[2])),sys.argv[3]
g=gj['gcp']; src=Image.open(img).convert('RGB'); W,H=src.size
A=np.array([[1,x,y] for x,y,_,_ in g]); cl=np.linalg.lstsq(A,[p[2] for p in g],rcond=None)[0]; cb=np.linalg.lstsq(A,[p[3] for p in g],rcond=None)[0]
B=np.array([[1,p[2],p[3]] for p in g]); ix=np.linalg.lstsq(B,[p[0] for p in g],rcond=None)[0]; iy=np.linalg.lstsq(B,[p[1] for p in g],rcond=None)[0]
poly=gj['poly']; pts=[(cl@[1,x,y],cb@[1,x,y]) for x,y in poly]
L0,L1=min(p[0] for p in pts),max(p[0] for p in pts); B0,B1=min(p[1] for p in pts),max(p[1] for p in pts)
step=gj.get('step',0.00006); nx=int((L1-L0)/step)+1; ny=int((B1-B0)/(step*0.711))+1
LO,LA=np.meshgrid(L0+(np.arange(nx)+.5)*(L1-L0)/nx, B1-(np.arange(ny)+.5)*(B1-B0)/ny)
PX=ix[0]+ix[1]*LO+ix[2]*LA; PY=iy[0]+iy[1]*LO+iy[2]*LA
a=np.asarray(src).astype(float)
x0=np.clip(np.floor(PX).astype(int),0,W-2); y0=np.clip(np.floor(PY).astype(int),0,H-2); fx=np.clip(PX-x0,0,1)[...,None]; fy=np.clip(PY-y0,0,1)[...,None]
v=a[y0,x0]*(1-fx)*(1-fy)+a[y0,x0+1]*fx*(1-fy)+a[y0+1,x0]*(1-fx)*fy+a[y0+1,x0+1]*fx*fy
m=Image.new('L',(W,H),0); ImageDraw.Draw(m).polygon([tuple(p) for p in poly],fill=255)
ma=np.asarray(m)[np.clip(np.round(PY).astype(int),0,H-1),np.clip(np.round(PX).astype(int),0,W-1)].copy(); ma[(PX<0)|(PX>=W)|(PY<0)|(PY>=H)]=0
Image.fromarray(np.dstack([v.astype(np.uint8),ma]),'RGBA').save(out+'.webp',quality=int(sys.argv[4]) if len(sys.argv)>4 else 62,method=6)
json.dump({'b':[round(L0,5),round(L1,5),round(B0,5),round(B1,5)],'px':[nx,ny],'cl':list(cl),'cb':list(cb)},open(out+'.json','w'))
print(out,[round(L0,4),round(L1,4),round(B0,4),round(B1,4)],nx,ny, 'm/px x', round((cl[1])*78900,1),'y',round(-cb[2]*111000,1))
