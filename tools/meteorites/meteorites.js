// ---------- Meteorites: where they fell (mt1). Graded strewn fields, recorded falls and finds, a map mode, and a hunting guide on Start here ----------
// Falls and finds come from the Meteoritical Bulletin Database (Meteoritical Society) with the state surveys (WGNHS, Iowa Geological
// Survey), NASA ARES fall pages and the papers cited on each card. Strewn-field outlines are drawn by hand from the descriptions in
// those sources and are approximate. Tier colours follow the atlas tier chart (TIER.C). Source: tools/meteorites, research/meteorites.md.
(()=>{ try{
  const TC=(typeof TIER==='object'&&TIER.C)||{S:'#ff7f7f',A:'#ffbf7f',B:'#ffdf7f',C:'#ffff7f',D:'#bfff7f',E:'#7fff7f',F:'#7fffff'};
  const TN=(typeof TIER==='object'&&TIER.NAME)||{};
  const TO='SABCDEF';
  const MB=(n,c)=>['Meteoritical Bulletin Database: '+n,'https://www.lpi.usra.edu/meteor/metbull.php?code='+c];
  const WG=['WGNHS: Wisconsin meteorites','https://home.wgnhs.wisc.edu/wisconsin-geology/meteorites/'];
  const IGS=['Iowa Geological Survey: Meteorites in Iowa','https://iowageologicalsurvey.uiowa.edu/iowa-geology/popular-interest/meteorites-iowa'];
  // an ellipse between two end points (lon,lat) with a width in km, or a circle
  const ell=(a,b,wk,n=28)=>{ const k=Math.cos((a[1]+b[1])/2*Math.PI/180), kx=111.32*k, ky=110.57;
    const ax=(b[0]-a[0])*kx, ay=(b[1]-a[1])*ky, L=Math.hypot(ax,ay)/2, ux=ax/(2*L), uy=ay/(2*L), cx=(a[0]+b[0])/2, cy=(a[1]+b[1])/2, W=wk/2, out=[];
    for(let i=0;i<n;i++){ const t=i/n*2*Math.PI, x=L*Math.cos(t), y=W*Math.sin(t); out.push([+(cx+(x*ux-y*uy)/kx).toFixed(4),+(cy+(x*uy+y*ux)/ky).toFixed(4)]); } return out; };
  const circ=(c,rk)=>ell([c[0]-rk/(111.32*Math.cos(c[1]*Math.PI/180)),c[1]],[c[0]+rk/(111.32*Math.cos(c[1]*Math.PI/180)),c[1]],rk*2);
  const Z=[
   {k:'mif',t:'C',n:'Mifflin strewn field (2010), Iowa County, Wisconsin',sh:'The youngest mapped fall within reach: dozens of small stones from Livingston and Montfort to Mineral Point',
    why:'A fireball seen across the Midwest at about 10 pm on April 14, 2010 broke up over Iowa County. Hunters and locals found about 3.6 kg of L5 chondrite in dozens of pieces along a long, narrow strip centered on Mifflin, from about Livingston and Montfort in the northwest to Mineral Point in the southeast, and later finds pushed the strip further southeast. Stones lie far apart, so many small ones were surely missed in woods, pasture and crop fields. It is the best meteorite ground within reach of Eau Claire, but still a long day for a few grams.',
    look:'Walk slow lines across bare, freshly plowed or disked fields in spring and after rain, when a dark stone shows on pale soil. Drag a magnet cane and swing a detector on all-metal or ferrous. Stones run from a gram or two to a few hundred grams.',
    rules:'All private farmland: ask every landowner first. Under long-standing US law a meteorite belongs to the owner of the land it lands on, so agree up front who keeps a find.',
    src:[WG,MB('Mifflin','52090'),['Meteorite Times: Recovery of meteorites from the 4/14/2010 fall in Wisconsin','https://www.meteorite-times.com/meteorites-wisconsin/']],
    r:[ell([-90.47,42.97],[-90.17,42.85],5.5)]},
   {k:'hom',t:'C',n:'Homestead strewn field (1875), Amana Colonies, Iowa',sh:'Hundreds of stones, about 230 kg, over a field some 3 miles wide and 5 miles long',
    why:'On the night of February 12, 1875 a fireball broke up over the Amana Colonies and stones fell over a field the Iowa Geological Survey puts at about 3 miles wide and 5 miles long, south of the Iowa River and southwest of Homestead. Between about 100 and 300-plus stones were found, about 230 kg in all, the largest about 33 kg; stones of 74 and 48 pounds were found south of High Amana the next spring. A field this big almost never gives up every stone.',
    look:'Plowed fields south of the Iowa River between High Amana and Homestead. After 150 years an L5 stone left in the ground is rusty brown, not black, so let the magnet cane and the detector find it.',
    rules:'Amana Colonies farmland is private: ask first. The towns are a National Historic Landmark district: no digging in or around them.',
    src:[IGS,MB('Homestead','11901'),['Homestead (meteorite), Wikipedia','https://en.wikipedia.org/wiki/Homestead_(meteorite)']],
    r:[ell([-91.98,41.775],[-91.875,41.735],5)]},
   {k:'est',t:'D',n:'Estherville fall (1879), Emmet County, Iowa',sh:'A half-metal stony-iron: masses of 431, 151 and 106 lb and many small fragments',
    why:'On May 10, 1879 a mesosiderite (a stony-iron, roughly half metal) fell a few miles north of Estherville. The three largest masses weighed roughly 431, 151 and 106 pounds, the biggest buried about 14 feet deep, and many small fragments were gathered around them. Iron-rich pieces last in the ground and every detector hears them, but the field was searched hard in 1879 and the outline is not recorded, so the circle is only a search area around the reported spot.',
    look:'Fields north of Estherville toward the Des Moines River, with permission: magnet cane plus detector.',
    rules:'Private farmland: ask first. Pieces are in the Estherville library, the Smithsonian and the Natural History Museum in Vienna.',
    src:[IGS,MB('Estherville','10059'),['City of Estherville: the Estherville meteorite','https://www.estherville.org/estherville-meteorite']],
    r:[circ([-94.83,43.44],4)]},
   {k:'fc',t:'D',n:'Forest City fall (1890), near Thompson, Iowa',sh:'Hundreds of H5 stones over a strip 3-4 miles long; biggest 81, 75 and 66 lb',
    why:'On the afternoon of May 2, 1890 a fireball exploded about 11 miles northwest of Forest City, near Thompson, and showered stones over a strip reported as three or four miles long and one and a half to two miles wide. Hundreds were picked up, about 150 kg in all. A fight over one stone went to the Iowa Supreme Court, which ruled in 1892 that a meteorite belongs to the landowner. The strip\'s direction is not recorded, so the circle is a search area.',
    look:'Farm fields around Thompson with permission. H chondrites carry plenty of metal, so a detector on ferrous helps even on old, weathered stones.',
    rules:'Private farmland: ask first.',
    src:[IGS,MB('Forest City','10119'),['The Palimpsest (State Historical Society of Iowa): the Forest City meteorite','https://pubs.lib.uiowa.edu/palimpsest/article/25244/galley/133613/download']],
    r:[circ([-93.78,43.36],3.5)]},
   {k:'tre',t:'D',n:'Trenton iron find area (1858-1870s), Washington County, Wisconsin',sh:'Many iron masses, about 505 kg, from a small area east of West Bend',
    why:'Large masses of the Trenton iron were found in Trenton Township, about four miles east of West Bend, from 1858 into the 1870s; the known total is about 505 kg. They came from a small area, so the meteorite probably came in steeply. Irons last thousands of years in the ground, which makes this the best iron ground in the region, though it has been farmed and looked over for 160 years.',
    look:'Field edges, rock piles and plowed ground in the township, with permission. A large coil, or a big pulse-induction loop on a PVC frame, reaches deeper for a buried iron.',
    rules:'Private farmland: ask first.',
    src:[WG,MB('Trenton','24045'),['Michigan State University meteorite collection: Trenton','https://esoteric.msu.edu/meteorites/more/trenton.html']],
    r:[[[-88.195,43.325],[-88.07,43.325],[-88.07,43.415],[-88.195,43.415]]]},
   {k:'ham',t:'D',n:'Hamburg strewn field (2018), Livingston County, Michigan',sh:'Radar-tracked fall: more than 55 stones, many found on frozen lakes',
    why:'At 8:08 pm on January 16, 2018 a fireball about 2 m across broke up over Livingston County. Doppler radar showed the falling stones, and hunters were picking them off the ice of Strawberry and Bass lakes two days later. More than 55 stones were recovered from a strip about 5 miles long, running west-northwest from about US-23 to Bass Lake. Many more went through the ice or into backyards.',
    look:'Fields and woods along the strip away from the lakes, with permission. The rest is lakes and houses.',
    rules:'Mostly private homes and lakes: permission first. State recreation land nearby has its own rules.',
    src:[['NASA ARES: Hamburg, Michigan meteorite fall','https://ares.jsc.nasa.gov/meteorite-falls/events/hamburg-michigan'],['Sky and Telescope: hunters recover meteorites from Michigan fireball','https://skyandtelescope.org/astronomy-news/observing-news/michigan-fireball/']],
    r:[ell([-83.735,42.445],[-83.84,42.49],2.5)]},
   {k:'pf',t:'E',n:'Park Forest strewn field (2003), south Chicago suburbs',sh:'Stones through roofs in Park Forest and Matteson; more than 18 kg from Crete to Olympia Fields',
    why:'Just before midnight on March 26, 2003 a fireball broke up over the south suburbs of Chicago. Stones crashed through the roofs of several houses and the Park Forest fire station, and more than 18 kg was recovered, the largest about 3 kg, from Crete in the south to the southern end of Olympia Fields in the north. It is built up and was searched hard, so it is a story stop, not a hunt.',
    look:'Forest preserves and parks only where their rules allow; yards only with the owner\'s word.',
    rules:'Every yard is private. Forest preserves do not allow digging or collecting without a permit.',
    src:[MB('Park Forest','18106'),['Park Forest (meteorite), Wikipedia','https://en.wikipedia.org/wiki/Park_Forest_(meteorite)'],['NASA ARES: Park Forest, Illinois','https://ares.jsc.nasa.gov/meteorite-falls/events/park-forest-illinois']],
    r:[ell([-87.63,41.44],[-87.70,41.51],3)]},
   {k:'col',t:'E',n:'Colby fall (1917), Clark County, Wisconsin',sh:'Two stones of about 80 and 150 lb fell on the Fourth of July',
    why:'At 6:15 pm on July 4, 1917 two L6 stones of about 80 and 150 pounds fell near Colby; witnesses said they frosted over on a hot evening. Two big stones and no reports of small ones, so the odds of a third piece are slim. It is the closest strewn-field story to Eau Claire, about an hour east.',
    look:'Plowed fields around Colby with permission, if you are passing.',
    rules:'Private farmland: ask first.',
    src:[WG,MB('Colby (Wisconsin)','5395')],
    r:[circ([-90.30,44.90],4)]}
  ];
  const ZZ=Z.filter(z=>z.r&&z.r.length);
  const pip=(x,y,r)=>{ let c=false; for(let i=0,j=r.length-1;i<r.length;j=i++){ const [xi,yi]=r[i],[xj,yj]=r[j]; if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi)) c=!c; } return c; };
  const inZ=(z,lo,la)=>z.r.some(r=>pip(lo,la,r));
  const area=z=>z.r.reduce((A,r)=>A+Math.abs(r.reduce((a,p,i)=>{ const q=r[(i+1)%r.length]; return a+p[0]*q[1]-q[0]*p[1]; },0))/2,0);
  const best=L=>L.sort((a,b)=>TO.indexOf(a.t)-TO.indexOf(b.t)||area(a)-area(b))[0];
  const MT=()=>PTS.filter(p=>p.L==='meteor');
  let FZ=null; const finds=()=>{ if(FZ) return FZ; FZ={}; for(const p of MT()){ const z=best(ZZ.filter(z=>inZ(z,p.lo,p.la))); if(z) (FZ[z.k]||(FZ[z.k]=[])).push(p); } return FZ; };
  window.OGMT={Z,finds};

  // ---- the pin icon: a stone with a fiery trail ----
  if(typeof OGG==='object'){ OGG.met='M14.5 9a5.5 5.5 0 1 0 .1 0M3 3.5L9.3 9.8M7 2.6L10.9 6.5M2.6 7L6.5 10.9'; if(typeof OGK==='object') OGK.meteor='met'; }
  if(typeof GLY==='object'){ GLY.meteor='<circle cx=".16" cy=".16" r=".46"/><path d="M-.7,-.7 L-.2,-.2 M-.35,-.75 L-.05,-.45 M-.75,-.35 L-.45,-.05" stroke="currentColor" stroke-width=".12" stroke-linecap="round"/>';
    try{ svg.querySelector('defs').insertAdjacentHTML('beforeend',`<symbol id="g-meteor" viewBox="-1 -1 2 2" overflow="visible"><g fill="currentColor">${GLY.meteor}</g></symbol>`); }catch(_){} }
  if(typeof ORDER==='object'&&!ORDER.includes('meteor')) ORDER.push('meteor');

  // ---- the zone layer, in the Meteorites section (the pin layer is in the LAYERS list itself) ----
  if(!LBY._metzone){ const i=LAYERS.findIndex(l=>l.id==='meteor'); LAYERS.splice(i<0?LAYERS.length:i,0,{sec:'Meteorites',id:'_metzone',n:'Meteorite strewn fields (graded)',d:'Where documented falls scattered stones, in the tier colours. Tap a field for the story, where to work, the rules and the meteorites inside it',overlay:true,on:false});
    for(const l of LAYERS) LBY[l.id]=l; }
  if(typeof SHORT==='object') SHORT._metzone='Strewn field';
  if(typeof PLOV==='object') PLOV._metzone=[TC.C,'b'];
  const SW=`<span class="dot" style="background:linear-gradient(90deg,${TC.C},${TC.D} 55%,${TC.E});border-radius:3px;opacity:.9"></span>`;
  const _rl=renderLayers; renderLayers=function(){ const r=_rl.apply(this,arguments); try{ const b=document.querySelector('#pane-layers .lrow[data-l="_metzone"]'); if(b&&b.firstElementChild&&!b.firstElementChild.matches('.nm')) b.firstElementChild.outerHTML=SW; }catch(_){} return r; };
  if(SHM.gold&&!SHM.gold.L.includes('meteor')) SHM.gold.L.push('meteor');

  // ---- map mode: Meteorites ----
  SHM.meteor={n:'Meteorites', d:'Graded strewn fields and every recorded meteorite fall and find in the five states', L:['_metzone','meteor','restricted','_heat','_tracks']};
  document.getElementById('shModes')?.insertAdjacentHTML('beforeend','<button type="button" data-m="meteor" aria-pressed="false">Meteorites</button>');
  const _sm=shSetMode; shSetMode=function(m,keep){ _sm(m,keep); try{ localStorage.setItem('og-mtmode',SH.mode==='meteor'?'1':'0'); }catch(_){} try{ mtBox(); }catch(e){ OGE.err('mtBox',e); } };

  // ---- draw ----
  let sel=null;
  function draw(s){ if(!on.has('_metzone')||!gX||!s||!isFinite(s)) return;
    const g=el('g',{'pointer-events':'none'},gX);
    for(const z of ZZ.slice().sort((a,b)=>TO.indexOf(b.t)-TO.indexOf(a.t))){ const c=TC[z.t], hi=sel===z.k;
      const d=z.r.map(r=>'M'+r.map(([x,y])=>P(x,y).map(v=>v.toFixed(4)).join(',')).join('L')+'Z').join('');
      el('path',{d,fill:c,'fill-opacity':hi?.5:.32,stroke:'#3b3a6b','stroke-width':(hi?2.6:1.4)/s,'stroke-opacity':.8,'stroke-dasharray':`${5/s} ${2.5/s}`},g); }
    if(s<26) return;
    for(const z of ZZ){ const r=z.r[0]; const c=r.reduce((a,p)=>[a[0]+p[0]/r.length,a[1]+p[1]/r.length],[0,0]); const [x,y]=P(...c);
      const t=el('text',{x,y:y-0.03,'text-anchor':'middle','font-size':12/s,'font-weight':800,fill:'#25244a',stroke:'var(--panel)','stroke-width':3/s,'paint-order':'stroke'},g); t.textContent=z.t+' · '+z.n.split(' (')[0]; } }
  const _dx=drawExtra; drawExtra=function(s){ _dx(s); try{ draw(s); }catch(e){ OGE.err('mtDraw',e); } };

  // ---- the strewn-field card ----
  const tchip=t=>`<i class="tierb" style="background:${TC[t]}" title="${esc(TN[t]||t+' tier')}">${t}</i>`;
  const srcH=src=>`<p class="hint" style="margin:6px 0 0">Sources: ${src.map(([n,u])=>u?`<a href="${esc(u)}" target="_blank" rel="noopener">${esc(n)}</a>`:esc(n)).join('; ')}. Outline approximate, drawn by hand from the written descriptions.</p>`;
  function card(z){ const F=(finds()[z.k]||[]).slice().sort((a,b)=>(a.mi||0)-(b.mi||0));
    return `<h4>${tchip(z.t)}${esc(z.n)}</h4><p style="margin:4px 0"><b>${esc(TN[z.t]||z.t+' tier')}.</b> ${esc(z.why)}</p>
      <p style="margin:4px 0"><b>Where to work:</b> ${esc(z.look)}</p><div class="note2 warn" style="margin:4px 0">${esc(z.rules)}</div>
      ${F.length?`<b style="font-size:13px">On the map here (${F.length})</b><div>${F.map(p=>`<button class="item" data-goto="${p.id}"><span style="margin-top:2px">${ico(p.L,16)}</span><span><span class="t">${esc(p.n)}</span>${p.v?`<br><span class="m">${esc(p.v)}</span>`:''}</span></button>`).join('')}</div>`:''}${srcH(z.src)}`; }
  function bindPop(){ pop.querySelector('.px').onclick=()=>{ sel=null; closePop(); apply(); };
    pop.querySelectorAll('[data-goto]').forEach(b=>b.onclick=ev=>{ ev.preventDefault(); closePop(); select(b.dataset.goto,true); }); }
  function showZone(z,cx,cy){ sel=z.k; pop.innerHTML='<button class="px" aria-label="Close">×</button>'+card(z); bindPop(); pop.hidden=false; placePop(cx,cy); try{ popT=performance.now(); }catch(_){} apply(); }
  function goZone(k){ const z=Z.find(z=>z.k===k); if(!z||!z.r) return; showView('map'); on.add('_metzone'); on.add('meteor'); try{ renderLayers(); drawMarkers(); }catch(_){}
    let a=1e9,b=1e9,c=-1e9,d=-1e9; for(const r of z.r) for(const [x,y] of r){ const [px,py]=P(x,y); a=Math.min(a,px); b=Math.min(b,py); c=Math.max(c,px); d=Math.max(d,py); }
    const asp=vb.h/vb.w; let w=(c-a)*2.2, h=(d-b)*2.2; if(h>w*asp) w=h/asp; h=w*asp; vb={x:(a+c)/2-w/2,y:(b+d)/2-h/2,w,h}; apply();
    setTimeout(()=>{ const r=z.r[0], m=r.reduce((s,p)=>[s[0]+p[0]/r.length,s[1]+p[1]/r.length],[0,0]); const [sx,sy]=toS(m[0],m[1]); showZone(z,sx,sy); },80); }
  OGMT.go=goZone;
  const _fh=findHit; findHit=function(cx,cy){ const r=_fh(cx,cy); if(r||!on.has('_metzone')) return r;
    const hit=best(ZZ.filter(z=>z.r.some(rr=>pip(cx,cy,rr.map(([x,y])=>toS(x,y))))));
    if(hit){ showZone(hit,cx,cy); return true; }
    if(sel){ sel=null; apply(); } return false; };

  // ---- the guide, on Start here ----
  const li=a=>'<ul style="margin:4px 0 6px;padding-left:18px">'+a.map(x=>`<li style="margin:2px 0">${x}</li>`).join('')+'</ul>';
  const HOW=[
   '<b>Magnet cane (the big PVC pipe):</b> strong neodymium magnets capped in the end of a PVC tube or walking stick, dragged or tapped along the ground as you walk. About nine in ten meteorites carry iron-nickel metal, so even most stony ones stick. Check what clings every few steps.',
   '<b>Big-coil pulse-induction rig:</b> the other "giant PVC" tool is a large search loop of wire on a PVC frame, often a metre or more across, run by a pulse-induction detector. It reaches deeper for a buried iron but ignores small stones; it suits iron ground like Trenton.',
   '<b>The pair to carry here:</b> a magnet cane plus your normal detector set to all-metal or ferrous (iron) mode, with iron discrimination off. The cane picks up what the coil hears; the coil finds what the cane walks past.',
   '<b>When:</b> bare fields after spring plowing or disking and after a soaking rain, and snow or ice right after a fresh fall. Walk slow, tight lines, sun at your back.'];
  const WHERE=[
   'Inside or along the edge of a known strewn field (the shaded fields): the only ground with real odds.',
   'Farmers\' rock piles and fencerows: a hundred years of rocks picked off the fields. The 110 lb Vienna iron came up that way.',
   'Gravel pits and fresh cuts in glacial till: meteorites that fell on the ice sheets were dropped in the drift like any other rock (permission first).',
   'Stone-poor flat ground: old glacial lake beds and outwash plains, where almost any rock in a plowed field is out of place. In Wisconsin turn on the Glacial deposits map (1964) and tap a field to see which kind of ground it is.',
   'Old stones rust and crumble in wet Midwest ground, so falls from the last few decades and iron meteorites beat old stony falls.'];
  const ID=[
   '<b>Magnet:</b> about nine in ten meteorites pull a magnet. No pull at all, very likely not one.',
   '<b>Streak test:</b> rub a hidden edge on the unglazed back of a tile. A meteorite leaves no streak or only a faint grey. Red-brown means hematite; a black streak means magnetite. Both are the usual fakes.',
   '<b>Fusion crust:</b> a fresh one has a thin, dull black skin, sometimes with flow lines; old ones weather to rusty brown. Glassy, shiny or bubbly skin is slag.',
   '<b>Shape and surface:</b> rounded thumbprint dents (regmaglypts) and no gas holes. Holes, bubbles or a spongy inside mean slag or lava.',
   '<b>Heft:</b> heavier than an ordinary rock its size; irons feel like a lump of steel.',
   '<b>Filed window:</b> file a small corner. Bright silver metal flecks, often with small round grains (chondrules) in a stony one, are a strong sign. Solid grey metal right through with no flecks is often man-made iron.',
   '<b>Nickel test:</b> a nickel test swab (dimethylglyoxime, sold for jewelry testing) turns pink on the filed metal of a meteorite; ordinary steel usually stays clear.',
   '<b>Rule out the manufactured:</b> balls, bolts, casting seams, perfect round holes or a mould line mean factory iron or slag.',
   '<b>Then:</b> send clear photos, and later a small sample, to a university meteorite lab (the Field Museum in Chicago classified the Vienna iron; the UW-Madison Geology Museum is a good first contact). Only a lab can classify it and give it an official name.'];
  const FRESH=[
   'Watch the American Meteor Society fireball reports (amsmeteors.org) for a bright fireball seen by many people near you.',
   'NASA ARES posts Doppler radar returns of falling stones for big US fireballs within a day or two: that gives a strip on the ground.',
   'Go fast, before plowing, rain and other hunters: Hamburg stones were found on lake ice two days after the fall.'];
  const RULES='A meteorite belongs to whoever owns the land it lies on (Iowa Supreme Court, 1892, over a Forest City stone), so get written permission and agree on who keeps a find. On federal land (national forests, wildlife refuges) a meteorite is federal property: ask the managing office before you keep one. State parks are look only.';
  function boxHTML(){ const F=finds(), top=SH.mode==='meteor';
    const rows=TO.split('').map(t=>{ const L=Z.filter(z=>z.t===t); if(!L.length) return '';
      return `<div class="tierhd" style="display:flex;align-items:center;gap:8px;padding:5px 2px;font:700 13px var(--f-body)">${tchip(t)}<span>${esc(TN[t]||t+' tier')}</span></div>`+L.map(z=>{ const n=(F[z.k]||[]).length;
        return `<button class="item" data-mtz="${z.k}"><span style="margin-top:2px">${tchip(z.t)}</span><span><span class="t">${esc(z.n)}</span><br><span class="m">${esc(z.sh)}${n?` · ${n} on the map`:''}</span></span></button>`; }).join(''); }).join('');
    const nAll=MT().length;
    return `<details ${top?'open':''}><summary class="sec" style="cursor:pointer;list-style:none"><h3 style="margin:0">Meteorites: where to look and how to tell</h3></summary>
      <p class="hint">Meteorites fall everywhere, but most are never found, and in wet Midwest ground old stones rust away. The real odds are in the strewn fields where a fireball broke up and showered stones, graded below from what is on record, best first. Tap one to see it on the map. All ${nAll} recorded falls and finds in the five states are pins in the Meteorites layer; most are single finds where another piece is unlikely.</p>
      ${rows}
      <h4 style="margin:10px 0 2px">How to hunt</h4>${li(HOW)}
      <h4 style="margin:8px 0 2px">Where the odds are</h4>${li(WHERE)}
      <h4 style="margin:8px 0 2px">Meteorite or ordinary iron? Check in this order</h4>${li(ID)}
      <h4 style="margin:8px 0 2px">Fresh falls</h4>${li(FRESH)}
      <div class="note2 warn" style="margin:6px 0">${esc(RULES)}</div></details>`; }
  function mtBox(){ const pane=document.getElementById('pane-picks'); if(!pane) return; let b=document.getElementById('mtBox');
    if(!b){ b=document.createElement('div'); b.id='mtBox'; b.className='sec'; }
    b.innerHTML=boxHTML();
    if(SH.mode==='meteor'){ const u=document.getElementById('uxSimple'); if(u) u.before(b); else pane.prepend(b); }
    else { const a=document.getElementById('fcBox')||document.getElementById('lwBox')||document.getElementById('ftAlerts'); if(a) a.after(b); else pane.append(b); }
    b.querySelectorAll('[data-mtz]').forEach(x=>x.onclick=()=>goZone(x.dataset.mtz)); }
  const _ra=renderAlerts; renderAlerts=function(){ _ra(); try{ mtBox(); }catch(e){ OGE.err('mtBox',e); } };
  mtBox();
  try{ renderLayers(); }catch(_){}
  let was=false; try{ was=localStorage.getItem('og-mtmode')==='1'; }catch(_){} if(was) shSetMode('meteor');
}catch(e){ try{ OGE.err('meteorites',e); }catch(_){} } })();
