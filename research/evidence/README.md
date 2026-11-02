# Evidence badge and Dowsing-free (Nov 2026)

Every treasure and wreck card in Old Ground now says what the pin rests on, sorted from the card's own source list:
court, probate or land record; census or vital record; newspaper of the time (marked when read through a forum copy);
plat, map or air photo; county history or official report; later folklore collection (Gard, Hollatz, Brody, Stark, Dodge);
treasure magazine, treasure book (Coffman), forum post or web list; dowsing or psychic claim.

The "Dowsing-free" layer switch (Treasure section, off by default, remembered on the phone) hides pins whose only
sources are treasure magazines, treasure books, forum posts or web lists, and pins whose spot was named by a psychic.
Grades (tov) are not changed. A pin comes back on its own once a newspaper, record or county history is added to its sources.

- `provenance.tsv`: every treasure and wreck pin as the app sees it, with categories, psychic notes and shown/hidden.
- Code: `tools/evidence/evb.js` (classifier + card badge + switch), `tools/evidence/apply.py` (patches a page).
- Psychic, dowser and dream mentions were read by hand (PSY table in evb.js): Calligan (spot named by a 1935
  spiritualist: hidden), Porter's Mills Old Silver Mine, Patterson sugar camp, Clinton Robbers Cave, Eldora Webster
  (psychic only in the story: shown, with a note). Any other card mentioning a dowser or psychic gets a generic note.
