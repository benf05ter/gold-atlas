import json,sys,numpy as np,topowin,deriv
from PIL import Image,ImageDraw
PK=json.load(open('pick.json')); R={}
for l in open('td.jsonl'):
    r=json.loads(l); R[r['id']]=r
P={p['id']:p for p in json.load(open('pts.json'))}
ids=sys.argv[2:]; tiles=[]
for i in ids:
    z=np.load(f'dem/{i}.npz'); d=z['d'].astype(np.float32)/100; d[z['d']<0]=np.nan
    t=topowin.onto(PK[i]['k'],int(z['z']),float(z['x0']),float(z['y1'])); r=R[i]
    im=deriv.view_shade(deriv.fill(d)); dr=ImageDraw.Draw(im)
    TC=json.load(open('out/img/tc.json')); P_=TC.get(i,[None]*11); P_=P_[10] if len(P_)>10 else []
    for j in range(0,len(P_),3):
        x,y,cd=P_[j]*3,P_[j+1]*3,P_[j+2]; dr.ellipse((x-3,y-3,x+3,y+3),fill=(255,0,0) if cd==0 else (255,140,0))
    dr.ellipse((300-150,300-150,300+150,300+150),outline=(0,160,255))
    dr.text((5,5),f"{P[i]['n'][:50]} {r['y']} c{r['cut150']} f{r['fill150']} fit{r['fitm']}",fill=(0,0,0))
    a=Image.fromarray(t.transpose(1,2,0)); row=Image.new('RGB',(1200,600)); row.paste(a,(0,0)); row.paste(im,(600,0)); tiles.append(row.resize((800,400)))
Sh=Image.new('RGB',(1600,400*((len(tiles)+1)//2)))
for j,r in enumerate(tiles): Sh.paste(r,((j%2)*800,(j//2)*400))
Sh.save(sys.argv[1])
