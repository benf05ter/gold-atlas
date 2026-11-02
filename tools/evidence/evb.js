<script>
// ---------- Evidence badge and Dowsing-free (v291) ----------
// Every treasure and wreck card says what the pin rests on, sorted from its own source list: court/probate/land record, census or vital record,
// plat/map/air photo, contemporary newspaper (or one read through a forum transcript), county history or official report, later
// folklore collection, treasure magazine/book/forum/web retelling, and dowsing or psychic claims. "Dowsing-free" hides treasure and wreck pins
// whose sources are only treasure magazines, treasure books, forums and web lists, or whose spot was named by a psychic. Grades are untouched.
{ const MON='(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\\.?';
  const SMAG=/treasurenet|\bTN\b|forum|treasure[- ](?:magazine|legends?|listicle|book|site|guide|atlas|seekr|valley)|lost treasures?\b|true treasure|treasure search|western (?:&|and) eastern|treasure cache|directory of buried|penfield|listicle|blog|lostinmichigan|rock ?chasing|raregoldnuggets|treasureseekr|metal ?detecting/i;
  const WMAG=/upnorthnews|northernmichiganhistory|miningjournal\.net|wgrd|wpr\.org|treasurevalley|coffman|1001 lost|treasure atlas|magazine|\bweb\b|website|radio|\bWPR\b|\bWGRD\b|wikipedia|lostinmichigan|\.net\b|\.com\//i;
  const REC=/probate|court|\bwills?\b|estate (?:file|tax|inventory|account|case|record)|deed|patent|inquest|\bcase\s*\d|homestead|tax (?:roll|list)|guardianship|coroner|indictment|\bFBI\b|register of deeds|land office|\bGLO\b|tract book|road notice|minutes|naturali[sz]ation|pension|FBI file/i;
  const CEN=/census|find ?a ?grave|death (?:record|certificate)|marriage record|obituary index/i;
  const MAP=/atlas|plat|\bmaps?\b|survey|\btopo|sanborn|aerial|air photo|lidar|quadrangle|parcel|\bGIS\b|bordner|GNIS|geonames|directory|directories|plaque|photo\b|address points|rumsey/i;
  const DATE=new RegExp('\\b1[89]\\d\\d-\\d\\d-\\d\\d\\b|\\b\\d{1,2} '+MON+',? 1[89]\\d\\d|'+MON+' \\d{1,2},? 1[89]\\d\\d|\\bp\\. ?\\d+\\b.*\\b1[89]\\d\\d\\b|\\b1[89]\\d\\d\\b.*\\bp\\. ?\\d+|newspapers\\.com|chronicling america|newspaper|clipping|dispatch|dateline|correspondent|\\b(?:AP|UP|INS)\\b|wire|MNHS (?:Digital )?Newspaper Hub','i');
  const HIST=/histor|hist\.|album|biograph|\bpp\.|reprint|\bbook\b|\blore\b|legends?\b|memoir|reminisc|proceedings|collections|numismatist|kleeberg|\bWPA\b|writers|guide|ghost towns|discovering|\(\w[\w .&]*,? ?1[89]\d\d\)|\(1[89]\d\d\)|\((?:19|20)\d\d[;)]|letter|interview|oral|told|tradition|notes|research|thesis|undergraduate|archives?|WGNHS|WOFR|USGS|\bDNR\b/i;
  const NEWS=/journal|times|tribune|herald|gazette|register|\bnews\b|leader|press|republican|democrat|sentinel|chronicle|courier|argus|\bpost\b|banner|advocate|inter ocean|pioneer|enquirer|independent|vindicator|picket|eagle|\bera\b|mirror|reporter|telegram|\bstar\b|\bsun\b|bulletin|daily|weekly|messenger|plaindealer|observer|recorder|citizen|transcript|globe|free press|pantagraph|whig|clarion|monitor|signal|censor|\bage\b|american|paper|\bindex\b|column/i;
  const LORE=/\bGard\b|wisconsin lore|haunted|brody|discovering wisconsin|ghost towns|hollatz|folklore|legend|tradition|oral|told by/i;
  const OFF=/WGNHS|WOFR|USGS|\bDNR\b|NOAA|wreck lists|wikipedia/i;
  const STRIP=/\((?:[^()]*?)(?:TN|TreasureNet|forum)[^()]*\)|,?\s*(?:via|quoted on|text via|excerpt via)\s+(?:the\s+)?(?:TN\s+)?TreasureNet[^;]*|\bTN\b.*$|TreasureNet.*$|forum.*$/gi;
  const base=s=> REC.test(s)?'rec': CEN.test(s)?'census': MAP.test(s)?'map': OFF.test(s)?'hist': WMAG.test(s)?'mag': DATE.test(s)?'news': LORE.test(s)?'lore': HIST.test(s)?'hist': NEWS.test(s)?'news':'oth';
  function cat(src){ const m=/^https?:\/\/([^/]+)/.exec(src[1]||''); let s=(src[0]||'')+(m?' '+m[1]:''); s=s.replace(/Fargo Forum/g,'Fargo Daily').replace(/Sunday magazine/gi,'Sunday paper');
    if(!SMAG.test(s)) return [base(s),false];
    const r=s.replace(STRIP,'').replace(/^[ ,;:]+|[ ,;:]+$/g,'');
    if(r&&/^"[^"]+",? 1[89]\d\d\b/.test(r)) return ['news',true];
    if(r&&!SMAG.test(r)&&!/^(treasure|magazine|miami item|coast guard|forum|later retelling)/i.test(r)){ const b=base(r); if(b!=='oth'&&b!=='mag') return [b,true]; }
    return ['mag',false]; }
  // psychic, dowsing and dream claims, read from each card: 'loc' = the spot itself was named that way (hidden by Dowsing-free); 'note' = in the story only
  const PSY={'tw-ia-pocahontas-calligan-lizard':['loc','A spiritualist named this farm in 1935 as the hiding place; the gold itself is family lore with no record.'],
    'gwl-old-silver-mine-porters-mills':['note',"A clairvoyant's 'spirit guide' chose where the 1870s shaft was dug. The pin marks the shaft and the old picnic grove, which Gard, WGNHS and the 1972 topo place."],
    'tw-ia-patterson-sugar-camp-1907':['note',"The 1907 diggers were said to have a spirit medium's help; the sugar-camp spot comes from the newspaper, not the medium."],
    'tw-ia-clinton-robbers-cave-bluffs':['note','In 1906 two trappers dynamited the cliff after a dream; the Robbers Cave story is older and does not rest on the dream.'],
    'tw-ia-eldora-webster-casks-1897':['note','A dowser wrote to the probate judge offering to find the money; no dowser placed anything here.']};
  const PSYRX=/dows|divining rod|clairvoy|psychic|spirit medium|spiritualist|seance|séance|ouija/i;
  const EVN={rec:'Court, probate or land record',census:'Census or vital record',map:'Plat, map or air photo',news:'Newspaper of the time',hist:'County history or official report',lore:'Later folklore collection',mag:'Treasure magazine, book, forum or web list',psy:'Dowsing or psychic claim'};
  const EVO=['rec','census','news','map','hist','lore','mag'];
  function EV(p){ if(p._ev&&p._ev.n===(p.src||[]).length) return p._ev;
    const c={}, f={}; for(const s of p.src||[]){ const [k,v]=cat(s); if(k==='oth') continue; c[k]=(c[k]||0)+1; if(v) f[k]=(f[k]||0)+1; }
    const ks=EVO.filter(k=>c[k]); let ps=PSY[p.id]||null;
    if(!ps&&PSYRX.test((p.st||'')+' '+(p.t||''))) ps=['note','The card mentions a dowser or psychic; check the story before trusting the spot.'];
    const hear=!ks.some(k=>k!=='mag'), dz=hear||(ps&&ps[0]==='loc');
    return p._ev={n:(p.src||[]).length,c,f,ks,ps,hear,dz}; }
  const EVL=new Set(['treasure','wreck']);
  window.EVB={EV,cat,EVN,EVL,on:false};
  try{ EVB.on=localStorage.getItem('ogDzFree')==='1'; }catch(_){}
  const CSS='.evb{border-left:3px solid var(--accent)} .evb .evk{display:inline-block;margin:2px 4px 0 0;padding:1px 7px;border-radius:9px;border:1px solid var(--line);font-size:12px;white-space:nowrap} .evb .evk.mag,.evb .evk.psy{border-style:dashed;color:var(--muted)}';
  document.head.insertAdjacentHTML('beforeend','<style>'+CSS+'</style>');
  function evHTML(p){ if(!EVL.has(p.L)) return ''; const e=EV(p);
    let h='<div class="note2 evb"><b>What this pin rests on:</b> ';
    if(!e.ks.length) h+='no source listed on this card';
    for(const k of e.ks){ const n=e.c[k], v=e.f[k]||0; h+=`<span class="evk ${k}">${esc(EVN[k])}${n>1?' ×'+n:''}${v?` (${v===n?'':v+' '}read via a forum copy)`:''}</span>`; }
    if(e.ps) h+=`<span class="evk psy">${esc(EVN.psy)}</span>`;
    h+='</div>';
    if(e.ps) h+=`<div class="note2 warn">${e.ps[0]==='loc'?'Spot named by a psychic: ':'Psychic in the story: '}${esc(e.ps[1])}</div>`;
    if(e.hear) h+='<div class="note2 warn">Hearsay only: every source on this card is a treasure magazine, treasure book, forum post or web list. A newspaper, record or county history would firm it up. Dowsing-free hides it.</div>';
    else if(e.dz) h+='<div class="note2 warn">Dowsing-free hides this pin.</div>';
    return h; }
  const _nEV=notesHTML; notesHTML=function(p){ return evHTML(p)+_nEV(p); };
  const _lvEV=LV; LV=function(p){ return _lvEV(p)&&!(EVB.on&&EVL.has(p.L)&&EV(p).dz); };
  const ti=LAYERS.findIndex(L=>L.id==='treasure');
  const B={sec:'Treasure', id:'_dzfree', n:'Dowsing-free', d:'', overlay:true, on:false};
  const desc=()=>{ let nh=0; for(const p of PTS) if(EVL.has(p.L)&&EV(p).dz) nh++; EVB.n=nh;
    B.d=`Show only documented ground: hides the ${nh} treasure and wreck pins that rest only on treasure magazines, treasure books, forum posts or web lists, or on a psychic. Every treasure and wreck card says what it rests on`; };
  desc(); addEventListener('load',()=>setTimeout(()=>{ desc(); try{ renderLayers(); }catch(_){} },1500));
  LAYERS.splice(ti<0?LAYERS.length:ti+1,0,B); LBY._dzfree=B;
  try{ if(typeof SHORT==='object') SHORT._dzfree='Dowsing-free'; }catch(_){}
  try{ if(typeof PLOV==='object') PLOV._dzfree=['var(--accent)','r']; }catch(_){}
  const sync=()=>{ if(PTS.length!==EVB.np){ EVB.np=PTS.length; desc(); } if(EVB.on) on.add('_dzfree'); else on.delete('_dzfree'); };
  sync();
  // a layer row press flips the set itself; keep our own flag so view presets (which clear the set) do not drop the choice
  document.addEventListener('click',e=>{ const b=e.target.closest&&e.target.closest('[data-l="_dzfree"]'); if(!b) return;
    EVB.on=!on.has('_dzfree'); try{ localStorage.setItem('ogDzFree',EVB.on?'1':'0'); }catch(_){} },true);
  if(window.OGE&&OGE.on) OGE.on('pre',sync);
  try{ renderLayers(); }catch(_){}
  try{ if(typeof plLaySync==='function') plLaySync(); }catch(_){}
  try{ drawMarkers(); }catch(_){} }
</script>
