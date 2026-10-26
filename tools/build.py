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
 '<meta name="apple-mobile-web-app-title" content="Gold Atlas"><meta name="apple-mobile-web-app-status-bar-style" content="default">'
 '<meta name="theme-color" content="#eef0ea"><meta name="robots" content="noindex,nofollow">')
c=c.replace('content="width=device-width,initial-scale=1,viewport-fit=cover"','content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover"',1)
i=c.index('</head>'); c=c[:i]+head+c[i:]
a='<div class="app">'; assert c.count(a)==1; c=c.replace(a,open(os.path.join(T,'app.css')).read()+a)
i=c.rindex('</script>'); c=c[:i]+open(os.path.join(T,'app.js')).read()+c[i:]
c=c.replace('For trips with no signal, install the home-screen app: open <a href="https://benf05ter.github.io/gold-atlas/a-f218a76394f8/" target="_blank" rel="noopener">the app link</a> in Safari, tap Share, then Add to Home Screen. It keeps the whole atlas, old maps included, on your phone and updates itself when you have signal.','You are in the home-screen app: the whole atlas, old maps included, is saved on this phone, and it updates itself when you have signal.')
c=c.replace('For trips with no signal, save the offline copy <span class="mono">Upper-Midwest-Gold-Atlas.html</span> from the project files to your phone and open it in your browser before you lose service.',
 'For trips with no signal, use the home-screen app: open its link in Safari, tap Share, then Add to Home Screen. It keeps the whole atlas on your phone and updates itself when you have signal.')
open(out+'/index.html','w',encoding='utf-8').write(c)
for f in os.listdir(os.path.join(T,'..','tools','icons')) if os.path.isdir(os.path.join(T,'icons')) else []: pass
os.system(f'python3 "{T}/icons.py" "{out}/icons"')
if om:
  for f in os.listdir(om):
    if f.endswith('.webp'): shutil.copy(os.path.join(om,f),out+'/oldmap/'+f)
h=hashlib.sha256()
for d,_,fs in sorted(os.walk(out)):
  for f in sorted(fs):
    if f!='sw.js': h.update(open(os.path.join(d,f),'rb').read())
ver=h.hexdigest()[:12]
open(out+'/sw.js','w').write(open(os.path.join(T,'sw.js')).read().replace('__VERSION__',ver))
json.dump({'name':'Upper Midwest Gold Atlas','short_name':'Gold Atlas','start_url':'./','scope':'./','display':'standalone','background_color':'#eef0ea','theme_color':'#eef0ea',
 'icons':[{'src':'icons/icon-192.png','sizes':'192x192','type':'image/png'},{'src':'icons/icon-512.png','sizes':'512x512','type':'image/png'},{'src':'icons/maskable-512.png','sizes':'512x512','type':'image/png','purpose':'maskable'}]},
 open(out+'/manifest.webmanifest','w'),indent=1)
print('built',out,'version',ver,os.path.getsize(out+'/index.html'),'bytes')
