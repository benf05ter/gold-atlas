# Per-pin review tile: earliest 1924-58 USGS topo crop | 1 m LiDAR hillshade, both 600 m square centred on pin, 100 m tick grid
import json,os,sys,numpy as np,rasterio
from rasterio.windows import from_bounds
from pyproj import Transformer
from PIL import Image,ImageDraw
sys.path.insert(0,'/tmp/claude-0/pv'); os.environ['LCACHE']='/tmp/claude-0/pv/dem'
import fetch,viz
PL=json.load(open('/tmp/claude-0/pv/ht/plan.json')); NEED=PL['need']
S=300; R=300
import pyarrow.parquet as pq
OB=pq.read_table('/tmp/claude-0/pv/ov_b.parquet').column('bbox').to_pylist()
OBX=np.array([[b['xmin'],b['ymin'],b['xmax'],b['ymax']] for b in OB])
_tr={}
def topo(p,R=R):
    sid=PL['pin'].get(p['id'])
    if not sid: return None,None
    with rasterio.open(f'/tmp/claude-0/pv/ht/{sid}.tif') as d:
        k=d.crs.to_wkt()
        if k not in _tr: _tr[k]=Transformer.from_crs(4326,d.crs,always_xy=True)
        x,y=_tr[k].transform(p['lo'],p['la'])
        w=from_bounds(x-R,y-R,x+R,y+R,d.transform)
        a=d.read(window=w,boundless=True,fill_value=255,out_shape=(3,S,S),resampling=rasterio.enums.Resampling.bilinear)
    im=Image.fromarray(np.moveaxis(a,0,-1).astype(np.uint8)); b=NEED[sid]
    return im,f"{b['map_name']} {b['date_on_map']}"
def lidar(p):
    r=fetch.load(p['id']) if os.path.exists(f"/tmp/claude-0/pv/dem/{p['id']}.npz") else None
    if not r: return None,None
    d,z,x0,y1,yr=r
    im=viz.img(d).resize((S,S)); dr=ImageDraw.Draw(im)
    dla=R/111320; dlo=R/(111320*np.cos(np.radians(p['la'])))
    m=(OBX[:,2]>p['lo']-dlo)&(OBX[:,0]<p['lo']+dlo)&(OBX[:,3]>p['la']-dla)&(OBX[:,1]<p['la']+dla)
    for x0_,y0_,x1_,y1_ in OBX[m]:
        X=lambda lo:(lo-p['lo']+dlo)/(2*dlo)*S; Y=lambda la:(p['la']+dla-la)/(2*dla)*S
        dr.rectangle((X(x0_),Y(y1_),X(x1_),Y(y0_)),outline=(0,255,255))
    return im,str(yr)
def grid(im,col):
    dr=ImageDraw.Draw(im); c=S//2; s=S/600*100
    for i in range(-3,4):
        v=c+i*s; dr.line((v,c-4,v,c+4),fill=col); dr.line((c-4,v,c+4,v),fill=col)
    dr.ellipse((c-s*1.5,c-s*1.5,c+s*1.5,c+s*1.5),outline=col)  # 150 m ring
    dr.line((c-7,c,c+7,c),fill=(255,0,0),width=2); dr.line((c,c-7,c,c+7),fill=(255,0,0),width=2)
def tile(p,i):
    T=Image.new('RGB',(2*S+4,S+16),(20,20,20))
    t,tl=topo(p); l,ll=lidar(p)
    for k,(im,lab) in enumerate([(t,tl),(l,ll)]):
        if im is None: continue
        im=im.convert('RGB'); grid(im,(0,160,255) if k==0 else (255,255,0)); T.paste(im,(k*(S+4),16))
    ImageDraw.Draw(T).text((2,2),f"{i}. {p['n'][:46]} | {tl or '-'} | lidar {ll or '-'}",fill=(255,255,255))
    return T
def sheet(P,out,cols=3):
    ims=[tile(p,i) for i,p in enumerate(P)]; w,h=ims[0].size; rows=(len(ims)+cols-1)//cols
    Sh=Image.new('RGB',(w*cols+(cols-1)*6,h*rows+(rows-1)*6),(60,60,60))
    for i,im in enumerate(ims): Sh.paste(im,((i%cols)*(w+6),(i//cols)*(h+6)))
    Sh.save(out,quality=85)
if __name__=='__main__':
    P=[p for p in json.load(open('/tmp/claude-0/pv/pins-all.json')) if p['id'].startswith(sys.argv[1])]
    P.sort(key=lambda p:(p.get('pl','').split(',')[0],p['la']))
    a,b=int(sys.argv[2]),int(sys.argv[3]); sheet(P[a:b],sys.argv[4]); print(len(P))
