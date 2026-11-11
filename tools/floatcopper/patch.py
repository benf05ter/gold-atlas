# Float copper section (fc1). Usage: python3 -I tools/floatcopper/patch.py <atlas-dir>
# Adds floatcopper.js as a script before </body> of index.html (replaced on a re-run) and puts the new zone layer in the
# "Copper and Superior" layer preset. Restamp sw.js VERSION afterwards. New float copper pins go in with tools/batch225/apply.py.
import sys, os, re
d = sys.argv[1]; f = os.path.join(d, 'index.html'); s = open(f, encoding='utf-8').read()
js = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'floatcopper.js'), encoding='utf-8').read()
MK = '// ---------- Float copper: where it might be (fc1)'
blk = '<script>\n' + js + '</script>\n'
if MK in s: s = re.sub(r'<script>\n// ---------- Float copper: where it might be \(fc1\).*?</script>\n', lambda m: blk, s, flags=re.S)
else: i = s.rindex('</body>'); s = s[:i] + blk + s[i:]
a = "set(['copper','superior','cmine','prehist','_belt','restricted'])"
if a in s: s = s.replace(a, "set(['_cufloat','copper','superior','cmine','prehist','_belt','restricted'])")
b = "walks:'Historic walks, spots and landmarks'};"
if b in s: s = s.replace(b, "walks:'Historic walks, spots and landmarks',copper:'Graded float copper ground and record finds'};")
open(f, 'w', encoding='utf-8').write(s)
print('float copper script', len(js), 'chars')
