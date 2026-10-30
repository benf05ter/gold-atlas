# Cache a 600 m, 1 m-LiDAR window (int32 cm) around every spot that has a card LiDAR picture
import json,os,sys,numpy as np
from multiprocessing import Pool
import dem
dem.IDX.update(json.load(open('tiles1m_mi.json')))
LI=json.load(open('lidimg.json')); P=[p for p in json.load(open('pts.json')) if p['id'] in LI and p.get('la')]
seen=set(); P=[p for p in P if not (p['id'] in seen or seen.add(p['id']))]
def go(p):
    f=f"dem/{p['id'].replace('/','_')}.npz"
    if os.path.exists(f): return p['id'],'cached'
    try: r=dem.window(p['lo'],p['la'],300)
    except Exception as e: return p['id'],'err '+str(e)[:60]
    if r is None: open(f+'.none','w'); return p['id'],'none'
    a,z,x0,y1,yr=r
    np.savez_compressed(f,d=np.where(np.isnan(a),-1,np.round(a*100)).astype(np.int32),z=z,x0=x0,y1=y1,yr=yr)
    return p['id'],yr
if __name__=='__main__':
    print(len(P),flush=True)
    with Pool(14) as pl:
        for r in pl.imap_unordered(go,P,chunksize=4): print(*r,flush=True)
