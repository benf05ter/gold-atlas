// ---------- 1950s-60s air photo check: one 500 m crop per pin (a50/air50.json + a50/<id>.webp, load when a card opens) ----------
{ let A5p=null; const a5Get=()=>A5p||(A5p=fetch('a50/air50.json',{cache:'force-cache'}).then(r=>r.ok?r.json():{}).catch(()=>({})));
  const _selA5=select; select=function(id,pan){ const r=_selA5(id,pan);
    a5Get().then(d=>{ const x=d[id]; if(!x||selId!==id||document.querySelector('#detail .a5box')) return; const at=document.querySelector('#detail .imgs')||document.querySelector('#detail .tags'); if(!at) return;
      at.insertAdjacentHTML(at.classList.contains('imgs')?'beforebegin':'afterend',`<div class="nlbox a5box"><b>${esc(String(x.y||'1950s'))} air photo check</b><br>${esc(x.t)}${x.img?`<div class="lid"><img src="${esc(x.img)}" alt="${esc(String(x.y||''))} air photo around the pin" loading="lazy" width="200" height="200" style="width:200px;height:200px"><span class="hint">500 m across, north up, cross = pin. Tap to enlarge.</span></div>`:''}</div>`); });
    return r; }; }
// ---------- end 1950s-60s air photo check
