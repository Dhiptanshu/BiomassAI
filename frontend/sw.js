const CACHE_NAME = "biomass-pwa-v2";
const ASSETS = [
    "/",
    "/static/styles.css",
    "/static/script.js",
    "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap"
];

self.addEventListener("install", (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
    self.skipWaiting(); // Force activation
});

self.addEventListener("activate", (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Take control immediately
});

self.addEventListener("fetch", (e) => {
    e.respondWith(
        fetch(e.request)
            .then((res) => {
                // Return network response and cache it
                const resClone = res.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(e.request, resClone);
                });
                return res;
            })
            .catch(() => caches.match(e.request)) // Fallback to cache if network fails
    );
});
