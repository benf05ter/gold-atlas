# Dig spots (atlas layer `dig`, 2026-11-02)

Neb asked for "buried treasure" pins: spots to look for lost caches, from the research. Each dig spot is its own pin (layer `dig`, gold disc with a red X) on a lead's placed farmstead or parcel.

**Rule.** Lead grade B (two separate accounts), or C where two plats place the farm; the cache was never recovered in full; pin good to 450 m or better; never look-only ground (urban lots, graves, built-over land, no-detecting public land). Coordinates are the lead pin's own: no new guesses. Agreed with the Treasure thread 2026-11-02.

**In (12):** Murphy (Warsaw MN), Vejvoda (Rice Lake WI), Nielson (Morken MN) + his tree-claim site, Bronson tile (MI), Keeler (Liberty Twp MI), Noyes (Eden Twp MI), Cora Miller (Hartford MI), Carr (Dimondale MI; pin parcel is township land), Ogle (Medora IA), Mulchrone (Liberty Pole WI), Zopp (Trimbelle WI, C; pin checked in S1/2 NE1/4 sec 30 T26N R18W = the 1909 and c.1915 Zopp 80).
**Out:** Kuehn (jar recovered, on hold), Hoffman, Iwers, Dickson, Bjornaa (found/F), Roth, Chilson, Racine, Jackson (look-only), Horrigan, Hession, Ford (r600, place first), Heckes, Dolph, Knaggs (legend or possibly taken), Jacobson, Tweit, Eliza Wilson (pin conf C).

**Parcel overlay** (Neb, 00:22Z): zoomed in, the parcels within radius + 200 m are drawn (green = government-owned, grey = private) with the search ring. Sources: Wisconsin statewide parcels, MnGeo open parcels, Ingham County 2025, Warren County IA. No reachable parcel map for Branch, Jackson, Mason and Van Buren MI, so BLM PLSS quarter-quarter lines are drawn there (dashed brown). Only public/private and acres are kept; owner names never enter the atlas.

## Files
- `make_spec.py treasure.json spec-dig1.json parcels.json`: builds the hand-off spec from a dump of the live treasure cards plus the parcel file.
- `spec-dig1.json`: 12 new pins for `tools/batch225/apply.py` (tag `dig1`). In the Claude atlas they go into og-data2.js.
- `digspots.js`: the layer (row, icon, pin drawing, no bubbles, search ring, parcel lines, card links lead <-> dig spot). `patch.py <index.html>` inserts it before `</body>`; refuses a rerun.
- Order: patch.py on the page, apply.py on og-data, then `python3 -I tools/perf/dclindex.py`.
