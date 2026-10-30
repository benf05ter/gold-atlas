# County-depth Dunn 1881 history read: card text + source rows on 8 Dunn cards. Its 2 "new" pins are already in the atlas
# (Falls City = pd88-unity, GNIS Falls City 180 m off; Connorsville = pd88-bolan-connersville-p-o, 620 m off), so their text goes on those cards.
# usage: apply_dunn1881.py og-data.js ; refuses a rerun
import sys,json
H='/mnt/project-files/research/county-depth/handoff/gathering/'
f=sys.argv[1]; s=open(f,encoding='utf-8').read(); tag='\n// County-depth: Dunn 1881 county history notes\n'; assert tag not in s,'already applied'
E=json.load(open(H+'dunn-1881-enrich.json'))
for n in json.load(open(H+'dunn-1881-new-pins.json')):
    k={'cd-falls-city-1881':'pd88-unity','cd-connorsville-1881':'pd88-bolan-connersville-p-o'}[n['id']]
    E[k]={'st':' '+n['st'].split(' The pin is the USGS')[0].replace('Falls City Cemetery (1888 plat) is about 1.6 km east.','')+(' This crossroads is the Falls City of the 1881 history.' if 'unity' in k else ' This is the Connorsville of the 1881 history.'),'src':n['src']}
s+=tag+'{ const E='+json.dumps(E,ensure_ascii=False)+'; for(const p of DATA.points){ const x=E[p.id]; if(!x) continue; p.st=(p.st||"")+x.st; (p.src=p.src||[]).push(...x.src); } }\n'
open(f,'w',encoding='utf-8').write(s); print(len(E),'cards')
