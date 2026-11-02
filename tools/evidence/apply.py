# Insert the evidence badge + Dowsing-free block (evb.js) into an Old Ground page (app index.html or the artifact page).
# Usage: python3 -I tools/evidence/apply.py <page.html>   (refuses to patch twice)
import sys,os
p=sys.argv[1]; s=open(p,encoding='utf-8').read(); e=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'evb.js'),encoding='utf-8').read()
if 'Evidence badge and Dowsing-free' in s: sys.exit('already patched')
a='<script>\n// TOV (v283v)'
if s.count(a)!=1: sys.exit('anchor not found once')
open(p,'w',encoding='utf-8').write(s.replace(a,e+a)); print('patched',p)
