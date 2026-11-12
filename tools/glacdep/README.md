# Glacial deposits of Wisconsin (gd1, v303q)

`glacdep.js` adds to the app:

- a **Glacial deposits map (Wisconsin, 1964)** overlay (`_glacdep`, Glacial drift section, also on in Gold mode): the 1964 WGNHS map (after Thwaites 1956) traced into its five classes (end moraine, ground moraine, outwash unpitted, outwash pitted, lake basins; Driftless left clear), drawn from `og/glacdep.webp` at half opacity.
- **tap to read the ground**: with the layer on, a tap in Wisconsin shows the class, what it means for gold and for meteorites, and a key.
- a **"Ground here (1964 glacial map)"** line on the pop-up of every Wisconsin gold and meteorite pin (panning, report, pit, glacial, trap, target, meteor).

Install or update: `python3 -I tools/glacdep/patch.py a-f218a76394f8` (copies the picture into og/, fills the tap grid from `glacgrid.json`, replaces its own script on a re-run, lists the picture in the offline cache), then restamp `sw.js` VERSION.
How the trace was made: `trace/README.md`. Notes: `research/glacial-deposits-1964.md`.
