import sys,re
src,dst=sys.argv[1],sys.argv[2]
h=open(src,encoding='utf8').read()
ss=open('ss.js',encoding='utf8').read()
assert 'SSORT' not in h
old="function renderList(){ if(BOOT.skip('renderList')) return; "
assert h.count(old)==1
h=h.replace(old,old+"if(typeof SSORT==='object'&&SSORT.list&&SSORT.list()) return; ")
i=h.rindex('</script>')+len('</script>')
h=h[:i]+'\n<script>\n'+ss+'</script>'+h[i:]
open(dst,'w',encoding='utf8').write(h)
print('ok',len(h))
