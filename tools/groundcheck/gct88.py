import json
N=json.load(open('notest88.json')); G=json.load(open('ugt88.json'))
TH={'S':'schoolhouse','K':'cemetery','C':'church','D':'dam'}
out={}
for k,v in N.items():
    mv=None
    if v['move']:
        lo,la,m,d=v['move']; mv=[lo,la,f"Moved {m} m {d} onto the {TH.get(v['code'],'building')} that the {v['yr']} USGS topo map ({v['quad']} sheet) draws; good to about 30-50 m."]
    out[k]=[v['txt'],mv,G[k]]
js="\n// Ground check, Taylor c1888 map pins (v171): same method as v160\nObject.assign(GC_CHECK,"+json.dumps(out,separators=(',',':'))+");\n"
open('gct88.js','w').write(js); print(len(out),len(js))
