# gold-atlas

Home-screen (offline) build of the Upper Midwest Gold and Treasure Atlas.

- The app lives in the folder named in `tools/site-folder.txt`. Open that folder's GitHub Pages address on the phone, then Share > Add to Home Screen.
- Rebuild after the Claude atlas changes: save the published atlas HTML, then
  `python3 tools/build.py atlas.html path/to/oldmap` and commit. Phones fetch the new version in the background and update on the next open.
- Finds, worked marks and hunt tracks stay on the phone. Use Finds log > Move your data to copy them to or from the Claude atlas.
