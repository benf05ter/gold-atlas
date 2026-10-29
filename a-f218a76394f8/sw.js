// Old Ground offline cache. The build stamps VERSION; a new VERSION makes phones fetch the new atlas in the background.
const VERSION='5550dea06719', CACHE='atlas-v'+VERSION;
const CORE=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png','og-data.js'];
// the old maps come as tiles (ot/), saved as you look at them; the whole-sheet pictures are only a fallback and are no longer saved on install
const EXTRA=['og/mag.webp','og/prosp.png'].concat(["sat/0_00_0_0.webp", "sat/0_01_0_0.webp", "sat/0_10_0_0.webp", "sat/0_11_0_0.webp", "sat/1_00_0_0.webp", "sat/1_00_0_1.webp", "sat/1_00_0_2.webp", "sat/1_00_0_3.webp", "sat/1_00_1_0.webp", "sat/1_00_1_1.webp", "sat/1_00_1_2.webp", "sat/1_00_1_3.webp", "sat/1_00_2_0.webp", "sat/1_00_2_1.webp", "sat/1_00_2_2.webp", "sat/1_00_2_3.webp", "sat/1_00_3_0.webp", "sat/1_00_3_1.webp", "sat/1_00_3_2.webp", "sat/1_00_3_3.webp", "sat/1_01_0_0.webp", "sat/1_01_0_1.webp", "sat/1_01_0_2.webp", "sat/1_01_0_3.webp", "sat/1_01_1_0.webp", "sat/1_01_1_1.webp", "sat/1_01_1_2.webp", "sat/1_01_1_3.webp", "sat/1_01_2_0.webp", "sat/1_01_2_1.webp", "sat/1_01_2_2.webp", "sat/1_01_2_3.webp", "sat/1_01_3_0.webp", "sat/1_01_3_1.webp", "sat/1_01_3_2.webp", "sat/1_01_3_3.webp", "sat/1_10_0_0.webp", "sat/1_10_0_1.webp", "sat/1_10_0_2.webp", "sat/1_10_0_3.webp", "sat/1_10_1_0.webp", "sat/1_10_1_1.webp", "sat/1_10_1_2.webp", "sat/1_10_1_3.webp", "sat/1_10_2_0.webp", "sat/1_10_2_1.webp", "sat/1_10_2_2.webp", "sat/1_10_2_3.webp", "sat/1_10_3_0.webp", "sat/1_10_3_1.webp", "sat/1_10_3_2.webp", "sat/1_10_3_3.webp", "sat/1_11_0_0.webp", "sat/1_11_0_1.webp", "sat/1_11_0_2.webp", "sat/1_11_0_3.webp", "sat/1_11_1_0.webp", "sat/1_11_1_1.webp", "sat/1_11_1_2.webp", "sat/1_11_1_3.webp", "sat/1_11_2_0.webp", "sat/1_11_2_1.webp", "sat/1_11_2_2.webp", "sat/1_11_2_3.webp", "sat/1_11_3_0.webp", "sat/1_11_3_1.webp", "sat/1_11_3_2.webp", "sat/1_11_3_3.webp", "pk/parks.json", "ot/index.json"]);
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(async c=>{
  await c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})));
  await Promise.all(EXTRA.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>{}))); })); });
self.addEventListener('activate',e=>{ e.waitUntil((async()=>{
  for(const k of await caches.keys()) if(k.startsWith('atlas-v')&&k!==CACHE) await caches.delete(k);
  await self.clients.claim(); })()); });
self.addEventListener('message',e=>{ if(e.data==='skip') self.skipWaiting(); });
self.addEventListener('fetch',e=>{ const r=e.request; if(r.method!=='GET') return; const u=new URL(r.url);
  if(u.origin===location.origin){ e.respondWith((async()=>{ const c=await caches.open(CACHE);
    const hit=(await c.match(r,{ignoreSearch:true}))||(r.mode==='navigate'?await c.match('index.html'):null); if(hit) return hit;
    try{ const res=await fetch(r); if(res.ok) c.put(r,res.clone()); return res; }catch(_){ return (await caches.match(r,{ignoreSearch:true}))||Response.error(); } })()); return; }
  // map tiles (USGS imagery and relief, Esri streets): saved areas and earlier views first, then the network
  // A cache that fails (storage full on iPhone) never blocks the map: fall back to the network. Tiles are fetched with CORS so a
  // failed tile is never saved as a blank and Safari doesn't count each one as a 7 MB opaque entry; no-CORS only if CORS is refused.
  if(u.hostname==='basemap.nationalmap.gov'||u.hostname==='server.arcgisonline.com'){ e.respondWith((async()=>{ let c=null;
    // older saves are opaque (no way to tell a blank from a tile): with signal those are fetched again and replaced
    let hit=null; try{ c=await caches.open('atlas-sat'); hit=await c.match(r.url); if(hit&&(hit.type!=='opaque'||!navigator.onLine)) return hit; }catch(_){ c=null; }
    let res=null; try{ res=await fetch(r.url,{mode:'cors',credentials:'omit'}); }catch(_){ res=null; }
    if(!res||!res.ok){ try{ const o=await fetch(r); if(o.type==='opaque'||o.ok||!res) res=o; }catch(_){} }
    if(!res||(!res.ok&&res.type!=='opaque')) return hit||res||Response.error();
    if(c&&res.ok) c.put(r.url,res.clone()).catch(()=>{});
    return res; })()); return; }
  if(/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){ e.respondWith((async()=>{ const c=await caches.open('atlas-fonts'); const hit=await c.match(r);
    const net=fetch(r).then(res=>{ if(res.ok||res.type==='opaque') c.put(r,res.clone()); return res; }).catch(()=>hit||Response.error());
    return hit||net; })()); } });
