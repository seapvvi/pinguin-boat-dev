"""Cuts the latin fonts the page needs down to the glyphs it actually sets.

Two files are built here:

  space-mono-latin-400.woff2   the mono face, plus the arrow and middle dot
  noto-serif-sc-700.woff2      the CJK face, cut from the characters the page
                               and the plates use (see fonts.py)

The latin cut is taken from the upstream Space Mono release and subset to the
page's own character set, so the arrow the links use is covered by the same
face as the text around it instead of falling back to whatever the system
happens to have.

Run: python tools/latin.py
"""
import os
import re
import urllib.request

from fontTools.ttLib import TTFont
from fontTools import subset

HERE = os.path.dirname(__file__)
FONTS = os.path.join(HERE, "..", "fonts")
PAGE = os.path.join(HERE, "..", "index.html")

SPACE_MONO = ("https://raw.githubusercontent.com/google/fonts/main/ofl/"
              "spacemono/SpaceMono-Regular.ttf")

LICENSE = """Space Mono
Copyright 2017 The Space Mono Project Authors
(https://github.com/FAlthausen/SpaceMono)

This Font Software is licensed under the SIL Open Font License, Version 1.1.
This license is copied below, and is also available with a FAQ at:
https://openfontlicense.org

The subset in this file carries the glyphs the Pinguin Empire site sets.
"""


def fetch(url, path):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=120) as r:
        data = r.read()
    with open(path, "wb") as f:
        f.write(data)
    return len(data)


def is_cjk(ch):
    o = ord(ch)
    return (0x3400 <= o <= 0x4DBF or 0x4E00 <= o <= 0x9FFF
            or 0xF900 <= o <= 0xFAFF or 0x3000 <= o <= 0x303F)


def page_chars():
    """Every latin character the page sets, read from the markup.

    Read from the markup so a new letter or symbol always lands in the cut.
    The CJK characters are left out: they belong to the other face.
    """
    html = open(PAGE, encoding="utf-8").read()
    keep = {c for c in html
            if c.isprintable() and not is_cjk(c)}
    # the arrow and the dashes are set in the markup too, but make sure the
    # ones the css uses are covered as well
    keep |= set("→·—–…’“”")
    return "".join(sorted(keep))


def cut_chars():
    """What the cut actually holds.

    The whole printable ascii range, so the face stands on its own for
    anything the site sets later, plus the symbols and accents the page
    already uses. Cutting to the page's characters alone would drop a letter
    the day it is typed somewhere new, and a missing letter shows up as a
    tofu box rather than a wrong letter.
    """
    ascii_set = {chr(c) for c in range(0x20, 0x7F)}
    return "".join(sorted(ascii_set | set(page_chars())))


def main():
    chars = cut_chars()
    # the arrow and the middle dot are set in the markup too, but make sure
    # the ones the css uses are covered as well
    chars = "".join(sorted(set(chars + "→·—–…’“”")))

    src = os.path.join(FONTS, "_spacemono.ttf")
    size = fetch(SPACE_MONO, src)
    print(f"Space Mono source: {size/1024:.0f} kB")

    font = TTFont(src)
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.desubroutinize = True
    opts.drop_tables += ["DSIG"]
    opts.layout_features = ["*"]
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    opts.recalc_bounds = True
    opts.drop_glyphs = False

    sub = subset.Subsetter(options=opts)
    sub.populate(text=chars)
    sub.subset(font)

    out = os.path.join(FONTS, "space-mono-latin-400.woff2")
    font.flavor = "woff2"
    font.save(out)
    os.remove(src)

    check = TTFont(out)
    cmap = check.getBestCmap()
    missing = [c for c in chars if ord(c) not in cmap]
    print(f"wrote {out} ({os.path.getsize(out)/1024:.1f} kB), {len(cmap)} glyphs")
    print(f"missing: {missing if missing else 'none'}")

    with open(os.path.join(FONTS, "space-mono-latin-400.LICENSE.txt"), "w",
              encoding="utf-8", newline="\n") as f:
        f.write(LICENSE)


if __name__ == "__main__":
    main()
