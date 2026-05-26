// AdminEvents.js
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
                            <p class="text-sm font-black text-slate-900 uppercase italic">{{ event.name }}</p>
                            <p class="text-xs text-slate-400 font-medium">{{ event.address }}</p>
                        </td>
                        <td class="px-6 py-5">
                            <span class="px-3 py-1 text-[10px] font-black rounded-full bg-blue-100 text-blue-700 uppercase">
                                {{ event.sport === 'Otros' ? event.customSport : event.sport }}
                            </span>
                        </td>
                        <td class="px-6 py-5">
                             <p class="text-xs text-slate-900 font-bold">{{ event.date }}</p>
                             <p class="text-[9px] text-slate-400 font-black uppercase tracking-tighter">{{ event.startTime }} - {{ event.endTime }}</p>
                        </td>
                        <td class="px-6 py-5">
                            <span class="text-xs font-black text-slate-700">{{ parseInt(event.tickets.general.capacity) + parseInt(event.tickets.vip.capacity) }}</span>
                            <span class="text-[9px] font-bold text-slate-400 uppercase ml-1">Total</span>
                        </td>
                        <td class="px-6 py-5">
                            <div class="flex items-center gap-1.5">
                                <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span class="text-[10px] font-black text-green-600 uppercase text-nowrap">Programado</span>
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

                    <div class="space-y-8">
                        <!-- Nombre y Deporte -->
                        <div class="grid grid-cols-2 gap-5">
                            <div class="col-span-2">
                                <label class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Nombre del Evento</label>
                                <input v-model="form.name" type="text" class="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-slate-700 shadow-inner" placeholder="Ej: Torneo Relámpago Carabobo">
                            </div>
                            <div :class="form.sport === 'Otros' ? 'col-span-1' : 'col-span-2'">
                                <label class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Deporte</label>
                                <select v-model="form.sport" class="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-blue-500 outline-none font-bold text-slate-700 cursor-pointer">
                                    <option value="Basketball">🏀 Basketball</option>
                                    <option value="Fútbol">⚽ Fútbol</option>
                                    <option value="Béisbol">⚾ Béisbol</option>
                                    <option value="Otros">Otros</option>
                                </select>
                            </div>
                            <div v-if="form.sport === 'Otros'" class="animate-fade-in">
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
                                        <input v-model="form.totalTeams" type="number" class="w-full p-3.5 bg-white rounded-xl font-bold border border-slate-200 outline-none focus:border-blue-500 transition-all">
                                    </div>
                                    <div>
                                        <span class="text-[9px] font-black text-slate-400 uppercase ml-2">Jugadores x Equipo</span>
                                        <input v-model="form.playersPerTeam" type="number" class="w-full p-3.5 bg-white rounded-xl font-bold border border-slate-200 outline-none focus:border-blue-500 transition-all">
                                    </div>
                                </template>
                                <template v-else>
                                    <div class="col-span-2">
                                        <span class="text-[9px] font-black text-slate-400 uppercase ml-2">Total Jugadores</span>
                                        <input v-model="form.totalPlayers" type="number" class="w-full p-3.5 bg-white rounded-xl font-bold border border-slate-200 outline-none focus:border-blue-500 transition-all">
                                    </div>
                                </template>
                            </div>
                        </div>

                        <!-- Fecha y Horarios (Con restricción de 7 días) -->
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

                        <!-- Venta de Entradas -->
                        <div class="p-8 bg-blue-50/50 rounded-[3rem] border-2 border-blue-100 space-y-5">
                            <p class="text-[10px] font-black text-blue-600 uppercase text-center tracking-[0.25em]">Configuración de Entradas</p>
                            <div class="grid grid-cols-2 gap-6">
                                <div class="bg-white p-5 rounded-[2rem] shadow-sm border border-blue-100/50">
                                    <p class="text-[10px] font-black text-slate-900 uppercase mb-4 flex items-center gap-2 italic">🎟️ General</p>
                                    <div class="space-y-4">
                                        <div class="grid grid-cols-2 gap-2">
                                            <div>
                                                <span class="text-[8px] font-black text-slate-300 uppercase">Precio $</span>
                                                <input v-model="form.tickets.general.price" type="number" class="w-full p-2 bg-slate-50 rounded-lg font-bold text-sm outline-none">
                                            </div>
                                            <div>
                                                <span class="text-[8px] font-black text-slate-300 uppercase">Cupos</span>
                                                <input v-model="form.tickets.general.capacity" type="number" class="w-full p-2 bg-slate-50 rounded-lg font-bold text-sm outline-none">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="bg-white p-5 rounded-[2rem] shadow-sm border border-amber-100/50">
                                    <p class="text-[10px] font-black text-amber-600 uppercase mb-4 flex items-center gap-2 italic">🌟 VIP</p>
                                    <div class="space-y-4">
                                        <div class="grid grid-cols-2 gap-2">
                                            <div>
                                                <span class="text-[8px] font-black text-slate-300 uppercase">Precio $</span>
                                                <input v-model="form.tickets.vip.price" type="number" class="w-full p-2 bg-slate-50 rounded-lg font-bold text-sm outline-none">
                                            </div>
                                            <div>
                                                <span class="text-[8px] font-black text-slate-300 uppercase">Cupos</span>
                                                <input v-model="form.tickets.vip.capacity" type="number" class="w-full p-2 bg-slate-50 rounded-lg font-bold text-sm outline-none">
                                            </div>
                                        </div>
                                    </div>
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
                            {{ loading ? 'Sincronizando...' : 'Publicar Evento Oficial ➔' }}
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
            map: null,
            marker: null,
            form: {
                name: '',
                sport: 'Basketball',
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
                tickets: {
                    general: { price: 5, capacity: 100 },
                    vip: { price: 15, capacity: 20 }
                }
            }
        };
    },
    computed: {
        // Cálculo de la fecha mínima (Hoy + 7 días)
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
            setTimeout(() => this.initMap(), 350);
        },
        initMap() {
            if (this.map) this.map.remove();
            this.map = L.map('map-olympia', { zoomControl: false }).setView([this.form.lat, this.form.lon], 14);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
            this.marker = L.marker([this.form.lat, this.form.lon], { draggable: true }).addTo(this.map);
            this.marker.on('dragend', () => {
                const pos = this.marker.getLatLng();
                this.form.lat = pos.lat; this.form.lon = pos.lng;
            });
        },
        async searchLocation() {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.form.address)}&limit=1`);
                const data = await res.json();
                if (data.length > 0) {
                    const { lat, lon } = data[0];
                    this.form.lat = lat; this.form.lon = lon;
                    this.map.flyTo([lat, lon], 16);
                    this.marker.setLatLng([lat, lon]);
                }
            } catch (e) { console.error(e); }
        },
        async saveEvent() {
            if (!this.form.name || !this.form.date) return alert("Completa los datos requeridos.");
            
            // Validación extra de seguridad por si acaso
            if (this.form.date < this.minDate) {
                return alert("El evento debe programarse con al menos 7 días de anticipación.");
            }

            this.loading = true;
            const newEvent = {
                id: Date.now(),
                ...JSON.parse(JSON.stringify(this.form)),
                sport: this.form.sport === 'Otros' ? this.form.customSport : this.form.sport
            };

            await new Promise(r => setTimeout(r, 1500));
            this.events.push(newEvent);
            this.showCreateModal = false;
            this.loading = false;
        }
    }
};