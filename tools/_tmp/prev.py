import os, re, sys
from PIL import Image, ImageDraw
for f in sys.argv[1:]:
    s=open(f,encoding='utf-8').read()
    w,h=map(int,re.search(r'viewBox="0 0 (\d+) (\d+)"',s).groups())
    im=Image.new('L',(w,h),0); d=ImageDraw.Draw(im)
    for cx,cy,r in re.findall(r'<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)"/>',s):
        x,y,rr=float(cx),float(cy),float(r)
        d.ellipse((x-rr,y-rr,x+rr,y+rr),fill=int(min(255, 90+70*rr)))
    k=440/max(w,h)
    im.resize((int(w*k),int(h*k)),Image.BOX).save('tools/_tmp/'+os.path.basename(f).replace('.svg','.png'))
    print(os.path.basename(f), w, h, len(re.findall(r'<circle', s)))
