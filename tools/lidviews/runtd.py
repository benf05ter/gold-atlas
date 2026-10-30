# Run the old-topo vs LiDAR check on every spot with a cached window and a chosen topo; one JSON line per spot
import json,os,sys,numpy as np,tdiff,topowin
from multiprocessing import Pool
PK=json.load(open('pick.json')); MONO=json.load(open('mono.json'))   # sheet -> [blue share, green share]
done=set()
if os.path.exists('td.jsonl'): done={json.loads(l)['id'] for l in open('td.jsonl')}
def go(i):
    try:
        z=np.load(f'dem/{i}.npz'); d=z['d'].astype(np.float32)/100; d[z['d']<0]=np.nan
        if np.isnan(d).mean()>0.3: return dict(id=i,skip='nolidar')
        m=MONO.get(PK[i]['k'])
        if not m or m[0]<0.0008: return dict(id=i,mono=1)   # one-colour printing: roads and text in the contour ink
        t=topowin.onto(PK[i]['k'],int(z['z']),float(z['x0']),float(z['y1']))
        o=tdiff.judge(t,d,err=15 if PK[i]['sc']<=31680 else 30); pts=o.pop('pts',None)
        o={k:(v.item() if hasattr(v,'item') else v) for k,v in o.items()}; o['id']=i; o['y']=PK[i]['y']; o['sc']=PK[i]['sc']
        if pts is not None:
            yy,xx,res,ch,fl=pts; m=ch|fl
            o['bad']=[[int(a),int(b),round(float(c),1),int(f)] for a,b,c,f in zip(yy[m],xx[m],res[m],fl[m])][::2]
        return o
    except Exception as e: return dict(id=i,err=str(e)[:100])
if __name__=='__main__':
    ids=[i for i in PK if i not in done and os.path.exists(f'dem/{i}.npz')]
    print(len(ids),flush=True)
    with Pool(10) as p, open('td.jsonl','a') as f:
        for n,o in enumerate(p.imap_unordered(go,ids,chunksize=4)):
            f.write(json.dumps(o)+'\n'); f.flush()
