# All-county LiDAR pass (research/lidar-caches/county/<state-county>/): card pictures -> img/m-17.. bundles + LIDIMG,
# eye-checked pit notes (cand.tsv card_text) -> pin text. Counts (lid.tsv) go in with tools/countydepth/apply_lidc.py.
# usage: apply_county_pass.py og-data.js imgdir ; refuses a rerun
import sys,csv,json,glob,re
D='/mnt/project-files/research/lidar-caches/county/'; f=sys.argv[1]; out=sys.argv[2]
s=open(f,encoding='utf-8').read(); tag='\n// All-county LiDAR pass: card pictures and pit notes\n'; assert tag not in s,'already applied'
have=set(re.findall(r'"([^"]+)":"@[lm]-\d+"',s)); I={}
for g in sorted(glob.glob(D+'*/img-*.json')):
    for k,v in json.load(open(g)).items():
        if k not in have: I[k]=v
ids=list(I); add={}
for n,i in enumerate(range(0,len(ids),350)):
    b={k:I[k] for k in ids[i:i+350]}; json.dump(b,open(f'{out}/m-{17+n}.json','w'),separators=(',',':'))
    for k in b: add[k]=f'@m-{17+n}'
T={}
for g in sorted(glob.glob(D+'*/cand.tsv')):
    for r in csv.DictReader(open(g),delimiter='\t'): T[r['id']]=T.get(r['id'],'')+r['card_text']
s+=tag+'Object.assign(LIDIMG,'+json.dumps(add,separators=(',',':'))+');\n{ const T='+json.dumps(T,ensure_ascii=False)+'; for(const p of DATA.points) if(T[p.id]) p.st=(p.st||"")+T[p.id]; }\n'
open(f,'w',encoding='utf-8').write(s); print(len(add),'pictures in',(len(ids)+349)//350,'files;',len(T),'pit notes')
