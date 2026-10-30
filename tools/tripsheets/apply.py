# Offline trip sheets (research/trip-sheets/): adds trip.js as its own <script> right after the public-land section (pl.js).
# usage: apply.py index.html [trip.js] ; refuses a rerun.
import sys,os
f=sys.argv[1]; js=open(sys.argv[2] if len(sys.argv)>2 else os.path.join(os.path.dirname(os.path.abspath(__file__)),'trip.js'),encoding='utf-8').read()
s=open(f,encoding='utf-8').read(); assert 'tsPrint' not in s,'already applied'
a=s.index('// ---------- public land: who owns the ground'); b=s.index('</script>',a)+len('</script>')
s=s[:b]+'\n<script>\n'+js.rstrip()+'\n</script>'+s[b:]; open(f,'w',encoding='utf-8').write(s); print('ok')
