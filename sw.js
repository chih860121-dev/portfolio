const C='pf-v3';
const ASSETS=['./','./index.html','./icon.png','./manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  // 報價請求一律走網路、不快取
  if(/yahoo|corsproxy|allorigins|twse\.com\.tw|taifex|workers\.dev/.test(u.hostname)) return;
  // App 本體（HTML / 導覽）走「網路優先」，這樣每次上線都拿到最新版；離線才用快取
  const isHTML = e.request.mode==='navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('index.html');
  if(isHTML){
    e.respondWith(
      fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp)).catch(()=>{});return r;})
        .catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html')))
    );
    return;
  }
  // 其他靜態檔（icon 等）快取優先
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
    const cp=resp.clone(); caches.open(C).then(c=>c.put(e.request,cp)).catch(()=>{}); return resp;
  })));
});
