"""Halftone plates: greyscale field -> dotted plate in the site's ink.

Same recipe as the existing plates: a 6.2px square grid of dots on a near
black ground, dot area proportional to lightness, soft-light hill shading,
and small registration corner marks. Field(x, y) gets the plate coords in a
640-tall space and returns 0..1.
"""
import math
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

INK = (205, 196, 186)
BG = (5, 5, 5)
STEP = 6.2
R_MIN, R_MAX = 0.8, 3.05


def norm(a):
    a = np.asarray(a, dtype=float)
    lo, hi = np.percentile(a, 1), np.percentile(a, 99.5)
    return np.clip((a - lo) / max(hi - lo, 1e-9), 0, 1)


def shade(field, x, y, dx, dy, light=(-0.6, -0.8), k=0.45):
    """Multiply a field by a soft form of its own gradient: lit from the top-left."""
    gx = (field(x + dx, y) - field(x - dx, y)) / (2 * dx)
    gy = (field(x, y + dy) - field(x, y - dy)) / (2 * dy)
    slope = gx * light[0] + gy * light[1]
    slope = slope / (1 + np.abs(slope))
    return np.clip(field(x, y) * (1 + k * slope), 0, 1)


def aa(depth, x, y, px=1.0):
    """Coverage of a shape from its signed distance, sampled over the dot footprint."""
    acc = np.zeros(np.shape(x))
    offs = (-0.35, 0.0, 0.35)
    for ox in offs:
        for oy in offs:
            acc = acc + (depth(x + ox * px, y + oy * px) <= 0)
    return acc / (len(offs) ** 2)


def write_plate(path, w, h, field, corner=True):
    img = Image.new("RGBA", (w, h), BG + (255,))
    d = ImageDraw.Draw(img)
    xs = np.arange(STEP / 2, w, STEP)
    ys = np.arange(STEP / 2, h, STEP)
    X, Y = np.meshgrid(xs, ys)
    v = np.clip(field(X, Y), 0, 1)
    r = (R_MIN + (R_MAX - R_MIN) * v ** 0.82).ravel()
    x = X.ravel()
    y = Y.ravel()
    col = INK + (255,)
    for i in range(x.size):
        rr = float(r[i])
        d.ellipse((x[i] - rr, y[i] - rr, x[i] + rr, y[i] + rr), fill=col)
    if corner:
        c = INK + (115,)
        m, a = 13, 15
        for cx, sx, cy, sy in ((m, 1, m, 1), (w - m, -1, m, 1), (m, 1, h - m, -1), (w - m, -1, h - m, -1)):
            d.line((cx, cy, cx + sx * a, cy), fill=c, width=1)
            d.line((cx, cy, cx, cy + sy * a), fill=c, width=1)
    img.save(path, optimize=True)
    print(f"{os.path.basename(path)}: {w}x{h}, {x.size} dots")


# ------------------------------------------------------------------ helpers

def sstep(e0, e1, x):
    """Like smoothstep, but edges may be given in either order (high to low)."""
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


def sd_circle(x, y, cx, cy, r):
    return np.hypot(x - cx, y - cy) - r


def sd_ellipse(x, y, cx, cy, rx, ry, ang=0.0):
    ca, sa = math.cos(ang), math.sin(ang)
    ux, uy = (x - cx) * ca + (y - cy) * sa, -(x - cx) * sa + (y - cy) * ca
    k = np.sqrt((ux / rx) ** 2 + (uy / ry) ** 2)
    return (k - 1) * min(rx, ry)


def smin(a, b, k):
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0, 1)
    return b * (1 - h) + a * h - k * h * (1 - h)


def sd_capsule(x, y, ax, ay, bx, by, r):
    bax, bay = bx - ax, by - ay
    px, py = x - ax, y - ay
    h = np.clip((px * bax + py * bay) / (bax * bax + bay * bay), 0, 1)
    return np.hypot(px - bax * h, py - bay * h) - r


def sd_box(x, y, cx, cy, hw, hh, ang=0.0, r=0.0):
    ca, sa = math.cos(ang), math.sin(ang)
    ux, uy = (x - cx) * ca + (y - cy) * sa, -(x - cx) * sa + (y - cy) * ca
    dx, dy = np.abs(ux) - hw + r, np.abs(uy) - hh + r
    outside = np.hypot(np.maximum(dx, 0), np.maximum(dy, 0))
    return outside + np.minimum(np.maximum(dx, dy), 0) - r


def fill(sd):
    return 1 - sstep(-0.5, 0.5, sd)


def poly_sd(x, y, pts):
    """Signed distance to a closed polygon (array of (x, y))."""
    d = np.hypot(x - pts[0][0], y - pts[0][1])
    s = np.ones(np.shape(x))
    n = len(pts)
    for i in range(n):
        ax, ay = pts[i]
        bx, by = pts[(i + 1) % n]
        ex, ey = bx - ax, by - ay
        wx, wy = x - ax, y - ay
        h = np.clip((wx * ex + wy * ey) / (ex * ex + ey * ey), 0, 1)
        d = np.minimum(d, np.hypot(wx - ex * h, wy - ey * h))
        c1 = y >= ay
        c2 = y < by
        c3 = ex * wy > ey * wx
        flip = (c1 & c2 & c3) | (~c1 & ~c2 & ~c3)
        s = np.where(flip, -s, s)
    return d * s


def star_poly(cx, cy, rx, ry, k=0.62, n=5, rot=-math.pi / 2):
    pts = []
    for i in range(n * 2):
        a = rot + i * math.pi / n
        f = 1 if i % 2 == 0 else k
        pts.append((cx + math.cos(a) * rx * f, cy + math.sin(a) * ry * f))
    return pts


def blur(field_fn, w, h, px, step=1.0):
    """Render a field to a small mask, gaussian it, and hand back a sampler."""
    mw, mh = int(w / px), int(h / px)
    xs = np.arange(mw) * px + px / 2
    ys = np.arange(mh) * px + px / 2
    X, Y = np.meshgrid(xs, ys)
    v = np.clip(field_fn(X, Y), 0, 1) * 255
    im = Image.fromarray(v.astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(px / 2))
    arr = np.asarray(im, dtype=float) / 255

    def sample(x, y):
        ix = np.clip((x / px).astype(int), 0, mw - 1)
        iy = np.clip((y / px).astype(int), 0, mh - 1)
        return arr[iy, ix]
    return sample
