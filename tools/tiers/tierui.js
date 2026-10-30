
// Tier colors from the common tier chart, letters on pins, Sort by tier, tier filter and layer sorting in the layers sheet
{ const C={S:'#ff7f7f',A:'#ffbf7f',B:'#ffdf7f',C:'#ffff7f',D:'#bfff7f',E:'#7fff7f',F:'#7fffff'}, IDX={S:0,A:1,B:2,C:3,D:4,E:5,F:6};
  const ls=(k,v)=>{ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(_){ return null; } };
  TIER.C=C; TIER.IDX=IDX;
  TIER.F=new Set((ls('og-tierf')||TIER.T.join('')).split('').filter(t=>t in IDX));
  TIER.col=ls('og-tiercol')!=='0'; TIER.lay=ls('og-tierlay')==='1';
  TIER.ok=p=>TIER.F.size===7||TIER.F.has(TIER.t(p));
  TIER.chip=p=>{ const c=TIER.get(p); return `<i class="tierb" style="background:${C[c.t]}" title="${esc(TIER.NAME[c.t]+(c.w?': '+c.w:''))}">${c.t}</i>`; };
  TIER.badge=p=>{ const c=TIER.get(p); return `<span class="ogrk tierb tierh" style="background:${C[c.t]}" title="${esc(TIER.NAME[c.t]+(c.w?': '+c.w:''))}">${c.t} tier</span>`; };
  document.head.insertAdjacentHTML('beforeend',`<style id="tierCss">
.tierb{display:inline-grid;place-items:center;min-width:19px;height:19px;padding:0 3px;box-sizing:border-box;margin-right:6px;border-radius:4px;color:#1a1a1a!important;font:800 12px/1 var(--f-body);font-style:normal;vertical-align:1px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.28)}
.ogrk.tierh{padding:2px 8px;font-size:12px;border-radius:6px;vertical-align:3px}
.tierwhy{border-left:6px solid;padding:7px 10px;border-radius:5px;background:var(--bg);font-size:14px}
.tierwhy b{font-family:var(--f-display)}
#list .tierhd{position:sticky;top:0;z-index:1;display:flex;align-items:center;gap:8px;padding:6px 14px;font:700 13px var(--f-body);color:#1a1a1a;border-bottom:1px solid var(--line)}
#list .tierhd .tierb{width:26px;height:26px;font-size:15px;background:rgba(255,255,255,.55)}
.tierf{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:5px}
.tierf button{display:grid;justify-items:center;gap:1px;border:2px solid transparent;border-radius:8px;padding:5px 0 4px;color:#1a1a1a;font:800 16px/1.1 var(--f-body);cursor:pointer;box-shadow:inset 0 0 0 1px rgba(0,0,0,.2)}
.tierf button small{font:600 10.5px var(--f-mono)}
.tierf button[aria-pressed="false"]{opacity:.3;filter:grayscale(.6)}
.tierf button[aria-pressed="true"]{border-color:rgba(0,0,0,.45)}
.tiersw{display:flex;flex-wrap:wrap;gap:6px}
.pllay .tbar{display:flex;width:44px;height:5px;border-radius:3px;overflow:hidden;margin-top:-2px;box-shadow:inset 0 0 0 1px rgba(0,0,0,.15)}
.pllay .tbar b{display:block;height:100%}
</style>`);

  // Sort by tier: all spots on the layers you have on, S first, best score first inside a tier
  const run0=SSORT.run; let rc=null;
  SSORT.SORTS.tier={n:'Tier: S to F',d:'Every spot ranked S (best) to F (look only or little left). The tier comes from the best-spot score and ground grade, with extra credit for eras of use stacked on the same ground and lost loot placed close. Gold and geology spots use their prospect rank, evidence and access. Tap a tier letter on the map\'s Layers sheet to hide tiers.'};
  SSORT.run=function(k){ if(k!=='tier') return run0(k);
    const key=PTS.length+'|'+(typeof RKV!=='undefined'?RKV:'')+'|'+[...on].join()+'|'+[...TIER.F].join(''); if(rc&&rc.key===key) return rc.v;
    const v=PTS.filter(p=>on.has(p.L)&&TIER.ok(p)).sort((a,b)=>IDX[TIER.t(a)]-IDX[TIER.t(b)]||TIER.get(b).sc-TIER.get(a).sc||a.mi-b.mi);
    rc={key,v}; return v; };
  const list0=SSORT.list; SSORT.list=function(){ if(SSORT.k!=='tier') return list0();
    const s=q.value.trim().toLowerCase(), dm=+dist.value, sv=stf.value;
    const v=SSORT.run('tier').filter(p=>p.mi<=dm&&(!sv||p.stt===sv)&&(!savedOnly||saved.has(p.id))&&(!s||[p.n,p.pl,p.co,p.y,p.st].join(' ').toLowerCase().includes(s)));
    if(SSORT.map){ SSORT.ids=new Set(v.map(p=>p.id)); const bs=document.querySelector('#ssBar span'); if(bs) bs.textContent='Tiers · '+v.length+' spots'; }
    const n={}; for(const p of v){ const t=TIER.t(p); n[t]=(n[t]||0)+1; }
    document.getElementById('count').textContent=`${v.length} spots by tier: `+TIER.T.filter(t=>n[t]).map(t=>t+' '+n[t]).join(', ');
    let h='', last=''; const per={};
    for(const p of v){ const t=TIER.t(p); per[t]=(per[t]||0)+1; if(per[t]>120) continue;
      if(t!==last){ last=t; h+=`<div class="tierhd" style="background:${C[t]}"><i class="tierb">${t}</i>${esc(TIER.NAME[t].replace(/^. tier: /,''))} · ${n[t]} spot${n[t]===1?'':'s'}${n[t]>120?' (top 120 shown; search or narrow the distance for more)':''}</div>`; }
      const c=TIER.get(p);
      h+=`<button class="item${p.id===selId?' sel':''}" data-id="${p.id}"><span style="margin-top:2px">${ico(p.L,18)}</span><span><span class="t">${TIER.chip(p)}${saved.has(p.id)?'★ ':''}${esc(p.n)}${WKS(p.id)==='worked'?' <span class="hint">· worked</span>':''}</span><br><span class="m">${esc(c.w||'')}</span><br><span class="m">${esc(LBY[p.L].n)} &middot; ${p.stt}${p.co?' &middot; '+esc(p.co)+(p.co.includes('(')?'':' Co.'):''}</span></span><span class="d">${p.mi<10?p.mi.toFixed(1):Math.round(p.mi)} mi</span></button>`; }
    document.getElementById('list').innerHTML=h||'<p class="empty">No spots match. Turn on more layers or tiers, or widen the distance.</p>';
    document.querySelectorAll('#list .item').forEach(b=>b.onclick=()=>select(b.dataset.id,true));
    if(SSORT.map) drawMarkers(); return true; };
  { const sel=document.getElementById('ssSort'); if(sel&&!sel.querySelector('option[value="tier"]')){ sel.options[0].insertAdjacentHTML('afterend','<option value="tier">Tier: S to F</option>');
      let k0=''; try{ k0=localStorage.getItem('og-ssort')||''; }catch(_){} if(k0==='tier') sel.value='tier'; } }

  // the card: a tier line above the best-spot reasons
  const rkH0=rkHTML; rkHTML=function(p){ let h=rkH0(p); try{ const c=TIER.get(p); h=`<div class="tierwhy" style="border-color:${C[c.t]}"><i class="tierb" style="background:${C[c.t]}">${c.t}</i><b>${esc(TIER.NAME[c.t])}.</b> ${esc(c.w||'')}</div>`+h; }catch(e){ OGE.err&&OGE.err('tier card',e); } return h; };

  // the map: hide tiers you turned off (your own spots and the open card always stay)
  const ux0=UXdraw; UXdraw=function(vis,s){ if(TIER.F.size<7) vis=vis.filter(p=>p.L==='mine'||p.id===selId||TIER.ok(p)); return ux0(vis,s); };

  // the layers sheet: tier buttons with counts, pin colours by tier, sort layers by tier
  const lay=document.getElementById('plLay');
  if(lay){ const at=lay.previousElementSibling&&lay.previousElementSibling.matches('b.gml')?lay.previousElementSibling:lay; at.insertAdjacentHTML('beforebegin','<b class="gml">Tiers</b><div class="tierf" id="tierF"></div><div class="tiersw"><button class="chip uxt" id="tierCol"></button><button class="chip uxt" id="tierLay"></button><button class="chip" id="tierAll">Show all tiers</button></div><p class="hint" id="tierHint" style="margin:0">S is best, F is look only or little left. Tap a letter to hide or show that tier on the map and in the Spots list.</p>');
    const box=document.getElementById('tierF');
    box.onclick=e=>{ const b=e.target.closest('button[data-t]'); if(!b) return; const t=b.dataset.t; TIER.F.has(t)?TIER.F.delete(t):TIER.F.add(t); save(); };
    document.getElementById('tierAll').onclick=()=>{ TIER.T.forEach(t=>TIER.F.add(t)); save(); };
    document.getElementById('tierCol').onclick=()=>{ TIER.col=!TIER.col; ls('og-tiercol',TIER.col?'1':'0'); plLaySync(); drawMarkers(); };
    document.getElementById('tierLay').onclick=()=>{ TIER.lay=!TIER.lay; ls('og-tierlay',TIER.lay?'1':'0'); plLaySync(); };
    function save(){ ls('og-tierf',TIER.T.filter(t=>TIER.F.has(t)).join('')); plLaySync(); drawMarkers(); try{ renderList(); }catch(_){} } }
  let mix=null, mixN=-1;
  function layMix(){ const k=PTS.length+'|'+(typeof RKV!=='undefined'?RKV:''); if(mix&&mixN===k) return mix; mix={}; mixN=k;
    for(const p of PTS){ const m=mix[p.L]||(mix[p.L]={n:0,s:0}); const t=TIER.t(p); m[t]=(m[t]||0)+1; m.n++; m.s+=6-IDX[t]; } return mix; }
  const pl0=plLaySync; plLaySync=function(){ pl0(); try{
    const M=layMix(), box=document.getElementById('tierF');
    if(box){ const n={}; for(const l in M) if(on.has(l)) for(const t of TIER.T) n[t]=(n[t]||0)+(M[l][t]||0);
      box.innerHTML=TIER.T.map(t=>`<button data-t="${t}" aria-pressed="${TIER.F.has(t)}" style="background:${C[t]}" title="${esc(TIER.NAME[t])}">${t}<small>${n[t]>=1000?(n[t]/1000).toFixed(1)+'k':n[t]||0}</small></button>`).join('');
      const a=document.getElementById('tierAll'); if(a) a.hidden=TIER.F.size===7;
      const cb=document.getElementById('tierCol'); if(cb){ cb.setAttribute('aria-pressed',TIER.col); cb.textContent='Pin colors by tier'; }
      const lb=document.getElementById('tierLay'); if(lb){ lb.setAttribute('aria-pressed',TIER.lay); lb.textContent='Sort layers by tier'; } }
    const lay=document.getElementById('plLay'); if(!lay) return;
    lay.querySelectorAll('button[data-l]').forEach(b=>{ const m=M[b.dataset.l]; if(!m||!m.n||b.querySelector('.tbar')) return;
      b.querySelector('i')?.insertAdjacentHTML('afterend',`<span class="tbar" title="${TIER.T.filter(t=>m[t]).map(t=>t+' '+m[t]).join(' · ')}">${TIER.T.filter(t=>m[t]).map(t=>`<b style="width:${(100*m[t]/m.n).toFixed(1)}%;background:${C[t]}"></b>`).join('')}</span>`); });
    if(TIER.lay){ const avg=b=>{ const m=M[b.dataset.l]; return m&&m.n?m.s/m.n:-1; }; let run=[];
      const flush=at=>{ if(run.length>1){ run.sort((a,b)=>avg(b)-avg(a)); for(const b of run) lay.insertBefore(b,at); } run=[]; };
      for(const el of [...lay.children]){ if(el.matches('button[data-l]')) run.push(el); else flush(el); } flush(null); }
    const hn=lay.nextElementSibling; if(hn&&hn.classList.contains('hint')) hn.textContent=hn.textContent.replace(/Numbers on pins = rank, 1 is best\.|Letters on pins = tier, S is best\./,TIER.col?'Letters on pins = tier, S is best.':'Numbers on pins = rank, 1 is best.');
  }catch(e){ OGE.err&&OGE.err('tier sheet',e); } };
  plLaySync();
}
