# Collect the pins to check from the shared og-data.js (every DATA.points.push batch)
import json,re,sys,collections
PRE=('pb13-','pc-','pc88-','pd88-','pe10-','pbp77-','pt01-','pj01-','sv78-','sf-','gs-','nw-')
def load(path='/mnt/project-files/atlas/og-data.js'):
    s=open(path).read(); D=json.JSONDecoder(); out=[]
    for m in re.finditer(r'DATA\.points\.push\(\.\.\.\[',s):
        try: arr,_=D.raw_decode(s,m.end()-1)
        except Exception as e: continue
        out+= [p for p in arr if isinstance(p,dict) and str(p.get('id','')).startswith(PRE)]
    for m in re.finditer(r'DATA\.points\.push\(\{',s):  # single-pin pushes (nw-)
        try: p,_=D.raw_decode(s,m.end()-1)
        except Exception: continue
        if str(p.get('id','')).startswith(PRE): out.append(p)
    return out
if __name__=='__main__':
    P=load(); print(len(P),collections.Counter(p['id'].split('-')[0] for p in P)); print(collections.Counter(p.get('co') for p in P).most_common(40))
    json.dump(P,open('pins-all.json','w'))
