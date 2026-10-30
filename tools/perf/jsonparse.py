# Speeds up og-data.js loading (v273): big object/array literals become JSON.parse('...'), which phones parse about a third faster.
#   python3 -I tools/perf/jsonparse.py og-data.js og-data.js   (safe to re-run: lines already converted are left alone)
import re,json,sys
src=open(sys.argv[1],encoding='utf-8').read().split('\n'); out=[]; n=0; saved=0
pat=[re.compile(r'^(const \w+ ?= ?)([\[{].*[\]}])(;?)\s*$'),re.compile(r'^(DATA\.points\.push\(\.\.\.)(\[.*\])(\);)\s*$'),re.compile(r'^(Object\.assign\(\w+,)(\{.*\})(\);)\s*$'),re.compile(r'^(CEM_LAYER\.push\(\.\.\.)(\[.*\])(\);)\s*$')]
for line in src:
    done=False
    if len(line)>20000:
        for p in pat:
            m=p.match(line)
            if m:
                try: v=json.loads(m.group(2))
                except Exception: break
                s=json.dumps(v,ensure_ascii=False,separators=(',',':'))
                lit="'"+s.replace('\\','\\\\').replace("'","\\'").replace('\u2028','\\u2028').replace('\u2029','\\u2029')+"'"
                out.append(m.group(1)+'JSON.parse('+lit+')'+m.group(3)); n+=1; done=True; break
    if not done: out.append(line)
open(sys.argv[2],'w',encoding='utf-8').write('\n'.join(out)); print(n,'lines converted')
