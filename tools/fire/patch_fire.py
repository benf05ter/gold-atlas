# Adds the Fire maps map type (FIRE list) and the sf- fire-map pins to an atlas page and its og-data.js. Run again to replace them.
#   python3 tools/fire/patch_fire.py <page.html> <og-data.js> <fire.json>
import sys,json,re,os
page,data,fj=sys.argv[1:4]; F=json.load(open(fj)); here=os.path.dirname(os.path.abspath(__file__))
fire=[{k:p[k] for k in ('id','town','label','b','f','item','bn') if k in p} for p in F['fire']]
blk=open(here+'/block.js').read().replace('/*FIRE*/[]',json.dumps(fire,separators=(',',':')))
h=open(page).read()
css='.mt-fire{background:repeating-linear-gradient(0deg,transparent 0 7px,#c9a77a 7px 8px),linear-gradient(90deg,#f2c6b4 0 45%,#f4e7c6 45% 70%,#c8dbe8 70%)}'
if '.mt-fire{' not in h: h=h.replace('.mt-plat{',css+'\n.mt-plat{',1)
h=re.sub(r'// ---------- Fire maps map type.*?gmSetType\(\'fire\'\); else vF\(\); gmSheetSync\(\); }\n','',h,flags=re.S)
a="if(saved==='1' && GM.type==='default') gmSetType('plat1913'); else v13(); gmSheetSync(); }\n"
assert h.count(a)==1, 'plat block anchor not found'
h=h.replace(a,a+blk,1); open(page,'w').write(h)
d=open(data).read()
d=re.sub(r'\n// fire-map pins \(sf-\)[^\n]*\nDATA\.points\.push\([^\n]*\n','\n',d)
d=d.rstrip('\n')+'\n// fire-map pins (sf-): buildings read from the oldest Sanborn map of each town\nDATA.points.push(...'+json.dumps(F['pins'],separators=(',',':'),ensure_ascii=False)+');\n'
open(data,'w').write(d)
print('ok',len(fire),'maps',len(F['pins']),'pins')
