# Faster app start (v466): og-data.js carries ~350 card patches that run at DOMContentLoaded, and each one walked every pin on the map
# (~48,000 by then) to find the few dozen it changes: 4-5 s of every start on a phone. This rewrites only the loop head of those patches so
# each one visits just its own pins, through one shared id index. Same pins, same order, same moment, same text: nothing else changes.
#   python3 -I tools/perf/dclindex.py <og-data.js in> <og-data.js out>      (safe to re-run; the build runs it on the app copy)
# A patch body only ever reads its own pin p and entry x, so visiting fewer pins can't change what it does. The index is rebuilt whenever
# DATA.points is replaced or changes length (a few patches filter pins out), and pins come back in their map order.
import re,sys
s=open(sys.argv[1],encoding='utf-8').read()
HEAD='/* DCLIDX */ function OGIX(E){ const P=DATA.points; if(OGIX.P!==P||OGIX.n!==P.length){ const I=new Map(); for(let i=0;i<P.length;i++){ const k=String(P[i].id), a=I.get(k); if(a) a.push(i); else I.set(k,[i]); } OGIX.I=I; OGIX.P=P; OGIX.n=P.length; }\n  const ix=[]; for(const k in E){ const a=OGIX.I.get(k); if(a) for(const i of a) ix.push(i); } ix.sort((a,b)=>a-b); return ix.map(i=>P[i]); }\n'
if '/* DCLIDX */' in s: s=s.replace(s[s.index('/* DCLIDX */'):s.index('\n',s.index('ix.sort('))+1],'')
pat=re.compile(r'(addEventListener\(["\']DOMContentLoaded["\'],\(\)=>\{.{0,40}?)for\(const p of DATA\.points\)\{ ?const (x|e|f)=(\w)\[p\.id\]; ?if\(!\2\) continue;',re.S)
n=0
def rep(m):
    global n; n+=1; return m.group(1)+'for(const p of OGIX('+m.group(3)+')){ const '+m.group(2)+'='+m.group(3)+'[p.id]; if(!'+m.group(2)+') continue;'
s2=pat.sub(rep,s)
# patches whose table E is declared inside the handler: addEventListener('DOMContentLoaded',()=>{ const E={...}; for(const p of DATA.points){ const x=E[p.id]; ...
pat2=re.compile(r'(addEventListener\(["\']DOMContentLoaded["\'],\(\)=>\{ ?const (\w)=\{)')
out=[]; last=0
for m in pat2.finditer(s2):
    i=m.end(); depth=1; j=i; q=None
    while depth and j<len(s2):
        c=s2[j]
        if q:
            if c=='\\': j+=1
            elif c==q: q=None
        elif c in '"\'': q=c
        elif c=='{': depth+=1
        elif c=='}': depth-=1
        j+=1
    V=m.group(2); tail=s2[j:j+120]
    mm=re.match(r';? ?for\(const p of DATA\.points\)\{ ?const (x|e|f)='+V+r'\[p\.id\]; ?if\(!\1\) continue;',tail)
    if mm and j>=last:
        out.append(s2[last:j]); out.append('; for(const p of OGIX('+V+')){ const '+mm.group(1)+'='+V+'[p.id]; if(!'+mm.group(1)+') continue;'); last=j+mm.end(); n+=1
out.append(s2[last:]); s2=''.join(out)
i=s2.index('\n')+1 if s2.startswith('//') else 0
s2=s2[:i]+HEAD+s2[i:]
open(sys.argv[2],'w',encoding='utf-8').write(s2)
left=len(re.findall(r'addEventListener\(["\']DOMContentLoaded["\'][^\n]{0,60000}?for\(const p of DATA\.points\)',s2))
print(n,'patch loops indexed;',left,'DOMContentLoaded handlers still walk every pin')
