# Documentación: Panel del Usuario (Carpeta `components/user/tabs/`)

Aquí se detallan las funciones de las pantallas que utiliza el consumidor final (el usuario que compra los boletos).

## 1. Archivo: `userEvents.js`
Controla la "Cartelera", es decir, la pantalla donde los usuarios buscan qué eventos hay disponibles.

*   `loadEvents()`: 
    Pide al backend la lista de eventos activos disponibles.
*   `filteredEvents` (Propiedad Computada): 
    Permite filtrar los eventos. Se divide en dos grupos principales gracias a la variable `viewMode`:
    1. Eventos Próximos (donde se puede comprar).
    2. Eventos Finalizados (donde se pueden ver estadísticas y resultados pasados).
*   `initMap()` dentro de `EventCard`: 
    Toma la latitud y longitud del evento y dibuja un pequeño mapa interactivo en la tarjeta del evento usando la librería `Leaflet.js`. Esto requiere un poco de "tiempo de espera" en código (`this.$nextTick`) para que el recuadro gris exista antes de dibujar el mapa.
*   `isFinalized(event)`: 
    Calcula matemáticamente si la fecha del evento ya pasó con respecto a "Hoy". Si ya pasó, oculta el botón de reservar y muestra el botón de ver resultados.

---

## 2. Archivo: `userTickets.js`
Controla la sección de "Mis Entradas", es decir, la billetera digital donde el usuario revisa el estatus de sus compras.

*   `loadTickets()`: 
    Contacta al backend pidiendo "Mis Reservas" (`api.get('/my-reservations')`) usando el Token del usuario.
*   `filteredTickets` (Propiedad Computada): 
    Permite buscar entre los boletos ya comprados por si el usuario tiene muchos.
*   `statusClasses` (Objeto Diccionario): 
    No es un método como tal, pero define qué color de TailwindCSS debe tener cada entrada dependiendo del backend:
    *   Pendiente = Naranja
    *   Aprobada = Verde
    *   Rechazada = Rojo
    *   Cancelada = Rojo Oscuro
*   `printTicket(ticket)`: 
    Activa un comando nativo del navegador (`window.print()`) que permite al usuario guardar su boleto como PDF o mandarlo directo a una impresora. Solo aparece si el boleto está en estado "Aprobado".
