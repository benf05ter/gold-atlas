#!/usr/bin/env python3
"""geo.py: street-intersection lookup and sheet fitting for Sanborn town mosaics.
  geo.py roads <spec.json>            fetch Overture roads around the town (roads/<id>.json)
  geo.py names <spec.json>            list street core names near the town
  geo.py fit <spec.json> [out.webp]   fit every sheet (similarity), print residuals, write the mosaic
Spec: {"town","id","year","c":[lon,lat],"sheets":[{"f":"<jpg>","clip":[[x,y]...],"gcp":[[x,y,"A","B"]|[x,y,lon,lat]...]}]}"""
import sys, json, math, re, os, subprocess
import numpy as np
from PIL import Image, ImageDraw
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE)
def core(n):
    n=(n or '').lower().replace('.','')
    n=re.sub(r'\s+(north|south|east|west|ne|nw|se|sw)$','',n)
    m=re.sub(r'^(north|south|east|west|n|s|e|w)\s+','',n)
    if not re.fullmatch(r'(street|st|avenue|ave|road|rd|drive|dr|court|ct|place|pl|boulevard|blvd|lane|ln|way|parkway)',m): n=m
    n=re.sub(r'\s+(street|st|avenue|ave|road|rd|drive|dr|court|ct|place|pl|boulevard|blvd|lane|ln|way|parkway)$','',n)
    return n.strip()
def load(spec): return json.load(open(spec))
def roads(S):
    p=f"{ROOT}/roads/{S['id']}.json"
    if not os.path.exists(p):
        lo,la=S['c']; r=S.get('r',0.025)
        subprocess.run([sys.executable,f"{HERE}/roads.py",str(lo-r*1.4),str(la-r),str(lo+r*1.4),str(la+r),p],check=True)
    return json.load(open(p))
def segs(R,name):
    out=[]
    names={core(x) for x in name.split('|') if not x.startswith('=')}
    exact={x[1:].lower() for x in name.split('|') if x.startswith('=')}
    for s in R:
        if core(s['n']) in names or (s['n'] or '').lower() in exact: g=s['g']; out+= [(g[i],g[i+1]) for i in range(len(g)-1)]
    return out
def inter(R,a,b,c):
    A,B=segs(R,a),segs(R,b); best=None
    kx=math.cos(math.radians(c[1]))
    for p1,p2 in A:
        for q1,q2 in B:
            x1,y1=p1[0]*kx,p1[1]; x2,y2=p2[0]*kx,p2[1]; x3,y3=q1[0]*kx,q1[1]; x4,y4=q2[0]*kx,q2[1]
            den=(x1-x2)*(y3-y4)-(y1-y2)*(x3-x4)
            if abs(den)<1e-14: continue
            t=((x1-x3)*(y3-y4)-(y1-y3)*(x3-x4))/den; u=-((x1-x2)*(y1-y3)-(y1-y2)*(x1-x3))/den
            # allow a little extension past segment ends (street ends at the crossing)
            if -0.3<=t<=1.3 and -0.3<=u<=1.3:
                pt=((x1+t*(x2-x1))/kx, y1+t*(y2-y1)); d=math.hypot((pt[0]-c[0])*kx,pt[1]-c[1])
                if best is None or d<best[0]: best=(d,pt)
    return best[1] if best else None
def m(lon,lat,c):  # local metres
    return ((lon-c[0])*111320*math.cos(math.radians(c[1])), (lat-c[1])*110540)
def fit_sheet(sh,R,c,verbose=True):
    P=[];Q=[];lab=[]
    for g in sh['gcp']:
        x,y=g[0],g[1]
        if isinstance(g[2],str):
            ll=inter(R,g[2],g[3],sh.get('c',c))
            if ll is None: print('   no crossing',g[2],'x',g[3]); continue
        else: ll=(g[2],g[3])
        P.append((x,-y)); Q.append(m(*ll,c)); lab.append(g)
    P=np.array(P,float);Q=np.array(Q,float); n=len(P)
    if n<(1 if sh.get('fix') else 2): raise SystemExit('sheet %s: need 2+ points'%sh['f'])
    # similarity: X = a x - b y + tx ; Y = b x + a y + ty
    A=[];B=[]
    for (x,y),(X,Y) in zip(P,Q): A+=[[x,-y,1,0],[y,x,0,1]]; B+=[X,Y]
    if sh.get('fix'):   # known scale (m/px) and rotation (deg): only the shift is solved
        sc0=sh['fix'].get('scale',0.205); r0=math.radians(sh['fix']['rot']); a=sc0*math.cos(r0); b=sc0*math.sin(r0)
        tx=float(np.mean([X-(a*x-b*y) for (x,y),(X,Y) in zip(P,Q)])); ty=float(np.mean([Y-(b*x+a*y) for (x,y),(X,Y) in zip(P,Q)]))
    else:
        sol,*_=np.linalg.lstsq(np.array(A),np.array(B),rcond=None); a,b,tx,ty=sol
    res=[]
    for (x,y),(X,Y),g in zip(P,Q,lab):
        e=math.hypot(a*x-b*y+tx-X,b*x+a*y+ty-Y); res.append(e)
        if verbose: print('   %-28s %5.1f m'%(' x '.join(map(str,g[2:4])) if isinstance(g[2],str) else 'fixed %.5f,%.5f'%(g[2],g[3]),e))
    sc=math.hypot(a,b); rot=math.degrees(math.atan2(b,a))
    if verbose: print('  %s: %d pts, rms %.1f m, %.3f m/px, rot %.1f'%(sh['f'],n,math.sqrt(sum(e*e for e in res)/n),sc,rot))
    return (a,b,tx,ty)
def px2m(T,x,y): a,b,tx,ty=T; return (a*x+b*y+tx, b*x-a*y+ty)   # sheet px (y down) -> metres
def main():
    cmd,spec=sys.argv[1],sys.argv[2]; S=load(spec); c=S['c']; R=roads(S)
    if cmd=='roads': print(len(R),'segments'); return
    if cmd=='names':
        import collections; print(sorted(collections.Counter(core(s['n']) for s in R if s['n']).items())); return
    if cmd=='isect':
        print(inter(R,sys.argv[3],sys.argv[4],c)); return
    Ts=[]
    for sh in S['sheets']:
        if not sh.get('gcp'): continue
        T=fit_sheet(sh,R,c)
        if not sh.get('nodraw'): Ts.append((sh,T))   # nodraw: index/key map used only for pins
        kx0=111320*math.cos(math.radians(c[1]))
        sh['T']=[float(v) for v in T]
        for fx in sh.get('feat',[]):
            X,Y=px2m(T,fx[0],fx[1]); fx[3:]=[round(c[0]+X/kx0,6),round(c[1]+Y/110540,6)]
            print('    feat %-40s %.6f, %.6f'%(fx[2],fx[3],fx[4]))
    json.dump(S,open(spec,'w'),indent=1)
    if cmd!='fit' or len(sys.argv)<4: return
    grp=sys.argv[4] if len(sys.argv)>4 else None
    if grp: Ts=[(sh,T) for sh,T in Ts if sh.get('grp')==grp]
    res=S.get('res',0.25); kx=111320*math.cos(math.radians(c[1]))
    pts=[]
    for sh,T in Ts:
        clip=sh.get('clip') or [[0,0],[1628,0],[1628,1927],[0,1927]]
        pts+=[px2m(T,x,y) for x,y in clip]
    X0=min(p[0] for p in pts);X1=max(p[0] for p in pts);Y0=min(p[1] for p in pts);Y1=max(p[1] for p in pts)
    W=int((X1-X0)/res);H=int((Y1-Y0)/res); f=max(W,H)/S.get('maxpx',6000)
    if f>1: res*=f; W=int((X1-X0)/res);H=int((Y1-Y0)/res)
    out=Image.new('RGBA',(W,H),(0,0,0,0))
    for sh,T in Ts:
        a,b,tx,ty=T; im=Image.open(f"{ROOT}/img/{sh['f']}").convert('RGBA')
        clip=sh.get('clip') or [[0,0],[im.size[0],0],[im.size[0],im.size[1]],[0,im.size[1]]]
        mk=Image.new('L',im.size,0); ImageDraw.Draw(mk).polygon([tuple(p) for p in clip],fill=255); im.putalpha(mk)
        # out pixel (u,v) -> metres (X0+u*res, Y1-v*res) -> sheet px: solve [a b; b -a][x;y]=[X-tx;Y-ty]
        s2=a*a+b*b
        def inv(X,Y): X-=tx;Y-=ty; return ((a*X+b*Y)/s2,(b*X-a*Y)/s2)
        o=inv(X0,Y1); ux=inv(X0+res,Y1); vy=inv(X0,Y1-res)
        coef=(ux[0]-o[0],vy[0]-o[0],o[0],ux[1]-o[1],vy[1]-o[1],o[1])
        w=im.transform((W,H),Image.AFFINE,coef,resample=Image.BICUBIC)
        out=Image.alpha_composite(out,w)
    out.save(sys.argv[3],'WEBP',quality=S.get('q',72))
    lon0=c[0]+X0/kx; lon1=c[0]+X1/kx; la0=c[1]+Y0/110540; la1=c[1]+Y1/110540
    b=[round(float(v),5) for v in (lon0,lon1,la0,la1)]
    print('mosaic',W,H,'%.2f m/px'%res,'b=',b, os.path.getsize(sys.argv[3])//1024,'KB')
    if grp: S.setdefault('groups',{})[grp]={'b':b,'px':[W,H]}
    else: S['b']=b; S['px']=[W,H]
    json.dump(S,open(spec,'w'),indent=1)
if __name__=="__main__": main()
