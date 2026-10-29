# 1878 Snyder, Van Vechten county atlas in the "1800s" map type, plus the pins read from it (sv78-*).
# usage: python3 patch78.py <atlas-dir> <pins.json> <enrich.json>   (atlas-dir holds index.html or Upper-Midwest-Gold-Atlas.html + og-data.js; idempotent)
# The sheets (om19/sv78_*.webp) are warped by warp78.py (county pages, fitted to the BLM township corners) and warp_aff.py (city plans,
# fitted to the section corners printed on them). App tiles: layer o78 in tools/tiles/spec.json.
import sys,os,json
d,pins,enr=sys.argv[1:4]
page=os.path.join(d,'index.html') if os.path.exists(os.path.join(d,'index.html')) else os.path.join(d,'Upper-Midwest-Gold-Atlas.html')
og=os.path.join(d,'og-data.js')
SHEETS=[["sv78_eau_claire_co","Eau Claire County (1878 county atlas)",1878,63360,"WI",-91.65123,-90.92033,44.59612,44.85849,300,2],
        ["sv78_eau_claire_city","Eau Claire city plan (1878 county atlas)",1878,14400,"WI",-91.53926,-91.48708,44.79248,44.82278,100,2]]
c=open(og,encoding='utf-8').read()
P=json.load(open(pins)); E=json.load(open(enr))
if 'SV78_ENRICH' not in c:
  c=c.rstrip('\n')+'\n// 1878 Historical Atlas of Wisconsin (Snyder, Van Vechten): places drawn on the Eau Claire County page and city plan\n'
  c+='DATA.points.push(...'+json.dumps(P,ensure_ascii=False,separators=(',',':'))+');\n'
  c+='const SV78_ENRICH='+json.dumps(E,ensure_ascii=False,separators=(',',':'))+';\n'
  open(og,'w',encoding='utf-8').write(c)
h=open(page,encoding='utf-8').read()
def rep(a,b):
  global h
  assert h.count(a)==1,(a[:80],h.count(a)); h=h.replace(a,b)
if 'SV78_ENRICH' not in h:
  a="  document.addEventListener('click',e=>{ const a=e.target.closest('a.frpin');"
  i=h.index(a); j=h.index('\n',i)+1
  h=h[:j]+"""// 1878 county atlas (v142): what the Snyder, Van Vechten map draws at pins already on the map; data in og-data.js
{ if(typeof SV78_ENRICH!=='undefined'){ const S=["Historical Atlas of Wisconsin (Snyder, Van Vechten & Co., Milwaukee, 1878), David Rumsey Map Collection copy on archive.org","https://archive.org/details/dr_map-of-eau-claire-county-state-of-wisconsin-copyright-1877-by-snyder-va-00484084"];
  for(const p of DATA.points){ const e=SV78_ENRICH[p.id]; if(e){ p.st=(p.st||'')+e; if(!(p.src||[]).some(y=>y[0]===S[0])) p.src=[...(p.src||[]),S]; } } } }
"""+h[j:]
if 'const OM78=' not in h:
  rep("  const CNW={b:[-94.6,-86.9,41.8,47.9]","  const OM78="+json.dumps(SHEETS)+"; OM19.push(...OM78);   // 1878 county atlas sheets (v142)\n  const CNW={b:[-94.6,-86.9,41.8,47.9]")
  rep("const fitTxt=r=>r[10]?","const fitTxt=r=>r[10]===2?'fitted to the survey lines, about '+r[9]+' m':r[10]?")
  a="    <ul>${OM19.slice().sort((a,b)=>a[2]-b[2])"
  rep(a,"""    <p class="hint">Around Eau Claire: the <i>Historical Atlas of Wisconsin</i> (Snyder, Van Vechten &amp; Co., Milwaukee, 1878), from the David Rumsey Map Collection copy on archive.org. The county page is fitted to the government survey township lines, so places land within about 300 m; the city plan is fitted to the section corners printed on it and lines up with Half Moon Lake and both rivers within about 100 m. It shows the 1878 roads, mills, farms by owner, schoolhouses, the race track, fair grounds and town plats that never grew.</p>
"""+a)
  rep("the 1890 North-Western railway map when zoomed out.'","the 1890 North-Western railway map when zoomed out, and the 1878 county atlas around Eau Claire.'")
# app tiles (only where the tile code is present)
if "o19:()=>GM.type==='1800s'," in h and 'o78:' not in h:
  rep("o19:()=>GM.type==='1800s',","o19:()=>GM.type==='1800s',o78:()=>GM.type==='1800s',")
  rep("for(const id of ['o250','o15','o19',","for(const id of ['o250','o15','o19','o78',")
  rep("if(/^(h15_|h250_|h19_|","if(/^(h15_|h250_|h19_|sv78_|")
  rep("if(r19) set('o19',Math.min(1,+r19.value/100));","if(r19){ set('o19',Math.min(1,+r19.value/100)); set('o78',Math.min(1,+r19.value/100)); }")
open(page,'w',encoding='utf-8').write(h)
print('patched',page,len(h),os.path.getsize(og))
