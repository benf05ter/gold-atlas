# fieldnotes_batch3.py <og-data.js> : field notes read on Neb's PC, relayed 2026-10-30 from 11:38Z. Idempotent (marker FIELDNOTESB3).
# T27N R13W (A. Anderson, Sept 1849; notes ANSHKSVMC2BY6K8S), T29N R9W (Stuntz, Sept 1849; notes AL66UZG3KGIM5Z8T), T27N R12W (Jarrett, Aug 1849; notes AXKRZQ7ZFNJ2SS83).
# Pins moved >100 m: none. New pins: gs-herd-mill-1849.
import sys,re,json
og=sys.argv[1]; c=open(og,encoding='utf-8').read()
if 'FIELDNOTESB3' in c: print('already patched'); sys.exit()
def put(id_,f):
  global c
  m=re.search(r'\{"id":"%s".*?"gs":1\}'%re.escape(id_),c); assert m,id_; o=json.loads(m[0]); n=o['st']; f(o); assert o['st']!=n,id_
  c=c[:m.start()]+json.dumps(o,ensure_ascii=False,separators=(',',':'))+c[m.end():]
N13S=["Surveyors' field notes, T27N R13W (A. Anderson, deputy surveyor, September 1849), UW Digital Collections","https://search.library.wisc.edu/digital/ANSHKSVMC2BY6K8S"]
N9=["Surveyors' field notes, T29N R9W (Stuntz, deputy surveyor, September 1849), UW Digital Collections","https://search.library.wisc.edu/digital/AL66UZG3KGIM5Z8T"]
def myers(o):
  o['st']=o['st'].replace(" Farm field or pasture today"," The September 1849 field notes: John Myers has a farm on the N.E. quarter of Section 22 containing about 100 acres and has raised a good crop of oats, wheat, barley, potatoes and buckwheat this season. A road ran west across the line between secs. 22 and 23 at 78.00 chains, just south of the corner, and bore S70W across the line between secs. 14 and 23. Farm field or pasture today",1)
  o['src'].append(N9)
  o['st']=o['st'].replace(" A road ran west"," George Myers took the first land patent on this forty in 1854. A road ran west",1); o['src'].append(LE)
def rc(o):
  o['st']=o['st'].replace(" Wooded today"," The 1849 surveyor wrote that the river through secs. 3 and 10 is very rapid and runs like a mill tail, a good chance for mills; an Indian trail followed the east bank (crossing the sec. 10/15 line at 35.00 chains and the sec. 10/11 line at 5.50 chains). Wooded today",1)
  o['src'].append(N13S)
def unity(o):
  st=o['st']; k='whether one was built is not known.'; assert k in st; i=st.index(k)+len(k)
  o['st']=st[:i]+" The August 1849 field notes record nothing built here and name no settlers in the township (oak barrens and small marshes): in 1849 this was only a mill site the surveyor thought good, so look for a later mill, not an 1849 one."+st[i:]
  o['src'].append(["Surveyors' field notes, T27N R12W (Jarrett, deputy surveyor, August 1849), UW Digital Collections","https://search.library.wisc.edu/digital/AXKRZQ7ZFNJ2SS83"])
LE=["First land patents, 24 core counties (BLM General Land Office records), project table research/land-entries/first-patents-24-counties.tsv","https://glorecords.blm.gov/"]
def addpat(id_,txt,anchor):
  def f(o):
    st=o['st']; assert anchor in st,(id_,anchor); i=st.index(anchor); o['st']=st[:i]+txt+st[i:]; o['src'].append(LE)
  put(id_,f)
addpat('gs-gilbert-mill',' The Gilberts took the first land patents on the mill-pond forties in 1852-55.',' Wooded today')
addpat('gs-black-wilson-mill',' Thomas B. Wilson (with Knapp, Stout and Tainter) took the first patent on the mill forty in 1855.',' Built-up ground today')
addpat('gs-colburn-field'," Colburn's own land patents are in secs. 24 and 25, east of this field, which fits the notes' house on the Red Cedar.",' Farm field or pasture today')
put('gs-unity-mill-site',unity); put('gs-myers-house',myers); put('gs-red-cedar-mill-t27n-r13w',rc)
HERD={"id":"gs-herd-mill-1849","L":"history","n":"Herd's mill and house on the creek (1849 survey)","la":44.83569,"lo":-91.95921,"y":"1849","pl":"Dunn County, sec. 9, T27N R13W","co":"Dunn","stt":"WI",
 "v":"Mill irons, early coins, buttons, household items from the mill house","c":"documented","s":"unknown","p":"plss",
 "st":"The survey plat writes Herd's Mill and House on the creek west of the Red Cedar below Menomonie. The September 1849 field notes, north on the line between secs. 9 and 10, pass a ledge of rock 25 feet high at 31.00 chains and a creek 25 links wide at 32.00 chains, and at 34.29 chains the surveyor took bearings: a house N. 70 1/2 W. 14.00 chains and a mill S. 89 1/2 W. 16.00 chains. His note: Herd's mill on this creek is a small affair, one saw, and very little timber around. Wooded today with no building within 60 m: the 1849 surface may never have been plowed. The house stood about 100 m north of the mill.",
 "t":"Walk the creek bank at the pin for the mill seat and dam, then the higher ground to the north for the house. Private land: ask first. Turn on the Survey 1840s-50s map type to see the plat over today's map.",
 "src":[N13S,["Original government survey plat, T27N R13W (General Land Office, Wisconsin Public Land Survey Records, 1849), UW Digital Collections","https://search.library.wisc.edu/digital/AZXW2A3TGAG7GH8B"]],
 "pinconf":"B","pinev":["Placed from the surveyor's bearing and distance (S. 89 1/2 W. 16.00 chains from 34.29 chains on the line between secs. 9 and 10; section corners from the BLM survey), good to about 30-50 m."],"gs":1}
UG={"gs-herd-mill-1849":["A","Wooded today with no building within 60 m: the 1849 surface may never have been plowed."]}
c=c.rstrip('\n')+'\n// FIELDNOTESB3: field notes batch 3 (1849): Herd\'s mill, Myers farm\n'
c+='DATA.points.push(...'+json.dumps([HERD],ensure_ascii=False,separators=(',',':'))+');\n'
c+='Object.assign(UG,'+json.dumps(UG,ensure_ascii=False,separators=(',',':'))+');\n'
open(og,'w',encoding='utf-8').write(c); print('patched',og)
