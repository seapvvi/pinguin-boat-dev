"""Builds every dotted plate used on the page. Run: python tools/plates.py

Plates are halftone dot fields on a near black ground, rendered to SVG. The
artwork fills the plate, with one Chinese character set in the top right.
"""
import math
import os

import numpy as np
from PIL import Image

import halftone as H
import glyph as G

TAU = math.tau
M = H
OUT = os.path.join(os.path.dirname(__file__), "..", "assets")

LIGHT = (-0.6, -0.8)

# ------------------------------------------------------------------- look
# brighter ink, deeper ground, punchier dot curve than the first pass: more
# full dots, more true black, so the plates carry like the poster reference
INK = (233, 226, 214)
BG = (3, 3, 3)
STEP = 6.2
R_MIN, R_MAX, GAMMA = 0.35, 3.35, 0.72


def shaded(field, dx=2.2, dy=2.6, k=0.5, light=LIGHT):
    """Evaluate field on the dot grid plus a gradient tap for hill shading."""
    def f(x, y):
        return M.shade(field, x, y, dx, dy, light, k)
    return f


def lift(v, lo=0.02):
    """Trim the near black floor so empty ground reads as pure black."""
    v = np.clip(np.asarray(v, float), 0, 1)
    return np.clip((v - lo) / (1 - lo), 0, 1)


def vnoise(w, h, cells=5, octaves=3, seed=0):
    """Smooth value noise as a sampler: soft blobs at `cells` scale, plus detail."""
    rng = np.random.default_rng(seed)
    acc = np.zeros((h, w))
    amp, tot = 1.0, 0.0
    for o in range(octaves):
        c = cells * (2 ** o)
        g = (rng.random((c + 1, c + 1)) * 255).astype(np.uint8)
        im = Image.fromarray(g, "L").resize((w, h), Image.BICUBIC)
        acc += np.asarray(im, float) / 255 * amp
        tot += amp
        amp *= 0.52
    arr = acc / tot

    def s(x, y):
        ix = np.clip(np.round(x).astype(int), 0, w - 1)
        iy = np.clip(np.round(y).astype(int), 0, h - 1)
        return arr[iy, ix]
    return s


def specks(x, y, n, x0, x1, y0, y1, r0, r1, seed, a0, a1):
    """A scatter of soft round specks."""
    rng = np.random.default_rng(seed)
    out = np.zeros(np.shape(x))
    for _ in range(n):
        sx, sy = rng.uniform(x0, x1), rng.uniform(y0, y1)
        rad = rng.uniform(min(r0, r1), max(r0, r1))
        out = np.maximum(out, M.sstep(rad, 0.0, np.hypot(x - sx, y - sy)) * rng.uniform(a0, a1))
    return out


def caps(x, y, ax, ay, bx, by, w0, w1=None):
    """A tapering capsule stroke from (ax,ay) to (bx,by), width w0 -> w1."""
    sd = M.sd_capsule(x, y, ax, ay, bx, by, 0)
    if w1 is None:
        return M.sstep(w0, w0 * 0.55, sd)
    t = np.clip(np.hypot(x - ax, y - ay) / max(math.hypot(bx - ax, by - ay), 1e-9), 0, 1)
    w = w0 + (w1 - w0) * t
    return M.sstep(w, w * 0.55, sd)


def ell(x, y, cx, cy, rx, ry):
    """Normalised ellipse radius: 1 on the rim, 0 at the centre."""
    return np.hypot((x - cx) / rx, (y - cy) / ry)


# --------------------------------------------------------------------- tree
# a dead tree: a bare trunk, forked branches and fine twigs, no leaves, and a
# broken ground line

def tree_field(x, y):
    n2 = vnoise(520, 640, cells=19, octaves=3, seed=22)

    def limb(ax, ay, bx, by, w0, w1):
        return M.sstep(w0, w0 * 0.5, M.sd_capsule(x, y, ax, ay, bx, by, 0)) * (0.55 + 0.45 * (w1 / w0))

    branch = np.maximum.reduce([
        # trunk, leaning and kinked
        limb(240, 600, 228, 540, 36, 30),
        limb(228, 540, 246, 470, 32, 24),
        limb(246, 470, 230, 404, 24, 17),
        limb(230, 404, 240, 350, 17, 12),
        # main boughs
        limb(240, 350, 152, 300, 14, 8),
        limb(152, 300, 64, 258, 8, 4.5),
        limb(240, 350, 332, 320, 13, 7),
        limb(332, 320, 424, 288, 7, 4),
        limb(240, 350, 252, 274, 12, 7),
        limb(252, 274, 234, 196, 7, 4),
        limb(234, 196, 260, 126, 4, 2),
        # left branches
        limb(152, 300, 126, 218, 6, 3),
        limb(152, 300, 182, 212, 5, 2.5),
        limb(64, 258, 40, 204, 4, 2),
        limb(64, 258, 100, 188, 4, 2),
        # right branches
        limb(332, 320, 348, 234, 6, 3),
        limb(332, 320, 386, 224, 5, 2.5),
        limb(424, 288, 462, 236, 4, 2),
        limb(424, 288, 444, 208, 3.5, 1.8),
        # centre branches
        limb(252, 274, 286, 212, 5, 2.5),
        limb(234, 196, 204, 150, 4, 2),
        limb(234, 196, 276, 152, 4, 2),
        # broken stubs
        limb(232, 470, 198, 452, 7, 3),
        limb(238, 430, 272, 408, 6, 2.5),
        # twigs
        limb(126, 218, 104, 172, 2.8, 1.2),
        limb(126, 218, 144, 166, 2.6, 1.1),
        limb(182, 212, 196, 164, 2.5, 1),
        limb(40, 204, 24, 168, 2.5, 1),
        limb(100, 188, 88, 146, 2.5, 1),
        limb(348, 234, 336, 184, 2.6, 1.1),
        limb(348, 234, 372, 182, 2.5, 1),
        limb(386, 224, 404, 178, 2.5, 1),
        limb(462, 236, 482, 196, 2.5, 1),
        limb(444, 208, 458, 166, 2.3, 1),
        limb(286, 212, 300, 168, 2.5, 1),
        limb(204, 150, 190, 112, 2.3, 1),
        limb(276, 152, 292, 112, 2.3, 1),
        limb(260, 126, 250, 94, 2.2, 0.9),
    ])

    # bark grain, lit a little more on the left
    branch = branch * (0.8 + 0.32 * n2(x, y * 0.5))
    branch = branch * np.clip(0.6 + 0.4 * np.clip((380 - x) / 240, 0, 1), 0, 1)

    band = M.sstep(588, 592, y) * M.sstep(610, 600, y)
    ground = band * np.where(n2(x * 2.4, 0.5) > 0.40, 0.55, 0.05)
    shadow = M.sstep(1.25, 0.5, ell(x, y, 240, 600, 92, 10)) * 0.10
    fallen = specks(x, y, 40, 100, 430, 500, 600, 1.8, 0.6, 5, 0.10, 0.34)
    litter = np.maximum.reduce([
        limb(150, 603, 208, 599, 2.8, 1.2),
        limb(300, 604, 352, 600, 2.5, 1),
    ])
    return np.maximum.reduce([np.asarray(v) for v in (branch, ground, shadow, fallen, litter)])


# --------------------------------------------------------------------- city
# a skyline at night: dark towers, sparse lit windows, a small moon

def city_field(x, y):
    base = 548
    buildings = [
        (52, 96, 208), (150, 80, 302), (234, 62, 246), (298, 98, 366),
        (394, 72, 238), (466, 100, 306), (126, 38, 148), (352, 42, 168),
    ]
    sky = M.sstep(548, 320, y) * M.sstep(140, 320, y) * 0.04

    moon = M.aa(lambda a, b: np.hypot(a - 424, b - 122) - 26, x, y)
    mn = np.hypot((x - 424) / 26.0, (y - 122) / 26.0)
    nz = np.sqrt(np.clip(1 - mn * mn, 0, 1))
    lam = np.clip(-((x - 424) * 0.7 + (y - 122) * 0.7) / 26.0 * 0.4 + nz * 0.75, 0, 1)
    moon = moon * np.clip(0.08 + 0.95 * lam ** 1.2, 0, 1)

    towers = np.zeros(np.shape(x))
    windows = np.zeros(np.shape(x))
    for i, (cx, bw, bh) in enumerate(buildings):
        sd = M.sd_box(x, y, cx, base - bh / 2, bw / 2, bh / 2)
        inside = M.fill(sd)
        towers = np.maximum(towers, inside * (0.075 + 0.02 * ((i * 7) % 3)))
        rim = M.sstep(2.8, 0.5, np.abs(sd)) * inside
        towers = np.maximum(towers, rim * 0.62)
        # windows: sparse cells, brighter near street level
        u = (x - (cx - bw / 2)) / 15.0
        v = (y - (base - bh)) / 21.0
        iu = np.floor(u).astype(int)
        iv = np.floor(v).astype(int)
        hsh = (np.sin(iu * 12.9898 + iv * 78.233 + i * 37.7) * 43758.5453) % 1.0
        cell = (u > 0.45) & (u < bw / 15.0 - 0.45) & (v > 0.5) & (v < bh / 21.0 - 0.4)
        fade = 0.30 + 0.70 * M.sstep(base - bh, base, y) ** 1.2
        windows = np.maximum(windows, np.where(cell & (hsh > 0.85), inside * 0.75 * fade, 0))
    antenna = caps(x, y, 298, base - 366, 298, base - 410, 2.4) * 0.6

    street = M.sstep(base + 2, base + 9, y) * M.sstep(620, 592, y) * 0.10
    refl = windows * M.sstep(base + 30, base + 2, y) * 0.07
    stars = specks(x, y, 26, 10, 510, 40, 230, 1.5, 0.5, 9, 0.12, 0.4)
    return np.maximum.reduce([towers, windows, sky, moon * 0.95, antenna, street, refl, stars])


# --------------------------------------------------------------------- moon
# a crescent, lit hard on its outer limb, one thin cloud band, few stars

def moon_field(x, y):
    cx, cy, r = 282, 292, 176
    qx, qy, qr = cx + 108, cy - 78, r * 1.0
    d_out = np.hypot(x - cx, y - cy) - r
    d_cut = np.hypot(x - qx, y - qy) - qr
    # crescent: inside the big circle, outside the cutter
    cres = np.maximum(d_out, -d_cut)

    def depth(a, b):
        return np.maximum(np.hypot(a - cx, b - cy) - r, -(np.hypot(a - qx, b - qy) - qr))

    body = M.aa(depth, x, y)
    # brightness runs from the terminator (inner edge) out to the lit limb:
    # f = 0 on the cut edge, 1 on the outer rim
    f = np.clip(d_cut / (d_cut - d_out), 0, 1)
    lit = f ** 1.15
    n = vnoise(520, 640, cells=6, octaves=4, seed=23)
    body = body * np.clip(0.03 + 1.0 * lit, 0, 1) * (0.60 + 0.50 * n(x, y))
    limb = M.sstep(2.6, 0.4, np.abs(cres)) * 0.5
    body = np.maximum(body, M.aa(depth, x, y) * limb)
    cloud = caps(x, y, 120, 520, 400, 508, 16, 10) * 0.05 + caps(x, y, 220, 560, 460, 548, 12, 8) * 0.045
    stars = specks(x, y, 40, 20, 500, 30, 560, 1.6, 0.5, 31, 0.16, 0.5)
    stars = np.maximum(stars, specks(x, y, 12, 20, 500, 30, 200, 1.6, 0.6, 32, 0.10, 0.35))
    return np.maximum.reduce([body, cloud, stars])


# ------------------------------------------------------------------- saturn
# the orbit scene: a ball, a tilted ring crossing in front, a rider moon

SPH = (300, 300)
SPH_R = 152
ORB = (300 + 148 * math.cos(-0.75), 300 + 148 * math.sin(-0.75) * 0.62)
ORB_R = 58
TILT = (math.cos(0.28), math.sin(0.28))


def saturn_field(x, y):
    # always drawn on a 520 square, then the plate crops it to its own size
    cx, cy = SPH
    nx, ny = (x - cx) / SPH_R, (y - cy) / SPH_R
    d2 = nx * nx + ny * ny
    inside = d2 <= 1
    nz = np.sqrt(np.clip(1 - d2, 0, 1))
    lam = np.clip(nx * -0.55 + ny * -0.58 + nz * 0.45, 0, 1)
    lit = 0.02 + 0.98 * lam ** 2.1
    rim = (1 - nz) ** 3 * np.clip(-(nx * -0.55 + ny * -0.58), 0, 1)
    body = M.aa(lambda a, b: np.hypot((a - SPH[0]) / SPH_R, (b - SPH[1]) / SPH_R) - 1, x, y) \
        * np.clip(lit + 0.45 * rim, 0, 1)

    ux, uy = TILT
    ax, ay = -uy * 0.30, ux * 0.30
    t = np.linspace(0, TAU, 540, endpoint=False)
    px = cx + 276 * (np.cos(t) * ux + np.sin(t) * ax)
    py = cy + 276 * (np.cos(t) * uy + np.sin(t) * ay)
    far = (np.cos(t) > 0.15) & (np.sin(t) > -0.6) | (np.cos(t) > 0.75)
    dd = np.hypot(x[..., None] - px, y[..., None] - py)
    d_near = np.min(np.where(far, 1e9, dd), axis=-1)
    d_far = np.min(np.where(far, dd, 1e9), axis=-1)
    d_all = np.minimum(d_near, d_far)
    width = 7.0 + 5.5 * np.cos(t)
    w_near = np.max(np.where(far, 0.0, width))
    w_far = np.max(np.where(far, width, 0.0))
    front = M.sstep(w_near / 2 + 1.6, w_near / 2 - 1.0, d_near)
    back = M.sstep(w_far / 2 + 1.6, w_far / 2 - 1.0, d_far)
    back = np.where(inside & (d_all < w_far), 0, back) * 0.9
    ring = np.maximum(front * 0.95, back)
    ring = np.where(front > 0, ring, np.where(inside, ring, 0))

    ox, oy = ORB
    onx, ony = (x - ox) / ORB_R, (y - oy) / ORB_R
    onz = np.sqrt(np.clip(1 - onx * onx - ony * ony, 0, 1))
    olam = np.clip(onx * -0.55 + ony * -0.58 + onz * 0.6, 0, 1)
    orb = M.aa(lambda a, b: np.hypot((a - ox) / ORB_R, (b - oy) / ORB_R) - 1, x, y)
    orb = orb * np.clip(0.30 + 0.75 * olam ** 1.3 + 0.5 * (1 - onz) ** 3, 0, 1)

    stars = specks(x, y, 80, 50, 480, 110, 520, 1.7, 0.6, 11, 0.28, 0.55)
    keep = np.hypot(x - cx, y - cy) < 205
    stars = np.where(keep, 0, stars)
    return np.maximum.reduce([body * 0.98 * (1 - front), orb * 0.95, ring, stars])


# ------------------------------------------------------------------- sphere
# a clean studio ball: one hard light, a dark core, a rim of bounce light

def sphere_field(x, y):
    cx, cy, r = 260, 270, 150
    mask = M.aa(lambda a, b: np.hypot((a - cx) / r, (b - cy) / r) - 1, x, y)
    nx, ny = (x - cx) / r, (y - cy) / r
    nz = np.sqrt(np.clip(1 - nx * nx - ny * ny, 0, 1))
    lam = np.clip(nx * -0.48 + ny * -0.62 + nz * 0.60, 0, 1)
    v = mask * np.clip(0.02 + 1.02 * lam ** 1.35, 0, 1)
    rim = mask * (1 - nz) ** 3.2 * np.clip(nx * 0.48 + ny * 0.62, 0, 1) * 0.5
    v = v + rim
    hot = mask * 0.45 * np.exp(-(((x - (cx - 52)) ** 2 + (y - (cy - 78)) ** 2) / (2 * 36 ** 2)))
    v = np.clip(v + hot, 0, 1)
    floor = M.sstep(1.2, 0.6, ell(x, y, cx, cy + 200, 118, 14)) * 0.09
    star = specks(x, y, 16, 20, 500, 30, 490, 1.5, 0.5, 41, 0.12, 0.4)
    star = np.where(np.hypot(x - cx, y - cy) < r + 40, 0, star)
    return np.maximum.reduce([v, floor, star])




# --------------------------------------------------------------------- wave
# a big swell crossing the frame: bright crest line, dark body, spray

def wave_field(w, h):
    """Drawn straight into the plate's own frame, so a taller plate gets more sea."""
    return wave_at(292 + (h - 400) / 2)


def wave_at(top):
    def wave_field(x, y):
        return _wave(x, y, top)
    return wave_field


def _wave(x, y, top):
    n = vnoise(1040, 400, cells=6, octaves=4, seed=3)
    y_c = top - 196 * np.exp(-(((x - 320) / 200.0) ** 2)) - 104 * np.exp(-(((x - 800) / 245.0) ** 2))
    y_c0 = top - 196

    body = M.sstep(y_c - 3, y_c + 3, y)
    depth = np.clip((y - y_c) / 110.0, 0, 1)
    body = body * np.clip(0.55 - 0.52 * depth, 0, 1) * np.clip(0.30 + 0.85 * n(x, y * 1.6), 0, 1)

    rim = M.sstep(6, 0.6, np.abs(y - y_c)) * 0.95
    # foam cap breaking over the main crest
    cap = M.sstep(78, 26, np.hypot(x - 330, (y - (y_c0 + 22)) * 1.55)) * 0.62
    cap = cap * np.clip(n(x, y) * 2.1 - 0.5, 0, 1)
    spray = specks(x, y, 200, 240, 1020, 20, 200, 1.6, 0.5, 13, 0.15, 0.5)
    spray = spray * M.sstep(y_c + 10, y_c - 55, y) * M.sstep(180, 320, x)

    y2 = top + 92 - 34 * np.exp(-(((x - 860) / 300.0) ** 2)) - 8
    front = M.sstep(y2 - 2, y2 + 2, y) * np.clip(0.22 - 0.20 * np.clip((y - y2) / 20.0, 0, 1), 0, 1)
    front = np.maximum(front, M.sstep(3.4, 0.6, np.abs(y - y2)) * 0.45)
    return np.maximum.reduce([body, rim, cap, spray, front])


# ----------------------------------------------------------------- mountain
# three ridges under a low sun, the far one washed with light

def mountain_field(x, y):
    n1 = vnoise(1040, 400, cells=4, octaves=3, seed=51)
    n2 = vnoise(1040, 400, cells=5, octaves=3, seed=52)
    n3 = vnoise(1040, 400, cells=6, octaves=3, seed=53)
    y1 = 212 + 58 * (n1(x, 40.0) - 0.5) * 2
    y2 = 284 + 64 * (n2(x, 90.0) - 0.5) * 2
    y3 = 352 + 50 * (n3(x, 150.0) - 0.5) * 2

    sun_d = np.hypot(x - 872, y - 128)
    sun = M.sstep(34, 30, sun_d) * 0.9
    glow = np.exp(-(sun_d / 110.0) ** 2) * 0.32

    l1 = M.sstep(y1, y1 + 2.5, y) * np.clip(0.62 - 0.58 * np.clip((y - y1) / 165.0, 0, 1), 0, 1)
    l1 = l1 * (0.60 + 0.40 * n1(x, y))
    l1 = np.maximum(l1, M.sstep(5, 1, np.abs(y - y1)) * 0.65)
    l2 = M.sstep(y2, y2 + 2.5, y) * np.clip(0.38 - 0.36 * np.clip((y - y2) / 125.0, 0, 1), 0, 1)
    l2 = l2 * (0.60 + 0.40 * n2(x, y))
    l2 = np.maximum(l2, M.sstep(4, 0.8, np.abs(y - y2)) * 0.38)
    l3 = M.sstep(y3, y3 + 2.5, y) * np.clip(0.20 - 0.18 * np.clip((y - y3) / 88.0, 0, 1), 0, 1)
    l3 = l3 * (0.62 + 0.38 * n3(x, y))
    l3 = np.maximum(l3, M.sstep(3.4, 0.8, np.abs(y - y3)) * 0.26)

    sky_mask = M.sstep(y1 + 2, y1 - 2, y)
    sky = (sun + glow) * sky_mask
    stars = specks(x, y, 30, 20, 1020, 20, 160, 1.6, 0.5, 55, 0.12, 0.35)
    stars = np.where(np.hypot(x - 872, y - 128) < 120, 0, stars)
    return np.maximum.reduce([l3, l2, l1, sky, stars])


# ------------------------------------------------------------------- katana
# a curved blade rising to the top right: wrapped handle, tsuba, hard edge

def katana_field(x, y):
    p0 = np.array([204.0, 446.0])
    p1 = np.array([330.0, 300.0])
    p2 = np.array([464.0, 134.0])
    t = np.linspace(0, 1, 260)
    curve = ((1 - t) ** 2)[:, None] * p0 + (2 * (1 - t) * t)[:, None] * p1 + (t ** 2)[:, None] * p2
    tang = np.gradient(curve, axis=0)
    tang = tang / (np.linalg.norm(tang, axis=1, keepdims=True) + 1e-9)

    dx = x[..., None] - curve[None, :, 0]
    dy = y[..., None] - curve[None, :, 1]
    dist = np.hypot(dx, dy)
    k = np.argmin(dist, axis=-1)
    sd = np.take_along_axis(dist, k[..., None], axis=-1)[..., 0]
    tx = tang[:, 0][k]
    ty = tang[:, 1][k]
    ddx = np.take_along_axis(dx, k[..., None], axis=-1)[..., 0]
    ddy = np.take_along_axis(dy, k[..., None], axis=-1)[..., 0]
    side = ddx * (-ty) + ddy * tx

    tt = t[k]                       # 0 at the tsuba, 1 at the tip
    w = 22.0 - 13.0 * tt
    blade = M.sstep(w, w * 0.55, sd) * np.clip(0.92 - 0.28 * tt, 0, 1)
    blade = blade * (0.72 + 0.30 * M.sstep(w, -w, sd))   # lit on the edge side
    edge = M.sstep(2.2, 0.3, np.abs(sd - (w * 0.60))) * np.where(side > 0, 1, 0) * 1.0
    hamon = M.sstep(7, 0, np.abs(sd + 2.5 + 2.0 * np.sin(tt * 20))) * M.sstep(w * 0.75, w * 0.35, np.abs(sd)) * 0.18
    back_edge = M.sstep(1.5, 0.2, np.abs(sd + (w * 0.60))) * np.where(side < 0, 1, 0) * 0.25
    tip = M.sstep(3.5, 0.5, np.abs(sd)) * M.sstep(0.99, 0.93, tt) * np.where(side > 0, 1, 0) * 0.9

    tsuba_sd = M.sd_ellipse(x, y, 200, 450, 33, 12, -0.86)
    tsuba = M.sstep(4.5, 0.6, np.abs(tsuba_sd)) * 1.0
    handle = caps(x, y, 106, 570, 194, 456, 21, 20)
    wrap_t = np.hypot(x - 106, y - 570) / 128.0
    wrap = (np.sin((wrap_t * 22 - np.arctan2(y - 570, x - 106) * 2)) > 0).astype(float)
    handle = handle * np.where(wrap > 0, 0.24, 0.85)
    kashira = M.aa(lambda a, b: np.hypot(a - 104, b - 572) - 11, x, y) * 0.7
    return np.maximum.reduce([blade, edge, hamon, back_edge, tsuba, handle, kashira, tip])


# ---------------------------------------------------------------------- dna
# a double helix: two backbones crossing in projection with base pairs
# between them, the front of each turn lit and the back kept faint

DNA_CX, DNA_AMP = 260.0, 124.0
DNA_TURNS = 2.4
DNA_TUBE = 9.5


def dna_field(x, y):
    k = TAU * DNA_TURNS / 640.0
    t = k * y
    sin_t, cos_t = np.sin(t), np.cos(t)

    xa = DNA_CX + DNA_AMP * sin_t
    xb = DNA_CX - DNA_AMP * sin_t
    slope = DNA_AMP * k * cos_t
    norm = np.sqrt(1 + slope * slope)

    def backbone(xc, depth, dist):
        """One strand as a rounded tube; front strands are thicker, brighter."""
        front = 0.5 + 0.5 * depth
        r = DNA_TUBE * (0.74 + 0.30 * front)
        side = np.clip((x - xc) / r, -1, 1)
        body = M.sstep(r, r * 0.5, dist)
        light = 0.34 + 0.74 * np.clip(0.52 - 0.48 * side, 0, 1) ** 0.8
        edge = M.sstep(1.7, 0.2, np.abs(dist - r * 0.9)) * (0.10 + 0.26 * front)
        return np.maximum(body * light * (0.34 + 0.66 * front), edge * body)

    a = backbone(xa, cos_t, np.abs(x - xa) / norm)
    b = backbone(xb, -cos_t, np.abs(x - xb) / norm)

    # base pairs: two halves with a small gap at the middle, one pair per step
    # along the axis, thicker and brighter at the front of the turn
    rungs = np.zeros_like(np.asarray(x, float))
    for i in range(18):
        yi = 30.0 + i * (610.0 - 30.0) / 17.0
        ti = k * yi
        si, ci = math.sin(ti), math.cos(ti)
        front = 0.5 + 0.5 * ci
        th = 2.6 * (0.45 + 0.80 * front)
        e1 = DNA_CX + DNA_AMP * si
        e2 = DNA_CX - DNA_AMP * si
        if abs(e1 - DNA_CX) < 7.0:
            continue
        inner = DNA_TUBE + 1.5
        s1 = e1 - math.copysign(inner, e1 - DNA_CX)
        s2 = e2 - math.copysign(inner, e2 - DNA_CX)
        m1 = DNA_CX + math.copysign(6.0, e1 - DNA_CX)
        m2 = DNA_CX + math.copysign(6.0, e2 - DNA_CX)
        seg1 = M.sstep(th, th * 0.55, M.sd_capsule(x, y, s1, yi, m1, yi, 0))
        seg2 = M.sstep(th, th * 0.55, M.sd_capsule(x, y, s2, yi, m2, yi, 0))
        rungs = np.maximum(rungs, np.maximum(seg1, seg2) * 0.75 * (0.30 + 0.85 * front))

    glow = np.exp(-(((x - DNA_CX) / 210.0) ** 2 + ((y - 340.0) / 330.0) ** 2)) * 0.02
    shadow = M.sstep(1.3, 0.5, ell(x, y, DNA_CX, 622, 86, 8)) * 0.07
    dust = specks(x, y, 22, 30, 490, 40, 610, 1.4, 0.5, 91, 0.06, 0.20)
    return np.maximum.reduce([np.asarray(v) for v in (a, b, rungs, glow, shadow, dust)])


# ---------------------------------------------------------------------- eye
# the faq banner: one wide eye, ringed iris, catchlight, faint brow and lashes

def eye_field(x, y):
    cx, cy = 760, 208
    half = 400.0
    t = (x - cx) / half
    s = np.abs(np.sin(np.pi * np.clip(t, -1.05, 1.05) / 2))
    inside = np.abs(t) <= 1.02
    y_top = cy - 128 * np.clip(s, 0, None) ** 0.85
    y_bot = cy + 96 * np.clip(s, 0, None) ** 0.85

    ix, iy = cx + 16, cy + 8
    d = np.hypot(x - ix, y - iy)

    sclera = M.sstep(y_top + 2, y_top + 10, y) * M.sstep(y_bot - 2, y_bot - 10, y) * inside
    sclera = sclera * (0.05 + 0.30 * np.exp(-(d / 190.0) ** 2))
    lid_up = M.sstep(6.5, 0.6, np.abs(y - y_top)) * inside * 1.0
    lid_dn = M.sstep(4.5, 0.4, np.abs(y - y_bot)) * inside * 0.65

    iris_ring = M.sstep(8, 0, np.abs(d - 66)) * 0.9
    iris_fill = M.sstep(68, 44, d) * 0.32
    pupil = M.sstep(42, 36, d) * 1.0
    ang = np.arctan2(y - iy, x - ix)
    spokes = np.clip(np.cos(ang * 24.0), 0, 1) ** 2 * M.sstep(66, 44, d) * M.sstep(44, 50, d) * 0.4
    catch = M.sstep(10, 4, np.hypot(x - (ix - 28), y - (iy - 28))) * 1.0

    lash = np.zeros(np.shape(x))
    for tt in (-0.72, -0.45, -0.18, 0.12, 0.4, 0.68):
        lx = cx + tt * half
        ly = cy - 128 * abs(math.sin(math.pi * tt / 2)) ** 0.85
        ex = lx + 40 * math.copysign(1, tt) * (0.4 + abs(tt))
        ey = ly - 34
        lash = np.maximum(lash, caps(x, y, lx, ly, ex, ey, 3.2) * 0.5)

    brow_t = (x - cx) / (half * 0.95)
    brow_y = cy - 196 + 48 * np.clip(brow_t, -1, 1) ** 2
    brow = M.sstep(9, 1.5, np.abs(y - brow_y)) * np.clip(np.abs(brow_t), 0, 1) * 0.28

    duct = M.sstep(8, 3, np.hypot(x - (cx - half + 26), y - (cy + 6))) * 0.5
    return np.maximum.reduce([sclera, lid_up, lid_dn, iris_ring, iris_fill, pupil, spokes, catch,
                              lash, brow, duct])


# ------------------------------------------------------------------ rendering

PLATES = [
    ("tree", tree_field, 520, 640, "木"),
    ("city", city_field, 520, 640, "城"),
    ("moon", moon_field, 520, 640, "月"),
    ("saturn", saturn_field, 520, 520, "星"),
    ("wave", wave_field, 1040, 520, "波"),
    ("mountain", mountain_field, 1040, 400, "山"),
    ("sphere", sphere_field, 520, 520, "球"),
    ("dna", dna_field, 520, 640, "命"),
    ("katana", katana_field, 520, 640, "刀"),
    ("eye", eye_field, 1520, 400, "眼"),
]


def dots(w, h, field):
    xs = np.arange(STEP / 2, w, STEP)
    ys = np.arange(STEP / 2, h, STEP)
    X, Y = np.meshgrid(xs, ys)
    v = lift(np.clip(field(X, Y), 0, 1))
    r = R_MIN + (R_MAX - R_MIN) * v ** GAMMA
    keep = r > 0.42
    return X[keep], Y[keep], r[keep]


# the one Chinese character, set in the top right of every plate
CHAR_INSET = 26          # from the right edge
CHAR_TOP = 24            # from the top edge
CHAR_SIZE = 52           # ink height of the glyph
CHAR_FILL = 0.20         # how far the ink comes up against the ground


def mark_char(w, h, char):
    """The plate's Chinese character, set in the top right corner.

    Drawn as a path so the plate carries its own glyph: nothing here depends
    on a font being installed, or on the page's webfont being in scope.
    """
    path = G.place(char, w - CHAR_INSET, CHAR_TOP, CHAR_SIZE, anchor="top-right")
    return f'<g fill="rgb(233,226,214)" fill-opacity="{CHAR_FILL}">{path}</g>'


def shifting(field, dy):
    """Evaluate a field at (x, y - dy), i.e. window it vertically."""
    def f(x, y):
        return field(x, np.asarray(y, float) - dy)
    return f


def write_svg(path, name, field, w, h, char):
    X, Y, R = dots(w, h, field)
    ink = "rgb(233,226,214)"
    rows = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img">',
            f'<rect width="{w}" height="{h}" fill="rgb(3,3,3)"/>',
            f'<g fill="{ink}">']
    row = []
    for x, y, r in zip(X.ravel(), Y.ravel(), R.ravel()):
        row.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.2f}"/>')
    rows.append("".join(row))
    rows.append('</g>')
    rows.append(mark_char(w, h, char))
    rows.append('</svg>')
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write("".join(rows))
    print(f"plate-{name}.svg: {w}x{h}, {X.size} dots, {os.path.getsize(path) // 1024} KB")


def main():
    only = os.environ.get("PLATES")
    for name, field, w, h, char in PLATES:
        if only and name not in only.split(","):
            continue
        if name == "wave":
            field = wave_field(w, h)
        write_svg(os.path.join(OUT, f"plate-{name}.svg"), name, field, w, h, char)


if __name__ == "__main__":
    main()
