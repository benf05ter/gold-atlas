# patch_xmaps.py <dir with index.html> [dams_enc.json]: adds the "More old maps" map type (marker XMAPS): Bordner land inventory 1930s-40s and the
# Mississippi River Commission charts (1894 survey), app tiles ot/bd and ot/mrc. Idempotent: refuses to run twice. Layers are a list (XMAPS);
# add a later layer = add an XMAPS entry + its ot/<id> tiles.
import sys,os,re,json
DAMS=open(sys.argv[2] if len(sys.argv)>2 else os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','dams_enc.json')).read().strip()
p=os.path.join(sys.argv[1],'index.html'); s=open(p,encoding='utf-8').read()
if 'XMAPS' in s: print('already patched'); sys.exit(0)
BLOCK=r'''
// ---------- More old maps map type (XMAPS): cross-reference maps that exist only as app tiles (ot/<id>), one shown at a time ----------
// bd: Wisconsin Land Economic Inventory (Bordner survey) 1930s-40s township land-cover maps, each sheet's section grid fitted corner to corner to the BLM section corners.
// mrc: Mississippi River Commission charts 171-176 (1894 survey, 1:20,000), fitted on their own latitude/longitude grid (under 1 px).
var XMAPS=[{id:'bd',label:'Land inventory 1930s-40s',
  go:[['Eau Claire',-91.62,-91.38,44.72,44.9],['Chippewa Falls and Wissota',-91.5,-91.25,44.86,45.02],['Holcombe (before the dam)',-91.3,-91.0,45.12,45.3],['Menomonie',-92.02,-91.82,44.8,44.96],['Black River Falls',-90.95,-90.75,44.22,44.38],['Rice Lake',-91.85,-91.6,45.42,45.58],['All 24 counties',-92.9,-89.22,43.64,46.16]],
  note:'The Wisconsin Land Economic Inventory (the Bordner survey), 1930s to early 1940s: field crews walked every section and drew the land cover, every road and building, schools, churches, taverns, mills, abandoned fields and abandoned rail lines. Zoom in on a township to read it.',
  src:'<p class="hint"><b>Land inventory 1930s-40s:</b> Wisconsin Land Economic Inventory (Bordner survey), Wisconsin Department of Agriculture, about 1933 to 1945; township land-cover maps from UW Digital Collections (WI Bordner Survey Maps). 599 township sheets for the 24 counties around Eau Claire. Each sheet\'s section grid was fitted corner to corner to today\'s BLM section corners, so section lines land within about 30 m and roads and rivers run on across township edges. A few sheets cut by the Mississippi and St. Croix, and a few odd layouts, are still missing.</p><p class="hint">Reading it: C cleared crop land, P pasture, <b>PP permanent pasture</b> (never plowed), <b>A abandoned</b>, CPP poor land once cropped, SP stump pasture, D and B numbers are woods. Small black squares are occupied houses, open squares vacant houses; a square with a flag is a school, with a cross a church; T tavern, CH cheese factory, C creamery, S store, H hotel are tiny letters over the square and blur on these scans. Dashed lines with cross ticks are abandoned railroads. Shaded blocks are towns. The UW scans are 954 px wide, so small letters do not read up close.</p>'},
 {id:'mrc',label:'Mississippi River charts 1894',
  go:[['Stoddard and Brownsville',-91.36,-91.13,43.64,43.75],['La Crosse and Onalaska',-91.37,-91.14,43.75,43.95],['Trempealeau',-91.5,-91.38,43.96,44.05],['Winona and Homer',-91.74,-91.45,43.95,44.18]],
  note:'The Mississippi River Commission survey of 1894 (charts 171 to 176, 1:20,000), before the locks raised the river in the 1930s: every landing, woodyard, slough, island, dike and riverbank farm from Stoddard to Winona, with some owners\' names.',
  src:'<p class="hint"><b>Mississippi River charts 1894:</b> Survey of the Mississippi River, Mississippi River Commission, charts 171 to 176 (surveyed 1894, printed 1897, Julius Bien lithographers), La Crosse Public Library Archives via UW Digital Collections. Each chart was fitted on its own printed latitude and longitude lines (under 1 px, about 10 m) and checked on Trempealeau village. Ground now under Pools 7 and 8 shows as it was. UW only holds these six charts.</p>'}];
// Lakes made by dams within reach, with today's shoreline (USGS NHD, simplified to about 40 m; delta-coded in 1/10000 degree) and the dam year:
// the old map types show the farms, roads and rail lines that went under. [name, year, lon, lat, rings]
var XDAMS=__DAMS__;
var XDAMNOTE={'Lake Wissota':'Plat books (Chippewa 1913 and 1888) and the 1878 county atlas show the Chippewa River, the Omaha rail line and the farms before the dam.','Lake Chippewa':'Flooded the Lac Courte Oreilles village of Post (Pahquahwong) and its graves, which were moved: reservation land, look only. The Sawyer 1897 plat shows the logging-era owners.','Holcombe Flowage':'Land inventory 1930s-40s shows the river, farms and roads before the dam; the Chippewa 1888 and 1913 plat books too.','Petenwell Lake':'Land inventory 1930s-40s (Juneau side) and the Juneau 1898 plat show the farms and roads before the dam.','Castle Rock Lake':'Germantown and its farms went under. Land inventory 1930s-40s (Juneau side) and the Juneau 1898 plat show them.','Lake Dubay':'Knowlton and its mill are partly under. Marathon 1880-81 plat book.','Big Eau Pleine Reservoir':'Farms and mills on the Big Eau Pleine went under. Marathon 1880-81 plat book.','Lake Arbutus':'The Black River before the Hatfield dam: Jackson 1901 and Clark 1893 plat books.'};
{ const gD=el('g',{'pointer-events':'none'},gBase); gD.style.display='none'; const OLD=['xmaps','plat1913','1800s','survey'];
  for(const d of XDAMS){ const B=[180,-180,90,-90];
    for(const r of d[4]){ let x=r[0],y=r[1]; const pts=[]; for(let i=0;i<r.length;i+=2){ if(i){ x+=r[i]; y+=r[i+1]; } const lo=x/1e4, la=y/1e4; B[0]=Math.min(B[0],lo); B[1]=Math.max(B[1],lo); B[2]=Math.min(B[2],la); B[3]=Math.max(B[3],la); pts.push(P(lo,la).map(v=>+v.toFixed(5)).join(',')); }
      el('path',{d:'M'+pts.join('L')+'Z',fill:'none',stroke:'#d0342c','stroke-width':2,'stroke-dasharray':'7 4','vector-effect':'non-scaling-stroke'},gD); }
    d.B=B; }
  let shw=true; try{ shw=localStorage.getItem('og-xdam')!=='0'; }catch(_){}
  window.XDAMV=()=>{ gD.style.display=shw&&OLD.includes(GM.type)?'':'none'; };
  window.XDAMSET=v=>{ shw=v; try{ localStorage.setItem('og-xdam',v?'1':'0'); }catch(_){} XDAMV(); };
  OGE.on('draw',()=>XDAMV()); }
{ let cur='bd'; try{ const v=localStorage.getItem('og-xmcur'); if(XMAPS.some(x=>x.id===v)) cur=v; }catch(_){}
  window.XM={get cur(){ return cur; }};
  let op=100; try{ op=+(localStorage.getItem('og-xmop')??100); }catch(_){}
  document.getElementById('gmNote').insertAdjacentHTML('afterend',`<div class="gm19" id="gmXM" hidden>
    <div class="row" id="gmXMl">${XMAPS.map(x=>`<button class="btn" data-xm="${x.id}" aria-pressed="${x.id===cur}">${x.label}</button>`).join('')}</div>
    <p class="hint" id="gmXMapp" hidden>These maps are in the home-screen app only (they are too big for this page).</p>
    <label>See-through <input type="range" id="gmXMr" min="30" max="100" value="${op}" aria-label="Old map see-through"></label>
    <div class="row" id="gmXMgo"></div>
    <label><input type="checkbox" id="gmXMd"> Today's dammed lakes (red dashes)</label>
    <details><summary>Ground under dammed lakes</summary><p class="hint">Red dashes are today's shoreline. These lakes were dry land, river and farms before their dams; drawdowns and low water bare the old shore, roads and foundations. Look at them in Land inventory, Plat books or 1800s.</p><div class="row" id="gmXMdg">${XDAMS.map((d,i)=>`<button class="btn" data-xd="${i}">${d[0]} (${d[1]})</button>`).join('')}</div><div id="gmXMdn"></div></details>
    <details><summary>Sources and fit</summary><div id="gmXMsrc">${XMAPS.map(x=>x.src).join('')}</div></details></div>`);
  const cD=document.getElementById('gmXMd'); try{ cD.checked=localStorage.getItem('og-xdam')!=='0'; }catch(_){ cD.checked=true; } cD.onchange=()=>XDAMSET(cD.checked);
  document.getElementById('gmXMdg').onclick=ev=>{ const b=ev.target.closest('[data-xd]'); if(!b) return; const d=XDAMS[+b.dataset.xd], B=d.B, m=0.01;
    document.getElementById('gmXMdn').innerHTML=`<p class="hint"><b>${d[0]}, dam ${d[1]}:</b> ${XDAMNOTE[d[0]]||''} Source for the shoreline: USGS National Hydrography Dataset.</p>`;
    const [x0,y0]=P(B[0]-m,B[3]+m),[x1,y1]=P(B[1]+m,B[2]-m); vb={x:x0,y:y0,w:x1-x0,h:y1-y0}; fit(); apply(); try{ gmSheet(false); }catch(_){} drawMarkers(); };
  const pX=document.getElementById('gmXM'), rX=document.getElementById('gmXMr'), gX=document.getElementById('gmXMgo');
  const goRow=()=>{ const x=XMAPS.find(x=>x.id===cur); gX.innerHTML=x.go.map((g,i)=>`<button class="btn" data-xg="${i}">Go to ${g[0]}</button>`).join(''); };
  goRow();
  rX.oninput=()=>{ try{ localStorage.setItem('og-xmop',rX.value); }catch(_){} if(typeof ogtFade==='function') ogtFade(); };
  function vXM(){ const o=GM.type==='xmaps'; if(pX) pX.hidden=!o; document.getElementById('gmXMapp').hidden=!(o&&!(typeof OGT!=='undefined'&&OGT.ix)); }
  document.getElementById('gmXMl').onclick=ev=>{ const b=ev.target.closest('[data-xm]'); if(!b) return; cur=b.dataset.xm; try{ localStorage.setItem('og-xmcur',cur); }catch(_){}
    for(const e of document.querySelectorAll('#gmXMl [data-xm]')) e.setAttribute('aria-pressed',e.dataset.xm===cur); goRow(); gmNote(); try{ tilesSoon(); }catch(_){} drawMarkers(); };
  gX.onclick=ev=>{ const b=ev.target.closest('[data-xg]'); if(!b) return; const B=XMAPS.find(x=>x.id===cur).go[+b.dataset.xg].slice(1);
    const [x0,y0]=P(B[0],B[3]),[x1,y1]=P(B[1],B[2]); vb={x:x0,y:y0,w:x1-x0,h:y1-y0}; fit(); apply(); try{ gmSheet(false); }catch(_){} drawMarkers(); };
  const _gstX=gmSetType; gmSetType=function(t,open){
    if(t==='xmaps'){ _gstX('default',open); GM.type='xmaps'; try{ localStorage.setItem('atlas-maptype','xmaps'); localStorage.setItem('og-xm','1'); }catch(_){} gmSheetSync(); drawMarkers(); }
    else{ try{ localStorage.removeItem('og-xm'); }catch(_){} _gstX(t,open); } vXM(); };
  const _gnX=gmNote; gmNote=function(){ _gnX(); const n=document.getElementById('gmNote'); if(n&&GM.type==='xmaps') n.textContent=XMAPS.find(x=>x.id===cur).note; vXM(); };
  document.getElementById('gmTypes').insertAdjacentHTML('beforeend','<button data-mt="xmaps" aria-pressed="false"><i class="mt-xm"></i><span>More old maps</span></button>');
  { const h=document.querySelector('#gmTypes button[data-wm]'); if(h) h.parentNode.appendChild(h); }
  OGE.on('draw',()=>vXM());
  let saved=null; try{ saved=localStorage.getItem('og-xm'); }catch(_){}
  if(saved==='1' && GM.type==='default') gmSetType('xmaps'); else vXM(); gmSheetSync(); }
'''
anchor='</script>\n<script>\n// ---------- old maps as tiles (v137)'
assert s.count(anchor)==1, 'tiles anchor'
s=s.replace(anchor,BLOCK.replace('__DAMS__',DAMS)+anchor)
# tile layers: one shown at a time, only in this map type
a="for(const t of PT) SHOW[t]=()=>GM.type==='plat1913';"
assert s.count(a)==1, 'SHOW anchor'
s=s.replace(a,a+"\n  const XT=(typeof XMAPS!=='undefined'?XMAPS:[]).map(x=>x.id); for(const t of XT) SHOW[t]=()=>GM.type==='xmaps'&&XM.cur===t;")
a="for(const id of ['o250','o15','o19','o78','o78t','gs','ogt','o72','o36',...PT]){"
assert s.count(a)==1, 'ids anchor'
s=s.replace(a,a.replace('...PT]','...PT,...XT]'))
a="document.body.classList.toggle('ogpgs',GM.type==='survey'); }"
assert s.count(a)==1, 'fade anchor'
s=s.replace(a,"document.body.classList.toggle('ogpgs',GM.type==='survey');\n  const rX=document.getElementById('gmXMr'); if(rX) for(const x of (typeof XMAPS!=='undefined'?XMAPS:[])) set(x.id,Math.min(1,+rX.value/100)); document.body.classList.toggle('ogpxm',GM.type==='xmaps'); }")
# the street map stays underneath, as for the other old-map types
a="||GM.type==='survey')&&OG.live"
assert s.count(a)==1, 'street anchor'
s=s.replace(a,"||GM.type==='survey'||GM.type==='xmaps')&&OG.live")
a="body.ogpgs .ogland{display:none}"
assert s.count(a)==1, 'css anchor'
s=s.replace(a,a+"\nbody.ogpxm .ogland{display:none}\n.mt-xm{background:repeating-linear-gradient(0deg,transparent 0 9px,#4f6b3a 9px 10px),repeating-linear-gradient(90deg,transparent 0 9px,#4f6b3a 9px 10px),#e7ecd6}")
open(p,'w',encoding='utf-8').write(s); print('patched XMAPS')
