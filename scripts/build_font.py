#!/usr/bin/env python3
"""Builds the "rubengura LED" web font from its pixel source.

The source, scripts/fonts/rubengura-led.json, is a bitmap font: a pixel
redrawing of Rubik Bold. This script traces each glyph's pixels into a single
outline (no seams between pixels) and writes assets/fonts/rubengura-led.woff2.

    pip install fonttools brotli        # once
    python3 scripts/build_font.py

Run it again after editing the JSON, and commit both files.

Source format
  em     pixels per em (font size / em = size of one pixel)
  asc    pixels from the top of the tallest glyph to the baseline
  desc   pixels below the baseline
  track  pixels of space between letters (split evenly on both sides)
  space  advance width of the space, in pixels
  g      one entry per character: "width|top|row,row,...". `top` is the first
         row's distance from the top (in pixels); each row is a base-36
         bitmask, least significant bit = leftmost pixel.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

try:
    from fontTools.fontBuilder import FontBuilder
    from fontTools.misc.timeTools import timestampNow
    from fontTools.pens.ttGlyphPen import TTGlyphPen
except ImportError:
    print("error: needs fontTools and brotli. Run: pip install fonttools brotli")
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "scripts/fonts/rubengura-led.json"
OUTPUT = ROOT / "assets/fonts/rubengura-led.woff2"

UNITS_PER_PIXEL = 40  # 27.5 pixels per em → 1100 units per em

# Characters the site uses that the source doesn't draw, and the glyph to
# borrow for each: typographic quotes, the em dash, non-breaking space.
ALIASES = {
    "’": "'", "‘": "'",
    "“": '"', "”": '"',
    "—": "–", "‐": "-", "‑": "-",
    " ": " ",
}

# Glyphs that tuck under their neighbour, in pixels (negative = to the left).
# The tail of the j hangs under the previous letter, as it does in Rubik.
BEARINGS = {"j": -3}

Pixel = tuple[int, int]
Point = tuple[int, int]


def decode(spec: str, asc: int) -> tuple[int, set[Pixel]]:
    """Returns the glyph width and its filled pixels, y pointing up from the baseline."""
    width, top, rows = spec.split("|")
    pixels = set()
    for i, row in enumerate(rows.split(",")):
        bits = int(row, 36) if row else 0
        y = asc - int(top) - i - 1
        pixels.update((x, y) for x in range(int(width)) if bits >> x & 1)
    return int(width), pixels


def trace(pixels: set[Pixel]) -> list[list[Point]]:
    """Traces filled pixels into closed contours.

    Each pixel contributes its four edges, clockwise. Edges shared by two
    pixels run in opposite directions and cancel out, leaving only the
    boundary: outer contours clockwise and holes anticlockwise, which is what
    TrueType expects.
    """
    edges: set[tuple[Point, Point]] = set()
    for x, y in pixels:
        corners = [(x, y), (x, y + 1), (x + 1, y + 1), (x + 1, y)]
        for a, b in zip(corners, corners[1:] + corners[:1]):
            if (b, a) in edges:
                edges.remove((b, a))
            else:
                edges.add((a, b))

    outgoing: dict[Point, list[Point]] = {}
    for a, b in edges:
        outgoing.setdefault(a, []).append(b)

    def next_point(prev: Point, here: Point) -> Point:
        # Where two pixels touch only at a corner there are two ways out.
        # Always turning right keeps each contour from crossing itself.
        options = outgoing[here]
        if len(options) == 1:
            return options.pop()
        dx, dy = here[0] - prev[0], here[1] - prev[1]
        preference = [(dy, -dx), (dx, dy), (-dy, dx)]  # right, straight, left
        for d in preference:
            target = (here[0] + d[0], here[1] + d[1])
            if target in options:
                options.remove(target)
                return target
        return options.pop()

    contours = []
    while any(outgoing.values()):
        start = next(p for p, targets in outgoing.items() if targets)
        prev, here = start, outgoing[start].pop()
        contour = [start]
        while here != start:
            contour.append(here)
            prev, here = here, next_point(prev, here)
        contours.append(simplify(contour))
    return contours


def simplify(contour: list[Point]) -> list[Point]:
    """Drops points in the middle of straight lines."""
    kept = []
    n = len(contour)
    for i, (x, y) in enumerate(contour):
        px, py = contour[i - 1]
        nx, ny = contour[(i + 1) % n]
        if (x - px) * (ny - y) != (y - py) * (nx - x):
            kept.append((x, y))
    return kept


def build(source: Path, output: Path) -> int:
    spec = json.loads(source.read_text(encoding="utf-8"))
    unit = UNITS_PER_PIXEL
    upm = round(spec["em"] * unit)
    asc, desc, track = spec["asc"], spec["desc"], spec["track"]
    side = track // 2

    glyphs = {}
    metrics = {}
    cmap = {}

    # .notdef: an empty box (outer contour clockwise, hole anticlockwise)
    pen = TTGlyphPen(None)
    for box in [[(1, 0), (1, 19), (13, 19), (13, 0)], [(3, 2), (11, 2), (11, 17), (3, 17)]]:
        pen.moveTo((box[0][0] * unit, box[0][1] * unit))
        for x, y in box[1:]:
            pen.lineTo((x * unit, y * unit))
        pen.closePath()
    glyphs[".notdef"] = pen.glyph()
    metrics[".notdef"] = (15 * unit, unit)

    glyphs["space"] = TTGlyphPen(None).glyph()
    metrics["space"] = (spec["space"] * unit, 0)
    cmap[ord(" ")] = "space"

    for char, data in spec["g"].items():
        name = f"uni{ord(char):04X}"
        width, pixels = decode(data, asc)
        bearing = BEARINGS.get(char, 0)
        shift = side + bearing
        pen = TTGlyphPen(None)
        for contour in trace(pixels):
            pen.moveTo(((contour[0][0] + shift) * unit, contour[0][1] * unit))
            for x, y in contour[1:]:
                pen.lineTo(((x + shift) * unit, y * unit))
            pen.closePath()
        glyphs[name] = pen.glyph()
        xs = [x for x, _ in pixels]
        lsb = (min(xs) + shift) * unit if xs else 0
        metrics[name] = ((width + track + bearing) * unit, lsb)
        cmap[ord(char)] = name

    for alias, original in ALIASES.items():
        target = cmap.get(ord(original))
        if target and ord(alias) not in cmap:
            cmap[ord(alias)] = target

    fb = FontBuilder(upm, isTTF=True)
    fb.setupGlyphOrder(list(glyphs))
    fb.setupCharacterMap(cmap)
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=asc * unit, descent=-desc * unit)
    family = spec["name"]
    fb.setupNameTable({
        "familyName": family,
        "styleName": "Bold",
        "uniqueFontIdentifier": f"{family} Bold",
        "fullName": f"{family} Bold",
        "psName": family.replace(" ", "") + "-Bold",
        "copyright": "Copyright 2015 The Rubik Project Authors; pixel version 2026 Rubén Guerrero",
        "licenseDescription": "SIL Open Font License, Version 1.1",
        "licenseInfoURL": "https://openfontlicense.org",
    })
    fb.setupOS2(
        version=4,
        usWeightClass=700,
        fsSelection=0x20 | 0x80,  # bold, use typo metrics
        sTypoAscender=asc * unit,
        sTypoDescender=-desc * unit,
        sTypoLineGap=0,
        usWinAscent=asc * unit,
        usWinDescent=desc * unit,
    )
    fb.setupPost()
    now = timestampNow()
    fb.setupHead(unitsPerEm=upm, macStyle=1, created=now, modified=now)  # bold
    fb.font.flavor = "woff2"
    output.parent.mkdir(parents=True, exist_ok=True)
    fb.save(output)

    print(f"{output.relative_to(ROOT)}: {len(cmap)} characters, {output.stat().st_size / 1024:.1f} KB")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--source", type=Path, default=SOURCE)
    ap.add_argument("--output", type=Path, default=OUTPUT)
    args = ap.parse_args()
    return build(args.source, args.output)


if __name__ == "__main__":
    sys.exit(main())
