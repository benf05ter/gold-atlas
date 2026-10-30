# Minnesota + Michigan plat books (research/plat-mn-mi/out/): pins-<prefix>.json -> new pins, enrich-<prefix>.json {id: text}
# -> card text + the book's source row (applied at DOMContentLoaded, so the page-built vs-/sc- pins get it too). A new pin that sits within 300 m of an atlas pin of the same name is folded into that card instead.
# usage: apply_book.py out-dir og-data.js prefix (one later book, e.g. pme12) ; refuses a rerun. Prints [{id,la,lo}] of the new pins (they need LiDAR pictures).
import sys,json,glob,os,re,math
O,f=sys.argv[1],sys.argv[2]; s=open(f,encoding='utf-8').read()
B=sys.argv[3]; tag=f'\n// MN/MI plat books, {B} (research/plat-mn-mi/out)\n'; assert tag not in s,'already applied'
old=json.load(open(os.environ['OGPTS']))   # [[id,n,la,lo],...] of every atlas pin, dumped from the running page (DATA.points)
norm=lambda n:re.sub(r'\(.*?\)|[^a-z0-9 ]','',n.lower()).replace(' school','').strip()
new=[]; E={}; ids={o[0] for o in old}
for pf in sorted([os.path.join(O,f'pins-{B}.json')]):
    book=os.path.basename(pf)[5:-5]; P=json.load(open(pf,encoding='utf-8'))
    for e,t in json.load(open(os.path.join(O,f'enrich-{book}.json'),encoding='utf-8')).items(): E[e]={'st':' '+t,'src':[P[0]['src'][0]]}
    for p in P:
        if p['id'] in ids: continue
        hit=next((o for o in old if norm(o[1])==norm(p['n']) and math.hypot((o[3]-p['lo'])*78,(o[2]-p['la'])*111)<0.3),None)
        if hit: E.setdefault(hit[0],{'st':'','src':[]}); E[hit[0]]['st']+=' '+p['st']; E[hit[0]]['src']+=p['src'][:1]; continue
        new.append(p); ids.add(p['id'])
s+=tag+'DATA.points.push(...'+json.dumps(new,ensure_ascii=False,separators=(',',':'))+');\n// card notes wait for the page: the vs-/sc- place-name pins are built by the page code, after this file\n{ const E='+json.dumps(E,ensure_ascii=False)+'; addEventListener("DOMContentLoaded",()=>{ for(const p of DATA.points){ const x=E[p.id]; if(!x) continue; p.st=(p.st||"")+x.st; p.src=[...(p.src||[]),...x.src]; } }); }\n'
open(f,'w',encoding='utf-8').write(s); sys.stderr.write(f'{len(new)} new pins, {len(E)} cards with notes\n')
print(json.dumps([{'id':p['id'],'la':p['la'],'lo':p['lo']} for p in new]))
