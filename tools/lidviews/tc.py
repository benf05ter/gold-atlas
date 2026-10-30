# td.jsonl -> img/tc.json for the app: verdict per spot plus the changed stretches (600 m window, 3 m steps)
# verdict: I intact (>=150 m of old contour on slopes within 150 m, <=3% off), D changed (>=20 m and >=5% off)
# sheets that misfit by more than 1.5 m on average around the spot are left out (map too far off to judge)
import json,math,sys,collections
R={}
for l in open('td.jsonl'):
    r=json.loads(l); R[r['id']]=r
import numpy as np
def tighten(r,chk):
    """second look at the changed stretches: a wider slope allowance (scans are often 10-20 m off on top of the map's own error, which
    shows as false cuts along steep banks) and no isolated dots (a real cut or fill runs on for several metres)"""
    z=np.load(f"dem/{r['id']}.npz"); d=z['d'].astype(np.float32)/100; d[z['d']<0]=np.nan
    gy,gx=np.gradient(np.where(np.isnan(d),np.nanmean(d),d)); sl=np.hypot(gx,gy); err=25 if r['sc']<=31680 else 40
    B=[b for b in r.get('bad',[]) if b[3] or abs(b[2])>3.0+sl[min(b[0],599),min(b[1],599)]*err]
    A=np.array([[b[0],b[1]] for b in B]) if B else np.zeros((0,2))
    keep=[b for b in B if (np.hypot(A[:,0]-b[0],A[:,1]-b[1])<=6).sum()>=4]
    near=[b for b in keep if np.hypot(b[0]-300,b[1]-300)<=150]
    cut=2*sum(1 for b in near if b[2]<0 and not b[3]); fill=2*sum(1 for b in near if b[2]>0 and not b[3])
    chk+=max(0,r['cut150']+r['fill150']-cut-fill)
    r=dict(r,bad=keep,maxcut=round(-min([b[2] for b in near if b[2]<0] or [0]),1),maxfill=round(max([b[2] for b in near if b[2]>0] or [0]),1))
    return chk,cut,fill,r
out={}; c=collections.Counter()
for i,r in R.items():
    if 'chk150' not in r: c['no contours/town/no lidar']+=1; continue
    if r['fitm']>1.5: c['map fit too poor']+=1; continue
    chk,cut,fill,fl=r['chk150'],r['cut150'],r['fill150'],r['fl150']; bad=cut+fill
    if bad: chk,cut,fill,r=tighten(r,chk); bad=cut+fill
    if bad>=20 and bad>=0.05*(chk+bad): v='D'
    elif chk>=150 and bad<=0.03*(chk+bad): v='I'
    else: c['too little sloping contour to say']+=1; continue
    c[v]+=1
    P=[b for b in r.get('bad',[]) if (v=='F')==bool(b[3]) or v=='D']
    near=None
    for y,x,res,f in P:
        dd=math.hypot(y-300,x-300)
        if dd<=150 and (near is None or dd<near[0]): near=(dd,(math.degrees(math.atan2(x-300,300-y))+360)%360)
    pts=[]
    if v!='I':
        seen=set()
        for y,x,res,f in P:
            q=(x//3,y//3)
            if q in seen: continue
            seen.add(q); pts+=[x//3,y//3,2 if f else (0 if res<0 else 1)]
    out[i]=[r['y'],v,chk,cut,fill,fl,r['maxcut'],r['maxfill'],round(near[0]) if near else None,round(near[1]) if near else None]+([pts] if pts else [])
json.dump(out,open(sys.argv[1],'w'),separators=(',',':'))
print(dict(c),file=sys.stderr)
