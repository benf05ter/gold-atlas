// Park outlines and trails are painted on the pin canvas under the pins (thousands of SVG paths made zooming in towns choppy).
// pkDraw/trDraw (parks section) now only collect the tiles in view; the engine's pcLand() paints them and a tap tests them.
gPk.style.display='none'; gTr.style.display='none';
const pkP=(r)=>{ const p=new Path2D(); let x=r[0], y=r[1]; p.moveTo(x/1e4*K,-y/1e4); for(let i=2;i<r.length;i+=2){ x+=r[i]; y+=r[i+1]; p.lineTo(x/1e4*K,-y/1e4); } return p; };
pkDraw=function(){ PCV.pk=[]; const ks=on.has('park')?pkTiles('P',300,PK.tiles,()=>{ pkDraw(); pcLater(); }):null; if(!ks) return; const seen=new Set();
  for(const k of ks) for(const f of PK.tiles.get(k)||[]){ const [uid,pin,kind,rings]=f; if(pin&&!BYID[uid]){ pkAdd([pin[0],kind,pin[1],pin[2],pin[3],pin[4],pin[5],uid]); PK.np=1; }
    if(seen.has(uid)) continue; seen.add(uid); if(!f.P){ f.P=new Path2D(); for(const r of rings){ f.P.addPath(pkP(r)); f.P.closePath(); } } PCV.pk.push(f); }
  if(PK.np){ PK.np=0; drawMarkers(); } };
trDraw=function(){ PCV.tr=[]; const ks=on.has('_trails')?pkTiles('T',700,PK.tt,()=>{ trDraw(); pcLater(); }):null; if(!ks) return;
  for(const k of ks){ const a=PK.tt.get(k); if(!a) continue; if(!a.P){ a.P=[new Path2D(),new Path2D(),new Path2D()]; a.N=[]; for(const [n,kind,r] of a){ const p=pkP(r); a.P[kind].addPath(p); if(n) a.N.push([n,p]); } } PCV.tr.push(a); } };
// tap a park outline to open the park; tap a trail for its name
{ const _fhC=findHit; findHit=function(cx,cy){ if(_fhC(cx,cy)) return true; const s=VIEW.s||scale(), c=pcx; if(!s) return false; pcWorld(c,s); const X=cx*PCV.dpr, Y=cy*PCV.dpr; let hit=null;
    c.lineWidth=12/s; for(const a of PCV.tr||[]){ for(const [n,p] of a.N) if(c.isPointInStroke(p,X,Y)){ hit=['t',n]; break; } if(hit) break; }
    if(!hit) for(let i=(PCV.pk||[]).length-1;i>=0;i--){ const f=PCV.pk[i]; if(BYID[f[0]]&&c.isPointInPath(f.P,X,Y,'evenodd')){ hit=['p',f[0]]; break; } }
    c.setTransform(PCV.dpr,0,0,PCV.dpr,0,0); if(!hit) return false; if(hit[0]==='t') hrToast(hit[1]); else select(hit[1],false); return true; }; }
