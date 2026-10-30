# Park ground grades for the 24 counties: adds pk/hist-counties.json to the park history list.
import sys
f=sys.argv[1]; s=open(f).read(); a="const PHF=['pk/hist-eauclaire.json','pk/hist-wi.json']"
if 'hist-counties' in s: sys.exit('already patched')
assert s.count(a)==1; open(f,'w').write(s.replace(a,"const PHF=['pk/hist-eauclaire.json','pk/hist-wi.json','pk/hist-counties.json']"))
