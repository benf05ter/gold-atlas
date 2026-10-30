// ---------- Trip sheets (v209): a county's S and A spots as a printable sheet (Save as PDF) and a GPX file, built on the phone when asked ----------
// Nothing is stored in the page: the sheet is made from PTS, TIER, RKX, LIDIMG/img chunks and (when the public-land section is present) plLookup + pl/rules.json.
{ const TS={rules:null};
  const tsKey=p=>(p.stt||'')+'|'+(p.co||'');
  const tsName=(co,stt)=>co?`${co}${/\(/.test(co)?'':' County'}, ${STN[stt]||stt}`:`${STN[stt]||stt}, no county set`;
  const tsFile=(co,stt)=>`trip-${stt}-${(co||'no-county').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}`;
  window.tsSpots=(co,stt)=>PTS.filter(p=>p.stt===stt&&(p.co||'')===(co||'')&&/^[SA]$/.test(TIER.t(p))).sort((a,b)=>(TIER.t(a)==='S'?0:1)-(TIER.t(b)==='S'?0:1)||(TIER.get(b).sc-TIER.get(a).sc)||(a.mi||0)-(b.mi||0));
  window.tsCounties=()=>{ const m=new Map(); for(const p of PTS){ if(!/^[SA]$/.test(TIER.t(p))) continue; const k=tsKey(p), o=m.get(k)||{stt:p.stt,co:p.co||'',S:0,A:0}; o[TIER.t(p)]++; m.set(k,o); }
    return [...m.values()].sort((a,b)=>'WIMNMI'.indexOf(a.stt)-'WIMNMI'.indexOf(b.stt)||(!a.co)-(!b.co)||a.co.localeCompare(b.co)); };
  const tsRules=()=>TS.rules?Promise.resolve(TS.rules):fetch('pl/rules.json',{cache:'force-cache'}).then(r=>r.ok?r.json():{}).catch(()=>({})).then(a=>TS.rules=a);
  function tsLand(p){ if(typeof window.plLookup!=='function') return Promise.resolve(null);
    return Promise.all([tsRules(),plLookup(p)]).then(([R,u])=>{ if(!u) return {ok:-1,t:'Private land, or public land not in the list. Ask the owner first; the plat book or county land records name them.'};
      const [ok,kind,rule]=R[u[1]]||[1,'Public land','Check with the managing agency.'];
      return {ok,t:`${ok===2?'Public land, detecting allowed with care':ok===1?'Public land, permit or check first':'Public land, no hobby detecting'}: ${u[2]||kind} (${kind}, ${u[3]}). ${rule}`}; }).catch(()=>null); }
  function tsLid(p){ const k=lidKey(p), b=k&&LIDIMG[k]; if(!b) return Promise.resolve('');
    const mk=s=>s?`data:image/${s.startsWith('UklG')?'webp':'jpeg'};base64,${s}`:'';
    return b[0]!=='@'?Promise.resolve(mk(b)):liChunk(b.slice(1)).then(d=>mk(d[k])).catch(()=>''); }
  function tsWhy(p){ const g=TIER.get(p), r=RKX(p), out=[];
    if(r&&!r.skip&&r.w&&r.w.length) for(const [s,t] of r.w) out.push([s,t]); else if(g.w) out.push([1,g.w]);
    if(p.ev) for(const e of p.ev) out.push([1,e]);
    if(p.srcs) out.push([1,'Fed by: '+p.srcs.join(', ')]);
    return out; }
  function tsCard(p,i,land,img){ const t=TIER.t(p), LS=p.lid||p.lidc||(typeof LIDC!=='undefined'&&LIDC[p.id]);
    const why=tsWhy(p).map(([s,w])=>`<li class="${s>0?'p':s<0?'n':'o'}">${esc(w)}</li>`).join('');
    const kv=[['Where',p.pl],['Years',p.y],['Look for',p.v],['Pin',[PREC[p.p],p.pn].filter(Boolean).join('. ')],['Record',CONF[p.c]],['Ground',p.ug?p.ug[0]+': '+p.ug[1]:''],['Caution',p.acc&&p.acc[1]||p.warn]].filter(x=>x[1]);
    return `<section class="tsp"><div class="tsh"><span class="tst" style="background:${TIER.C[t]}">${t}</span><b>${i}. ${esc(p.n)}</b></div>
<div class="tsm">${esc(LBY[p.L]?LBY[p.L].n:p.L)} &middot; <span class="tsc">${p.la.toFixed(5)}, ${p.lo.toFixed(5)}</span>${p.mi?` &middot; ${Math.round(p.mi)} mi from ${esc(ORG.n)}`:''}</div>
${img?`<figure class="tsl"><img src="${img}" alt="LiDAR around ${esc(p.n)}"><figcaption>1 m LiDAR, pin at the cross${LS?`; ${LS[0]} hollows, ${LS[2]} raised within 300 m`:''}</figcaption></figure>`:''}
${land?`<p class="tsland tsl${land.ok}"><b>Land.</b> ${esc(land.t)}</p>`:''}
<ul class="tsw">${why}</ul>
${kv.length?`<dl>${kv.map(([k,v])=>`<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`:''}
${p.st?`<p><b>Story.</b> ${esc(p.st)}</p>`:''}${p.t?`<p><b>How to work it.</b> ${esc(p.t)}</p>`:''}
${p.src&&p.src.length?`<p class="tss2"><b>Sources.</b> ${p.src.map(([l,u])=>esc(l)+(u?` <span class="tsu">${esc(u)}</span>`:'')).join('; ')}</p>`:''}
${!img&&LS?`<p class="tss2">1 m LiDAR within 300 m: ${LS[0]} hollows (${LS[1]} deeper than 2.5 m), ${LS[2]} raised features, ${LS[4]} m of relief.</p>`:''}</section>`; }
  const TSCSS=`.tss{font:10pt/1.38 Georgia,'Times New Roman',serif;color:#111;background:#fff;max-width:7.6in;margin:0 auto;padding:0 .1in}
.tss h1{font-size:18pt;margin:.1in 0 2pt}.tss .tsi{font-size:9pt;color:#444;margin:0 0 8pt}.tss .tsi b{color:#111}
.tss .tsx{font-size:8.5pt;border:1px solid #bbb;border-radius:6px;padding:5pt 7pt;margin:0 0 10pt}
.tss table{border-collapse:collapse;width:100%;font-size:8.5pt;margin:0 0 12pt}.tss td,.tss th{border-bottom:1px solid #ddd;padding:2pt 4pt;text-align:left;vertical-align:top}
.tss .tsp{border-top:1.5pt solid #333;padding:6pt 0 8pt;overflow:hidden}
.tss .tsh,.tss .tsm{break-after:avoid;page-break-after:avoid}.tss .tsl,.tss .tsland,.tss li,.tss dl{break-inside:avoid}.tss .tsh{font-size:11.5pt;display:flex;gap:6pt;align-items:baseline}.tss .tst{display:inline-block;min-width:16pt;text-align:center;font:700 10pt Arial,sans-serif;border-radius:4px;padding:1pt 3pt;color:#1a1a1a;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.tss .tsm{font:8.5pt Arial,sans-serif;color:#444;margin:2pt 0 4pt}.tss .tsc{font-weight:700;color:#111}
.tss .tsl{float:right;width:1.45in;margin:0 0 4pt 8pt}.tss .tsl img{width:1.45in;height:1.45in;display:block;border:1px solid #999}.tss figcaption{font:7pt Arial,sans-serif;color:#555}
.tss .tsland{font-size:9pt;padding:3pt 5pt;border-left:3pt solid #888;margin:3pt 0}.tss .tsl0{border-color:#d33}.tss .tsl1{border-color:#e8a020}.tss .tsl2{border-color:#2a9d4b}
.tss ul.tsw{margin:3pt 0;padding-left:14pt;font-size:9pt}.tss ul.tsw li.n{color:#a00}.tss ul.tsw li.o{color:#555}
.tss dl{display:grid;grid-template-columns:auto 1fr;gap:1pt 8pt;font-size:9pt;margin:3pt 0}.tss dt{font-weight:700}.tss dd{margin:0}
.tss p{margin:3pt 0}.tss .tss2{font-size:8pt;color:#333}.tss .tsu{word-break:break-all;color:#555}
@page{size:letter;margin:.45in}`;
  window.tsBuild=async(co,stt)=>{ const L=tsSpots(co,stt), d=new Date().toISOString().slice(0,10), nm=tsName(co,stt);
    const lands=await Promise.all(L.map(tsLand)), imgs=await Promise.all(L.map(tsLid));
    const nS=L.filter(p=>TIER.t(p)==='S').length, nNo=lands.filter(x=>x&&x.ok===0).length;
    const hasL=lands.some(Boolean), idx=L.map((p,i)=>`<tr><td>${i+1}</td><td>${TIER.t(p)}</td><td>${esc(p.n)}</td><td>${p.la.toFixed(5)}, ${p.lo.toFixed(5)}</td>${hasL?`<td>${lands[i]?['No detecting','Check first','Allowed','Private'][lands[i].ok<0?3:lands[i].ok]:''}</td>`:''}</tr>`).join('');
    const body=`<div class="tss"><h1>${esc(nm)}: trip sheet</h1><p class="tsi"><b>${L.length}</b> top spots (${nS} S, ${L.length-nS} A) from Old Ground, made ${d}. Best first, then nearest to ${esc(ORG.n)}.${nNo?` <b>${nNo}</b> sit on land with no hobby detecting: look only there.`:''}</p>
<div class="tsx"><b>Before you go.</b> Get the owner's permission for private land, in writing if you can. Fill every hole. Leave anything over 100 years old on public land where it lies. Coordinates are WGS84 decimal degrees; the GPX file has the same pins for a GPS or map app.</div>
<table><tr><th>#</th><th>Tier</th><th>Spot</th><th>Coordinates</th>${hasL?'<th>Land</th>':''}</tr>${idx}</table>
${L.map((p,i)=>tsCard(p,i+1,lands[i],imgs[i])).join('\n')}</div>`;
    const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(nm)} trip sheet</title><style>body{margin:0;background:#fff}${TSCSS}</style></head><body>${body}</body></html>`;
    const x=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
    const gpx=`<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="Old Ground" xmlns="http://www.topografix.com/GPX/1/1">\n<metadata><name>${x(nm)}: S and A spots</name><time>${new Date().toISOString()}</time></metadata>\n`+
      L.map((p,i)=>`<wpt lat="${p.la.toFixed(6)}" lon="${p.lo.toFixed(6)}"><name>${x(`${TIER.t(p)} ${i+1}. ${p.n}`)}</name><desc>${x([TIER.get(p).w,p.v&&'Look for: '+p.v,p.t,lands[i]&&'Land: '+lands[i].t].filter(Boolean).join('\n'))}</desc><type>Tier ${TIER.t(p)}</type><sym>${TIER.t(p)==='S'?'Flag, Red':'Flag, Blue'}</sym></wpt>`).join('\n')+'\n</gpx>\n';
    return {n:L.length,nS,name:nm,file:tsFile(co,stt),html,body,gpx}; };
  // hand a file to the phone: share sheet when it takes files (Save to Files, a GPS app), else a download
  function tsSave(name,type,text){ const f=new File([text],name,{type});
    if(navigator.canShare&&navigator.canShare({files:[f]})) return navigator.share({files:[f],title:name}).catch(()=>{});
    const a=document.createElement('a'); a.href=URL.createObjectURL(f); a.download=name; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },4000); }
  function tsPrint(r){ let w=document.getElementById('tsPrint'); if(!w){ w=document.createElement('div'); w.id='tsPrint'; document.body.appendChild(w); }
    w.innerHTML=`<style>${TSCSS}</style>`+r.body; document.documentElement.classList.add('tsprinting');
    const done=()=>{ document.documentElement.classList.remove('tsprinting'); w.innerHTML=''; removeEventListener('afterprint',done); };
    addEventListener('afterprint',done); setTimeout(()=>window.print(),60); } // no timed clean-up: iOS print() returns at once, and the sheet must stay until afterprint
  document.head.insertAdjacentHTML('beforeend',`<style>#tsPrint{display:none}@media print{html.tsprinting body>*:not(#tsPrint){display:none!important}html.tsprinting #tsPrint{display:block}html.tsprinting,html.tsprinting body{background:#fff!important;height:auto!important;overflow:visible!important}}
.tsbox{margin:8px 0;padding:10px;border:1px solid var(--line);border-radius:12px;background:var(--panel)}.tsbox select{width:100%;margin:6px 0;padding:8px;font-size:15px;border-radius:8px;border:1px solid var(--line);background:var(--panel);color:var(--ink)}
.tsrow{display:flex;gap:6px;flex-wrap:wrap}.tsrow button{flex:1 1 30%;padding:9px 6px;border-radius:10px;border:1px solid var(--line);background:var(--panel);color:var(--ink);font:700 13px var(--f-body);cursor:pointer}.tsrow button:first-child{background:var(--accent);color:#fff;border-color:var(--accent)}
.tscard{display:block;width:100%;margin:8px 0;padding:9px 10px;border-radius:12px;border:1px dashed var(--line);background:none;color:var(--ink);font:600 13.5px var(--f-body);text-align:left;cursor:pointer}</style>`);
  // one small panel does the work for a county: print / Save as PDF, the sheet as a file, and the GPX
  async function tsRun(co,stt,how,msg){ msg&&(msg.textContent='Building the sheet...'); try{ const r=await tsBuild(co,stt);
      if(!r.n){ msg&&(msg.textContent='No S or A spots in this county yet.'); return; }
      if(how==='pdf') tsPrint(r); else if(how==='gpx') await tsSave(r.file+'.gpx','application/gpx+xml',r.gpx); else await tsSave(r.file+'.html','text/html',r.html);
      msg&&(msg.textContent=`${r.n} spots (${r.nS} S). ${how==='pdf'?'In the print screen, choose Save to Files or Save as PDF.':'Saved.'}`); }
    catch(e){ msg&&(msg.textContent='Could not build the sheet: '+e.message); } }
  function tsPanel(sel){ const cs=tsCounties(); const cur=sel||''; return `<div class="tsbox"><b>Trip sheets for no-signal days</b><p class="hint" style="margin:4px 0 0">Every S and A spot in one county: clues, coordinates, land rule and LiDAR picture, as a sheet to print or save as a PDF, plus a GPX file for a GPS or map app. Made on this phone when you tap, so it works offline (LiDAR pictures need one visit with signal).</p>
<select class="tssel" aria-label="County">${cs.map(c=>{ const k=c.stt+'|'+c.co; return `<option value="${esc(k)}"${k===cur?' selected':''}>${esc(tsName(c.co,c.stt))}: ${c.S+c.A} spots${c.S?` (${c.S} S)`:''}</option>`; }).join('')}</select>
<div class="tsrow"><button type="button" data-ts="pdf">Print / PDF</button><button type="button" data-ts="gpx">GPX file</button><button type="button" data-ts="html">Sheet file</button></div><p class="hint tsmsg" style="margin:6px 0 0"></p></div>`; }
  function tsWire(root){ root.querySelectorAll('[data-ts]').forEach(b=>b.onclick=()=>{ const box=b.closest('.tsbox'), [stt,co]=box.querySelector('.tssel').value.split('|'); tsRun(co,stt,b.dataset.ts,box.querySelector('.tsmsg')); }); }
  // Library > Offline use gets the county picker (filled when first scrolled into view, so start-up is not slowed)
  { const h=document.getElementById('k-offline'); if(h){ const host=document.createElement('div'); host.id='tsLib'; h.nextElementSibling.after(host);
      const fill=()=>{ if(host.firstChild) return; host.innerHTML=tsPanel('WI|Eau Claire'); tsWire(host); };
      if('IntersectionObserver' in window){ const io=new IntersectionObserver(es=>{ if(es.some(e=>e.isIntersecting)){ fill(); io.disconnect(); } }); io.observe(host); } else fill(); } }
  // every S or A spot card offers its county's sheet
  const _selTS=select; select=function(id,pan){ const r=_selTS(id,pan), p=BYID[id]; if(!p||!/^[SA]$/.test(TIER.t(p))) return r;
    const d=document.querySelector('#detail .detail'); if(!d||d.querySelector('.tscard')) return r; const at=d.querySelector('.ogq')||d.querySelector('.tags'); if(!at) return r;
    const n=tsSpots(p.co||'',p.stt).length, b=document.createElement('button'); b.type='button'; b.className='tscard'; b.textContent=`Trip sheet: ${tsName(p.co||'',p.stt)} (${n} S and A spots, for offline)`;
    b.onclick=()=>{ const w=document.createElement('div'); w.innerHTML=tsPanel(tsKey(p)); b.replaceWith(w.firstChild); const box=d.querySelector('.tsbox'); tsWire(box); }; at.after(b); return r; };
}
