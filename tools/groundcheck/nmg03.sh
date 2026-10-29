python3 -c "
import json,sys;I=json.load(open('/tmp/claude-0/pv/sheets/indexg03.json'));P={p['id']:p for p in json.load(open('/tmp/claude-0/pv/pins-g03.json'))}
for s in sys.argv[1:]:
  for i,pid in enumerate(I[s]): print(s,i,P[pid]['n'][:70])" "$@"
