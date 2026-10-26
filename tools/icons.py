# Draws the app icon: a gold pan with nuggets on dark green.
import sys
from PIL import Image, ImageDraw
out=sys.argv[1]
S=2048
def draw(pad):
    im=Image.new('RGB',(S,S),(31,52,41)); d=ImageDraw.Draw(im)
    c=S/2; R=(S/2-pad)*0.80
    d.ellipse([c-R,c-R+40,c+R,c+R+40],fill=(15,28,21))                     # shadow
    d.ellipse([c-R,c-R,c+R,c+R],fill=(88,96,92))                           # pan rim
    r2=R*0.86; d.ellipse([c-r2,c-r2,c+r2,c+r2],fill=(58,64,61))            # pan wall
    r3=R*0.62; d.ellipse([c-r3,c-r3,c+r3,c+r3],fill=(40,44,42))            # pan floor
    for i in range(3):                                                     # riffles
        rr=r2-(i+1)*(r2-r3)/4; d.arc([c-rr,c-rr,c+rr,c+rr],200,340,fill=(72,79,75),width=int(S*0.012))
    d.ellipse([c-r3*0.9,c-r3*0.15,c+r3*0.9,c+r3*0.95],fill=(30,30,28))     # black sand
    gold=[(c-R*0.18,c+R*0.22,R*0.20),(c+R*0.20,c+R*0.30,R*0.13),(c+R*0.02,c+R*0.48,R*0.09),(c-R*0.38,c+R*0.44,R*0.07),(c+R*0.38,c+R*0.10,R*0.06)]
    for x,y,r in gold:
        d.polygon([(x-r,y),(x-r*0.55,y-r*0.85),(x+r*0.3,y-r),(x+r,y-r*0.2),(x+r*0.7,y+r*0.75),(x-r*0.2,y+r*0.9)],fill=(214,160,44))
        d.polygon([(x-r*0.55,y-r*0.55),(x+r*0.2,y-r*0.7),(x-r*0.1,y-r*0.15)],fill=(250,214,110))
    x,y,s=c+R*0.42,c-R*0.45,R*0.16                                         # sparkle
    d.polygon([(x,y-s),(x+s*0.22,y-s*0.22),(x+s,y),(x+s*0.22,y+s*0.22),(x,y+s),(x-s*0.22,y+s*0.22),(x-s,y),(x-s*0.22,y-s*0.22)],fill=(255,236,170))
    return im
full=draw(S*0.06); safe=draw(S*0.20)
for n,im,z in [('icon-192.png',full,192),('icon-512.png',full,512),('apple-touch-icon.png',full,180),('maskable-512.png',safe,512)]:
    im.resize((z,z),Image.LANCZOS).save(f'{out}/{n}',optimize=True)
