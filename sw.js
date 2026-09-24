/* S.kosif — canonical locked PWA */
const CACHE='skosif-bootstrap';
const CORE=["./","./index.html","./app-safe.html","./mobile.css","./mobile.js","./jev.css","./jev.js","./jev-question.css","./jev-question.js","./inventory.css","./inventory.js","./operations.css","./operations.js","./supply.css","./supply.js","./ux.css","./ux.js","./catalog.css","./catalog.js","./shell.css","./shell.js","./sales-matching.css","./sales-matching.js","./pricing.css","./pricing-core.js","./pricing.js","./session-health.css","./session-health.js","./meat-economics.css","./meat-economics.js","./motion.css","./motion.js","./apple-touch-icon.png","./icon-192.png","./icon-512.png","./manifest.webmanifest"];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;if(r.mode==='navigate'){e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put('./index.html',c));return res}).catch(()=>caches.match('./index.html')));return;}e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok&&r.url.startsWith(self.location.origin)){const c=res.clone();caches.open(CACHE).then(x=>x.put(r,c));}return res}).catch(()=>hit)))});

self.addEventListener('message',e=>{if(e.data&&e.data.type==='SKIP_WAITING')self.skipWaiting()});
