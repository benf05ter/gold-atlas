# Card LiDAR pictures for every spot with a cached 1 m DEM window: renders a 360 m hillshade per pin,
# bundles ~350 per img/m-N.json grouped by place, prints the LIDIMG additions for og-data.js.
# usage: build.py allpts.json af-layer.json og-data.js outdir > lidimg-add.js
import sys,os,json,math,re
sys.path.insert(0,'/tmp/claude-0/pv'); import lidimg
from concurrent.futures import ProcessPoolExecutor
P=json.load(open(sys.argv[1])); AF={r['id']:r for r in json.load(open(sys.argv[2]))}
have=set(re.findall(r'"([^"]+)":"@l-\d+"',open(sys.argv[3]).read()))
out=sys.argv[4]; dem='/tmp/claude-0/pv/dem'
pts=[p for p in P if p['id'] not in have and os.path.exists(f"{dem}/{p['id']}.npz")]
def marks(p):
    r=AF.get(p['id'])
    if not r or not r.get('lid_la'): return ()
    return (((r['lid_lo']-p['lo'])*111320*math.cos(math.radians(p['la'])),(r['lid_la']-p['la'])*110540),)
def one(p):
    x=lidimg.render(p['id'],marks=marks(p)); return p['id'],x and x[0]
pts.sort(key=lambda p:(round(p['la']*4),p['lo']))
with ProcessPoolExecutor(8) as ex: R=dict(ex.map(one,pts,chunksize=20))
ok=[p for p in pts if R.get(p['id'])]
add={}; n=0
for i in range(0,len(ok),350):
    b={p['id']:R[p['id']] for p in ok[i:i+350]}
    json.dump(b,open(f'{out}/m-{n}.json','w'),separators=(',',':'))
    for k in b: add[k]=f'@m-{n}'
    n+=1
sys.stderr.write(f'{len(pts)} cached, {len(ok)} pictures, {n} files\n')
print('Object.assign(LIDIMG,'+json.dumps(add,separators=(',',':'))+');')
