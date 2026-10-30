# Bird's-eye views, 1917 Blue Book routes, old DNR lake maps, flood zones, land cover (research/birdseye-routes-lakes/):
# adds nl.js as its own <script> at the end of the page (it wraps TIER, so it must run after the tier code) and copies nl/.
# usage: apply.py index.html nl-dir [--artifact]   (nl-dir = research/birdseye-routes-lakes/nl ; re-running swaps the block)
# --artifact: the be/ and lk/ pictures live in the artifact asset store (artifact-nl-assets.txt); card <img> tags are written
# as HTML, out of reach of the OGA shim, so the copies of be.json and lk.json get /_blob/ urls and the pictures are not copied.
import sys,os,json,shutil
f,src=sys.argv[1],sys.argv[2]; art='--artifact' in sys.argv; here=os.path.dirname(os.path.abspath(__file__))
js=open(os.path.join(here,'nl.js'),encoding='utf-8').read()
s=open(f,encoding='utf-8').read(); A='<script>\n// ---------- more old maps: bird'; B='// ---------- end more old maps\n</script>\n'
if A in s: i=s.index(A); j=s.index(B,i)+len(B); s=s[:i]+s[j:]
assert 'TIER' in s and 'SSORT=' in s
blk='<script>\n'+js.rstrip()+'\n'+B; k=s.rfind('</body>'); k=len(s) if k<0 else k
s=s[:k]+blk+s[k:]; open(f,'w',encoding='utf-8').write(s)
out=os.path.join(os.path.dirname(os.path.abspath(f)),'nl')
if os.path.isdir(out): shutil.rmtree(out)
if not art: shutil.copytree(src,out); print('ok app'); sys.exit()
M={p:'/_blob/'+i for p,i in (l.split() for l in open(os.path.join(here,'artifact-nl-assets.txt')) if l.strip())}
os.makedirs(out); shutil.copy(os.path.join(src,'bb.json'),out)
for d in ('fl','lc'): shutil.copytree(os.path.join(src,d),os.path.join(out,d))
miss=0
for n,ix in (('be.json',7),('lk.json',-1)):
    R=json.load(open(os.path.join(src,n),encoding='utf-8'))
    for r in R:
        if r[ix]:
            if r[ix] in M: r[ix]=M[r[ix]]
            else: r[ix]=''; miss+=1   # picture not uploaded: the card falls back to the library link / map PDF
    json.dump(R,open(os.path.join(out,n),'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
print('ok artifact, pictures not in the asset store:',miss)
