# LiDAR derivatives for card pictures: multi-direction hillshade, local relief model (LRM), sky-view factor (SVF).
# All take a 1 m bare-earth DEM (metres, NaN = no data) and return an RGB PIL image the same size.
import numpy as np
from scipy import ndimage
from PIL import Image,ImageDraw
def fill(d):
    m=np.isnan(d)
    if not m.any(): return d
    i=ndimage.distance_transform_edt(m,return_distances=False,return_indices=True)
    return d[tuple(i)]
def hill(d,az,alt=35,zf=1.5):
    gy,gx=np.gradient(d*zf); sl=np.pi/2-np.arctan(np.hypot(gx,gy)); asp=np.arctan2(-gx,gy)
    a=np.radians(az);b=np.radians(alt)
    return np.clip(np.sin(b)*np.sin(sl)+np.cos(b)*np.cos(sl)*np.cos(a-asp),0,1)
def mdow(d):
    """16-direction hillshade weighted toward directions facing each slope (no feature hides from one light)"""
    gy,gx=np.gradient(d); asp=np.arctan2(-gx,gy); acc=np.zeros_like(d); w=np.zeros_like(d)
    for az in range(0,360,360//16):
        wt=np.sin(asp-np.radians(az))**2+0.15; acc+=hill(d,az)*wt; w+=wt
    return acc/w
def lrm(d,k=25):
    """local relief: DEM minus its 25 m smoothed trend, so a 1 m bump on a hillside reads the same as on flat land"""
    return d-ndimage.uniform_filter(ndimage.uniform_filter(d,k),k)
def svf(d,r=12,n=16):
    """sky-view factor: share of the sky visible from each cell within r metres (low = hollow, ditch, cellar)"""
    H,W=d.shape; p=np.pad(d,r,mode='edge'); out=np.zeros_like(d)
    for i in range(n):
        t=2*np.pi*i/n; dx,dy=np.cos(t),np.sin(t); best=np.full(d.shape,-np.inf)
        for s in range(1,r+1):
            ox,oy=int(round(dx*s)),int(round(dy*s)); dist=np.hypot(ox,oy)
            if dist==0: continue
            sh=p[r+oy:r+oy+H,r+ox:r+ox+W]
            best=np.maximum(best,np.arctan((sh-d)/dist))
        out+=np.sin(np.maximum(best,0))
    return 1-out/n
def view_shade(d):
    h=mdow(d); lo,hi=np.percentile(h,[1,99.5]); h=np.clip((h-lo)/max(hi-lo,1e-3),0,1)
    g=(h*235+10).astype(np.uint8); return Image.fromarray(np.dstack([g]*3))
def view_lrm(d):
    """blue = hollow, red = raised, white = level, on a faint hillshade; colour scale stretches to the
    ground's own relief (0.3-1.5 m), so a 30 cm cellar rim still shows on flat farmland"""
    l=lrm(d); cl=float(np.clip(np.percentile(np.abs(l),95),0.3,1.5)); l=np.clip(l/cl,-1,1); h=mdow(d); lo,hi=np.percentile(h,[1,99.5]); h=0.55+0.45*np.clip((h-lo)/max(hi-lo,1e-3),0,1)
    r=np.where(l>0,1,1+l); g=1-np.abs(l)*0.85; b=np.where(l<0,1,1-l)
    r=np.where(l>0,1-0.15*l,r)
    rgb=np.dstack([r,g,b])*h[...,None]*255
    return Image.fromarray(np.clip(rgb,0,255).astype(np.uint8))
def view_svf(d):
    """sky-view blended with slope (VAT style): hollows and ditches dark, banks dark grey, level ground light"""
    v=svf(d); v=np.clip((v-0.85)/0.15,0,1)
    gy,gx=np.gradient(d); sl=np.degrees(np.arctan(np.hypot(gx,gy))); s=1-np.clip(sl/35,0,1)
    g=(0.65*v+0.35*s)*235+10
    return Image.fromarray(np.dstack([g]*3).astype(np.uint8))
VIEWS={'s':view_shade,'r':view_lrm,'v':view_svf}
def mark(im,half,marks=(),cross=(255,40,40)):
    px=im.width; dr=ImageDraw.Draw(im); c=px/2
    dr.line((c-8,c,c+8,c),fill=cross,width=2); dr.line((c,c-8,c,c+8),fill=cross,width=2)
    for (dx,dy) in marks:
        x=px/2+dx*px/(2*half); y=px/2-dy*px/(2*half); dr.ellipse((x-9,y-9,x+9,y+9),outline=(255,200,0),width=2)
    s=50*px/(2*half); dr.rectangle((8,px-14,8+s,px-10),fill=(255,255,255),outline=(0,0,0)); dr.text((12+s,px-22),'50 m',fill=(0,0,0))
    return im
