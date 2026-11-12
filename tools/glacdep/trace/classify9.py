import numpy as np, sys
from PIL import Image
from scipy import ndimage as nd
from sklearn.ensemble import RandomForestClassifier
g=np.load('gi.npy'); st=np.load('state_mask.npy')
def sh(x,dy,dx): return np.roll(np.roll(x,-dy,0),-dx,1)
D={s:np.abs(g-sh(g,*s)) for s in [(0,1),(1,0),(0,2),(2,0),(0,4),(4,0),(2,2),(4,4),(2,-2)]}
comp={}
for t in (150,210,235):
    dk=g<t; L,n=nd.label(dk); sz=np.r_[0,nd.sum(dk,L,np.arange(1,n+1))]
    comp[t]=(dk&(sz[L]<=12)).astype(np.float32)
feats=[]
for w in (9,17):
    U=lambda x: nd.uniform_filter(x,w)
    m=U(g); sd=np.sqrt(np.maximum(U(g*g)-m*m,0))+1
    d={s:U(D[s])+1 for s in D}
    feats += [m/40, sd/15]+[d[s]/sd for s in D]+[d[(0,4)]/d[(0,2)], d[(4,0)]/d[(2,0)], d[(0,1)]/d[(1,0)], d[(4,4)]/d[(2,2)]]+[U(comp[t])*5 for t in comp]
F=np.stack(feats,-1).astype(np.float32)
S={2:[(1426,1452,226,296),(1150,1190,700,790)],3:[(1508,1534,226,296),(1160,1240,918,945),(1110,1135,645,675)],4:[(1590,1616,226,296),(1395,1440,875,900)],5:[(1672,1698,226,296),(1280,1330,800,870),(1260,1300,1110,1170),(1130,1200,1265,1295)],6:[(1376,1424,436,479),(1410,1440,585,640),(1215,1285,705,755)]}
X=[];Y=[]
for k,bs in S.items():
    for y0,y1,x0,x1 in bs:
        f=F[y0+4:y1-4,x0+4:x1-4].reshape(-1,F.shape[-1]); X.append(f); Y+=[k]*len(f)
X=np.concatenate(X);Y=np.array(Y)
rf=RandomForestClassifier(80,max_depth=10,min_samples_leaf=5,n_jobs=2,random_state=0).fit(X,Y)
P=np.zeros(st.shape+(5,),np.float32)
idx=np.nonzero(st); P[idx]=rf.predict_proba(F[idx])
np.save('prob9raw.npy',P)
