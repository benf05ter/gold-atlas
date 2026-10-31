# usage: enrich_dcl.sh enrich.json og-data.js : apply_enrich, then wrap the block in DOMContentLoaded (for lazy vs-/sc- pins)
python3 /home/user/gold-atlas/tools/countydepth/apply_enrich.py "$1" "$2" && python3 - "$1" "$2" <<'PY'
import sys,os
f=sys.argv[2]; s=open(f,encoding='utf-8').read(); tag='\n// County-depth card notes: '+os.path.basename(sys.argv[1])+'\n'
i=s.index(tag)+len(tag); j=s.index('\n',i); blk=s[i:j]; assert blk.startswith('{ const E=')
s=s[:i]+"document.addEventListener('DOMContentLoaded',()=>"+blk+");"+s[j:]; open(f,'w',encoding='utf-8').write(s); print('wrapped')
PY
