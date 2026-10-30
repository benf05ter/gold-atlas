// ---------- Sharper LiDAR views and ground changed since the old topo (v222) ----------
// Card LiDAR pictures get two more views of the same 1 m LiDAR square: local relief (each cell minus its 25 m surroundings, so a cellar rim
// shows even on a hillside) and sky-view (how much sky each cell sees; hollows, ditches and sunken lanes go dark). tools/lidviews/views.py cuts one
// grey local-relief picture per spot ("<cl>|<webp>", 128 = level, +-120 = +-cl metres) into img/<chunk>.r.json beside the app's own
// img/<chunk>.json with the same ids, so it needs no index and loads only when tapped; the phone colours it and works the sky-view from it. img/tc.json (tdiff.py) holds, per spot, the oldest 1:24,000-1:62,500 USGS topo (1890s-1964) laid on today's LiDAR: where its
// contour lines still sit at one height the slope is untouched, where they now sit metres lower or higher the ground was cut or filled.
// It loads with the first card that has a LiDAR picture, or when its map layer is switched on.
{ const LV={v:'',tc:null,tcp:null}; try{ LV.v=localStorage.getItem('ogLidView')||''; }catch(_){}
  const VN={'':'Shaded','r':'Local relief','v':'Sky-view'};
  const VH={r:'Local relief: red cross = pin; blue = lower than the ground 25 m around (cellar holes, wells, privies, ditches), red = higher (foundations, banks, mounds, spoil). The colours stretch to this ground, so a 1 ft rim shows on flat land. Bar = 50 m.',
    v:'Sky-view: dark = ground that sees little sky (cellar holes, ditches, sunken lanes, pit and bank edges), light = open level ground. Best for small hollows under trees. Red cross = pin. Bar = 50 m.'};
  const tcLoad=()=>LV.tcp||(LV.tcp=fetch('img/tc.json',{cache:'force-cache'}).then(r=>r.ok?r.json():{}).catch(()=>({})).then(a=>{ LV.tc=a||{}; return LV.tc; }));
  const DIR=['north','northeast','east','southeast','south','southwest','west','northwest'];
  // card note: [year, verdict I intact / D changed, contour m checked within 150 m, cut m, fill m, flooded m, deepest cut, highest fill, nearest change m, bearing, pts]
  function tcNote(p,t){ if(!t) return ''; const [y,v,chk,cut,fill,fl,mc,mf,nd,nb]=t, ft=m=>Math.round(m*3.281);
    const dir=nb==null?'':` ${DIR[Math.round(nb/45)%8]}`;
    if(v==='I') return `<p class="tcn tcI"><b>Ground intact since the ${y} topo.</b> ${chk.toLocaleString()} m of the ${y} USGS contour lines within 150 m still sit at their own height on today's LiDAR, so these slopes have not been cut or filled since. Level ground can't be tested this way.</p>`;
    if(v==='D'){ const w=[]; if(cut) w.push(`${cut} m now up to ${ft(mc)} ft lower (cut: road, pit, quarry or levelling)`); if(fill) w.push(`${fill} m now up to ${ft(mf)} ft higher (fill: road bank, dam, dump or building pad)`);
      return `<p class="tcn tcD"><b>Ground changed since the ${y} topo.</b> Of ${(chk+cut+fill).toLocaleString()} m of ${y} contour line within 150 m, ${w.join(' and ')}. Nearest change ${nd} m${dir} of the pin. Tap <b>Changed</b> on the LiDAR picture to see where; ground away from the marks is more likely original.</p>`; }
    return ''; }
  // the "Changed" view: the LiDAR picture with the changed stretches of old contour marked (red cut, orange fill)
  function drawChanged(im,base,t,big){ const c=document.createElement('canvas'), I=new Image(); I.onload=()=>{ const W=I.naturalWidth; c.width=c.height=W; const x=c.getContext('2d'); x.drawImage(I,0,0);
      const half=big?300:180, k=W/(2*half), P=t[10]||[]; for(let i=0;i<P.length;i+=3){ const px=(P[i]*3-300+half)*k, py=(P[i+1]*3-300+half)*k; if(px<0||py<0||px>W||py>W) continue;
        x.fillStyle=P[i+2]===1?'#ff9a1f':'#e8321e'; x.beginPath(); x.arc(px,py,Math.max(2,W/120),0,6.2832); x.fill(); }
      im.src=c.toDataURL('image/webp',0.8); }; I.src=base; }
  // grey local relief -> coloured relief or sky-view, with the pin cross and a 50 m bar, as a picture the card (and tap-to-enlarge) can show
  function relief(src,cl,half,v){ return new Promise((ok,no)=>{ const I=new Image(); I.onerror=no; I.onload=()=>{ const N=I.naturalWidth, c=document.createElement('canvas'); c.width=c.height=N;
      const x=c.getContext('2d',{willReadFrequently:true}); x.drawImage(I,0,0); const D=x.getImageData(0,0,N,N), P=D.data, h=new Float32Array(N*N), m=2*half/N;
      for(let i=0;i<N*N;i++) h[i]=(P[i*4]-128)/120*cl;
      const at=(i,j)=>h[Math.min(N-1,Math.max(0,j))*N+Math.min(N-1,Math.max(0,i))];
      for(let j=0;j<N;j++) for(let i=0;i<N;i++){ const k=j*N+i, gx=(at(i+1,j)-at(i-1,j))/(2*m), gy=(at(i,j+1)-at(i,j-1))/(2*m), sl=Math.hypot(gx,gy); let r,g,b;
        if(v==='r'){ const t=Math.max(-1,Math.min(1,h[k]/cl)), hs=Math.max(0,Math.min(1,(0.7-0.5*(gx-gy)*1.5)/Math.sqrt(1+sl*sl*2.25))), f=0.6+0.4*hs;
          r=(t>0?1-0.15*t:1+t)*f; g=(1-Math.abs(t)*0.85)*f; b=(t<0?1:1-t)*f; }
        else { let s=0; for(let a=0;a<16;a++){ const dx=Math.cos(a*0.3927), dy=Math.sin(a*0.3927); let best=0;
            for(let st=1;st<=8;st++){ const e=(at(Math.round(i+dx*st),Math.round(j+dy*st))-h[k])/(st*m); if(e>best) best=e; }
            s+=best/Math.sqrt(1+best*best); }
          const sv=Math.max(0,Math.min(1,((1-s/16)-0.85)/0.15)), so=1-Math.min(1,Math.atan(sl)/0.61); r=g=b=0.04+0.92*(0.65*sv+0.35*so); }
        P[k*4]=r*255; P[k*4+1]=g*255; P[k*4+2]=b*255; P[k*4+3]=255; }
      x.putImageData(D,0,0); const C=N/2; x.lineWidth=2; x.strokeStyle='#ff2828'; x.beginPath(); x.moveTo(C-7,C); x.lineTo(C+7,C); x.moveTo(C,C-7); x.lineTo(C,C+7); x.stroke();
      const sb=50/m; x.fillStyle='#fff'; x.strokeStyle='#000'; x.lineWidth=1; x.fillRect(7,N-13,sb,4); x.strokeRect(7,N-13,sb,4); x.fillStyle='#000'; x.font='10px sans-serif'; x.fillText('50 m',11+sb,N-9);
      ok(c.toDataURL('image/png')); }; I.src=src; }); }
  function setView(box,v){ const im=box.querySelector('img[data-lik]'), n=box.dataset.lvn, k=im&&im.dataset.lik; if(!im||!n) return;
    const hint=box.querySelector('.hint'); if(hint&&box.dataset.h0==null) box.dataset.h0=hint.innerHTML;
    box.querySelectorAll('.lvb').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));
    const big=/^l-/.test(n), tok=box.dataset.tok=String(Math.random());
    if(v==='c'){ const t=LV.tc&&LV.tc[box.dataset.pid]; if(!t) return; im.removeAttribute('data-li');
      liChunk(n).then(d=>{ const b=d[k]; if(b&&box.dataset.tok===tok) drawChanged(im,`data:image/${b.startsWith('UklG')?'webp':'jpeg'};base64,${b}`,t,big); }).catch(()=>{});
      if(hint) hint.innerHTML=`Where the ${t[0]} topo's contour lines no longer fit today's ground: red = cut lower, orange = filled higher. Unmarked slopes still match the old map. Red cross = pin. Bar = 50 m.`;
      return; }
    if(hint) hint.innerHTML=v?VH[v]:box.dataset.h0;
    if(!v){ im.dataset.li=n; liFill(box); return; }
    im.removeAttribute('data-li'); im.style.opacity='0.5';
    liChunk(n+'.r').then(d=>{ const s=d[k]; if(!s) throw 0; const [cl,b]=s.split('|'); return relief('data:image/webp;base64,'+b,+cl,big?300:180,v); })
      .then(u=>{ if(box.dataset.tok===tok){ im.src=u; im.style.opacity=''; } })
      .catch(()=>{ im.style.opacity=''; if(hint&&box.dataset.tok===tok) hint.innerHTML='This view needs a signal the first time (or is missing for this spot). '+box.dataset.h0; }); }
  const lidV=lidarHTML; lidarHTML=function(p){ let h=lidV(p); try{ const k=lidKey(p), b=k&&LIDIMG[k];
      if(!h||!b||b[0]!=='@') return h; const n=b.slice(1), t=LV.tc&&LV.tc[k];
      const btn=(v,l)=>`<button class="chip lvb" data-v="${v}" aria-pressed="false">${l}</button>`;
      h=h.replace('<div class="lid">',`<div class="lid" data-lvn="${esc(n)}" data-pid="${esc(k)}">`)
        .replace(/(<img [^>]*data-lik="[^"]*"[^>]*>)/,`$1<span class="lvrow">${btn('','Shaded')}${btn('r','Local relief')}${btn('v','Sky-view')}${t&&t[1]==='D'?btn('c','Changed'):'<span class="lvc"></span>'}</span>`);
      h+=t?tcNote(p,t):`<span class="tcw" data-pid="${esc(k)}"></span>`;
      if(!LV.tc) tcLoad().then(()=>{ for(const s of document.querySelectorAll('.tcw')){ const id=s.dataset.pid, t=LV.tc[id]; if(!t){ s.remove(); continue; }
        const box=s.previousElementSibling; if(box&&box.classList.contains('lid')&&t[1]==='D'){ const c=box.querySelector('.lvc'); if(c) c.outerHTML=btn('c','Changed'); }
        s.outerHTML=tcNote(null,t); } });
    }catch(e){ OGE.err&&OGE.err('lidviews card',e); } return h; };
  // after a card is drawn: start in the view picked last time
  new MutationObserver(ms=>{ for(const m of ms) for(const n of m.addedNodes) if(n.nodeType===1) for(const box of (n.matches&&n.matches('.lid[data-lvn]')?[n]:n.querySelectorAll?n.querySelectorAll('.lid[data-lvn]'):[])){
      box.querySelector(`.lvb[data-v="${LV.v==='c'?'':LV.v}"]`)?.setAttribute('aria-pressed','true'); if(LV.v&&LV.v!=='c') setView(box,LV.v); } }).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('click',e=>{ const b=e.target.closest('.lvb'); if(!b) return; e.stopPropagation(); const box=b.closest('.lid');
    LV.v=b.dataset.v; try{ localStorage.setItem('ogLidView',LV.v); }catch(_){}
    if(LV.v==='c'&&!LV.tc){ tcLoad().then(()=>setView(box,'c')); return; } setView(box,LV.v); },true);
  // map layer: a ring on each checked spot, green = slopes intact since the old topo, red = cut or filled
  { const i=LAYERS.findIndex(l=>l.id==='_vanish'||l.id==='_oldmap'), at=i>=0?i+1:LAYERS.length, sec=i>=0?LAYERS[i].sec:'Old maps vs today';
    if(!LBY._tchg){ const R={sec,id:'_tchg',n:'Ground changed since the old topo (rings)',d:'A ring round each spot whose old USGS topo (1890s-1964) was laid on today’s 1 m LiDAR: green = the old contour lines within 150 m still fit (slopes untouched), red = ground cut or filled since (road cut or bank, pit, quarry, levelling). Lakes and rivers are not tested. No ring = level ground or no old topo to test. Loads when switched on. Off at first',overlay:true,on:false};
      LAYERS.splice(at,0,R); LBY._tchg=R; if(typeof SHORT!=='undefined') SHORT._tchg='Changed ground'; } }
  const tcv=document.createElement('canvas'); tcv.className='tcv'; tcv.setAttribute('aria-hidden','true'); pcv.parentElement.insertBefore(tcv,pcv); const tcx=tcv.getContext('2d');
  const TCC={I:'#2f9a3b',D:'#d8321e'}; let tshown=false;
  function tcPaint(s){ const want=on.has('_tchg')&&!T3.on&&s&&isFinite(s);
    if(!want){ if(tshown){ tcx.setTransform(1,0,0,1,0,0); tcx.clearRect(0,0,tcv.width,tcv.height); tcv.style.display='none'; tshown=false; } return; }
    if(!LV.tc){ tcLoad().then(()=>drawMarkers()); return; }
    const W=svgW(), H=svgH(), d=Math.min(2,window.devicePixelRatio||1); if(tcv.width!==Math.round(W*d)||tcv.height!==Math.round(H*d)){ tcv.width=Math.round(W*d); tcv.height=Math.round(H*d); }
    tcv.style.display=''; tshown=true; tcx.setTransform(d,0,0,d,0,0); tcx.clearRect(0,0,W,H); tcx.lineWidth=2.4;
    for(const [p,px,py] of PCV.dr||[]){ const t=LV.tc[lidKey(p)||p.id]; if(!t||!TCC[t[1]]) continue;
      const rr=(s>=110?16:12.5)*(p.id===selId?1.4:1); tcx.beginPath(); tcx.arc(px,py,rr,0,6.2832); tcx.strokeStyle=TCC[t[1]]; tcx.stroke(); } }
  OGE.on('post',s=>tcPaint(s||VIEW.s||scale()));
  if(typeof plIco==='function'){ const ic0=plIco; plIco=function(id){ if(id==='_tchg') return '<svg width="18" height="18"><circle cx="9" cy="9" r="6" fill="none" stroke="#d8321e" stroke-width="2.4"/></svg>'; return ic0(id); }; }
  try{ renderLayers(); }catch(_){} try{ if(typeof plLaySync==='function') plLaySync(); }catch(_){}
  window.LIDV={setView,tcLoad,tcNote};
}
