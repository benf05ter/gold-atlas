# Turn sheet judgments into per-pin card text, moves and ground grades
import json,math,re,numpy as np,pyarrow.parquet as pq
idx=json.load(open('sheets/index77.json')); P={p['id']:p for p in json.load(open('pins-p77.json'))}
PL=json.load(open('ht/plan.json')); DET=json.load(open('detect.json'))
OB=pq.read_table('ov_b.parquet').column('bbox').to_pylist()
OC=np.array([[(b['xmin']+b['xmax'])/2,(b['ymin']+b['ymax'])/2] for b in OB])
DIRS={'N':(0,1),'S':(0,-1),'E':(1,0),'W':(-1,0),'NE':(1,1),'NW':(-1,1),'SE':(1,-1),'SW':(-1,-1),'NNW':(-.4,1),'NNE':(.4,1),'SSE':(.4,-1),'SSW':(-.4,-1),'ENE':(1,.4),'ESE':(1,-.4),'WNW':(-1,.4),'WSW':(-1,-.4)}
WORD={'N':'north','S':'south','E':'east','W':'west','NE':'northeast','NW':'northwest','SE':'southeast','SW':'southwest','NNW':'north-northwest','NNE':'north-northeast','SSE':'south-southeast','SSW':'south-southwest','ENE':'east-northeast','ESE':'east-southeast','WNW':'west-northwest','WSW':'west-southwest'}
SYM={'B':'a building','S':'a schoolhouse symbol','C':'a church symbol','K':'a cemetery symbol','D':'a dam','T':'a race-track oval'}
def compass(dx,dy):
    a=math.degrees(math.atan2(dx,dy))%360; k=['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'][int((a+11.25)//22.5)%16]; return WORD[k]
def today(p,r):
    dla=r/111320; dlo=r/(111320*math.cos(math.radians(p['la'])))
    m=(abs(OC[:,0]-p['lo'])<dlo)&(abs(OC[:,1]-p['la'])<dla)
    if not m.any(): return 0,None
    d=np.hypot((OC[m,0]-p['lo'])*111320*math.cos(math.radians(p['la'])),(OC[m,1]-p['la'])*111320); d=d[d<=r]
    return len(d),(float(d.min()) if len(d) else None)
def clean(t):
    t=t.replace('(Abandoned)','(abandoned)').replace('(1974 topo)','(1974 map)')
    t=re.sub(r'\.\.\s*$','',t)
    t=re.sub(r'(?<![\w])\.\.[a-z]*\s*','',t)
    t=re.sub(r'([A-Za-z])\.\.',r'\1',t)
    t=re.sub(r'\(([^()]*?)\??\)',lambda m:m.group(0) if m.group(1)=='abandoned' else m.group(1),t)
    t=re.sub(r'\b(\d+) (N|S|E|W|NE|NW|SE|SW|NNW|NNE|SSE|SSW|ENE|ESE|WNW|WSW)\b',lambda m:m.group(1)+' m '+WORD[m.group(2)],t)
    t=re.sub(r'\b(\d+) m (N|S|E|W|NE|NW|SE|SW|NNW|NNE|SSE|SSW|ENE|ESE|WNW|WSW)\b',lambda m:m.group(1)+' m '+WORD[m.group(2)],t)
    t=re.sub(r'\b([A-Z][a-z]+(?: [A-Z][a-z]+)?) (N|S|E|W)\b(?! m)',lambda m:m.group(1)+' '+WORD[m.group(2)],t)
    if re.fullmatch(r"[A-Z][\w']+(?: [A-Z][\w']+)?(?: corner| edge| west edge)?",t): t='at '+t
    t=re.sub(r'\bpin\b(?!s)','pin',t); t=t.replace('on pin','on the pin')
    t=t.replace('(Sch)','School').replace(' Sch ',' School ').replace(' Sch)',' School)').replace('Sch label','School label').replace(' Ch label',' Church label').replace(' Cem label',' Cemetery label').replace(' Cem ',' Cemetery ')
    t=re.sub(r'\bSch\b','School',t); t=re.sub(r'\bCh\b','Church',t); t=re.sub(r'\bCem\b','Cemetery',t)
    return t
TW=json.load(open('tweak.json'))
out={}; rows=[l.split('|') for l in open('judg77.txt').read().splitlines() if l.strip()]
for r in rows:
    s,i,code=r[0],int(r[1]),r[2]; extra=r[3:]
    pid=idx[s][i]; p=P[pid]; sid=PL['pin'].get(pid); b=PL['need'].get(sid) if sid else None
    yr=b['date_on_map'][:4] if b else None; quad=b['map_name'] if b else None
    move=None; notes=[]; lid=[]
    for e in extra:
        if e.startswith('M '):
            dx,dy=map(float,e[2:].split()); move=('rel',dx,dy)
        elif e.startswith('ABS '):
            la,lo=map(float,e[4:].split()); move=('abs',la,lo)
        else:
            for part in e.split('; '):
                if part.startswith('L '): lid.append(part[2:])
                else: notes.append(part)
    c=code.split()[0]; topo=''
    src=f"the {yr} USGS topo map ({quad} sheet)" if yr else None
    if c in SYM:
        rest=code.split()[1:]
        if rest and rest[0].isdigit():
            d=int(rest[0]); dr=WORD.get(rest[1],'') if len(rest)>1 else ''
            topo=f"{src} draws {SYM[c]} {'at the pin' if d<=20 else f'about {d} m {dr} of the pin'}"
        else:
            topo=f"{src} labels a {('school' if c=='S' else 'church' if c=='C' else 'cemetery' if c=='K' else 'site')} here, but its symbol is unclear"
    elif c=='N': topo=f"{src} draws no building within about 150 m"
    elif c=='V': topo=f"{src} shows the pin inside the settlement" + (f" of {notes[0]}" if notes and len(notes[0].split())<=3 and not notes[0][0].islower() else '')
    elif c=='F': topo=f"{src} shows woods or marsh here, with no building drawn"
    elif c=='U': topo="no old topo map covers this spot" if not yr else f"{src} has no detail here"
    elif c=='WIDE': topo=''
    if c=='V' and notes and len(notes[0].split())<=3 and not notes[0][0].islower(): notes=notes[1:]
    if c=='U' and notes and ('blank' in notes[0] or 'no old topo' in notes[0]): notes=notes[1:]
    dt=DET.get(pid) or {}
    n30,dmin=today(p,100)
    txt=' Ground check: '+(topo[0].upper()+topo[1:] if topo else '')
    if notes: txt+=('; ' if topo else '')+'; '.join(clean(n) for n in notes)
    txt+='.'
    if lid: txt+=' The 1 m LiDAR shows '+'; '.join(clean(l[0].lower()+l[1:]) for l in lid)+'.'
    mv=None
    if move:
        if move[0]=='rel':
            dx,dy=move[1],move[2]; la=p['la']+dy/111320; lo=p['lo']+dx/(111320*math.cos(math.radians(p['la'])))
        else:
            la,lo=move[1],move[2]; dy=(la-p['la'])*111320; dx=(lo-p['lo'])*111320*math.cos(math.radians(p['la']))
        tw=TW.get(pid)
        if tw: dx+=tw[0]; dy+=tw[1]; la=p['la']+dy/111320; lo=p['lo']+dx/(111320*math.cos(math.radians(p['la'])))
        m=round(math.hypot(dx,dy)); mv=[round(lo,6),round(la,6),m,compass(dx,dy)]
        txt+=f" The pin was moved {m} m {compass(dx,dy)} onto what the topo draws."
    out[pid]=dict(code=c,yr=yr,quad=quad,txt=txt.replace('..','.').replace(' .','.'),move=mv,today_n=n30,today_d=dmin,notes=notes,lid=lid)
json.dump(out,open('notes77.json','w'),indent=0)
import collections; print(len(out),collections.Counter(v['code'] for v in out.values()),sum(1 for v in out.values() if v['move']))
for k in list(out)[:3]+[]: print(k,out[k]['txt'],out[k]['move'])
