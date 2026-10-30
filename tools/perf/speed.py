# Old Ground speed pass (atlas v137): the map paints first; lists, panels and rank sorts wait until after the first frame.
#   python3 -I tools/perf/speed.py <atlas.html> <out.html>      refuses to run twice (marker SPEED137)
import sys,re,os
src,dst=sys.argv[1],sys.argv[2]; s=open(src,encoding='utf-8').read()
assert 'SPEED137' not in s, 'already applied'
def rep(a,b,n=1):
    global s; c=s.count(a); assert c==n, f'{c} x {a[:70]!r}'; s=s.replace(a,b)
# 1. BOOT: while the page is still starting, panel renders are skipped and run once after the first map frame
i=s.index('<script>')+len('<script>')
s=s[:i]+"""
/* SPEED137 */ var BOOT={on:true,later:new Set(),skip(n){ if(this.on){ this.later.add(n); return true; } return false; }};
// SVG lines drawn with non-scaling-stroke make the browser re-lay-out every outline on every frame of a pinch or pan (the stroke depends on
// the screen transform). Instead the line width is set in map units once per redraw; mid-gesture the lines simply scale with the picture.
function nssSync(s){ if(!s||!isFinite(s)) return; const L=nssSync.L||(nssSync.L=[]);
  for(const e of document.querySelectorAll('#map [vector-effect="non-scaling-stroke"]')){ e.removeAttribute('vector-effect'); e._sw=+e.getAttribute('stroke-width')||1;
    const d=(e.getAttribute('stroke-dasharray')||'').trim(); e._da=d?d.split(/[ ,]+/).map(Number):null; if(e._da&&!e._da.every(isFinite)) e._da=null; e._s=0; L.push(e); }
  let j=0; for(const e of L){ if(!e.isConnected) continue; L[j++]=e; if(e._s===s) continue; e._s=s; e.setAttribute('stroke-width',e._sw/s); if(e._da) e.setAttribute('stroke-dasharray',e._da.map(v=>v/s).join(' ')); }
  L.length=j; }
const ogNum=n=>String(n).replace(/\\B(?=(\\d{3})+(?!\\d))/g,',');   // 12,345 without Intl (toLocaleString is slow on 8,000 parks)
"""+s[i:]
GATED=['renderList','renderLayers']
for n in GATED:
    rep(f'function {n}(){{', f'function {n}(){{ if(BOOT.skip(\'{n}\')) return;')
    c=len(re.findall(rf'(?<![\w.]){n}=function\(\)\{{',s))
    s=re.sub(rf'(?<![\w.]){n}=function\(\)\{{', f'{n}=function(){{ if(BOOT.skip(\'{n}\')) return;', s)
    print(n,'wrappers gated:',c)
# 2. no map renders while the page is still starting: one first paint at boot
rep("const RENDER={q:0, pending:false, lf:null};","const RENDER={q:0, pending:false, lf:null};")
rep("function commit(view){ const W=svgW(), H=svgH();","function commit(view){ if(BOOT.on){ RENDER.pending=true; return; } const W=svgW(), H=svgH();")
rep("try{ document.documentElement.dataset.og=String(OGE.ver); fit(); drawMarkers.now(); }catch(e){ OGE.err('boot',e); }",
    "try{ BOOT.on=false; BOOT.t=performance.now(); OGE.on('post',nssSync); document.documentElement.dataset.og=String(OGE.ver); fit(); drawMarkers.now(); }catch(e){ OGE.err('boot',e); }\n"
    "// after the first map frame is on screen: the skipped panel renders, one per task so a tap or pinch is never held up\n"
    "requestAnimationFrame(()=>setTimeout(function next(){ const n=BOOT.later.values().next().value; if(!n) return; BOOT.later.delete(n); try{ typeof n==='function'?n():globalThis[n](); }catch(e){ OGE.err('late '+n,e); } setTimeout(next,0); },0));")
# 3. parks: 7,881 cards built when parks.json arrives; Intl number formatting was most of the cost
rep('ac.toLocaleString()','ogNum(ac)',2)
# 4. rank: Sanborn towns more than ~3 km north or south can't be within 2.5 km
rep("for(const n in SBN){ const v=SBN[n]; const d=rkKm(p,v[0],v[1]);","for(const n in SBN){ const v=SBN[n]; if(Math.abs(v[1]-p.la)>0.03) continue; const d=rkKm(p,v[0],v[1]);")
# 5. the 'Good ground' lists in the hidden Best ground pane rank every spot: build them after the first frame
rep("{ const grp=k=>PTS.filter(p=>RK(p)===k).sort((a,b)=>a.mi-b.mi);","BOOT.later.add(function ugLists(){ const grp=k=>PTS.filter(p=>RK(p)===k).sort((a,b)=>a.mi-b.mi);")
rep("}\ndocument.querySelectorAll('#pane-ug .pick, #pane-ug .item').forEach(b=>b.onclick=()=>select(b.dataset.id,true));",
    "document.querySelectorAll('#pane-ug .pick, #pane-ug .item').forEach(b=>b.onclick=()=>select(b.dataset.id,true)); });")
# 6. street tiles and the drawn base map (state, county, river and lake lines) go up as soon as the engine is ready, before the rest starts
rep("ogWrap.insertAdjacentHTML('beforeend','<div class=\"plzoom\" id=\"plZoom\"></div>'); document.getElementById('plZoom').append(document.getElementById('zin'),document.getElementById('zout'));\nfit(); commit(true);",
    "ogWrap.insertAdjacentHTML('beforeend','<div class=\"plzoom\" id=\"plZoom\"></div>'); document.getElementById('plZoom').append(document.getElementById('zin'),document.getElementById('zout'));\nfit(); BOOT.on=false; commit(true); BOOT.on=true;")
# 7. satellite: Esri World Imagery (fast CDN, sharper) with the USGS imagery as the fallback on a failed tile
rep("s:(z,x,y)=>`https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/${z}/${y}/${x}`};",
    "s:(z,x,y)=>`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`,\n  s2:(z,x,y)=>`https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/${z}/${y}/${x}`};")
rep("const tlSat=tileLayer('s',ogURL.s,{base:true,max:()=>17,","const tlSat=tileLayer('s',ogURL.s,{base:true,alt:ogURL.s2,max:()=>18,")
rep("const t=tlImg(L,z,x,y); t.src=L.url(z,x,y)+'?r='+n;","const t=tlImg(L,z,x,y); t.src=(L.alt?L.alt(z,x,y):L.url(z,x,y)+'?r='+n);")
rep("Esri, HERE, Garmin, © OpenStreetMap contributors · USGS relief</div>","Esri, HERE, Garmin, © OpenStreetMap contributors · Imagery Esri, Maxar, Earthstar Geographics · USGS relief</div>")
# 8. the 1890 railway map is a schematic about 20 km off near Eau Claire: only at whole-state zoom, not county zoom
rep("cnw.style.display=s<350?'':'none'; if(s<350&&!cnw.getAttribute('href'))","cnw.style.display=s<150?'':'none'; if(s<150&&!cnw.getAttribute('href'))")
# 9. tile layers learn three things for the old-map tiles: 512 px tiles (hd), a lowest zoom (minz) and which tiles exist (has)
rep("const mx=L.max(); let zb=Math.min(mx,L.id==='h'?z:z+1), lb=[];",
    "const mx=L.max(); let zb=Math.min(mx,L.id==='h'||L.hd?z:z+1), lb=[]; if(L.minz&&zb<L.minz){ L.div.style.display='none'; continue; }")
rep("list.sort((a,b)=>d(a)-d(b)); for(const [x,y] of list){ const k=`${z}_${x}_${y}`;",
    "list.sort((a,b)=>d(a)-d(b)); for(const [x,y] of list){ if(L.has&&!L.has(z,x,y)) continue; const k=`${z}_${x}_${y}`;")
rep("tlWant(L,zb,lb); L.vis=ogTileList(zb,0).map(([x,y])=>`${zb}_${x}_${y}`); tlPlace(L);",
    "tlWant(L,zb,lb); L.vis=ogTileList(zb,0).filter(([x,y])=>!L.has||L.has(zb,x,y)).map(([x,y])=>`${zb}_${x}_${y}`); tlPlace(L);")
rep("L.vis=lb.map(([x,y])=>`${zf}_${x}_${y}`); tlPlace(L);","L.vis=lb.filter(([x,y])=>!L.has||L.has(zf,x,y)).map(([x,y])=>`${zf}_${x}_${y}`); tlPlace(L);")
# offline save: today's satellite source, and the old-map tiles of the area
rep("tl.push(`https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/${z}/${y}/${x}`); } }",
    "tl.push(ogURL.s(z,x,y)); } }\n  if(typeof OGT==='object'&&OGT.ix) for(const id in OGT.ix){ const M=OGT.ix[id]; for(let z=M.z[0];z<=M.z[1];z++){ const b=ogTileList(z,0,lon0,lon1,la0,la1); if(b.length>600) continue; for(const [x,y] of b) if(OGT.has(id,z,x,y)) U.add(OGT.u(id,z,x,y)); } }")
# 10. touches never hit-test the base map's huge outline paths (pins are hit on the canvas); only the belt and glacial areas stay tappable
rep("svg.addEventListener('pointerdown',()=>{ if(HR.rec) HR.follow=false; });","m3d.addEventListener('pointerdown',()=>{ if(HR.rec) HR.follow=false; });")
rep("svg.addEventListener('pointerdown',()=>{ if(!gmS.hidden) gmSheet(false); },{passive:true});","m3d.addEventListener('pointerdown',()=>{ if(!gmS.hidden) gmSheet(false); },{passive:true});")
rep("svg#map.drag{cursor:grabbing}","svg#map.drag{cursor:grabbing}\nsvg#map{pointer-events:none} svg#map .stm{pointer-events:visiblePainted}")
# 11. map labels: a pan doesn't change their size, so don't touch 380 SVG labels (and re-lay-out the whole SVG) unless the zoom or layers changed
rep("function labels(s){ if(!gLbl) return;","function labels(s){ if(!gLbl) return; { const k=s+'|'+gLbl.childElementCount+'|'+[...on].join(); if(labels.k===k) return; labels.k=k; }")
# 12. the grab cursor class sits on the gesture surface, not on the SVG: a class change on the SVG re-styles and re-lays-out every outline
rep("svg.classList.add('drag')","m3d.classList.add('ogdrag')",2)
rep("svg.classList.remove('drag')","m3d.classList.remove('ogdrag')")
rep("svg#map.drag{cursor:grabbing}","svg#map.drag,.m3d.ogdrag{cursor:grabbing}")
# 13. town and county names hidden under the street map were only see-through: SVG text is re-laid-out on every frame of a pinch, so take them out
rep('body.ogt svg:not(.sat) text.lbl[data-k="town"],body.ogt svg:not(.sat) text.lbl[data-k="county"]{opacity:0}',
    'body.ogt svg:not(.sat) text.lbl[data-k="town"],body.ogt svg:not(.sat) text.lbl[data-k="county"]{display:none}')
rep('body.ogt svg:not(.sat) path[stroke="var(--river)"]{opacity:0}','body.ogt svg:not(.sat) path[stroke="var(--river)"]{display:none}')
# 14. the map box's screen position is read once per 50 ms, not on every finger move (each read forces a layout)
rep("svgRect=()=>{ const r=m3d.getBoundingClientRect(); const w=VP.W||r.width, h=VP.H||r.height;",
    "svgRect=()=>{ const t=performance.now(); let r=svgRect.r; if(!r||t-svgRect.t>50){ r=svgRect.r=m3d.getBoundingClientRect(); svgRect.t=t; } const w=VP.W||r.width, h=VP.H||r.height;")
rep("function boxSet(w,h){ VP.W=w; VP.H=h;","function boxSet(w,h){ svgRect.r=null; VP.W=w; VP.H=h;")
# 15. the best-spot card re-ranked every spot after every pan; the answer only changes with ranks, your spot, alerts or worked marks
rep("function tdNear(){ return PTS.filter(","function tdNear(){ const k=[RKV,ORG.lo,ORG.la,ORG.n,PTS.length,Object.keys(FT.AL||{}).join(),JSON.stringify(FT.WK||{})].join('|'); if(tdNear.k===k) return tdNear.v.slice(); tdNear.k=k; return (tdNear.v=tdNear0()).slice(); }\nfunction tdNear0(){ return PTS.filter(")
i=s.rindex('</body>'); s=s[:i]+open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'ogt.html'),encoding='utf-8').read()+s[i:]
open(dst,'w',encoding='utf-8').write(s)
