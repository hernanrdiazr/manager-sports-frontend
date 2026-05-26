# Documentación: Vistas Globales y Autenticación (Carpeta `views/global/`)

Aquí se explican las pantallas principales que no dependen de ser Administrador o Usuario, sino que son transversales al sistema.

## 1. Archivo: `eventDetails.js`
Es la ventana o "Modal" gigante que se abre cuando alguien hace clic en "Ver Detalles" de un evento. Es el archivo visual más complejo.

### Métodos Principales:
*   `loadEventData()`: 
    Busca los detalles profundos del evento (qué equipos juegan, quiénes son los jugadores, el marcador actual).
*   `initMap()`: 
    Al igual que en las tarjetas de eventos, dibuja un mapa interactivo con la ubicación exacta del estadio o recinto usando `Leaflet.js`.
*   `confirmReservation()`: 
    Este es el método central de las compras. 
    1. Abre una ventana pidiendo cuántas entradas quieres y el número de transferencia bancaria.
    2. Ejecuta validaciones estrictas: Revisa que solo escribas números, que no pidas más entradas de las disponibles, y que pidas al menos 1 entrada.
    3. Si todo está bien, envía la compra al backend usando `api.post('/reserve')`.
*   Propiedades Computadas como `localTeam` y `visitorTeam`: 
    Se encargan de separar matemáticamente al equipo 1 del equipo 2 para poder pintarlos frente a frente en la pantalla ("Lakers vs Celtics").

---

## 2. Archivos: `auth/login.js` y `auth/register.js`
Controlan las pantallas iniciales donde la gente crea su cuenta o ingresa al sistema.

### Métodos Principales en `login.js`:
*   `handleLogin()`: 
    Toma el correo y la contraseña que escribió el usuario. Activa la animación de "Cargando..." para que el botón gire, y se comunica con `authService.login()`. Si la contraseña es incorrecta, usa SweetAlert para mostrar un error en rojo. Si es correcta, redirige al Dashboard (de Administrador o de Usuario según el rol).

### Métodos Principales en `register.js`:
*   `handleRegister()`: 
    Toma los datos del formulario (Nombre, Email, Contraseña). Valida que las contraseñas coincidan y que el correo sea válido. Si todo está correcto, crea la cuenta en el backend usando `api.post('/register')` y luego inicia sesión automáticamente.
