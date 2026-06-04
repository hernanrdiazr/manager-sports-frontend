import { api } from '../../../services/api.js';

export default {
    template: `
        <div class="animate-fade-in">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-gray-900">Dashboard</h2>
            </div>

            <!-- Filtros -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-wrap items-end gap-4">
                <div>
                    <label class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Desde</label>
                    <input v-model="filters.startDate" type="date"
                           class="mt-1 block px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30" />
                </div>
                <div>
                    <label class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Hasta</label>
                    <input v-model="filters.endDate" type="date"
                           class="mt-1 block px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30" />
                </div>
                <div>
                    <label class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Deporte</label>
                    <select v-model="filters.sport"
                            class="mt-1 block px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30">
                        <option value="">Todos</option>
                        <option value="futbol">Fútbol</option>
                        <option value="beisbol">Béisbol</option>
                        <option value="basquetbol">Básquetbol</option>
                        <option value="otro">Otro</option>
                    </select>
                </div>
                <button @click="loadStats" :disabled="loading"
                        class="px-5 py-2 bg-[#2563EB] text-white rounded-xl text-sm font-medium hover:bg-[#1d4ed8] disabled:opacity-50 flex items-center gap-2">
                    <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    {{ loading ? 'Cargando…' : 'Aplicar' }}
                </button>
            </div>

            <!-- Banner: evento seleccionado -->
            <div v-if="selectedEventId" class="mb-6 px-4 py-3 bg-[#2563EB]/10 border border-[#2563EB]/20 rounded-2xl flex items-center justify-between">
                <div class="flex items-center gap-2 text-sm text-[#2563EB] font-medium">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    Filtrando por evento: <span class="font-bold">{{ selectedEventName }}</span>
                </div>
                <button @click="clearEventFilter"
                        class="text-xs text-[#2563EB] hover:text-[#1d4ed8] font-semibold flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    Ver todos
                </button>
            </div>

            <!-- Detalle del evento seleccionado -->
            <div v-if="selectedEvent" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <div class="flex flex-wrap items-start justify-between gap-4">

                    <!-- Info principal -->
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-600 uppercase tracking-wide">
                                {{ sportLabel(selectedEvent.sport) }}
                            </span>
                            <span class="px-2.5 py-1 text-xs font-semibold rounded-full"
                                  :class="selectedEvent.status === 'activo' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'">
                                {{ selectedEvent.status }}
                            </span>
                        </div>
                        <h3 class="text-xl font-bold text-gray-900 mb-1">{{ selectedEvent.organizer }}</h3>
                        <p class="text-sm text-slate-500 flex items-center gap-1">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            {{ selectedEvent.location }}
                        </p>
                        <p class="text-sm text-slate-400 mt-1 flex items-center gap-1">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                            </svg>
                            {{ formatEventDate(selectedEvent.event_date) }}
                        </p>
                    </div>

                    <!-- Marcador central -->
                    <div class="flex flex-col items-center justify-center px-8 py-4 bg-slate-50 rounded-2xl min-w-[220px]">
                        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Resultado</p>
                        <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3 w-full">
                            <div class="text-center">
                                <p class="text-xs text-slate-500 font-medium truncate mb-1">{{ selectedEvent.home_team_name || 'Local' }}</p>
                                <p class="text-4xl font-black text-gray-900 tabular-nums">{{ selectedEvent.home_score }}</p>
                            </div>
                            <span class="text-2xl text-slate-300 font-light">—</span>
                            <div class="text-center">
                                <p class="text-xs text-slate-500 font-medium truncate mb-1">{{ selectedEvent.away_team_name || 'Visitante' }}</p>
                                <p class="text-4xl font-black text-gray-900 tabular-nums">{{ selectedEvent.away_score }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- Tickets -->
                    <div class="flex flex-col items-center justify-center px-6 py-4 bg-slate-50 rounded-2xl min-w-[120px]">
                        <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tickets</p>
                        <p class="text-2xl font-black text-gray-900">
                            {{ (selectedEvent.total_tickets_capacity - selectedEvent.available_tickets).toLocaleString('es-ES') }}
                        </p>
                        <p class="text-xs text-slate-400 mt-1">de {{ selectedEvent.total_tickets_capacity.toLocaleString('es-ES') }}</p>
                        <div class="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                            <div class="bg-[#2563EB] h-1.5 rounded-full"
                                 :style="{ width: Math.round(((selectedEvent.total_tickets_capacity - selectedEvent.available_tickets) / (selectedEvent.total_tickets_capacity || 1)) * 100) + '%' }">
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Stats Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                <div v-for="card in statsCards" :key="card.label"
                     class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 rounded-xl flex items-center justify-center" :class="card.bgColor">
                            <svg class="w-6 h-6" :class="card.iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" :d="card.icon"/>
                            </svg>
                        </div>
                    </div>
                    <p class="text-2xl font-bold text-gray-900">{{ card.value }}</p>
                    <p class="text-sm text-slate-500 mt-1">{{ card.label }}</p>
                </div>
            </div>

            <!-- Embudo -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                <h3 class="text-sm font-semibold text-gray-700 mb-5">Embudo de ventas</h3>
                <div class="flex flex-col items-start gap-1">

                    <!-- Capacidad -->
                    <span class="text-gray-800">🎟️ Capacidad total</span>
                    <div class="flex flex-col items-center transition-all duration-500" :style="{ width: funnelWidths.capacidad }">
                        <div class="w-full bg-[#2563EB] rounded-xl py-3 px-4 flex items-center justify-between text-white text-sm font-medium">
                            <span class="font-bold text-base">{{ funnel.capacidad.toLocaleString('es-ES') }}</span>
                        </div>
                    </div>

                    <!-- Flecha -->
                    <div class="w-0 h-0" style="border-left:18px solid transparent;border-right:18px solid transparent;border-top:10px solid #2563EB;opacity:0.3"></div>

                    <!-- Reservaciones -->
                    <span class="text-gray-800">📋 Reservaciones</span><span class="text-xs ml-2 opacity-80">({{ funnelPct(funnel.reservaciones, funnel.capacidad) }}%)</span>
                    <div class="flex flex-col items-center transition-all duration-500" :style="{ width: funnelWidths.reservaciones }">
                        <div class="w-full bg-[#06B6D4] rounded-xl py-3 px-4 flex items-center justify-between text-sm font-medium">
                            <div class="text-right">
                                <span class="font-bold text-base">{{ funnel.reservaciones.toLocaleString('es-ES') }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Flecha -->
                    <div class="w-0 h-0" style="border-left:18px solid transparent;border-right:18px solid transparent;border-top:10px solid #06B6D4;opacity:0.3"></div>

                    <!-- Confirmados/Pagados -->
                    <span class="text-gray-800">✅ Confirmados</span><span class="text-xs ml-2 opacity-80">({{ funnelPct(funnel.confirmados, funnel.capacidad) }}%)</span>
                    <div class="flex flex-col items-center transition-all duration-500" :style="{ width: funnelWidths.confirmados }">
                        <div class="w-full bg-green-500 rounded-xl py-3 px-4 flex items-center justify-between text-sm font-medium"">
                            <div class="text-right">
                                <span class="font-bold text-base">{{ funnel.confirmados.toLocaleString('es-ES') }}</span>
                                
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <!-- Gráfico -->
            <div v-if="!selectedEventId" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6" style="position:relative; height:320px;">
                <canvas id="myChart"></canvas>
            </div>

            <!-- Lista de eventos agrupada por fecha (oculta cuando hay evento seleccionado) -->
            <div v-if="!selectedEventId" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-100">
                    <h3 class="text-sm font-semibold text-gray-700">Eventos en el período</h3>
                </div>

                <div v-if="groupedEvents.length === 0 && !loadingMore" class="px-6 py-12 text-center text-slate-400 text-sm">
                    No hay eventos para los filtros seleccionados.
                </div>

                <div v-else>
                    <template v-for="group in groupedEvents" :key="group.date">
                        <!-- Encabezado de fecha -->
                        <div class="px-6 py-2 bg-slate-50 border-b border-gray-100 sticky top-0 z-10">
                            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                {{ formatGroupDate(group.date) }}
                            </span>
                        </div>

                        <!-- Eventos de esa fecha -->
                        <div v-for="event in group.events" :key="event.id"
                             class="grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-4 border-b border-gray-50 hover:bg-slate-50/60 transition-colors">

                            <!-- Izquierda: sport + nombre + ubicación -->
                            <div class="flex items-center gap-3 min-w-0">
                                <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-600 uppercase tracking-wide whitespace-nowrap">
                                    {{ event.sport }}
                                </span>
                                <div class="min-w-0">
                                    <p class="text-base font-semibold text-gray-900 truncate">{{ event.organizer }}</p>
                                    <p class="text-sm text-slate-400 truncate">{{ event.location }}</p>
                                </div>
                            </div>

                            <!-- Derecha: equipos centrados + marcador + tickets + estado -->
                            <div class="flex items-center gap-8 shrink-0">
                                <!-- Equipos centrados -->
                                <div class="text-center min-w-[160px]">
                                    <p class="text-xs text-slate-400 mb-0.5">Equipos</p>
                                    <p class="text-sm font-semibold text-gray-800 text-center">
                                        {{ event.home_team_name || '—' }}
                                        <span class="text-slate-400 font-normal mx-1">vs</span>
                                        {{ event.away_team_name || '—' }}
                                    </p>
                                </div>
                                <div class="text-center">
                                    <p class="text-xs text-slate-400 mb-0.5">Marcador</p>
                                    <p class="text-base font-bold text-gray-900">
                                        {{ event.home_score }} – {{ event.away_score }}
                                    </p>
                                </div>
                                <div class="text-center">
                                    <p class="text-xs text-slate-400 mb-0.5">Tickets</p>
                                    <p class="text-sm font-medium text-gray-700">
                                        {{ event.available_tickets }}/{{ event.total_tickets_capacity }}
                                    </p>
                                </div>
                                <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                                      :class="event.status === 'activo' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-500'">
                                    {{ event.status }}
                                </span>
                                <button @click="selectEvent(event)"
                                        class="p-1.5 rounded-lg text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 transition-colors"
                                        title="Ver estadísticas de este evento">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </template>

                    <!-- Sentinel de infinite scroll -->
                    <div ref="scrollSentinel" class="py-4 flex justify-center">
                        <svg v-if="loadingMore" class="animate-spin w-5 h-5 text-[#2563EB]" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        <span v-else-if="allEventsLoaded && groupedEvents.length > 0" class="text-xs text-slate-400">
                            Todos los eventos cargados
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `,

    data() {
        return {
            loading: false,
            chart: null,
            filters: {
                startDate: '',
                endDate: '',
                sport: ''
            },
            indicatorsGestion: null,
            eventsHistory: [],
            ticketsByDay: [],
            funnel: { capacidad: 0, reservaciones: 0, confirmados: 0 },
            selectedEventId: null,
            selectedEventName: null,
            selectedEvent: null,
            eventsList: [],
            eventsOffset: 0,
            eventsPageSize: 100,
            loadingMore: false,
            allEventsLoaded: false,
            scrollObserver: null
        };
    },

    computed: {
        funnelWidths() {
            const cap = Math.max(Math.round((this.funnel.capacidad) * 100), this.funnel.capacidad > 0 ? 5 : 0);
            const resPct  = Math.max(Math.round((this.funnel.reservaciones / cap) * 100), this.funnel.reservaciones > 0 ? 5 : 0);
            const confPct = Math.max(Math.round((this.funnel.confirmados   / cap) * 100), this.funnel.confirmados  > 0 ? 5 : 0);
            return {
                reservaciones: resPct  + '%',
                confirmados:   confPct + '%',
                resPct,
                confPct
            };
        },

        groupedEvents() {
            const groups = {};
            this.eventsList.forEach(e => {
                if (!groups[e.event_date]) groups[e.event_date] = [];
                groups[e.event_date].push(e);
            });
            return Object.entries(groups).map(([date, events]) => ({ date, events }));
        },

        statsCards() {
            const ind = this.indicatorsGestion || {};
            return [
                {
                    label: 'Tickets vendidos',
                    value: (ind.total_asistentes || 0).toLocaleString('es-ES'),
                    icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
                    bgColor: 'bg-blue-50', iconColor: 'text-[#2563EB]'
                },
                {
                    label: 'Ocupación',
                    value: (ind.porcentaje_ocupacion || 0) + '%',
                    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                    bgColor: 'bg-cyan-50', iconColor: 'text-[#06B6D4]'
                },
                {
                    label: 'Ingresos totales',
                    value: '$' + (ind.ingresos_totales || 0).toLocaleString('es-ES'),
                    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
                    bgColor: 'bg-purple-50', iconColor: 'text-purple-500'
                },
                {
                    label: 'Promedio por evento',
                    value: '$' + (ind.promedio_ingreso_por_evento || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 }),
                    icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
                    bgColor: 'bg-green-50', iconColor: 'text-green-500'
                }
            ];
        }
    },

    async mounted() {
        await this.loadStats();
        this.initScrollObserver();
    },

    beforeUnmount() {
        if (this.chart) this.chart.destroy();
        if (this.scrollObserver) this.scrollObserver.disconnect();
    },

    methods: {
        funnelPct(value, total) {
            if (!total) return 0;
            return Math.round((value / total) * 100);
        },

        initScrollObserver() {
            this.scrollObserver = new IntersectionObserver(async (entries) => {
                if (entries[0].isIntersecting && !this.loadingMore && !this.allEventsLoaded) {
                    await this.loadMoreEvents();
                }
            }, { threshold: 0.1 });

            this.$nextTick(() => {
                if (this.$refs.scrollSentinel) {
                    this.scrollObserver.observe(this.$refs.scrollSentinel);
                }
            });
        },

        async loadMoreEvents() {
            this.loadingMore = true;
            try {
                const url = '/admin/stats/eventsList' + this.filterParams({
                    limit: this.eventsPageSize,
                    offset: this.eventsOffset
                });
                const rows = await api.get(url);
                if (rows.length < this.eventsPageSize) this.allEventsLoaded = true;
                this.eventsList.push(...rows);
                this.eventsOffset += rows.length;
            } catch (e) {
                console.error('Error cargando eventos:', e);
            } finally {
                this.loadingMore = false;
            }
        },

        formatGroupDate(dateStr) {
            return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
        },

        async selectEvent(event) {
            this.selectedEventId = event.id;
            this.selectedEventName = event.organizer;
            this.selectedEvent = event;
            await this.loadStats();
        },

        async clearEventFilter() {
            this.selectedEventId = null;
            this.selectedEventName = null;
            this.selectedEvent = null;
            await this.loadStats();
        },

        formatEventDate(dateStr) {
            if (!dateStr) return '';
            return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
        },

        sportLabel(sport) {
            const map = { futbol: 'Fútbol', beisbol: 'Béisbol', basquetbol: 'Básquetbol', otro: 'Otro' };
            return map[sport] || sport;
        },

        // Construye el query string solo con los filtros que tengan valor
        filterParams(extra = {}) {
            const { startDate, endDate, sport } = this.filters;
            const parts = [];
            if (startDate) parts.push(`start_date=${startDate}`);
            if (endDate)   parts.push(`end_date=${endDate}`);
            if (sport)     parts.push(`sport=${sport}`);
            if (this.selectedEventId) parts.push(`event_id=${this.selectedEventId}`);
            for (const [k, v] of Object.entries(extra)) parts.push(`${k}=${v}`);
            return parts.length ? '?' + parts.join('&') : '';
        },

        buildQuery(base) {
            return base + this.filterParams();
        },

        async loadStats() {
            this.loading = true;
            try {
                const [ind, hist, funnel, byDay] = await Promise.all([
                    api.get(this.buildQuery('/admin/stats/indicatorsGestion')),
                    api.get(this.buildQuery('/admin/stats/eventsHistory')),
                    api.get(this.buildQuery('/admin/stats/funnel')),
                    api.get(this.buildQuery('/admin/stats/ticketsByDay'))
                ]);
                this.indicatorsGestion = ind;
                this.eventsHistory = Array.isArray(hist) ? hist : [];
                this.ticketsByDay = Array.isArray(byDay) ? byDay : [];
                this.funnel = funnel || { capacidad: 0, reservaciones: 0, confirmados: 0 };
                // Resetear lista para nueva búsqueda
                this.eventsList = [];
                this.eventsOffset = 0;
                this.allEventsLoaded = false;
                await this.loadMoreEvents();
                this.renderChart();
            } catch (e) {
                console.error('Error cargando dashboard:', e);
            } finally {
                this.loading = false;
            }
        },

        renderChart() {
            const ctx = document.getElementById('myChart');
            if (!ctx) return;

            const labels = this.ticketsByDay.map(e =>
                new Date(e.event_date + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
            );
            const values = this.ticketsByDay.map(e => e.ticket_count || 0);
            const maxVal = values.length > 0 ? Math.max(...values) : 10;

            if (this.chart) this.chart.destroy();

            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels,
                    datasets: [{
                        label: 'Tickets vendidos',
                        data: values,
                        borderColor: '#2563EB',
                        backgroundColor: 'rgba(37,99,235,0.08)',
                        pointRadius: 5,
                        pointHoverRadius: 8,
                        tension: 0.3,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: 'Tickets vendidos por día',
                            font: { size: 15 }
                        }
                    },
                    scales: {
                        x: { title: { display: true, text: 'Día' } },
                        y: {
                            min: 0,
                            max: Math.round(maxVal * 1.2) || 10,
                            title: { display: true, text: 'Tickets' },
                            ticks: { stepSize: 1 }
                        }
                    }
                }
            });
        }
    }
};
