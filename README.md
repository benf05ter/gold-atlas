# gold-atlas

Home-screen (offline) build of Old Ground (formerly the Upper Midwest Gold and Treasure Atlas).

- The app lives in the folder named in `tools/site-folder.txt`. Open that folder's GitHub Pages address on the phone, then Share > Add to Home Screen.
- Rebuild after the Claude atlas changes: save the published atlas HTML, then
  `python3 tools/build.py atlas.html path/to/oldmap` and commit. Phones fetch the new version in the background and update on the next open.
- Finds, worked marks and hunt tracks stay on the phone. Use Finds log > Move your data to copy them to or from the Claude atlas.
- Rock & metal ID (the Rock ID button in the Minerals map mode) lives in `tools/rockid.js` and `tools/rockid.css`. Since atlas v92 the Claude atlas carries it too, with the Identify page (one search for coins, rocks, metals, relics, jewelry and tests) that opens it; `build.py` only injects it into older atlases. To update just the ID guide in the current build, run `python3 tools/patch_rockid.py` and commit, and re-apply it to the Claude atlas as well so the two stay in step.
