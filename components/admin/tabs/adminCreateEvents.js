import { api } from '../../../services/api.js';

export default {
    template: `
    <div class="animate-fade-in">
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">Gestión de Eventos</h2>
            <button @click="openModal" class="bg-[#2563EB] text-white px-6 py-2.5 rounded-full text-sm font-black uppercase italic tracking-wider hover:bg-[#1d4ed8] transition-all shadow-lg hover:scale-105">
                + Nuevo Evento
            </button>
        </div>

        <!-- ESTADO VACÍO -->
        <div v-if="events.length === 0" class="bg-white rounded-[3rem] border-4 border-dashed border-slate-100 p-20 text-center">
            <div class="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span class="text-4xl">🏆</span>
            </div>
            <h3 class="text-xl font-black text-slate-900 uppercase italic">Aún no hay eventos disponibles</h3>
            <p class="text-slate-400 mt-2 font-medium">Los eventos deben crearse con un mínimo de 7 días de anticipación.</p>
            <button @click="openModal" class="mt-8 text-blue-600 font-black uppercase text-xs tracking-widest hover:underline">
                Crear primer evento ➔
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
                            <p class="text-sm font-black text-slate-900 uppercase italic">{{ event.organizer }}</p>
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

        <!-- Modal de Creación -->
        <div v-if="showCreateModal" class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
            <div class="bg-white w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-[3rem] shadow-2xl relative animate-modal-up">
                <div class="p-10">
                    <div class="flex justify-between items-center mb-8">
                        <div>
                            <h3 class="text-3xl font-black italic uppercase tracking-tighter text-slate-900">Configurar <span class="text-blue-600">Evento</span></h3>
                            <p class="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1 italic">Mínimo 7 días de antelación requerido</p>
                        </div>
                        <button @click="showCreateModal = false" class="w-10 h-10 flex items-center justify-center bg-slate-50 text-slate-400 hover:text-red-500 rounded-full transition-all">✕</button>
                    </div>

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
                            <div class="col-span-2">
                                <label class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Nombre / Organizador del Evento</label>
                                <input v-model="form.name" type="text" class="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-slate-700 shadow-inner" placeholder="Ej: Liga Nacional de Básquetbol">
                            </div>
                            <div class="col-span-2">
                                <label class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Descripción</label>
                                <textarea v-model="form.description" rows="2" class="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-slate-700 shadow-inner resize-none" placeholder="Descripción breve del evento..."></textarea>
                            </div>
                            <div :class="form.sport === 'otro' ? 'col-span-1' : 'col-span-2'">
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
                            <div class="grid grid-cols-2 gap-4">
                                <template v-if="form.isTeam">
                                    <div>
                                        <span class="text-[9px] font-black text-slate-400 uppercase ml-2">Total Equipos</span>
                                        <input v-model="form.totalTeams" type="number" min="2" class="w-full p-3.5 bg-white rounded-xl font-bold border border-slate-200 outline-none focus:border-blue-500 transition-all">
                                    </div>
                                    <div>
                                        <span class="text-[9px] font-black text-slate-400 uppercase ml-2">Jugadores x Equipo</span>
                                        <input v-model="form.playersPerTeam" type="number" min="1" class="w-full p-3.5 bg-white rounded-xl font-bold border border-slate-200 outline-none focus:border-blue-500 transition-all">
                                    </div>
                                </template>
                                <template v-else>
                                    <div class="col-span-2">
                                        <span class="text-[9px] font-black text-slate-400 uppercase ml-2">Total Jugadores</span>
                                        <input v-model="form.totalPlayers" type="number" min="1" class="w-full p-3.5 bg-white rounded-xl font-bold border border-slate-200 outline-none focus:border-blue-500 transition-all">
                                    </div>
                                </template>
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
        </div>
    </div>
    `,
    data() {
        return {
            events: [],
            showCreateModal: false,
            loading: false,
            saveError: null,
            saveSuccess: null,
            map: null,
            marker: null,
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
                totalTickets: 100
            }
        };
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
        openModal() {
            this.showCreateModal = true;
            this.saveError = null;
            this.saveSuccess = null;
            setTimeout(() => this.initMap(), 350);
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
        buildTeams() {
            // El backend siempre requiere home_team_id y away_team_id en match_results,
            // por eso siempre enviamos mínimo 2 grupos/equipos.
            if (!this.form.isTeam) {
                const perGroup = Math.ceil((parseInt(this.form.totalPlayers) || 2) / 2);
                return [
                    {
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
            }
            const total = Math.max(2, parseInt(this.form.totalTeams) || 2);
            const perTeam = parseInt(this.form.playersPerTeam) || 1;
            return Array.from({ length: total }, (_, t) => ({
                name: `Equipo ${t + 1}`,
                is_home: t === 0,
                score: 0,
                players: Array.from({ length: perTeam }, (_, i) => ({
                    name: `Jugador ${i + 1}`,
                    jersey_number: (t * perTeam) + i + 1,
                    position: 'TBD',
                    is_starter: i < 5
                }))
            }));
        },
        async saveEvent() {
            this.saveError = null;
            this.saveSuccess = null;

            if (!this.form.name.trim()) { this.saveError = 'El nombre/organizador del evento es requerido.'; return; }
            if (!this.form.date) { this.saveError = 'La fecha del evento es requerida.'; return; }
            if (this.form.date < this.minDate) { this.saveError = 'El evento debe programarse con al menos 7 días de anticipación.'; return; }
            if (!this.form.startTime || !this.form.endTime) { this.saveError = 'Los horarios de inicio y cierre son requeridos.'; return; }

            this.loading = true;

            const sportValue = this.form.sport === 'otro'
                ? (this.form.customSport.trim() || 'otro')
                : this.form.sport;

            const payload = {
                organizer: this.form.name.trim(),
                sport: sportValue,
                description: this.form.description.trim() || `Evento de ${sportValue}`,
                event_date: this.form.date,
                start_time: `${this.form.date}T${this.form.startTime}:00`,
                end_time: `${this.form.date}T${this.form.endTime}:00`,
                location: this.form.address.trim(),
                total_tickets: parseInt(this.form.totalTickets) || 100,
                ticket_price: parseFloat(this.form.ticketPrice) || 0,
                teams: this.buildTeams()
            };

            try {
                // Usamos el servicio centralizado de la API
                const result = await api.post('/events', payload);

                this.saveSuccess = `¡Evento publicado exitosamente! (ID: ${result.event_id})`;

                // Reflejar en tabla local sin recargar página
                this.events.push({
                    id: result.event_id,
                    organizer: payload.organizer,
                    sport: payload.sport,
                    location: payload.location,
                    event_date: payload.event_date,
                    start_time: payload.start_time,
                    end_time: payload.end_time,
                    total_tickets: payload.total_tickets,
                    status: 'activo'
                });

                setTimeout(() => {
                    this.showCreateModal = false;
                    this.saveSuccess = null;
                    this.resetForm();
                }, 1800);

            } catch (error) {
                this.saveError = error.message.includes('Failed to fetch')
                    ? 'No se puede conectar al servidor. Verifica que el backend esté activo en el puerto 8080.'
                    : (error.message || 'Error desconocido al publicar el evento.');
            } finally {
                this.loading = false;
            }
        },
        resetForm() {
            this.form = {
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
                totalTickets: 100
            };
        }
    }
};