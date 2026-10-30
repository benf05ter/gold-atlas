import s3fs,pyarrow.dataset as ds,pyarrow.compute as pc,pyarrow.parquet as pq,time,json,sys
fs=s3fs.S3FileSystem(anon=True, client_kwargs={'region_name':'us-west-2'})
pins=json.load(open(sys.argv[1]))
d=ds.dataset('overturemaps-us-west-2/release/2026-10-21.0/theme=base/type=water', filesystem=fs, format='parquet')
lat=[p[1] for p in pins]; lon=[p[2] for p in pins]
f=(pc.field('bbox','xmax')>min(lon)-.1)&(pc.field('bbox','xmin')<max(lon)+.1)&(pc.field('bbox','ymax')>min(lat)-.1)&(pc.field('bbox','ymin')<max(lat)+.1)
t=time.time(); n=0; out=[]
for fr in d.get_fragments(filter=f):
  tb=fr.to_table(columns=['bbox','geometry','class','subtype'],filter=f)
  if tb.num_rows: out.append(tb); n+=tb.num_rows
  print(fr.path[-40:],tb.num_rows,round(time.time()-t),flush=True)
import pyarrow as pa
pq.write_table(pa.concat_tables(out),sys.argv[2]); print('rows',n,time.time()-t)
