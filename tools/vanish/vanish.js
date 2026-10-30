// ---------- Vanished features and where the sources agree (v215): one dated line per old source for each spot, the years it went, and a heat map of agreement ----------
// VF (og-data.js) holds, per spot id, every dated witness the detector found: plat books, the 1878 county maps, the 1840s-50s survey plats, fire maps,
// the USGS place-name file, the earliest USGS topo, the 1936-41 air photo and today's buildings, each drawn (+), missing (-), drawn nearby (~) or built over (b),
// and "#A-B" when the spot was drawn in A and missing by B. Built by tools/vanish (research/vanish/vf.py). The heat map is worked out here on the phone from
// VF plus each spot's own sources and its neighbours, so it adds no picture files; it only paints while its layer is on.
{ const VFD=typeof VF==='object'&&VF?VF:{};
  function wit(p){ const c=VFD[p.id]; if(!c) return null; if(p._vf&&p._vf.c===c) return p._vf;
    const [a,win]=c.split('#'), W=[];
    for(const s of a.split('|')){ const m=/^(\d{4})([A-Z])([-+~b])(\w*)$/.exec(s); if(m) W.push({y:+m[1],s:m[2],v:m[3],k:m[4]}); }
    let w=null; if(win){ const m=/^(\d{4})-(\d{4})(s?)$/.exec(win); if(m) w={a:+m[1],b:+m[2],since:!!m[3]}; }
    return p._vf={c,W,w}; }
  // one line per witness, in plain words
  function wLine(x){ const y=x.y;
    if(x.s==='P') return x.v==='+'?`${y} plat book: drawn here`:x.v==='~'?`${y} plat book: drawn a little way off`:`${y} plat book: not drawn`;
    if(x.s==='M') return `${y} county map: drawn here`;
    if(x.s==='L') return `${y} survey plat: drawn here`;
    if(x.s==='F') return `${y} fire map: drawn here`;
    if(x.s==='G') return 'USGS place-name file: listed from a topo map';
    if(x.s==='T') return x.v==='+'?`${y} USGS topo: still drawn`:x.v==='~'?`${y} USGS topo: a building drawn nearby, not on the spot`:`${y} USGS topo: nothing drawn`;
    if(x.s==='A') return x.v==='+'?`${y} air photo: buildings at the spot`:x.v==='~'?`${y} air photo: unclear`:`${y} air photo: no building at the spot`;
    if(x.s==='N') return x.v==='b'?'Today: a building stands on or by the spot':x.v==='~'?'Today: a building close by':'Today: no building close';
    return ''; }
  function gone(w){ return !w?'':w.since?`Still standing in ${w.a}, gone since.`:`Gone between ${w.a} and ${w.b}.`; }
  // sources that agree on the place: the two-sources families of the spot (SRC2: plat book, fire map, old topo or place-name file, survey plat,
  // air photo, LiDAR, newspaper, county history...) plus those of every other history spot within 120 m, so separate pins of one place add up
  const own=p=>typeof SRC2==='object'&&SRC2.applies(p)?SRC2.get(p):[];
  const AG={n:null,key:'',grid:null};
  function grid(){ if(AG.grid&&AG.key===PTS.length) return AG.grid; const g=new Map();
    for(const p of PTS){ if(!own(p).length) continue; const k=Math.floor(p.la/0.002)+'_'+Math.floor(p.lo/0.0028); (g.get(k)||g.set(k,[]).get(k)).push(p); }
    AG.grid=g; AG.key=PTS.length; return g; }
  function agree(p){ if(p._ag&&p._ag.k===AG.key) return p._ag; const f=new Set(own(p)), g=grid(), I=Math.floor(p.la/0.002), J=Math.floor(p.lo/0.0028), cl=Math.cos(p.la*Math.PI/180);
    if(f.size) for(let i=I-1;i<=I+1;i++) for(let j=J-1;j<=J+1;j++) for(const q of g.get(i+'_'+j)||[]){ if(q===p) continue;
      const d=Math.hypot((q.la-p.la)*111000,(q.lo-p.lo)*111000*cl); if(d<=120) for(const x of own(q)) f.add(x); }
    return p._ag={k:AG.key,f:[...f],n:f.size,own:own(p).length}; }
  window.VFA={wit,agree,gone,wLine};
  // the card: "When it went" and "Sources that agree" under the score box
  const rkV=rkHTML; rkHTML=function(p){ let h=rkV(p); try{ const v=wit(p), a=own(p).length?agree(p):null;
      if(v&&v.W.length>1) h+=`<details class="vfcard"${v.w?' open':''}><summary>${v.w?'When it went: '+esc(gone(v.w).replace(/\.$/,'')):'Old sources, year by year'}</summary><ul class="ev">${v.W.map(x=>`<li>${esc(wLine(x))}</li>`).join('')}</ul></details>`;
      if(a&&a.n>a.own&&a.n>=2) h+=`<p class="vfagr"><b>With the spots within 120 m, ${a.n} kinds of source agree here:</b> ${esc(a.f.map(k=>SRC2.N[k]||k).join(', '))}.</p>`;
    }catch(e){ OGE.err&&OGE.err('vf card',e); } return h; };
  // two switch-on layers, beside the old map slider
  { const i=LAYERS.findIndex(l=>l.id==='_oldmap'), at=i>=0?i+1:LAYERS.length, sec=i>=0?LAYERS[i].sec:'Old maps vs today';
    if(!LBY._agree){ const R=[{sec,id:'_agree',n:'Where old sources agree (heat map)',d:'Glow where several independent kinds of source place the same spot (the same families as the two-sources rule: plat book, fire map, old topo, survey plat, air photo, LiDAR, newspaper, county history), counting every history spot within 120 m. Yellow = 2, orange = 3, red = 4, white-hot = 5 or more. A little brighter where the best-spot score is high. Off at first',overlay:true,on:false},
        {sec,id:'_vanish',n:'When it vanished (rings)',d:'A ring round every spot an old map draws and a later one leaves out, coloured by when it went: purple before 1900, blue 1900-1919, teal 1920-1939, green 1940-1964, grey gone since the 1936-41 air photos. Tap the spot for the year-by-year list. Off at first',overlay:true,on:false}];
      LAYERS.splice(at,0,...R); for(const l of R) LBY[l.id]=l; if(typeof SHORT!=='undefined'){ SHORT._agree='Sources agree'; SHORT._vanish='When it vanished'; } } }
  const VC=w=>!w?null:w.since?'#8a8f98':w.b<=1900?'#7b3fa0':w.b<=1919?'#2f62c9':w.b<=1939?'#178a8a':w.b<=1964?'#3b9a3b':'#8a8f98';
  // the paint: one canvas under the pins
  const hcv=document.createElement('canvas'); hcv.className='hcv'; hcv.setAttribute('aria-hidden','true'); pcv.parentElement.insertBefore(hcv,pcv); const hcx=hcv.getContext('2d');
  const off=document.createElement('canvas'), ocx=off.getContext('2d',{willReadFrequently:true});
  const RAMP=(()=>{ const c=document.createElement('canvas'); c.width=256; c.height=1; const x=c.getContext('2d'), g=x.createLinearGradient(0,0,256,0);
    g.addColorStop(0,'rgba(255,240,120,0)'); g.addColorStop(0.18,'#ffe14d'); g.addColorStop(0.42,'#ff9a1f'); g.addColorStop(0.66,'#e8321e'); g.addColorStop(0.86,'#ff5fb0'); g.addColorStop(1,'#fffbe8');
    x.fillStyle=g; x.fillRect(0,0,256,1); return x.getImageData(0,0,256,1).data; })();
  let shown=false;
  function paint(s){ const want=(on.has('_agree')||on.has('_vanish'))&&!T3.on&&s&&isFinite(s);
    if(!want){ if(shown){ hcx.setTransform(1,0,0,1,0,0); hcx.clearRect(0,0,hcv.width,hcv.height); hcv.style.display='none'; shown=false; } return; }
    const W=svgW(), H=svgH(), d=Math.min(2,window.devicePixelRatio||1); if(hcv.width!==Math.round(W*d)||hcv.height!==Math.round(H*d)){ hcv.width=Math.round(W*d); hcv.height=Math.round(H*d); }
    hcv.style.display=''; shown=true; hcx.setTransform(1,0,0,1,0,0); hcx.clearRect(0,0,hcv.width,hcv.height);
    const x0=vb.x-vb.w*.1, x1=vb.x+vb.w*1.1, y0=vb.y-vb.h*.1, y1=vb.y+vb.h*1.1;
    if(on.has('_agree')){ const q=2, w=Math.ceil(W/q), h=Math.ceil(H/q); if(off.width!==w||off.height!==h){ off.width=w; off.height=h; }
      ocx.setTransform(1,0,0,1,0,0); ocx.clearRect(0,0,w,h); ocx.globalCompositeOperation='lighter';
      const r=Math.max(8,s*350/111000/q);
      for(const p of PTS){ const X=p.lo*K, Y=-p.la; if(X<x0||X>x1||Y<y0||Y>y1) continue; if(!own(p).length) continue; const a=agree(p); if(a.n<2) continue;
        let sc=0; try{ sc=RKX(p).sc||0; }catch(_){}
        const wt=Math.min(1,(a.n-1)/4)*(0.75+0.25*Math.min(1,sc/90)), px=(X-vb.x)*s/q, py=(Y-vb.y)*s/q;
        const g=ocx.createRadialGradient(px,py,0,px,py,r); g.addColorStop(0,`rgba(0,0,0,${(0.7*wt).toFixed(3)})`); g.addColorStop(1,'rgba(0,0,0,0)');
        ocx.fillStyle=g; ocx.fillRect(px-r,py-r,2*r,2*r); }
      ocx.globalCompositeOperation='source-over';
      const im=ocx.getImageData(0,0,w,h), D=im.data;
      for(let i=3;i<D.length;i+=4){ const a=D[i]; if(a<10){ D[i]=0; continue; } const k=Math.min(255,a)*4; D[i-3]=RAMP[k]; D[i-2]=RAMP[k+1]; D[i-1]=RAMP[k+2]; D[i]=Math.min(235,70+a); }
      ocx.putImageData(im,0,0); hcx.globalAlpha=0.8; hcx.imageSmoothingEnabled=true; hcx.drawImage(off,0,0,w,h,0,0,W*d,H*d); hcx.globalAlpha=1; }
    if(on.has('_vanish')){ hcx.setTransform(d,0,0,d,0,0); hcx.lineWidth=2.6;
      // only round pins drawn on their own (PCV.dr, filled by the pin paint just before), not the ones inside a bubble
      for(const [p,px,py] of PCV.dr||[]){ const v=wit(p); if(!v||!v.w) continue;
        const rr=(s>=110?13:10)*(p.id===selId?1.4:1); hcx.beginPath(); hcx.arc(px,py,rr,0,6.2832); hcx.strokeStyle=VC(v.w); hcx.stroke(); } } }
  OGE.on('post',s=>paint(s||VIEW.s||scale()));
  // swatches for the two rows in the layer lists
  if(typeof plIco==='function'){ const ic0=plIco; plIco=function(id){ if(id==='_agree') return '<span class="dot" style="background:radial-gradient(circle,#fffbe8 0,#e8321e 45%,#ffe14d 75%,transparent 76%);border-radius:50%"></span>'; if(id==='_vanish') return '<svg width="18" height="18"><circle cx="9" cy="9" r="6" fill="none" stroke="#2f62c9" stroke-width="2.4"/></svg>'; return ic0(id); }; }
  document.head.insertAdjacentHTML('beforeend','<style id="vfCss">.hcv{position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:1}.vfcard{margin-top:6px;font-size:13.5px}.vfcard summary{cursor:pointer;font-weight:700}.vfagr{margin:6px 0 0;font-size:13.5px}</style>');
  try{ renderLayers(); }catch(_){} try{ if(typeof plLaySync==='function') plLaySync(); }catch(_){}
}
