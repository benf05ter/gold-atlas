# County-depth fire maps for 10 more towns: FIRE rows into index.html, sf- pins into og-data.js.
# usage: apply_fire.py fire-add.json index.html og-data.js [--bundle]  (--bundle: artifact, rows load from bundle omf/fb4.json; app loads omf/<f>.webp)
import sys,json
d=json.load(open(sys.argv[1])); del sys.argv[1]
# the artifact gets one merged bundle fb4.json (fb5 for La Crosse was folded into it)
rows=[dict(r,bn='fb4') if '--bundle' in sys.argv else {k:v for k,v in r.items() if k!='bn'} for r in d['fire']]
h=open(sys.argv[1]).read(); assert '"f":"%s"'%rows[0]['f'] not in h.replace(' ',''),'already applied'
a='var FIRE=['; assert h.count(a)==1; h=h.replace(a,a+json.dumps(rows,separators=(',',':'))[1:-1]+',',1); open(sys.argv[1],'w').write(h)
f=sys.argv[2]; s=open(f,encoding='utf-8').read(); tag='\n// County-depth: fire-map (Sanborn) pins from '+rows[0]['f']+'\n'; assert tag not in s
s+=tag+'DATA.points.push(...'+json.dumps(d['pins'],ensure_ascii=False,separators=(',',':'))+');\n'; open(f,'w',encoding='utf-8').write(s)
print(len(rows),'sheets',len(d['pins']),'pins')
