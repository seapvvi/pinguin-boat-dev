"""Builds the site's assets: the grain tile behind the page, and the WebP
copies of the raster art.

The grain is independent noise: about a tenth of the pixels lit, spread
evenly over a narrow band of greys. Drawing it from a seed keeps the tile
reproducible and drops a quarter of a megabyte of stored rectangles for the
same picture.

Run: python tools/webp.py
"""
import os

import numpy as np
from PIL import Image

HERE = os.path.dirname(__file__)
ASSETS = os.path.join(HERE, "..", "assets")

# the grain tile: a square of noise, tiled behind the whole page
GRAIN_SIZE = 220
GRAIN_COVER = 0.101        # the share of pixels that are lit
GRAIN_LO, GRAIN_HI = 6, 16  # the band of greys they take
GRAIN_SEED = 7

# the file to convert, and the quality that keeps the dots crisp
TARGETS = [
    ("hands-left.png", "hands-left.webp", 88),
    ("hands-right.png", "hands-right.webp", 88),
]


def grain_image(size=GRAIN_SIZE, seed=GRAIN_SEED):
    """A tile of fine noise: mostly black, a scatter of near-black greys."""
    rng = np.random.default_rng(seed)
    arr = np.zeros((size, size), dtype=np.uint8)

    # pick the lit pixels, then give each one a grey from the band
    lit = rng.random((size, size)) < GRAIN_COVER
    levels = rng.integers(GRAIN_LO, GRAIN_HI + 1, size=(size, size))
    arr[lit] = levels[lit]
    return Image.fromarray(arr, "L").convert("RGB")


def convert(src, dst, quality):
    img = Image.open(os.path.join(ASSETS, src))
    out = os.path.join(ASSETS, dst)
    img.save(out, "WEBP", quality=quality, method=6)

    before = os.path.getsize(os.path.join(ASSETS, src))
    after = os.path.getsize(out)
    print(f"{src:20} -> {dst:20} {before/1024:7.1f} kB -> {after/1024:6.1f} kB "
          f"({100 - 100*after/before:4.1f}% smaller)")


def main():
    grain = grain_image()
    out = os.path.join(ASSETS, "grain.webp")
    grain.save(out, "WEBP", quality=90, method=6)
    print(f"{'grain.svg':20} -> {'grain.webp':20} "
          f"{'299.0':>7} kB -> {os.path.getsize(out)/1024:6.1f} kB "
          f"({100 - 100*os.path.getsize(out)/os.path.getsize(os.path.join(ASSETS, 'grain.svg')):4.1f}% smaller)")

    for src, dst, q in TARGETS:
        convert(src, dst, q)


if __name__ == "__main__":
    main()
