# Pattern: wall of slots

The open-loop shape for a script with **N parallel items** ("five automations",
"seven tools"). One worked instantiation of the spatial open loop described in
SKILL.md §1. See the neutral workbook at repository-root `docs/STORYTELLING-WORKBOOK.md`.

`wall.py` and `geom.py` here are the working modules, copied verbatim. Import
`wall` into every section builder so the dock target, the slot material and the
payoff line are identical everywhere.

## The shape

N sockets sit on one spine, with brackets grouping them into domains. They open
in the hook, on the line that promises the list. Each finished item docks into
its own socket on the way out of its section. The recap fills the wall with all N
completed items and draws one line through them.

## Why the details matter

- **Empty slots are sockets, not wireframes.** A glass plate with a directional
  edge light, holding a recessed well whose lighting is *inverted*: dark line at
  the top of the cavity, light line on its floor. That reads as a fixture waiting
  to be filled. A dashed placeholder reads as a missing asset.
- **The dock is a live camera move**, ~1.4s, flying the section's actual finished
  graphic down into the slot rect. Never a cut to a pre-made picture of the tile.
- **The wall comes up behind the finished graphic before the camera moves**, so
  every handoff re-shows all N slots with the filled ones still filled. That
  reminder, N times, is the retention mechanic.
- **The numeral rolls inside the same move**, as an odometer. Same start, same
  duration, same ease for both digits, or the row spacing collapses mid-roll and
  the glyphs merge into one band.
- **The payoff closes on the opening image.** One line draws through all N,
  entering the leftmost source and leaving the rightmost outcome, carrying the
  only arrowhead on the wall.

## Slot geometry is shared state

Pick it once, never move it. `wall.py`'s slot 1 sits at (320, 540) in a 1920x1080
world and is commented "MUST NOT MOVE" because `build_s01.py` hard-codes its dock
framing against it. Any section builder that redefines slot geometry silently
breaks every other section's dock, and no gate catches it.

## API

```python
import wall

CAM["DOCK"] = wall.dock_cam(1)           # camera transform landing the map in slot 1
lines, ids  = wall.wall_markup()         # the N sockets
lines, ids  = wall.spine_markup()        # spine, stubs, domain brackets, flow pulse
lines, ids  = wall.payoff_markup()       # the one line through all N

wall.wall_reveal_js(t)                   # bring the wall up behind a finished map
wall.slot_dock_js(i, t)                  # hand slot i to a live map flying in
wall.slot_fill_js(i, t)                  # recap: swap socket for baked miniature
wall.payoff_js(t)                        # draw the line, land the arrowhead
```

`slot_content_transform(i)` is the static twin of `dock_cam(i)`: it bakes a
finished graphic into a slot as a child, already scaled and positioned, so the
recap shows N miniature completed maps instead of N blank plates.

## Known gap

Recap slots 01 and 02 are authored 1:1. Slot 03's strokes are still derived from
a 0.143 camera scale, so its hairlines are thinner than its neighbours' at the
same apparent size. Fixing it properly needs a cross-section sigil-tagging
contract in `wall.py`. Deferred, not solved.
