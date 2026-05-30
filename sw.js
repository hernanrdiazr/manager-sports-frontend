// sw.js - Service Worker para inyectar cabeceras COOP y COEP requeridas por SQLite WASM OPFS
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Ignorar peticiones que no sean del mismo origen o esquemas externos si es necesario
  if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
    return;
  }

  // Interceptar la respuesta y añadir las cabeceras de seguridad
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

        // Asegurar que archivos WASM y JS/MJS tengan el tipo MIME correcto
        const urlPath = event.request.url.split('?')[0].split('#')[0];
        if (urlPath.endsWith('.wasm')) {
          newHeaders.set('content-type', 'application/wasm');
        } else if (urlPath.endsWith('.js') || urlPath.endsWith('.mjs')) {
          newHeaders.set('content-type', 'text/javascript');
        }

        // Para evitar problemas con recursos externos (como Leaflet o Tailwind CDN),
        // permitimos Cross-Origin Resource Sharing si no está ya configurado
        if (event.request.url.includes('unpkg.com') || 
            event.request.url.includes('cdn.jsdelivr.net') || 
            event.request.url.includes('fonts.googleapis.com') ||
            event.request.url.includes('cartocdn.com') ||
            event.request.url.includes('openstreetmap.org')) {
          newHeaders.set('Cross-Origin-Resource-Policy', 'cross-origin');
        }

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders
        });
      })
      .catch((err) => {
        // Fallback en caso de error de red
        return fetch(event.request);
      })
  );
});
