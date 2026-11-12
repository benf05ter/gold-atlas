# Builds the scanned-state mask: flood the paper from the page edge through light pixels; what the flood can't reach is the state.
import numpy as np
from PIL import Image
from scipy import ndimage as nd
a=np.asarray(Image.open('p-000.png').convert('RGB')).astype(int)
g=a.mean(2)
light=g>200
# only the map area (drop title block area not needed; legend is outside state but enclosed boxes are small, removed by keeping largest component)
lab,n=nd.label(light)
edge=set(np.unique(np.r_[lab[0],lab[-1],lab[:,0],lab[:,-1]]))-{0}
paper=np.isin(lab,list(edge))
state=~paper
state=nd.binary_opening(state,iterations=2)
lab2,n2=nd.label(state); sz=nd.sum(state,lab2,range(1,n2+1)); k=np.argmax(sz)+1
st=lab2==k
st=nd.binary_fill_holes(st)
print(st.sum(), np.argwhere(st).min(0), np.argwhere(st).max(0))
Image.fromarray((st*255).astype(np.uint8)).save('state_mask.png')
np.save('state_mask.npy',st)
