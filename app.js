import { authService } from './services/authService.js';
import { initDatabase } from './services/database.js';
import { checkStoredHandle, requestPermissionAndRead, pickExistingFile, createNewFile } from './services/fileStorage.js';
import navbar from './components/navbar.js';
import MainLayout from './layout/MainLayout.js';
import Admin from './views/admin/admin.js';
import User from './views/user/user.js';
import Login from './views/global/auth/login.js';
import Register from './views/global/auth/register.js';
import HomeView from './views/global/home.js';
import AdminLogin from './views/global/auth/adminLogin.js';
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
            },
        ]
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
        path: '/dashboard',
        component: User,
        meta: { requiresAuth: true }
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
            // Admin routes redirect to admin login, user routes to user login
            const needsAdmin = to.matched.some(record => record.meta.requiresAdmin);
            next(needsAdmin ? '/login/admin' : '/login');
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

    // Rutas para invitados: redirigir según rol
    if (to.matched.some(record => record.meta.guest)) {
        if (isAuthenticated) {
            next(currentUser?.role === 'admin' ? '/admin' : '/dashboard');
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
            
            // Simular verificación
            await new Promise(resolve => setTimeout(resolve, 600));
            
            this.isAuthenticated = authService.isAuthenticated();
            this.currentUser = authService.getCurrentUser();
            
            this.showLoader = false;
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

// === DB Setup ===
async function setupDb() {
    const setupEl   = document.getElementById('db-setup');
    const statusMsg = document.getElementById('db-status-msg');
    const buttonsEl = document.getElementById('db-buttons');
    const continueEl = document.getElementById('db-continue');
    const filenameEl = document.getElementById('db-filename');
    const loadingEl = document.getElementById('db-loading');
    const errorEl   = document.getElementById('db-error');
    const btnOpen   = document.getElementById('btn-open-db');
    const btnNew    = document.getElementById('btn-new-db');
    const btnCont   = document.getElementById('btn-continue');
    const btnOther  = document.getElementById('btn-pick-other');

    function showError(msg) {
        errorEl.textContent = msg;
        errorEl.style.display = 'block';
    }

    function showLoading(show) {
        loadingEl.style.display = show ? 'block' : 'none';
        buttonsEl.style.display = show ? 'none' : '';
        continueEl.style.display = show ? 'none' : '';
    }

    async function launchApp(fileData, isNew) {
        showLoading(true);
        statusMsg.textContent = 'Cargando base de datos…';
        await initDatabase(fileData, isNew);
        setupEl.style.display = 'none';
        app.use(router);
        app.mount('#app');
    }

    // Chequear si hay handle guardado
    const stored = await checkStoredHandle();

    if (stored) {
        buttonsEl.style.display = 'none';
        continueEl.style.display = 'block';
        filenameEl.textContent = stored.filename;

        // Si ya tiene permiso, cargar automáticamente
        if (stored.hasPermission) {
            try {
                const file = await stored.handle.getFile();
                const data = file.size > 0 ? new Uint8Array(await file.arrayBuffer()) : null;
                await launchApp(data, false);
                return;
            } catch {
                // Permiso caducó, pedir de nuevo
            }
        }

        btnCont.addEventListener('click', async () => {
            errorEl.style.display = 'none';
            try {
                const data = await requestPermissionAndRead(stored.handle);
                await launchApp(data, false);
            } catch (e) {
                if (e.name !== 'AbortError') showError(e.message);
            }
        });

        btnOther.addEventListener('click', () => {
            continueEl.style.display = 'none';
            buttonsEl.style.display = 'block';
            statusMsg.textContent = 'Selecciona o crea un archivo de base de datos para continuar.';
            errorEl.style.display = 'none';
        });
    }

    btnOpen.addEventListener('click', async () => {
        errorEl.style.display = 'none';
        try {
            const { data } = await pickExistingFile();
            await launchApp(data, false);
        } catch (e) {
            if (e.name !== 'AbortError') showError(e.message);
        }
    });

    btnNew.addEventListener('click', async () => {
        errorEl.style.display = 'none';
        try {
            await createNewFile();
            await launchApp(null, true);
        } catch (e) {
            if (e.name !== 'AbortError') showError(e.message);
        }
    });
}

setupDb();