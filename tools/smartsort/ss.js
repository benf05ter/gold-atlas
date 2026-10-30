// ---------- Smart sorts (v185): six ways to order the Spots list, worked out from what each pin already carries ----------
// Untouched ground, Layers stacked, Lost and never found, Money passed hands, Crowd-years, Water edges and paths.
// Everything is read from pin fields (ug grade and ground-check text, plat/survey/fire-map flags, years, sources, pin precision),
// so new plat counties and checks join the sorts without code changes. WATERD (og-data.js, optional) holds metres to today's water.
// metres from each water pin to today's nearest lake, river, stream or pond (Overture Maps base/water, 2026-10-21 release; 0 = the pin sits in today's water)
const WATERD={"sh-legion-beach-stillwater":0,"pt01-mcgilvray-s-ferry-sec-21-t18n-r8w":0,"sc-1578248":0,"fb-meridean-ferry":0,"vs-2354281":200,"d-point-douglas-beach":49,"ppo87-st-croix-mineral-spring-sec-33-t33n-r19w":0,"ab3-westons-rapids":26,"sh-mt-simon-rocks":30,"fr-ojibway-and-fur-trade-portage-across-minne":0,"ab2-gans-ferry":0,"sv78-grand-rapids-foundry":27,"pc88-ferry-at-grand-rapids-sec-3-t35n-r7w":82,"nw-prescott-ferry":7,"sv78-grand-rapids-mill2":40,"hist-23":0,"ld-grand-ave-landing":65,"vs-1582111":93,"sv78-hudson-kinnmill":4,"d-gage-reed-ferry":144,"vs-660171":182,"d-park-point":63,"sh-pettibone-beach":16,"vs-1582091":94,"fr-little-rapids-of-the-minnesota-wells-s-pos":24,"cr-garrison-village-sauk":9,"ld-kelsey-landing":34,"vs-2069183":197,"d-big-falls-swim":19,"pd88-ford-red-cedar-river-grant":77,"sf-eau-claire-wharf-and-e-m-fish-co-sash-and-door-factory":69,"d-reads-landing":123,"fr-harriet-island-bathing-beach":0,"d-rainy-lake-city-mill":0,"sv78-grand-rapids-tannery":177,"my-202-ferry-st":197,"vs-1843090":2,"m-beach-black-river-harbor":0,"pp77-red-wing-ferry-wisconsin-landing-sec-10-":17,"m-beach-baraga":193,"vs-2717700":220,"pm80-trap-rapids-station-sec-13-t30n-r7e":154,"m-beach-lake-gogebic":56,"g87-lake-gogebic-hotel":189,"vs-1817522":537,"sv78-grand-rapids-rablin":126,"ld-downsville-mill":75,"sc-1851057":141,"pt01-arcadia-mineral-spring-sec-29-t21n-r9w":64,"d-st-croix-bluffs":315,"sv78-grand-rapids-sawmill":166,"ld-steamboat-levee":215,"hist-51":206,"fr-l-anse-boom-of-1871-73-houses-floated-on-s":105,"sf-eau-claire-stein-s-ice-house":254,"fb-wacouta-beach":0,"vs-660038":234,"pbp77-steam-ferry-at-durand-sec-21-t25n-r13w":213,"vs-1581922":377,"pc88-spring-sec-2-t29n-r8w":214,"pbp77-saw-mill-landing-sec-31-t25n-r13w":38,"vs-1623878":435,"d-excelsior-park":70,"ld-cf-spring-house":218,"ld-durand-landing":236,"pc88-grand-rapids-hotel-sec-4-t35n-r7w":288,"sf-eau-claire-t-leinenkugel-s-ice-house":404,"fr-cold-spring-mineral-springs-and-waite-mill":43,"sf-arcadia-mineral-springs-hotel":231,"d-caryville-ferry":205,"mf-duncan-spring-st":0,"d-lake-altoona-beach":92,"sc-1578414":0,"d-lake-eau-claire-beach":22,"d-ec-steamboat-landings":511,"fr-minnewashta-ottawa-village-and-springs":743,"vs-1815041":126,"vs-660310":455,"d-half-moon-beach":22,"vs-660451":208,"vs-1582044":56,"sv78-grand-rapids-highschool":541,"vs-1581971":635,"vs-1581891":597,"ab-pattersons-rapids":0,"vs-660245":415,"vs-660396":531,"vs-660406":665,"vs-659408":318,"vs-660392":833,"pc88-spring-sec-21-t30n-r7w":737,"d-lake-menomin-beach":0,"fr-portage-bay-to-lake-onamia-canoe-portage":0,"fb-menomin-fan":0,"ppo87-spring-by-james-cording-farmington-sec-8":335,"sv78-grand-rapids-trotting":688,"vs-660300":192,"ppo87-spring-by-e-h-florschutz-sterling-sec-32":326,"vs-660056":398,"pc88-spring-sec-21-t30n-r7w-2":568,"fr-daniel-whitney-s-mill-on-the-upper-wiscons":742,"fr-carver-village-landing-and-carver-creek-mo":474,"vs-660354":0,"vs-1581046":1054,"ppo87-spring-by-ole-johnson-sterling-sec-30-t3":174,"fr-brownsville-steamboat-landing-1848-1854":496,"vs-1817503":582,"gs-gilbert-mill":46,"sv78-arcadia-mill":23,"vs-1581871":3,"ppo87-spring-by-j-h-blanding-st-croix-falls-se":103,"sc-1840885":701,"vs-660418":413,"vs-1846490":594,"d-byllesby":147,"fr-hennepin-village-eden-prairie-secs-34-35-g":424,"pc88-springs-sec-7-t29n-r7w":939,"hist-50":389,"fr-good-thunder-s-ford-and-winnebago-village":921,"fr-carnelian-beach-south-shore-of-mille-lacs":336,"vs-660591":1104,"vs-660301":1446,"vs-1624026":96,"pp77-adams-ferry-landing-sec-3-t24n-r18w":190,"vs-660409":49,"vs-2676825":1367,"vs-660120":75,"vs-660394":781,"vs-660601":282,"vs-1582062":1431,"vs-660371":577,"vs-1843051":215,"fr-belanger-cabin-on-spring-lake-nininger":293,"ps97-landing-hill-school":242,"vs-660374":1148,"vs-1622512":367,"vs-660397":232,"fr-mckay-s-1814-landing-on-the-wisconsin-and":445,"vs-1850575":1172,"d-lake-wissota-beach":608,"vs-660316":715,"pbp77-grist-mill-and-mill-pond-sec-31-t20n-r10":314,"vs-660437":38,"pb88-springs-by-r-d-brown-sec-20-t32n-r11w":687,"vs-660407":611,"vs-1876877":474,"fr-little-rapids-fur-trading-posts-minnesota":484,"vs-660082":969,"ab4-osceola-spring-hotel":1155,"fr-pig-s-eye-parrant-s-whiskey-landing":128,"vs-660283":177,"vs-660072":1057,"vs-660282":136,"tg-fort-winnebago-portage":224,"vs-1817527":2084,"pbp77-ferry-boat-landing-sec-20-t23n-r15w":49,"fr-shelden-s-store-houghton-1852-and-portage":55,"fr-rockford-rocky-ford-sawmill-and-winnebago":287,"vs-660273":4,"vs-1582124":1327,"vs-1582078":690,"vs-1622513":1421,"vs-660272":811,"ppo87-spring-by-a-peterson-osceola-sec-12-t33n":830,"vs-1845467":405,"fr-richland-city-first-county-seat-at-the-low":69,"vs-1582110":276,"fr-french-rapids-and-whitely-island-mississip":234,"pbp77-spring-sec-19-t21n-r12w":12,"vs-1582115":614,"pb88-spring-by-j-p-lees-sec-4-t32n-r11w":2456,"vs-1582042":1604,"pc88-spring-sec-33-t30n-r8w":138,"vs-660057":26,"vs-2069204":40,"vs-1624100":1362,"d-coon-fork-beach":211,"pb88-spring-by-c-h-garner-sec-20-t32n-r11w":1217,"vs-1834148":2872,"vs-660425":127,"vs-1817528":2982,"fr-ross-s-landing-jefferson-west-channel-of-t":0,"vs-660145":522,"vs-1581886":3047,"fr-barrett-s-ferry-on-the-wisconsin-river-183":268,"pb88-springs-at-the-sioux-creek-dairy-farm-se":3177,"vs-2050805":706,"pc88-spring-sec-31-t31n-r10w":30,"fr-catlin-s-rocks-landing-richmond":814,"pb88-spring-by-w-v-cranson-sec-29-t32n-r11w":1037,"vs-2444165":794,"pc88-spring-sec-22-t30n-r7w":845,"d-square-lake":126,"pb88-spring-by-g-w-brown-sec-8-t32n-r11w":3840,"fr-deer-creek-fox-landing-and-the-projected-d":60,"vs-660405":721,"vs-2444164":220,"pc88-spring-sec-8-t29n-r7w":84,"vs-660115":491,"pb88-maple-spring-stock-dairy-farm-spring-sec":2372,"pc88-spring-sec-19-t29n-r7w":1665,"hist-21":84,"vs-1582092":1577,"vs-660158":1021,"vs-1582191":350,"vs-660341":252,"vs-1624120":1093,"vs-660307":103,"vs-1817506":768,"m-beach-van-riper":67,"vs-1834330":465,"vs-1581935":1023,"pb88-spring-by-b-massie-sec-19-t32n-r11w":1308,"vs-660081":238,"pp77-spring-and-fish-hatching-house-sec-21-t2":195,"pc88-spring-sec-32-t31n-r10w":699,"m-beach-bewabic":266,"pd88-spring-eau-galle":247,"fb-noquebay-lakeview":163,"fr-john-henes-park-poplar-point-swimming-beac":0,"pc88-spring-sec-26-t28n-r10w":48,"pm80-depot-by-c-h-kelly-on-the-milwaukee-lake":931,"vs-1624033":78,"vs-1582165":316,"vs-660058":831,"sc-2444145":311,"vs-660220":401,"m-beach-craig-lake":229,"fr-grainwood-summer-colony":68,"m-beach-porkies":234,"d-big-marine":141,"fr-coney-island-resort-clearwater-waconia-lak":82,"d-schulze":8,"fb-ash-clarkson-beach":0,"m-beach-brimley":402,"m-beach-twin-lakes":122,"dwyer-north-shore-thomsonite":0,"sh-dells-eau-claire-beach":303,"fr-agate-bay-beach-two-harbors":0};
const SSORT=(()=>{
  const NOGO=new Set(['target','trap','panning','report','glacial','geo','pit','copper','superior','cmine','model','drill','deposit','lake','public','restricted','rock','prehist','landmark','wreck']);
  const S={k:'',map:false,cache:{},key:''};
  const T=p=>(p._sst||(p._sst=[p.n,p.pl,p.v].join(' ')));
  const ugT=p=>(p.ug&&p.ug[1]||'')+' '+(p.st||'');
  const ok=p=>!NOGO.has(p.L)&&!(p.ug&&p.ug[0]==='X')&&!(p.acc&&p.acc[0]==='stop');
  const worked=p=>typeof WKS==='function'&&WKS(p.id)==='worked';
  const sc=p=>{ try{ return RKX(p).sc||0; }catch(_){ return 0; } };
  // years named in a date field: "1839-1922" -> [1839,1922], "1880s-1900s" -> [1880,1909], "By 1894" -> [1894]
  function yrs(s){ s=String(s||''); if(!s||/^\s*before\b/i.test(s)) return []; const out=[];
    for(const m of s.matchAll(/\b(1[6-9]\d\d)(s)?\b/g)){ const y=+m[1]; if(m[2]&&y%100===0) continue; out.push(y); if(m[2]) out.push(y+9); }
    return out.filter(y=>y>=1650&&y<=1964); }
  // dated witnesses: who saw people on this ground, and when
  function obs(p){ if(p._sso) return p._sso; const o=[], add=(y,l,f)=>{ if(y>=1650&&y<=1964) o.push([y,l,f]); };
    for(const k in p){ const m=/^p[a-z]*?(\d\d)$/.exec(k); if(m&&p[k]===1){ const yy=+m[1]; add(yy>=60?1800+yy:1900+yy,'plat book','plat book'); } }
    if(p.gs) add(yrs(p.y)[0]||1850,'land survey','land survey');
    if(p.sv78) add(1878,'county atlas','1878 atlas');
    if(p.sf){ const m=/\((\d{4}) fire map\)/.exec(p.n); add(m?+m[1]:(yrs(p.y)[0]||1890),'fire map','fire map'); }
    if(p.nw||p.c==='newspaper') yrs(p.y).forEach(y=>add(y,'newspaper','newspaper'));
    else if(!p.sf&&!p.gs&&!p.sv78&&!Object.keys(p).some(k=>/^p[a-z]*?\d\d$/.test(k))){ const nm=p.n.split(/[,(:;]| on | at | in | near /)[0].trim().split(/\s+/).slice(0,4).join(' '); yrs(p.y).forEach(y=>add(y,nm,'records')); }
    const u=ugT(p);
    const tm=/the (\d{4}) (?:USGS )?topo(?: map)?[^.;]*?(still shows buildings|draws a building on|draws a building nearby|draws buildings|shows a building)/i.exec(u); if(tm) add(+tm[1],'topo map','topo map');
    const am=/Air photo check \(UW air photo, [A-Za-z]+\.? \d+, (\d{4})[^)]*\):\s*([^.]*)/i.exec(u);
    if(am&&/farm|house|build|barn|yard|school|church|store|mill|cabin|depot|hall|resort/i.test(am[2])&&!/no (farm|build|house)|gone|bare|empty/i.test(am[2])) add(+am[1],'air photo','air photo');
    return p._sso=o; }
  function srcFam(p){ const f=new Set(obs(p).map(o=>o[2]).filter(x=>x!=='records'));
    if(/^vs-|^sc-/.test(p.id)) f.add('USGS place names');
    for(const s of p.src||[]){ const t=s[0]||''; if(/topoView|WHAIFinder/.test(t)) continue;
      f.add(/Sanborn/.test(t)?'fire map':/plat book/i.test(t)?'plat book':/survey plat|General Land Office/i.test(t)?'land survey':/Chronicling|Journal|Daily|Tribune|Gazette|Herald|Times|News\b|Leader|Press|Republican|Democrat|Telegram/.test(t)?'newspaper':/GNIS/.test(t)?'USGS place names':/your |Your /.test(t)?'your notes':/National Register|NRHP/.test(t)?'National Register':'history book'); }
    return f; }
  // neighbours within r metres (grid of ~0.01 deg cells, built once per pin count)
  let GR=null, GN=0;
  function near(p,r){ if(!GR||GN!==PTS.length){ GR=new Map(); GN=PTS.length; for(const q of PTS){ const k=Math.floor(q.la*100)+','+Math.floor(q.lo*100); (GR.get(k)||GR.set(k,[]).get(k)).push(q); } }
    const out=[], a=Math.floor(p.la*100), b=Math.floor(p.lo*100), c=Math.cos(p.la*Math.PI/180);
    for(let i=-1;i<=1;i++) for(let j=-1;j<=1;j++) for(const q of GR.get((a+i)+','+(b+j))||[]){ const d=Math.hypot((q.la-p.la)*111320,(q.lo-p.lo)*111320*c); if(d<=r) out.push(q); }
    return out; }
  const GRD={A:4,B:3,C:2,D:1};
  const PLACE=['county','town','section','farm','exact spot'];
  function placed(p){ let t=({exact:4,nrhp:4,google:4,naip:4,topo:4,mylist:4,plss:2,approx:2,area:2,island:2,gnis:3,town:1,county:0})[p.p]; if(t==null) t=1;
    if(p.pinconf==='A') t=Math.max(t,4); else if(p.pinconf==='B') t=Math.max(Math.min(t,3),3); else if(p.pinconf==='C') t=Math.min(t,1);
    if(t===2&&/\bfarm\b|homestead|\bon the [A-Z][a-z]+ (farm|place|land)\b/i.test(p.pl||'')) t=3; return t; }
  const EVW={documented:3,newspaper:2,report:1,rumor:1,lead:1,legend:0};
  const MONEY=[[/\b(general )?stores?\b|merchant|mercantile|trading post|company store|\bshop\b|market\b/i,'store',3],[/hotel|\binn\b|tavern|saloon|boarding house|halfway house|stopping place|road ?house|brewery/i,'hotel or saloon',3],[/\bbank\b/i,'bank',3],[/ferry|landing\b/i,'ferry landing',2.5],[/stage (stop|station|line|house|barn)|\bdepot\b|railroad station|\bstation\b/i,'stage stop or depot',2.5],[/\bmills?\b|sawmill|grist/i,'mill',2],[/post office/i,'post office',1.5],[/blacksmith|creamery|cheese factory|livery|cooper/i,'shop',1.5]];
  const moneyK=p=>{ for(const m of MONEY) if(m[0].test(p.n)) return m; return null; };
  const CROWD=[[/fair ?grounds?|county fair|race ?track|driving park|ball ?(park|field|ground)|picnic|grove\b|bandstand|pavilion|dance hall|camp ?meeting|chautauqua|resort|amusement|skating|bathing|beach/i,'crowd ground',1.3],[/\bdepot\b|\bstation\b|ferry|landing\b|church|hall\b|opera house|courthouse/i,'meeting place',1.1],[/school|academy/i,'school',1]];
  const crowdK=p=>{ for(const m of CROWD) if(m[0].test(p.n)) return m; if(p.L==='gather'||p.L==='beach'||p.L==='camp') return [0,'gathering place',1.2]; if(p.L==='school'||p.L==='school2') return [0,'school',1]; return null; };
  const SPAN={'crowd ground':30,'meeting place':40,'school':40,'gathering place':25};
  const LOOTH=/\bhoard(s|ed|ing)?\b/;
  const LOOT=/buried|cache\b|hid(den|ing)? (his |her |the |their )?(money|gold|cash|coins?|silver|treasure|loot|payroll)|lost (payroll|gold|money|mine)|never (been )?(found|recovered)|\bloot\b|strong ?box|robbers?['’]? (money|gold|loot)|treasure/i;
  const WATER=/beach|swim|bathing|\bford\b|ferry|landing\b|\bsprings?\b(?! (valley|field|brook|creek|grove|hill|dale|prairie))|portage|boat ?(house|livery)|\bdock\b|wharf|steamboat|rapids|mill ?pond|ice (house|harvest)|river ?bank|lake ?shore/i;
  // metres to today's water: WATERD (Overture water, made at build time) or the drawn rivers and big lakes (coarse)
  let SEG=null;
  function segs(){ if(SEG) return SEG; SEG=[]; const push=l=>{ for(let i=1;i<l.length;i++) SEG.push([l[i-1][0],l[i-1][1],l[i][0],l[i][1]]); };
    try{ (BASE.rv||[]).forEach(r=>(r.l||[r]).forEach(push)); (BASE.lk||[]).forEach(push); }catch(_){} return SEG; }
  function wdist(p){ if(typeof WATERD==='object'&&WATERD[p.id]!=null) return [WATERD[p.id],1];
    const c=Math.cos(p.la*Math.PI/180), X=p.lo*111320*c, Y=p.la*111320; let best=1e9;
    for(const s of segs()){ if(Math.abs(s[1]-p.la)>0.3&&Math.abs(s[3]-p.la)>0.3) continue;
      const ax=s[0]*111320*c, ay=s[1]*111320, bx=s[2]*111320*c, by=s[3]*111320, dx=bx-ax, dy=by-ay, L=dx*dx+dy*dy;
      const t=L?Math.max(0,Math.min(1,((X-ax)*dx+(Y-ay)*dy)/L)):0, d=Math.hypot(X-ax-t*dx,Y-ay-t*dy); if(d<best) best=d; }
    return [best,0]; }
  const fmtM=m=>m<1000?Math.round(m/10)*10+' m':(m/1609).toFixed(m<16090?1:0)+' mi';
  const SORTS={
    untouched:{n:'Untouched ground first',d:'Ground grade first (A never built over, B patches left), then what the old topo, LiDAR and 1938 air photos say: never rebuilt, then abandoned after 1938, then plowed, then lawns and lots.',
      f(p){ if(!p.ug||!GRD[p.ug[0]]) return null; const u=p.ug[1]||'', am=/Air photo check[^:]*:\s*([^.]*)/i.exec(p.st||''), ua=u+' '+(am?am[1]:''); let s=GRD[p.ug[0]]*100, w=[];
        if(/gone by then|draws nothing there|nothing was rebuilt|never rebuilt/i.test(u)){ s+=30; w.push('never rebuilt'); }
        else if(/still shows buildings|draws a building on/i.test(u)&&!/building stands about ([0-2]\d|\d) m/i.test(u)){ s+=15; w.push('stood into the 1930s-50s, gone since'); }
        if(/plow|crop|farm field|field or pasture|cultivat/i.test(u)){ s-=10; w.push('plowed'); }
        else if(/woods|wooded|trees|brush|forest/i.test(ua)){ s+=12; w.push('wooded'); } else if(/pasture|meadow|hay/i.test(ua)){ s+=8; w.push('pasture'); }
        if(/subdivision|lawn|town lot|parking|paved|house lots|backyard/i.test(u)){ s-=25; w.push('lawns or lots now'); }
        const nb=/no building within (\d+) m/i.exec(u); if(nb){ s+=Math.min(+nb[1],300)/15; w.push('no building within '+nb[1]+' m'); }
        const bs=/building stands about (\d+) m/i.exec(u); if(bs&&+bs[1]<30){ s-=20; w.push('building '+bs[1]+' m away'); }
        return [s+sc(p)/100, 'Grade '+p.ug[0]+(w.length?' · '+w.join(', '):'')]; }},
    layers:{n:'Layers stacked',d:'Spots where two or more eras of people used the same ground (within about 150 m): an 1840s survey mark, an 1880s plat, a fire map, a 1930s-50s topo or air photo building. Long use means deep and varied drops.',
      f(p){ if(p.ug&&p.ug[0]==='D') return null; const o=[]; for(const q of near(p,150)) if(q===p||ok(q)) o.push(...obs(q)); if(o.length<2) return null;
        o.sort((a,b)=>a[0]-b[0]); const g=[[o[0]]]; for(let i=1;i<o.length;i++){ if(o[i][0]-g[g.length-1][0][0]>=20) g.push([o[i]]); else g[g.length-1].push(o[i]); }
        if(g.length<2) return null; const fam=new Set(o.map(x=>x[2]));
        const lbl=g.map(x=>{ const y0=x[0][0], y1=x[x.length-1][0], ls=[...new Set(x.map(z=>z[1]))].slice(0,2).join(' + '); return ls+' '+(y1-y0>=5?y0+'-'+y1:y0); });
        return [g.length*({A:120,B:100,C:60}[p.ug&&p.ug[0]]||70)+fam.size*5+sc(p)/100, g.length+' eras: '+lbl.join(' · ')]; }},
    loot:{n:'Lost and never found',d:'Only the cache, hoard and lost-loot stories not yet recovered (marked found or false ones drop out), best placed first: to the building, then the farm, the section, the town. Walk the ones placed to the building.',
      f(p){ if(!(p.L==='treasure'||/^cr-/.test(p.id)||LOOT.test(p.n+' '+(p.v||''))||LOOTH.test(p.n+' '+(p.v||'')))) return null; if(p.s==='found'||p.s==='false') return null; const t=placed(p), fs={never:2,partly:1}[p.s]||0;
        return [t*100+fs*20+(EVW[p.c]??1)*5+sc(p)/100, 'Placed to the '+PLACE[t]+' · '+({never:'never found · ',partly:'partly found · '}[p.s]||'')+({documented:'documented',newspaper:'newspaper story',report:'report',rumor:'rumor',lead:'lead',legend:'legend'}[p.c]||'story')]; }},
    money:{n:'Money passed hands',d:'Stores, hotels, saloons, banks, mills, ferry landings, stage stops and depots, sorted by how many separate sources confirm them (fire map, plat book, survey, newspaper, topo, air photo) within about 250 m.',
      f(p){ const m=moneyK(p); if(!m) return null; const fam=srcFam(p);
        for(const q of near(p,250)) if(q!==p&&ok(q)&&moneyK(q)===m) srcFam(q).forEach(x=>fam.add(x));
        return [fam.size*100+m[2]*10+(GRD[p.ug&&p.ug[0]]||2)*3+sc(p)/100, m[1][0].toUpperCase()+m[1].slice(1)+' · '+fam.size+' source'+(fam.size===1?'':'s')+(fam.size?': '+[...fam].slice(0,4).join(', '):'')]; }},
    crowd:{n:'Crowd-years',d:'Fairgrounds, picnic groves, ballparks, depots, schools and churches, scored by how many years crowds came and how early. Years before 1900 count extra (older silver and large cents). Only spots with a known date.',
      f(p){ const k=crowdK(p); if(!k) return null; let y=yrs(p.y); const o=obs(p).map(x=>x[0]); if(!y.length&&o.length) y=o; if(!y.length) return null;
        let a=Math.max(1820,Math.min(...y)), b=Math.max(...y), est=false; if(b<a) return null;
        if(b-a<5){ b=a+(SPAN[k[1]]||25); est=true; }
        const u=ugT(p), g=/the (\d{4}) (?:USGS )?topo[^.;]*?(gone by then|draws nothing there)/i.exec(u); if(g&&+g[1]<b&&+g[1]>a){ b=+g[1]; }
        b=Math.min(b,1964); const n=Math.max(1,b-a), pre=Math.max(0,Math.min(1900,b)-a);
        return [(n+pre*0.5)*k[2]+sc(p)/100, k[1][0].toUpperCase()+k[1].slice(1)+' · '+(est?'from about ':'')+a+(est?'':'-'+b)+' · '+(est?'about ':'')+n+' yrs'+(pre?', '+pre+' before 1900':'')]; }},
    water:{n:'Water edges and paths',d:'Old beaches, swimming holes, fords, ferry landings, springs and portages, nearest to today\'s water first. Rings and coins go in the water and on the path down to it.',
      f(p){ if(!(p.L==='beach'||WATER.test(p.n))) return null; const [d,good]=wdist(p); if(d>5000&&p.L!=='beach') return null;
        const k=/beach|swim|bathing/i.test(p.n)||p.L==='beach'?'beach or swimming hole':/ford/i.test(p.n)?'ford':/ferry|landing|wharf|dock|steamboat/i.test(p.n)?'landing':/spring/i.test(p.n)?'spring':/portage/i.test(p.n)?'portage':'water edge';
        return [-(d)+(GRD[p.ug&&p.ug[0]]||2)*5, k[0].toUpperCase()+k.slice(1)+' · '+(good&&d<15?'at or in today\'s water':(good?'':'about ')+fmtM(d)+' from today\'s '+(good?'water':'mapped river or lake'))]; }}
  };
  function run(k){ const key=k+'|'+PTS.length+'|'+(typeof RKV!=='undefined'?RKV:'');
    if(S.cache[k]&&S.cache[k].key===key) return S.cache[k].v;
    const f=SORTS[k].f, v=[]; for(const p of PTS){ if(!ok(p)) continue; let r=null; try{ r=f(p); }catch(e){ OGE.err&&OGE.err('ssort',e); } if(r){ p._ss=p._ss||{}; p._ss[k]=r; v.push(p); } }
    v.sort((a,b)=>(worked(a)-worked(b))||(b._ss[k][0]-a._ss[k][0])||(a.mi-b.mi)); S.cache[k]={key,v}; return v; }
  S.SORTS=SORTS; S.run=run; S.obs=obs; S.placed=placed;
  return S; })();

// The Sort menu on the Spots list, a "Show on map" switch, and a "Smart sorts" line on each card
{ const row=document.getElementById('count')?.parentNode;
  if(row){ row.insertAdjacentHTML('beforebegin',`<div class="row ssrow"><select id="ssSort" aria-label="Sort spots" style="width:auto;flex:1 1 200px"><option value="">Nearest first</option>${Object.entries(SSORT.SORTS).map(([k,s])=>`<option value="${k}">${s.n}</option>`).join('')}</select><button class="chip uxt" id="ssMap" aria-pressed="false" hidden title="Show only these spots on the map">Show on map</button></div><p class="hint" id="ssHint" hidden></p>`); }
  const sel=document.getElementById('ssSort'), mb=document.getElementById('ssMap'), hint=document.getElementById('ssHint');
  let on0=null;
  document.querySelector('.mapwrap')?.insertAdjacentHTML('beforeend','<div class="ssbar" id="ssBar" hidden><span></span><button type="button" aria-label="Show all spots again">✕</button></div>');
  const bar=document.getElementById('ssBar'); if(bar) bar.querySelector('button').onclick=()=>mapOff();
  function mapOff(){ if(!SSORT.map) return; SSORT.map=false; mb.setAttribute('aria-pressed','false'); if(bar) bar.hidden=true; if(on0){ on.clear(); on0.forEach(x=>on.add(x)); on0=null; } drawMarkers(); }
  function setSort(k){ mapOff(); SSORT.k=SSORT.SORTS[k]?k:''; sel.value=SSORT.k; mb.hidden=!SSORT.k; hint.hidden=!SSORT.k; hint.textContent=SSORT.k?SSORT.SORTS[SSORT.k].d:'';
    try{ localStorage.setItem('og-ssort',SSORT.k); }catch(_){} renderList(); }
  sel.onchange=()=>setSort(sel.value);
  mb.onclick=()=>{ if(SSORT.map){ mapOff(); return; } if(!SSORT.k) return; SSORT.map=true; mb.setAttribute('aria-pressed','true'); on0=new Set(on);
    for(const p of SSORT.run(SSORT.k)) on.add(p.L); SSORT.ids=new Set(SSORT.run(SSORT.k).map(p=>p.id)); renderList(); if(bar){ bar.hidden=false; bar.querySelector('span').textContent=SSORT.SORTS[SSORT.k].n+' · '+SSORT.ids.size+' spots'; } drawMarkers(); try{ const t=document.querySelector('#shTabs button[data-t="map"]'); if(t&&document.body.classList.contains('shell')) t.click(); else showView('map'); }catch(_){} };
  const _uxS=UXdraw; UXdraw=function(vis,s){ if(SSORT.map&&SSORT.ids) vis=vis.filter(p=>p.L==='mine'||p.id===selId||SSORT.ids.has(p.id)); return _uxS(vis,s); };
  SSORT.list=function(){ if(!SSORT.k) return false; const s=q.value.trim().toLowerCase(), dm=+dist.value, sv=stf.value, k=SSORT.k;
    const v=SSORT.run(k).filter(p=>p.mi<=dm&&(!sv||p.stt===sv)&&(!savedOnly||saved.has(p.id))&&(!s||[p.n,p.pl,p.co,p.y,p.st].join(' ').toLowerCase().includes(s)));
    if(SSORT.map){ SSORT.ids=new Set(v.map(p=>p.id)); const bs=document.querySelector('#ssBar span'); if(bs) bs.textContent=SSORT.SORTS[k].n+' · '+v.length+' spots'; }
    document.getElementById('count').textContent=`${v.length} spots, ${SSORT.SORTS[k].n.toLowerCase()}`;
    const show=v.slice(0,300);
    document.getElementById('list').innerHTML=v.length? show.map((p,i)=>`<button class="item${p.id===selId?' sel':''}" data-id="${p.id}"><span style="margin-top:2px">${ico(p.L,18)}</span><span><span class="t">${i+1}. ${saved.has(p.id)?'★ ':''}${RK(p)?'['+RK(p)+'] ':''}${esc(p.n)}${WKS(p.id)==='worked'?' <span class="hint">· worked</span>':''}</span><br><span class="m">${esc(p._ss[k][1])}</span><br><span class="m">${esc(LBY[p.L].n)} &middot; ${p.stt}${p.co?' &middot; '+esc(p.co)+(p.co.includes('(')?'':' Co.'):''}</span></span><span class="d">${p.mi<10?p.mi.toFixed(1):Math.round(p.mi)} mi</span></button>`).join('')+(v.length>show.length?`<p class="note">Showing the top ${show.length}. Narrow the distance or search to see the rest.</p>`:'') : '<p class="empty">No spots match. Widen the distance or clear the search.</p>';
    document.querySelectorAll('#list .item').forEach(b=>b.onclick=()=>select(b.dataset.id,true));
    if(SSORT.map) drawMarkers(); return true; };
  // the card: which smart sorts this spot does well in
  const _rkH=rkHTML; rkHTML=function(p){ let h=_rkH(p); try{ const ls=[]; for(const k in SSORT.SORTS){ SSORT.run(k); const r=p._ss&&p._ss[k]; if(r) ls.push(`<li><b>${SSORT.SORTS[k].n}:</b> ${esc(r[1])}</li>`); }
      if(ls.length) h+=`<details class="sscard"><summary>Smart sorts (${ls.length})</summary><ul class="ev">${ls.join('')}</ul></details>`; }catch(e){ OGE.err&&OGE.err('ssort card',e); } return h; };
  let k0=''; try{ k0=localStorage.getItem('og-ssort')||''; }catch(_){} if(k0) BOOT.later.add(function ssRestore(){ setSort(k0); });
  if(sel&&!document.getElementById('ssCss')) document.head.insertAdjacentHTML('beforeend','<style id="ssCss">.ssrow select{font-weight:600}.sscard{margin-top:6px;font-size:13.5px}.sscard summary{cursor:pointer;font-weight:700}#list .item .m+br+.m{opacity:.85}.ssbar{position:absolute;left:50%;transform:translateX(-50%);top:calc(104px + env(safe-area-inset-top,0px));z-index:6;display:flex;align-items:center;gap:6px;max-width:calc(100% - 120px);padding:4px 4px 4px 12px;border-radius:999px;background:var(--ink);color:var(--panel);font:700 13px var(--f-body);box-shadow:0 2px 8px color-mix(in srgb,var(--ink) 25%,transparent)}.ssbar[hidden]{display:none}.ssbar span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ssbar button{flex:none;width:28px;height:28px;border-radius:50%;border:0;background:var(--panel);color:var(--ink);font:700 13px var(--f-body);cursor:pointer}</style>');
}
