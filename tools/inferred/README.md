# Hunches: inferred pins (atlas layer `inf`, 2026-11-02)

Neb asked "Do you have any inference based pins?" This layer holds hunches: places the research points to that do NOT meet the
record standard (two sources, or a farm or lot placed on a plat). Each is clearly marked INFERRED, carries its reasoning chain step
by step, and says what record would confirm it and what would kill it.

**Rules.** Off by default. Violet dashed ring with a "?" (never the gold, chest or X markers). Never graded: no `tov`, no rank (the
best-spot ranking skips the layer), and the tier chip and badge show "?" / "Hunch" instead of a letter. Never in the "Browse all
treasure leads" list (not in TRB.LAY). The lead's own pin, grade and card text stay as they are; the lead card gets a "Hunch" line
linking to its hunch pins. Owner names of today never appear (1900-1913 census and plat names are historical).

**In (9):**
- Koster (Garden peninsula MI): the two unnamed tracts on the 1913 Delta atlas in his 1900 census neighbourhood: 80 in S-central
  sec 21 and 160 in SW1/4 sec 22 T38N R19W (BLM PLSS centroids). Lead stays D at Sac Bay r1500.
- Portage 1887 coins: "the point" = Ketchum's Point (Turner 1904), foot of old Mac St on the 1878 Snyder, Van Vechten plate;
  43.5379,-89.4665 r500 (PC (a) reading). Lead stays D r2000.
- Smalling (Mount Vernon Twp, Black Hawk IA), Callahan (Lafayette Twp, Allamakee IA), Ludtke (Palermo Twp, Grundy IA): the 1900
  census township of each man, township centre from Iowa civil townships (NRCS ArcGIS), ring covers the township.
- Hein's logging camp: near Tony (Chippewa Co. until 1901; John Hein Co. at Tony, 1916). Weak.
- Eau Claire Lumber Co. North Fork camps: around the company's dam, sec 23 T29N R5W (1888 plat). Weak.
- Sterling and Leonard camp (1884): North Fork in the town of Thorp, around the MRL dam sec 27 T29N R4W (1893 plat). Weak.

**Considered, not pinned:** Gregg/Greig, Dover (the Sarena Greig match gives a date, not a place; no farm on a plat yet).
Trombler, Fergus Falls (no. 11 Mill St is on neither the N. nor the S. Mill frontage of the 1896 Sanborn, so the chain breaks).
Kiel schoolhouse (no clue to the original site). Schaefermeyer and Conrad May (already pinned at section level).
Black Hawk gold, New Albin (the only school site near it, Gade School, is across the line in Minnesota).

## Files
- `hunches.py out.json`: the hunches (edit here) -> `spec-inf1.json` for `tools/batch225/apply.py` (tag `inf1`). In the Claude
  atlas the pins go into og-data2.js.
- `inferred.js`: the layer (row, icon, pin, ring when zoomed in, INFERRED box on the card, tier override, lead links).
  `patch.py <index.html>` inserts it before `</body>`; refuses a rerun.
- Order: patch.py on the page, apply.py on og-data, then `python3 -I tools/perf/dclindex.py`.
