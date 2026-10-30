# LiDAR counts for card text only: LIDC[id]=[pits,deep,mounds,marea,relief,tile] (p.lid stays the scored field). usage: apply_lidc.py lid.tsv og-data.js
import sys,csv,json
rows=list(csv.reader(open(sys.argv[1]),delimiter='\t')); hdr=rows[0]; rows=rows[1:]
f=sys.argv[2]; s=open(f,encoding='utf-8').read(); tag='\n// LiDAR counts (card text only) from '+sys.argv[1].split('/')[-1]+'\n'
assert tag not in s,'already applied'
num=lambda x: float(x) if '.' in x else int(x)
T={r[0]:[num(r[1]),num(r[2]),num(r[3]),num(r[4]),num(r[5]),r[6]] for r in rows}
s+=tag+'Object.assign(LIDC,'+json.dumps(T,separators=(',',':'))+');\n'
if 'const LIDC={}' not in s: s=s.replace(tag,'\nconst LIDC={};  // id -> LiDAR counts for card text (parks and other runtime spots too)'+tag,1)
open(f,'w',encoding='utf-8').write(s); print(len(T),'spots')
