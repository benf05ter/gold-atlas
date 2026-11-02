# Where to look, ranked (micro-spot model), Nov 2026

Adds a "Where to look, ranked" box to cache cards in Old Ground: 2-3 ranked spots per pin, each hung on a documented
feature (house, barn, orchard, fence, creek bank, stump, granary) with a one-line reason, a confidence and a basis.

- **Basis**: `rec` the record names the spot; `map` a plat, Sanborn, aerial or LiDAR places the feature; `inf` the spot is
  inferred from period hiding habits hung on a documented feature (always labelled "inferred" in the app).
- **Confidence**: High = the record names the spot; Medium = documented feature plus a habit seen in this atlas's solved
  hoards; Low = weaker link.
- **No guessed spots**: a pin whose home or cache site is not yet placed gets no spots, only a "Not ranked yet" note that says
  what to place first and where to look once it is placed. Built-over or grave sites stay look-only.

## Habit evidence (solved hoards already in the atlas, counted once per find place)
- Outbuildings (about 10): Dickson smokehouse doorway, Iwers machine shed, Branstad shed, Harris shed, Bader woodshed,
  Bjornaa granary trunk, Lemuel Hill barn floor and granary wheat, Onnen henhouse, Smalling granary site, Roth barn floor.
- Inside the house or another building (about 10): Bjornaa under the stove, Tenhaaf attic, Schmidt under the house,
  Blackmore attic timbers and floorboard pipes, Burke house razing, Maxwell back porch, Trombler trunk and book cover,
  Kammeyer mill wall, Vejvoda sacks and coat, Behr trunk and desk.
- Yard within about 30 m (7): Murphy barnyard, Scheuermann back yard, Kuehn plum trees, Bronson tile and pipe, Dillon garden,
  Peterson garden, Ahonen jars round the cabin.
- Marker tree, stump or log (6): Olesen maple, Hoffman orchard tree, Bergblom creek-bank tree, Briggs Lake stump, Ford stump,
  Le Center ash log.
- Field or stone pile (about 4): Callahan plowed field, Ahonen fields, Weesaw field, Ole Johnson stone pile.

## Coverage (75 of 148 B/C/D treasure pins)
- 38 pins with ranked spots (74 spots), 37 with a "Not ranked yet" note. 10 non-cache pins skipped (lost cargo, gold
  occurrences, crowd sites, history pins). The other ~63 B/C/D pins are legends with no fixed site, found-and-gone caches,
  or closed land (parks, national forest, federal), and get no box.
- Files: `wl_entries.py` (the model, edit here), `build_wl.py out.js` (writes the JS block). In the app the block is appended to
  `og-data.js`; in the artifact it goes in `og-data2.js`. The card shows it through one hook after the existing tips line in
  `detailHTML`: `${typeof wlHTML==='function'?wlHTML(p):''}`.
- Dig-spot pins (thread "Add dig-spot pins for likely caches") can use the rank-1 spot of a pin as the dig-spot position.
