const CACHE_NAME = "jansori-mate-v2";
const ASSETS = ["./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;
  // API 호출은 캐시하지 않고 항상 네트워크로
  if (url.includes("api.anthropic.com")) return;

  // HTML(문서)은 항상 네트워크에서 최신 버전을 먼저 시도 - 실패 시에만 캐시 사용
  if (event.request.mode === "navigate" || url.endsWith("/") || url.endsWith("index.html")) {
    event.respondWith(
      fetch(event.request, { cache: "no-store" }).catch(() => caches.match(event.request))
    );
    return;
  }

  // 그 외 정적 파일(아이콘 등)은 캐시 우선
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});

