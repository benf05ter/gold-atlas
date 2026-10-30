# County-depth card additions ({id: {st, src}} JSON, e.g. handoff/gathering/eau-claire-1881-enrich.json): appends text + source rows.
# Optional {id: {"fix": [old, new]}} rewords the card's own text first. usage: apply_enrich.py enrich.json og-data.js ; refuses a rerun.
import sys,json,os
E=json.load(open(sys.argv[1])); f=sys.argv[2]; s=open(f,encoding='utf-8').read()
tag='\n// County-depth card notes: '+os.path.basename(sys.argv[1])+'\n'; assert tag not in s,'already applied'
if 'eau-claire-1881' in sys.argv[1]: E['d-augusta-fair']['fix']=['The first Eau Claire County Fairs were held in Augusta from 1924','The present Eau Claire County Fair (counted from 1924) was held in Augusta from 1924']
s+=tag+'{ const E='+json.dumps(E,ensure_ascii=False)+'; for(const p of DATA.points){ const x=E[p.id]; if(!x) continue; if(x.fix) p.st=(p.st||"").replace(x.fix[0],x.fix[1]); p.st=(p.st||"")+x.st; (p.src=p.src||[]).push(...x.src); } }\n'
open(f,'w',encoding='utf-8').write(s); print(len(E),'cards')
