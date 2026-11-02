import json,re,os,glob,collections,sys  # usage: serve a-f218a76394f8 on :8765, node tools/research-index/dump-pins.js pins.json, then PINS_DIR=./ REPO=./ python3 -I tools/research-index/build.py
S=os.environ.get('PINS_DIR','./')
pins=[p for p in json.load(open(S+'pins.json')) if p['L']!='wreck']
R=os.environ.get('REPO','./')
files=[f for f in glob.glob(R+'research/**/*',recursive=True) if f.endswith(('.md','.tsv','.txt')) and os.path.relpath(f,R) not in ('research/INDEX.md','research/index-by-pin.tsv','research/evidence/provenance.tsv')]
PF='/mnt/project-files/research/'
extra=[PF+'court-records/pin-records-check.tsv',PF+'court-records/negatives-court.tsv',PF+'court-records/zopp-1912.md',PF+'court-records/newspapers-com-asks.md',PF+'court-records/README.md']
extra+= [f for f in glob.glob(PF+'treasure-statewide/**/*',recursive=True) if f.endswith(('.md','.tsv'))]
files+= [f for f in extra if os.path.isfile(f)]
txt={}
for f in files:
    try: txt[f]=open(f,errors='replace').read()
    except Exception as e: print('skip',f,e,file=sys.stderr)
low={f:t.lower() for f,t in txt.items()}
STOP=set('''the and of a an in on at to by for from with near farm farms house lake lakes river creek island isle point bay county co twp township town village city park hill hills road street st ave mill mills money gold silver cash coins coin cache caches buried hidden hoard loot treasure lost bank robbery robbers safe jar jars kettle can cans box chest pot spot dig lead story stories old new north south east west ne nw se sw upper lower big little great mount mt fort lost legend tw t m cr ab ab2 ab4 fr lc tg gwl coff wd4 wd5 wpa bec cd it dig stark dodge wreck wi mn mi ia il wisconsin minnesota michigan iowa illinois mrs mr dr capt captain john james william wm george charles henry peter mary joseph frank thomas brothers bros sr jr copper brass iron tin silverware jewelry jewels diamonds diamond watch watches one two three four five six seven eight nine ten eleven twelve fifteen seventeen twenty thirty forty fifty hundred thousand dollars dollar worth about under over between behind beneath said says found dug digs digging told miles mile tree trees orchard stump stone stones lars robert david patrick nelson miller samuel henry edward edwin albert august louis fred frederick charles ole hans andrew anders peter carl karl jacob michael daniel isaac noah wilhelm herman otto rudolph mons chicago spanish third crock cached bandit stolen pound lidar steamboat california widow miser misers hermit his her their its gang outlaw outlaws payroll train ship steamer boat schooner indian french fur trader traders post camp logging lumber lumberjack civil war jesse confederate union cave caves rock rocks spring springs grove prairie valley falls rapids harbor beach shore woods forest center centre city's family estate hoards savings field barn yard cellar well'''.split())
def toks(p):
    ts=set()
    for w in re.split(r'[-_]',p['id'])[1:]:
        if not w.isdigit() and len(w)>3 and w not in STOP: ts.add(w)
    for w in re.findall(r"[A-Z][a-zA-Z]{3,}",p['n']):
        w=w.lower()
        if w not in STOP: ts.add(w)
    cos=set((p['co'] or '').lower().replace('.','').split())
    return ts-cos
def lineno(t,i): return t.count('\n',0,i)+1
dfreq=collections.Counter()
PT={p['id']:toks(p) for p in pins}
ALL='\n'.join(txt.values())
def proper(w):
    tot=cap=0
    for m in re.finditer(r'\b'+re.escape(w)+r'\b',ALL,re.I):
        tot+=1; cap+=m.group(0)[0].isupper()
    return tot==0 or cap/tot>=0.8
for k in list(PT): PT[k]={w for w in PT[k] if proper(w)}
for ts in PT.values():
    for w in ts:
        r=re.compile(r'\b'+re.escape(w)+r'\b')
        dfreq[w]=sum(1 for f in low if r.search(low[f]))
out=[]
for p in pins:
    hits=[]
    co=(p['co'] or '').lower()
    for f,t in low.items():
        i=t.find(p['id'].lower()); how=None
        if i>=0: how='id'
        else:
            ts=PT[p['id']]; fn=os.path.basename(f).lower()
            occ={w:[m.start() for m in re.finditer(r'\b'+re.escape(w)+r'\b',t)] for w in ts}
            cs=[m.start() for m in re.finditer(r'\b'+re.escape(co)+r'\b',t)] if co else []
            best=None
            for w in sorted(ts,key=lambda w:dfreq[w]):
                for x in occ[w]:
                    if w in fn and ((co and re.search(r'\b'+re.escape(co)+r'\b',t)) or any(occ[v] for v in ts if v!=w)): best=(x,'file:'+w); break
                    two=any(len(w)+3<abs(x-y)<1500 and len(v)+3<abs(x-y) for v in ts if v!=w for y in occ[v])
                    if two: best=(x,'two:'+w); break
                    if best is None and any(abs(x-c)<1500 for c in cs): best=(x,'co:'+w)
                if best and not best[1].startswith('co:'): break
            if best: i,how=best
        if how: hits.append(((os.path.relpath(f,R) if not f.startswith(PF) else f.replace('/mnt/project-files/','project-files/')),lineno(t,i),how))
    out.append({**p,'hits':hits,'toks':sorted(PT[p['id']])})

c=collections.Counter(len(o['hits'])>0 for o in out); print(len(files),'files',c)
c2=collections.Counter((o['L'],len(o['hits'])>0) for o in out); print(c2)

# ---- write research/INDEX.md and research/index-by-pin.tsv ----
import datetime
SUP={'ancestry':'Ancestry lookups','plats':'Plat books and maps','ia-il':'Iowa and Illinois','newspapers-com':'Newspapers','where-to-look':'Where to look','aerials':'Air photos','county-depth':'County depth','court-records':'Court and probate','treasure-statewide':'Treasure thread notes'}
def strong(h): return not h[2].startswith('co:')
by={p['id']:p for p in out}
digs={}
for p in out:
    if p['L']=='dig' and p['lead'] in by: digs.setdefault(p['lead'],[]).append(p)
GR='SABCDEF'; GN={'S':'the best there is','A':'excellent','B':'good','C':'worth a look','D':'long shot','E':'slim chance (ungraded stories)','F':'found, gone or look only'}
PROV={}
try:
    for n,l in enumerate(open(R+'research/evidence/provenance.tsv',errors='replace'),1): PROV.setdefault(l.split('\t',1)[0],n)
except OSError: pass
def link(f,ln):
    if f.startswith('research/'): return f'[{f[9:]}]({f[9:]}#L{ln}) (line {ln})'
    return f'`{f.replace("project-files/","/mnt/project-files/")}` line {ln} (shared folder only)'
L=['# Research index by pin','',f'Generated {datetime.date.today().isoformat()} by `tools/research-index/build.py` from the atlas pins (grade = the app\'s S to F tier) and every note under `research/`, plus the shared-folder court records and Treasure-thread notes. One entry per treasure lead, best grade first; dig spots sit under their lead. Shipwrecks are left out (look only).','',
'**How to read it.** "Notes" means the file has the pin id, is named for the lead, or names two words of the lead close together. "Also mentions" means one word of the lead (often a place or a common surname) close to the county name, so check those before relying on them. Line numbers point at the first mention.','',
'**Folder indexes** (still kept, one line per note): [evidence/README.md](evidence/README.md) (what each card rests on), [ancestry/INDEX.md](ancestry/INDEX.md), [plats/INDEX.md](plats/INDEX.md), [ia-il/INDEX.md](ia-il/INDEX.md), [where-to-look/README.md](where-to-look/README.md). Shared folder only: `/mnt/project-files/research/court-records/pin-records-check.tsv` (records to order), `/mnt/project-files/research/treasure-statewide/held-leads.md` (held, no pin).','',
'Machine-readable copy: [index-by-pin.tsv](index-by-pin.tsv).','']
cnt={g:0 for g in GR}; none={g:[] for g in GR}
tsv=['pin_id\tgrade\tlead\tcounty\tstate\tdig_spots\tfile\tline\tmatch']
body={g:[] for g in GR}
for p in sorted(out,key=lambda p:(GR.index(p['g']) if p['g'] in GR else 9,p['n'].lower())):
    if p['L']=='dig' and p['lead'] in by: continue
    hs=list(p['hits']); dg=digs.get(p['id'],[])
    for d in dg: hs+= [h for h in d['hits'] if h[0] not in {x[0] for x in hs}]
    for h in hs: tsv.append('\t'.join([p['id'],p['g'],p['n'],p['co'],p['stt'],','.join(d['id'] for d in dg),h[0],str(h[1]),h[2]]))
    g=p['g']
    if not hs: none[g].append(p); continue
    cnt[g]+=1
    s=[x for x in hs if strong(x)]; w=[x for x in hs if not strong(x)]
    b=[f"### {p['n']}",f"`{p['id']}` · grade {g} · {p['co']+' Co., ' if p['co'] else ''}{p['stt']}"+(' · dig spot '+', '.join('`'+d['id']+'`' for d in dg) if dg else ''),'']
    if p['id'] in PROV: b+=[f"Card sources: [evidence/provenance.tsv](evidence/provenance.tsv#L{PROV[p['id']]}) (line {PROV[p['id']]})",'']
    if s: b+=['Notes:']+[f'- {link(f,ln)}' for f,ln,_ in s]
    if w: b+=['','Also mentions the place: '+'; '.join(link(f,ln) for f,ln,_ in w)]
    body[g]+=b+['']
for g in GR:
    L+=[f'## {g}: {GN[g]}','']
    if not body[g] and not none[g]: L+=['None yet.','']; continue
    L+=body[g]
    if none[g]: L+=['No research notes yet: '+'; '.join(f"{p['n']} (`{p['id']}`)" for p in none[g]),'']
D=R+'research/'
open(D+'INDEX.md','w').write('\n'.join(L)+'\n'); open(D+'index-by-pin.tsv','w').write('\n'.join(tsv)+'\n')
print(cnt,{g:len(v) for g,v in none.items()})
