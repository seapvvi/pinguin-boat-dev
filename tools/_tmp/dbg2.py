import sys; sys.path.insert(0,'tools')
import numpy as np, math
import plates as P
xs=np.arange(3.1,520,6.2); ys=np.arange(3.1,640,6.2)
X,Y=np.meshgrid(xs,ys)
cx,cy,rx,ry=258,230,152,106
ca,sa=math.cos(P.TREE_ROT),math.sin(P.TREE_ROT)
ux=(X-cx)*ca+(Y-cy)*sa; uy=-(X-cx)*sa+(Y-cy)*ca
lobe=np.full(X.shape,1e9)
for lx,ly,lr in P.TREE_PTS:
    lobe=np.minimum(lobe, np.hypot(ux-lx*rx,(uy-ly*ry)*(rx/ry))/(lr*rx))
n=P.vnoise(520,640,cells=7,octaves=4,seed=21)
f=np.asarray(1+0.17*(n(X,Y)-0.5)*2.2)
l2=np.asarray(lobe)*np.asarray(f)
d=1/l2
cover=P.M.sstep(0.12,-0.12,d)
print('manual lobe min', l2.min())
print('manual cover mean', np.asarray(cover).mean())
x,y=X,Y
