# Draws the Old Ground app icon (a gold trowel over topo lines on forest green) and the iPhone launch screens.
import sys, math, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
out=sys.argv[1]
S=2048; BG=(28,48,37); TOPO=(52,84,63); GOLD=(214,160,44); GOLDHI=(250,214,110); WOOD=(92,58,34); WOODHI=(128,84,50); STEEL=(150,156,150); CREAM=(246,240,224)
def topo(d,cx,cy,R):
    for i,k in enumerate([1.0,0.82,0.64,0.47,0.31,0.16]):   # nested contour rings, a little lumpy like a hill
        pts=[]
        for a in range(0,361,3):
            t=math.radians(a); r=R*k*(1+0.07*math.sin(3*t+i*0.7)+0.04*math.cos(5*t+i))
            pts.append((cx+r*math.cos(t)*1.12, cy+r*math.sin(t)*0.86))
        d.line(pts,fill=TOPO,width=int(S*0.011),joint='curve')
def rot(pts,cx,cy,a):
    c,s=math.cos(a),math.sin(a); return [(cx+(x-cx)*c-(y-cy)*s, cy+(x-cx)*s+(y-cy)*c) for x,y in pts]
def trowel(im,cx,cy,L):
    sh=Image.new('L',im.size,0); ds=ImageDraw.Draw(sh); lay=Image.new('RGBA',im.size,(0,0,0,0)); d=ImageDraw.Draw(lay); a=math.radians(-40)
    blade=[(cx,cy-L*0.62),(cx+L*0.21,cy-L*0.18),(cx+L*0.17,cy+L*0.08),(cx,cy+L*0.12),(cx-L*0.17,cy+L*0.08),(cx-L*0.21,cy-L*0.18)]
    hi=[(cx,cy-L*0.62),(cx+L*0.21,cy-L*0.18),(cx+L*0.17,cy+L*0.08),(cx,cy+L*0.12)]
    shank=[(cx-L*0.025,cy+L*0.1),(cx+L*0.025,cy+L*0.1),(cx+L*0.025,cy+L*0.25),(cx-L*0.025,cy+L*0.25)]
    fer=[(cx-L*0.055,cy+L*0.23),(cx+L*0.055,cy+L*0.23),(cx+L*0.055,cy+L*0.29),(cx-L*0.055,cy+L*0.29)]
    handle=[(cx-L*0.065,cy+L*0.29),(cx+L*0.065,cy+L*0.29),(cx+L*0.075,cy+L*0.6),(cx,cy+L*0.66),(cx-L*0.075,cy+L*0.6)]
    hhi=[(cx+L*0.01,cy+L*0.3),(cx+L*0.065,cy+L*0.3),(cx+L*0.073,cy+L*0.58),(cx+L*0.01,cy+L*0.62)]
    for poly in (blade,shank,fer,handle): ds.polygon(rot(poly,cx,cy,a),fill=255)
    d.polygon(rot(blade,cx,cy,a),fill=GOLD); d.polygon(rot(hi,cx,cy,a),fill=GOLDHI)
    d.line(rot([(cx,cy-L*0.55),(cx,cy+L*0.1)],cx,cy,a),fill=(176,124,28),width=int(L*0.018))
    d.polygon(rot(shank,cx,cy,a),fill=STEEL); d.polygon(rot(fer,cx,cy,a),fill=STEEL)
    d.polygon(rot(handle,cx,cy,a),fill=WOOD); d.polygon(rot(hhi,cx,cy,a),fill=WOODHI)
    shadow=Image.new('RGBA',im.size,(0,0,0,0)); shadow.putalpha(sh.filter(ImageFilter.GaussianBlur(L*0.03)).point(lambda v:int(v*0.45)))
    im.alpha_composite(shadow,(int(L*0.02),int(L*0.05))); im.alpha_composite(lay)
def icon(pad):
    im=Image.new('RGBA',(S,S),BG+(255,)); d=ImageDraw.Draw(im); c=S/2; R=(S/2-pad)
    topo(d,c,c+R*0.05,R*1.05); trowel(im,c+R*0.02,c+R*0.02,R*1.25); return im.convert('RGB')
full=icon(S*0.06); safe=icon(S*0.22)
for n,im,z in [('icon-192.png',full,192),('icon-512.png',full,512),('apple-touch-icon.png',full,180),('maskable-512.png',safe,512)]:
    im.resize((z,z),Image.LANCZOS).save(f'{out}/{n}',optimize=True)
# launch screens: the icon art and the name on the same green, one per iPhone screen size
SPL=[(1320,2868),(1290,2796),(1206,2622),(1179,2556),(1284,2778),(1170,2532),(1125,2436),(1242,2688),(828,1792),(1080,2340),(750,1334)]
fp=next((p for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf','/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf'] if os.path.exists(p)),None)
art=icon(S*0.06)
for w,h in SPL:
    im=Image.new('RGB',(w,h),BG); z=int(w*0.42); a=art.resize((z,z),Image.LANCZOS)
    m=Image.new('L',(z,z),0); ImageDraw.Draw(m).rounded_rectangle([0,0,z-1,z-1],radius=int(z*0.22),fill=255)
    im.paste(a,((w-z)//2,int(h*0.40)-z//2),m); d=ImageDraw.Draw(im)
    if fp:
        f=ImageFont.truetype(fp,int(w*0.085)); t='Old Ground'; tw=d.textlength(t,font=f); d.text(((w-tw)/2,int(h*0.40)+z//2+int(w*0.07)),t,font=f,fill=CREAM)
    im.save(f'{out}/splash-{w}x{h}.png',optimize=True)
