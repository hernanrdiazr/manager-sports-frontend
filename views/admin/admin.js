// admin.js - Panel de administración
import { api } from "../../services/api.js"
import { authService } from '../../services/authService.js';
import adminSidebar from '../../components/admin/adminSidebar.js';
import adminDashboard from '../../components/admin/tabs/adminDashboard.js';
import adminCreateEvents from '../../components/admin/tabs/adminCreateEvents.js';
import adminManageEvents from "../../components/admin/tabs/adminManageEvents.js";

export default {
    components: {
        adminSidebar,
        adminDashboard,
        adminCreateEvents,
        adminManageEvents
    },
    
    template: `
        <div class="min-h-screen bg-gray-50 flex" style="font-family: 'Inter', sans-serif">
            
            <!-- ✅ Sidebar Component -->
            <adminSidebar
                v-model="sidebarOpen"
                :active-tab="activeTab"
                :current-user="currentUser"
                @tab-change="activeTab = $event"
            />

            <!-- Overlay mobile -->
            <div 
                v-if="sidebarOpen" 
                @click="sidebarOpen = false"
                class="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            ></div>

            <!-- Contenido Principal -->
            <div class="flex-1 flex flex-col min-h-screen">
                
                <!-- Header -->
                <header class="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200">
                    <div class="flex items-center justify-between h-16 px-4 sm:px-6">
                        <div class="flex items-center gap-4">
                            <button @click="sidebarOpen = true" class="lg:hidden text-gray-500 hover:text-gray-700">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                                </svg>
                            </button>
                            <h1 class="text-xl font-bold text-gray-900">{{ currentTitle }}</h1>
                        </div>
                        
                        <button 
                            @click="handleLogout"
                            class="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                            </svg>
                            <span class="hidden sm:inline">Cerrar Sesión</span>
                        </button>
                    </div>
                </header>

                <!-- Contenido Dinámico -->
                <main class="flex-1 p-4 sm:p-6">
                    <!-- Loading -->
                    <div v-if="loading" class="flex justify-center py-12">
                        <div class="text-center">
                            <svg class="animate-spin w-12 h-12 text-[#2563EB] mx-auto mb-4" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            <p class="text-slate-500 text-sm">Cargando panel...</p>
                        </div>
                    </div>

                    <!-- Error -->
                    <div v-else-if="authError" class="text-center py-12">
                        <div class="bg-white border border-red-200 rounded-2xl p-8 max-w-md mx-auto shadow-sm">
                            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                                </svg>
                            </div>
                            <p class="text-gray-600 mb-4">{{ authError }}</p>
                            <button @click="redirectToLogin" class="bg-[#2563EB] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#1d4ed8] transition-colors">
                                Ir al Login
                            </button>
                        </div>
                    </div>

                    <!-- ✅ Componentes dinámicos por tab -->
                    <template v-else>
                        <adminDashboard v-if="activeTab === 'dashboard'" :stats="stats" />
                        <adminCreateEvents v-if="activeTab === 'events-create'" />
                        <adminManageEvents v-if="activeTab === 'events-manage'" />
                    </template>
                </main>
            </div>
        </div>
    `,
    
    data() {
        return {
            currentUser: null,
            loading: true,
            authError: null,
            sidebarOpen: false,
            activeTab: 'dashboard',
            stats: {
                totalUsers: 0,
                totalEvents: 0,
                totalTickets: 0,
                monthlyRevenue: 0
            }
        };
    },
    
    computed: {
        currentTitle() {
            const titles = {
                dashboard: 'Dashboard',
                events: 'Eventos',
            };
            return titles[this.activeTab] || 'Dashboard';
        }
    },
    
    async created() {
        this.currentUser = authService.getCurrentUser();
        
        if (!authService.isAuthenticated()) {
            this.authError = 'No tienes acceso. Debes iniciar sesión como administrador.';
            this.loading = false;
            return;
        }
        
        await this.loadStats();
    },
    
    methods: {
        async loadStats() {
            try {
                const stats = await api.get('/admin/stats');
                this.stats = stats;
            } catch (error) {
                console.error('Error cargando stats:', error);
            } finally {
                this.loading = false;
            }
        },
        
        handleLogout() {
            authService.logout();
        },
        
        redirectToLogin() {
            window.location.href = '/#/login/admin';
        }
    }
};