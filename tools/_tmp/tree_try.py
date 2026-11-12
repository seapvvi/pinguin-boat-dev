import math, sys
sys.path.insert(0, 'tools')
import numpy as np
import halftone as M
from plates import vnoise, specks, caps, ell, LIGHT, write_svg

N1 = vnoise(520, 640, cells=7, octaves=4, seed=21)    # clumps
N2 = vnoise(520, 640, cells=19, octaves=3, seed=22)   # leaf texture

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


def field(x, y):
    d = np.asarray(lobes(x, y), float) * (1 + 0.17 * (N1(x, y) - 0.5) * 2.2)
    canopy = np.clip((0.12 - d) / 0.26, 0, 1)
    # light from the upper left: rim edge brighter, hollows darker
    lit = np.clip(0.5 - (x - CX) / RX * 0.55 - (y - CY) / RY * 0.55, 0, 1) ** 1.1
    clump = np.clip(N1(x, y) * 1.5 - 0.22, 0, 1) ** 0.8
    leaf = 0.55 + 0.5 * N2(x, y)
    canopy = canopy * (0.20 + 0.80 * lit) * (0.40 + 0.70 * clump) * leaf
    canopy = canopy * (1 - 0.45 * np.clip((d - 0.72) / 0.30, 0, 1) * (1 - lit))

    limb = lambda ax, ay, bx, by, w0, w1=None: (1 - caps(x, y, ax, ay, bx, by, w0, w1)) * 0.62
    trunk = np.maximum.reduce([
        limb(262, 594, 258, 476, 16, 13),
        limb(258, 476, 254, 404, 13, 9),
        limb(254, 404, 196, 320, 8, 5),
        limb(254, 404, 256, 350, 6.5, 4),
        limb(254, 404, 322, 314, 8, 5),
        limb(196, 320, 166, 286, 4.2, 2.6),
        limb(322, 314, 356, 282, 4.2, 2.6),
        limb(258, 476, 300, 430, 4.6, 3),
        limb(258, 476, 222, 448, 4.2, 2.8),
    ])
    bark = np.clip(0.85 + 0.5 * N2(x, 0.37), 0, 1)
    shade = np.clip(0.45 + 0.5 * np.clip((x - 232) / 34.0, 0, 1), 0, 1)
    trunk = trunk * bark * shade

    band = np.clip((y - 588) / 4, 0, 1) * np.clip((610 - y) / 10, 0, 1)
    dash = np.where(N2(x * 2.4, 0.5) > 0.40, 0.55, 0.05)
    ground = band * dash
    shadow = np.clip((1.25 - ell(x, y, 262, 597, 78, 9)) / 0.8, 0, 1) * 0.09
    fallen = specks(x, y, 40, 110, 420, 500, 596, 1.8, 0.6, 5, 0.10, 0.34)
    parts = [np.asarray(pf, float) for pf in (canopy * 0.96, trunk, ground, shadow, fallen)]
    print('canopy', parts[0].max().round(2), 'trunk', parts[1].max().round(2), 'ground', parts[2].max().round(2), 'shadow', parts[3].max().round(2), 'fallen', parts[4].max().round(2))
    v = np.maximum.reduce(parts)
    return np.asarray(v, float)


if __name__ == "__main__":
    write_svg('tools/_tmp/tree-try.svg', 'tree', field, 520, 640)
