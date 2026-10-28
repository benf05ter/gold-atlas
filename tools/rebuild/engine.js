
// ========== Old Ground map engine (v120 rebuild) ==========
// One place owns the view, the gestures, the tiles and the canvas. Features never wrap these functions any more:
// they call drawMarkers() / apply() and register hooks with OGE.on('pre'|'draw'|'post', fn).
//   vb            the view box in map units (x = longitude * K, y = -latitude), always the aspect of the map box
//   fit()         grow vb to the map box's aspect;  apply()  commit vb now (view box, labels, pins, tiles)
//   zoomAt(f,x,y) zoom about a map point; the picture moves at once, pins repaint when the gesture settles
//   drawMarkers() repaint pins and overlays on the next frame (coalesced);  drawMarkers.now()  paint at once
//   OGE.on(phase, fn(s))  'pre' runs before pins are picked (layer sync), 'draw' after SVG overlays, 'post' after the paint
var OGE={ver:120, hooks:{pre:[],draw:[],post:[]}, log:[]};
OGE.on=(ph,fn)=>{ (OGE.hooks[ph]||OGE.hooks.post).push(fn); };
OGE.err=(where,e)=>{ try{ OGE.log.push([Date.now(),where,String(e&&e.message||e)].join(' ')); if(OGE.log.length>40) OGE.log.shift(); }catch(_){} };
window.addEventListener('error',e=>OGE.err('window',e.error||e.message));
window.addEventListener('unhandledrejection',e=>OGE.err('promise',e.reason));

// ---- stage: tiles (HTML) under the SVG, pins on a canvas over it; the stage moves as one piece during a gesture ----
const ogWrap=svg.parentElement;
const m3d=document.createElement('div'); m3d.className='m3d'; ogWrap.insertBefore(m3d,svg);
const stage=document.createElement('div'); stage.className='ogstage'; m3d.appendChild(stage);
const tileRoot=document.createElement('div'); tileRoot.className='ogtiles'; tileRoot.setAttribute('aria-hidden','true'); stage.appendChild(tileRoot);
stage.appendChild(svg);
const pcv=document.createElement('canvas'); pcv.className='pcv'; pcv.setAttribute('aria-hidden','true'); stage.appendChild(pcv);
const pcx=pcv.getContext('2d');
for(const p of [gBase.children[0],gBase.children[1],gBase.children[2]]) if(p) p.classList.add('ogland');   // state and lake fills: hidden once street or satellite tiles show
// the box the map draws in; measured by a ResizeObserver, never read from layout in the hot path
const VIEW={W:0,H:0,vb:null,s:0};
{ const ro=new ResizeObserver(es=>{ const r=es[es.length-1].contentRect; if(!r.width||!r.height) return; const ow=VIEW.W, oh=VIEW.H; BOX.w=r.width; BOX.h=r.height;
    if(ow&&oh&&(ow!==r.width||oh!==r.height)&&vb.w>0){ const s=ow/vb.w, cx=vb.x+vb.w/2, cy=vb.y+vb.h/2; vb={x:cx-r.width/s/2,y:cy-r.height/s/2,w:r.width/s,h:r.height/s}; }
    if(!GES.active) commit(); else GES.dirty=true; }); ro.observe(m3d); }
svgRect=()=>{ const r=m3d.getBoundingClientRect(); const w=BOX.w||r.width, h=BOX.h||r.height; return {left:r.left,top:r.top,width:w,height:h,right:r.left+w,bottom:r.top+h}; };

// ---- view ----
const box=(a,b,c,d)=>{const [x0,y0]=P(a,d),[x1,y1]=P(b,c); return {x:x0,y:y0,w:x1-x0,h:y1-y0};};
const V={CF:box(-91.43,-91.37,44.918,44.948),EC:box(-92.9,-90.3,44.05,45.6), N:box(-95.6,-87.2,45.3,49.0), WI:box(-97.6,-82.3,41.6,49.5)};
var vb={...V.EC}, _sw=0, FITWH=[0,0];
const scale=()=>(BOX.w||svg.clientWidth||0)/vb.w;
function fit(){ const W=svgW(), H=svgH(); if(!W||!H) return; FITWH=[W,H]; let {x,y,w,h}=vb; if(!(w>0&&h>0)) ({x,y,w,h}=V.EC); const ar=W/H;
  if(w/h<ar){ const nw=h*ar; x-=(nw-w)/2; w=nw; } else { const nh=w/ar; y-=(nh-h)/2; h=nh; } vb={x,y,w,h}; }
const toW=(px,py)=>{ const r=svgRect(); return [vb.x+(px-r.left)/r.width*vb.w, vb.y+(py-r.top)/r.height*vb.h]; };
const ctr=()=>[vb.x+vb.w/2,vb.y+vb.h/2];
const vbClamp=()=>{ const lim=V.WI.w*2.5; if(vb.w>lim){ const f=vb.w/lim, cx=vb.x+vb.w/2, cy=vb.y+vb.h/2; vb={x:cx-vb.w/f/2,y:cy-vb.h/f/2,w:vb.w/f,h:vb.h/f}; } };

// ---- render pipeline ----
const RENDER={q:0, pending:false, lf:null};
function drawMarkers(){ if(GES.active){ GES.dirty=true; return; } if(!RENDER.q) RENDER.q=requestAnimationFrame(()=>{ RENDER.q=0; commit(false); }); }
drawMarkers.now=()=>{ if(RENDER.q){ cancelAnimationFrame(RENDER.q); RENDER.q=0; } commit(false); };
function apply(){ if(GES.active){ GES.dirty=true; stageFast(); return; } if(RENDER.q){ cancelAnimationFrame(RENDER.q); RENDER.q=0; } commit(true); }
function commit(view){ const W=svgW(), H=svgH(); if(!W||!H){ RENDER.pending=true; return; } RENDER.pending=false;
  if(!(vb.w>0)||!isFinite(vb.x)) { vb={...V.EC}; fit(); }
  if(!FITWH[0]) fit();
  const k=[vb.x,vb.y,vb.w].map(v=>v.toFixed(6)).join();
  const moved=!VIEW.vb||VIEW.k!==k;
  VIEW.W=W; VIEW.H=H; VIEW.vb={...vb}; VIEW.k=k; GES.g0=null; stage.style.transform='';
  const s=scale(); VIEW.s=s;
  if(moved||view){ svg.setAttribute('viewBox',`${vb.x} ${vb.y} ${vb.w} ${vb.h}`); if(moved&&typeof pop!=='undefined') pop.hidden=true; }
  try{ labels(s); }catch(e){ OGE.err('labels',e); }
  try{ render(s); }catch(e){ OGE.err('render',e); }
  try{ tilesUpdate(); }catch(e){ OGE.err('tiles',e); } }
// map labels (towns, counties, rings) sized in screen pixels
function labels(s){ if(!gLbl) return;
  for(const t of gLbl.querySelectorAll('text')){ const k=t.dataset.k, tier=+t.dataset.t||1; const fs=k==='town'?(tier===1?12.5:11.5):k==='ring'?11:k==='belt'?13:k==='glac'?11.5:10.5;
    t.setAttribute('font-size',fs/s); t.setAttribute('stroke-width',3/s);
    const show=k==='county'? s>140 : k==='town'? (tier===1||s>90) : k==='belt'? on.has('_belt') : k==='glac'? on.has(t.dataset.l) : k==='ring'? s<=1200 : true; t.style.display=show?'':'none';
    if(k==='town'){ t.setAttribute('dx',6/s); t.setAttribute('dy',-5/s); } if(k==='glac'&&t.dataset.l==='_flow') t.setAttribute('dy',-6/s); }
  for(const r of gLbl.querySelectorAll('rect')){ r.setAttribute('width',5/s); r.setAttribute('height',5/s); r.setAttribute('transform',`translate(${-2.5/s},${-2.5/s})`); r.style.display=(+r.dataset.t===1||s>90)?'':'none'; }
  if(typeof gRing!=='undefined') gRing.style.display=s>1200?'none':''; }
function ringVis(){}
const ORDER=['public','park','lake','restricted','drill','history','landmark','cmine','deposit','model','pit','ghost','camp','gather','beach','superior','report','geo','glacial','prehist','panning','copper','rock','treasure','wreck','trap','target','flood84','school2','vpo','school','lead','mine'];
function render(s){ { const t=(document.documentElement.dataset.theme||'')+(matchMedia('(prefers-color-scheme:dark)').matches?'d':'l'); if(_CV.__t!==t){ for(const k in _CV) delete _CV[k]; _CV.__t=t; PCV.icons.clear(); } }
  for(const f of OGE.hooks.pre) try{ f(s); }catch(e){ OGE.err('pre',e); }
  if(!s||!isFinite(s)) return;
  const sv=document.getElementById('stf')?.value||'', x0=vb.x-vb.w*.2, x1=vb.x+vb.w*1.2, y0=vb.y-vb.h*.2, y1=vb.y+vb.h*1.2;
  const vis=[]; for(const p of PTS){ if(!on.has(p.L)||(sv&&p.stt!==sv)) continue; const x=p.lo*K, y=-p.la; if(p.id===selId||(x>=x0&&x<=x1&&y>=y0&&y<=y1)) vis.push(p); }
  vis.sort((a,b)=>ORDER.indexOf(a.L)-ORDER.indexOf(b.L));
  PCV.q=[]; PCV.cls=[]; PCV.nm=s>=PLS;
  let list=vis; if(typeof UXdraw==='function'){ try{ list=UXdraw(vis,s); }catch(e){ OGE.err('UXdraw',e); list=vis.filter(p=>p.id!==selId); } } else list=vis.filter(p=>p.id!==selId);
  for(const p of list) PCV.q.push(p);
  if(window.UX&&UX.cls&&UX.cl) PCV.cls=UX.cls.slice();
  if(selId&&BYID[selId]&&on.has(BYID[selId].L)) PCV.q.push(BYID[selId]);
  // SVG overlays: show or hide groups; the two big heat-map pictures only load when first switched on
  const G=[['_mag',typeof gMag!=='undefined'&&gMag],['_prosp',typeof gProsp!=='undefined'&&gProsp],['_ice',typeof gIce!=='undefined'&&gIce],['_belt',typeof gBelt!=='undefined'&&gBelt],['_flood',typeof gFlood!=='undefined'&&gFlood],['_oldways',typeof gOld!=='undefined'&&gOld]];
  for(const [l,g] of G){ if(!g) continue; const v=on.has(l); if(g.style.display!==(v?'':'none')) g.style.display=v?'':'none'; if(v){ const im=g.querySelector('image[data-src]'); if(im){ im.setAttribute('href',im.dataset.src); im.removeAttribute('data-src'); } } }
  if(typeof gStreams!=='undefined') gStreams.style.display='none';
  if(typeof glacVis==='function') try{ glacVis(s); }catch(e){ OGE.err('glacVis',e); }
  if(typeof drawYou==='function') try{ drawYou(); }catch(e){ OGE.err('drawYou',e); }
  if(typeof drawExtra==='function') try{ drawExtra(s); }catch(e){ OGE.err('drawExtra',e); }
  for(const f of OGE.hooks.draw) try{ f(s); }catch(e){ OGE.err('draw',e); }
  pcRender(s);
  for(const f of OGE.hooks.post) try{ f(s); }catch(e){ OGE.err('post',e); } }

// ---- zoom (wheel, pinch, buttons): the stage moves at once, the full redraw waits until the gesture settles ----
function stageFast(){ if(!VIEW.vb||!VIEW.W) return; const g=VIEW.vb, k=g.w/vb.w, tx=(g.x-vb.x)*VIEW.W/vb.w, ty=(g.y-vb.y)*VIEW.H/vb.h;
  stage.style.transform=`matrix(${k},0,0,${k},${tx},${ty})`; tilesSoon(); }
const gmFast=stageFast, gmFastQ=stageFast; function gmCommit(){ apply(); }
function settle(ms){ clearTimeout(GES.settle); GES.settle=setTimeout(()=>{ if(GES.ptr.size){ settle(200); return; } GES.active=false; commit(true); },ms); }
function zoomAt(f,cx,cy){ const nw=vb.w/f; if(!(nw>0)||nw<0.015||nw>V.WI.w*2.5) return; vb={x:cx-(cx-vb.x)/f,y:cy-(cy-vb.y)/f,w:nw,h:vb.h/f};
  GES.active=true; stageFast(); settle(GES.ptr.size?400:160); }
function plZoomAnim(f,cx,cy){ let i=0; const n=9, st=Math.pow(f,1/n); const go=()=>{ zoomAt(st,cx,cy); if(++i<n) requestAnimationFrame(go); }; requestAnimationFrame(go); }

// ---- gestures: one controller for drag, pinch, wheel, tap and double tap ----
const GES={ptr:new Map(), active:false, dirty:false, moved:false, down:null, pinch:0, vel:[0,0], vt:0, last:null, settle:0, inert:0, tapT:0, tapP:null};
const ptr=GES.ptr; let moved=false;
function gesStart(){ if(!GES.active){ GES.active=true; } clearTimeout(GES.settle); if(GES.inert){ cancelAnimationFrame(GES.inert); GES.inert=0; } }
function gesEnd(){ GES.active=false; if(RENDER.q){ cancelAnimationFrame(RENDER.q); RENDER.q=0; } commit(true); GES.dirty=false; }
function pinchState(){ const [a,b]=[...GES.ptr.values()]; return {d:Math.hypot(a[0]-b[0],a[1]-b[1]), c:[(a[0]+b[0])/2,(a[1]+b[1])/2]}; }
function panBy(dx,dy){ const W=VIEW.W||svgW(), H=VIEW.H||svgH(); if(!W||!H) return; vb.x-=dx/W*vb.w; vb.y-=dy/H*vb.h; }
m3d.addEventListener('pointerdown',e=>{ if(e.button&&e.button!==0) return; if(e.isPrimary) GES.ptr.clear();
  GES.ptr.set(e.pointerId,[e.clientX,e.clientY]); try{ m3d.setPointerCapture(e.pointerId); }catch(_){}
  gesStart(); GES.moved=moved=false; GES.down=[e.clientX,e.clientY,performance.now(),e.pointerType]; GES.last=[e.clientX,e.clientY]; GES.vel=[0,0]; GES.vt=performance.now();
  if(GES.ptr.size===2){ const p=pinchState(); GES.pinch=p.d; GES.pc=p.c; } });
m3d.addEventListener('pointermove',e=>{ if(!GES.ptr.has(e.pointerId)) return; GES.ptr.set(e.pointerId,[e.clientX,e.clientY]);
  if(GES.ptr.size>=2){ const p=pinchState(); if(GES.pinch){ const f=p.d/GES.pinch; const [wx,wy]=toW(...GES.pc); const nw=vb.w/f;
      if(nw>=0.015&&nw<=V.WI.w*2.5){ vb={x:wx-(wx-vb.x)/f,y:wy-(wy-vb.y)/f,w:nw,h:vb.h/f}; } panBy(p.c[0]-GES.pc[0],p.c[1]-GES.pc[1]); }
    GES.pinch=p.d; GES.pc=p.c; GES.moved=moved=true; svg.classList.add('drag'); stageFast(); return; }
  const dx=e.clientX-GES.last[0], dy=e.clientY-GES.last[1]; const now=performance.now(), dt=Math.max(1,now-GES.vt);
  if(!GES.moved&&Math.hypot(e.clientX-GES.down[0],e.clientY-GES.down[1])>(e.pointerType==='mouse'?3:6)){ GES.moved=moved=true; svg.classList.add('drag'); }
  if(!GES.moved) return;
  GES.vel=[0.7*GES.vel[0]+0.3*dx/dt, 0.7*GES.vel[1]+0.3*dy/dt]; GES.vt=now; GES.last=[e.clientX,e.clientY];
  panBy(dx,dy); stageFast(); });
function gesUp(e){ if(!GES.ptr.has(e.pointerId)) return; GES.ptr.delete(e.pointerId);
  if(GES.ptr.size===1){ GES.last=[...GES.ptr.values()][0]; GES.pinch=0; GES.vel=[0,0]; return; }
  if(GES.ptr.size) return;
  svg.classList.remove('drag'); const d=GES.down; GES.down=null;
  if(!GES.moved&&d&&performance.now()-d[2]<700&&e.type==='pointerup'){ gesEnd(); tapAt(e.clientX,e.clientY,e); return; }
  // let go while moving: glide a little, then redraw
  const v=GES.vel, sp=Math.hypot(v[0],v[1]);
  if(GES.moved&&sp>0.25&&performance.now()-GES.vt<80){ let vx=v[0], vy=v[1], t0=performance.now();
    const step=()=>{ const t=performance.now(), dt=Math.min(40,t-t0); t0=t; const k=Math.pow(0.0025,dt/600); panBy(vx*dt,vy*dt); vx*=k; vy*=k; stageFast();
      if(Math.hypot(vx,vy)>0.03&&!GES.ptr.size) GES.inert=requestAnimationFrame(step); else { GES.inert=0; gesEnd(); } }; GES.inert=requestAnimationFrame(step); }
  else gesEnd(); }
m3d.addEventListener('pointerup',gesUp); m3d.addEventListener('pointercancel',gesUp); m3d.addEventListener('lostpointercapture',e=>{ if(GES.ptr.has(e.pointerId)) gesUp(Object.assign({},e,{type:'pointercancel',pointerId:e.pointerId,clientX:e.clientX,clientY:e.clientY})); });
{ let acc=0, q=0, pt=null; m3d.addEventListener('wheel',e=>{ e.preventDefault(); if(e.ctrlKey) acc+=-e.deltaY*0.01; else acc+=-e.deltaY*(e.deltaMode===1?0.05:0.0022); pt=[e.clientX,e.clientY];
    if(!q) q=requestAnimationFrame(()=>{ q=0; const f=Math.exp(Math.max(-1.2,Math.min(1.2,acc))); acc=0; zoomAt(f,...toW(...pt)); }); },{passive:false}); }
m3d.addEventListener('dblclick',e=>{ e.preventDefault(); if(pinAt(e.clientX,e.clientY)) return; plZoomAnim(2,...toW(e.clientX,e.clientY)); });
function pinAt(clientX,clientY){ const r=svgRect(), cx=clientX-r.left, cy=clientY-r.top; for(const [p,x,y] of PCV.dr||[]) if(Math.hypot(x-cx,y-cy)<14) return p; return null; }
// what a tap hits, in order: a map pick in progress, the free-find or bubble pick, a pin, a find or park, a gold stream, a map outline, else close the pop-up
function tapAt(clientX,clientY,e){ const r=svgRect(), cx=clientX-r.left, cy=clientY-r.top, now=performance.now();
  if(e&&e.pointerType!=='mouse'&&GES.tapP&&now-GES.tapT<300&&Math.hypot(clientX-GES.tapP[0],clientY-GES.tapP[1])<30&&!pinAt(clientX,clientY)){ GES.tapT=0; plZoomAnim(2,...toW(clientX,clientY)); return; }
  GES.tapT=now; GES.tapP=[clientX,clientY];
  try{
    if(window.pickMode){ pickMode=false; const [wx,wy]=toW(clientX,clientY); if(typeof setOrigin==='function') setOrigin(wx/K,-wy,'your spot'); return; }
    if(typeof findPick==='function'&&findPick(cx,cy)) return;
    const R=matchMedia('(pointer:coarse)').matches?22:14, hits=[];
    for(const [p,x,y] of PCV.dr||[]){ const d=Math.hypot(x-cx,y-cy); if(d<=R) hits.push([d,p]); }
    if(hits.length){ hits.sort((a,b)=>a[0]-b[0]); const near=hits.filter(([d])=>d<=hits[0][0]+8).map(([,p])=>p.id); openPop([...new Set(near)].slice(0,12),cx,cy); return; }
    if(typeof findHit==='function'&&findHit(cx,cy)) return;
    const st=streamAt(cx,cy); if(st){ streamPop(st.t,st.lo,st.la,cx,cy); return; }
    const t=document.elementFromPoint(clientX,clientY);
    if(t&&t.classList&&t.classList.contains('stm')){ if(t.dataset.belt) beltPop(cx,cy); else if(t.dataset.gl) glPop(t.dataset.gl,cx,cy); return; }
    closePop();
  }catch(err){ OGE.err('tap',err); } }

// ---- pins, bubbles, names, parks, trails and gold streams on one canvas ----
const PCV={q:[],cls:[],nm:false,W:0,H:0,dpr:1,icons:new Map(),raf:0,dr:[],pk:[],tr:[],ff:'sans-serif',lf:null};
const PLS=1800;
function pcLater(){ if(!PCV.raf) PCV.raf=requestAnimationFrame(()=>{ PCV.raf=0; if(!GES.active) pcRender(VIEW.s||scale()); }); }
function pcSize(){ const W=svgW(), H=svgH(), d=Math.min(2.5,window.devicePixelRatio||1);
  if(W!==PCV.W||H!==PCV.H||d!==PCV.dpr){ PCV.W=W; PCV.H=H; PCV.dpr=d; pcv.width=Math.round(W*d); pcv.height=Math.round(H*d); } }
function pcText(t,x,y,size,fill,halo,hw){ const c=pcx, f=`800 ${Math.round(size*2)/2}px ${PCV.ff}`; if(PCV.lf!==f){ c.font=f; PCV.lf=f; } if(halo){ c.lineWidth=hw; c.strokeStyle=halo; c.lineJoin='round'; c.strokeText(t,x,y); } c.fillStyle=fill; c.fillText(t,x,y); }
function pcWorld(c,s){ c.setTransform(PCV.dpr*s,0,0,PCV.dpr*s,-vb.x*s*PCV.dpr,-vb.y*s*PCV.dpr); }
// a plain pin used until the Old Ground icon set (ogGlyph) has loaded
function pcPin(p,s){ const c=pcx, [X,Y]=P(p.lo,p.la), x=(X-vb.x)*s, y=(Y-vb.y)*s; if(x<-40||y<-40||x>PCV.W+40||y>PCV.H+40) return;
  const sel=p.id===selId, r=(s>=110?9:7)*(sel?1.4:1), rk=RK(p), panel=cv('var(--panel)'), ranked=typeof rk==='number'&&rk>=1&&rk<=5;
  c.beginPath(); c.arc(x,y,r,0,6.2832); c.fillStyle=ranked?cv(`var(--rk${rk})`):cv(`var(--L-${p.L})`); c.fill(); c.lineWidth=sel?2.6:1.5; c.strokeStyle=sel?cv('var(--ink)'):panel; c.stroke();
  if(ranked) pcText(String(rk),x,y+r*0.42,r*1.2,panel); PCV.dr.push([p,x,y]); }
function pcBub(cl,s){ const c=pcx, n=cl.m.length, [X,Y]=P(cl.p.lo,cl.p.la), x=(X-vb.x)*s, y=(Y-vb.y)*s, r=6.5+1.7*Math.log2(n), acc=cv('var(--accent)'), panel=cv('var(--panel)');
  if(x<-60||y<-60||x>PCV.W+60||y>PCV.H+60) return;
  const best=Math.min(...cl.m.map(p=>{ const k=RK(p); return typeof k==='number'&&k?k:9; }));
  c.globalAlpha=0.18; c.beginPath(); c.arc(x,y,r*1.15,0,6.2832); c.fillStyle=acc; c.fill();
  c.globalAlpha=0.82; c.beginPath(); c.arc(x,y,r,0,6.2832); c.fill(); c.globalAlpha=1; c.lineWidth=1.5; c.strokeStyle=panel; c.stroke();
  pcText(n>999?Math.round(n/100)/10+'k':String(n),x,y+r*0.34,r*(n>99?0.82:1),panel);
  if(best<=2){ const bx=x+r*0.8, by=y-r*0.8, br=Math.max(r*0.45,5); c.beginPath(); c.arc(bx,by,br,0,6.2832); c.fillStyle=cv('var(--L-ghost)'); c.fill(); c.lineWidth=1.4; c.strokeStyle=panel; c.stroke(); pcText(String(best),bx,by+br*0.4,br*1.15,panel); } }
function pcNames(){ const c=pcx, pr=p=>p.id===selId?-1:(()=>{ const r=RK(p); return typeof r==='number'&&r?r:r==='X'?7:6; })();
  const pts=PCV.dr.filter(([,x,y])=>x>-40&&x<PCV.W+40&&y>-20&&y<PCV.H+40), boxes=pts.map(([,x,y])=>[x-8,y-8,x+8,y+8]), hit=b=>boxes.some(q=>b[0]<q[2]&&b[2]>q[0]&&b[1]<q[3]&&b[3]>q[1]);
  c.font=`700 11.5px ${PCV.ff}`; PCV.lf=null; c.lineWidth=3; c.lineJoin='round'; c.strokeStyle=cv('var(--panel)'); c.fillStyle=cv('var(--ink)');
  for(const [p,x,y] of pts.sort((a,b)=>pr(a[0])-pr(b[0]))){ let n=p.n; if(n.length>28) n=n.slice(0,27).trimEnd()+'…';
    const w=c.measureText(n).width+6, b=[x-w/2,y-27,x+w/2,y-11]; if(hit(b)) continue; boxes.push(b); c.strokeText(n,x,y-14); c.fillText(n,x,y-14); } }
function pcRender(s){ pcSize(); const c=pcx; s=s||scale(); c.setTransform(PCV.dpr,0,0,PCV.dpr,0,0); c.clearRect(0,0,PCV.W,PCV.H); PCV.dr=[]; PCV.lf=null; if(!s||!isFinite(s)) return;
  PCV.ff=cv('var(--f-body)')||'sans-serif';
  try{ pcLand(s); }catch(e){ OGE.err('land',e); }
  c.setTransform(PCV.dpr,0,0,PCV.dpr,0,0); c.textAlign='center'; c.textBaseline='alphabetic'; c.globalAlpha=1;
  let selP=null; for(const p of PCV.q){ if(p.id===selId){ selP=p; continue; } pcPin(p,s); }
  for(const cl of PCV.cls) pcBub(cl,s);
  if(selP) pcPin(selP,s);
  if(PCV.nm) pcNames(); }
const shape=p=>{ PCV.q.push(p); }; function UXbub(){} function plNames(){}
// gold streams: about 4,500 scored reaches, drawn only near the screen; tap one for its score
const STR={p:[],ready:false,building:false};
function streamsBuild(){ if(STR.ready||STR.building||typeof DATA==='undefined'||!DATA.streams) return; STR.building=true; const src=[...DATA.streams].sort((a,b)=>a[0]-b[0]); let i=0;
  const step=dl=>{ const t0=performance.now(); while(i<src.length&&(performance.now()-t0<8)){ const [sc,l]=src[i++]; const t=Math.max(0,Math.min(1,(sc+0.1)/1.1)), p=new Path2D(); let a=1e9,b=1e9,c=-1e9,d=-1e9;
      l.forEach(([lo,la],j)=>{ const x=lo*K, y=-la; if(j) p.lineTo(x,y); else p.moveTo(x,y); if(x<a)a=x; if(x>c)c=x; if(y<b)b=y; if(y>d)d=y; });
      STR.p.push({p,t,lo:l[0][0],la:l[0][1],b:[a,b,c,d],w:[1.4,2.1,2.9,3.7][Math.min(3,Math.floor(t*4))]}); }
    if(i<src.length) (window.requestIdleCallback||requestAnimationFrame)(step); else { STR.ready=true; STR.building=false; if(on.has('_streams')) drawMarkers(); } };
  (window.requestIdleCallback||requestAnimationFrame)(step); }
function streamsVis(s){ if(!on.has('_streams')) return []; if(!STR.ready){ streamsBuild(); return []; } const m=0.3, x0=vb.x-vb.w*m, x1=vb.x+vb.w*(1+m), y0=vb.y-vb.h*m, y1=vb.y+vb.h*(1+m), out=[];
  for(const e of STR.p){ const b=e.b; if(b[2]<x0||b[0]>x1||b[3]<y0||b[1]>y1) continue; if(s<120&&e.w<2) continue; out.push(e); } return out; }
function streamAt(cx,cy){ if(!on.has('_streams')||!STR.ready) return null; const s=VIEW.s||scale(), c=pcx; pcWorld(c,s); c.lineWidth=12/s; let hit=null; const X=cx*PCV.dpr, Y=cy*PCV.dpr;
  for(const e of streamsVis(s)){ if(c.isPointInStroke(e.p,X,Y)){ hit=e; break; } } c.setTransform(PCV.dpr,0,0,PCV.dpr,0,0); return hit; }
function pcLand(s){ const c=pcx, sat=svg.classList.contains('sat'); const st=streamsVis(s); if(!(PCV.pk.length||PCV.tr.length||st.length)) return; pcWorld(c,s);
  if(PCV.pk.length){ const pk=cv('var(--L-park)'); c.lineWidth=1.3/s;
    for(const f of PCV.pk){ const n=f[2]==='n'||f[2]==='s'; c.fillStyle=pk; c.globalAlpha=sat?0.08:n?0.1:0.16; c.fill(f.P,'evenodd'); c.strokeStyle=sat?'#7dff9a':pk; c.globalAlpha=sat?0.9:n?0.55:0.75; c.stroke(f.P); } }
  if(PCV.tr.length){ const tc=sat?'#ffd27a':cv('var(--trail)'), bc=sat?'#ffd27a':cv('var(--L-beach)'); c.lineCap='round'; c.lineJoin='round';
    for(const a of PCV.tr){ for(const [k,w,al,col] of [[1,1.4,0.6,tc],[0,2,0.85,tc],[2,2,0.7,bc]]){ c.lineWidth=w/s; c.globalAlpha=al; c.strokeStyle=col; c.stroke(a.P[k]); } } }
  if(st.length){ const col=cv('var(--stream)'); c.lineCap='round'; c.lineJoin='round'; c.strokeStyle=col; for(const e of st){ c.globalAlpha=0.35+0.6*e.t; c.lineWidth=e.w/s; c.stroke(e.p); } }
  c.globalAlpha=1; c.setTransform(PCV.dpr,0,0,PCV.dpr,0,0); }

// ---- tiles: street map, hillshade and satellite as plain images under the SVG, per zoom level, old tiles kept until new ones load ----
const GM={type:'default', tilt:false, live:true, liveErr:0, tiles:new Map(), g0:null, head:null};
try{ GM.type=localStorage.getItem('atlas-maptype')||'default'; }catch(_){}
var OG={tiles:new Map(), live:true, err:0, P:{}};
const ogDark=()=>{ const t=document.documentElement.dataset.theme; return t?t==='dark':matchMedia('(prefers-color-scheme:dark)').matches; };
const ogMerc={tx:(l,N)=>Math.floor((l+180)/360*N), ty:(la,N)=>{ const r=la*Math.PI/180; return Math.floor((1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*N); },
  lat:(y,N)=>{ const n=Math.PI-2*Math.PI*y/N; return 180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))); }};
const ogURL={b:(z,x,y)=>`https://server.arcgisonline.com/ArcGIS/rest/services/${ogDark()?'Canvas/World_Dark_Gray_Base':'World_Street_Map'}/MapServer/tile/${z}/${y}/${x}`,
  h:(z,x,y)=>`https://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer/tile/${z}/${y}/${x}`,
  s:(z,x,y)=>`https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/${z}/${y}/${x}`};
function ogZ(){ const s=VIEW.s||scale(); return s?Math.max(4,Math.min(19,Math.floor(Math.log2(s*K*360/256)))):0; }
function ogTileList(z,m,lon0x,lon1x,lat0x,lat1x){ const N=2**z, l0=lon0x??(vb.x-vb.w*m)/K, l1=lon1x??(vb.x+vb.w*(1+m))/K, a1=lat1x??-(vb.y-vb.h*m), a0=lat0x??-(vb.y+vb.h*(1+m)), out=[];
  for(let y=ogMerc.ty(a1,N);y<=ogMerc.ty(a0,N);y++) for(let x=ogMerc.tx(l0,N);x<=ogMerc.tx(l1,N);x++) if(y>=0&&y<N) out.push([x,y]); return out; }
const TILES={L:{}, t:0, pq:0, ok:Date.now(), tries:new Map(), shown:false};
function tileLayer(id,url,opts){ const div=document.createElement('div'); div.className='ogtl ogtl-'+id; tileRoot.appendChild(div);
  const L={id,url,div,levels:new Map(),tiles:new Map(),want:new Set(),vis:[],zb:0,...opts}; TILES.L[id]=L; return L; }
// world pixels at zoom z: X = lon*K*U, Y = -lat*U, so a tile is 256 wide; each level keeps its own origin so numbers stay small
const tlU=z=>256*2**z/(360*K);
function tlLevel(L,z){ let lv=L.levels.get(z); if(!lv){ lv={z,div:document.createElement('div'),ox:0,oy:0,n:0}; lv.div.className='ogtz'; lv.div.dataset.z=z; L.div.appendChild(lv.div); L.levels.set(z,lv); } return lv; }
function tlPlace(L){ const s=VIEW.s, g=VIEW.vb; if(!s||!g) return; for(const lv of L.levels.values()){ const U=tlU(lv.z), k=s/U; lv.div.style.transform=`matrix(${k},0,0,${k},${(lv.ox/U-g.x)*s},${(lv.oy/U-g.y)*s})`; } }
function tlImg(L,z,x,y){ const k=`${z}_${x}_${y}`; let im=L.tiles.get(k); if(im){ im.dataset.t='1'; return im; }
  const N=2**z, lo0=x/N*360-180, lo1=(x+1)/N*360-180, la1=ogMerc.lat(y,N), la0=ogMerc.lat(y+1,N), U=tlU(z), X=lo0*K*U, Y=-la1*U, lv=tlLevel(L,z);
  if(!lv.n){ lv.ox=Math.round(X); lv.oy=Math.round(Y); } else if(Math.abs(X-lv.ox)>3e6||Math.abs(Y-lv.oy)>3e6){ for(const [kk,t] of L.tiles) if(+t.dataset.z===z){ t.remove(); L.tiles.delete(kk); } lv.n=0; lv.ox=Math.round(X); lv.oy=Math.round(Y); }
  im=new Image(); im.decoding='async'; im.draggable=false; im.className='ogtile'; im.dataset.z=z; im.dataset.t='1'; im.dataset.k=k;
  im.style.cssText=`left:${(X-lv.ox).toFixed(2)}px;top:${(Y-lv.oy).toFixed(2)}px;width:${(256*1.004).toFixed(2)}px;height:${((la1-la0)*U*1.004).toFixed(2)}px`;
  im.dataset.bx=[X/U,Y/U,(lo1-lo0)*K,la1-la0].join(',');   // map-unit box, for pruning
  im.addEventListener('load',()=>{ im.dataset.ok=1; im.classList.add('ok'); TILES.ok=Date.now(); OG.err=0; TILES.tries.delete(L.id+k); if(L.base) tilesShown(true); tlPruneSoon(); },{once:true});
  im.addEventListener('error',()=>{ im.remove(); L.tiles.delete(k); if(lv.n>0) lv.n--; const n=(TILES.tries.get(L.id+k)||0)+1; TILES.tries.set(L.id+k,n);
    if(L.base&&++OG.err>=12&&OG.live&&Date.now()-TILES.ok>20000){ OG.live=false; tilesUpdate(); setTimeout(()=>{ if(!OG.live){ OG.live=true; OG.err=0; tilesUpdate(); } },30000); return; }
    if(n<4) setTimeout(()=>{ if(L.want.has(k)&&!L.tiles.has(k)){ const t=tlImg(L,z,x,y); t.src=L.url(z,x,y)+'?r='+n; } },700*3**(n-1)); },{once:true});
  lv.div.appendChild(im); lv.n++; L.tiles.set(k,im); return im; }
function tilesShown(v){ if(TILES.shown===v) return; TILES.shown=v; document.body.classList.toggle('ogt',v); }
function tlPrune(){ TILES.pq=0; const m=0.6, x0=vb.x-vb.w*m, x1=vb.x+vb.w*(1+m), y0=vb.y-vb.h*m, y1=vb.y+vb.h*(1+m);
  for(const L of Object.values(TILES.L)){ const ready=L.vis.every(k=>L.tiles.get(k)?.dataset.ok);
    for(const [k,im] of L.tiles){ if(L.want.has(k)) continue; const b=(im.dataset.bx||'').split(',').map(Number);
      const off=b.length<4||b[0]>x1||b[0]+b[2]<x0||b[1]>y1||b[1]+b[3]<y0, far=Math.abs(+im.dataset.z-L.zb)>4;
      if(off||far||!im.dataset.ok||ready){ im.remove(); L.tiles.delete(k); const lv=L.levels.get(+im.dataset.z); if(lv&&lv.n>0) lv.n--; } }
    for(const [z,lv] of L.levels) if(!lv.n&&z!==L.zb){ lv.div.remove(); L.levels.delete(z); } } }
function tlPruneSoon(){ if(!TILES.pq) TILES.pq=requestAnimationFrame(tlPrune); }
function tlWant(L,z,list,margin){ const cx=vb.x+vb.w/2, cy=vb.y+vb.h/2, N=2**z, U=tlU(z);
  const d=([x,y])=>{ const lo=(x+0.5)/N*360-180, la=ogMerc.lat(y+0.5,N); return ((lo*K-cx)/vb.w)**2+((-la-cy)/vb.h)**2; };
  list.sort((a,b)=>d(a)-d(b)); for(const [x,y] of list){ const k=`${z}_${x}_${y}`; L.want.add(k); const im=tlImg(L,z,x,y); if(!im.src) im.src=L.url(z,x,y); } }
const tlStreet=tileLayer('b',ogURL.b,{base:true,max:()=>ogDark()?16:19,show:()=>GM.type==='default'&&OG.live&&navigator.onLine!==false});
const tlHill=tileLayer('h',ogURL.h,{max:()=>15,show:()=>GM.type==='default'&&OG.live&&navigator.onLine!==false});
const tlSat=tileLayer('s',ogURL.s,{base:true,max:()=>17,show:()=>GM.type==='sat'&&GM.live&&navigator.onLine!==false});
function tilesUpdate(){ const z=ogZ(); let any=false;
  for(const L of Object.values(TILES.L)){ const show=!!L.show()&&!!z; L.div.style.display=show?'':'none'; L.want.clear(); L.vis=[];
    if(!show){ if(L.tiles.size>400||GM.type!==L.lastType){ for(const im of L.tiles.values()) im.remove(); L.tiles.clear(); for(const lv of L.levels.values()) lv.div.remove(); L.levels.clear(); } L.lastType=GM.type; continue; }
    L.lastType=GM.type; const mx=L.max(); let zb=Math.min(mx,L.id==='h'?z:z+1), lb=[]; for(const m of [0.5,0.25,0]){ lb=ogTileList(zb,m); if(lb.length<=160) break; } if(lb.length>160){ zb--; lb=ogTileList(zb,0); } L.zb=zb;
    for(const im of L.tiles.values()) im.dataset.t='';
    if(L.base){ const z0=Math.max(4,zb-3); if(z0<zb) tlWant(L,z0,ogTileList(z0,1)); }
    tlWant(L,zb,lb); L.vis=ogTileList(zb,0).map(([x,y])=>`${zb}_${x}_${y}`); tlPlace(L);
    if(L.base) any=any||[...L.tiles.values()].some(im=>im.dataset.ok); }
  tilesShown(any); svg.classList.toggle('ogsat',GM.type==='sat'); tlPruneSoon(); }
function tilesSoon(){ if(!TILES.t) TILES.t=setTimeout(()=>{ TILES.t=0; try{ tilesUpdate(); }catch(e){ OGE.err('tiles',e); } },180); }
function gmTiles(){ tilesUpdate(); } const ogTiles=gmTiles;
window.addEventListener('online',()=>{ OG.live=true; GM.live=true; OG.err=0; tilesSoon(); });
document.addEventListener('visibilitychange',()=>{ if(!document.hidden){ OG.err=0; tilesSoon(); } });
matchMedia('(prefers-color-scheme:dark)').addEventListener?.('change',()=>{ for(const im of tlStreet.tiles.values()) im.remove(); tlStreet.tiles.clear(); for(const lv of tlStreet.levels.values()) lv.div.remove(); tlStreet.levels.clear(); drawMarkers(); });
// the 2013 USGS aerials of the Eau Claire quads, saved with the app: shown under the live imagery in satellite view
const SATQ={x0:-91.625,y0:44.75,d:0.125,q:[[0,0],[1,0],[0,1],[1,1]],n:[1,4,8]};
const gSat=el('g',{class:'gsat'},gBase); gBase.insertBefore(gSat,gBase.children[3]); gSat.style.display='none'; const gSatE=el('g',{},gSat), gSatL=el('g',{},gSat);
function gmImg(key,lon0,lon1,lat0,lat1,href,parent){ let im=GM.tiles.get(key); if(!im){ const [x,y]=P(lon0,lat1); im=el('image',{x,y,width:(lon1-lon0)*K*1.006,height:(lat1-lat0)*1.006,preserveAspectRatio:'none'},parent); im.dataset.k=key; GM.tiles.set(key,im); im.setAttribute('href',href); } im.dataset.t='1'; return im; }
function satQuads(){ if(GM.type!=='sat'){ gSat.style.display='none'; return; } gSat.style.display=''; const s=VIEW.s||scale(); if(!s) return; const pxd=s*K;
  const m=0.25, lon0=(vb.x-vb.w*m)/K, lon1=(vb.x+vb.w*(1+m))/K, lat1=-(vb.y-vb.h*m), lat0=-(vb.y+vb.h*(1+m)); for(const im of GM.tiles.values()) im.dataset.t='';
  const z=pxd<8192*1.2?0:pxd<32768*1.2?1:2;
  for(const [qx,qy] of SATQ.q){ const QX0=SATQ.x0+qx*SATQ.d, QY1=SATQ.y0+(qy+1)*SATQ.d; gmImg(`E0_${qx}${qy}_0_0`,QX0,QX0+SATQ.d,QY1-SATQ.d,QY1,`sat/0_${qx}${qy}_0_0.webp`,gSatE);
    if(z){ const n=SATQ.n[z], t=SATQ.d/n; for(let j=0;j<n;j++) for(let i=0;i<n;i++){ const a=QX0+i*t, b=QY1-j*t; if(a>lon1||a+t<lon0||b<lat0||b-t>lat1) continue; gmImg(`E${z}_${qx}${qy}_${i}_${j}`,a,a+t,b-t,b,`sat/${z}_${qx}${qy}_${i}_${j}.webp`,gSatE); } } }
  for(const [k,im] of GM.tiles){ if(im.dataset.t||k.startsWith('E0_')) continue; im.remove(); GM.tiles.delete(k); } }
OGE.on('draw',()=>satQuads());

// ---- view buttons ----
document.getElementById('zin').onclick=()=>zoomAt(1.6,...ctr());
document.getElementById('zout').onclick=()=>zoomAt(1/1.6,...ctr());
for(const k of ['EC','N','WI']) document.getElementById(k==='N'?'vNorth':'v'+k).onclick=()=>{ vb={...V[k]}; fit(); apply(); };
document.getElementById('vCF').onclick=()=>{ on.add('_flood'); on.add('flood84'); if(typeof renderLayers==='function') renderLayers(); vb={...V.CF}; fit(); apply(); if(typeof renderList==='function') renderList(); };
ogWrap.insertAdjacentHTML('beforeend','<div class="plzoom" id="plZoom"></div>'); document.getElementById('plZoom').append(document.getElementById('zin'),document.getElementById('zout'));
fit(); commit(true);
