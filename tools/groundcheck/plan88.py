import json
T=json.load(open('ht/wi_topos.json')); P=json.load(open('pins-b88.json'))
PL=json.load(open('ht/plan.json'))
def y(t):
    try: return int(t['date_on_map'][:4])
    except: return 9999
add=0
for p in P:
    c=[t for t in T if float(t['westbc'])<=p['lo']<=float(t['eastbc']) and float(t['southbc'])<=p['la']<=float(t['northbc']) and int(t['map_scale'])<=125000 and y(t)>=1920]
    if not c: print('none',p['id']); continue
    c.sort(key=lambda t:(y(t),int(t['map_scale'])))
    t=c[0]; PL['pin'][p['id']]=t['scan_id']
    if t['scan_id'] not in PL['need']: PL['need'][t['scan_id']]=t; add+=1
json.dump(PL,open('ht/plan.json','w'))
import collections
print(add,collections.Counter((PL['need'][PL['pin'][p['id']]]['map_name'],PL['need'][PL['pin'][p['id']]]['date_on_map'],PL['need'][PL['pin'][p['id']]]['map_scale']) for p in P if p['id'] in PL['pin']))
