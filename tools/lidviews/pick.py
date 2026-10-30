# choose one old topo per spot: the oldest 1:24,000-1:48,000 sheet (<=1964) covering the window, else the oldest 1:62,500
import json
H=json.load(open('htmc_b.json')); P=json.load(open('pts.json')); LI=json.load(open('lidimg.json'))
import math
def neat(b):
    """the map's neatline: the largest whole 7.5', 15' or 30' quad cell inside the scan (the scan's bounds include the white collar)"""
    for s in (0.5,0.25,0.125):
        x0=math.ceil(b[0]/s-1e-6)*s; y0=math.ceil(b[1]/s-1e-6)*s
        if x0+s<=b[2]+1e-6 and y0+s<=b[3]+1e-6: return (x0,y0,x0+s,y0+s)
    return None
def cover(h,p,m=0.004):
    b=h.get('nb')
    if b is None: b=h['nb']=neat(h['b']) or ()
    return bool(b) and b[0]+m<p['lo']<b[2]-m and b[1]+m<p['la']<b[3]-m
out={}
for p in P:
    if p['id'] not in LI or not p.get('la'): continue
    c=[h for h in H if cover(h,p)]
    if not c: continue
    big=[h for h in c if h['sc']<=48000]; pool=big or c
    h=min(pool,key=lambda h:(h['y'],h['sc']))
    out[p['id']]=dict(k=h['k'],y=h['y'],sc=h['sc'],res=h['res'])
json.dump(out,open('pick.json','w'))
import collections; print(len(out),collections.Counter(v['sc'] for v in out.values()),collections.Counter(v['y']//10*10 for v in out.values()),len(set(v['k'] for v in out.values())))
