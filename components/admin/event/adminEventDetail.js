import { api } from '../../../services/api.js';
import {
    getSportLabel,
    getPlayerPositions,
    getStatFieldGroups,
    getDefaultStats,
    getStatsPayloadKey,
    buildStatsBody,
    getFoulTypes,
    getFoulTypeLabel,
    getPlayerStatusLabel,
    getAttendanceLabel,
    getSelectOptionLabel,
    attendanceRequiresNote,
    getHomeTeamName,
    getAwayTeamName,
    ATTENDANCE_STATUSES,
    PLAYER_STATUSES
} from './eventSportConfig.js';
import {
    validatePlayerForm,
    validateScoreForm,
    validateAttendanceForm,
    validateStatsForm,
    validateFoulForm,
    hasErrors
} from './eventValidators.js';
import {
    isMockEvent,
    getMockEventDetail,
    getMockPlayerStats,
    mockUpdateScore,
    mockUpdatePlayerStatus,
    mockSaveAttendance,
    mockSavePlayerStats,
    mockRegisterPlayer,
    mockRegisterFoul
} from './mockEventsData.js';

export default {
    props: {
        event: { type: Object, required: true }
    },
    emits: ['close', 'updated'],

    template: `
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="$emit('close')">
            <div class="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-[min(90vh,820px)] flex flex-col overflow-hidden">

                <!-- Cabecera fija -->
                <header class="flex-shrink-0 px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-white">
                    <div class="flex items-start justify-between gap-4">
                        <div class="min-w-0 flex-1">
                            <div class="flex items-center gap-2 mb-1 flex-wrap">
                                <span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#2563EB]/10 text-[#2563EB]">{{ sportLabel }}</span>
                                <span v-if="isMock" class="px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-700">Demo</span>
                            </div>
                            <h3 class="text-lg sm:text-xl font-bold text-gray-900 truncate">Gestión deportiva del partido</h3>
                            <p class="text-sm text-slate-600 truncate">{{ event.organizer }}</p>
                            <p class="text-xs text-slate-400 truncate">{{ event.location }} · {{ formatDate(event.event_date) }}</p>
                        </div>
                        <button @click="$emit('close')" class="flex-shrink-0 p-2 text-slate-400 hover:text-gray-700 rounded-lg hover:bg-gray-100" aria-label="Cerrar">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div v-if="teams.length" class="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                        <div class="text-center min-w-0">
                            <p class="text-[10px] text-slate-400 uppercase truncate">{{ homeTeamName }}</p>
                            <p class="text-xl font-bold text-gray-900 tabular-nums">{{ scoreForm.home_score }}</p>
                        </div>
                        <span class="text-slate-300 text-lg px-1">—</span>
                        <div class="text-center min-w-0">
                            <p class="text-[10px] text-slate-400 uppercase truncate">{{ awayTeamName }}</p>
                            <p class="text-xl font-bold text-gray-900 tabular-nums">{{ scoreForm.away_score }}</p>
                        </div>
                    </div>
                </header>

                <!-- Navegación de tabs fija (no hace scroll con el contenido) -->
                <nav class="flex-shrink-0 z-20 bg-white border-b border-gray-100 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
                    <div class="px-4 pt-3 pb-2">
                        <div class="flex gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto" role="tablist">
                            <button
                                v-for="tab in tabs"
                                :key="tab.id"
                                type="button"
                                role="tab"
                                :aria-selected="activeTab === tab.id"
                                @click="switchTab(tab.id)"
                                class="flex-1 min-w-[5.5rem] px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-150"
                                :class="activeTab === tab.id
                                    ? 'bg-white text-[#2563EB] shadow-sm ring-1 ring-black/5'
                                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'"
                            >{{ tab.label }}</button>
                        </div>
                    </div>
                    <p class="px-6 pb-2 text-xs text-slate-500">{{ activeTabHint }}</p>
                </nav>

                <!-- Solo el contenido del tab hace scroll -->
                <div ref="tabPanel" class="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain">
                    <div class="p-6 min-h-full">
                    <div v-if="loading" class="flex justify-center py-16">
                        <svg class="animate-spin w-8 h-8 text-[#2563EB]" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                    </div>

                    <div v-else-if="error" class="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">{{ error }}</div>

                    <!-- Marcador -->
                    <div v-else-if="activeTab === 'puntuacion'">
                        <form @submit.prevent="saveScore" class="max-w-md space-y-4">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-xs font-medium text-slate-600 mb-1">{{ homeTeamName }} (local)</label>
                                    <input v-model.number="scoreForm.home_score" type="number" min="0" :class="inputClass('home_score', scoreErrors)" @input="scoreErrors = {}"/>
                                    <p v-if="scoreErrors.home_score" class="text-xs text-red-500 mt-1">{{ scoreErrors.home_score }}</p>
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-slate-600 mb-1">{{ awayTeamName }} (visitante)</label>
                                    <input v-model.number="scoreForm.away_score" type="number" min="0" :class="inputClass('away_score', scoreErrors)" @input="scoreErrors = {}"/>
                                    <p v-if="scoreErrors.away_score" class="text-xs text-red-500 mt-1">{{ scoreErrors.away_score }}</p>
                                </div>
                            </div>
                            <button type="submit" :disabled="saving" class="bg-[#2563EB] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1d4ed8] disabled:opacity-50">Guardar marcador</button>
                        </form>
                    </div>

                    <!-- Jugadores -->
                    <div v-else-if="activeTab === 'jugadores'">
                        <form @submit.prevent="registerPlayer" class="mb-6 p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                            <h4 class="text-sm font-semibold text-gray-900">Registrar jugador en plantilla</h4>
                            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label class="text-xs font-medium text-slate-600">Equipo *</label>
                                    <select v-model.number="newPlayer.team_id" :class="inputClass('team_id', playerErrors)" @change="playerErrors = {}">
                                        <option :value="null" disabled>Seleccionar…</option>
                                        <option v-for="t in teamOptions" :key="t.id" :value="t.id">{{ t.name }}</option>
                                    </select>
                                    <p v-if="playerErrors.team_id" class="text-xs text-red-500 mt-1">{{ playerErrors.team_id }}</p>
                                    <p v-else-if="!teamOptions.length" class="text-xs text-amber-600 mt-1">No hay equipos en este evento.</p>
                                </div>
                                <div>
                                    <label class="text-xs font-medium text-slate-600">Nombre *</label>
                                    <input v-model.trim="newPlayer.name" maxlength="100" :class="inputClass('name', playerErrors)" @input="playerErrors = {}"/>
                                    <p v-if="playerErrors.name" class="text-xs text-red-500 mt-1">{{ playerErrors.name }}</p>
                                </div>
                                <div>
                                    <label class="text-xs font-medium text-slate-600">Dorsal * (1–99)</label>
                                    <input v-model.number="newPlayer.jersey_number" type="number" min="1" max="99" :class="inputClass('jersey_number', playerErrors)" @input="playerErrors = {}"/>
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
                            <button type="submit" :disabled="saving || !teamOptions.length" class="bg-[#2563EB] text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50">Registrar jugador</button>
                        </form>

                        <div v-for="group in playersByTeam" :key="group.teamId" class="mb-4">
                            <h4 class="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 px-1">{{ group.teamName }}</h4>
                            <div class="space-y-2">
                                <div v-for="p in group.players" :key="p.id" class="flex flex-wrap items-center justify-between gap-2 p-3 bg-white border border-gray-100 rounded-xl">
                                    <div>
                                        <span class="font-medium text-gray-900">#{{ p.jersey_number }} {{ p.name }}</span>
                                        <span class="text-xs text-slate-400 ml-2">{{ positionLabel(p.position) }}</span>
                                        <span v-if="p.is_starter" class="ml-2 text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">Titular</span>
                                    </div>
                                    <select :value="p.status" @change="updatePlayerStatus(p.id, $event.target.value)" class="text-xs border border-gray-200 rounded-lg px-2 py-1.5 min-w-[120px]">
                                        <option v-for="s in playerStatuses" :key="s.value" :value="s.value">{{ s.label }}</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <p v-if="players.length === 0" class="text-center py-8 text-slate-400 text-sm">Sin jugadores en la plantilla</p>
                    </div>

                    <!-- Asistencia -->
                    <div v-else-if="activeTab === 'asistencia'">
                        <div class="space-y-3">
                            <div v-for="p in players" :key="'att-'+p.id" class="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div class="flex flex-wrap items-center gap-2 mb-3">
                                    <span class="text-sm font-medium text-gray-900">#{{ p.jersey_number }} {{ p.name }}</span>
                                </div>
                                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label class="text-xs font-medium text-slate-600">Estado *</label>
                                        <select v-model="attendanceDraft[p.id].status" class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" @change="onAttendanceStatusChange(p.id)">
                                            <option v-for="s in attendanceStatuses" :key="s.value" :value="s.value">{{ s.label }}</option>
                                        </select>
                                    </div>
                                    <div class="sm:col-span-2">
                                        <label class="text-xs font-medium text-slate-600">
                                            Nota {{ attendanceRequiresNote(attendanceDraft[p.id].status) ? '*' : '(opcional)' }}
                                        </label>
                                        <input
                                            v-model.trim="attendanceDraft[p.id].note"
                                            maxlength="200"
                                            :placeholder="attendanceRequiresNote(attendanceDraft[p.id].status) ? 'Motivo obligatorio…' : 'Observaciones…'"
                                            :class="inputClass('note', attendanceErrors[p.id] || {})"
                                        />
                                        <p v-if="attendanceErrors[p.id]?.note" class="text-xs text-red-500 mt-1">{{ attendanceErrors[p.id].note }}</p>
                                    </div>
                                </div>
                                <button @click="saveAttendance(p.id)" class="mt-3 text-sm text-[#2563EB] font-medium hover:underline">Guardar asistencia</button>
                            </div>
                        </div>
                        <p v-if="players.length === 0" class="text-center py-8 text-slate-400 text-sm">Registra jugadores primero</p>
                    </div>

                    <!-- Estadísticas -->
                    <div v-else-if="activeTab === 'estadisticas'">
                        <div v-if="!selectedPlayer">
                            <button
                                v-for="p in players"
                                :key="'st-'+p.id"
                                @click="openPlayerStats(p)"
                                class="w-full text-left p-4 mb-2 bg-white border border-gray-100 rounded-xl hover:border-[#2563EB]/30 hover:bg-blue-50/30 transition-all"
                            >
                                <span class="font-medium text-gray-900">#{{ p.jersey_number }} {{ p.name }}</span>
                                <span class="text-xs text-slate-400 ml-2">{{ positionLabel(p.position) }}</span>
                            </button>
                            <p v-if="players.length === 0" class="text-center py-8 text-slate-400 text-sm">Sin jugadores</p>
                        </div>
                        <div v-else>
                            <button type="button" @click="closeStats" class="text-sm text-[#2563EB] mb-4 hover:underline">← Volver a la lista</button>
                            <p class="font-semibold text-gray-900 mb-1">#{{ selectedPlayer.jersey_number }} {{ selectedPlayer.name }}</p>
                            <p class="text-xs text-slate-500 mb-4">{{ positionLabel(selectedPlayer.position) }}</p>
                            <form @submit.prevent="savePlayerStats">
                                <div v-for="group in statGroups" :key="group.id" class="mb-6">
                                    <h4 class="text-xs font-semibold text-slate-400 uppercase mb-3">{{ group.label }}</h4>
                                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        <div v-for="field in group.fields" :key="field.key">
                                            <label class="text-xs font-medium text-slate-600">{{ field.label }}</label>
                                            <select
                                                v-if="field.type === 'select'"
                                                v-model="statsForm[field.key]"
                                                :class="inputClass(field.key, statsErrors)"
                                                @change="onStatsRoleChange"
                                            >
                                                <option v-for="opt in field.options" :key="opt" :value="opt">{{ getSelectOptionLabel(field, opt) }}</option>
                                            </select>
                                            <input
                                                v-else
                                                v-model.number="statsForm[field.key]"
                                                :type="field.type === 'float' ? 'number' : 'number'"
                                                :step="field.type === 'float' ? '0.1' : '1'"
                                                :min="field.min"
                                                :max="field.max"
                                                :class="inputClass(field.key, statsErrors)"
                                                @input="statsErrors = {}"
                                            />
                                            <p v-if="statsErrors[field.key]" class="text-xs text-red-500 mt-0.5">{{ statsErrors[field.key] }}</p>
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" :disabled="saving" class="bg-[#2563EB] text-white px-5 py-2.5 rounded-xl text-sm font-medium disabled:opacity-50">Guardar estadísticas</button>
                            </form>
                        </div>
                    </div>

                    <!-- Fallas -->
                    <div v-else-if="activeTab === 'fallas'">
                        <form @submit.prevent="registerFoul" class="mb-6 p-5 bg-amber-50/60 rounded-2xl border border-amber-100 space-y-4">
                            <h4 class="text-sm font-semibold text-gray-900">Registrar infracción</h4>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label class="text-xs font-medium text-slate-600">Jugador *</label>
                                    <select v-model.number="newFoul.player_id" :class="inputClass('player_id', foulErrors)" @change="foulErrors = {}">
                                        <option :value="null" disabled>Seleccionar…</option>
                                        <option v-for="p in players" :key="p.id" :value="p.id">#{{ p.jersey_number }} {{ p.name }}</option>
                                    </select>
                                    <p v-if="foulErrors.player_id" class="text-xs text-red-500 mt-1">{{ foulErrors.player_id }}</p>
                                </div>
                                <div>
                                    <label class="text-xs font-medium text-slate-600">Tipo *</label>
                                    <select v-model="newFoul.foul_type" :class="inputClass('foul_type', foulErrors)" @change="foulErrors = {}">
                                        <option value="" disabled>Seleccionar…</option>
                                        <option v-for="f in foulTypes" :key="f.value" :value="f.value">{{ f.label }}</option>
                                    </select>
                                    <p v-if="foulErrors.foul_type" class="text-xs text-red-500 mt-1">{{ foulErrors.foul_type }}</p>
                                </div>
                                <div v-if="sport !== 'beisbol'">
                                    <label class="text-xs font-medium text-slate-600">Minuto (0–120)</label>
                                    <input v-model.number="newFoul.minute" type="number" min="0" max="120" :class="inputClass('minute', foulErrors)" @input="foulErrors = {}"/>
                                    <p v-if="foulErrors.minute" class="text-xs text-red-500 mt-1">{{ foulErrors.minute }}</p>
                                </div>
                                <div class="sm:col-span-2">
                                    <label class="text-xs font-medium text-slate-600">Descripción (opcional, máx. 200)</label>
                                    <input v-model.trim="newFoul.description" maxlength="200" :class="inputClass('description', foulErrors)" @input="foulErrors = {}"/>
                                    <p v-if="foulErrors.description" class="text-xs text-red-500 mt-1">{{ foulErrors.description }}</p>
                                </div>
                            </div>
                            <button type="submit" :disabled="saving || !players.length" class="bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-50">Registrar falta</button>
                        </form>
                        <div class="space-y-2">
                            <div v-for="f in fouls" :key="f.id" class="p-4 bg-white border border-gray-100 rounded-xl text-sm">
                                <span class="font-medium text-gray-900">{{ playerName(f.player_id) }}</span>
                                <span class="ml-2 px-2 py-0.5 text-xs rounded-full bg-amber-50 text-amber-800">{{ foulTypeLabel(f.foul_type) }}</span>
                                <span v-if="f.minute != null && f.minute > 0" class="text-slate-400 text-xs ml-2">min {{ f.minute }}</span>
                                <p v-if="f.description" class="text-xs text-slate-500 mt-2">{{ f.description }}</p>
                            </div>
                            <p v-if="fouls.length === 0" class="text-center py-6 text-slate-400 text-sm">Sin infracciones registradas</p>
                        </div>
                    </div>
                    </div>
                </div>

                <div v-if="toast" class="flex-shrink-0 px-6 py-3 bg-green-50 text-green-800 text-sm border-t border-green-100 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                    {{ toast }}
                </div>
            </div>
        </div>
    `,

    data() {
        return {
            activeTab: 'puntuacion',
            loading: true,
            saving: false,
            error: null,
            toast: null,
            players: [],
            attendance: [],
            fouls: [],
            teams: [],
            scoreForm: { home_score: 0, away_score: 0 },
            attendanceDraft: {},
            attendanceErrors: {},
            selectedPlayer: null,
            statsForm: {},
            statsErrors: {},
            scoreErrors: {},
            playerErrors: {},
            foulErrors: {},
            newPlayer: { team_id: null, name: '', jersey_number: 1, position: '', is_starter: true },
            newFoul: { player_id: null, foul_type: '', description: '', minute: null },
            tabs: [
                { id: 'puntuacion', label: 'Marcador', hint: 'Resultado' },
                { id: 'jugadores', label: 'Plantilla', hint: 'Altas y estado' },
                { id: 'asistencia', label: 'Asistencia', hint: 'Presencia' },
                { id: 'estadisticas', label: 'Estadísticas', hint: 'Por jugador' },
                { id: 'fallas', label: 'Infracciones', hint: 'Tarjetas / faltas' }
            ]
        };
    },

    computed: {
        sport() { return this.event.sport; },
        sportLabel() { return getSportLabel(this.sport); },
        isMock() { return isMockEvent(this.event.id); },
        positions() { return getPlayerPositions(this.sport); },
        attendanceStatuses() { return ATTENDANCE_STATUSES; },
        playerStatuses() { return PLAYER_STATUSES; },
        foulTypes() { return getFoulTypes(this.sport); },
        homeTeamName() { return getHomeTeamName(this.teams); },
        awayTeamName() { return getAwayTeamName(this.teams); },
        teamOptions() {
            return this.teams.map(t => ({ id: t.id, name: t.name || `Equipo #${t.id}` }));
        },
        playersByTeam() {
            const map = {};
            this.players.forEach(p => {
                if (!map[p.team_id]) {
                    const team = this.teams.find(t => t.id === p.team_id);
                    map[p.team_id] = {
                        teamId: p.team_id,
                        teamName: team?.name || `Equipo #${p.team_id}`,
                        players: []
                    };
                }
                map[p.team_id].players.push(p);
            });
            return Object.values(map);
        },
        statGroups() {
            if (!this.selectedPlayer) return [];
            return getStatFieldGroups(this.sport, this.statsForm, this.selectedPlayer);
        },
        activeTabHint() {
            return this.tabs.find(t => t.id === this.activeTab)?.hint || '';
        }
    },

    async created() {
        await this.loadAll();
        this.resetNewPlayerDefaults();
    },

    methods: {
        inputClass(field, errors) {
            const base = 'w-full mt-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30';
            return errors[field] ? `${base} border-red-400 bg-red-50/30` : `${base} border-gray-200`;
        },

        switchTab(id) {
            if (id !== 'estadisticas' && this.selectedPlayer) {
                this.selectedPlayer = null;
                this.statsErrors = {};
            }
            this.activeTab = id;
            this.error = null;
            this.$nextTick(() => {
                const panel = this.$refs.tabPanel;
                if (panel) panel.scrollTop = 0;
            });
        },

        positionLabel(value) {
            return this.positions.find(p => p.value === value)?.label || value;
        },

        foulTypeLabel(value) {
            return getFoulTypeLabel(this.sport, value);
        },

        attendanceRequiresNote,

        getSelectOptionLabel,

        async loadAll() {
            this.loading = true;
            this.error = null;
            try {
                if (this.isMock) {
                    const detail = getMockEventDetail(this.event.id);
                    this.players = detail.players;
                    this.attendance = detail.attendance;
                    this.fouls = detail.fouls;
                    this.teams = detail.teams;
                    this.scoreForm = { ...detail.score };
                } else {
                    const [players, attendance, fouls, teams] = await Promise.all([
                        api.get(`/events/${this.event.id}/players`),
                        api.get(`/events/${this.event.id}/attendance`),
                        api.get(`/events/${this.event.id}/fouls`),
                        api.get(`/events/${this.event.id}/teams`).catch(() => [])
                    ]);
                    this.players = Array.isArray(players) ? players : [];
                    this.attendance = Array.isArray(attendance) ? attendance : [];
                    this.fouls = Array.isArray(fouls) ? fouls : [];
                    this.teams = Array.isArray(teams) && teams.length > 0 ? teams : this.deriveTeamsFromPlayers();
                    try {
                        const result = await api.get(`/events/${this.event.id}/result`);
                        this.scoreForm = { home_score: result.home_score, away_score: result.away_score };
                    } catch {
                        this.scoreForm = { home_score: 0, away_score: 0 };
                    }
                }
                this.initAttendanceDraft();
                this.initFoulDefaults();
            } catch (e) {
                this.error = e.message;
            } finally {
                this.loading = false;
            }
        },

        deriveTeamsFromPlayers() {
            const ids = [...new Set(this.players.map(p => p.team_id))];
            return ids.map((id, i) => ({ id, name: `Equipo #${id}`, is_home: i === 0 }));
        },

        resetNewPlayerDefaults() {
            if (this.teamOptions.length) this.newPlayer.team_id = this.teamOptions[0].id;
            if (this.positions.length) this.newPlayer.position = this.positions[0].value;
        },

        initAttendanceDraft() {
            const draft = {};
            this.players.forEach(p => {
                const existing = this.attendance.find(a => a.player_id === p.id);
                draft[p.id] = { status: existing?.status || 'present', note: existing?.note || '' };
            });
            this.attendanceDraft = draft;
            this.attendanceErrors = {};
        },

        initFoulDefaults() {
            if (this.players.length) {
                this.newFoul.player_id = this.players[0].id;
                this.newFoul.foul_type = this.foulTypes[0]?.value || '';
            }
        },

        onAttendanceStatusChange(playerId) {
            if (!this.attendanceErrors[playerId]) return;
            this.attendanceErrors = { ...this.attendanceErrors, [playerId]: {} };
        },

        onStatsRoleChange() {
            this.statsErrors = {};
            const visible = getStatFieldGroups(this.sport, this.statsForm, this.selectedPlayer);
            visible.forEach(g => g.fields.forEach(f => {
                if (this.statsForm[f.key] === undefined) {
                    this.statsForm[f.key] = f.type === 'select' ? f.options[0] : (f.min ?? 0);
                }
            }));
        },

        playerName(playerId) {
            const p = this.players.find(x => x.id === playerId);
            return p ? `#${p.jersey_number} ${p.name}` : `Jugador ${playerId}`;
        },

        formatDate(date) {
            if (!date) return '';
            return new Date(date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        },

        showToast(msg) {
            this.toast = msg;
            setTimeout(() => { this.toast = null; }, 3000);
        },

        async saveScore() {
            this.scoreErrors = validateScoreForm(this.sport, this.scoreForm);
            if (hasErrors(this.scoreErrors)) return;
            this.saving = true;
            this.error = null;
            try {
                if (this.isMock) mockUpdateScore(this.event.id, this.scoreForm.home_score, this.scoreForm.away_score);
                else await api.patch(`/events/${this.event.id}/score`, this.scoreForm);
                this.showToast('Marcador actualizado');
                this.$emit('updated');
            } catch (e) {
                this.error = e.message;
            } finally {
                this.saving = false;
            }
        },

        async registerPlayer() {
            this.playerErrors = validatePlayerForm(this.newPlayer, this.players, this.teamOptions, this.positions);
            if (hasErrors(this.playerErrors)) return;
            this.saving = true;
            this.error = null;
            const statsKey = getStatsPayloadKey(this.sport);
            const defaultStats = getDefaultStats(this.sport, this.sport === 'beisbol' ? { role: 'batter' } : {});
            const payload = {
                name: this.newPlayer.name.trim(),
                jersey_number: this.newPlayer.jersey_number,
                position: this.newPlayer.position,
                is_starter: this.newPlayer.is_starter,
                [statsKey]: defaultStats
            };
            try {
                if (this.isMock) {
                    mockRegisterPlayer(this.event.id, this.newPlayer.team_id, {
                        name: payload.name,
                        jersey_number: payload.jersey_number,
                        position: payload.position,
                        is_starter: payload.is_starter,
                        initialStats: defaultStats
                    });
                } else {
                    await api.post(`/teams/${this.newPlayer.team_id}/players?sport=${this.sport}`, payload);
                }
                this.showToast('Jugador registrado');
                this.newPlayer.name = '';
                this.newPlayer.jersey_number = 1;
                this.resetNewPlayerDefaults();
                await this.loadAll();
            } catch (e) {
                this.error = e.message;
            } finally {
                this.saving = false;
            }
        },

        async updatePlayerStatus(playerId, status) {
            if (!PLAYER_STATUSES.some(s => s.value === status)) return;
            try {
                if (this.isMock) mockUpdatePlayerStatus(this.event.id, playerId, status);
                else await api.patch(`/players/${playerId}/status`, { status });
                const p = this.players.find(x => x.id === playerId);
                if (p) p.status = status;
                this.showToast(`Estado: ${getPlayerStatusLabel(status)}`);
            } catch (e) {
                this.error = e.message;
            }
        },

        async saveAttendance(playerId) {
            const draft = this.attendanceDraft[playerId];
            const errs = validateAttendanceForm(draft.status, draft.note);
            if (hasErrors(errs)) {
                this.attendanceErrors = { ...this.attendanceErrors, [playerId]: errs };
                return;
            }
            try {
                if (this.isMock) mockSaveAttendance(this.event.id, playerId, draft.status, draft.note);
                else {
                    await api.post(`/players/${playerId}/attendance`, {
                        event_id: this.event.id,
                        status: draft.status,
                        note: draft.note
                    });
                }
                this.showToast(`Asistencia: ${getAttendanceLabel(draft.status)}`);
                const existing = this.attendance.find(a => a.player_id === playerId);
                if (existing) {
                    existing.status = draft.status;
                    existing.note = draft.note;
                }
            } catch (e) {
                this.error = e.message;
            }
        },

        async openPlayerStats(player) {
            this.selectedPlayer = player;
            let base = { ...getDefaultStats(this.sport) };
            if (this.isMock) {
                const existing = getMockPlayerStats(this.event.id, player.id);
                if (existing) base = { ...existing };
            } else {
                try {
                    const existing = await api.get(`/players/${player.id}/stats?sport=${this.sport}&event_id=${this.event.id}`);
                    if (existing) base = { ...existing };
                } catch {
                    // Stats not found, use defaults
                }
            }
            if (this.sport === 'beisbol' && !base.role) base.role = 'batter';
            this.statsForm = base;
            this.statsErrors = {};
        },

        closeStats() {
            this.selectedPlayer = null;
            this.statsErrors = {};
        },

        async savePlayerStats() {
            if (!this.selectedPlayer) return;
            this.statsErrors = validateStatsForm(this.sport, this.statsForm, this.selectedPlayer);
            if (hasErrors(this.statsErrors)) return;
            this.saving = true;
            try {
                const body = buildStatsBody(this.sport, this.statsForm);
                if (this.isMock) mockSavePlayerStats(this.event.id, this.selectedPlayer.id, body);
                else {
                    await api.patch(
                        `/players/${this.selectedPlayer.id}/stats?sport=${this.sport}&event_id=${this.event.id}`,
                        body
                    );
                }
                this.showToast('Estadísticas guardadas');
                this.closeStats();
            } catch (e) {
                this.error = e.message;
            } finally {
                this.saving = false;
            }
        },

        async registerFoul() {
            this.foulErrors = validateFoulForm(this.sport, this.newFoul);
            if (hasErrors(this.foulErrors)) return;
            this.saving = true;
            try {
                const foul = {
                    player_id: this.newFoul.player_id,
                    foul_type: this.newFoul.foul_type,
                    description: this.newFoul.description,
                    minute: this.sport === 'beisbol' ? 0 : (this.newFoul.minute ?? 0)
                };
                if (this.isMock) {
                    mockRegisterFoul(this.event.id, foul);
                    this.fouls = getMockEventDetail(this.event.id).fouls;
                } else {
                    await api.post(`/players/${this.newFoul.player_id}/fouls`, { event_id: this.event.id, ...foul });
                    const list = await api.get(`/events/${this.event.id}/fouls`);
                    this.fouls = Array.isArray(list) ? list : [];
                }
                this.showToast('Infracción registrada');
                this.newFoul.description = '';
                this.newFoul.minute = null;
                this.foulErrors = {};
            } catch (e) {
                this.error = e.message;
            } finally {
                this.saving = false;
            }
        }
    }
};
