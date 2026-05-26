# Documentación: Servicios y Conexión (Carpeta `services/`)

Esta sección explica los métodos utilizados para comunicarse con el servidor y gestionar la sesión del usuario. Están pensados para ser reutilizados en cualquier parte del código.

## 1. Archivo: `api.js`
Este archivo actúa como un intermediario (wrapper) entre nuestro Frontend y el Backend (Go). Se encarga de inyectar automáticamente el "Token" de seguridad para que no tengamos que hacerlo manualmente cada vez.

### Métodos Principales:
*   `getHeaders()`:
    *   **¿Qué hace?**: Busca en la memoria del navegador (`localStorage`) si el usuario tiene un Token de sesión guardado. Si lo tiene, lo prepara en formato `Bearer <token>` para adjuntarlo a las peticiones seguras.
*   `api.get(endpoint)`:
    *   **¿Qué hace?**: Solicita datos al servidor (por ejemplo, obtener la lista de eventos).
    *   **Uso común**: `const eventos = await api.get('/events');`
*   `api.post(endpoint, data)`:
    *   **¿Qué hace?**: Envía información nueva al servidor (por ejemplo, hacer una reserva o crear un evento).
    *   **Uso común**: `await api.post('/reserve', { event_id: 1, ticket_count: 2 });`
*   `api.put(endpoint, data)`:
    *   **¿Qué hace?**: Actualiza información existente en el servidor (por ejemplo, cambiar el estado de un evento de activo a pausado).
*   `api.delete(endpoint)`:
    *   **¿Qué hace?**: Borra un registro o, en nuestro caso, aplica el "Borrado Lógico" (Soft Delete) cambiando el estado a "cancelado".

---

## 2. Archivo: `authService.js`
Este archivo maneja exclusivamente todo lo relacionado con el inicio de sesión, registro y permisos del usuario.

### Métodos Principales:
*   `login(email, password)`:
    *   **¿Qué hace?**: Envía las credenciales al backend. Si son correctas, el backend devuelve un Token. Este método guarda ese Token en el navegador para mantener la sesión abierta.
*   `register(name, email, password)`:
    *   **¿Qué hace?**: Envía los datos para crear un nuevo usuario en la base de datos.
*   `logout()`:
    *   **¿Qué hace?**: Borra el Token de la memoria del navegador (`localStorage.removeItem('token')`) y redirige al usuario a la página principal. Esto "cierra la sesión".
*   `getToken()`:
    *   **¿Qué hace?**: Recupera el Token guardado. Útil para verificar si alguien está conectado.
*   `getUserData()`:
    *   **¿Qué hace?**: Extrae la información básica (como el rol de Administrador o Usuario) directamente del Token (que está encriptado en formato JWT) sin necesidad de preguntar de nuevo al backend.
*   `isAuthenticated()` y `isAdmin()`:
    *   **¿Qué hace?**: Métodos rápidos que devuelven `true` o `false` para saber si hay alguien logueado o si ese alguien es el Administrador. Se usan mucho para ocultar o mostrar botones en la interfaz.
