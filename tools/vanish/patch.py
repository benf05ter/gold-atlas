# Vanished features + agreement heat map (v210). Usage: python3 patch.py <atlas-dir> vf.json
# Writes VF into og-data.js (replaces an earlier VF block) and adds vanish.js as the last script of index.html (once).
import sys, json, os, re
d, vf = sys.argv[1], sys.argv[2]
V = json.load(open(vf))
V = {k: v for k, v in V.items() if v.count('|') >= 1}
blk = ('// VANISHED FEATURES (v210): dated witnesses per spot from tools/vanish (research/vanish/vf.py); read by the "When it went" card box and the agreement heat map\n'
       'const VF=' + json.dumps(V, separators=(',', ':')) + ';\n// /VF\n')
f = os.path.join(d, 'og-data.js'); s = open(f, encoding='utf-8').read()
if 'const VF=' in s: s = re.sub(r'// VANISHED FEATURES \(v210\).*?// /VF\n', lambda m: blk, s, flags=re.S)
else: s = s.rstrip('\n') + '\n' + blk
open(f, 'w', encoding='utf-8').write(s)
f = os.path.join(d, 'index.html'); s = open(f, encoding='utf-8').read()
js = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'vanish.js'), encoding='utf-8').read()
if '// ---------- Vanished features and where the sources agree' in s:
    s = re.sub(r'<script>\n// ---------- Vanished features and where the sources agree.*?</script>\n', lambda m: '<script>\n' + js + '</script>\n', s, flags=re.S)
else:
    i = s.rindex('</body>'); s = s[:i] + '<script>\n' + js + '</script>\n' + s[i:]
open(f, 'w', encoding='utf-8').write(s)
print('VF rows', len(V), 'og-data.js +%d KB' % (len(blk) // 1024))
