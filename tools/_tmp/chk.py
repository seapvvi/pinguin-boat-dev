import sys; sys.path.insert(0,'tools'); sys.path.insert(0,'tools/_tmp')
from plates import vnoise
import numpy as np
N1 = vnoise(520, 640, cells=7, octaves=4, seed=21)
x=np.array([258.]); y=np.array([140.])
a=N1(x,y); b=N1(y,x)
print(a,b)
xs=np.arange(0,520.0,6.2); ys=np.arange(0,640.0,6.2)
X,Y=np.meshgrid(xs,ys)
print('domain', N1(X,Y).min(), N1(X,Y).max(), N1(X,Y).mean())
