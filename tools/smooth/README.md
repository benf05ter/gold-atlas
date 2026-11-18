# Smoothing passes

## OGSMOOTH1 (Nov 11 2026): white screen when zooming out
`python3 -I tools/smooth/patch.py a-f218a76394f8/index.html`, then restamp `sw.js` VERSION.

- **Cause.** Every map tile faded in with its own CSS opacity transition (`.ogtile{transition:opacity .18s}`). On iPhone (WebKit) an element with a running opacity transition is promoted to its own graphics layer, and the tiles drawn above it get layers too because they overlap it. A zoom-out replaces a whole screen of tiles at once, in up to four tile layers (street, relief, LiDAR, Iowa LiDAR). Many of those tiles are stand-ins drawn 4-16x larger than 256 px: the z-3 backdrop, and the relief and LiDAR tiles shown past their deepest level since the deeper-zoom change. Each layer gets a backing store up to a screen in size at 3x, so iOS runs out of graphics memory and kills the page, which shows as a white screen.
- **Measured** in headless Chromium as an iPhone 13 (CDP LayerTree, 300 ms / 3 Mbit network, LiDAR on, 7 zoom-out pinches from street level): peak layers went from 152 to 78 with the fix. Chromium squashes overlapping tiles into shared layers, so its memory totals barely move. The per-tile layer cost only shows up in WebKit, and this container has no WebKit.
- **Fix.** Tiles appear without the fade. The previous tiles stay underneath until the new ones have loaded, so nothing flashes. The farthest zoom-out is now 1.6x the region width instead of 2.5x. At 2.5x the region was a small blob in a field of world tiles.
- **Sweep after the fix:** 6 modes and 10 map types, each pinched out, panned and pinched in. No page errors, no OGE errors, no frame over 100 ms, and no DOM growth. Old-map and fire-map pictures stay released on zoom-out (MEMFREE still holds).

## OGSMOOTH2 (Nov 18 2026, v303r): optimization pass
`python3 -I tools/smooth/patch2.py a-f218a76394f8`, then `python3 -I tools/smooth/restamp.py`.

Sweep on headless Chromium as an iPhone 13 (4x CPU slowdown for phone speed): `detailHTML` on all 45,407 pins, ~290 buttons across
every tab, sheet and menu, 7 modes, zoom and pan, offline restart through the service worker, drive mode with 40 GPS fixes, the hunt
recorder, and a layer/memory census over 11 pinch-outs.

- **Card crash.** `cqc-stuntz-fur-post` (a fur post) was filed in `trap` (where streams drop gold), which has no `srank`/`srcs`, so
  its card threw and never opened. Moved to `history` like the other fur posts in og-data.js; the trap card now tolerates a pin
  without them.
- **"Rank 1 of NaN gold streams in Wisconsin".** The same pin made every Wisconsin gold-trap card print NaN. Fixed by both changes.
- **Best ground tab.** The rank-2 list (1,108 rows) was built at start-up into the hidden tab: 15,500 elements, half the page.
  Opening "Some old ground: patches survive" built all 9,321 rows at once: the page went from 31,000 to 161,000 elements in a 2.4 s
  freeze at phone speed, a likely memory kill on an iPhone. Both lists now draw 60 rows, then 150 more each time you scroll near
  the end (an IntersectionObserver; tapping the "Showing n of N" line also loads more). Every row is still there.
- **Rank and tier caches** (`RKX`, `TIER` base `get`) were building a key string on each of ~3.3 million calls at start-up; they now
  compare the cached version and ground grade directly (same invalidation).

Before/after (4x CPU, two runs each): page elements at start 31,065 -> 16,394; DOMContentLoaded 12.4-12.8 s -> 11.2-11.6 s;
main-thread long tasks 12.8-12.9 s -> 11.3-11.9 s; opening the rank-3 list 2,359 ms (two 0.8-0.9 s freezes) -> 58 ms, no freeze;
first card 1.4-1.7 s -> 1.1 s. Tier and rank of the other 45,406 pins: identical before and after (hash of id:tier:rank). No page errors anywhere in the sweep before or after, other than the card crash.

Left alone (noted for later): ranks are recomputed ~5 times per pin at start-up because several blocks bump `RKV`
(227,706 `rkCalc` calls for 45,407 pins); coalescing those is the next big start-up win but needs care so no grade goes stale.
Parks/parcels/flood tiles ask for a few cells that don't exist (404, handled). WebKit could not be tested here (no WebKit in the
container), so the iPhone white-screen fix from OGSMOOTH1 is still unconfirmed on a real phone; Chromium shows 28 layers and
~53 Mpx@3x after 11 pinch-outs, the same as after OGSMOOTH1.
