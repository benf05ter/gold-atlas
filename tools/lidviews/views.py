# Extra card LiDAR views: one grey local-relief picture per spot with a card picture (each cell minus its 25 m surroundings,
# 128 = level, +-120 = +-cl metres). The app colours it (Local relief) and works sky-view from it on the phone, so one small file serves both.
# Writes <out>/<chunk>.r.json beside the app's img/<chunk>.json with the same ids: {"id":"<cl>|<webp base64>"}.
# usage: views.py lidimg.json pts.json outdir
import sys,os,json,io,base64,numpy as np
from concurrent.futures import ProcessPoolExecutor
from PIL import Image,ImageFilter
import deriv
LI=json.load(open(sys.argv[1])); P={p['id']:p for p in json.load(open(sys.argv[2]))}; out=sys.argv[3]
def one(i):
    f=f"dem/{i.replace('/','_')}.npz"
    if not os.path.exists(f): return i,None
    z=np.load(f); d=z['d'].astype(np.float32)/100; d[z['d']<0]=np.nan
    big=LI[i].startswith('@l-'); half=300 if big else 180; c=300; d=d[c-half:c+half,c-half:c+half]
    if np.isnan(d).mean()>0.5: return i,None
    l=deriv.lrm(deriv.fill(d)); cl=float(np.clip(np.percentile(np.abs(l),95),0.3,1.5))
    im=Image.fromarray((np.clip(l/cl,-1,1)*120+128).astype(np.uint8)).resize((256,256),Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.6))
    b=io.BytesIO(); im.save(b,'WEBP',quality=35,method=6)
    return i,f'{cl:.2f}|'+base64.b64encode(b.getvalue()).decode()
if __name__=='__main__':
    ids=[i for i in LI if i in P and LI[i].startswith('@')]
    with ProcessPoolExecutor(4) as ex: R=dict(ex.map(one,ids,chunksize=16))
    B={}
    for i,r in R.items():
        if r: B.setdefault(LI[i][1:]+'.r',{})[i]=r
    for k,b in B.items(): json.dump(b,open(f'{out}/{k}.json','w'),separators=(',',':'))
    print(len(ids),'ids',sum(1 for r in R.values() if r),'rendered',len(B),'files',file=sys.stderr)
