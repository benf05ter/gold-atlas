# Meteorites: sources and grading (mt1, v303p)

What the atlas's Meteorites mode rests on. Grades are the odds of finding *another* meteorite on that ground, not how famous the fall is. Strict: no zone is above C, because even the best Midwest strewn field gives a few grams for long days of walking.

## How it was built

- **Every recorded fall and find in WI, MN, MI, IA and IL within about 6 h of Eau Claire (46 pins, layer `meteor`).** From the Meteoritical Bulletin Database (Meteoritical Society) as mirrored in NASA's Meteorite Landings table (TidyTuesday 2019-06-11 copy, `rfordatascience/tidytuesday` on GitHub; the `id` column is the MetBull code, so each card links `metbull.php?code=<id>`). lpi.usra.edu itself is blocked from the cloud, so the codes were not opened one by one. Two later finds added by hand: Vienna WI (found 2009, classified 2024) and Hamburg MI (fell 2018).
- Out of scope and left out: the Dakota, Nebraska, Indiana and Ohio records inside the search box; Tilden IL (1927, far south).
- MetBull coordinates are often only to the minute, so pins are `p:'area'` with a 4-15 km radius. Moved from the database point to the place the sources give: Forest City (to near Thompson, 11 mi NW of Forest City) and Homestead (to the middle of the field between High Amana and Homestead).
- Pin grade (`tov`): C for the two best strewn fields, D for the four next, E for everything else (single finds or small falls whose stones were taken), so no pin claims more than the record supports.

## Strewn fields (zones, hand-drawn, approximate)

| Grade | Zone | Basis | Sources |
|---|---|---|---|
| C | Mifflin WI 2010 | ~3.6 kg L5 in dozens of stones, Livingston/Montfort to Mineral Point, sparse, later finds extended it SE | WGNHS meteorites page; MetBull 52090; Meteorite Times (recovery of the 4/14/2010 fall) |
| C | Homestead IA 1875 | ~100-300+ stones, ~230 kg, field ~3 x 5 mi S of the Iowa River and SW of Homestead; 74 and 48 lb stones S of High Amana | Iowa Geological Survey "Meteorites in Iowa"; MetBull 11901; Wikipedia |
| D | Estherville IA 1879 | mesosiderite, masses ~431/151/106 lb plus many fragments; outline not recorded (circle = search area) | IGS; MetBull 10059; estherville.org |
| D | Forest City IA 1890 | hundreds of H5 stones over a strip 3-4 mi x 1.5-2 mi near Thompson; direction not recorded (circle) | IGS; MetBull 10119; The Palimpsest |
| D | Trenton WI (found 1858-1870s) | many IIIAB iron masses, ~505 kg, small area E of West Bend; township square drawn | WGNHS; MetBull 24045; MSU meteorite collection |
| D | Hamburg MI 2018 | radar-tracked, 55+ stones, strip ~5 mi WNW from US-23 to Bass Lake, many on lake ice | NASA ARES Hamburg page; Sky and Telescope |
| E | Park Forest IL 2003 | 18+ kg, roofs hit, Crete to Olympia Fields; built up and heavily searched | MetBull 18106; Wikipedia; NASA ARES |
| E | Colby WI 1917 | two stones (~80 and 150 lb), no small ones reported | WGNHS; MetBull 5395 |

Not drawn: no broad "good ground" zone, because meteorites are not concentrated by geology. Plowed fields, rock piles, gravel pits and till cuts are in the tips instead.

## Tips in the mode (Start here box)

Magnet cane (neodymium magnets in a PVC tube) and the big pulse-induction loop on a PVC frame; recommended pair here = magnet cane + normal detector on all-metal/ferrous. Meteorite-or-iron checklist: magnet, streak (none/faint grey vs red-brown hematite, black magnetite), fusion crust vs glassy slag, regmaglypts and no vesicles, heft, filed window (metal flecks, chondrules), nickel swab (dimethylglyoxime), manufactured shapes ruled out, then a university lab. Fresh falls: AMS fireball reports, NASA ARES radar posts. Ownership: landowner owns it (Iowa Supreme Court 1892, Forest City stone); federal land = federal property.

## Still to read (would sharpen outlines or grades)

- MetBull pages for each code (blocked from cloud; open on a PC): exact coordinates, piece counts, strewn-field notes.
- Mifflin strewn-field map (skyfallmeteorites.com) and the Meteoritical Bulletin 99 entry.
- Popular Astronomy 25 (1917), Koep, "Wisconsin meteor falls at Colby and Cornell": exact fall spots.
- Shepard/Smith 1880 papers on Estherville for the field outline; Iowa Geological Survey EM-35.
- Homestead 1875 contemporary accounts (Iowa City papers) for where stones were thickest.
