# Appends AF_LAYER (research/abandoned-farms/af-layer.json) to og-data.js. Usage: python3 add_data.py af-layer.json og-data.js
import sys,json
rows=json.load(open(sys.argv[1])); f=sys.argv[2]; s=open(f,encoding='utf-8').read()
assert 'const AF_LAYER=' not in s, 'already added'
ids=[r['id'] for r in rows]; assert len(ids)==len(set(ids)),'duplicate ids'
open(f,'a',encoding='utf-8').write('\n// Abandoned farms layer (v198): farmhouses on the old plat books that are gone later; from research/abandoned-farms/af-layer.json\nconst AF_LAYER='+json.dumps(rows,separators=(',',':'),ensure_ascii=False)+';\n')
print(len(rows),'rows')
