// Hunches (v1, 2026-11-02): inferred pins. Each 'inf' pin is a hunch that does NOT meet the record standard (two sources, a placed
// farm or lot): a candidate tract, a census township, a named landmark read from a history, or a camp area inferred from mapped works.
// Off by default; violet dashed ring with a "?" so it can never be mistaken for a graded pin; never grouped into a bubble; never graded
// (no grade, no rank, no tier). Every card opens with an INFERRED banner, the reasoning chain step by step, and what record would
// confirm or kill it. The lead's own card links to its hunch pins and back. Owner names of today are never shipped.
{ const INF='inf';
  const ti=LAYERS.findIndex(L=>L.id==='_buried'||L.id==='treasure');
  const B={sec:'Treasure', id:INF, n:'Hunches: inferred pins (not graded)', d:'Where the research points but the record standard is not met yet: candidate tracts, census townships, landmarks read from old histories. Violet dashed ring with a ?. Each card shows the reasoning and what would confirm or kill it. Never graded, off by default', on:false};
  LAYERS.splice(ti<0?LAYERS.length:ti+1,0,B); LBY[INF]=B;
  if(Array.isArray(ORDER)&&!ORDER.includes(INF)) ORDER.push(INF);
  document.head.insertAdjacentHTML('beforeend','<style>:root{--L-inf:#7a4fb5;--inf-bg:#f3eefa}@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--L-inf:#b996ea;--inf-bg:#2a2236}}:root[data-theme="dark"]{--L-inf:#b996ea;--inf-bg:#2a2236}.inflk{color:var(--L-inf);font-weight:700;text-decoration:underline;cursor:pointer}.infbox{border:2px dashed var(--L-inf);background:var(--inf-bg);border-radius:10px;padding:10px 12px;margin:8px 0 10px}.infbox h4{margin:0 0 4px;color:var(--L-inf);font-size:13px;letter-spacing:.06em}.infbox ol{margin:4px 0 6px 18px;padding:0}.infbox li{margin:2px 0}.infbox p{margin:4px 0}</style>');
  SHORT[INF]='Hunch';
  GLY[INF]='<circle r=".62" fill="none" stroke="currentColor" stroke-width=".16" stroke-dasharray=".3 .2"/><text y=".3" text-anchor="middle" font-size=".9" font-weight="700" fill="currentColor">?</text>';
  try{ svg.querySelector('defs').insertAdjacentHTML('beforeend',`<symbol id="g-${INF}" viewBox="-1 -1 2 2" overflow="visible"><g fill="currentColor">${GLY[INF]}</g></symbol>`); }catch(_){}
  const _ico=ico; ico=(l,px=16,c)=>l!==INF?_ico(l,px,c):`<svg class="ic" width="${px}" height="${px}" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="var(--panel)" stroke="${c||'var(--L-inf)'}" stroke-width="2.4" stroke-dasharray="4 2.6"/><text x="12" y="16.6" text-anchor="middle" font-size="13" font-weight="700" fill="${c||'var(--L-inf)'}" font-family="system-ui,sans-serif">?</text></svg>`;
  // the pin: a pale disc with a violet dashed rim and a "?"
  const _pp=pcPin; pcPin=function(p,s){ if(p.L!==INF) return _pp(p,s);
    const c=PCV.c||pcx, [X,Y]=P(p.lo,p.la), [x,y]=pcXY(X,Y,s); if(x<-40||y<-40||x>PCV.vw+40||y>PCV.vh+40) return;
    const sel=p.id===selId, r=(s>=110?10:8)*(PCV.dk||1)*(sel?1.35:1), col=cv('var(--L-inf)');
    c.beginPath(); c.arc(x,y,r,0,6.2832); c.fillStyle=cv('var(--panel)'); c.globalAlpha=.92; c.fill(); c.globalAlpha=1;
    c.setLineDash([r*.5,r*.32]); c.lineWidth=sel?3:2.2; c.strokeStyle=sel?cv('var(--ink)'):col; c.stroke(); c.setLineDash([]);
    c.fillStyle=col; c.font=`700 ${Math.round(r*1.25)}px system-ui,sans-serif`; c.textAlign='center'; c.textBaseline='middle'; c.fillText('?',x,y+r*.06);
    PCV.dr.push([p,x,y]); };
  // never grouped into a bubble, and not hidden by the map modes or tier filters while the layer is on
  const _ux=UXdraw; UXdraw=function(vis,s){ const h=vis.filter(p=>p.L===INF), rest=_ux(vis.filter(p=>p.L!==INF),s);
    if(h.length&&UX){ if(UX.drawn) UX.drawn=UX.drawn.concat(h); if(UX.ds) for(const p of h) UX.ds.add(p.id); }
    return rest.concat(h.filter(p=>p.id!==selId)); };
  // never graded: no tier letter of its own
  if(typeof TIER==='object'){ const g=TIER.get; TIER.get=p=>p&&p.L===INF?{t:'E',sc:-1,w:'Inferred hunch: not graded',k:'inf'}:g(p); TIER.t=p=>TIER.get(p).t;
    for(const k of ['chip','badge']){ const o=TIER[k]; if(typeof o==='function') TIER[k]=p=>p&&p.L===INF?(k==='chip'?'<i class="tierb" style="background:var(--L-inf);color:#fff!important" title="Inferred hunch: not graded">?</i>':'<span class="ogrk tierb tierh" style="background:var(--L-inf);color:#fff!important" title="Inferred hunch: not graded">Hunch</span>'):o(p); } }
  // the hunch area ring, zoomed in only
  const gI=el('g',{'pointer-events':'none'},gBase); let last='';
  function draw(){ const z=vb.h<0.6, k=on.has(INF)&&z?[vb.x,vb.y,vb.w].map(v=>v.toFixed(4)).join():''; if(k===last) return; last=k; gI.innerHTML=''; if(!k) return;
    const x0=vb.x-vb.w*.5, x1=vb.x+vb.w*1.5, y0=vb.y-vb.h*.5, y1=vb.y+vb.h*1.5; let h='';
    for(const p of PTS){ if(p.L!==INF) continue; const x=p.lo*K, y=-p.la; if(x<x0||x>x1||y<y0||y>y1) continue;
      const r=(p.acm&&p.acm[0])||500, ry=r/111320, rx=ry/Math.cos(p.la*Math.PI/180)*K;
      h+=`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="var(--L-inf)" fill-opacity=".07" stroke="var(--L-inf)" stroke-opacity=".9" stroke-width="2" stroke-dasharray="3 5" vector-effect="non-scaling-stroke"/>`; }
    gI.innerHTML=h; }
  OGE.on('draw',draw);
  // the card: INFERRED banner with the reasoning chain, what would confirm it, what would kill it
  const LEAD={}; for(const p of PTS) if(p.L===INF&&p.lead) (LEAD[p.lead]=LEAD[p.lead]||[]).push(p.id);
  function boxHTML(p){ const f=p.inf||{}, l=p.lead&&BYID[p.lead];
    return `<div class="infbox"><h4>INFERRED HUNCH: NOT A RECORD</h4><p>This pin is reasoning, not a find or a placed record. It is never graded and never counted in the grades, ranks or tiers.${f.lv?` Hunch strength: <b>${esc(f.lv)}</b>.`:''}</p>`+
      `<p><b>The reasoning</b></p><ol>${(f.why||[]).map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`+
      (f.yes?`<p><b>Would confirm it:</b> ${esc(f.yes)}</p>`:'')+(f.no?`<p><b>Would kill it:</b> ${esc(f.no)}</p>`:'')+
      (l?`<p><b>The lead:</b> <a class="inflk" data-inf="${esc(l.id)}">${esc(l.n)}</a> (its own pin and grade stay as they are)</p>`:'')+`</div>`; }
  const _dh=detailHTML; detailHTML=function(p){ let h=_dh(p); if(!p||p.L!==INF) return h;
    h=h.replace(/<span class="ogrk tierb[^"]*"[^>]*>[^<]*<\/span>/g,'').replace(/<div class="tierwhy"[^>]*>.*?<\/div>/s,'');
    const t=h.indexOf('<div class="tags">'), i=t<0?-1:h.indexOf('</div>',t)+6; return i<6?boxHTML(p)+h:h.slice(0,i)+boxHTML(p)+h.slice(i); };
  const _ph=precHTML; precHTML=function(p){ const h=_ph(p); if(!p||!p.id||p.L===INF||!LEAD[p.id]) return h;
    return h+`<dt>Hunch</dt><dd>${LEAD[p.id].map(i=>BYID[i]?`<a class="inflk" data-inf="${esc(i)}">${esc(BYID[i].n.replace(/^Hunch: /,''))}</a>`:'').join('<br>')} <span class="muted">(inferred, not graded)</span></dd>`; };
  document.getElementById('detail').addEventListener('click',e=>{ const a=e.target.closest('a[data-inf]'); if(!a) return; e.preventDefault(); select(a.dataset.inf,true); });
  try{ renderLayers(); drawMarkers(); }catch(_){} }
