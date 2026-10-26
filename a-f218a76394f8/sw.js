// Gold Atlas offline cache. The build stamps VERSION; a new VERSION makes phones fetch the new atlas in the background.
const VERSION='9ed7455b2883', CACHE='atlas-v'+VERSION;
const CORE=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
const EXTRA=['oldmap/ground-today.webp','oldmap/topo-1972.webp','oldmap/topo-1936.webp'].concat(["sat/0_00_0_0.webp", "sat/0_01_0_0.webp", "sat/0_10_0_0.webp", "sat/0_11_0_0.webp", "sat/1_00_0_0.webp", "sat/1_00_0_1.webp", "sat/1_00_0_2.webp", "sat/1_00_0_3.webp", "sat/1_00_1_0.webp", "sat/1_00_1_1.webp", "sat/1_00_1_2.webp", "sat/1_00_1_3.webp", "sat/1_00_2_0.webp", "sat/1_00_2_1.webp", "sat/1_00_2_2.webp", "sat/1_00_2_3.webp", "sat/1_00_3_0.webp", "sat/1_00_3_1.webp", "sat/1_00_3_2.webp", "sat/1_00_3_3.webp", "sat/1_01_0_0.webp", "sat/1_01_0_1.webp", "sat/1_01_0_2.webp", "sat/1_01_0_3.webp", "sat/1_01_1_0.webp", "sat/1_01_1_1.webp", "sat/1_01_1_2.webp", "sat/1_01_1_3.webp", "sat/1_01_2_0.webp", "sat/1_01_2_1.webp", "sat/1_01_2_2.webp", "sat/1_01_2_3.webp", "sat/1_01_3_0.webp", "sat/1_01_3_1.webp", "sat/1_01_3_2.webp", "sat/1_01_3_3.webp", "sat/1_10_0_0.webp", "sat/1_10_0_1.webp", "sat/1_10_0_2.webp", "sat/1_10_0_3.webp", "sat/1_10_1_0.webp", "sat/1_10_1_1.webp", "sat/1_10_1_2.webp", "sat/1_10_1_3.webp", "sat/1_10_2_0.webp", "sat/1_10_2_1.webp", "sat/1_10_2_2.webp", "sat/1_10_2_3.webp", "sat/1_10_3_0.webp", "sat/1_10_3_1.webp", "sat/1_10_3_2.webp", "sat/1_10_3_3.webp", "sat/1_11_0_0.webp", "sat/1_11_0_1.webp", "sat/1_11_0_2.webp", "sat/1_11_0_3.webp", "sat/1_11_1_0.webp", "sat/1_11_1_1.webp", "sat/1_11_1_2.webp", "sat/1_11_1_3.webp", "sat/1_11_2_0.webp", "sat/1_11_2_1.webp", "sat/1_11_2_2.webp", "sat/1_11_2_3.webp", "sat/1_11_3_0.webp", "sat/1_11_3_1.webp", "sat/1_11_3_2.webp", "sat/1_11_3_3.webp", "pk/parks.json"]);
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
    try{ const res=await fetch(r); if(res.ok) c.put(r,res.clone()); return res; }catch(_){ return Response.error(); } })()); return; }
  if(u.hostname==='basemap.nationalmap.gov'){ e.respondWith((async()=>{ const c=await caches.open('atlas-sat'); const hit=await c.match(r); if(hit) return hit;
    try{ const res=await fetch(r); if(res.ok||res.type==='opaque') c.put(r,res.clone()); return res; }catch(_){ return Response.error(); } })()); return; }
  if(/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){ e.respondWith((async()=>{ const c=await caches.open('atlas-fonts'); const hit=await c.match(r);
    const net=fetch(r).then(res=>{ if(res.ok||res.type==='opaque') c.put(r,res.clone()); return res; }).catch(()=>hit||Response.error());
    return hit||net; })()); } });
