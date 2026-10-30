# 1950s-60s air photo check (v227): puts tools/air50/a50.js at the end of the page (it wraps select like le.js). Copy the
# thread's air50.json and img/*.webp to <page>/a50/ (img paths in air50.json are "a50/<id>.webp"). usage: page.py index.html
import sys,os
f=sys.argv[1]; s=open(f,encoding='utf-8').read(); js=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'a50.js'),encoding='utf-8').read()
assert '1950s-60s air photo check: one' not in s,'already in'; i=s.rstrip().rfind('</body></html>'); assert i>0
open(f,'w',encoding='utf-8').write(s[:i]+'<script>\n'+js+'\n</script>\n</body></html>\n'); print('ok')
