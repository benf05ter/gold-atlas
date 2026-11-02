import json,re,glob,sys
sel={p['id']:p for p in json.load(open(sys.argv[1]))}
T={}
for f in sorted(glob.glob(sys.argv[2]+"/*.tl")):
  cur=None
  for ln in open(f,encoding='utf-8'):
    ln=ln.rstrip('\n')
    if not ln.strip(): continue
    if ln.startswith('@'): cur=ln[1:].strip(); assert cur not in T,cur; T[cur]=[]; continue
    parts=[x.strip() for x in ln.split(' | ')]
    assert 3<=len(parts)<=4,(f,ln)
    d,e,s=parts[:3]; inf=len(parts)==4 and parts[3]=='i'
    T[cur].append([d,e,s]+([1] if inf else []))
def key(d,prev):
  m=re.search(r'(1[6-9]\d\d|20\d\d)',d)
  if d.startswith('today'): return 9999
  if not m: return prev
  y=int(m.group(1))
  if re.match(r'(before|by|to) ',d): y-=0.5
  mo=re.search(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)',d)
  if mo: y+=('JanFebMarAprMayJunJulAugSepOctNovDec'.index(mo.group(1))/3+1)/13
  return y
for k,L in T.items():
  prev=0; ks=[]
  for x in L: prev=key(x[0],prev); ks.append(prev)
  T[k]=[x for _,_,x in sorted(zip(ks,range(len(L)),L))]
miss=[i for i in sel if i not in T]; extra=[i for i in T if i not in sel]
print('pins',len(T),'entries',sum(map(len,T.values())),'missing',miss,'extra',extra)
s=json.dumps(T,ensure_ascii=False,separators=(',',':'))
open(sys.argv[3],"w",encoding="utf-8").write(s); print('bytes',len(s.encode()))
