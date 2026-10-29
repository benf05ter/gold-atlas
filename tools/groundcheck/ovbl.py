import s3fs,pyarrow.dataset as ds,pyarrow.compute as pc,pyarrow.parquet as pq,time,sys
fs=s3fs.S3FileSystem(anon=True, client_kwargs={'region_name':'us-west-2'})
kind=sys.argv[1]
path={'b':'theme=buildings/type=building','r':'theme=transportation/type=segment'}[kind]
d=ds.dataset('overturemaps-us-west-2/release/2026-10-21.0/'+path, filesystem=fs, format='parquet')
f=(pc.field('bbox','xmin')>-90.05)&(pc.field('bbox','xmax')<-89.4)&(pc.field('bbox','ymin')>45.1)&(pc.field('bbox','ymax')<45.58)
cols=['bbox'] if kind=='b' else ['geometry','class','subtype']
t=time.time(); tb=d.to_table(columns=cols,filter=f); print(tb.num_rows,time.time()-t)
pq.write_table(tb,'/tmp/claude-0/pv/ov_%s_l.parquet'%kind)
