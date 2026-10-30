# Web-dive batch 3 (research/web-dive/leads-3.tsv) -> atlas: 1925 Wisconsin Archeologist trading posts and battlefields,
# Bogus Bluff cave; Whitehall cave moved to Nelson Dewey State Park (its wrong LiDAR candidate dropped); Vanceburgh note; two hoards solved.
# usage: pins3.py leads-3.tsv og-data.js ; refuses a rerun. Prints the new/moved ids (they need LiDAR pictures).
import sys,csv,json
R={r['id']:r for r in csv.DictReader(open(sys.argv[1]),delimiter='\t')}; f=sys.argv[2]; s=open(f,encoding='utf-8').read()
tag='\n// Web-dive batch 3 (research/web-dive/leads-3.tsv)\n'; assert tag not in s,'already applied'
LOOK='Look only: this ground may hold graves, and battlefield and burial finds are protected by law. A story stop, not a dig.'
V={'trading_post':('history','1830s-1850s trade silver, beads, gun parts, kettle brass, buttons','Trade-era ground: record what you find, and leave anything Native American in place. Get the owner\'s permission; check the current plat.'),
 'battlefield':('history','',LOOK),
 'treasure_legend':('treasure','Spanish coins and a counterfeiters\' cache (legend)','State riverway land: look only, no digging.')}
G={'A':'The era USGS topo draws it at the pin','B':'Placed from the section and quarter in the 1925 record, checked against a named feature on the era topo','C':'Placed from the section and quarter only; nothing drawn on the era topo'}
new=[]
for r in R.values():
    if r['action']!='new': continue
    L,v,t=V[r['kind']]; t=t+(' '+r['notes'] if r['notes'] else '')
    g=G[r['grade']] if r['kind']!='treasure_legend' else 'Placed from GNIS Bogus Bluff'
    src=r['source']
    new.append({'id':r['id'],'L':L,'n':r['name'],'la':round(float(r['lat']),5),'lo':round(float(r['lon']),5),'y':r['years'],
      'pl':f"{r['county']} County, {r['placed_by']}",'co':r['county'],'stt':r['state'],'v':v,'c':'documented' if r['kind']!='treasure_legend' else 'newspaper',
      's':'unknown','p':'plss' if r['placed_by'].startswith('PLSS') else 'gnis',
      'st':r['story']+f" Pin: {g}. Cross-check: {r['cross_check']}",'t':t,
      'src':[[src,'https://archive.org/details/archeolwisconsin04wiscrich' if 'archeolwisconsin' in src else '']],
      'pinconf':r['grade'],'pinev':[r['cross_check']]})
w=R['wd3-whitehall-cave-fix']; vb=R['wd3-vanceburgh-enrich']
fix={'t-whitehall-cave':{'la':round(float(w['lat']),5),'lo':round(float(w['lon']),5),'co':'Grant','pl':'Nelson Dewey State Park bluff, Cassville (the custodian came from Whitehall)',
  'n':'Astor keelboat treasure cave, Nelson Dewey State Park (Cassville)','p':'approx','pinconf':'C',
  'st':'Beloit Independent, Sept 12, 1924 (and the Milwaukee Journal, Sept 7, 1924, "Whitehall barber guards famous treasure cave"): T. J. Johnson, a former Whitehall barber, was custodian of Nelson Dewey State Park at Cassville. The cave is a sandstone ledge about 200 ft up the park bluff. The legend says a War of 1812 crew of a John Jacob Astor fur keelboat hid their cargo there; nothing had been found as of 1924. Pin: GNIS Nelson Dewey State Park (the ledge itself is not placed). Moved 2026-10-30 from Whitehall, Trempealeau Co., where the old pin guessed from the headline.',
  't':'State park: look only. Wisconsin state parks allow detectors only to find a specific lost item, with a permit.',
  'src':[['Beloit Independent, 12 Sep 1924, p. 1 (newspapers.com)',''],['Milwaukee Journal, 7 Sep 1924','']]},
 'pd88-vanceburgh':{'add':' The 1925 Record of Wisconsin Antiquities puts Peter Vance\'s trading post on the west bank of the Hay River, NW1/4 sec 8, Sheridan Twp, about 170 m from this pin; the later village took his name.',
  'src2':['The Wisconsin Archeologist v.4 n.s. (1925), Fifth Addition to the Record of Wisconsin Antiquities','https://archive.org/details/archeolwisconsin04wiscrich']},
 'cr-lemuel-hill-hoard-1906':{'s':'found','add':' Solved: newspapers of the time report that his notes and deeds were recovered.'},
 't-tr-green-isle':{'s':'found','add':' The Mud Lake $40,000 story is this same hoard, not an open lead.'}}
s+=tag+'DATA.points=DATA.points.filter(p=>p.id!=="lc-t-whitehall-cave-7"); delete LIDIMG["t-whitehall-cave"]; delete LIDC["t-whitehall-cave"];\nDATA.points.push(...'+json.dumps(new,ensure_ascii=False,separators=(',',':'))+');\n{ const F='+json.dumps(fix,ensure_ascii=False)+'; for(const p of DATA.points){ const x=F[p.id]; if(!x) continue; for(const k of ["la","lo","co","pl","n","p","pinconf","st","t","s"]) if(x[k]!=null) p[k]=x[k]; if(x.src) p.src=x.src; if(x.add) p.st=(p.st||"")+x.add; if(x.src2) (p.src=p.src||[]).push(x.src2); } }\n'
open(f,'w',encoding='utf-8').write(s); sys.stderr.write(f'{len(new)} new, {len(fix)} fixes\n')
print(json.dumps([{'id':p['id'],'la':p['la'],'lo':p['lo']} for p in new]+[{'id':'t-whitehall-cave','la':fix['t-whitehall-cave']['la'],'lo':fix['t-whitehall-cave']['lo']}]))
