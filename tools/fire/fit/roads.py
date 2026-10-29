import sys, json, pyarrow.dataset as ds, pyarrow.compute as pc, pyarrow.fs as pfs
# roads.py lon0 lat0 lon1 lat1 out.json : Overture road segments (name + WKB geometry) in a bbox
x0,y0,x1,y1=map(float,sys.argv[1:5])
fs=pfs.S3FileSystem(anonymous=True, region='us-west-2')
d=ds.dataset('overturemaps-us-west-2/release/2026-10-21.0/theme=transportation/type=segment/', filesystem=fs, format='parquet')
f=(pc.field('bbox','xmin')<x1)&(pc.field('bbox','xmax')>x0)&(pc.field('bbox','ymin')<y1)&(pc.field('bbox','ymax')>y0)
t=d.to_table(columns=['names','geometry','class','subtype'],filter=f)
from shapely import wkb
out=[]
for r in t.to_pylist():
    if r['subtype']!='road' and r['subtype']!='rail': continue
    nm=(r['names'] or {}).get('primary') if r['names'] else None
    g=wkb.loads(r['geometry'])
    out.append({'n':nm,'c':r['class'] or r['subtype'],'g':[[round(a,6),round(b,6)] for a,b in g.coords]})
json.dump(out,open(sys.argv[5],'w'))
print(len(out))
