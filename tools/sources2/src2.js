// ---------- Two sources (v210): a spot needs two independent sources agreeing on where it was before it can sit above C; checked-and-rejected spots show as F ----------
// A source counts only when it places the spot: a plat book or fire map that draws it, an old topo that draws something at or within 200 m of the pin,
// an air photo or LiDAR that shows the feature there, a GLO survey plat, a newspaper or county history that names the place. Map checks that found nothing don't count.
// Sources copied from each other are one family: GNIS was read off the topo sheets, so GNIS and old topo count once; all websites together count once.
// Parks, standing landmarks and your own My spots are left out (they are there to see). NEG holds spots from research/negatives.tsv marked rejected.
const SRC2=(()=>{
  const N={plat:'plat book',sanborn:'fire map',topo:'old USGS topo or place-name file',glo:'1840s-50s land survey',air:'old air photo',lidar:'LiDAR',news:'newspaper',hist:'county history or old book',reg:'official register (NRHP, MRDS, wreck list)',photo:'old photo',own:'your own notes or visit',stand:'still standing (NRHP)',osm:'today\'s map',web:'website',other:'another written source'};
  const RULE=new Set(['gather','beach','flood84','camp','ghost','school','school2','vpo','history','treasure','lead','af15','af38','af64']); // not parks, landmarks, gold and geology, or your own My spots
  const AUTO=/^USGS historical topographic maps, 1924-1958|^Wisconsin Historic Aerial Imagery Finder|^USGS 3DEP 1 m LiDAR|^USGS \d?DEP/; // added to every checked pin, found or not: the card text decides
  const TI=[ // source titles -> family
    [/^your /i,'own'],
    [/sanborn|fire (insurance )?map/i,'sanborn'],
    [/plat book|county plats|plat of |\batlas of\b|standard atlas|historical atlas|illustrated historical atlas|map of (the )?county|map of \w+ county|town plan|village plat|township plat/i,'plat'],
    [/original government survey|general land office|survey plat|field notes/i,'glo'],
    [/gnis|place-name|usgs .*\btopo|topographic/i,'topo'],
    [/national register|nrhp|mineral resources data|mrds|wreck list|published wreck/i,'reg'],
    [/newspaper|chronicling america|\b(leader|telegram|gazette|herald|journal|tribune|republican|democrat|free press|courier|sentinel|daily|weekly|messenger|times|news|record|telegraph|dispatch|enterprise|advocate|independent|reporter|argus|banner|chronicle|observer)\b/i,'news'],
    [/history of|historical society|collections of|geographic names|ghost towns|discovering wisconsin|old books|centennial|curtiss-wedge|menacing waters|wisconsin lore|reminisc|district history|directory|memoir|biograph/i,'hist'],
    [/openstreetmap|overture/i,'osm'],
    [/website|wikipedia|treasure|\.com|\.org|rock chasing|cinematreasures|visit /i,'web']];
  const PLATK=/^p[a-z]{1,3}\d\d$/;
  const sents=t=>(t||'').split(/(?<=[.!?])\s+/);
  function fams(p){
    const f=new Set();
    for(const k in p) if(PLATK.test(k)&&p[k]===1) f.add('plat');
    if(p.sv78) f.add('plat'); if(p.sf||p.fr) f.add('sanborn'); if(p.gs) f.add('glo'); if(p.nw||p.c==='newspaper') f.add('news'); if(p.book) f.add('hist');
    if(p.himg&&(!Array.isArray(p.himg)||p.himg.length)) f.add('photo');
    if(p.p==='topo'||p.p==='gnis') f.add('topo'); if(p.p==='nrhp'||p.p==='mrds') f.add('reg'); if(p.p==='mylist') f.add('own');
    for(const e of p.pinev||[]){ if(/plat book|township plat|village plat|town plan/i.test(e)) f.add('plat'); if(/fire map/i.test(e)) f.add('sanborn'); if(/original survey plat|^Survey plat/i.test(e)) f.add('glo'); if(/wreck list/i.test(e)) f.add('reg'); }
    for(const s of p.src||[]){ const t=s[0]||''; if(AUTO.test(t)||!t.trim()) continue; const m=TI.find(x=>x[0].test(t)); if(m) f.add(m[1]); else if(!/census geocoder|^BLM PLSS|section boundaries/i.test(t)) f.add('other'); }
    for(const s of sents(p.st)){
      if(/topo map \([^)]*\) (draws|labels) (?!no |nothing)/.test(s)){ const m=s.match(/about (\d+) m [a-z-]+ of the pin/); if(!m||+m[1]<=200) f.add('topo'); }
      if(/era USGS topo draws it at the pin|onto what the topo draws|placed from the [\w .'-]+ topographic map/i.test(s)) f.add('topo');
      if(/^Air photo check[^:]*:/.test(s)){ // the photo has to show the feature on the pin (first part of the note) or within 60 m
        const a=s.replace(/^[^:]*:\s*/,''), FT=/building|farmstead|farm\b|barn|house|dam\b|mill|school|church|cemetery|ruin|foundation|race\b|track|grandstand|pavilion|dock|depot|station|camp|yard/i;
        if(!/^(no |nothing)/i.test(a)&&a.split(';').some((c,i)=>FT.test(c)&&(i===0&&!/\d+ m\b/.test(c)||+(c.match(/(\d+)(-\d+)? m\b/)||[])[1]<=60))) f.add('air'); }
      if(/farmstead stands here on the \d+ air photo|photo shows a farmstead about/.test(s)) f.add('air');
      if(/^Your [\w-]* ?aerials? (shows?|tell)/.test(s)) f.add('air');
      if(/LiDAR shows (?!houses|a subdivision|no )[^.]*\b(on|at) the pin|cellar pit|foundation pit/.test(s)) f.add('lidar'); }
    if(p.p==='nrhp'||(p.src||[]).some(s=>/national register|nrhp/i.test(s[0]||''))) f.add('stand'); // a listed building still standing is its own proof of place
    if(f.size>1) f.delete('osm'); // today's map only names the place; it never adds a second old source
    return [...f]; }
  function get(p){ if(p._s2&&p._s2.n===p.st) return p._s2.v; const v=fams(p); p._s2={n:p.st,v}; return v; }
  const applies=p=>RULE.has(p.L);
  const one=p=>applies(p)&&get(p).length<2;
  const neg=p=>typeof NEG==='object'&&NEG[p.id];
  return {N,get,applies,one,neg,names:p=>get(p).map(k=>N[k])}; })();
// research/negatives.tsv rows marked "rejected" whose spot is on the map: [date, who, reason, sources checked]
const NEG=/*NEG*/{}/*/NEG*/;
{ const C=TIER.C, g0=TIER.get;
  // tiers: one source caps at C; a rejected spot is F "checked, nothing". S rules are untouched.
  TIER.get=function(p){ const b=g0(p); if(p._t2&&p._t2.b===b) return p._t2.v; let v=b;
    const n=SRC2.neg(p);
    if(n) v={t:'F',sc:b.sc,w:'Checked, nothing: '+n[2]+' ('+n[1]+', '+n[0]+')'};
    else if(SRC2.one(p)&&TIER.IDX[b.t]<TIER.IDX.C) v={t:'C',sc:b.sc,w:'Unconfirmed, one source: held at C until a second source agrees on the place'+(b.w?'; '+b.w:'')};
    p._t2={b,v}; return v; };
  TIER.t=p=>TIER.get(p).t;
  // the card: which sources place the spot, under the tier line
  const rk0=rkHTML; rkHTML=function(p){ let h=rk0(p); try{
    const n=SRC2.neg(p);
    if(n) h=`<div class="tierwhy" style="border-color:${C.F}"><b>Checked, nothing.</b> ${esc(n[2].replace(/[.\s]*$/,'.'))} Checked by ${esc(n[1])} on ${esc(n[0])}${n[3]?' against '+esc(n[3]):''}. Kept on the map so nobody re-checks it; a new source can revive it.</div>`+h;
    else if(SRC2.applies(p)){ const s=SRC2.names(p);
      h+=s.length<2?`<div class="tierwhy src2" style="border-color:${C.C}"><b>Unconfirmed, one source.</b> ${s.length?'Only the '+esc(s[0])+' places this spot':'No old source places this spot yet'}. It stays at C or below until a second, independent source (old topo, air photo, LiDAR, fire map, plat book, survey plat, newspaper or county history) agrees on the place.</div>`
        :`<div class="tierwhy src2" style="border-color:#7fbf7f"><b>Placed by ${s.length} sources:</b> ${esc(s.join(', '))}.</div>`; }
  }catch(e){ OGE.err&&OGE.err('src2 card',e); } return h; };
  // the layers sheet: how many spots on your layers rest on one source
  const pl0=plLaySync; plLaySync=function(){ pl0(); try{ const hint=document.getElementById('tierHint'); if(!hint) return;
    let one=0, all=0, ng=0; for(const p of PTS){ if(!on.has(p.L)) continue; if(SRC2.neg(p)) ng++; if(SRC2.applies(p)){ all++; if(SRC2.one(p)) one++; } }
    let el=document.getElementById('src2Hint'); if(!el){ hint.insertAdjacentHTML('afterend','<p class="hint" id="src2Hint" style="margin:0"></p>'); el=document.getElementById('src2Hint'); }
    el.textContent=all?`Unconfirmed: ${one.toLocaleString()} of ${all.toLocaleString()} history spots on your layers rest on one source, so they sit at C or below until a second source agrees.${ng?' '+ng+' checked and rejected (F).':''}`:'';
  }catch(e){ OGE.err&&OGE.err('src2 sheet',e); } };
  if(typeof RKV!=='undefined') RKV++; // drop the tier caches built before this block
  plLaySync();
  try{ renderList(); }catch(_){}
}
