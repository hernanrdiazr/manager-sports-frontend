import { api } from '../../../services/api.js';
import { getSportLabel } from '../event/eventSportConfig.js';
import { USE_MOCK_EVENTS, getMockEvents, getMockPendingReservations, mockApproveReservationById } from '../event/mockEventsData.js';

export default {
    template: `
        <div class="animate-fade-in">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 class="text-2xl font-bold text-gray-900">Reservas de espectadores</h2>
                    <p class="text-sm text-slate-500 mt-1">Aprobación de boletos y pagos reportados por usuarios. No gestiona equipos ni jugadores.</p>
                </div>
                <span v-if="useMock" class="self-start px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700">Modo demo</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <p class="text-xs font-medium text-slate-400 uppercase">Pendientes</p>
                    <p class="text-2xl font-bold text-gray-900 mt-1">{{ filteredReservations.length }}</p>
                </div>
                <div class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <p class="text-xs font-medium text-slate-400 uppercase">Boletos por aprobar</p>
                    <p class="text-2xl font-bold text-[#2563EB] mt-1">{{ totalTickets }}</p>
                </div>
                <div class="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <p class="text-xs font-medium text-slate-400 uppercase">Monto total</p>
                    <p class="text-2xl font-bold text-green-600 mt-1">{{ formatMoney(totalAmount) }}</p>
                </div>
            </div>

            <div class="flex flex-wrap gap-3 mb-4">
                <select v-model="filterEventId" class="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
                    <option value="">Todos los eventos</option>
                    <option v-for="e in events" :key="e.id" :value="e.id">{{ e.organizer }}</option>
                </select>
                <select v-model="filterSport" class="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]">
                    <option value="">Todos los deportes</option>
                    <option value="futbol">Fútbol</option>
                    <option value="beisbol">Béisbol</option>
                    <option value="basquetbol">Básquetbol</option>
                </select>
            </div>

            <div v-if="loading" class="flex justify-center py-16">
                <svg class="animate-spin w-8 h-8 text-[#2563EB]" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
            </div>

            <div v-else-if="loadError" class="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">{{ loadError }}</div>

            <div v-else-if="filteredReservations.length > 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-gray-100 bg-slate-50/80">
                                <th class="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Evento</th>
                                <th class="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Usuario</th>
                                <th class="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Boletos</th>
                                <th class="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Total</th>
                                <th class="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Referencia</th>
                                <th class="text-right px-6 py-3 text-xs font-semibold text-slate-400 uppercase">Acción</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            <tr v-for="r in filteredReservations" :key="r.id" class="hover:bg-gray-50/50">
                                <td class="px-6 py-4">
                                    <p class="text-sm font-medium text-gray-900">{{ r.event_organizer || r.evento }}</p>
                                    <span class="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{{ sportLabel(r.event_sport || r.evento) }}</span>
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-700">{{ r.usuario }}</td>
                                <td class="px-6 py-4 text-sm text-slate-600">{{ r.cantidad }}</td>
                                <td class="px-6 py-4 text-sm font-semibold text-gray-900">{{ formatMoney(r.total) }}</td>
                                <td class="px-6 py-4 text-xs font-mono text-slate-500">{{ r.referencia_pago }}</td>
                                <td class="px-6 py-4 text-right">
                                    <button
                                        @click="approve(r)"
                                        :disabled="approvingId === r.id"
                                        class="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-xl hover:bg-green-700 disabled:opacity-50"
                                    >{{ approvingId === r.id ? 'Aprobando…' : 'Aprobar' }}</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div v-else class="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                <div class="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Sin reservas pendientes</h3>
                <p class="text-slate-500 text-sm">No hay pagos de espectadores por revisar con los filtros actuales.</p>
            </div>

            <div v-if="toast" class="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-3 rounded-xl shadow-lg text-sm">{{ toast }}</div>
        </div>
    `,

    data() {
        return {
            reservations: [],
            events: [],
            filterEventId: '',
            filterSport: '',
            loading: false,
            loadError: null,
            approvingId: null,
            toast: null
        };
    },

    computed: {
        useMock() {
            return USE_MOCK_EVENTS;
        },
        filteredReservations() {
            return this.reservations.filter(r => {
                const matchEvent = !this.filterEventId || r.event_id === Number(this.filterEventId);
                const sport = r.event_sport || r.evento;
                const matchSport = !this.filterSport || sport === this.filterSport;
                return matchEvent && matchSport;
            });
        },
        totalTickets() {
            return this.filteredReservations.reduce((s, r) => s + (r.cantidad || 0), 0);
        },
        totalAmount() {
            return this.filteredReservations.reduce((s, r) => s + (Number(r.total) || 0), 0);
        }
    },

    async created() {
        await this.load();
    },

    methods: {
        sportLabel(sport) {
            return getSportLabel(sport);
        },

        async load() {
            this.loading = true;
            this.loadError = null;
            try {
                if (USE_MOCK_EVENTS) {
                    this.events = getMockEvents();
                    this.reservations = getMockPendingReservations();
                } else {
                    const eventsData = await api.get('/events');
                    this.events = Array.isArray(eventsData) ? eventsData : [];
                    const pending = await api.get('/admin/reservations/pending');
                    this.reservations = (Array.isArray(pending) ? pending : []).map(r => ({
                        ...r,
                        event_sport: r.evento
                    }));
                }
            } catch (e) {
                this.loadError = e.message;
                if (USE_MOCK_EVENTS) {
                    this.events = getMockEvents();
                    this.reservations = getMockPendingReservations();
                }
            } finally {
                this.loading = false;
            }
        },

        showToast(msg) {
            this.toast = msg;
            setTimeout(() => { this.toast = null; }, 3000);
        },

        formatMoney(amount) {
            return '$' + Number(amount || 0).toLocaleString('es-MX');
        },

        async approve(r) {
            if (!confirm(`¿Aprobar reserva de ${r.usuario} (${r.cantidad} boleto(s)) por $${r.total}?`)) return;
            this.approvingId = r.id;
            try {
                if (USE_MOCK_EVENTS) {
                    mockApproveReservationById(r.id);
                    this.reservations = getMockPendingReservations();
                } else {
                    await api.patch(`/admin/reservations/${r.id}/approve`, {});
                    this.reservations = this.reservations.filter(x => x.id !== r.id);
                }
                this.showToast('Reserva aprobada');
            } catch (e) {
                alert(e.message);
            } finally {
                this.approvingId = null;
            }
        }
    }
};
