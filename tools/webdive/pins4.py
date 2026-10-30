# Web-dive batch 4 (research/web-dive/leads-4.tsv) + the Porterville merge (county-depth 10:37Z): Zopp's hidden money pin at Trimbelle,
# Marg mink-farm detail on the Neillsville jar card, ob-porterville-blue-mill folded into d-ghost-porters-mills (same place).
# usage: pins4.py leads-4.tsv og-data.js ; refuses a rerun.
import sys,csv,json
R={r['id']:r for r in csv.DictReader(open(sys.argv[1]),delimiter='\t')}; f=sys.argv[2]; s=open(f,encoding='utf-8').read()
tag='\n// Web-dive batch 4 + Porterville merge\n'; assert tag not in s,'already applied'
z=R['wd4-trimbelle-zopp']
pin={'id':'wd4-trimbelle-zopp','L':'treasure','n':z['name'],'la':float(z['lat']),'lo':float(z['lon']),'y':'1912','pl':'Trimbelle village, Pierce County (town level)','co':'Pierce','stt':'WI',
 'v':'A blacksmith\'s savings, several thousand dollars up to about $20,000 (1912 papers)','c':'newspaper','s':'never','p':'town',
 'st':z['story']+' Pin: the 1877 plat\'s blacksmith shop in Trimbelle village; the house site is a guess. Cross-check: '+z['cross_check'],
 't':'Town-level pin: the house site is not known. Find Zopp (or Kopp) on a 1900s-1910s Pierce plat or tax roll, then ask the landowner.',
 'src':[['Bismarck Daily Tribune, 8 Jun 1912 (Chronicling America)','https://chroniclingamerica.loc.gov/'],['Oshkosh Northwestern, 19 Jun 1912, p. 6 (newspapers.com)',''],['Chippewa Herald-Telegram, 25 Jun 1912, p. 1 (newspapers.com)','']],
 'pinconf':'C','pinev':[z['cross_check']]}
j=R['wd4-neillsville-jar']
add={'t-neillsville-jar':' '+j['story'].replace('For the t-neillsville-jar card: ','The farm was the ')+' Where: the Marshfield News-Herald (27 Sep 1962, p. 8) says 2.5 mi NW of Neillsville, the Clark County Press 3 mi W; they disagree by about 3 km, so the pin stays put.'}
s+=(tag+'DATA.points.push('+json.dumps(pin,ensure_ascii=False)+');\n'
 '{ const A='+json.dumps(add,ensure_ascii=False)+'; const ob=DATA.points.find(p=>p.id==="ob-porterville-blue-mill"), pm=DATA.points.find(p=>p.id==="d-ghost-porters-mills");\n'
 '  if(ob&&pm){ const m=(ob.st||"").match(/[^.]*1847[^.]*flood[^.]*\\.|[^.]*flood[^.]*1847[^.]*\\./); pm.st=(pm.st||"")+" From the old Porterville / Blue Mill card (same place): "+(m?m[0].trim():"the June 1847 flood threw mill timbers and ironed wheels up on the hill back of Porterville.");\n'
 '    for(const r of (ob.src||[])) if(/Randall|1875/.test(r[0])) (pm.src=pm.src||[]).push(r); DATA.points=DATA.points.filter(p=>p!==ob); delete LIDIMG[ob.id]; }\n'
 '  for(const p of DATA.points) if(A[p.id]) p.st=(p.st||"")+A[p.id]; }\n')
open(f,'w',encoding='utf-8').write(s); print('ok')
