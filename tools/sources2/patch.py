# Adds (or refreshes) the two-sources block (v210) on an Old Ground page that already has the S-F tiers (v197).
# Re-run it after research/negatives.tsv changes: it swaps the old block for the new one, so it is safe to run twice.
# usage: python3 tools/sources2/patch.py index.html /mnt/project-files/research/negatives.tsv
import sys, os, json, csv
here=os.path.dirname(os.path.abspath(__file__))
f=sys.argv[1]; tsv=sys.argv[2] if len(sys.argv)>2 else '/mnt/project-files/research/negatives.tsv'
s=open(f,encoding='utf-8').read()
if '// ---------- Tiers (v197)' not in s: sys.exit('needs the v197 tier block first (tools/tiers/patch.py)')
neg={}
if os.path.exists(tsv):
    for r in csv.DictReader(open(tsv,encoding='utf-8'),delimiter='\t'):
        if (r.get('outcome') or '').strip()=='rejected' and (r.get('spot_id') or '').strip() not in ('','-'):
            neg[r['spot_id'].strip()]=[r['date'].strip(),r['who'].strip(),r['reason'].strip(),r['sources_checked'].strip()]
blk=open(os.path.join(here,'src2.js'),encoding='utf-8').read()
blk=blk.replace('/*NEG*/{}/*/NEG*/','/*NEG*/'+json.dumps(neg,ensure_ascii=False).replace('</','<\\/')+'/*/NEG*/')
A='<script>\n// ---------- Two sources (v210)'; B='// ---------- end two sources\n</script>\n'
blk='<script>\n'+blk+B
if A in s:
    i=s.index(A); j=s.index(B,i)+len(B); s=s[:i]+blk+s[j:]; how='refreshed'
else:
    i=s.rstrip().rfind('</body>'); s=s[:i]+blk+s[i:]; how='patched'
open(f,'w',encoding='utf-8').write(s)
print(how,f,'with',len(neg),'rejected spots')
