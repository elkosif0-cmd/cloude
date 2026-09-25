/* S.kosif — locked PWA service worker. build.py names CACHE after the build contents. */
const CACHE='skosif-build';
const CORE=['./','./index.html','./app-safe.html','./art/sheep.webp','./art/landscape.webp','./art/hero.webp','./apple-touch-icon.png','./icon-192.png','./icon-512.png','./manifest.webmanifest'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;if(r.mode==='navigate'){e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put('./index.html',c));return res}).catch(()=>caches.match('./index.html')));return;}e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok&&r.url.startsWith(self.location.origin)){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c));}return res}).catch(()=>hit)))});
self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting()});
