# Cards read LiDAR stats from p.lid (scored) or p.lidc (card text only, no score change); title gives the real picture width.
import sys
f=sys.argv[1]; s=open(f).read()
if 'p.lid||p.lidc' in s: sys.exit('already patched')
R=[("  if(!p.lid) return `<div class=\"lid\">","  const LS=p.lid||p.lidc; if(!LS) return `<div class=\"lid\">"),
   ("  const [pits,deep,mounds,marea,relief,tile]=p.lid;","  const [pits,deep,mounds,marea,relief,tile]=LS;"),
   ("1 m LiDAR view (bare earth, 600 m across)</b><img ${ISRC(LIDIMG[p.id])} data-lik=\"${esc(p.id)}\"","1 m LiDAR view (bare earth, ${/^@m-/.test(LIDIMG[k])?360:600} m across)</b><img ${ISRC(LIDIMG[k])} data-lik=\"${esc(k)}\"")]
for a,b in R: assert s.count(a)==1,a; s=s.replace(a,b)
open(f,'w').write(s)
