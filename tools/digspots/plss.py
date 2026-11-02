import json,sys,math,urllib.request,urllib.parse
spec=json.load(open(sys.argv[1])); raw=json.load(open(sys.argv[2]))
U='https://gis.blm.gov/arcgis/rest/services/Cadastral/BLM_Natl_PLSS_CadNSDI/MapServer/3/query?'
for p in spec['new']:
  if raw[p['id']].get('src'): continue
  d=(p['acm'][0]+200)/111320; dx=d/math.cos(math.radians(p['la']))
  q=U+urllib.parse.urlencode({'geometry':f"{p['lo']-dx},{p['la']-d},{p['lo']+dx},{p['la']+d}",'geometryType':'esriGeometryEnvelope','inSR':4326,'outSR':4326,'spatialRel':'esriSpatialRelIntersects','outFields':'FRSTDIVNO,QQSEC,SECDIVLAB','returnGeometry':'true','geometryPrecision':5,'f':'json'})
  j=json.load(urllib.request.urlopen(q,timeout=90))
  fs=[{'pub':None,'ac':None,'lab':(f['attributes'].get('SECDIVLAB') or f['attributes'].get('QQSEC') or ''),'sec':f['attributes'].get('FRSTDIVNO'),'g':[[[round(x,5),round(y,5)] for x,y in rg] for rg in f['geometry']['rings']]} for f in j.get('features',[])]
  raw[p['id']]={'src':'plss','n':len(fs),'f':fs}; print(p['id'],len(fs),fs[0]['lab'] if fs else '', fs[0]['sec'] if fs else '')
json.dump(raw,open(sys.argv[2],'w'))
