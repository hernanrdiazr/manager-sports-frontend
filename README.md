# Instrucciones de Ejecución - Olympia Manager Sports

Este proyecto ha sido actualizado para funcionar de manera completamente autónoma, local y **offline-first**, migrando la lógica del backend Go y la base de datos PostgreSQL a **SQLite WASM** con persistencia en **OPFS (Origin Private File System)** dentro del navegador.

---

## ⚠️ Requisito Obligatorio: Servidor HTTP Local
**No puedes ejecutar la aplicación haciendo doble clic en el archivo `index.html` (`file://`).** Si lo haces, el navegador bloqueará la ejecución por motivos de seguridad.

Es **indispensable** servir el proyecto a través de un servidor HTTP local debido a que:
1. **Service Workers:** El Service Worker (`sw.js`) requiere obligatoriamente un origen seguro (`http://localhost` o `https://`) para poder registrarse.
2. **Políticas de CORS:** Los módulos JavaScript (ES6 Modules) y la carga del binario compilado de base de datos (`sqlite3.wasm`) son bloqueados por políticas de CORS en protocolos `file://`.
3. **Cabeceras de Seguridad:** Para habilitar OPFS y la memoria compartida que usa SQLite WASM, el Service Worker inyecta cabeceras `COOP` y `COEP`, las cuales solo son válidas bajo un servidor HTTP.

---

## 🚀 Cómo Ejecutar el Proyecto

Puedes usar cualquiera de las siguientes opciones para iniciar el servidor local:

### Opción 1: Servidor Mongoose Integrado (Recomendado)
El proyecto incluye un servidor estático minimalista y ligero listo para usar:
* **En Windows:** Haz doble clic sobre el archivo [mongoose.exe](file:///c:/Users/HP/Desktop/manager-sports-frontend/mongoose.exe) en la raíz del proyecto.
* **En Linux / macOS:** Otorga permisos de ejecución al binario correspondiente y ejecútalo:
  ```bash
  chmod +x ./mongoose_linux
  ./mongoose_linux -d ./
  ```
Una vez ejecutado, abre la dirección que te indique (usualmente `http://localhost:8080`) en tu navegador web.

### Opción 2: VS Code - Live Server
Si utilizas **Visual Studio Code**:
1. Abre la carpeta del proyecto en VS Code.
2. Asegúrate de tener instalada la extensión **"Live Server"** de Ritwick Dey.
3. Haz clic derecho sobre el archivo `index.html` y selecciona **"Open with Live Server"** (o presiona el botón *Go Live* en la barra de estado inferior).

### Opción 3: Python (Alternativa rápida)
Si tienes Python instalado, ejecuta en la consola de comandos dentro de la carpeta del proyecto:
```bash
python -m http.server 8080
```
Luego accede a `http://localhost:8080` en tu navegador.

---

## 💻 Compatibilidad y Navegadores (Soporte Windows 7)
El sistema se ejecuta en el lado del cliente (navegador), por lo que es compatible incluso con sistemas antiguos como **Windows 7**, siempre que se use una versión de navegador que soporte WebAssembly y OPFS:
* **Google Chrome:** Versión 102 o superior (la última versión compatible con Windows 7 es la 109, la cual es 100% compatible).
* **Mozilla Firefox:** Versión 111 o superior (la versión de largo soporte Firefox 115 ESR compatible con Windows 7 funciona perfectamente).
* **Microsoft Edge:** Versión 102 o superior.

---

## 🔑 Credenciales por Defecto (Seed Data)
Al abrir la aplicación por primera vez, la base de datos se inicializará y poblará automáticamente con datos semilla. Puedes usar estas credenciales para probar los flujos:

* **Administrador:**
  * **Email:** `admin@deportes.com`
  * **Contraseña:** `admin1234`
* **Usuarios Comunes:**
  * **Email:** `juan@gmail.com` o `maria@gmail.com`
  * **Contraseña:** `user1234`

---

## 💾 Almacenamiento y Datos de Prueba (Seed Data)
* **¿Es necesario instalar SQLite?** No. Todos los archivos necesarios de SQLite WASM ya están incluidos en [services/db/sqlite3/](file:///c:/Users/HP/Desktop/manager-sports-frontend/services/db/sqlite3) y se descargan directamente al hacer el `git clone`.
* **¿Dónde se guardan los datos?** La base de datos se guarda de forma local en el navegador del cliente (dentro de OPFS). No se requiere ningún software adicional.
* **¿Los datos semilla vienen en el Git?** Sí. El archivo de base de datos en sí no se comparte porque es local al navegador, pero el script de creación y llenado de datos semilla ([seed.js](file:///c:/Users/HP/Desktop/manager-sports-frontend/services/db/seed.js)) está integrado en el código. Al iniciar la aplicación por primera vez, el sistema detecta que la base de datos está vacía, crea las tablas y carga automáticamente todos los usuarios, eventos y estadísticas de prueba.

---

## 🧹 Reiniciar o Vaciar la Base de Datos
Si deseas reiniciar la base de datos durante las pruebas, puedes ejecutar comandos especiales directamente desde la **Consola de Desarrollador** de tu navegador (F12):

1. Abre la aplicación en tu navegador web.
2. Presiona `F12` y ve a la pestaña **Consola**.
3. Ejecuta uno de los siguientes comandos según lo que necesites:
   * **Restablecer la base de datos con los datos semilla iniciales:**
     ```javascript
     window.resetDb(true);
     ```
   * **Vaciar por completo la base de datos (dejarla en blanco con solo el esquema de tablas listo para producción):**
     ```javascript
     window.resetDb(false);
     ```
4. La base de datos borrará todas las tablas, recreará la estructura limpia, limpiará el almacenamiento local (`localStorage`) y recargará la página automáticamente en un segundo.

---

## 🧪 Pruebas Unitarias
Para validar que toda la lógica de los formularios, estados de los partidos y mapeo de estadísticas de juego por deporte funciona correctamente:
1. Asegúrate de tener el servidor web local encendido.
2. Abre en tu navegador la ruta: `http://localhost:8080/tests.html` (o el puerto correspondiente).
3. Presiona el botón **"Ejecutar Tests"**.

---

## 📂 Documentación Técnica
Toda la documentación técnica exhaustiva sobre componentes, servicios y vistas del proyecto se encuentra centralizada dentro del directorio [docs/](file:///c:/Users/HP/Desktop/manager-sports-frontend/docs):
* [docs/project_structure.md](file:///c:/Users/HP/Desktop/manager-sports-frontend/docs/project_structure.md) - Estructura de carpetas y arquitectura SPA.
* [docs/api_services.md](file:///c:/Users/HP/Desktop/manager-sports-frontend/docs/api_services.md) - Servicios de datos y encapsulamiento local de API.
* [docs/admin_components.md](file:///c:/Users/HP/Desktop/manager-sports-frontend/docs/admin_components.md) - Documentación de paneles de administración.
* [docs/user_components.md](file:///c:/Users/HP/Desktop/manager-sports-frontend/docs/user_components.md) - Documentación de interfaz de usuarios y boletos.
* [docs/global_views.md](file:///c:/Users/HP/Desktop/manager-sports-frontend/docs/global_views.md) - Vistas públicas y compras de entradas.
