#!/usr/bin/env python3
"""Directional annotation overlay for Roza Lab current-state photos.

North assumption (applied to every frame):
    Window wall with tree canopy = North.

Camera-facing is inferred from that assumption plus corridor / gallery axis.
Overlays follow CVAT-style zone inventory (labels + leaders) plus a
rotating compass rose so N/E/S/W stay geographically consistent.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageStat

ROOT = Path(__file__).resolve().parents[1]
CURRENT = ROOT / "images" / "current"
ANNOTATED = ROOT / "images" / "annotated"
DIAGRAMS = ROOT / "images" / "diagrams"

FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

# Roza Lab palette
ESPRESSO = (42, 28, 20)
WALNUT = (107, 68, 35)
CREAM = (245, 240, 230)
BRASS = (196, 165, 116)
INK = (18, 16, 14)
WHITE = (255, 255, 255)
NORTH_RED = (176, 48, 36)
FOREST = (47, 79, 62)
GLASS_BLUE = (36, 92, 120)
LABEL_BG = (18, 16, 14, 210)


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_B if bold else FONT, size)


def frac(img: Image.Image, x: float, y: float) -> tuple[int, int]:
    return int(x * img.width), int(y * img.height)


def rounded_rect(draw: ImageDraw.ImageDraw, box, fill, radius=8, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def text_size(draw: ImageDraw.ImageDraw, text: str, fnt) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=fnt)
    return box[2] - box[0], box[3] - box[1]


def draw_label(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    fnt,
    fill=WHITE,
    bg=LABEL_BG,
    pad=6,
    accent=BRASS,
):
    tw, th = text_size(draw, text, fnt)
    x, y = xy
    box = (x, y, x + tw + pad * 2, y + th + pad * 2)
    rounded_rect(draw, box, bg, radius=7)
    draw.rectangle((x, y, x + 4, y + th + pad * 2), fill=accent)
    draw.text((x + pad + 2, y + pad - 1), text, font=fnt, fill=fill)
    return box


def draw_arrow(draw, start, end, color=BRASS, width=4, head=14):
    draw.line([start, end], fill=color, width=width)
    ang = math.atan2(end[1] - start[1], end[0] - start[0])
    left = (
        end[0] - head * math.cos(ang - math.pi / 6),
        end[1] - head * math.sin(ang - math.pi / 6),
    )
    right = (
        end[0] - head * math.cos(ang + math.pi / 6),
        end[1] - head * math.sin(ang + math.pi / 6),
    )
    draw.polygon([end, left, right], fill=color)


def draw_compass(draw, cx, cy, radius, north_deg):
    """north_deg: screen direction of geographic North, 0 = up, 90 = right."""
    draw.ellipse(
        (cx - radius, cy - radius, cx + radius, cy + radius),
        fill=(18, 16, 14, 230),
        outline=BRASS,
        width=3,
    )
    inner = radius * 0.78
    draw.ellipse(
        (cx - inner, cy - inner, cx + inner, cy + inner),
        outline=(196, 165, 116, 80),
        width=1,
    )
    labels = [("N", 0, NORTH_RED, True), ("E", 90, WHITE, False), ("S", 180, WHITE, False), ("W", 270, WHITE, False)]
    fnt = font(max(11, int(radius * 0.28)), bold=True)
    for name, geo, color, needle in labels:
        screen = math.radians(north_deg + geo - 90)
        # convert: 0 up → math angle with y-down: screen_deg 0 is up
        rad = math.radians(north_deg + geo - 90)
        # standard: 0° = east in math. We want 0° north_deg = up.
        ang = math.radians(north_deg + geo - 90)
        px = cx + int((radius * 0.52) * math.cos(ang))
        py = cy + int((radius * 0.52) * math.sin(ang))
        if needle and name == "N":
            tip_ang = math.radians(north_deg - 90)
            tip = (
                cx + int((radius * 0.70) * math.cos(tip_ang)),
                cy + int((radius * 0.70) * math.sin(tip_ang)),
            )
            base_l = (
                cx + int((radius * 0.22) * math.cos(tip_ang + 2.3)),
                cy + int((radius * 0.22) * math.sin(tip_ang + 2.3)),
            )
            base_r = (
                cx + int((radius * 0.22) * math.cos(tip_ang - 2.3)),
                cy + int((radius * 0.22) * math.sin(tip_ang - 2.3)),
            )
            draw.polygon([tip, base_l, (cx, cy), base_r], fill=NORTH_RED)
            south_ang = tip_ang + math.pi
            s_tip = (
                cx + int((radius * 0.55) * math.cos(south_ang)),
                cy + int((radius * 0.55) * math.sin(south_ang)),
            )
            draw.polygon([s_tip, base_l, (cx, cy), base_r], fill=CREAM)
        lx = cx + int((radius * 0.88) * math.cos(ang))
        ly = cy + int((radius * 0.88) * math.sin(ang))
        tw, th = text_size(draw, name, fnt)
        draw.text((lx - tw / 2, ly - th / 2), name, font=fnt, fill=color)
    draw.ellipse((cx - 5, cy - 5, cx + 5, cy + 5), fill=BRASS)


def brightness_window_hint(img: Image.Image) -> dict:
    """Heuristic: brightest third of the frame often contains a window."""
    gray = img.convert("L").resize((36, 64))
    pixels = list(gray.get_flattened_data()) if hasattr(gray, "get_flattened_data") else list(gray.getdata())
    w, h = gray.size
    bands = {
        "top": pixels[: w * (h // 3)],
        "middle": pixels[w * (h // 3) : w * (2 * h // 3)],
        "bottom": pixels[w * (2 * h // 3) :],
    }
    cols = {
        "left": [pixels[y * w + x] for y in range(h) for x in range(w // 3)],
        "center": [pixels[y * w + x] for y in range(h) for x in range(w // 3, 2 * w // 3)],
        "right": [pixels[y * w + x] for y in range(h) for x in range(2 * w // 3, w)],
    }

    def mean(vals):
        return round(sum(vals) / max(1, len(vals)), 1)

    return {
        "global": round(sum(pixels) / len(pixels), 1),
        "bands": {k: mean(v) for k, v in bands.items()},
        "columns": {k: mean(v) for k, v in cols.items()},
        "brightest_band": max(bands, key=lambda k: mean(bands[k])),
        "brightest_column": max(cols, key=lambda k: mean(cols[k])),
    }


# north_deg: where geographic North points on the photo (0 = toward top)
PHOTOS = [
    {
        "file": "01-corridor-facing-north.jpg",
        "id": "P01",
        "title": "Main corridor — facing North",
        "camera": "N",
        "north_deg": 0,
        "zone": "Central corridor (spine)",
        "labels": [
            {"xy": (0.06, 0.30), "text": "W · Glass office cabin", "accent": GLASS_BLUE},
            {"xy": (0.50, 0.38), "text": "E · Fridge + split AC", "accent": WALNUT},
            {"xy": (0.48, 0.52), "text": "E · Glass partitions", "accent": GLASS_BLUE},
            {"xy": (0.28, 0.18), "text": "N · Window wall / trees", "accent": NORTH_RED},
            {"xy": (0.22, 0.62), "text": "CORRIDOR  (circulation spine)", "accent": BRASS},
        ],
        "arrows": [
            {"start": (0.50, 0.28), "end": (0.50, 0.14), "text": "to window wall (N)"},
            {"start": (0.22, 0.42), "end": (0.10, 0.36), "text": "to glass office (W)"},
            {"start": (0.70, 0.70), "end": (0.88, 0.58), "text": "to inner cabins (E)"},
        ],
    },
    {
        "file": "02-corridor-open-plan.jpg",
        "id": "P02",
        "title": "Corridor / open plan — facing North",
        "camera": "N",
        "north_deg": 0,
        "zone": "Corridor looking into glass office",
        "labels": [
            {"xy": (0.05, 0.32), "text": "W · Glass office (in use)", "accent": GLASS_BLUE},
            {"xy": (0.52, 0.40), "text": "E · Refrigerator", "accent": WALNUT},
            {"xy": (0.52, 0.28), "text": "E · Split AC", "accent": WALNUT},
            {"xy": (0.30, 0.16), "text": "N · Exterior window + trees", "accent": NORTH_RED},
            {"xy": (0.55, 0.62), "text": "E · Dark door / partition", "accent": ESPRESSO},
        ],
        "arrows": [
            {"start": (0.50, 0.26), "end": (0.50, 0.12), "text": "to window wall (N)"},
            {"start": (0.28, 0.48), "end": (0.14, 0.40), "text": "into glass office"},
        ],
    },
    {
        "file": "03-glass-cabin-executive-desk.jpg",
        "id": "P03",
        "title": "Compact glass cabin — facing North",
        "camera": "N",
        "north_deg": 0,
        "zone": "Glass-door cabin (current cramped office)",
        "labels": [
            {"xy": (0.18, 0.22), "text": "N · Narrow window / trees", "accent": NORTH_RED},
            {"xy": (0.08, 0.48), "text": "Dark executive desk", "accent": ESPRESSO},
            {"xy": (0.08, 0.70), "text": "3 chairs — cramped", "accent": WALNUT},
            {"xy": (0.52, 0.55), "text": "E · Glass door + handle", "accent": GLASS_BLUE},
            {"xy": (0.08, 0.36), "text": "Power / data spine", "accent": BRASS},
        ],
        "arrows": [
            {"start": (0.45, 0.32), "end": (0.55, 0.20), "text": "to exterior (N)"},
            {"start": (0.72, 0.72), "end": (0.88, 0.62), "text": "to corridor (E)"},
        ],
    },
    {
        "file": "04-corridor-dark-partition.jpg",
        "id": "P04",
        "title": "Inner corridor — facing North toward striped glass",
        "camera": "N",
        "north_deg": 0,
        "zone": "Transition corridor",
        "labels": [
            {"xy": (0.06, 0.38), "text": "W · White plaster wall", "accent": CREAM},
            {"xy": (0.48, 0.32), "text": "E · Dark brown partition", "accent": ESPRESSO},
            {"xy": (0.22, 0.18), "text": "N · Striped glass + daylight", "accent": NORTH_RED},
            {"xy": (0.18, 0.58), "text": "Glossy cream tile spine", "accent": BRASS},
        ],
        "arrows": [
            {"start": (0.50, 0.28), "end": (0.50, 0.14), "text": "to window / entry light (N)"},
            {"start": (0.62, 0.48), "end": (0.78, 0.40), "text": "partition / cabin edge"},
        ],
    },
    {
        "file": "05-lab-cabin-from-corridor.jpg",
        "id": "P05",
        "title": "Lab cabin — facing North into testing room",
        "camera": "N",
        "north_deg": 0,
        "zone": "Roastery / QC lab cabin",
        "labels": [
            {"xy": (0.08, 0.22), "text": "Wood-slat + glass partition", "accent": WALNUT},
            {"xy": (0.48, 0.36), "text": "E · Red-lid sample jars", "accent": NORTH_RED},
            {"xy": (0.08, 0.40), "text": "W · Microwave + workstation", "accent": GLASS_BLUE},
            {"xy": (0.28, 0.18), "text": "N · Window + vertical blinds", "accent": NORTH_RED},
            {"xy": (0.18, 0.58), "text": "LAB CABIN  (R&D / cooking test)", "accent": FOREST},
        ],
        "arrows": [
            {"start": (0.50, 0.30), "end": (0.50, 0.16), "text": "to lab window (N)"},
            {"start": (0.50, 0.78), "end": (0.50, 0.90), "text": "back to corridor (S)"},
        ],
    },
    {
        "file": "06-lab-cabin-sample-jars.jpg",
        "id": "P06",
        "title": "Lab cabin from hallway — facing North",
        "camera": "N",
        "north_deg": 0,
        "zone": "Lab cabin (sample storage)",
        "labels": [
            {"xy": (0.06, 0.24), "text": "Black frame + walnut slats", "accent": ESPRESSO},
            {"xy": (0.50, 0.40), "text": "Sample jars (QC library)", "accent": NORTH_RED},
            {"xy": (0.08, 0.42), "text": "Prep counter + microwave", "accent": WALNUT},
            {"xy": (0.22, 0.16), "text": "N · Daylight / blinds", "accent": NORTH_RED},
            {"xy": (0.08, 0.62), "text": "Keep aroma isolated from offices", "accent": FOREST},
        ],
        "arrows": [
            {"start": (0.50, 0.28), "end": (0.50, 0.14), "text": "to lab window (N)"},
            {"start": (0.22, 0.78), "end": (0.10, 0.88), "text": "to corridor"},
        ],
    },
    {
        "file": "07-compact-cabin-three-chairs.jpg",
        "id": "P07",
        "title": "Compact cabin (repeat view) — facing North",
        "camera": "N",
        "north_deg": 0,
        "zone": "Glass cabin — CEO candidate is too cramped",
        "labels": [
            {"xy": (0.18, 0.18), "text": "N · Slot window + trees", "accent": NORTH_RED},
            {"xy": (0.08, 0.46), "text": "Oversized desk for room", "accent": ESPRESSO},
            {"xy": (0.08, 0.68), "text": "3 chairs — no circulation", "accent": WALNUT},
            {"xy": (0.50, 0.58), "text": "E · Glass entry", "accent": GLASS_BLUE},
        ],
        "arrows": [
            {"start": (0.42, 0.30), "end": (0.52, 0.18), "text": "to north window"},
            {"start": (0.72, 0.72), "end": (0.88, 0.62), "text": "to corridor (E)"},
        ],
    },
    {
        "file": "08-window-gallery-facing-north.jpg",
        "id": "P08",
        "title": "Window gallery — facing North",
        "camera": "N",
        "north_deg": 0,
        "zone": "Long gallery / CEO prestige candidate",
        "labels": [
            {"xy": (0.04, 0.36), "text": "W · Black-framed windows", "accent": GLASS_BLUE},
            {"xy": (0.48, 0.30), "text": "E · White wall + fan", "accent": WALNUT},
            {"xy": (0.22, 0.16), "text": "N · End window + trees", "accent": NORTH_RED},
            {"xy": (0.18, 0.08), "text": "Wood-slat ceiling", "accent": ESPRESSO},
            {"xy": (0.40, 0.70), "text": "CEO CANDIDATE ZONE", "accent": BRASS},
            {"xy": (0.40, 0.88), "text": "Granite threshold → inner suite (E)", "accent": INK},
        ],
        "arrows": [
            {"start": (0.50, 0.26), "end": (0.50, 0.12), "text": "to north window wall"},
            {"start": (0.18, 0.50), "end": (0.06, 0.48), "text": "to west glazing"},
            {"start": (0.70, 0.86), "end": (0.90, 0.86), "text": "to inner suite (E)"},
        ],
    },
    {
        "file": "09-gallery-threshold-to-inner.jpg",
        "id": "P09",
        "title": "Gallery looking East into inner corridor",
        "camera": "E",
        "north_deg": 270,
        "zone": "Threshold — gallery to inner suite",
        "labels": [
            {"xy": (0.08, 0.08), "text": "Gallery · wood-slat ceiling", "accent": ESPRESSO},
            {"xy": (0.08, 0.72), "text": "Black granite threshold", "accent": INK},
            {"xy": (0.38, 0.30), "text": "N (left) · Glass partition", "accent": GLASS_BLUE},
            {"xy": (0.48, 0.22), "text": "S (right) · Split AC", "accent": WALNUT},
            {"xy": (0.36, 0.50), "text": "INNER SUITE / CORRIDOR", "accent": BRASS},
        ],
        "arrows": [
            {"start": (0.50, 0.48), "end": (0.50, 0.32), "text": "into inner corridor (E)"},
            {"start": (0.22, 0.40), "end": (0.08, 0.28), "text": "to gallery / windows (W behind camera)"},
            {"start": (0.38, 0.38), "end": (0.22, 0.32), "text": "to lab / cabins (N)"},
        ],
    },
    {
        "file": "10-threshold-inner-suite.jpg",
        "id": "P10",
        "title": "Threshold node — facing East",
        "camera": "E",
        "north_deg": 270,
        "zone": "Primary circulation node",
        "labels": [
            {"xy": (0.08, 0.10), "text": "OPEN GALLERY (behind / around)", "accent": ESPRESSO},
            {"xy": (0.08, 0.74), "text": "Granite threshold", "accent": INK},
            {"xy": (0.36, 0.28), "text": "N · Glass cabin door", "accent": GLASS_BLUE},
            {"xy": (0.50, 0.20), "text": "S · AC + chair", "accent": WALNUT},
            {"xy": (0.34, 0.52), "text": "to offices / lab spine", "accent": BRASS},
        ],
        "arrows": [
            {"start": (0.50, 0.46), "end": (0.50, 0.30), "text": "deeper into suite (E)"},
            {"start": (0.36, 0.36), "end": (0.20, 0.28), "text": "to cabins (N)"},
            {"start": (0.20, 0.88), "end": (0.08, 0.88), "text": "back to gallery (W)"},
        ],
    },
    {
        "file": "11-gallery-windows-west.jpg",
        "id": "P11",
        "title": "Gallery long axis — facing North",
        "camera": "N",
        "north_deg": 0,
        "zone": "Window gallery (west glazing)",
        "labels": [
            {"xy": (0.04, 0.34), "text": "W · Window wall + trees", "accent": GLASS_BLUE},
            {"xy": (0.48, 0.28), "text": "E · Solid white wall", "accent": WALNUT},
            {"xy": (0.24, 0.14), "text": "N · Far window", "accent": NORTH_RED},
            {"xy": (0.20, 0.08), "text": "Wood-slat ceiling", "accent": ESPRESSO},
            {"xy": (0.36, 0.62), "text": "MARKETING / CEO linear zone", "accent": BRASS},
        ],
        "arrows": [
            {"start": (0.50, 0.24), "end": (0.50, 0.12), "text": "to north window"},
            {"start": (0.20, 0.48), "end": (0.06, 0.46), "text": "to west trees"},
            {"start": (0.72, 0.86), "end": (0.90, 0.86), "text": "to inner suite (E)"},
        ],
    },
    {
        "file": "12-gallery-facing-south.jpg",
        "id": "P12",
        "title": "Gallery reverse view — facing South",
        "camera": "S",
        "north_deg": 180,
        "zone": "Gallery looking to south end wall",
        "labels": [
            {"xy": (0.48, 0.32), "text": "W (right) · Window wall", "accent": GLASS_BLUE},
            {"xy": (0.06, 0.36), "text": "E (left) · Door to inner suite", "accent": BRASS},
            {"xy": (0.22, 0.16), "text": "S · Solid back wall", "accent": WALNUT},
            {"xy": (0.06, 0.22), "text": "Wall fan (Crompton)", "accent": INK},
            {"xy": (0.06, 0.70), "text": "Granite threshold (E)", "accent": INK},
        ],
        "arrows": [
            {"start": (0.28, 0.48), "end": (0.18, 0.42), "text": "to inner suite (E)"},
            {"start": (0.70, 0.48), "end": (0.88, 0.42), "text": "to west windows"},
            {"start": (0.50, 0.88), "end": (0.50, 0.96), "text": "North is behind camera"},
        ],
    },
    {
        "file": "13-gallery-empty-south-end.jpg",
        "id": "P13",
        "title": "Empty gallery — facing South",
        "camera": "S",
        "north_deg": 180,
        "zone": "Gallery (vacant — fit-out ready)",
        "labels": [
            {"xy": (0.48, 0.34), "text": "W (right) · Windows / trees", "accent": GLASS_BLUE},
            {"xy": (0.06, 0.38), "text": "E (left) · Doorway + threshold", "accent": BRASS},
            {"xy": (0.24, 0.16), "text": "S · End wall", "accent": WALNUT},
            {"xy": (0.18, 0.08), "text": "Wood-slat ceiling", "accent": ESPRESSO},
            {"xy": (0.18, 0.62), "text": "VACANT — marketing linear desks", "accent": FOREST},
        ],
        "arrows": [
            {"start": (0.30, 0.50), "end": (0.18, 0.44), "text": "to inner suite (E)"},
            {"start": (0.70, 0.50), "end": (0.88, 0.44), "text": "to west glazing"},
            {"start": (0.50, 0.88), "end": (0.50, 0.96), "text": "to north window (behind)"},
        ],
    },
]


def annotate_one(spec: dict) -> dict:
    src = CURRENT / spec["file"]
    img = Image.open(src).convert("RGBA")
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    w, h = img.size

    # Top banner
    banner_h = int(h * 0.11)
    draw.rectangle((0, 0, w, banner_h), fill=(18, 16, 14, 215))
    draw.rectangle((0, banner_h - 4, w, banner_h), fill=BRASS + (255,))
    title_f = font(max(15, w // 28), bold=True)
    sub_f = font(max(12, w // 36))
    tiny_f = font(max(11, w // 40))
    draw.text((14, 10), f"ROZA LAB  ·  {spec['id']}", font=tiny_f, fill=BRASS)
    draw.text((14, 28), spec["title"], font=title_f, fill=WHITE)
    draw.text(
        (14, 52),
        f"Camera facing {spec['camera']}   ·   Window wall with trees = North   ·   {spec['zone']}",
        font=sub_f,
        fill=CREAM,
    )

    # Footer
    foot_h = int(h * 0.07)
    draw.rectangle((0, h - foot_h, w, h), fill=(18, 16, 14, 215))
    draw.rectangle((0, h - foot_h, w, h - foot_h + 3), fill=BRASS + (255,))
    draw.text(
        (14, h - foot_h + 10),
        "Geographic N/E/S/W  ·  photo-estimated  ·  not a measured survey",
        font=tiny_f,
        fill=CREAM,
    )

    # Labels
    label_f = font(max(13, w // 34), bold=True)
    for lab in spec["labels"]:
        draw_label(draw, frac(img, *lab["xy"]), lab["text"], label_f, accent=lab.get("accent", BRASS))

    # Arrows + captions
    cap_f = font(max(12, w // 38), bold=True)
    for ar in spec["arrows"]:
        s = frac(img, *ar["start"])
        e = frac(img, *ar["end"])
        draw_arrow(draw, s, e, color=BRASS, width=4)
        # caption near midpoint, offset
        mx, my = (s[0] + e[0]) // 2, (s[1] + e[1]) // 2
        draw_label(draw, (mx + 8, my - 18), ar["text"], cap_f, accent=NORTH_RED)

    # Compass
    cx, cy = int(w * 0.16), int(h * 0.82)
    radius = int(min(w, h) * 0.11)
    draw_compass(draw, cx, cy, radius, spec["north_deg"])
    cam_f = font(max(11, w // 42), bold=True)
    draw_label(
        draw,
        (int(w * 0.04), int(h * 0.68)),
        f"COMPASS  ·  camera → {spec['camera']}",
        cam_f,
        accent=NORTH_RED,
    )

    out = Image.alpha_composite(img, overlay).convert("RGB")
    dest = ANNOTATED / spec["file"].replace(".jpg", "-annotated.jpg")
    out.save(dest, quality=90, optimize=True)

    hint = brightness_window_hint(Image.open(src))
    return {
        "id": spec["id"],
        "file": spec["file"],
        "annotated": dest.name,
        "camera": spec["camera"],
        "zone": spec["zone"],
        "brightness": hint,
        "size": [w, h],
    }


def main():
    ANNOTATED.mkdir(parents=True, exist_ok=True)
    DIAGRAMS.mkdir(parents=True, exist_ok=True)
    report = [annotate_one(spec) for spec in PHOTOS]
    path = DIAGRAMS / "photo-brightness-survey.json"
    path.write_text(json.dumps(report, indent=2))
    print(f"Annotated {len(report)} photos → {ANNOTATED}")
    print(f"Wrote {path}")
    for row in report:
        b = row["brightness"]
        print(
            f"  {row['id']} cam={row['camera']:1}  lum={b['global']:5.1f}  "
            f"band={b['brightest_band']:6}  col={b['brightest_column']:6}  {row['file']}"
        )


if __name__ == "__main__":
    main()
