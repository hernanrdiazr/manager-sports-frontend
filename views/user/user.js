import { authService } from '../../services/authService.js';
import userSidebar from '../../components/user/userSidebar.js';
import userEvents from '../../components/user/tabs/userEvents.js';
import userTickets from '../../components/user/tabs/userTickets.js';
import eventDetails from '../global/eventDetails.js';

export default {
    components: {
        userSidebar,
        userEvents,
        userTickets,
        eventDetails
    },
    template: `
        <div class="min-h-screen bg-gray-50 flex" style="font-family: 'Inter', sans-serif">
            
            <!-- Sidebar Component -->
            <userSidebar
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
            <div class="flex-1 flex flex-col min-h-screen max-h-screen overflow-hidden">
                
                <!-- Header -->
                <header class="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-gray-200 shrink-0">
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
                <main class="flex-1 overflow-y-auto bg-slate-50">
                    <userEvents v-if="activeTab === 'events-list'" @view-details="showEventDetails" />
                    <userTickets v-else-if="activeTab === 'my-tickets'" />
                    <eventDetails v-else-if="activeTab === 'event-details'" :event-id="selectedEventId" @back="activeTab = 'events-list'" />
                </main>
            </div>
        </div>
    `,
    data() {
        return {
            currentUser: null,
            sidebarOpen: false,
            activeTab: 'events-list',
            selectedEventId: null
        };
    },
    computed: {
        currentTitle() {
            const titles = {
                'events-list': 'Eventos Disponibles',
                'my-tickets': 'Mis Entradas',
                'event-details': 'Detalles del Evento'
            };
            return titles[this.activeTab] || 'Panel de Usuario';
        }
    },
    created() {
        this.currentUser = authService.getCurrentUser();
    },
    methods: {
        handleLogout() {
            authService.logout();
        },
        showEventDetails(eventId) {
            this.selectedEventId = eventId;
            this.activeTab = 'event-details';
        }
    }
};
