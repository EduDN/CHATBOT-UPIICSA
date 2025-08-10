const CACHE_VERSION = "v1";
const MODELS_VERSION = "v1";

const STATIC_CACHE = `upiichat-static-${CACHE_VERSION}`;
const MODELS_CACHE = `upiichat-models-${MODELS_VERSION}`;

self.addEventListener("install", () => {
  // No pre-caching! Keep it simple
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    // Clean up old caches when versions change
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              (cacheName.includes("upiichat-static-") &&
                cacheName !== STATIC_CACHE) ||
              (cacheName.includes("upiichat-models-") &&
                cacheName !== MODELS_CACHE)
            ) {
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip Vite dev server requests
  if (
    url.origin === "http://localhost:5173" &&
    (url.pathname.includes("@vite") ||
      url.pathname.includes("/@fs/") ||
      url.pathname.includes("/node_modules/") ||
      url.search.includes("t="))
  ) {
    return;
  }

  // Skip WebSocket connections
  if (event.request.headers.get("upgrade") === "websocket") {
    return;
  }

  // Simple routing: ML models vs everything else
  if (isMLModelRequest(url)) {
    event.respondWith(staleWhileRevalidate(event.request, MODELS_CACHE));
  } else {
    event.respondWith(staleWhileRevalidate(event.request, STATIC_CACHE));
  }
});

// Check if request is for ML models
function isMLModelRequest(url) {
  return (
    url.hostname.includes("huggingface.co") ||
    url.hostname.includes("@xenova") ||
    url.hostname.includes("cdn.jsdelivr.net") ||
    url.hostname.includes("@xenova/transformers") ||
    url.hostname.includes("vectorizer.joblib") ||
    url.hostname.includes("model.joblib") ||
    (url.hostname.includes("jsdelivr.net") && url.pathname.includes("pyodide"))
  );
}

// Stale While Revalidate for everything
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  // Fetch fresh version in background
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => {
      return cachedResponse;
    });

  // Return cached immediately if available, otherwise wait for network
  return cachedResponse || fetchPromise;
}
