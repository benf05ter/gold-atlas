# County-depth pin corrections ([{id, set, st_append}] JSON, e.g. handoff/corrections/randall-1875.json): sets fields, appends text,
# drops the old spot's air-photo/LiDAR notes, counts and picture (redo the picture at the new spot). usage: apply_moves.py fix.json og-data.js ; refuses a rerun.
import sys,json,os
C=json.load(open(sys.argv[1])); f=sys.argv[2]; s=open(f,encoding='utf-8').read()
tag='\n// County-depth pin corrections: '+os.path.basename(sys.argv[1])+'\n'; assert tag not in s,'already applied'
F={c['id']:[c['set'],c.get('st_append','')] for c in C}
s+=(tag+'{ const F='+json.dumps(F,ensure_ascii=False)+'; for(const p of DATA.points){ const x=F[p.id]; if(!x) continue; const mv=x[0].la!=null&&(x[0].la!==p.la||x[0].lo!==p.lo); Object.assign(p,x[0]); '
 'if(mv){ p.st=(p.st||"").replace(/ Air photo check \\(UW[^)]*\\):[^.]*\\./g,"").replace(/ LiDAR cache check[^.]*\\.[^.]*\\./g,""); delete LIDC[p.id]; delete LIDIMG[p.id]; } p.st=(p.st||"")+x[1]; } }\n')
open(f,'w',encoding='utf-8').write(s); print(json.dumps([{'id':c['id'],'la':c['set']['la'],'lo':c['set']['lo']} for c in C if 'la' in c['set']]))
