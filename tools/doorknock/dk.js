// ---------- door-knock kit: who owns the ground, a permission letter and a "Door-knock ready" sort ----------
// Owners come straight from the open state parcel maps when a private-land card opens; nothing is stored in the page, and each lookup is saved on this phone.
// Wisconsin statewide parcels V12 (SCO/DOA, 2025 tax roll: owner, mailing address, parcel ID; Kenosha redacts names) and Minnesota's opt-in open parcels (MnGeo).
// Michigan has no open statewide parcel layer: the card links to a county parcel search instead. Runs after pl.js (public land) when that is present.
{ const DK={pub:null,c:new Map()}, LS='og-dk:', ME='og-dk-me', DAY=864e5;
  const ls=(k,v)=>{ try{ if(v===undefined) return JSON.parse(localStorage.getItem(k)||'null'); localStorage.setItem(k,JSON.stringify(v)); }catch(_){ return null; } };
  try{ for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k&&k.startsWith(LS)) DK.c.set(k.slice(LS.length),ls(k)); } }catch(_){}
  const SRC={WI:[['https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer/0','Wisconsin statewide parcels V12 (2025 tax roll)'],
                 ['https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels/FeatureServer/0','Wisconsin statewide parcels']],
             MN:[['https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer/0','Minnesota open parcels (MnGeo, counties that share)']]};
  const WIF='OWNERNME1,OWNERNME2,PSTLADRESS,SITEADRESS,PARCELID,TAXPARCELID,GISACRES,ASSDACRES,CONAME,PROPCLASS,AUXCLASS';
  const PUB=/\b(STATE OF|COUNTY OF|\w+ COUNTY\b(?! LINE)|CITY OF|TOWN OF|VILLAGE OF|UNITED STATES|USA\b|U S A|SCHOOL DIST|DEPT OF|DEPARTMENT OF|DNR\b|BOARD OF COMMISSIONERS|PUBLIC LANDS|SANITARY DIST)/i;
  const pick=(A,ks)=>{ for(const k of ks){ const v=A[k]; if(v!=null&&String(v).trim()&&!/^(null|none)$/i.test(String(v).trim())) return String(v).trim(); } return ''; };
  // one parcel record, from either the Wisconsin V12 schema or the Minnesota parcel standard
  function dkNorm(a,src){ const A={}; for(const k in a) A[k.toUpperCase()]=a[k];
    const ad=pick(A,['PSTLADRESS','OWN_ADDR','MAIL_ADDR','MAILADDR'])||[1,2,3].map(i=>pick(A,['OWN_ADD_L'+i,'TAX_ADD_L'+i])).filter(Boolean).join(', ');
    const r={o:pick(A,['OWNERNME1','OWNER_NAME','OWNERNAME','OWNER','TAX_NAME','TAXPAYER']),o2:pick(A,['OWNERNME2','OWNER_MORE']),a:ad,
      s:pick(A,['SITEADRESS','SITE_ADDR','PROP_ADDR','BLDG_ADDR']),id:pick(A,['PARCELID','TAXPARCELID','PIN','COUNTY_PIN','PARCEL_ID']),
      ac:+pick(A,['GISACRES','ASSDACRES','ACRES_DEED','ACRES_POLY','ACRES'])||0,co:pick(A,['CONAME','CO_NAME','COUNTY']),x:pick(A,['AUXCLASS']),src,d:Date.now()};
    r.pub=/^X/i.test(r.x)||PUB.test(r.o); r.mfl=/^W/i.test(r.x); return r; }
  async function dkQ(url,lo,la,f){ const ac=new AbortController(), t=setTimeout(()=>ac.abort(),15000);
    try{ const r=await fetch(`${url}/query?f=json&geometry=${lo},${la}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&returnGeometry=false&outFields=${f}`,{signal:ac.signal});
      const j=await r.json(); if(j.error) throw new Error(j.error.message||'parcel map error'); return j.features||[]; } finally{ clearTimeout(t); } }
  // owner of the parcel under the pin: saved answer first (kept 180 days), then the state parcel map
  async function dkFind(p,fresh){ const c=DK.c.get(p.id); if(c&&!fresh&&Date.now()-c.d<180*DAY) return c;
    const L=SRC[p.stt]; if(!L) return {no:1};
    if(navigator.onLine===false) return c||{off:1};
    let err='';
    for(const [u,n] of L) for(const f of (p.stt==='WI'?[WIF,'*']:['*'])){ try{ const fs=await dkQ(u,p.lo,p.la,f);
        const rs=fs.map(x=>dkNorm(x.attributes||{},n)).filter(r=>r.o||r.id); if(!fs.length||!rs.length){ const r={none:1,src:n,d:Date.now()}; DK.c.set(p.id,r); ls(LS+p.id,r); return r; }
        const r=rs.find(r=>r.o)||rs[0]; DK.c.set(p.id,r); ls(LS+p.id,r); return r; }catch(e){ err=e.name==='AbortError'?'the parcel map took too long':String(e.message||e); } }
    return c||{err}; }
  window.dkLookup=dkFind;
  const countyQ=p=>{ const co=(p.co||'').split(/[/(]/)[0].trim(), st={WI:'Wisconsin',MN:'Minnesota',MI:'Michigan'}[p.stt]||p.stt;
    return `https://www.google.com/search?q=${encodeURIComponent((co?co+' County ':'')+st+' parcel search owner GIS map')}`; };
  const me=()=>ls(ME)||{n:'',ph:'',em:'',tw:'near Eau Claire'};
  const title=s=>String(s||'').toLowerCase().replace(/\b([a-z])/g,m=>m.toUpperCase()).replace(/\b(Llc|Lp|Llp|Ii|Iii|Iv|Etal|Rlt|Po|Wi|Mn|Mi|Ia|Il|Nd|Sd)\b/g,m=>m.toUpperCase());
  // tax rolls list people as "JOHNSON, ROBERT L & MARY K": turn that round for the card and the letter, leave firms and trusts as they are
  const nice=s=>{ const m=String(s||'').match(/^([^,&]+),\s*(.+)$/); return title(m&&!/\b(LLC|INC|CORP|CO|FARMS?|TRUST|TRST|ESTATE|LP|LLP|ASSN|CHURCH|COMPANY)\b/i.test(s)?m[2]+' '+m[1]:s); };
  const what=p=>{ const y=String(p.y||'').match(/\b1[6-9]\d\ds?\b/); return esc(p.n)+(y?' ('+y[0]+')':''); };

  // the permission letter, filled from the card; printable, or share/copy as text
  function dkLtr(p,r){ const m=me(), on=r&&r.o?nice(r.o)+(r.o2?' and '+nice(r.o2):''):'', pid=r&&r.id?r.id:'';
    const greet=on?`Dear ${esc(on)},`:'Dear Landowner,';
    const place=p?`${what(p)}${p.pl&&p.pl!==p.n?' at '+esc(p.pl):''}`:'an old homestead or gathering place';
    return `<div class="dkl"><p>${esc(m.n||'[Your name]')}<br>${esc(m.ph||'[Phone]')}${m.em?'<br>'+esc(m.em):''}</p><p>${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</p>
      ${on?`<p>${esc(on)}<br>${esc(title(r.a||''))}</p>`:''}
      <p>${greet}</p>
      <p>My name is ${esc(m.n||'[your name]')}, and I live ${esc(m.tw||'near Eau Claire')}. I research local history, and as a hobby I search old home and gathering sites with a metal detector. Old maps and records place ${place} on or next to land the county lists in your name${pid?` (parcel ${esc(pid)})`:''}.</p>
      <p>I would like to ask your permission to search there for a few hours, on a day that suits you. I dig only small, neat plugs by hand and refill every one so the ground looks untouched, and I carry out any trash I find. I stay out of crops and away from livestock and buildings, and I will go only where and when you say.</p>
      <p>Anything that belonged to your family is yours, and I am glad to show you everything I find and to share what I learn about the history of your place. If anything of real value turns up, we will agree on it together before anything leaves your land.</p>
      <p>Please call or text me at ${esc(m.ph||'[phone]')}${m.em?` or write to ${esc(m.em)}`:''}. A short reply on the slip below is all I need. Thank you for considering it.</p>
      <p>Sincerely,<br><br>${esc(m.n||'[Your name]')}</p>
      <div class="dkslip"><b>Permission to metal detect</b><br>I, ______________________________, owner of the land ${pid?`(parcel ${esc(pid)}) `:''}${p&&p.pl?'at '+esc(p.pl)+' ':''}${p?'':'at ______________________________ '}give ${esc(m.n||'______________________')} permission to search it with a metal detector and dig small holes, which will be refilled.<br>
      Dates: from ____________ to ____________ &nbsp; Areas to avoid: ______________________________<br>
      Finds: owner keeps items of family value; other finds ______________________________<br>
      Signature ______________________________ &nbsp; Date __________ &nbsp; Phone ______________</div></div>`; }
  const plain=h=>{ const d=document.createElement('div'); d.innerHTML=h.replace(/<br>/g,'\n').replace(/<\/p>|<\/div>/g,'\n\n'); return d.textContent.replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n').trim(); };
  document.head.insertAdjacentHTML('beforeend',`<style id="dkCss">.dkbox{margin:8px 0;padding:8px 10px;border-radius:10px;border:1px solid var(--line,#8884);font-size:14px;line-height:1.4}.dkbox .row{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
    #dkSheet{position:fixed;inset:0;z-index:60;background:var(--bg,#fff);color:var(--ink,#111);overflow:auto;padding:calc(12px + env(safe-area-inset-top,0px)) 16px 40px}#dkSheet[hidden]{display:none}
    #dkSheet .dkf{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:8px 0}#dkSheet .dkf input{min-width:0;font-size:16px;padding:6px 8px}#dkSheet .dkbar{display:flex;flex-wrap:wrap;gap:6px;position:sticky;top:0;background:var(--bg,#fff);padding:6px 0;z-index:1}
    .dkl{max-width:640px;font:15px/1.5 Georgia,serif}.dkl p{margin:0 0 10px}.dkslip{margin-top:18px;padding-top:10px;border-top:1px dashed currentColor;font-size:13.5px;line-height:2}
    @media print{body>*:not(#dkSheet){display:none!important}#dkSheet{position:static;padding:0;background:#fff;color:#000}#dkSheet .dknp{display:none!important}.dkl{font-size:12pt;max-width:none}}</style>`);
  document.body.insertAdjacentHTML('beforeend','<div id="dkSheet" hidden role="dialog" aria-label="Permission letter"><div class="dkbar dknp"><button class="chip" data-a="print">Print</button><button class="chip" data-a="share">Share</button><button class="chip" data-a="copy">Copy text</button><button class="chip" data-a="x" style="margin-left:auto">Close</button></div><div class="dknp"><p class="hint">Your details are kept on this phone for every letter.</p><div class="dkf"><input data-k="n" placeholder="Your name" autocomplete="name"><input data-k="ph" placeholder="Phone" autocomplete="tel" inputmode="tel"><input data-k="em" placeholder="Email (optional)" autocomplete="email"><input data-k="tw" placeholder="Where you live, e.g. near Eau Claire"></div></div><div id="dkBody"></div></div>');
  const sh=document.getElementById('dkSheet'); let cur=[null,null];
  const fill=()=>{ document.getElementById('dkBody').innerHTML=dkLtr(cur[0],cur[1]); };
  sh.querySelectorAll('input').forEach(i=>i.oninput=()=>{ const m=me(); m[i.dataset.k]=i.value; ls(ME,m); fill(); });
  sh.querySelector('.dkbar').onclick=async e=>{ const a=e.target.dataset&&e.target.dataset.a; if(!a) return; const t=plain(dkLtr(cur[0],cur[1]));
    if(a==='x') sh.hidden=true; else if(a==='print') window.print();
    else if(a==='share'){ try{ await navigator.share({title:'Permission letter',text:t}); }catch(_){} }
    else if(a==='copy'){ try{ await navigator.clipboard.writeText(t); e.target.textContent='Copied'; }catch(_){ e.target.textContent='Copy failed'; } } };
  window.dkLetter=(p,r)=>{ cur=[p||null,r||null]; const m=me(); sh.querySelectorAll('input').forEach(i=>i.value=m[i.dataset.k]||''); fill(); sh.hidden=false; sh.scrollTop=0; };

  // the card: a Door-knock box under the Land box
  function dkBox(p,r){ const lnk=`<a href="${countyQ(p)}" target="_blank" rel="noopener">County parcel search</a>`;
    if(r.pubU) return `<b>Who to ask:</b> ${esc(r.pubU[3]||'the managing agency')}${r.pubU[2]?' ('+esc(r.pubU[2])+')':''}. Public land follows the agency's rule above, not a landowner's.`;
    if(r.no) return `<b>Who owns it:</b> ${p.stt==='MI'?'Michigan':'This state'} has no open owner list. Find the owner on the county's parcel map (${lnk}), or ask at the nearest farmhouse.`;
    if(r.wait) return '<b>Who owns it:</b> looking it up in the state parcel map…';
    if(r.off) return `<b>Who owns it:</b> no signal. The owner lookup needs a connection once; after that it is saved on this phone. ${lnk}`;
    if(r.err) return `<b>Who owns it:</b> the parcel map did not answer (${esc(r.err)}). <button class="chip small" data-dk="retry">Try again</button> ${lnk}`;
    if(r.none||!r.o) return `<b>Who owns it:</b> ${r.none?'no parcel under the pin in':'no owner name in'} ${esc(r.src||'the parcel map')}${p.stt==='WI'&&/kenosha/i.test(p.co||'')?' (Kenosha County withholds owner names)':''}. Try the county: ${lnk}`;
    const age=Math.round((Date.now()-r.d)/DAY);
    return `<b>Who owns it:</b> ${esc(nice(r.o))}${r.o2?' and '+esc(nice(r.o2)):''}${r.pub?' (a public or tax-exempt owner: ask that office)':''}<br>
      ${r.a?`Mailing address: ${esc(title(r.a))}<br>`:''}${r.s?`Property address: ${esc(title(r.s))}<br>`:''}
      <span class="hint">Parcel ${esc(r.id||'?')}${r.ac?`, ${r.ac<10?r.ac.toFixed(1):Math.round(r.ac)} acres`:''}${r.co?', '+esc(title(r.co))+' County':''}. ${esc(r.src)}${age>1?`, looked up ${age} days ago`:''}. The pin is approximate, so check the parcel lines before you knock.</span>
      ${r.mfl?'<br>Managed Forest Law land: even "open" MFL land is open only for hunting, fishing, hiking, sightseeing and cross-country skiing, so detecting still needs this owner\'s yes.':''}
      <div class="row"><button class="chip small" data-dk="letter">Permission letter</button><button class="chip small" data-dk="script">What to say at the door</button>${lnk}</div>`; }
  function dkShow(p,r){ if(selId!==p.id) return; let b=document.querySelector('#detail .dkbox');
    if(!b){ const at=document.querySelector('#detail .plbox')||document.querySelector('#detail .tags'); if(!at) return; at.insertAdjacentHTML('afterend','<div class="dkbox"></div>'); b=document.querySelector('#detail .dkbox'); }
    b.innerHTML=dkBox(p,r);
    b.onclick=e=>{ const a=e.target.dataset&&e.target.dataset.dk; if(!a) return;
      if(a==='letter') dkLetter(p,r); else if(a==='script') dkScript(); else if(a==='retry'){ dkShow(p,{wait:1}); dkFind(p,true).then(x=>{ dkShow(p,x); bump(); }); } }; }
  const land=p=>typeof plLookup==='function'?plLookup(p).catch(()=>null):Promise.resolve(null);
  const _selDK=select; select=function(id,pan){ const r=_selDK(id,pan), p=BYID[id]; if(!p||p.la==null||p.lo==null) return r;
    land(p).then(u=>{ if(u){ dkShow(p,{pubU:u}); return; } if(!SRC[p.stt]){ dkShow(p,{no:1}); return; }
      const c=DK.c.get(p.id); dkShow(p,c&&(c.o||c.none)?c:{wait:1}); dkFind(p).then(x=>{ dkShow(p,x); bump(); }); }); return r; };

  // Field skills: asking permission, the doorstep script and the blank letter
  const sk=document.getElementById('k-legend');
  if(sk&&!document.getElementById('k-knock')){ sk.insertAdjacentHTML('beforebegin',`<h2 id="k-knock">Asking permission</h2>
    <p>Most of the best ground in the atlas is private farmland and woodlot, and a friendly ask at the door gets a yes more often than not. Every spot card on private land in Wisconsin (and in Minnesota counties that share their tax roll) shows the owner and mailing address from the county tax roll, with a letter already filled in. <b>Door-knock ready</b> in the Spots list Sort menu lists the S, A and B spots on private land whose owner is listed.</p>
    <h3>Before you go</h3><ul>
    <li>Read the card's Land box first: public land follows the agency's rule, and no landowner can give you permission there.</li>
    <li>The tax-roll owner may not live on the land; the mailing address says where they do. A renter or farm tenant cannot give permission for ground they don't own, so ask who owns it.</li>
    <li>The pin is often approximate and parcels are narrow: check which parcel the old building actually sat on (plat book layer and 1938 aerials) before you knock.</li>
    <li>Go between 10 and 6, not at mealtimes, Sunday morning, or in the middle of planting, harvest or deer season. Park on the road, not in the yard.</li>
    <li>Bring the letter, a printout of the old map or 1938 aerial of their place, and a few cleaned finds from elsewhere so they see what you mean.</li></ul>
    <h3 id="k-knock-say">At the door (30 seconds)</h3>
    <p style="border-left:4px solid var(--line,#8884);padding-left:10px"><i>"Hi, I'm ___. I live over by Eau Claire and I dig into the old history around here. An old map shows a [schoolhouse / farmstead / store] stood on your land back in the [1890s]. I'd love to look over that spot with a metal detector some afternoon. I dig small, neat holes and fill every one, I stay out of crops and away from stock, and anything that belonged to your family is yours. Would that be all right? I can come whenever suits you."</i></p>
    <ul><li><b>If they hesitate:</b> offer to show them how small a plug is, invite them along, or leave the letter and your number.</li>
    <li><b>If it's no:</b> thank them and ask whether they know any old-timers or other old sites nearby. A no in May can be a yes after harvest.</li>
    <li><b>If it's yes:</b> ask what to avoid, where to park, and whether hunting season matters, then get it in writing on the slip at the bottom of the letter.</li></ul>
    <h3>Owners who live away</h3><p>When the mailing address is in another town, write instead of knocking. Tap <b>Permission letter</b> on the spot card (owner, place and parcel number filled in), print or share it, and add a stamped return envelope. <button class="chip small" id="dkBlank">Blank letter</button></p>
    <h3>Keep the door open</h3><ul>
    <li>Fill every hole, carry out all the trash you dig, and leave gates as you found them.</li>
    <li>Show the owner everything you found and offer back anything with a family connection. Agree in writing beforehand how anything valuable will be shared.</li>
    <li>Keep the signed slip with you. Without the owner's consent you are trespassing, and anything you take belongs to the landowner.</li>
    <li>Wisconsin Managed Forest Law land marked "open" is open only for hunting, fishing, hiking, sightseeing and cross-country skiing; detecting still needs the owner's yes.</li>
    <li>Graves, burial mounds and cemeteries stay off limits even with permission (Wisconsin s. 157.70 protects burial sites on private land too).</li>
    <li>Send a thank-you note and a photo of the best find. The owner's neighbors are the next door you knock on.</li></ul>
    <p class="hint">Owner data: <a href="https://www.sco.wisc.edu/parcels/data/" target="_blank" rel="noopener">Wisconsin statewide parcels V12</a> (State Cartographer's Office and DOA, 2025 tax roll; Kenosha County withholds names) and Minnesota's opt-in open parcels (MnGeo). The lookup goes from your phone to the state parcel map when you open a card and is saved only on this phone.</p>`);
    const toc=document.querySelector('#rv-skills .toc a[href="#k-detect"]');
    if(toc){ toc.insertAdjacentHTML('afterend','<a class="chip small" href="#k-knock">Asking permission</a>'); toc.nextElementSibling.onclick=e=>{ e.preventDefault(); document.getElementById('k-knock').scrollIntoView({behavior:'smooth'}); }; }
    document.getElementById('dkBlank').onclick=()=>dkLetter(null,null); }
  window.dkScript=()=>{ showView('skills'); setTimeout(()=>document.getElementById('k-knock-say')?.scrollIntoView({behavior:'smooth'}),60); };

  // Sort menu: "Door-knock ready" = S, A or B tier, private land, owner listed, not worked, found or proved false
  const bump=()=>{ if(SSORT.cache) delete SSORT.cache.dk; if(SSORT.k==='dk') renderList(); };
  const loadPub=()=>{ if(DK.pub||DK.pl) return; if(typeof plLookup!=='function'){ DK.pub={}; return; }
    DK.pl=fetch('pl/spots.json',{cache:'force-cache'}).then(r=>r.ok?r.json():{}).catch(()=>({})).then(a=>{ DK.pub=a||{}; bump(); }); };
  SSORT.SORTS.dk={n:'Door-knock ready',d:'S, A and B spots on private land whose owner is listed in the state parcel map (all of Wisconsin but Kenosha; Minnesota once a card has found the owner). Spots you marked worked, already found or proved false are left out. Open a card for the owner, mailing address and a permission letter.',
    f:p=>{ if(!DK.pub){ loadPub(); if(!DK.pub) return null; }
      const t=TIER.t(p); if(!'SAB'.includes(t)) return null;
      if(p.s==='found'||p.s==='false'||p.ho||(typeof WKS==='function'&&WKS(p.id)==='worked')||DK.pub[p.id]) return null;
      const c=DK.c.get(p.id); if(c&&(c.pub||c.none)) return null;
      const known=c&&c.o; if(!known&&!(p.stt==='WI'&&!/kenosha/i.test(p.co||''))) return null;
      return [(3-'SAB'.indexOf(t))*1000+(TIER.get(p).sc||0)+(known?3:0), t+' tier · private land · '+(known?'owner: '+nice(c.o)+(c.a?' · '+title(c.a):''):'owner listed in the Wisconsin parcel map')]; }};
  const sel=document.getElementById('ssSort');
  if(sel&&!sel.querySelector('option[value="dk"]')) sel.insertAdjacentHTML('beforeend','<option value="dk">Door-knock ready</option>');
  // on the Door-knock list: save the owners of the top spots for a day with no signal
  const list0=SSORT.list; SSORT.list=function(){ const r=list0(); if(SSORT.k!=='dk'||!r) return r;
    const L=document.getElementById('list'), v=[...L.querySelectorAll('.item')].map(b=>BYID[b.dataset.id]).filter(p=>p&&SRC[p.stt]&&!(DK.c.get(p.id)||{}).o).slice(0,40);
    if(!v.length||DK.saving) return r;
    L.insertAdjacentHTML('afterbegin',`<p class="note" id="dkSave"><button class="chip small">Save owners for offline</button> Looks up the owners of the top ${v.length} spots now, so the cards work with no signal.</p>`);
    L.querySelector('#dkSave button').onclick=async e=>{ DK.saving=1; const s=e.target.parentNode; let n=0;
      for(const p of v){ s.textContent=`Looking up owners… ${n}/${v.length}`; await dkFind(p).catch(()=>null); n++; }
      DK.saving=0; s.textContent=`Saved ${n} owners on this phone.`; setTimeout(bump,1200); };
    return r; };
}
