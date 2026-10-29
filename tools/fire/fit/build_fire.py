# Builds the Fire maps list (FIRE) and the sf- pins from the fitted specs.  usage: build_fire.py out_dir
import json,glob,re,sys,io,contextlib,math,os
sys.path.insert(0,os.path.dirname(__file__)); import geo
D=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CO={r.split('\t')[0]:r.split('\t')[1] for r in open(D+'/oldest.tsv').read().strip().split('\n')}
IT={r.split('\t')[0]:r.split('\t')[3] for r in open(D+'/oldest.tsv').read().strip().split('\n')}
def slug(t): return re.sub(r'[^a-z0-9]+','-',t.lower()).strip('-')[:48]
def kind(n):
    l=n.lower()
    if 'school' in l or 'seminary' in l or 'college' in l: return 'school2','Coins, buttons, slate pencils, marbles, toy parts, lost jewelry'
    if 'church' in l: return 'gather','Coins, religious medals, jewelry, buttons'
    if any(k in l for k in ('hotel','house','saloon','opera','hall','rink','park','brewery','beer','livery','stable','depot','fair')): return 'gather','Coins, tokens, buttons, jewelry, bottle and harness parts'
    return 'gather','Coins, tokens, tools, buttons'
FIRE=[];PINS=[];NOTES={}
for f in sorted(glob.glob(D+'/spec/*.json')):
    S=json.load(open(f))
    if 'b' not in S and 'groups' not in S: continue
    town,yr=S['town'],S['year']; co=CO.get(town,''); item=IT[town]; ts=slug(town)
    R=geo.roads(S); rms={}
    for sh in S['sheets']:
        if 'T' not in sh: continue
        o=io.StringIO()
        with contextlib.redirect_stdout(o): geo.fit_sheet(sh,R,S['c'])
        m=re.search(r'(\d+) pts, rms ([\d.]+) m',o.getvalue()); rms[sh['f']]=(int(m.group(1)),float(m.group(2)))
    grp=S.get('groups') or {'':{'b':S['b']}}
    for g,v in grp.items():
        FIRE.append({'id':ts+('-'+g if g else ''),'town':town,'label':town+' '+yr+(' ('+{'east':'east side','west':'west side','shaw':'Shawtown'}.get(g,g)+')' if g and len(grp)>1 else ''),'b':v['b'],'f':'fire_'+ts.replace('-','_')+'_'+yr+('_'+g if g else ''),'item':item})
    seen=set()
    for sh in S['sheets']:
        if 'T' not in sh: continue
        n,e=rms[sh['f']]; sheetno=int(sh['f'].split('-')[-1].split('.')[0])
        for ft in sh.get('feat',[]):
            if len(ft)<5: continue
            lab=ft[2]; L,v=kind(lab); pid='sf-'+ts+'-'+slug(lab)
            k=2
            while pid in seen: pid='sf-'+ts+'-'+slug(lab)+'-'+str(k); k+=1
            seen.add(pid)
            good=e<=3 and n>=2
            PINS.append({'id':pid,'L':L,'n':'%s, %s (%s fire map)'%(lab,town,yr),'la':round(ft[4],6),'lo':round(ft[3],6),'y':'By '+yr,
              'pl':'%s, %s County'%(town,co),'co':co,'stt':'WI','v':v,'c':'documented','s':'unknown','p':'exact' if good else 'approx',
              'st':'The %s Sanborn fire insurance map of %s draws this building (%s) on sheet %d. In-town lots are usually built over or paved since; look for the lot, the alley behind it and any strip of old lawn or boulevard that was never dug.'%(yr,town,lab,sheetno),
              't':'Turn on the Fire maps view to see the whole block as it was. Alleys, back lots, hitching posts, the edge of the old boardwalk and the ground by the doors and wells got the most losses. Get the owner\'s permission; city land needs a permit.',
              'src':[['Sanborn Fire Insurance Map from %s, %s County, Wisconsin (Sanborn Map & Publishing Co., %s), Library of Congress'%(town,co,yr),'https://www.loc.gov/item/%s/'%item]],
              'pinconf':'A' if good else 'B',
              'pinev':['Placed from the %s fire map, sheet %d: the sheet was fitted to %d street crossings that still exist (fit error %.1f m), so the pin is good to about %d m.'%(yr,sheetno,n,e,max(5,round(e*2+3)))],'sf':1})
json.dump({'fire':FIRE,'pins':PINS},open(sys.argv[1]+'/fire.json','w'),indent=0)
print(len(FIRE),'maps',len(PINS),'pins')
for p in FIRE: print(p)
