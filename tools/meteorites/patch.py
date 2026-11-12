# Meteorites section (mt1). Usage: python3 -I tools/meteorites/patch.py <atlas-dir>
# Adds meteorites.js as a script before </body> of index.html (replaced on a re-run), the Meteorites pin layer to the LAYERS list,
# its short name, colour, smart-sort exclusion and the mode-menu line. Restamp sw.js VERSION afterwards.
# New meteorite pins go in with tools/batch225/apply.py (spec-v303p.json, built by build_spec.py).
import sys, os, re
d = sys.argv[1]; f = os.path.join(d, 'index.html'); s = open(f, encoding='utf-8').read()
js = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'meteorites.js'), encoding='utf-8').read()
MK = '// ---------- Meteorites: where they fell (mt1)'
blk = '<script>\n' + js + '</script>\n'
if MK in s: s = re.sub(r'<script>\n// ---------- Meteorites: where they fell \(mt1\).*?</script>\n', lambda m: blk, s, flags=re.S)
else: i = s.rindex('</body>'); s = s[:i] + blk + s[i:]
def once(a, b, tag):
    global s
    if tag in s: return
    assert s.count(a) == 1, a[:60]
    s = s.replace(a, b)
# the pin layer, its own section after Copper and Lake Superior
a = "  {sec:'Copper and Lake Superior', id:'cmine',"
i = s.index(a); j = s.index('\n', i) + 1
lay = "  {sec:'Meteorites', id:'meteor', n:'Meteorite falls and finds', d:'Every recorded meteorite in the five states from the Meteoritical Bulletin, graded by the odds of finding more there', on:false},\n"
if "id:'meteor'," not in s: s = s[:j] + lay + s[j:]
once("copper:'Float copper',", "copper:'Float copper',meteor:'Meteorite',", "meteor:'Meteorite',")
once(":root{--L-park:#2e8b47;", ":root{--L-meteor:#4b4a8f;--L-park:#2e8b47;", "--L-meteor:#4b4a8f")
once("@media (prefers-color-scheme:dark){:root:not([data-theme=\"light\"]){--L-park:#6fd38a;", "@media (prefers-color-scheme:dark){:root:not([data-theme=\"light\"]){--L-meteor:#a9a8f0;--L-park:#6fd38a;", ":root:not([data-theme=\"light\"]){--L-meteor")
once(":root[data-theme=\"dark\"]{--L-park:#6fd38a;", ":root[data-theme=\"dark\"]{--L-meteor:#a9a8f0;--L-park:#6fd38a;", ":root[data-theme=\"dark\"]{--L-meteor")
once("'rock','prehist','landmark','wreck']);", "'rock','prehist','landmark','wreck','meteor']);", "'wreck','meteor']);")
once("copper:'Graded float copper ground and record finds'};", "copper:'Graded float copper ground and record finds',meteor:'Graded strewn fields, every recorded meteorite, how to tell one'};", "meteor:'Graded strewn fields")
open(f, 'w', encoding='utf-8').write(s)
print('meteorites script', len(js), 'chars')
