
// ---------- 3D view (v121): the same map, tilted. Tiles, pins, parks, trails, old maps and gestures are the engine's own; nothing is loaded from elsewhere ----------
// The ground (tiles + map + ground canvas) is a square bigger than the screen, tilted by one CSS transform. Pins are painted upright on a flat
// canvas at the projected spot, so taps, pop-ups and cards work exactly as in 2D. Twist two fingers to turn; N points north; 2D goes back.
// Geometry: ground px (gx,gy) -> centre at (S/2,S/2) -> rotate by the bearing -> tilt by the pitch -> perspective P -> screen, anchored at (W/2, A*H).
T3=Object.assign(T3,{on:false, pitch:42, bear:0, P:0, S:0, A:0.56, th:0, follow:false, head:null, fq:0, anim:0, max:3400});
T3.geom=function(W,H){ const th=T3.pitch*Math.PI/180, P=1.15*H, A=T3.A, c=Math.cos(th), s=Math.sin(th);
  const yAt=v=>{ const d=P*c+v*s; return v*P/Math.max(0.12*P,d); };   // ground distance (px from the anchor) seen at screen row v
  const yf=yAt(-A*H), yn=yAt((1-A)*H), kf=P/(P-yf*s), R=Math.hypot(W/2/kf,Math.max(-yf,yn));
  return {th,P,S:Math.min(T3.max,Math.ceil((2*R+48)/64)*64)}; };
T3.ground=function(W,H){ const g=T3.geom(W,H); T3.th=g.th; T3.P=g.P; T3.S=g.S; return [g.S,g.S]; };
T3.layout=function(){ if(!T3.on) return; const S=T3.S, W=VP.W, H=VP.H; if(!S||!W) return;
  ground.style.cssText=`left:${(W-S)/2}px;top:${T3.A*H-S/2}px;width:${S}px;height:${S}px;transform:perspective(${T3.P}px) rotateX(${T3.pitch}deg) rotateZ(${T3.bear}rad)`; };
T3.proj=function(gx,gy){ if(!T3.on) return [gx,gy,1]; const S=T3.S, cb=Math.cos(T3.bear), sb=Math.sin(T3.bear), qx=gx-S/2, qy=gy-S/2;
  const x1=qx*cb-qy*sb, y1=qx*sb+qy*cb, k=T3.P/(T3.P-y1*Math.sin(T3.th)); if(!(k>0)||k>40) return [-1e5,-1e5,1];
  return [VP.W/2+x1*k, T3.A*VP.H+y1*Math.cos(T3.th)*k, Math.max(0.55,Math.min(1.25,Math.sqrt(k)))]; };
T3.unproj=function(sx,sy){ if(!T3.on) return [sx,sy]; const S=T3.S, P=T3.P, c=Math.cos(T3.th), s=Math.sin(T3.th), u=sx-VP.W/2; let v=sy-T3.A*VP.H;
  const dmin=0.12*P; if(P*c+v*s<dmin) v=(dmin-P*c)/s;   // never above the horizon
  const y1=v*P/(P*c+v*s), k=P/(P-y1*s), x1=u/k, cb=Math.cos(T3.bear), sb=Math.sin(T3.bear);
  return [x1*cb+y1*sb+S/2, -x1*sb+y1*cb+S/2]; };
// the near part of the screen (where the ground is seen at 80% scale or more), as lon/lat bounds for sharper tiles
T3.nearLL=function(){ const P=T3.P, s=Math.sin(T3.th), c=Math.cos(T3.th), y1=-0.25*P/s, yk=T3.A*VP.H+y1*c*0.8, W=VP.W, H=VP.H;
  const pts=[[0,yk],[W,yk],[0,H],[W,H],[W/2,yk]].map(([x,y])=>T3.unproj(x,y)); let a=1e9,b=1e9,d=-1e9,e=-1e9; for(const [x,y] of pts){ if(x<a)a=x; if(x>d)d=x; if(y<b)b=y; if(y>e)e=y; }
  const S=T3.S; return [(vb.x+a/S*vb.w)/K,(vb.x+d/S*vb.w)/K,-(vb.y+e/S*vb.h),-(vb.y+b/S*vb.h)]; };
// pins repainted at their new spots while the ground moves under a finger (coalesced to one paint per frame)
T3.fast=function(){ if(!T3.on||T3.fq) return; T3.fq=requestAnimationFrame(()=>{ T3.fq=0; if(!T3.on) return; const s=scale(); if(!s||!isFinite(s)) return;
  const c=PCV.c=bcx, d=PCV.bd||1; c.setTransform(d,0,0,d,0,0); c.clearRect(0,0,PCV.vw,PCV.vh); c.textAlign='center'; c.textBaseline='alphabetic'; c.globalAlpha=1; PCV.dr=[]; PCV.lf=null;
  let selP=null; for(const p of PCV.q){ if(p.id===selId){ selP=p; continue; } pcPin(p,s); } for(const cl of PCV.cls) pcBub(cl,s); if(selP) pcPin(selP,s); }); };
// turn the map by da radians about a screen point (two-finger twist), keeping that ground point under the fingers
T3.turn=function(da,c){ const w1=toW(c[0],c[1]); T3.bear+=da; T3.layout(); const w2=toW(c[0],c[1]); vb.x-=w2[0]-w1[0]; vb.y-=w2[1]-w1[1]; if(T3.follow){ T3.follow=false; T3.heading(false); } T3.ui(); };
T3.north=function(){ T3.follow=false; T3.heading(false); let b=T3.bear; while(b>Math.PI) b-=2*Math.PI; while(b<-Math.PI) b+=2*Math.PI; const b0=b, t0=performance.now();
  cancelAnimationFrame(T3.anim); const step=()=>{ const t=Math.min(1,(performance.now()-t0)/380), e=1-Math.pow(1-t,3); T3.bear=b0*(1-e); T3.layout(); T3.fast(); if(t<1) T3.anim=requestAnimationFrame(step); else { T3.bear=0; T3.layout(); drawMarkers.now(); T3.ui(); } }; step(); };
// compass: with the phone's permission the map turns the way you face (the locate button asks for it)
T3.heading=function(on){ if(!on){ if(T3.head){ window.removeEventListener('deviceorientation',T3.head); T3.head=null; } return; }
  if(T3.head) return; const h=e=>{ if(!T3.on||!T3.follow) return; const a=e.webkitCompassHeading!=null?e.webkitCompassHeading:(e.alpha!=null&&e.absolute?360-e.alpha:null); if(a==null) return;
    T3.bear=-a*Math.PI/180; T3.layout(); T3.fast(); T3.ui(); };
  const go=()=>{ T3.head=h; T3.follow=true; window.addEventListener('deviceorientation',h); };
  try{ if(typeof DeviceOrientationEvent!=='undefined'&&DeviceOrientationEvent.requestPermission) DeviceOrientationEvent.requestPermission().then(r=>{ if(r==='granted') go(); }).catch(()=>{}); else go(); }catch(_){} };
mwrap.insertAdjacentHTML('beforeend',`<div class="t3bar" id="t3bar" hidden><button class="t3b" id="t3x" aria-label="Back to the flat map"><b>2D</b></button><button class="t3b" id="t3n" aria-label="Point north"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 2l5 18-5-4-5 4z" fill="currentColor"/></svg><span>N</span></button></div>`);
const t3bar=document.getElementById('t3bar');
T3.ui=function(){ t3bar.hidden=!T3.on; document.getElementById('t3n').style.transform=`rotate(${T3.bear}rad)`; document.getElementById('shMe').classList.toggle('on',T3.on); if(typeof gmSheetSync==='function') gmSheetSync(); };
T3.set=function(v){ v=!!v; if(v===T3.on) return; T3.on=v; cancelAnimationFrame(T3.anim); if(!v){ T3.follow=false; T3.heading(false); T3.bear=0; ground.style.cssText=''; }
  m3d.classList.toggle('t3',v); mwrap.classList.toggle('t3on',v); if(v){ ground.classList.add('t3in'); bcv.style.opacity='0'; setTimeout(()=>{ ground.classList.remove('t3in'); bcv.style.opacity=''; },480); }
  if(VP.W&&VP.H) boxSet(VP.W,VP.H); try{ localStorage.setItem('atlas-3d',v?'1':'0'); }catch(_){} apply(); T3.ui(); };
// open 3D on a map point: zoom in enough that the tilt means something, then tilt
T3.open=function(lo,la,heading){ if(lo!=null){ const [x,y]=P(lo,la); const w=Math.min(vb.w,0.06), h=w*(BOX.h||1)/(BOX.w||1); vb={x:x-w/2,y:y-h/2,w,h}; fit(); }
  if(!T3.on) T3.set(true); else apply(); if(heading) T3.heading(true); };
document.getElementById('t3x').onclick=()=>T3.set(false);
document.getElementById('t3n').onclick=()=>T3.north();
// the layers-sheet chip and the locate button
gmTilt=function(t){ if(t){ if(typeof gmSheet==='function') gmSheet(false); T3.open(null); } else T3.set(false); };
gmLocate3D=function(){ const b=document.getElementById('shMe'); if(T3.on){ T3.set(false); return; }
  if(!navigator.geolocation){ T3.open(null); return; } b.classList.add('busy');
  navigator.geolocation.getCurrentPosition(pos=>{ b.classList.remove('busy'); setOrigin(pos.coords.longitude,pos.coords.latitude,'you'); if(typeof SH!=='undefined'&&SH.phone) shGo('map'); if(GM.type!=='sat'&&typeof gmSetType==='function') gmSetType('sat'); T3.open(pos.coords.longitude,pos.coords.latitude,true); },
    ()=>{ b.classList.remove('busy'); hrToast('Location is blocked here, so 3D opens on the middle of the map.'); T3.open(null); },{enableHighAccuracy:true,timeout:12000,maximumAge:30000}); };
document.getElementById('shMe').onclick=()=>gmLocate3D();
Object.defineProperty(GM,'tilt',{get:()=>T3.on,set:v=>T3.set(v),configurable:true});
