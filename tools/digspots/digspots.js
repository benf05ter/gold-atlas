// Dig spots (v1, 2026-11-02): where to actually look for a lost cache. Each 'dig' pin sits on a lead's placed farmstead or parcel
// (lead grade B, or C on two plats; money not recovered; pin good to 450 m or better; never look-only ground). Gold disc with a red X,
// never grouped into a bubble, shown in every map mode while its layer is on. Zoomed in, a red dashed ring shows the search radius and the
// parcel lines around the spot are drawn (green = government-owned, grey = private; survey quarter-quarter lines where no parcel map exists).
// The card links to the lead's card and the lead's card links back. Owner names are never shipped: only public/private and acres.
{ const DIG='dig';
  // layer row, colour, icon, short name
  const ti=LAYERS.findIndex(L=>L.id==='_buried'||L.id==='treasure');
  const B={sec:'Treasure', id:DIG, n:'Dig spots: where to look for a lost cache', d:'The best places to search for a cache that was never recovered: each one on a placed farm with two or more sources. Gold pin with a red X; zoom in for the search ring and the parcel lines (green = public land, grey = private). Every one needs the owner’s permission', on:true};
  LAYERS.splice(ti<0?LAYERS.length:ti,0,B); LBY[DIG]=B; on.add(DIG);
  try{ for(const k of ['detecting','history','mine','best']){ const m=SHM[k]; if(m&&Array.isArray(m.L)&&!m.L.includes(DIG)) m.L.push(DIG); } if(UX.ON&&!UX.ON.includes(DIG)) UX.ON.push(DIG); }catch(_){}
  if(Array.isArray(ORDER)&&!ORDER.includes(DIG)) ORDER.push(DIG);
  document.head.insertAdjacentHTML('beforeend','<style>:root{--L-dig:#d99a00;--dig-x:#9b1c1c}@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--L-dig:#f2b62f;--dig-x:#b3261e}}:root[data-theme="dark"]{--L-dig:#f2b62f;--dig-x:#b3261e}.diglk{color:var(--accent,#9b1c1c);font-weight:700;text-decoration:underline;cursor:pointer}</style>');
  SHORT[DIG]='Dig spot';
  const XP='M6.5 6.5L17.5 17.5M17.5 6.5L6.5 17.5';
  GLY[DIG]='<path d="M-.42,-.42 L.42,.42 M.42,-.42 L-.42,.42" fill="none" stroke="currentColor" stroke-width=".22" stroke-linecap="round"/>';
  try{ svg.querySelector('defs').insertAdjacentHTML('beforeend',`<symbol id="g-${DIG}" viewBox="-1 -1 2 2" overflow="visible"><g fill="currentColor">${GLY[DIG]}</g></symbol>`); }catch(_){}
  const _ico=ico; ico=(l,px=16,c)=>l!==DIG?_ico(l,px,c):`<svg class="ic" width="${px}" height="${px}" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="11.2" fill="${c||'var(--L-dig)'}" stroke="var(--panel)" stroke-width="1.2"/><path d="${XP}" fill="none" stroke="var(--dig-x)" stroke-width="3.4" stroke-linecap="round"/></svg>`;
  // the pin: a gold disc with a red X, a little bigger than the rest, drawn last so it sits on top of its lead's chest
  const _pp=pcPin; pcPin=function(p,s){ if(p.L!==DIG) return _pp(p,s);
    const c=PCV.c||pcx, [X,Y]=P(p.lo,p.la), [x,y]=pcXY(X,Y,s); if(x<-40||y<-40||x>PCV.vw+40||y>PCV.vh+40) return;
    const sel=p.id===selId, r=(s>=110?10.5:8.5)*(PCV.dk||1)*(sel?1.35:1), panel=cv('var(--panel)'), w=typeof WKS==='function'?WKS(p.id):'';
    c.globalAlpha=w==='worked'?0.45:1;
    c.beginPath(); c.arc(x,y+0.8,r+0.8,0,6.2832); c.fillStyle='rgba(0,0,0,.25)'; c.fill();
    c.beginPath(); c.arc(x,y,r,0,6.2832); c.fillStyle=cv('var(--L-dig)'); c.fill(); c.lineWidth=sel?2.8:1.8; c.strokeStyle=sel?cv('var(--ink)'):panel; c.stroke();
    const q=r*0.46; c.beginPath(); c.moveTo(x-q,y-q); c.lineTo(x+q,y+q); c.moveTo(x+q,y-q); c.lineTo(x-q,y+q); c.lineWidth=Math.max(2.2,r*0.3); c.lineCap='round'; c.strokeStyle=cv('var(--dig-x)'); c.stroke();
    c.globalAlpha=1; PCV.dr.push([p,x,y]); };
  // never grouped into a bubble, and not hidden by the map modes or tier filters while the layer is on
  const _ux=UXdraw; UXdraw=function(vis,s){ const dg=vis.filter(p=>p.L===DIG), rest=_ux(vis.filter(p=>p.L!==DIG),s);
    if(dg.length&&UX){ if(UX.drawn) UX.drawn=UX.drawn.concat(dg); if(UX.ds) for(const p of dg) UX.ds.add(p.id); }
    return rest.concat(dg.filter(p=>p.id!==selId)); };
  // search ring and parcel lines, zoomed in only
  const gD=el('g',{'pointer-events':'none'},gBase); let last='';
  function draw(){ const z=vb.h<0.12, k=on.has(DIG)&&z?[vb.x,vb.y,vb.w].map(v=>v.toFixed(4)).join():''; if(k===last) return; last=k; gD.innerHTML=''; if(!k) return;
    const x0=vb.x-vb.w*.5, x1=vb.x+vb.w*1.5, y0=vb.y-vb.h*.5, y1=vb.y+vb.h*1.5, rg=r=>'M'+r.map(([lo,la])=>(lo*K).toFixed(6)+','+(-la).toFixed(6)).join('L')+'Z';
    let h='';
    for(const p of PTS){ if(p.L!==DIG) continue; const x=p.lo*K, y=-p.la; if(x<x0||x>x1||y<y0||y>y1) continue;
      const pa=p.parc; if(pa&&pa.f) for(const f of pa.f){ const d=f[2].map(rg).join(''); const pub=f[0]===1, pl=pa.k==='plss';
        h+=`<path d="${d}" fill="${pub?'#2e8b57':'none'}" fill-opacity="${pub?0.22:0}" stroke="${pub?'#1e6b3f':pl?'#7a5c2e':'#5b5b5b'}" stroke-opacity=".85" stroke-width="${pl?1.2:1.4}" ${pl?'stroke-dasharray="5 3"':''} vector-effect="non-scaling-stroke"/>`; }
      const r=(p.acm&&p.acm[0])||200, ry=r/111320, rx=ry/Math.cos(p.la*Math.PI/180)*K;
      h+=`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="var(--L-dig)" fill-opacity=".10" stroke="var(--dig-x)" stroke-opacity=".9" stroke-width="2" stroke-dasharray="6 4" vector-effect="non-scaling-stroke"/>`; }
    gD.innerHTML=h; }
  OGE.on('draw',draw);
  // card lines: dig spot -> lead, lead -> dig spot, and the land line
  const LEAD={}; for(const p of PTS) if(p.L===DIG&&p.lead) (LEAD[p.lead]=LEAD[p.lead]||[]).push(p.id);
  const _ph=precHTML; precHTML=function(p){ const h=_ph(p); if(!p||!p.id) return h; let a='';
    if(p.L===DIG){ const l=BYID[p.lead]; if(p.parc&&p.parc.txt) a+=`<dt>Land</dt><dd>${esc(p.parc.txt)} <span class="muted">(${esc(p.parc.s)}; owner names are not kept in the atlas)</span></dd>`;
      if(l) a+=`<dt>Lead</dt><dd><a class="diglk" data-dig="${esc(l.id)}">Open the full story: ${esc(l.n)}</a></dd>`; }
    else if(LEAD[p.id]) a+=`<dt>Dig spot</dt><dd>${LEAD[p.id].map(i=>BYID[i]?`<a class="diglk" data-dig="${esc(i)}">${esc(BYID[i].n.replace(/^Dig spot: /,''))}: where to look</a>`:'').join('<br>')}</dd>`;
    return h+a; };
  document.getElementById('detail').addEventListener('click',e=>{ const a=e.target.closest('a[data-dig]'); if(!a) return; e.preventDefault(); select(a.dataset.dig,true); });
  try{ renderLayers(); drawMarkers(); }catch(_){} }
