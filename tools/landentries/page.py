# Adds le.js at the end of the page (it wraps select, after nl.js). usage: page.py index.html ; re-running swaps the block.
import sys,os
f=sys.argv[1]; js=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'le.js'),encoding='utf-8').read()
s=open(f,encoding='utf-8').read(); A='<script>\n// ---------- first land entries'; B='// ---------- end first land entries\n</script>\n'
if A in s: i=s.index(A); j=s.index(B,i)+len(B); s=s[:i]+s[j:]
k=s.rfind('</body>'); s=s[:k]+'<script>\n'+js.rstrip()+'\n</script>\n'+s[k:]; open(f,'w',encoding='utf-8').write(s); print('ok')
