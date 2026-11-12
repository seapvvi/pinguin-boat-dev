import sys; sys.path.insert(0,'tools'); sys.path.insert(0,'tools/_tmp')
import numpy as np, tree_try as T
xs=np.arange(3.1,520,6.2); ys=np.arange(3.1,640,6.2)
X,Y=np.meshgrid(xs,ys)
d=np.asarray(T.lobes(X,Y),float)*(1+0.17*(T.N1(X,Y)-0.5)*2.2)
canopy=np.clip((0.12-d)/0.26,0,1)
lit=np.clip(0.5-(X-T.CX)/T.RX*0.55-(Y-T.CY)/T.RY*0.55,0,1)**1.1
clump=np.clip(T.N1(X,Y)*1.5-0.22,0,1)**0.8
leaf=0.55+0.5*T.N2(X,Y)
c=canopy*(0.20+0.80*lit)*(0.40+0.70*clump)*leaf
print('canopy sum',canopy.sum(),'c sum',c.sum(),'c max',c.max())
print('N1 shape', T.N1(X,Y).shape, 'd shape', d.shape)
