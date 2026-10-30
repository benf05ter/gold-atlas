# Web-dive leads (research/web-dive/leads.tsv) -> atlas: new gather pins, the Stardusk move, the Altoona POW-camp note.
# usage: pins.py leads.tsv og-data.js ; refuses a rerun. Prints the new/moved ids (they need LiDAR pictures).
import sys,csv,json
R=list(csv.DictReader(open(sys.argv[1]),delimiter='\t')); f=sys.argv[2]; s=open(f,encoding='utf-8').read()
tag='\n// Web-dive leads (research/web-dive/leads.tsv)\n'; assert tag not in s,'already applied'
V={'drive_in':('1950s-80s coins, rings, keys','Drive-in lots are coin carpets: car doors open, change falls out. Work the ramp rows, the snack bar and the ticket booth.'),
 'lost_ski_hill':('1940s-70s coins, rings, ski-tow tokens and lift-ticket hardware','Work the base of the old tow line, the warming-hut and the parking area; people dropped change taking gloves off.'),
 'pow_camp':('1940s coins, buttons, camp hardware','Most camp grounds are private or public land with rules; ask first, and leave military items in place and report them.'),
 'ccc_camp':('1930s coins, tokens, buttons, tools','Look for the barracks rows and the mess hall footprint; CCC camps often left trash dumps at the edge of the clearing.'),
 'logging_camp':('1870s-1910s coins, tools, camp hardware','Camps sat near water and the tote road; the cook shack and bunkhouse spots are the best ground.'),
 'dance_hall':('coins, jewelry, tokens','Work the parking area, the doors and the path to the outhouses.'),
 'cannery':('coins, tokens, tags','Work the loading area and the workers\' entrance.'),
 'picnic':('coins, jewelry, toys','Work under the old shade trees and around the stand and the bandstand spots.'),
 'cold_war':('1950s-60s coins, buttons','Former military ground: check who owns it now, and leave military items alone.')}
G={'A':'The era USGS topo draws it at the pin','B':'Placed from GNIS, an address or an offset feature (about 100-400 m)','C':'Placed from the source\'s GPS point only; not seen on the era topo'}
new=[]; fix={}; ids=[]
for r in R:
    if r['action']=='new':
        v,t=V[r['kind']]; t=t+(' '+r['notes'] if r['notes'] else '')
        new.append({'id':'wd-'+r['id'].split('wd-')[-1],'L':'gather','n':r['name']+(f" ({r['years']})" if r['years'] and r['years'] not in r['name'] else ''),
          'la':round(float(r['lat']),5),'lo':round(float(r['lon']),5),'y':r['years'],'pl':f"{r['county']} County",'co':r['county'],'stt':r['state'],'v':v,
          'c':'documented','s':'unknown','p':'topo' if r['grade']=='A' else 'approx',
          'st':r['story']+f" Pin: {G[r['grade']]} ({r['placed_by']}). Cross-check: {r['cross_check']}",'t':t,
          'src':[[r['source'] if not r['source'].startswith('http') else r['source'].split('/')[2],r['source'] if r['source'].startswith('http') else '']],
          'pinconf':r['grade'],'pinev':[r['cross_check']]}); ids.append(new[-1]['id'])
    elif r['action']=='correct':
        fix[r['id']]={'la':float(r['lat']),'lo':float(r['lon']),'p':'topo','pinconf':'A','add':' Moved 2026-10-30: '+r['placed_by']+'. The old pin sat 2.4 km east in an empty field.'}; ids.append(r['id'])
    elif r['action']=='enrich':
        fix['d-altoona-fairgrounds']={'add':' In summer 1945 about 175 German POWs (Camp Eau Claire, a Fort Sheridan branch) lived here in two dormitories behind a fence with two guard towers, trucked out to work at the Lange cannery.','src':[ 'Volume One, 2022: how German POWs saved the harvest',r['source']]}
s+=tag+'DATA.points.push(...'+json.dumps(new,ensure_ascii=False,separators=(',',':'))+');\n{ const F='+json.dumps(fix,ensure_ascii=False)+'; for(const p of DATA.points){ const x=F[p.id]; if(!x) continue; if(x.la!=null){ p.la=x.la; p.lo=x.lo; p.p=x.p; p.pinconf=x.pinconf; } p.st=(p.st||"")+x.add; if(x.src) (p.src=p.src||[]).push(x.src); } }\n'
open(f,'w',encoding='utf-8').write(s); sys.stderr.write(f'{len(new)} new, {len(fix)} fixes\n'); print(json.dumps([{'id':i,'la':(next((p for p in new if p['id']==i),None) or fix[i])['la'],'lo':(next((p for p in new if p['id']==i),None) or fix[i])['lo']} for i in ids]))
