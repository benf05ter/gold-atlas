import urllib.request,re,json,sys,urllib.parse
out=[]
for st in ['WI','MN','MI']:
    m=''
    while True:
        u=f"https://prd-tnm.s3.amazonaws.com/?prefix=StagedProducts/Maps/HistoricalTopo/GeoTIFF/{st}/&max-keys=1000"+(f"&marker={urllib.parse.quote(m)}" if m else '')
        x=urllib.request.urlopen(u).read().decode()
        ks=re.findall(r'<Key>([^<]+)</Key><LastModified>[^<]+</LastModified><ETag>[^<]+</ETag><Size>(\d+)</Size>',x)
        out+=[(k,int(s)) for k,s in ks]
        if '<IsTruncated>true' not in x or not ks: break
        m=ks[-1][0]
    print(st,len(out),file=sys.stderr)
json.dump(out,open('htmc.json','w'))
