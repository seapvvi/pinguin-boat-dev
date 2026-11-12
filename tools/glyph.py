"""Turns a character into an SVG path, so a glyph can ride inside a plate
without asking the viewer to have any CJK font installed.

The path is taken from the Noto Serif SC subset in fonts/ and scaled so the
glyph's ink box lands where it was asked to.
"""
import os

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont

HERE = os.path.dirname(__file__)
FONT = os.path.join(HERE, "..", "fonts", "noto-serif-sc-700.woff2")

_cache = {}


def _font():
    if "font" not in _cache:
        _cache["font"] = TTFont(FONT)
    return _cache["font"]


def glyph(ch):
    """Return (path_d, bbox, upem) for one character.

    bbox is (xMin, yMin, xMax, yMax) in font units, with y pointing up.
    """
    if "g:" + ch in _cache:
        return _cache["g:" + ch]

    font = _font()
    cmap = font.getBestCmap()
    if ord(ch) not in cmap:
        raise KeyError(f"no glyph for {ch!r}")

    name = cmap[ord(ch)]
    glyph_set = font.getGlyphSet()
    pen = SVGPathPen(glyph_set)
    glyph_set[name].draw(pen)

    glyf = font["glyf"][name]
    bbox = (glyf.xMin, glyf.yMin, glyf.xMax, glyf.yMax)
    upem = font["head"].unitsPerEm

    _cache["g:" + ch] = (pen.getCommands(), bbox, upem)
    return _cache["g:" + ch]


def place(ch, x, y, height, anchor="top-right"):
    """An SVG path for `ch` scaled to `height` and put near (x, y).

    anchor "top-right" pins the glyph's ink box to that corner, "top-left"
    and "bottom-right" are there for the other corners.
    """
    d, (x_min, y_min, x_max, y_max), upem = glyph(ch)
    if x_max == x_min or y_max == y_min:
        raise ValueError(f"{ch!r} has no ink to place")

    scale = height / (y_max - y_min)
    if anchor == "top-right":
        tx = x - x_max * scale
        ty = y + y_max * scale
    elif anchor == "top-left":
        tx = x - x_min * scale
        ty = y + y_max * scale
    elif anchor == "bottom-right":
        tx = x - x_max * scale
        ty = y - y_min * scale
    else:
        raise ValueError(f"unknown anchor {anchor!r}")

    return f'<path d="{d}" transform="translate({tx:.2f} {ty:.2f}) scale({scale:.5f} {-scale:.5f})"/>'
