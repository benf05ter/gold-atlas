# Old-topo contour vs today's 1 m LiDAR: where the old contour line no longer sits on its own height, ground was cut or filled
import numpy as np
from scipy import ndimage
from skimage.morphology import skeletonize
def brown(t):
    """contour brown: reddish-brown ink darker than the cream paper, not the saturated red of roads"""
    r,g,b=[x.astype(np.float32) for x in t]; mx=np.maximum(np.maximum(r,g),b); mn=np.minimum(np.minimum(r,g),b)
    sat=(mx-mn)/np.maximum(mx,1); h=np.degrees(np.arctan2(np.sqrt(3)*(g-b),2*r-g-b))%360
    return (h>4)&(h<38)&(sat>0.18)&(sat<0.62)&(mx<232)&(mx>70)&(r-b>35)&(r>=g)&(g>=b)
def lines(t,minpx=40,res=1.0):
    m=ndimage.binary_closing(brown(t),iterations=1)
    w=max(1,int(round(7/res)))                   # anything still there after a 7 m erosion is a tint or a blob, not a line
    blob=ndimage.binary_dilation(ndimage.binary_erosion(m,iterations=w),iterations=w+2)
    sk=skeletonize(m&~blob)
    lab,n=ndimage.label(sk,structure=np.ones((3,3)))
    sz=np.bincount(lab.ravel()); keep=sz>=minpx; keep[0]=False
    lab[~keep[lab]]=0; return lab
def resid(lab,d,dx=0,dy=0):
    """per-pixel LiDAR minus the line's own median height, with the topo shifted (dx,dy) pixels; returns res, line score"""
    ys,xs=np.nonzero(lab); l=lab[ys,xs]; yy,xx=ys+dy,xs+dx; ok=(yy>=0)&(yy<d.shape[0])&(xx>=0)&(xx<d.shape[1])
    ys,xs,l,yy,xx=ys[ok],xs[ok],l[ok],yy[ok],xx[ok]; e=d[yy,xx]; good=~np.isnan(e)
    ys,xs,l,e=ys[good],xs[good],l[good],e[good]
    if not len(e): return None
    o=np.argsort(l); ys,xs,l,e=ys[o],xs[o],l[o],e[o]; u,st=np.unique(l,return_index=True)
    med=np.zeros(l.max()+1); mad=np.zeros(l.max()+1)
    for a,b,k in zip(st,list(st[1:])+[len(l)],u):
        med[k]=np.median(e[a:b]); mad[k]=np.median(np.abs(e[a:b]-med[k]))
    return ys,xs,l,e-med[l],mad
def fit(lab,d,R=40):
    """best topo shift (pixels) by how well each old line holds one height on today's ground: coarse 8 m grid, then 2 m"""
    def sc(dx,dy):
        r=resid(lab,d,dx,dy); return 1e9 if r is None else np.mean(np.minimum(np.abs(r[3]),5))
    best=min(((sc(dx,dy),dx,dy) for dy in range(-R,R+1,8) for dx in range(-R,R+1,8)))
    _,bx,by=best
    return min(((sc(dx,dy),dx,dy) for dy in range(by-6,by+7,2) for dx in range(bx-6,bx+7,2)))
def tint(t):
    """the pink-red town tint of 1940s-60s maps (built-up area): contours there can't be read"""
    r,g,b=[x.astype(np.int16) for x in t]
    m=(r>200)&(r-g>35)&(abs(g-b)<30)
    return ndimage.uniform_filter(m.astype(np.float32),25)>0.35
def judge(t,d,pin=(300,300),err=30):
    """returns dict with checked/changed contour metres near the pin and the biggest cut/fill"""
    tn=tint(t)
    if tn.mean()>0.5: return dict(chk=0,town=1)
    if np.isnan(d).mean()>0.1: return dict(chk=0,gaps=1)
    lab=lines(t); lab[ndimage.binary_dilation(tn,iterations=10)]=0
    if lab.max()==0: return dict(chk=0)
    # the sheet's own georeferencing is trusted (fitting a shift per spot only slid the lines into agreement); the map's error
    # (USGS accuracy standard: 90% of points within 12 m at 1:24,000, 32 m at 1:62,500) goes into the tolerance as slope x err
    f=(0.0,0,0)
    ys,xs,l,res,mad=resid(lab,d,f[1],f[2])
    ok=mad[l]<2.5                       # lines that hold one height most of their length are contours
    ys,xs,res=ys[ok],xs[ok],res[ok]
    yy,xx=ys+f[2],xs+f[1]
    gy,gx=np.gradient(np.where(np.isnan(d),np.nanmean(d),d)); sl=np.hypot(gx,gy)
    tol=3.0+sl[np.clip(yy,0,d.shape[0]-1),np.clip(xx,0,d.shape[1]-1)]*err
    ch=np.abs(res)>tol
    
    sg=sl[np.clip(yy,0,d.shape[0]-1),np.clip(xx,0,d.shape[1]-1)]>0.04   # a contour only tests the ground where it crosses a slope
    # flat water today (hydro-flattened lake) where an old contour ran: flooded since the map
    wat=ndimage.uniform_filter((sl<0.002).astype(float),15)>0.97
    onw=wat[np.clip(yy,0,d.shape[0]-1),np.clip(xx,0,d.shape[1]-1)]
    # contours crossing today's water are left out: telling a flooded valley from a river crossing or shore text needs the old water too
    ch=ch&~onw; sg=sg&~onw; fl=np.zeros_like(onw)
    dist=np.hypot(yy-pin[0],xx-pin[1])
    out=dict(fitm=round(float(np.mean(np.minimum(np.abs(res),5))),2) if len(res) else 0)
    for R in (60,150,300):
        m=dist<=R; out[f'chk{R}']=int((m&sg&~ch).sum()); out[f'cut{R}']=int((m&ch&~fl&(res<0)).sum()); out[f'fill{R}']=int((m&ch&~fl&(res>0)).sum()); out[f'fl{R}']=int((m&fl).sum())
    m=(dist<=150)&ch&~fl
    out['maxcut']=round(float(-res[m&(res<0)].min()),1) if (m&(res<0)).any() else 0
    out['maxfill']=round(float(res[m&(res>0)].max()),1) if (m&(res>0)).any() else 0
    out['pts']=(yy,xx,res,ch,fl)
    return out
