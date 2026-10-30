# Abandoned farms layer (v198): adds the af15/af38/af64 layers to index.html. Usage: python3 patch_index.py index.html
import sys
f=sys.argv[1]; s=open(f,encoding='utf-8').read()
assert 'AF_LAYER' not in s, 'already patched'
def rep(old,new,n=1):
    global s; c=s.count(old); assert c==n,(c,old[:80]); s=s.replace(old,new)
# colours: light theme, then the two dark-theme copies
rep("--L-school2:#a8794f;","--L-school2:#a8794f; --L-af15:#8c2d2d; --L-af38:#6b7a1f; --L-af64:#2f6f78;")
rep("--L-school2:#c9a684;","--L-school2:#c9a684; --L-af15:#e08a7a; --L-af38:#b9c860; --L-af64:#7cc3cc;",2)
# layer rows (merged into one "Abandoned farms" row below)
rep("""Off at first', on:false},
  {sec:'My spots', id:'lead',""","""Off at first', on:false},
  {sec:'My spots', id:'af38', n:'Abandoned farms (gone by 1938)', d:'Farmhouses drawn on the old county plat books (1877-1915) that are gone later: by 1915, by the 1936-41 air photos, or since. Colour shows when each went; a second marker marks a LiDAR pit where one was found. Positions are good to about 50-150 m. Off at first', on:false},
  {sec:'My spots', id:'af15', n:'Abandoned farms (gone by 1915)', d:'Farmhouses on the 1888 Dunn County plat that are missing from the 1915 atlas', on:false},
  {sec:'My spots', id:'af64', n:'Abandoned farms (gone after 1938)', d:'Farmsteads still on the 1936-41 air photos with nothing standing today, plus a few rebuilt sites', on:false},
  {sec:'My spots', id:'lead',""")
rep("const AF_FLAG=0;","",0)
# icon: a house with a broken roof line
rep(" school2:'<path fill-rule=\"evenodd\"",""" af15:'<path d="M-.55,.55 V-.05 L-.1,-.4 M.1,-.42 L.55,-.05 V.55Z" fill="none" stroke="currentColor" stroke-width=".16"/>',
 af38:'<path d="M-.55,.55 V-.05 L-.1,-.4 M.1,-.42 L.55,-.05 V.55Z" fill="none" stroke="currentColor" stroke-width=".16"/>',
 af64:'<path d="M-.55,.55 V-.05 L-.1,-.4 M.1,-.42 L.55,-.05 V.55Z" fill="none" stroke="currentColor" stroke-width=".16"/>',
 school2:'<path fill-rule="evenodd\"""")
rep("const SHORT={vpo:","const SHORT={af15:'Farm gone by 1915',af38:'Farm gone by 1938',af64:'Farm gone after 1938',vpo:")
rep("'school','school2','vpo','history','treasure','lead','mine','park']);","'school','school2','vpo','history','treasure','lead','mine','park','af15','af38','af64']);")
rep("RKUSE={gather:","RKUSE={af15:[14,'An abandoned farmstead: cellar, well, privy and yard'],af38:[14,'An abandoned farmstead: cellar, well, privy and yard'],af64:[14,'An abandoned farmstead: cellar, well, privy and yard'],gather:")
# build the points (after the vanished-school builder)
rep(" add(SCH,'sch'); add(VS2,'vs'); add(VS3,'vs'); add(VS4,'vs4'); }",""" add(SCH,'sch'); add(VS2,'vs'); add(VS3,'vs'); add(VS4,'vs4'); }
// ABANDONED FARMS (v198): farmhouses on the old plat books that are gone later, one switch-on layer (off at first, kept out of the main lists until it is on); data AF_LAYER in og-data.js
{ if(typeof AF_LAYER!=='undefined'){ const KL={gone_by_1915:'af15',gone_by_1938:'af38',gone_after_1938:'af64',rebuilt:'af64'},
   KN={gone_by_1915:'gone by 1915',gone_by_1938:'gone by 1938',gone_after_1938:'gone after 1938',rebuilt:'gone by 1915, rebuilt by 1938'},
   V='Coins, buttons, tokens, harness, household and farm items', LS=['USGS 3DEP 1 m LiDAR, read by eye (Old Ground LiDAR cache pass, Oct 2026)','https://apps.nationalmap.gov/lidar-explorer/'];
  for(const r of AF_LAYER){ const L=KL[r.k]||'af38', m=/sec \\d+, T\\d+N R\\d+[EW]/.exec(r.t||''), where=m?m[0].replace(',',''):r.co+' County';
   DATA.points.push({id:r.id,L,n:`Abandoned farm, ${where} (${KN[r.k]||r.k})`,la:r.la,lo:r.lo,co:r.co,pl:`${r.co} County${m?', '+m[0]:''}`,y:r.era,v:V,c:'documented',s:'unknown',p:'approx',stt:'WI',
    st:r.t+' '+r.acc+(r.lid?' '+r.lid:''),src:[[r.src,'']],ug:[r.g,r.gw]});
   if(r.lid_la!=null) DATA.points.push({id:r.id+'-pit',L,n:`LiDAR pit by the abandoned farm, ${where}`,la:r.lid_la,lo:r.lid_lo,co:r.co,pl:`${r.co} County${m?', '+m[0]:''}`,y:r.era,v:V,c:'documented',s:'unknown',p:'exact',stt:'WI',
    st:r.lid,src:[LS],ug:[r.lid_g||r.g,r.gw],parent:r.id}); } } }
const AFL=new Set(['af15','af38','af64']), afOff=p=>AFL.has(p.L)&&!on.has(p.L);""")
# keep the farms out of the main lists while the layer is off
rep("const v=PTS.filter(p=>(on.has(p.L)||savedOnly||ugOnly) &&","const v=PTS.filter(p=>(on.has(p.L)||savedOnly||(ugOnly&&!afOff(p))) &&")
rep("const grp=k=>PTS.filter(p=>RK(p)===k).sort(","const grp=k=>PTS.filter(p=>RK(p)===k&&!afOff(p)).sort(")
rep("const ok=p=>!NOGO.has(p.L)&&!(p.ug&&p.ug[0]==='X')","const ok=p=>!NOGO.has(p.L)&&!afOff(p)&&!(p.ug&&p.ug[0]==='X')")
# one row in the layer lists, under Vanished places
rep("const LM={school:['school2'],","const LM={af38:['af15','af64'],school:['school2'],")
rep("const LN={school:'Vanished schools and hamlets',","const LN={af38:'Abandoned farms (from the old plat books)',school:'Vanished schools and hamlets',")
rep("const LS={school:'Vanished schools',","const LS={af38:'Abandoned farms',school:'Vanished schools',")
rep("if(['school','school2','vpo','ghost'].includes(l.id)) l.sec='Vanished places';","if(['school','school2','vpo','ghost','af15','af38','af64'].includes(l.id)) l.sec='Vanished places';")
open(f,'w',encoding='utf-8').write(s); print('patched',f)
