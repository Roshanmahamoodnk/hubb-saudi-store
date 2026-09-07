"""Build the reproducible Roza Lab survey plates and schematic drawing assets.

Run from the repository root:
    python3 docs/roza-lab/generate_assets.py

The plan is an evidence-led schematic, deliberately not a measured construction
drawing.  It copies the owner-supplied originals, adds relative-direction
overlays, imports the six generated concept visuals, and writes SVG diagrams.
"""

from __future__ import annotations

import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
SOURCE = Path("/home/ubuntu/.cursor/projects/workspace/assets")
GENERATED = Path("/opt/cursor/artifacts/assets")
ORIGINALS = ROOT / "survey" / "originals"
PLATES = ROOT / "survey" / "directional-plates"
VISUALS = ROOT / "visuals"
DIAGRAMS = ROOT / "diagrams"

FONT_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_BOLD_PATH = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"


PHOTOS = [
    {
        "id": "P01",
        "source": "e8acd304-90fe-442a-97bd-2090052adc13.jpg",
        "zone": "Central hall / monitoring approach",
        "camera": "South end of the open hall",
        "facing": "toward the AC, refrigerator and daylight glazing",
        "left": "doorway to the compact glass office",
        "ahead": "AC, fridge and foliage-facing end",
        "right": "solid wall and glazed/corridor edge",
        "note": "Duplicate view retained as supplied. Project north is the exterior foliage / glazing reference, not true north.",
    },
    {
        "id": "P02",
        "source": "5f3dec56-d61d-4556-9051-56d58ba2bac9.jpg",
        "zone": "Central hall / monitoring approach",
        "camera": "South end of the open hall",
        "facing": "toward the AC, refrigerator and daylight glazing",
        "left": "doorway to the compact glass office",
        "ahead": "AC, fridge and foliage-facing end",
        "right": "solid wall and glazed/corridor edge",
        "note": "Duplicate view retained as supplied. Project north is the exterior foliage / glazing reference, not true north.",
    },
    {
        "id": "P03",
        "source": "3f109f5a-196f-46a1-b4e0-116515d6f525.jpg",
        "zone": "Compact glass office",
        "camera": "At the office doorway",
        "facing": "toward the high black-framed window",
        "left": "existing desk and loose task chair",
        "ahead": "small exterior window and blank wall",
        "right": "full-height glass partition and pull handle",
        "note": "Low ceiling, fixed glazing and narrow width limit desk depth; retain clear door swing.",
    },
    {
        "id": "P04",
        "source": "a59f8d44-2e2b-443b-bca3-962ba1f1f003.jpg",
        "zone": "Entry-side narrow corridor",
        "camera": "Inner end of the narrow passage",
        "facing": "toward the striped-glass door / bright end",
        "left": "continuous solid wall",
        "ahead": "frosted horizontal-stripe glass door",
        "right": "tall dark-brown dividing partition",
        "note": "A protected egress passage: keep it free of storage and preserve the glass-door clearance.",
    },
    {
        "id": "P05",
        "source": "c6e56543-6619-4a1f-bfe8-def7064e6074.jpg",
        "zone": "Glass-fronted lab / workroom",
        "camera": "Central hall, immediately outside the lab door",
        "facing": "into the existing counter room",
        "left": "desk counter and task seating",
        "ahead": "rear worktop and blind-covered window",
        "right": "long sample counter with red-lid jars and microwave",
        "note": "Existing counters, glass frontage, blinds and wood-slat lower panels are retained as design anchors.",
    },
    {
        "id": "P06",
        "source": "7b745c99-ef3e-4d91-9d99-bcb1cdc725d2.jpg",
        "zone": "Glass-fronted lab / workroom",
        "camera": "Central hall, immediately outside the lab door",
        "facing": "into the existing counter room",
        "left": "desk counter and task seating",
        "ahead": "rear worktop and blind-covered window",
        "right": "long sample counter with red-lid jars and microwave",
        "note": "Duplicate view retained as supplied; counters support the proposed test lab and QC station.",
    },
    {
        "id": "P07",
        "source": "10a6ab4c-07bc-44d3-b6e5-3cb625ba9828.jpg",
        "zone": "Compact glass office",
        "camera": "At the office doorway",
        "facing": "toward the high black-framed window",
        "left": "existing desk and task chair",
        "ahead": "small exterior window and blank wall",
        "right": "full-height glass partition and pull handle",
        "note": "Repeat of P03 view; confirms compact office proportions and glazing condition.",
    },
    {
        "id": "P08",
        "source": "dd4b80d3-4949-44e4-b96f-bb147a325c15.jpg",
        "zone": "Long window gallery",
        "camera": "Gallery connection / inner end",
        "facing": "toward the corner of black-framed foliage windows",
        "left": "corner exterior glazing",
        "ahead": "tropical foliage-facing windows",
        "right": "white wall, fan and opening back to hall",
        "note": "Dark wood ceiling, square lights, fan and long daylight edge are key fixed character elements.",
    },
    {
        "id": "P09",
        "source": "2d3e378c-6bee-44d5-9e37-8e2e0d7f6024.jpg",
        "zone": "Window gallery looking to central hall",
        "camera": "Inside the gallery near the foliage windows",
        "facing": "toward the black threshold and central hall",
        "left": "glass-fronted lab / wood-slat panels",
        "ahead": "hall, AC and circulation connection",
        "right": "open gallery edge and task chair",
        "note": "The black threshold marks the transition between the wood-ceiling gallery and central circulation.",
    },
    {
        "id": "P10",
        "source": "13d6bde0-d9af-461e-9d35-7688d56c4305.jpg",
        "zone": "Window gallery looking to central hall",
        "camera": "Inside the gallery near the foliage windows",
        "facing": "toward the black threshold and central hall",
        "left": "glass-fronted lab / wood-slat panels",
        "ahead": "hall, AC and circulation connection",
        "right": "open gallery edge and task chair",
        "note": "Duplicate view retained as supplied; confirms lab-to-gallery adjacency.",
    },
    {
        "id": "P11",
        "source": "4ce4fd53-0f12-4cdf-bb45-f481b5c2a0d3.jpg",
        "zone": "Long window gallery",
        "camera": "Gallery connection / inner end",
        "facing": "toward the corner of black-framed foliage windows",
        "left": "corner exterior glazing",
        "ahead": "tropical foliage-facing windows",
        "right": "white wall, fan and opening back to hall",
        "note": "Repeat of P08; wall fan and retained ceiling establish the practical environmental constraints.",
    },
    {
        "id": "P12",
        "source": "e38c5f61-9c20-4271-9b9e-b785c86ce581.jpg",
        "zone": "Long window gallery, reverse view",
        "camera": "Foliage-window end of gallery",
        "facing": "back along the long room toward its opening",
        "left": "solid wall and wall-mounted fan",
        "ahead": "end wall with return opening",
        "right": "continuous black-framed exterior windows",
        "note": "Reverse view confirms the room is a long, narrow gallery rather than a large open hall.",
    },
    {
        "id": "P13",
        "source": "16c13832-2a0d-4ec4-a40b-f8ec73feec53.jpg",
        "zone": "Long window gallery, reverse view",
        "camera": "Foliage-window end of gallery",
        "facing": "back along the long room toward its opening",
        "left": "solid wall and wall-mounted fan",
        "ahead": "end wall with return opening",
        "right": "continuous black-framed exterior windows",
        "note": "Duplicate reverse view retained as supplied; confirms an unobstructed linear circulation path.",
    },
]

CONCEPTS = {
    "ceo-office.png": "roza-ceo-office-concept.png",
    "marketing-hub.png": "roza-marketing-hub-concept.png",
    "qc-rd.png": "roza-qc-rd-concept-v2.png",
    "roastery-test-lab.png": "roza-roastery-test-lab-concept.png",
    "monitoring-station.png": "roza-monitoring-station-concept.png",
    "gallery-circulation.png": "roza-gallery-circulation-concept.png",
}


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(FONT_BOLD_PATH if bold else FONT_PATH, size=size)


def bounded_text(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, max_width: int, fnt, fill) -> int:
    """Draw word-wrapped copy and return its final y coordinate."""
    x, y = xy
    words, line = text.split(), ""
    for word in words:
        proposal = f"{line} {word}".strip()
        if draw.textbbox((0, 0), proposal, font=fnt)[2] > max_width and line:
            draw.text((x, y), line, font=fnt, fill=fill)
            y += fnt.size + 7
            line = word
        else:
            line = proposal
    if line:
        draw.text((x, y), line, font=fnt, fill=fill)
        y += fnt.size + 7
    return y


def draw_compass(draw: ImageDraw.ImageDraw, cx: int, cy: int) -> None:
    navy, amber, cream = "#1F2933", "#D79A3B", "#FFF8ED"
    draw.ellipse((cx - 49, cy - 49, cx + 49, cy + 49), outline=cream, width=3)
    draw.line((cx, cy + 34, cx, cy - 34), fill=amber, width=6)
    draw.polygon([(cx, cy - 44), (cx - 9, cy - 21), (cx + 9, cy - 21)], fill=amber)
    draw.line((cx - 31, cy, cx + 31, cy), fill=cream, width=2)
    draw.text((cx - 7, cy - 73), "N*", font=font(17, True), fill=cream)
    draw.text((cx + 55, cy - 9), "E", font=font(15, True), fill=cream)
    draw.text((cx - 7, cy + 51), "S", font=font(15, True), fill=cream)
    draw.text((cx - 72, cy - 9), "W", font=font(15, True), fill=cream)


def make_plate(record: dict) -> None:
    source = SOURCE / record["source"]
    original = ORIGINALS / f"{record['id']}.jpg"
    plate = PLATES / f"{record['id']}-directional.jpg"
    shutil.copy2(source, original)

    image = Image.open(source).convert("RGB")
    max_width = 1050
    if image.width > max_width:
        image = image.resize((max_width, round(image.height * max_width / image.width)), Image.Resampling.LANCZOS)
    header_h, footer_h = 216, 252
    canvas = Image.new("RGB", (image.width, image.height + header_h + footer_h), "#1F2933")
    canvas.paste(image, (0, header_h))
    draw = ImageDraw.Draw(canvas, "RGBA")

    draw.rectangle((0, 0, image.width, header_h), fill="#1F2933")
    draw.text((28, 23), f"{record['id']}  /  CURRENT-CONDITIONS SURVEY", font=font(19, True), fill="#E8B65E")
    title_bottom = bounded_text(
        draw,
        (28, 53),
        record["zone"].upper(),
        image.width - 195,
        font(25, True),
        "#FFF8ED",
    )
    draw.text((28, title_bottom + 1), "N* = exterior foliage / glazing (project reference)", font=font(15), fill="#D7E3EA")
    draw.text((28, title_bottom + 26), "Relative labels: camera-facing, left, ahead, right.", font=font(15), fill="#D7E3EA")
    draw_compass(draw, image.width - 87, 101)

    # Directional field-of-view arrow in the image body.
    center_x, center_y = image.width // 2, header_h + int(image.height * 0.62)
    draw.line((center_x, header_h + image.height - 60, center_x, center_y), fill="#E8B65E", width=9)
    draw.polygon(
        [(center_x, center_y - 26), (center_x - 19, center_y + 17), (center_x + 19, center_y + 17)],
        fill="#E8B65E",
    )
    tag = "CAMERA FACING"
    tag_box = draw.textbbox((0, 0), tag, font=font(16, True))
    tag_w = tag_box[2] - tag_box[0] + 22
    draw.rounded_rectangle(
        (center_x - tag_w // 2, center_y + 32, center_x + tag_w // 2, center_y + 61),
        radius=10,
        fill="#1F2933CC",
    )
    draw.text((center_x - tag_w // 2 + 11, center_y + 37), tag, font=font(16, True), fill="#FFF8ED")

    footer_y = header_h + image.height
    draw.rectangle((0, footer_y, image.width, canvas.height), fill="#1F2933")
    y = footer_y + 24
    y = bounded_text(draw, (38, y), f"CAMERA POSITION  {record['camera']}", image.width - 76, font(20, True), "#FFF8ED")
    y += 5
    y = bounded_text(draw, (38, y), f"AHEAD  {record['facing']}", image.width - 76, font(19), "#D7E3EA")
    y = bounded_text(draw, (38, y), f"LEFT  {record['left']}     |     RIGHT  {record['right']}", image.width - 76, font(19), "#D7E3EA")
    bounded_text(draw, (38, y + 2), f"* {record['note']}", image.width - 76, font(16), "#E8B65E")
    canvas.save(plate, quality=92, optimize=True)


def write_plan() -> None:
    svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 920" role="img" aria-labelledby="title desc">
<title id="title">Roza Lab proposed floor plan — evidence-led schematic</title>
<desc id="desc">Schematic plan showing the compact CEO office, central monitoring hall, glass-fronted testing lab, long window gallery marketing hub, connections, camera positions, and project north.</desc>
<style>
  .bg { fill: #f8f3ea; } .outline { fill:none; stroke:#21282f; stroke-width:10; stroke-linejoin:round; }
  .partition { fill:none; stroke:#21282f; stroke-width:5; stroke-dasharray:12 8; }
  .zone { stroke:#21282f; stroke-width:4; } .label { font:700 24px Arial,sans-serif; fill:#21282f; }
  .sub { font:16px Arial,sans-serif; fill:#384651; } .small { font:14px Arial,sans-serif; fill:#384651; }
  .note { font:13px Arial,sans-serif; fill:#384651; } .furn { fill:#76543e; stroke:#21282f; stroke-width:2; }
  .furn2 { fill:#d79a3b; stroke:#21282f; stroke-width:2; } .camera { fill:#bd4b43; stroke:#fff8ed; stroke-width:3; }
  .leader { fill:none; stroke:#bd4b43; stroke-width:3; stroke-dasharray:7 5; } .glass { stroke:#80b8c6; stroke-width:8; }
  .door { fill:none; stroke:#21282f; stroke-width:3; } .screen { fill:#263b47; stroke:#d7e3ea; stroke-width:2; }
</style>
<rect class="bg" width="1400" height="920"/>
<text x="60" y="64" style="font:700 34px Arial,sans-serif;fill:#21282f">ROZA LAB — PROPOSED INTERIOR PLAN</text>
<text x="60" y="92" class="sub">Evidence-led, not-to-scale reconstruction • Project North = foliage/exterior glazing reference (true north unverified)</text>

<!-- Plan envelope: rooms as observed by the overlapping photographs -->
<rect x="80" y="170" width="1180" height="610" rx="6" class="outline"/>
<!-- Central hall -->
<rect x="80" y="380" width="500" height="400" class="zone" fill="#e8efe9"/>
<text x="116" y="425" class="label">CENTRAL HALL + OPS</text>
<text x="116" y="452" class="sub">Open circulation / central monitoring station</text>
<!-- compact office -->
<rect x="80" y="170" width="320" height="210" class="zone" fill="#eee4d7"/>
<text x="108" y="215" class="label">CEO OFFICE</text>
<text x="108" y="242" class="sub">Roshan Mahamood</text>
<text x="108" y="268" class="small">Private 2–4 person meetings</text>
<rect x="122" y="290" width="156" height="50" rx="4" class="furn"/>
<text x="160" y="322" class="small" fill="#fff8ed">EXEC. DESK</text>
<circle cx="318" cy="302" r="25" class="furn2"/><circle cx="350" cy="335" r="25" class="furn2"/>
<path d="M400 330 h-55 a55 55 0 0 1 55 -55" class="door"/>
<!-- Lab / research -->
<rect x="400" y="170" width="520" height="210" class="zone" fill="#f3dfd5"/>
<text x="435" y="215" class="label">ROASTERY TESTING + QC / R&amp;D</text>
<text x="435" y="242" class="sub">Sangeetha — Nutritionist / QC / R&amp;D specialist</text>
<text x="435" y="268" class="small">Retain counter line • washable test zone • electric heat only pending MEP verification</text>
<rect x="432" y="295" width="205" height="42" rx="4" class="furn"/>
<rect x="660" y="295" width="216" height="42" rx="4" class="furn"/>
<rect x="694" y="247" width="86" height="34" rx="4" class="furn2"/>
<text x="706" y="270" class="small">TEST BENCH</text>
<!-- narrow entry corridor -->
<rect x="920" y="170" width="340" height="210" class="zone" fill="#dce7ef"/>
<text x="952" y="215" class="label">ENTRY CORRIDOR</text>
<text x="952" y="242" class="sub">Frosted-stripe door + dark partition</text>
<text x="952" y="268" class="small">Clear egress; no storage</text>
<line x1="1120" y1="173" x2="1120" y2="377" class="glass"/>
<path d="M920 319 h54 a54 54 0 0 1 -54 54" class="door"/>
<!-- Gallery / marketing hub -->
<rect x="580" y="380" width="680" height="400" class="zone" fill="#f2e5cf"/>
<text x="622" y="425" class="label">WINDOW GALLERY — MARKETING HUB</text>
<text x="622" y="452" class="sub">Nikhil — Marketing Head • daylight / tropical foliage edge</text>
<text x="622" y="478" class="small">Dark wood ceiling retained • clear 1.2 m circulation route • campaign wall + kit storage</text>
<rect x="650" y="565" width="188" height="64" rx="4" class="furn"/>
<text x="696" y="603" class="small" fill="#fff8ed">NIKHIL DESK</text>
<rect x="890" y="565" width="170" height="64" rx="4" class="furn"/>
<text x="915" y="603" class="small" fill="#fff8ed">COLLAB BENCH</text>
<rect x="1100" y="510" width="104" height="168" rx="4" class="furn2"/>
<text x="1117" y="548" class="small">KIT</text><text x="1111" y="568" class="small">STORE</text>
<!-- exterior glazing -->
<line x1="1260" y1="410" x2="1260" y2="750" class="glass"/>
<text transform="rotate(-90 1292 702)" x="1292" y="702" class="small">BLACK-FRAMED FOLIAGE WINDOWS</text>
<!-- monitoring -->
<rect x="115" y="540" width="235" height="72" rx="5" class="screen"/>
<rect x="360" y="540" width="80" height="72" rx="5" class="screen"/>
<text x="125" y="638" class="small">3 × 55″ MONITOR WALL</text>
<rect x="125" y="662" width="300" height="52" rx="4" class="furn"/>
<text x="164" y="694" class="small" fill="#fff8ed">OPS CONSOLE + UPS</text>
<!-- partitions, doors and adjacency labels -->
<line x1="400" y1="180" x2="400" y2="370" class="partition"/>
<line x1="400" y1="380" x2="400" y2="520" class="partition"/>
<line x1="580" y1="440" x2="580" y2="720" class="partition"/>
<text x="420" y="370" class="note">glazed partition / door</text>
<text x="590" y="750" class="note">window gallery threshold</text>
<path d="M400 515 h72 a72 72 0 0 1 -72 72" class="door"/>
<path d="M580 502 h70 a70 70 0 0 1 -70 70" class="door"/>
<!-- camera viewpoints -->
<g><circle cx="250" cy="470" r="20" class="camera"/><text x="242" y="477" style="font:700 15px Arial;fill:white">1</text><path d="M250 450 L325 390" class="leader"/></g>
<g><circle cx="302" cy="340" r="20" class="camera"/><text x="294" y="347" style="font:700 15px Arial;fill:white">3</text></g>
<g><circle cx="1045" cy="315" r="20" class="camera"/><text x="1037" y="322" style="font:700 15px Arial;fill:white">4</text></g>
<g><circle cx="532" cy="340" r="20" class="camera"/><text x="524" y="347" style="font:700 15px Arial;fill:white">5</text></g>
<g><circle cx="770" cy="500" r="20" class="camera"/><text x="762" y="507" style="font:700 15px Arial;fill:white">8</text></g>
<g><circle cx="640" cy="710" r="20" class="camera"/><text x="632" y="717" style="font:700 15px Arial;fill:white">12</text></g>
<!-- north and legend -->
<g transform="translate(1300 114)"><path d="M0 45 L0 -5" stroke="#bd4b43" stroke-width="7"/><path d="M0 -20 L-14 9 L14 9Z" fill="#bd4b43"/><text x="-10" y="-34" style="font:700 20px Arial;fill:#21282f">N*</text></g>
<text x="60" y="844" class="note">Camera dots show source viewpoints: P02=P01, P06=P05, P07=P03, P10=P09, P11=P08 and P13=P12.</text>
<text x="60" y="870" class="note">The plan identifies observed adjacency and fixed elements; obtain a field measurement, reflected ceiling plan and MEP survey before procurement or construction.</text>
</svg>"""
    (DIAGRAMS / "proposed-floor-plan.svg").write_text(svg, encoding="utf-8")


def write_monitoring() -> None:
    svg = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 760" role="img" aria-labelledby="title desc">
<title id="title">Roza Lab CCTV and central monitoring coverage diagram</title>
<desc id="desc">Schematic showing cameras covering common circulation, lab entry and window gallery, with no camera inside the private CEO office.</desc>
<style>
 .bg{fill:#f8f3ea}.outline{fill:none;stroke:#21282f;stroke-width:8}.zone{stroke:#21282f;stroke-width:3}.label{font:700 24px Arial;fill:#21282f}.sub{font:16px Arial;fill:#384651}.small{font:14px Arial;fill:#384651}.cam{fill:#bd4b43;stroke:#fff8ed;stroke-width:3}.cone{fill:#d79a3b;fill-opacity:.20;stroke:#d79a3b;stroke-width:2;stroke-dasharray:8 6}.screen{fill:#263b47;stroke:#d7e3ea;stroke-width:3}.wire{fill:none;stroke:#4b7890;stroke-width:4;stroke-dasharray:7 6}
</style>
<rect width="1400" height="760" class="bg"/>
<text x="60" y="62" style="font:700 34px Arial;fill:#21282f">CENTRAL MONITORING + CCTV COVERAGE</text>
<text x="60" y="90" class="sub">Common-area coverage only • No camera inside CEO office • confirm local privacy, notice and retention requirements</text>
<rect x="70" y="140" width="1120" height="500" class="outline"/>
<rect x="70" y="140" width="300" height="190" class="zone" fill="#eee4d7"/>
<text x="105" y="200" class="label">CEO OFFICE</text><text x="105" y="230" class="sub">NO CAMERA — private work / meetings</text>
<rect x="370" y="140" width="440" height="190" class="zone" fill="#f3dfd5"/>
<text x="408" y="200" class="label">TEST LAB + QC</text><text x="408" y="230" class="sub">Entry and equipment zone only</text>
<rect x="810" y="140" width="380" height="190" class="zone" fill="#dce7ef"/>
<text x="840" y="200" class="label">ENTRY PASSAGE</text><text x="840" y="230" class="sub">Door / egress view</text>
<rect x="70" y="330" width="480" height="310" class="zone" fill="#e8efe9"/>
<text x="108" y="380" class="label">CENTRAL HALL + OPS</text><text x="108" y="408" class="sub">3 × 55″ wall + operator console</text>
<rect x="550" y="330" width="640" height="310" class="zone" fill="#f2e5cf"/>
<text x="590" y="380" class="label">WINDOW GALLERY / MARKETING</text><text x="590" y="408" class="sub">Common circulation and gallery edge</text>
<rect x="108" y="480" width="244" height="58" rx="6" class="screen"/><rect x="362" y="480" width="66" height="58" rx="6" class="screen"/>
<text x="112" y="568" class="small">MONITOR WALL + NVR/UPS (locked cabinet)</text>
<circle cx="430" cy="345" r="17" class="cam"/><text x="422" y="351" style="font:700 13px Arial;fill:white">C1</text>
<path d="M430 345 L140 610 L530 610Z" class="cone"/>
<circle cx="800" cy="350" r="17" class="cam"/><text x="792" y="356" style="font:700 13px Arial;fill:white">C2</text>
<path d="M800 350 L570 610 L1130 610Z" class="cone"/>
<circle cx="785" cy="305" r="17" class="cam"/><text x="777" y="311" style="font:700 13px Arial;fill:white">C3</text>
<path d="M785 305 L470 160 L470 310Z" class="cone"/>
<circle cx="835" cy="310" r="17" class="cam"/><text x="827" y="316" style="font:700 13px Arial;fill:white">C4</text>
<path d="M835 310 L1170 160 L1170 315Z" class="cone"/>
<path d="M430 345 C410 390, 410 430, 400 480 M800 350 C690 420, 600 450, 428 500 M785 305 C700 365, 540 420, 420 500 M835 310 C780 400, 610 440, 428 520" class="wire"/>
<rect x="1220" y="165" width="130" height="100" rx="8" fill="#fff8ed" stroke="#21282f" stroke-width="2"/>
<text x="1245" y="198" class="label">KEY</text><circle cx="1240" cy="224" r="10" class="cam"/><text x="1260" y="230" class="small">camera</text><rect x="1230" y="242" width="20" height="10" class="cone"/><text x="1260" y="254" class="small">view cone</text>
<text x="70" y="688" class="small">C1 common hall / entry • C2 gallery • C3 lab entry and heat equipment (not personal screens) • C4 passage/door. Conduits route to the locked NVR/UPS at the monitoring console.</text>
<text x="70" y="716" class="small">Set views and retention after a privacy review; do not cover desk screens, the private office or wash / changing areas. Provide a visible CCTV notice at entry.</text>
</svg>"""
    (DIAGRAMS / "monitoring-coverage.svg").write_text(svg, encoding="utf-8")


def main() -> None:
    for folder in (ORIGINALS, PLATES, VISUALS, DIAGRAMS):
        folder.mkdir(parents=True, exist_ok=True)
    for record in PHOTOS:
        make_plate(record)
    for target, source in CONCEPTS.items():
        source_path = GENERATED / source
        if not source_path.exists():
            raise FileNotFoundError(f"Generated concept image is missing: {source_path}")
        shutil.copy2(source_path, VISUALS / target)
    write_plan()
    write_monitoring()
    print(f"Wrote {len(PHOTOS)} originals, {len(PHOTOS)} directional plates, {len(CONCEPTS)} concepts and 2 diagrams.")


if __name__ == "__main__":
    main()
