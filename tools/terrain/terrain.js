// ---------- Map tools (v209): swipe compare, covered-ground pass shading, slope and benches, viewshed, terrain profile ----------
// Elevation comes from the free Terrarium tiles on AWS (USGS 3DEP 1/3 arc-second, about 10 m, built from the county LiDAR in WI),
// fetched only while a terrain tool is on; the home-screen app keeps them in the atlas-dem cache so a place you looked at works offline.
// Compare puts today (satellite or street) on the right of a slider and the chosen map type on the left. Nothing loads until a tool is used.
{ const TR={tool:'', cmpSrc:'s', cmpF:0.5, slopeKey:'', slopeURL:'', slopeBusy:0, view:null, viewR:2000, viewURL:'', prof:[], profD:null, msg:''};
  window.TR=TR;
  const NSV='http://www.w3.org/2000/svg', mw=svg.parentElement;
  const ft=m=>Math.round(m*3.281).toLocaleString()+' ft';
  const gTR=el('g',{'pointer-events':'none'},svg); svg.insertBefore(gTR,typeof gHR!=='undefined'?gHR:gMk);
  const gTRL=el('g',{'pointer-events':'none'},svg); svg.insertBefore(gTRL,gMk);   // profile line and viewshed eye, over the tracks

  // ---- elevation tiles ----
  const DEM={c:new Map(), q:new Map(), url:(z,x,y)=>`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`};
  function demTile(z,x,y){ const k=z+'/'+x+'/'+y; if(DEM.c.has(k)){ const v=DEM.c.get(k); DEM.c.delete(k); DEM.c.set(k,v); return Promise.resolve(v); }
    if(DEM.q.has(k)) return DEM.q.get(k);
    const p=new Promise(res=>{ const im=new Image(); im.crossOrigin='anonymous';
      im.onload=()=>{ try{ const c=document.createElement('canvas'); c.width=c.height=256; const g=c.getContext('2d',{willReadFrequently:true}); g.drawImage(im,0,0);
        const d=g.getImageData(0,0,256,256).data, e=new Float32Array(65536); for(let i=0,j=0;i<65536;i++,j+=4) e[i]=d[j]*256+d[j+1]+d[j+2]/256-32768;
        DEM.c.set(k,e); if(DEM.c.size>90) DEM.c.delete(DEM.c.keys().next().value); res(e); }catch(err){ OGE.err('dem',err); res(null); } };
      im.onerror=()=>res(null); im.src=DEM.url(z,x,y); }).finally(()=>DEM.q.delete(k));
    DEM.q.set(k,p); return p; }
  const mx=(lon,N)=>(lon+180)/360*N*256, my=(lat,N)=>{ const r=lat*Math.PI/180; return (1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*N*256; };
  const ilon=(X,N)=>X/(N*256)*360-180, ilat=(Y,N)=>Math.atan(Math.sinh(Math.PI*(1-2*Y/(N*256))))*180/Math.PI;
  // a grid of elevations for tiles x0..x1, y0..y1 at zoom z (NaN where a tile is missing)
  async function demGrid(z,x0,x1,y0,y1){ const N=2**z, nx=x1-x0+1, ny=y1-y0+1, W=nx*256, H=ny*256, E=new Float32Array(W*H).fill(NaN); let got=0;
    const jobs=[]; for(let y=y0;y<=y1;y++) for(let x=x0;x<=x1;x++) jobs.push(demTile(z,x,y).then(e=>{ if(!e) return; got++;
      for(let r=0;r<256;r++) E.set(e.subarray(r*256,r*256+256),((y-y0)*256+r)*W+(x-x0)*256); }));
    await Promise.all(jobs);
    const lat=ilat((y0+ny/2)*256,N), res=40075016.686*Math.cos(lat*Math.PI/180)/(N*256);
    return {z,N,x0,y0,x1,y1,W,H,E,got,n:nx*ny,res,
      lon0:ilon(x0*256,N), lon1:ilon((x1+1)*256,N), lat1:ilat(y0*256,N), lat0:ilat((y1+1)*256,N),
      px:lon=>mx(lon,N)-x0*256, py:lat=>my(lat,N)-y0*256, lon:px=>ilon(x0*256+px,N), lat:py=>ilat(y0*256+py,N)}; }
  const tileRange=(z,lon0,lon1,lat0,lat1)=>{ const N=2**z; return [Math.floor(mx(lon0,N)/256),Math.floor(mx(lon1,N)/256),Math.floor(my(lat1,N)/256),Math.floor(my(lat0,N)/256)]; };
  // elevation at a point, bilinear (G from demGrid)
  function demAt(G,lon,lat){ const x=G.px(lon)-0.5, y=G.py(lat)-0.5, i=Math.max(0,Math.min(G.W-2,Math.floor(x))), j=Math.max(0,Math.min(G.H-2,Math.floor(y))), fx=Math.max(0,Math.min(1,x-i)), fy=Math.max(0,Math.min(1,y-j)), E=G.E, W=G.W;
    const a=E[j*W+i], b=E[j*W+i+1], c=E[(j+1)*W+i], d=E[(j+1)*W+i+1]; return a*(1-fx)*(1-fy)+b*fx*(1-fy)+c*(1-fx)*fy+d*fx*fy; }
  // a picture laid over the map by its corners (one mercator mosaic, a few km at most, so straight lat placement is within a metre)
  function overlay(g,G,canvas,old,cb){ canvas.toBlob(b=>{ if(!b) return; const u=URL.createObjectURL(b); if(old) URL.revokeObjectURL(old);
      g.innerHTML=''; el('image',{href:u,x:G.lon0*K,y:-G.lat1,width:(G.lon1-G.lon0)*K,height:G.lat1-G.lat0,preserveAspectRatio:'none',opacity:1},g); cb(u); },'image/png'); }

  // ---- the tool bar at the foot of the map ----
  mw.insertAdjacentHTML('beforeend',`<div class="trbar" id="trBar" hidden><div class="trhd"><b id="trT"></b><button class="px" id="trX" aria-label="Close tool">×</button></div><div id="trB"></div><p class="hint" id="trM" aria-live="polite"></p></div>
<div class="cmpk" id="cmpK" hidden><div class="cmpl"></div><button class="cmph" id="cmpH" aria-label="Drag to compare"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><span class="cmpn cmpa" id="cmpA"></span><span class="cmpn cmpb" id="cmpB"></span></div>`);
  const bar=document.getElementById('trBar'), barB=document.getElementById('trB'), barM=document.getElementById('trM'), knob=document.getElementById('cmpK');
  const say=m=>{ TR.msg=m; barM.textContent=m; };
  document.getElementById('trX').onclick=()=>trSet('');
  function barLift(){ const h=document.querySelector('.hrbar:not([hidden])'); bar.style.bottom=h&&h.offsetHeight?(h.offsetHeight+40)+'px':''; }

  // ---- 1. swipe compare: today on the right of the slider, the chosen map type on the left ----
  const TYPEN={default:'Street map',sat:'Satellite',old:'Old maps (1936/1972)','1800s':'1800s maps',plat1913:'Plat books',fire:'Fire maps',survey:'Survey 1840s-50s'};
  const cmpSrc=()=>GM.type==='sat'?'b':TR.cmpSrc;
  const tlCmp=tileLayer('cmp',(z,x,y)=>cmpSrc()==='s'?ogURL.s(z,x,y):ogURL.b(z,x,y),{max:()=>cmpSrc()==='s'?18:(ogDark()?16:19),show:()=>TR.tool==='cmp'&&!T3.on&&navigator.onLine!==false});
  tlCmp.alt=(z,x,y)=>cmpSrc()==='s'?ogURL.s2(z,x,y):ogURL.b(z,x,y);
  tlCmp.div.classList.add('ogtl-cmp'); TR.cmpL=tlCmp;
  function cmpReset(){ for(const im of tlCmp.tiles.values()) im.remove(); tlCmp.tiles.clear(); for(const lv of tlCmp.levels.values()) lv.div.remove(); tlCmp.levels.clear(); }
  let cmpWas='';
  const _tuC=tilesUpdate; tilesUpdate=function(){ const k=cmpSrc()+(ogDark()?'d':''); if(k!==cmpWas){ cmpWas=k; cmpReset(); }
    if(tileRoot.lastChild!==tlCmp.div) tileRoot.appendChild(tlCmp.div); _tuC(); cmpClip(); };
  // old maps drawn in the SVG (fire maps, and whole sheets where the tiles aren't published) are cut at the slider too,
  const cp=document.createElementNS(NSV,'clipPath'); cp.id='cmpCP'; const cpr=el('rect',{},cp); (svg.querySelector('defs')||svg.insertBefore(document.createElementNS(NSV,'defs'),svg.firstChild)).appendChild(cp);
  const cmpGroups=()=>[...gBase.children].filter(g=>g.classList.contains('ogland')||g.tagName==='g'&&g.querySelector('image'));   // plus the plain land fill, shown when no street tiles are
  function cmpClip(){ const on=TR.tool==='cmp'&&!T3.on; knob.hidden=!on;
    for(const g of cmpGroups()) if(on) g.setAttribute('clip-path','url(#cmpCP)'); else g.removeAttribute('clip-path');
    if(!on){ tlCmp.div.style.clipPath=''; return; }
    const W=VIEW.W||svgRect().width, sx=TR.cmpF*W; let k=1, tx=0; const m=/matrix\(([^)]+)\)/.exec(stage.style.transform||''); if(m){ const a=m[1].split(',').map(Number); k=a[0]||1; tx=a[4]||0; }
    const lx=(sx-tx)/k; tlCmp.div.style.clipPath=`polygon(${lx.toFixed(1)}px -99999px,99999px -99999px,99999px 99999px,${lx.toFixed(1)}px 99999px)`;
    const g=VIEW.vb; if(g&&W){ const wx=g.x+lx/W*g.w; cpr.setAttribute('x',g.x-g.w*20); cpr.setAttribute('width',Math.max(0,wx-(g.x-g.w*20))); cpr.setAttribute('y',g.y-g.h*20); cpr.setAttribute('height',g.h*41); }
    knob.style.left=(TR.cmpF*100)+'%';
    document.getElementById('cmpA').textContent=TYPEN[GM.type]||'This map'; document.getElementById('cmpB').textContent='Today: '+(cmpSrc()==='s'?'satellite':'street map'); }
  const _sfC=stageFast; stageFast=function(){ _sfC(); if(TR.tool==='cmp') cmpClip(); };
  OGE.on('post',()=>{ if(TR.tool==='cmp'||!knob.hidden) cmpClip(); });
  { const h=document.getElementById('cmpH'); let drag=null;
    h.addEventListener('pointerdown',e=>{ e.preventDefault(); e.stopPropagation(); drag=mw.getBoundingClientRect(); h.setPointerCapture(e.pointerId); });
    h.addEventListener('pointermove',e=>{ if(!drag) return; e.stopPropagation(); TR.cmpF=Math.max(0.03,Math.min(0.97,(e.clientX-drag.left)/drag.width)); cmpClip(); });
    const up=e=>{ if(!drag) return; drag=null; try{ h.releasePointerCapture(e.pointerId); }catch(_){} try{ localStorage.setItem('og-cmp-f',TR.cmpF.toFixed(3)); }catch(_){} };
    h.addEventListener('pointerup',up); h.addEventListener('pointercancel',up);
    h.addEventListener('keydown',e=>{ if(e.key==='ArrowLeft'||e.key==='ArrowRight'){ TR.cmpF=Math.max(0.03,Math.min(0.97,TR.cmpF+(e.key==='ArrowLeft'?-0.05:0.05))); cmpClip(); e.preventDefault(); } }); }
  try{ TR.cmpSrc=localStorage.getItem('og-cmp-src')||'s'; TR.cmpF=+(localStorage.getItem('og-cmp-f')||0.5)||0.5; }catch(_){}
  function cmpBar(){ barB.innerHTML=`<div class="trrow"><span>Right side, today:</span><button class="trc" data-src="s" aria-pressed="${cmpSrc()==='s'}"${GM.type==='sat'?' disabled':''}>Satellite</button><button class="trc" data-src="b" aria-pressed="${cmpSrc()==='b'}">Street map</button></div>
<div class="trrow trs"><span>Left side:</span>${Object.entries(TYPEN).map(([k,v])=>`<button class="trc" data-mt2="${k}" aria-pressed="${GM.type===k}">${esc(v.replace(/ \(.*\)/,''))}</button>`).join('')}</div>`;
    say(T3.on?'Compare works in the flat map. Tap 2D to use it.':'Drag the round handle. Left: '+(TYPEN[GM.type]||'this map')+'. Right: today. Old maps only cover the areas they were drawn for.'); }
  barB.addEventListener('click',e=>{ const b=e.target.closest('button'); if(!b) return;
    if(b.dataset.src){ TR.cmpSrc=b.dataset.src; try{ localStorage.setItem('og-cmp-src',TR.cmpSrc); }catch(_){} tilesSoon(); cmpBar(); cmpClip(); }
    else if(b.dataset.mt2){ if(typeof gmSetType==='function') gmSetType(b.dataset.mt2); if(typeof gmSheetSync==='function') try{ gmSheetSync(); }catch(_){} tilesSoon(); drawMarkers(); setTimeout(()=>{ cmpBar(); cmpClip(); },60); }
    else if(b.dataset.vr){ TR.viewR=+b.dataset.vr; viewBar(); if(TR.view) viewRun(TR.view[0],TR.view[1]); }
    else if(b.dataset.pf==='undo'){ TR.prof.pop(); profRun(); } else if(b.dataset.pf==='clear'){ TR.prof=[]; profRun(); } });

  // ---- 2. slope and benches for the ground in view ----
  // Gold: level ground (under 4 degrees) 3-30 m above the low ground within ~160 m and near the slope down to it: terrace and bluff rims, the dry level spots people camped and picnicked on.
  // Blue: flat ground within 2 m of that low ground (floodplain, marsh). Red: steep (over 15 degrees). Sunny south-facing gentle slopes get a light gold.
  function slopeView(){ const s=VIEW.s||scale(); if(!s||!VIEW.vb) return null; const g=VIEW.vb, m=0.15;
    const lon0=(g.x-g.w*m)/K, lon1=(g.x+g.w*(1+m))/K, lat1=-(g.y-g.h*m), lat0=-(g.y+g.h*(1+m)); let z=Math.min(15,ogZ()+1);
    for(;z>=12;z--){ const [x0,x1,y0,y1]=tileRange(z,lon0,lon1,lat0,lat1); if((x1-x0+1)*(y1-y0+1)<=16) return [z,x0,x1,y0,y1]; } return null; }
  async function slopeRun(){ if(TR.tool!=='slope') return; const v=slopeView();
    if(!v){ gTR.innerHTML=''; TR.slopeKey=''; say('Zoom in closer (a few miles across or less) to shade slope and benches.'); return; }
    const key=v.join(','); if(key===TR.slopeKey) return; TR.slopeKey=key; const my=++TR.slopeBusy; say('Reading elevation…');
    const G=await demGrid(v[0],v[1],v[2],v[3],v[4]); if(my!==TR.slopeBusy||TR.tool!=='slope') return;
    if(!G.got){ TR.slopeKey=''; say('No elevation here right now (no signal?). Places you shaded before work offline in the app.'); return; }
    const {W,H,E,res}=G, cv=document.createElement('canvas'); cv.width=W; cv.height=H; const cx=cv.getContext('2d'), img=cx.createImageData(W,H), D=img.data;
    // slope (Horn) for every cell
    const S=new Float32Array(W*H), AS=new Int8Array(W*H);
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const i=y*W+x, e=E[i]; if(e!==e){ S[i]=NaN; continue; }
      const g=(xx,yy)=>{ const v=E[Math.max(0,Math.min(H-1,yy))*W+Math.max(0,Math.min(W-1,xx))]; return v===v?v:e; };
      const a=g(x-1,y-1),b=g(x,y-1),c=g(x+1,y-1),d=g(x-1,y),f=g(x+1,y),h=g(x-1,y+1),k=g(x,y+1),l=g(x+1,y+1);
      const dzdx=((c+2*f+l)-(a+2*d+h))/(8*res), dzdy=((h+2*k+l)-(a+2*b+c))/(8*res); S[i]=Math.atan(Math.hypot(dzdx,dzdy))*180/Math.PI;
      AS[i]=dzdy<-0.02&&Math.abs(dzdx)<-dzdy*1.5?1:0; }   // faces south: the ground rises to the north
    // per block of ~20 m: lowest ground and steepest slope, then looked up over nearby blocks
    const B=Math.max(1,Math.round(20/res)), bw=Math.ceil(W/B), bh=Math.ceil(H/B), bm=new Float32Array(bw*bh).fill(Infinity), bs=new Float32Array(bw*bh);
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){ const i=y*W+x, e=E[i]; if(e!==e) continue; const k=(y/B|0)*bw+(x/B|0); if(e<bm[k]) bm[k]=e; if(S[i]>bs[k]) bs[k]=S[i]; }
    const near=(arr,r,mx)=>{ const R=Math.max(1,Math.round(r/(B*res))), out=new Float32Array(bw*bh);
      for(let j=0;j<bh;j++) for(let i=0;i<bw;i++){ let m=mx?-Infinity:Infinity; for(let b=Math.max(0,j-R);b<=Math.min(bh-1,j+R);b++) for(let a=Math.max(0,i-R);a<=Math.min(bw-1,i+R);a++){ if((a-i)**2+(b-j)**2>R*R+R) continue; const v=arr[b*bw+a]; if(mx?v>m:v<m) m=v; } out[j*bw+i]=m; } return out; };
    const lo=near(bm,160,false), edge=near(bs,50,true);
    // bench: level (under 3.5 degrees), 3-30 m above the low ground within ~500 ft, and within ~160 ft of a 10-degree slope down to it (the rim of a terrace or bluff)
    for(let i=0;i<W*H;i++){ const e=E[i], sl=S[i]; if(e!==e) continue; const y=i/W|0, x=i-y*W, bk=(y/B|0)*bw+(x/B|0), above=e-lo[bk], o=i*4;
      if(sl>15){ D[o]=196; D[o+1]=60; D[o+2]=40; D[o+3]=Math.min(140,50+(sl-15)*6); }
      else if(sl<3.5&&above>=3&&above<=30&&edge[bk]>=10){ D[o]=240; D[o+1]=170; D[o+2]=10; D[o+3]=150; }
      else if(sl<3&&above<1.5){ D[o]=60; D[o+1]=130; D[o+2]=200; D[o+3]=60; }
      else if(sl>=3&&sl<10&&AS[i]){ D[o]=240; D[o+1]=205; D[o+2]=100; D[o+3]=35; } }
    cx.putImageData(img,0,0);
    overlay(gTR,G,cv,TR.slopeURL,u=>{ TR.slopeURL=u; });
    say(`Gold: level benches 10-100 ft above nearby low ground, at the rim of a terrace or bluff (camp, picnic and house ground). Light gold: sunny south slopes. Blue: low flats that flood. Red: steep. ${G.got<G.n?'Some elevation tiles did not load. ':''}Elevation: USGS 3DEP, about 30 ft detail.`); }
  let slopeT=0; OGE.on('post',()=>{ if(TR.tool==='slope'){ clearTimeout(slopeT); slopeT=setTimeout(()=>slopeRun().catch(e=>OGE.err('slope',e)),350); } });

  // ---- 3. viewshed: tap a point, everything shaded can see it (tap the river to find the banks that look out over it) ----
  function viewBar(){ barB.innerHTML=`<div class="trrow"><span>Reach:</span>${[[1000,'0.6 mi'],[2000,'1.2 mi'],[4000,'2.5 mi']].map(([r,n])=>`<button class="trc" data-vr="${r}" aria-pressed="${TR.viewR===r}">${n}</button>`).join('')}</div>`; }
  async function viewRun(lon,lat){ TR.view=[lon,lat]; const R=TR.viewR, z=R>2500?13:14, dlat=R/111320, dlon=R/(111320*Math.cos(lat*Math.PI/180));
    gTRL.innerHTML=''; const [x,y]=P(lon,lat), s=VIEW.s||scale(); el('circle',{cx:x,cy:y,r:7/s,fill:'var(--accent)',stroke:'var(--panel)','stroke-width':2.5/s},gTRL);
    say('Reading elevation…'); const [x0,x1,y0,y1]=tileRange(z,lon-dlon,lon+dlon,lat-dlat,lat+dlat); const G=await demGrid(z,x0,x1,y0,y1);
    if(TR.tool!=='view'||TR.view[0]!==lon||TR.view[1]!==lat) return;
    if(!G.got){ say('No elevation here right now (no signal?).'); return; }
    const {W,H,E,res}=G, ox=Math.floor(G.px(lon)), oy=Math.floor(G.py(lat)), rp=Math.round(R/res), V=new Uint8Array(W*H), h0=(E[oy*W+ox]||0)+1.7;
    const ray=(tx,ty)=>{ const dx=tx-ox, dy=ty-oy, n=Math.max(Math.abs(dx),Math.abs(dy)); let mA=-Infinity;
      for(let t=1;t<=n;t++){ const x=Math.round(ox+dx*t/n), y=Math.round(oy+dy*t/n); if(x<0||y<0||x>=W||y>=H) break; const d=Math.hypot(x-ox,y-oy)*res; if(d>R) break;
        const e=E[y*W+x]; if(e!==e) continue; const a=(e-h0-d*d/12740000*0.87)/d; if(a>=mA){ V[y*W+x]=1; } if(a>mA) mA=a; } };
    for(let k=-rp;k<=rp;k++){ ray(ox+k,oy-rp); ray(ox+k,oy+rp); ray(ox-rp,oy+k); ray(ox+rp,oy+k); }
    V[oy*W+ox]=1;
    const cv=document.createElement('canvas'); cv.width=W; cv.height=H; const cx=cv.getContext('2d'), img=cx.createImageData(W,H), D=img.data; let nv=0, nt=0;
    for(let y=Math.max(0,oy-rp);y<=Math.min(H-1,oy+rp);y++) for(let x=Math.max(0,ox-rp);x<=Math.min(W-1,ox+rp);x++){ if((x-ox)**2+(y-oy)**2>rp*rp) continue; nt++; const o=(y*W+x)*4;
      if(V[y*W+x]){ nv++; D[o]=250; D[o+1]=180; D[o+2]=20; D[o+3]=150; } else { D[o]=30; D[o+1]=30; D[o+2]=40; D[o+3]=34; } }
    cx.putImageData(img,0,0); overlay(gTR,G,cv,TR.viewURL,u=>{ TR.viewURL=u; });
    say(`Shaded gold: ground that can see the dot (and be seen from it), out to ${(R/1609).toFixed(1)} mi: ${Math.round(nv/Math.max(1,nt)*100)}% of it. Dark: hidden behind hills. Trees and buildings are not counted. Tap again to move the dot.`); }

  // ---- 4. terrain profile along a route you tap out ----
  function profBar(){ const D=TR.profD;
    barB.innerHTML=`<div class="trrow"><button class="trc" data-pf="undo"${TR.prof.length?'':' disabled'}>Undo</button><button class="trc" data-pf="clear"${TR.prof.length?'':' disabled'}>Clear</button></div>`+(D?`<svg class="trch" id="trCh" viewBox="0 0 320 110" preserveAspectRatio="none" role="img" aria-label="Elevation along the route"></svg><div class="trst">${D.txt}</div>`:'');
    if(D) profChart(); }
  function profChart(){ const D=TR.profD, c=document.getElementById('trCh'); if(!c||!D) return; const n=D.e.length, L=D.d[n-1]||1;
    let lo=Math.min(...D.e), hi=Math.max(...D.e); if(hi-lo<6){ const m=(hi+lo)/2; lo=m-3; hi=m+3; } const X=d=>4+d/L*312, Y=e=>100-(e-lo)/(hi-lo)*86;
    const p=D.e.map((e,i)=>`${i?'L':'M'}${X(D.d[i]).toFixed(1)},${Y(e).toFixed(1)}`).join('');
    c.innerHTML=`<path d="${p}L316,108L4,108Z" fill="var(--accent)" fill-opacity=".18"/><path d="${p}" fill="none" stroke="var(--accent)" stroke-width="2" vector-effect="non-scaling-stroke"/>
<text x="6" y="12" font-size="10" fill="var(--muted)">${ft(hi)}</text><text x="6" y="96" font-size="10" fill="var(--muted)">${ft(lo)}</text><text x="314" y="96" font-size="10" text-anchor="end" fill="var(--muted)">${hrLen(L)}</text>
<line id="trCu" x1="-9" x2="-9" y1="4" y2="108" stroke="var(--ink)" stroke-width="1" vector-effect="non-scaling-stroke"/><text id="trCt" x="160" y="12" font-size="10" text-anchor="middle" fill="var(--ink)"></text>`;
    const mv=e=>{ const r=c.getBoundingClientRect(), f=Math.max(0,Math.min(1,(e.clientX-r.left-r.width*4/320)/(r.width*312/320))), d=f*L; let i=0; while(i<n-1&&D.d[i+1]<d) i++;
      c.querySelector('#trCu').setAttribute('x1',X(D.d[i])); c.querySelector('#trCu').setAttribute('x2',X(D.d[i])); c.querySelector('#trCt').textContent=`${hrLen(D.d[i])} · ${ft(D.e[i])}`;
      const s=VIEW.s||scale(), [x,y]=P(D.ll[i][0],D.ll[i][1]); let dot=gTRL.querySelector('.trcur'); if(!dot){ dot=el('circle',{class:'trcur',fill:'var(--ink)',stroke:'var(--panel)'},gTRL); }
      dot.setAttribute('cx',x); dot.setAttribute('cy',y); dot.setAttribute('r',6/s); dot.setAttribute('stroke-width',2/s); };
    c.addEventListener('pointerdown',e=>{ e.stopPropagation(); mv(e); c.setPointerCapture(e.pointerId); }); c.addEventListener('pointermove',mv); }
  function profLine(){ gTRL.innerHTML=''; const s=VIEW.s||scale(); if(!s) return; const pts=TR.prof.map(([lo,la])=>P(lo,la));
    if(pts.length>1) el('path',{d:pts.map((p,i)=>(i?'L':'M')+p[0]+','+p[1]).join(''),fill:'none',stroke:'var(--accent)','stroke-width':3.5/s,'stroke-linecap':'round','stroke-linejoin':'round'},gTRL);
    for(const [x,y] of pts) el('circle',{cx:x,cy:y,r:5/s,fill:'var(--panel)',stroke:'var(--accent)','stroke-width':2.5/s},gTRL); }
  async function profRun(){ profLine(); if(TR.prof.length<2){ TR.profD=null; profBar(); say(TR.prof.length?'Tap the next point. Each tap adds a bend.':'Tap the map where your route starts, then tap along it.'); return; }
    const P0=TR.prof.slice(), seg=[]; let L=0; for(let i=1;i<P0.length;i++){ const d=mDist(P0[i-1][0],P0[i-1][1],P0[i][0],P0[i][1]); seg.push(d); L+=d; }
    const n=Math.max(2,Math.min(400,Math.ceil(L/5)+1)), ll=[], dd=[];
    for(let k=0;k<n;k++){ let d=L*k/(n-1), i=0; while(i<seg.length-1&&d>seg[i]){ d-=seg[i]; i++; } const f=seg[i]?Math.min(1,d/seg[i]):0; ll.push([P0[i][0]+(P0[i+1][0]-P0[i][0])*f,P0[i][1]+(P0[i+1][1]-P0[i][1])*f]); dd.push(L*k/(n-1)); }
    let lo0=Infinity,lo1=-Infinity,la0=Infinity,la1=-Infinity; for(const [lo,la] of ll){ lo0=Math.min(lo0,lo); lo1=Math.max(lo1,lo); la0=Math.min(la0,la); la1=Math.max(la1,la); }
    let z=15, r; for(;z>=11;z--){ r=tileRange(z,lo0,lo1,la0,la1); if((r[1]-r[0]+1)*(r[3]-r[2]+1)<=12) break; }
    say('Reading elevation…'); const G=await demGrid(z,...r); if(TR.tool!=='prof'||P0.length!==TR.prof.length) return;
    if(!G.got){ TR.profD=null; profBar(); say('No elevation here right now (no signal?).'); return; }
    const e=ll.map(([lo,la])=>demAt(G,lo,la)), ok=e.filter(v=>v===v); if(!ok.length){ say('No elevation for this route.'); return; }
    for(let i=0;i<e.length;i++) if(e[i]!==e[i]) e[i]=i?e[i-1]:ok[0];
    let up=0, dn=0, gmax=0; const w=Math.max(1,Math.round(15/Math.max(1,L/(n-1))));   // steepest grade over ~15 m so the 10 m grid's steps don't read as cliffs
    for(let i=1;i<n;i++){ const dz=e[i]-e[i-1]; if(dz>0) up+=dz; else dn-=dz; if(i>=w){ const g=Math.abs(e[i]-e[i-w])/Math.max(1,dd[i]-dd[i-w]); if(g>gmax) gmax=g; } }
    TR.profD={e,d:dd,ll,txt:`<b>${hrLen(L)}</b> · start ${ft(e[0])}, end ${ft(e[n-1])} · climb ${ft(up)}, drop ${ft(dn)} · steepest ${Math.round(gmax*100)}% (${Math.round(Math.atan(gmax)*180/Math.PI)}°)`};
    profBar(); say('Slide a finger along the chart to see where each point is. Tap the map to add more bends.'); }
  OGE.on('draw',s=>{ if(TR.tool==='prof') profLine(); else if(TR.tool==='view'&&TR.view){ const c=gTRL.querySelector('circle'); if(c&&s){ c.setAttribute('r',7/s); c.setAttribute('stroke-width',2.5/s); } } });

  // taps go to the tool while one is listening
  const _fpT=findPick; findPick=function(cx,cy){ if(TR.tool==='view'||TR.tool==='prof'){ const r=svgRect(), [wx,wy]=toW(cx+r.left,cy+r.top), lon=wx/K, lat=-wy;
      if(TR.tool==='view') viewRun(lon,lat).catch(e=>OGE.err('view',e)); else { TR.prof.push([lon,lat]); profRun().catch(e=>OGE.err('prof',e)); } return true; }
    return _fpT(cx,cy); };

  // ---- switching tools ----
  const TOOLN={cmp:'Swipe compare',slope:'Slope and benches',view:'Viewshed',prof:'Terrain profile'};
  window.trSet=function(t){ if(TR.tool===t) t=''; const was=TR.tool; TR.tool=t; bar.hidden=!t; document.body.classList.toggle('trtool',!!t);
    if(was==='slope'||was==='view'){ gTR.innerHTML=''; TR.slopeKey=''; TR.slopeBusy++; } if(was==='view'||was==='prof') gTRL.innerHTML='';
    if(was==='view') TR.view=null; if(was==='prof'){ TR.prof=[]; TR.profD=null; }
    document.getElementById('trT').textContent=TOOLN[t]||''; barB.innerHTML=''; say('');
    if(t==='cmp') cmpBar(); else if(t==='slope'){ slopeRun().catch(e=>OGE.err('slope',e)); } else if(t==='view'){ viewBar(); say('Tap a spot on the map. Tip: tap the river or lake to see which banks look out over it.'); } else if(t==='prof') profRun();
    document.querySelectorAll('#trTools [data-tr]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.tr===TR.tool)); barLift(); tilesSoon(); cmpClip(); };
  { const n=document.getElementById('gmNote'); if(n) n.insertAdjacentHTML('afterend',`<b class="gml">Compare and terrain</b><div class="gmdet" id="trTools">${Object.entries(TOOLN).map(([k,v])=>`<button data-tr="${k}" aria-pressed="false">${v}</button>`).join('')}</div>`);
    const tt=document.getElementById('trTools'); if(tt) tt.onclick=e=>{ const b=e.target.closest('[data-tr]'); if(!b) return; if(typeof gmSheet==='function') gmSheet(false); trSet(b.dataset.tr); }; }
  const _gtT=typeof gmSetType==='function'?gmSetType:null; if(_gtT) gmSetType=function(...a){ const r=_gtT.apply(this,a); if(TR.tool==='cmp'){ cmpBar(); setTimeout(cmpClip,30); } return r; };
  if(typeof hrRenderBar==='function'){ const _hb=hrRenderBar; hrRenderBar=function(){ _hb(); barLift(); }; }

  // ---- covered ground: shade by number of passes (light = once, dark = three times or more) ----
  // Each hunt is stamped onto a grid at its swing width; a cell counts a new pass when the track leaves it and comes back (or another hunt crosses it).
  function covGrid(list,box,c){ const kx=111320*Math.cos((box[1]+box[3])/2*Math.PI/180), ky=111320, W=Math.ceil((box[2]-box[0])*kx/c)+1, H=Math.ceil((box[3]-box[1])*ky/c)+1;
    const cnt=new Uint8Array(W*H), last=new Float32Array(W*H), who=new Int32Array(W*H).fill(-1);
    list.forEach((t,ti)=>{ const r=(t.sw||0.9)/2, rc=Math.ceil(r/c), gap=Math.max(2.5,(t.sw||0.9)*2.5); let a=null, run=0;
      const stamp=(x,y)=>{ const ix=Math.round(x/c), iy=Math.round(y/c); for(let j=-rc;j<=rc;j++){ const yy=iy+j; if(yy<0||yy>=H) continue; for(let i=-rc;i<=rc;i++){ const xx=ix+i; if(xx<0||xx>=W||(i*i+j*j)*c*c>r*r) continue; const k=yy*W+xx;
        if(who[k]!==ti||run-last[k]>gap){ if(cnt[k]<255) cnt[k]++; } who[k]=ti; last[k]=run; } } };
      for(const q of t.pts||[]){ if(!q){ a=null; run+=gap*2; continue; } const x=(q[1]/1e6-box[0])*kx, y=(box[3]-q[0]/1e6)*ky;
        if(a){ const d=Math.hypot(x-a[0],y-a[1]), n=Math.max(1,Math.ceil(d/c)); for(let k=1;k<=n;k++){ run+=d/n; stamp(a[0]+(x-a[0])*k/n,a[1]+(y-a[1])*k/n); } } else stamp(x,y);
        a=[x,y]; } });
    return {cnt,W,H,c,kx,ky}; }
  const trkBox=t=>{ let b=[Infinity,Infinity,-Infinity,-Infinity]; for(const q of t.pts||[]){ if(!q) continue; const lo=q[1]/1e6, la=q[0]/1e6; if(lo<b[0]) b[0]=lo; if(la<b[1]) b[1]=la; if(lo>b[2]) b[2]=lo; if(la>b[3]) b[3]=la; } return b; };
  const COV={key:'', imgs:[]}; const gCov=el('g',{'pointer-events':'none',class:'gcov'},svg); svg.insertBefore(gCov,(typeof gHR!=='undefined'&&gHR.nextSibling)||gMk);
  function covBuild(){ const show=on.has('_tracks'), list=Object.values(HR.T).filter(t=>(show||t.id===HR.sel)&&t.pts&&t.pts.length>1);
    const key=list.map(t=>t.id+':'+t.pts.length+':'+(t.sw||0.9)).join('|'); if(key===COV.key) return; COV.key=key;
    for(const u of COV.imgs) URL.revokeObjectURL(u); COV.imgs=[]; gCov.innerHTML='';
    // tracks whose boxes touch (30 m apart or less) are drawn together so passes from different days add up
    const pad=0.0004, grp=[]; for(const t of list){ const b=trkBox(t); if(!isFinite(b[0])) continue; let g={b:[b[0]-pad,b[1]-pad,b[2]+pad,b[3]+pad],t:[t]};
      for(let i=grp.length-1;i>=0;i--){ const o=grp[i]; if(o.b[0]<=g.b[2]&&g.b[0]<=o.b[2]&&o.b[1]<=g.b[3]&&g.b[1]<=o.b[3]){ g={b:[Math.min(o.b[0],g.b[0]),Math.min(o.b[1],g.b[1]),Math.max(o.b[2],g.b[2]),Math.max(o.b[3],g.b[3])],t:o.t.concat(g.t)}; grp.splice(i,1); } }
      grp.push(g); }
    for(const g of grp){ const kx=111320*Math.cos((g.b[1]+g.b[3])/2*Math.PI/180), wm=(g.b[2]-g.b[0])*kx, hm=(g.b[3]-g.b[1])*111320;
      const c=Math.max(0.3,Math.sqrt(wm*hm/1.2e6),Math.max(wm,hm)/2400); const C=covGrid(g.t,g.b,c);
      const cv=document.createElement('canvas'); cv.width=C.W; cv.height=C.H; const cx=cv.getContext('2d'), img=cx.createImageData(C.W,C.H), D=img.data;
      for(let i=0;i<C.cnt.length;i++){ const n=C.cnt[i]; if(!n) continue; const o=i*4; if(n===1){ D[o]=120; D[o+1]=200; D[o+2]=120; D[o+3]=150; } else if(n===2){ D[o]=40; D[o+1]=150; D[o+2]=70; D[o+3]=190; } else { D[o]=10; D[o+1]=85; D[o+2]=40; D[o+3]=220; } }
      cx.putImageData(img,0,0); const b=g.b;
      cv.toBlob(bl=>{ if(!bl) return; const u=URL.createObjectURL(bl); COV.imgs.push(u); el('image',{href:u,x:b[0]*K,y:-b[3],width:(b[2]-b[0])*K,height:b[3]-b[1],preserveAspectRatio:'none',style:'image-rendering:pixelated'},gCov); },'image/png'); } }
  let covT=0;
  OGE.on('draw',s=>{ if(!s) return; const show=on.has('_tracks')||HR.sel; gCov.style.display=show?'':'none'; if(!show) return;
    clearTimeout(covT); covT=setTimeout(()=>{ try{ covBuild(); }catch(e){ OGE.err('cov',e); } },120);
    // close in, the pass shading replaces the plain green bands (which can't show overlaps); farther out the bands keep thin tracks visible
    const near=!HR.rec&&s*0.9/111320>=2.5, gA=gHR&&gHR.firstElementChild; if(gA&&gA.tagName==='g') gA.style.display=near?'none':''; });
  // card: how much of the ground around this pin you've actually swung
  if(typeof findsHTML==='function'){ const _fhC=findsHTML; findsHTML=function(p){ let h=_fhC(p); try{ const H=hrHits(p,120); if(H.length&&p&&isFinite(p.la)){
      const R=40, d=R/111320, box=[p.lo-d/Math.cos(p.la*Math.PI/180),p.la-d,p.lo+d/Math.cos(p.la*Math.PI/180),p.la+d], C=covGrid(H,box,0.5); let n=0,n1=0,n2=0;
      const cx0=(p.lo-box[0])*C.kx, cy0=(box[3]-p.la)*C.ky; for(let j=0;j<C.H;j++) for(let i=0;i<C.W;i++){ if((i*C.c-cx0)**2+(j*C.c-cy0)**2>R*R) continue; n++; const v=C.cnt[j*C.W+i]; if(v) n1++; if(v>1) n2++; }
      if(n){ const line=`<p class="hint">Coverage: you have swung <b>${Math.round(n1/n*100)}%</b> of the ground within 130 ft of this pin${n2/n>=0.01?`, ${Math.round(n2/n*100)}% of it twice or more`:''}. Turn on Covered ground and zoom in: light green is one pass, dark green three or more.</p>`;
        h=h.replace('<ul class="flog">',line+'<ul class="flog">'); } } }catch(e){ OGE.err('covcard',e); } return h; }; }
  if(typeof LBY!=='undefined'&&LBY._tracks&&!/passes/.test(LBY._tracks.d)) LBY._tracks.d+='. Zoomed in, ground you swung more than once is darker green (light = one pass, dark = three or more).';
  window.addEventListener('resize',()=>{ if(TR.tool) barLift(); });
}
