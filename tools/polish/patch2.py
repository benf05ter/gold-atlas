#!/usr/bin/env python3
"""Polish pass 2 (Nov 2 2026): list speed, first-card warm-up, tier + tagline on search results.
Usage: python3 -I tools/polish/patch2.py <index.html> [out]. Idempotent (marker POLISH2); needs POLISH1 and the taglines block (OGTG)."""
import sys
src = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else src
s = open(src, encoding='utf-8').read()
if 'POLISH2' in s: sys.exit('already has POLISH2')
if 'POLISH1' not in s: sys.exit('apply tools/polish/patch.py first')
BLOCK = r'''<style id="POLISH2">
/* long lists (Best ground has ~1,100 rows open): rows off screen skip layout and paint until scrolled to. Best ground tab: layout 880 -> 124 ms at phone speed */
button.item{content-visibility:auto;contain-intrinsic-size:auto 76px}
/* search results: tier letter and tagline like the other lists */
.uxr .tierb{margin-right:5px}
.uxr .tgrow{font-size:12.5px}
</style>
<script>
/* POLISH2 */
// search results get the S-F tier letter (tier colour) and the pin's tagline, like every other list
{ const r=document.getElementById('uxr');
  if(r) new MutationObserver(()=>{ try{ for(const b of r.querySelectorAll('button[data-i]:not([data-pt])')){ b.setAttribute('data-pt','1'); const x=uxRes[+b.dataset.i]; if(!x||x.k!=='spot') continue; const p=x.p, t=b.querySelector('b'); if(!t) continue;
      if(typeof TIER==='object'&&TIER.chip&&p.L!=='inf'&&!t.querySelector('.tierb')) t.insertAdjacentHTML('afterbegin',TIER.chip(p));
      const h=window.OGTG&&OGTG.html(p,'m tgrow'); if(h) t.insertAdjacentHTML('afterend','<br>'+h); } }catch(e){ OGE.err&&OGE.err('search tiers',e); } }).observe(r,{childList:true}); }
// warm up the "sources that agree" index a few seconds after start, so the first spot card opens faster (~200 ms at phone speed)
setTimeout(()=>{ const go=()=>{ try{ if(window.VFA&&PTS.length) VFA.agree(PTS.find(p=>p.L==='history')||PTS[0]); }catch(_){} };
  if('requestIdleCallback' in window) requestIdleCallback(go,{timeout:4000}); else go(); },6000);
</script>
'''
i = s.rfind('</body>')
if i < 0: sys.exit('no </body>')
s = s[:i] + BLOCK + s[i:]
open(out, 'w', encoding='utf-8').write(s)
print('POLISH2 applied ->', out)
