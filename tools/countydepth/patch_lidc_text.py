# Cards show LiDAR counts from LIDC (og-data.js) too, and spots with counts but no picture get a text-only LiDAR line.
import sys
f=sys.argv[1]; s=open(f).read()
if 'LIDC[p.id]' in s: sys.exit('already patched')
R=[("function lidarHTML(p){ const k=lidKey(p); if(!k) return '';\n",
    "function lidarHTML(p){ const k=lidKey(p), LS=p.lid||p.lidc||(typeof LIDC!=='undefined'&&LIDC[p.id]); if(!k&&!LS) return '';\n"
    "  if(!k){ const [pits,deep,mounds,marea,relief,tile]=LS; return `<div class=\"lid\"><b style=\"font-size:13px\">1 m LiDAR within 300 m</b><span class=\"hint\">${pits} hollows (${deep} deeper than 2.5 m), ${mounds} raised features covering ${marea.toLocaleString()} m\\u00b2, ${relief} m of relief. Hollows can be cellar holes, wells, privies or pits; raised features can be foundations, mounds or spoil. USGS 3DEP tile ${esc(tile)}.</span></div>`; }\n"),
   ("  const LS=p.lid||p.lidc; if(!LS) return","  if(!LS) return")]
for a,b in R: assert s.count(a)==1,a; s=s.replace(a,b)
open(f,'w').write(s)
