import numpy as np
from PIL import Image
from scipy import ndimage as nd
st=np.load('state_mask.npy'); P=np.load('prob9raw.npy')
for k in range(5): P[...,k]=nd.uniform_filter(P[...,k],11)
lab=np.zeros(st.shape,np.uint8); lab[st]=P[st].argmax(1)+2
wh0=lab==6; er=nd.binary_erosion(wh0,iterations=8); Le,ne=nd.label(er); se=nd.sum(er,Le,np.arange(1,ne+1)); core=Le==(np.argmax(se)+1); core=nd.binary_dilation(core,iterations=10)&wh0
wh=wh0; L,n=nd.label(wh); sz=nd.sum(wh,L,np.arange(1,n+1)); order=np.argsort(sz)[::-1]
print('white comps',sz[order[:6]])
keep=np.zeros(n+1,bool); keep[order[0]+1]=True
# keep big white blobs (water bodies like Lake Winnebago) too
import PIL.Image as I
G=np.asarray(I.open('p-000.png').convert('L')).astype(float)
mn=nd.mean(G,L,np.arange(1,n+1))
for i in order[1:]:
    if sz[i]>3000 and mn[i]>247: keep[i+1]=True; print('keep',sz[i],mn[i])
drop=wh0&~core
lab[drop]=0
_,(iy,ix)=nd.distance_transform_edt(lab==0,return_indices=True)
fill=lab[iy,ix]; lab[drop]=fill[drop]
rm=np.load('red7.npy')>18
rm=nd.binary_opening(rm,iterations=1)
L,n=nd.label(rm); s2=np.r_[0,nd.sum(rm,L,np.arange(1,n+1))]; rm=rm&(s2[L]>150)
rm=nd.binary_closing(rm,iterations=2)
prev=lab.copy()
lab[rm&st]=1
Lr,nr=nd.label(lab==1); objs=nd.find_objects(Lr)
for i,sl in enumerate(objs):
    sl2=tuple(slice(max(s.start-8,0),s.stop+8) for s in sl)
    comp=Lr[sl2]==i+1; ring=nd.binary_dilation(comp,iterations=6)&~comp
    if (prev[sl2][ring]==6).mean()>0.4: lab[sl2][comp]=6
# merge tiny components into surrounding majority
for it in range(2):
    for k in range(2,7):
        m=lab==k; L,n=nd.label(m); s=np.r_[0,nd.sum(m,L,np.arange(1,n+1))]
        small=m&(s[L]<80)
        if small.any():
            lab2=lab.copy(); lab2[small]=0
            _,(iy,ix)=nd.distance_transform_edt(lab2==0,return_indices=True)
            lab[small]=lab2[iy,ix][small]
lab[~st]=0
np.save('lab13.npy',lab)
for k in range(1,7): print(k,(lab==k).sum())
pal=np.array([[255,255,255],[200,40,40],[150,200,120],[240,200,60],[250,150,40],[80,140,230],[235,235,235]],np.uint8)
a=Image.open('p-000.png').resize((850,1100)); b=Image.fromarray(pal[lab]).resize((850,1100))
c=Image.new('RGB',(1300,700),'white'); c.paste(a.crop((100,180,750,900)).resize((650,700)),(0,0)); c.paste(b.crop((100,180,750,900)).resize((650,700)),(650,0)); c.save('side12.png')
