# Cemeteries look-only layer (v226): appends CEM_LAYER to og-data.js from research/schools-churches/out/cem-rows.json
# ([gnis id, name, state, county, lat, lon, topo map, lonely]) and cem-fag-rows.json ([id, name, state, county, lat, lon, card text]).
# usage: add_data.py cem-rows.json cem-fag-rows.json og-data.js
import sys,json
R=json.load(open(sys.argv[1])); F=json.load(open(sys.argv[2])); f=sys.argv[3]; s=open(f,encoding='utf-8').read()
assert 'const CEM_LAYER=' not in s,'already added'
rows=[[r[0],r[1],r[2],r[3],round(r[4],5),round(r[5],5),r[6]] for r in R]+[[r[0],r[1],r[2],r[3],r[4],r[5],'',r[6]] for r in F]
open(f,'a',encoding='utf-8').write('\n// Cemeteries layer (v226): look-only red points from the USGS place-name file and Find a Grave family plots (research/schools-churches)\nconst CEM_LAYER='+json.dumps(rows,separators=(',',':'),ensure_ascii=False)+';\n')
print(len(rows),'rows')
