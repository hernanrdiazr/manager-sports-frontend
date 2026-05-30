// AdminManageEvents.js
import { api } from '../../../services/api.js';
import { getSportLabel } from '../event/eventSportConfig.js';
import adminEventDetail from '../event/adminEventDetail.js';
import { USE_MOCK_EVENTS, getMockEvents } from '../event/mockEventsData.js';

export default {
    components: {
        adminEventDetail
    },
    template: `
        <div class="animate-fade-in space-y-6">
            <!-- Inline Admin Event Live Manager -->
            <adminEventDetail
                v-if="selectedEvent"
                :event="selectedEvent"
                @close="selectedEvent = null"
                @updated="loadEvents"
            />

            <!-- Header + Filtros -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 class="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Gestionar Eventos</h2>
                    <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">
                        {{ filteredEvents.length }} evento{{ filteredEvents.length !== 1 ? 's' : '' }} encontrado{{ filteredEvents.length !== 1 ? 's' : '' }}
                    </p>
                </div>
                <div class="flex items-center gap-2 flex-wrap">
                    <span v-if="useMock" class="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700">Modo demo</span>
                    
                    <!-- Filtro Deporte -->
                    <select 
                        v-model="filterSport"
                        class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-400 cursor-pointer transition-colors"
                    >
                        <option value="">Todos los deportes</option>
                        <option value="futbol">Fútbol</option>
                        <option value="beisbol">Béisbol</option>
                        <option value="basquetbol">Básquetbol</option>
                        <option value="otro">Otro</option>
                    </select>

                    <!-- Buscador -->
                    <div class="relative">
                        <svg class="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input 
                            v-model="searchQuery"
                            type="text"
                            placeholder="Buscar evento..."
                            class="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-400 w-44 transition-colors"
                        >
                    </div>

                    <!-- Recargar -->
                    <button
                        @click="loadEvents"
                        :disabled="loading"
                        class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-100"
                        title="Recargar lista"
                    >
                        <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Error -->
            <div v-if="loadError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {{ loadError }}
            </div>

            <!-- Loading skeleton -->
            <div v-if="loading && events.length === 0" class="grid grid-cols-1 gap-3">
                <div v-for="i in 4" :key="i" class="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-slate-100 rounded-xl shrink-0"></div>
                        <div class="flex-1 space-y-2">
                            <div class="h-3 bg-slate-100 rounded w-1/3"></div>
                            <div class="h-2 bg-slate-100 rounded w-1/5"></div>
                        </div>
                        <div class="h-6 w-16 bg-slate-100 rounded-full"></div>
                    </div>
                </div>
            </div>

            <!-- Lista de eventos (cards) -->
            <div v-else-if="filteredEvents.length > 0" class="space-y-3">
                <div
                    v-for="event in filteredEvents"
                    :key="event.id"
                    class="bg-white rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-md shadow-sm transition-all duration-200 group"
                >
                    <div class="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                        <!-- Sport icon badge -->
                        <div class="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 bg-slate-50 border border-slate-100" v-html="sportIconHTML(event.sport)">
                        </div>

                        <!-- Main info -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-start gap-2 flex-wrap">
                                <p class="text-sm font-black text-slate-900 uppercase italic truncate">{{ event.name || event.organizer }}</p>
                                <span 
                                    class="px-2 py-0.5 text-[9px] font-black rounded-full uppercase tracking-wider border shrink-0"
                                    :class="statusClass(event.status)"
                                >
                                    {{ event.status }}
                                </span>
                            </div>
                            <div class="flex items-center gap-3 mt-1.5 flex-wrap">
                                <span class="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                    {{ event.location }}
                                </span>
                                <span class="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                    {{ formatDate(event.event_date) }}
                                </span>
                            </div>
                        </div>

                        <!-- Tickets progress -->
                        <div class="sm:w-36 shrink-0">
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entradas</span>
                                <span class="text-[9px] font-black text-slate-600">
                                    {{ event.available_tickets }}<span class="text-slate-300">/{{ event.total_tickets }}</span>
                                </span>
                            </div>
                            <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                <div 
                                    class="h-1.5 rounded-full transition-all duration-500"
                                    :class="ticketPercentage(event) > 80 ? 'bg-red-400' : ticketPercentage(event) > 50 ? 'bg-amber-400' : 'bg-blue-500'"
                                    :style="{ width: ticketPercentage(event) + '%' }"
                                ></div>
                            </div>
                            <p class="text-[9px] text-slate-400 font-bold mt-0.5 text-right">{{ ticketPercentage(event) }}% vendido</p>
                        </div>

                        <!-- Acciones -->
                        <div class="flex items-center gap-1 shrink-0">
                            <!-- Ver detalles -->
                            <button 
                                @click="viewDetails(event)"
                                class="group/btn p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                title="Ver detalles"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                </svg>
                            </button>

                            <!-- Gestionar alineaciones y estadísticas -->
                            <button 
                                @click="openLiveManager(event)"
                                class="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                title="Gestionar partido en vivo"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                            </button>

                            <!-- Toggle estado -->
                            <button 
                                @click="toggleStatus(event)"
                                class="p-2.5 rounded-xl transition-all"
                                :class="event.status === 'activo' 
                                    ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50' 
                                    : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50'"
                                :title="event.status === 'activo' ? 'Pausar evento' : 'Activar evento'"
                            >
                                <svg v-if="event.status === 'activo'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </button>

                            <!-- Eliminar -->
                            <button 
                                @click="deleteEvent(event)"
                                class="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="Eliminar evento"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Estado vacío -->
            <div v-else-if="!loading" class="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center">
                <div class="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl text-slate-400">
                    <i v-if="searchQuery || filterSport" class="fa-solid fa-magnifying-glass"></i>
                    <i v-else class="fa-solid fa-calendar-days"></i>
                </div>
                <h3 class="text-sm font-black text-slate-800 uppercase italic mb-1">
                    {{ searchQuery || filterSport ? 'Sin resultados' : 'Sin eventos registrados' }}
                </h3>
                <p class="text-slate-400 text-xs font-medium max-w-xs mx-auto">
                    {{ searchQuery || filterSport ? 'Prueba con otros filtros o términos de búsqueda.' : 'Ve a "Crear Eventos" para publicar el primero.' }}
                </p>
                <button v-if="searchQuery || filterSport" @click="searchQuery = ''; filterSport = ''" class="mt-4 text-blue-600 text-xs font-black uppercase tracking-widest hover:underline">
                    Limpiar filtros
                </button>
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
            loadError: null,
        };
    },

    computed: {
        useMock() {
            return USE_MOCK_EVENTS;
        },
        filteredEvents() {
            const list = Array.isArray(this.events) ? this.events : [];
            return list.filter(event => {
                const q = this.searchQuery.toLowerCase();
                const matchesSearch = !q ||
                    (event.name || event.organizer || '').toLowerCase().includes(q) ||
                    (event.location || '').toLowerCase().includes(q) ||
                    (event.sport || '').toLowerCase().includes(q);
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
                const response = await api.get('/events');
                this.events = Array.isArray(response) ? response : [];
            } catch (error) {
                console.error('Error cargando eventos:', error);
                this.loadError = 'No se pudieron cargar los eventos. ' + (error.message || '');
                this.events = USE_MOCK_EVENTS ? getMockEvents() : [];
            } finally {
                this.loading = false;
            }
        },

        formatDate(dateStr) {
            if (!dateStr) return '';
            try {
                return new Date(dateStr).toLocaleDateString('es-ES', {
                    year: 'numeric', month: 'short', day: 'numeric'
                });
            } catch { return dateStr; }
        },

        ticketPercentage(event) {
            if (!event.total_tickets) return 0;
            const sold = event.total_tickets - (event.available_tickets || 0);
            return Math.min(100, Math.round((sold / event.total_tickets) * 100));
        },

        statusClass(status) {
            const map = {
                'activo':       'bg-emerald-50 text-emerald-700 border-emerald-200',
                'pausado':      'bg-amber-50 text-amber-600 border-amber-200',
                'cancelado':    'bg-red-100 text-red-700 border-red-200',
                'finalizado':   'bg-slate-100 text-slate-500 border-slate-200',
                'en curso':     'bg-cyan-50 text-cyan-700 border-cyan-200',
                'próximo':      'bg-blue-50 text-blue-600 border-blue-200',
            };
            return map[status?.toLowerCase()] || 'bg-slate-100 text-slate-500 border-slate-200';
        },

        sportIconHTML(sport) {
            const map = {
                futbol: '<i class="fa-solid fa-futbol text-slate-700"></i>',
                beisbol: '<i class="fa-solid fa-baseball text-amber-900"></i>',
                basquetbol: '<i class="fa-solid fa-basketball text-orange-500"></i>'
            };
            return map[sport] || '<i class="fa-solid fa-trophy text-yellow-500"></i>';
        },

        async toggleStatus(event) {
            const newStatus = event.status === 'activo' ? 'pausado' : 'activo';
            try {
                await api.put(`/events/${event.id}/status`, { status: newStatus });
                event.status = newStatus;
            } catch (error) {
                console.error('Error al cambiar el estado:', error);
                Swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un problema actualizando el estado.', toast: true, position: 'top', showConfirmButton: false, timer: 3000 });
            }
        },

        async deleteEvent(event) {
            const result = await Swal.fire({
                title: '¿Cancelar evento?',
                html: `<p class="text-sm text-slate-600">Esto cancelará el evento <strong>"${event.name || event.organizer}"</strong> y no estará disponible para nuevas reservas.</p>`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, cancelar',
                cancelButtonText: 'No, mantener',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'bg-red-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase mr-2 cursor-pointer hover:bg-red-700 transition-colors',
                    cancelButton: 'bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-black uppercase cursor-pointer hover:bg-slate-200 transition-colors'
                }
            });
            if (!result.isConfirmed) return;

            try {
                await api.delete(`/events/${event.id}`);
                event.status = 'cancelado';
                Swal.fire({ icon: 'success', title: 'Cancelado', text: 'El evento ha sido cancelado correctamente.', toast: true, position: 'top', showConfirmButton: false, timer: 3000 });
            } catch (error) {
                console.error('Error eliminando evento:', error);
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el evento.', toast: true, position: 'top', showConfirmButton: false, timer: 3000 });
            }
        },

        viewDetails(event) {
            this.$emit('view-details', event.id);
        },

        openLiveManager(event) {
            this.selectedEvent = event;
        }
    }
};