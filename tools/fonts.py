"""Fetch the Noto Serif SC (OFL) glyphs the plates need and cut them into one
woff2 subset. The plate characters are outside the page's own CJK subset, and
an <img>-linked SVG cannot reach the page's webfont, so the glyphs have to
travel inside the asset.

Run: python tools/fonts.py
"""
import os
import re
import sys
import urllib.parse
import urllib.request

from fontTools.ttLib import TTFont
from fontTools import subset

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HERE = os.path.dirname(__file__)
FONTS = os.path.join(HERE, "..", "fonts")
PAGE = os.path.join(HERE, "..", "index.html")

# the character each plate carries, top right
PLATE_CHARS = "木城月星波山球命刀眼"


def page_chars():
    """Every CJK character the page itself sets, read from the markup.

    Read rather than listed, so a character added to the markup always lands
    in the subset: the page's own glyphs and the plates' glyphs share one file.
    """
    html = open(PAGE, encoding="utf-8").read()
    cjk = set()
    for c in html:
        o = ord(c)
        if 0x3400 <= o <= 0x4DBF or 0x4E00 <= o <= 0x9FFF or 0xF900 <= o <= 0xFAFF:
            cjk.add(c)
    return "".join(sorted(cjk))


CHARS = "".join(sorted(set(PLATE_CHARS + page_chars())))

API = "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@700&text="
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")

LICENSE = """Noto Serif SC
Copyright 2014-2021 Adobe (http://www.adobe.com/), with Reserved Font Name
'Source'. Source is a trademark of Adobe in the United States and/or other
countries.

This Font Software is licensed under the SIL Open Font License, Version 1.1.
The licence is bundled with the font, and is also available with a FAQ at:
https://openfontlicense.org

The glyphs in this cut are the subset used by the Pinguin Empire site.
"""


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read()


def font_url():
    """The css2 endpoint with text= returns one slice holding every glyph."""
    css = fetch(API + urllib.parse.quote(CHARS)).decode("utf-8")
    m = re.search(r"src:\s*url\((https://[^)]+)\)", css)
    if not m:
        raise SystemExit("no woff2 url in the css response")
    return m.group(1)


def main():
    url = font_url()
    raw = fetch(url)
    src = os.path.join(FONTS, "_slice.woff2")
    with open(src, "wb") as f:
        f.write(raw)
    print(f"slice: {len(raw) // 1024} kB")

    font = TTFont(src)

    # keep every glyph the slice carries, not just ours: the slice is already
    # cut to text=, so subsetting it again would only strip its own metadata
    opts = subset.Options()
    opts.flavor = "woff2"
    opts.drop_tables += ["DSIG"]
    opts.layout_features = ["*"]
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    opts.recalc_bounds = True
    opts.drop_glyphs = False

    sub = subset.Subsetter(options=opts)
    sub.populate(text=CHARS)
    sub.subset(font)
    os.remove(src)

    out = os.path.join(FONTS, "noto-serif-sc-700.woff2")
    font.flavor = "woff2"
    font.save(out)

    check = TTFont(out)
    got = "".join(sorted(chr(c) for c in check.getBestCmap() if c != 0x20))
    missing = [c for c in CHARS if c not in got]
    print(f"wrote {out} ({os.path.getsize(out) // 1024} kB)")
    print(f"glyphs: {got}")
    print(f"missing: {missing if missing else 'none'}")

    with open(os.path.join(FONTS, "noto-serif-sc-700.LICENSE.txt"), "w",
              encoding="utf-8", newline="\n") as f:
        f.write(LICENSE)


if __name__ == "__main__":
    main()
