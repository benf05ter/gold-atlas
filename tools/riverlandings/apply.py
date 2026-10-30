# River landings, ferries and wood yards (research/river-landings/): new-pins.json (the thread's `note` field is dropped) and
# enrich.json [{id, add_text, add_src}] (applied at DOMContentLoaded so the page-built vs- pins get it too).
# usage: apply.py river-landings-dir og-data.js ; refuses a rerun. Prints [{id,la,lo}] of the new pins.
import sys,json,os
D,f=sys.argv[1],sys.argv[2]; s=open(f,encoding='utf-8').read()
tag='\n// River landings (research/river-landings)\n'; assert tag not in s,'already applied'
N=json.load(open(os.path.join(D,'new-pins.json'),encoding='utf-8'))
for p in N: p.pop('note',None)
E={e['id']:{'st':' '+e['add_text'],'src':[e['add_src']] if e.get('add_src') else []} for e in json.load(open(os.path.join(D,'enrich.json'),encoding='utf-8'))}
s+=tag+'DATA.points.push(...'+json.dumps(N,ensure_ascii=False,separators=(',',':'))+');\n{ const E='+json.dumps(E,ensure_ascii=False,separators=(',',':'))+'; addEventListener("DOMContentLoaded",()=>{ for(const p of DATA.points){ const x=E[p.id]; if(!x) continue; p.st=(p.st||"")+x.st; if(x.src.length) p.src=[...(p.src||[]),...x.src]; } }); }\n'
open(f,'w',encoding='utf-8').write(s); sys.stderr.write(f'{len(N)} new pins, {len(E)} card notes\n'); print(json.dumps([{'id':p['id'],'la':p['la'],'lo':p['lo']} for p in N]))
