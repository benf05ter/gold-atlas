# Public-land layer (research/public-land/): adds pl.js as its own <script> right after the parks section and
# corrects the Minnesota state-park detecting rule (Minn. R. 6100.0900: only to find a specific lost item).
# usage: apply.py index.html pl.js ; refuses a rerun. Copy research/public-land/pl/ next to the page as pl/.
import sys
f=sys.argv[1]; s=open(f,encoding='utf-8').read(); js=open(sys.argv[2],encoding='utf-8').read()
assert "id:'_pland'" not in s,'already applied'
a=s.index('// ---------- parks and public land, trails'); b=s.index('</script>',a)+len('</script>')
s=s[:b]+'\n<script>\n'+js.rstrip()+'\n</script>'+s[b:]
for o,n in [('Minnesota state parks ban detectors, Wisconsin DNR','Minnesota state parks allow detectors only to find a specific lost item, Wisconsin DNR'),
            ('Minnesota state parks ban detectors, and Michigan','Minnesota state parks allow detectors only to find a specific lost item, and Michigan'),
            ('Minnesota state parks ban detectors; Wisconsin','Minnesota state parks allow detectors only to find a specific lost item; Wisconsin'),
            ('Minnesota state parks ban detectors.','Minnesota state parks allow detectors only to find a specific lost item.')]:
    assert o in s,o; s=s.replace(o,n)
assert 'state parks ban detectors' not in s
open(f,'w',encoding='utf-8').write(s); print('ok')
