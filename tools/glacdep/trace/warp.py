import numpy as np, json
from PIL import Image
from pyproj import Transformer
lab=np.load('lab13.npy'); f=json.load(open('fit.json'))
s,th,tx,ty=f['p']; c,sn=np.cos(th),np.sin(th)
T=Transformer.from_crs('EPSG:4326',f['proj'],always_xy=True)
K=np.cos(np.radians(45))
LON0,LON1,LAT0,LAT1=-92.95,-86.75,42.45,47.15
def grid(dlat):
    dlon=dlat/K
    lons=np.arange(LON0+dlon/2,LON1,dlon); lats=np.arange(LAT1-dlat/2,LAT0,-dlat)
    LO,LA=np.meshgrid(lons,lats); X,Y=T.transform(LO,LA)
    u=s*(c*X-sn*Y)+tx; v=-s*(sn*X+c*Y)+ty
    ui=np.round(u).astype(int); vi=np.round(v).astype(int)
    ok=(ui>=0)&(ui<lab.shape[1])&(vi>=0)&(vi<lab.shape[0])
    out=np.zeros(LO.shape,np.uint8); out[ok]=lab[vi[ok],ui[ok]]
    return out
hi=grid(0.003); print(hi.shape)
pal=np.zeros((7,4),np.uint8)
pal[1]=[168,40,36,255]; pal[2]=[120,170,80,255]; pal[3]=[226,186,40,255]; pal[4]=[240,140,50,255]; pal[5]=[60,120,210,255]; pal[6]=[0,0,0,0]
Image.fromarray(pal[hi],'RGBA').save('glac.png')
Image.fromarray(pal[hi],'RGBA').save('glac.webp',lossless=True,quality=100,method=6)
lo=grid(0.01); print(lo.shape)
# RLE over rows: string of chars, class digit + run length base36
flat=lo.ravel(); runs=[]; i=0
while i<len(flat):
    j=i
    while j<len(flat) and flat[j]==flat[i] and j-i<1295: j+=1
    runs.append(str(flat[i])+np.base_repr(j-i,36).lower().rjust(2,'0')); i=j
rle=''.join(runs); print(len(rle))
json.dump({'w':lo.shape[1],'h':lo.shape[0],'lon0':LON0,'lat1':LAT1,'dlat':0.01,'dlon':0.01/K,'rle':rle},open('glacgrid.json','w'))
