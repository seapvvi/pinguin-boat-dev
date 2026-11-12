import sys; sys.path.insert(0,'tools'); sys.path.insert(0,'tools/_tmp')
import math
import numpy as np
from plates import vnoise
import tree_try as T
N1 = vnoise(520, 640, cells=7, octaves=4, seed=21)
x=np.array([[258., 342, 174],[258.,258,258],[100.,100,100]])
y=np.array([[230., 230,230],[140,230,320],[300,300,300]])
print('T.N1', T.N1(x,y))
print('local N1', N1(x,y))
print('T.lobes', T.lobes(x,y))
# manual lobes
def man(x,y):
    ca, sa = math.cos(T.ROT), math.sin(T.ROT)
    ux = (x - T.CX) * ca + (y - T.CY) * sa
    uy = -(x - T.CX) * sa + (y - T.CY) * ca
    out=None
    for lx, ly, lr in T.PTS:
        d = np.hypot(ux - lx * T.RX, (uy - ly * T.RY) * (T.RX / T.RY)) / (lr * T.RX)
        out = d if out is None else np.minimum(out, d)
    return out
print('manual', man(x,y))
