# Newspaper pin corrections (research/county-depth/handoff/corrections/news-2026-10-30.json): Whitehall cave -> Nelson Dewey
# State Park, Richland bluff cave -> Bogus Bluff (the web-dive duplicate wd3-bogus-bluff is dropped; its LiDAR picture moves over).
# "searched" is kept as status "never" (dug, nothing found), the value the sorts and tiers know.
# usage: news_1030.py corrections.json og-data.js img/m-21.json ; refuses a rerun.
import sys,json
C=json.load(open(sys.argv[1])); f=sys.argv[2]; s=open(f,encoding='utf-8').read()
tag='\n// Newspaper pin corrections 2026-10-30 (county-depth handoff)\n'; assert tag not in s,'already applied'
F={}
for c in C:
    x=dict(c['set']); x['s']={'searched':'never'}.get(x.get('s'),x.get('s')); x['src_add']=c.get('src_add',[]); F[c['id']]=x
m=json.load(open(sys.argv[3])); m['t-richland-bluff-cave']=m.pop('wd3-bogus-bluff'); json.dump(m,open(sys.argv[3],'w'),separators=(',',':'))
s+=(tag+'DATA.points=DATA.points.filter(p=>p.id!=="wd3-bogus-bluff"&&p.id!=="lc-t-whitehall-cave-7"); delete LIDIMG["wd3-bogus-bluff"];\n'
 '{ const F='+json.dumps(F,ensure_ascii=False)+'; for(const p of DATA.points){ const x=F[p.id]; if(!x) continue; for(const k in x) if(k!=="src_add") p[k]=x[k]; '
 '(p.src=p.src||[]).push(...x.src_add); delete LIDC[p.id]; } }\nObject.assign(LIDIMG,{"t-richland-bluff-cave":"@m-21"});\n')
open(f,'w',encoding='utf-8').write(s); print('ok',list(F))
