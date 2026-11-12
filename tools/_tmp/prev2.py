import re, sys, os
from PIL import Image, ImageDraw
f=sys.argv[1]
s=open(f,encoding='utf-8').read()
w,h=map(int,re.search(r'viewBox="0 0 (\d+) (\d+)"',s).groups())
im=Image.new('L',(w,h),0); d=ImageDraw.Draw(im)
for cx,cy,r in re.findall(r'<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/>',s):
    x,y,rr=float(cx),float(cy),float(r)
    d.ellipse((x-rr,y-rr,x+rr,y+rr),fill=int(min(255, 80+70*rr)))
im.resize((w//2,h//2),Image.LANCZOS).save(sys.argv[2])
