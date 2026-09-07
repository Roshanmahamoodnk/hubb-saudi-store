#!/usr/bin/env python3
"""Roza Lab 2D plans: current survey, proposed zoning, circulation, CCTV.

Photo-estimated geometry. North = window wall with tree canopy.
Methods borrowed from react-planner (furniture modules), ha-floorplan
(entity overlay on SVG-like plan), and workplace-strategy zoning.
"""

from __future__ import annotations

from pathlib import Path

import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch, Rectangle, Circle, Polygon, Arc
from matplotlib.lines import Line2D

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "images" / "diagrams"
OUT.mkdir(parents=True, exist_ok=True)

# metres, photo-estimated
# Gallery along west: 2.3 x 9.5
# Inner corridor: 2.2 x 8.5
# Glass cabin: 2.4 x 2.8
# Lab cabin: 2.6 x 4.2
# Compact storage/east cabins: 2.4 x 3.0

ESPRESSO = "#2A1C14"
WALNUT = "#6B4423"
CREAM = "#F5F0E6"
BRASS = "#C4A574"
INK = "#12100E"
FOREST = "#2F4F3E"
GLASS = "#5B8FA8"
LAB = "#8B5E3C"
CEO = "#3C2415"
MKT = "#C4A574"
QC = "#4A7C59"
MON = "#8B3A2F"
COR = "#E8E0D4"


def north_arrow(ax, x, y, scale=1.0):
    ax.annotate(
        "",
        xy=(x, y + 1.15 * scale),
        xytext=(x, y - 0.35 * scale),
        arrowprops=dict(arrowstyle="-|>", color="#B03024", lw=2.2, mutation_scale=16),
    )
    ax.text(x, y + 1.35 * scale, "N", ha="center", va="bottom", fontsize=11, fontweight="bold", color="#B03024")
    circ = Circle((x, y), 0.55 * scale, fill=False, ec=BRASS, lw=1.4)
    ax.add_patch(circ)
    ax.text(x, y - 0.85 * scale, "E", ha="left", va="center", fontsize=8, color=INK)
    ax.text(x, y + 0.85 * scale, "", fontsize=1)
    ax.text(x - 0.85 * scale, y, "W", ha="right", va="center", fontsize=8, color=INK)
    ax.text(x, y - 1.15 * scale, "S", ha="center", va="top", fontsize=8, color=INK)


def room(ax, xy, w, h, facecolor, edge="#1A1A1A", lw=1.6, hatch=None, alpha=0.95, radius=0.08):
    patch = FancyBboxPatch(
        xy,
        w,
        h,
        boxstyle=f"round,pad=0.02,rounding_size={radius}",
        facecolor=facecolor,
        edgecolor=edge,
        linewidth=lw,
        hatch=hatch,
        alpha=alpha,
    )
    ax.add_patch(patch)
    return patch


def label(ax, x, y, text, size=8, color=INK, weight="bold"):
    ax.text(x, y, text, ha="center", va="center", fontsize=size, color=color, fontweight=weight, wrap=True)


def draw_base_walls(ax):
    """Shared geometry for current and proposed plans.

    Coordinate system: +Y = North, +X = East. Origin at SW of suite.
    """
    # Outer envelope
    ax.add_patch(Rectangle((0, 0), 11.4, 12.4, fill=False, ec=ESPRESSO, lw=2.4, zorder=3))

    # Window gallery — west strip, full height
    room(ax, (0.15, 0.15), 2.5, 12.1, "#D9C7A8", edge=WALNUT, lw=1.8)
    # West glazing ticks
    for gy in (1.0, 3.0, 5.0, 7.0, 9.0, 11.0):
        ax.plot([0.15, 0.15], [gy - 0.35, gy + 0.35], color="#1A1A1A", lw=3.5, solid_capstyle="butt")
        ax.plot([-0.35, 0.15], [gy, gy], color=GLASS, lw=1.2, ls=":")

    # North gallery window
    ax.plot([0.4, 2.4], [12.25, 12.25], color="#1A1A1A", lw=4)
    ax.annotate("trees / canopy", xy=(1.4, 12.55), ha="center", fontsize=7, color=FOREST, style="italic")

    # Granite threshold between gallery and inner
    ax.add_patch(Rectangle((2.55, 6.3), 0.28, 1.6, facecolor="#111111", edgecolor="none", zorder=4))

    # Inner glossy corridor (N-S spine)
    room(ax, (2.85, 2.4), 2.35, 9.7, "#EFE7D8", edge="#888888", lw=1.2)

    # North window of corridor
    ax.plot([3.1, 5.0], [12.15, 12.15], color="#1A1A1A", lw=4)
    ax.annotate("corridor window wall", xy=(4.05, 12.55), ha="center", fontsize=7, color=FOREST, style="italic")

    # Glass cabin west of corridor (compact office)
    room(ax, (2.85, 8.55), 2.35, 2.55, "#C5D6E0", edge="#222222", lw=1.5, hatch="////")

    # Lab cabin south of glass cabin, west of corridor
    room(ax, (0.15 if False else 2.85, 3.9), 2.35, 4.4, "#C4A574", edge=WALNUT, lw=1.6)

    # Wait: lab should not overlap gallery. Lab is on west of inner corridor
    # but gallery occupies x=0.15-2.65. So inner starts at 2.85.
    # Glass cabin and lab are EAST of gallery, WEST "bay" of inner — they're
    # actually the west rooms opening off the corridor. Redraw lab/cabin
    # as rooms on the west side of corridor but east of gallery? That would
    # be a thin leftover. Better model:

    # REVISED: gallery is west. Inner suite is east of gallery.
    # Corridor is the N-S glossy hall. Glass cabin + lab open off WEST side
    # of that hall — meaning they sit between gallery and corridor.

    # I already drew gallery 0.15-2.65 and corridor 2.85-5.2.
    # Cabins occupy 2.85 overlapping corridor — BAD.

    # Let's not call this function with overlapping rooms. I'll rebuild
    # geometry cleanly in each plan function instead.


def current_plan():
    fig, ax = plt.subplots(figsize=(11.5, 13.2), facecolor=CREAM)
    ax.set_facecolor(CREAM)
    ax.set_aspect("equal")
    ax.set_xlim(-1.6, 13.2)
    ax.set_ylim(-1.8, 14.4)
    ax.axis("off")

    ax.text(5.6, 13.85, "ROZA LAB  ·  CURRENT STATE SURVEY", ha="center", fontsize=15, fontweight="bold", color=ESPRESSO)
    ax.text(5.6, 13.45, "Photo-estimated plan  ·  North = window wall with trees  ·  not a measured survey", ha="center", fontsize=8.5, color=WALNUT)

    # Outer
    ax.add_patch(Rectangle((0, 0), 11.2, 12.3, fill=False, ec=ESPRESSO, lw=2.6, zorder=5))

    # GALLERY west 0–2.6 x 0–12.3
    room(ax, (0.08, 0.08), 2.55, 12.14, "#E2D3B5", edge=WALNUT, lw=1.8)
    label(ax, 1.35, 10.6, "WINDOW GALLERY\nwood-slat ceiling\nmatte grey tile\nvacant + 1 chair", 7.5)
    label(ax, 1.35, 6.2, "WEST GLAZING\nblack frames\ntree canopy", 7, color=FOREST)
    # west window marks
    for gy in (1.2, 3.2, 5.2, 7.2, 9.2, 11.2):
        ax.add_patch(Rectangle((-0.18, gy - 0.45), 0.26, 0.9, facecolor=GLASS, edgecolor="#111", lw=0.6))
    # north gallery window
    ax.add_patch(Rectangle((0.25, 12.22), 2.2, 0.22, facecolor=GLASS, edgecolor="#111", lw=0.8))

    # Granite threshold
    ax.add_patch(Rectangle((2.55, 6.15), 0.32, 1.55, facecolor="#111111", zorder=4))
    ax.text(2.71, 5.85, "granite\nthreshold", ha="center", fontsize=6, color=INK)

    # Inner glossy corridor
    room(ax, (5.15, 0.08), 2.5, 12.14, "#F3EDE0", edge="#777", lw=1.3)
    label(ax, 6.4, 1.1, "MAIN CORRIDOR\nglossy cream tile\nwhite ceiling / LEDs", 7)
    # north corridor window
    ax.add_patch(Rectangle((5.35, 12.22), 2.1, 0.22, facecolor=GLASS, edgecolor="#111", lw=0.8))
    ax.annotate("N window wall", xy=(6.4, 12.55), ha="center", fontsize=7, color=FOREST, fontweight="bold")

    # Fridge + AC on east side of corridor
    ax.add_patch(Rectangle((7.15, 7.35), 0.42, 0.7, facecolor="#9AA3A8", edgecolor="#333", lw=0.8))
    ax.text(7.36, 8.2, "fridge", ha="center", fontsize=6)
    ax.add_patch(Rectangle((7.18, 8.45), 0.36, 0.22, facecolor="#F7F7F7", edgecolor="#555", lw=0.6))
    ax.text(7.36, 8.82, "AC", ha="center", fontsize=6)

    # Glass cabin west of corridor (between gallery and corridor)
    room(ax, (2.85, 8.35), 2.2, 3.65, "#B9CEDB", edge="#1A1A1A", lw=1.5, hatch="////")
    label(ax, 3.95, 10.3, "GLASS CABIN\ncompact office\ndark exec desk\n3 chairs  (P03/P07)", 7)
    ax.text(3.95, 8.7, "narrow N window", ha="center", fontsize=6.5, color=FOREST)

    # Lab cabin
    room(ax, (2.85, 2.55), 2.2, 5.5, "#C9A36A", edge=WALNUT, lw=1.7)
    label(ax, 3.95, 5.5, "LAB CABIN\nwood-slat + glass\nred-lid jars\nsink · microwave\n(P05/P06)", 7.5)
    ax.text(3.95, 3.05, "window + blinds (N-ish)", ha="center", fontsize=6.5, color=FOREST)

    # East glass partitions / unused
    room(ax, (7.75, 8.2), 3.25, 3.8, "#D5DDE2", edge="#222", lw=1.4, hatch="\\\\")
    label(ax, 9.35, 10.2, "EAST GLASS\nPARTITIONS\n(P01/P02 right)", 7.5)
    room(ax, (7.75, 4.3), 3.25, 3.6, "#E6E0D4", edge="#666", lw=1.2)
    label(ax, 9.35, 6.15, "DARK PARTITION\n/ striped glass\nzone (P04)", 7.5)
    room(ax, (7.75, 0.08), 3.25, 3.95, "#EFEAE0", edge="#888", lw=1.1)
    label(ax, 9.35, 2.1, "SOUTH INNER\nstorage / residual\n(cardboard, chair)", 7)

    # South entry hint
    ax.annotate("to remaining suite / entry (S)", xy=(6.4, 0.15), xytext=(6.4, -0.85),
                ha="center", fontsize=8, color=INK,
                arrowprops=dict(arrowstyle="->", color=BRASS))

    # Trees north
    ax.text(5.6, 13.05, "▲  EXTERIOR  ·  LUSH TREE CANOPY  ·  NORTH FACADE  ▲", ha="center", fontsize=8, color=FOREST, fontweight="bold")

    north_arrow(ax, -0.55, 10.8, 0.85)

    # Legend
    ax.add_patch(FancyBboxPatch(( -1.35, -1.55), 12.7, 1.25, boxstyle="round,pad=0.08", facecolor="white", edgecolor=BRASS, lw=1.2))
    ax.text(5.0, -0.55, "Existing materials: glossy cream tile (corridor)  ·  matte grey tile (gallery)  ·  black metal + walnut slats (lab)  ·  wood-slat ceiling (gallery)",
            ha="center", fontsize=7.2, color=INK)
    ax.text(5.0, -1.05, "Photos P01–P02 corridor N  ·  P03/P07 glass cabin  ·  P05/P06 lab  ·  P08/P11/P12/P13 gallery  ·  P09/P10 threshold  ·  P04 inner partition",
            ha="center", fontsize=7.2, color=WALNUT)

    fig.tight_layout()
    path = OUT / "01-current-floor-plan.png"
    fig.savefig(path, dpi=160, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    return path


def proposed_plan():
    fig, ax = plt.subplots(figsize=(11.5, 13.2), facecolor=CREAM)
    ax.set_facecolor(CREAM)
    ax.set_aspect("equal")
    ax.set_xlim(-1.6, 13.2)
    ax.set_ylim(-1.8, 14.4)
    ax.axis("off")

    ax.text(5.6, 13.85, "ROZA LAB  ·  PROPOSED ZONING PLAN", ha="center", fontsize=15, fontweight="bold", color=ESPRESSO)
    ax.text(5.6, 13.45, "Named occupants  ·  keep existing partitions  ·  clear central walkway  ·  aroma isolated to lab", ha="center", fontsize=8.5, color=WALNUT)

    ax.add_patch(Rectangle((0, 0), 11.2, 12.3, fill=False, ec=ESPRESSO, lw=2.6, zorder=5))

    # CEO — north end of gallery
    room(ax, (0.08, 8.55), 2.55, 3.67, "#3C2415", edge=BRASS, lw=2.0)
    label(ax, 1.35, 10.55, "CEO OFFICE\nRoshan Mahamood\nprivacy film · desk\n2 guest chairs\nnorth window", 7.5, color=CREAM)
    ax.add_patch(Rectangle((0.25, 12.22), 2.2, 0.22, facecolor=GLASS, edgecolor="#111", lw=0.8))

    # Marketing along rest of gallery
    room(ax, (0.08, 0.08), 2.55, 8.30, "#E8C992", edge=WALNUT, lw=1.8)
    label(ax, 1.35, 4.5, "MARKETING\nDEPARTMENT\nlinear desks\nbrand / content wall\nwest light", 8)
    for gy in (1.2, 3.2, 5.2, 7.2):
        ax.add_patch(Rectangle((-0.18, gy - 0.45), 0.26, 0.9, facecolor=GLASS, edgecolor="#111", lw=0.6))
    # desks
    for dy in (1.4, 3.1, 4.8, 6.5):
        ax.add_patch(Rectangle((0.45, dy), 1.7, 0.7, facecolor="#F7F1E6", edgecolor=ESPRESSO, lw=0.7))

    # Nikhil at threshold
    ax.add_patch(Rectangle((0.35, 7.15), 1.95, 1.15, facecolor="#8B3A2F", edgecolor=BRASS, lw=1.4))
    label(ax, 1.32, 7.72, "NIKHIL\nMarketing Head", 6.5, color=CREAM)

    # granite
    ax.add_patch(Rectangle((2.55, 6.15), 0.32, 1.55, facecolor="#111111", zorder=4))

    # Monitoring wall facing threshold / corridor
    room(ax, (7.75, 5.55), 3.25, 2.55, "#8B3A2F", edge="#4A1E18", lw=1.8)
    label(ax, 9.37, 6.82, "CENTRAL MONITORING\nTV wall / hub\nCCTV + KPI dashboards", 7.5, color=CREAM)

    # Corridor kept clear
    room(ax, (5.15, 0.08), 2.5, 12.14, "#F7F3EA", edge="#999", lw=1.2)
    label(ax, 6.4, 1.15, "CLEAR SPINE\n2.2 m walkway\ndo not block", 7, color=FOREST)
    ax.add_patch(Rectangle((5.35, 12.22), 2.1, 0.22, facecolor=GLASS, edgecolor="#111", lw=0.8))
    ax.annotate("N window wall", xy=(6.4, 12.55), ha="center", fontsize=7, color=FOREST, fontweight="bold")

    # Sangeetha — former glass cabin, adjacent to lab, not inside it
    room(ax, (2.85, 8.35), 2.2, 3.65, "#4A7C59", edge="#1E3A29", lw=1.8)
    label(ax, 3.95, 10.25, "SANGEETHA\nNutritionist / QC / R&D\nlaptop · spec sheets\nsample pass-through\nNOT in heat zone", 7.2, color=CREAM)

    # Lab upgraded
    room(ax, (2.85, 2.55), 2.2, 5.5, "#6B4423", edge="#2A1C14", lw=2.0)
    label(ax, 3.95, 5.45, "ROASTERY R&D LAB\ncooking / testing\nextractor · cooktop\nheat counters · sink\nfire blanket + CO2\naroma contained", 7.4, color=CREAM)

    # East: storage / campaign assets + meeting
    room(ax, (7.75, 8.25), 3.25, 3.75, "#D9C7A8", edge=WALNUT, lw=1.5)
    label(ax, 9.37, 10.2, "CAMPAIGN STORE\n+ 4-person huddle\nasset shelves", 7.5)
    room(ax, (7.75, 0.08), 3.25, 5.25, "#EFE6D6", edge="#666", lw=1.2)
    label(ax, 9.37, 2.7, "SUPPORT\nutility fridge relocated\nprint / packing\nvisitor waiting", 7.5)

    # Circulation arrows
    ax.annotate("", xy=(6.4, 11.6), xytext=(6.4, 0.5),
                arrowprops=dict(arrowstyle="<->", color="#B03024", lw=1.6))
    ax.text(6.85, 6.4, "N–S\nspine", fontsize=7, color="#B03024", fontweight="bold")
    ax.annotate("", xy=(2.7, 6.9), xytext=(1.4, 6.9),
                arrowprops=dict(arrowstyle="->", color=BRASS, lw=1.5))

    ax.text(5.6, 13.05, "▲  EXTERIOR  ·  LUSH TREE CANOPY  ·  NORTH FACADE  ▲", ha="center", fontsize=8, color=FOREST, fontweight="bold")
    north_arrow(ax, -0.55, 10.8, 0.85)

    ax.add_patch(FancyBboxPatch((-1.35, -1.55), 12.7, 1.25, boxstyle="round,pad=0.08", facecolor="white", edgecolor=BRASS, lw=1.2))
    ax.text(5.0, -0.50, "Occupants: Roshan Mahamood (CEO)  ·  Nikhil (Marketing Head)  ·  Sangeetha (Nutritionist / QC / R&D)  ·  Marketing team  ·  Lab users",
            ha="center", fontsize=7.2, color=INK)
    ax.text(5.0, -1.05, "Adjacency: Sangeetha beside lab  ·  Nikhil beside monitoring wall  ·  CEO at north window  ·  aroma/heat stay in lab with door closed + extract",
            ha="center", fontsize=7.2, color=WALNUT)

    fig.tight_layout()
    path = OUT / "02-proposed-zoning-plan.png"
    fig.savefig(path, dpi=160, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    return path


def circulation_plan():
    fig, ax = plt.subplots(figsize=(11.2, 12.6), facecolor=CREAM)
    ax.set_facecolor(CREAM)
    ax.set_aspect("equal")
    ax.set_xlim(-1.4, 13.0)
    ax.set_ylim(-1.4, 14.0)
    ax.axis("off")
    ax.text(5.6, 13.4, "CIRCULATION  ·  PUBLIC / STAFF / LAB FLOWS", ha="center", fontsize=14, fontweight="bold", color=ESPRESSO)

    ax.add_patch(Rectangle((0, 0), 11.2, 12.3, fill=False, ec=ESPRESSO, lw=2.2))
    room(ax, (0.08, 8.55), 2.55, 3.67, "#E8DDD0")
    room(ax, (0.08, 0.08), 2.55, 8.30, "#F0E6D4")
    room(ax, (2.85, 8.35), 2.2, 3.65, "#D5E4DA")
    room(ax, (2.85, 2.55), 2.2, 5.5, "#E2C9A0")
    room(ax, (5.15, 0.08), 2.5, 12.14, "#F7F3EA")
    room(ax, (7.75, 5.55), 3.25, 2.55, "#E8C9C2")
    room(ax, (7.75, 8.25), 3.25, 3.75, "#EFE6D6")
    room(ax, (7.75, 0.08), 3.25, 5.25, "#EFEAE0")
    ax.add_patch(Rectangle((2.55, 6.15), 0.32, 1.55, facecolor="#111"))

    # primary spine
    ax.annotate("", xy=(6.4, 11.8), xytext=(6.4, 0.4),
                arrowprops=dict(arrowstyle="<->", color="#B03024", lw=2.4))
    ax.text(6.95, 6.2, "PRIMARY\nSPINE", fontsize=8, color="#B03024", fontweight="bold")

    # gallery path
    ax.annotate("", xy=(1.35, 8.3), xytext=(1.35, 0.5),
                arrowprops=dict(arrowstyle="<->", color=WALNUT, lw=1.8))
    ax.text(0.2, 4.2, "GALLERY\nPATH", fontsize=7, color=WALNUT, fontweight="bold", rotation=90, va="center")

    # threshold
    ax.annotate("", xy=(6.0, 6.9), xytext=(1.5, 6.9),
                arrowprops=dict(arrowstyle="<->", color=BRASS, lw=2.0))
    ax.text(3.9, 7.25, "threshold node", fontsize=7, color=ESPRESSO)

    # lab access only from corridor, not through CEO
    ax.annotate("staff → lab", xy=(3.95, 7.9), xytext=(6.3, 4.8),
                fontsize=7, color=FOREST, fontweight="bold",
                arrowprops=dict(arrowstyle="->", color=FOREST))
    ax.annotate("visitors stay on spine", xy=(6.4, 11.2), xytext=(8.5, 11.6),
                fontsize=7, color="#8B3A2F",
                arrowprops=dict(arrowstyle="->", color="#8B3A2F"))

    north_arrow(ax, -0.4, 10.6, 0.75)
    ax.text(5.6, 12.7, "Keep 1.2 m min. clear on spine. Lab door swings into cabin, not corridor.", ha="center", fontsize=8, color=WALNUT)
    fig.tight_layout()
    path = OUT / "03-circulation-plan.png"
    fig.savefig(path, dpi=160, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    return path


def cctv_plan():
    fig, ax = plt.subplots(figsize=(11.2, 12.6), facecolor=CREAM)
    ax.set_facecolor(CREAM)
    ax.set_aspect("equal")
    ax.set_xlim(-1.4, 13.0)
    ax.set_ylim(-1.4, 14.0)
    ax.axis("off")
    ax.text(5.6, 13.4, "CENTRAL MONITORING  ·  CAMERA COVERAGE", ha="center", fontsize=14, fontweight="bold", color=ESPRESSO)
    ax.text(5.6, 13.05, "TV hub on east wall opposite threshold  ·  CEO privacy mode  ·  lab hygiene camera optional", ha="center", fontsize=8, color=WALNUT)

    ax.add_patch(Rectangle((0, 0), 11.2, 12.3, fill=False, ec=ESPRESSO, lw=2.2))
    room(ax, (0.08, 8.55), 2.55, 3.67, "#E8DDD0")
    label(ax, 1.35, 10.4, "CEO\nC1 privacy", 7)
    room(ax, (0.08, 0.08), 2.55, 8.30, "#F0E6D4")
    label(ax, 1.35, 4.2, "MARKETING\nC2", 7)
    room(ax, (2.85, 8.35), 2.2, 3.65, "#D5E4DA")
    label(ax, 3.95, 10.2, "QC DESK\nC3", 7)
    room(ax, (2.85, 2.55), 2.2, 5.5, "#E2C9A0")
    label(ax, 3.95, 5.3, "LAB\nC4 optional", 7)
    room(ax, (5.15, 0.08), 2.5, 12.14, "#F7F3EA")
    label(ax, 6.4, 1.2, "CORRIDOR\nC5 + C6", 7)
    room(ax, (7.75, 5.55), 3.25, 2.55, "#8B3A2F")
    label(ax, 9.37, 6.82, "TV HUB\n3–4 screens", 8, color=CREAM)
    room(ax, (7.75, 8.25), 3.25, 3.75, "#EFE6D6")
    room(ax, (7.75, 0.08), 3.25, 5.25, "#EFEAE0")
    label(ax, 9.37, 2.5, "ENTRY / SUPPORT\nC7", 7)
    ax.add_patch(Rectangle((2.55, 6.15), 0.32, 1.55, facecolor="#111"))

    cams = [
        (1.35, 12.0, "C1", 200),  # CEO looking south into room
        (1.35, 0.5, "C2", 90),
        (3.95, 11.7, "C3", 240),
        (3.95, 2.9, "C4", 90),
        (6.4, 11.9, "C5", 250),
        (6.4, 0.55, "C6", 90),
        (9.3, 0.5, "C7", 110),
    ]
    for x, y, name, theta in cams:
        ax.add_patch(Circle((x, y), 0.18, facecolor="#B03024", edgecolor="white", lw=0.8, zorder=6))
        ax.text(x + 0.28, y + 0.22, name, fontsize=8, color="#B03024", fontweight="bold", zorder=6)
        wedge = Arc((x, y), 2.8, 2.8, angle=0, theta1=theta - 35, theta2=theta + 35, color="#B03024", lw=1.2, alpha=0.7)
        ax.add_patch(wedge)

    north_arrow(ax, -0.4, 10.6, 0.75)
    ax.add_patch(FancyBboxPatch((-1.1, -1.25), 12.3, 1.05, boxstyle="round,pad=0.08", facecolor="white", edgecolor=BRASS, lw=1.1))
    ax.text(5.1, -0.55, "C1 CEO: occupancy + security, with privacy shutter / software mask during confidential calls. C4 lab: hygiene + safety, not product IP close-ups.",
            ha="center", fontsize=7.2, color=INK)
    fig.tight_layout()
    path = OUT / "04-cctv-coverage-plan.png"
    fig.savefig(path, dpi=160, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    return path


def materials_palette():
    fig, ax = plt.subplots(figsize=(12.4, 6.4), facecolor=CREAM)
    ax.set_xlim(0, 12.4)
    ax.set_ylim(0, 6.4)
    ax.axis("off")
    ax.set_facecolor(CREAM)
    ax.text(6.2, 6.05, "ROZA LAB  ·  MATERIALS & BRAND PALETTE", ha="center", fontsize=15, fontweight="bold", color=ESPRESSO)
    ax.text(6.2, 5.65, "Industrial-modern  ·  coffee / roastery warmth  ·  not a sterile lab", ha="center", fontsize=9, color=WALNUT)

    swatches = [
        (0.4, "#2A1C14", "Espresso", "CEO desk, slats, metal"),
        (2.35, "#6B4423", "Walnut", "lab partition, millwork"),
        (4.3, "#F5F0E6", "Cream", "walls, gallery tile read"),
        (6.25, "#C4A574", "Brass", "hardware, signage"),
        (8.2, "#1A1A1A", "Black metal", "frames, window mullions"),
        (10.15, "#4A7C59", "Olive QC", "Sangeetha zone accent"),
    ]
    for x, color, name, use in swatches:
        ax.add_patch(FancyBboxPatch((x, 2.55), 1.75, 2.7, boxstyle="round,pad=0.04", facecolor=color, edgecolor="#111", lw=1.0))
        tc = CREAM if color in ("#2A1C14", "#6B4423", "#1A1A1A", "#4A7C59") else INK
        ax.text(x + 0.88, 3.95, name, ha="center", fontsize=10, fontweight="bold", color=tc)
        ax.text(x + 0.88, 2.2, use, ha="center", fontsize=7.5, color=INK)

    ax.text(6.2, 1.45, "Lighting layers: ambient recessed LED (existing)  ·  task pendants over desks  ·  accent brass wall wash on brand wall  ·  lab: IP-rated, easily cleaned",
            ha="center", fontsize=8, color=INK)
    ax.text(6.2, 0.95, "Surfaces: keep glossy corridor tile; add washable compact laminate in lab; privacy film on CEO glass; acoustic felt on monitoring wall.",
            ha="center", fontsize=8, color=INK)
    ax.text(6.2, 0.40, "Brand: Roza / Rozana coffee-roastery character — espresso, walnut, cream, brass. Avoid hospital white and cold grey-only schemes.",
            ha="center", fontsize=8, color=WALNUT)
    fig.tight_layout()
    path = OUT / "05-materials-palette.png"
    fig.savefig(path, dpi=160, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    return path


def adjacency_diagram():
    fig, ax = plt.subplots(figsize=(11.5, 7.2), facecolor=CREAM)
    ax.set_xlim(0, 11.5)
    ax.set_ylim(0, 7.2)
    ax.axis("off")
    ax.set_facecolor(CREAM)
    ax.text(5.75, 6.8, "SPACE PROGRAM  ·  ADJACENCY", ha="center", fontsize=14, fontweight="bold", color=ESPRESSO)

    nodes = [
        (1.6, 4.6, "CEO\nRoshan", "#3C2415", CREAM),
        (4.0, 5.4, "Marketing\nteam", "#C4A574", INK),
        (4.0, 3.5, "Nikhil\nMkt Head", "#8B3A2F", CREAM),
        (6.6, 4.6, "Monitor\nTV hub", "#8B3A2F", CREAM),
        (9.3, 5.5, "Sangeetha\nQC / R&D", "#4A7C59", CREAM),
        (9.3, 3.4, "Roastery\nlab", "#6B4423", CREAM),
        (6.6, 1.8, "Spine\ncorridor", "#E8E0D4", INK),
    ]
    for x, y, t, fc, tc in nodes:
        ax.add_patch(FancyBboxPatch((x - 0.95, y - 0.7), 1.9, 1.4, boxstyle="round,pad=0.06", facecolor=fc, edgecolor=BRASS, lw=1.3))
        ax.text(x, y, t, ha="center", va="center", fontsize=8.5, fontweight="bold", color=tc)

    def link(a, b, color=WALNUT, style="-"):
        ax.annotate("", xy=b, xytext=a, arrowprops=dict(arrowstyle="-", color=color, lw=1.6, ls=style))

    link((2.55, 4.6), (3.05, 5.4))
    link((2.55, 4.6), (3.05, 3.5))
    link((4.95, 5.4), (5.65, 4.6))
    link((4.95, 3.5), (5.65, 4.6), color="#8B3A2F")
    link((7.55, 4.6), (8.35, 5.5))
    link((8.35, 5.5), (9.3, 4.1), color=FOREST)
    link((6.6, 3.9), (6.6, 2.5), color="#B03024")
    ax.text(5.75, 0.55, "Solid = required adjacency   ·   Sangeetha must touch the lab   ·   Nikhil must touch the TV hub   ·   CEO visually connected, acoustically separate",
            ha="center", fontsize=8, color=INK)
    fig.tight_layout()
    path = OUT / "06-adjacency-diagram.png"
    fig.savefig(path, dpi=160, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)
    return path


def main():
    paths = [
        current_plan(),
        proposed_plan(),
        circulation_plan(),
        cctv_plan(),
        materials_palette(),
        adjacency_diagram(),
    ]
    for p in paths:
        print("wrote", p)


if __name__ == "__main__":
    main()
