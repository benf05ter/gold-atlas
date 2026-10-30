import json,sys
sys.argv=['x']; import tile
P=json.load(open('/tmp/claude-0/pv/pins-wa15.json')); P.sort(key=lambda p:(p.get('pl','').split(',')[1] if ',' in p.get('pl','') else '',p['la']))
idx={}
for i in range(0,len(P),12):
    ch=P[i:i+12]; n=f"wa{i//12:03d}"; tile.sheet(ch,f'/tmp/claude-0/pv/sheets/{n}.jpg'); idx[n]=[p['id'] for p in ch]
json.dump(idx,open('/tmp/claude-0/pv/sheets/indexwa15.json','w')); print(len(idx))
