// sw.js - Service Worker para inyectar cabeceras COOP y COEP requeridas por SQLite WASM OPFS
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Si la petición es a un origen externo (como un CDN, Google Fonts, mapas, etc.),
  // no la interceptamos. Dejamos que el navegador la maneje de forma nativa con sus cabeceras CORS.
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  // Interceptar solo peticiones del mismo origen para inyectar cabeceras de aislamiento (COOP/COEP)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // No modificar respuestas opacas
        if (response.status === 0) {
          return response;
        }

        const newHeaders = new Headers(response.headers);
        newHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
        newHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');

        // Asegurar que archivos WASM y JS locales tengan el tipo MIME correcto
        const urlPath = requestUrl.pathname;
        if (urlPath.endsWith('.wasm')) {
          newHeaders.set('content-type', 'application/wasm');
        } else if (urlPath.endsWith('.js') || urlPath.endsWith('.mjs')) {
          newHeaders.set('content-type', 'text/javascript');
        }

        return response.blob().then((blob) => {
          return new Response(blob, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
          });
        });
      })
      .catch((err) => {
        // Fallback en caso de error de red
        return fetch(event.request);
      })
  );
});
