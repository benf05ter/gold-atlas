# Replaces the AF_LAYER line in og-data.js with a fresh af-layer.json. Prints ids that are new or gained a LiDAR pit (they need a card picture).
import sys,json,re
rows=json.load(open(sys.argv[1])); f=sys.argv[2]; s=open(f,encoding='utf-8').read()
m=re.search(r'^const AF_LAYER=(.*);$',s,re.M); old={r['id']:r for r in json.loads(m.group(1))}
s=s[:m.start()]+'const AF_LAYER='+json.dumps(rows,separators=(',',':'),ensure_ascii=False)+';'+s[m.end():]
open(f,'w',encoding='utf-8').write(s)
need=[r['id'] for r in rows if r['id'] not in old or (r.get('lid_la') and (old[r['id']].get('lid_la'),old[r['id']].get('lid_lo'))!=(r['lid_la'],r['lid_lo']))]
sys.stderr.write(f"{len(old)} -> {len(rows)} rows, {len(need)} need pictures\n"); print('\n'.join(need))
