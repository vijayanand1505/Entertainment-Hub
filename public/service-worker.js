// Keep this URL available for browsers controlled by the old cache-first worker.
// New app versions do not register a worker. This replacement retires the old
// registration and reloads its tabs once, preserving browser-local user data.
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter(
            (name) => name.startsWith("workbox-precache-") || name === "images",
          )
          .map((name) => caches.delete(name)),
      );
      const tabs = await self.clients.matchAll({ type: "window" });
      await self.registration.unregister();
      await Promise.all(
        tabs.map((tab) => tab.navigate(tab.url).catch(() => {})),
      );
    })(),
  );
});
