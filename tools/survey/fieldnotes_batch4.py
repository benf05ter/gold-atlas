# fieldnotes_batch4.py <og-data.js> : field notes read on Neb's PC, relayed 2026-10-30 from 12:05Z. Idempotent (marker FIELDNOTESB4).
# T29N R12W (Jarrett, Aug 1849; notes AW5AGXSV227SKN8L), T26N R14W (Anderson, Nov 1848; notes A52WICIW6NN4N384). T26N R5W and T27N R5W (J. G. Clark, 1853), T31N R6W (Harrison, Nov 1852; notes AZFJR424TF2TSD82), T23N R5W (Phipps 1853), T25N R13W, T27N R14W (1849). Also notes the 1848 Large Spring on pd88-maple-spring-eau-galle.
# Pins moved >100 m: gs-merrill-clearing (about 950 m north, to the field-note house). New pins: none.
import sys,re,json
og=sys.argv[1]; c=open(og,encoding='utf-8').read()
if 'FIELDNOTESB4' in c: print('already patched'); sys.exit()
def put(id_,f):
  global c
  m=re.search(r'\{"id":"%s".*?"gs":1\}'%re.escape(id_),c); assert m,id_; o=json.loads(m[0]); n=o['st']; f(o); assert o['st']!=n,id_
  c=c[:m.start()]+json.dumps(o,ensure_ascii=False,separators=(',',':'))+c[m.end():]
def ins(id_,txt,anchor,src):
  def f(o):
    st=o['st']; assert anchor in st,(id_,anchor); i=st.index(anchor); o['st']=st[:i]+txt+st[i:]; o['src'].append(src)
  put(id_,f)
ins('gs-cedar-falls-1849'," The August 1849 field notes cross the river right at this corner (the line between secs. 4 and 5 meets the left bank at 56.18 chains, and the line between secs. 5 and 8 starts on the right bank) but record no buildings on the lines and name no settlers, so the buildings rest on the plat drawing alone.",
  " Wooded today",["Surveyors' field notes, T29N R12W (Jarrett, deputy surveyor, August 1849), UW Digital Collections","https://search.library.wisc.edu/digital/AW5AGXSV227SKN8L"])
NEG=["Surveyors' field notes, T26N R14W (A. Anderson, deputy surveyor, November 1848), UW Digital Collections","https://search.library.wisc.edu/digital/A52WICIW6NN4N384"]
ins('gs-eau-galle-field'," The surveyor's November 1848 summary: the pine has been mostly cut off, and the Eau Galle Mill is about 10 chains east of the line between secs. 31 and 36, on the range line.",
  " Built-up ground today",NEG)
N26=["Surveyors' field notes, T26N R5W (J. G. Clark, deputy surveyor, 1853), UW Digital Collections","https://search.library.wisc.edu/digital/A2PVHHH7IRE5M78K"]
N27=["Surveyors' field notes, T27N R5W (J. G. Clark, deputy surveyor, 1853), UW Digital Collections","https://search.library.wisc.edu/digital/AWZJBVWF74IDCU8O"]
ins('gs-shanties-t27n-r5w'," The 1853 field notes, north on the line between secs. 26 and 27, cross the river (rock bottom, very rapid) and at 65.70 chains note a road bearing northeast, One Shanty bearing east about 40 links and two Cabins west about 50 links. The surveyor's summary: an excellent road used by the lumbermen passes north to south through the township, with logging shanties on the NW1/4 of sec. 26 and NE1/4 of sec. 27 and a mill site in the NW1/4 of sec. 26.",
  " Wooded today",N27)
ins('gs-shanties-t26n-r5w-north'," The 1853 surveyor's summary confirms a number of logging shanties on the NE1/4 of sec. 3, and roads leading to the pineries through the black pine along the Eau Claire.",
  " Wooded today",N26)
ins('gs-shanty-t26n-r5w-south'," The 1853 field notes cross the roads here: one bears north and crosses the river 4.50 chains west of this corner, and east-west roads cross the lines between secs. 20 and 21 and secs. 21 and 22 at about 58 chains.",
  " Wooded today",N26)
N31=["Surveyors' field notes, T31N R6W (Jesse M. Harrison, deputy surveyor, November 1852), UW Digital Collections","https://search.library.wisc.edu/digital/AZFJR424TF2TSD82"]
ins('gs-sugar-camp-t31n-r6w'," The circle sits mostly east of the range line, so the camp itself is largely in T31N R5W; the 1852 field notes for the lines around it record nothing, so the camp rests on the plat drawing alone.",
  " Farm field or pasture today",N31)
N23=["Surveyors' field notes, T23N R5W (Charles Phipps, deputy surveyor, 1853), UW Digital Collections","https://search.library.wisc.edu/digital/AQTA2QDMG23CLD8M"]
N25=["Surveyors' field notes, T25N R13W (1849), UW Digital Collections","https://search.library.wisc.edu/digital/AQNPBZ7NHN46228C"]
N27W=["Surveyors' field notes, T27N R14W (Jarrett, deputy surveyor, September 1849), UW Digital Collections","https://search.library.wisc.edu/digital/AHTDVQCELWCU3B8L"]
def merrill(o):
  o.update(la=44.4382,lo=-90.9358,pl='Jackson County, sec. 25 (by the line with sec. 36), T23N R5W')
  o['st']=("The survey plat writes Merrill's by a house mark on the road with a dotted clearing around it. The 1853 field notes fix it: going west on the line between secs. 25 and 36, a road bearing N10E at 38.00 chains, "
    "Enter Merrell's Field at 39.70 chains, a House 5 chains North at 50.00 chains, and leave the field of 40 acres at 61.00 chains. So the house stood just north of the line in sec. 25, about 950 m north of where the pin first sat, "
    "and Humphrey Merrill's land patents are in sec. 25 too. Farm field today with no building close by: plowed, so finds are scattered in the plow zone.")
  o['src']+= [N23,["First land patents, 24 core counties (BLM General Land Office records), project table research/land-entries/first-patents-24-counties.tsv","https://glorecords.blm.gov/"]]
  o['pinconf']='B'; o['pinev']=["Placed from the field notes: 50.00 chains west on the line between secs. 25 and 36, then 5 chains north (section corners from the BLM survey), good to about 30-50 m."]
put('gs-merrill-clearing',merrill)
ins('gs-field-t25n-r13w'," The 1849 field notes, south on the line between secs. 5 and 6, enter the field at 37.26 chains (it lies northwest), leave it at 40.30 chains, and cross a road bearing northwest at 40.96 chains; the pin is about 110 m west of that crossing, inside the field.",
  " Farm field or pasture today",N25)
ins('gs-large-spring'," The 1849 surveyor wrote that the streams here are mostly made from large springs flowing from the sand rock; the lines around sec. 21 note no spring, so the label rests on the plat alone.",
  " Built-up ground today",N27W)
m=re.search(r'\{"id":"pd88-maple-spring-eau-galle"[^{}]*\}',c); assert m
o=json.loads(m[0]); k=' It is farm field'; assert k in o['st']
o['st']=o['st'].replace(k," The 1848 government survey plat already writes Large Spring at the head of a long marsh near the corner of secs. 7, 8, 17 and 18, about 500 m west, almost certainly this same spring: it was a known stop 40 years before the plat book."+k,1)
o['src'].append(["Original government survey plat, T26N R14W (General Land Office, Wisconsin Public Land Survey Records, 1848), UW Digital Collections","https://search.library.wisc.edu/digital/A2QWGBN3EDP2EO9D"])
c=c[:m.start()]+json.dumps(o,ensure_ascii=False,separators=(',',':'))+c[m.end():]
c=c.rstrip('\n')+'\n// FIELDNOTESB4: field notes batch 4\n'
open(og,'w',encoding='utf-8').write(c); print('patched',og)
