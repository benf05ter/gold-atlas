# Refreshes the rock, mineral and metal ID module inside the current build, without a full rebuild from the atlas.
#   python3 tools/patch_rockid.py
# Swaps in tools/rockid.css and tools/rockid.js, then restamps sw.js so phones fetch the new version.
# (A full rebuild with build.py injects the same two files.)
import os, re, hashlib
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); T = os.path.join(root, 'tools')
out = os.path.join(root, open(os.path.join(T, 'site-folder.txt')).read().strip()); f = os.path.join(out, 'index.html')
c = open(f, encoding='utf-8').read()
css = open(os.path.join(T, 'rockid.css'), encoding='utf-8').read(); js = open(os.path.join(T, 'rockid.js'), encoding='utf-8').read()

def swap(c, start, end, new, anchor_fn):
    i = c.find(start)
    if i < 0: return anchor_fn(c, new)
    j = c.index(end, i) + len(end)
    while c[j:j+1] == '\n': j += 1
    return c[:i] + new + c[j:]

c = swap(c, '<style>\n/* rock, mineral and metal ID', '</style>', css,
         lambda c, n: c.replace('<div class="app">', n + '<div class="app">', 1))
c = swap(c, '<script>\n// ---------- rock, mineral and metal ID', '</script>', js,
         lambda c, n: c[:c.rindex('</script>') + 9] + n + c[c.rindex('</script>') + 9:])
assert c.count('/* rock, mineral and metal ID') == 1 and c.count('// ---------- rock, mineral and metal ID') == 1
open(f, 'w', encoding='utf-8').write(c)

sw = open(os.path.join(out, 'sw.js')).read(); sat = re.search(r"\.concat\((\[.*?\])\);", sw).group(1)
h = hashlib.sha256()
for d, _, fs in sorted(os.walk(out)):
    for x in sorted(fs):
        if x != 'sw.js': h.update(open(os.path.join(d, x), 'rb').read())
ver = h.hexdigest()[:12]
open(os.path.join(out, 'sw.js'), 'w').write(open(os.path.join(T, 'sw.js')).read().replace('__VERSION__', ver).replace('__SAT__', sat))
print('patched', f, 'version', ver)
