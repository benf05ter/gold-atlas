# warp78.py spec.json name outdir : fit 1878 atlas page to PLSS township lines and warp to a lon/lat webp (alpha outside the county)
import sys,json,math,numpy as np
sys.path.insert(0,__file__.rsplit('/',1)[0])
from plss import corner
from PIL import Image, ImageDraw
spec=json.load(open(sys.argv[1]))[sys.argv[2]]; out=sys.argv[3]
src=Image.open(spec['img']).convert('RGB'); W,H=src.size
xs={int(k):v for k,v in spec['x'].items()}; ys={int(k):v for k,v in spec['y'].items()}
D=np.asarray(src.convert('L')).astype(float)<125
def refine(x,y,R=10,S=45):
    x,y=int(round(x)),int(round(y))
    def best(prof,c): 
        i=int(np.argmax(prof)); return c-R+i if prof[i]>0.25 else None
    cx=[D[max(0,y-S):y-8,x-R:x+R+1].mean(0), D[y+8:y+S,x-R:x+R+1].mean(0)]
    cy=[D[y-R:y+R+1,max(0,x-S):x-8].mean(1), D[y-R:y+R+1,x+8:x+S].mean(1)]
    bx=[b for b in (best(c,x) for c in cx if c.size) if b is not None]; by=[b for b in (best(c,y) for c in cy if c.size) if b is not None]
    return (np.mean(bx) if bx else x),(np.mean(by) if by else y)
g=[]
for t,y in ys.items():
    for r,x in xs.items():
        if [x,y] in spec.get('skip',[]): continue
        rx,ry=refine(x,y) if spec.get('refine',1) else (x,y)
        (lo,la),known=corner(t,r); g.append((rx,ry,lo,la,known))
skip=set(map(tuple,spec.get('skip',[])))
g=[p for p in g if (p[0],p[1]) not in skip]
def terms(x,y,o): return [1,x,y,x*y] if o=='bil' else ([1,x,y,x*y,x*x,y*y] if o=='q' else [1,x,y])
o=spec.get('order','aff')
A=np.array([terms(x,y,o) for x,y,*_ in g])
cl=np.linalg.lstsq(A,np.array([p[2] for p in g]),rcond=None)[0]; cb=np.linalg.lstsq(A,np.array([p[3] for p in g]),rcond=None)[0]
res=[math.hypot((A[i]@cl-p[2])*78900,(A[i]@cb-p[3])*111000) for i,p in enumerate(g)]
[print('  r',p[0],p[1],round(e)) for p,e in zip(g,res) if e>250]
print(sys.argv[2],'gcps',len(g),'known',sum(p[4] for p in g),'rms m',round(math.sqrt(np.mean(np.square(res)))),'max',round(max(res)))
# inverse: lon/lat -> pixel via fitted inverse (lstsq other direction)
B=np.array([terms(p[2],p[3],o) for p in g])
ix=np.linalg.lstsq(B,np.array([p[0] for p in g]),rcond=None)[0]; iy=np.linalg.lstsq(B,np.array([p[1] for p in g]),rcond=None)[0]
poly=spec['poly']  # county outline in page pixels
pts=[(float(np.array(terms(x,y,o))@cl),float(np.array(terms(x,y,o))@cb)) for x,y in poly]
L0,L1=min(p[0] for p in pts),max(p[0] for p in pts); B0,B1=min(p[1] for p in pts),max(p[1] for p in pts)
step=spec.get('step',0.0004)
nx,ny=int((L1-L0)/step*1.0)+1,int((B1-B0)/(step*0.711))+1
lon=L0+(np.arange(nx)+.5)*(L1-L0)/nx; lat=B1-(np.arange(ny)+.5)*(B1-B0)/ny
LO,LA=np.meshgrid(lon,lat)
T=np.stack([np.ones_like(LO),LO,LA]+([LO*LA] if o in('bil','q') else [])+([LO*LO,LA*LA] if o=='q' else []),-1)
PX=T@ix; PY=T@iy
if spec.get('tps',1):
    from scipy.interpolate import RBFInterpolator
    G=np.array([[p[2],p[3]] for p in g]); P=np.array([[p[0],p[1]] for p in g])
    fwd=RBFInterpolator(G*[0.711,1],P,kernel='thin_plate_spline',smoothing=spec.get('sm',0.0))
    q=np.stack([LO.ravel()*0.711,LA.ravel()],-1); r_=fwd(q); PX=r_[:,0].reshape(LO.shape); PY=r_[:,1].reshape(LO.shape)
    inv=RBFInterpolator(P,G,kernel='thin_plate_spline',smoothing=spec.get('sm',0.0))
    json.dump({'gcp':[[round(p[0],1),round(p[1],1),round(p[2],5),round(p[3],5)] for p in g]},open(f"{out}/{spec['file']}.gcp.json",'w'))
a=np.asarray(src).astype(float)
x0=np.clip(np.floor(PX).astype(int),0,W-2); y0=np.clip(np.floor(PY).astype(int),0,H-2); fx=np.clip(PX-x0,0,1)[...,None]; fy=np.clip(PY-y0,0,1)[...,None]
v=a[y0,x0]*(1-fx)*(1-fy)+a[y0,x0+1]*fx*(1-fy)+a[y0+1,x0]*(1-fx)*fy+a[y0+1,x0+1]*fx*fy
m=Image.new('L',(W,H),0); ImageDraw.Draw(m).polygon([tuple(p) for p in poly],fill=255)
ma=np.asarray(m)[np.clip(np.round(PY).astype(int),0,H-1),np.clip(np.round(PX).astype(int),0,W-1)]
ma[(PX<0)|(PX>=W)|(PY<0)|(PY>=H)]=0
rgba=np.dstack([v.astype(np.uint8),ma.astype(np.uint8)])
Image.fromarray(rgba,'RGBA').save(f"{out}/{spec['file']}.webp",quality=spec.get('q',62),method=6)
json.dump({'b':[round(L0,5),round(L1,5),round(B0,5),round(B1,5)],'rms':round(math.sqrt(np.mean(np.square(res)))),'px':[nx,ny],'cl':list(cl),'cb':list(cb),'o':o},open(f"{out}/{spec['file']}.json",'w'))
print(' bounds',[round(L0,4),round(L1,4),round(B0,4),round(B1,4)],'size',nx,ny)
