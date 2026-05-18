// views/auth/register.js
export default {
  template: `
  <div class="min-h-screen relative flex flex-col" style="font-family: 'Inter', sans-serif;">
 
    <!-- ==============================
         FONDO: Gradiente hero oscuro + Glow blobs
         ============================== -->
    <div class="absolute inset-0 z-0 overflow-hidden">
 
      <!-- Gradiente oscuro base (idéntico al login) -->
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
 
      <!-- Glow blob azul — arriba izquierda -->
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
 
      <!-- Glow blob cian — abajo derecha -->
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
 
      <!-- Glow blob cian tenue — arriba derecha -->
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
         MAIN: Tarjeta de Registro centrada
         ============================== -->
    <main class="relative z-10 flex-1 flex items-center justify-center px-6 py-12 sm:py-16">
      <div class="w-full max-w-md">
 
        <!-- ============================================
             TARJETA BLANCA SÓLIDA
             Flota sobre el fondo oscuro del estadio.
             background: rgba(255,255,255,0.75) asegura
             que sea visiblemente blanca y sólida.
             ============================================ -->
        <div
          class="rounded-2xl p-8 sm:p-10"
          style="
            background: rgba(255, 255, 255, 0.75);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255,255,255,0.7);
            box-shadow: 0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.1);
          "
        >
 
          <!-- Título oscuro sobre tarjeta blanca -->
          <h1
            class="text-center mb-2"
            style="
              color: #0F172A;
              font-size: clamp(1.6rem, 4vw, 2.1rem);
              font-weight: 800;
              letter-spacing: -0.025em;
              line-height: 1.2;
            "
          >
            Crea tu cuenta en<br>Olympia
          </h1>
 
          <!-- Subtítulo slate oscuro — legible sobre blanco -->
          <p
            class="text-center text-sm mb-7"
            style="color: #475569; font-weight: 400; line-height: 1.5;"
          >
            Accede a eventos deportivos y gestiona tus entradas.
          </p>
 
          <!-- ===== Campo: Nombre Completo ===== -->
          <div class="mb-3">
            <div
              class="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200"
              :style="campoActivo === 'nombre'
                ? 'background: #ffffff; border: 1.5px solid #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,0.12);'
                : 'background: #f8fafc; border: 1.5px solid #e2e8f0;'"
            >
              <!-- Ícono persona en cian -->
              <svg
                class="w-5 h-5 flex-shrink-0"
                style="color: #06B6D4;"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                viewBox="0 0 24 24"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
 
              <input
                v-model="nombre"
                type="text"
                placeholder="Nombre Completo"
                class="bg-transparent text-sm flex-1 outline-none"
                style="color: #0F172A; font-weight: 400;"
                @focus="campoActivo = 'nombre'"
                @blur="campoActivo = null"
              />
            </div>
            <p v-if="errores.nombre" class="text-red-500 text-xs mt-1 pl-1">{{ errores.nombre }}</p>
          </div>
 
          <!-- ===== Campo: Correo Electrónico ===== -->
          <div class="mb-3">
            <div
              class="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200"
              :style="campoActivo === 'correo'
                ? 'background: #ffffff; border: 1.5px solid #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,0.12);'
                : 'background: #f8fafc; border: 1.5px solid #e2e8f0;'"
            >
              <!-- Ícono sobre de correo en cian -->
              <svg
                class="w-5 h-5 flex-shrink-0"
                style="color: #06B6D4;"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
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
            <p v-if="errores.correo" class="text-red-500 text-xs mt-1 pl-1">{{ errores.correo }}</p>
          </div>
 
          <!-- ===== Campo: Contraseña ===== -->
          <div class="mb-3">
            <div
              class="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200"
              :style="campoActivo === 'clave'
                ? 'background: #ffffff; border: 1.5px solid #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,0.12);'
                : 'background: #f8fafc; border: 1.5px solid #e2e8f0;'"
            >
              <!-- Ícono candado en cian -->
              <svg
                class="w-5 h-5 flex-shrink-0"
                style="color: #06B6D4;"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
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
              />
 
              <!-- Toggle ver/ocultar contraseña -->
              <button
                type="button"
                class="flex-shrink-0 focus:outline-none transition-colors duration-200"
                style="color: #94a3b8;"
                @click="mostrarClave = !mostrarClave"
              >
                <!-- Ojo abierto: clave visible -->
                <svg v-if="mostrarClave" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <!-- Ojo tachado: clave oculta -->
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
            <p v-if="errores.clave" class="text-red-500 text-xs mt-1 pl-1">{{ errores.clave }}</p>
          </div>
 
          <!-- ===== Campo: Confirmar Contraseña ===== -->
          <div class="mb-6">
            <div
              class="flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200"
              :style="campoActivo === 'confirmarClave'
                ? 'background: #ffffff; border: 1.5px solid #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,0.12);'
                : 'background: #f8fafc; border: 1.5px solid #e2e8f0;'"
            >
              <!-- Ícono candado en cian -->
              <svg
                class="w-5 h-5 flex-shrink-0"
                style="color: #06B6D4;"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0110 0v4"/>
              </svg>
 
              <input
                v-model="confirmarClave"
                :type="mostrarConfirmarClave ? 'text' : 'password'"
                placeholder="Confirmar Contraseña"
                class="bg-transparent text-sm flex-1 outline-none"
                style="color: #0F172A; font-weight: 400;"
                @focus="campoActivo = 'confirmarClave'"
                @blur="campoActivo = null"
                @keyup.enter="manejarRegistro"
              />
 
              <!-- Toggle confirmar clave -->
              <button
                type="button"
                class="flex-shrink-0 focus:outline-none transition-colors duration-200"
                style="color: #94a3b8;"
                @click="mostrarConfirmarClave = !mostrarConfirmarClave"
              >
                <svg v-if="mostrarConfirmarClave" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              </button>
            </div>
            <p v-if="errores.confirmarClave" class="text-red-500 text-xs mt-1 pl-1">{{ errores.confirmarClave }}</p>
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
 
          <!-- ===== Botón CTA: "Crear mi cuenta" ===== -->
          <button
            @click="manejarRegistro"
            :disabled="cargando"
            class="group w-full text-white py-4 rounded-full text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            style="
              background: linear-gradient(135deg, #2563EB, #1d4ed8);
              box-shadow: 0 6px 30px rgba(37,99,235,0.45);
              font-weight: 700;
            "
          >
            <span v-if="cargando" class="flex items-center gap-2">
              <svg class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              Creando cuenta...
            </span>
 
            <span v-else class="flex items-center gap-2">
              Crear mi cuenta
              <svg
                class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </button>
 
          <!-- ===== Aviso legal ===== -->
          <p
            class="text-center text-xs mt-5"
            style="color: #64748b; font-weight: 400; line-height: 1.7;"
          >
            Al registrarte, aceptas nuestros
            <a href="#" class="transition-colors duration-200 hover:underline" style="color: #2563EB; font-weight: 500;">Términos y condiciones</a>
            y
            <a href="#" class="transition-colors duration-200 hover:underline" style="color: #2563EB; font-weight: 500;">Política de privacidad</a>.
          </p>
 
          <!-- ===== Enlace a Login ===== -->
          <p
            class="text-center text-sm mt-4"
            style="color: #475569; font-weight: 400;"
          >
            ¿Ya tienes cuenta?
            <router-link
              to="/login"
              class="transition-colors duration-200 hover:underline"
              style="color: #2563EB; font-weight: 600;"
            >
              Iniciar sesión aquí
            </router-link>
          </p>
 
        </div>
        <!-- /Tarjeta blanca sólida -->
 
      </div>
    </main>
 
    <!-- ==============================
         FOOTER (componente de la app)
         ============================== -->
    <footer-component></footer-component>
 
  </div>
  `,
 
  // ================================================================
  //  DATA — Variables del componente (nomenclatura en español)
  // ================================================================
  data() {
    return {
      // Campos del formulario de registro
      nombre:         '',
      correo:         '',
      clave:          '',
      confirmarClave: '',
 
      // Toggles de visibilidad de contraseñas
      mostrarClave:          false,
      mostrarConfirmarClave: false,
 
      // Control del campo con foco activo (estilos dinámicos de inputs)
      campoActivo: null,
 
      // Estado de la solicitud
      cargando:     false,
      mensajeError: '',
      mensajeExito: '',
 
      // Errores de validación por campo
      errores: {
        nombre:         '',
        correo:         '',
        clave:          '',
        confirmarClave: '',
      },
    };
  },
 
  // ================================================================
  //  METHODS — Lógica del componente (nomenclatura en español)
  // ================================================================
  methods: {
 
    /**
     * validarFormulario
     * Valida cada campo individualmente y asigna mensajes de error.
     * Retorna true si el formulario es válido, false si tiene errores.
     */
    validarFormulario() {
      // Limpiar todos los errores antes de revalidar
      this.errores.nombre         = '';
      this.errores.correo         = '';
      this.errores.clave          = '';
      this.errores.confirmarClave = '';
 
      let formularioValido = true;
 
      // — Validar nombre completo
      if (!this.nombre.trim()) {
        this.errores.nombre = 'El nombre completo es obligatorio.';
        formularioValido = false;
      } else if (this.nombre.trim().length < 3) {
        this.errores.nombre = 'El nombre debe tener al menos 3 caracteres.';
        formularioValido = false;
      }
 
      // — Validar correo electrónico
      if (!this.correo.trim()) {
        this.errores.correo = 'El correo electrónico es obligatorio.';
        formularioValido = false;
      } else if (!this.correo.includes('@') || !this.correo.includes('.')) {
        this.errores.correo = 'Ingresa un correo electrónico válido.';
        formularioValido = false;
      }
 
      // — Validar contraseña
      if (!this.clave) {
        this.errores.clave = 'La contraseña es obligatoria.';
        formularioValido = false;
      } else if (this.clave.length < 6) {
        this.errores.clave = 'La contraseña debe tener al menos 6 caracteres.';
        formularioValido = false;
      }
 
      // — Validar confirmación de contraseña
      if (!this.confirmarClave) {
        this.errores.confirmarClave = 'Por favor confirma tu contraseña.';
        formularioValido = false;
      } else if (this.clave !== this.confirmarClave) {
        this.errores.confirmarClave = 'Las contraseñas no coinciden.';
        formularioValido = false;
      }
 
      return formularioValido;
    },
 
    /**
     * manejarRegistro
     * Valida el formulario y envía los datos de registro al servidor.
     * Gestiona los estados de carga, éxito y error.
     */
    async manejarRegistro() {
      // Limpiar mensajes globales previos
      this.mensajeError = '';
      this.mensajeExito = '';
 
      // Detener ejecución si hay errores de validación
      if (!this.validarFormulario()) return;
 
      // Activar estado de carga
      this.cargando = true;
 
      try {
        // Simulación de llamada al API de registro (reemplazar con llamada real)
        await new Promise(resolve => setTimeout(resolve, 1400));

        // Registro exitoso: mostrar mensaje y limpiar formulario
        this.mensajeExito = '¡Cuenta creada exitosamente! Redirigiendo...';

        // Redirección real (descomentar cuando esté disponible el router):
        // this.$router.push('/dashboard');

        console.log('[Olympia] Registro exitoso:', {
          nombre: this.nombre,
          correo: this.correo,
        });

        // Limpiar campos del formulario tras éxito
        this.nombre         = '';
        this.correo         = '';
        this.clave          = '';
        this.confirmarClave = '';

      } catch (error) {
        this.mensajeError = 'Ocurrió un error al crear la cuenta. Inténtalo de nuevo.';
        console.error('[Olympia] Error de registro:', error);
      } finally {
        this.cargando = false;
      }
    },
 
  },
};
 