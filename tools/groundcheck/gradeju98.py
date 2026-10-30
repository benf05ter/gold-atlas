# Built-on-since judgment (plat era -> earliest topo -> today) folded into the undisturbed-ground grade
import json,re,sys
sys.argv=['x']; exec(open('compileju98.py').read().split("out={}")[0])  # reuse today() and data
N=json.load(open('notesju98.json'))
DISTURB=re.compile(r'flooded|flowage|under Lake|dug at the pin|large pit or pond has been dug|houses cover it|built over today|highway interchange|large modern buildings|highway ramps|school building now covers',re.I)
G={}
for pid,v in N.items():
    p=P[pid]; c=v['code']; yr=v['yr']; old=p.get('ug')
    nm=(p['n']).lower()
    if v['move']: 
        q=dict(p); q['lo'],q['la']=v['move'][0],v['move'][1]
    else: q=p
    n100,dmin=today(q,100); n30=sum(1 for _ in [0]) if dmin is not None and dmin<=30 else 0
    era=re.search(r'1[89]\d\d',p.get('y','')+' '+p['n']); era=era.group(0) if era else None
    t_old=f"the {era} map draws it" if era else "the old map draws it"
    if v['move']: t_mid=f"the {yr} topo draws it where the pin now sits"
    elif c in('B','S','C','D','T') and v['txt'].find('at the pin')>=0 or c=='V': t_mid=f"the {yr} topo still shows buildings or a built-up spot there"
    elif c in('B','S','C','K','D','T'): t_mid=f"the {yr} topo draws {('a building' if c=='B' else 'the site')} nearby" + (", which the pin now sits on" if v['move'] else ", not on the pin")
    elif c=='N': t_mid=f"the {yr} topo draws nothing there, so it was gone by then"
    elif c=='F': t_mid=f"the {yr} topo shows woods or marsh"
    else: t_mid="no old topo detail"
    t_now= f"a building stands about {round(dmin)} m away today" if dmin is not None and dmin<=50 else ("no building within 100 m today" if dmin is None else f"the nearest building today is about {round(dmin)} m away")
    line=f"Built-on since: {t_old}; {t_mid}; {t_now}."
    grade=old[0] if old else None
    if re.search(r'cemetery|graveyard|burying',nm) or c=='K' and 'cemetery' in nm: grade='X'; why='Cemetery: look only, never detect.'
    elif DISTURB.search(' '.join(v['notes']+v['lid'])): grade='D'; why='The ground has been dug, flooded or built over since.'
    elif c=='V' and n100>=8: grade='C'; why='Town lot: streets, yards and buildings have reworked most of the old surface.'
    elif c=='F' and dmin is None: grade='A'; why='Woods or marsh on the old topo and no building within 100 m today: likely never plowed or built on.'
    elif dmin is not None and dmin<=30: grade='B'; why='A building stands on or near the spot today, so part of the old yard may be lawn now.'
    elif c=='N' and dmin is None: grade=grade or 'B'; why='Nothing was rebuilt here after the site went; open field or pasture, so plowed but not built over.'
    else: grade=grade or 'B'; why='Open ground with buildings nearby; parts of the old yard likely survive.'
    if old and old[0]=='X': grade='X'; why=old[1]
    G[pid]=[grade,why+' '+line]
json.dump(G,open('ugju98.json','w'),indent=0)
import collections; print(collections.Counter(g[0] for g in G.values()))
print(collections.Counter((P[k].get('ug') or ['-'])[0]+'>'+g[0] for k,g in G.items()).most_common(20))
pass
