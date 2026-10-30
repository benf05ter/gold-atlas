// ---------- 1938 in 3D (stereo pairs of the 1938 air photos) and summer crop marks (Sentinel-2) on spot cards ----------
// Side files in sv/ (nothing loads until a spot card opens):
// sv/sv.json {st:{id:[photoA, photoB, date, base m, fit r or 0, how lined up]}, cm:{id:[scenes, first date, last date, mark at pin]}}
// sv/st/<f>-w.webp (wiggle, two frames), sv/st/<f>-a.webp (red/cyan), sv/st/<f>-h.webp (1938 surface shape); sv/cm/<f>.webp (satellite | crop marks); f = id with odd characters made '_'
{ let SV=null; const svLoad=()=>SV||(SV=fetch('sv/sv.json',{cache:'force-cache'}).then(r=>r.ok?r.json():{st:{},cm:{}}).catch(()=>({st:{},cm:{}})));
  const svF=id=>encodeURIComponent(id.replace(/[^A-Za-z0-9_.-]/g,'_'));
  const _selSV=select; select=function(id,pan){ const r=_selSV(id,pan), p=BYID[id]; if(!p) return r;
    svLoad().then(D=>{ if(selId!==id) return; const t=document.querySelector('#detail .tags'); if(!t) return;
      const put=(cls,h)=>{ if(!document.querySelector('#detail .'+cls)) t.insertAdjacentHTML('afterend',`<div class="nlbox ${cls}">${h}</div>`); };
      const c=D.cm[id];
      if(c){ const z=c[3], read=z<=-0.8?'A <b>stressed (brown) patch sits on the pin</b>: plants there dry out first, as they do over buried stone, gravel, a foundation or an old roadbed.':z>=0.8?'A <b>lusher (green) patch sits on the pin</b>: plants there stay green longer, as they do over a filled cellar, pit, privy or ditch, or an old manured yard.':'No clear mark right at the pin; look along the ring and nearby.';
        put('svcm',`<b>Summer crop marks from space</b><div class="lid"><img src="sv/cm/${svF(id)}.webp" alt="Satellite view and crop marks around ${esc(p.n)}" loading="lazy" width="480" height="240" style="max-width:100%"><span class="hint">Left: satellite view. Right: where plants were greener (green) or drier (brown) than the ground around them, averaged over ${c[0]} clear summer days (${esc(c[1])} to ${esc(c[2])}). 800 m across, north up, ring = 30 m around the pin, bar = 200 m. Tap to enlarge.</span></div>${read}<br><span class="note">Sentinel-2, 10 m pixels: only marks bigger than a house show, and field edges, roads and buildings show too. Marks inside one field are the ones worth walking.</span>`); }
      const s=D.st[id];
      if(s){ const f=svF(id);
        put('svst',`<b>1938 in 3D</b> (air photos ${esc(s[2])})<div class="lid"><img src="sv/st/${f}-w.webp" alt="1938 air photo around ${esc(p.n)}, rocking between two views" loading="lazy" width="400" height="400" style="max-width:100%"><span class="hint">Two 1938 photos taken about ${(s[3]/1000).toFixed(1)} km apart, flicking back and forth: anything that stood up in 1938 (buildings, trees, mounds, banks) seems to rock against the ground. 400 m across, ring = the pin, arrow = north. Tap to enlarge.</span></div>
<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px"><div class="lid" style="flex:1 1 150px"><img src="sv/st/${f}-a.webp" alt="Red and cyan 3D view, 1938" loading="lazy" width="400" height="400"><span class="hint">Red/cyan 3D: look through red-cyan glasses (red on the left eye). Tap to enlarge.</span></div>
<div class="lid" style="flex:1 1 150px"><img src="sv/st/${f}-h.webp" alt="Shape of the 1938 surface" loading="lazy" width="400" height="400"><span class="hint">Shape of the 1938 surface measured from the two photos, red = higher, blue = lower, trees and buildings included. Tap to enlarge.</span></div></div>
<span class="note">WHAIFinder photos ${esc(s[0])} and ${esc(s[1])}. ${s[4]?`The measured 1938 surface matches today's LiDAR terrain (fit ${s[4].toFixed(2)}). `:''}${s[5]==='lidar'?'Photo lined up by matching its 3D shape to today\'s LiDAR; pin good to about 15 m.':'Photo lined up against modern satellite imagery; pin good to about 15 m.'} Pictures are turned so the flight line runs across.</span>`); }
    });
    return r; };
}
