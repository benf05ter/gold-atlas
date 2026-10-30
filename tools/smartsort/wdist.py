import json,sys,math,pyarrow.parquet as pq,shapely
from shapely import STRtree,Point,from_wkb
pins=json.load(open(sys.argv[1])); t=pq.read_table(sys.argv[2]).to_pydict()
skip={'swimming_pool','fountain','drain','ditch','water_tank','basin','wastewater','reflecting_pool','dock','water_storage'}
geoms=[];cls={}
for g,c in zip(t['geometry'],t['class']):
    if c in skip: continue
    geoms.append(from_wkb(g))
print('features',len(geoms),file=sys.stderr)
tree=STRtree(geoms); out={}
for pid,la,lo in pins:
    c=math.cos(math.radians(la)); p=Point(lo,la)
    i=tree.nearest(p); g=geoms[i]
    # metres via local scaling: project the nearest point
    from shapely.ops import nearest_points
    q=nearest_points(p,g)[1]
    out[pid]=round(math.hypot((q.x-lo)*111320*c,(q.y-la)*111320))
json.dump(out,open(sys.argv[3],'w'),separators=(',',':')); print(len(out))
