# Iowa and Illinois expansion (6-hour drive from Eau Claire)

Neb, 2026-10-30 23:33Z: "start expanding the map into Iowa and Illinois but just within 6 hours of Eau Claire" and "Give it the Eau Claire treatment".

## How the 6-hour line was drawn

No routing server is reachable from the cloud (OSRM, Valhalla blocked), so drive time is estimated: known drive times from Eau Claire to 26 hub towns (Minneapolis 1h35, La Crosse 1h35, Rochester 2h10, Madison 2h50, Dubuque 3h45, Rockford 4h, Mason City 3h25, Waterloo 4h25, Ames 4h25, Des Moines 4h50, Davenport 5h, Chicago 4h55, Peru IL 5h, Joliet 5h30, Galesburg 5h50 and others), plus the straight-line distance from the hub to the county's GNIS feature centre x 1.3 at 50 mph. A county is IN when that estimate is 6h03 or less. Woodbury (Sioux City) is added by hand: the model puts it at 6h35, but Minneapolis to Sioux City is about 4h05, so about 5h40 from Eau Claire. Estimates are good to about +/-15 minutes; the edge list below is the next ring if Neb wants it.

Script: drive.py and cty.py in this folder; drive.json has every IA/IL county with its estimate.

## Counties IN (estimated hours from Eau Claire)

**Iowa, 67 counties:** Allamakee (2.6), Winneshiek (2.8), Howard (3.1), Clayton (3.4), Mitchell (3.4), Worth (3.4), Cerro Gordo (3.4), Fayette (3.4), Winnebago (3.5), Chickasaw (3.5), Dubuque (3.8), Floyd (3.9), Delaware (4.0), Hancock (4.0), Bremer (4.0), Franklin (4.1), Buchanan (4.1), Butler (4.3), Kossuth (4.3), Black Hawk (4.4), Story (4.4), Wright (4.4), Jackson (4.5), Emmet (4.6), Jones (4.6), Hardin (4.7), Osceola (4.7), Boone (4.8), Benton (4.9), Grundy (4.9), Linn (4.9), Humboldt (4.9), Palo Alto (4.9), Polk (4.9), Webster (4.9), Dickinson (5.0), Hamilton (5.0), Clinton (5.0), Clay (5.0), Scott (5.1), Tama (5.2), Cedar (5.2), Lyon (5.3), Dallas (5.3), Warren (5.3), Pocahontas (5.3), O'Brien (5.3), Johnson (5.3), Marshall (5.3), Jasper (5.4), Greene (5.4), Iowa (5.5), Calhoun (5.5), Madison (5.6), Sioux (5.6), Guthrie (5.7), Muscatine (5.7), Marion (5.7), Poweshiek (5.7), Buena Vista (5.9), Clarke (5.9), Cherokee (5.9), Lucas (5.9), Washington (6.0), Plymouth (6.0), Louisa (6.0), Woodbury (5.7, by hand)

**Illinois, 27 counties:** Winnebago (4.0), Stephenson (4.2), Jo Daviess (4.3), Boone (4.3), Ogle (4.6), DeKalb (4.8), Carroll (4.8), McHenry (4.8), Lee (5.0), Cook (5.0), Rock Island (5.1), Kane (5.2), Lake (5.2), Whiteside (5.2), Putnam (5.3), LaSalle (5.4), Kendall (5.4), Will (5.5), Bureau (5.5), DuPage (5.5), Mercer (5.6), Marshall (5.6), Henry (5.7), Grundy (5.9), Stark (6.0), Knox (6.0), Woodford (6.0)

## Edge ring, NOT covered (6h05 to 6h30)

Sac IA (6.1), Carroll IA (6.1), Adair IA (6.1), Warren IL (6.1), Livingston IL (6.1), McLean IL (6.1), Union IA (6.2), Peoria IL (6.2), Keokuk IA (6.2), Audubon IA (6.2), Mahaska IA (6.3), Kankakee IL (6.3), Monroe IA (6.3), Tazewell IL (6.3), Henderson IL (6.4), Wayne IA (6.4), Decatur IA (6.4), Des Moines IA (6.4), Ida IA (6.5)

Galena = Jo Daviess (IN). Rock River = Winnebago, Ogle, Lee, Whiteside, Rock Island, Boone (all IN). Chicago fringe = Cook, DuPage, Lake, McHenry, Kane, Will, Kendall (all IN). Mississippi river counties IN: Allamakee, Clayton, Dubuque, Jackson, Clinton, Scott, Muscatine, Louisa (IA); Jo Daviess, Carroll, Whiteside, Rock Island, Mercer (IL).

## Order of work (county-depth order, nearest county first inside each pass)

1. GNIS historical features (post offices, schools, churches, locales, mills, ferries, mines) and vanished towns
2. GLO/BLM land entries and plat books (Iowa: Iowa Digital Library, Iowa Geographic Map Server; Illinois: IDA, ISGS historic maps)
3. Sanborn maps (LoC), schools/churches, river landings, cemeteries (OSM outlines, look-only), CCC camps, Mississippi shipwrecks
4. Lost-treasure and buried-money leads (TreasureNet, archive.org county histories, LoC Chronicling America)
5. LiDAR / aerial checks on the best pins; parcels where reachable

Rules: tiers S-F; two-source rule above C; single source capped C; graves and national forest/park historic sites look-only; history through 1964; honest pin radius on every pin.

## Handoff

handoff/ holds batch files in the county-depth format (new-pins JSON with the atlas pin fields, plus enrich JSON keyed by existing pin id, plus TSV for leads). Each batch is sent to the Ground check thread to publish.

## Log

- 2026-10-31 ~00:40Z: batch 1 handed to Ground check (handoff/batch1/): 3,769 GNIS vanished-site rows graded on LiDAR or satellite, 4,707 look-only cemeteries, 352 "Church site?" pins.
- Blocked from the cloud (asked Neb to add): digital.lib.uiowa.edu, ortho.gis.iastate.edu, www.idaillinois.org, isgs.illinois.edu, clearinghouse.isgs.illinois.edu, idnc.library.illinois.edu, iagenweb.org. www.loc.gov answers with a Cloudflare check on and off.
- County histories: 449 archive.org books for the 94 counties fetched (list books.json in work/); full-text phrase sweep -> treasure leads in batch 2.
- 2026-10-31 ~01:15Z: batch 2 (treasure leads) handed to Ground check: handoff/batch2/leads-iail.tsv, 53 rows (2 B, 34 C, 17 D), persons-iail.tsv to the court/probate thread for the Ancestry list, PC read items to the coordinator.
- 2026-10-31 ~01:05Z: www.loc.gov open again. Batch 3 (handoff/batch3/) handed to Ground check: second-source check of every batch 2 lead in Chronicling America plus PC Newspapers.com reads; 3 leads up to B (Dickson/Palmyra, Iwers/Sunbury, Harmon mail-plane diamonds), Whiskey Hollow corrected to 1904 with a loot-field pin, Letts 1934 stays D. leads/ferries-landings.md is noisy (many "Ford" surnames); not placed. plat-sources.md lists 43 archive.org plat books/atlases for the counties.
- 2026-10-31 ~01:30Z: batch 4 (handoff/batch4/): 8 new treasure leads from a Chronicling America sweep of Iowa/Illinois papers + McGregor legend update; persons-b4.tsv to the court/probate thread.
- 2026-11-01 19:12Z (Treasure thread): Dickson/Palmyra plat-placed by PC (a), 1902 Hovey & Frame Warren atlas p.17, sec 23 T77N R23W E edge; pin 41.4588,-93.4631 r250, stays B; handed to Ground check for next PR. Write-up research/plats/dickson-palmyra-warren-1902.md (zip l).
- 2026-11-01 19:15Z (Treasure thread): Ogle/Medora plat-placed by PC (a), 1902 Warren atlas p.6, F. M. Ogle 80 ac S part sec 10 T74N R24W; pin 41.2230,-93.6082 r300; C -> B (card's own condition met); handed to Ground check. Medora is in sec 27 (old "N edge sec 8" note in warren-ia-plat.md was wrong). Write-up research/plats/ogle-medora-warren-1902.md (zip l).
- 2026-11-01 19:26Z (Treasure thread): Calligan stays D on sec 2 T90N R31W (Lizard Twp). PC (a) found Cath. Calligan 160 SW1/4 sec 36 + NW1/4 sec 35 T90N R30W (Webster Co, Jackson Twp, 1909 Standard Atlas p.41, farmstead c.42.5654,-94.3435), a later family farm, not "Lizard township" of the 1935 story; no move. 1918 Pocahontas atlas: sec 2 = Kenny land. 1930s Pocahontas plat asked of PC (a).
- 2026-11-01 19:30Z (Treasure thread): Dickson -> F (probate case 2574 Report on Discovery of Property 1 Oct 1909: searchers satisfied no other money; gold $10,005 + bank $3,354 = news $13,300). Pin stays as F history marker.

## Garnett/Garrett barn 1913 (tw-il-alexis-garnett-barn-1913), Sunday 2 Nov 2026
Neb sent the Rivoli Twp plate (1914 Standard atlas, uiuc.1149205). Rivoli = T14N R1W (New Windsor in sec 13, BLM check). No "Garnett". Two Garrett parcels: E. G. Garrett 80 and Mrs E. M. Garrett 80, sec 16, W of Hopewell Switch (~41.203,-90.503). That is 7 mi N of North Henderson and 10 mi NNE of Alexis, so it does not fit "4 mi W of North Henderson" or "2.5 mi NE of Alexis". The barn farm should be on the NORTH HENDERSON Twp plate (T13N R1W) of the same atlas; asked Neb for that plate. No card change.
- UPDATE 01:21Z: PC (a) read the North Henderson Twp plate (uiuc.1149205 seq 11): "Richard Garrett 196.60" N half sec 30 T13N R1W; second Garrett 53.95 SW corner sec 31. Pin moved to 41.0890,-90.5440 r400 conf B; grade D (found). Sent to Ground check 01:21Z. Bureau uiuc.5441698 is Limited view: Dover/Hudson plate still unplaced.
- 01:30Z Nov 2 (PC (a), UIowa): Smalling -> D. K. Smalling 80 x2 sec 5 T90N R13W Mt Vernon Twp (1910 atlas node 536876), pin 42.6330,-92.4100 r500 conf B. Callahan -> Ed. 119.59 + H. 40 sec 31 T98N R3W Lafayette Twp (1917 atlas dir node 553786), pin 43.2614,-91.2404 r600 conf C. Harvey not in Butler Twp 1917 dir; Joseph Brown not in 1902 Dodge R26W. Sent to Ground check 01:32Z.

## Laird 1927 placements (03:45Z Nov 2)
Boone mound: GNIS Boone River mouth 42.3105,-93.9361 (Vegors Cemetery / Lott monument). Spirit Lake: GNIS Marble Beach 43.4700,-95.1242. Livermore 1.5 mi E of 42.8686,-94.1852; Bloody Run (Humboldt) mouth 42.8314,-94.1675. Andrew 42.1536,-90.5924 → Brush Creek 42.1203,-90.5118; midpoint used r3000. State Center 42.0167,-93.1635; 1 mi E 8 mi S ≈ 41.905,-93.150 (Rhodes 41.9255,-93.1863). Bellevue 42.2586,-90.4229. GNIS Iowa file now in scratchpad gnis/Text/DomesticNames_IA.txt.
