import { api } from '../../services/api.js';

export default {
    props: {
        eventId: {
            type: Number,
            required: true
        }
    },
    emits: ['back'],
    template: `
        <div class="py-6 px-4 sm:px-6 max-w-7xl mx-auto font-sans animate-fade-in">
            <!-- Volver Button -->
            <div class="mb-6 flex items-center justify-between">
                <button 
                    @click="goBack" 
                    class="flex items-center gap-2 text-slate-600 hover:text-slate-900 border border-slate-200 bg-white px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                    <i class="fa-solid fa-arrow-left"></i> Volver
                </button>
            </div>

            <!-- Header Card: dark gradient hero -->
            <div class="relative rounded-3xl overflow-hidden mb-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-xl">
                <!-- Decorative blobs -->
                <div class="absolute -right-16 -top-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
                <div class="absolute -left-16 -bottom-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div class="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div class="flex items-center gap-2 mb-3">
                            <span class="px-2.5 py-0.5 text-[9px] font-black rounded-full bg-blue-500/20 text-blue-300 uppercase tracking-widest border border-blue-500/30">
                                {{ event?.sport }}
                            </span>
                            <span 
                                :class="statusClasses[eventStatus.toLowerCase()] || 'bg-slate-700 text-slate-300 border-slate-600'"
                                class="px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase tracking-widest border"
                            >
                                {{ eventStatus }}
                            </span>
                        </div>
                        <h2 class="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase italic">
                            {{ event?.name }}
                        </h2>
                        <p class="text-slate-400 text-xs font-bold uppercase tracking-wider mt-2 flex items-center gap-2">
                            <span><i class="fa-solid fa-location-dot text-red-500 mr-0.5"></i> {{ event?.location }}</span>
                            <span class="text-slate-600">•</span>
                            <span><i class="fa-solid fa-calendar-days text-slate-400 mr-0.5"></i> {{ formatDate(event?.event_date) }}</span>
                        </p>
                    </div>

                    <!-- Price & Reserve -->
                    <div v-if="!isPastEvent" class="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-5 flex flex-col items-center min-w-[200px] w-full md:w-auto self-stretch md:self-auto">
                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Precio Entrada</span>
                        <span class="text-2xl font-black text-emerald-400 mb-3">$ {{ event?.ticket_price }}</span>
                        <button 
                            @click="reserveTickets"
                            class="w-full bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 transform active:scale-95 shadow-lg shadow-blue-500/30 cursor-pointer"
                        >
                            <i class="fa-solid fa-ticket mr-1"></i> Reservar Entradas
                        </button>
                    </div>
                    <div v-else class="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col items-center min-w-[160px] w-full md:w-auto">
                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Precio Entrada</span>
                        <span class="text-2xl font-black text-slate-300">$ {{ event?.ticket_price }}</span>
                        <span class="mt-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">Evento cerrado</span>
                    </div>
                </div>
            </div>

            <!-- Tabs Container -->
            <div class="bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden flex flex-col min-h-[500px]">
                <!-- Tab Selector -->
                <div class="bg-slate-100/50 border-b border-slate-200 px-6 sm:px-8 py-3.5 flex gap-2 overflow-x-auto shrink-0 scrollbar-none">
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

                <!-- Tab Body -->
                <div class="p-6 sm:p-8 flex-grow bg-white">
                    <!-- Loading state -->
                    <div v-if="loading" class="flex flex-col items-center justify-center py-24">
                        <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 border-l-transparent mb-4"></div>
                        <p class="text-slate-500 text-sm font-semibold">Cargando detalles del evento...</p>
                    </div>

                    <!-- ERROR State -->
                    <div v-else-if="error" class="text-center py-16">
                        <i class="fa-solid fa-triangle-exclamation text-yellow-500 text-4xl block mb-3"></i>
                        <h4 class="text-lg font-black text-slate-800 uppercase mb-2">Error de conexión</h4>
                        <p class="text-slate-500 text-sm max-w-md mx-auto">{{ error }}</p>
                    </div>

                    <div v-else>
                        <!-- ==================== TAB: INFO / DETALLES ==================== -->
                        <div v-show="activeTab === 'info'" class="space-y-6 animate-fade-in">
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <!-- Details Box -->
                                <div class="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
                                    <div class="space-y-5">
                                        <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3">Información General</h4>
                                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div>
                                                <p class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Fecha</p>
                                                <p class="text-sm font-bold text-slate-800 mt-1">{{ formatDate(event?.event_date) }}</p>
                                            </div>
                                            <div>
                                                <p class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Horario</p>
                                                <p class="text-sm font-bold text-slate-800 mt-1">
                                                    {{ formatTime(event?.start_time) }} - {{ formatTime(event?.end_time) }}
                                                </p>
                                            </div>
                                            <div class="sm:col-span-2">
                                                <p class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Ubicación</p>
                                                <p class="text-sm font-bold text-slate-800 mt-1">{{ event?.location }}</p>
                                            </div>
                                            <div>
                                                <p class="text-[9px] font-black text-slate-400 uppercase tracking-wider">Precio Ticket</p>
                                                <p class="text-lg font-black text-emerald-600 mt-1">$ {{ event?.ticket_price }}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="mt-8 pt-5 border-t border-slate-100 grid grid-cols-2 gap-4 text-slate-500 text-xs">
                                        <div class="bg-slate-50 p-4 rounded-xl">
                                            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Tickets Totales</span>
                                            <b class="text-slate-800 text-base font-black">{{ event?.total_tickets }}</b>
                                        </div>
                                        <div class="bg-slate-50 p-4 rounded-xl">
                                            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Disponibles</span>
                                            <b class="text-blue-600 text-base font-black">{{ event?.available_tickets }}</b>
                                        </div>
                                    </div>
                                </div>

                                <!-- Map -->
                                <div class="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm h-80 lg:h-auto relative">
                                    <div id="details-page-map" class="w-full h-full min-h-[280px] z-0"></div>
                                </div>
                            </div>
                        </div>

                        <!-- ==================== TAB: PLANTILLA / ROSTER ==================== -->
                        <div v-show="activeTab === 'roster'" class="animate-fade-in">
                            <div v-if="players.length === 0" class="text-center py-16 bg-white rounded-3xl border border-slate-100">
                                <span class="text-4xl block mb-3">🏃</span>
                                <h4 class="text-sm font-black text-slate-800 uppercase mb-1">Sin jugadores registrados</h4>
                                <p class="text-slate-400 text-xs">No hay futbolistas o atletas cargados para este evento.</p>
                            </div>
                            <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <!-- Home Team Roster -->
                                <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                    <h4 class="text-base font-black text-slate-900 border-b border-slate-100 pb-3 mb-4 flex justify-between items-center italic uppercase">
                                        <span>{{ homeTeamName }}</span>
                                        <span class="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-black">Local</span>
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
                                                    <p v-if="p.position && p.position !== 'N/A' && p.position !== 'na' && p.position !== 'Individual'" class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{{ p.position }}</p>
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
                                    <h4 class="text-base font-black text-slate-900 border-b border-slate-100 pb-3 mb-4 flex justify-between items-center italic uppercase">
                                        <span>{{ awayTeamName }}</span>
                                        <span class="text-[10px] bg-cyan-50 text-cyan-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-black">Visita</span>
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
                                                    <p v-if="p.position && p.position !== 'N/A' && p.position !== 'na' && p.position !== 'Individual'" class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{{ p.position }}</p>
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

                        <!-- ==================== TAB: ESTADÍSTICAS / MARCADOR ==================== -->
                        <div v-show="activeTab === 'stats'" class="space-y-6 animate-fade-in">
                            <!-- Marcador Principal Card -->
                            <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-md text-center relative overflow-hidden">
                                <div class="absolute -right-10 -bottom-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
                                <div class="absolute -left-10 -top-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl"></div>
                                
                                <div class="flex items-center justify-center gap-4 sm:gap-10 relative z-10">
                                    <div class="flex-1 text-right">
                                        <p class="text-[9px] font-black text-[#06B6D4] uppercase tracking-widest mb-0.5">Local</p>
                                        <p class="text-lg sm:text-2xl font-black truncate uppercase italic">{{ homeTeamName }}</p>
                                    </div>
                                    
                                    <div class="flex items-center gap-3 bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl shrink-0">
                                        <span class="text-3xl sm:text-4xl font-black font-mono tracking-tight">{{ homeScore }}</span>
                                        <span class="text-slate-400 text-lg font-bold font-mono">:</span>
                                        <span class="text-3xl sm:text-4xl font-black font-mono tracking-tight">{{ awayScore }}</span>
                                    </div>

                                    <div class="flex-1 text-left">
                                        <p class="text-[9px] font-black text-[#06B6D4] uppercase tracking-widest mb-0.5">Visitante</p>
                                        <p class="text-lg sm:text-2xl font-black truncate uppercase italic">{{ awayTeamName }}</p>
                                    </div>
                                </div>
                                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-6">Marcador Oficial de la Liga</p>
                            </div>

                            <!-- Comparativa de Equipos -->
                            <div v-if="hasTeamStats" class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">Estadísticas del Encuentro</h4>
                                <div class="space-y-4">
                                    <div v-for="(val, label) in teamStatsMap" :key="label" class="space-y-1">
                                        <div class="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wide">
                                            <span>{{ val.local }}{{ val.unit || '' }}</span>
                                            <span class="text-slate-400 text-[9px] font-bold">{{ label }}</span>
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
                            <div v-if="hasPlayerStats" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <!-- Local Players Stats -->
                                <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                    <h4 class="text-sm font-black text-slate-900 border-b border-slate-100 pb-2.5 mb-4 uppercase italic">
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
                                                    <td class="py-2">
                                                        <span class="font-black text-slate-400 mr-1.5">#{{ p.numero }}</span>
                                                        <span class="font-bold text-slate-800">{{ p.nombre }}</span>
                                                    </td>
                                                    <td v-for="col in statCols" :key="col.key" class="py-2 text-right font-black text-slate-700 font-mono">
                                                        {{ p[col.key] || 0 }}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <!-- Visitante Players Stats -->
                                <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                    <h4 class="text-sm font-black text-slate-900 border-b border-slate-100 pb-2.5 mb-4 uppercase italic">
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
                                                    <td class="py-2">
                                                        <span class="font-black text-slate-400 mr-1.5">#{{ p.numero }}</span>
                                                        <span class="font-bold text-slate-800">{{ p.nombre }}</span>
                                                    </td>
                                                    <td v-for="col in statCols" :key="col.key" class="py-2 text-right font-black text-slate-700 font-mono">
                                                        {{ p[col.key] || 0 }}
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- ==================== TAB: RANKINGS / CLASIFICACIÓN ==================== -->
                        <div v-show="activeTab === 'rankings'" class="space-y-4 animate-fade-in">
                            <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 pb-2 border-b border-slate-100">Tabla de Clasificación y Rankings</h4>
                                
                                <div v-if="!rankings || rankings.length === 0" class="text-center py-16">
                                    <i class="fa-solid fa-trophy text-yellow-400 text-4xl block mb-3"></i>
                                    <h4 class="text-sm font-black text-slate-800 uppercase mb-1">Sin rankings cargados</h4>
                                    <p class="text-slate-400 text-xs">Las posiciones finales aún están siendo validadas por los jueces.</p>
                                </div>
                                <div v-else class="overflow-x-auto">
                                    <table class="w-full text-left border-collapse">
                                        <thead>
                                            <tr class="bg-slate-50 border-b border-slate-100">
                                                <th class="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center w-20">Puesto</th>
                                                <th class="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Participante</th>
                                                <th class="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Resultado</th>
                                                <th class="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Faltas / Pen.</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-slate-100">
                                            <tr 
                                                v-for="r in rankings" 
                                                :key="r.nombre"
                                                class="hover:bg-slate-50/40 transition-colors"
                                            >
                                                <td class="p-3 text-center">
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
                                                        class="text-xs font-black text-slate-400"
                                                    >
                                                        {{ r.puesto }}
                                                    </span>
                                                </td>
                                                <td class="p-3">
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
                                                <td class="p-3 text-right">
                                                    <span class="text-xs font-black text-blue-600 bg-blue-50/50 border border-blue-100 px-2.5 py-1 rounded-xl font-mono">
                                                        {{ r.puntaje }} <span class="text-[9px] text-slate-400 font-bold uppercase">{{ r.unidad || 'pts' }}</span>
                                                    </span>
                                                </td>
                                                <td class="p-3 text-center">
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
                'activo': 'bg-green-500/10 text-green-500 border-green-500/20 bg-green-50/50',
                'finalizado': 'bg-slate-500/10 text-slate-400 border-slate-500/20 bg-slate-50/50',
                'en curso': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 bg-yellow-50/50',
                'próximo': 'bg-blue-500/10 text-blue-400 border-blue-500/20 bg-blue-50/50',
                'pausado': 'bg-red-500/10 text-red-500 border-red-500/20 bg-red-50/50'
            }
        };
    },
    computed: {
        eventStatus() {
            return this.event?.status || 'Activo';
        },
        isFinalized() {
            const status = this.eventStatus.toLowerCase();
            return status === 'finalizado' || status === 'finalizada';
        },
        isPastEvent() {
            if (this.isFinalized) return true;
            if (this.event?.event_date) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const eventDate = new Date(this.event.event_date);
                if (eventDate < today) return true;
            }
            return false;
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
            if (!this.stats?.equipo_local) return this.players;
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
        eventId: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    this.activeTab = 'info';
                    this.loadEventData();
                }
            }
        },
        activeTab(newTab) {
            if (newTab === 'info') {
                this.$nextTick(() => {
                    // Small delay so the container is painted and has dimensions
                    setTimeout(() => { this.initMap(); }, 80);
                });
            } else {
                this.destroyMap();
            }
        }
    },
    beforeUnmount() {
        this.destroyMap();
    },
    methods: {
        goBack() {
            this.$emit('back');
        },
        async loadEventData() {
            this.loading = true;
            this.error = null;
            this.event = null;
            this.stats = null;
            this.players = [];

            try {
                const detailResponse = await api.get(`/events/${this.eventId}`);
                this.event = detailResponse.evento;
                this.stats = detailResponse.estadisticas || null;

                const playersResponse = await api.get(`/events/${this.eventId}/players`);
                this.players = Array.isArray(playersResponse) ? playersResponse : [];

                if (this.activeTab === 'info') {
                    // Wait for Vue to render, then wait a frame for layout paint,
                    // then init map so Leaflet can measure the container size correctly
                    this.$nextTick(() => {
                        setTimeout(() => { this.initMap(); }, 120);
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
            const mapContainer = document.getElementById('details-page-map');

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
            // Force Leaflet to recalculate container size after paint
            setTimeout(() => { if (this.map) this.map.invalidateSize(); }, 200);
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
            if (total === 0) return 50;
            return isLocal ? Math.round((locVal / total) * 100) : Math.round((visVal / total) * 100);
        },
        formatDate(dateStr) {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            return d.toLocaleDateString('es-ES', { month: 'long', day: 'numeric', year: 'numeric' });
        },
        formatTime(timeStr) {
            if (!timeStr) return '';
            const d = new Date(timeStr);
            return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        },
        async reserveTickets() {
            const event = this.event;
            
            let userReservations = [];
            try {
                const myReservationsResponse = await api.get('/my-reservations');
                userReservations = Array.isArray(myReservationsResponse) ? myReservationsResponse : [];
            } catch (err) {
                console.error("Error al cargar reservas:", err);
            }

            const alreadyReserved = userReservations
                .filter(r => r.event_id === event.id && r.estado.toLowerCase() !== 'rechazado')
                .reduce((sum, r) => sum + (r.cantidad_tickets || 0), 0);

            if (alreadyReserved >= 8) {
                Swal.fire({
                    icon: 'error',
                    title: 'Límite alcanzado',
                    text: 'Ya has comprado/reservado el límite máximo de 8 entradas permitido para este evento.',
                    position: 'top',
                    toast: true,
                    showConfirmButton: false,
                    timer: 4000
                });
                return;
            }

            const maxAllowed = 8 - alreadyReserved;
            const maxTicketsToBuy = Math.min(maxAllowed, event.available_tickets);

            if (maxTicketsToBuy <= 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Sin entradas',
                    text: 'Lo sentimos, no quedan entradas disponibles para este evento.',
                    position: 'top',
                    toast: true,
                    showConfirmButton: false,
                    timer: 3000
                });
                return;
            }

            const { value: formValues } = await Swal.fire({
                title: 'Reservar Entradas',
                html: `
                    <div class="text-left font-sans px-2">
                        <p class="text-sm font-bold text-slate-600 mb-2">Evento: <span class="text-slate-900 font-extrabold">${event.name}</span></p>
                        <p class="text-sm font-bold text-slate-600 mb-4">Precio unitario: <span class="text-emerald-600 font-extrabold">$${event.ticket_price}</span></p>
                        
                        <div class="mb-4">
                            <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cantidad de Entradas</label>
                            <input 
                                id="swal-ticket-count" 
                                type="number" 
                                min="1" 
                                max="${maxTicketsToBuy}" 
                                value="1" 
                                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                            />
                            <p class="text-[10px] text-slate-400 mt-1">
                                Máximo permitido en esta compra: ${maxTicketsToBuy} tickets 
                                ${alreadyReserved > 0 ? `(Ya tienes ${alreadyReserved} reservados)` : ''}
                            </p>
                        </div>
                        
                        <div class="mb-2">
                            <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Referencia de Pago</label>
                            <input 
                                id="swal-payment-ref" 
                                type="text" 
                                maxlength="6"
                                placeholder="Ej: 123456" 
                                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                            />
                            <p class="text-[10px] text-slate-400 mt-1">Ingresa la referencia de pago (solo números, máx. 6 dígitos).</p>
                        </div>
                    </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Confirmar Reserva',
                cancelButtonText: 'Cancelar',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:from-blue-700 hover:to-cyan-600 transition-colors cursor-pointer mr-3',
                    cancelButton: 'bg-slate-200 text-slate-600 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-300 transition-colors cursor-pointer'
                },
                preConfirm: () => {
                    const ticketCountStr = document.getElementById('swal-ticket-count').value;
                    const ticketCount = parseInt(ticketCountStr);
                    const paymentRef = document.getElementById('swal-payment-ref').value.trim();
                    
                    if (isNaN(ticketCount) || ticketCount < 1) {
                        Swal.showValidationMessage('La cantidad de entradas debe ser al menos 1');
                        return false;
                    }
                    if (ticketCount > maxTicketsToBuy) {
                        Swal.showValidationMessage(`Límite excedido. Solo puedes reservar hasta ${maxTicketsToBuy} entradas adicionales.`);
                        return false;
                    }
                    if (!paymentRef) {
                        Swal.showValidationMessage('El número de referencia de pago es obligatorio');
                        return false;
                    }
                    if (!/^\\d{1,6}$/.test(paymentRef)) {
                        Swal.showValidationMessage('La referencia de pago debe ser un número de hasta 6 dígitos');
                        return false;
                    }
                    
                    return { ticketCount, paymentRef };
                }
            });

            if (formValues) {
                const { ticketCount, paymentRef } = formValues;
                try {
                    Swal.fire({
                        title: 'Procesando reserva...',
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    const response = await api.post('/reserve', {
                        event_id: event.id,
                        ticket_count: ticketCount,
                        payment_reference: paymentRef
                    });

                    Swal.fire({
                        icon: 'success',
                        title: 'Reserva Registrada',
                        text: response.mensaje || '¡Tu reserva ha sido registrada con éxito!',
                        position: 'top',
                        toast: true,
                        showConfirmButton: false,
                        timer: 4000
                    });

                    this.loadEventData();
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al reservar',
                        text: error.message || 'Ocurrió un error al procesar tu reserva.',
                        position: 'top',
                        toast: true,
                        showConfirmButton: false,
                        timer: 4000
                    });
                }
            }
        }
    }
};
