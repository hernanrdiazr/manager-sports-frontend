// views/auth/login.js
export default {
  template: `
  <div class="min-h-screen relative flex flex-col" style="font-family: 'Inter', sans-serif;">

    <!-- ==============================
         FONDO: Gradiente hero + Glow blobs
         ============================== -->
    <div class="absolute inset-0 z-0 overflow-hidden">
      <!-- Gradiente oscuro del hero -->
      <div
        class="absolute inset-0"
        style="background: linear-gradient(135deg, #0F172A 0%, #1e3a5f 35%, #0e4f6e 65%, #0F172A 100%);"
      ></div>

      <!-- Imagen de estadio con opacidad baja -->
      <div
        class="absolute inset-0"
        style="
          background-image: url('https://images.unsplash.com/photo-1770479086965-430e49d96e23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBzdGFkaXVtJTIwY3Jvd2QlMjBhZXJpYWx8ZW58MXx8fHwxNzc3NzY1MzkwfDA&ixlib=rb-4.1.0&q=80&w=1080');
          background-size: cover;
          background-position: center;
          opacity: 0.10;
        "
      ></div>

      <!-- Glow blob azul (arriba izquierda) -->
      <div
        class="absolute rounded-full"
        style="
          top: 15%;
          left: 15%;
          width: 520px;
          height: 520px;
          background: radial-gradient(circle, rgba(37,99,235,0.18) 0%, transparent 70%);
          pointer-events: none;
        "
      ></div>

      <!-- Glow blob cian (abajo derecha) -->
      <div
        class="absolute rounded-full"
        style="
          bottom: 20%;
          right: 10%;
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%);
          pointer-events: none;
        "
      ></div>

      <!-- Glow blob cian tenue (arriba derecha) -->
      <div
        class="absolute rounded-full"
        style="
          top: 5%;
          right: 25%;
          width: 260px;
          height: 260px;
          background: radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%);
          pointer-events: none;
        "
      ></div>
    </div>

    <!-- ==============================
         NAVBAR (componente de la app)
         ============================== -->
    <div class="relative z-20">
      <navbar-component></navbar-component>
    </div>

    <!-- ==============================
         MAIN: Tarjeta de Login centrada
         ============================== -->
    <main class="relative z-10 flex-1 flex items-center justify-center px-6 py-16 sm:py-24">
      <div class="w-full max-w-md">

        <!-- Tarjeta blanca sólida flotante sobre fondo oscuro -->
        <div
          class="rounded-2xl p-8 sm:p-10"
          style="
            background: rgba(255, 255, 255, 0.75);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.6);
            box-shadow: 0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08);
          "
        >

          <!-- Título: texto oscuro sobre fondo blanco -->
          <h1
            class="text-center mb-2"
            style="color: #0F172A; font-size: clamp(1.7rem, 4.5vw, 2.25rem); font-weight: 800; letter-spacing: -0.025em; line-height: 1.2;"
          >
            Iniciar sesión en<br>Olympia
          </h1>

          <!-- Subtítulo: slate oscuro para legibilidad sobre blanco -->
          <p class="text-center text-sm mb-8" style="color: #475569; font-weight: 400;">
            Accede a tus boletos y eventos deportivos.
          </p>

          <!-- ===== Campo: Correo Electrónico ===== -->
          <div class="mb-4">
            <div
              class="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200"
              :style="campoActivo === 'correo'
                ? 'background: #ffffff; border: 1.5px solid #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,0.12);'
                : 'background: #f8fafc; border: 1.5px solid #e2e8f0;'"
            >
              <!-- Ícono sobre de correo en cian -->
              <svg class="w-5 h-5 flex-shrink-0" style="color: #06B6D4;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>

              <input
                v-model="correo"
                type="email"
                placeholder="Correo Electrónico"
                class="bg-transparent text-sm flex-1 outline-none"
                style="color: #0F172A; font-weight: 400;"
                @focus="campoActivo = 'correo'"
                @blur="campoActivo = null"
              />
            </div>

            <!-- Validación correo -->
            <p v-if="errores.correo" class="text-red-500 text-xs mt-1 pl-1">{{ errores.correo }}</p>
          </div>

          <!-- ===== Campo: Contraseña ===== -->
          <div class="mb-4">
            <div
              class="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200"
              :style="campoActivo === 'clave'
                ? 'background: #ffffff; border: 1.5px solid #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,0.12);'
                : 'background: #f8fafc; border: 1.5px solid #e2e8f0;'"
            >
              <!-- Ícono candado en cian -->
              <svg class="w-5 h-5 flex-shrink-0" style="color: #06B6D4;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>

              <input
                v-model="clave"
                :type="mostrarClave ? 'text' : 'password'"
                placeholder="Contraseña"
                class="bg-transparent text-sm flex-1 outline-none"
                style="color: #0F172A; font-weight: 400;"
                @focus="campoActivo = 'clave'"
                @blur="campoActivo = null"
                @keyup.enter="manejarLogin"
              />
            </div>

              <!-- Enlace: ¿Olvidaste tu contraseña? -->
            <div class="flex justify-end mt-2">
                <a
                    href="#"
                    class="text-xs transition-colors duration-200 hover:underline"
                    style="color: #06B6D4; font-weight: 500;"
                    @click.prevent="olvidasteClave"
                    >
            ¿Olvidaste tu contraseña?
            </a>
  </div>

            <!-- Validación clave -->
            <p v-if="errores.clave" class="text-red-500 text-xs mt-1 pl-1">{{ errores.clave }}</p>
          </div>

          <!-- ===== Mensaje de error global ===== -->
          <div
            v-if="mensajeError"
            class="mb-4 px-4 py-3 rounded-xl text-center text-sm"
            style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; font-weight: 500;"
          >
            {{ mensajeError }}
          </div>

          <!-- ===== Mensaje de éxito ===== -->
          <div
            v-if="mensajeExito"
            class="mb-4 px-4 py-3 rounded-xl text-center text-sm"
            style="background: #ecfeff; border: 1px solid #a5f3fc; color: #0891b2; font-weight: 500;"
          >
            {{ mensajeExito }}
          </div>

          <!-- ===== Botón CTA Principal: gradiente azul resalta perfectamente sobre blanco ===== -->
          <button
            @click="manejarLogin"
            :disabled="cargando"
            class="group w-full text-white py-4 rounded-full text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            style="
              background: linear-gradient(135deg, #2563EB, #1d4ed8);
              box-shadow: 0 6px 30px rgba(37,99,235,0.45);
              font-weight: 700;
            "
          >
            <span v-if="cargando" class="flex items-center gap-2">
              <!-- Spinner de carga -->
              <svg class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              Iniciando sesión...
            </span>
            <span v-else class="flex items-center gap-2">
              Iniciar sesión
              <!-- Ícono flecha derecha -->
              <svg
                class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"
              >
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </button>

          <!-- ===== Enlace a Registro: texto oscuro sobre blanco ===== -->
          <p class="text-center text-sm mt-6" style="color: #475569; font-weight: 400;">
            ¿Aún no tienes cuenta?
            <router-link
              to="/register"
              class="transition-colors duration-200 hover:underline"
              style="color: #2563EB; font-weight: 600;"
            >
              [Registrarse ahora]
            </router-link>
          </p>

        </div>
        <!-- /Tarjeta blanca flotante -->

      </div>
    </main>

    <!-- ==============================
         FOOTER (componente de la app)
         ============================== -->
    <footer-component></footer-component>

  </div>
  `,

  // ==============================================================
  //  DATA — Variables del componente (nomenclatura en español)
  // ==============================================================
  data() {
    return {
      // Campos del formulario
      correo: '',
      clave: '',
      mostrarClave: false,

      // Estado de foco activo para estilos dinámicos de inputs
      campoActivo: null,

      // Estado de carga y mensajes de feedback
      cargando: false,
      mensajeError: '',
      mensajeExito: '',

      // Errores de validación por campo
      errores: {
        correo: '',
        clave: '',
      },


    };
  },

  // ==============================================================
  //  METHODS — Lógica del componente (nomenclatura en español)
  // ==============================================================
  methods: {

    /**
     * validarFormulario
     * Verifica que los campos requeridos estén correctamente completados.
     * Retorna `true` si el formulario es válido, `false` en caso contrario.
     */
    validarFormulario() {
      // Limpiar errores anteriores
      this.errores.correo = '';
      this.errores.clave  = '';
      let formularioValido = true;

      // Validar campo correo
      if (!this.correo.trim()) {
        this.errores.correo = 'El correo electrónico es obligatorio.';
        formularioValido = false;
      } else if (!this.correo.includes('@') || !this.correo.includes('.')) {
        this.errores.correo = 'Ingresa un correo electrónico válido.';
        formularioValido = false;
      }

      // Validar campo clave
      if (!this.clave) {
        this.errores.clave = 'La contraseña es obligatoria.';
        formularioValido = false;
      } else if (this.clave.length < 6) {
        this.errores.clave = 'La contraseña debe tener al menos 6 caracteres.';
        formularioValido = false;
      }

      return formularioValido;
    },

    /**
     * manejarLogin
     * Gestiona el envío del formulario de inicio de sesión.
     * Ejecuta validación previa y simula la llamada a la API de autenticación.
     */
    async manejarLogin() {
      // Limpiar mensajes globales previos
      this.mensajeError = '';
      this.mensajeExito = '';

      // Ejecutar validación; detener si hay errores
      if (!this.validarFormulario()) return;

      // Activar estado de carga
      this.cargando = true;

      try {
        // Simulación de llamada a la API de autenticación (reemplazar con la llamada real)
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Autenticación exitosa
        this.mensajeExito = '¡Sesión iniciada correctamente! Redirigiendo...';

        // Aquí se integraría la redirección real:
        // this.$router.push('/dashboard');

        console.log('[Olympia] Login exitoso:', { correo: this.correo });

      } catch (error) {
        this.mensajeError = 'Correo o contraseña incorrectos. Inténtalo de nuevo.';
        console.error('[Olympia] Error de login:', error);
      } finally {
        this.cargando = false;
      }
    },

    /**
     * olvidasteClave
     * Gestiona el flujo de recuperación de contraseña.
     * Muestra instrucción al usuario (pendiente de integración con backend).
     */
    olvidasteClave() {
      if (!this.correo.trim()) {
        this.mensajeError = 'Ingresa tu correo electrónico primero para recuperar tu contraseña.';
        this.campoActivo = 'correo';
        return;
      }
      this.mensajeError  = '';
      this.mensajeExito  = `Se han enviado instrucciones de recuperación a: ${this.correo}`;

      // Aquí iría la llamada real al endpoint de recuperación:
      // await api.recuperarClave(this.correo);
      console.log('[Olympia] Recuperación de clave solicitada para:', this.correo);
    },

  },
};