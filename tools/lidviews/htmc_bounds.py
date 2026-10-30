# lon/lat bounds of every USGS historical topo GeoTIFF dated <=1964 at 1:62,500 or larger
import json,re,os,urllib.parse
os.environ['CURL_CA_BUNDLE']='/root/.ccr/ca-bundle.crt'; os.environ['GDAL_DISABLE_READDIR_ON_OPEN']='EMPTY_DIR'
import rasterio
from rasterio.warp import transform_bounds
from multiprocessing import Pool
def go(k):
    m=re.search(r'/([A-Z]{2})_(.+)_(\d+)_(\d{4})_(\d+)_geo\.tif$',k)
    u='/vsicurl/https://prd-tnm.s3.amazonaws.com/'+urllib.parse.quote(k)
    try:
        with rasterio.open(u) as d: b=transform_bounds(d.crs,4326,*d.bounds); r=d.res[0]
    except Exception as e: return None
    return dict(k=k,st=m[1],n=m[2],y=int(m[4]),sc=int(m[5]),b=[round(x,5) for x in b],res=r)
if __name__=='__main__':
    K=[]
    for k,s in json.load(open('htmc.json')):
        m=re.search(r'_(\d{4})_(\d+)_geo\.tif$',k)
        if m and int(m[1])<=1964 and int(m[2])<=62500: K.append(k)
    with Pool(16) as p: R=[r for r in p.imap_unordered(go,K,chunksize=8) if r]
    json.dump(R,open('htmc_b.json','w')); print(len(K),len(R))
