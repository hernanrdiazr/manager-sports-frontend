import { api } from '../../../services/api.js';
import {
    getDefaultStats,
    getStatsPayloadKey,
    getStandardTeams
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
            <div v-if="events.length === 0" class="bg-white rounded-[3rem] border-4 border-dashed border-slate-100 p-20 text-center">
                <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="fa-solid fa-trophy text-yellow-400 text-4xl"></i>
                </div>
                <h3 class="text-xl font-black text-slate-900 uppercase italic">Listo para publicar</h3>
                <p class="text-slate-400 mt-2 font-medium">Configura los detalles de tu próximo evento deportivo.</p>
                <button @click="toggleView" class="mt-8 text-blue-600 font-black uppercase text-xs tracking-widest hover:underline">
                    Configurar nuevo evento ➔
                </button>
            </div>

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

        <template v-else>
            <div class="bg-white w-full rounded-[3rem] shadow-sm border border-gray-100 animate-fade-in relative z-10">
                <div class="p-10">
                    <div v-if="saveError" class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-medium">
                        <i class="fa-solid fa-triangle-exclamation mr-1 text-red-500"></i> {{ saveError }}
                    </div>
                    <div v-if="saveSuccess" class="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl text-sm font-medium">
                        <i class="fa-solid fa-circle-check mr-1 text-emerald-500"></i> {{ saveSuccess }}
                    </div>

                    <div class="space-y-8">
                        <div class="grid grid-cols-2 gap-5">
                            <div class="col-span-1">
                                <label class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Nombre del Evento</label>
                                <input v-model="form.name" type="text" class="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-slate-700 shadow-inner" placeholder="Ej: Gran Clásico de Fútbol">
                            </div>
                            <div class="col-span-1">
                                <label class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Deporte</label>
                                <select v-model="form.sport" class="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-slate-700 cursor-pointer">
                                    <option value="basquetbol">Básquetbol</option>
                                    <option value="futbol">Fútbol</option>
                                    <option value="beisbol">Béisbol</option>
                                </select>
                            </div>
                        </div>

                        <div class="p-6 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100">
                            <div class="flex items-center justify-between mb-4">
                                <h4 class="text-xs font-black uppercase text-slate-600 tracking-widest">Equipos y Jugadores</h4>
                                <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">2 equipos &middot; {{ getPlayerCountLabel(form.sport) }} jugadores c/u</span>
                            </div>

                            <div v-if="form.teams.length > 0" class="space-y-4">
                                <div v-for="(team, tIndex) in form.teams" :key="tIndex" class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-md">
                                    <div class="flex items-center justify-between mb-4">
                                        <span class="text-xs font-black uppercase tracking-wider text-slate-500">
                                            {{ team.is_home ? 'Local' : 'Visitante' }}
                                        </span>
                                        <span class="text-sm font-black text-slate-800">{{ team.name }}</span>
                                    </div>

                                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                                        <div v-for="(player, pIndex) in team.players" :key="pIndex" class="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                                            <span class="text-[9px] font-black text-slate-400 w-6 text-right">#{{ player.jersey_number }}</span>
                                            <span class="flex-grow text-xs font-bold text-slate-700 truncate">{{ player.name }}</span>
                                            <span class="text-[8px] font-black text-slate-400 uppercase">{{ player.position }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

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

                        <div class="p-8 bg-blue-50/50 rounded-[3rem] border-2 border-blue-100 space-y-5">
                            <p class="text-[10px] font-black text-blue-600 uppercase text-center tracking-[0.25em]">Configuración de Entradas</p>
                            <div class="grid grid-cols-2 gap-6">
                                <div class="bg-white p-5 rounded-[2rem] shadow-sm border border-blue-100/50">
                                    <p class="text-[10px] font-black text-slate-900 uppercase mb-4 flex items-center gap-2 italic"><i class="fa-solid fa-tag text-[#06B6D4]"></i> Precio por Ticket ($)</p>
                                    <input v-model="form.ticketPrice" type="number" min="0" step="0.01" class="w-full p-2 bg-slate-50 rounded-lg font-bold text-sm outline-none">
                                </div>
                                <div class="bg-white p-5 rounded-[2rem] shadow-sm border border-blue-100/50">
                                    <p class="text-[10px] font-black text-slate-900 uppercase mb-4 flex items-center gap-2 italic"><i class="fa-solid fa-ticket text-blue-500"></i> Total de Cupos</p>
                                    <input v-model="form.totalTickets" type="number" min="1" class="w-full p-2 bg-slate-50 rounded-lg font-bold text-sm outline-none">
                                </div>
                            </div>
                        </div>

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
            form: {
                name: '',
                sport: 'basquetbol',
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
        'form.sport': function () {
            this.loadStandardTeams();
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
        getPlayerCountLabel(sport) {
            return { basquetbol: 5, futbol: 11, beisbol: 9 }[sport] || 0;
        },
        loadStandardTeams() {
            const std = getStandardTeams(this.form.sport);
            if (!std) {
                this.form.teams = [];
                return;
            }
            this.form.teams = [
                {
                    name: std.home.name,
                    is_home: true,
                    score: 0,
                    players: std.home.players.map(p => ({ ...p }))
                },
                {
                    name: std.away.name,
                    is_home: false,
                    score: 0,
                    players: std.away.players.map(p => ({ ...p }))
                }
            ];
            if (!this.form.name) {
                this.form.name = `${std.home.name} vs ${std.away.name}`;
            }
        },
        toggleView() {
            this.isCreating = !this.isCreating;
            this.saveError = null;
            this.saveSuccess = null;
            if (this.isCreating) {
                setTimeout(() => this.initMap(), 350);
                this.loadStandardTeams();
            }
        },
        initMap() {
            if (this.map) this.map.remove();
            this.map = L.map('map-olympia', { zoomControl: false }).setView([this.form.lat, this.form.lon], 14);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                crossOrigin: true
            }).addTo(this.map);
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
        async saveEvent() {
            this.saveError = null;
            this.saveSuccess = null;

            if (!this.form.name.trim()) { this.saveError = 'El nombre del evento es requerido.'; this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' })); return; }
            if (!this.form.date) { this.saveError = 'La fecha del evento es requerida.'; this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' })); return; }
            if (this.form.date < this.minDate) { this.saveError = 'El evento debe programarse con al menos 7 días de anticipación.'; this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' })); return; }
            if (!this.form.startTime || !this.form.endTime) { this.saveError = 'Los horarios de inicio y cierre son requeridos.'; this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' })); return; }
            if (this.form.startTime >= this.form.endTime) { this.saveError = 'La hora de cierre debe ser posterior a la hora de inicio.'; this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' })); return; }
            if (!this.form.address.trim()) { this.saveError = 'La ubicación del recinto es requerida.'; this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' })); return; }
            if (parseFloat(this.form.ticketPrice) < 0 || isNaN(parseFloat(this.form.ticketPrice))) { this.saveError = 'El precio del ticket no puede ser negativo.'; this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' })); return; }
            if (parseInt(this.form.totalTickets) <= 0 || isNaN(parseInt(this.form.totalTickets))) { this.saveError = 'El total de cupos debe ser mayor a 0.'; this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' })); return; }

            this.loading = true;

            const statsKey = getStatsPayloadKey(this.form.sport);

            const payload = {
                name: this.form.name.trim(),
                sport: this.form.sport,
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
                        [statsKey]: getDefaultStats(this.form.sport)
                    }))
                }))
            };

            try {
                const result = await api.post('/events', payload);

                this.saveSuccess = `¡Evento publicado exitosamente! (ID: ${result.event_id})`;
                this.$nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }));

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
                    status: 'próximo'
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
            this.loadStandardTeams();
        }
    }
};
