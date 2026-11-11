import json,sys
MB=lambda c:f"https://www.lpi.usra.edu/meteor/metbull.php?code={c}"
def mbs(name,c): return [f"Meteoritical Bulletin Database: {name}",MB(c)]
WG=["WGNHS: Wisconsin meteorites","https://home.wgnhs.wisc.edu/wisconsin-geology/meteorites/"]
IGS=["Iowa Geological Survey: Meteorites in Iowa","https://iowageologicalsurvey.uiowa.edu/iowa-geology/popular-interest/meteorites-iowa"]
# name, code, state, county, class, grams, fell/found, year, lat, lon, tier, tierwhy, extra story, tip, extra srcs, precision m
FALLTIP="A witnessed fall. Small stones from the same fall can lie in fields around the reported spot, but most were picked up long ago and old stones rust away in wet ground. Work freshly plowed fields with permission: a magnet cane and a detector on all-metal or ferrous."
FINDTIP="A single find, not a fall: the record gives no strewn field. Another piece here is unlikely. Read it as proof that meteorites turn up in this kind of ground: plowed fields, farmers' rock piles and gravel."
IRONTIP="Iron meteorites last far longer in the ground than stones, and they sound off loudly on any detector. Farmers' rock piles and fencerows near the find spot are the cheap first look, with permission."
P=[
("Mifflin","52090","WI","Iowa","L5 stony",3584,"fell",2010,42.9075,-90.36556,"C","Recent strewn field, mapped, sparsely recovered",
 "A fireball seen across the Midwest on the night of April 14, 2010 dropped a shower of L5 chondrite stones across Iowa County. About 3.6 kg in dozens of pieces was found, in a strewn field centered on the town of Mifflin and running from about Livingston and Montfort to Mineral Point. The stones lie sparsely along a long, narrow field, and hunters were still extending it southeast after the first weeks. This is the youngest, best-mapped fall within reach of Eau Claire.",
 "Fields, pasture and woodlot edges along the line from Livingston to Mineral Point, all private: ask every landowner. Stones are small (grams to a few hundred grams) and dark, so walk slow lines over bare plowed ground in spring and after rain, with a magnet cane.",
 [WG,["Meteorite Times: Recovery of meteorites from the 4/14/2010 fall in Wisconsin","https://www.meteorite-times.com/meteorites-wisconsin/"]],6000),
("Homestead","11901","IA","Iowa","L5 stony",230000,"fell",1875,41.755,-91.925,"C","Large strewn field of hundreds of stones",
 "On the night of February 12, 1875 a bright fireball broke up over the Amana Colonies and showered stones over a field that the Iowa Geological Survey puts at about 3 miles wide and 5 miles long, south of the Iowa River and southwest of Homestead. Counts of stones run from about 100 to over 300, with roughly 230 kg recovered, the largest about 33 kg; two big stones of 74 and 48 pounds were found south of High Amana the next spring. The pin is the middle of that field, between High Amana and Homestead.",
 "Plowed farm fields south of the Iowa River between Homestead and High Amana, with permission. 150 years of plowing and weathering mean any stone left is rusty brown, not black: a magnet cane and a detector on ferrous are the tools.",
 [IGS,["Homestead (meteorite), Wikipedia","https://en.wikipedia.org/wiki/Homestead_(meteorite)"]],5000),
("Forest City","10119","IA","Winnebago","H5 stony",152000,"fell",1890,43.36,-93.78,"D","Old strewn field of hundreds of stones",
 "On the afternoon of May 2, 1890 a fireball exploded about 11 miles northwest of Forest City, near Thompson, and showered H5 chondrite stones over a strip reported as three or four miles long and one and a half to two miles wide. Hundreds of stones were picked up, the biggest 81, 75 and 66 pounds. A fight over one stone went to the Iowa Supreme Court, which held in 1892 that a meteorite belongs to the owner of the land it falls on. The pin is near Thompson, about 11 miles northwest of Forest City, where the record puts the fall.",
 "Farm fields around Thompson, with permission. H chondrites carry plenty of metal, so a detector on ferrous helps even on old, weathered stones.",
 [IGS,["Palimpsest (State Historical Society of Iowa): the Forest City meteorite","https://pubs.lib.uiowa.edu/palimpsest/article/25244/galley/133613/download"]],8000),
("Estherville","10059","IA","Emmet","mesosiderite (stony-iron)",320000,"fell",1879,43.41667,-94.83333,"D","Iron-rich strewn field; small pieces reported in thousands",
 "On May 10, 1879 a stony-iron meteorite fell a few miles north of Estherville. The three largest masses weighed roughly 431, 151 and 106 pounds, the biggest burying itself about 14 feet deep, and a great many small fragments were gathered around them. Estherville is a mesosiderite, half metal, so its pieces are magnetic and very detectable.",
 "Fields north of Estherville with permission. Iron-rich fragments respond well to a magnet cane and to any detector; the main masses are in museums (Estherville library, Smithsonian, Vienna).",
 [IGS,["City of Estherville: the Estherville meteorite","https://www.estherville.org/estherville-meteorite"]],6000),
("Park Forest","18106","IL","Cook","L5 stony",18000,"fell",2003,41.48472,-87.67917,"E","Suburban strewn field; yards and roofs",
 "Just before midnight on March 26, 2003 a fireball broke up over the south Chicago suburbs. Stones crashed through the roofs of several houses and the Park Forest fire station; more than 18 kg was recovered, the largest about 3 kg, from Crete in the south to the southern end of Olympia Fields in the north.",
 "Built-up suburbs: every yard is private and parks have their own rules. Read the story; hunt only with permission.",
 [["Park Forest (meteorite), Wikipedia","https://en.wikipedia.org/wiki/Park_Forest_(meteorite)"],["NASA ARES: Park Forest, Illinois","https://ares.jsc.nasa.gov/meteorite-falls/events/park-forest-illinois"]],4000),
("Hamburg","",'MI',"Livingston","H4 stony",0,"fell",2018,42.47,-83.80,"D","Recent fall; many stones went into lakes",
 "At 8:08 pm on January 16, 2018 a fireball about 2 m across broke up over Livingston County. Doppler radar showed the falling stones, and hunters found the first ones two days later on the frozen surface of Strawberry and Bass lakes. More than 55 stones were recovered from a strip about 5 miles long, running west-northwest from about US-23 to Bass Lake. It is an H4 chondrite with pristine organic compounds (Field Museum, 2020).",
 "Much of the strip is lakes, homes and private land. Stones that landed in fields and woods away from the lakes are the ones still out there: permission first.",
 [["NASA ARES: Hamburg, Michigan meteorite fall","https://ares.jsc.nasa.gov/meteorite-falls/events/hamburg-michigan"],["Sky and Telescope: hunters recover meteorites from Michigan fireball","https://skyandtelescope.org/astronomy-news/observing-news/michigan-fireball/"]],5000),
("Trenton","24045","WI","Washington","iron (IIIAB)",505000,"found",1858,43.36667,-88.13333,"D","Many iron masses from one small area",
 "Large masses of the Trenton iron were found in Trenton Township, about four miles east of West Bend, from 1858 on, with more in the 1870s; the known total is about 505 kg. They came from a small area, so the meteorite probably came in steeply and left a tight strewn field. Irons survive in the ground for many thousands of years.",
 "Farm fields and rock piles in Trenton Township, with permission. A detector with a big coil, or a large pulse-induction loop, is the right tool for buried iron.",
 [WG,["Michigan State University meteorite collection: Trenton","https://esoteric.msu.edu/meteorites/more/trenton.html"]],5000),
("Colby (Wisconsin)","5395","WI","Clark","L6 stony",104000,"fell",1917,44.9,-90.28333,"E","Witnessed fall of two large stones",
 "At 6:15 pm on July 4, 1917 two stony meteorites of about 80 and 150 pounds fell near Colby. Witnesses said the stones were so cold they frosted over on a hot summer day. Both went to collections, and the UW Geology Museum holds Colby samples.",FALLTIP,[WG],4000),
("Vienna","",'WI',"Dane","iron (IVA)",49700,"found",2009,43.22,-89.38,"E","Single plowed-up iron",
 "A 110 lb iron meteorite came up while a farmer was preparing a field for alfalfa in the Town of Vienna, north of Madison, in May 2009. It sat in an outbuilding for years before the Field Museum classified it as a IVA iron, Wisconsin's 15th meteorite and the first from Dane County. It still shows its fusion crust and flight marks and is now at the UW Geology Museum.",IRONTIP,
 [["UW-Madison News: exceptional meteorite plowed up from a Dane County field","https://news.wisc.edu/exceptional-meteorite-plowed-up-from-a-dane-county-field-finds-new-home-in-uw-geology-museum/"]],5000),
("Kilbourn","12308","WI","Columbia","H5 stony",772,"fell",1911,43.58333,-89.6,"E","Single small stone",
 "A single H5 stone of 772 g fell near Kilbourn (now Wisconsin Dells) in 1911.",FALLTIP,[mbs("Kilbourn","12308"),WG],4000),
("Vernon County","24168","WI","Vernon","H6 stony",1500,"fell",1865,43.5,-91.16667,"E","Old fall, small stones",
 "A witnessed fall in 1865; about 1.5 kg of H6 stones were recovered in Vernon County. The record gives only the county.",FALLTIP,[mbs("Vernon County","24168"),WG],15000),
("Turtle Lake","47343","WI","Barron","L5 stony",89,"fell",1996,45.34583,-92.05167,"E","One tiny stone",
 "The Meteoritical Bulletin lists Turtle Lake as an L5 chondrite fall of 1996, with only 89 g known. It is the closest recorded fall to Eau Claire, about 45 miles northwest.",FALLTIP,[mbs("Turtle Lake","47343")],4000),
("Hammond","11813","WI","St. Croix","iron (ungrouped)",24000,"found",1884,44.91667,-92.43333,"E","Single iron find",
 "A 24 kg iron meteorite of an unusual (ungrouped) type was found near Hammond in 1884.",IRONTIP,[mbs("Hammond","11813"),WG],5000),
("Belmont","5008","WI","Lafayette","H6 stony",25300,"found",1958,42.73333,-90.35,"E","Single stone find",
 "A 25 kg H6 chondrite was found near Belmont in 1958, about 12 miles south of the 2010 Mifflin strewn field (not part of it).",FINDTIP,[mbs("Belmont","5008"),WG],5000),
("Angelica","2300","WI","Shawano","iron (IIIAB)",14800,"found",1916,44.25,-88.25,"E","Single iron find","A 14.8 kg iron was found near Angelica in 1916.",IRONTIP,[mbs("Angelica","2300"),WG],5000),
("Algoma","470","WI","Kewaunee","iron (IAB)",4100,"found",1887,44.65,-87.46667,"E","Single iron find","A 4.1 kg iron was found near Algoma in 1887.",IRONTIP,[mbs("Algoma","470"),WG],5000),
("Pine River","18826","WI","Waushara","iron (IAB)",3600,"found",1931,44.21667,-89.1,"E","Single iron find","A 3.6 kg iron was found near Pine River in 1931.",IRONTIP,[mbs("Pine River","18826"),WG],5000),
("Mount Morris (Wisconsin)","16783","WI","Waushara","iron (IAB)",676,"found",1937,44.0,-89.25,"E","Single iron find","A 676 g iron was found near Mount Morris in 1937.",IRONTIP,[mbs("Mount Morris (Wisconsin)","16783"),WG],5000),
("Zenda","30400","WI","Walworth","iron (IAB)",3700,"found",1955,42.51333,-88.48944,"E","Single iron find","A 3.7 kg iron was found near Zenda in 1955.",IRONTIP,[mbs("Zenda","30400"),WG],5000),
("Oshkosh","18036","WI","Winnebago","H stony",145,"found",1961,44.07694,-88.56278,"E","Single small stone","A 145 g H chondrite was found near Oshkosh in 1961.",FINDTIP,[mbs("Oshkosh","18036"),WG],4000),
("Anoka","2307","MN","Anoka","iron (IAB)",1108,"found",1961,45.2,-93.43333,"E","Single iron find","A 1.1 kg iron was found near Anoka in 1961.",IRONTIP,[mbs("Anoka","2307")],5000),
("Arlington","2333","MN","Sibley","iron (IIE)",8940,"found",1894,44.6,-94.1,"E","Single iron find","An 8.9 kg iron of the rare IIE group was found near Arlington in 1894.",IRONTIP,[mbs("Arlington","2333")],5000),
("Fisher","10107","MN","Polk","L6 stony",17600,"fell",1894,47.81667,-96.85,"E","Old witnessed fall","A witnessed fall in 1894 near Fisher; about 17.6 kg of L6 stones are known.",FALLTIP,[mbs("Fisher","10107")],6000),
("Euclid","10063","MN","Polk","H5 stony",2500,"found",1970,47.95833,-96.7,"E","Single stone find","A 2.5 kg H5 chondrite was found near Euclid in 1970.",FINDTIP,[mbs("Euclid","10063")],5000),
("Turtle River","24085","MN","Beltrami","iron (IIIAB)",22390,"found",1953,47.6,-94.76667,"E","Single iron find","A 22 kg iron was found near Turtle River in 1953.",IRONTIP,[mbs("Turtle River","24085")],5000),
("Hardwick","11828","MN","Rock","L4 stony",7800,"found",1937,43.8,-96.16667,"E","Single stone find","A 7.8 kg L4 chondrite was found near Hardwick in 1937.",FINDTIP,[mbs("Hardwick","11828")],5000),
("Marion (Iowa)","15424","IA","Linn","L6 stony",28400,"fell",1847,41.9,-91.6,"E","Very old fall","A witnessed fall in 1847 near Marion; about 28 kg of L6 stones are known.",FALLTIP,[mbs("Marion (Iowa)","15424"),IGS],6000),
("Lone Tree","14683","IA","Johnson","H4 stony",20676,"found",1971,41.5,-91.47917,"E","Single stone find","A 20.7 kg H4 chondrite was found near Lone Tree in 1971.",FINDTIP,[mbs("Lone Tree","14683"),IGS],5000),
("Alvord","2287","IA","Lyon","iron (IVA)",17500,"found",1976,43.32222,-96.28889,"E","Single iron find","A 17.5 kg iron was found near Alvord in 1976.",IRONTIP,[mbs("Alvord","2287"),IGS],5000),
("Mapleton","15410","IA","Monona","iron (IIIAB)",49000,"found",1939,42.18333,-95.71667,"E","Single iron find","A 49 kg iron was found near Mapleton in 1939.",IRONTIP,[mbs("Mapleton","15410"),IGS],5000),
("Woodbine","24330","IL","Jo Daviess","iron (IAB)",48200,"found",1953,42.34667,-90.1675,"E","Single iron find","A 48 kg iron was found near Woodbine in 1953.",IRONTIP,[mbs("Woodbine","24330")],5000),
("Elizabeth","56566","IL","Jo Daviess","iron (IAB)",732,"found",None,42.318,-90.221,"E","Single iron find","A 732 g iron found near Elizabeth; the find year is not recorded.",IRONTIP,[mbs("Elizabeth","56566")],5000),
("Marengo","15415","IL","McHenry","L6 stony",68,"found",1991,42.29111,-88.62556,"E","Single tiny stone","A 68 g L6 chondrite was found near Marengo in 1991.",FINDTIP,[mbs("Marengo","15415")],4000),
("Toulon","24035","IL","Stark","H5 stony",1215,"found",1962,41.11667,-89.80833,"E","Single stone find","A 1.2 kg H5 chondrite was found near Toulon in 1962.",FINDTIP,[mbs("Toulon","24035")],5000),
("Bloomington","5076","IL","McLean","LL6 stony",68,"fell",1938,40.48,-89.00417,"E","One tiny stone","A witnessed fall in 1938 near Bloomington; only 68 g of LL6 stone is known.",FALLTIP,[mbs("Bloomington","5076")],4000),
("Saint Augustine","23080","IL","Knox","iron (IID)",22000,"found",1974,40.71667,-90.41667,"E","Single iron find","A 22 kg iron was found near Saint Augustine in 1974.",IRONTIP,[mbs("Saint Augustine","23080")],5000),
("Havana","11857","IL","Mason","iron (IAB)",None,"found",None,40.33333,-90.05,"E","Iron find, few details","An iron found near Havana; the record gives no mass or year.",IRONTIP,[mbs("Havana","11857")],6000),
("Allegan","2276","MI","Allegan","H5 stony",32000,"fell",1899,42.53333,-85.88333,"E","Witnessed fall, main mass recovered","A witnessed fall in 1899 near Allegan; about 32 kg of H5 stone is known.",FALLTIP,[mbs("Allegan","2276")],5000),
("Rose City","22766","MI","Ogemaw","H5 stony",10600,"fell",1921,44.51667,-83.95,"E","Witnessed fall","A witnessed fall in 1921 near Rose City; about 10.6 kg of H5 stone is known.",FALLTIP,[mbs("Rose City","22766")],5000),
("Coleman","5401","MI","Midland","L6 stony",469,"fell",1994,43.76111,-84.50778,"E","Single small stone","A witnessed fall in 1994 near Coleman; one L6 stone of 469 g.",FALLTIP,[mbs("Coleman","5401")],4000),
("Worden","24337","MI","Washtenaw","L5 stony",1551,"fell",1997,42.38467,-83.6115,"E","Single stone","A witnessed fall in 1997 near Worden; one L5 stone of 1.55 kg.",FALLTIP,[mbs("Worden","24337")],4000),
("Grand Rapids","10955","MI","Kent","iron (ungrouped)",51700,"found",1883,42.96667,-85.76667,"E","Single iron find","A 51.7 kg iron of unusual (ungrouped) type was found near Grand Rapids in 1883.",IRONTIP,[mbs("Grand Rapids","10955")],6000),
("Reed City","22552","MI","Osceola","iron (ungrouped)",20000,"found",1895,43.86667,-85.51667,"E","Single iron find","A 20 kg iron was found near Reed City in 1895.",IRONTIP,[mbs("Reed City","22552")],5000),
("Kalkaska","12234","MI","Kalkaska","iron (IIIAB)",9399,"found",1947,44.64694,-85.13667,"E","Single iron find","A 9.4 kg iron was found near Kalkaska in 1947.",IRONTIP,[mbs("Kalkaska","12234")],5000),
("Iron River","12048","MI","Iron","iron (IVA)",1420,"found",1889,46.07944,-88.55972,"E","Single iron find","A 1.4 kg iron was found near Iron River in 1889.",IRONTIP,[mbs("Iron River","12048")],5000),
("Seneca Township","23499","MI","Lenawee","iron (IVA)",11500,"found",1923,41.78333,-84.18333,"E","Single iron find","An 11.5 kg iron was found in Seneca Township in 1923.",IRONTIP,[mbs("Seneca Township","23499")],5000),
]
def kg(g):
    if not g: return ''
    return f"{g/1000:.1f} kg" if g>=1000 else f"{g:.0f} g"
out=[]
import re
for (nm,code,st,co,cls,g,ff,yr,la,lo,t,tw,story,tip,src,m) in P:
    base=re.sub(r' \(.*\)','',nm)
    pid='met-'+st.lower()+'-'+re.sub(r'[^a-z0-9]+','-',base.lower()).strip('-')
    v=(cls[0].upper()+cls[1:])+(', '+kg(g)+' known' if g else '')+('; witnessed fall' if ff=='fell' else '; find')
    srcs=list(src)
    if code and not any(s[1].endswith('code='+code) for s in srcs): srcs.insert(0,mbs(nm,code))
    out.append({"id":pid,"L":"meteor","stt":st,"n":f"{base} meteorite ({ 'fell' if ff=='fell' else 'found'} {yr if yr else 'year unknown'})","la":round(la,5),"lo":round(lo,5),"co":co,"y":str(yr or ''),"v":v,
      "p":"area","acm":[m,"area"],"st":story+" The pin marks the place the record gives, which is only the general area.","t":tip,"src":srcs,
      "s":"found","c":"documented","pl":f"{base}, {co} County; general area from the record","tov":t,"tovw":f"Meteorite grade {t}: {tw}"})
ids=[p['id'] for p in out]; assert len(ids)==len(set(ids))
json.dump({"new":out,"edit":{}},open(sys.argv[1],'w'),ensure_ascii=False,indent=0)
print(len(out))
