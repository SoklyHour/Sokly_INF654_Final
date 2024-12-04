// Cache name
const CACHE_NAME = 'micro-tracker-cache-v2';

// Files to cache
const URLS_TO_CACHE = [
    './',
    './index.html',
    "./auth.html",
    './css/style.css',
    './js/ui.js', 
    './js/firebaseDB.js',
    './img/icons/mylogo.png',
    './img/nutritionsummarypicture.jpeg',
    'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js',
    './offline.html' // Offline fallback page
];

self.addEventListener("install", (event) => {
    console.log("Service worker: Installing...");
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Service worker: Caching files");
            return cache.addAll(URLS_TO_CACHE);
        })
    );
});

self.addEventListener("activate", (event) => {
    console.log("Service Worker: Activating...");
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log("Service Worker: Deleting old cache");
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fetch event with offline fallback
self.addEventListener("fetch", (event) => {
    event.respondWith(
        (async function () {
            // Only cache GET requests
            if (event.request.method !== "GET") {
                return fetch(event.request);
            }

            const cachedResponse = await caches.match(event.request);

            if (cachedResponse) {
                return cachedResponse;
            }

            try {
                const networkResponse = await fetch(event.request);
                const cache = await caches.open(CACHE_NAME);
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
            } catch (error) {
                console.error("Fetch failed, returning offline page:", error);
                // Return the offline fallback page if the network request fails
                return caches.match('./offline.html');
            }
        })()
    );
});
