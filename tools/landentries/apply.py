# First land entries (research/land-entries/, WI DNR Original Land Patents = GLO + state patents per forty, 24 core WI counties):
#  - new-pins.json: 11 first-settler pins (county history + the man's own patent on that section)
#  - two-source.tsv: survey_corroborated (strong ones get the patent as a second source; "moved?" ones a note only), never_patented (card line),
#    pin_name_match (the person named on the card holds the first patent on that forty: card line + source row; kept only where a surname
#    of the patentee appears in the pin's own name or text)
#  - le/le.json for the page: first patent on the forty under every pin, shown in a "First land entry" box when a card opens (le.js)
# usage: apply.py land-entries-dir og-data.js page-dir ; refuses a rerun. Needs OGPTS2 = [[id,n,la,lo,st],...] dumped from the page.
import sys,json,csv,os,re
D,f,out=sys.argv[1:4]; s=open(f,encoding='utf-8').read()
tag='\n// First land entries (research/land-entries)\n'; assert tag not in s,'already applied'
P={x[0]:x for x in json.load(open(os.environ['OGPTS2']))}
GIV=set('JOHN JAMES WILLIAM CHARLES HENRY GEORGE THOMAS EDWARD ROBERT ALBERT SAMUEL JOSEPH DAVID PETER DANIEL ANDREW FRANK MICHAEL PATRICK OLE NELS HANS LEWIS LOUIS ISAAC JACOB BENJAMIN NATHAN AMOS STEPHEN ALEXANDER FRANCIS MARY SARAH'.split())
CL={'cash_sale':'cash sale','homestead':'homestead','military_warrant':'military bounty warrant','swamp_lands':'state swamp land','common_school':'state school land','college':'agricultural college scrip','scrip':'scrip'}
SRC='Federal and state land patents (WI DNR Original Land Patents geodatabase, 2022, from the GLO records)'
def person(t):   # "CORDING, JAMES" or flipped "JAMES, PERRIN, E" -> "James Cording" / "James E. Perrin"
    k=[x.strip() for x in t.split(',') if x.strip()]
    if not k: return ''
    if len(k)>1 and k[0] in GIV and k[1] not in GIV: k=[k[1],k[0]]+k[2:]
    sur,rest=k[0],k[1:]; name=' '.join((r+'.' if len(r)==1 else r) for r in rest)+' '+sur
    return name.title().replace("'S","'s").strip()
def first(note):
    m=re.match(r'\s*([^(;]*)\((\d{4})\.0 (\w+)',note); return (person(m.group(1)),m.group(2),CL.get(m.group(3),m.group(3).replace('_',' '))) if m else None
new=json.load(open(os.path.join(D,'new-pins.json'),encoding='utf-8'))
E={}; B3={'gs-myers-house','gs-gilbert-mill','gs-black-wilson-mill','gs-colburn-field','gs-merrill-clearing'}   # survey-plats batches 3-4 add these patents themselves
for r in csv.DictReader(open(os.path.join(D,'two-source.tsv'),encoding='utf-8'),delimiter='\t'):
    k,i,note=r['kind'],r['id'],r['note'].strip().strip('"').replace('""','"')
    link=(r['links'].split() or [''])[0]
    if k=='survey_corroborated' and i in B3: continue   # survey-plats batch 3 already adds these patents
    if k=='survey_corroborated':
        strong=note.startswith('[strong]'); t=re.sub(r'^\[[^\]]+\]\s*','',note)
        E[i]={'st':(' Land entry: '+t+'.' if strong else ' Land entry, check placement: '+t+'.'),'src':[[SRC,link]] if strong else []}
    elif k=='never_patented': E[i]={'st':' Land entry: '+note,'src':[]}
    elif k=='pin_name_match':
        p=P.get(i); x=first(note)
        if not p or not x: continue
        toks=[t.strip() for t in note.split('(')[0].split(',')][:2]
        if not any(t not in GIV and len(t)>1 and re.search(r'\b'+re.escape(t)+r'\b',p[1]+' '+p[4],re.I) for t in toks): continue
        E[i]={'st':f' Land entry: {x[0]} took the first patent on this forty in {x[1]} ({x[2]}), a second record that puts the name in the right place.','src':[[SRC,link]]}
s+=tag+'DATA.points.push(...'+json.dumps(new,ensure_ascii=False,separators=(',',':'))+');\n// notes wait for the page: vs-/sc- pins are built by the page code\n{ const E='+json.dumps(E,ensure_ascii=False,separators=(',',':'))+'; addEventListener("DOMContentLoaded",()=>{ for(const p of DATA.points){ const x=E[p.id]; if(!x) continue; p.st=(p.st||"")+x.st; if(x.src.length) p.src=[...(p.src||[]),...x.src]; } }); }\n'
open(f,'w',encoding='utf-8').write(s)
# side file for the card box: {id:[who, year, class, glo link]}
L={}
for r in csv.DictReader(open(os.path.join(D,'pin-land-entries.tsv'),encoding='utf-8'),delimiter='\t'):
    if not r['own_patentee']: continue
    who=' and '.join(person(x) for x in r['own_patentee'].split('|')[:3])+(' and others' if r['own_patentee'].count('|')>2 else '')
    L[r['id']]=[who,int(float(r['own_year'])) if r['own_year'] else '',CL.get(r['own_class'],r['own_class'].replace('_',' ')),r['own_link']]
for p in new: L.setdefault(p['id'],None)
L={k:v for k,v in L.items() if v}
os.makedirs(os.path.join(out,'le'),exist_ok=True); json.dump(L,open(os.path.join(out,'le','le.json'),'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':'))
sys.stderr.write(f'{len(new)} new pins, {len(E)} card notes, {len(L)} land-entry rows\n'); print(json.dumps([{'id':p['id'],'la':p['la'],'lo':p['lo']} for p in new]))
