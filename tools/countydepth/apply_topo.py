# County-depth handoffs: old topo rows (OMR) and building-level pins (p:'topo').
# usage: apply_topo.py og-data.js [index.html --bundles map.json]   (--bundles: artifact build, sheets load from om/hx-N.json)
import sys,json,csv
H='/mnt/project-files/research/county-depth/handoff/'
f=sys.argv[1]; s=open(f,encoding='utf-8').read()
tag='\n// County-depth: earliest USGS sheets under every spot in the 24 plat counties\n'
assert tag not in s,'already applied'
bund='--bundles' in sys.argv
# artifact: sheets re-encoded at 72% size, q50 into 6 bundles (256 MB version cap); bundle names from rebundle_hx.py's map.json
M=json.load(open(sys.argv[sys.argv.index('--bundles')+1])) if bund else {}
rows=[(r[:7]+[M[r[0]]]) if bund else r[:7] for r in json.load(open(H+'topo/omr-rows.json'))]
ids=[r['id'] for r in csv.DictReader(open(H+'pins/building-level.tsv'),delimiter='\t')]
s+=tag+'OMR.push(...'+json.dumps(rows,separators=(',',':'))+');\n'
s+='\n// County-depth: plat pins a second map puts on the building\n{ const T=new Set('+json.dumps(ids)+'); for(const p of DATA.points) if(T.has(p.id)) p.p="topo"; }\n'
open(f,'w',encoding='utf-8').write(s); print(len(rows),'sheets',len(ids),'pins')
if bund:
    g=sys.argv[2]; h=open(g).read()
    old="  for(const im of v) if(!im.getAttribute('href')) im.setAttribute('href','om/'+im.dataset.f+'.webp'); }"
    new=("  for(const im of v) if(!im.getAttribute('href')){ const row=OMR.find(o=>o[0]===im.dataset.f), bn=row&&row[7];\n"
         "    if(!bn){ im.setAttribute('href','om/'+im.dataset.f+'.webp'); continue; }\n"
         "    im.setAttribute('href','data:,'); (OMB[bn]=OMB[bn]||fetch('om/'+bn+'.json').then(r=>r.json()).catch(e=>{ delete OMB[bn]; throw e; })).then(j=>{ if(j[im.dataset.f]) im.setAttribute('href',j[im.dataset.f]); }).catch(()=>im.removeAttribute('href')); } }\nconst OMB={};")
    assert h.count(old)==1; h=h.replace(old,new)
    old2="for(const [f,a,b,c,d] of (typeof OMR!=='undefined'?OMR:[])) if(!(b<lon0||a>lon1||d<la0||c>la1)) U.add('om/'+f+'.webp');"
    new2="for(const [f,a,b,c,d,,,bn] of (typeof OMR!=='undefined'?OMR:[])) if(!(b<lon0||a>lon1||d<la0||c>la1)) U.add('om/'+(bn?bn+'.json':f+'.webp'));"
    assert h.count(old2)==1; h=h.replace(old2,new2)
    open(g,'w').write(h); print('index patched')
