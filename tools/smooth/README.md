# Smoothing passes

## OGSMOOTH1 (Nov 11 2026): white screen when zooming out
`python3 -I tools/smooth/patch.py a-f218a76394f8/index.html`, then restamp `sw.js` VERSION.

- **Cause.** Every map tile faded in with its own CSS opacity transition (`.ogtile{transition:opacity .18s}`). On iPhone (WebKit) an element with a running opacity transition is promoted to its own graphics layer, and the tiles drawn above it get layers too because they overlap it. A zoom-out replaces a whole screen of tiles at once, in up to four tile layers (street, relief, LiDAR, Iowa LiDAR). Many of those tiles are stand-ins drawn 4-16x larger than 256 px: the z-3 backdrop, and the relief and LiDAR tiles shown past their deepest level since the deeper-zoom change. Each layer gets a backing store up to a screen in size at 3x, so iOS runs out of graphics memory and kills the page, which shows as a white screen.
- **Measured** in headless Chromium as an iPhone 13 (CDP LayerTree, 300 ms / 3 Mbit network, LiDAR on, 7 zoom-out pinches from street level): peak layers went from 152 to 78 with the fix. Chromium squashes overlapping tiles into shared layers, so its memory totals barely move. The per-tile layer cost only shows up in WebKit, and this container has no WebKit.
- **Fix.** Tiles appear without the fade. The previous tiles stay underneath until the new ones have loaded, so nothing flashes. The farthest zoom-out is now 1.6x the region width instead of 2.5x. At 2.5x the region was a small blob in a field of world tiles.
- **Sweep after the fix:** 6 modes and 10 map types, each pinched out, panned and pinched in. No page errors, no OGE errors, no frame over 100 ms, and no DOM growth. Old-map and fire-map pictures stay released on zoom-out (MEMFREE still holds).
