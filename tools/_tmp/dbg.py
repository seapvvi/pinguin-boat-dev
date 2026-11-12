import sys; sys.path.insert(0,'tools'); sys.path.insert(0,'tools/_tmp')
import numpy as np, math
import halftone as M
from plates import vnoise
N1 = vnoise(520, 640, cells=7, octaves=4, seed=21)
N2 = vnoise(520, 640, cells=19, octaves=3, seed=22)
CX, CY, RX, RY, ROT = 258, 230, 152, 106, -0.06
PTS = [(-0.62, 0.02, 0.52), (-0.30, -0.42, 0.60), (0.16, -0.46, 0.56),
       (0.56, -0.10, 0.55), (0.34, 0.34, 0.58), (-0.20, 0.40, 0.54),
       (0.02, -0.02, 0.72)]
def lobes(x, y):
    ca, sa = math.cos(ROT), math.sin(ROT)
    ux = (x - CX) * ca + (y - CY) * sa
    uy = -(x - CX) * sa + (y - CY) * ca
    out = None
    for lx, ly, lr in PTS:
        d = np.hypot(ux - lx * RX, (uy - ly * RY) * (RX / RY)) / (lr * RX)
        out = d if out is None else np.minimum(out, d)
    return out
xs=np.arange(0,520,20); ys=np.arange(0,640,20)
X,Y=np.meshgrid(xs,ys)
v=lobes(X,Y)
print(np.round(v[3:20:3, 3:23:3],2))
import tree_try as T
print('T.lobes', T.lobes(np.array([258.]),np.array([140.])))
import inspect
src=inspect.getsource(T.field)
print('M.sstep' in src, 'clip' in src)
import halftone
print(halftone.__file__, T.M.__file__, T.M.sstep)
