# Lets spot cards show the bundled LiDAR picture even when the pin has no LiDAR stats (plat-check pins, farms).
import sys
f=sys.argv[1]; s=open(f).read()
if 'lidKey(' in s: sys.exit('already patched')
old="function lidarHTML(p){ if(!p.lid||!LIDIMG[p.id]) return '';"
new=("function lidKey(p){ return LIDIMG[p.id]?p.id:(/-pit$/.test(p.id)&&LIDIMG[p.id.slice(0,-4)]?p.id.slice(0,-4):''); }\n"
 "function lidarHTML(p){ const k=lidKey(p); if(!k) return '';\n"
 "  if(!p.lid) return `<div class=\"lid\"><b style=\"font-size:13px\">1 m LiDAR view (bare earth, 360 m across)</b><img ${ISRC(LIDIMG[k])} data-lik=\"${esc(k)}\" width=\"220\" height=\"220\" alt=\"LiDAR hillshade around ${esc(p.n)}\" style=\"width:200px;height:200px\"><span class=\"hint\">Red cross = ${k===p.id?'pin':'farm pin'}${/^af-/.test(k)?'; yellow ring = LiDAR pit':''}. Reddish = raised ground (mounds, banks, buildings); bluish = hollows (cellar holes, wells, privies, ditches). Bar = 50 m. USGS 3DEP 1 m LiDAR.</span></div>`;")
assert s.count(old)==1; s=s.replace(old,new)
old2="(p.lid&&LIDIMG[p.id])"
assert s.count(old2)==1; s=s.replace(old2,"lidKey(p)")
# keep the LiDAR picture (and its legend, and tap-to-enlarge) in the card instead of moving it up as the top photo
old3="d.querySelector('.imgs .lid, .imgs figure, .imgs > div')"
assert s.count(old3)==1; s=s.replace(old3,"d.querySelector('.imgs figure, .imgs > div:not(.lid)')")
open(f,'w').write(s)
