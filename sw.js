const C='pf-v2';
const ASSETS=['./','./index.html','./icon.png','./manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  // 報價請求一律走網路，不快取
  if(u.hostname.includes('yahoo')||u.hostname.includes('corsproxy')||u.hostname.includes('allorigins')) return;
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
    const cp=resp.clone(); caches.open(C).then(c=>c.put(e.request,cp)).catch(()=>{}); return resp;
  }).catch(()=>caches.match('./index.html'))));
});
