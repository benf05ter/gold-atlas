# Cuts the old-map pictures into map tiles at build time, so the phone only ever draws small pictures (no 30,000 px images when zoomed in).
#   python3 -I tools/tiles/tiler.py <spec.json> <out-dir> [layer,layer]   (with layers named, only those, into index-<names>.json to merge)
# spec: {"layers":{"<id>":{"zmin":7,"zmax":13,"sharpen":0.6,"stretch":true,"src":[...]}}}  sources, bottom first:
#   {"img":"om/h250_x.webp","b":[lon0,lon1,lat0,lat1]}                      a lon/lat-aligned picture (the atlas side files)
#   {"tif":"x_geo.tif","quad":[lon0,lon1,lat0,lat1],"clip":[lon0,lon1,lat0,lat1]}   a USGS GeoTIFF cut to its printed quad (NAD27), optional clip box (WGS84)
# Writes <out>/<id>/<z>/<x>_<y>.webp as 512 px tiles (two screen pixels per tile pixel on a phone: one zoom level sharper than 256 px tiles)
# and <out>/index.json = {"<id>":{"z":[zmin,zmax],"t":{"<z>":"x_y,x_y,..."}}} so the app never asks for a tile that doesn't exist.
import sys,os,json,math,numpy as np
from PIL import Image,ImageFilter
T=512
spec=json.load(open(sys.argv[1])); out=sys.argv[2]; base=os.path.dirname(os.path.abspath(sys.argv[1]))
def merc_xy(lo,la,z): n=2**z; r=np.radians(la); return (lo+180)/360*n, (1-np.log(np.tan(r)+1/np.cos(r))/np.pi)/2*n
def merc_ll(x,y,z): n=2**z; lo=x/n*360-180; la=np.degrees(np.arctan(np.sinh(np.pi*(1-2*y/n)))); return lo,la
def stretch(a):   # light contrast stretch per channel: 0.5% and 99.5% to the full range, never more than 1.35x
    a=a.astype(np.float32); o=np.empty_like(a)
    for c in range(3):
        lo,hi=np.percentile(a[...,c][::7,::7],[0.5,99.5]); k=min(1.35,255/max(1,hi-lo)); o[...,c]=(a[...,c]-lo)*k
    return np.clip(o,0,255).astype(np.uint8)
class Src:
    def __init__(s,d,L):
        s.d=d; s.a=None; s.L=L
        if 'img' in d: s.bb=d['b']
        else:
            import rasterio; from pyproj import Transformer
            s.T=rasterio.open(os.path.join(base,d['tif'])); q=d['quad']
            s.to=Transformer.from_crs('EPSG:4326',s.T.crs,always_xy=True); s.t27=Transformer.from_crs('EPSG:4326','EPSG:4267',always_xy=True)
            c=d.get('clip',q); s.bb=[max(q[0],c[0])-0.01,min(q[1],c[1])+0.01,max(q[2],c[2])-0.01,min(q[3],c[3])+0.01]
    def load(s):
        if s.a is not None: return
        if 'img' in s.d:
            im=Image.open(os.path.join(base,s.d['img'])); s.a=np.asarray(im.convert('RGB'))
            if im.mode in ('RGBA','LA','PA'): s.al=np.asarray(im.getchannel('A'))   # pictures with see-through parts (the 1913 plat mosaic) keep them
        else: s.a=np.moveaxis(s.T.read([1,2,3]),0,-1)
        if s.L.get('stretch'): s.a=stretch(s.a)
    def sample(s,LO,LA):   # -> rgb (h,w,3) float, alpha (h,w) float
        s.load(); a=s.a; H,W=a.shape[:2]
        if 'img' in s.d:
            l0,l1,b0,b1=s.d['b']; X=(LO-l0)/(l1-l0)*W-0.5; Y=(b1-LA)/(b1-b0)*H-0.5; m=(LO>=l0)&(LO<l1)&(LA>=b0)&(LA<b1)
        else:
            q=s.d['quad']; c=s.d.get('clip',[-999,999,-99,99]); l27,b27=s.t27.transform(LO,LA)
            m=(l27>=q[0])&(l27<q[1])&(b27>=q[2])&(b27<q[3])&(LO>=c[0])&(LO<c[1])&(LA>=c[2])&(LA<c[3])
            px,py=s.to.transform(LO,LA); inv=~s.T.transform; X,Y=inv*(px,py); X=X-0.5; Y=Y-0.5
        X=np.clip(X,0,W-1.001); Y=np.clip(Y,0,H-1.001); x0=X.astype(int); y0=Y.astype(int); fx=(X-x0)[...,None]; fy=(Y-y0)[...,None]
        rgb=(a[y0,x0]*(1-fx)*(1-fy)+a[y0,x0+1]*fx*(1-fy)+a[y0+1,x0]*(1-fx)*fy+a[y0+1,x0+1]*fx*fy)
        if getattr(s,'al',None) is not None: m=m*(s.al[np.rint(Y).astype(int),np.rint(X).astype(int)]/255.0)
        return rgb,m.astype(np.float32)
idx={}
for lid,L in spec['layers'].items():
    if len(sys.argv)>3 and lid not in sys.argv[3].split(','): continue
    zmin,zmax=L['zmin'],L['zmax']; srcs=[Src(d,L) for d in L['src']]; tiles={}
    # top zoom: sample every source under each tile
    z=zmax; todo=set()
    for s in srcs:
        x0,y1=merc_xy(s.bb[0],s.bb[2],z); x1,y0=merc_xy(s.bb[1],s.bb[3],z)
        for x in range(int(x0),int(x1)+1):
            for y in range(int(y0),int(y1)+1): todo.add((x,y))
    g=(np.arange(T)+0.5)/T; cur={}
    for i,(x,y) in enumerate(sorted(todo)):
        LO,LA=merc_ll(x+g[None,:],y+g[:,None],z); LO=np.broadcast_to(LO,(T,T)); LA=np.broadcast_to(LA,(T,T))
        rgb=np.zeros((T,T,3),np.float32); al=np.zeros((T,T),np.float32)
        for s in srcs:
            if s.bb[1]<LO.min() or s.bb[0]>LO.max() or s.bb[3]<LA.min() or s.bb[2]>LA.max(): continue
            c,m=s.sample(LO,LA); rgb=rgb*(1-m[...,None])+c*m[...,None]; al=np.maximum(al,m)
        if al.max()==0: continue
        im=Image.fromarray(np.dstack([np.clip(rgb,0,255),al*255]).astype(np.uint8),'RGBA')
        if L.get('sharpen'): a_=im.getchannel('A'); im=im.convert('RGB').filter(ImageFilter.UnsharpMask(radius=1.1,percent=int(100*L['sharpen']),threshold=2)); im.putalpha(a_)
        cur[(x,y)]=im
        if i%200==0: print(lid,z,i,len(todo),flush=True)
    for z in range(zmax,zmin-1,-1):
        if z<zmax:   # each lower level is its four children shrunk
            par={}
            for (x,y),im in cur.items(): par.setdefault((x//2,y//2),[]).append(((x%2,y%2),im))
            nxt={}
            for k,ch in par.items():
                big=Image.new('RGBA',(2*T,2*T),(0,0,0,0))
                for (dx,dy),im in ch: big.paste(im,(dx*T,dy*T))
                nxt[k]=big.resize((T,T),Image.LANCZOS)
            cur=nxt
        d=os.path.join(out,lid,str(z)); os.makedirs(d,exist_ok=True); keys=[]
        for (x,y),im in cur.items():
            a=np.asarray(im.getchannel('A'))
            if a.max()<8: continue
            (im if a.min()<250 else im.convert('RGB')).save(os.path.join(d,f'{x}_{y}.webp'),'WEBP',quality=L.get('q',78),method=5)
            keys.append(f'{x}_{y}')
        tiles[str(z)]=','.join(sorted(keys)); print(lid,'z',z,len(keys),'tiles',flush=True)
    for s in srcs: s.a=None; s.al=None
    idx[lid]={'z':[zmin,zmax],'t':tiles}
ip=os.path.join(out,'index.json'); old=json.load(open(ip)) if os.path.exists(ip) else {}   # layers can be cut in separate runs
if len(sys.argv)>3: ip=os.path.join(out,f'index-{sys.argv[3]}.json'); old={}
old.update(idx); json.dump(old,open(ip,'w'),separators=(',',':'))
