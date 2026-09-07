#!/usr/bin/env python3
"""Draw measured-estimate floor plans, zoning, furniture, and monitoring diagrams.

Methodology (applied conceptually, not by running the ML models):
- RoomFormer: reconstruct the plate as room polygons + corners + openings.
- FloorplanTransformation: walls / doors / icons / room types as a vector layer.
- Structured3D: daylight, window walls, and semantic room types from photos.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parents[1] / "plans"

BG = (246, 240, 230)
INK = (32, 24, 18)
MUTED = (110, 96, 82)
GOLD = (176, 132, 58)
WOOD = (92, 56, 34)
CREAM = (255, 250, 240)
WHITE = (255, 255, 255)
GLASS = (70, 130, 150)
WET = (196, 92, 48)
LEAF = (56, 118, 78)
MONITOR = (48, 72, 96)
NIKHIL = (156, 92, 48)
SANGEETHA = (72, 124, 96)
ROSHAN = (88, 64, 120)
HALL = (232, 224, 210)


def font(size: int):
    for path in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ):
        p = Path(path)
        if p.exists():
            return ImageFont.truetype(str(p), size)
    return ImageFont.load_default()


def rounded(draw, box, fill, outline=None, width=1, r=12):
    draw.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


def wrap(text: str, width: int = 28) -> str:
    words = text.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if len(trial) > width:
            if cur:
                lines.append(cur)
            cur = w
        else:
            cur = trial
    if cur:
        lines.append(cur)
    return "\n".join(lines)


def title_block(draw, w, title, subtitle):
    draw.rectangle((0, 0, w, 92), fill=INK)
    draw.text((36, 22), title, font=font(28), fill=CREAM)
    draw.text((36, 58), subtitle, font=font(15), fill=GOLD)


def compass_rose(draw, cx, cy, r=54):
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=INK, outline=GOLD, width=3)
    draw.text((cx, cy - r + 16), "N", font=font(20), fill=GOLD, anchor="mm")
    draw.text((cx, cy + r - 16), "S", font=font(14), fill=WHITE, anchor="mm")
    draw.text((cx - r + 16, cy), "W", font=font(14), fill=WHITE, anchor="mm")
    draw.text((cx + r - 16, cy), "E", font=font(14), fill=WHITE, anchor="mm")
    draw.polygon([(cx, cy - r + 28), (cx - 7, cy - 4), (cx + 7, cy - 4)], fill=GOLD)
    draw.text((cx, cy + r + 14), "PROJECT NORTH", font=font(11), fill=GOLD, anchor="mt")


def scale_bar(draw, x, y, px_per_m=28):
    draw.text((x, y - 18), "SCALE  (estimated)", font=font(11), fill=MUTED)
    for i, label in enumerate(("0", "1 m", "2 m", "3 m", "4 m", "5 m")):
        x0 = x + i * px_per_m
        fill = INK if i % 2 == 0 else CREAM
        if i < 5:
            draw.rectangle((x0, y, x0 + px_per_m, y + 10), fill=fill, outline=INK)
        draw.text((x0, y + 16), label, font=font(10), fill=INK, anchor="mt")


# ---------------------------------------------------------------------------
# Geometry in pixels. Origin top-left. Project North = up.
# 28 px = 1 m. Plate roughly 11.5 m E–W × 14.5 m N–S (ESTIMATED).
# ---------------------------------------------------------------------------
PPM = 28


def m(x, y):
    """metres from origin (west, south) → pixel (with top = north)."""
    ox, oy = 70, 130
    height_m = 14.6
    return int(ox + x * PPM), int(oy + (height_m - y) * PPM)


def box(x0, y0, x1, y1):
    """Axis-aligned rectangle in metres, north-up safe for PIL."""
    ax, ay = m(x0, y0)
    bx, by = m(x1, y1)
    return [min(ax, bx), min(ay, by), max(ax, bx), max(ay, by)]


def draw_building_shell(draw):
    """Shared existing-condition shell reconstructed from overlapping photos."""
    # Outer envelope
    pts = [
        m(0.0, 0.0),
        m(11.4, 0.0),
        m(11.4, 8.4),
        m(8.6, 8.4),
        m(8.6, 14.5),
        m(0.0, 14.5),
    ]
    draw.polygon(pts, fill=HALL, outline=INK)
    # Sunroom (N, west side) 0–2.4 x 8.4–14.5
    draw.rectangle(box(0.0, 8.4, 2.6, 14.5), fill=(235, 226, 210), outline=WOOD, width=3)
    # Wood-ceiling hub 2.6–8.6 x 8.4–11.2
    draw.rectangle(box(2.6, 8.4, 8.6, 11.2), fill=(228, 216, 196), outline=WOOD, width=3)
    # Main corridor 3.4–5.6 x 1.2–8.4
    draw.rectangle(box(3.4, 1.2, 5.8, 8.4), fill=(240, 234, 222), outline=INK, width=2)
    # Glass CEO office west 0.3–3.4 x 4.6–8.2
    draw.rectangle(box(0.25, 4.6, 3.4, 8.2), fill=(214, 226, 230), outline=GLASS, width=3)
    # QC / R&D east 5.8–11.1 x 4.2–8.2
    draw.rectangle(box(5.8, 4.2, 11.15, 8.2), fill=(222, 230, 222), outline=LEAF, width=3)
    # South storage / future wet 5.8–11.15 x 1.0–4.2
    draw.rectangle(box(5.8, 1.0, 11.15, 4.2), fill=(236, 224, 214), outline=WET, width=3)
    # West south room (unphotographed / possible entry)
    draw.rectangle(box(0.25, 1.0, 3.4, 4.4), fill=(232, 228, 220), outline=MUTED, width=2)
    # Windows: sunroom west + north
    for y0, y1 in ((8.6, 10.2), (10.4, 12.0), (12.2, 13.8)):
        draw.rectangle(box(0.05, y0, 0.22, y1), fill=(160, 200, 210), outline=INK, width=2)
    draw.rectangle(box(0.15, 14.28, 2.45, 14.48), fill=(160, 200, 210), outline=INK, width=2)
    # QC east windows
    draw.rectangle(box(10.95, 5.2, 11.15, 7.6), fill=(160, 200, 210), outline=INK, width=2)
    # CEO slit window northish
    draw.rectangle(box(1.4, 8.05, 1.7, 8.2), fill=(160, 200, 210), outline=INK, width=2)
    # Openings
    # sunroom → hub
    draw.rectangle(box(2.55, 9.2, 2.7, 10.6), fill=GOLD)
    # hub → corridor
    draw.rectangle(box(4.0, 8.25, 5.4, 8.45), fill=GOLD)
    # CEO door
    draw.rectangle(box(3.25, 6.0, 3.45, 7.0), fill=GLASS)
    # QC door
    draw.rectangle(box(5.7, 5.6, 5.9, 6.7), fill=LEAF)
    # wood door to south storage
    draw.rectangle(box(5.7, 2.4, 5.9, 3.3), fill=WOOD)


def legend(draw, items, x, y):
    draw.text((x, y), "LEGEND", font=font(13), fill=INK)
    yy = y + 22
    for color, label in items:
        draw.rounded_rectangle((x, yy, x + 22, yy + 16), radius=4, fill=color, outline=INK)
        draw.text((x + 30, yy + 8), label, font=font(12), fill=INK, anchor="lm")
        yy += 24


def draw_existing():
    w, h = 1400, 980
    im = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(im)
    title_block(
        d,
        w,
        "ROZA LAB  ·  EXISTING FLOOR PLATE  (reconstructed)",
        "Project North = toward the large tree window  ·  dimensions estimated from tile grid, door leaves, chairs  ·  not a measured survey",
    )
    draw_building_shell(d)
    # labels
    d.text(m(1.3, 11.6), "SUNROOM /\nENCLOSED\nBALCONY", font=font(13), fill=WOOD, anchor="mm")
    d.text(m(5.6, 9.8), "WOOD-CEILING HUB", font=font(13), fill=WOOD, anchor="mm")
    d.text(m(1.8, 6.4), "GLASS OFFICE\n(exec desk)", font=font(12), fill=GLASS, anchor="mm")
    d.text(m(8.4, 6.3), "QC / R&D GALLEY\njars · microwave · sink", font=font(12), fill=LEAF, anchor="mm")
    d.text(m(8.4, 2.6), "STORAGE / BOXES\n(wood door)", font=font(12), fill=WET, anchor="mm")
    d.text(m(4.6, 4.6), "CORRIDOR", font=font(11), fill=MUTED, anchor="mm")
    d.text(m(1.8, 2.7), "UNVERIFIED\n(off-camera)", font=font(11), fill=MUTED, anchor="mm")
    d.text(m(4.8, 7.4), "fridge\n+ AC", font=font(10), fill=WET, anchor="mm")
    # camera ticks
    cams = [
        (m(4.6, 8.0), "P01 P02"),
        (m(1.9, 5.2), "P03 P07"),
        (m(5.5, 6.1), "P05 P06"),
        (m(1.3, 8.8), "P08 P11"),
        (m(3.2, 9.8), "P09 P10"),
        (m(1.3, 13.6), "P12 P13"),
    ]
    for (x, y), lab in cams:
        d.ellipse((x - 7, y - 7, x + 7, y + 7), fill=ROSHAN, outline=WHITE)
        d.text((x + 10, y), lab, font=font(10), fill=ROSHAN, anchor="lm")
    compass_rose(d, 1280, 200)
    scale_bar(d, 70, 900)
    legend(
        d,
        [
            ((214, 226, 230), "Glass-partition office"),
            ((222, 230, 222), "Existing QC / sample lab"),
            ((235, 226, 210), "Sunroom (wood ceiling)"),
            ((236, 224, 214), "Storage / possible wet"),
            (GOLD, "Documented opening"),
            ((160, 200, 210), "Window (daylight)"),
        ],
        1120,
        320,
    )
    d.text(
        (70, 940),
        "Uncertainty: fridge wall side varies by viewpoint (jutting return). Photo 04 side-hall not fully located — likely east of QC or a parallel bay. True geographic north unknown.",
        font=font(12),
        fill=MUTED,
    )
    im.save(OUT / "01_existing_floor_plan.png", optimize=True)


def draw_zoning():
    w, h = 1400, 980
    im = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(im)
    title_block(
        d,
        w,
        "ROZA LAB  ·  PROPOSED ZONING  +  ADJACENCY",
        "Wet/dry split  ·  privacy gradient  ·  daylight  ·  monitoring sightline on the circulation spine",
    )
    draw_building_shell(d)
    # overlay proposed colors
    d.rectangle(box(0.05, 8.45, 2.55, 14.45), fill=NIKHIL, outline=INK, width=2)
    d.rectangle(box(2.65, 8.45, 8.55, 11.15), fill=(72, 96, 118), outline=INK, width=2)
    d.rectangle(box(0.3, 4.65, 3.35, 8.15), fill=ROSHAN, outline=INK, width=2)
    d.rectangle(box(5.85, 4.25, 11.1, 8.15), fill=SANGEETHA, outline=INK, width=2)
    d.rectangle(box(5.85, 1.05, 11.1, 4.15), fill=WET, outline=INK, width=2)
    d.rectangle(box(0.3, 1.05, 3.35, 4.35), fill=(120, 110, 96), outline=INK, width=2)
    # text on overlays (white)
    d.text(m(1.3, 11.5), "NIKHIL\nMarketing Head\nshowroom + desk", font=font(13), fill=WHITE, anchor="mm")
    d.text(m(5.6, 9.8), "CENTRAL MONITORING\ncommand wall + ops", font=font(13), fill=WHITE, anchor="mm")
    d.text(m(1.85, 6.4), "ROSHAN\nCEO office\n(frost + visual control)", font=font(12), fill=WHITE, anchor="mm")
    d.text(m(8.45, 6.3), "SANGEETHA\nNutrition / QC / R&D\ndry desk + sample bench", font=font(12), fill=WHITE, anchor="mm")
    d.text(m(8.45, 2.6), "ROASTERY\nCOOKING TEST\nwet · extract · heat", font=font(12), fill=WHITE, anchor="mm")
    d.text(m(1.85, 2.7), "RECEPTION\n/ STORAGE", font=font(12), fill=WHITE, anchor="mm")
    # adjacency arrows
    def arrow(a, b, col=GOLD):
        d.line([a, b], fill=col, width=3)
        d.ellipse((b[0] - 5, b[1] - 5, b[0] + 5, b[1] + 5), fill=col)

    arrow(m(5.6, 8.5), m(5.6, 7.2))
    arrow(m(5.7, 6.2), m(6.4, 6.2))
    arrow(m(8.4, 4.3), m(8.4, 3.6))
    arrow(m(2.6, 9.8), m(3.4, 9.8))
    compass_rose(d, 1280, 200)
    scale_bar(d, 70, 900)
    legend(
        d,
        [
            (NIKHIL, "1  Marketing — Nikhil"),
            ((72, 96, 118), "2  Central monitoring"),
            (ROSHAN, "3  CEO — Roshan Mahamood"),
            (SANGEETHA, "4  QC / R&D — Sangeetha"),
            (WET, "5  Roastery cooking testing"),
            ((120, 110, 96), "6  Reception / store"),
        ],
        1100,
        320,
    )
    d.text(
        (70, 940),
        "Adjacency: Nikhil ↔ monitoring  ·  Sangeetha ↔ cooking test  ·  CEO private but on spine  ·  wet lab downwind/separated from CEO & marketing.",
        font=font(12),
        fill=MUTED,
    )
    im.save(OUT / "02_proposed_zoning.png", optimize=True)


def desk(draw, x0, y0, x1, y1, fill=WOOD):
    draw.rectangle(box(x0, y0, x1, y1), fill=fill, outline=INK, width=2)


def chair(draw, x, y):
    px, py = m(x, y)
    draw.ellipse((px - 8, py - 8, px + 8, py + 8), outline=INK, width=2)


def draw_furniture():
    w, h = 1400, 980
    im = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(im)
    title_block(
        d,
        w,
        "ROZA LAB  ·  PROPOSED FURNITURE  /  FF&E LAYOUT",
        "Reuse existing glass language, dark-wood desks, and black task chairs  ·  add lab benches, extract, and monitoring wall",
    )
    draw_building_shell(d)
    # CEO desk reused
    desk(d, 0.7, 5.4, 2.9, 6.6)
    chair(d, 1.8, 6.85)
    chair(d, 1.2, 5.15)
    chair(d, 2.4, 5.15)
    d.text(m(1.8, 7.5), "Reuse exec desk", font=font(10), fill=ROSHAN, anchor="mm")
    # Monitoring wall on south face of hub (visible from corridor)
    d.rectangle(box(2.8, 8.5, 8.3, 8.85), fill=MONITOR, outline=INK, width=2)
    d.text(m(5.5, 8.68), "  3× TV MONITORING WALL  ", font=font(11), fill=WHITE, anchor="mm")
    # Ops console
    desk(d, 6.4, 9.2, 8.2, 10.6, MONITOR)
    chair(d, 7.3, 9.0)
    d.text(m(7.3, 10.9), "ops desk", font=font(10), fill=WHITE, anchor="mm")
    # Nikhil desk in sunroom facing west windows
    desk(d, 0.5, 12.2, 1.5, 14.0, NIKHIL)
    chair(d, 1.75, 13.1)
    d.text(m(1.0, 11.6), "Nikhil desk", font=font(10), fill=NIKHIL, anchor="mm")
    # Lounge / tasting
    d.ellipse(box(0.6, 9.2, 2.2, 10.6), outline=NIKHIL, width=2)
    d.text(m(1.4, 9.9), "tasting\nlounge", font=font(10), fill=NIKHIL, anchor="mm")
    # Sangeetha dry desk (left of lab)
    desk(d, 6.1, 6.6, 8.0, 7.9, SANGEETHA)
    chair(d, 7.0, 6.35)
    d.text(m(7.0, 7.2), "Sangeetha", font=font(10), fill=WHITE, anchor="mm")
    # Sample jar run
    desk(d, 8.2, 4.5, 10.9, 5.3, (180, 70, 50))
    d.text(m(9.5, 4.9), "sample jars", font=font(10), fill=WHITE, anchor="mm")
    # Cooking test
    desk(d, 6.2, 1.3, 10.9, 2.2, WET)
    d.text(m(8.5, 1.75), "cook / roast bench + sink + extract", font=font(10), fill=WHITE, anchor="mm")
    d.rectangle(box(10.3, 2.3, 10.9, 3.5), fill=(60, 60, 60), outline=INK)
    d.text(m(10.6, 3.7), "hood", font=font(10), fill=INK, anchor="mm")
    # Pantry fridge relocated
    d.rectangle(box(5.95, 3.4, 6.55, 4.05), fill=(160, 160, 170), outline=INK)
    d.text(m(6.25, 3.2), "fridge", font=font(9), fill=INK, anchor="mm")
    # Reception
    desk(d, 0.5, 2.0, 2.2, 2.8, (120, 110, 96))
    chair(d, 1.3, 3.05)
    compass_rose(d, 1280, 200)
    scale_bar(d, 70, 900)
    legend(
        d,
        [
            (WOOD, "Reuse dark-wood desk"),
            (MONITOR, "Monitoring / AV"),
            (SANGEETHA, "QC dry workstation"),
            (WET, "Wet cook/roast bench"),
            ((180, 70, 50), "Sample storage"),
            (NIKHIL, "Marketing furniture"),
        ],
        1100,
        320,
    )
    im.save(OUT / "03_furniture_layout.png", optimize=True)


def draw_monitoring():
    w, h = 1400, 820
    im = Image.new("RGB", (w, h), (24, 20, 18))
    d = ImageDraw.Draw(im)
    d.text((40, 28), "CENTRAL MONITORING  ·  COMMAND WALL CONCEPT", font=font(26), fill=CREAM)
    d.text(
        (40, 68),
        "Location: wood-ceiling hub, facing the corridor spine  ·  visible to circulation  ·  not inside the CEO office",
        font=font(14),
        fill=GOLD,
    )
    # wall
    rounded(d, (60, 120, 980, 620), (38, 32, 28), outline=GOLD, width=2, r=8)
    screens = [
        (90, 160, 360, 340, "CCTV  ·  ENTRY / HUB", "live cameras"),
        (380, 160, 650, 340, "CCTV  ·  LAB / WET", "QC + cook hood"),
        (670, 160, 940, 340, "CCTV  ·  SUNROOM", "marketing floor"),
        (90, 360, 360, 540, "OPS DASHBOARD", "orders / WhatsApp"),
        (380, 360, 650, 540, "PRODUCTION / QC", "batch + samples"),
        (670, 360, 940, 540, "BRAND / SOCIAL", "campaign calendar"),
    ]
    for x0, y0, x1, y1, t, s in screens:
        rounded(d, (x0, y0, x1, y1), (18, 28, 36), outline=(80, 140, 160), width=2, r=6)
        d.text(((x0 + x1) / 2, (y0 + y1) / 2 - 10), t, font=font(14), fill=CREAM, anchor="mm")
        d.text(((x0 + x1) / 2, (y0 + y1) / 2 + 16), s, font=font(12), fill=GOLD, anchor="mm")
    d.text((70, 580), "Sightline: anyone in the corridor sees status without entering private offices.", font=font(13), fill=CREAM)
    # side notes
    notes = [
        ("WHY HERE", "The hub is the only node every occupant crosses. A wall in the CEO office would hide ops from marketing and QC."),
        ("HARDWARE", "6× 43–55\" 16:9 panels, 2× NVR / HDMI matrix, UPS, cable tray in existing bulkhead, black aluminium frame matching glass partitions."),
        ("PRIVACY", "No camera interiors of CEO office. Lab cameras cover benches/hood, not lockers. Public dashboards only on the wall."),
        ("ACOUSTICS", "Soundbar off by default. Alerts to ops desk headphones. Wall is display, not a war-room shout zone."),
    ]
    yy = 120
    for t, s in notes:
        rounded(d, (1020, yy, 1360, yy + 150), (38, 32, 28), outline=(80, 70, 60), width=1, r=10)
        d.text((1040, yy + 16), t, font=font(14), fill=GOLD)
        d.text((1040, yy + 48), wrap(s, 32), font=font(13), fill=CREAM)
        yy += 165
    im.save(OUT / "04_monitoring_wall.png", optimize=True)


def draw_circulation():
    w, h = 1400, 980
    im = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(im)
    title_block(
        d,
        w,
        "ROZA LAB  ·  CIRCULATION, DAYLIGHT, PRIVACY GRADIENT",
        "Public → team → private  ·  wet lab on the east  ·  daylight harvested on the west/north window walls",
    )
    draw_building_shell(d)
    # daylight hatch on window rooms
    d.text(m(1.3, 13.8), "DAYLIGHT", font=font(11), fill=LEAF, anchor="mm")
    d.text(m(10.2, 7.8), "DAYLIGHT", font=font(11), fill=LEAF, anchor="mm")
    # privacy labels
    d.text(m(5.5, 9.9), "PUBLIC / TEAM", font=font(12), fill=MONITOR, anchor="mm")
    d.text(m(1.8, 6.4), "PRIVATE", font=font(12), fill=ROSHAN, anchor="mm")
    d.text(m(8.4, 2.6), "CONTROLLED\nWET", font=font(12), fill=WET, anchor="mm")
    # flow polyline south to north
    path = [m(1.8, 1.4), m(1.8, 3.6), m(4.6, 3.6), m(4.6, 8.6), m(4.6, 9.8), m(2.0, 9.8), m(1.3, 12.8)]
    d.line(path, fill=GOLD, width=6)
    for p in path:
        d.ellipse((p[0] - 6, p[1] - 6, p[0] + 6, p[1] + 6), fill=GOLD, outline=INK)
    d.text(m(4.9, 5.5), "PRIMARY\nSPINE → N", font=font(11), fill=GOLD, anchor="lm")
    compass_rose(d, 1280, 200)
    scale_bar(d, 70, 900)
    legend(
        d,
        [
            (GOLD, "Primary circulation"),
            (LEAF, "Exterior daylight"),
            (ROSHAN, "Highest privacy"),
            (MONITOR, "Shared / visible"),
            (WET, "Hygiene-controlled wet"),
        ],
        1100,
        320,
    )
    d.text(
        (70, 940),
        "Keep corridor clear: relocate fridge out of the spine. Do not place cooking smell source upwind of CEO/marketing (wet stays east/south).",
        font=font(12),
        fill=MUTED,
    )
    im.save(OUT / "05_circulation_daylight.png", optimize=True)


def draw_phasing():
    w, h = 1400, 720
    im = Image.new("RGB", (w, h), BG)
    d = ImageDraw.Draw(im)
    title_block(
        d,
        w,
        "ROZA LAB  ·  IMPLEMENTATION PHASING  (keep operating)",
        "Three weekends + one longer wet-zone shutdown  ·  existing glass partitions stay",
    )
    phases = [
        ("0", WOOD, "Survey & protect", "Laser-measure, confirm Project North vs true north, map services (power, drain, extract). Photograph existing FF&E for reuse."),
        ("1", MONITOR, "Monitoring wall +\ncorridor clear-out", "Build AV wall in hub. Relocate fridge to pantry niche. Cable tray. Team works from sunroom/offices."),
        ("2", ROSHAN, "CEO + marketing", "Frost film + door hardware on glass office. Nikhil desk + tasting in sunroom. No wet work this phase."),
        ("3", WET, "QC split + cooking", "Add extract hood, heat-proof counters, floor gully if needed. Temporary QC at Sangeetha dry desk only. 3–5 day lab shutdown."),
    ]
    x = 50
    for num, col, title, body in phases:
        rounded(d, (x, 140, x + 310, 640), WHITE, outline=col, width=4, r=16)
        d.ellipse((x + 24, 164, x + 64, 204), fill=col)
        d.text((x + 44, 184), num, font=font(20), fill=WHITE, anchor="mm")
        d.text((x + 80, 184), title, font=font(16), fill=INK, anchor="lm")
        d.text((x + 28, 240), wrap(body, 28), font=font(14), fill=MUTED)
        x += 335
    im.save(OUT / "06_phasing.png", optimize=True)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    draw_existing()
    draw_zoning()
    draw_furniture()
    draw_monitoring()
    draw_circulation()
    draw_phasing()
    print("plans written to", OUT)


if __name__ == "__main__":
    main()
