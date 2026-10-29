import sys
CODE="""// Ground check (v160): old topo + LiDAR + today's buildings for plat, 1878, survey and newspaper pins; one note, at most one move, and a built-on-since ground grade per pin; data in og-data.js
{ if(typeof GC_CHECK!=='undefined'){ const I=new Map(DATA.points.map(p=>[p.id,p])); const S=["USGS historical topographic maps, 1924-1958 (topoView), and USGS 3DEP 1 m LiDAR","https://ngmdb.usgs.gov/topoview/"];
  for(const id in GC_CHECK){ const p=I.get(id), g=GC_CHECK[id]; if(!p) continue; p.st=(p.st||'')+g[0];
    if(g[1]){ p.lo=g[1][0]; p.la=g[1][1]; p.pinconf='A'; p.pinev=[g[1][2],...(p.pinev||[]).slice(1)]; }
    if(g[2]&&typeof UG==='object') UG[id]=g[2];
    if(!(p.src||[]).some(y=>y[0]===S[0])) p.src=[...(p.src||[]),S]; } } }
"""
ANCH="for(const b of PLAT_ENRICH) for(const id in b.e){ const p=I.get(id); if(!p) continue; p.st=(p.st||'')+b.e[id]; if(!(p.src||[]).some(y=>y[0]===b.s[0])) p.src=[...(p.src||[]),b.s]; } } }\n"
for f in sys.argv[1:]:
    s=open(f).read(); assert s.count(ANCH)==1 and 'GC_CHECK' not in s, f
    s=s.replace(ANCH,ANCH+CODE); open(f,'w').write(s); print('ok',f)
