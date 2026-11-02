# Story timeline per treasure pin (v520). Usage: python3 -I patch.py <atlas-dir> tln.json [data-file]
# Writes TLN into the data file (default og-data.js; the Claude atlas copy puts new data in og-data2.js) and replaces an earlier
# TLN block, then adds timeline.js as the last script of index.html (replaced on a re-run). Restamp sw.js VERSION afterwards.
import sys, json, os, re
d, src = sys.argv[1], sys.argv[2]; df = sys.argv[3] if len(sys.argv) > 3 else 'og-data.js'
T = json.load(open(src, encoding='utf-8'))
blk = ('// STORY TIMELINE (v520): per treasure pin, [date, event, source, inferred?] from tools/timeline; read by the card box\n'
       'const TLN=' + json.dumps(T, ensure_ascii=False, separators=(',', ':')) + ';\n// /TLN\n')
f = os.path.join(d, df); s = open(f, encoding='utf-8').read()
if 'const TLN=' in s: s = re.sub(r'// STORY TIMELINE \(v520\).*?// /TLN\n', lambda m: blk, s, flags=re.S)
else: s = s.rstrip('\n') + '\n' + blk
open(f, 'w', encoding='utf-8').write(s)
f = os.path.join(d, 'index.html'); s = open(f, encoding='utf-8').read()
js = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'timeline.js'), encoding='utf-8').read()
mark = '// ---------- Story timeline (v520)'
if mark in s: s = re.sub(r'<script>\n// ---------- Story timeline \(v520\).*?</script>\n', lambda m: '<script>\n' + js + '</script>\n', s, flags=re.S)
else: i = s.rindex('</body>'); s = s[:i] + '<script>\n' + js + '</script>\n' + s[i:]
open(f, 'w', encoding='utf-8').write(s)
print('TLN pins', len(T), 'entries', sum(map(len, T.values())), df, '+%d KB' % (len(blk.encode()) // 1024))
