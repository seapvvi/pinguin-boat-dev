"""Builds the milky way plate used below the hero plates.

Same halftone recipe as the other plates: a 6.2px dot grid on near-black
ground, dot radius driven by the lightness of a greyscale field.

Run: python tools/milkyway.py
"""
import os

import numpy as np

import halftone as HT
from plates import lift, vnoise

W, H = 1560, 760
STEP = 6.2
R_MIN, R_MAX, GAMMA = 0.35, 3.35, 0.72
KEEP = 0.42
INK = "rgb(233,226,214)"
BG = "rgb(3,3,3)"
OUT = os.path.join(
    os.path.dirname(__file__), "..", "apps", "web", "public", "plates", "milkyway.svg"
)


def band_center(x):
    """The galactic plane, arched and a little wavy across the frame."""
    return 442 - 0.11 * x + 26 * np.sin(x / 300.0 - 0.4)


def band_slope(x):
    return -0.11 + (26.0 / 300.0) * np.cos(x / 300.0 - 0.4)


def band_stars(x, y, n, seed, spread, r0, r1, a0, a1):
    """Stars scattered along the galactic band, thickest at its centre."""
    rng = np.random.default_rng(seed)
    out = np.zeros(np.shape(x))
    for _ in range(n):
        sx = rng.uniform(-40.0, W + 40.0)
        sy = band_center(sx) + rng.normal(0.0, spread)
        rad = rng.uniform(r0, r1)
        out = np.maximum(out, HT.sstep(rad, 0.0, np.hypot(x - sx, y - sy)) * rng.uniform(a0, a1))
    return out


def field_stars(x, y, n, seed, r0, r1, a0, a1):
    """A sparse field of stars across the whole plate."""
    rng = np.random.default_rng(seed)
    out = np.zeros(np.shape(x))
    for _ in range(n):
        sx, sy = rng.uniform(0.0, W), rng.uniform(0.0, H)
        rad = rng.uniform(r0, r1)
        out = np.maximum(out, HT.sstep(rad, 0.0, np.hypot(x - sx, y - sy)) * rng.uniform(a0, a1))
    return out


def bright_star(x, y, cx, cy, rad, amp):
    """A star with four thin diffraction spikes."""
    d = np.hypot(x - cx, y - cy)
    core = HT.sstep(rad, 0.0, d) * amp
    halo = np.exp(-(d / (rad * 4.6)) ** 2) * amp * 0.30
    spike_x = np.exp(-((y - cy) / (rad * 0.9)) ** 2) * np.exp(-((x - cx) / (rad * 15.0)) ** 2) * amp * 0.42
    spike_y = np.exp(-((x - cx) / (rad * 0.9)) ** 2) * np.exp(-((y - cy) / (rad * 15.0)) ** 2) * amp * 0.42
    return np.maximum.reduce([core, halo, spike_x, spike_y])


def noise(x, y, cells, octaves, seed, sx=1.0, sy=1.0, w=620, h=300):
    """Sample value noise in plate coordinates, normalised to the sampler domain.

    sx/sy stretch the features: below 1 stretches them, above 1 compresses.
    """
    sampler = vnoise(w, h, cells=cells, octaves=octaves, seed=seed)
    nx = x * (w / W) * sx
    ny = y * (h / H) * sy
    return sampler(np.clip(nx, 0, w - 1), np.clip(ny, 0, h - 1))


def milky_field(x, y):
    yc = band_center(x)
    slope = band_slope(x)
    v = (y - yc) / np.sqrt(1.0 + slope * slope)

    cloud = noise(x, y, 9, 4, 71)
    grain = noise(x, y, 52, 3, 77)
    wobble = noise(x, y, 5, 2, 78)
    width = (86.0 + 22.0 * np.sin(x / 430.0 + 1.1)) * (0.78 + 0.44 * wobble)

    along = 0.26 + 0.74 * np.exp(-(((x - 980.0) / 340.0) ** 2))
    band = np.exp(-((v / width) ** 2)) * along * (0.30 + 0.56 * cloud) * (0.55 + 0.45 * grain)

    # the central bulge, brighter and thicker than the rest of the band
    bulge = np.exp(
        -(((x - 1010.0) / 290.0) ** 2 + ((y - band_center(1010.0)) / 92.0) ** 2)
    )
    band = band + bulge * 0.24

    # a faint halo so the band does not end on a hard line
    halo = np.exp(-((v / (width * 2.6)) ** 2)) * (0.020 + 0.014 * cloud)
    band = band + halo

    # dark dust lanes: noise carved out of the middle of the band, stretched
    # along the galactic plane rather than across it
    rift = noise(x, y, 13, 4, 72, sx=0.55, sy=1.1)
    lane = HT.sstep(0.50, 0.68, rift) * np.exp(-((v / (width * 0.92)) ** 2))
    band = band * (1.0 - 0.95 * lane)

    # one long, thin rift near the core, the way the dust splits the light
    d1 = 14.0 * np.sin(x / 330.0 + 0.8) + 7.0 * np.sin(x / 97.0)
    hard = HT.sstep(12.0, 1.5, np.abs(v - d1))
    hard = hard * HT.sstep(140.0, 330.0, x) * HT.sstep(1490.0, 1280.0, x)
    band = band * (1.0 - 0.62 * hard)

    # the band is made of stars: dense inside, sparse outside
    near = band_stars(x, y, 1400, 81, 54.0, 0.45, 1.35, 0.14, 0.50)
    near = np.maximum(near, band_stars(x, y, 520, 84, 128.0, 0.40, 0.95, 0.05, 0.16))
    far = field_stars(x, y, 300, 82, 0.38, 0.80, 0.02, 0.09)
    far = np.maximum(far, field_stars(x, y, 46, 85, 0.60, 1.25, 0.08, 0.22))

    beams = np.zeros(np.shape(x))
    for cx, cy, rad, amp in (
        (336, 480, 2.9, 0.95),
        (612, 444, 2.2, 0.85),
        (980, 396, 3.4, 1.0),
        (1218, 370, 2.4, 0.9),
        (1416, 344, 1.8, 0.72),
        (864, 418, 1.5, 0.7),
        (1104, 382, 1.4, 0.66),
    ):
        beams = np.maximum(beams, bright_star(x, y, cx, cy, rad, amp))

    return np.maximum.reduce([band * 0.92, near, far, beams])


def dots(w, h, field):
    xs = np.arange(STEP / 2, w, STEP)
    ys = np.arange(STEP / 2, h, STEP)
    X, Y = np.meshgrid(xs, ys)
    v = lift(np.clip(field(X, Y), 0, 1))
    r = R_MIN + (R_MAX - R_MIN) * v ** GAMMA
    keep = r > KEEP
    return X[keep], Y[keep], r[keep]


def write_svg(path, w, h, field):
    X, Y, R = dots(w, h, field)
    rows = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">',
        f'<rect width="{w}" height="{h}" fill="{BG}"/>',
        f'<g fill="{INK}">',
    ]
    row = []
    for x, y, r in zip(X.ravel(), Y.ravel(), R.ravel()):
        row.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.2f}"/>')
    rows.append("".join(row))
    rows.append("</g>")
    rows.append("</svg>")
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write("".join(rows))
    print(f"{os.path.basename(path)}: {w}x{h}, {X.size} dots, {os.path.getsize(path) // 1024} KB")


if __name__ == "__main__":
    write_svg(OUT, W, H, milky_field)


