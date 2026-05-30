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

## 💻 Compatibilidad y Navegadores (Guía Rápida para Windows 7)

Dado que la aplicación corre completamente en el lado del cliente (navegador) sin Node.js, es **100% compatible con Windows 7** siempre y cuando cumplas los siguientes 3 requisitos fundamentales:

### 1. Usar un Navegador Compatible (Límite de Windows 7)
Dado que Windows 7 no recibe actualizaciones de navegadores modernos recientes, debes instalar y usar uno de los siguientes:
* **Google Chrome 109 (Recomendado):** Es la última versión oficial de Chrome compatible con Windows 7. Soporta WebAssembly y OPFS (Origin Private File System) mediante Workers perfectamente.
* **Mozilla Firefox 115 ESR (Extended Support Release):** Es la versión de soporte extendido para Windows 7 de Firefox. Es completamente compatible con todo el motor de base de datos SQLite WASM.
* **Microsoft Edge 109:** La última versión de Edge compatible con Windows 7.
* **❌ IMPORTANTE:** Navegadores obsoletos como Internet Explorer, o versiones antiguas de Chrome/Firefox por debajo de la versión 102, **no funcionarán** (el sistema alertará del error y no cargará).

### 2. Acceder mediante IP en lugar de nombre (Recomendación de Red)
En Windows 7, la resolución del nombre `localhost` en el archivo de hosts a veces está inhabilitada o mal configurada.
* **Consejo de oro:** Accede a la aplicación usando la dirección IP local de loopback: **`http://127.0.0.1:8080`** (reemplazando `8080` por el puerto que indique Mongoose o tu servidor local). Esto evita retrasos y fallos de resolución de DNS local.

### 3. Verificar que el Servidor Local Esté Iniciado
* Asegúrate de que `mongoose.exe` esté abierto y muestre su ventana de consola en segundo plano. Si por algún motivo de seguridad de Windows 7 (como Windows Defender o falta de permisos) el binario `.exe` se bloquea, recuerda que puedes usar alternativas como **Live Server** de VS Code o **Python** (`python -m http.server 8080`).

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
