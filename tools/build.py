# Builds the home-screen app from the published Claude atlas page.
#   python3 tools/build.py <atlas.html> [oldmap-dir]
# Writes the site into the folder named in tools/site-folder.txt. Commit and push; phones pick it up on next open.
import sys,os,re,json,hashlib,shutil
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); T=os.path.join(root,'tools')
src=sys.argv[1]; om=sys.argv[2] if len(sys.argv)>2 else None
out=os.path.join(root,open(os.path.join(T,'site-folder.txt')).read().strip()); os.makedirs(out+'/icons',exist_ok=True); os.makedirs(out+'/oldmap',exist_ok=True)
c=open(src,encoding='utf-8').read()
assert 'function hrDraw(' in c, 'atlas has no hunt recorder; is this the right file?'
head=('<link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="icons/apple-touch-icon.png">'
 '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">'
 '<meta name="apple-mobile-web-app-title" content="Old Ground"><meta name="apple-mobile-web-app-status-bar-style" content="default">'
 '<meta name="theme-color" content="#f3eee2"><meta name="robots" content="noindex,nofollow">'
 # iPhone launch screens (portrait), drawn by icons.py: (css width, css height, pixel ratio, image)
 +''.join(f'<link rel="apple-touch-startup-image" media="screen and (device-width: {w}px) and (device-height: {h}px) and (-webkit-device-pixel-ratio: {r}) and (orientation: portrait)" href="icons/splash-{w*r}x{h*r}.png">'
   for w,h,r in [(440,956,3),(430,932,3),(402,874,3),(393,852,3),(428,926,3),(390,844,3),(375,812,3),(414,896,3),(414,896,2),(360,780,3),(375,667,2)]))
c=c.replace('content="width=device-width,initial-scale=1,viewport-fit=cover"','content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover"',1)
i=c.index('</head>'); c=c[:i]+head+c[i:]
rid='og-rockid' in c   # since atlas v92 the atlas carries the rock ID itself (Identify page); older atlases get it injected here
a='<div class="app">'; assert c.count(a)==1; c=c.replace(a,open(os.path.join(T,'app.css')).read()+('' if rid else open(os.path.join(T,'rockid.css'),encoding='utf-8').read())+a)
e=c.find('<script>\n// ---------- Identify'); i=c.rindex('</script>',0,e if e>0 else len(c)); c=c[:i]+open(os.path.join(T,'app.js')).read()+c[i:]   # app.js goes at the end of the main atlas script
if not rid: i=c.rindex('</script>')+len('</script>'); c=c[:i]+open(os.path.join(T,'rockid.js'),encoding='utf-8').read()+c[i:]   # rock, mineral and metal ID under the Search tab
c=c.replace('For trips with no signal, install the home-screen app: open <a href="https://benf05ter.github.io/gold-atlas/a-f218a76394f8/" target="_blank" rel="noopener">the app link</a> in Safari, tap Share, then Add to Home Screen. It keeps the whole atlas, old maps included, on your phone and updates itself when you have signal.','You are in the home-screen app: the whole atlas, old maps included, is saved on this phone, and it updates itself when you have signal.')
c=c.replace('For trips with no signal, save the offline copy <span class="mono">Upper-Midwest-Gold-Atlas.html</span> from the project files to your phone and open it in your browser before you lose service.',
 'For trips with no signal, use the home-screen app: open its link in Safari, tap Share, then Add to Home Screen. It keeps the whole atlas on your phone and updates itself when you have signal.')
open(out+'/index.html','w',encoding='utf-8').write(c)
for f in os.listdir(os.path.join(T,'..','tools','icons')) if os.path.isdir(os.path.join(T,'icons')) else []: pass
os.system(f'python3 "{T}/icons.py" "{out}/icons"')
if om:
  for f in os.listdir(om):
    if f.endswith('.webp'): shutil.copy(os.path.join(om,f),out+'/oldmap/'+f)
img=sys.argv[4] if len(sys.argv)>4 else None   # photo packs (img/*.json) the atlas loads on demand
sat=sys.argv[3] if len(sys.argv)>3 else None; satpre=[]
if img:
  os.makedirs(out+'/img',exist_ok=True)
  for f in sorted(os.listdir(img)):
    if f.endswith('.json'): shutil.copy(os.path.join(img,f),out+'/img/'+f)   # cached the first time a card shows them, so the first install stays small
if sat:
  os.makedirs(out+'/sat',exist_ok=True)
  for f in sorted(os.listdir(sat)):
    if f.endswith('.webp'):
      shutil.copy(os.path.join(sat,f),out+'/sat/'+f)
      if not f.startswith('2_'): satpre.append('sat/'+f)   # coarse tiles are saved on install; street-level ones as you look at them
pk=sys.argv[5] if len(sys.argv)>5 else None   # parks, trails (pk/*.json): the park list is saved on install, outline and trail tiles as you look at them
if pk:
  if os.path.isdir(out+'/pk'): shutil.rmtree(out+'/pk')
  os.makedirs(out+'/pk',exist_ok=True)
  for f in sorted(os.listdir(pk)):
    if f.endswith('.json'):
      shutil.copy(os.path.join(pk,f),out+'/pk/'+f)
      if f=='parks.json': satpre.append('pk/'+f)
omr=sys.argv[6] if len(sys.argv)>6 else None   # regional old topo sheets (om/*.webp), cached the first time you look at them
if omr:
  if os.path.isdir(out+'/om'): shutil.rmtree(out+'/om')
  os.makedirs(out+'/om',exist_ok=True)
  for f in sorted(os.listdir(omr)):
    if f.endswith('.webp'): shutil.copy(os.path.join(omr,f),out+'/om/'+f)
h=hashlib.sha256()
for d,_,fs in sorted(os.walk(out)):
  for f in sorted(fs):
    if f!='sw.js': h.update(open(os.path.join(d,f),'rb').read())
ver=h.hexdigest()[:12]
open(out+'/sw.js','w').write(open(os.path.join(T,'sw.js')).read().replace('__VERSION__',ver).replace('__SAT__',json.dumps(satpre)))
json.dump({'name':'Old Ground','short_name':'Old Ground','start_url':'./','scope':'./','display':'standalone','background_color':'#1c3025','theme_color':'#f3eee2',
 'icons':[{'src':'icons/icon-192.png','sizes':'192x192','type':'image/png'},{'src':'icons/icon-512.png','sizes':'512x512','type':'image/png'},{'src':'icons/maskable-512.png','sizes':'512x512','type':'image/png','purpose':'maskable'}]},
 open(out+'/manifest.webmanifest','w'),indent=1)
print('built',out,'version',ver,os.path.getsize(out+'/index.html'),'bytes')
