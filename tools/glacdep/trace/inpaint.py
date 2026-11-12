# Step 3: removes county lines, borders and red ink from the page so the texture classes read cleanly; saves gi.npy, redmask.npy, red7.npy.
import numpy as np; from PIL import Image; from scipy import ndimage as nd
a=np.asarray(Image.open('p-000.png').convert('RGB')).astype(np.float32); g=a.mean(2)
red=nd.uniform_filter(a[...,0]-(a[...,1]+a[...,2])/2,5); rm=red>35
dk=g<85; L,n=nd.label(dk); sz=np.r_[0,nd.sum(dk,L,np.arange(1,n+1))]
line=nd.binary_dilation(dk&(sz[L]>40),iterations=2)
bad=line|nd.binary_dilation(rm,iterations=2)
_,(iy,ix)=nd.distance_transform_edt(bad,return_indices=True)
np.save('gi.npy',g[iy,ix].astype(np.float32)); np.save('redmask.npy',rm)
np.save('red7.npy',nd.uniform_filter(a[...,0]-(a[...,1]+a[...,2])/2,7).astype(np.float32))
