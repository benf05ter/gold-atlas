# Web-dive pin moves (2026-10-30 10:30Z): three existing pins placed in the wrong sections move to the source point; the Bogus Bluff
# LiDAR child matched to the old Richland pin is dropped. usage: moves.py og-data.js ; refuses a rerun. Prints moved ids (redo LiDAR pictures).
import sys,json
f=sys.argv[1]; s=open(f,encoding='utf-8').read(); tag='\n// Web-dive pin moves 2026-10-30\n'; assert tag not in s,'already applied'
M={'fr-whitewater-falls-village':[44.12056,-92.00361,'B','Moved 2026-10-30 about 3.8 km: the source puts the townsite on secs 27 and 34, T108N R10W (Whitewater Twp); the 1934 USGS Plainview topo draws a school and road junction at the pin.'],
 'fr-frankford-village-1856':[43.7138,-92.4582,'B','Moved 2026-10-30 1.6 km west: the old pin fell in T103N R13W, outside Frankford Twp (T103N R14W). The source puts the village on Deer Creek in far east Frankford Twp; pin is GNIS Frankford Cemetery, sec 24.'],
 'ab4-chengwatana-village':[45.83861,-92.9375,'C','Moved 2026-10-30 to the Snake River rapids east of Pine City (source GPS; the 1961 USGS Pine City topo shows the rapids there). The old pin sat 1.4 km SSW of the GNIS historical marker on no feature.']}
s+=(tag+'DATA.points=DATA.points.filter(p=>p.id!=="lc-t-richland-bluff-cave-2");\n{ const M='+json.dumps(M)+'; for(const p of DATA.points){ const x=M[p.id]; if(!x) continue; '
 'p.la=x[0]; p.lo=x[1]; p.pinconf=x[2]; p.p="approx"; p.st=(p.st||"").replace(/ Air photo check \\(UW[^)]*\\):[^.]*\\./g,"").replace(/ LiDAR cache check[^.]*\\.[^.]*\\./g,"")+" "+x[3]; delete LIDC[p.id]; delete LIDIMG[p.id]; } }\n')
open(f,'w',encoding='utf-8').write(s); print(json.dumps([{'id':k,'la':v[0],'lo':v[1]} for k,v in M.items()]))
