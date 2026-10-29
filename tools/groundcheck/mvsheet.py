import sys,json,math; sys.argv=['x']; sys.path.insert(0,'/tmp/claude-0/pv'); import tile
from PIL import Image,ImageDraw
P={p['id']:p for p in json.load(open('/tmp/claude-0/pv/pins-all.json'))}; N=json.load(open('/tmp/claude-0/pv/notes.json'))
M=[k for k,v in N.items() if v['move']]
tile.S=400
ims=[]
for k in M:
    p=P[k]; m=N[k]['move']; c=dict(p); c['la']=(p['la']+m[1])/2; c['lo']=(p['lo']+m[0])/2
    R=max(150,m[2]*0.75); im,lab=tile.topo(c,R=R); im=im.convert('RGB'); d=ImageDraw.Draw(im); sc=400/(2*R)
    def px(la,lo): return 200+(lo-c['lo'])*111320*math.cos(math.radians(c['la']))*sc, 200-(la-c['la'])*111320*sc
    x,y=px(p['la'],p['lo']); d.ellipse((x-7,y-7,x+7,y+7),outline=(255,0,0),width=2)
    x,y=px(m[1],m[0]); d.rectangle((x-7,y-7,x+7,y+7),outline=(0,0,255),width=3)
    T=Image.new('RGB',(400,416),(0,0,0)); T.paste(im,(0,16)); ImageDraw.Draw(T).text((2,2),f"{len(ims)}. {p['n'][:44]} {m[2]}m",fill=(255,255,255)); ims.append(T)
for s in range(0,len(ims),12):
    ch=ims[s:s+12]; S=Image.new('RGB',(4*406,3*422),(60,60,60))
    for i,im in enumerate(ch): S.paste(im,((i%4)*406,(i//4)*422))
    S.save(f'/tmp/claude-0/pv/sheets/mv{s//12}.jpg',quality=85)
json.dump(M,open('/tmp/claude-0/pv/sheets/mv.json','w')); print(len(M))
