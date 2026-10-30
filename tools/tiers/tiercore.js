// ---------- Tiers (v197): every spot gets one tier, S (best) to F, worked out from the best-spot score, the ground grade, layers stacked and lost-loot placing ----------
// Detecting spots: the best-spot score (RKX) plus a bonus for eras of use stacked on the same ground and for never-found loot placed close,
// then held under the ground-grade cap (the same cap the rank uses: grade B can't pass A, no grade can't pass B, a town-level pin can't pass B).
// Gold, geology and reference layers use what they carry: prospect tier and rank, trap rank, evidence and pin precision, access.
// Look only (burial, archaeological, state park, protected wreck) and spots you marked worked out are F.
const TIER=(()=>{
  const T=['S','A','B','C','D','E','F'];
  const NAME={S:'S tier: the best there is',A:'A tier: excellent',B:'B tier: good',C:'C tier: worth a look',D:'D tier: long shot',E:'E tier: slim chance',F:'F tier: look only or little left'};
  const CUT=[[90,'S'],[76,'A'],[64,'B'],[52,'C'],[40,'D'],[0,'E']];
  const CAPT={1:'S',2:'A',3:'B',4:'C',5:'D'};
  const lower=(a,b)=>T[Math.max(T.indexOf(a),T.indexOf(b))];
  const at=s=>{ for(const [v,t] of CUT) if(s>=v) return t; return 'F'; };
  const PIN={exact:3,nrhp:3,mylist:3,gnis:3,google:3,topo:3,naip:3,plss:2,approx:2,area:1,island:1,town:1,mrds:2,county:0,unknown:0};
  const EV={documented:3,newspaper:2,report:1,lead:1,legend:0,rumor:0,model:0};
  function geo(p){ // [tier, why] for layers the best-spot score skips
    const L=p.L, ev=EV[p.c]??1, pin=PIN[p.p]??1, st=p.acc&&p.acc[0];
    if(L==='restricted') return ['F','Closed or restricted land'];
    if(L==='prehist') return ['F','Look only: archaeological site'];
    if(L==='wreck') return ['F','Look only: protected shipwreck'];
    if(L==='landmark') return ['E','Historic marker or building: read the story, hunt only with permission nearby'];
    if(st==='stop') return ['F','Closed to digging or panning'];
    let t, w;
    if(L==='target'){ t=p.tier==='A'?(p.rank<=3?'S':'A'):p.tier==='B'?'B':'C'; w='Gold prospect target, tier '+p.tier+', rank '+p.rank; }
    else if(L==='trap'){ t=p.srank<=3?'A':p.srank<=8?'B':p.srank<=14?'C':'D'; w='Gold trap, stream rank '+p.srank; }
    else if(L==='panning'){ t=ev>=3?(pin>=3?'A':'B'):ev===2?'C':'D'; w='Panning spot: '+({3:'documented gold',2:'newspaper report'}[ev]||'rumor only')+(pin>=3?', exact place':''); }
    else if(L==='report'){ t=ev>=3?'B':ev===2?'C':'D'; w='Gold report: '+(p.c||'unknown source'); }
    else if(L==='model'){ t=p.rank<=5?'C':'D'; w='Computer model pick, rank '+p.rank; }
    else if(L==='deposit'||L==='cmine'||L==='copper'||L==='superior'||L==='rock'){ t=ev>=3?(pin>=3?'B':'C'):'C'; w=ev>=3?'Documented mineral site':'Mineral site'; }
    else if(L==='lake'){ t=st==='ok'?'B':'C'; w=st==='ok'?'Lake open for panning':'Lake: check rules first'; }
    else if(L==='public'){ t=st==='ok'?'C':'D'; w=st==='ok'?'Public land open to detecting':'Public land: ask first'; }
    else if(L==='drill'||L==='pit'||L==='glacial'){ t='D'; w=L==='drill'?'Drill core hole: reference point':L==='pit'?'Gravel pit: concentrates, ask first':'Glacial feature: reference'; }
    else { t='E'; w='Reference point'; }
    if(st==='warn'&&t<'C'&&t!=='S') t=T[T.indexOf(t)+1];
    if(p.s==='false') t=lower(t,'E'); else if(p.s==='found') t=lower(t,'D');
    return [t,w]; }
  function calc(p){
    if(typeof WKS==='function'&&WKS(p.id)==='worked') return {t:'F',sc:0,w:'You marked it worked out'};
    const c=RKX(p); if(c.skip){ const [t,w]=geo(p); return {t,sc:-1,w}; }
    if(c.r==='X') return {t:'F',sc:0,w:c.w[0]?c.w[0][1]:'Look only'};
    if(p.ug&&p.ug[0]==='D') return {t:'F',sc:c.sc,w:'Ground paved, built over or scoured'};
    if(p.s==='false') return {t:'F',sc:c.sc,w:'The story proved false'};
    let sc=c.sc, w=[];
    try{ SSORT.run('layers'); const l=p._ss&&p._ss.layers; if(l){ const n=parseInt(l[1]); if(n>=2){ sc+=Math.min(n-1,3)*4; w.push(n+' eras of use stacked'); } } }catch(_){}
    try{ SSORT.run('loot'); const l=p._ss&&p._ss.loot; if(l){ const pl=SSORT.placed(p); sc+=pl*4+(p.s==='never'?6:0); w.push('lost loot, placed to the '+['county','town','section','farm','exact spot'][pl]); } }catch(_){}
    let t=at(sc);
    if(c.r===1) t='S';
    t=lower(t,CAPT[Math.min(Math.max(+c.cap||1,1),5)]);
    if(p.s==='found') t=lower(t,'D');
    if(t==='F') t='E'; // F is kept for look-only, worked-out, false and built-over ground
    const top=c.w.find(x=>x[0]===1); if(top) w.unshift(top[1]);
    return {t,sc,w:w.join('; ')||'Not much is known yet'}; }
  function get(p){ const k=(typeof RKV!=='undefined'?RKV:0)+'|'+(p.ug?p.ug[0]:'-'); let c=p._tr; if(!c||c.k!==k){ try{ c=calc(p); }catch(e){ c={t:'E',sc:0,w:''}; OGE.err&&OGE.err('tier',e); } c.k=k; p._tr=c; } return c; }
  return {T,NAME,get,t:p=>get(p).t}; })();
