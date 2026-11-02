# Builds the WL data block (one JS block, appended to og-data.js in the app and og-data2.js in the artifact).
# Usage: python3 -I build_wl.py out.js
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from wl_entries import WL, NOTE
D = {}
for k, v in WL.items():
    D[k] = {'s': v['s']}
    if v.get('n'): D[k]['n'] = v['n']
for k, n in NOTE.items():
    assert k not in D, k
    D[k] = {'s': [], 'n': n}
js = ('\n// Where to look, ranked (Nov 2026): micro-spot model for B/C/D cache pins. Spots hang only on a documented feature; '
      'inferred spots say so. Source: research/where-to-look/ in the repo.\n'
      'const WL=' + json.dumps(D, ensure_ascii=False, separators=(',', ':')) + ';\n'
      "function wlHTML(p){ const w=WL[p.id]; if(!w) return ''; const C={H:'High',M:'Medium',L:'Low'}, B={rec:'from the record',map:'from a map or air photo',inf:'inferred'};\n"
      "  const li=w.s.map(s=>`<li><b>${esc(s[0])}</b>: ${esc(s[1])} <span class=\"hint\">(${C[s[2]]}, ${B[s[3]]})</span></li>`).join('');\n"
      "  return `<div class=\"tips wl\"><b>Where to look, ranked</b>${li?`<ol style=\"margin:4px 0 0;padding-left:20px\">${li}</ol>`:''}${w.n?`<p style=\"margin:4px 0 0\">${li?'':'Not ranked yet: '}${esc(w.n)}</p>`:''}`+\n"
      "   (li?`<p class=\"hint\" style=\"margin:4px 0 0\">High: the record names the spot. Medium: a documented feature plus a habit seen in this atlas's solved hoards (about 10 in outbuildings, 10 inside a building, 7 in the yard within 30 m, 6 at a marker tree or stump). Low: weaker link.</p>`:'')+`</div>`; }\n")
open(sys.argv[1], 'w').write(js)
print(len(D), 'pins,', sum(len(v['s']) for v in D.values()), 'spots,', len(js), 'bytes')
