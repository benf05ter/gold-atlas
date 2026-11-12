How og/glacdep.webp and glacgrid.json were made from the 1964 map (page 1 of the PDF rendered at 200 dpi as p-000.png; the PDF is kept in the project's old/ folder):
1. mask.py: the state outline from the page -> state_mask.npy
2. fit.py: fits the atlas Wisconsin outline to it (Wisconsin Transverse Mercator plus scale, turn and shift; median edge error about 2 px, under 1 km) -> fit.json
3. inpaint.py: drops county lines and red ink from the page so the screens read cleanly
4. classify9.py: random forest on the five legend swatches plus a few map samples (texture of each screen) -> prob9raw.npy
5. clean13.py: smooths, keeps white only in the Driftless core, puts back the red end moraines, removes the red "Driftless Area" lettering -> lab13.npy
6. warp.py: resamples onto the atlas lon/lat grid -> glac.webp (overlay) and glacgrid.json (tap grid)
Known limits: drumlin arrows survive as small red dashes; Lake Winnebago reads as land; thin valley trains along the Mississippi are partly lost.
