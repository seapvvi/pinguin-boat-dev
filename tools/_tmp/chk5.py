import sys; sys.path.insert(0,'tools'); sys.path.insert(0,'tools/_tmp')
from plates import dots
import tree_try as T
X,Y,R=dots(520,640,T.field)
sel=(Y<20)
print('top row dots', sel.sum(), 'r mean', R[sel].mean() if sel.any() else None)
import numpy as np
print('r percentiles', np.percentile(R,[0,10,50,90,100]))
print('x of left column dots', X[X<20][:5], R[X<20][:5])
