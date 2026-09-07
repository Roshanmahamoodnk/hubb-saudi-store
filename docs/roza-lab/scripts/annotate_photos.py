#!/usr/bin/env python3
"""Overlay Project North, camera direction, and feature labels on survey photos.

Annotation method is inspired by HumanSignal/labelImg (class labels + region
callouts on source images) applied to architectural photo documentation rather
than ML training boxes.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "photos" / "current"
DST = ROOT / "photos" / "annotated"

# Coffee / lab palette
INK = (28, 22, 18, 255)
CREAM = (250, 244, 232, 255)
WOOD = (92, 58, 36, 255)
ROAST = (176, 72, 32, 255)
GLASS = (32, 92, 118, 255)
LEAF = (46, 110, 72, 255)
GOLD = (196, 154, 72, 255)
WHITE = (255, 255, 255, 255)


def font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ):
        p = Path(path)
        if p.exists():
            return ImageFont.truetype(str(p), size)
    return ImageFont.load_default()


def rounded_rect(draw: ImageDraw.ImageDraw, box, fill, radius=12):
    draw.rounded_rectangle(box, radius=radius, fill=fill)


def text_box(draw, xy, text, fill, fnt, pad=8, radius=10, anchor="lt"):
    x, y = xy
    bbox = draw.textbbox((0, 0), text, font=fnt)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    if anchor == "lt":
        box = [x, y, x + tw + pad * 2, y + th + pad * 2]
        tx, ty = x + pad, y + pad
    elif anchor == "rt":
        box = [x - tw - pad * 2, y, x, y + th + pad * 2]
        tx, ty = box[0] + pad, y + pad
    elif anchor == "lb":
        box = [x, y - th - pad * 2, x + tw + pad * 2, y]
        tx, ty = x + pad, box[1] + pad
    else:  # rb
        box = [x - tw - pad * 2, y - th - pad * 2, x, y]
        tx, ty = box[0] + pad, box[1] + pad
    rounded_rect(draw, box, fill, radius=10)
    draw.text((tx, ty), text, font=fnt, fill=WHITE)
    return box


def compass(draw, cx, cy, r=52, heading="N"):
    """Draw a compass rose. heading is the direction at the top of the frame."""
    f_s = font(13)
    f_n = font(18)
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=(18, 16, 14, 220), outline=GOLD, width=3)
    inner = r - 10
    draw.ellipse(
        (cx - inner, cy - inner, cx + inner, cy + inner),
        outline=(255, 255, 255, 80),
        width=1,
    )
    # Map: top of photo is the camera looking-direction, so Project North
    # may be up, down, left, or right depending on heading.
    dirs = {"N": 0, "E": 90, "S": 180, "W": 270}
    rot = dirs.get(heading, 0)

    def polar(deg, rad):
        import math

        a = math.radians(deg - 90)  # 0 = up
        return cx + rad * math.cos(a), cy + rad * math.sin(a)

    for label, base in (("N", 0), ("E", 90), ("S", 180), ("W", 270)):
        ang = (base - rot) % 360
        x, y = polar(ang, r - 18)
        col = GOLD if label == "N" else WHITE
        f = f_n if label == "N" else f_s
        draw.text((x, y), label, font=f, fill=col, anchor="mm")
    # north pointer
    nx, ny = polar((0 - rot) % 360, r - 6)
    draw.polygon([(cx, cy), (nx - 4, ny + 4), (nx, ny), (nx + 4, ny + 4)], fill=GOLD)
    draw.text((cx, cy + r + 12), "PROJECT NORTH", font=f_s, fill=GOLD, anchor="mt")


def header_footer(draw, w, h, title, subtitle, footer):
    f_title = font(22)
    f_sub = font(14)
    f_foot = font(13)
    rounded_rect(draw, (16, 16, w - 16, 118), (18, 14, 12, 230), radius=16)
    draw.text((32, 32), title, font=f_title, fill=CREAM)
    draw.text((32, 68), subtitle, font=f_sub, fill=GOLD)
    rounded_rect(draw, (16, h - 92, w - 16, h - 16), (18, 14, 12, 230), radius=16)
    draw.text((32, h - 72), footer, font=f_foot, fill=CREAM)


PHOTOS = [
    {
        "file": "01_corridor_looking_project_north.jpg",
        "title": "P01  ·  Main corridor hub",
        "subtitle": "Camera looking PROJECT NORTH  →  large tree window",
        "footer": "Standing: south of hub, in open tile foyer. Left=W glass office · Right=E door/partitions · Ahead=N sunroom.",
        "heading": "N",
        "labels": [
            ((0.22, 0.42), "W  Glass office\n(exec. desk)", GLASS, "lt"),
            ((0.62, 0.38), "E  Fridge + AC\nutility niche", ROAST, "lt"),
            ((0.72, 0.55), "E  Glass rooms\nalong corridor", WOOD, "lt"),
            ((0.48, 0.28), "N  Tree window\n(Project North)", LEAF, "lt"),
        ],
    },
    {
        "file": "02_corridor_hub_project_north.jpg",
        "title": "P02  ·  Corridor hub (alt angle)",
        "subtitle": "Camera looking PROJECT NORTH  →  tree window / sunroom",
        "footer": "Standing: same hub as P01, slightly east. Confirms glass office west, wood door east, fridge on jutting wall.",
        "heading": "N",
        "labels": [
            ((0.18, 0.40), "W  Glass office door\n→ CEO candidate", GLASS, "lt"),
            ((0.78, 0.36), "E  Dark wood door", WOOD, "rt"),
            ((0.52, 0.36), "Fridge + split AC\n(utility)", ROAST, "lt"),
            ((0.48, 0.22), "N  Daylight / trees", LEAF, "lt"),
        ],
    },
    {
        "file": "03_glass_office_interior.jpg",
        "title": "P03  ·  Glass private office interior",
        "subtitle": "Camera at door looking into room  ·  occupant faces corridor",
        "footer": "Standing: doorway (corridor side). Narrow exterior slit window on far/right. Proposed: CEO — Roshan Mahamood.",
        "heading": "N",
        "labels": [
            ((0.88, 0.42), "Glass door\n(corridor)", GLASS, "rt"),
            ((0.78, 0.22), "Narrow exterior\nwindow + trees", LEAF, "rt"),
            ((0.18, 0.38), "Power / data\nat desk height", GOLD, "lt"),
            ((0.42, 0.55), "Dark wood exec desk\n+ 3 chairs", WOOD, "lt"),
        ],
    },
    {
        "file": "04_narrow_hall_brown_partition.jpg",
        "title": "P04  ·  Narrow secondary hall",
        "subtitle": "Camera looking toward bright glass door (daylight beyond)",
        "footer": "Standing: secondary circulation. Left=solid white · Right=dark wood partition. End=glass door to lit room.",
        "heading": "N",
        "labels": [
            ((0.72, 0.42), "Dark wood\npartition (E)", WOOD, "rt"),
            ((0.18, 0.40), "Solid white wall (W)", GLASS, "lt"),
            ((0.48, 0.22), "Glass door +\nstriped screen beyond", GOLD, "lt"),
            ((0.62, 0.62), "Packed goods\non floor", ROAST, "lt"),
        ],
    },
    {
        "file": "05_qc_rd_lab_from_corridor.jpg",
        "title": "P05  ·  QC / R&D galley from corridor",
        "subtitle": "Camera in corridor looking into partitioned lab",
        "footer": "Standing: corridor outside black-frame glass + wood-slat partition. Window wall at far end (exterior).",
        "heading": "E",
        "labels": [
            ((0.50, 0.18), "Hydraulic closer\non glass door", GOLD, "lt"),
            ((0.22, 0.48), "Desk + microwave\n(dry work)", GLASS, "lt"),
            ((0.70, 0.48), "Red-lid sample jars\n(QC / R&D)", ROAST, "rt"),
            ((0.55, 0.32), "Window + blinds\n(daylight)", LEAF, "lt"),
        ],
    },
    {
        "file": "06_qc_rd_lab_jars_and_sink.jpg",
        "title": "P06  ·  QC lab — jars, sink, wet counter",
        "subtitle": "Camera in corridor looking into same lab (wider)",
        "footer": "Standing: same as P05. Sink at back-right = existing wet point. Proposed: Sangeetha QC + cooking-test adjacency.",
        "heading": "E",
        "labels": [
            ((0.22, 0.50), "Dry desk +\nchair", GLASS, "lt"),
            ((0.72, 0.46), "Sample jar bank\n(red lids)", ROAST, "rt"),
            ((0.70, 0.62), "SINK  ·  wet zone", LEAF, "rt"),
            ((0.48, 0.18), "Wood-slat + glass\npartition language", WOOD, "lt"),
        ],
    },
    {
        "file": "07_glass_office_from_door.jpg",
        "title": "P07  ·  Glass office from doorway",
        "subtitle": "Same room as P03  ·  camera in corridor looking in",
        "footer": "Standing: corridor at glass door. Occupant currently faces entry. Coffee/grain sample bag on desk.",
        "heading": "N",
        "labels": [
            ((0.88, 0.40), "D-handle\nglass door", GLASS, "rt"),
            ((0.78, 0.18), "Slit window\n(exterior)", LEAF, "rt"),
            ((0.16, 0.42), "Outlet strip", GOLD, "lt"),
            ((0.40, 0.52), "Exec desk +\nsample bag", WOOD, "lt"),
        ],
    },
    {
        "file": "08_sunroom_looking_project_north.jpg",
        "title": "P08  ·  Enclosed balcony / sunroom",
        "subtitle": "Camera looking PROJECT NORTH along sunroom  →  tree windows",
        "footer": "Standing: south end of sunroom. Left/W + far/N = black-framed windows. Right/E = solid wall. Wood slat ceiling.",
        "heading": "N",
        "labels": [
            ((0.18, 0.40), "W  Window wall\n(trees)", LEAF, "lt"),
            ((0.82, 0.28), "E  Solid wall\n+ Crompton fan", WOOD, "rt"),
            ((0.48, 0.18), "N  Corner windows\n= Project North landmark", GOLD, "lt"),
            ((0.55, 0.55), "Black task chair\n(currently sparse)", GLASS, "lt"),
        ],
    },
    {
        "file": "09_wood_ceiling_hub_into_hallway.jpg",
        "title": "P09  ·  Wood-ceiling hub → hallway",
        "subtitle": "Camera in sunroom/hub looking through wide opening into corridor",
        "footer": "Standing: wood-slat ceiling room (north prestige zone). Black stone threshold. Hall continues; boxes at far end.",
        "heading": "S",
        "labels": [
            ((0.18, 0.22), "Crompton fan\non hub wall", WOOD, "lt"),
            ((0.48, 0.58), "Black stone\nthreshold", GOLD, "lt"),
            ((0.28, 0.40), "Glass office\npartition", GLASS, "lt"),
            ((0.72, 0.38), "AC + fridge\nin hall", ROAST, "rt"),
        ],
    },
    {
        "file": "10_wood_ceiling_hub_into_hallway_alt.jpg",
        "title": "P10  ·  Hub → hallway (alt)",
        "subtitle": "Same node as P09  ·  confirms glass left, AC/fridge right, boxes beyond",
        "footer": "Standing: wood-ceiling hub. This is the proposed central monitoring location (visible to all circulation).",
        "heading": "S",
        "labels": [
            ((0.16, 0.32), "Light switches", GOLD, "lt"),
            ((0.30, 0.42), "Glass + wood-base\npartition (lab/office)", GLASS, "lt"),
            ((0.78, 0.32), "Split AC", ROAST, "rt"),
            ((0.72, 0.48), "Fridge / tall unit", WOOD, "rt"),
        ],
    },
    {
        "file": "11_sunroom_looking_project_north_alt.jpg",
        "title": "P11  ·  Sunroom looking Project North",
        "subtitle": "Same axis as P08  ·  windows west + north, solid wall east",
        "footer": "Standing: south end of sunroom. Proposed: Nikhil marketing showroom / tasting lounge (daylight + brand warmth).",
        "heading": "N",
        "labels": [
            ((0.16, 0.38), "W  Full window wall", LEAF, "lt"),
            ((0.82, 0.22), "E  Fan + white wall", WOOD, "rt"),
            ((0.55, 0.52), "Long linear room\n~2.2 × 7 m est.", GOLD, "lt"),
            ((0.48, 0.18), "N  Tree canopy", LEAF, "lt"),
        ],
    },
    {
        "file": "12_sunroom_looking_project_south.jpg",
        "title": "P12  ·  Sunroom looking PROJECT SOUTH",
        "subtitle": "Reverse of P08/P11  ·  windows now on RIGHT (west)",
        "footer": "Standing: north end of sunroom looking south. Left/E = interior wall with opening to hub. Confirms N–S sunroom.",
        "heading": "S",
        "labels": [
            ((0.22, 0.28), "E  Interior wall\n+ opening to hub", WOOD, "lt"),
            ((0.78, 0.38), "W  Exterior windows", LEAF, "rt"),
            ((0.48, 0.18), "S  Dead-end wall", GOLD, "lt"),
            ((0.18, 0.18), "Crompton fan", ROAST, "lt"),
        ],
    },
    {
        "file": "13_sunroom_looking_south_with_doorway.jpg",
        "title": "P13  ·  Sunroom south view + hub doorway",
        "subtitle": "Camera looking PROJECT SOUTH  ·  doorway into office is on EAST wall",
        "footer": "Standing: north-ish in sunroom. Dark threshold at opening = same stone strip as P09/P10. Linear dead-end space.",
        "heading": "S",
        "labels": [
            ((0.28, 0.42), "E  Opening to hub\n(black threshold)", GOLD, "lt"),
            ((0.78, 0.36), "W  Window wall\n+ knee wall", LEAF, "rt"),
            ((0.55, 0.18), "S  Far white wall\n(dead end)", WOOD, "lt"),
            ((0.18, 0.18), "Fan (Crompton)", ROAST, "lt"),
        ],
    },
]


def annotate(spec: dict) -> None:
    im = Image.open(SRC / spec["file"]).convert("RGBA")
    w, h = im.size
    overlay = Image.new("RGBA", im.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    header_footer(draw, w, h, spec["title"], spec["subtitle"], spec["footer"])
    compass(draw, w - 78, 200, r=48, heading=spec["heading"])
    f_lab = font(13)
    for (fx, fy), text, color, anchor in spec["labels"]:
        text_box(draw, (int(fx * w), int(fy * h)), text, color, f_lab, pad=7, anchor=anchor)
    # looking-direction arrow near compass
    f_s = font(12)
    draw.text((w - 78, 268), f"frame-up = {spec['heading']}", font=f_s, fill=CREAM, anchor="mt")
    out = Image.alpha_composite(im, overlay).convert("RGB")
    dest = DST / spec["file"].replace(".jpg", "_annotated.jpg")
    out.save(dest, quality=90, optimize=True)
    print("wrote", dest.name)


def main() -> None:
    DST.mkdir(parents=True, exist_ok=True)
    for spec in PHOTOS:
        annotate(spec)


if __name__ == "__main__":
    main()
