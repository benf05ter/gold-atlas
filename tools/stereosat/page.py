# 1938 in 3D and summer crop marks (v226): puts tools/stereosat/sv.js at the end of the page as its own script (after nl.js, le.js and lidviews,
# which also wrap select). Copy research/stereo-satellite/sv/ next to the page. usage: page.py index.html
import sys,os
f=sys.argv[1]; s=open(f,encoding='utf-8').read(); js=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'sv.js'),encoding='utf-8').read()
assert '1938 in 3D (stereo pairs' not in s,'already in'; assert s.rstrip().endswith('</body></html>')
i=s.rstrip().rfind('</body></html>'); s=s[:i]+'<script>\n'+js+'\n</script>\n</body></html>\n'
open(f,'w',encoding='utf-8').write(s); print('ok')
