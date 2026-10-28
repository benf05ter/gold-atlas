// ---------- Drive mode (v130): phone on a dash mount. The map follows you heading-up in the tilted view, the screen stays on,
// and big cards show the ranked spots ahead (rank word, distance, side of the road, the main reason) with one-tap directions in Google or Apple Maps.
// CarPlay is not possible for a web app; Navigate hands the spot to a maps app that is. Redraws only when you move a few px or turn, at most once a second.
{ const mw=document.querySelector('.mapwrap');
  const DRV={on:false, watch:null, wake:null, vid:null, pos:null, ref:null, head:null, spd:0, acc:0, follow:true, t3:false, cand:[], ct:0, kt:0, vt:0, key:'', still:0, dim:false, said:new Set(), anim:0, nav:'g', voice:false, lv:null, first:true, down:null};
  try{ DRV.nav=localStorage.getItem('og-drive-nav')||'g'; DRV.voice=localStorage.getItem('og-drive-voice')==='1'; }catch(_){}
  const CAR='<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 16V11l2-5h10l2 5v5"/><path d="M3 16h18v3H3z"/><circle cx="7.5" cy="13" r=".6" fill="currentColor"/><circle cx="16.5" cy="13" r=".6" fill="currentColor"/></svg>';
  const VID='data:video/mp4;base64,@@NOSLEEP@@';
  mw.insertAdjacentHTML('beforeend',`<div class="drv" id="drv" hidden>
<div class="drvbar"><button type="button" class="drvx" id="drvX">End drive</button><span class="drvst" id="drvSt" aria-live="polite">Finding you…</span><button type="button" class="drvc" id="drvC" hidden>Re-center</button></div>
<div class="drvp" id="drvP"><div class="drvl" id="drvL"></div>
<div class="drvo"><span>Directions in</span><button type="button" data-nav="g">Google Maps</button><button type="button" data-nav="a">Apple Maps</button><button type="button" id="drvV" aria-pressed="false">Voice</button></div></div>
<button type="button" class="drvdim" id="drvDim" hidden><b>Parked</b><span>The screen can sleep now. Tap to keep driving.</span></button></div>`);
  const m3dEl=mw.querySelector('.m3d')||mw; m3dEl.insertAdjacentHTML('beforeend','<div class="drvme" id="drvMe" hidden><svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#2367b3" fill-opacity=".18"/><path class="a" d="M20 6l10 26-10-6-10 6z" fill="#2367b3" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/><circle class="d" cx="20" cy="20" r="7" fill="#2367b3" stroke="#fff" stroke-width="2.5"/></svg></div>');
  const $=id=>document.getElementById(id), box=$('drv'), me=$('drvMe'), st=$('drvSt'), list=$('drvL');
  const R=Math.PI/180, CMP=['N','NE','E','SE','S','SW','W','NW'];
  const mi=(a,b,c,d)=>Math.hypot((c-a)*69.17*Math.cos(b*R),(d-b)*69.17);   // miles between lon/lat pairs
  const brg=(a,b,c,d)=>(Math.atan2((c-a)*Math.cos(b*R),d-b)/R+360)%360;
  const norm=a=>{ a%=360; return a>180?a-360:a<-180?a+360:a; };
  const dtxt=d=>d<0.19?Math.max(50,Math.round(d*5280/50)*50)+' ft':d<10?d.toFixed(1)+' mi':Math.round(d)+' mi';
  function msg(h,t){ pop.innerHTML=`<button class="px" aria-label="Close">×</button><h4>${h}</h4><p>${esc(t)}</p>`; pop.querySelector('.px').onclick=closePop; pop.hidden=false; placePop(20,20); }
  // ranked spots from the layers that are on (all of them, not only the ones in view) (Best, Good, Some old ground); falls back to the best two ranks everywhere
  function cands(){ const ok=p=>{ const r=RK(p); return typeof r==='number'&&r>=1&&r<=3; }; let c=PTS.filter(p=>on.has(p.L)&&ok(p)); if(c.length<5) c=PTS.filter(p=>{ const r=RK(p); return r===1||r===2; }); DRV.cand=c; DRV.ct=Date.now(); }
  // screen stays on: Wake Lock, else a silent looping 2 s video (older iPhones and home-screen apps before iOS 18.4)
  function vid(on){ try{ if(on){ if(!DRV.vid){ const v=document.createElement('video'); v.muted=true; v.loop=true; v.playsInline=true; v.setAttribute('playsinline',''); v.setAttribute('muted',''); v.src=VID; v.style.cssText='position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;left:0;top:0'; document.body.appendChild(v); DRV.vid=v; } const pr=DRV.vid.play(); if(pr&&pr.catch) pr.catch(()=>{}); } else if(DRV.vid) DRV.vid.pause(); }catch(_){} }
  async function wake(on){ if(!on){ try{ if(DRV.wake){ const w=DRV.wake; DRV.wake=null; await w.release(); } }catch(_){} vid(false); return; }
    try{ if(navigator.wakeLock&&!DRV.wake){ DRV.wake=await navigator.wakeLock.request('screen'); DRV.wake.addEventListener('release',()=>{ DRV.wake=null; }); } }catch(_){}
    if(!DRV.wake) vid(true); else vid(false); }
  document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='visible'&&DRV.on&&!DRV.dim) wake(true); });
  // the car marker: an arrow pointing the way you travel (a dot until there is a heading)
  function mark(){ if(!DRV.on||!DRV.pos) return; const [wx,wy]=P(DRV.pos.lo,DRV.pos.la), q=ogS(wx,wy); if(!q||!isFinite(q[0])){ me.hidden=true; return; }
    me.hidden=false; me.classList.toggle('nohd',DRV.head==null); me.style.transform=`translate(${q[0]-20}px,${q[1]-20}px) rotate(${(DRV.head||0)+T3.bear/R}deg)`; }
  OGE.on('post',()=>{ if(DRV.on) mark(); });
  { const _f=T3.fast; T3.fast=function(){ _f.apply(T3,arguments); if(DRV.on) requestAnimationFrame(mark); }; }
  // follow: you sit just above the panel (left of centre when the panel is at the side) and the road ahead points up
  function side(){ const d=$('drvP'); return !!d&&d.offsetLeft>20; }
  function view(force){ const p=DRV.pos; if(!p||!DRV.follow||!T3.on) return; const now=Date.now(); if(!force&&now-DRV.vt<900) return;
    const hd=DRV.head!=null?DRV.head:-T3.bear/R, th=T3.th, Pp=T3.P||1, c=Math.cos(th), s=Math.sin(th);
    if(DRV.first||!(vb.w>0)){ const W=VP.W||mw.clientWidth||390, S=BOX.w||W*2.4; const w=(3/69.2)*S/W; vb={x:0,y:0,w,h:w*(BOX.h||S)/(BOX.w||S)}; DRV.first=false; force=true; }
    const H=VP.H||600, pt=side()?H:(H-($('drvP').offsetHeight||0)), v=Math.min(0.8*H,pt-70)-T3.A*H, u=side()?0.22*(VP.W||800):0, y1=v*Pp/(Pp*c+v*s), x1=u*(Pp-y1*s)/Pp, g=vb.w/(BOX.w||1), a=hd*R;
    const [ux,uy]=P(p.lo,p.la), cx=ux+(Math.sin(a)*y1+Math.cos(a)*x1)*g, cy=uy+(-Math.cos(a)*y1+Math.sin(a)*x1)*g;
    const sc=scale(), moved=DRV.lv?Math.hypot(cx-DRV.lv[0],cy-DRV.lv[1])*sc:1e9, tb=-a; let db=norm((tb-T3.bear)/R);
    if(!force&&moved<6&&Math.abs(db)<3) return; DRV.vt=now; DRV.lv=[cx,cy];
    vb={x:cx-vb.w/2,y:cy-vb.h/2,w:vb.w,h:vb.h}; apply(); turn(T3.bear+db*R); }
  function turn(to){ cancelAnimationFrame(DRV.anim); const b0=T3.bear, d=to-b0; if(Math.abs(d)<0.02){ T3.bear=to; T3.layout(); T3.fast(); mark(); return; } const t0=performance.now();
    const step=()=>{ const t=Math.min(1,(performance.now()-t0)/520), e=1-Math.pow(1-t,3); T3.bear=b0+d*e; T3.layout(); T3.fast(); mark(); if(t<1) DRV.anim=requestAnimationFrame(step); else T3.ui(); }; step(); }
  // the cards: nearest ranked spots ahead along the way you are going (nearest all round when stopped)
  function cards(force){ const p=DRV.pos; if(!p) return; const now=Date.now(); if(!force&&now-DRV.kt<2000) return; DRV.kt=now; if(now-DRV.ct>60000) cands();
    const moving=DRV.spd>3&&DRV.head!=null, out=[];
    for(const q of DRV.cand){ if(Math.abs(q.la-p.la)>0.45||Math.abs(q.lo-p.lo)>0.65) continue; const d=mi(p.lo,p.la,q.lo,q.la); if(d>30) continue;
      const b=brg(p.lo,p.la,q.lo,q.la), rel=moving?norm(b-DRV.head):0; if(moving&&Math.abs(rel)>75&&d>0.15) continue;
      const r=RK(q); out.push({q,d,b,rel,r,e:d*(1+0.3*(r-1))*(moving?1+Math.abs(rel)/150:1)}); }
    out.sort((a,b)=>a.e-b.e); const top=out.slice(0,3);
    const k=top.map(o=>o.q.id+':'+dtxt(o.d)).join()+'|'+moving+'|'+DRV.nav; if(!force&&k===DRV.key) return; DRV.key=k;
    if(!top.length){ list.innerHTML=`<p class="drve">${moving?'No ranked spots ahead within 30 miles. They will show here as the road turns toward them.':'No ranked spots within 30 miles of you. Turn more layers on in the layers sheet before you drive.'}</p>`; return; }
    list.innerHTML=top.map((o,i)=>{ const q=o.q, wy=moving?(Math.abs(o.rel)<20?'straight ahead':o.rel>0?'ahead on the right':'ahead on the left'):CMP[Math.round(o.b/45)%8]+' of you';
      const why=typeof RKTOP==='function'?RKTOP(q):'';
      return `<div class="drvk${i?'':' main'}"><button type="button" class="drvi" data-show="${esc(q.id)}" aria-label="Show ${esc(q.n)} on the map"><span class="drvn"><i style="background:var(--rk${o.r})">${o.r}</i><b>${esc(q.n)}</b></span><span class="drvm">${dtxt(o.d)} · ${wy} · ${RKP[o.r]}</span>${i===0&&why?`<span class="drvw">${esc(why)}</span>`:''}</button>`
        +`<a class="drvgo" href="${navUrl(q)}" target="_blank" rel="noopener" data-go="${esc(q.id)}">${i?'Go':'Navigate'}</a></div>`; }).join('');
    const o=top[0]; if(DRV.voice&&moving&&o.d<3&&!DRV.said.has(o.q.id)&&window.speechSynthesis){ DRV.said.add(o.q.id); try{ const u=new SpeechSynthesisUtterance(`${RKP[o.r]}, ${dtxt(o.d).replace('mi','miles').replace('ft','feet')} ${Math.abs(o.rel)<20?'straight ahead':o.rel>0?'on the right':'on the left'}: ${o.q.n.replace(/\(.*?\)/g,'')}`); u.rate=1.02; speechSynthesis.speak(u); }catch(_){} } }
  // Navigate: Google Maps or Apple Maps with the spot as the destination; the home-screen app on an iPhone opens the maps app straight away
  function navUrl(q){ const la=q.la.toFixed(6), lo=q.lo.toFixed(6); return DRV.nav==='a'?`https://maps.apple.com/?daddr=${la},${lo}&dirflg=d`:`https://www.google.com/maps/dir/?api=1&destination=${la},${lo}&travelmode=driving`; }
  list.addEventListener('click',e=>{ const g=e.target.closest('[data-go]'), sh=e.target.closest('[data-show]');
    if(g){ const q=BYID[g.dataset.go]; if(!q) return; if(document.body.classList.contains('isapp')&&typeof uxIOS!=='undefined'&&uxIOS){ e.preventDefault(); const la=q.la.toFixed(6), lo=q.lo.toFixed(6), web=g.href, t0=Date.now();
        location.href=DRV.nav==='a'?`maps://?daddr=${la},${lo}&dirflg=d`:`comgooglemaps://?daddr=${la},${lo}&directionsmode=driving`;
        setTimeout(()=>{ if(!document.hidden&&Date.now()-t0<3000) window.open(web,'_blank'); },1500); } return; }
    if(sh){ const q=BYID[sh.dataset.show]; if(!q) return; DRV.follow=false; $('drvC').hidden=false; const [x,y]=P(q.lo,q.la); vb={x:x-vb.w/2,y:y-vb.h/2,w:vb.w,h:vb.h}; apply(); selId=q.id; drawMarkers(); } });
  function navSync(){ box.querySelectorAll('[data-nav]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.nav===DRV.nav))); $('drvV').setAttribute('aria-pressed',String(DRV.voice)); $('drvV').textContent=DRV.voice?'Voice on':'Voice off'; }
  box.querySelector('.drvo').addEventListener('click',e=>{ const b=e.target.closest('[data-nav]');
    if(b){ DRV.nav=b.dataset.nav; try{ localStorage.setItem('og-drive-nav',DRV.nav); }catch(_){} navSync(); cards(true); return; }
    if(e.target.closest('#drvV')){ DRV.voice=!DRV.voice; try{ localStorage.setItem('og-drive-voice',DRV.voice?'1':'0'); }catch(_){} navSync(); if(DRV.voice&&window.speechSynthesis){ try{ speechSynthesis.speak(new SpeechSynthesisUtterance('Voice on')); }catch(_){} } } });
  function status(){ if(!DRV.pos){ return; } const mph=Math.round(DRV.spd*2.237);
    st.textContent=(DRV.spd>1?mph+' mph':'Stopped')+(DRV.head!=null?' · heading '+CMP[Math.round(DRV.head/45)%8]:'')+(DRV.acc>60?' · weak GPS':''); }
  function dim(v){ DRV.dim=v; $('drvDim').hidden=!v; wake(!v); }
  function fix(pos){ if(!DRV.on) return; const c=pos.coords, lo=c.longitude, la=c.latitude, t=pos.timestamp||Date.now(); let sp=c.speed;
    const r=DRV.ref; if(r){ const dm=mi(r.lo,r.la,lo,la)*1609.34, dt=(t-r.t)/1000; if((sp==null||isNaN(sp))&&dt>0) sp=dm/dt;
      if(dm>15){ if(c.heading==null||isNaN(c.heading)) DRV.head=brg(r.lo,r.la,lo,la); DRV.ref={lo,la,t}; } } else DRV.ref={lo,la,t};
    if(c.heading!=null&&!isNaN(c.heading)&&(sp||0)>1.5) DRV.head=c.heading;
    DRV.spd=Math.max(0,sp||0); DRV.acc=c.accuracy||0; DRV.pos={lo,la};
    if(DRV.spd<1){ if(!DRV.still) DRV.still=t; else if(!DRV.dim&&t-DRV.still>600000) dim(true); } else if(DRV.spd>3){ DRV.still=0; if(DRV.dim) dim(false); }
    const first=DRV.first; view(first); if(!DRV.follow) mark(); cards(first); status(); }
  function err(e){ if(!DRV.on) return; st.textContent=e&&e.code===1?'Location is blocked. Allow it for this page in Settings.':'Waiting for GPS…'; }
  function recenter(){ DRV.follow=true; $('drvC').hidden=true; DRV.lv=null; view(true); }
  // you moved the map with a finger: stop following until Re-center
  m3dEl.addEventListener('pointerdown',e=>{ if(DRV.on) DRV.down=[e.clientX,e.clientY]; },true);
  m3dEl.addEventListener('pointermove',e=>{ if(!DRV.on||!DRV.down||!DRV.follow) return; if(Math.hypot(e.clientX-DRV.down[0],e.clientY-DRV.down[1])>14){ DRV.follow=false; $('drvC').hidden=false; } },true);
  window.addEventListener('pointerup',()=>{ DRV.down=null; },true);
  m3dEl.addEventListener('wheel',()=>{ if(DRV.on&&DRV.follow){ DRV.follow=false; $('drvC').hidden=false; } },{passive:true,capture:true});
  window.drvStart=function(){ if(DRV.on) return; if(!navigator.geolocation){ msg('Drive mode','This browser has no location access. The home-screen app or Safari with location allowed can follow you.'); return; }
    vid(!navigator.wakeLock);   // started inside the tap, so the fallback video may play
    DRV.on=true; DRV.t3=T3.on; DRV.first=true; DRV.follow=true; DRV.lv=null; DRV.key=''; DRV.said.clear(); DRV.pos=null; DRV.ref=null; DRV.head=null; DRV.spd=0; DRV.still=0;
    try{ closePop(); }catch(_){} try{ if(typeof gmSheet==='function') gmSheet(false); }catch(_){} if(typeof SH!=='undefined'&&SH.phone) shGo('map'); else if(typeof showView==='function') showView('map');
    document.body.classList.add('drv'); box.hidden=false; $('drvC').hidden=true; $('drvDim').hidden=true; st.textContent='Finding you…'; list.innerHTML='<p class="drve">Waiting for a GPS fix. Spots ahead show here once you are moving.</p>'; navSync();
    cands(); if(!T3.on) T3.set(true); wake(true);
    try{ DRV.watch=navigator.geolocation.watchPosition(fix,err,{enableHighAccuracy:true,maximumAge:1000,timeout:20000}); }catch(_){ err(); } };
  window.drvStop=function(){ if(!DRV.on) return; DRV.on=false; cancelAnimationFrame(DRV.anim); if(DRV.watch!=null){ try{ navigator.geolocation.clearWatch(DRV.watch); }catch(_){} DRV.watch=null; }
    wake(false); try{ window.speechSynthesis&&speechSynthesis.cancel(); }catch(_){} box.hidden=true; me.hidden=true; DRV.dim=false; document.body.classList.remove('drv');
    if(!DRV.t3) T3.set(false); else T3.north(); };
  window.DRV=DRV;
  $('drvX').onclick=()=>drvStop(); $('drvC').onclick=recenter; $('drvDim').onclick=()=>{ DRV.still=0; dim(false); };
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&DRV.on&&pop.hidden) drvStop(); });
  // ways in: the quick + menu and a More tile
  const qm=$('qaMenu'); if(qm){ qm.insertAdjacentHTML('beforeend',`<button type="button" role="menuitem" id="qaDrive">${CAR}Drive mode</button>`);
    $('qaDrive').addEventListener('click',e=>{ e.stopPropagation(); qm.hidden=true; const f=$('qaFab'); if(f) f.setAttribute('aria-expanded','false'); drvStart(); }); }
  const ml=document.querySelector('#rv-more .shlist'); if(ml){ ml.insertAdjacentHTML('beforeend',`<button id="mtDrive">${CAR}<b>Drive mode</b><span>Phone on the dash: spots ahead and one-tap directions</span></button>`);
    $('mtDrive').addEventListener('click',e=>{ e.stopPropagation(); drvStart(); }); }
}
