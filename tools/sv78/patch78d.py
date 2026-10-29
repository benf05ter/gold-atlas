# Batch 4 of the 1878 Snyder, Van Vechten county atlas (v155): thirteen town plans in the "1800s" map type
# (Chippewa Falls, Neillsville, Menomonie, Hudson, Barron, River Falls, Black River Falls, Sparta, Galesville, Trempealeau,
# Arcadia, Medford, Grand Rapids), each fitted to the section corners it prints, plus pins for what the plans show.
# usage: python3 patch78d.py <atlas-dir> <pins-b4.json> <sheets-b4.json>   (run after patch78c.py; idempotent)
# In the Claude artifact these plans join the om19/sv78b.json bundle; the app ships the webps and pre-cut o78 tiles.
import sys,os,json
d,pins,sheets=sys.argv[1:4]
page=os.path.join(d,'index.html') if os.path.exists(os.path.join(d,'index.html')) else os.path.join(d,'Upper-Midwest-Gold-Atlas.html')
og=os.path.join(d,'og-data.js')
P=json.load(open(pins)); SH=json.load(open(sheets))
c=open(og,encoding='utf-8').read()
if P[0]['id'] not in c:
  c=c.rstrip('\n')+'\n// 1878 county atlas, batch 4 (v155): what the town plans show\n'
  c+='DATA.points.push(...'+json.dumps(P,ensure_ascii=False,separators=(',',':'))+');\n'
  open(og,'w',encoding='utf-8').write(c)
h=open(page,encoding='utf-8').read()
def rep(a,b):
  global h
  assert h.count(a)==1,(a[:80],h.count(a)); h=h.replace(a,b)
if SH[0][0] not in h:
  old='const SV78B=new Set(["sv78_pepin_co", "sv78_buffalo_s", "sv78_chippewa_n"])'
  F=["sv78_pepin_co","sv78_buffalo_s","sv78_chippewa_n"]+[r[0] for r in SH]
  rep(old,"OM78.push(..."+json.dumps(SH)+");   // 1878 town plans (v155)\n  const SV78B=new Set("+json.dumps(F)+")")
  rep("(northern Chippewa is today's Price, Rusk and Sawyer) are fitted the same way and land within about 300 to 500 m.",
      "(northern Chippewa is today's Price, Rusk and Sawyer) are fitted the same way and land within about 300 to 500 m. Its town plans of Chippewa Falls, Menomonie, Hudson, River Falls, Barron, Neillsville, Black River Falls, Sparta, Galesville, Trempealeau, Arcadia, Medford and Grand Rapids (now Wisconsin Rapids) are fitted to the section corners they print and land within about 50 to 150 m.")
  rep("the 1878 county atlas for Eau Claire and eleven nearby counties.'","the 1878 county atlas for Eau Claire and eleven nearby counties, with thirteen town plans.'")
# app: the town plans get their own tile layer o78t, cut down to street level (z16); the county pages stay in o78 (z13)
if "o78:()=>GM.type==='1800s'," in h and 'o78t' not in h:
  rep("o78:()=>GM.type==='1800s',","o78:()=>GM.type==='1800s',o78t:()=>GM.type==='1800s',")
  rep("for(const id of ['o250','o15','o19','o78',","for(const id of ['o250','o15','o19','o78','o78t',")
  rep("set('o78',Math.min(1,+r19.value/100)); }","set('o78',Math.min(1,+r19.value/100)); set('o78t',Math.min(1,+r19.value/100)); }")
open(page,'w',encoding='utf-8').write(h)
print('patched',page,len(h),os.path.getsize(og))
