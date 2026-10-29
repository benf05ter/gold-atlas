# Batch 2 of the 1878 Snyder, Van Vechten county atlas (v145): ten more county pages in the "1800s" map type, plus 16 places read from them.
# usage: python3 patch78b.py <atlas-dir> <pins-b2.json> <sheets-b2.json>   (run after patch78.py; idempotent)
# Sheets were warped the same way as the Eau Claire page (thin-plate fit to BLM PLSS township corners, see warp78.py).
import sys,os,json
d,pins,sheets=sys.argv[1:4]
page=os.path.join(d,'index.html') if os.path.exists(os.path.join(d,'index.html')) else os.path.join(d,'Upper-Midwest-Gold-Atlas.html')
og=os.path.join(d,'og-data.js')
P=json.load(open(pins)); SH=json.load(open(sheets))
c=open(og,encoding='utf-8').read()
if P[0]['id'] not in c:
  c=c.rstrip('\n')+'\n// 1878 county atlas, batch 2 (v145): places drawn on the Barron, St. Croix, Pierce, Polk, Buffalo, Jackson and Trempealeau pages\n'
  c+='DATA.points.push(...'+json.dumps(P,ensure_ascii=False,separators=(',',':'))+');\n'
  open(og,'w',encoding='utf-8').write(c)
h=open(page,encoding='utf-8').read()
def rep(a,b):
  global h
  assert h.count(a)==1,(a[:80],h.count(a)); h=h.replace(a,b)
if SH[0][0] not in h:
  rep(" OM19.push(...OM78);"," OM78.push(..."+json.dumps(SH)+");   // 1878 county pages around Eau Claire (v145)\n  OM19.push(...OM78);")
  rep("town plats that never grew.</p>","town plats that never grew. The same atlas's pages for Dunn, Clark, Jackson, Trempealeau, Barron, St. Croix, Pierce, Polk, southern Chippewa and northern Buffalo counties are fitted the same way and land within about 300 to 500 m.</p>")
  rep("and the 1878 county atlas around Eau Claire.'","and the 1878 county atlas for Eau Claire and ten nearby counties.'")
open(page,'w',encoding='utf-8').write(h)
print('patched',page,len(h),os.path.getsize(og))
