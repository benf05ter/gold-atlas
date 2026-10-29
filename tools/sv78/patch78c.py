# Batch 3 of the 1878 Snyder, Van Vechten county atlas (v151): Pepin, southern Buffalo and northern Chippewa pages in the "1800s" map type,
# plus 11 Flambeau logging camps read from the northern Chippewa page (Rumsey scan).
# usage: python3 patch78c.py <atlas-dir> <pins-b3.json> <sheets-b3.json>   (run after patch78.py and patch78b.py; idempotent)
# The Claude artifact is near its 511-file limit, so there these three sheets ship as one bundle om19/sv78b.json ({file: data URL});
# the page falls back to om19/<file>.webp (the app ships the webps and draws the pre-cut o78 tiles).
import sys,os,json
d,pins,sheets=sys.argv[1:4]
page=os.path.join(d,'index.html') if os.path.exists(os.path.join(d,'index.html')) else os.path.join(d,'Upper-Midwest-Gold-Atlas.html')
og=os.path.join(d,'og-data.js')
P=json.load(open(pins)); SH=json.load(open(sheets))
c=open(og,encoding='utf-8').read()
if P[0]['id'] not in c:
  c=c.rstrip('\n')+'\n// 1878 county atlas, batch 3 (v151): logging camps on the upper Flambeau from the northern Chippewa page\n'
  c+='DATA.points.push(...'+json.dumps(P,ensure_ascii=False,separators=(',',':'))+');\n'
  open(og,'w',encoding='utf-8').write(c)
h=open(page,encoding='utf-8').read()
def rep(a,b):
  global h
  assert h.count(a)==1,(a[:80],h.count(a)); h=h.replace(a,b)
if SH[0][0] not in h:
  F=[r[0] for r in SH]
  rep("\n  OM19.push(...OM78);","\n  OM78.push(..."+json.dumps(SH)+");   // 1878 Pepin, south Buffalo, north Chippewa (v151)\n"
      "  const SV78B=new Set("+json.dumps(F)+"); let SV78BP=null;   // these sheets come as one bundle where the side files are\n"
      "  function sv78b(im){ const f=im.dataset.f; (SV78BP||(SV78BP=fetch('om19/sv78b.json').then(r=>{ if(!r.ok) throw 0; return r.json(); }).catch(e=>{ SV78BP=null; throw e; })))\n"
      "    .then(b=>{ if(!b[f]) throw 0; im.setAttribute('href',b[f]); }).catch(()=>im.setAttribute('href','om19/'+f+'.webp')); }\n  OM19.push(...OM78);")
  rep("im.setAttribute('href','om19/'+im.dataset.f+'.webp');","{ if(SV78B.has(im.dataset.f)) sv78b(im); else im.setAttribute('href','om19/'+im.dataset.f+'.webp'); }")
  rep("pages for Dunn, Clark, Jackson, Trempealeau, Barron, St. Croix, Pierce, Polk, southern Chippewa and northern Buffalo counties","pages for Dunn, Clark, Jackson, Trempealeau, Barron, St. Croix, Pierce, Polk, Pepin, Buffalo and Chippewa counties (northern Chippewa is today's Price, Rusk and Sawyer)")
  rep("the 1878 county atlas for Eau Claire and ten nearby counties.'","the 1878 county atlas for Eau Claire and eleven nearby counties.'")
open(page,'w',encoding='utf-8').write(h)
print('patched',page,len(h),os.path.getsize(og))
