import { api } from '../../../services/api.js';

export default {
    template: `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 class="text-2xl font-black text-slate-900 uppercase italic">Validar Pagos de Reservas</h2>
                    <p class="text-slate-500 text-sm">Verifica las referencias de pago de los usuarios y aprueba la emisión de sus tickets.</p>
                </div>
                <button 
                    @click="loadPending" 
                    class="bg-white border border-slate-200 text-slate-700 hover:text-slate-900 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm hover:shadow transition-all"
                >
                    🔄 Recargar
                </button>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center py-12">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 border-l-transparent"></div>
            </div>

            <!-- Empty State -->
            <div v-else-if="reservations.length === 0" class="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
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
                                v-for="res in reservations" 
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
                                    <div class="text-sm font-bold text-slate-800">{{ res.evento_nombre || 'Evento sin nombre' }}</div>
                                    <div class="text-[10px] font-black text-slate-400 uppercase tracking-wider mt-0.5">{{ res.evento }}</div>
                                </td>
                                <td class="p-4 text-center">
                                    <span class="text-sm font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                                        {{ res.cantidad }}
                                    </span>
                                </td>
                                <td class="p-4 text-right">
                                    <span class="text-sm font-black text-emerald-600">
                                        $ {{ res.total }}
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
                                        class="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
                                    >
                                        Aprobar Pago
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
            loading: true
        };
    },
    async mounted() {
        await this.loadPending();
    },
    methods: {
        async loadPending() {
            this.loading = true;
            try {
                const response = await api.get('/admin/reservations/pending');
                this.reservations = Array.isArray(response) ? response : [];
            } catch (error) {
                console.error("Error cargando reservas pendientes:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo cargar la lista de reservas pendientes.',
                    position: 'top',
                    toast: true,
                    showConfirmButton: false,
                    timer: 3000
                });
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
                try {
                    Swal.fire({
                        title: 'Aprobando pago...',
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    const response = await api.patch(`/admin/reservations/${res.id}/approve`);
                    
                    Swal.fire({
                        icon: 'success',
                        title: 'Reserva Aprobada',
                        text: response.mensaje || 'La reserva ha sido aprobada con éxito.',
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
