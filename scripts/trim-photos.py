#!/usr/bin/env python3
"""Remove uniform white/near-white borders from photos in public/photos."""

from __future__ import annotations

import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Install Pillow: pip install Pillow", file=sys.stderr)
    sys.exit(1)

SKIP = {"face_cut.png", "seq_bg.jpg"}


def is_white(px: tuple[int, ...], tol: int = 12) -> bool:
    return all(c >= 255 - tol for c in px[:3])


def is_near_white(px: tuple[int, ...], min_val: int = 245) -> bool:
    return min(px[:3]) >= min_val


def trim_edges(path: Path) -> bool:
    im = Image.open(path).convert("RGB")
    w, h = im.size
    px = im.load()

    def row_white_ratio(y: int, x0: int, x1: int, fn=is_white) -> float:
        span = x1 - x0 + 1
        return sum(1 for x in range(x0, x1 + 1) if fn(px[x, y])) / span

    def col_white_ratio(x: int, y0: int, y1: int, fn=is_white) -> float:
        span = y1 - y0 + 1
        return sum(1 for y in range(y0, y1 + 1) if fn(px[x, y])) / span

    top, bottom, left, right = 0, h - 1, 0, w - 1

    # Pass 1: uniform white bars (Instagram side margins)
    ratio = 0.985
    while top < h and row_white_ratio(top, 0, w - 1) >= ratio:
        top += 1
    while bottom > top and row_white_ratio(bottom, 0, w - 1) >= ratio:
        bottom -= 1
    while left < w and col_white_ratio(left, top, bottom) >= ratio:
        left += 1
    while right > left and col_white_ratio(right, top, bottom) >= ratio:
        right -= 1

    # Pass 2: thin leftover strips (mixed white + edge compression)
    edge_ratio = 0.55
    while left < right and col_white_ratio(left, top, bottom, is_near_white) >= edge_ratio:
        left += 1
    while right > left and col_white_ratio(right, top, bottom, is_near_white) >= edge_ratio:
        right -= 1
    while top < bottom and row_white_ratio(top, left, right, is_near_white) >= edge_ratio:
        top += 1
    while bottom > top and row_white_ratio(bottom, left, right, is_near_white) >= edge_ratio:
        bottom -= 1

    if left >= right or top >= bottom:
        return False

    cropped = im.crop((left, top, right + 1, bottom + 1))
    if cropped.size == im.size:
        return False

    cropped.save(path, quality=92, optimize=True)
    print(f"{path.name}: {im.size} -> {cropped.size}")
    return True


def main() -> None:
    root = Path(__file__).resolve().parents[1] / "public" / "photos"
    targets = [Path(p) for p in sys.argv[1:]] if len(sys.argv) > 1 else list(root.iterdir())

    for f in sorted(targets):
        if not f.is_file():
            continue
        if f.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
            continue
        if f.name in SKIP:
            continue
        trim_edges(f)


if __name__ == "__main__":
    main()
