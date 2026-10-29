# Township-line corner lookup from the Chippewa (1913 plat) and Clark (1893 plat) BLM corner sets.
# Key (t, r): t = north line of township t (= south line of t+1); r = west line of range r West (east ranges: r = 1-E, so 1E -> 0, 2E -> -1).
import json
DB={}
def add(t,r,p):
    DB.setdefault((t,r),[]).append(tuple(p))
for path in ['/mnt/project-files/research/plat-chippewa/twp_corners.json','/mnt/project-files/research/plat-clark/work/twp_corners.json']:
    for k,v in json.load(open(path)).items():
        t,rr=k.split('-'); t=int(t)
        r=int(rr[:-1]) if rr[-1] in 'WE' else int(rr)
        if rr.endswith('E'): r=1-r
        add(t,r,v['nw']); add(t,r-1,v['ne']); add(t-1,r,v['sw']); add(t-1,r-1,v['se'])
DB={k:(sum(p[0] for p in v)/len(v),sum(p[1] for p in v)/len(v)) for k,v in DB.items()}
DLON=0.12142; DLAT=0.08705
def corner(t,r):
    if (t,r) in DB: return DB[(t,r)],True
    # nearest known corner, nominal steps
    k=min(DB,key=lambda k:abs(k[0]-t)*1.3+abs(k[1]-r))
    lo,la=DB[k]; return (lo-(r-k[1])*DLON, la+(t-k[0])*DLAT),False
