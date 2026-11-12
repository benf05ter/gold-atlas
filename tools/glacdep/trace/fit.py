# Fits the scanned map to the atlas Wisconsin outline: projected outline -> page pixels by a similarity (+ optional affine/quad), maximising overlap.
import numpy as np, json, sys
from pyproj import Transformer
from skimage.draw import polygon as dpoly
from scipy.optimize import minimize
from scipy import ndimage as nd
st=np.load('state_mask.npy'); H,W=st.shape
ring=np.array(json.load(open('wi.json'))[0])
# densify
d=[]
for i in range(len(ring)):
    a,b=ring[i],ring[(i+1)%len(ring)]
    for t in np.linspace(0,1,8,endpoint=False): d.append(a+(b-a)*t)
ring=np.array(d)
projs={'lcc3345':'+proj=lcc +lat_1=33 +lat_2=45 +lat_0=23 +lon_0=-90 +datum=WGS84','alb':'+proj=aea +lat_1=29.5 +lat_2=45.5 +lat_0=23 +lon_0=-90 +datum=WGS84','wtm':'+proj=tmerc +lat_0=0 +lon_0=-90 +k=0.9996 +datum=WGS84','eqc':'+proj=eqc +lat_ts=44.75 +lon_0=-90'}
# boundary distance map of scan
edge=st ^ nd.binary_erosion(st)
dt=nd.distance_transform_edt(~edge)
best=None
for name,pj in projs.items():
    T=Transformer.from_crs('EPSG:4326',pj,always_xy=True); X,Y=T.transform(ring[:,0],ring[:,1]); X=np.array(X); Y=np.array(Y)
    # init from bbox
    bx=np.argwhere(st); (r0,c0),(r1,c1)=bx.min(0),bx.max(0)
    s0=(c1-c0)/(X.max()-X.min())
    def mp(p,X=X,Y=Y):
        s,th,tx,ty=p[:4]; c,sn=np.cos(th),np.sin(th)
        u=s*(c*X - sn*Y)+tx; v=-s*(sn*X + c*Y)+ty
        return u,v
    def cost(p):
        u,v=mp(p); ui=np.clip(u,0,W-1).astype(int); vi=np.clip(v,0,H-1).astype(int)
        return np.mean(np.minimum(dt[vi,ui],40)**2)
    p0=[s0,0,c0-s0*X.min(),r0+s0*Y.max()]
    r=minimize(cost,p0,method='Nelder-Mead',options={'maxiter':6000,'xatol':1e-9,'fatol':1e-6,'initial_simplex':None})
    for k in range(3): r=minimize(cost,r.x,method='Nelder-Mead',options={'maxiter':6000})
    u,v=mp(r.x); dd=dt[np.clip(v,0,H-1).astype(int),np.clip(u,0,W-1).astype(int)]
    print(name,'rms px',np.sqrt(r.fun).round(2),'median',np.median(dd).round(2),'p90',np.percentile(dd,90).round(1),r.x)
    if best is None or r.fun<best[1]: best=(name,r.fun,r.x)
json.dump({'proj':projs[best[0]],'name':best[0],'p':list(best[2])},open('fit.json','w'))
print('best',best[0])
