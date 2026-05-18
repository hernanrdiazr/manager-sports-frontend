// login.js - Página de login con diseño del sistema
import { authService } from '../../../services/authService.js';

export default {
    template: `
        <div class="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
            <!-- Glow Blobs de fondo -->
            <div class="absolute inset-0 overflow-hidden pointer-events-none">
                <div class="absolute -top-40 -right-40 w-96 h-96 bg-[#2563EB] rounded-full opacity-20 blur-3xl"></div>
                <div class="absolute -bottom-40 -left-40 w-96 h-96 bg-[#06B6D4] rounded-full opacity-20 blur-3xl"></div>
            </div>

            <!-- Contenedor del Login con Glassmorphism -->
            <div class="relative z-10 w-full max-w-md">
                <!-- Logo y Título -->
                <div class="text-center mb-8">
                    <!-- Logo -->
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl mb-6">
                        <svg class="w-8 h-8 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                    </div>
                    
                    <h1 class="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3" 
                        style="letter-spacing: -0.025em;">
                        Panel de
                        <span class="bg-gradient-to-r from-[#2563EB] to-[#06B6D4] bg-clip-text text-transparent">
                            Administración
                        </span>
                    </h1>
                  
                </div>

                <!-- Tarjeta Glassmorphism -->
                <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl"
                     style="box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
                    
                    <!-- Badge de acceso seguro -->
                    <div class="flex justify-center mb-6">
                        <div class="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5">
                            <svg class="w-4 h-4 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                            </svg>
                            <span class="text-[#06B6D4] text-xs font-semibold tracking-wide">
                                CONEXIÓN SEGURA
                            </span>
                        </div>
                    </div>

                    <!-- Mensaje de error general -->
                    <div v-if="error" 
                         class="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium backdrop-blur-sm">
                        <div class="flex items-center gap-2">
                            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span>{{ error }}</span>
                        </div>
                    </div>

                    <!-- Mensaje de éxito -->
                    <div v-if="successMsg" 
                         class="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium backdrop-blur-sm">
                        <div class="flex items-center gap-2">
                            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                            <span>{{ successMsg }}</span>
                        </div>
                    </div>

                    <!-- ✅ Formulario con validación en español -->
                    <form @submit.prevent="handleLogin" class="space-y-5" novalidate>
                        
                        <!-- ✅ Campo Email con validación -->
                        <div>
                            <label class="block text-slate-300 text-sm font-semibold mb-2 tracking-wide">
                                Correo Electrónico
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                    </svg>
                                </div>
                                <input 
                                    v-model="email" 
                                    type="email" 
                                    placeholder="admin@ejemplo.com"
                                    @blur="validateEmail"
                                    @input="clearEmailError"
                                    class="w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-300 font-medium"
                                    :class="emailError ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-[#2563EB] focus:border-transparent'"
                                    :disabled="loading"
                                >
                                <!-- Icono de validación -->
                                <div v-if="email && !emailError && !loading" class="absolute inset-y-0 right-0 pr-3 flex items-center">
                                    <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                                    </svg>
                                </div>
                            </div>
                            <!-- ✅ Mensaje de error en español -->
                            <p v-if="emailError" class="mt-2 text-red-400 text-xs flex items-center gap-1.5">
                                <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                {{ emailError }}
                            </p>
                        </div>

                        <!-- ✅ Campo Contraseña con validación -->
                        <div>
                            <label class="block text-slate-300 text-sm font-semibold mb-2 tracking-wide">
                                Contraseña
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                                    </svg>
                                </div>
                                <input 
                                    v-model="password"
                                    :type="showPassword ? 'text' : 'password'"
                                    placeholder="••••••••"
                                    @blur="validatePassword"
                                    @input="clearPasswordError"
                                    class="w-full pl-10 pr-12 py-3 bg-white/5 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-300 font-medium"
                                    :class="passwordError ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-[#2563EB] focus:border-transparent'"
                                    :disabled="loading"
                                >
                                <button 
                                    type="button"
                                    @click="showPassword = !showPassword"
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition-colors duration-200"
                                    tabindex="-1"
                                >
                                    <!-- Icono ojo -->
                                    <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243a9.97 9.97 0 01-6.364 2.121m8.364-8.364L3 21"/>
                                    </svg>
                                </button>
                            </div>
                            <!-- ✅ Mensaje de error en español -->
                            <p v-if="passwordError" class="mt-2 text-red-400 text-xs flex items-center gap-1.5">
                                <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                {{ passwordError }}
                            </p>
                        </div>

                        <!-- Botón de Login -->
                        <button 
                            type="submit"
                            class="group relative w-full bg-gradient-to-br from-[#2563EB] to-[#1d4ed8] text-white py-3.5 px-6 rounded-full font-bold text-sm tracking-wide transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            style="box-shadow: 0 6px 30px rgba(37,99,235,0.5);"
                            :disabled="loading || !isFormValid"
                        >
                            <span v-if="!loading" class="flex items-center justify-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
                                </svg>
                                Iniciar Sesión
                                <svg class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                                </svg>
                            </span>
                            <span v-else class="flex items-center justify-center gap-2">
                                <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                Verificando credenciales...
                            </span>
                        </button>
                    </form>

                    <!-- Separador -->
                    <div class="relative my-6">
                        <div class="absolute inset-0 flex items-center">
                            <div class="w-full border-t border-white/10"></div>
                        </div>
                        <div class="relative flex justify-center text-xs">
                            <span class="px-2 bg-transparent text-slate-400 font-medium">
                                Acceso restringido
                            </span>
                        </div>
                    </div>

                    <!-- Micro-beneficios de seguridad -->
                    <div class="grid grid-cols-3 gap-3 text-center">
                        <div class="space-y-1">
                            <div class="w-8 h-8 mx-auto bg-[#06B6D4]/10 rounded-lg flex items-center justify-center">
                                <svg class="w-4 h-4 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                </svg>
                            </div>
                            <p class="text-slate-400 text-xs font-medium">Encriptado</p>
                        </div>
                        <div class="space-y-1">
                            <div class="w-8 h-8 mx-auto bg-[#06B6D4]/10 rounded-lg flex items-center justify-center">
                                <svg class="w-4 h-4 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                                </svg>
                            </div>
                            <p class="text-slate-400 text-xs font-medium">Protegido</p>
                        </div>
                        <div class="space-y-1">
                            <div class="w-8 h-8 mx-auto bg-[#06B6D4]/10 rounded-lg flex items-center justify-center">
                                <svg class="w-4 h-4 text-[#06B6D4]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                                </svg>
                            </div>
                            <p class="text-slate-400 text-xs font-medium">Rápido</p>
                        </div>
                    </div>
                </div>

                <!-- Footer del formulario -->
                <p class="text-center mt-6 text-slate-400 text-xs font-medium">
                    © 2026 Panel de Administración. Todos los derechos reservados.
                </p>
            </div>
        </div>
    `,
    
    data() {
        return {
            email: '',
            password: '',
            loading: false,
            error: null,
            successMsg: null,
            showPassword: false,
            // ✅ Nuevos campos para validación
            emailError: '',
            passwordError: ''
        };
    },
    
    computed: {
        // ✅ Valida si el formulario está completo y sin errores
        isFormValid() {
            return this.email && 
                   this.password && 
                   !this.emailError && 
                   !this.passwordError;
        }
    },
    
    created() {
        // Si ya está autenticado como admin, redirigir al panel
        if (authService.isAuthenticated()) {
            window.location.href = '/#/admin';
        }
        
        // Cargar email guardado si existe
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            this.email = savedEmail;
        }
    },
    
    methods: {
        // ✅ Validación de email
        validateEmail() {
            this.emailError = '';
            
            if (!this.email.trim()) {
                this.emailError = 'El correo electrónico es requerido';
                return false;
            }
            
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.email)) {
                this.emailError = 'Ingresa un correo electrónico válido';
                return false;
            }
            
            return true;
        },
        
        // ✅ Limpiar error de email al escribir
        clearEmailError() {
            if (this.emailError) {
                this.emailError = '';
            }
        },
        
        // ✅ Validación de contraseña
        validatePassword() {
            this.passwordError = '';
            
            if (!this.password) {
                this.passwordError = 'La contraseña es requerida';
                return false;
            }
            
            if (this.password.length < 6) {
                this.passwordError = 'La contraseña debe tener al menos 6 caracteres';
                return false;
            }
            
            return true;
        },
        
        // ✅ Limpiar error de contraseña al escribir
        clearPasswordError() {
            if (this.passwordError) {
                this.passwordError = '';
            }
        },
        
        async handleLogin() {
            // Limpiar errores previos
            this.error = null;
            
            // ✅ Validar campos
            const isEmailValid = this.validateEmail();
            const isPasswordValid = this.validatePassword();
            
            if (!isEmailValid || !isPasswordValid) {
                return;
            }
            
            this.loading = true;
            this.successMsg = null;
            
            try {
                const response = await authService.login(this.email, this.password);
                
                this.successMsg = '¡Acceso concedido! Redirigiendo al panel...';
                
                // Redirigir al panel de administración después de 1 segundo
                setTimeout(() => {
                    window.location.href = '/#/admin';
                }, 1000);
                
            } catch (error) {
                if (error.message.includes('Acceso denegado')) {
                    this.error = 'No tienes permisos de administrador';
                } else if (error.message.includes('Credenciales') || error.message.includes('incorrectas')) {
                    this.error = 'Email o contraseña incorrectos';
                } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                    this.error = 'Error de conexión. Verifica que el servidor esté funcionando';
                } else {
                    this.error = error.message || 'Error al iniciar sesión';
                }
            } finally {
                this.loading = false;
            }
        }
    }
};