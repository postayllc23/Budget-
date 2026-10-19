// Офлайн-режим: приложение открывается и без интернета.
// Сначала берём свежую версию из сети, а если сети нет — сохранённую копию.
const CACHE="pb-app-v1";
const CORE=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./apple-touch-icon.png"];
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>{}));});
self.addEventListener("activate",e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==CACHE)await caches.delete(k);await self.clients.claim();})()));
self.addEventListener("fetch",e=>{
  const req=e.request,url=new URL(req.url);
  if(req.method!=="GET"||url.origin!==location.origin)return;          // ИИ, биржа, ЦБ — всегда напрямую
  const nav=req.mode==="navigate";
  e.respondWith((async()=>{
    try{const res=await fetch(req,{cache:"no-store"});
      if(res.ok&&!url.search){const c=await caches.open(CACHE);await c.put(nav?"./index.html":req,res.clone());}
      if(res.ok&&nav){const c=await caches.open(CACHE);await c.put("./index.html",res.clone());}
      return res;}
    catch{const c=await caches.open(CACHE);return (await c.match(nav?"./index.html":req,{ignoreSearch:true}))||(await c.match("./index.html"))||Response.error();}
  })());
});
