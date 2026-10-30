# County-depth gathering handoffs: 4 fairground pins, 6 card enrichments, Chippewa shortlist rows (UG + UGRANK).
# usage: apply_gather.py og-data.js ; refuses a rerun
import sys,json
H='/mnt/project-files/research/county-depth/handoff/'
f=sys.argv[1]; s=open(f,encoding='utf-8').read(); tag='\n// County-depth: fairground pins, card notes, Chippewa shortlist\n'
assert tag not in s,'already applied'
new=json.load(open(H+'gathering/new-pins.json')); enr=json.load(open(H+'gathering/enrich.json')); sl=json.load(open(H+'shortlist/chippewa.json'))
ug={p['id']:p.pop('ug') for p in new if 'ug' in p}; ug.update(sl['ug'])
s+=tag+('DATA.points.push(...'+json.dumps(new,ensure_ascii=False,separators=(',',':'))+');\n'
  'Object.assign(UG,'+json.dumps(ug,ensure_ascii=False,separators=(',',':'))+');\n'
  'UGRANK.push(...'+json.dumps(sl['ugrank_append'],ensure_ascii=False,separators=(',',':'))+');\n'
  '{ const E='+json.dumps(enr,ensure_ascii=False,separators=(',',':'))+'; for(const p of DATA.points){ const e=E[p.id]; if(!e) continue; if(e.st) p.st=(p.st||"")+e.st; for(const r of e.src||[]) if(!(p.src||[]).some(y=>y[0]===r[0])) (p.src=p.src||[]).push(r); } }\n')
open(f,'w',encoding='utf-8').write(s); print(len(new),'pins',len(enr),'notes',len(sl['ugrank_append']),'shortlist rows; enrich ids:',list(enr))
