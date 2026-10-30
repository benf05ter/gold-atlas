import csv,json,re,math,urllib.request,urllib.parse
rows=list(csv.DictReader(open('/mnt/project-files/research/overlay/sv78-finds.tsv'),delimiter='\t'))
P=json.load(open('/tmp/claude-0/pv/ogpts5.json'))
G={r['gnis']:r for r in csv.DictReader(open('/mnt/project-files/research/overlay/gnis-unpinned.tsv'),delimiter='\t')}
ids={p[0] for p in P}
def dist(a,b,c,e): return 6371000*math.hypot(math.radians(c-a),math.radians(e-b)*math.cos(math.radians(a)))
SC=re.compile(r'school|church|cem',re.I)
near=[p for p in P if SC.search(p[1] or '') or p[0].startswith(('cem-','sc-','ch-','lch-','ot-'))]
def trs(la,lo):
  u="https://gis.blm.gov/arcgis/rest/services/Cadastral/BLM_Natl_PLSS_CadNSDI/MapServer/exts/CadastralSpecialServices/GetTRS?"+urllib.parse.urlencode({"lat":la,"lon":lo,"units":"DD","returnalllevels":"true","f":"pjson"})
  L=[f['attributes']['landdescription'] for f in json.load(urllib.request.urlopen(u,timeout=60)).get('features',[])]
  for x in L:
    m=re.match(r'WI\d\d(\d{3})\dN(\d{3})\d([EW])\dSN(\d\d)',x)
    if m: return f"sec. {int(m.group(4))} T{int(m.group(1))}N R{int(m.group(2))}{m.group(3)}"
  return ''
new=[];edit={};used=set();stats={'new':0,'gnis':0,'judge':0,'dup':0}
for r in rows:
  la,lo=float(r['lat']),float(r['lon']); church=r['name'].startswith('Church')
  kind='church' if church else 'school'
  if not r['plss']:
    r['plss']=trs(la,lo); r['card_text']=r['card_text'].replace('here, .',f"here, {r['plss']}.")
    if r['plss']: r['name']=f"{'Church' if church else 'Schoolhouse'} (1878 map), {r['plss']}"
  src=[[f"1878 Snyder, Van Vechten county atlas, {r['sheet']} (David Rumsey Map Collection)",r['source_url']]]
  a=r['action']
  if a.startswith('judge'):
    pid=re.search(r'same as (\S+) drawn',a).group(1)
    if pid in ids:
      d=re.search(r'drawn (\d+) m',a).group(1)
      edit.setdefault(pid,{"set":{},"st":"","src":src})
      edit[pid]['st']+=f" The 1878 Snyder, Van Vechten county atlas ({r['sheet']}) draws a {'church' if church else 'schoolhouse'} {d} m from this pin, at {la:.5f}, {lo:.5f}; the 1878 maps are often 100-450 m off, so it is likely this {'church' if church else 'school'} drawn off its spot, or an earlier site."
      stats['judge']+=1; continue
  # re-dedupe against current pins (500 m, same kinds)
  hit=min(((dist(la,lo,p[2],p[3]),p) for p in near if abs(p[2]-la)<.006 and abs(p[3]-lo)<.009),default=(9e9,None),key=lambda x:x[0])
  gm=re.search(r'pin as (.+?) from gnis',a)
  if hit[0]<500 and not gm:
    p=hit[1]; edit.setdefault(p[0],{"set":{},"st":"","src":src})
    edit[p[0]]['st']+=f" The 1878 Snyder, Van Vechten county atlas ({r['sheet']}) draws a {'church' if church else 'schoolhouse'} {round(hit[0])} m from this pin, at {la:.5f}, {lo:.5f}."
    stats['dup']+=1; continue
  m=re.match(r'sec\. (\d+) T(\d+)N R(\d+)([EW])',r['plss'] or '')
  base=f"sv78-{kind}-s{m.group(1)}-t{m.group(2)}n-r{m.group(3)}{m.group(4).lower()}" if m else f"sv78-{kind}-{la:.4f}-{abs(lo):.4f}".replace('.','')
  pid=base;k=2
  while pid in ids or pid in used: pid=f"{base}-{k}";k+=1
  used.add(pid)
  p={"id":pid,"L":"school2" if church else "school","n":r['name'],"la":la,"lo":lo,"y":"by 1878","pl":f"{r['plss'] or 'section not read'}, {r['county']} Co.","co":r['county'],"stt":"WI",
     "v":"Coins, religious medals, buttons, jewelry from church socials and picnics" if church else "Coins, buttons, pencil caps, toys and slate pieces","c":"documented","s":"unknown","p":"exact","st":r['card_text'],
     "t":"Look for the level church pad, fieldstone foundation corners, lilacs or old spruce, and the horse-shed line. If there is a churchyard cemetery, search only outside it. Ask the landowner first." if church else "Look for the level school-yard pad, a fieldstone foundation corner, lilacs and the old well; the road edge in front was the playground. Ask the landowner first.",
     "src":src,"sv78":1,"pinconf":"C","pinev":["Placed on the 1878 county-atlas stamp, registered to the app's 1878 map; the 1878 maps are often 100-450 m off","Unconfirmed, one source"]}
  if gm:
    g=next(v for v in G.values() if v['name']==gm.group(1))
    p.update(n=f"{g['name']} site (1878 map and USGS topo)",la=float(g['lat']),lo=float(g['lon']))
    p['src'].append([f"USGS GNIS: {g['name']} (feature {g['gnis']}, from the {g['from_topo']} topo)",f"https://edits.nationalmap.gov/apps/gaz-domestic/public/summary/{g['gnis']}"])
    p['pinev']=[f"On the USGS place-name point for {g['name']}; the 1878 atlas draws a schoolhouse within about 300 m"]
    stats['gnis']+=1
  else: stats['new']+=1
  new.append(p)
print(stats,len(new),len(edit))
json.dump({"new":new,"edit":edit},open('/home/user/gold-atlas/tools/batch225/spec-v236.json','w'),indent=1)
