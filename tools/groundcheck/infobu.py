import json,re,sys
P={p['id']:p for p in json.load(open('pins-bu15.json'))};I=json.load(open('sheets/indexbu15.json'))
for s in sys.argv[1:]:
  for i,pid in enumerate(I[s]):
    p=P[pid];st=p.get('st','');m=re.findall(r'(?:place-name file|GNIS)[^.]*?about (\d+ m [a-z-]+)',st)
    print(s,i,p['n'][:60],'|',m[0] if m else '')
