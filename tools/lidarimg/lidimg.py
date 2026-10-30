# Card LiDAR picture: 1 m LiDAR hillshade (red = raised, blue = hollow), centre crop, pin cross, 50 m scale bar
import io,os,sys,base64,numpy as np
sys.path.insert(0,'/tmp/claude-0/pv'); os.environ['LCACHE']='/tmp/claude-0/pv/dem'
import fetch,viz
from PIL import ImageDraw
def render(pid,half=180,px=360,q=58,marks=()):
    r=fetch.load(pid) if os.path.exists(f'/tmp/claude-0/pv/dem/{pid}.npz') else None
    if not r: return None
    d=r[0]; c=d.shape[0]//2
    if np.isnan(d).mean()>0.5: return None
    d=d[c-half:c+half,c-half:c+half]
    im=viz.img(d).resize((px,px)); dr=ImageDraw.Draw(im)
    for (dx,dy) in marks:  # metres east, north of the pin
        x=px/2+dx*px/(2*half); y=px/2-dy*px/(2*half); dr.ellipse((x-9,y-9,x+9,y+9),outline=(255,230,0),width=2)
    s=50*px/(2*half); dr.rectangle((8,px-14,8+s,px-10),fill=(255,255,255)); dr.text((12+s,px-20),'50 m',fill=(255,255,255))
    b=io.BytesIO(); im.save(b,'WEBP',quality=q,method=6); return base64.b64encode(b.getvalue()).decode(), int(r[4])
if __name__=='__main__':
    for pid in sys.argv[1:]:
        x=render(pid); print(pid, x and len(x[0]), x and x[1])
        if x: open(f'/tmp/claude-0/pv/li_{pid}.webp','wb').write(base64.b64decode(x[0]))
