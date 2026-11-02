// ---------- Pin taglines (tg1): a one-line "what's the deal here" under the name on every card and every list row, in the pin's tier colour ----------
// TAG (og-data.js) holds, per treasure, lead, dig, wreck and hunch pin, [tagline, status]: written from that pin's own card (tools/taglines).
// Status: f found, p partly found, u unfound, k fate unknown, h hoax, '' not a lost-loot story. Pins without a TAG line (vanished schools,
// post offices, farms, parks...) get a short line built from their own card fields (kind, years, what to look for), never new claims.
// It also puts the tier letter on list rows that only had the rank dot, and the tier badge on cards opened without the aerial header.
{ const TG=typeof TAG==='object'&&TAG?TAG:{};
  const ST={f:'Found',p:'Partly found',u:'Unfound',k:'Fate unknown',h:'Hoax'};
  const KIND={gather:'Gathering place',ghost:'Ghost town',history:'Historic site',camp:'Work camp',school:'Vanished school',school2:'Vanished school or hamlet',
    vpo:'Vanished place',af38:'Abandoned farm',af64:'Abandoned farm',af15:'Abandoned farm',cem:'Cemetery',park:'Park or public land',landmark:'Landmark',
    beach:'Beach',flood84:'Flood-era site',report:'Old gold report',panning:'Panning spot',pit:'Gold pit',glacial:'Glacial gold',target:'Gold target',
    trap:'Gold trap',copper:'Copper',superior:'Lake Superior find',cmine:'Copper mine',mine:'My spot',restricted:'Closed land',prehist:'Archaeological site',
    model:'Gold model',drill:'Drill hole',deposit:'Deposit',geo:'Geology',lake:'Lake',public:'Public land',rock:'Rock'};
  const cut=(s,n)=>{ s=String(s||'').replace(/\s+/g,' ').trim().replace(/[.;:]+$/,''); if(s.length<=n) return s; const i=s.lastIndexOf(' ',n); return s.slice(0,i>20?i:n).replace(/[,;:·-]+$/,'')+'…'; };
  function tgLine(p){ if(!p) return null; const t=TG[p.id]; if(t) return {t:t[0],s:t[1]||''};
    const k=KIND[p.L]; if(!k) return null; const a=[k];
    if(p.y&&!/^\s*$/.test(p.y)) a.push(cut(p.y,24));
    const v=cut(p.v,46); if(v&&!/^none\b/i.test(v)&&v.toLowerCase()!==k.toLowerCase()) a.push(v);
    if(p.L==='cem'||p.L==='prehist'||p.L==='restricted') a.push('look only');
    return a.length>1?{t:a.join(' · '),s:''}:null; }
  const isInf=p=>p&&p.L==='inf';
  const col=p=>isInf(p)?'#b07cff':(typeof TIER==='object'&&TIER.C?TIER.C[TIER.t(p)]:'#ccc');
  function tgHtml(p,cls){ const l=tgLine(p); if(!l) return '';
    const st=isInf(p)?'Hunch, not graded':(typeof FS==='function'&&FS(p))?'':ST[l.s]||'';   // treasure leads already carry the Found/Not found badge (fs block), so no second pill
    return `<span class="${cls}" style="--tgc:${col(p)}">${esc(l.t)}${st?` <b class="tgs tgs-${isInf(p)?'i':l.s}">${st}</b>`:''}</span>`; }
  let IX=null, IXn=-1; const byId=id=>{ if(!IX||IXn!==PTS.length){ IX=new Map(); for(const q of PTS) IX.set(String(q.id),q); IXn=PTS.length; } return IX.get(String(id)); };
  window.OGTG={line:tgLine,html:tgHtml,n:()=>Object.keys(TG).length};
  if(typeof detailHTML==='function'){ const dh0=detailHTML;
    detailHTML=function(p){ let h=dh0(p); try{ const t=tgHtml(p,"tgcard"); if(t){ const j=h.indexOf('</h2>'); if(j>=0) h=h.slice(0,j+5)+t+h.slice(j+5); } }catch(e){ OGE.err&&OGE.err('tagline card',e); } return h; }; }
  function tgScan(){ pend=0; try{
    for(const b of document.querySelectorAll('button.item[data-id]:not([data-tg])')){ b.setAttribute('data-tg','1'); const p=byId(b.dataset.id); if(!p) continue;
      const t=b.querySelector('.t'); if(!t) continue;
      if(typeof TIER==='object'&&TIER.chip&&!isInf(p)&&!t.querySelector('.tierb')) t.insertAdjacentHTML('afterbegin',TIER.chip(p));
      const h=tgHtml(p,"m tgrow"); if(h) t.insertAdjacentHTML('afterend','<br>'+h); }
    const d=document.querySelector('#detail .detail'), h2=d&&d.querySelector('h2');
    if(h2&&!h2.querySelector('.tierh')&&typeof TIER==='object'&&TIER.badge&&typeof selId!=='undefined'){ const p=byId(selId); if(p&&!isInf(p)) h2.insertAdjacentHTML('afterbegin',TIER.badge(p)); }
  }catch(e){ OGE.err&&OGE.err('tagline rows',e); } }
  let pend=0; const go=()=>{ if(!pend){ pend=1; setTimeout(tgScan,0); } };
  new MutationObserver(R=>{ for(const r of R){ const el=r.target; if(el.nodeType===1&&(el.closest('.m3d,.ogtiles,canvas'))) continue; if(r.addedNodes.length){ go(); return; } } }).observe(document.body,{childList:true,subtree:true});
  go();
  if(!document.getElementById('tgCss')) document.head.insertAdjacentHTML('beforeend','<style id="tgCss">.tgcard{display:block;margin:4px 0 8px;padding:5px 9px;border-left:6px solid var(--tgc);border-radius:5px;background:color-mix(in srgb,var(--tgc) 22%,var(--bg,#fff));font:600 14px/1.35 var(--f-body);color:var(--ink)}.tgrow{display:inline-block;margin-top:2px;padding-left:6px;border-left:4px solid var(--tgc);font-style:italic}.tgs{display:inline-block;margin-left:4px;padding:0 6px;border-radius:9px;font:700 11.5px/1.5 var(--f-body);font-style:normal;color:#1a1a1a;background:#ddd;white-space:nowrap}.tgs-f{background:#9fd6a0}.tgs-p{background:#f3d27a}.tgs-u{background:#ffb08a}.tgs-k{background:#d9d9d9}.tgs-h{background:#c9c9c9;text-decoration:line-through}.tgs-i{background:#d9c2ff}</style>');
}
