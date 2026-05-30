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
            <adminEventDetail
                v-if="selectedEvent"
                :event="selectedEvent"
                @close="selectedEvent = null"
                @updated="loadEvents"
                @cancel-event="handleCancelFromDetail"
            />

            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 class="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Gestionar Eventos</h2>
                    <p class="text-slate-400 text-xs font-bold uppercase tracking-widest mt-0.5">
                        {{ filteredEvents.length }} evento{{ filteredEvents.length !== 1 ? 's' : '' }} encontrado{{ filteredEvents.length !== 1 ? 's' : '' }}
                    </p>
                </div>
                <div class="flex items-center gap-2 flex-wrap">
                    <span v-if="useMock" class="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700">Modo demo</span>

                    <select
                        v-model="filterSport"
                        class="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-400 cursor-pointer transition-colors"
                    >
                        <option value="">Todos los deportes</option>
                        <option value="futbol">Fútbol</option>
                        <option value="beisbol">Béisbol</option>
                        <option value="basquetbol">Básquetbol</option>
                    </select>

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

            <div v-if="loadError" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {{ loadError }}
            </div>

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

            <div v-else-if="filteredEvents.length > 0" class="space-y-3">
                <div
                    v-for="event in filteredEvents"
                    :key="event.id"
                    class="bg-white rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-md shadow-sm transition-all duration-200 group"
                >
                    <div class="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                        <div class="w-11 h-11 rounded-xl flex items-center justify-center text-lg shrink-0 bg-slate-50 border border-slate-100" v-html="sportIconHTML(event.sport)">
                        </div>

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
                                <span v-if="event.status === 'próximo'" class="text-[10px] font-black text-blue-600 flex items-center gap-1">
                                    <svg class="w-3 h-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                    {{ countdowns[event.id] || '—' }}
                                </span>
                                <span v-if="event.status === 'en curso'" class="text-[10px] font-black text-emerald-600 flex items-center gap-1">
                                    <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                                    EN VIVO
                                </span>
                            </div>
                        </div>

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

                        <div class="flex items-center gap-1 shrink-0">
                            <button
                                @click="openLiveManager(event)"
                                class="group/btn p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                title="Gestionar partido"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                </svg>
                            </button>

                            <button
                                v-if="event.status !== 'cancelado' && event.status !== 'finalizado'"
                                @click="deleteEvent(event)"
                                class="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                title="Cancelar evento"
                            >
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

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
            countdowns: {},
            countdownTimer: null
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
        this.countdownTimer = setInterval(() => this.updateCountdowns(), 1000);
    },

    beforeUnmount() {
        if (this.countdownTimer) clearInterval(this.countdownTimer);
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
                this.updateCountdowns();
            } catch (error) {
                console.error('Error cargando eventos:', error);
                this.loadError = 'No se pudieron cargar los eventos. ' + (error.message || '');
                this.events = USE_MOCK_EVENTS ? getMockEvents() : [];
            } finally {
                this.loading = false;
            }
        },

        updateCountdowns() {
            const now = new Date();
            this.events.forEach(event => {
                if (event.status !== 'próximo') return;
                let start = new Date(event.start_time);
                if (isNaN(start.getTime())) {
                    const normalized = String(event.start_time).replace(' ', 'T');
                    start = new Date(normalized);
                    if (isNaN(start.getTime())) return;
                }
                const diff = start - now;
                if (diff <= 0) {
                    this.countdowns[event.id] = '¡Comenzando!';
                    return;
                }
                const d = Math.floor(diff / 86400000);
                const h = Math.floor((diff % 86400000) / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                if (d > 0) {
                    this.countdowns[event.id] = `${d}d ${h}h ${m}m`;
                } else if (h > 0) {
                    this.countdowns[event.id] = `${h}h ${m}m ${s}s`;
                } else {
                    this.countdowns[event.id] = `${m}m ${s}s`;
                }
            });
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
                'próximo':      'bg-blue-50 text-blue-600 border-blue-200',
                'en curso':     'bg-emerald-50 text-emerald-700 border-emerald-200',
                'finalizado':   'bg-slate-100 text-slate-500 border-slate-200',
                'cancelado':    'bg-red-100 text-red-700 border-red-200'
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

        async deleteEvent(event) {
            let summary = null;
            try {
                summary = await api.get(`/events/${event.id}/reservations/summary`);
            } catch { /* no summary */ }

            let hasReservations = summary && summary.total_reservations > 0;
            const revenue = hasReservations
                ? parseFloat(summary.total_revenue).toLocaleString('es-MX', { minimumFractionDigits: 2 })
                : '0.00';

            let html = `
                <div class="text-left space-y-4">
                    <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-700">
                        <p class="font-bold mb-1">Estás por cancelar:</p>
                        <p class="font-semibold">"${event.name || event.organizer}"</p>
                        <p class="text-red-500 mt-1">${event.location} · ${this.formatDate(event.event_date)}</p>
                    </div>
            `;

            if (hasReservations) {
                html += `
                    <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs">
                        <p class="font-bold text-amber-800 mb-2">⚠️ Esto afectará las siguientes reservas:</p>
                        <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-amber-700">
                            <span>Pendientes por aprobar:</span>
                            <span class="font-bold text-right">${summary.pending_reservations} reservas · ${summary.pending_tickets} boletos</span>
                            <span>Ya aprobadas (pagadas):</span>
                            <span class="font-bold text-right">${summary.approved_reservations} reservas · ${summary.approved_tickets} boletos</span>
                            <span class="border-t border-amber-200 pt-1">Total personas afectadas:</span>
                            <span class="font-bold text-right border-t border-amber-200 pt-1">${summary.total_reservations} reservas · ${summary.total_tickets} boletos</span>
                        </div>
                        <div class="mt-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                            <p class="font-bold text-red-700 text-sm">💰 Reembolso total requerido: <span class="text-base">$${revenue}</span></p>
                            <p class="text-red-600 text-[10px] mt-1">Todos los clientes con reservas aprobadas deberán recibir su reembolso completo.</p>
                        </div>
                        <p class="text-amber-600 text-[10px] mt-2">Las reservas pendientes serán rechazadas automáticamente. Los boletos volverán a estar disponibles.</p>
                    </div>
                `;
            } else {
                html += `
                    <div class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 text-center">
                        No hay reservas activas para este evento.
                    </div>
                `;
            }

            html += `
                <div>
                    <label class="block text-xs font-bold text-slate-600 mb-1.5">Motivo de cancelación <span class="text-red-500">*</span></label>
                    <textarea id="swal-cancel-reason" rows="2" class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300" placeholder="Ej: Problemas de logística, condiciones climáticas, fuerza mayor..."></textarea>
                    <p id="swal-cancel-reason-err" class="text-red-500 text-[10px] mt-1 hidden">Debes ingresar un motivo de cancelación.</p>
                </div>
                </div>
            `;

            const result = await Swal.fire({
                title: hasReservations ? '¿Cancelar evento y procesar reembolsos?' : '¿Cancelar evento?',
                html: html,
                icon: hasReservations ? 'error' : 'warning',
                showCancelButton: true,
                confirmButtonText: hasReservations
                    ? 'Sí, cancelar y reembolsar'
                    : 'Sí, cancelar evento',
                cancelButtonText: 'No, mantener evento',
                buttonsStyling: false,
                didOpen: () => {
                    const ta = document.getElementById('swal-cancel-reason');
                    if (ta) setTimeout(() => ta.focus(), 100);
                },
                preConfirm: () => {
                    const reason = document.getElementById('swal-cancel-reason')?.value?.trim();
                    if (!reason) {
                        const err = document.getElementById('swal-cancel-reason-err');
                        if (err) err.classList.remove('hidden');
                        return false;
                    }
                    return { reason };
                },
                customClass: {
                    confirmButton: 'bg-red-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase mr-2 cursor-pointer hover:bg-red-700 transition-colors',
                    cancelButton: 'bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-black uppercase cursor-pointer hover:bg-slate-200 transition-colors'
                }
            });
            if (!result.isConfirmed) return;

            try {
                await api.delete(`/events/${event.id}`);
                event.status = 'cancelado';
                const reason = result.value?.reason;
                Swal.fire({ icon: 'success', title: 'Evento cancelado', html: `<p class="text-sm text-slate-600">Motivo: <strong>${reason}</strong></p>${hasReservations ? `<p class="text-xs text-amber-600 mt-2">💰 Los reembolsos por <strong>$${revenue}</strong> deben ser procesados a los clientes afectados.</p>` : ''}`, toast: false, position: 'center', showConfirmButton: true, confirmButtonText: 'Entendido', buttonsStyling: false, customClass: { confirmButton: 'bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase cursor-pointer hover:bg-blue-700 transition-colors' } });
            } catch (error) {
                console.error('Error eliminando evento:', error);
                Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cancelar el evento. Intenta de nuevo.', toast: true, position: 'top', showConfirmButton: false, timer: 3000 });
            }
        },

        handleCancelFromDetail(eventId) {
            const event = this.events.find(e => e.id === eventId);
            if (event) this.deleteEvent(event);
        },

        openLiveManager(event) {
            this.selectedEvent = event;
        }
    }
};
