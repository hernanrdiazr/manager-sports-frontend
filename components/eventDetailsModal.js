import { api } from '../services/api.js';

export default {
    props: {
        eventId: {
            type: Number,
            required: true
        },
        show: {
            type: Boolean,
            default: false
        }
    },
    emits: ['close'],
    template: `
        <div 
            v-if="show" 
            class="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6"
            style="font-family: 'Inter', sans-serif;"
        >
            <!-- Overlay dark blurred -->
            <div 
                @click="closeModal" 
                class="fixed inset-0 bg-[#0F172A]/70 backdrop-blur-md transition-opacity duration-300"
            ></div>

            <!-- Modal Content Card -->
            <div 
                class="relative bg-white rounded-[2rem] w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col z-10 transform scale-100 transition-all duration-300 animate-fade-in"
            >
                <!-- Modal Header -->
                <div class="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 sm:p-8 shrink-0 relative">
                    <!-- Close button -->
                    <button 
                        @click="closeModal" 
                        class="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                    >
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>

                    <!-- Event Name & Location -->
                    <div class="flex items-center gap-3 mb-3">
                        <span class="px-3 py-1 text-[10px] font-black rounded-full bg-blue-500/20 text-[#06B6D4] uppercase tracking-widest border border-[#06B6D4]/30">
                            {{ event?.sport }}
                        </span>
                        <span 
                            :class="statusClasses[eventStatus.toLowerCase()] || 'bg-slate-700 text-slate-300'"
                            class="px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest border border-white/10"
                        >
                            {{ eventStatus }}
                        </span>
                    </div>
                    <h3 class="text-2xl sm:text-3xl font-black tracking-tight uppercase italic text-white pr-10">
                        {{ event?.name || 'Detalles del Evento' }}
                    </h3>
                    <p class="text-slate-400 text-xs font-bold uppercase tracking-wider mt-2 flex items-center gap-2">
                        <span>📍 {{ event?.location }}</span>
                        <span class="text-white/20">•</span>
                        <span>📅 {{ formatDate(event?.event_date) }}</span>
                    </p>
                </div>

                <!-- Tab Selector -->
                <div class="bg-slate-50 border-b border-slate-100 px-6 sm:px-8 py-3 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
                    <button 
                        v-for="tab in availableTabs" 
                        :key="tab.id"
                        @click="activeTab = tab.id"
                        class="px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200"
                        :class="activeTab === tab.id 
                            ? 'bg-[#0f172a] text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'"
                    >
                        {{ tab.label }}
                    </button>
                </div>

                <!-- Modal Body: Scrollable -->
                <div class="flex-grow overflow-y-auto p-6 sm:p-8 bg-slate-50/30">
                    <!-- Loading state -->
                    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 border-l-transparent mb-4"></div>
                        <p class="text-slate-500 text-sm font-semibold">Cargando estadísticas...</p>
                    </div>

                    <!-- ERROR State -->
                    <div v-else-if="error" class="text-center py-12">
                        <span class="text-4xl block mb-3">⚠️</span>
                        <h4 class="text-lg font-black text-slate-800 uppercase mb-2">Error de conexión</h4>
                        <p class="text-slate-500 text-sm max-w-md mx-auto">{{ error }}</p>
                    </div>

                    <div v-else>
                        <!-- ==================== TAB: INFO / DETALLES ==================== -->
                        <div v-if="activeTab === 'info'" class="space-y-6 animate-fade-in">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
                                    <div>
                                        <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Información General</h4>
                                        <div class="space-y-4">
                                            <div>
                                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Fecha y Hora</p>
                                                <p class="text-sm font-bold text-slate-800 mt-0.5">
                                                    {{ formatDate(event?.event_date) }} | {{ formatTime(event?.start_time) }} - {{ formatTime(event?.end_time) }}
                                                </p>
                                            </div>
                                            <div>
                                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Ubicación</p>
                                                <p class="text-sm font-bold text-slate-800 mt-0.5">{{ event?.location }}</p>
                                            </div>
                                            <div>
                                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-wider">Precios de Entrada</p>
                                                <p class="text-lg font-black text-emerald-600 mt-0.5">$ {{ event?.ticket_price }}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-slate-500 text-xs">
                                        <span>Tickets Totales: <b>{{ event?.total_tickets }}</b></span>
                                        <span>Disponibles: <b class="text-blue-600">{{ event?.available_tickets }}</b></span>
                                    </div>
                                </div>

                                <!-- Leaflet Map Box -->
                                <div class="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm h-64 md:h-auto relative">
                                    <div id="modal-map" class="w-full h-full min-h-[240px] z-0"></div>
                                </div>
                            </div>
                        </div>

                        <!-- ==================== TAB: PLANTILLA / ROSTER ==================== -->
                        <div v-if="activeTab === 'roster'" class="animate-fade-in">
                            <div v-if="players.length === 0" class="text-center py-12 bg-white rounded-3xl border border-slate-100">
                                <span class="text-4xl block mb-2">🏃</span>
                                <h4 class="text-sm font-black text-slate-800 uppercase">Sin jugadores registrados</h4>
                                <p class="text-slate-400 text-xs">No hay futbolistas o atletas cargados para este evento.</p>
                            </div>
                            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <!-- Home Team Roster -->
                                <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                    <h4 class="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 mb-4 flex justify-between items-center">
                                        <span>{{ homeTeamName }}</span>
                                        <span class="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full uppercase tracking-wider">Local</span>
                                    </h4>
                                    <div class="space-y-2">
                                        <div 
                                            v-for="p in localRoster" 
                                            :key="p.id"
                                            class="flex items-center justify-between py-2 px-3 hover:bg-slate-50 rounded-xl transition-colors"
                                        >
                                            <div class="flex items-center gap-3">
                                                <span class="w-6 text-sm font-black text-slate-400 text-center">#{{ p.jersey_number }}</span>
                                                <div>
                                                    <p class="text-sm font-bold text-slate-800">{{ p.name }}</p>
                                                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{{ p.position }}</p>
                                                </div>
                                            </div>
                                            <span 
                                                v-if="p.is_starter"
                                                class="text-[9px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md uppercase tracking-wider"
                                            >
                                                Titular
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <!-- Away Team Roster -->
                                <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                    <h4 class="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 mb-4 flex justify-between items-center">
                                        <span>{{ awayTeamName }}</span>
                                        <span class="text-xs bg-cyan-50 text-cyan-700 px-2.5 py-1 rounded-full uppercase tracking-wider">Visita</span>
                                    </h4>
                                    <div class="space-y-2">
                                        <div 
                                            v-for="p in visitanteRoster" 
                                            :key="p.id"
                                            class="flex items-center justify-between py-2 px-3 hover:bg-slate-50 rounded-xl transition-colors"
                                        >
                                            <div class="flex items-center gap-3">
                                                <span class="w-6 text-sm font-black text-slate-400 text-center">#{{ p.jersey_number }}</span>
                                                <div>
                                                    <p class="text-sm font-bold text-slate-800">{{ p.name }}</p>
                                                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{{ p.position }}</p>
                                                </div>
                                            </div>
                                            <span 
                                                v-if="p.is_starter"
                                                class="text-[9px] font-black bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md uppercase tracking-wider"
                                            >
                                                Titular
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ==================== TAB: ESTADÍSTICAS / MARCADOR (Fútbol, Básquetbol, Béisbol) ==================== -->
                        <div v-if="activeTab === 'stats'" class="space-y-8 animate-fade-in">
                            <!-- Marcador Principal Card -->
                            <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-xl text-center relative overflow-hidden">
                                <div class="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
                                <div class="absolute -left-10 -top-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-2xl"></div>
                                
                                <div class="flex items-center justify-center gap-6 sm:gap-12 relative z-10">
                                    <!-- Local -->
                                    <div class="flex-1 text-right">
                                        <p class="text-xs font-black text-[#06B6D4] uppercase tracking-widest mb-1">Local</p>
                                        <p class="text-xl sm:text-2xl font-black truncate">{{ homeTeamName }}</p>
                                    </div>
                                    
                                    <!-- Score -->
                                    <div class="flex items-center gap-4 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl shrink-0">
                                        <span class="text-4xl sm:text-5xl font-black font-mono tracking-tight">{{ homeScore }}</span>
                                        <span class="text-slate-400 text-xl font-bold font-mono">:</span>
                                        <span class="text-4xl sm:text-5xl font-black font-mono tracking-tight">{{ awayScore }}</span>
                                    </div>

                                    <!-- Visitante -->
                                    <div class="flex-1 text-left">
                                        <p class="text-xs font-black text-[#06B6D4] uppercase tracking-widest mb-1">Visitante</p>
                                        <p class="text-xl sm:text-2xl font-black truncate">{{ awayTeamName }}</p>
                                    </div>
                                </div>
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6">Marcador Oficial de la Liga</p>
                            </div>

                            <!-- Comparativa de Equipos -->
                            <div 
                                v-if="hasTeamStats" 
                                class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm"
                            >
                                <h4 class="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Estadísticas del Encuentro</h4>
                                <div class="space-y-6">
                                    <div v-for="(val, label) in teamStatsMap" :key="label" class="space-y-1">
                                        <div class="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wide">
                                            <span>{{ val.local }}{{ val.unit || '' }}</span>
                                            <span class="text-slate-400 font-bold text-[10px]">{{ label }}</span>
                                            <span>{{ val.visitante }}{{ val.unit || '' }}</span>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <div class="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                                                <div 
                                                    class="bg-blue-600 h-2.5 rounded-l-full transition-all duration-500" 
                                                    :style="{ width: calculatePercentage(val.local, val.visitante, true) + '%' }"
                                                ></div>
                                                <div 
                                                    class="bg-cyan-400 h-2.5 rounded-r-full transition-all duration-500" 
                                                    :style="{ width: calculatePercentage(val.local, val.visitante, false) + '%' }"
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Tabla Estadísticas Individuales de Jugadores -->
                            <div v-if="hasPlayerStats" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <!-- Local Players Stats -->
                                <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                    <h4 class="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 mb-4 uppercase italic">
                                        Métricas: {{ homeTeamName }}
                                    </h4>
                                    <div class="overflow-x-auto">
                                        <table class="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr class="text-slate-400 border-b border-slate-100">
                                                    <th class="py-2 font-bold">Jugador</th>
                                                    <th v-for="col in statCols" :key="col.key" class="py-2 text-right font-bold">{{ col.label }}</th>
                                                </tr>
                                            </thead>
                                            <tbody class="divide-y divide-slate-50">
                                                <tr v-for="p in localPlayerStatsList" :key="p.nombre" class="hover:bg-slate-50/50">
                                                    <td class="py-2.5">
                                                        <span class="font-black text-slate-500 mr-1.5">#{{ p.numero }}</span>
                                                        <span class="font-bold text-slate-800">{{ p.nombre }}</span>
                                                    </td>
                                                    <td v-for="col in statCols" :key="col.key" class="py-2.5 text-right font-black text-slate-700">
                                                        {{ p[col.key] || 0 }}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <!-- Visitante Players Stats -->
                                <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                    <h4 class="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 mb-4 uppercase italic">
                                        Métricas: {{ awayTeamName }}
                                    </h4>
                                    <div class="overflow-x-auto">
                                        <table class="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr class="text-slate-400 border-b border-slate-100">
                                                    <th class="py-2 font-bold">Jugador</th>
                                                    <th v-for="col in statCols" :key="col.key" class="py-2 text-right font-bold">{{ col.label }}</th>
                                                </tr>
                                            </thead>
                                            <tbody class="divide-y divide-slate-50">
                                                <tr v-for="p in visitantePlayerStatsList" :key="p.nombre" class="hover:bg-slate-50/50">
                                                    <td class="py-2.5">
                                                        <span class="font-black text-slate-500 mr-1.5">#{{ p.numero }}</span>
                                                        <span class="font-bold text-slate-800">{{ p.nombre }}</span>
                                                    </td>
                                                    <td v-for="col in statCols" :key="col.key" class="py-2.5 text-right font-black text-slate-700">
                                                        {{ p[col.key] || 0 }}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ==================== TAB: RANKINGS / CLASIFICACIÓN (Deporte = "otro") ==================== -->
                        <div v-if="activeTab === 'rankings'" class="space-y-6 animate-fade-in">
                            <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                                <h4 class="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Tabla de Clasificación y Rankings</h4>
                                
                                <div v-if="!rankings || rankings.length === 0" class="text-center py-12">
                                    <span class="text-4xl block mb-2">🏆</span>
                                    <h4 class="text-sm font-black text-slate-800 uppercase">Sin rankings cargados</h4>
                                    <p class="text-slate-400 text-xs">Las posiciones finales aún están siendo validadas por los jueces.</p>
                                </div>
                                <div v-else class="overflow-x-auto">
                                    <table class="w-full text-left border-collapse">
                                        <thead>
                                            <tr class="bg-slate-50 border-b border-slate-100">
                                                <th class="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-20">Puesto</th>
                                                <th class="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Participante</th>
                                                <th class="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Resultado</th>
                                                <th class="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Faltas / Pen.</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-slate-100">
                                            <tr 
                                                v-for="r in rankings" 
                                                :key="r.nombre"
                                                class="hover:bg-slate-50/40 transition-colors"
                                            >
                                                <!-- Podio Badges -->
                                                <td class="p-4 text-center">
                                                    <span 
                                                        v-if="r.puesto === 1"
                                                        class="inline-flex items-center justify-center w-7 h-7 bg-amber-100 border border-amber-200 text-amber-800 rounded-full font-black text-xs shadow-sm"
                                                        title="1er Lugar"
                                                    >
                                                        🥇
                                                    </span>
                                                    <span 
                                                        v-else-if="r.puesto === 2"
                                                        class="inline-flex items-center justify-center w-7 h-7 bg-slate-100 border border-slate-200 text-slate-700 rounded-full font-black text-xs"
                                                        title="2do Lugar"
                                                    >
                                                        🥈
                                                    </span>
                                                    <span 
                                                        v-else-if="r.puesto === 3"
                                                        class="inline-flex items-center justify-center w-7 h-7 bg-orange-50 border border-orange-200 text-orange-800 rounded-full font-black text-xs"
                                                        title="3er Lugar"
                                                    >
                                                        🥉
                                                    </span>
                                                    <span 
                                                        v-else
                                                        class="text-sm font-black text-slate-400"
                                                    >
                                                        {{ r.puesto }}
                                                    </span>
                                                </td>
                                                <td class="p-4">
                                                    <div class="flex items-center gap-2.5">
                                                        <div class="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-xs">
                                                            #{{ r.numero }}
                                                        </div>
                                                        <div>
                                                            <div class="text-sm font-bold text-slate-800">{{ r.nombre }}</div>
                                                            <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{{ r.posicion }}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td class="p-4 text-right">
                                                    <span class="text-sm font-black text-blue-600 bg-blue-50/50 border border-blue-100 px-3 py-1.5 rounded-xl font-mono">
                                                        {{ r.puntaje }} <span class="text-[10px] text-slate-400 font-bold uppercase">{{ r.unidad || 'pts' }}</span>
                                                    </span>
                                                </td>
                                                <td class="p-4 text-center">
                                                    <span 
                                                        :class="r.penalizaciones > 0 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-slate-100 text-slate-500 border-transparent'"
                                                        class="text-xs font-bold px-2 py-0.5 rounded-md border"
                                                    >
                                                        {{ r.penalizaciones || 0 }}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            event: null,
            stats: null,
            players: [],
            loading: true,
            error: null,
            activeTab: 'info',
            map: null,
            statusClasses: {
                'activo': 'bg-green-500/10 text-green-500 border-green-500/20',
                'finalizado': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
                'en curso': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
                'próximo': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                'pausado': 'bg-red-500/10 text-red-500 border-red-500/20'
            }
        };
    },
    computed: {
        eventStatus() {
            return this.event?.status || 'Activo';
        },
        isFinalized() {
            return this.eventStatus.toLowerCase() === 'finalizado' || this.eventStatus.toLowerCase() === 'finalizada';
        },
        availableTabs() {
            const tabs = [
                { id: 'info', label: 'Detalles' },
                { id: 'roster', label: 'Roster / Equipos' }
            ];
            if (this.isFinalized) {
                if (this.event?.sport === 'otro') {
                    tabs.push({ id: 'rankings', label: 'Clasificación / Rankings' });
                } else {
                    tabs.push({ id: 'stats', label: 'Estadísticas / Marcador' });
                }
            }
            return tabs;
        },
        homeTeamName() {
            return this.stats?.equipo_local?.name || 'Local';
        },
        awayTeamName() {
            return this.stats?.equipo_visitante?.name || 'Visitante';
        },
        homeScore() {
            return this.stats?.marcador?.home_score ?? 0;
        },
        awayScore() {
            return this.stats?.marcador?.away_score ?? 0;
        },
        localRoster() {
            if (!this.stats?.equipo_local) return this.players; // Fallback si no hay equipos formados
            const localId = this.stats.equipo_local.id;
            return this.players.filter(p => p.team_id === localId);
        },
        visitanteRoster() {
            if (!this.stats?.equipo_visitante) return [];
            const awayId = this.stats.equipo_visitante.id;
            return this.players.filter(p => p.team_id === awayId);
        },
        hasTeamStats() {
            return this.stats?.stats_equipos && (this.event?.sport === 'futbol' || this.event?.sport === 'basquetbol' || this.event?.sport === 'beisbol');
        },
        teamStatsMap() {
            if (!this.hasTeamStats) return {};
            const sport = this.event?.sport;
            const s = this.stats.stats_equipos;
            if (sport === 'futbol') {
                return {
                    'Posesión del Balón': { local: s.local.posesion, visitante: s.visitante.posesion, unit: '%' },
                    'Remates Totales': { local: s.local.remates, visitante: s.visitante.remates },
                    'Remates al Arco': { local: s.local.remates_arco, visitante: s.visitante.remates_arco },
                    'Tiros de Esquina': { local: s.local.tiros_esquina, visitante: s.visitante.tiros_esquina },
                    'Faltas': { local: s.local.faltas, visitante: s.visitante.faltas },
                    'Tarjetas Amarillas': { local: s.local.amarillas, visitante: s.visitante.amarillas },
                    'Tarjetas Rojas': { local: s.local.rojas, visitante: s.visitante.rojas }
                };
            } else if (sport === 'beisbol') {
                return {
                    'Carreras': { local: s.local.carreras, visitante: s.visitante.carreras },
                    'Hits Realizados': { local: s.local.hits, visitante: s.visitante.hits },
                    'Errores de Fildeo': { local: s.local.errores, visitante: s.visitante.errores },
                    'Dejados en Base': { local: s.local.dejados_base, visitante: s.visitante.dejados_base }
                };
            } else if (sport === 'basquetbol') {
                return {
                    'Puntos Totales': { local: s.local.puntos, visitante: s.visitante.puntos },
                    'Rebotes Totales': { local: s.local.rebotes, visitante: s.visitante.rebotes },
                    'Asistencias': { local: s.local.asistencias, visitante: s.visitante.asistencias },
                    'Pérdidas': { local: s.local.perdidas, visitante: s.visitante.perdidas },
                    'Faltas de Equipo': { local: s.local.faltas, visitante: s.visitante.faltas },
                    '% Tiros de Campo': { local: s.local.porcentaje_tiros, visitante: s.visitante.porcentaje_tiros, unit: '%' },
                    '% Tiros Triples': { local: s.local.porcentaje_triples, visitante: s.visitante.porcentaje_triples, unit: '%' }
                };
            }
            return {};
        },
        hasPlayerStats() {
            return (this.stats?.jugadores_local || this.stats?.jugadores_visitante) && (this.event?.sport === 'futbol' || this.event?.sport === 'basquetbol' || this.event?.sport === 'beisbol');
        },
        statCols() {
            const sport = this.event?.sport;
            if (sport === 'futbol') {
                return [
                    { key: 'minutos', label: 'MIN' },
                    { key: 'goles', label: 'GOL' },
                    { key: 'asistencias', label: 'AST' },
                    { key: 'remates_arco', label: 'REM' },
                    { key: 'faltas_cometidas', label: 'FLT' }
                ];
            } else if (sport === 'beisbol') {
                return [
                    { key: 'turnos_bateo', label: 'AB' },
                    { key: 'hits', label: 'H' },
                    { key: 'carreras', label: 'R' },
                    { key: 'home_runs', label: 'HR' },
                    { key: 'carreras_impulsadas', label: 'RBI' }
                ];
            } else if (sport === 'basquetbol') {
                return [
                    { key: 'puntos', label: 'PTS' },
                    { key: 'rebotes', label: 'REB' },
                    { key: 'asistencias', label: 'AST' },
                    { key: 'robos', label: 'STL' },
                    { key: 'bloqueos', label: 'BLK' }
                ];
            }
            return [];
        },
        localPlayerStatsList() {
            return this.stats?.jugadores_local || [];
        },
        visitantePlayerStatsList() {
            return this.stats?.jugadores_visitante || [];
        },
        rankings() {
            return this.stats?.rankings || [];
        }
    },
    watch: {
        show(newVal) {
            if (newVal) {
                this.activeTab = 'info';
                this.loadEventData();
            } else {
                this.destroyMap();
            }
        },
        activeTab(newTab) {
            if (newTab === 'info') {
                this.$nextTick(() => {
                    this.initMap();
                });
            } else {
                this.destroyMap();
            }
        }
    },
    methods: {
        closeModal() {
            this.$emit('close');
        },
        async loadEventData() {
            this.loading = true;
            this.error = null;
            this.event = null;
            this.stats = null;
            this.players = [];

            try {
                // 1. Obtener detalles y estadísticas del evento
                const detailResponse = await api.get(`/events/${this.eventId}`);
                this.event = detailResponse.evento;
                this.stats = detailResponse.estadisticas || null;

                // 2. Obtener lista de jugadores del evento
                const playersResponse = await api.get(`/events/${this.eventId}/players`);
                this.players = Array.isArray(playersResponse) ? playersResponse : [];

                // 3. Cargar mapa si la pestaña de info está activa
                if (this.activeTab === 'info') {
                    this.$nextTick(() => {
                        this.initMap();
                    });
                }
            } catch (err) {
                console.error("Error al cargar detalles del evento:", err);
                this.error = err.message || "No se pudo obtener información del servidor.";
            } finally {
                this.loading = false;
            }
        },
        initMap() {
            this.destroyMap();
            if (!this.event || !this.event.lat || !this.event.lon) return;

            const lat = parseFloat(this.event.lat);
            const lon = parseFloat(this.event.lon);
            const mapContainer = document.getElementById('modal-map');

            if (!mapContainer) return;

            this.map = L.map(mapContainer).setView([lat, lon], 14);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
                crossOrigin: true
            }).addTo(this.map);

            const customIcon = L.divIcon({
                className: 'custom-pin',
                html: `<div style="background-color: #2563EB; width: 24px; height: 24px; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border-radius: 50%;"></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            L.marker([lat, lon], { icon: customIcon }).addTo(this.map);
        },
        destroyMap() {
            if (this.map) {
                this.map.remove();
                this.map = null;
            }
        },
        calculatePercentage(local, visitante, isLocal) {
            const locVal = parseFloat(local) || 0;
            const visVal = parseFloat(visitante) || 0;
            const total = locVal + visVal;
            if (total === 0) return 50; // Equitativo si no hay stats
            return isLocal ? Math.round((locVal / total) * 100) : Math.round((visVal / total) * 100);
        },
        formatDate(dateStr) {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            return d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' });
        },
        formatTime(timeStr) {
            if (!timeStr) return '';
            const d = new Date(timeStr);
            return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        }
    }
};
