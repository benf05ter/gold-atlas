# Float copper: where it might be (fc1, v303n)

`floatcopper.js` adds to the app:

- a **Where float copper might be (graded ground)** overlay in the Copper and Lake Superior layer section (`_cufloat`), with 11 zones in the atlas tier colours: A Copper Country gravels; B Ontonagon valleys, Chequamegon shore, Kettle Moraine; C Superior lobe red drift, eastern Wisconsin drift, Lake Michigan and Green Bay shore, Grand Traverse Bay; D central Upper Peninsula, southeast Minnesota; F Driftless Area. Tap a zone for the evidence, where to work, the rules, the float copper pins inside it and the sources.
- a **Float copper** map mode (mode menu), remembered on the phone with `og-fcmode`.
- a **Float copper: where it might be** list by grade on Start here (open at the top in Float copper mode, folded lower down otherwise).

Install or update: `python3 -I tools/floatcopper/patch.py a-f218a76394f8` (replaces its own script on a re-run; also adds the layer to the Copper and Superior preset and the mode to the mode menu), then restamp `sw.js` VERSION.

New pins (11, `spec-v303n.json`, applied with `tools/batch225/apply.py ... v303n`, then `tools/perf/dclindex.py`): finds from R. D. Salisbury, *Notes on the Dispersion of Drift Copper*, Trans. Wisconsin Academy vol. VI (1881-83), pp. 42-50 (archive.org `transactionsofwi67188187wisc`), which compiles Whittlesey, Lapham, Chamberlin, Irving, Sweet and the state surveys. County-only records (Sauk, Chippewa, Fillmore, Benzie, Antrim, Grand Traverse; the Peshtigo River piece) are in the zone cards, not pinned. The Whittlesey 3,000 lb west-fork boulder is very likely the Ontonagon Boulder and is not pinned separately.

Zone outlines are hand drawn and approximate; the red drift and Driftless zones reuse the atlas's own `GL.red` and `GL.driftless` outlines.

Still to read for more finds: Geology of Wisconsin vol. II p. 27 (Lapham) and p. 210 (Chamberlin, Kettle range), vol. II p. 619 and vol. IV p. 353 (Irving and Sweet, cited by Salisbury); Whittlesey, *On the Fresh-water Glacial Drift of the Northwestern States* (Smithsonian Contributions, 1866); Winchell's 1875 Minnesota report p. 71.
