# Dig spots (v1, 2026-11-02): builds spec-dig1.json for tools/batch225/apply.py from the live treasure cards (treasure.json dump).
# A dig spot is a separate pin (layer 'dig') on a placed farmstead or parcel where a documented cache is still unaccounted for.
# Rule: lead grade B (two separate accounts), or C where two plats place the farm; money not recovered in full; pin good to 450 m or better;
# not look-only (urban lots, graves, built-over land and no-detecting public land are left out). Coordinates are the lead pin's own: no new guesses.
import json,sys
def pip(x,y,rg):
  c=False; j=len(rg)-1
  for i in range(len(rg)):
    xi,yi=rg[i]; xj,yj=rg[j]
    if (yi>y)!=(yj>y) and x<(xj-xi)*(y-yi)/(yj-yi)+xi: c=not c
    j=i
  return c
SRCL={'n6uYoouQZW75n5WI':'Wisconsin statewide parcel map','us_mn_state_mngeo':'Minnesota open parcels (MnGeo)','ySzhFSJfYeginRjx':'Ingham County parcels 2025','lcU85Lh3UvDs5Naw':'Warren County, Iowa parcels','plss':'BLM PLSS quarter-quarter lines'}
P=json.load(open(sys.argv[3])) if len(sys.argv)>3 else {}
T={x['id']:x for x in json.load(open(sys.argv[1]))}
D=[
 ('tw-mn-warsaw-murphy-crock-1920','B',
  "About $24,000 in gold that James Murphy kept hidden about the house was never found; only one crock ($6,000) turned up, in 1920, under a rotten board in the barnyard by the cow barn.",
  "His only farmstead (1900 plat dot, 1938 air photo) is gone and farmed over, but 2021 LiDAR still shows the building pads and a pit. Work the house pad first, then the barnyard edge: the 1920 crock lay just outside the old barnyard.",
  "Private cropland: ask the owner; best after harvest."),
 ('tw-vajvoda-rice-lake-1925','B',
  "After his wife died in 1925 John Vejvoda dug up about $6,000 she had hidden, and said there was 'a large quantity of silver buried between the road and the house'. No later find was reported.",
  "The 1939 air photo shows the only farmstead on the Vejvoda 80, about 60 m north of the south road. The strip between that road and the house site is the story's own spot: grid it slowly, silver reads lower than gold.",
  "Private farm: ask the owner."),
 ('tw-mn-morken-nielson-miser-1916','B',
  "Lars Nielson never used a bank and left $10,000-13,000 in gold, silver and currency that nobody found; the administrator's search and night diggers in 1919 came up empty.",
  "His sod shanty stood 32 years and was thought the likeliest spot; the 1909 plat dot and the 1939 farmstead are both inside this ring on his homestead quarter (GLO patent 1885). The later house had no cellar.",
  "Private farmland: ask the owner."),
 ('tw-mn-morken-nielson-miser-1916-treeclaim','B',
  "Second spot for Lars Nielson's missing $10,000-13,000: the building site on his 1895 tree claim.",
  "The 1939 air photo shows a second building site here; it is probably the 'old shack used as a barn' that diggers worked at night in 1919. Check around the shack footprint and any old tree rows.",
  "Private farmland: ask the owner."),
 ('tw-mi-bronson-gold-farm-1939','B',
  "In 1939 boys dug up a drain tile with $1,880 in gold and a pipe with $1,120 turned up 12 ft away. A second tile, plugged with concrete at both ends, was played with and then lost; it was never found again.",
  "The caches were in the house yard of the family strip in the N half of sec. 5 (1894 and 1915 atlases); the house stood at the N end by the township-line road. Search that yard: a concrete-plugged tile or iron pipe reads as a strong iron or mixed target.",
  "Private farm: ask the owner."),
 ('tw-mi-liberty-twp-keeler-beans','B',
  "Noah Keeler, who once hid gold in a sack of beans, died in 1892 and about $7,000 he left could not be found; his estate's final account (1894) reports no find.",
  "He lived on this farm from 1840 to 1892: the 1874 atlas house dots on the west edge of the NW quarter of sec. 14 are the target, with the old farmyard around them.",
  "Private land: ask the owner."),
 ('tw-mi-eden-twp-noyes-gold-1935','B',
  "In 1935 Fred Noyes said gold he buried about 30 years earlier was still on his family's old farm ($25,000 to $85,000 in different wire copies). He had lost his map and a day's dig with a federal agent failed.",
  "The 1904 atlas puts the Noyes 80 here with the house mark at the NW corner of the sec. 5 forty. His landmarks were the rail fence and the house: find the old house site and fence lines on the 1938 air photo, then search out from them.",
  "Private farm: ask the owner."),
 ('tw-mi-hartford-cora-miller-1897','B',
  "Cora Miller's last words in 1897 were 'Seventeen hundred dollars, dig, dig.' Two Paw Paw papers reported it the same week; no find was reported.",
  "The Miller farmhouse on the 1873 and 1895 atlases is the pin; Cora's own forty (NW of NW sec. 22) is about 700 m NW and is the second place to look.",
  "Private land: ask the owner. Maple Hill Cemetery across the road is look-only."),
 ('tw-mi-dimondale-carr-gold','B',
  "In 1895 a man dragging an orchard side hill here turned up a box of gold nuggets and flakes; the story says the dying Englishman Carr buried 'this gold with other nuggets and money in this neighborhood'.",
  "The 1895 atlas house mark on the E edge of the forty (sec. 30, Delhi Twp) with the side-hill orchard ground around it. The rest is legend: treat it as a long shot on a proven find spot.",
  "The pin parcel is township land (Delhi Charter Township, 2025 parcel map): ask the township before detecting there; the farms around it are private."),
 ('tw-ia-medora-ogle-farm-1907','B',
  "F. Marion Ogle hid gold about his shanty-and-dugout farm; days before his fatal accident in 1907 he banked $10,000 of it, and people believed more was still hidden.",
  "The 1902 Warren County atlas shows his 80 acres with a house dot; the pin is on that house. Look for the dugout's hollow and the shanty site near it.",
  "Private land: ask the owner."),
 ('tw-mulchrone-liberty-pole-1899','B',
  "Patrick Mulchrone was murdered in 1899 and was believed to have hundreds or thousands of dollars hidden about his place. In 1900 a gang tore out the old homestead's foundation looking for it; no find was reported.",
  "The 1896 plat building dot on his 113 acres, close to the Zitzner farm as the 1899 paper says. The dug-out foundation should still show as a hollow with a spoil bank: search the yard, outbuildings and lane around it, not the hole they already dug.",
  "Private farm: ask the owner."),
 ('wd4-trimbelle-zopp','C',
  "Blacksmith Michael Zopp died in May 1912 without telling where he had hidden his savings (several thousand dollars, up to $20,000 in some reports). Relatives dug on his farm that June without success.",
  "The pin is in the S½ NE¼ sec. 30 T26N R18W (checked on the BLM section grid), the 80 that the 1909 Ogle atlas marks 'MICHL ZOPP 80' with a house mark and the c.1915 plat marks 'Mich'l Zopp 80 Est.': the farm he held when he died. Start at the house mark.",
  "Private farm: ask the owner."),
]
new=[]
for lid,grade,why,where,acc in D:
  x=T[lid]; r=(x.get('acm') or x.get('prec'))[0]
  short=lid.split('-',1)[1] if lid.startswith(('tw-','wd4-')) else lid
  src=x['src'][:]
  p={'id':'dig-'+short,'L':'dig','n':'Dig spot: '+x['n'],'la':x['la'],'lo':x['lo'],'stt':x['stt'],'co':x.get('co') or '',
     'y':x.get('y') or '','pl':x.get('pl') or '','v':x.get('v') or '','c':'documented' if grade=='B' else 'newspaper','s':'unknown',
     'p':'approx','tov':grade,'tovw':'Dig spot on a grade '+grade+' lead (placed farm, cache not recovered): see the lead card','acm':[r,(x.get('acm') or ['','plat'])[1] or 'plat'],'pinconf':x.get('pinconf') or 'C','lead':lid,'dgrade':grade,
     'st':'Why here: '+why+' '+where,
     't':acc+' Search radius about '+str(r)+' m around the pin. Lead grade '+grade+'; the full story, every source and the pin evidence are on the lead card.',
     'src':[[s,''] for s in src]}
  pa=P.get(p['id']) or {}
  if pa.get('f'):
    k='plss' if pa['src']=='plss' else 'parcel'
    fs=[[f['pub'] if f['pub'] is not None else -1, f['ac'], f['g'], f.get('lab') or ''] for f in pa['f']]
    hit=[f for f in fs if any(pip(p['lo'],p['la'],rg) for rg in f[2][:1])]
    if k=='parcel':
      if hit: h=hit[0]; land=('The pin falls in a '+('government-owned' if h[0]==1 else 'private')+' parcel'+(' of about '+str(round(h[1]))+' acres' if h[1] else '')+'.')
      else: land='The pin falls outside any mapped parcel (likely road right-of-way).'
      npub=sum(1 for f in fs if f[0]==1)
      land+=' '+str(len(fs))+' parcels drawn around it'+(', '+str(npub)+' of them government-owned (shaded green)' if npub else ', all private')+'.'
    else:
      h=hit[0] if hit else None
      land='No county parcel map is reachable online here, so the survey quarter-quarter lines are drawn instead'+(' (the pin is in the '+h[3]+' of its section)' if h and h[3] else '')+': ask at the township assessor for the owner.'
    p['parc']={'k':k,'s':SRCL.get(pa['src'],pa['src']),'f':fs,'txt':land}
  new.append(p)
json.dump({'new':new,'edit':{}},open(sys.argv[2],'w'),ensure_ascii=False,indent=1)
print(len(new),'dig spots')
