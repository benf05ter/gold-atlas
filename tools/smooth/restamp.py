# Restamp the app's sw.js VERSION the way build.py does (sha256 of every file in the site folder except sw.js, first 12 hex),
# for patches applied in place without a full rebuild. Usage: python3 -I tools/smooth/restamp.py
import os, re, hashlib
root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
out = os.path.join(root, open(os.path.join(root, 'tools', 'site-folder.txt')).read().strip())
h = hashlib.sha256()
for d, _, fs in sorted(os.walk(out)):
    for f in sorted(fs):
        if f != 'sw.js': h.update(open(os.path.join(d, f), 'rb').read())
ver = h.hexdigest()[:12]; sw = os.path.join(out, 'sw.js'); t = open(sw).read()
t2 = re.sub(r"const VERSION='[0-9a-f]+'", f"const VERSION='{ver}'", t, count=1); assert t2 != t or ver in t
open(sw, 'w').write(t2); print('version', ver)
