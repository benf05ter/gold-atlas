// Gold Atlas offline cache. The build stamps VERSION; a new VERSION makes phones fetch the new atlas in the background.
const VERSION='ccb32877af5b', CACHE='atlas-v'+VERSION;
const CORE=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
const EXTRA=['oldmap/ground-today.webp','oldmap/topo-1972.webp','oldmap/topo-1936.webp'].concat(["img/a-0.json", "img/a-1.json", "img/a-10.json", "img/a-2.json", "img/a-3.json", "img/a-4.json", "img/a-5.json", "img/a-6.json", "img/a-7.json", "img/a-8.json", "img/a-9.json", "img/h-0.json", "img/h-1.json", "img/h-10.json", "img/h-11.json", "img/h-12.json", "img/h-13.json", "img/h-2.json", "img/h-3.json", "img/h-4.json", "img/h-5.json", "img/h-6.json", "img/h-7.json", "img/h-8.json", "img/h-9.json", "img/l-0.json", "img/l-1.json", "img/l-2.json"]); // img/*.json: pictures that load when a spot card opens
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
  if(/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)){ e.respondWith((async()=>{ const c=await caches.open('atlas-fonts'); const hit=await c.match(r);
    const net=fetch(r).then(res=>{ if(res.ok||res.type==='opaque') c.put(r,res.clone()); return res; }).catch(()=>hit||Response.error());
    return hit||net; })()); } });
