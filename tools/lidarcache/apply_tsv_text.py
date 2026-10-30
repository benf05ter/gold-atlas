# Appends the card_text of a LiDAR cache tsv (research/lidar-caches/*.tsv) to the matching pins' st. Usage: python3 apply_tsv_text.py file.tsv og-data.js
import sys,csv
rows=list(csv.DictReader(open(sys.argv[1]),delimiter='\t')); f=sys.argv[2]; s=open(f,encoding='utf-8').read()
tag='\n// LiDAR cache notes from '+sys.argv[1].split('/')[-1]+'\n'
assert tag not in s,'already applied'
import json
m={r['id']:r['card_text'] for r in rows}
s+=tag+'{ const T='+json.dumps(m,ensure_ascii=False)+'; for(const p of DATA.points){ if(T[p.id]) p.st=(p.st||"")+T[p.id]; } }\n'
open(f,'w',encoding='utf-8').write(s); print(len(m),'notes')
