# Scripts

Regenerate directional overlays and 2D plans.

```bash
python3 -m pip install -r requirements.txt
python3 annotate_current.py
python3 generate_diagrams.py
```

- `annotate_current.py` — compass, camera facing, zone labels, arrows on all 13 survey photos. North = window wall with trees.
- `generate_diagrams.py` — current plan, proposed zoning, circulation, CCTV, materials, adjacency.

Does not call cloud image models. Proposed photoreal interiors are stored under `../images/proposed/`.
