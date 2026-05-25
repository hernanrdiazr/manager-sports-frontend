import { api } from '../../../services/api.js';
import { getSportLabel } from '../event/eventSportConfig.js';
import adminEventDetail from '../event/adminEventDetail.js';
import { USE_MOCK_EVENTS, getMockEvents } from '../event/mockEventsData.js';

export default {
    components: { adminEventDetail },

    template: `
        <div class="animate-fade-in">
            <adminEventDetail
                v-if="selectedEvent"
                :event="selectedEvent"
                @close="selectedEvent = null"
                @updated="loadEvents"
            />

            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-3">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">Gestionar eventos</h2>
                        <p class="text-sm text-slate-500 mt-0.5">Equipos, jugadores, marcador y estadísticas del partido</p>
                    </div>
                    <span v-if="useMock" class="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700">Modo demo</span>
                </div>
                <div class="flex items-center gap-3">
                    <select 
                        v-model="filterSport"
                        class="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    >
                        <option value="">Todos los deportes</option>
                        <option value="futbol">Fútbol</option>
                        <option value="beisbol">Béisbol</option>
                        <option value="basquetbol">Básquetbol</option>
                    </select>
                    
                    <div class="relative">
                        <svg class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input 
                            v-model="searchQuery"
                            type="text"
                            placeholder="Buscar evento..."
                            class="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] w-48"
                        >
                    </div>
                </div>
            </div>

            <div v-if="loading" class="flex justify-center py-16">
                <svg class="animate-spin w-8 h-8 text-[#2563EB]" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
            </div>

            <div v-else-if="loadError" class="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">{{ loadError }}</div>

            <div v-else-if="filteredEvents.length > 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-gray-100 bg-gray-50/50">
                                <th class="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Evento</th>
                                <th class="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Deporte</th>
                                <th class="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Fecha</th>
                                <th class="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Tickets</th>
                                <th class="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Estado</th>
                                <th class="text-right px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            <tr v-for="event in filteredEvents" :key="event.id" class="hover:bg-gray-50/50 transition-colors">
                                <td class="px-6 py-4">
                                    <p class="text-sm font-medium text-gray-900">{{ event.organizer }}</p>
                                    <p class="text-xs text-slate-500">{{ event.location }}</p>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600">
                                        {{ sportLabel(event.sport) }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-sm text-slate-500">
                                    {{ formatDate(event.event_date) }}
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-sm text-slate-500">
                                        <span class="font-medium text-gray-700">{{ event.available_tickets }}</span>
                                        <span class="text-slate-400">/{{ event.total_tickets }}</span>
                                    </div>
                                    <div class="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                                        <div 
                                            class="bg-[#2563EB] h-1.5 rounded-full transition-all"
                                            :style="{ width: ticketPercentage(event) + '%' }"
                                        ></div>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="px-2.5 py-1 text-xs font-medium rounded-full"
                                          :class="statusClass(event.status)">
                                        {{ event.status }}
                                    </span>
                                    <p v-if="event.estado_partido" class="text-xs text-slate-400 mt-1">{{ event.estado_partido }}</p>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <button 
                                        @click="openEvent(event)"
                                        class="px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-xl hover:bg-[#1d4ed8] transition-colors"
                                    >
                                        Gestionar
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">No hay eventos</h3>
                <p class="text-slate-500">Crea un evento desde «Crear eventos» para empezar a gestionar</p>
            </div>
        </div>
    `,
    
    data() {
        return {
            events: [],
            selectedEvent: null,
            searchQuery: '',
            filterSport: '',
            loading: false,
            loadError: null
        };
    },
    
    computed: {
        useMock() {
            return USE_MOCK_EVENTS;
        },
        filteredEvents() {
            const list = Array.isArray(this.events) ? this.events : [];
            return list.filter(event => {
                const matchesSearch = !this.searchQuery || 
                    event.organizer?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    event.location?.toLowerCase().includes(this.searchQuery.toLowerCase());
                    
                const matchesSport = !this.filterSport || event.sport === this.filterSport;
                
                return matchesSearch && matchesSport;
            });
        }
    },
    
    async created() {
        await this.loadEvents();
    },
    
    methods: {
        sportLabel(sport) {
            return getSportLabel(sport);
        },

        async loadEvents() {
            this.loading = true;
            this.loadError = null;
            try {
                if (USE_MOCK_EVENTS) {
                    this.events = getMockEvents();
                    return;
                }
                const data = await api.get('/events');
                this.events = Array.isArray(data) ? data : [];
            } catch (error) {
                this.loadError = error.message;
                this.events = USE_MOCK_EVENTS ? getMockEvents() : [];
            } finally {
                this.loading = false;
            }
        },
        
        formatDate(date) {
            if (!date) return '';
            return new Date(date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },
        
        ticketPercentage(event) {
            if (!event.total_tickets) return 0;
            const sold = event.total_tickets - event.available_tickets;
            return Math.round((sold / event.total_tickets) * 100);
        },
        
        statusClass(status) {
            return status === 'activo' 
                ? 'bg-green-50 text-green-600' 
                : 'bg-red-50 text-red-600';
        },

        openEvent(event) {
            this.selectedEvent = event;
        }
    }
};
