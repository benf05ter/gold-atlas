// ---------- Fire maps map type (v146): the oldest Sanborn fire insurance map of each town, every sheet fitted to street crossings that are still there
// (2 to 8 per sheet, about 1 to 3 m) and laid together as one picture per town: each building with its use, the hotels, saloons, liveries, depots,
// mills, schools and churches, and the board sidewalks and wells. One see-through slider for all. Add a town = add a FIRE entry.
var FIRE=/*FIRE*/[];
{ const gF=el('g',{},gBase); gBase.insertBefore(gF,gBelt); gF.style.display='none';
  for(const p of FIRE){ const [ix,iy]=P(p.b[0],p.b[3]); p.im=el('image',{x:ix,y:iy,width:(p.b[1]-p.b[0])*K,height:p.b[3]-p.b[2],preserveAspectRatio:'none','data-f':p.f},gF); }
  const towns=[...new Set(FIRE.map(p=>p.town))];
  let op=100; try{ op=+(localStorage.getItem('og-fireop')??100); }catch(_){}
  document.getElementById('gmNote').insertAdjacentHTML('afterend',`<div class="gm19" id="gmF" hidden>
    <label>See-through <input type="range" id="gmFr" min="30" max="100" value="${op}" aria-label="Fire map see-through"></label>
    <label>Go to <select id="gmFgo"><option value="">Pick a town</option>${towns.map(t=>`<option>${t}</option>`).join('')}</select></label>
    <details><summary>Sources and fit</summary>
    <p class="hint">Sanborn Map &amp; Publishing Co. fire insurance maps from the Library of Congress, the oldest edition of each town (${FIRE.map(p=>p.label).filter((v,i,a)=>a.indexOf(v)===i).join(', ')}). Each sheet was fitted to street crossings that are still there today, so most buildings land within a few metres. Sheets of outlying mills with no streets on them are not drawn; their buildings are pins instead. The pins marked "fire map" are the hotels, saloons, liveries, depots, mills, schools, churches and halls drawn on these sheets.</p>
    <p class="hint">Street names changed: Altoona's Florence, Cortland, Putnam and Hancock are today's 1st to 4th Street West; Menomonie's 12th to 5th Streets are today's 2nd to 9th Street East; Eau Claire's Bridge Street is Grand Avenue.</p></details></div>`);
  const pF=document.getElementById('gmF'), rF=document.getElementById('gmFr');
  const opA=()=>gF.setAttribute('opacity',(+rF.value/100).toFixed(2));
  rF.oninput=()=>{ opA(); try{ localStorage.setItem('og-fireop',rF.value); }catch(_){} }; opA();
  function vF(){ const o=GM.type==='fire'; gF.style.display=o?'':'none'; if(pF) pF.hidden=!o; if(!o) return;
    const lon0=vb.x/K, lon1=(vb.x+vb.w)/K, la1=-vb.y, la0=-(vb.y+vb.h); if(lon1-lon0>0.6) return;   // town pictures load only once zoomed toward a town
    for(const p of FIRE){ const B=p.b; if(p.im&&!(B[1]<lon0||B[0]>lon1||B[3]<la0||B[2]>la1)&&!p.im.getAttribute('href')) p.im.setAttribute('href','omf/'+p.f+'.webp'); } }
  document.getElementById('gmFgo').onchange=ev=>{ const t=ev.target.value; if(!t) return; const L=FIRE.filter(p=>p.town===t);
    const B=[Math.min(...L.map(p=>p.b[0])),Math.max(...L.map(p=>p.b[1])),Math.min(...L.map(p=>p.b[2])),Math.max(...L.map(p=>p.b[3]))];
    const [x0,y0]=P(B[0],B[3]),[x1,y1]=P(B[1],B[2]); vb={x:x0,y:y0,w:x1-x0,h:y1-y0}; fit(); apply(); try{ gmSheet(false); }catch(_){} drawMarkers(); };
  const _gstF=gmSetType; gmSetType=function(t,open){
    if(t==='fire'){ _gstF('default',open); GM.type='fire'; try{ localStorage.setItem('atlas-maptype','fire'); localStorage.setItem('og-fire','1'); }catch(_){} gmSheetSync(); drawMarkers(); }
    else{ try{ localStorage.removeItem('og-fire'); }catch(_){} _gstF(t,open); } vF(); };
  const _gnF=gmNote; gmNote=function(){ _gnF(); const n=document.getElementById('gmNote'); if(n&&GM.type==='fire') n.textContent='Fire maps: '+towns.join(', ')+'. Each town as its first Sanborn fire insurance map drew it, building by building. Pick a town to go there, then zoom in to read the names.'; vF(); };
  document.getElementById('gmTypes').insertAdjacentHTML('beforeend','<button data-mt="fire" aria-pressed="false"><i class="mt-fire"></i><span>Fire maps</span></button>');
  { const h=document.querySelector('#gmTypes button[data-wm]'); if(h) h.parentNode.appendChild(h); }
  OGE.on('draw',()=>vF());
  let saved=null; try{ saved=localStorage.getItem('og-fire'); }catch(_){}
  if(saved==='1' && GM.type==='default') gmSetType('fire'); else vF(); gmSheetSync(); }
