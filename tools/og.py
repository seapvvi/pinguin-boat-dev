"""Builds the picture a link shows when it is shared.

Renders one of the halftone plates to a PNG at the size the social cards
want, on the page's own near-black ground, with the wordmark set in the
site's mono face.

Run: python tools/og.py
"""
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFont

import plates as P

HERE = os.path.dirname(__file__)
ASSETS = os.path.join(HERE, "..", "assets")
FONTS = os.path.join(HERE, "..", "fonts")

W, H = 1200, 630
GROUND = (27, 27, 25)
INK = (212, 197, 181)
DIM = (159, 143, 127)


def ttf(woff2, name):
    """A woff2 the rasteriser can read: unpack it once into a plain ttf."""
    from fontTools.ttLib import TTFont

    out = os.path.join(HERE, "_tmp", name)
    font = TTFont(os.path.join(FONTS, woff2))
    font.flavor = None
    font.save(out)
    return out


def render_plate(name, field, pw, ph):
    """The plate's dots as a PIL image, ink on the ground."""
    X, Y, R = P.dots(pw, ph, field)
    img = Image.new("RGB", (pw, ph), GROUND)
    draw = ImageDraw.Draw(img)
    for x, y, r in zip(X.ravel(), Y.ravel(), R.ravel()):
        draw.ellipse((x - r, y - r, x + r, y + r), fill=INK)
    return img


def main():
    os.makedirs(os.path.join(HERE, "_tmp"), exist_ok=True)

    # the eye: a wide subject that reads at card size
    plate = render_plate("eye", P.eye_field, 1520, 400)
    target_w = 1080
    plate = plate.resize((target_w, round(400 * target_w / 1520)), Image.LANCZOS)

    canvas = Image.new("RGB", (W, H), GROUND)
    px = (W - plate.width) // 2
    py = 232
    canvas.paste(plate, (px, py))

    draw = ImageDraw.Draw(canvas)
    mono = ttf("space-mono-latin-400.woff2", "_og-mono.ttf")
    try:
        title = ImageFont.truetype(mono, 46)
        small = ImageFont.truetype(mono, 19)
    except OSError:
        title = small = ImageFont.load_default()

    draw.text((px, 118), "pinguin empire", font=title, fill=INK)
    draw.text((px, 178), "open source · development · ai",
              font=small, fill=DIM)
    draw.text((px, py + plate.height + 34),
              "a community for open source development and ai.", font=small, fill=DIM)

    out = os.path.join(ASSETS, "og.png")
    # the picture is one ink on one ground: a small palette holds it exactly
    # and keeps the card light enough to travel over a chat
    canvas = canvas.quantize(colors=64, method=Image.MEDIANCUT, dither=Image.NONE)
    canvas.save(out, "PNG", optimize=True)
    print(f"og.png: {W}x{H}, {os.path.getsize(out)/1024:.1f} kB")


if __name__ == "__main__":
    main()
