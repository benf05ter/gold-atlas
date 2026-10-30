# v229: adds the final Find a Grave batch (research/schools-churches/out/cem-fag-all-rows.json,
# [id, name, state, county, lat, lon, url, memorials, earliest deaths, description]) to CEM_LAYER.
# Rows within 300 m of a Find a Grave row already in the layer are skipped. usage: add_fag_all.py rows.json og-data.js
import sys,json,re,math
R=json.load(open(sys.argv[1])); f=sys.argv[2]; s=open(f,encoding='utf-8').read()
assert 'v229 Find a Grave' not in s,'already added'
m=re.search(r'^const CEM_LAYER=(\[.*\]);$',s,re.M); old=json.loads(m.group(1))
have=[r for r in old if isinstance(r[0],str)]
def d(a,b,c,e): return 6371000*math.hypot(math.radians(c-a),math.radians(e-b)*math.cos(math.radians(a)))
def desc(t):
  t=' '.join((t or '').split())
  for k in range(10,max(10,len(t)-20)):   # the PC export often repeats the description twice
    if t[k:].lstrip().startswith(t[:min(k,40)].strip()): t=t[:k].strip(); break
  if len(t)>220: t=t[:220].rsplit(' ',1)[0]+'...'
  return t
add=[];skip=0
for r in R:
  if any(d(r[4],r[5],h[4],h[5])<300 for h in have): skip+=1; continue
  n=int(r[7]) if str(r[7]).isdigit() else 0
  t=f"Find a Grave lists {n} memorial{'s' if n!=1 else ''} here." if n else "Find a Grave lists this burial ground."
  if desc(r[9]): t+=' '+desc(r[9])
  if re.search(r'family|farm|pioneer|private|homestead',r[1]+' '+(r[9] or ''),re.I) or 0<n<=15:
    t+=' A family or pioneer burial ground marks a homestead close by; search the farm ground around it, never the plot.'
  else: t+=' Look only.'
  add.append([r[0],r[1],r[2],r[3],round(r[4],5),round(r[5],5),'',t,r[6]])
open(f,'a',encoding='utf-8').write('\n// v229 Find a Grave family, farm and pioneer cemeteries (research/schools-churches/out/cem-fag-all-rows.json)\nCEM_LAYER.push(...'+json.dumps(add,separators=(',',':'),ensure_ascii=False)+');\n')
print(len(add),'added',skip,'skipped')
