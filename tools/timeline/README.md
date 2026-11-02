# Story timeline per treasure pin (atlas v520)

- `src/*.tl`: one block per pin (`@pin-id`), one line per event: `date | what happened | source` and an optional `| i` when the date is
  inferred from the story (a "c." date or a before/after span) rather than printed in the source. Written from the card text, the card's
  source list and the research/ notes; every line names its source. Owner names of today never go in.
- `build.py <pins.json> src tln.json`: checks every B, C and D treasure pin has a block (pins.json = a dump of the treasure pins), sorts each
  block by date, writes `tln.json`.
- `patch.py <atlas-dir> tln.json [og-data2.js]`: writes `TLN` into the data file (replacing an earlier block) and adds `timeline.js` as the
  last script of index.html (replaced on a re-run). Restamp sw.js after patching the app; re-run tools/perf/dclindex.py.
- Card: "Story timeline (n)" box right under the story, open when it has 6 lines or fewer.
- v520: 155 pins (22 B, 52 C, 81 D), 597 dated lines, +65 KB.
