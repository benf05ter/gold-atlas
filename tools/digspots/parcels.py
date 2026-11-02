# fetch parcel polygons within (r+200 m) of each dig spot; keep only geometry + public/private class (owner names never leave this script)
import json,sys,math,re,urllib.request,urllib.parse
SVC={'WI':'https://services3.arcgis.com/n6uYoouQZW75n5WI/arcgis/rest/services/Wisconsin_Statewide_Parcels_DB/FeatureServer/0',
     'MN':'https://enterprise.gisdata.mn.gov/aghost/rest/services/us_mn_state_mngeo/plan_parcels_open/FeatureServer/1',
     'Ingham':'https://services3.arcgis.com/ySzhFSJfYeginRjx/arcgis/rest/services/Ingham_County_Parcels_2025/FeatureServer/1',
     'Warren':'https://services.arcgis.com/lcU85Lh3UvDs5Naw/arcgis/rest/services/WarrenCountyParcels090721/FeatureServer/0'}
PUB=re.compile(r"\b(STATE OF|COUNTY OF|\w+ COUNTY\b|CITY OF|VILLAGE OF|TOWN OF|TOWNSHIP|UNITED STATES|USA\b|U S A|DNR|DEPT|DEPARTMENT|SCHOOL DIST|UNIVERSITY|CONSERVATION|BOARD OF|COMMISSION)",re.I)
OWNF={'OWNERNME1','OWNERNME2','owner_name','owner_more','tax_name','OWNERNAME','DEEDHOLD','CONTRHOLD','MAILNAME'}
def get(u,p):
  q=u+'/query?'+urllib.parse.urlencode(p); return json.load(urllib.request.urlopen(q,timeout=90))
spec=json.load(open(sys.argv[1])); out={}
for p in spec['new']:
  svc=SVC.get(p['stt']) or SVC.get(p['co'])
  if not svc: out[p['id']]={'src':None}; print(p['id'],'no service'); continue
  d=(p['acm'][0]+200)/111320; dx=d/math.cos(math.radians(p['la']))
  env=f"{p['lo']-dx},{p['la']-d},{p['lo']+dx},{p['la']+d}"
  try:
    r=get(svc,{'geometry':env,'geometryType':'esriGeometryEnvelope','inSR':4326,'outSR':4326,'spatialRel':'esriSpatialRelIntersects','outFields':'*','returnGeometry':'true','f':'json','geometryPrecision':5,'resultRecordCount':400})
  except Exception as e: out[p['id']]={'src':None,'err':str(e)}; print(p['id'],'ERR',e); continue
  if 'error' in r: out[p['id']]={'src':None,'err':r['error']}; print(p['id'],'ERR',r['error']); continue
  fs=[]
  for f in r.get('features',[]):
    a=f['attributes']; own=' '.join(str(v) for k,v in a.items() if k in OWNF and isinstance(v,str))
    pc=str(a.get('PROPCLASS') or '')+' '+str(a.get('AUXCLASS') or '')
    pub=1 if (PUB.search(own) or re.search(r'\bX[1-4]\b',pc)) else 0
    ac=a.get('GISACRES') or a.get('DEEDACRES') or a.get('GROSSAC') or a.get('acres_poly') or a.get('TOTALACRES') or None
    if str(a.get('ownership') or '').strip() and not re.match(r'(?i)priv',str(a.get('ownership'))): pub=1
    rings=[[[round(x,5),round(y,5)] for x,y in rg] for rg in f['geometry'].get('rings',[])]
    fs.append({'pub':pub,'ac':round(ac,1) if isinstance(ac,(int,float)) else None,'g':rings})
  out[p['id']]={'src':svc.split('/services/')[1].split('/')[0],'n':len(fs),'f':fs}
  print(p['id'],len(fs),'parcels',sum(f['pub'] for f in fs),'public')
json.dump(out,open(sys.argv[2],'w'))
