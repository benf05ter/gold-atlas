# Pin taglines (tg1). Usage: python3 -I patch.py <atlas-dir> tags.json [data-file]
# Writes TAG into the data file (default og-data.js; the Claude atlas copy puts new data in og-data2.js), replacing an earlier TAG block,
# then adds tagline.js as the last script of index.html (replaced on a re-run). Restamp sw.js VERSION afterwards; re-run tools/perf/dclindex.py.
import sys, json, os, re
d, src = sys.argv[1], sys.argv[2]; df = sys.argv[3] if len(sys.argv) > 3 else 'og-data.js'
T = json.load(open(src, encoding='utf-8'))
blk = ('// PIN TAGLINES (tg1): per pin [tagline, status f/p/u/k/h/""] from tools/taglines; read by tagline.js\n'
       'const TAG=' + json.dumps(T, ensure_ascii=False, separators=(',', ':')) + ';\n// /TAG\n')
f = os.path.join(d, df); s = open(f, encoding='utf-8').read()
if 'const TAG=' in s: s = re.sub(r'// PIN TAGLINES \(tg1\).*?// /TAG\n', lambda m: blk, s, flags=re.S)
else: s = s.rstrip('\n') + '\n' + blk
open(f, 'w', encoding='utf-8').write(s)
f = os.path.join(d, 'index.html'); s = open(f, encoding='utf-8').read()
js = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tagline.js'), encoding='utf-8').read()
if '// ---------- Pin taglines (tg1)' in s: s = re.sub(r'<script>\n// ---------- Pin taglines \(tg1\).*?</script>\n', lambda m: '<script>\n' + js + '</script>\n', s, flags=re.S)
else: i = s.rindex('</body>'); s = s[:i] + '<script>\n' + js + '</script>\n' + s[i:]
open(f, 'w', encoding='utf-8').write(s)
print('TAG pins', len(T), df, '+%d KB' % (len(blk.encode()) // 1024))
