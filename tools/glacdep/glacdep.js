// ---------- Glacial deposits of Wisconsin (gd1). The 1964 WGNHS map (after Thwaites 1956) as a see-through overlay, tap to read the deposit ----------
// og/glacdep.webp is the statewide map traced by machine into its five legend classes and warped onto the atlas grid (lon -92.95 to -86.75,
// lat 42.45 to 47.15). The tap grid below holds the same classes at 0.01 degree. Boundaries are good to about 1 to 3 km: a 1:2,500,000 map,
// so read it as "what kind of ground is this part of the county", never as a spot. Source: tools/glacdep, research/glacial-deposits-1964.md.
(()=>{ try{
  const G={w:__W__,h:__H__,lon0:__LON0__,lat1:__LAT1__,dlat:__DLAT__,dlon:__DLON__}, RLE='__RLE__';
  let A=null; const grid=()=>{ if(A) return A; A=new Uint8Array(G.w*G.h); let o=0; for(let i=0;i<RLE.length;i+=3){ const k=+RLE[i], n=parseInt(RLE.substr(i+1,2),36); A.fill(k,o,o+n); o+=n; } return A; };
  const at=(lo,la)=>{ const x=Math.floor((lo-G.lon0)/G.dlon), y=Math.floor((G.lat1-la)/G.dlat); if(x<0||y<0||x>=G.w||y>=G.h) return 0; return grid()[y*G.w+x]; };
  const C={1:'#a82824',2:'#78aa50',3:'#e2ba28',4:'#f08c32',5:'#3c78d2'};
  const D={
   1:{n:'End moraine',sh:'Ridges of till the ice piled up at its edge while it stood still',
      gold:'Gold in the moraine itself is fine and scattered through unsorted till. The pay is where meltwater and later streams washed it: pan the creeks that cut through the ridge and the outwash gravel just in front of it, on the side away from the ice.',
      met:'Boulder country: hard to spot a stone. Rock piles and fresh cuts only.'},
   2:{n:'Ground moraine',sh:'Till spread out under the moving ice: clay, sand and boulders mixed together',
      gold:'Unsorted, so little natural concentration. Look where a modern stream has cut down through the till and re-sorted it: inside bends, gravel bars on bedrock and the head of bars after floods.',
      met:'Rolling farm fields with plenty of glacial stones; work field rock piles and walk plowed fields after rain.'},
   3:{n:'Outwash, unpitted',sh:'Flat sand and gravel plains and valley trains laid down by meltwater rivers',
      gold:'Meltwater sorted this gravel, so heavy grains settled out here. The best panning ground on this map: stream bars cut into the outwash, the coarse layers low in pit faces, and gravel resting on clay or bedrock. Most gravel pits sit on it.',
      met:'Flat, often sandy fields with few stones, so a dark stone stands out. Good walking after plowing.'},
   4:{n:'Outwash, pitted',sh:'Outwash laid over buried ice that later melted, leaving kettle holes and lakes',
      gold:'Sorted like other outwash but patchier. Work pit faces and the gravel around kettle rims; bars where streams leave the kettles.',
      met:'Kettles and lakes break it up; walk the plowed flats between them.'},
   5:{n:'Lake basin',sh:'The bed of a glacial lake: mostly silt and clay, with sand near the old shores',
      gold:'Little gravel and little gold, except on old beach ridges and the deltas where meltwater rivers entered the lake.',
      met:'Stone-free fields where almost any rock is out of place: some of the best ground in the state to walk for meteorites.'},
   6:{n:'Driftless Area',sh:'The ice never covered it, so there is no glacial drift',
      gold:'Streams carry only local rock, so almost no glacial gold. See the Driftless Area layer.',
      met:'Old, weathered ground; fields have few loose stones, so stones show, but old falls have rusted away.'}};
  window.OGGD={at,D};

  // ---- the layer row, in the glacial drift section ----
  if(!LBY._glacdep){ let i=LAYERS.findIndex(l=>l.id==='geo'); i=i<0?LAYERS.findIndex(l=>l.id==='glacial'):i;
    const row={sec:i>=0?LAYERS[i].sec:'Glacial drift: how the ice moved gold',id:'_glacdep',n:'Glacial deposits map (Wisconsin, 1964)',d:'End moraines, ground moraine, outwash and old lake beds from the 1964 state survey map. Outwash is where meltwater sorted gold; tap the map to read the ground',overlay:true,on:false};
    LAYERS.splice(i>=0?i+1:LAYERS.length,0,row); LBY._glacdep=row; }
  if(typeof SHORT==='object') SHORT._glacdep='Glacial deposits';
  if(typeof PLOV==='object') PLOV._glacdep=[C[3],'h'];
  const SW=`<span class="dot" style="background:linear-gradient(90deg,${C[1]} 0 20%,${C[2]} 20% 40%,${C[3]} 40% 60%,${C[4]} 60% 80%,${C[5]} 80%);border-radius:3px;opacity:.85"></span>`;
  const _rl=renderLayers; renderLayers=function(){ const r=_rl.apply(this,arguments); try{ const b=document.querySelector('#pane-layers .lrow[data-l="_glacdep"]'); if(b&&b.firstElementChild&&!b.firstElementChild.matches('.nm')) b.firstElementChild.outerHTML=SW; }catch(_){} return r; };
  if(SHM.gold&&!SHM.gold.L.includes('_glacdep')) SHM.gold.L.push('_glacdep');

  // ---- the picture, under the pins and just above the magnetic map ----
  const gGd=el('g',{style:'display:none'}); { const [ix,iy]=P(G.lon0,G.lat1), [jx,jy]=P(-86.75,42.45);
    el('image',{'data-src':'og/glacdep.webp',x:ix,y:iy,width:jx-ix,height:jy-iy,preserveAspectRatio:'none',opacity:0.5,style:'image-rendering:pixelated'},gGd); }
  if(typeof gMag!=='undefined'&&gMag.parentNode) gMag.parentNode.insertBefore(gGd,gMag.nextSibling); else gBase.appendChild(gGd);
  OGE.on('draw',()=>{ const v=on.has('_glacdep'); if(gGd.style.display!==(v?'':'none')) gGd.style.display=v?'':'none';
    if(v){ const im=gGd.querySelector('image[data-src]'); if(im){ im.setAttribute('href',im.dataset.src); im.removeAttribute('data-src'); } } });

  // ---- tap the map: what ground is this ----
  const box=(k,c)=>`<i style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${c};vertical-align:-1px;margin-right:6px"></i>`;
  const SRC='<p class="hint" style="margin:6px 0 0">From <i>Glacial Deposits of Wisconsin</i>, University of Wisconsin-Extension Geological and Natural History Survey, 1964, after Thwaites 1956. Traced by machine from a 1:2,500,000 map: boundaries are good to a mile or two, so use it for the lay of the land, not a spot.</p>';
  function card(k){ const d=D[k];
    return `<h4>${k<6?box(k,C[k]):''}${esc(d.n)}</h4><p class="pm" style="margin:2px 0 6px">${esc(d.sh)}.</p><p style="margin:4px 0"><b>Gold:</b> ${esc(d.gold)}</p><p style="margin:4px 0"><b>Meteorites:</b> ${esc(d.met)}</p>
      <details style="margin:6px 0 0"><summary class="pm" style="cursor:pointer">The five kinds of ground</summary>${[1,2,3,4,5].map(i=>`<div style="margin:3px 0">${box(i,C[i])}<b>${esc(D[i].n)}</b>: ${esc(D[i].sh)}.</div>`).join('')}</details>${SRC}`; }
  const _fh=findHit; findHit=function(cx,cy){ const r=_fh(cx,cy); if(r||!on.has('_glacdep')) return r;
    try{ const rr=svgRect(), [wx,wy]=toW(cx+rr.left,cy+rr.top), k=at(wx/K,-wy); if(!k) return false;
      pop.innerHTML='<button class="px" aria-label="Close">×</button>'+card(k); pop.querySelector('.px').onclick=closePop; pop.hidden=false; placePop(cx,cy); popT=performance.now(); return true; }catch(e){ OGE.err('gdHit',e); } return false; };

  // ---- the tip on gold and meteorite pins in Wisconsin ----
  const TIPL=new Set(['panning','report','pit','glacial','trap','target','meteor']);
  const tip=p=>{ if(!p||!TIPL.has(p.L)) return ''; const k=at(p.lo,p.la); if(!k) return ''; const d=D[k];
    return `<p class="pm gdtip" style="margin:4px 0 0">${k<6?box(k,C[k]):''}<b>Ground here (1964 glacial map): ${esc(d.n)}.</b> ${esc(p.L==='meteor'?d.met:d.gold)}</p>`; };
  window.OGGD.tip=tip;
  const _op=openPop; openPop=function(ids,sx,sy){ _op(ids,sx,sy); try{ if(ids.length===1){ const h=tip(BYID[ids[0]]); const row=pop.querySelector('.row'); if(h&&row) row.insertAdjacentHTML('beforebegin',h); } }catch(e){ OGE.err('gdTip',e); } };

  try{ renderLayers(); }catch(_){}
}catch(e){ try{ OGE.err('glacdep',e); }catch(_){} } })();
