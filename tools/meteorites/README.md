# Meteorites: where they fell (mt1, v303p)

`meteorites.js` adds to the app:

- a **Meteorite falls and finds** pin layer (`meteor`, new Meteorites section): all 46 recorded meteorites in the five states, each graded (`tov`) by the odds of finding more there.
- a **Meteorite strewn fields (graded)** overlay (`_metzone`): C Mifflin, Homestead; D Estherville, Forest City, Trenton, Hamburg; E Park Forest, Colby. Tap a field for the story, where to work, the rules, the pins inside and the sources.
- a **Meteorites** map mode (mode menu), remembered on the phone with `og-mtmode`; the pins also join the Gold mode.
- a **Meteorites: where to look and how to tell** guide on Start here (open at the top in Meteorites mode): fields by grade, how to hunt (magnet cane, big PVC pulse-induction loop, detector on ferrous), where the odds are, a meteorite-or-iron checklist, fresh falls, ownership rules.

Install or update: `python3 -I tools/meteorites/patch.py a-f218a76394f8` (replaces its own script on a re-run; adds the layer to LAYERS, the short name, colour, smart-sort exclusion and mode-menu line), then restamp `sw.js` VERSION.

Pins: `python3 -I tools/meteorites/build_spec.py tools/meteorites/spec-v303p.json`, then `tools/batch225/apply.py ... v303p` and `tools/perf/dclindex.py`. Sources and grading: `research/meteorites.md`.
