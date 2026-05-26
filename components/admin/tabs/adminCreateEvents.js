import { api } from '../../../services/api.js';
import {
    getDefaultStats,
    getStatsPayloadKey
} from '../event/eventSportConfig.js';

export default {
    template: `
    <div class="animate-fade-in">
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">{{ isCreating ? 'Configurar Evento' : 'Gestión de Eventos' }}</h2>
            <button @click="toggleView" class="bg-[#2563EB] text-white px-6 py-2.5 rounded-full text-sm font-black uppercase italic tracking-wider hover:bg-[#1d4ed8] transition-all shadow-lg hover:scale-105">
                {{ isCreating ? '➔ Volver a la Lista' : '+ Nuevo Evento' }}
            </button>
        </div>

        <template v-if="!isCreating">
            <!-- ESTADO INICIAL -->
            <div v-if="events.length === 0" class="bg-white rounded-[3rem] border-4 border-dashed border-slate-100 p-20 text-center">
                <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span class="text-4xl">🏆</span>
                </div>
                <h3 class="text-xl font-black text-slate-900 uppercase italic">Listo para publicar</h3>
                <p class="text-slate-400 mt-2 font-medium">Configura los detalles de tu próximo evento deportivo.</p>
                <button @click="toggleView" class="mt-8 text-blue-600 font-black uppercase text-xs tracking-widest hover:underline">
                    Configurar nuevo evento ➔
                </button>
            </div>

            <!-- TABLA DE EVENTOS -->
            <div v-else class="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden animate-fade-in">
                <table class="w-full text-left">
                    <thead>
                        <tr class="border-b border-gray-100 bg-slate-50/50">
                            <th class="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Evento / Ubicación</th>
                            <th class="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deporte</th>
                            <th class="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Horario</th>
                            <th class="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tickets</th>
                            <th class="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        <tr v-for="event in events" :key="event.id" class="hover:bg-blue-50/30 transition-colors">
                            <td class="px-8 py-5">
                                <p class="text-sm font-black text-slate-900 uppercase italic">{{ event.name || event.organizer }}</p>
                                <p class="text-xs text-slate-400 font-medium">{{ event.location }}</p>
                            </td>
                            <td class="px-6 py-5">
                                <span class="px-3 py-1 text-[10px] font-black rounded-full bg-blue-100 text-blue-700 uppercase">
                                    {{ event.sport }}
                                </span>
                            </td>
                            <td class="px-6 py-5">
                                 <p class="text-xs text-slate-900 font-bold">{{ formatDate(event.event_date) }}</p>
                                 <p class="text-[9px] text-slate-400 font-black uppercase tracking-tighter">{{ formatTime(event.start_time) }} - {{ formatTime(event.end_time) }}</p>
                            </td>
                            <td class="px-6 py-5">
                                <span class="text-xs font-black text-slate-700">{{ event.total_tickets }}</span>
                                <span class="text-[9px] font-bold text-slate-400 uppercase ml-1">Total</span>
                            </td>
                            <td class="px-6 py-5">
                                <div class="flex items-center gap-1.5">
                                    <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span class="text-[10px] font-black text-green-600 uppercase text-nowrap">{{ event.status || 'Programado' }}</span>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>

        <!-- Vista de Creación Inline -->
        <template v-else>
            <div class="bg-white w-full rounded-[3rem] shadow-sm border border-gray-100 animate-fade-in relative z-10">
                <div class="p-10">
                    <!-- Mensaje de error -->
                    <div v-if="saveError" class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium">
                        ⚠️ {{ saveError }}
                    </div>
                    <!-- Mensaje de éxito -->
                    <div v-if="saveSuccess" class="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-sm font-medium">
                        ✅ {{ saveSuccess }}
                    </div>

                    <div class="space-y-8">
                        <!-- Nombre y Deporte -->
                        <div class="grid grid-cols-2 gap-5">
                            <div class="col-span-1">
                                <label class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Nombre del Evento</label>
                                <input v-model="form.name" type="text" class="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-slate-700 shadow-inner" placeholder="Ej: Liga Nacional de Básquetbol">
                            </div>
                            <div class="col-span-1">
                                <label class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Deporte</label>
                                <select v-model="form.sport" class="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-slate-700 cursor-pointer">
                                    <option value="basquetbol">🏀 Básquetbol</option>
                                    <option value="futbol">⚽ Fútbol</option>
                                    <option value="beisbol">⚾ Béisbol</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>
                            <div v-if="form.sport === 'otro'" class="animate-fade-in">
                                <label class="block text-[10px] font-black uppercase text-blue-600 mb-2 tracking-widest">¿Cuál?</label>
                                <input v-model="form.customSport" type="text" class="w-full p-4 bg-blue-50/50 rounded-2xl border-2 border-blue-200 outline-none font-bold text-blue-700">
                            </div>
                        </div>

                        <!-- Dinámica de Juego -->
                        <div class="p-6 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100">
                            <div class="flex justify-center gap-3 mb-6">
                                <button @click="form.isTeam = false" :class="!form.isTeam ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'" class="px-8 py-2.5 rounded-full text-[10px] font-black uppercase transition-all shadow-md">Individual</button>
                                <button @click="form.isTeam = true" :class="form.isTeam ? 'bg-blue-600 text-white' : 'bg-white text-slate-400'" class="px-8 py-2.5 rounded-full text-[10px] font-black uppercase transition-all shadow-md">En Equipos</button>
                            </div>
                            <div class="grid grid-cols-2 gap-4 mb-4">
                                <template v-if="form.isTeam">
                                    <div>
                                        <span class="text-[9px] font-black text-slate-400 uppercase ml-2">Total Equipos</span>
                                        <input v-model="form.totalTeams" @change="generateTeams" type="number" min="2" class="w-full p-3.5 bg-white rounded-xl font-bold border border-slate-200 outline-none focus:border-blue-500 transition-all">
                                    </div>
                                    <div>
                                        <span class="text-[9px] font-black text-slate-400 uppercase ml-2">Jugadores x Equipo</span>
                                        <input v-model="form.playersPerTeam" @change="generateTeams" type="number" min="1" class="w-full p-3.5 bg-white rounded-xl font-bold border border-slate-200 outline-none focus:border-blue-500 transition-all">
                                    </div>
                                </template>
                                <template v-else>
                                    <div class="col-span-2">
                                        <span class="text-[9px] font-black text-slate-400 uppercase ml-2">Total Jugadores</span>
                                        <input v-model="form.totalPlayers" @change="generateTeams" type="number" min="1" class="w-full p-3.5 bg-white rounded-xl font-bold border border-slate-200 outline-none focus:border-blue-500 transition-all">
                                    </div>
                                </template>
                            </div>

                            <!-- Registro de Participantes -->
                            <div class="mt-6 border-t border-slate-200 pt-6">
                                <div class="flex items-center justify-between mb-4">
                                    <h4 class="text-xs font-black uppercase text-slate-600 tracking-widest">Nombres de Participantes</h4>
                                    <button @click="generateTeams" class="text-[9px] bg-blue-100 text-blue-700 px-3 py-1 rounded-full uppercase font-bold hover:bg-blue-200 flex items-center gap-1">
                                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                                        Equipos
                                    </button>
                                </div>
                                <div v-if="form.teams.length > 0" class="space-y-4 max-h-[32rem] overflow-y-auto pr-2">
                                    <div v-for="(team, tIndex) in form.teams" :key="tIndex" class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-md hover:shadow-lg transition-all duration-300">
                                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                                            <!-- Team Label / Local-Visitante -->
                                            <div class="flex items-center gap-2">
                                                <span class="text-xs font-black uppercase tracking-wider text-slate-500">
                                                    {{ team.is_home ? 'Local' : 'Visitante' }}
                                                </span>
                                            </div>
                                            
                                            <!-- Selector de Modo: Nuevo vs Existente -->
                                            <div v-if="form.isTeam" class="flex items-center bg-slate-100 rounded-full p-1 self-start">
                                                <button type="button" @click="toggleTeamMode(team, false, tIndex)" :class="!team.useExisting ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'" class="px-4 py-1.5 rounded-full text-[9px] font-black uppercase transition-all">
                                                    ✍️ Nuevo
                                                </button>
                                                <button type="button" @click="toggleTeamMode(team, true, tIndex)" :class="team.useExisting ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'" class="px-4 py-1.5 rounded-full text-[9px] font-black uppercase transition-all" :disabled="existingTeams.length === 0" :title="existingTeams.length === 0 ? 'No hay equipos registrados de este deporte' : ''">
                                                    🔍 Registrado
                                                </button>
                                            </div>
                                        </div>

                                        <!-- Formulario de Nombre o Selector -->
                                        <div class="mb-5">
                                            <template v-if="team.useExisting">
                                                <label class="block text-[8px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Selecciona el Equipo</label>
                                                <select v-model="team.selectedTeamId" @change="onTeamSelect(team, tIndex)" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-blue-500 transition-all cursor-pointer">
                                                    <option :value="null" disabled>-- Selecciona un equipo --</option>
                                                    <option v-for="ext in existingTeams" :key="ext.id" :value="ext.id">{{ ext.name }}</option>
                                                </select>
                                            </template>
                                            <template v-else>
                                                <label class="block text-[8px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">Nombre del Equipo</label>
                                                <input v-if="form.isTeam" v-model="team.name" type="text" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs text-slate-700 outline-none focus:border-blue-500 transition-all" placeholder="Ej: Real Madrid">
                                                <span v-else class="text-xs font-black text-slate-500 uppercase">{{ team.name }}</span>
                                            </template>
                                        </div>

                                        <!-- Jugadores -->
                                        <div>
                                            <div class="flex items-center justify-between mb-2">
                                                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Jugadores del Equipo</span>
                                                <span v-if="team.isLoadingPlayers" class="text-[9px] text-blue-500 animate-pulse font-bold">Cargando jugadores...</span>
                                            </div>
                                            
                                            <!-- Listado de jugadores -->
                                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                                                <div v-for="(player, pIndex) in team.players" :key="pIndex" class="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                                                    <span class="text-[9px] font-black text-slate-400 w-5 text-right">#{{ player.jersey_number }}</span>
                                                    <input v-model="player.name" type="text" class="flex-grow bg-transparent text-xs font-bold text-slate-700 outline-none" :placeholder="'Nombre Jugador ' + (pIndex + 1)" :readonly="team.useExisting">
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Fecha y Horarios -->
                        <div class="grid grid-cols-3 gap-4">
                            <div>
                                <label class="block text-[10px] font-black uppercase text-slate-400 mb-2">Fecha (Min +7d)</label>
                                <input v-model="form.date" :min="minDate" type="date" class="w-full p-4 bg-blue-50/50 border-2 border-blue-100 rounded-2xl font-bold text-xs outline-none focus:border-blue-500 transition-all shadow-inner text-blue-800">
                            </div>
                            <div>
                                <label class="block text-[10px] font-black uppercase text-slate-400 mb-2">Hora Inicio</label>
                                <input v-model="form.startTime" type="time" class="w-full p-4 bg-slate-50 rounded-2xl font-bold text-xs border-2 border-transparent focus:border-blue-500 outline-none">
                            </div>
                            <div>
                                <label class="block text-[10px] font-black uppercase text-slate-400 mb-2">Hora Cierre</label>
                                <input v-model="form.endTime" type="time" class="w-full p-4 bg-slate-50 rounded-2xl font-bold text-xs border-2 border-transparent focus:border-blue-500 outline-none">
                            </div>
                        </div>

                        <!-- Entradas -->
                        <div class="p-8 bg-blue-50/50 rounded-[3rem] border-2 border-blue-100 space-y-5">
                            <p class="text-[10px] font-black text-blue-600 uppercase text-center tracking-[0.25em]">Configuración de Entradas</p>
                            <div class="grid grid-cols-2 gap-6">
                                <div class="bg-white p-5 rounded-[2rem] shadow-sm border border-blue-100/50">
                                    <p class="text-[10px] font-black text-slate-900 uppercase mb-4 flex items-center gap-2 italic">🎟️ Precio por Ticket ($)</p>
                                    <input v-model="form.ticketPrice" type="number" min="0" step="0.01" class="w-full p-2 bg-slate-50 rounded-lg font-bold text-sm outline-none">
                                </div>
                                <div class="bg-white p-5 rounded-[2rem] shadow-sm border border-blue-100/50">
                                    <p class="text-[10px] font-black text-slate-900 uppercase mb-4 flex items-center gap-2 italic">🎫 Total de Cupos</p>
                                    <input v-model="form.totalTickets" type="number" min="1" class="w-full p-2 bg-slate-50 rounded-lg font-bold text-sm outline-none">
                                </div>
                            </div>
                        </div>

                        <!-- Ubicación -->
                        <div>
                            <div class="flex gap-2 mb-4">
                                <input v-model="form.address" @keyup.enter="searchLocation" type="text" class="flex-grow p-4 bg-slate-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-blue-500 outline-none transition-all shadow-inner" placeholder="Ubicación del recinto...">
                                <button @click="searchLocation" class="bg-slate-900 text-white px-8 rounded-2xl text-[10px] font-black uppercase hover:bg-black transition-all shadow-lg">Buscar</button>
                            </div>
                            <div id="map-olympia" class="h-80 w-full rounded-[3rem] border-8 border-slate-50 shadow-inner overflow-hidden relative z-10"></div>
                        </div>

                        <button @click="saveEvent" :disabled="loading" class="w-full bg-[#2563EB] text-white py-6 rounded-[2.5rem] font-black uppercase italic shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:bg-slate-200 text-lg tracking-widest">
                            {{ loading ? 'Publicando...' : 'Publicar Evento Oficial ➔' }}
                        </button>
                    </div>
                </div>
            </div>
        </template>
    </div>
    `,
    data() {
        return {
            events: [],
            isCreating: false,
            loading: false,
            saveError: null,
            saveSuccess: null,
            map: null,
            marker: null,
            existingTeams: [],
            form: {
                name: '',
                description: '',
                sport: 'basquetbol',
                customSport: '',
                isTeam: true,
                totalTeams: 2,
                playersPerTeam: 5,
                totalPlayers: 2,
                date: '',
                startTime: '18:00',
                endTime: '20:00',
                address: 'Valencia, Venezuela',
                lat: 10.1620,
                lon: -67.9972,
                ticketPrice: 5,
                totalTickets: 100,
                teams: []
            }
        };
    },
    watch: {
        'form.sport': function (newSport) {
            if (this.form.isTeam) {
                if (newSport === 'basquetbol') {
                    this.form.playersPerTeam = 5;
                } else if (newSport === 'futbol') {
                    this.form.playersPerTeam = 11;
                } else if (newSport === 'beisbol') {
                    this.form.playersPerTeam = 9;
                }
                this.generateTeams();
            }
            this.loadExistingTeams();
        },
        'form.customSport': function () {
            this.loadExistingTeams();
        },
        'form.isTeam': function () {
            this.generateTeams();
            this.loadExistingTeams();
        }
    },
    computed: {
        minDate() {
            const today = new Date();
            const min = new Date(today);
            min.setDate(today.getDate() + 7);
            return min.toISOString().split('T')[0];
        }
    },
    methods: {
        toggleView() {
            this.isCreating = !this.isCreating;
            this.saveError = null;
            this.saveSuccess = null;
            if (this.isCreating) {
                setTimeout(() => this.initMap(), 350);
                this.loadExistingTeams();
            }
        },
        initMap() {
            if (this.map) this.map.remove();
            this.map = L.map('map-olympia', { zoomControl: false }).setView([this.form.lat, this.form.lon], 14);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
            this.marker = L.marker([this.form.lat, this.form.lon], { draggable: true }).addTo(this.map);
            this.marker.on('dragend', () => {
                const pos = this.marker.getLatLng();
                this.form.lat = pos.lat;
                this.form.lon = pos.lng;
            });
        },
        async searchLocation() {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.form.address)}&limit=1`);
                const data = await res.json();
                if (data.length > 0) {
                    const { lat, lon } = data[0];
                    this.form.lat = parseFloat(lat);
                    this.form.lon = parseFloat(lon);
                    this.map.flyTo([lat, lon], 16);
                    this.marker.setLatLng([lat, lon]);
                }
            } catch (e) {
                console.error('Error buscando ubicación:', e);
            }
        },
        formatDate(dateStr) {
            if (!dateStr) return '';
            try {
                return new Date(dateStr).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' });
            } catch { return dateStr; }
        },
        formatTime(timeStr) {
            if (!timeStr) return '';
            try {
                return new Date(timeStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            } catch { return timeStr; }
        },
        generateTeams() {
            if (!this.form.isTeam) {
                const perGroup = Math.ceil((parseInt(this.form.totalPlayers) || 2) / 2);
                this.form.teams = [
                    {
                        id: null,
                        selectedTeamId: null,
                        useExisting: false,
                        isLoadingPlayers: false,
                        name: 'Grupo A',
                        is_home: true,
                        score: 0,
                        players: Array.from({ length: perGroup }, (_, i) => ({
                            name: `Participante ${i + 1}`,
                            jersey_number: i + 1,
                            position: 'Individual',
                            is_starter: true
                        }))
                    },
                    {
                        id: null,
                        selectedTeamId: null,
                        useExisting: false,
                        isLoadingPlayers: false,
                        name: 'Grupo B',
                        is_home: false,
                        score: 0,
                        players: Array.from({ length: perGroup }, (_, i) => ({
                            name: `Participante ${perGroup + i + 1}`,
                            jersey_number: perGroup + i + 1,
                            position: 'Individual',
                            is_starter: true
                        }))
                    }
                ];
                return;
            }
            const total = Math.max(2, parseInt(this.form.totalTeams) || 2);
            const perTeam = parseInt(this.form.playersPerTeam) || 1;
            this.form.teams = Array.from({ length: total }, (_, t) => ({
                id: null,
                selectedTeamId: null,
                useExisting: false,
                isLoadingPlayers: false,
                name: `Equipo ${t + 1}`,
                is_home: t === 0,
                score: 0,
                players: Array.from({ length: perTeam }, (_, i) => ({
                    name: `Jugador ${i + 1}`,
                    jersey_number: (t * perTeam) + i + 1,
                    position: 'N/A',
                    is_starter: i < 5
                }))
            }));
        },
        async saveEvent() {
            this.saveError = null;
            this.saveSuccess = null;

            if (!this.form.name.trim()) { this.saveError = 'El nombre/organizador del evento es requerido.'; this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' })); return; }
            if (!this.form.date) { this.saveError = 'La fecha del evento es requerida.'; this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' })); return; }
            if (this.form.date < this.minDate) { this.saveError = 'El evento debe programarse con al menos 7 días de anticipación.'; this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' })); return; }
            if (!this.form.startTime || !this.form.endTime) { this.saveError = 'Los horarios de inicio y cierre son requeridos.'; this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' })); return; }
            if (this.form.startTime >= this.form.endTime) { this.saveError = 'La hora de cierre debe ser posterior a la hora de inicio.'; this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' })); return; }
            if (!this.form.address.trim()) { this.saveError = 'La ubicación del recinto es requerida.'; this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' })); return; }
            if (parseFloat(this.form.ticketPrice) < 0 || isNaN(parseFloat(this.form.ticketPrice))) { this.saveError = 'El precio del ticket no puede ser negativo.'; this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' })); return; }
            if (parseInt(this.form.totalTickets) <= 0 || isNaN(parseInt(this.form.totalTickets))) { this.saveError = 'El total de cupos debe ser mayor a 0.'; this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' })); return; }

            if (this.form.isTeam && this.form.teams.length > 1) {
                const teamIds = this.form.teams.map(t => t.id).filter(id => id !== null);
                if (new Set(teamIds).size !== teamIds.length) {
                    this.saveError = 'No puedes seleccionar el mismo equipo registrado varias veces para competir.';
                    this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
                    return;
                }
                const teamNames = this.form.teams.map(t => t.name?.trim().toLowerCase()).filter(n => n);
                if (new Set(teamNames).size !== teamNames.length) {
                    this.saveError = 'Los equipos deben tener nombres diferentes para competir entre sí.';
                    this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
                    return;
                }
            }

            // Validar que todos los jugadores y equipos tengan nombre
            let missingNames = false;
            this.form.teams.forEach(team => {
                if (!team.useExisting && !team.name?.trim()) missingNames = true;
                team.players.forEach(p => {
                    if (!p.name?.trim()) missingNames = true;
                });
            });
            if (missingNames) {
                this.saveError = 'Todos los equipos y participantes deben tener un nombre asignado.';
                this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
                return;
            }

            this.loading = true;

            const sportValue = this.form.sport === 'otro'
                ? (this.form.customSport.trim() || 'otro')
                : this.form.sport;

            const statsKey = getStatsPayloadKey(sportValue);

            const payload = {
                name: this.form.name.trim(),
                sport: sportValue,
                event_date: this.form.date,
                start_time: `${this.form.date}T${this.form.startTime}:00`,
                end_time: `${this.form.date}T${this.form.endTime}:00`,
                location: this.form.address.trim(),
                lat: this.form.lat,
                lon: this.form.lon,
                total_tickets: parseInt(this.form.totalTickets) || 100,
                ticket_price: parseFloat(this.form.ticketPrice) || 0,
                teams: this.form.teams.map(t => ({
                    name: t.name.trim(),
                    is_home: t.is_home,
                    score: 0,
                    players: t.players.map(p => ({
                        name: p.name.trim(),
                        jersey_number: Number(p.jersey_number),
                        position: p.position || 'N/A',
                        is_starter: p.is_starter || false,
                        [statsKey]: getDefaultStats(sportValue)
                    }))
                }))
            };

            try {
                // Usamos el servicio centralizado de la API
                const result = await api.post('/events', payload);

                this.saveSuccess = `¡Evento publicado exitosamente! (ID: ${result.event_id})`;
                this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }));

                // Reflejar en tabla local sin recargar página
                this.events.push({
                    id: result.event_id,
                    name: payload.name,
                    sport: payload.sport,
                    location: payload.location,
                    lat: payload.lat,
                    lon: payload.lon,
                    event_date: payload.event_date,
                    start_time: payload.start_time,
                    end_time: payload.end_time,
                    total_tickets: payload.total_tickets,
                    status: 'activo'
                });

                setTimeout(() => {
                    this.isCreating = false;
                    this.saveSuccess = null;
                    this.resetForm();
                }, 1800);

            } catch (error) {
                this.saveError = error.message.includes('Failed to fetch')
                    ? 'No se puede conectar al servidor. Verifica que el backend esté activo en el puerto 8080.'
                    : (error.message || 'Error desconocido al publicar el evento.');
                this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
            } finally {
                this.loading = false;
            }
        },
        resetForm() {
            this.form = {
                name: '',
                sport: 'basquetbol',
                customSport: '',
                isTeam: true,
                totalTeams: 2,
                playersPerTeam: 5,
                totalPlayers: 2,
                date: '',
                startTime: '18:00',
                endTime: '20:00',
                address: 'Valencia, Venezuela',
                lat: 10.1620,
                lon: -67.9972,
                ticketPrice: 5,
                totalTickets: 100,
                teams: []
            };
            this.generateTeams();
        },
        async loadExistingTeams() {
            const sportValue = this.form.sport === 'otro'
                ? (this.form.customSport.trim() || 'otro')
                : this.form.sport;

            if (!sportValue || !this.form.isTeam) {
                this.existingTeams = [];
                return;
            }

            try {
                const response = await api.get(`/teams?sport=${sportValue}`);
                this.existingTeams = Array.isArray(response) ? response : [];
            } catch (error) {
                console.error('Error al cargar equipos existentes:', error);
                this.existingTeams = [];
            }
        },
        toggleTeamMode(team, useExisting, tIndex) {
            team.useExisting = useExisting;
            if (!useExisting) {
                team.id = null;
                team.selectedTeamId = null;
                team.name = `Equipo ${tIndex + 1}`;
                const perTeam = parseInt(this.form.playersPerTeam) || 1;
                team.players = Array.from({ length: perTeam }, (_, i) => ({
                    name: `Jugador ${i + 1}`,
                    jersey_number: (tIndex * perTeam) + i + 1,
                    position: 'N/A',
                    is_starter: i < 5
                }));
            }
        },
        async onTeamSelect(team, tIndex) {
            if (!team.selectedTeamId) return;

            const selected = this.existingTeams.find(ext => ext.id === team.selectedTeamId);
            if (selected) {
                team.id = selected.id;
                team.name = selected.name;
            }

            team.isLoadingPlayers = true;
            try {
                const players = await api.get(`/teams/${team.id}/players`);
                if (Array.isArray(players) && players.length > 0) {
                    team.players = players.map(p => ({
                        name: p.name,
                        jersey_number: p.jersey_number || p.number || 0,
                        position: p.position || 'N/A',
                        is_starter: p.is_starter || false
                    }));
                } else {
                    team.players = [];
                }
            } catch (error) {
                console.error('Error al cargar jugadores del equipo:', error);
                team.players = [];
            } finally {
                team.isLoadingPlayers = false;
            }
        }
    }
};