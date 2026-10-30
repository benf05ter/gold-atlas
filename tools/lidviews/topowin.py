# Read an old USGS topo GeoTIFF onto the same 1 m UTM grid as a cached LiDAR window
import os,urllib.parse,numpy as np
os.environ.setdefault('CURL_CA_BUNDLE','/root/.ccr/ca-bundle.crt'); os.environ.setdefault('GDAL_DISABLE_READDIR_ON_OPEN','EMPTY_DIR')
os.environ.setdefault('GDAL_HTTP_MULTIRANGE','YES'); os.environ.setdefault('GDAL_HTTP_MERGE_CONSECUTIVE_RANGES','YES')
import rasterio
from rasterio.warp import reproject,Resampling
from rasterio.transform import from_origin
def url(k): return '/vsicurl/https://prd-tnm.s3.amazonaws.com/'+urllib.parse.quote(k)
def onto(k,z,x0,y1,n=600,res=1.0,pad=0):
    """topo RGB (3,h,w) on the UTM zone z grid with top-left (x0-pad,y1+pad), res metres per pixel"""
    m=int((n+2*pad)/res); dst=np.zeros((3,m,m),np.uint8)
    with rasterio.open(url(k)) as s:
        for b in range(3):
            reproject(rasterio.band(s,b+1),dst[b],dst_transform=from_origin(x0-pad,y1+pad,res,res),dst_crs=f'EPSG:{26900+z}',resampling=Resampling.bilinear)
    return dst
