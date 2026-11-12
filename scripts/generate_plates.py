"""Halftone editorial plate generator.

Renders the "halftone editorial" dot fields used by the pinguin boat web app.
Each plate is an SVG of warm cream circles on a near-black rectangle: no
gradients, no filters, no external image assets. Subjects are rasterised to a
numpy field with Pillow, sampled on the dot grid, then emitted as circles.

A single CJK character is drawn on each plate as a vector path at 20% opacity
(26px inset right, 24px inset top, 52px ink height). Every subject is space:
comet, eclipse, nebula, rocket, moon, saturn, planet, asteroid belt.

Run:  python scripts/generate_plates.py
Out:  apps/web/public/plates/*.svg, apps/web/public/grain.webp
"""

from __future__ import annotations

import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "apps", "web", "public", "plates")
PUBLIC_DIR = os.path.join(ROOT, "apps", "web", "public")

INK = (233, 226, 214)
BG = (3, 3, 3)
STEP = 6.2
R_MIN, R_MAX, GAMMA = 0.35, 3.35, 0.72

SRC_W, SRC_H = 520, 640

GLYPH_FONT_CANDIDATES = [
    r"C:\Windows\Fonts\msyhbd.ttc",
    r"C:\Windows\Fonts\simhei.ttf",
    r"C:\Windows\Fonts\msyh.ttc",
    r"C:\Windows\Fonts\NotoSansCJK-Bold.ttc",
    r"C:\Windows\Fonts\NotoSerifCJK-Bold.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
    "/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc",
]


def clip(v, lo=0.0, hi=1.0):
    return np.clip(v, lo, hi)


def lift(v, lo=0.02):
    v = clip(np.asarray(v, dtype=np.float64), 0.0, 1.0)
    return clip((v - lo) / (1.0 - lo), 0.0, 1.0)


def grid(w, h, step=STEP):
    ys = np.arange(step / 2.0, h, step)
    xs = np.arange(step / 2.0, w, step)
    return np.meshgrid(xs, ys)


def ellipse(gx, gy, bbox):
    """Soft-edged filled ellipse in grid coordinates."""
    x0, y0, x1, y1 = bbox
    cx, cy = (x0 + x1) / 2.0, (y0 + y1) / 2.0
    rx, ry = max(abs(x1 - x0) / 2.0, 0.5), max(abs(y1 - y0) / 2.0, 0.5)
    d = np.sqrt(((gx - cx) / rx) ** 2 + ((gy - cy) / ry) ** 2)
    return clip((1.0 - d) * max(rx, ry) / 1.6, 0.0, 1.0)


def bar(gx, gy, x0, y0, x1, y1, soft=1.4):
    inside = (
        (gx >= min(x0, x1)) & (gx <= max(x0, x1)) & (gy >= min(y0, y1)) & (gy <= max(y0, y1))
    )
    return inside.astype(np.float64)


def segment(gx, gy, ax, ay, bx, by, r):
    vx, vy = bx - ax, by - ay
    wx, wy = gx - ax, gy - ay
    denom = vx * vx + vy * vy
    t = clip((wx * vx + wy * vy) / denom, 0.0, 1.0) if denom else np.zeros_like(gx)
    dx = wx - t * vx
    dy = wy - t * vy
    return np.exp(-((dx * dx + dy * dy) / (2.0 * r * r)))


# ─── subjects ───────────────────────────────────────────────────────────────
# every subject paints a white-on-black source raster; the sampling step below
# is what turns it into a dot field, so the "artwork" is the dot grid itself.


def subject_tree(w=SRC_W, h=SRC_H):
    img = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(img)
    sx, sy = w / 520.0, h / 640.0
    p = lambda x, y: (x * sx, y * sy)

    # trunk: thick, kinked, asymmetric, running off the bottom edge
    trunk = [
        (204, 700), (196, 630), (203, 560), (194, 498), (205, 438),
        (199, 378), (214, 318), (220, 258), (222, 198), (219, 120),
        (237, 120), (241, 198), (246, 260), (250, 320),
        (263, 378), (254, 438), (264, 498), (253, 560), (259, 630), (272, 700),
    ]
    d.polygon([p(x, y) for x, y in trunk], fill=255)
    d.polygon([p(150, 696), p(204, 632), p(268, 632), p(338, 700)], fill=255)

    d.line([p(203, 420), p(252, 432)], fill=255, width=int(15 * sx))  # broken stub
    d.line([p(258, 508), p(302, 500)], fill=255, width=int(12 * sx))
    d.line([p(212, 322), p(186, 310)], fill=255, width=int(9 * sx))

    # long bough left, shorter bough right
    d.line([p(224, 246), p(158, 208), p(94, 174), p(30, 156)], fill=255,
           width=int(15 * sx), joint="curve")
    d.line([p(238, 208), p(304, 174), p(370, 156), p(446, 148)], fill=255,
           width=int(12 * sx), joint="curve")

    for pts, lw in [
        ([(94, 174), (72, 118)], 9), ([(54, 166), (38, 206)], 8), ([(30, 156), (6, 138)], 7),
        ([(338, 168), (350, 114)], 8), ([(402, 152), (430, 196)], 7),
        ([(224, 198), (204, 138), (194, 82)], 10), ([(204, 138), (164, 104)], 7),
        ([(194, 82), (174, 42)], 6), ([(194, 82), (226, 50)], 6), ([(210, 120), (250, 94)], 6),
    ]:
        d.line([p(x, y) for x, y in pts], fill=255, width=int(lw * sx), joint="curve")

    twigs = [
        ((158, 208), (148, 174), 4), ((130, 190), (124, 156), 4), ((72, 118), (56, 90), 4),
        ((72, 118), (90, 94), 3), ((38, 206), (24, 232), 3), ((6, 138), (0, 116), 3),
        ((304, 174), (298, 140), 4), ((350, 114), (342, 84), 3), ((350, 114), (376, 102), 3),
        ((430, 196), (452, 220), 3), ((164, 104), (144, 84), 3), ((174, 42), (160, 18), 3),
        ((226, 50), (242, 24), 3), ((250, 94), (272, 80), 3), ((196, 298), (168, 284), 3),
        ((240, 260), (272, 248), 3), ((253, 558), (284, 544), 3), ((196, 628), (170, 618), 3),
        ((216, 470), (188, 460), 3), ((262, 380), (290, 370), 3),
    ]
    for (x1, y1), (x2, y2), lw in twigs:
        d.line([p(x1, y1), p(x2, y2)], fill=255, width=int(lw * sx))
    return np.asarray(img, dtype=np.float64) / 255.0


def subject_city(w=SRC_W, h=SRC_H):
    img = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(img)
    sx, sy = w / 520.0, h / 640.0
    towers = [
        (14, 62, 0.30, 0.68), (52, 44, 0.44, 0.84), (92, 70, 0.36, 0.52),
        (126, 30, 0.58, 0.90), (170, 54, 0.40, 0.72), (206, 18, 0.62, 0.95),
        (248, 50, 0.42, 0.74), (286, 66, 0.34, 0.56), (320, 36, 0.56, 0.86),
        (362, 58, 0.40, 0.66), (400, 26, 0.64, 0.92), (446, 54, 0.36, 0.58),
        (484, 70, 0.44, 0.76),
    ]
    for x, tw, top, base in towers:
        d.rectangle(
            [x * sx, top * h * sy, (x + tw) * sx, base * h * sy], fill=236
        )
        # window rows
        yy = top * h * sy + 10
        while yy < base * h * sy - 8:
            d.line([(x * sx + 4, yy), ((x + tw) * sx - 4, yy)], fill=120, width=2)
            yy += 11
    d.rectangle([0, h * sy - 26, w * sx, h * sy], fill=200)
    return np.asarray(img, dtype=np.float64) / 255.0


def subject_moon(w=SRC_W, h=SRC_H):
    img = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(img)
    cx, cy, r = 0.50 * w, 0.46 * h, 0.30 * w
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=245)
    for ox, oy, cr, val in [
        (-0.10, -0.08, 0.09, 170), (0.12, 0.10, 0.07, 150),
        (-0.13, 0.13, 0.06, 160), (0.06, -0.17, 0.05, 165),
        (0.17, -0.05, 0.04, 180), (-0.02, 0.02, 0.05, 190),
    ]:
        d.ellipse(
            [cx + ox * w - cr * w, cy + oy * h - cr * w,
             cx + ox * w + cr * w, cy + oy * h + cr * w],
            fill=val,
        )
    mask = np.asarray(img, dtype=np.float64) / 255.0
    # faint halo ring around the disc
    gy, gx = np.mgrid[0:h, 0:w]
    dist = np.sqrt((gx - cx) ** 2 + (gy - cy) ** 2)
    halo = np.exp(-(((dist - r * 1.16) / (r * 0.22)) ** 2)) * 0.34
    stars = np.zeros_like(mask)
    rng = np.random.default_rng(5)
    for _ in range(140):
        sx0, sy0 = rng.integers(4, w - 4), rng.integers(4, h - 4)
        stars[sy0 - 1:sy0 + 2, sx0 - 1:sx0 + 2] = np.maximum(
            stars[sy0 - 1:sy0 + 2, sx0 - 1:sx0 + 2], 0.55
        )
    return np.maximum(np.maximum(mask, halo), stars)


def subject_saturn(w=SRC_W, h=SRC_H):
    img = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(img)
    cx, cy = 0.5 * w, 0.5 * h
    R = 0.235 * w
    tilt = math.radians(-17)

    def rot(px, py):
        dx, dy = px - cx, py - cy
        return (
            cx + dx * math.cos(tilt) - dy * math.sin(tilt),
            cy + dx * math.sin(tilt) + dy * math.cos(tilt),
        )

    ring = []
    for k in range(72):
        a = k / 72.0 * math.tau
        ring.append(rot(cx + math.cos(a) * R * 1.74, cy + math.sin(a) * R * 0.42))
    d.polygon(ring, fill=170)
    inner = []
    for k in range(72):
        a = k / 72.0 * math.tau
        inner.append(rot(cx + math.cos(a) * R * 1.42, cy + math.sin(a) * R * 0.32))
    d.polygon(inner, fill=0)

    d.ellipse([cx - R, cy - R, cx + R, cy + R], fill=240)
    # banded shading across the globe
    band = Image.new("L", (w, h), 0)
    bd = ImageDraw.Draw(band)
    for i, val in enumerate([0, 40, 10, 60, 20, 70, 30, 55, 15, 45, 5]):
        y0 = cy - R + (i / 11.0) * 2 * R
        bd.rectangle([cx - R, y0, cx + R, y0 + (2 * R) / 11.0], fill=val)
    arr = np.asarray(img, dtype=np.float64) / 255.0
    barr = np.asarray(band, dtype=np.float64) / 255.0
    arr = arr * (1.0 - barr * 0.55)
    return arr


def subject_sphere(w=SRC_W, h=SRC_H):
    img = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(img)
    cx, cy, R = 0.5 * w, 0.5 * h, 0.37 * w
    steps = 48
    for i in range(steps):
        t = i / (steps - 1.0)
        rr = R * (1.0 - t * 0.92)
        off = -R * 0.22 * t
        val = int(28 + 210 * (t**0.85))
        d.ellipse([cx - rr + off, cy - rr + off, cx + rr + off, cy + rr + off], fill=min(val, 245))
    mask = np.asarray(img, dtype=np.float64) / 255.0
    return np.where(mask > 0.03, mask, 0.0)


def subject_wave(w=1040, h=520):
    img = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(img)
    sx, sy = w / 1040.0, h / 520.0

    body = [(0, 520), (0, 330)]
    pts = []
    for i in range(61):
        u = i / 60.0
        x = u * 1040
        y = 250 - 92 * math.sin(u * math.pi * 1.9 + 0.5) - 34 * u
        pts.append((x, y))
    pts += [(1040, 520)]
    d.polygon([(x * sx, y * sy) for x, y in pts], fill=214)

    # crest lip and claw
    lip = [(x, y - 26) for x, y in pts]
    d.polygon([(x * sx, y * sy) for x, y in lip] + [(x * sx, y * sy) for x, y in reversed(pts)], fill=246)

    claw = []
    for i in range(41):
        u = i / 40.0
        claw.append((700 + u * 200, 150 + u * 150 - 40 * math.sin(u * math.pi)))
    for i in range(41):
        u = 1.0 - i / 40.0
        claw.append((700 + u * 200, 210 + u * 170 - 40 * math.sin(u * math.pi)))
    d.polygon([(x * sx, y * sy) for x, y in claw], fill=200)

    # foam bands
    for y, val, thick in [(360, 170, 10), (400, 140, 7), (444, 120, 5)]:
        pts2 = [(x, y - 18 * math.sin(x / 1040.0 * math.pi * 2.4)) for x in range(0, 1041, 20)]
        d.line([(x * sx, yy * sy) for x, yy in pts2], fill=val, width=int(thick * sy))

    # trough shadow, lower left
    d.ellipse([40 * sx, 400 * sy, 300 * sx, 560 * sy], fill=120)
    return np.asarray(img, dtype=np.float64) / 255.0


def subject_dna(w=SRC_W, h=SRC_H):
    img = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(img)
    sx, sy = w / 520.0, h / 640.0
    turns = 2.4
    amp = 0.21 * w
    for k in range(25):
        t = k / 24.0
        y = (0.04 + t * 0.92) * h * sy
        x1 = 0.5 * w * sx + amp * sx * math.sin(t * math.pi * 2 * turns)
        x2 = 0.5 * w * sx - amp * sx * math.sin(t * math.pi * 2 * turns)
        d.line([(x1, y), (x2, y)], fill=150, width=int(7 * sy))
    for sign in (1, -1):
        pts = []
        for k in range(161):
            t = k / 160.0
            y = (0.04 + t * 0.92) * h * sy
            x = 0.5 * w * sx + sign * amp * sx * math.sin(t * math.pi * 2 * turns)
            pts.append((x, y))
        d.line(pts, fill=246, width=int(14 * sx), joint="curve")
    return np.asarray(img, dtype=np.float64) / 255.0


def subject_katana(w=SRC_W, h=SRC_H):
    img = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(img)
    sx, sy = w / 520.0, h / 640.0

    def pt(u, v):
        return (u * 520 * sx, v * 640 * sy)

    # blade: gentle curve, runs from lower-left guard to upper-right tip
    blade = []
    for i in range(41):
        u = i / 40.0
        blade.append(pt(0.16 + u * 0.78, 0.80 - u * 0.58 + 0.05 * math.sin(u * math.pi)))
    d.line(blade, fill=240, width=int(12 * sx), joint="curve")
    d.line([(x, y + 13 * sy) for x, y in blade], fill=120, width=int(3 * sx), joint="curve")

    # tip kissaki
    d.polygon([pt(0.94, 0.22), pt(0.99, 0.20), pt(0.95, 0.26)], fill=250)

    # guard (tsuba)
    d.ellipse([pt(0.135, 0.86)[0] - 9 * sx, pt(0.135, 0.86)[1] - 30 * sy,
               pt(0.135, 0.86)[0] + 9 * sx, pt(0.135, 0.86)[1] + 30 * sy], fill=235)

    # handle with wrap diamonds
    d.line([pt(0.135, 0.86), pt(0.02, 0.955)], fill=190, width=int(15 * sx))
    for k in range(7):
        u = k / 7.0
        cx0 = 0.13 - u * 0.11
        cy0 = 0.862 + u * 0.09
        d.ellipse([pt(cx0, cy0)[0] - 4 * sx, pt(cx0, cy0)[1] - 4 * sy,
                   pt(cx0, cy0)[0] + 4 * sx, pt(cx0, cy0)[1] + 4 * sy], fill=60)
    return np.asarray(img, dtype=np.float64) / 255.0


def subject_mountain(w=1040, h=400):
    img = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(img)
    sx, sy = w / 1040.0, h / 400.0

    def ridge(base, amp, freq, phase, val):
        pts = [(0, h)]
        for i in range(129):
            u = i / 128.0
            x = u * w
            y = (base - amp * abs(math.sin(u * math.pi * freq + phase))) * h
            pts.append((x, y))
        pts.append((w, h))
        d.polygon([(x * sx, y * sy) for x, y in pts], fill=val)

    ridge(0.86, 0.16, 2.2, 0.4, 130)
    ridge(0.70, 0.20, 1.5, 2.1, 180)
    ridge(0.52, 0.24, 1.1, 4.0, 226)
    d.ellipse([0.72 * w * sx, 0.06 * h * sy, 0.86 * w * sx, 0.28 * h * sy], fill=245)
    return np.asarray(img, dtype=np.float64) / 255.0


def subject_eye(w=1520, h=400):
    img = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(img)
    sx, sy = w / 1520.0, h / 400.0
    cx, cy = 0.5 * w * sx, 0.5 * h * sy
    rx, ry = 0.40 * w * sx, 0.30 * h * sy

    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=44)
    d.arc([cx - rx, cy - ry, cx + rx, cy + ry], 200, 340, fill=240, width=int(9 * sy))
    d.arc([cx - rx, cy - ry, cx + rx, cy + ry], 20, 160, fill=240, width=int(9 * sy))

    irx, iry = 0.125 * w * sx, 0.245 * h * sy
    d.ellipse([cx - irx, cy - iry, cx + irx, cy + iry], fill=190)
    d.ellipse([cx - irx * 0.42, cy - iry * 0.42, cx + irx * 0.42, cy + iry * 0.42], fill=30)

    for k in range(11):
        a = math.radians(202 + k * 13.6)
        x1, y1 = cx + math.cos(a) * rx * 0.94, cy + math.sin(a) * ry * 0.94
        x2, y2 = cx + math.cos(a) * rx * 1.16, cy + math.sin(a) * ry * 1.36
        d.line([(x1, y1), (x2, y2)], fill=210, width=int(5 * sy))
    return np.asarray(img, dtype=np.float64) / 255.0


def _stars(field, w, h, seed, count, lo=0.45, hi=0.62):
    rng = np.random.default_rng(seed)
    for _ in range(count):
        sx0, sy0 = int(rng.integers(4, w - 4)), int(rng.integers(4, h - 4))
        v = float(rng.uniform(lo, hi))
        field[sy0 - 1:sy0 + 2, sx0 - 1:sx0 + 2] = np.maximum(
            field[sy0 - 1:sy0 + 2, sx0 - 1:sx0 + 2], v
        )
    return field


def subject_comet(w=SRC_W, h=SRC_H):
    """A comet: bright coma, long dust tail fanning to the lower left."""
    img = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(img)
    hx, hy = 0.68 * w, 0.28 * h
    d.ellipse([hx - 0.075 * w, hy - 0.06 * w, hx + 0.075 * w, hy + 0.06 * w], fill=240)
    d.ellipse([hx - 0.03 * w, hy - 0.024 * w, hx + 0.03 * w, hy + 0.024 * w], fill=250)
    for k in range(9):
        t = k / 8.0
        d.line(
            [(hx - 0.06 * w, hy + 0.03 * w), (0.16 * w - 0.05 * w * t, 0.62 * h + 0.14 * h * t)],
            fill=int(170 - 110 * t),
            width=max(2, int((16 - 12 * t) * w / 520.0)),
        )
    mask = np.asarray(img, dtype=np.float64) / 255.0
    mask = np.asarray(Image.fromarray((mask * 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(0.6)), dtype=np.float64) / 255.0
    return _stars(mask, w, h, 41, 90)


def subject_eclipse(w=SRC_W, h=SRC_H):
    """Total eclipse: a dark disc, a thin corona ring and soft outer glow."""
    cx, cy, r = 0.50 * w, 0.47 * h, 0.235 * w
    gy, gx = np.mgrid[0:h, 0:w].astype(np.float64)
    dist = np.sqrt((gx - cx) ** 2 + (gy - cy) ** 2)
    # corona: narrow bright ring hugging the limb, then a broad faint halo
    ring = np.exp(-(((dist - r * 1.02) / (r * 0.045)) ** 2)) * 235.0
    glow = np.exp(-(((dist - r * 1.15) / (r * 0.35)) ** 2)) * 55.0
    field = np.clip(ring + glow, 0, 255) / 255.0
    field[dist < r * 1.005] = 0.0  # the occluding disc stays black
    # a few brighter beads where the light breaks over the limb
    rng = np.random.default_rng(7)
    for _ in range(4):
        a = rng.uniform(0, math.tau)
        bx, by = cx + math.cos(a) * r * 1.02, cy + math.sin(a) * r * 1.02
        field[int(by) - 2:int(by) + 3, int(bx) - 2:int(bx) + 3] = 0.95
    return _stars(field, w, h, 8, 70, 0.3, 0.5)


def subject_nebula(w=SRC_W, h=SRC_H):
    """Nebula: a soft bright core wrapped in uneven veils of gas."""
    gy, gx = np.mgrid[0:h, 0:w].astype(np.float64)
    cx, cy = 0.46 * w, 0.5 * h
    nx, ny = (gx - cx) / (0.30 * w), (gy - cy) / (0.24 * h)
    rr = np.sqrt(nx ** 2 + ny ** 2)
    ang = np.arctan2(ny, nx)
    # radial falloff modulated by a slow angular warble: torn edges, no bands
    warp = 1.0 + 0.18 * np.sin(ang * 3.0 + 0.7) + 0.10 * np.sin(ang * 7.0 - 1.3)
    core = np.exp(-(rr * warp) ** 2 * 3.4) * 165.0
    skirt = np.exp(-(rr * warp) ** 2 * 1.1) * 70.0
    warp2 = 1.0 + 0.22 * np.sin(ang * 2.0 - 1.9)
    veil = np.exp(-(rr * warp2) ** 2 * 2.0) * 38.0
    field = np.clip(core + skirt + veil, 0, 255) / 255.0
    field = np.asarray(
        Image.fromarray((field * 255).astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(1.4)),
        dtype=np.float64,
    ) / 255.0
    return _stars(field, w, h, 19, 120, 0.4, 0.62)


def subject_rocket(w=SRC_W, h=SRC_H):
    """A rocket in profile: cone, finned hull, exhaust, heading up-right."""
    img = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(img)
    sx, sy = w / 520.0, h / 640.0

    def p(x, y):
        return (x * sx, y * sy)

    cx = 300
    hull = [
        (cx, 120), (cx + 34, 210), (cx + 38, 380), (cx + 26, 470),
        (cx - 26, 470), (cx - 38, 380), (cx - 34, 210),
    ]
    d.polygon([p(x, y) for x, y in hull], fill=235)
    d.polygon([p(cx, 120), p(cx + 34, 210), p(cx + 8, 210)], fill=150)  # shaded nose
    d.polygon([p(cx - 38, 360), p(cx - 96, 470), p(cx - 26, 470)], fill=225)
    d.polygon([p(cx + 38, 360), p(cx + 96, 470), p(cx + 26, 470)], fill=200)
    d.ellipse([p(cx - 20, 232)[0], p(cx - 20, 232)[1], p(cx + 20, 272)[0], p(cx + 20, 272)[1]], fill=40)
    d.rectangle([p(cx - 26, 300)[0], p(cx - 26, 300)[1], p(cx + 26, 316)[0], p(cx + 26, 316)[1]], fill=90)
    for k in range(7):
        t = k / 6.0
        flame = [(cx - 16 + 6 * t, 472), (cx + 16 - 6 * t, 472), (cx + 2, 560 + 40 * (1 - t))]
        d.polygon([p(x, y) for x, y in flame], fill=int(210 - 120 * t))
    return np.asarray(img, dtype=np.float64) / 255.0


def subject_belt(w=1040, h=400):
    """Asteroid belt seen edge-on: a jagged band of rocks across the frame."""
    img = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(img)
    rng = np.random.default_rng(3)
    mid = 0.5 * h
    for _ in range(90):
        x = float(rng.uniform(0, w))
        y = mid + float(rng.normal(0, h * 0.18))
        r = float(rng.uniform(4, 22)) * (w / 1040.0)
        pts = []
        for k in range(9):
            a = k / 9.0 * math.tau
            rr = r * float(rng.uniform(0.62, 1.0))
            pts.append((x + math.cos(a) * rr, y + math.sin(a) * rr * 0.92))
        d.polygon(pts, fill=int(rng.uniform(120, 235)))
        if rng.uniform() < 0.35:
            d.polygon(pts, outline=240)
    field = np.asarray(img, dtype=np.float64) / 255.0
    return _stars(field, w, h, 5, 60, 0.3, 0.45)


def subject_cluster(w=SRC_W, h=SRC_H):
    """Globular cluster: hundreds of stars packed toward the centre."""
    gy, gx = np.mgrid[0:h, 0:w].astype(np.float64)
    cx, cy = 0.5 * w, 0.48 * h
    rr = np.sqrt((gx - cx) ** 2 + (gy - cy) ** 2) / (0.34 * w)
    core = np.exp(-rr ** 2 * 3.0) * 120.0
    rng = np.random.default_rng(13)
    field = core / 255.0
    for _ in range(520):
        a = rng.uniform(0, math.tau)
        d = float(rng.gamma(1.7, 0.075 * w))
        sx0 = int(cx + math.cos(a) * d)
        sy0 = int(cy + math.sin(a) * d)
        if 2 <= sx0 < w - 2 and 2 <= sy0 < h - 2:
            v = float(rng.uniform(0.45, 0.95)) / (1.0 + rr[min(max(sy0, 0), h - 1), min(max(sx0, 0), w - 1)] * 0.4)
            field[sy0 - 1:sy0 + 2, sx0 - 1:sx0 + 2] = np.maximum(
                field[sy0 - 1:sy0 + 2, sx0 - 1:sx0 + 2], v
            )
    return np.clip(field, 0, 1)


def subject_capsule(w=SRC_W, h=SRC_H):
    """A space capsule: blunt heat shield down, slim service module up."""
    img = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(img)
    sx, sy = w / 520.0, h / 640.0

    def p(x, y):
        return (x * sx, y * sy)

    # service module and its ribs
    d.rectangle([p(226, 150)[0], p(226, 150)[1], p(294, 330)[0], p(294, 330)[1]], fill=170)
    for y in range(170, 330, 22):
        d.rectangle([p(226, y)[0], p(226, y)[1], p(294, y + 7)[0], p(294, y + 7)[1]], fill=70)
    # conical capsule
    d.polygon([p(238, 150), p(282, 150), p(320, 400), p(200, 400)], fill=232)
    d.polygon([p(238, 150), p(282, 150), p(292, 196), p(228, 196)], fill=140)  # shaded shoulder
    # heat shield edge and a porthole
    d.ellipse([p(200, 372)[0], p(200, 372)[1], p(320, 428)[0], p(320, 428)[1]], fill=205)
    d.ellipse([p(244, 248)[0], p(244, 248)[1], p(276, 280)[0], p(276, 280)[1]], fill=40)
    # re-entry glow under the shield
    for k in range(6):
        d.arc(
            [p(182, 384 + k * 9)[0], p(182, 384 + k * 9)[1], p(338, 440 + k * 9)[0], p(338, 440 + k * 9)[1]],
            20, 160, fill=int(230 - k * 34), width=max(2, int(6 * sy)),
        )
    return _stars(np.asarray(img, dtype=np.float64) / 255.0, w, h, 17, 80, 0.3, 0.5)


SUBJECTS = {
    "comet": (subject_comet, (520, 640), "彗"),
    "eclipse": (subject_eclipse, (520, 640), "蝕"),
    "nebula": (subject_nebula, (520, 640), "雲"),
    "rocket": (subject_rocket, (520, 640), "矢"),
    "moon": (subject_moon, (520, 640), "月"),
    "saturn": (subject_saturn, (520, 520), "星"),
    "sphere": (subject_sphere, (520, 520), "球"),
    "belt": (subject_belt, (1040, 400), "環"),
    "cluster": (subject_cluster, (520, 520), "群"),
    "capsule": (subject_capsule, (520, 640), "舟"),
}

# plate file -> (subject, render size, alt text)
PLATES = {
    "comet": ("comet", (780, 960), "halftone study of a comet with a long dust tail"),
    "eclipse": ("eclipse", (780, 960), "halftone study of a total solar eclipse"),
    "nebula": ("nebula", (780, 960), "halftone study of a nebula and its young stars"),
    "rocket": ("rocket", (780, 960), "halftone study of a rocket in flight"),
    "moon": ("moon", (780, 960), "halftone study of the moon and its craters"),
    "saturn": ("saturn", (780, 780), "halftone study of saturn and its rings"),
    "sphere": ("sphere", (780, 780), "halftone study of a shaded planet"),
    "belt": ("belt", (1560, 780), "halftone study of an asteroid belt"),
    "cluster": ("cluster", (780, 780), "halftone study of a star cluster"),
    "capsule": ("capsule", (780, 960), "halftone study of a space capsule re-entering"),
}


def _paths_to_polygons(paths):
    polys = []
    for d in paths:
        pts = []
        for token in d.replace("M", " ").replace("Z", " ").split(" "):
            token = token.strip()
            if not token:
                continue
            xs, ys = token.split(",")
            pts.append((float(xs), float(ys)))
        if len(pts) > 2:
            polys.append(pts)
    return polys


def glyph_paths(char: str, target_h: float):
    """Vector path(s) for a CJK glyph, or (0, []) when no font is available."""
    for path in GLYPH_FONT_CANDIDATES:
        if not os.path.exists(path):
            continue
        try:
            font = ImageFont.truetype(path, 96)
            mask = font.getmask(char, mode="L")
            w, h = mask.size
            if w == 0 or h == 0:
                continue
            on = np.array(mask, dtype=np.uint8).reshape(h, w) > 110
            visited = np.zeros_like(on, dtype=bool)
            contours = []

            def trace(sy, sx):
                stack = [(sy, sx)]
                pts = []
                while stack:
                    y, x = stack.pop()
                    if y < 0 or y >= h or x < 0 or x >= w:
                        continue
                    if visited[y, x] or not on[y, x]:
                        continue
                    visited[y, x] = True
                    pts.append((x, y))
                    stack.extend(((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)))
                return pts

            for yy in range(h):
                for xx in range(w):
                    if on[yy, xx] and not visited[yy, xx]:
                        pts = trace(yy, xx)
                        if len(pts) > 30:
                            contours.append(pts)
            if not contours:
                continue
            scale = target_h / float(h)
            out = []
            for pts in contours:
                out.append(
                    "M"
                    + " ".join(
                        f"{(px - w / 2) * scale:.2f},{(py - h / 2) * scale:.2f}"
                        for px, py in pts
                    )
                    + "Z"
                )
            return w * scale, out
        except Exception:
            continue
    return 0.0, []


def sample_glyph(glyph: str, dw: int, dh: int) -> np.ndarray:
    """Sample a CJK glyph into a dot-grid alpha field (0..1), or zeros."""
    field = np.zeros((dh, dw), dtype=np.float64)
    gw, gpaths = glyph_paths(glyph, 52)
    if not gpaths:
        return field
    ss = 3
    layer = Image.new("L", (dw * ss, dh * ss), 0)
    draw = ImageDraw.Draw(layer)
    ox, oy = dw * ss - 26 * ss - gw * ss / 2.0, (24 + 26) * ss
    for poly in _paths_to_polygons(gpaths):
        draw.polygon(
            [(ox + px * ss, oy + py * ss) for px, py in poly],
            fill=int(0.20 * 255),
        )
    small = layer.resize((dw, dh), Image.LANCZOS)
    return np.asarray(small, dtype=np.float64) / 255.0


def build_plate(name: str) -> str:
    subject, out, _alt = PLATES[name]
    render_fn, (sw, sh), glyph = SUBJECTS[subject]
    dw, dh = out

    field = render_fn(sw, sh)
    if (sw, sh) != (dw, dh):
        field_img = Image.fromarray((clip(field) * 255).astype(np.uint8), "L")
        field_img = field_img.resize((dw, dh), Image.LANCZOS)
        field = np.asarray(field_img, dtype=np.float64) / 255.0
    field = field.astype(np.float64)

    X, Y = grid(dw, dh)
    xi = np.clip(X.astype(int), 0, dw - 1)
    yi = np.clip(Y.astype(int), 0, dh - 1)
    sampled = field[yi, xi]

    v = lift(sampled)
    r = R_MIN + (R_MAX - R_MIN) * np.power(v, GAMMA)

    # the printer's mark: CJK glyph sampled straight onto the dot grid
    mark = sample_glyph(glyph, dw, dh)
    if mark.max() > 0.02:
        gxi = np.clip(X.astype(int), 0, dw - 1)
        gyi = np.clip(Y.astype(int), 0, dh - 1)
        gval = mark[gyi, gxi]
        gr = R_MIN + (R_MAX - R_MIN) * np.power(gval, 0.85)
        r = np.maximum(r, gr)

    cx = np.arange(STEP / 2.0, dw, STEP)
    cy = np.arange(STEP / 2.0, dh, STEP)

    parts = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{dw}" height="{dh}" '
        f'viewBox="0 0 {dw} {dh}">',
        f'<rect width="{dw}" height="{dh}" fill="rgb({BG[0]},{BG[1]},{BG[2]})"/>',
        f'<g fill="rgb({INK[0]},{INK[1]},{INK[2]})">',
    ]
    for iy in range(r.shape[0]):
        row = []
        for ix in range(r.shape[1]):
            rad = r[iy, ix]
            if rad <= 0.42:
                continue
            row.append(f'<circle cx="{cx[ix]:.1f}" cy="{cy[iy]:.1f}" r="{rad:.2f}"/>')
        if row:
            parts.append("".join(row))
    parts.append("</g>")

    parts.append("</svg>")
    return "".join(parts)


def build_grain(size: int = 200) -> str:
    rng = np.random.default_rng(11)
    noise = clip(rng.normal(0.5, 0.17, (size, size)), 0.0, 1.0)
    alpha = (np.abs(noise - 0.5) * 2.0 * 40).astype(np.uint8)
    img = Image.new("RGBA", (size, size))
    px = img.load()
    for y in range(size):
        for x in range(size):
            a = int(alpha[y, x])
            if a == 0:
                px[x, y] = (0, 0, 0, 0)
            elif noise[y, x] > 0.5:
                px[x, y] = (233, 226, 214, a)
            else:
                px[x, y] = (0, 0, 0, a)
    path = os.path.join(PUBLIC_DIR, "grain.webp")
    img.save(path, "WEBP", quality=70, method=6)
    return path


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    for name in PLATES:
        svg = build_plate(name)
        path = os.path.join(OUT_DIR, f"{name}.svg")
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(svg)
        print(f"{name:9s} {len(svg) / 1024:7.1f} kb  dots={svg.count('<circle')}")
    print("grain:", build_grain())


if __name__ == "__main__":
    main()