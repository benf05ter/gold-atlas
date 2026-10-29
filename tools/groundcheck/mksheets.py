import json,sys
sys.argv=['x']; import tile
P=[p for p in json.load(open('/tmp/claude-0/pv/pins-all.json')) if not p['id'].startswith('sf-')]
pre=lambda p:p['id'].split('-')[0]
order=[]
for k in ['pe10','pb13','pc','pc88','pd88','pbp77','pt01','pj01','sv78','gs','nw']:
    Q=[p for p in P if pre(p)==k]; Q.sort(key=lambda p:(p.get('pl','').split(',')[0],p['la'])); order+=Q
idx={}
for i in range(0,len(order),12):
    ch=order[i:i+12]; n=f"s{i//12:03d}"; tile.sheet(ch,f'/tmp/claude-0/pv/sheets/{n}.jpg'); idx[n]=[p['id'] for p in ch]
json.dump(idx,open('/tmp/claude-0/pv/sheets/index.json','w')); print(len(idx))
