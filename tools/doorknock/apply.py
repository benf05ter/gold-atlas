# Door-knock kit (research/door-knock/): adds dk.js as its own <script> at the end of the page, after the public-land section
# (pl.js) and the smart sorts (SSORT), both of which it hooks. usage: apply.py index.html [dk.js] ; re-running swaps the block.
import sys,os
f=sys.argv[1]; js=open(sys.argv[2] if len(sys.argv)>2 else os.path.join(os.path.dirname(os.path.abspath(__file__)),'dk.js'),encoding='utf-8').read()
s=open(f,encoding='utf-8').read(); A='<script>\n// ---------- door-knock kit'; B='// ---------- end door-knock kit\n</script>\n'
if A in s: i=s.index(A); j=s.index('</script>',i)+len('</script>\n'); s=s[:i]+s[j:]
assert 'SSORT=' in s and 'plLookup' in s
blk='<script>\n'+js.rstrip()+'\n'+B; k=s.rfind('</body>'); k=len(s) if k<0 else k
s=s[:k]+blk+s[k:]; open(f,'w',encoding='utf-8').write(s); print('ok')
