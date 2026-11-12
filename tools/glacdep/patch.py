# Glacial deposits of Wisconsin (gd1). Usage: python3 -I tools/glacdep/patch.py <atlas-dir>
# Copies glacdep.webp to og/, fills glacdep.js with the tap grid from glacgrid.json and adds it as a script before </body> of index.html
# (replaced on a re-run), and lists og/glacdep.webp in the offline cache (tools/sw.js template and the live sw.js). Restamp sw.js VERSION afterwards.
import sys, os, re, json, shutil
d = sys.argv[1]; T = os.path.dirname(os.path.abspath(__file__)); f = os.path.join(d, 'index.html'); s = open(f, encoding='utf-8').read()
g = json.load(open(os.path.join(T, 'glacgrid.json')))
js = open(os.path.join(T, 'glacdep.js'), encoding='utf-8').read()
for k, v in {'__W__': g['w'], '__H__': g['h'], '__LON0__': g['lon0'], '__LAT1__': g['lat1'], '__DLAT__': g['dlat'], '__DLON__': round(g['dlon'], 9), '__RLE__': g['rle']}.items():
    assert k in js, k; js = js.replace(k, str(v))
shutil.copyfile(os.path.join(T, 'glacdep.webp'), os.path.join(d, 'og', 'glacdep.webp'))
MK = '// ---------- Glacial deposits of Wisconsin (gd1)'
blk = '<script>\n' + js + '</script>\n'
if MK in s: s = re.sub(r'<script>\n// ---------- Glacial deposits of Wisconsin \(gd1\).*?</script>\n', lambda m: blk, s, flags=re.S)
else: i = s.rindex('</body>'); s = s[:i] + blk + s[i:]
open(f, 'w', encoding='utf-8').write(s)
for sw in (os.path.join(T, '..', 'sw.js'), os.path.join(d, 'sw.js')):
    t = open(sw).read()
    if "'og/glacdep.webp'" not in t:
        assert t.count("const EXTRA=['og/mag.webp','og/prosp.png']") == 1
        t = t.replace("const EXTRA=['og/mag.webp','og/prosp.png']", "const EXTRA=['og/mag.webp','og/prosp.png','og/glacdep.webp']"); open(sw, 'w').write(t)
print('glacdep script', len(js), 'chars')
