// ---------- Low water now: river gauges and Great Lakes stations, scored against their own record for the date ----------
// Data: lowwater.json, rebuilt every 3 hours by the "Low water" GitHub Action in benf05ter/gold-atlas-maps
// (USGS river gauges + NOAA Great Lakes stations, no key). Read from raw.githubusercontent.com so the offline
// cache never pins an old copy; the last good copy is kept on the phone for no-signal days.
// Heat colours follow the finds heatmap: deep red = lowest on record for the date, orange = very low, yellow = below normal.
(()=>{ try{
  const LW={d:null, url:'https://raw.githubusercontent.com/benf05ter/gold-atlas-maps/lowwater-data/lowwater.json'};
  window.OGLW=LW;
  const BC={vlow:'#b3140c',low:'#f0641e',blow:'#f5bd2a',norm:'#8a9099',high:'#3b6fd0',na:'#8a9099'};
  const BN={vlow:'Very low: 5% or less of days this time of year were lower',low:'Low: in the lowest 10% for the date',blow:'Below normal',norm:'Normal',high:'Above normal',na:'No record to compare'};
  const pctTxt=p=>p==null?'?':p<1?'lowest on record':Math.round(p)+'%';
  const fmt=(v,u)=>u==='cfs'?Math.round(v).toLocaleString()+' cfs':(v>=0?'+':'')+v.toFixed(2)+' ft';
  const ago=t=>{ const m=(Date.now()-Date.parse(t))/6e4; return !isFinite(m)?'':m<90?Math.round(m)+' min ago':m<2880?Math.round(m/60)+' h ago':Math.round(m/1440)+' days ago'; };
  const WETRX=/\briver\b|creek|gravel bar|sandbar|\bbars?\b|landing|ferry|\bford\b|swim|bathing|beach|shore|island|bridge|boom|rapids|falls\b|dam\b|harbou?r|pier|dock|point\b|bay\b|lake/i;
  const lwSpots=s=>{ const R=s.k==='l'?32000:20000;
    return PTS.filter(p=>{ if(Math.abs(p.la-s.la)>0.32||Math.abs(p.lo-s.lo)>0.45) return false;
      if(['panning','trap','beach','superior','wreck'].includes(p.L)) return true; if(s.k==='r'&&p.L==='lake') return false;
      return WATERL.has(p.L)&&WETRX.test([p.n,p.pl].join(' ')); })
      .map(p=>[mDist(p.lo,p.la,s.lo,s.la),p]).filter(a=>a[0]<=R).sort((a,b)=>{ const ra=RK(a[1]),rb=RK(b[1]); return ((typeof ra==='number'&&ra)||9)-((typeof rb==='number'&&rb)||9)||a[0]-b[0]; }).map(a=>a[1]); };
  // USGS names come in capitals ("CHIPPEWA RIVER AT CHIPPEWA FALLS, WI"): keep the place part, in normal case
  const SMALL=new Set(['at','near','nr','above','below','of','the','and','on','in','abv','blw','bl','ab']);
  const tc=t=>t.toLowerCase().replace(/\b[a-z][a-z.']*/g,(w,i)=>i&&SMALL.has(w)?w:w[0].toUpperCase()+w.slice(1)).replace(/\b(Wi|Mn|Ia|Il|Mi)$/,m=>m.toUpperCase()).replace(/\bnr\b/gi,'near').replace(/\bMc([a-z])/g,(m,c)=>'Mc'+c.toUpperCase()).replace(/\bSt\b(?!\.)/g,'St.');
  const place=x=>{ if(x.k==='l') return x.n.replace(/,\s*Lake \w+$/,''); const t=tc(x.n).replace(/,\s*(WI|MN|IA|IL|MI)$/,'');
    const m=t.match(/\b(at|near|above|below|abv|blw|bl|ab)\s+(.*)$/i); if(!m) return t; const w={abv:'above',ab:'above',blw:'below',bl:'below'}[m[1].toLowerCase()]||m[1].toLowerCase();
    return (w==='at'?'':w+' ')+m[2]; };
  const label=x=>x.k==='l'?`${x.w} at ${place(x)}`:`${x.w} River ${/^(near|above|below)/.test(place(x))?'':'at '}${place(x)}`;
  const what=s=>s.k==='r'
    ? `${fmt(s.v,'cfs')} now, ${pctTxt(s.pct)} for the date (normal ${Math.round(s.q[1]).toLocaleString()} cfs; low end ${Math.round(s.q[0]).toLocaleString()}; lowest seen near this date ${Math.round(s.rec[0]).toLocaleString()}, ${s.yrs} years of record)${s.gh!=null?`. Stage ${s.gh.toFixed(2)} ft`:''}.`
    : `${fmt(s.v,'ft')} against chart low-water datum (30-day mean ${fmt(s.m30,'ft')}; ${pctTxt(s.pct)} for this month since 1991, record low for the month ${s.mlow!=null?fmt(s.mlow,'ft'):'?'}). Last hour is ${Math.abs(s.set).toFixed(2)} ft ${s.set<0?'below':'above'} the 30-day mean${s.lo24<-0.3?`; it dipped ${Math.abs(s.lo24).toFixed(2)} ft in the last day`:''}.`;
  const tip=(s,kind)=>kind==='setdown'
    ? `Wind setdown on ${s.w}: water at ${place(s)} is ${Math.abs(s.set).toFixed(1)} ft under its usual level right now. A strong offshore wind or a seiche has pushed water away, so a strip of beach, sandbar and harbour bottom that is normally wet is out for a few hours. Go now and work the fresh waterline, the old swim drop-off and around piers; it comes back when the wind drops.`
    : s.k==='r'
      ? `The ${s.w} is ${kind==='vlow'?'very low':'low'} for this time of year at ${place(s)}. Gravel bars, bedrock cracks, old ferry and ford crossings and the drop-off at old swimming beaches are out of the water. Work inside bends, heads of bars and below old bridges and landings. Watch for soft mud and rising water after rain upstream.`
      : `${s.w} is ${kind==='vlow'?'very low':'low'} for this month. Old beaches, the toe of bluffs, harbour edges and sandbars that are usually under a foot or two of water are exposed. These lows last weeks to months, so plan a trip.`;
  function load(j){ if(!j||!Array.isArray(j.sites)) return; LW.d=j; LW.by=Object.fromEntries(j.sites.map(s=>[s.id,s]));
    // the older river alerts read the same four gauges: feed them so they no longer go stale
    if(typeof GBY==='object'&&FT.cond?.src!=='live'){ const g={}; for(const s of j.sites) if(s.k==='r'&&GBY[s.id]) g[s.id]={q:s.v,d:(s.d||'').slice(0,10),max:s.mx,maxd:s.mxd};
      if(Object.keys(g).length){ FT.cond={asof:(j.asof||'').slice(0,10),src:'gh',g}; } }
    try{ ftRefresh(); }catch(e){ OGE.err('lowwater',e); } }
  try{ load(JSON.parse(localStorage.getItem('atlas-lowwater')||'null')); }catch(_){}
  (async()=>{ try{ if(navigator.onLine===false) return; const ac=new AbortController(); setTimeout(()=>ac.abort(),10000);
    const r=await fetch(LW.url+'?t='+Math.floor(Date.now()/6e5),{signal:ac.signal,cache:'no-store'}); if(!r.ok) return; const j=await r.json();
    try{ localStorage.setItem('atlas-lowwater',JSON.stringify(j)); }catch(_){} load(j); }catch(_){} })();

  // ---- the layer ----
  const Lw={sec:'Your finds and conditions', id:'_lowwater', n:'Low water now (heat map)', d:'River gauges and Great Lakes stations scored against their own record for the date, every 3 hours. Deep red = lowest on record for the date, orange = in the lowest 10% (bars and old shoreline exposed), yellow = below normal, grey = normal, blue = high. Tap a gauge for the reading and the atlas spots near it', overlay:true, on:true};
  { const i=LAYERS.findIndex(l=>l.id==='_alerts'); LAYERS.splice(i<0?LAYERS.length:i+1,0,Lw); LBY._lowwater=Lw; }
  for(const m of ['detecting','gold','mine']) if(SHM[m]&&!SHM[m].L.includes('_lowwater')) SHM[m].L.push('_lowwater');
  if(SH.mode!=='custom'&&SH.mode!=='history') on.add('_lowwater');
  if(typeof PLOV==='object') PLOV._lowwater=['#f0641e','h'];
  const SW='<span class="dot" style="background:radial-gradient(#b3140c,#f0641e 50%,#f5bd2a);border-radius:50%"></span>';
  const _rl=renderLayers; renderLayers=function(){ const r=_rl.apply(this,arguments); try{ const b=document.querySelector('#pane-layers .lrow[data-l="_lowwater"]'); if(b&&b.firstElementChild&&!b.firstElementChild.matches('.nm')) b.firstElementChild.outerHTML=SW; }catch(_){} return r; };
  try{ renderLayers(); }catch(_){}
  { const d=svg.querySelector('defs'); d.insertAdjacentHTML('beforeend',Object.entries(BC).map(([k,c])=>`<radialGradient id="lwG-${k}"><stop offset="0" stop-color="${c}" stop-opacity="${k==='norm'||k==='na'?.0:.8}"/><stop offset=".5" stop-color="${c}" stop-opacity="${k==='norm'||k==='na'?0:.4}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('')); }
  const ord={vlow:0,low:1,blow:2,high:3,norm:4,na:5};
  function lwDraw(s){ if(!LW.d||!on.has('_lowwater')||!gX||!s||!isFinite(s)) return;
    const ss=[...LW.d.sites].sort((a,b)=>ord[b.b]-ord[a.b]);
    const g=el('g',{'pointer-events':'none'},gX);
    for(const x of ss){ if(x.b==='norm'||x.b==='na') continue; const [cx,cy]=P(x.lo,x.la); const R=Math.max(x.k==='l'?0.3:0.2,(x.b==='high'?18:42)/s);
      el('circle',{cx,cy,r:x.b==='high'?R*.6:R,fill:`url(#lwG-${x.b})`},g); }
    for(const x of ss){ const [cx,cy]=P(x.lo,x.la);
      el(x.k==='l'?'rect':'circle',x.k==='l'?{x:cx-4.5/s,y:cy-4.5/s,width:9/s,height:9/s,rx:2/s,fill:BC[x.b],stroke:'var(--panel)','stroke-width':1.6/s}:{cx,cy,r:4.6/s,fill:BC[x.b],stroke:'var(--panel)','stroke-width':1.6/s},g);
      if(s>=260&&x.pct!=null){ const t=el('text',{x:cx+7/s,y:cy+4/s,'font-size':11/s,'font-weight':700,fill:'var(--ink)',stroke:'var(--panel)','stroke-width':3/s,'paint-order':'stroke'},g); t.textContent=x.pct<1?'record low':Math.round(x.pct)+'%'; } } }
  const _dxLw=drawExtra; drawExtra=function(s){ _dxLw(s); try{ lwDraw(s); }catch(e){ OGE.err('lwDraw',e); } };

  // ---- tap a gauge ----
  function card(x){ const sp=lwSpots(x).slice(0,6), A=(LW.d.alerts||[]).filter(a=>a.id===x.id);
    return `<h4>${esc(label(x))}</h4><p><span class="dot" style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${BC[x.b]};margin-right:5px"></span><b>${esc(BN[x.b])}</b> · ${esc(x.k==='l'?x.w+' water level (NOAA)':x.w+' River flow (USGS)')}</p>
      <p style="margin:4px 0">${esc(what(x))}</p>${x.note?`<p class="hint" style="margin:4px 0">${esc(x.note)}</p>`:''}${A.map(a=>`<p class="note2 ok" style="margin:4px 0">${esc(tip(x,a.kind))}</p>`).join('')}
      <p class="hint">Reading ${esc(ago(x.d))}${LW.d.asof?' · checked '+esc(ago(LW.d.asof)):''}.${x.k==='l'?' The Great Lakes have no real tide (about an inch); level here moves with the season and with wind setdown.':''}</p>
      ${sp.length?`<b style="font-size:13px">Atlas spots near this gauge</b><div>${sp.map(p=>`<button class="item" data-goto="${p.id}"><span style="margin-top:2px">${ico(p.L,16)}</span><span><span class="t">${typeof RK(p)==='number'&&RK(p)?'['+RK(p)+'] ':''}${esc(p.n)}</span></span></button>`).join('')}</div>`:''}`; }
  function showGauge(x,cx,cy){ pop.innerHTML='<button class="px" aria-label="Close">×</button>'+card(x); pop.querySelector('.px').onclick=closePop;
    pop.querySelectorAll('[data-goto]').forEach(b=>b.onclick=ev=>{ ev.preventDefault(); closePop(); select(b.dataset.goto,true); });
    pop.hidden=false; placePop(cx,cy); try{ popT=performance.now(); }catch(_){} }
  LW.show=id=>{ const x=LW.by&&LW.by[id]; if(!x) return; showView('map'); on.add('_lowwater'); const [px,py]=P(x.lo,x.la); const w=Math.min(vb.w,1.2), h=w*vb.h/vb.w; vb={x:px-w/2,y:py-h/2,w,h}; apply();
    setTimeout(()=>{ const [sx,sy]=toS(x.lo,x.la); showGauge(x,sx,sy); },60); };
  const _fh=findHit; findHit=function(cx,cy){ if(LW.d&&on.has('_lowwater')){ let best=null, bd=14;
      for(const x of LW.d.sites){ const [sx,sy]=toS(x.lo,x.la), d=Math.hypot(sx-cx,sy-cy); if(d<=bd){ bd=d; best=x; } }
      if(best){ showGauge(best,cx,cy); return true; } }
    return _fh(cx,cy); };

  // ---- alerts on Start here, go-now rings on the nearby spots ----
  const _ba=buildAlerts; buildAlerts=function(){ _ba(); if(!LW.d) return;
    for(const a of LW.d.alerts||[]){ const x=LW.by[a.id]; if(!x) continue; if(x.k==='r'&&typeof GBY==='object'&&GBY[x.id]&&a.kind==='low') continue;
      const ids=lwSpots(x).map(p=>p.id);
      const al={k:'lw-'+a.k,lv:'go',t:a.kind==='setdown'?`Wind setdown: ${label(x)} is ${Math.abs(x.set).toFixed(1)} ft under its usual level right now`:`${a.kind==='vlow'?'Very low':'Low'} water: ${label(x)} (${pctTxt(x.pct)} for the date)`,b:tip(x,a.kind),g:what(x),ids};
      FT.alerts.push(al); for(const id of ids) (FT.AL[id]||(FT.AL[id]=[])).push(al); } };
  function lwHTML(){ if(!LW.d) return ''; const S=[...LW.d.sites].sort((a,b)=>(a.pct??101)-(b.pct??101));
    const row=x=>`<button class="item" data-lw="${x.id}"><span class="dot" style="flex:none;margin-top:5px;width:11px;height:11px;border-radius:${x.k==='l'?'3px':'50%'};background:${BC[x.b]}"></span><span><span class="t">${esc(label(x))}</span><br><span class="m">${esc(x.k==='r'?fmt(x.v,'cfs'):fmt(x.v,'ft')+' (30-day '+fmt(x.m30,'ft')+')')}${x.k==='l'&&x.set<=-0.3?' · set down '+Math.abs(x.set).toFixed(1)+' ft now':''}</span></span><span class="d">${esc(pctTxt(x.pct))}</span></button>`;
    const grp=(t,f,open)=>{ const L=S.filter(f); return L.length?`<details ${open?'open':''}><summary class="sec" style="cursor:pointer"><b>${t} (${L.length})</b></summary><div>${L.map(row).join('')}</div></details>`:''; };
    return `<div class="sec" id="lwNow"><h3>Lowest water now</h3><p class="hint">${S.length} gauges, lowest first. The % is where today sits in that gauge's own record for this date: 5% means only 1 day in 20 this time of year was lower. Rivers from USGS, Great Lakes from NOAA, checked ${esc(ago(LW.d.asof))}. The lakes have no real tide; lows come with the season and with wind setdown, which can drop a shore a foot or more for a few hours.</p></div>
      ${grp('Very low and low: go now',x=>x.b==='vlow'||x.b==='low',true)}${grp('Below normal',x=>x.b==='blow',true)}${grp('Normal',x=>x.b==='norm'||x.b==='na',false)}${grp('High: stay off the bars',x=>x.b==='high',false)}`; }
  const _ra=renderAlerts; renderAlerts=function(){ _ra(); const old=document.getElementById('lwBox'); if(old) old.remove(); const h=lwHTML(); if(!h) return;
    const a=document.getElementById('ftAlerts'); const box=document.createElement('div'); box.id='lwBox'; box.innerHTML=h;
    if(a) a.after(box); else document.getElementById('pane-picks').prepend(box);
    box.querySelectorAll('[data-lw]').forEach(b=>b.onclick=()=>LW.show(b.dataset.lw)); };
  try{ ftRefresh(); }catch(_){}
}catch(e){ try{ OGE.err('lowwater',e); }catch(_){} } })();
