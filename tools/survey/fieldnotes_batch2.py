# fieldnotes_batch2.py <og-data.js> : field notes read on Neb's PC, relayed 2026-10-30 ~11:05Z. Idempotent (marker FIELDNOTESB2).
# T28N R8W (Chippewa Falls, Stuntz, Sept 1849; notes AQTUDUQ6M3WYKW8W) and T28N R9W (Stuntz, Aug 1849; notes AYZFEZIOHWUB7P8C), T26N R13W (Anderson, Sept 1849; notes A4UC5FU32Q32SD8W), T30N R7W (Stuntz, Oct 1849; notes AYL5UFMWM5W2K68Y), T28N R13W (Jarrett, Oct 1849; notes AX2GHH2YILALCU8M).
# Pins moved >100 m: none. New pins: gs-armitage-farm-1849, gs-sugar-camp-t28n-r8w-21, gs-sugar-camp-t28n-r8w-29 (quarter-section only).
import sys,re,json
og=sys.argv[1]; c=open(og,encoding='utf-8').read()
if 'FIELDNOTESB2' in c: print('already patched'); sys.exit()
N8=["Surveyors' field notes, T28N R8W (Stuntz, deputy surveyor, September 1849), UW Digital Collections","https://search.library.wisc.edu/digital/AQTUDUQ6M3WYKW8W"]
N9=["Surveyors' field notes, T28N R9W (Stuntz, deputy surveyor, August 1849), UW Digital Collections","https://search.library.wisc.edu/digital/AYZFEZIOHWUB7P8C"]
def put(id_,f):
  global c
  m=re.search(r'\{"id":"%s".*?"gs":1\}'%re.escape(id_),c); assert m,id_; o=json.loads(m[0]); f(o)
  c=c[:m.start()]+json.dumps(o,ensure_ascii=False,separators=(',',':'))+c[m.end():]
def falls(o):
  o['y']='1849'
  o['st']=o['st'].replace(" This is Chippewa Falls as the surveyors found it, a company mill village.",
    " The September 1849 field notes walk straight through it on the line between secs. 5 and 6, going south to the river: James Allen's garden (50.40 to 53.40 chains), "
    "James Allen's frame house 30 links east of the line (53.90), a stream 60 links wide (54.50), a store and dwelling house 20 links east (62.90), a carpenter's shop 50 links west (64.90), "
    "a blacksmith shop (66.40), the mill race coming from the east (67.65) and the river bank at 68.40, where Allen's saw mill bore northwest 150 links. "
    "The surveyor's summary: James Allen & Co. had four saws in successful operation and a lath mill nearly completed, with one store, one tavern, one blacksmith shop and several dwelling houses, all in the W1/2 SW1/4 of sec. 5 and the E1/2 SE1/4 of sec. 6. "
    "This is Chippewa Falls as the surveyors found it, a company mill village.",1)
  o['src'].append(N8); o['pinev'].append("Field notes T28N R8W, south between secs. 5 and 6: store and dwelling house 20 links east of the line at 62.90 chains; the pin is within about 100 m of the house, store and shops.")
def thomas(o):
  o['st']=o['st'].replace(" Mixed open ground today"," The August 1849 field notes cross that road on the line between secs. 27 and 34 at 41.00 chains (Road from the Falls of Chippewa River to the L'Eau Claire Mills); the mill itself is drawn on the plat but was not on a surveyed line. Mixed open ground today",1)
  o['src'].append(N9)
N13=["Surveyors' field notes, T26N R13W (A. Anderson, deputy surveyor, September 1849), UW Digital Collections","https://search.library.wisc.edu/digital/A4UC5FU32Q32SD8W"]
def colburn(o):
  o['st']=o['st'].replace(" Farm field or pasture today"," The September 1849 field notes confirm it: the line between secs. 14 and 23 enters A. Coleburn's field at 2.50 chains and leaves it at 8.85 chains (it contains about 40 acres), and the line between secs. 23 and 24 runs through the same field from 69.00 to 79.00 chains, so the field filled the northeast corner of sec. 23. The surveyor's summary: one square mile of prairie (sec. 23) with a field on it belonging to Colburn of about 40 acres, where his house is on the Red Cedar; it is a good location for a town. A road ran northwest across the prairie (crossing the sec. 23/24 line at 24.70 chains and the sec. 22/23 line at 29.00 chains). Farm field or pasture today",1)
  o['src'].append(N13); o['pinev'].append("Field notes T26N R13W: West corrected between secs. 14 and 23, 2.50-8.85 chains: A. Coleburn's field; the pin is about 70 m from the middle of the chained field.")
N7=["Surveyors' field notes, T30N R7W (Stuntz, deputy surveyor, October 1849), UW Digital Collections","https://search.library.wisc.edu/digital/AYL5UFMWM5W2K68Y"]
def mccann(o):
  o['st']=o['st'].replace(" Farm field or pasture today"," The October 1849 field notes list six dwelling houses in the township, one in the SW1/4 NW1/4 of sec. 2 belonging to Daniel McCann and another in the NW1/4 NW1/4 of sec. 2. The notes put McCann's house about 400 m east of this pin (the plat label sits on the sec. 3 side), so check both. Farm field or pasture today",1)
  o['src'].append(N7)
def sugar(o):
  o['st']=o['st'].replace(" Farm field or pasture today"," The October 1849 field notes cross it on the line between secs. 20 and 21: enter Sugar camp at 47.00 chains (it lies to the southeast), leave it at 69.00 chains, with a small stream 8 links wide at each edge. Farm field or pasture today",1)
  o['src'].append(N7); o['pinev'].append("Field notes T30N R7W, north between secs. 20 and 21, 47.00-69.00 chains: Sugar camp; the pin is within about 50 m of the line.")
def jf(o):
  o['st']=o['st'].replace(" The mark lands on water today"," The October 1849 field notes say one house in sec. 20 belonged to Donaldson & Co. on the east side of the river and one on the west side was owned by Gauthier. They call the falls Armitage's falls: the river falls about 50 feet in 3/4 of a mile. The mark lands on water today",1)
  o['src'].append(N7)
put('gs-chippewa-falls-1849',falls); put('gs-thomas-mill-1850',thomas); put('gs-colburn-field',colburn)
N13M=["Surveyors' field notes, T28N R13W (Jesse S. Jarrett, deputy surveyor, October 1849), UW Digital Collections","https://search.library.wisc.edu/digital/AX2GHH2YILALCU8M"]
def bw(o):
  o['st']=o['st'].replace(" Built-up ground today"," The October 1849 field notes, north on the line between secs. 26 and 27, cross the Red Cedar from 58.00 to 62.12 chains, then enter a pasture field at 62.45 chains that runs to 75.00 chains, with a road bearing northeast at 76.00 chains, just below the corner where the plat draws the mill. Built-up ground today",1)
  o['src'].append(N13M)
def gil(o):
  o['st']=o['st'].replace(" Wooded today"," The October 1849 field notes confirm the pond: going north on the line between secs. 27 and 28, the surveyor leaves the Mill Pond at 0.22 chains, bearing northwest. Wooded today",1)
  o['src'].append(N13M)
put('gs-black-wilson-mill',bw); put('gs-gilbert-mill',gil)
put('gs-dan-mccann',mccann); put('gs-sugar-camp-jim-falls-east',sugar); put('gs-jim-falls-houses',jf)
def camp(id_,la,lo,sec,q,ground):
  return {"id":id_,"L":"camp","n":f"Sugar camp, {q}1/4 sec. {sec} (1849 survey)","la":la,"lo":lo,"y":"1849","pl":f"Chippewa County, {q}1/4 sec. {sec}, T28N R8W","co":"Chippewa","stt":"WI",
   "v":"Look only: camp hearths, kettle pieces","c":"documented","s":"unknown","p":"plss",
   "st":f"The 1849 surveyor's summary of the township says There is a Sugar Camp on the S.E.1/4 of Section 21 and the N.E.1/4 of Section 29, southeast of the Falls. Maple sugar camps like this were Ojibwe spring camps. The notes name only the quarter section, so the pin is the middle of the quarter. {ground} Unconfirmed: one source.",
   "t":"Treat it as an archaeological site: look, photograph, leave in place. Look for the maple stand on the dry ground in the quarter. Turn on the Survey 1840s-50s map type to see the plat over today's map.",
   "src":[N8],"pinconf":"C","pinev":[f"Placed at the middle of the {q}1/4 of sec. 21/29 named in the field notes' general description (good to about 400 m: the notes name the quarter, not a spot).".replace('21/29',str(sec))],"gs":1}
W="Wooded today with no building within 60 m."; F="Farm field today with no building close by."
ARM={"id":"gs-armitage-farm-1849","L":"history","n":"James Armitage's house and farm at Jim Falls (1849 survey)","la":45.0583,"lo":-91.2792,"y":"1849","pl":"Chippewa County, NE1/4 NW1/4 sec. 30, T30N R7W","co":"Chippewa","stt":"WI","v":"Early coins, buttons, trade silver, farm and household items","c":"documented","s":"unknown","p":"plss","st":"The October 1849 surveyor wrote that there is a farm in secs. 30 and 31 on the west side of the river belonging to James Armitage, who lives on the NE1/4 of the NW1/4 of sec. 30, and he called the rapids in sec. 30 Armitage's falls. Armitage is very likely the surveyor's spelling of James Ermatinger, the early trader the village of Jim Falls is named after. The notes name the forty, not the house spot, so the pin is the middle of the forty. Farm field today with no building close by: plowed, so finds are scattered in the plow zone.","t":"Walk the forty for a house hollow or a scatter of brick and glass, and look at the 1938 aerial. Private land: ask first. Turn on the Survey 1840s-50s map type to see the plat over today's map.","src":[N7],"pinconf":"C","pinev":["Placed at the middle of the NE1/4 NW1/4 of sec. 30 named in the field notes' general description (good to about 200 m)."],"gs":1}
NEW=[ARM,camp("gs-sugar-camp-t28n-r8w-21",44.88994,-91.35316,21,"SE",W),camp("gs-sugar-camp-t28n-r8w-29",44.88266,-91.37341,29,"NE",F)]
UG={"gs-armitage-farm-1849":["B","Farm field today with no building close by: plowed, so finds are scattered in the plow zone."],"gs-sugar-camp-t28n-r8w-21":["X",W+" Look only: an Ojibwe sugar camp is an archaeological site."],"gs-sugar-camp-t28n-r8w-29":["X",F+" Look only: an Ojibwe sugar camp is an archaeological site."]}
c=c.rstrip('\n')+'\n// FIELDNOTESB2: field notes T28N R8W and T28N R9W (1849): Chippewa Falls mill village, two sugar camps\n'
c+='DATA.points.push(...'+json.dumps(NEW,ensure_ascii=False,separators=(',',':'))+');\n'
c+='Object.assign(UG,'+json.dumps(UG,ensure_ascii=False,separators=(',',':'))+');\n'
open(og,'w',encoding='utf-8').write(c); print('patched',og)
