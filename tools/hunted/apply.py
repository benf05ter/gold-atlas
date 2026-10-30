# Already-hunted check (research/already-hunted/leads.tsv): p.hunt=[flag, note, source, url] on the named spots (og-data.js)
# and a page block (index.html) that shows the note on the card and drops 'heavy' spots one tier (never below E, never raises).
# usage: apply.py leads.tsv og-data.js index.html ; re-running swaps both blocks.
import sys,csv,json
R=[r for r in csv.DictReader(open(sys.argv[1],encoding='utf-8'),delimiter='\t') if r['spot_id'].strip()]
H={}
for r in R:
    v=[r['flag'].strip(),r['card_note'].strip(),r['source'].strip(),r['url'].strip()]
    for k in r['spot_id'].split(','): H[k.strip()]=v
if 't-plum-creek-diamonds' in H: H.setdefault('g-PC',H['t-plum-creek-diamonds'])
A='\n// Already-hunted check (research/already-hunted/leads.tsv)\n'
d=open(sys.argv[2],encoding='utf-8').read()
if A in d: d=d[:d.index(A)]+d[d.index('\n',d.index(A)+len(A)+1)+1:]
d+=A+'{ const H='+json.dumps(H,ensure_ascii=False)+'; for(const p of DATA.points){ const x=H[p.id]; if(x) p.hunt=x; if(p.id==="t-becker-glidden"&&!/Beckey/.test(p.n)) p.n+=" (also spelled Beckey)"; } }\n'
open(sys.argv[2],'w',encoding='utf-8').write(d)
JS=r"""<script>
// ---------- Already hunted (v214): p.hunt=[flag, note, source, url]. 'heavy' (two independent hunted-out reports) drops one tier, never below E;
// the other flags (some, known, finds, found?, searched) only add a card line.
{ const C=TIER.C, g0=TIER.get, T=['S','A','B','C','D','E','F'];
  TIER.get=function(p){ const b=g0(p); if(!p.hunt||p.hunt[0]!=='heavy') return b; const i=T.indexOf(b.t); if(i<0||i>=5) return b;
    return {t:T[i+1],sc:b.sc,w:'Hunted out (two or more reports): dropped from '+b.t+(b.w?'; '+b.w:'')}; };
  TIER.t=p=>TIER.get(p).t;
  const rk0=rkHTML; rkHTML=function(p){ let h=rk0(p); try{ if(p.hunt){ const [f,n,s,u]=p.hunt;
    h+=`<div class="tierwhy" style="border-color:${f==='heavy'?C.E:'#b0a080'}">${esc(n)}${s?` <span class="hint">(${u?`<a href="${esc(u)}" target="_blank" rel="noopener">${esc(s)}</a>`:esc(s)})</span>`:''}</div>`; } }catch(e){ OGE.err&&OGE.err('hunt card',e); } return h; };
}
// ---------- end already hunted
</script>
"""
s=open(sys.argv[3],encoding='utf-8').read(); a='<script>\n// ---------- Already hunted (v214)'; b='// ---------- end already hunted\n</script>\n'
if a in s: i=s.index(a); s=s[:i]+s[s.index(b,i)+len(b):]
k=s.rfind('</body>'); k=len(s) if k<0 else k
s=s[:k]+JS+s[k:]; open(sys.argv[3],'w',encoding='utf-8').write(s); print(len(H),'spots')
