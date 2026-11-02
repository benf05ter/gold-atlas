#!/usr/bin/env python3
"""Polish pass 1 (Nov 2 2026): small phone fixes. Usage: python3 -I tools/polish/patch.py <index.html> [out]
Idempotent: refuses to run twice (marker POLISH1). Works on the app index.html and the Claude atlas HTML."""
import sys
src = sys.argv[1]; out = sys.argv[2] if len(sys.argv) > 2 else src
s = open(src, encoding='utf-8').read()
if 'POLISH1' in s:
    sys.exit('already has POLISH1')

def rep(old, new):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f'expected 1 match, found {n}: {old[:70]}')
    s = s.replace(old, new)

# 1. Drive mode: the "flatten 3D when zoomed out" hook turned Drive mode's 3D off straight after Start, so the map
#    never followed you and the car arrow never showed (unless you were already zoomed in). Leave 3D alone while driving.
rep("OGE.on('post',()=>{ if(T3.on&&!GES.active&&vb.w>1) T3.set(false); });",
    "OGE.on('post',()=>{ if(T3.on&&!GES.active&&vb.w>1&&!(window.DRV&&DRV.on)) T3.set(false); });")

# 2. Drive cards: the tier letter (S-F, tier colour) in front of the distance, matching the yellow "S tier spot ahead" alert.
rep('<span class="drvm">${dtxt(o.d)} · ${wy} · ${RKP[o.r]}</span>',
    '<span class="drvm">${typeof TIER===\'object\'?TIER.badge(q)+\' \':\'\'}${dtxt(o.d)} · ${wy} · ${RKP[o.r]}</span>')

BLOCK = r'''<style id="POLISH1">
/* spot card peek: a shorter photo so the name, tier and tagline show without dragging the card up */
body.shell .shsheet[data-state="peek"] .oghero{aspect-ratio:auto;height:min(100px,15vh)}
/* search results sit over the zoom and layer buttons instead of under them */
.mapwrap .uxs:has(#uxr:not([hidden])){z-index:7}
/* Drive mode: the tier pill reads at dash distance */
.drvm .tierb{font-size:13px;padding:1px 7px;vertical-align:1px}
/* map credits don't show through the drive panel */
body.drv .ogattr{display:none}
</style>
<script>
/* POLISH1: Historic walks tile on More gets the same picture banner as the other tiles (it was added after they were drawn) */
{ const b=document.querySelector('#rv-more .shlist button[data-wk]'), s=b&&b.querySelector(':scope>svg');
  if(b&&s&&!b.querySelector('.vpic')){ const c='#2f6a87';
    const pic=document.createElement('span'); pic.className='vpic';
    pic.setAttribute('style',`background:url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="160" height="80" fill="none" stroke="#fff" stroke-opacity=".17" stroke-width="1.4"><path d="M-10 60c30-20 50 10 80-8s50-30 100-10"/><path d="M-10 44c30-18 52 8 82-10s52-26 98-8"/><path d="M-10 28c32-16 54 6 84-12s50-22 96-6"/><path d="M-10 74c28-14 48 12 78-4s54-28 102-12"/></svg>')}") center/160px 80px,linear-gradient(135deg,${c},color-mix(in srgb,${c} 68%,#000))`);
    s.querySelectorAll('[stroke="var(--walk)"]').forEach(e=>e.setAttribute('stroke','#fff')); s.setAttribute('stroke','#fff');
    s.querySelectorAll('[fill="var(--walk)"]').forEach(e=>e.setAttribute('fill','#fff'));
    b.prepend(pic); pic.appendChild(s); } }
</script>
'''
i = s.rfind('</body>')
if i < 0: sys.exit('no </body>')
s = s[:i] + BLOCK + s[i:]
open(out, 'w', encoding='utf-8').write(s)
print('POLISH1 applied ->', out)
