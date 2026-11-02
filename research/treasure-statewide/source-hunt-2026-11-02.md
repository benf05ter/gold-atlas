# Source hunt for new treasure stories, started 2 Nov 2026 02:40Z (Neb: "What are some ways to find more lost treasure stories" / "Any of these you're not doing?")

Status key: RUNNING = in a PC list or a cloud pass now; QUEUED = written into the next list; WALLED = site blocks the cloud and the PC; SUNDAY = needs a person.

| # | Method | Who | Status | Notes |
|---|--------|-----|--------|-------|
| 1 | County-weekly pass: "probate fight / miser estate / hidden under" by state and decade | PC (a) newspapers.com | QUEUED (list 13) | sweep 3 (list 10B) already ran the "buried his money / pot of gold / miser" terms; list 13 adds estate-fight and "under the floor/hearth/woodshed" terms and the small weeklies |
| 2 | Robbery-loot trial coverage, one year after each robbery, for "never recovered" | PC (a) | QUEUED (list 13) | bank, train and express robberies already on the atlas first, then new ones |
| 3 | Guardian accounts and partition suits naming cash found on land | PC (b) Ancestry | QUEUED (list 13 D) | plus probate index scans of 28 counties (list 13 A-C) |
| 4 | WPA county folklore files (WHS, MNHS, Archives of Michigan) | cloud | RUNNING | WHS finding aids and MNHS catalog are open from the cloud; the files themselves are paper -> SUNDAY list for a reading-room order if an index hit names a county |
| 5 | 1960s-80s treasure magazines (True Treasure, Treasure World, Lost Treasure, Treasure Search) with original citations | cloud archive.org | THIN | archive.org metadata search 02:37Z: only "Treasure Magazine June 1985" and an Oak Island edition are scanned; no run of the 1960s-80s titles. Google Books snippets are open and are the next try. Physical runs: SUNDAY (ILL) |
| 6 | County centennial and 1880s-1920s county histories, full text | cloud archive.org + PC (b) | RUNNING | archive.org OCR search from the cloud; PC (b) list 13 E does Trempealeau, Buffalo, Pierce, Pepin, Dunn |
| 7 | Place names: Money Creek, Miser's Hollow, Bogus, Treasure, Pirate, Outlaw on GNIS and prd-tnm topos | cloud | DONE 02:37Z | 53 names in research/treasure-statewide/gnis-treasure-names.tsv; new candidates: Money Lake (Burnett WI), Money Creek (Houston/Winona MN), Treasure Creek (Gogebic MI), Bogus Hollow Run (Sauk), Bogus Bluff (Pepin, separate from the Richland one on the atlas), Pirate Island (Door), Treasure Island (Waukesha), Outlaw Lake (Lake Co MN), Bogus Brook (Mille Lacs). Next: origin stories for each via ChronAm/newspapers.com and county histories |
| 8 | HathiTrust county books and Wisconsin Lore / Michigan folklore volumes | WALLED | HathiTrust blocks the cloud; opened once for PC (a) 01:20Z, blocked again by 02:31Z. Wisconsin Lore pp. 233-245 is already on the SUNDAY list |
| 9 | Coffman and the 1001 Lost Treasures screenshots already in project-files | done earlier | DONE | research/1001-lost-treasures-screenshots/, research/discovering-wisconsin-screenshots/ |
| 10 | TreasureNet / rockchasing forum threads | WALLED | both blocked from the cloud; PC threads can read them between runs if asked |

New leads from any method go to research/newspapers-com/leads.tsv (newspaper) or research/court-records/new-leads-court.tsv (records), then to a card and a grade under the two-source rule.

## Cloud attempts 02:40-02:45Z
- archive.org full-text search: the website's FTS endpoint rejects API calls ("Unsupported page type"); metadata search finds no 1960s-80s treasure-magazine runs and no county-history hits by subject. Full-text passes therefore go to PC (b) (list 13 E) in the browser.
- WHS "Records" search URL 404s; UW "Archival Resources in Wisconsin" finding-aid search works but "folklore WPA" = 0 records. Next try: "Federal Writers' Project" and "Wisconsin Folklore" as terms (queued for the next cloud pass).
- MNHS collections search page loads (200); needs a parsed query, queued.
- Google Books API answered 429 (rate limit); retry later in the evening with single queries.
- GNIS names done (see table row 7).

## Walls test 02:42Z (Neb: "Can we get around the walled ones")
- WORKS from cloud: loc.gov/ChronAm search JSON; archive.org metadata + per-item OCR text; idaillinois.org; isgs; iastate ortho.
- RATE-LIMITED (429 to scripts, fine in a browser): Google Books web + API. -> PC (b) browser for full-view county histories.
- BLOCKED from cloud: HathiTrust (Cloudflare), FamilySearch, reflections.mndigital.org, digital.lib.uiowa.edu (JS check), idnc, quod.lib.umich.edu, digital.library.illinois.edu, catalog.hathitrust.org. MNHS newspaper hub search page errors (404 on query URL).
- Way round: the PC browser (HathiTrust opened for PC (a) 01:20Z without a check). Rule: 1 county/book per 15 min, stop at any check page, never click Agree/verify.
- Treasure magazines (True Treasure, Treasure World, Lost Treasure): no free scans found; ILL on the Sunday file.

## AnyFlip 02:54Z
- Neb's link https://anyflip.com/qbni/aymz/ = Lost Treasure Online Newsletter, 21 Jun 2016 (20 pp). No WI/MN/MI/IA/IL leads (research/books/anyflip-qbni-aymz.md). anyflip.com blocked from cloud; PC browser reads it.
- Follow-up: PC (a) lists the uploader's shelf (/qbni/) for other Lost Treasure issues; TOC scan for our five states -> research/books/anyflip-shelf.md. Domains to add: anyflip.com, online.anyflip.com (told Neb 02:52Z).
- 03:01Z: Neb sent mysteriouswritings.com (blocked from cloud) and 9 more AnyFlip items (szhv, iywr, yoyb, kxzo, uqmb, znqp, pnjb, gknf, jxej); all queued on PC (a) view-only; output research/books/. Domains to add: mysteriouswritings.com, anyflip.com, online.anyflip.com.
- 03:02Z: truetalesofburiedtreasure.com (W. C. Jameson) also blocked from cloud; queued on PC (a) after Mysterious Writings; output research/books/truetales-jameson.md, leads tag "ttbt". Domain to add: truetalesofburiedtreasure.com.
- 03:06Z: archive.org OCR readable from the cloud via https://archive.org/stream/<item>/<file>_djvu.txt (unblocked host); the /download/ host is blocked. Clements Idaho book and the Public Domain Treasure Hunter set (marketing mag) yielded nothing.
- GenealogyBank: bot challenge after ~8 searches; coverage in research/genealogybank/gaps.md (held: La Crosse 1874-1921, BRF 1867-1922, Grand Rapids MN 1896-1930, Durand, Galesville, Ellsworth, Prescott, Eagle River, Wabeno, Hurley, Ladysmith, Racine). Pacing: 1 search / 5 min.
- 03:07Z: metaldetectingforum.com OPEN from cloud but search needs a login; browse shows no regional legend sections; low yield (research/books/metaldetectingforum.md). true-tales-of-buried-treasure.sellfy.store BLOCKED from cloud -> PC (a) queue (look only, list titles/prices; purchase decision = Sunday file).
- 03:14Z: JSTOR list 1 done (0 paid opens): WMH/MN History sweeps empty; Annals of Iowa + Palimpsest NOT on JSTOR; Iowa Research Online blocked from cloud -> PC (b) browser. One out-of-region lead (Harrell, White Co IL) held. Fold3 shows Upgrade (premium images may be walled).
