# Artifact copy of the county-depth topo sheets: 72% size, WebP q50, ~6.5 MB bundles om/hx-N.json + map.json (sheet -> bundle).
# usage: rebundle_hx.py outdir
import json,io,base64,sys
from PIL import Image
Image.MAX_IMAGE_PIXELS=None
H='/mnt/project-files/research/county-depth/handoff/topo/'; out=sys.argv[1]
rows=json.load(open(H+'omr-rows.json')); B=[]; cur={}; sz=0
for r in rows:
    im=Image.open(f'{H}om/{r[0]}.webp'); w,h=im.size; im=im.resize((int(w*0.72),int(h*0.72)),Image.LANCZOS)
    b=io.BytesIO(); im.save(b,'WEBP',quality=50,method=6); s='data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode()
    if sz+len(s)>6.5e6 and cur: B.append(cur); cur={}; sz=0
    cur[r[0]]=s; sz+=len(s)
B.append(cur); m={}
for i,d in enumerate(B):
    json.dump(d,open(f'{out}/hx-{i}.json','w'),separators=(',',':'))
    for k in d: m[k]=f'hx-{i}'
json.dump(m,open(f'{out}/map.json','w')); print(len(B),'bundles')
