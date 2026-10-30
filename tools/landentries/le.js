// ---------- first land entries: who first got title to the forty under the pin (le/le.json, loads when the first card opens) ----------
{ let LE=null, LEp=null; const leGet=()=>LEp||(LEp=fetch('le/le.json',{cache:'force-cache'}).then(r=>r.ok?r.json():{}).catch(()=>({})).then(d=>LE=d));
  const _selLE=select; select=function(id,pan){ const r=_selLE(id,pan);
    leGet().then(d=>{ const x=d[id]; if(!x||selId!==id) return; const t=document.querySelector('#detail .tags'); if(!t||document.querySelector('#detail .lebox')) return;
      t.insertAdjacentHTML('afterend',`<div class="nlbox lebox"><b>First land entry</b><br>${esc(x[0])}, ${esc(String(x[1]))} (${esc(x[2])}), for the forty acres under the pin. A patent names the first legal owner, not where the house stood. ${x[3]?`<a href="${esc(x[3])}" target="_blank" rel="noopener">GLO record</a>`:''}</div>`); });
    return r; }; }
// ---------- end first land entries
