import { authService } from './services/authService.js';
import navbar from './components/navbar.js';
import MainLayout from './layout/MainLayout.js';
import Admin from './views/admin/admin.js';
import Login from './views/global/auth/login.js';
import Register from './views/global/auth/register.js';
import HomeView from './views/global/home.js';
import AdminLogin from './views/global/auth/adminLogin.js';
import User from './views/user/user.js';
// EventDetails will be imported as subcomponents inside dashboards

// Componentes de imágenes
import logo from './components/images/logo.js';
import star from './components/images/star.js';
import footer from './components/footer.js';
import arrowRight from './components/images/arrow-right.js';
import shield from './components/images/shield.js';
import starOutlined from './components/images/star-outlined.js';
import logoCyan from "./components/images/logo-cyan.js"
import user from './components/images/user.js';
import ticket from './components/images/ticket.js';
import calendar from './components/images/calendar.js';
import hamburger from './components/images/hamburger.js';
import closeHamburger from './components/images/close-hamburger.js';

const routes = [
    {
        path: '/',
        component: MainLayout,
        children: [
            { 
                path: '', 
                component: HomeView,
                meta: { guest: true }
            }
        ]
    },

    {
        path: '/dashboard',
        component: User,
        meta: { requiresAuth: true }
    },
    { 
        path: '/login/admin', 
        component: AdminLogin,
        meta: { guest: true }
    },
    { 
        path: '/admin', 
        component: Admin,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    { 
        path: '/login', 
        component: Login,
        meta: { guest: true }
    },
    { 
        path: '/register', 
        component: Register,
        meta: { guest: true }
    }
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes
});

// ==========================================
// GUARD DE NAVEGACIÓN
// ==========================================
router.beforeEach((to, from, next) => {
    const isAuthenticated = authService.isAuthenticated();
    const currentUser = authService.getCurrentUser();
    
    // Activar loader
    if (window.app) {
        window.app.showLoader = true;
    }
    
    // Rutas protegidas
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!isAuthenticated) {
            const loginPath = to.path.startsWith('/admin') ? '/login/admin' : '/login';
            next(loginPath);
            return;
        }
        
        if (to.matched.some(record => record.meta.requiresAdmin)) {
            if (!currentUser || currentUser.role !== 'admin') {
                authService.logout();
                next('/login/admin');
                return;
            }
        }
    }
    
    // Rutas para invitados
    if (to.matched.some(record => record.meta.guest)) {
        if (isAuthenticated) {
            if (currentUser && currentUser.role === 'admin') {
                next('/admin');
            } else {
                next('/dashboard');
            }
            return;
        }
    }
    
    next();
});

// Ocultar loader después de navegar
router.afterEach(() => {
    setTimeout(() => {
        if (window.app) {
            window.app.showLoader = false;
        }
    }, 400);
});

const app = Vue.createApp({
    data() {
        return {
            version: "1.0.0",
            isAuthenticated: false,
            currentUser: null,
            showLoader: false,
            loaderMessage: 'Cargando...'
        }
    },
    
    created() {
        window.app = this;
        this.updateLoaderMessage();
        this.checkAuth();
    },
    
    methods: {
        async checkAuth() {
            this.showLoader = true;
            this.loaderMessage = 'Verificando acceso...';
            
            try {
                // Inicializar base de datos proactivamente al arrancar la aplicación
                const { initDb } = await import('./services/db/database.js');
                await initDb();
            } catch (error) {
                console.error("❌ Error al inicializar base de datos en el arranque:", error);
                
                // Mostrar alerta descriptiva usando SweetAlert
                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error de Base de Datos Local',
                        html: `
                            <div class="text-left font-sans px-2">
                                <p class="text-sm text-slate-600 mb-4">No se pudo conectar con la base de datos local SQLite (OPFS).</p>
                                <p class="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl p-3 font-mono overflow-y-auto max-h-36 mb-4">
                                    ${error.message || error}
                                </p>
                                <p class="text-xs text-slate-500 font-semibold">Sugerencias:</p>
                                <ul class="list-disc pl-5 text-xs text-slate-500 space-y-1 mt-1">
                                    <li>Recarga la página para activar el Service Worker de aislamiento.</li>
                                    <li>Verifica que estás accediendo desde un servidor local (localhost) o HTTPS seguro.</li>
                                    <li>Asegúrate de que tu navegador sea moderno (Chrome 109+, Firefox 115+).</li>
                                </ul>
                            </div>
                        `,
                        confirmButtonText: '🔄 Recargar Aplicación',
                        allowOutsideClick: false,
                        buttonsStyling: false,
                        customClass: {
                            confirmButton: 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest cursor-pointer shadow-md'
                        }
                    }).then((result) => {
                        if (result.isConfirmed) {
                            window.location.reload();
                        }
                    });
                }
            } finally {
                this.isAuthenticated = authService.isAuthenticated();
                this.currentUser = authService.getCurrentUser();
                this.showLoader = false;
            }
        },
        
        updateLoaderMessage() {
            router.beforeEach((to) => {
                if (to.path.includes('admin')) {
                    this.loaderMessage = 'Accediendo al panel...';
                } else if (to.path.includes('login')) {
                    this.loaderMessage = 'Cargando...';
                } else if (to.path === '/') {
                    this.loaderMessage = 'Preparando todo...';
                } else {
                    this.loaderMessage = 'Cargando...';
                }
            });
        },
        
        handleLogout() {
            this.loaderMessage = 'Cerrando sesión...';
            this.showLoader = true;
            
            setTimeout(() => {
                authService.logout();
                this.isAuthenticated = false;
                this.currentUser = null;
                this.$router.push('/login/admin');
                this.showLoader = false;
            }, 500);
        }
    }
});

// Registrar componentes
app.component('navbar-component', navbar);
app.component('footer-component', footer);

// Registrar imágenes
app.component('logo', logo);
app.component('arrow-right', arrowRight);
app.component('shield', shield);
app.component('star', star);
app.component('star-outlined', starOutlined);
app.component('logo-cyan', logoCyan);
app.component('user', user);
app.component('ticket', ticket);
app.component('calendar', calendar);
app.component('hamburger', hamburger);
app.component('close-hamburger', closeHamburger);

app.use(router);
app.mount('#app');