# Hand-off batch applier (v225 on): spec.json {new:[pins], edit:{id:{set:{...}, st:"", src:[...], moved:bool}}}.
# New pins are pushed at load; edits run at DOMContentLoaded so the page-built vs-/sc- pins get them too. A moved pin loses
# its old air-photo/LiDAR notes and its LIDC count at load (the new LiDAR picture is added after this block).
# usage: apply.py spec.json og-data.js TAG ; refuses a rerun of the same TAG. Prints [{id,la,lo}] of new and moved pins.
import sys,json
spec,f,TAG=sys.argv[1],sys.argv[2],sys.argv[3]; s=open(f,encoding='utf-8').read()
tag=f'\n// Hand-off batch {TAG} (tools/batch225)\n'; assert tag not in s,'already applied'
S=json.load(open(spec,encoding='utf-8')); N=S['new']; E=S['edit']
for p in N: p.pop('note',None)
mv=[k for k,x in E.items() if x.get('moved')]
s+=(tag+'DATA.points.push(...'+json.dumps(N,ensure_ascii=False,separators=(',',':'))+');\n'
 '{ const E='+json.dumps({k:[x.get('set',{}),x.get('st',''),x.get('src',[]),bool(x.get('moved'))] for k,x in E.items()},ensure_ascii=False,separators=(',',':'))+';'
 ' for(const id of '+json.dumps(mv)+') delete LIDC[id];'
 ' addEventListener("DOMContentLoaded",()=>{ for(const p of DATA.points){ const x=E[p.id]; if(!x) continue; Object.assign(p,x[0]);'
 ' if(x[3]) p.st=(p.st||"").replace(/ Air photo check \\(UW[^)]*\\):[^.]*\\./g,"").replace(/ LiDAR cache check[^.]*\\.[^.]*\\./g,"");'
 ' p.st=(p.st||"")+x[1]; if(x[2].length) p.src=[...(p.src||[]),...x[2]]; } }); }\n')
open(f,'w',encoding='utf-8').write(s); sys.stderr.write(f'{len(N)} new pins, {len(E)} edits ({len(mv)} moved)\n')
print(json.dumps([{'id':p['id'],'la':p['la'],'lo':p['lo']} for p in N]+[{'id':k,'la':x['set']['la'],'lo':x['set']['lo']} for k,x in E.items() if x.get('moved')]))
