// Old Ground offline cache. The build stamps VERSION; a new VERSION makes phones fetch the new atlas in the background.
const VERSION='e55cc39701bf', CACHE='atlas-v'+VERSION;
const CORE=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
const EXTRA=['oldmap/ground-today.webp','oldmap/topo-1972.webp','oldmap/topo-1936.webp'].concat([]);
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
  if(u.hostname==='basemap.nationalmap.gov'||u.hostname==='server.arcgisonline.com'){ e.respondWith((async()=>{ const c=await caches.open('atlas-sat'); const hit=await caches.match(r); if(hit) return hit;
    try{ const res=await fetch(r); if(res.ok||res.type==='opaque') c.put(r,res.clone()); return res; }catch(_){ return Response.error(); } })()); return; }
  if(/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){ e.respondWith((async()=>{ const c=await caches.open('atlas-fonts'); const hit=await c.match(r);
    const net=fetch(r).then(res=>{ if(res.ok||res.type==='opaque') c.put(r,res.clone()); return res; }).catch(()=>hit||Response.error());
    return hit||net; })()); } });
