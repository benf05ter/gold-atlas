# OGSMOOTH2 (Nov 18 2026, v303r): optimization pass. Usage: python3 -I tools/smooth/patch2.py <atlas-dir>
# 1. Best ground tab: the two long lists (rank 2, ~1,100 rows; rank 3, ~9,300 rows) are drawn 60 rows at a time as you scroll,
#    instead of all at once (rank 2 was 15,500 hidden elements built at start-up; opening rank 3 added ~130,000 in one 2.4 s freeze).
#    Every row is still there: keep scrolling and the next rows appear. Taps go through one handler on each list.
# 2. Gold-trap cards: the stream count and upstream-sources line no longer break on a pin without srank/srcs.
# 3. Rank and tier caches compare the cached version and ground grade directly instead of building a key string on every call.
# Safe to re-run (marker OGSMOOTH2). Restamp sw.js VERSION afterwards (tools/smooth/restamp.py).
import sys, os
d = sys.argv[1]; f = os.path.join(d, 'index.html'); s = open(f, encoding='utf-8').read()
if 'OGSMOOTH2' in s: print('already patched'); sys.exit(0)
def rep(old, new, n=1):
    global s
    assert s.count(old) == n, (s.count(old), old[:90]); s = s.replace(old, new)

# 1. chunked Best ground lists
rep("""document.getElementById('pane-ug').insertAdjacentHTML('beforeend',`<details open><summary class="sec" style="cursor:pointer"><b>Good ground: likely undisturbed (${g2.length})</b></summary><div>${g2.map(row).join('')}</div></details><details id="ugR3"><summary class="sec" style="cursor:pointer"><b>Some old ground: patches survive (${g3.length}), tap to show</b></summary><div id="ugR3list"></div></details>`);
  document.getElementById('ugR3').addEventListener('toggle',e=>{ const d=document.getElementById('ugR3list'); if(e.target.open&&!d.innerHTML) { d.innerHTML=g3.map(row).join(''); d.querySelectorAll('.item').forEach(b=>b.onclick=()=>select(b.dataset.id,true)); } });
document.querySelectorAll('#pane-ug .pick, #pane-ug .item').forEach(b=>b.onclick=()=>select(b.dataset.id,true)); });""",
"""document.getElementById('pane-ug').insertAdjacentHTML('beforeend',`<details open><summary class="sec" style="cursor:pointer"><b>Good ground: likely undisturbed (${g2.length})</b></summary><div id="ugR2list"></div></details><details id="ugR3"><summary class="sec" style="cursor:pointer"><b>Some old ground: patches survive (${g3.length}), tap to show</b></summary><div id="ugR3list"></div></details>`);
  /*OGSMOOTH2: long lists are drawn 60 rows at a time as you scroll; a tap anywhere on a row opens it*/
  const ugFill=(box,arr)=>{ let n=0; const sen=document.createElement('p'); sen.className='note ugmore';
    const more=()=>{ if(n>=arr.length) return; const k=Math.min(arr.length,n+(n?150:60)); sen.remove(); box.insertAdjacentHTML('beforeend',arr.slice(n,k).map(row).join('')); n=k;
      if(n<arr.length){ sen.textContent=`Showing ${n} of ${arr.length}. Scroll for more.`; box.appendChild(sen); } };
    box.addEventListener('click',e=>{ if(e.target.closest('.ugmore')){ more(); return; } const b=e.target.closest('.item[data-id]'); if(b) select(b.dataset.id,true); });
    more(); if('IntersectionObserver' in window) new IntersectionObserver(es=>{ for(const x of es) if(x.isIntersecting) more(); },{rootMargin:'0px 0px 900px 0px'}).observe(sen); };
  ugFill(document.getElementById('ugR2list'),g2);
  document.getElementById('ugR3').addEventListener('toggle',e=>{ const d=document.getElementById('ugR3list'); if(e.target.open&&!d.dataset.f){ d.dataset.f='1'; ugFill(d,g3); } });
document.querySelectorAll('#pane-ug .pick').forEach(b=>b.onclick=()=>select(b.dataset.id,true)); });""")

# 2. gold-trap card
rep("Rank ${p.srank} of ${Math.max(...PTS.filter(x=>x.L==='trap'&&x.stt===p.stt).map(x=>x.srank))} gold streams in ${STN[p.stt]}",
    "Rank ${p.srank} of ${Math.max(...PTS.filter(x=>x.L==='trap'&&x.stt===p.stt).map(x=>x.srank).filter(Number.isFinite))} gold streams in ${STN[p.stt]}")
rep("<dt>Gold sources upstream</dt><dd>${esc(p.srcs.join(', '))}</dd>", "<dt>Gold sources upstream</dt><dd>${esc((p.srcs||[]).join(', '))}</dd>")

# 3. cache checks without a key string per call
rep("function RKX(p){ const k=RKV+'|'+(p.ug?p.ug[0]:'-'); let c=p._rk; if(!c||c.k!==k){ c=rkCalc(p); c.k=k; p._rk=c; } return c; }",
    "function RKX(p){ const u=p.ug?p.ug[0]:'-'; let c=p._rk; if(!c||c._v!==RKV||c._u!==u){ c=rkCalc(p); c.k=RKV+'|'+u; c._v=RKV; c._u=u; p._rk=c; } return c; }")
rep("function get(p){ const k=(typeof RKV!=='undefined'?RKV:0)+'|'+(p.ug?p.ug[0]:'-'); let c=p._tr; if(!c||c.k!==k){ try{ c=calc(p); }catch(e){ c={t:'E',sc:0,w:''}; OGE.err&&OGE.err('tier',e); } c.k=k; p._tr=c; } return c; }",
    "function get(p){ const v=typeof RKV!=='undefined'?RKV:0, u=p.ug?p.ug[0]:'-'; let c=p._tr; if(!c||c._v!==v||c._u!==u){ try{ c=calc(p); }catch(e){ c={t:'E',sc:0,w:''}; OGE.err&&OGE.err('tier',e); } c.k=v+'|'+u; c._v=v; c._u=u; p._tr=c; } return c; }")
s = s.replace('</head>', '<!--OGSMOOTH2--></head>', 1)
open(f, 'w', encoding='utf-8').write(s); print('patched')
