# Artifact only: big, rarely shown layer files (plat books, 1:250,000 sheets, 1800s maps, ...) live in the artifact's
# asset store (1 GiB, outside the 256 MB version cap) instead of the published files. They still load only when their
# layer is shown: the page asks for the usual path ('om13/plat_x.webp') and this shim swaps in the asset URL.
# To move another layer: upload its files (Artifact publish, asset: true), add "path id" lines to tools/artifact-assets.txt,
# rerun this on the artifact's index.html, and publish with those paths set to null.
# usage: artifact_assets.py index.html [assets.txt]   -> prints the published paths now served from assets
import sys,json,os
f=sys.argv[1]; t=sys.argv[2] if len(sys.argv)>2 else os.path.join(os.path.dirname(__file__),'artifact-assets.txt')
M={p:'/_blob/'+i for p,i in (l.split() for l in open(t) if l.strip() and not l.startswith('#'))}
A,B='/* OGA-ASSETS */','/* /OGA-ASSETS */'
js=(A+" var OGA="+json.dumps(M,separators=(',',':'))+";\n(()=>{ const sa=Element.prototype.setAttribute; Element.prototype.setAttribute=function(n,v){ if((n==='href'||n==='src')&&typeof v==='string'&&OGA[v]) v=OGA[v]; return sa.call(this,n,v); };\n"
    "  const f0=window.fetch; window.fetch=function(u,o){ if(typeof u==='string'&&OGA[u]) u=OGA[u]; return f0.call(this,u,o); }; })(); "+B+"\n")
s=open(f).read()
if A in s: i=s.index(A); j=s.index(B)+len(B)+1; s=s[:i]+js+s[j:]
else: i=s.index('<script>')+len('<script>'); s=s[:i]+'\n'+js+s[i:]
open(f,'w').write(s); print('\n'.join(M))
