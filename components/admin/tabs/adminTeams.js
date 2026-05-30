import { api } from '../../../services/api.js';
import { getSportLabel, getPlayerPositions, PLAYER_STATUSES } from '../event/eventSportConfig.js';

const SPORTS = [
    { value: 'futbol',     label: 'Fútbol' },
    { value: 'beisbol',    label: 'Béisbol' },
    { value: 'basquetbol', label: 'Básquetbol' },
    { value: 'otro',       label: 'Otro' }
];

export default {
    template: `
        <div class="animate-fade-in">

            <!-- Vista de detalle de equipo -->
            <div v-if="selectedTeam">
                <button @click="selectedTeam = null" class="flex items-center gap-1.5 text-sm text-[#2563EB] font-medium mb-5 hover:underline">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    Volver a equipos
                </button>

                <div class="flex items-center gap-3 mb-6">
                    <div class="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
                        <svg class="w-5 h-5 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
                        </svg>
                    </div>
                    <div>
                        <h2 class="text-xl font-bold text-gray-900">{{ selectedTeam.name }}</h2>
                        <span class="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{{ sportLabel(selectedTeam.sport) }}</span>
                    </div>
                </div>

                <!-- Formulario agregar jugador -->
                <div class="bg-slate-50 rounded-2xl border border-slate-100 p-5 mb-6">
                    <h3 class="text-sm font-semibold text-gray-900 mb-4">Agregar jugador</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label class="text-xs font-medium text-slate-600">Nombre *</label>
                            <input v-model.trim="newPlayer.name" maxlength="100" placeholder="Nombre del jugador"
                                   :class="inputClass('name', playerErrors)" @input="playerErrors = {}"/>
                            <p v-if="playerErrors.name" class="text-xs text-red-500 mt-1">{{ playerErrors.name }}</p>
                        </div>
                        <div>
                            <label class="text-xs font-medium text-slate-600">Dorsal * (1–99)</label>
                            <input v-model.number="newPlayer.jersey_number" type="number" min="1" max="99"
                                   :class="inputClass('jersey_number', playerErrors)" @input="playerErrors = {}"/>
                            <p v-if="playerErrors.jersey_number" class="text-xs text-red-500 mt-1">{{ playerErrors.jersey_number }}</p>
                        </div>
                        <div>
                            <label class="text-xs font-medium text-slate-600">Posición *</label>
                            <select v-model="newPlayer.position" :class="inputClass('position', playerErrors)" @change="playerErrors = {}">
                                <option value="" disabled>Seleccionar…</option>
                                <option v-for="pos in positions" :key="pos.value" :value="pos.value">{{ pos.label }}</option>
                            </select>
                            <p v-if="playerErrors.position" class="text-xs text-red-500 mt-1">{{ playerErrors.position }}</p>
                        </div>
                        <div>
                            <label class="text-xs font-medium text-slate-600">¿Titular?</label>
                            <select v-model="newPlayer.is_starter" class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm">
                                <option :value="true">Sí — titular</option>
                                <option :value="false">No — suplente</option>
                            </select>
                        </div>
                    </div>
                    <div class="mt-4 flex items-center gap-3">
                        <button @click="addPlayer" :disabled="savingPlayer"
                                class="bg-[#2563EB] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#1d4ed8] disabled:opacity-50">
                            {{ savingPlayer ? 'Agregando…' : 'Agregar jugador' }}
                        </button>
                        <p v-if="playerSuccess" class="text-sm text-green-600">{{ playerSuccess }}</p>
                        <p v-if="playerError" class="text-sm text-red-500">{{ playerError }}</p>
                    </div>
                </div>

                <!-- Lista de jugadores -->
                <div v-if="loadingPlayers" class="flex justify-center py-8">
                    <svg class="animate-spin w-6 h-6 text-[#2563EB]" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                </div>
                <div v-else-if="teamPlayers.length" class="space-y-2">
                    <div v-for="p in teamPlayers" :key="p.id"
                         class="flex flex-wrap items-center justify-between gap-2 p-3 bg-white border border-gray-100 rounded-xl">
                        <div>
                            <span class="font-medium text-gray-900">#{{ p.jersey_number }} {{ p.name }}</span>
                            <span class="text-xs text-slate-400 ml-2">{{ positionLabel(p.position) }}</span>
                            <span v-if="p.is_starter" class="ml-2 text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">Titular</span>
                        </div>
                        <span class="text-xs px-2 py-1 rounded-lg border border-gray-200 text-slate-500">{{ statusLabel(p.status) }}</span>
                    </div>
                </div>
                <p v-else class="text-center py-8 text-slate-400 text-sm">Sin jugadores registrados en este equipo</p>
            </div>

            <!-- Vista de lista de equipos -->
            <template v-else>
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-2xl font-bold text-gray-900">Equipos</h2>
                        <p class="text-sm text-slate-500 mt-0.5">Crea y gestiona equipos con sus jugadores</p>
                    </div>
                </div>

                <!-- Formulario crear equipo -->
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <h3 class="text-sm font-semibold text-gray-900 mb-4">Crear nuevo equipo</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div class="sm:col-span-2">
                            <label class="text-xs font-medium text-slate-600">Nombre del equipo *</label>
                            <input v-model.trim="newTeam.name" maxlength="100" placeholder="Ej: Tigres UANL"
                                   :class="inputClass('name', teamErrors)" @input="teamErrors = {}"/>
                            <p v-if="teamErrors.name" class="text-xs text-red-500 mt-1">{{ teamErrors.name }}</p>
                        </div>
                        <div>
                            <label class="text-xs font-medium text-slate-600">Deporte *</label>
                            <select v-model="newTeam.sport" :class="inputClass('sport', teamErrors)" @change="teamErrors = {}">
                                <option value="" disabled>Seleccionar…</option>
                                <option v-for="s in sports" :key="s.value" :value="s.value">{{ s.label }}</option>
                            </select>
                            <p v-if="teamErrors.sport" class="text-xs text-red-500 mt-1">{{ teamErrors.sport }}</p>
                        </div>
                    </div>
                    <div class="mt-4 flex items-center gap-3">
                        <button @click="createTeam" :disabled="savingTeam"
                                class="bg-[#2563EB] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1d4ed8] disabled:opacity-50">
                            {{ savingTeam ? 'Creando…' : 'Crear equipo' }}
                        </button>
                        <p v-if="teamSuccess" class="text-sm text-green-600">{{ teamSuccess }}</p>
                        <p v-if="teamError"   class="text-sm text-red-500">{{ teamError }}</p>
                    </div>
                </div>

                <!-- Lista de equipos -->
                <div v-if="loading" class="flex justify-center py-12">
                    <svg class="animate-spin w-8 h-8 text-[#2563EB]" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                </div>

                <div v-else-if="teams.length" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-gray-100 bg-gray-50/50">
                                <th class="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Equipo</th>
                                <th class="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Deporte</th>
                                <th class="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Jugadores</th>
                                <th class="text-right px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Acción</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            <tr v-for="team in teams" :key="team.id" class="hover:bg-gray-50/50 transition-colors">
                                <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ team.name }}</td>
                                <td class="px-6 py-4">
                                    <span class="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600">
                                        {{ sportLabel(team.sport) }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-sm text-slate-500">{{ team.player_count }} jugador(es)</td>
                                <td class="px-6 py-4 text-right">
                                    <button @click="openTeam(team)"
                                            class="px-4 py-2 bg-[#2563EB] text-white text-sm font-medium rounded-xl hover:bg-[#1d4ed8] transition-colors">
                                        Gestionar
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-8 h-8 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">No hay equipos</h3>
                    <p class="text-slate-500 text-sm">Crea un equipo para poder asignarlo a eventos.</p>
                </div>
            </template>
        </div>
    `,

    data() {
        return {
            sports: SPORTS,
            teams: [],
            selectedTeam: null,
            teamPlayers: [],
            loading: false,
            loadingPlayers: false,
            savingTeam: false,
            savingPlayer: false,
            newTeam: { name: '', sport: '' },
            teamErrors: {},
            teamSuccess: null,
            teamError: null,
            newPlayer: { name: '', jersey_number: 1, position: '', is_starter: true },
            playerErrors: {},
            playerSuccess: null,
            playerError: null
        };
    },

    computed: {
        positions() {
            return this.selectedTeam ? getPlayerPositions(this.selectedTeam.sport) : [];
        }
    },

    async created() {
        await this.loadTeams();
    },

    methods: {
        inputClass(field, errors) {
            const base = 'w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30';
            return errors[field] ? `${base} border-red-400 bg-red-50/30` : `${base} border-gray-200`;
        },

        sportLabel(sport) { return getSportLabel(sport); },

        positionLabel(value) {
            return this.positions.find(p => p.value === value)?.label || value;
        },

        statusLabel(value) {
            return PLAYER_STATUSES.find(s => s.value === value)?.label || value;
        },

        async loadTeams() {
            this.loading = true;
            try {
                this.teams = await api.get('/teams');
            } catch (e) {
                console.error(e);
            } finally {
                this.loading = false;
            }
        },

        async openTeam(team) {
            this.selectedTeam = team;
            this.newPlayer = { name: '', jersey_number: 1, position: '', is_starter: true };
            this.playerErrors = {};
            this.playerSuccess = null;
            this.playerError = null;
            await this.loadTeamPlayers();
        },

        async loadTeamPlayers() {
            this.loadingPlayers = true;
            try {
                this.teamPlayers = await api.get(`/teams/${this.selectedTeam.id}/players`);
            } catch (e) {
                console.error(e);
            } finally {
                this.loadingPlayers = false;
            }
        },

        validateTeam() {
            const errs = {};
            if (!this.newTeam.name) errs.name = 'El nombre es obligatorio';
            if (!this.newTeam.sport) errs.sport = 'Selecciona un deporte';
            this.teamErrors = errs;
            return Object.keys(errs).length === 0;
        },

        async createTeam() {
            if (!this.validateTeam()) return;
            this.savingTeam = true;
            this.teamError = null;
            this.teamSuccess = null;
            try {
                await api.post('/teams', this.newTeam);
                this.teamSuccess = 'Equipo creado correctamente';
                this.newTeam = { name: '', sport: '' };
                setTimeout(() => { this.teamSuccess = null; }, 3000);
                await this.loadTeams();
            } catch (e) {
                this.teamError = e.message;
            } finally {
                this.savingTeam = false;
            }
        },

        validatePlayer() {
            const errs = {};
            if (!this.newPlayer.name) errs.name = 'El nombre es obligatorio';
            if (!this.newPlayer.jersey_number || this.newPlayer.jersey_number < 1 || this.newPlayer.jersey_number > 99)
                errs.jersey_number = 'Dorsal entre 1 y 99';
            if (!this.newPlayer.position) errs.position = 'Selecciona una posición';
            const dup = this.teamPlayers.find(p => p.jersey_number === this.newPlayer.jersey_number);
            if (dup) errs.jersey_number = `El dorsal #${this.newPlayer.jersey_number} ya está en uso`;
            this.playerErrors = errs;
            return Object.keys(errs).length === 0;
        },

        async addPlayer() {
            if (!this.validatePlayer()) return;
            this.savingPlayer = true;
            this.playerError = null;
            this.playerSuccess = null;
            try {
                await api.post(`/teams/${this.selectedTeam.id}/players?sport=${this.selectedTeam.sport}`, this.newPlayer);
                this.playerSuccess = 'Jugador agregado';
                this.newPlayer = { name: '', jersey_number: 1, position: '', is_starter: true };
                setTimeout(() => { this.playerSuccess = null; }, 3000);
                await this.loadTeamPlayers();
                await this.loadTeams();
            } catch (e) {
                this.playerError = e.message;
            } finally {
                this.savingPlayer = false;
            }
        }
    }
};
