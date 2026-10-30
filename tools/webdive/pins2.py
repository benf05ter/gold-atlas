# Web-dive round 2 (research/web-dive/leads-2.tsv) -> atlas: new ghost-town / camp / stopping-place pins,
# card notes on pins the atlas already had, the Marg Fur Food Ranch name on the Neillsville jar card.
# usage: pins2.py leads-2.tsv og-data.js ; refuses a rerun. Prints the new ids (they need LiDAR pictures).
import sys,csv,json
R=list(csv.DictReader(open(sys.argv[1]),delimiter='\t')); f=sys.argv[2]; s=open(f,encoding='utf-8').read()
tag='\n// Web-dive round 2 (research/web-dive/leads-2.tsv)\n'; assert tag not in s,'already applied'
TOWN=('1850s-1930s coins, tokens, buttons, relics','Work the house rows, the store and depot sites and the paths between them; check who owns the ground now and ask first.')
V={'ghost_town':('ghost',)+TOWN,'logging_town':('ghost',)+TOWN,'mill_town':('ghost',)+TOWN,'mining_town':('ghost',)+TOWN,
 'logging_camp':('camp','1870s-1910s coins, tools, camp hardware','Camps sat near water and the tote road; the cook shack and bunkhouse spots are the best ground.'),
 'stopping_place':('gather','1870s-1920s coins, tokens, buttons','Stopping places fed and bedded teamsters and river crews: work the yard, the barn site and the road approach.'),
 'resort':('gather','1900s-1910s coins, jewelry, fishing gear','Work the lodge footprint, the cabin rows, the dock landing and the paths between them.'),
 'trading_post':('history','1860s-1880s trade goods, coins, buttons','Trade-era ground: record what you find, and leave anything Native American in place.'),
 'gangster_site':('history','1930s coins, cartridges, hardware','A story stop first; the ground is private, so ask the owner.')}
G={'A':'The era USGS topo draws it at the pin','B':'Placed from GNIS, an address or an offset feature (about 100-400 m)','C':'Placed from the source\'s GPS point only; not seen on the era topo'}
# leads the web dive marked new that the atlas already has a pin for: add the story to that card instead
OLD={'wd2-34':'ab4-chengwatana-village','wd2-37':'fr-whitewater-falls-village','wd2-40':'fr-frankford-village-1856',
 'wd2-41':'fr-clear-grit-flouring-mill-hamlet-carrollton','wd2-45':'fr-pequaming-old-indian-village-site-and-heba','wd2-52':'fr-ramsay-and-the-eureka-mine'}
new=[]; fix={}
for r in R:
    if r['action']!='new': continue
    if r['id'] in OLD:
        fix[OLD[r['id']]]={'add':f" Web dive 2026-10-30: {r['story']} Its placement: {r['lat']}, {r['lon']} ({r['placed_by']}; {r['cross_check']}).",'src':[r['source'].split('/')[2] if r['source'].startswith('http') else r['source'],r['source'] if r['source'].startswith('http') else '']}
        continue
    L,v,t=V[r['kind']]; t=t+(' '+r['notes'] if r['notes'] else '')
    new.append({'id':r['id'],'L':L,'n':r['name']+(f" ({r['years']})" if r['years'] and r['years'] not in r['name'] else ''),
      'la':round(float(r['lat']),5),'lo':round(float(r['lon']),5),'y':r['years'],'pl':f"{r['county']} County",'co':r['county'],'stt':r['state'],'v':v,
      'c':'documented','s':'unknown','p':'topo' if r['grade']=='A' else 'approx',
      'st':r['story']+f" Pin: {G[r['grade']]} ({r['placed_by']}). Cross-check: {r['cross_check']}",'t':t,
      'src':[[r['source'] if not r['source'].startswith('http') else r['source'].split('/')[2],r['source'] if r['source'].startswith('http') else '']],
      'pinconf':r['grade'],'pinev':[r['cross_check']]})
j=next(r for r in R if r['id']=='wd2-30')
fix['t-neillsville-jar']={'add':' The farm was the Marg Fur Food Ranch (owner Kurt Marg, there 50 years), so the jar was older than his time on it; earlier owners who hid one jar may have hidden others. Find the Marg farm on a 1960s Clark County plat.','src':['Clark County history: 1962 silver jar',j['source']]}
s+=tag+'DATA.points.push(...'+json.dumps(new,ensure_ascii=False,separators=(',',':'))+');\n{ const F='+json.dumps(fix,ensure_ascii=False)+'; for(const p of DATA.points){ const x=F[p.id]; if(!x) continue; p.st=(p.st||"")+x.add; if(x.src) (p.src=p.src||[]).push(x.src); } }\n'
open(f,'w',encoding='utf-8').write(s); sys.stderr.write(f'{len(new)} new, {len(fix)} card notes\n'); print(json.dumps([{'id':p['id'],'la':p['la'],'lo':p['lo']} for p in new]))
