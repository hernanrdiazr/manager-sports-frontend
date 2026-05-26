# Documentación: Panel del Administrador (Carpeta `components/admin/tabs/`)

Aquí se detallan las funciones que controlan las distintas pantallas que ve el Administrador del sistema.

## 1. Archivo: `adminManageEvents.js`
Controla la lista donde el Administrador ve todos los eventos y puede editarlos o eliminarlos.

*   `loadEvents()`: 
    Pide al backend la lista completa de eventos y la guarda en la variable local `this.events`. También gestiona el estado de "Cargando..." para mostrar una animación.
*   `filteredEvents` (Propiedad Computada): 
    Se actualiza automáticamente cada vez que el Administrador escribe en la barra de búsqueda o cambia el filtro de deportes. Retorna solo los eventos que coincidan.
*   `statusClass(status)` y `sportEmoji(sport)`: 
    Son métodos decorativos. `statusClass` le asigna colores bonitos a las etiquetas (Verde para Activo, Rojo para Cancelado). `sportEmoji` pone un icono de 🏀 o ⚽ según el deporte.
*   `toggleStatus(event)`: 
    Cambia el estado de un evento (de Activo a Pausado o viceversa) enviando la orden al backend con `api.put`.
*   `deleteEvent(event)`: 
    Levanta la ventana de advertencia (SweetAlert). Si el Admin confirma, envía una orden de eliminación `api.delete`. Tras el éxito, cambia el estado visual a "Cancelado" de inmediato en la pantalla sin recargar.

---

## 2. Archivo: `adminCreateEvents.js`
Controla el formulario masivo para publicar un nuevo evento deportivo con todas sus reglas.

*   `generateTeams()`: 
    Este método es el motor del formulario de equipos. Dependiendo de si es un deporte individual o de equipos, crea dinámicamente las cajas de texto para que el Admin escriba el nombre de los jugadores (ej. Equipo A con 5 jugadores, Equipo B con 5 jugadores).
*   `searchLocation()`: 
    Toma lo que el Admin escribió en la dirección, usa el servicio de mapas (Leaflet y OpenStreetMap) para buscar las coordenadas (Latitud y Longitud) y mueve el PIN en el mapa visual.
*   `onTeamSelect(team, index)`: 
    Si el Admin decide usar un "Equipo Registrado" en lugar de escribir uno nuevo, este método busca el ID del equipo en la base de datos y autorellena a sus jugadores en pantalla.
*   `saveEvent()`: 
    Es el método más importante. Ejecuta todas las validaciones (revisa que los precios no sean negativos, que las fechas no sean en el pasado, que todos tengan nombre). Si todo está perfecto, empaqueta todos los datos en un solo bloque JSON y los envía al backend usando `api.post('/events')`.

---

## 3. Archivo: `adminReservations.js`
Controla la taquilla donde el Administrador aprueba o rechaza los pagos.

*   `loadReservations()`: 
    Trae del backend todas las reservas en estado "Pendiente" que requieren revisión.
*   `approveReservation(res)`: 
    Marca la reserva como aprobada (`api.patch('/admin/reservations/.../approve')`), dándole luz verde al ticket del usuario.
*   `rejectReservation(res)`: 
    Declina el comprobante de pago si la transferencia fue fraudulenta o inválida.
*   `viewReceipt(res)`: 
    Levanta un modal visual mostrando el número de referencia de pago para que el Admin pueda ir a su banco y verificar si el dinero realmente llegó.
