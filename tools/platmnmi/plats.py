# Adds the five Minnesota/Michigan wall maps to the Plat books map type (PLATS list + "Sources and fit" notes).
# App: tiles ot/p-* (tools/tiles/spec.json). Artifact: whole pictures om13/plat_*.webp from the asset store (tools/artifact-assets.txt).
# usage: plats.py index.html out-dir (research/plat-mn-mi/out) ; re-running does nothing.
import sys,json,os
f,O=sys.argv[1],sys.argv[2]; s=open(f,encoding='utf-8').read()
if "id:'ramseywash87'" in s: print('already'); sys.exit()
L=[('ramseywash87','Ramsey/Washington MN 1887','plat_ramsey_washington_1887','p-ramseywash87',"Map of Ramsey and Washington Counties, Minnesota (C. M. Foote &amp; Co., Minneapolis, 1887), Library of Congress 2012593067: one wall map, with edges of Anoka, Dakota and Hennepin. St. Paul's outskirts, Stillwater, the St. Croix and White Bear Lake resorts. Fit: median 59 m."),
   ('dakota74','Dakota MN 1874','plat_dakota_1874','p-dakota74',"Map of Dakota County, Minnesota (A. H. Hoenck, Hoenck &amp; Roosen, St. Paul, 1874), Library of Congress 2012593028. Fit: median 24 m."),
   ('houston71','Houston MN 1871','plat_houston_1871','p-houston71',"Map of Houston County, Minnesota (H. I. Bliss &amp; J. M. Marti, La Crosse, 1871), Library of Congress 2012593030: village plats like Riceford, Clinton and Sheldon that faded later. Fit: median 41 m."),
   ('menominee98','Menominee MI 1898','plat_menominee_1898','p-menominee98',"Map of Menominee County, Mich. (Albert Hass and A. W. Blom, Menominee, 1898), Library of Congress 2012593145: logging-era camps, rail sidings and schools. Fit: median 43 m."),
   ('gogebic87','Gogebic/Ontonagon MI 1887','plat_gogebic_ontonagon_1887','p-gogebic87',"Map of the Mineral Regions of Gogebic and Ontonagon Counties, Michigan (Allis and Merrell, Milwaukee; J. M. Longyear and J. M. Case, 1887), Library of Congress 2012593363: the Gogebic iron range mines and their locations in the 1887 boom. Mine pins are within 200-500 m.")]
add=''.join(f",\n  {{id:'{i}',label:'{l}',b:{json.dumps(json.load(open(os.path.join(O,fn+'.webp.json')))['b'])},f:'{fn}',dir:'om13',tile:'{t}'}}" for i,l,fn,t,_ in L)
a="tile:'p-burnett-1915'}"; assert s.count(a)==1; s=s.replace(a,a+add)
k=s.find('<details><summary>Sources and fit</summary>',s.find('id="gm13"')); e=s.find('</details>',k)
s=s[:e]+''.join(f'<p class="hint"><b>{l}:</b> {src}</p>\n    ' for i,l,fn,t,src in L)+'<p class="hint">Minnesota page-book counties (Chisago 1888, Goodhue 1894, Wabasha 1896, Winona 1867) have pins only, no map picture yet.</p>\n    '+s[e:]
open(f,'w',encoding='utf-8').write(s); print('ok')
