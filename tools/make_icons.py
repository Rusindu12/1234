#!/usr/bin/env python3
"""
SipSaviya · launcher icon generator (pure Python, no dependencies)
==================================================================
Draws the app icon — a blue gradient tile with an open book, a gold "AI spark"
and a coral bookmark — and writes it as PNGs for every Android density, plus
the 192/512 px web icons used by the README and the live preview.

    python3 tools/make_icons.py

Uses a 3× supersampled rasteriser so the edges stay clean at small sizes.
"""
from __future__ import annotations

import math
import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RES = ROOT / "android" / "app" / "src" / "main" / "res"
WEB = ROOT / "android" / "app" / "src" / "main" / "assets" / "www"

SS = 3  # supersampling factor

# Brand colours
BG_TOP = (0x3B, 0x82, 0xF6)
BG_MID = (0x1D, 0x4E, 0xD8)
BG_BOT = (0x08, 0x14, 0x36)
PAGE_L = (0xFF, 0xFF, 0xFF)
PAGE_R = (0xD8, 0xE4, 0xFF)
SPINE = (0x8F, 0xB0, 0xF0)
GOLD = (0xFF, 0xD1, 0x66)
CORAL = (0xFF, 0x7A, 0x59)


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def gradient(t):
    """t: 0 (top-left) → 1 (bottom-right)"""
    if t < 0.55:
        return lerp(BG_TOP, BG_MID, t / 0.55)
    return lerp(BG_MID, BG_BOT, (t - 0.55) / 0.45)


def in_rounded_square(x, y, size, radius):
    r = radius
    if x < r and y < r:
        return (x - r) ** 2 + (y - r) ** 2 <= r * r
    if x > size - r and y < r:
        return (x - (size - r)) ** 2 + (y - r) ** 2 <= r * r
    if x < r and y > size - r:
        return (x - r) ** 2 + (y - (size - r)) ** 2 <= r * r
    if x > size - r and y > size - r:
        return (x - (size - r)) ** 2 + (y - (size - r)) ** 2 <= r * r
    return 0 <= x <= size and 0 <= y <= size


def in_circle(x, y, cx, cy, r):
    return (x - cx) ** 2 + (y - cy) ** 2 <= r * r


def in_triangle(x, y, p1, p2, p3):
    def sign(a, b, c):
        return (a[0] - c[0]) * (b[1] - c[1]) - (b[0] - c[0]) * (a[1] - c[1])
    d1 = sign((x, y), p1, p2)
    d2 = sign((x, y), p2, p3)
    d3 = sign((x, y), p3, p1)
    has_neg = d1 < 0 or d2 < 0 or d3 < 0
    has_pos = d1 > 0 or d2 > 0 or d3 > 0
    return not (has_neg and has_pos)


def star_points(cx, cy, r_out, r_in):
    pts = []
    for i in range(8):
        ang = math.pi / 4 * i - math.pi / 2
        r = r_out if i % 2 == 0 else r_in
        pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    return pts


def in_polygon(x, y, pts):
    inside = False
    n = len(pts)
    for i in range(n):
        x1, y1 = pts[i]
        x2, y2 = pts[(i + 1) % n]
        if (y1 > y) != (y2 > y):
            xin = (x2 - x1) * (y - y1) / (y2 - y1) + x1
            if x < xin:
                inside = not inside
    return inside


def shape_color(x, y, s):
    """Return an (r,g,b,a) for a point in the 0..1 unit icon space."""
    # ---- open book -------------------------------------------------------
    # pages first, then the ribbon on top of the right page
    if in_polygon(x, y, [(0.49, 0.40), (0.26, 0.475), (0.26, 0.745), (0.49, 0.67)]):
        return PAGE_L + (255,)
    if in_polygon(x, y, [(0.51, 0.40), (0.74, 0.475), (0.74, 0.745), (0.51, 0.67)]):
        return PAGE_R + (255,)
    if in_polygon(x, y, [(0.575, 0.443), (0.645, 0.464), (0.645, 0.575), (0.61, 0.558), (0.575, 0.572)]):
        return CORAL + (255,)
    if 0.49 <= x <= 0.51 and 0.40 <= y <= 0.72:
        return SPINE + (255,)
    # ---- AI spark (4-point star, like a "generate" sparkle) --------------
    if in_polygon(x, y, star_points(0.5, 0.275, 0.075, 0.022)):
        return GOLD + (255,)
    return None


def render(size: int, round_icon: bool, tile: bool = True):
    """Render one icon at `size` px. Returns raw RGBA rows."""
    n = size * SS
    radius = n * 0.22
    rows = []
    for py in range(size):
        row = bytearray()
        for px in range(size):
            r_acc = g_acc = b_acc = a_acc = 0
            for sy in range(SS):
                for sx in range(SS):
                    # sample in unit space
                    ux = (px + (sx + 0.5) / SS) / size
                    uy = (py + (sy + 0.5) / SS) / size
                    if round_icon:
                        hit = in_circle(ux, uy, 0.5, 0.5, 0.5)
                    elif tile:
                        hit = in_rounded_square(ux, uy, 1.0, 0.22)
                    else:
                        hit = 0 <= ux <= 1 and 0 <= uy <= 1
                    if not hit:
                        continue
                    colour = shape_color(ux, uy, size)
                    if colour is None:
                        colour = gradient((ux + uy) / 2) + (255,)
                    r_acc += colour[0]; g_acc += colour[1]; b_acc += colour[2]; a_acc += colour[3]
            total = SS * SS
            if a_acc == 0:
                row += bytes((0, 0, 0, 0))
            else:
                cover = a_acc // 255
                row += bytes((r_acc // cover if cover else 0,
                              g_acc // cover if cover else 0,
                              b_acc // cover if cover else 0,
                              min(255, int(a_acc / total * 1.0)) if cover else 0))
        rows.append(bytes(row))
    return rows


def write_png(path: Path, size: int, rows):
    raw = b"".join(b"\x00" + r for r in rows)

    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    png = (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) +
           chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b""))
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(png)
    return len(png)


def main():
    densities = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192, "anydpi": 0}
    total = 0
    written = []
    for name, size in densities.items():
        if size == 0:
            continue
        square = render(size, round_icon=False)
        circle = render(size, round_icon=True)
        p1 = RES / f"mipmap-{name}" / "ic_launcher.png"
        p2 = RES / f"mipmap-{name}" / "ic_launcher_round.png"
        total += write_png(p1, size, square)
        total += write_png(p2, size, circle)
        written += [p1.name, p2.name]

    # web / README icons
    for size, name in ((192, "icon-192.png"), (512, "icon-512.png")):
        p = WEB / "img" / name
        total += write_png(p, size, render(size, round_icon=False))
        written.append(name)

    print(f"✔ wrote {len(written)} icons ({total / 1024:.1f} KB) into res/mipmap-* and www/img/")


if __name__ == "__main__":
    main()
