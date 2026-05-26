# Documentación del Frontend - Olympia Manager Sports

Este archivo contiene la documentación exhaustiva de todos los archivos y carpetas que conforman el frontend del sistema Olympia Manager Sports.

El proyecto está diseñado bajo una arquitectura de micro-frontend utilizando **Vue 3** (Composition/Options API a través de CDN) y **TailwindCSS** para el diseño fluido y reactivo. No utiliza empaquetadores como Webpack o Vite, manteniendo el proyecto simple de desplegar y editar.

---

## 📂 Archivos Raíz

*   **`index.html`**
    Punto de entrada de la aplicación. Importa todas las librerías necesarias (Vue, TailwindCSS, Leaflet para mapas, SweetAlert2 para modales). Define el montaje principal `<div id="app">` y delega el control de rutas (Login, Admin, User) dependiendo del estado de autenticación.
*   **`app.js`**
    Maneja el estado global de la aplicación.
*   **`readme.txt`**
    Archivo de documentación principal (este archivo).

---

## 📂 Carpeta `services/`
Contiene la lógica de comunicación con el Backend (escrito en Go) y la gestión de autenticación.

*   **`api.js`**
    Una envoltura (wrapper) construida sobre `fetch`. Centraliza todas las peticiones HTTP (`GET`, `POST`, `PUT`, `DELETE`), y de manera automática intercepta e inyecta el **Token JWT** en las cabeceras (`Authorization: Bearer <token>`) para rutas protegidas.
*   **`authService.js`**
    Se encarga de guardar, leer y borrar el token de autenticación del `localStorage`, verificando roles y permisos del usuario actual.

---

## 📂 Carpeta `components/`
Contiene los módulos inyectables que forman las piezas clave del sistema interactivo. Está dividida por el tipo de actor (Admin / User).

### `components/admin/tabs/` (Panel de Administrador)
*   **`adminDashboard.js`**
    Vista general del administrador. Muestra métricas clave y resúmenes estadísticos (tickets vendidos, ingresos, eventos activos).
*   **`adminCreateEvents.js`**
    Poderoso formulario *Bulk Insert* guiado por pasos numéricos. Permite registrar simultáneamente toda la estructura de un evento: Configuración general, Equipos participantes, Jugadores detallados, Cupos, y Geolocalización en mapa interactivo. Posee validaciones exhaustivas (nombres de jugadores, fechas mayores a 7 días, cruce lógicos de horas).
*   **`adminManageEvents.js`**
    Listado interactivo de eventos usando un diseño de "Tarjetas" modernas. Permite al administrador pausar/reanudar eventos y **cancelarlos (Soft-Delete)**, reflejando el cambio de estado de manera inmediata sin recargar. Además, permite abrir inline el panel de gestión de estadísticas y alineaciones en vivo (`adminEventDetail.js`).
*   **`adminReservations.js`**
    Panel de gestión de taquilla. El administrador puede revisar los comprobantes de pago de los usuarios, filtrar por evento/deporte y dictaminar si "Aprueba" o "Rechaza" la reserva de entradas.

### `components/admin/event/` (Gestión en Vivo y Configuración)
*   **`adminEventDetail.js`**
    Panel de gestión en vivo. Permite al administrador configurar alineaciones iniciales, actualizar marcadores y registrar eventos de juego en vivo (goles, faltas, asistencias) para cada participante.
*   **`eventSportConfig.js`**
    Define las métricas y posiciones válidas por deporte (Fútbol, Béisbol, Básquetbol) para estructurar correctamente las estadísticas enviadas a la API del backend.
*   **`eventLocationPicker.js` / `eventValidators.js` / `mockEventsData.js`**
    Componentes y librerías auxiliares para selección de ubicaciones de mapas, validaciones de alineaciones y datos de prueba locales.

### `components/user/tabs/` (Panel de Usuario)
*   **`userEvents.js`**
    Catálogo interactivo donde el usuario ve la oferta de eventos. Diferencia visualmente entre eventos "Próximos" (disponibles para compra) y "Finalizados". Incluye mapas de `Leaflet.js` para mostrar el estadio.
*   **`userTickets.js`**
    La billetera digital del usuario ("Mis Entradas"). Muestra las compras realizadas con etiquetas visuales según el estado que dictamine el administrador (`Aprobado` en Verde, `Pendiente` en Naranja, `Cancelada` en Rojo). Si es cancelada, el boleto recibe un sello dinámico rojo de "EVENTO CANCELADO".

### Otros Componentes Globales
*   **`navbar.js` y `footer.js`**
    Layout genérico de navegación y pie de página.
*   **`eventDetailsModal.js`** / **`pageLoader.js`** / **`pageTransition.js`**
    Componentes auxiliares para mejorar el UX, manejar transiciones suaves y estados de carga globales.

---

## 📂 Carpeta `views/`
Contiene los Layouts principales de "Página Completa" que envuelven a los componentes.

### `views/global/` (Vistas Públicas)
*   **`home.js`**
    Página de aterrizaje pública comercial (Landing Page).
*   **`eventDetails.js`**
    El archivo más complejo de la vista pública. Muestra la radiografía de un evento seleccionado.
    *   Carga dinámicamente el *Roster/Alineaciones* dividiendo a jugadores entre Locales y Visitantes.
    *   Muestra de manera condicional métricas de fútbol, béisbol o baloncesto.
    *   Levanta un modal (SweetAlert2) para procesar reservas, validando la referencia bancaria y asegurando que no se exceda el tope de tickets.
*   **`auth/login.js` y `auth/register.js`**
    Formularios de autenticación para interactuar con los endpoints del backend, manejando notificaciones de errores (credenciales inválidas, etc.).

### `views/admin/` y `views/user/`
*   **`admin.js`**
    Envoltura del panel del Administrador. Renderiza de forma condicional (usando un componente dinámico `<component :is="...">`) las diferentes pestañas (`tabs`) del administrador (Dash, Manage, Create, Reservations) sin recargar la página.
*   **`user.js`**
    Envoltura del panel del Usuario, funcionando con la misma filosofía SPA (Single Page Application) para renderizar su catálogo o sus boletos de forma rápida.

---

## 🔧 Scripts de Ejecución
Para arrancar un servidor HTTP local estático y evitar errores de CORS con módulos ES6:
*   En Windows: Ejecutar `mongoose.exe`
*   En Linux: `chmod 0755 $HOME/mongoose_linux` y `$HOME/mongoose_linux -d ./`

---

## 🧪 Pruebas Unitarias
Dado que el frontend está diseñado e implementado como una SPA estática pura, basada en la importación de módulos nativos ES6 y librerías directamente desde CDN (sin empaquetadores como Webpack/Vite ni dependencias de Node.js/NPM), **no se han desarrollado suites de pruebas unitarias automatizadas en esta capa**. 

Las verificaciones del comportamiento se realizan mediante pruebas de integración directas ejecutando la aplicación localmente en el navegador a través de `mongoose.exe` y validando la comunicación directa con los endpoints de la API del backend.
