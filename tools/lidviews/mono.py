# per sheet: share of blue (water) pixels; one-colour printings (brown or black only) have none, and draw roads and text in the contour ink
import json,numpy as np,topowin,rasterio
from multiprocessing import Pool
from rasterio.windows import Window
def go(k):
    try:
        with rasterio.open(topowin.url(k)) as s:
            h,w=s.height,s.width; a=np.concatenate([s.read(window=Window(int(w*fx),int(h*fy),900,900)).reshape(3,-1) for fx in (.2,.45,.7) for fy in (.2,.45,.7)],1).astype(np.int16)
    except Exception as e: return k,None
    r,g,b=a
    blue=(b>r+25)&(b>g-5); green=(g>r+20)&(g>b+10)
    return k,[round(float(blue.mean()),4),round(float(green.mean()),4)]
if __name__=='__main__':
    ks=sorted(set(v['k'] for v in json.load(open('pick.json')).values()))
    with Pool(12) as p: R=dict(p.map(go,ks))
    json.dump(R,open('mono.json','w'),indent=0); v=np.array([x[0] for x in R.values() if x])
    print(len(R),np.histogram(v,bins=[0,.0005,.001,.002,.005,.01,.02,.05,1]))
    for k,x in R.items():
        if x and any(s in k for s in ('Welch','Black Earth_500159','Galesville_503260','Duluth_504378','Osseo_802986')): print(k.split('/')[-1],x)
