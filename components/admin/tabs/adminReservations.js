import { api } from '../../../services/api.js';
import { getSportLabel } from '../event/eventSportConfig.js';
import { USE_MOCK_EVENTS, getMockEvents, getMockPendingReservations, mockApproveReservationById } from '../event/mockEventsData.js';

export default {
    template: `
        <div class="space-y-6 animate-fade-in">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-black text-slate-900 uppercase italic">Validar Pagos de Reservas</h2>
                    <p class="text-slate-500 text-sm">Verifica las referencias de pago de los usuarios y aprueba la emisión de sus tickets.</p>
                </div>
                <div class="flex items-center gap-2">
                    <span v-if="useMock" class="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700">Modo demo</span>
                    <button 
                        @click="loadPending" 
                        class="bg-white border border-slate-200 text-slate-700 hover:text-slate-900 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm hover:shadow transition-all"
                    >
                        🔄 Recargar
                    </button>
                </div>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div class="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                    <p class="text-xs font-black text-slate-400 uppercase tracking-wider">Pendientes</p>
                    <p class="text-2xl font-black text-slate-900 mt-1">{{ filteredReservations.length }}</p>
                </div>
                <div class="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                    <p class="text-xs font-black text-slate-400 uppercase tracking-wider">Boletos por aprobar</p>
                    <p class="text-2xl font-black text-blue-600 mt-1">{{ totalTickets }}</p>
                </div>
                <div class="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                    <p class="text-xs font-black text-slate-400 uppercase tracking-wider">Monto total</p>
                    <p class="text-2xl font-black text-emerald-600 mt-1">{{ formatMoney(totalAmount) }}</p>
                </div>
            </div>

            <!-- Filters -->
            <div class="flex flex-wrap gap-3">
                <select v-model="filterEventId" class="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-400 cursor-pointer transition-colors">
                    <option value="">Todos los eventos</option>
                    <option v-for="e in events" :key="e.id" :value="e.id">{{ e.organizer || e.name }}</option>
                </select>
                <select v-model="filterSport" class="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-400 cursor-pointer transition-colors">
                    <option value="">Todos los deportes</option>
                    <option value="futbol">Fútbol</option>
                    <option value="beisbol">Béisbol</option>
                    <option value="basquetbol">Básquetbol</option>
                </select>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center py-12">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 border-l-transparent"></div>
            </div>

            <!-- Empty State -->
            <div v-else-if="filteredReservations.length === 0" class="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
                <span class="text-5xl block mb-4">🎉</span>
                <h3 class="text-lg font-black text-slate-900 uppercase">Sin Pagos Pendientes</h3>
                <p class="text-slate-400 text-sm mt-1 max-w-md mx-auto">Buen trabajo. Todos los comprobantes y reservas han sido procesados y aprobados.</p>
            </div>

            <!-- Table of Pending Reservations -->
            <div v-else class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-slate-50/50 border-b border-slate-100">
                                <th class="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Fecha</th>
                                <th class="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente</th>
                                <th class="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Evento</th>
                                <th class="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Entradas</th>
                                <th class="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Monto Total</th>
                                <th class="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ref. Pago</th>
                                <th class="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                            <tr 
                                v-for="res in filteredReservations" 
                                :key="res.id"
                                class="hover:bg-slate-50/40 transition-colors"
                            >
                                <td class="p-4 whitespace-nowrap">
                                    <span class="text-xs font-mono font-black text-slate-400">#{{ res.id }}</span>
                                    <p class="text-[10px] text-slate-500 font-medium mt-0.5">{{ formatDate(res.fecha_pago) }}</p>
                                </td>
                                <td class="p-4">
                                    <div class="flex items-center gap-2.5">
                                        <div class="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-xs">
                                            {{ res.usuario ? res.usuario.charAt(0).toUpperCase() : 'U' }}
                                        </div>
                                        <div class="text-sm font-bold text-slate-800">{{ res.usuario || 'Usuario desconocido' }}</div>
                                    </div>
                                </td>
                                <td class="p-4">
                                    <div class="text-sm font-bold text-slate-800">{{ res.event_organizer || res.evento_nombre || 'Evento sin nombre' }}</div>
                                    <div class="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">{{ sportLabel(res.event_sport || res.evento) }}</div>
                                </td>
                                <td class="p-4 text-center">
                                    <span class="text-sm font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                                        {{ res.cantidad }}
                                    </span>
                                </td>
                                <td class="p-4 text-right">
                                    <span class="text-sm font-black text-emerald-600">
                                        {{ formatMoney(res.total) }}
                                    </span>
                                </td>
                                <td class="p-4 whitespace-nowrap">
                                    <span class="text-xs font-mono font-black text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                                        {{ res.referencia_pago }}
                                    </span>
                                </td>
                                <td class="p-4 whitespace-nowrap text-center">
                                    <button 
                                        @click="approvePayment(res)"
                                        :disabled="approvingId === res.id"
                                        class="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                                    >
                                        {{ approvingId === res.id ? 'Aprobando...' : 'Aprobar Pago' }}
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            reservations: [],
            events: [],
            filterEventId: '',
            filterSport: '',
            loading: true,
            approvingId: null
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
    async mounted() {
        await this.loadPending();
    },
    methods: {
        sportLabel(sport) {
            return getSportLabel(sport);
        },
        formatMoney(amount) {
            return '$' + Number(amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        },
        async loadPending() {
            this.loading = true;
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
            } catch (error) {
                console.error("Error cargando reservas pendientes:", error);
                if (USE_MOCK_EVENTS) {
                    this.events = getMockEvents();
                    this.reservations = getMockPendingReservations();
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo cargar la lista de reservas pendientes.',
                        position: 'top',
                        toast: true,
                        showConfirmButton: false,
                        timer: 3000
                    });
                }
            } finally {
                this.loading = false;
            }
        },
        async approvePayment(res) {
            const confirmResult = await Swal.fire({
                title: '¿Confirmar Aprobación?',
                text: `Vas a aprobar el pago de $${res.total} correspondiente a la referencia "${res.referencia_pago}".`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, Aprobar',
                cancelButtonText: 'Cancelar',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:from-emerald-600 hover:to-teal-600 transition-colors cursor-pointer mr-3',
                    cancelButton: 'bg-slate-200 text-slate-600 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-300 transition-colors cursor-pointer'
                }
            });

            if (confirmResult.isConfirmed) {
                this.approvingId = res.id;
                try {
                    Swal.fire({
                        title: 'Aprobando pago...',
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    if (USE_MOCK_EVENTS) {
                        mockApproveReservationById(res.id);
                    } else {
                        await api.patch(`/admin/reservations/${res.id}/approve`, {});
                    }
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Reserva Aprobada',
                        text: 'La reserva ha sido aprobada con éxito.',
                        position: 'top',
                        toast: true,
                        showConfirmButton: false,
                        timer: 3000
                    });

                    await this.loadPending();
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al aprobar',
                        text: error.message || 'No se pudo completar la aprobación del pago.',
                        position: 'top',
                        toast: true,
                        showConfirmButton: false,
                        timer: 4000
                    });
                } finally {
                    this.approvingId = null;
                }
            }
        },
        formatDate(dateStr) {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            return d.toLocaleDateString('es-ES', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
};
