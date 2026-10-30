# County-depth new pins (JSON list of pin objects, e.g. handoff/gathering/eau-claire-bailey-1914-new-pins.json): pushes them into DATA.points.
# usage: apply_pins.py pins.json og-data.js ; refuses a rerun. Prints [{id,la,lo}] for the LiDAR pictures.
import sys,json,os
N=json.load(open(sys.argv[1])); f=sys.argv[2]; s=open(f,encoding='utf-8').read()
tag='\n// County-depth new pins: '+os.path.basename(sys.argv[1])+'\n'; assert tag not in s,'already applied'
s+=tag+'DATA.points.push(...'+json.dumps(N,ensure_ascii=False,separators=(',',':'))+');\n'; open(f,'w',encoding='utf-8').write(s)
print(json.dumps([{'id':p['id'],'la':p['la'],'lo':p['lo']} for p in N]))
