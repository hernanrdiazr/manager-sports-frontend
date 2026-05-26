import { api } from '../../../services/api.js';
import eventLocationPicker from '../event/eventLocationPicker.js';
import {
    getPlayerPositions,
    getDefaultStats,
    getStatsPayloadKey
} from '../event/eventSportConfig.js';

const SPORTS = [
    { value: 'futbol', label: 'Fútbol' },
    { value: 'beisbol', label: 'Béisbol' },
    { value: 'basquetbol', label: 'Básquetbol' },
    { value: 'otro', label: 'Otro' }
];

function emptyTeam(index) {
    return {
        id: Date.now() + index,
        name: '',
        is_home: index === 0,
        players: []
    };
}

function emptyPlayer() {
    return {
        id: Date.now() + Math.random(),
        name: '',
        jersey_number: 1,
        position: '',
        is_starter: true
    };
}

function pad(n) {
    return String(n).padStart(2, '0');
}

export default {
    components: { eventLocationPicker },

    template: `
        <div class="animate-fade-in max-w-4xl mx-auto">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900">Crear evento deportivo</h2>
                    <p class="text-sm text-slate-500 mt-0.5">Registra un nuevo evento con equipos y jugadores</p>
                </div>
            </div>

            <form @keydown.enter.prevent="submitEvent" class="space-y-6">
                <!-- Información del evento -->
                <section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg class="w-4 h-4 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Información del evento
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="sm:col-span-2">
                            <label class="text-xs font-medium text-slate-600">Organizador *</label>
                            <input v-model.trim="form.organizer" maxlength="150" placeholder="Ej: Liga MX" :class="inputClass('organizer')" />
                            <p v-if="errors.organizer" class="text-xs text-red-500 mt-1">{{ errors.organizer }}</p>
                        </div>
                        <div>
                            <label class="text-xs font-medium text-slate-600">Deporte *</label>
                            <select v-model="form.sport" @change="onSportChange" :class="inputClass('sport')">
                                <option value="" disabled>Seleccionar…</option>
                                <option v-for="s in sports" :key="s.value" :value="s.value">{{ s.label }}</option>
                            </select>
                            <p v-if="errors.sport" class="text-xs text-red-500 mt-1">{{ errors.sport }}</p>
                        </div>
                        <div>
                            <label class="text-xs font-medium text-slate-600">Fecha del evento *</label>
                            <input v-model="form.event_date" type="date" :min="todayStr" :class="inputClass('event_date')" />
                            <p v-if="errors.event_date" class="text-xs text-red-500 mt-1">{{ errors.event_date }}</p>
                        </div>
                        <div>
                            <label class="text-xs font-medium text-slate-600">Hora de inicio *</label>
                            <input v-model="form.start_time" type="time" :class="inputClass('start_time')" />
                            <p v-if="errors.start_time" class="text-xs text-red-500 mt-1">{{ errors.start_time }}</p>
                        </div>
                        <div class="sm:col-span-2">
                            <label class="text-xs font-medium text-slate-600">Descripción</label>
                            <textarea v-model="form.description" rows="2" maxlength="500" placeholder="Descripción del evento" class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"></textarea>
                        </div>
                    </div>
                </section>

                <!-- Ubicación -->
                <section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg class="w-4 h-4 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        Ubicación *
                    </h3>
                    <eventLocationPicker v-model="form.location" />
                    <p v-if="errors.location" class="text-xs text-red-500 mt-1">{{ errors.location }}</p>
                </section>

                <!-- Tickets -->
                <section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg class="w-4 h-4 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
                        </svg>
                        Boletos
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label class="text-xs font-medium text-slate-600">Total de boletos *</label>
                            <input v-model.number="form.total_tickets" type="number" min="0" :class="inputClass('total_tickets')" />
                            <p v-if="errors.total_tickets" class="text-xs text-red-500 mt-1">{{ errors.total_tickets }}</p>
                        </div>
                        <div>
                            <label class="text-xs font-medium text-slate-600">Precio por boleto ($) *</label>
                            <input v-model.number="form.ticket_price" type="number" min="0" step="0.01" :class="inputClass('ticket_price')" />
                            <p v-if="errors.ticket_price" class="text-xs text-red-500 mt-1">{{ errors.ticket_price }}</p>
                        </div>
                    </div>
                </section>

                <!-- Equipos -->
                <section class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h3 class="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <svg class="w-4 h-4 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                        </svg>
                        Equipos (local vs visitante)
                    </h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div v-for="(team, ti) in form.teams" :key="team.id"
                             class="p-4 border rounded-xl"
                             :class="team.is_home ? 'border-[#2563EB]/30 bg-blue-50/30' : 'border-gray-200'">
                            <div class="flex items-center justify-between mb-3">
                                <span class="text-sm font-semibold text-gray-900">
                                    {{ team.is_home ? '🏠 Local' : '✈️ Visitante' }}
                                </span>
                                <label class="flex items-center gap-1.5 text-xs cursor-pointer select-none"
                                       :class="team.is_home ? 'text-slate-400' : 'text-[#2563EB] font-medium'">
                                    <input type="radio" name="homeTeam" :value="true"
                                           @change="setHomeTeam(ti)"
                                           :checked="team.is_home" class="accent-[#2563EB]" />
                                    {{ team.is_home ? 'Local' : 'Marcar como local' }}
                                </label>
                            </div>
                            <div class="space-y-3">
                                <div>
                                    <label class="text-xs font-medium text-slate-600">Nombre del equipo *</label>
                                    <input v-model.trim="team.name" maxlength="100" :placeholder="team.is_home ? 'Ej: Tigres UANL' : 'Ej: Rayados MTY'"
                                           class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30" />
                                </div>
                                <div>
                                    <div class="flex items-center justify-between">
                                        <label class="text-xs font-medium text-slate-600">Jugadores ({{ team.players.length }})</label>
                                        <button type="button" @click="addPlayer(ti)" class="text-xs text-[#2563EB] font-medium hover:underline">+ Agregar</button>
                                    </div>
                                    <div v-if="team.players.length" class="mt-2 space-y-2">
                                        <div v-for="(player, pi) in team.players" :key="player.id"
                                             class="flex flex-wrap items-center gap-2 p-2 bg-white rounded-lg border border-gray-100">
                                            <input v-model.trim="player.name" maxlength="100" placeholder="Nombre"
                                                   class="flex-1 min-w-[100px] px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30" />
                                            <input v-model.number="player.jersey_number" type="number" min="1" max="99" placeholder="#"
                                                   class="w-14 px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30" />
                                            <select v-model="player.position"
                                                    class="px-2.5 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30">
                                                <option value="" disabled>Posición</option>
                                                <option v-for="pos in positions" :key="pos.value" :value="pos.value">{{ pos.label }}</option>
                                            </select>
                                            <label class="flex items-center gap-1 text-xs whitespace-nowrap">
                                                <input type="checkbox" v-model="player.is_starter" />
                                                Titular
                                            </label>
                                            <button type="button" @click="removePlayer(ti, pi)" class="p-1 text-red-400 hover:text-red-600">
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                                            </button>
                                        </div>
                                    </div>
                                    <p v-else class="text-xs text-slate-400 mt-1">Sin jugadores registrados</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <p v-if="errors.teams" class="text-xs text-red-500 mt-2">{{ errors.teams }}</p>
                    <p v-if="errors.team_names" class="text-xs text-red-500 mt-1">{{ errors.team_names }}</p>
                </section>

                <!-- Acciones -->
                <div class="flex items-center justify-end gap-3">
                    <button type="button" @click="resetForm" class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
                        Cancelar
                    </button>
                    <button type="submit" @click.prevent="submitEvent" :disabled="submitting" class="bg-[#2563EB] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1d4ed8] disabled:opacity-50 flex items-center gap-2">
                        <svg v-if="submitting" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        {{ submitting ? 'Creando...' : 'Crear evento' }}
                    </button>
                </div>

                <div v-if="submitError" class="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">{{ submitError }}</div>
                <div v-if="submitSuccess" class="bg-green-50 text-green-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    {{ submitSuccess }}
                </div>
            </form>
        </div>
    `,

    data() {
        return {
            sports: SPORTS,
            form: this.getEmptyForm(),
            errors: {},
            submitting: false,
            submitError: null,
            submitSuccess: null
        };
    },

    computed: {
        positions() {
            if (!this.form.sport) return [];
            return getPlayerPositions(this.form.sport);
        },
        todayStr() {
            const d = new Date();
            d.setDate(d.getDate() + 1);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        }
    },

    methods: {
        getEmptyForm() {
            return {
                organizer: '',
                sport: '',
                description: '',
                event_date: '',
                start_time: '',
                location: '',
                total_tickets: 0,
                ticket_price: 0,
                teams: [emptyTeam(0), emptyTeam(1)]
            };
        },

        inputClass(field) {
            const base = 'w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30';
            return this.errors[field] ? `${base} border-red-400 bg-red-50/30` : `${base} border-gray-200`;
        },

        setHomeTeam(index) {
            this.form.teams.forEach((t, i) => { t.is_home = i === index; });
        },

        onSportChange() {
            if (!this.form.sport) return;
            const now = new Date();
            this.form.start_time = pad(now.getHours()) + ':' + pad(now.getMinutes());
        },

        addPlayer(teamIndex) {
            this.form.teams[teamIndex].players.push(emptyPlayer());
        },

        removePlayer(teamIndex, playerIndex) {
            this.form.teams[teamIndex].players.splice(playerIndex, 1);
        },

        resetForm() {
            this.form = this.getEmptyForm();
            this.errors = {};
            this.submitError = null;
            this.submitSuccess = null;
        },

        validate() {
            const errs = {};

            if (!this.form.organizer.trim()) errs.organizer = 'El organizador es obligatorio';
            if (!this.form.sport) errs.sport = 'Selecciona un deporte';

            if (!this.form.event_date) {
                errs.event_date = 'Selecciona la fecha del evento';
            } else {
                const d = new Date(this.form.event_date + 'T12:00:00');
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                if (d < tomorrow) {
                    errs.event_date = 'El evento debe programarse con al menos un día de antelación';
                }
            }

            if (!this.form.start_time) {
                errs.start_time = 'Selecciona la hora de inicio';
            }

            if (!this.form.location.trim()) errs.location = 'La ubicación es obligatoria';
            if (!this.form.total_tickets || this.form.total_tickets < 1) errs.total_tickets = 'Debe haber al menos 1 boleto';
            if (this.form.ticket_price < 0) errs.ticket_price = 'El precio no puede ser negativo';

            const homeTeams = this.form.teams.filter(t => t.is_home);
            if (homeTeams.length !== 1) errs.teams = 'Selecciona qué equipo es el local';

            const names = this.form.teams.map(t => t.name.trim());
            if (!names[0]) errs.team_names = 'El equipo local necesita nombre';
            else if (!names[1]) errs.team_names = 'El equipo visitante necesita nombre';
            else if (names[0] === names[1]) errs.team_names = 'Los equipos deben tener nombres distintos';

            this.errors = errs;
            return Object.keys(errs).length === 0;
        },

        async submitEvent() {
            if (this.submitting) return;
            try {
                if (!this.validate()) return;
                this.submitting = true;
                this.submitError = null;
                this.submitSuccess = null;

                const payload = this.buildPayload();
                await api.post('/events', payload);
                this.submitSuccess = 'Evento creado exitosamente';
                this.resetForm();
                setTimeout(() => { this.submitSuccess = null; }, 4000);
            } catch (e) {
                this.submitError = e.message || 'Error inesperado al crear el evento';
            } finally {
                this.submitting = false;
            }
        },

        buildPayload() {
            const startDateTime = new Date(this.form.event_date + 'T' + this.form.start_time);
            const startISO = startDateTime.toISOString();
            const statsKey = getStatsPayloadKey(this.form.sport);

            return {
                organizer: this.form.organizer.trim(),
                sport: this.form.sport,
                description: this.form.description.trim(),
                event_date: this.form.event_date,
                start_time: startISO,
                end_time: startISO,
                location: this.form.location.trim(),
                total_tickets: Number(this.form.total_tickets),
                ticket_price: Number(this.form.ticket_price),
                teams: this.form.teams.map(t => ({
                    name: t.name.trim(),
                    is_home: t.is_home,
                    score: 0,
                    players: t.players.map(p => ({
                        name: p.name.trim(),
                        jersey_number: Number(p.jersey_number),
                        position: p.position,
                        is_starter: p.is_starter,
                        [statsKey]: getDefaultStats(this.form.sport)
                    }))
                }))
            };
        }
    }
};
