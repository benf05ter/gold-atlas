import csv,json,collections,os,urllib.request
P=json.load(open('pins-lc06.json')); PL=json.load(open('ht/plan.json'))
R=[t for t in csv.DictReader(open('ht/historicaltopo.csv',encoding='latin-1')) if t['primary_state'] in('Wisconsin','Minnesota')]
def y(t):
    try: return int(t['date_on_map'][:4])
    except: return 9999
for p in P:
    c=[t for t in R if float(t['westbc'])<=p['lo']<=float(t['eastbc']) and float(t['southbc'])<=p['la']<=float(t['northbc']) and int(t['map_scale'] or 0)<=125000 and 1920<=y(t)]
    c.sort(key=lambda t:(y(t),int(t['map_scale'])))
    t=c[0]; PL['pin'][p['id']]=t['scan_id']; PL['need'].setdefault(t['scan_id'],t)
json.dump(PL,open('ht/plan.json','w'))
print(collections.Counter((PL['need'][PL['pin'][p['id']]]['map_name'],PL['need'][PL['pin'][p['id']]]['date_on_map']) for p in P))
for s in set(PL['pin'][p['id']] for p in P):
    f='ht/%s.tif'%s
    if not os.path.exists(f): t=PL['need'][s]; print('get',t['map_name'],t['date_on_map']); urllib.request.urlretrieve(t['geotiff_url'],f)
