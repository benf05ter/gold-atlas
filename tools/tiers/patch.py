# Adds the S-F tier block (v197) to an Old Ground page (artifact or app index.html). Refuses to double-patch.
import sys, os
here=os.path.dirname(os.path.abspath(__file__))
f=sys.argv[1]; s=open(f,encoding='utf-8').read()
if '// ---------- Tiers (v197)' in s: sys.exit('already patched')
def rep(old,new,n=1):
    global s
    c=s.count(old)
    if c!=n: sys.exit(f'expected {n} of {old[:70]!r}, found {c}')
    s=s.replace(old,new)
# pins: tier colour and letter (Pin colors by tier switch)
rep("""  const ranked=typeof rk==='number'&&rk>=1&&rk<=5, fill=hollow?panel:ranked?cv(`var(--rk${rk})`):rk==='X'?cv('var(--L-restricted)'):base;""",
"""  const ranked=typeof rk==='number'&&rk>=1&&rk<=5, tr=typeof TIER==='object'&&TIER.col&&p.L!=='mine'?TIER.t(p):'', ink='#1a1a1a', fill=hollow?panel:tr?TIER.C[tr]:ranked?cv(`var(--rk${rk})`):rk==='X'?cv('var(--L-restricted)'):base;""")
rep("""c.lineWidth=sel?2.6:hollow?2:1.5; c.strokeStyle=sel?cv('var(--ink)'):hollow?base:panel; c.stroke();
  if(ranked&&!big) pcText(String(rk),x,y+r*0.42,r*1.2,panel);
  else ogGlyph(c,rk==='X'?'ban':ogGly(p.L),x,y,r,hollow?base:'#fff');
  if(ranked&&big){""",
"""c.lineWidth=sel?2.6:hollow?2:1.5; c.strokeStyle=sel?cv('var(--ink)'):hollow?(tr?TIER.C[tr]:base):tr?'rgba(0,0,0,.5)':panel; c.stroke();
  if(tr&&!big) pcText(tr,x,y+r*0.42,r*1.2,ink);
  else if(ranked&&!big&&!tr) pcText(String(rk),x,y+r*0.42,r*1.2,panel);
  else ogGlyph(c,rk==='X'?'ban':ogGly(p.L),x,y,r,tr?ink:hollow?base:'#fff');
  if(tr&&big){ const bx=x+r*0.78, by=y-r*0.78, br=r*0.55; c.beginPath(); c.arc(bx,by,br,0,6.2832); c.fillStyle=TIER.C[tr]; c.fill(); c.lineWidth=1.2; c.strokeStyle=ink; c.stroke(); pcText(tr,bx,by+br*0.42,br*1.25,ink); }
  else if(ranked&&big){""")
# grouped-pin bubbles: best tier letter in the corner
rep("""  if(best<=2){ const bx=x+r*0.8, by=y-r*0.8, br=Math.max(r*0.45,5);""",
"""  const bt=typeof TIER==='object'&&TIER.col?Math.min(...cl.m.map(p=>TIER.IDX[TIER.t(p)])):9;
  if(bt<=3){ const t=TIER.T[bt], bx=x+r*0.8, by=y-r*0.8, br=Math.max(r*0.45,5); c.beginPath(); c.arc(bx,by,br,0,6.2832); c.fillStyle=TIER.C[t]; c.fill(); c.lineWidth=1.4; c.strokeStyle='#1a1a1a'; c.stroke(); pcText(t,bx,by+br*0.4,br*1.15,'#1a1a1a'); }
  else if(bt===9&&best<=2){ const bx=x+r*0.8, by=y-r*0.8, br=Math.max(r*0.45,5);""")
# card title: tier badge in front of the rank badge
rep("""${RKP[rk]||''}</span>`);""","""${RKP[rk]||''}</span>`); if(typeof TIER==='object') h2.insertAdjacentHTML('afterbegin',TIER.badge(p));""")
# Spots list: tier letter instead of [rank], and the tier filter
rep("""${RK(p)?'['+RK(p)+'] ':''}""","""${typeof TIER==='object'?TIER.chip(p):RK(p)?'['+RK(p)+'] ':''}""",2)
rep("""&& p.mi<=dm && (!sv||p.stt===sv) &&""","""&& p.mi<=dm && (!sv||p.stt===sv) && (typeof TIER!=='object'||TIER.ok(p)) &&""")
rep("""const v=SSORT.run(k).filter(p=>p.mi<=dm&&""","""const v=SSORT.run(k).filter(p=>p.mi<=dm&&(typeof TIER!=='object'||TIER.ok(p))&&""")
blk=open(os.path.join(here,'tiercore.js')).read()+open(os.path.join(here,'tierui.js')).read()
i=s.rstrip().rfind('</body>')
s=s[:i]+'<script>\n'+blk+'</script>\n'+s[i:]
open(f,'w',encoding='utf-8').write(s)
print('patched',f)
