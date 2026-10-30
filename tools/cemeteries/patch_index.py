# Cemeteries look-only layer (v226): one red "Cemeteries (look only)" layer, off at first and kept out of every list until it is on
# (same switch as the abandoned farms), always F tier and never a dig spot. Data CEM_LAYER in og-data.js (add_data.py).
# usage: patch_index.py index.html
import sys
f=sys.argv[1]; s=open(f,encoding='utf-8').read()
assert 'CEM_LAYER' not in s,'already patched'
def rep(old,new,n=1):
    global s; c=s.count(old); assert c==n,(c,old[:80]); s=s.replace(old,new)
rep("--L-restricted:#c4262e;","--L-restricted:#c4262e; --L-cem:#c4262e;")
rep("--L-restricted:#ff6b70;","--L-restricted:#ff6b70; --L-cem:#ff6b70;",2)
rep(" prehist:'<path"," cem:'<path d=\"M-.13,-.6 H.13 V-.28 H.42 V-.02 H.13 V.6 H-.13 V-.02 H-.42 V-.28 H-.13Z\"/>',\n prehist:'<path")
rep("{sec:'Rules and protected areas', id:'restricted',","{sec:'Rules and protected areas', id:'cem', n:'Cemeteries (look only)', d:'Country and town cemeteries from the USGS place-name file and Find a Grave family plots. Never detect inside one or along its edges: unmarked graves lie outside the fence. Off at first', on:false},\n{sec:'Rules and protected areas', id:'restricted',")
rep("const SHORT={","const SHORT={cem:'Cemetery (look only)',")
rep("if(L==='prehist') return ['F','Look only: archaeological site'];","if(L==='prehist') return ['F','Look only: archaeological site'];\n    if(L==='cem') return ['F','Look only: cemetery'];")
rep("NOGO=new Set(['target',","NOGO=new Set(['cem','target',")
rep("const AFL=new Set(['af15','af38','af64']), afOff=p=>AFL.has(p.L)&&!on.has(p.L);",
"""// CEMETERIES (v226): look-only red points, one switch-on layer like the farms; data CEM_LAYER in og-data.js
{ if(typeof CEM_LAYER!=='undefined'){ const TIP='Never detect inside a cemetery, and keep well clear of its edges: unmarked graves often lie outside the fence or the mowed line, and in Wisconsin, Minnesota and Michigan disturbing a burial is a crime.';
  for(const r of CEM_LAYER){ const fag=typeof r[0]==='string';
   DATA.points.push({id:fag?r[0]:'cem-'+r[0],L:'cem',n:r[1],la:r[4],lo:r[5],co:r[3],stt:r[2],pl:`${r[3]} County`,y:'',v:'None: look only',c:'documented',s:'unknown',p:fag?'gps':'gnis',
    st:fag?r[7]:`The USGS place-name file lists ${r[1]} here, placed from the ${r[6]} topographic map. Look only: no detecting or digging.`,t:TIP,
    src:[fag?['Find a Grave (read on the PC thread)','https://www.findagrave.com/']:['USGS Geographic Names Information System, feature '+r[0],'https://edits.nationalmap.gov/apps/gaz-domestic/public/summary/'+r[0]]],
    acc:['stop','Cemetery: look only']}); } } }
const AFL=new Set(['af15','af38','af64','cem']), afOff=p=>AFL.has(p.L)&&!on.has(p.L);""")
open(f,'w',encoding='utf-8').write(s); print('patched',f)
