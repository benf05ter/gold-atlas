// ---------- more old maps: bird's-eye views, 1917 Blue Book routes, old DNR lake maps, flood zones today, land cover today ----------
// Side files in nl/ (nothing loads until its layer is switched on or a spot card opens):
// nl/be.json bird's-eye views [id,title,year,town,la,lo,stt,img,remote,link,by,src]; nl/be/*.webp the nearer views (the rest open from the library)
// nl/bb.json 1917 Automobile Blue Book routes {id,n,title,mi,line,stops,lm,alt}; nl/lk.json old WI and MN DNR lake maps [wbic or 'mn'+DOW,name,co,la,lo,acres,[[map,date,url?]],labels,img]
// nl/fl/F_<x>_<y>.json FEMA flood zones (1-degree tiles of [zone, sub, bfe, rings], rings delta-coded in 1e-4 degrees like pl/); nl/lc/c<n>.json land cover under each spot {id:[class,'class:%,...']}, n = sum of the id's char codes mod 8
{ const NJ=u=>fetch(u,{cache:'force-cache'}).then(r=>r.ok?r.json():null).catch(()=>null);
  const NL={be:null,bb:null,lk:null,fl:new Map(),flDrawn:new Map(),flKey:'',bbG:null};
  const addL=(after,o)=>{ const i=LAYERS.findIndex(l=>l.id===after); LAYERS.splice(i<0?LAYERS.length:i+1,0,o); LBY[o.id]=o; };
  addL('_oldmap',{sec:'Old maps vs today',id:'bev',n:"Bird's-eye town views (1867-1915)",d:"Hand-drawn views of 120 towns within about four hours, every building, mill, fairground and grove drawn from above. Pins sit at the town; tap one to open the view. Off at first",on:false});
  addL('bev',{sec:'Old maps vs today',id:'lkm',n:'Old DNR lake maps (1930s-1960s)',d:'The first state lake survey maps: shoreline, depths, and the resorts, landings, beaches and cottages of the day. Pins sit on the lake; tap one for the map and what it labels. Off at first',on:false});
  addL('_oldways',{sec:'Old railroads, roads and walkways',id:'bbr',n:'1917 Blue Book auto routes',d:'Turn-by-turn routes from the 1917 Automobile Blue Book (vol. 5). The line runs town to town; small dots are the schools, creameries, churches, stores and signboards the book steered by, placed by its mileage (good to about half a mile). Off at first',on:false});
  addL('_flood',{sec:'1884 flood at Chippewa Falls',id:'_fema',n:'Flood zones today (FEMA)',d:'Blue = the 1% (100-year) flood zone, pale = the 0.2% (500-year) zone, from FEMA flood maps. Picnic grounds, camps and fairgrounds usually sat just above the blue. Shows once you zoom in to town level',overlay:true});
  SHORT.bev="Bird's-eye town view"; SHORT.lkm='Old DNR lake map'; SHORT.bbr='1917 Blue Book route'; SHORT.bbl='1917 Blue Book landmark'; SHORT._fema='Flood zones';
  if(typeof NOGO!=='undefined') for(const k of ['bev','lkm','bbr','bbl']) NOGO.add(k);
  { const R=new Set(['bev','lkm','bbr','bbl']), g=TIER.get; TIER.get=p=>R.has(p.L)?{t:'E',sc:-1,w:'An old map to research from, not a hunting spot by itself'}:g(p); TIER.t=p=>TIER.get(p).t; }
  { const r=document.documentElement.style; r.setProperty('--L-bev','#8a5a2b'); r.setProperty('--L-lkm','#2a6fb0'); r.setProperty('--L-bbr','#b0472a'); r.setProperty('--L-bbl','#b0472a'); }
  GLY.bev='<path d="M-.6,.5 L-.6,-.05 L-.3,-.3 L0,-.05 L.3,-.42 L.6,-.05 V.5Z"/>';
  GLY.lkm='<path d="M-.6,.1 C-.6,-.4 .6,-.5 .6,.05 C.6,.5 -.6,.55 -.6,.1Z"/>';
  GLY.bbr='<path d="M-.55,.55 L-.15,-.55 H.15 L.55,.55Z M-.05,-.3 V-.1 M-.05,.1 V.3" stroke="var(--panel)" stroke-width=".1"/>';
  GLY.bbl='<circle r=".35"/>';
  document.head.insertAdjacentHTML('beforeend','<style>.nlbox{margin:8px 0;padding:8px 10px;border-radius:10px;border:1px solid var(--line,#8884);font-size:14px;line-height:1.4}.nlbox ol{margin:4px 0 0;padding-left:18px;max-height:340px;overflow:auto}.nlbox li{margin:2px 0}.nlbox .lid{max-width:100%}.flp{stroke-width:1;pointer-events:none;vector-effect:non-scaling-stroke}.fl1{fill:#1f6fd1;fill-opacity:.28;stroke:#1f6fd1;stroke-opacity:.6}.fl2{fill:#7fb2ea;fill-opacity:.16;stroke:none}.bbline{fill:none;stroke:#b0472a;stroke-width:2.5;stroke-dasharray:6 4;vector-effect:non-scaling-stroke;pointer-events:none}</style>');
  const push=p=>{ if(BYID[p.id]) return; p.mi=miles(p.lo,p.la); PTS.push(p); BYID[p.id]=p; };
  const loaded=()=>{ drawMarkers(); renderList(); };
  // bird's-eye views
  function beLoad(){ if(NL.be) return; NL.be=[]; NJ('nl/be.json').then(a=>{ NL.be=a||[];
    for(const [id,title,y,town,la,lo,stt,img,remote,link,by,src] of NL.be) push({id:'be-'+id,L:'bev',n:`${title}${String(title).includes(y)?'':' ('+y+')'}`,la,lo,stt,co:'',pl:town,y:String(y),p:'approx',c:'documented',
      st:`Bird's-eye view of ${town}, ${y}${by?', by '+by:''}. Drawn as if from a balloon, not to scale, but nearly every building, mill, school, church, fairground, park and grove is there. Match it to today by the river bends, rail lines and street grid.`,
      src:[[src,link]],be:{img,remote,link}});
    loaded(); }); }
  // 1917 Blue Book routes
  const toXY=(la,lo)=>[lo*K,-la];
  function bbLoad(){ if(NL.bb) return; NL.bb=[]; NJ('nl/bb.json').then(a=>{ NL.bb=a||[];
    for(const r of NL.bb){ const mid=r.line[Math.floor(r.line.length/2)];
      push({id:r.id,L:'bbr',n:`1917 Blue Book route ${r.n}: ${r.title}`,la:mid[0],lo:mid[1],stt:/Minn/.test(r.title)&&!/Wis/.test(r.title)?'MN':'WI',co:'',pl:`${r.stops.length} towns, ${r.mi} miles`,y:'1917',p:'route',c:'documented',
        st:`The 1917 Automobile Blue Book's turn-by-turn route, ${r.mi} miles, through ${r.stops.map(s=>s[0]).join(', ')}. The dashed line joins the towns in order; the real road wandered between them. Inns, garages, creameries and schools the book names were the roadside stops of the day.`,
        src:[['Official Automobile Blue Book, 1917, vol. 5 (Newberry Library copy, Internet Archive)','https://archive.org/details/case_gv1024_a92_1917_vol_5']],bb:r});
      r.lm.forEach((m,i)=>{ if(m.la==null) return; push({id:`${r.id}-${i}`,L:'bbl',n:`1917 road log, mile ${m.mi}: ${m.t.slice(0,60)}${m.t.length>60?'...':''}`,la:m.la,lo:m.lo,stt:'WI',co:'',pl:`Blue Book route ${r.n}`,y:'1917',p:'approx',c:'documented',
        st:`Mile ${m.mi} of route ${r.n} (${r.title}): "${m.t}" Placed by mileage between the towns, so it can be half a mile off; look for the corner, school or creamery on the 1930s Bordner map or 1938 air photo.`,src:[['Official Automobile Blue Book, 1917, vol. 5','https://archive.org/details/case_gv1024_a92_1917_vol_5']],parent:r.id}); }); }
    loaded(); bbDraw(); }); }
  function bbDraw(){ const show=on.has('bbr'); if(!NL.bbG) NL.bbG=el('g',{class:'gbb'},gBase); NL.bbG.style.display=show?'':'none'; if(!show||!NL.bb||NL.bbG.childNodes.length) return;
    for(const r of NL.bb) el('path',{class:'bbline',d:'M'+r.line.map(([la,lo])=>toXY(la,lo).map(v=>v.toFixed(4)).join(',')).join('L')},NL.bbG); }
  // old DNR lake maps
  function lkLoad(){ if(NL.lk) return; NL.lk=[]; NJ('nl/lk.json').then(a=>{ NL.lk=a||[];
    const murl=m=>m[2]||`https://apps.dnr.wi.gov/doclink/lakes_maps/${m[0]}.pdf`;
    for(const [w,name,co,la,lo,ac,maps,labels,img] of NL.lk){ const yrs=maps.map(m=>m[1]).filter(Boolean), mn=String(w).startsWith('mn');
      push({id:'lk-'+w,L:'lkm',n:`${name} (${co} Co.): ${mn?'MN':''}DNR lake map${yrs.length?' '+yrs.join(', '):''}`,la,lo,stt:mn?'MN':'WI',co,pl:`${co} County${ac?`, about ${ogNum(ac)} acres`:''}`,y:yrs[0]||'',p:'area',c:'documented',
        st:mn?`The Minnesota DNR's lake survey map${maps.length>1?'s':''} of ${name} (${maps.length} sheet${maps.length>1?'s':''}; the survey date is printed on the map, mostly 1950s-1970s). They mark the resorts, public accesses, beaches and cottages of their day; compare them with today's shore to find the ones that are gone.`:`The Wisconsin DNR's old survey map of ${name}${yrs.length?', drawn '+yrs.join(' and '):''}. ${yrs.some(y=>/19(3[89]|4[01])/.test(y))?' The 1938-41 WPA survey sheets mark every dwelling, abandoned dwelling and resort on the shore with a small square (legend, lower right): open the map and look for them, then match the spot to the 1938 air photo.':''} Later maps name the resorts, parks, landings and beaches of their day; compare them with today\'s shore to find the ones that are gone.${labels&&labels.length?' Words machine-read off the map (may have typos): '+labels.join('; ')+'.':''}`,
        src:maps.map(m=>[`${mn?'MN':'WI'} DNR lake map ${m[0]}${m[1]?' ('+m[1]+')':''}`,murl(m)]),lk:{w,maps,img}}); }
    loaded(); }); }
  OGE.on('draw',()=>{ if(on.has('bev')) beLoad(); if(on.has('lkm')) lkLoad(); if(on.has('bbr')||on.has('bbl')) bbLoad(); if(NL.bbG||on.has('bbr')) bbDraw(); flDraw(); });
  // flood zones (FEMA) on the map
  const flTile=k=>{ if(NL.fl.has(k)) return NL.fl.get(k); const pr=NJ(`nl/fl/F_${k}.json`).then(a=>{ NL.fl.set(k,a||[]); return a||[]; }); NL.fl.set(k,pr); return pr; };
  const gFl=el('g',{class:'gfl'},gBase);
  const ring=r=>{ let x=r[0],y=r[1],d=''; for(let i=0;i<r.length;i+=2){ if(i){ x+=r[i]; y+=r[i+1]; } d+=(i?'L':'M')+(x/1e4*K).toFixed(5)+','+(-y/1e4).toFixed(5); } return d+'Z'; };
  function flDraw(){ const s=scale(); if(!on.has('_fema')||!s||s<600){ gFl.style.display='none'; return; } gFl.style.display='';
    const lon0=vb.x/K, lon1=(vb.x+vb.w)/K, la1=-vb.y, la0=-(vb.y+vb.h), ks=[];
    for(let x=Math.floor(lon0);x<=Math.floor(lon1);x++) for(let y=Math.floor(la0);y<=Math.floor(la1);y++) ks.push(x+'_'+y);
    if(ks.length>4){ gFl.style.display='none'; return; } const key=ks.join('|'); if(key===NL.flKey) return;
    Promise.all(ks.map(k=>Promise.resolve(flTile(k)).then(a=>[k,a]))).then(arr=>{ if(ks.join('|')!==key) return; NL.flKey=key; const want=new Set();
      for(const [k,a] of arr){ want.add(k); if(NL.flDrawn.has(k)) continue; const g=el('g',{},gFl);
        for(const u of a) el('path',{d:u[3].map(ring).join(''),class:'flp '+(u[0]==='X'?'fl2':'fl1'),'fill-rule':'evenodd'},g);
        NL.flDrawn.set(k,g); }
      for(const [k,g] of NL.flDrawn) if(!want.has(k)){ g.remove(); NL.flDrawn.delete(k); } }); }
  const inRings=(lo,la,rings)=>{ const X=lo*1e4, Y=la*1e4; let c=false;
    for(const r of rings){ let px=r[0],py=r[1],x=px,y=py;
      for(let i=2;i<=r.length;i+=2){ const nx=i<r.length?x+r[i]:px, ny=i<r.length?y+r[i+1]:py;
        if((y>Y)!==(ny>Y)&&X<(nx-x)*(Y-y)/(ny-y)+x) c=!c; x=nx; y=ny; } } return c; };
  window.flLookup=p=>Promise.resolve(flTile(Math.floor(p.lo)+'_'+Math.floor(p.la))).then(a=>{ let best=null; for(const u of a||[]) if(inRings(p.lo,p.la,u[3])&&(!best||best[0]==='X')) best=u; return best; });
  // land cover under every spot (ESA WorldCover 2021, 10 m)
  const LCN={10:'woods',20:'brush',30:'grass (pasture, hay, lawn or prairie)',40:'plowed field',50:'buildings and pavement',60:'bare ground or sand',80:'open water',90:'marsh',100:'moss'};
  const LCT={10:'Woods now: old ground is often undisturbed, but roots make digging slow.',20:'Brush now: often old pasture or a cut-over clearing.',30:'Grass now: pasture, hay, lawn or prairie. Usually the least disturbed open ground.',
    40:'Plowed field now: the top 8-10 inches have been turned for years, so finds are scattered but shallow; best after harvest.',50:'Built over now: look for the yards, alleys, boulevards and vacant lots between.',60:'Bare ground or sand now: a pit, beach, blowout or construction.',80:'Open water now: flooded by a dam or lake rise.',90:'Marsh now: wet ground, best in a dry fall or frozen winter.'};
  NL.lc=new Map(); const lcLoad=id=>{ let n=0; for(const ch of id) n+=ch.charCodeAt(0); n%=8; if(!NL.lc.has(n)) NL.lc.set(n,NJ(`nl/lc/c${n}.json`).then(a=>a||{})); return NL.lc.get(n); };
  // card boxes
  const _selNL=select; select=function(id,pan){ const r=_selNL(id,pan), p=BYID[id]; if(!p) return r;
    const put=(cls,h)=>{ if(selId!==id) return; const t=document.querySelector('#detail .tags'); if(!t||document.querySelector('#detail .'+cls)) return; t.insertAdjacentHTML('afterend',`<div class="nlbox ${cls}">${h}</div>`); };
    if(p.be){ const b=p.be, src=b.img||b.remote;
      put('nlbe',`<b>Bird's-eye view</b><br>${src?`<div class="lid"><img src="${esc(src)}" alt="${esc(p.n)}" loading="lazy" style="max-width:100%"><span class="hint">Tap to enlarge, then zoom in to read the buildings.${b.img?'':' Loads from the library, so it needs a signal.'}</span></div>`:''}<a href="${esc(b.link)}" target="_blank" rel="noopener">Open the full-size view at the library</a>`); }
    if(p.bb){ const b=p.bb; put('nlbb',`<b>Road log, 1917</b> (mileage from the start)<ol>${b.lm.map(m=>`<li><b>${m.mi}</b> ${esc(m.t)}</li>`).join('')}</ol>${b.alt&&b.alt.length?`<span class="note">The book also gives this route in reverse as no. ${b.alt.join(', ')}.</span>`:''}`); }
    if(p.lk){ const k=p.lk; put('nllk',`<b>Old lake map${k.maps.length>1?'s':''}</b><br>${k.img?`<div class="lid"><img src="${esc(k.img)}" alt="${esc(p.n)}" loading="lazy" style="max-width:100%"><span class="hint">Tap to enlarge.</span></div>`:''}${k.maps.map(m=>`<a href="${esc(m[2]||`https://apps.dnr.wi.gov/doclink/lakes_maps/${m[0]}.pdf`)}" target="_blank" rel="noopener">Map ${esc(m[0])}${m[1]?' ('+esc(m[1])+')':''}</a>`).join(' · ')}`); }
    if(p.L!=='bbl'&&p.L!=='bbr') lcLoad(id).then(L=>{ const v=L[id]; if(!v) return; const c=v[0], parts=v[1].split(',').map(x=>x.split(':').map(Number)).sort((a,b)=>b[1]-a[1]).filter(([k])=>LCN[k]).map(([k,n])=>`${LCN[k]} ${n}%`);
      put('nllc',`<b>Ground today: ${esc(LCN[c]||'unknown')}</b><br>${esc(LCT[c]||'')}${parts.length>1?`<br><span class="note">Within 100 m: ${esc(parts.join(', '))}. ESA WorldCover 2021, 10 m satellite land cover.</span>`:''}`); });
    if(!['bbl','bbr','lkm','bev'].includes(p.L)) flLookup(p).then(u=>{ if(!u) return;
      put('nlfl',u[0]==='X'?'<b>In the 0.2% (500-year) flood zone</b><br>Floodwater reaches here only in the biggest floods; old camps and picnic grounds often sat right on this edge.':`<b>In the 1% (100-year) flood zone</b> (FEMA zone ${esc(u[0])}${u[2]>0?`, flood elevation ${u[2]} ft`:''})<br>Flooded ground: silt may have buried old surfaces, and spring floods move and drop metal along the edges.`); });
    return r; };
  renderLayers(); if(typeof gmSheetSync==='function') gmSheetSync(); }
// ---------- end more old maps
