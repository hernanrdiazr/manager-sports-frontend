# Estructura del Proyecto - Olympia Manager Sports

Este documento describe la estructura general de carpetas y archivos clave de la aplicación.

---

## 📂 Archivos Raíz

*   **`index.html`**
    Punto de entrada de la aplicación. Carga todas las librerías necesarias (Vue, TailwindCSS, Leaflet para mapas, SweetAlert2) y registra el Service Worker (`sw.js`).
*   **`app.js`**
    Configura y monta la aplicación principal Vue 3, definiendo el enrutamiento SPA y manejando el estado global de carga.
*   **`sw.js`**
    Service Worker que intercepta todas las peticiones HTTP locales y les añade las cabeceras `COOP` (Cross-Origin-Opener-Policy) y `COEP` (Cross-Origin-Embedder-Policy), esenciales para habilitar SQLite WASM y el almacenamiento persistente OPFS.
*   **`tests.html`**
    Suite de pruebas unitarias ejecutables en el navegador para validar la lógica y validaciones de la interfaz.

---

## 📂 Directorios Principales

### 📁 `services/`
Contiene la capa lógica de base de datos local y servicios comunes de la aplicación.
*   **`api.js`**: Enrutador interno local que intercepta peticiones HTTP ficticias y las delega directamente a los repositorios de SQLite WASM.
*   **`authService.js`**: Wrapper de autenticación que interactúa con la sesión local.
*   **`db/`**: Directorio de base de datos SQLite:
    *   **`database.js`**: Conector principal que abre la base de datos persistente en OPFS.
    *   **`schema.js`**: Definición SQL de las 16 tablas del esquema de base de datos.
    *   **`seed.js`**: Script de inserción de datos semilla.
    *   **`sqlite3/`**: Archivos oficiales compilados de SQLite WASM y Web Worker.

### 📁 `components/`
Módulos interactivos y componentes del panel.
*   **`admin/`**: Pestañas de administración (`adminDashboard.js`, `adminCreateEvents.js`, `adminManageEvents.js`, `adminReservations.js`, `adminEventDetail.js`).
*   **`user/`**: Pestañas de usuario (`userEvents.js`, `userTickets.js`).
*   **`navbar.js` y `footer.js`**: Componentes globales de navegación y pie de página.

### 📁 `views/`
Vistas completas de la SPA que envuelven los componentes.
*   **`global/`**: Vistas públicas como `home.js` (landing page), `eventDetails.js` (detalle del evento y compra de entradas), y formularios de autenticación.
*   **`admin/` y `user/`**: Envolturas de panel `admin.js` y `user.js` que renderizan dinámicamente las pestañas.

---

## 📁 `docs/`
Carpeta que centraliza toda la documentación técnica detallada del proyecto:
*   [api_services.md](file:///c:/Users/HP/Desktop/manager-sports-frontend/docs/api_services.md): Servicios y conexión.
*   [admin_components.md](file:///c:/Users/HP/Desktop/manager-sports-frontend/docs/admin_components.md): Panel del administrador.
*   [user_components.md](file:///c:/Users/HP/Desktop/manager-sports-frontend/docs/user_components.md): Panel del usuario.
*   [global_views.md](file:///c:/Users/HP/Desktop/manager-sports-frontend/docs/global_views.md): Vistas globales públicas.
*   [project_structure.md](file:///c:/Users/HP/Desktop/manager-sports-frontend/docs/project_structure.md): Estructura del proyecto (este archivo).
