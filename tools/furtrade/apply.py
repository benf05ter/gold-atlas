# Fur-trade posts (research/fur-trade/): fur-pins.json new pins; fur-refine.json edits [{id, add_st, add_src, pinev, pinconf?, p?, acc?, move_to?}].
# A moved pin loses its old air-photo/LiDAR notes, counts and picture (redo the picture). wd3-cavillion is nudged 200 m south of the
# Yellow Lake thoroughfare as the thread asked (no coordinates given). Four new pins that sit on an atlas pin for the same place (FOLD) go onto that card. usage: apply.py fur-trade-dir og-data.js ; refuses a rerun.
import sys,json,os
D,f=sys.argv[1],sys.argv[2]; s=open(f,encoding='utf-8').read()
tag='\n// Fur-trade posts (research/fur-trade)\n'; assert tag not in s,'already applied'
N=json.load(open(os.path.join(D,'fur-pins.json'),encoding='utf-8')); R=json.load(open(os.path.join(D,'fur-refine.json'),encoding='utf-8'))
F={}
# new pins on the same spot as an atlas pin (within 60 m, same place): their story goes onto that card instead
FOLD={'fur-mendota-afc':'fr-mendota-st-peter-s-trader-settlement-and-f','fur-pike-island-1810':'fr-pike-island-treaty-ground-1805','fur-lands-end':'fr-land-s-end-minnesota-river-bluff','fur-reads-landing-rocque':'d-reads-landing'}
for p in [p for p in N if p['id'] in FOLD]: N.remove(p); F[FOLD[p['id']]]=[{'acc':p['acc']} if p.get('acc') else {},' Fur trade: '+p['st'],p['src']]
for r in R:
    x={k:r[k] for k in ('pinconf','p','acc','pinev') if k in r}
    if r.get('move_to'): x['la'],x['lo']=r['move_to']
    if r['id'] in F: F[r['id']][0].update(x); F[r['id']][1]+=(' '+r['add_st'] if r.get('add_st') else ''); F[r['id']][2]+=r.get('add_src',[]); continue
    F[r['id']]=[x,' '+r.get('add_st','') if r.get('add_st') else '',r.get('add_src',[])]
F['wd3-cavillion'][0]['dla']=-0.0018
s+=(tag+'DATA.points.push(...'+json.dumps(N,ensure_ascii=False,separators=(',',':'))+');\n{ const F='+json.dumps(F,ensure_ascii=False,separators=(',',':'))+'; for(const p of DATA.points){ const x=F[p.id]; if(!x) continue; const o=Object.assign({},x[0]); if(o.dla){ o.la=+(p.la+o.dla).toFixed(5); delete o.dla; }'
 ' const mv=o.la!=null&&(o.la!==p.la||o.lo!=null&&o.lo!==p.lo); Object.assign(p,o); if(mv){ p.st=(p.st||"").replace(/ Air photo check \\(UW[^)]*\\):[^.]*\\./g,"").replace(/ LiDAR cache check[^.]*\\.[^.]*\\./g,""); delete LIDC[p.id]; delete LIDIMG[p.id]; } p.st=(p.st||"")+x[1]; if(x[2].length) p.src=[...(p.src||[]),...x[2]]; } }\n')
open(f,'w',encoding='utf-8').write(s); sys.stderr.write(f'{len(N)} new pins, {len(F)} edits\n'); print(json.dumps([{'id':p['id'],'la':p['la'],'lo':p['lo']} for p in N]))
