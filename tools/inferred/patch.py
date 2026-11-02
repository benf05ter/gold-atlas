# usage: python3 -I tools/inferred/patch.py <atlas index.html>  (inserts inferred.js before </body>; refuses a rerun)
import sys,os
f=sys.argv[1]; s=open(f,encoding='utf-8').read(); M='// Hunches (v1, 2026-11-02)'
assert M not in s,'already patched'
js=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'inferred.js'),encoding='utf-8').read()
i=s.rindex('</body>'); s=s[:i]+'<script>\n'+js+'</script>\n'+s[i:]
open(f,'w',encoding='utf-8').write(s); print('patched',f)
