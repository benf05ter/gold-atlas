#!/usr/bin/env python3
"""Old Ground v120 rebuild: re-assembles the atlas on the new map engine.
   python3 rebuild.py <atlas-v117.html> <outdir>
Writes <outdir>/index.html, <outdir>/og-data.js and <outdir>/og/{mag.webp,prosp.png}. Side files (img/, pk/, om/, oldmap/, sat/) are unchanged.
Every edit below names the section it touches and asserts that its anchor is found exactly once, so a changed input fails loudly."""
import re,sys,os,base64,json
src,out=sys.argv[1],sys.argv[2]; here=os.path.dirname(os.path.abspath(__file__))
s=open(src,encoding='utf-8').read()
os.makedirs(out+'/og',exist_ok=True)
VER=120

# ---------- split ----------
m=re.search(r'<script>\nconst BASE = \{',s); a=m.start()
head=s[:a]                                   # html + css up to the main script
b=s.index('</script>',a)+len('</script>')
main=s[a+len('<script>\n'):b-len('</script>')]
rest=s[b:]                                   # appended feature scripts + </body>
tail_scripts=[(mm.group(1),mm.group(2)) for mm in re.finditer(r'<script([^>]*)>(.*?)</script>',rest,re.S)]
tail_end=rest[rest.rindex('</script>')+len('</script>'):]
assert tail_end.strip()=='</body></html>', tail_end[:100]
styles_in_rest=re.findall(r'<style[^>]*>.*?</style>',rest,re.S)   # feature CSS that sat between the appended scripts
marks=[(mm.start(),mm.group(0)) for mm in re.finditer(r'\n// -{6,}[^\n]*',main)]
cuts=[0]+[p for p,_ in marks]+[len(main)]
secs=[main[cuts[i]:cuts[i+1]] for i in range(len(cuts)-1)]
def title(x): mm=re.search(r'// -{6,} ?([^\n]*)',x); return (mm.group(1) if mm else 'data')[:60]
print(len(secs),'sections;',len(tail_scripts),'appended scripts')

def find(i,pat,flags=0,n=1,label=''):
  ms=list(re.finditer(pat,secs[i],flags)); assert len(ms)==n, f'section {i} ({title(secs[i])}): {label or pat[:60]!r} found {len(ms)}x, want {n}'; return ms
def cut(i,pat,flags=0,repl='',label=''):
  find(i,pat,flags,1,label); secs[i]=re.sub(pat,lambda _:repl,secs[i],count=1,flags=flags)
def sec_index(word):
  ix=[i for i,x in enumerate(secs) if word in title(x)]; assert len(ix)==1,(word,ix); return ix[0]

# ---------- data out to og-data.js ----------
data=[]
def pull_data(i):
  keep=[]
  for ln in secs[i].split('\n'):
    if len(ln)>3000 and (re.match(r'^const [A-Za-z0-9_]+\s*=\s*[\[{"]',ln) or ln.startswith('DATA.points.push(...[')): data.append(ln)
    else: keep.append(ln)
  secs[i]='\n'.join(keep)
for i in range(len(secs)): pull_data(i)
# the two heat-map pictures become side files, loaded the first time their layer is switched on
i=sec_index('base map')
for name,ext,fn in [('gMag','webp','mag'),('gProsp','png','prosp')]:
  mm=find(i,r"(const %s=el\('g',\{\},gBase\); \{[^\n]*?el\('image',\{)href:'data:image/%s;base64,([A-Za-z0-9+/=]+)',"%(name,ext),label=name)[0]
  open(f'{out}/og/{fn}.{ext}','wb').write(base64.b64decode(mm.group(2)))
  secs[i]=secs[i][:mm.start()]+mm.group(1)+f"'data-src':'og/{fn}.{ext}',"+secs[i][mm.end():]

# ---------- section edits ----------
# 00 data/helpers: the engine measures the map box itself; svgRect must be reassignable
i=0
cut(i,r"const svg=document\.getElementById\('map'\); var BOX=\{w:0,h:0\}; try\{ new ResizeObserver\([^\n]*?\}\)\.observe\(svg\); \}catch\(_\)\{\}",repl="const svg=document.getElementById('map'); var BOX={w:0,h:0};",label='BOX observer')
cut(i,r"const svgRect=\(\)=>\{[^\n]*\n",repl="var svgRect=()=>svg.getBoundingClientRect();\n",label='svgRect')
# 02 base map: gold streams move to the canvas
i=sec_index('base map')
cut(i,r"const gStW=\[1\.4,2\.1,2\.9,3\.7\]\.map\([^\n]*\n",label='gStW')
cut(i,r"for \(const \[s,l\] of \[\.\.\.DATA\.streams\].*?gStHit\); \}\n",re.S,label='stream loop')
# 04 view: replaced by the engine
i=sec_index('view'); assert title(secs[i])=='view ----------', title(secs[i]); secs[i]=''
# 05 markers: pins are drawn by the engine; points are not copied
i=sec_index('markers -')
cut(i,r"const PTS=DATA\.points\.map\(p=>\(\{\.\.\.p, mi:miles\(p\.lo,p\.la\)\}\)\);",repl="for(const p of DATA.points) p.mi=miles(p.lo,p.la); const PTS=DATA.points;",label='PTS')
cut(i,r"// Markers get resolved colors.*",re.S,label='shape+drawMarkers')
# the vanished-site text (3,000+ sites) is built only when a card opens
blocks=find(i,r"\{const KIND=\{Sc:.*?ug:\[g\[0\],why\]\}\); \}\}",re.S,n=4,label='VS loops')
vs=open(os.path.join(here,'vs-lazy.js'),encoding='utf-8').read()
secs[i]=secs[i][:blocks[0].start()]+vs+secs[i][blocks[3].end():]
# 09 tap: the engine owns pointer events and the first paint
i=sec_index('tap anything')
cut(i,r"svg\.addEventListener\('pointerup',e=>\{ if\(moved \|\| ptr\.size\) return;.*?\n\}\);\n",re.S,label='tap handler')
cut(i,r"svg\.addEventListener\('pointerdown',\(\)=>\{\},\{passive:true\}\);\n",label='noop pointerdown')
cut(i,r"const _apply=apply; let _vbk='';[^\n]*\n",label='apply pop wrapper')
cut(i,r"fit\(\); apply\(\);\n?$",label='first paint')
# 16 field tools
i=sec_index('field tools')
cut(i,r"const _shape0=shape; shape=function.*?\n  else el\('circle'[^\n]*\n",re.S,label='worked shape wrapper')
cut(i,r"const _dm0=drawMarkers; drawMarkers=function\(\)\{ _dm0\(\); omVis\(\); \};",repl="OGE.on('post',()=>omVis());",label='omVis wrapper')
# 17 easier to use: smooth zoom is the engine's
i=sec_index('easier to use')
cut(i,r"// ---- smooth zoom:.*",re.S,label='UXZ block')
# 19 zoom fix, 21 stream culling, 30 pointer fixes: all inside the engine now
for w in ['zoom fix','gold stream lines','v73']: secs[sec_index(w)]=''
# 23 rank colors: already in the pin painter
i=sec_index('cleaner look')
cut(i,r"const _sh5=shape; shape=function[^\n]*\n[^\n]*\n",0,label='rank shape wrapper')
# 25 Google Maps feel: keep the sheet and controls, drop the old gesture/tile code
i=sec_index('Google Maps feel')
cut(i,r"var GM=\{type:'default'[^\n]*\ntry\{ GM\.type=[^\n]*\n",label='GM var')
cut(i,r"// --- smooth gestures:.*?// --- map type ---\n",re.S,label='gestures+satellite block')
cut(i,r"const _dmG=drawMarkers; drawMarkers=function\(\)\{ if\(GM\.type==='old'\) on\.add\('_oldmap'\); _dmG\(\); gmTiles\(\); gmStreamW\(scale\(\)\); \};\nconst _apG=apply; apply=function\(\)\{ gmCommit\(\); _apG\(\); \};\n",
    repl="OGE.on('pre',()=>{ if(GM.type==='old') on.add('_oldmap'); });\n",label='gm wrappers')
cut(i,r"const m3d=document\.createElement\('div'\); m3d\.className='m3d'; svg\.parentNode\.insertBefore\(m3d,svg\); m3d\.appendChild\(svg\);\n",label='m3d')
# 26 map polish
i=sec_index('map polish')
cut(i,r"function plNorm\(m,X,Y,s\).*?// --- panning: move the picture once per frame ---\nlet plQ=0; function gmFastQ\(\)[^\n]*\n",re.S,label='plNorm+gmFastQ')
cut(i,r"function gmTD\(dx,dy\)\{[^\n]*\n[^\n]*\n",label='gmTD')
cut(i,r"// shaded relief over the imagery while tilted.*?// --- double-tap \(or double-click\) to zoom in, smoothly ---\n.*?svg\.addEventListener\('dblclick'[^\n]*\n",re.S,label='relief+double tap')
cut(i,r"// --- names above pins once zoomed in.*?const _dmP=drawMarkers; drawMarkers=function\(\)\{ _dmP\(\); plNames\(scale\(\)\); \};\n",re.S,label='plNames')
cut(i,r"// --- a scale that does not measure the map for every pin.*?try\{ new ResizeObserver\(\(\)=>\{ _sw=0; \}\)\.observe\(mwrap\); \}catch\(_\)\{\}\n",re.S,label='_sw block')
# 27 parks: outlines and trails are painted on the canvas (see canvas-land.js)
i=sec_index('parks and public land')
cut(i,r"const _dmK=drawMarkers; drawMarkers=function\(\)\{ _dmK\(\); pkDraw\(\); trDraw\(\); \};",repl="OGE.on('draw',()=>{ pkDraw(); trDraw(); });",label='pk wrapper')
# 28 cleanup: the first-second coalescer is not needed (drawMarkers is coalesced)
i=sec_index('cleanup: orphan')
cut(i,r"// the first second after opening:[^\n]*\n\{ const t0=performance\.now\(\), _dmF=drawMarkers;[^\n]*\n",label='coalescer')
# 29 old maps
i=sec_index('old maps everywhere')
cut(i,r"const _dmO=drawMarkers; drawMarkers=function\(\)\{ _dmO\(\); omRVis\(\); \};",repl="OGE.on('draw',()=>omRVis());",label='omRVis wrapper')
# 33 canvas: replaced by the engine plus canvas-land.js (parks, trails)
i=sec_index('pins, bubbles and names on one canvas'); secs[i]='\n// ---------- parks and trails on the pin canvas ----------\n'+open(os.path.join(here,'canvas-land.js'),encoding='utf-8').read()
# 34 Old Ground: street tiles are the engine's; keep pins, cards, permission, offline save
i=sec_index('Old Ground (v76)')
cut(i,r"const gDef=el\('g',\{class:'gdef'\},gBase\);.*?mwrap\.insertAdjacentHTML\('beforeend','<div class=\"ogattr\"",re.S,repl="mwrap.insertAdjacentHTML('beforeend','<div class=\"ogattr\"",label='tile code')
cut(i,r"\nogTiles\(\);\n",repl="\n",label='ogTiles call')
cut(i,r"\{ const _dmF=drawMarkers; drawMarkers=function\(\)\{ if\(OG\.seen\.size>30000\) OG\.seen\.clear\(\); _dmF\(\); \}; \}",repl="OGE.on('pre',()=>{ if(OG.seen.size>30000) OG.seen.clear(); });",label='seen wrapper')

# ---------- appended scripts ----------
def tcut(k,pat,flags=0,repl='',label=''):
  attrs,body=tail_scripts[k]; ms=list(re.finditer(pat,body,flags)); assert len(ms)==1, f'tail {k}: {label or pat[:50]} found {len(ms)}x'
  tail_scripts[k]=(attrs,re.sub(pat,lambda _:repl,body,count=1,flags=flags))
def tidx(word):
  ix=[k for k,(a,b) in enumerate(tail_scripts) if word in b[:400]]; assert len(ix)==1,(word,ix); return ix[0]
k=tidx('Layers cleanup'); tcut(k,r"\{ const _dmM=drawMarkers; drawMarkers=function\(\)\{ sync\(\); return _dmM\.apply\(this,arguments\); \}; \}",repl="OGE.on('pre',sync);",label='sync wrapper')
k=tidx('First-time-user pass'); tcut(k,r"\{ const _dmB=drawMarkers; drawMarkers=function\(\)\{ const r=_dmB\.apply\(this,arguments\); bsLater\(\); return r; \}; \}",repl="OGE.on('post',bsLater);",label='bs wrapper')
k=tidx('steady base map'); attrs,body=tail_scripts[k]
mm=re.search(r"// Historic is its own map mode.*?hmSync\(\); \}\n",body,re.S); assert mm, 'historic block'
tail_scripts[k]=(attrs,"\n// ---------- Historic is its own map mode (from v110) ----------\n"+mm.group(0))

# ---------- assemble ----------
engine=open(os.path.join(here,'engine.js'),encoding='utf-8').read()
css=open(os.path.join(here,'engine.css'),encoding='utf-8').read()
boot=open(os.path.join(here,'boot.js'),encoding='utf-8').read()
# head: engine css before the app markup; version stamp
head=head.replace('<div class="app">','<style>\n'+css+'</style>\n<div class="app">',1)
open(out+'/og-data.js','w',encoding='utf-8').write('// Old Ground data (v%d): map outlines, every spot, vanished sites, pictures index. Loaded before the app scripts.\n'%VER+'\n'.join(data)+'\n')
order=[]
for i,x in enumerate(secs):
  if not x.strip(): continue
  order.append(x)
  if title(x).startswith('markers'): order.append('\n// ---------- map engine ----------\n'+engine)
scripts=['<script src="og-data.js"></script>']+['<script>'+x+'\n</script>' for x in order]
scripts+=['<script%s>%s</script>'%(a,b) for a,b in tail_scripts if b.strip()]
scripts.append('<script>\n'+boot+'</script>')
html=head+'\n'.join(scripts)+'\n'+''.join(styles_in_rest)+'\n</body></html>'
html=html.replace('<meta name="og-version"','<meta name="og-version"')  # (placeholder, kept for future stamps)
open(out+'/index.html','w',encoding='utf-8').write(html)
print('index.html',len(html),'og-data.js',sum(len(x) for x in data),'scripts',len(scripts))
