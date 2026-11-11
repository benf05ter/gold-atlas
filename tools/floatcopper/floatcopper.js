// ---------- Float copper: where it might be (fc1). Graded ground zones, a map mode, and a list by grade on Start here ----------
// Zones come only from documented finds and published geology: Salisbury's 1883 compilation of drift copper finds
// (Trans. Wis. Acad. vol. VI), Chamberlin's Geology of Wisconsin (1883), the A.E. Seaman Mineral Museum's Float Copper in
// Michigan (2017), Michigan Tech's Keweenaw Geoheritage pages, WGNHS and Minnesota's Mineral Heritage bulletin.
// Outlines are drawn by hand and approximate. Tier colours follow the atlas tier chart (TIER.C). Source: tools/floatcopper.
(()=>{ try{
  const TC=(typeof TIER==='object'&&TIER.C)||{S:'#ff7f7f',A:'#ffbf7f',B:'#ffdf7f',C:'#ffff7f',D:'#bfff7f',E:'#7fff7f',F:'#7fffff'};
  const TN=(typeof TIER==='object'&&TIER.NAME)||{};
  const TO='SABCDEF';
  const SAL=['Salisbury, Notes on the Dispersion of Drift Copper, Trans. Wisconsin Academy vol. VI (1881-83), pp. 42-50','https://archive.org/details/transactionsofwi67188187wisc'];
  const CHA=['Geology of Wisconsin, Survey of 1873-1879, vol. I (1883), p. 660: Drift copper','https://archive.org/details/geologyofwiscons0001unse_z4j6'];
  const SEA=['A.E. Seaman Mineral Museum: Float Copper in Michigan (2017)','https://museum.mtu.edu/sites/default/files/2020-12/AESMM_Web_Pub_3_Float_Copper_Michigan_2017.pdf'];
  const MTU=['Michigan Tech Keweenaw Geoheritage: Float copper','https://www.geo.mtu.edu/KeweenawGeoheritage/HoughtonEC/Float_Copper.html'];
  const WGN=['WGNHS: Copper in Wisconsin (localities and float copper finds)','https://home.wgnhs.wisc.edu/minerals/copper/'];
  const MNH=["Minnesota's Mineral Heritage (Conservation Bulletin 12)",'https://www.lrl.mn.gov/docs/2015/other/155276.pdf'];
  const WES=['West, Copper: its Mining and Use by the Aborigines of the Lake Superior Region (Milwaukee Public Museum, 1929), p. 43','https://archive.org/details/CopperMiningAndUseLakeSuperior'];
  const SAW=['Sawyer, A History of the Northern Peninsula of Michigan, vol. I (1911)','https://archive.org/details/bac9274.0001.001.umich.edu'];
  const band=(pts,d)=>[...pts.map(([x,y])=>[x+d,y]),...pts.slice().reverse().map(([x,y])=>[x-d,y])];
  const Z=[
   {k:'kew',t:'A',n:'Copper Country gravels south and southwest of the Keweenaw range',sh:'The source itself: the 35-ton and 26.6-ton masses came from this drift',
    why:'Float copper is native copper the ice tore from the Keweenaw lodes and dropped in till and outwash. The ice here moved from the northeast, so the glacial sediments over and just south and southwest of the copper range hold the most and the biggest pieces. The largest known float, about 35 tons, turned up near the Houghton County airport in the early 2000s; a 26.6-ton mass came from the Quincy claims near Boston Location in 1997; Michigan Tech names the Coles Creek outwash, the Hancock gravel quarry and even its own campus as places float has been found.',
    look:'Shallow soil and gravel where water has washed the sand away and left heavy cobbles; gravel pits and quarries; logging cuts and skid roads; stream cutbanks. A detector finds it long before your eye does. Pieces from ounces to hundreds of pounds are found every year.',
    rules:'Nearly all of it is private, mining-company or Commercial Forest land. Commercial Forest land is open to the public for hunting, fishing and trapping only, not digging, so get written permission. Pits and quarries: ask the operator. Copper with ancient hammer marks, or worked copper, is an artifact: leave it and report it.',
    src:[SEA,MTU],
    r:[[[-88.10,47.45],[-88.42,47.33],[-88.62,47.20],[-88.80,47.05],[-89.05,46.92],[-89.10,46.80],[-88.80,46.78],[-88.55,46.85],[-88.40,47.00],[-88.25,47.15],[-88.00,47.33]]]},
   {k:'ont',t:'B',n:'Ontonagon river valleys and their red clay',sh:'Home of the 3,708 lb Ontonagon Boulder; 3,000 lb and 300-400 lb boulders came out of the red clay',
    why:'The Ontonagon Boulder, 3,708 pounds, sat on the West Branch of the Ontonagon until 1843. Whittlesey recorded a copper rock of about 3,000 pounds found in the red clay on the west fork (very likely the same boulder) and another of 300 to 400 pounds taken from the red clay three miles south of the Minesota Mine on the middle fork. The rivers cut down through red clay and till that the ice spread off the copper range.',
    look:'River cutbanks in red clay and the gravel bars just below them, after high water has scoured them; old logging roads and pits in the till.',
    rules:'Ottawa National Forest rules apply on federal land; most of the rest is private or Commercial Forest land (hunting, fishing and trapping only). Ask first.',
    src:[SEA,MTU,SAL],
    r:[[[-89.10,46.80],[-89.05,46.92],[-89.45,46.90],[-89.75,46.80],[-89.80,46.55],[-89.45,46.40],[-89.00,46.45],[-88.90,46.62]]]},
   {k:'chq',t:'B',n:'Chequamegon shore and the Apostle Islands',sh:'Three big masses on record: 1,700 lb (Sioux River), 800 lb (mainland opposite La Pointe, 1845), 100 lb (Outer Island)',
    why:'The ice and the old glacial lakes laid red clay and gravel right along the south shore of Lake Superior. Out of it came the biggest float copper recorded in Wisconsin: a 1,700-pound boulder from the bed of the Sioux River six miles south of the lake, an 800-pound boulder on the mainland opposite La Pointe in 1845, and a 100-pound boulder on Outer Island (Sweet and Whittlesey, in Salisbury 1883; WGNHS).',
    look:'Gravel bars and cutbanks of the streams that cut the red clay (Sioux, Onion, Raspberry, Siskiwit), and the beaches after a northeast storm has pulled down fresh clay.',
    rules:'Apostle Islands National Lakeshore: no digging or collecting. Red Cliff and Bad River reservation land: tribal permission. The rest is mostly private: ask first.',
    src:[SAL,WGN],
    r:[[[-91.20,46.95],[-90.40,47.10],[-90.30,46.95],[-90.40,46.55],[-90.95,46.50],[-91.25,46.70]]]},
   {k:'ket',t:'B',n:'Kettle Moraine belt (Sheboygan to Walworth counties)',sh:"Chamberlin: copper is 'frequently found at all points along the Kettle range'; about 30 pieces from Walworth County alone",
    why:'The Kettle Moraine is the pile of gravel and till left where the Green Bay and Lake Michigan lobes met, and both lobes carried Keweenaw copper. Chamberlin wrote that copper is frequently found at all points along the Kettle range; he had record of about thirty pieces from Walworth County, one over seven pounds at Geneva Lake, and a 40 to 50 pound boulder came from near the state line. The Mukwonago (Cate farm) piece came from just east of the belt.',
    look:'Plowed fields after spring rain, and private gravel pits in the kames and outwash, where water has already sorted the heavy pieces.',
    rules:'Kettle Moraine State Forest and Lapham Peak are look only. Gravel pits and farms: written permission.',
    src:[SAL,CHA],
    r:[[[-88.10,43.90],[-88.25,43.55],[-88.38,43.30],[-88.48,43.05],[-88.62,42.88],[-88.80,42.78],[-88.70,42.70],[-88.50,42.80],[-88.36,43.00],[-88.24,43.26],[-88.10,43.50],[-87.98,43.86]]]},
   {k:'red',t:'C',n:'Superior lobe red drift (northwest Wisconsin and east-central Minnesota)',sh:'Copper boulders of hundreds of pounds in Minnesota drift; a 15 lb nugget at Ellsworth; pieces in Chippewa County',
    why:'The Superior lobe ground across the copper-bearing lavas of the Lake Superior basin and spread red till and gravel as far south as Pierce County and within about 20 miles of Eau Claire. Minnesota’s Mineral Heritage bulletin records copper boulders of hundreds of pounds in this drift; WGNHS records a 15 lb nugget near Ellsworth; Chamberlin had pieces from Chippewa County. Irving thought fragments were far more common in Wisconsin than anyone supposed, with 40 to 50 pound pieces not unusual.',
    look:'Red till in plowed fields and road cuts, gravel pits in Superior lobe outwash, and the bars of streams that cut red drift. Pieces get smaller and rarer the farther you are from Lake Superior.',
    rules:'County and state forest rules vary: see the Public land layer. Private land: ask first.',
    src:[MNH,WGN,SAL],gl:'red'},
   {k:'east',t:'C',n:'Eastern Wisconsin drift (Green Bay and Lake Michigan lobes)',sh:"'Hundreds, if not thousands' picked up: 3-4 ton Coloma and Glover Bluff masses, 970 lb Pella, 487 lb Hustisford",
    why:"Lapham wrote that copper is often found as drift boulders in eastern Wisconsin, from a few ounces to several hundred pounds. Chamberlin (1883): 'Hundreds, if not thousands of them, have been picked up in the State, especially in the eastern and northern portions.' WGNHS records 3 to 4 ton masses at Coloma and Glover Bluff, 970 lb at Pella, 487 lb at Hustisford, 114 lb at Newark and 30 lb from a Madison well; Whittlesey noted copper in the gravel beds at Ripon and Kenosha. One find says nothing about the next: they are scattered by the ice, not in veins.",
    look:'Plowed fields, gravel pits, eskers and outwash fans, and fresh road and pipeline cuts. A detector with a large coil over cultivated ground after rain works best.',
    rules:'State parks, forests and natural areas: see the Public land layer before digging. Farms and pits: written permission.',
    src:[CHA,SAL,WGN],
    r:[[[-87.62,45.10],[-88.10,45.30],[-88.90,45.20],[-89.40,44.90],[-89.75,44.40],[-89.80,44.00],[-89.60,43.70],[-89.10,43.58],[-89.15,43.45],[-89.45,43.32],[-89.45,43.05],[-89.28,42.80],[-89.25,42.50],[-87.80,42.49],[-87.80,43.00],[-87.88,43.40],[-87.71,43.75],[-87.66,44.09],[-87.50,44.46],[-88.00,44.53],[-87.85,44.88]]]},
   {k:'shore',t:'C',n:'Lake Michigan and Green Bay shore: red clay bluffs and river mouths',sh:'Salisbury picked up two pieces on the Ozaukee beach after a storm; pieces at the Menominee and Oconto mouths',
    why:'Red clay borders Lake Michigan along much of the Wisconsin shore. Salisbury picked up two pieces of copper on the Ozaukee County beach after a severe storm, washed out of that clay, and thought floating ice had dropped some copper along the lake borders. Whittlesey recorded 3 to 4 pound pieces at the mouths of the Menominee and Oconto rivers and a much larger one from the Peshtigo River.',
    look:'The beach below eroding clay bluffs after a big northeast blow, and river-mouth gravels at low water.',
    rules:'Beach rules differ town by town; state parks are look only unless posted. The bluffs slump without warning.',
    src:[SAL],
    r:[band([[-87.80,42.49],[-87.80,43.00],[-87.88,43.40],[-87.71,43.75],[-87.66,44.09],[-87.50,44.46]],0.05),band([[-88.00,44.53],[-87.85,44.88],[-87.62,45.10]],0.05)]},
   {k:'gtb',t:'C',n:'Grand Traverse Bay country (northwest Lower Michigan)',sh:"A Northport mass sold for $80; copper 'frequently met with' in Benzie, Antrim and Grand Traverse counties",
    why:"Salisbury (1883) named Grand Traverse Bay as one of the places drift copper seemed most plentiful. A mass found at Northport sold for $80, which he took to mean it was of great size, and copper was 'frequently met with' in Benzie, Antrim and Grand Traverse counties.",
    look:'Fields and gravel pits in the moraines, and the bay shore after storms.',
    rules:'Michigan state land has its own rules; private land: ask first.',
    src:[SAL],
    r:[[[-85.55,45.22],[-85.00,45.15],[-84.85,44.85],[-85.30,44.52],[-86.25,44.52],[-86.25,44.80],[-85.95,45.00],[-85.75,45.15]]]},
   {k:'up',t:'D',n:'Central Upper Peninsula drift (Dickinson, Menominee and Delta counties)',sh:'Native copper in the drift above the Cyclops iron mine at Norway; a Perkins report',
    why:"Sawyer (1911): 'Native copper, evidently brought by glacial action from the Keweenawan measures to the north, has been found in drift above the iron ore body of the Cyclops mine, at Norway.' Native copper was also said to be found at Perkins, Delta County, almost surely float. Few records, so it is a long shot.",
    look:'Gravel pits and fields in the drift; iron-range spoil is mostly local rock.',
    rules:'Much of it is state forest or company land: check the rules and ask first.',
    src:[SAW],
    r:[[[-88.20,46.10],[-87.00,46.10],[-86.60,45.80],[-87.30,45.40],[-87.60,45.12],[-88.20,45.75]]]},
   {k:'semn',t:'D',n:'Southeast Minnesota old drift (Olmsted and Fillmore counties)',sh:'Single records at Pleasant Grove and in Fillmore County',
    why:'The Minnesota survey reports, as compiled by Salisbury (1883), record copper at Pleasant Grove in Olmsted County and in Fillmore County. This is old, weathered drift at the western edge of the Driftless Area, so expect single small pieces.',
    look:'Upland fields and stream gravels west of the bluff country, with permission.',
    rules:'Private farmland: ask first. State parks and forests: see the Public land layer.',
    src:[SAL],
    r:[[[-92.70,44.20],[-92.00,44.20],[-91.95,43.50],[-92.45,43.50],[-92.70,43.85]]]},
   {k:'dl',t:'F',n:'Driftless Area: no float copper expected',sh:'The ice never covered it, so no Lake Superior copper was dropped here',
    why:"The glaciers went around the Driftless Area, so its soils and streams carry only local rock. Salisbury knew of a single loose piece in it, in a rock crevice in Jo Daviess County, Illinois, and thought people had probably carried it there. Native copper here is far more likely to be a lost artifact than float.",
    look:'Look elsewhere for float copper. A copper point, awl or bead here is an artifact: leave it and report it.',
    rules:'Burial mounds and archaeological sites are protected by law everywhere.',
    src:[SAL,WES],gl:'driftless'}
  ];
  Z.forEach((z,i)=>{ z.i=i; if(z.gl&&typeof GL==='object'&&GL[z.gl]) z.r=[GL[z.gl]]; });
  const ZZ=Z.filter(z=>z.r&&z.r.length);
  const pip=(x,y,r)=>{ let c=false; for(let i=0,j=r.length-1;i<r.length;j=i++){ const [xi,yi]=r[i],[xj,yj]=r[j]; if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi)) c=!c; } return c; };
  const inZ=(z,lo,la)=>z.r.some(r=>pip(lo,la,r));
  const area=z=>z.r.reduce((A,r)=>A+Math.abs(r.reduce((a,p,i)=>{ const q=r[(i+1)%r.length]; return a+p[0]*q[1]-q[0]*p[1]; },0))/2,0);
  const best=L=>L.sort((a,b)=>TO.indexOf(a.t)-TO.indexOf(b.t)||area(a)-area(b))[0];
  // each float copper pin goes to the best-graded zone it sits in
  const CU=()=>PTS.filter(p=>p.L==='copper'&&!/rock piles|rock bins|Mineral Days|Museum|Trap Rock quarry|copper mine near|veins|shaft/i.test(p.n));
  let FZ=null; const finds=()=>{ if(FZ) return FZ; FZ={}; for(const p of CU()){ const z=best(ZZ.filter(z=>inZ(z,p.lo,p.la))); if(z) (FZ[z.k]||(FZ[z.k]=[])).push(p); } return FZ; };
  window.OGFC={Z,finds};

  // ---- the layer, in the Copper and Lake Superior section ----
  const Lc={sec:'Copper and Lake Superior', id:'_cufloat', n:'Where float copper might be (graded ground)', d:'Glacial ground that has given up float copper, graded by how much is on record: A Copper Country gravels, B Ontonagon, Chequamegon shore and the Kettle Moraine, C red drift and eastern Wisconsin drift, D thin records, F the Driftless Area. Tap a zone for the finds, where to work and the rules', overlay:true, on:false};
  { const i=LAYERS.findIndex(l=>l.id==='copper'); LAYERS.splice(i<0?LAYERS.length:i,0,Lc); LBY._cufloat=Lc; }
  if(typeof PLOV==='object') PLOV._cufloat=[TC.A,'b'];
  const SW=`<span class="dot" style="background:linear-gradient(90deg,${TC.A},${TC.B} 40%,${TC.C} 70%,${TC.D});border-radius:3px;opacity:.9"></span>`;
  const _rl=renderLayers; renderLayers=function(){ const r=_rl.apply(this,arguments); try{ const b=document.querySelector('#pane-layers .lrow[data-l="_cufloat"]'); if(b&&b.firstElementChild&&!b.firstElementChild.matches('.nm')) b.firstElementChild.outerHTML=SW; }catch(_){} return r; };
  if(SHM.gold&&!SHM.gold.L.includes('_cufloat')) SHM.gold.L.push('_cufloat');

  // ---- map mode: Float copper ----
  SHM.copper={n:'Float copper', d:'Where float copper might be: graded glacial ground, record finds, copper mines and Lake Superior beaches', L:['_cufloat','copper','cmine','superior','prehist','restricted','_heat','_tracks']};
  document.getElementById('shModes')?.insertAdjacentHTML('beforeend','<button type="button" data-m="copper" aria-pressed="false">Float copper</button>');
  // the saved mode is read before this script runs, so Float copper keeps its own flag (like the Historic mode)
  const _sm=shSetMode; shSetMode=function(m,keep){ _sm(m,keep); try{ localStorage.setItem('og-fcmode',SH.mode==='copper'?'1':'0'); }catch(_){} try{ fcBox(); }catch(e){ OGE.err('fcBox',e); } };

  // ---- draw ----
  let sel=null;
  function draw(s){ if(!on.has('_cufloat')||!gX||!s||!isFinite(s)) return;
    const g=el('g',{'pointer-events':'none'},gX);
    for(const z of ZZ.slice().sort((a,b)=>TO.indexOf(b.t)-TO.indexOf(a.t))){ const c=TC[z.t], hi=sel===z.k;
      const d=z.r.map(r=>'M'+r.map(([x,y])=>P(x,y).map(v=>v.toFixed(4)).join(',')).join('L')+'Z').join('');
      el('path',{d,fill:c,'fill-opacity':z.t==='F'?.10:hi?.42:.26,stroke:z.t==='F'?'#4aa8b0':'#6b4a12','stroke-width':(hi?2.6:1.3)/s,'stroke-opacity':.75,'stroke-dasharray':z.t==='F'?`${4/s} ${3/s}`:'none','fill-rule':'evenodd'},g); }
    if(s<26) return;
    for(const z of ZZ){ if(z.gl) continue; const r=z.r[0]; const c=r.reduce((a,p)=>[a[0]+p[0]/r.length,a[1]+p[1]/r.length],[0,0]); const [x,y]=P(...c);
      const t=el('text',{x,y,'text-anchor':'middle','font-size':12/s,'font-weight':800,fill:'#3d2a06',stroke:'var(--panel)','stroke-width':3/s,'paint-order':'stroke'},g); t.textContent=z.t+' · float copper'; } }
  const _dx=drawExtra; drawExtra=function(s){ _dx(s); try{ draw(s); }catch(e){ OGE.err('fcDraw',e); } };

  // ---- the zone card ----
  const tchip=t=>`<i class="tierb" style="background:${TC[t]}" title="${esc(TN[t]||t+' tier')}">${t}</i>`;
  const srcH=src=>`<p class="hint" style="margin:6px 0 0">Sources: ${src.map(([n,u])=>u?`<a href="${esc(u)}" target="_blank" rel="noopener">${esc(n)}</a>`:esc(n)).join('; ')}. Outline approximate, drawn by hand.</p>`;
  function card(z){ const F=(finds()[z.k]||[]).slice().sort((a,b)=>(a.mi||0)-(b.mi||0));
    return `<h4>${tchip(z.t)}${esc(z.n)}</h4><p style="margin:4px 0"><b>${esc(TN[z.t]||z.t+' tier')}.</b> ${esc(z.why)}</p>
      <p style="margin:4px 0"><b>Where to work:</b> ${esc(z.look)}</p><div class="note2 warn" style="margin:4px 0">${esc(z.rules)}</div>
      ${F.length?`<b style="font-size:13px">${z.t==='F'?'Finds on the edge, in older drift at the margin':'Float copper finds on record here'} (${F.length})</b><div>${F.map(p=>`<button class="item" data-goto="${p.id}"><span style="margin-top:2px">${ico(p.L,16)}</span><span><span class="t">${esc(p.n)}</span>${p.v?`<br><span class="m">${esc(p.v)}</span>`:''}</span></button>`).join('')}</div>`:''}${srcH(z.src)}`; }
  function bindPop(){ pop.querySelector('.px').onclick=()=>{ sel=null; closePop(); apply(); };
    pop.querySelectorAll('[data-goto]').forEach(b=>b.onclick=ev=>{ ev.preventDefault(); closePop(); select(b.dataset.goto,true); }); }
  function showZone(z,cx,cy){ sel=z.k; pop.innerHTML='<button class="px" aria-label="Close">×</button>'+card(z); bindPop(); pop.hidden=false; placePop(cx,cy); try{ popT=performance.now(); }catch(_){} apply(); }
  function goZone(k){ const z=Z.find(z=>z.k===k); if(!z||!z.r) return; showView('map'); on.add('_cufloat'); try{ renderLayers(); drawMarkers(); }catch(_){}
    let a=1e9,b=1e9,c=-1e9,d=-1e9; for(const r of z.r) for(const [x,y] of r){ const [px,py]=P(x,y); a=Math.min(a,px); b=Math.min(b,py); c=Math.max(c,px); d=Math.max(d,py); }
    const asp=vb.h/vb.w; let w=(c-a)*1.35, h=(d-b)*1.35; if(h>w*asp) w=h/asp; h=w*asp; vb={x:(a+c)/2-w/2,y:(b+d)/2-h/2,w,h}; apply();
    setTimeout(()=>{ const r=z.r[0], m=r.reduce((s,p)=>[s[0]+p[0]/r.length,s[1]+p[1]/r.length],[0,0]); const [sx,sy]=toS(m[0],m[1]); showZone(z,sx,sy); },80); }
  OGFC.go=goZone;
  const _fh=findHit; findHit=function(cx,cy){ const r=_fh(cx,cy); if(r||!on.has('_cufloat')) return r;
    const hit=best(ZZ.filter(z=>z.r.some(rr=>pip(cx,cy,rr.map(([x,y])=>toS(x,y))))));
    if(hit){ showZone(hit,cx,cy); return true; }
    if(sel){ sel=null; apply(); } return false; };

  // ---- the list by grade, on Start here ----
  function boxHTML(){ const F=finds(), top=SH.mode==='copper';
    const rows=TO.split('').map(t=>{ const L=Z.filter(z=>z.t===t); if(!L.length) return '';
      return `<div class="tierhd" style="display:flex;align-items:center;gap:8px;padding:5px 2px;font:700 13px var(--f-body)">${tchip(t)}<span>${esc(TN[t]||t+' tier')}</span></div>`+L.map(z=>{ const n=(F[z.k]||[]).length;
        return `<button class="item" data-fcz="${z.k}"><span style="margin-top:2px">${tchip(z.t)}</span><span><span class="t">${esc(z.n)}</span><br><span class="m">${esc(z.sh)}${n?` · ${n} find${n>1?'s':''} on the map`:''}</span></span></button>`; }).join(''); }).join('');
    return `<details ${top?'open':''}><summary class="sec" style="cursor:pointer;list-style:none"><h3 style="margin:0">Float copper: where it might be</h3></summary>
      <p class="hint">Native copper the glaciers carried south from the Keweenaw. It lies scattered in till and outwash, not in veins, so one piece says nothing about the next; but some ground has given up far more than the rest. Graded by what is on record, best first. Tap a zone to see it on the map.</p>
      ${rows}<p class="hint">A detector over plowed fields, gravel pits, cutbanks and storm beaches finds it long before your eye does. Ancient pits and worked copper are look only.</p></details>`; }
  function fcBox(){ const pane=document.getElementById('pane-picks'); if(!pane) return; let b=document.getElementById('fcBox');
    if(!b){ b=document.createElement('div'); b.id='fcBox'; b.className='sec'; }
    b.innerHTML=boxHTML();
    if(SH.mode==='copper'){ const u=document.getElementById('uxSimple'); if(u) u.before(b); else pane.prepend(b); }
    else { const a=document.getElementById('lwBox')||document.getElementById('ftAlerts'); if(a) a.after(b); else pane.append(b); }
    b.querySelectorAll('[data-fcz]').forEach(x=>x.onclick=()=>goZone(x.dataset.fcz)); }
  const _ra=renderAlerts; renderAlerts=function(){ _ra(); try{ fcBox(); }catch(e){ OGE.err('fcBox',e); } };
  fcBox();
  try{ renderLayers(); }catch(_){}
  let was=false; try{ was=localStorage.getItem('og-fcmode')==='1'; }catch(_){} if(was) shSetMode('copper');
}catch(e){ try{ OGE.err('floatcopper',e); }catch(_){} } })();
