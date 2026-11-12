import sys; sys.path.insert(0,'tools'); sys.path.insert(0,'tools/_tmp')
import numpy as np, tree_try as T
xs=np.arange(3.1,520,6.2); ys=np.arange(3.1,640,6.2)
X,Y=np.meshgrid(xs,ys)
v=T.field(X,Y)
print(type(v), getattr(v,'shape',None), float(v.mean()))
d=np.asarray(T.lobes(X,Y),float)
print('lobes at (0,0)', d[0,0])
print('lobes min over grid', d.min(), np.argmin(d))
