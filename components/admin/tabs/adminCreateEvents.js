// AdminEvents.js
export default {
    template: `
        <div class="animate-fade-in">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-gray-900">Eventos</h2>
                <button 
                    @click="showCreateModal = true"
                    class="bg-[#2563EB] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#1d4ed8] transition-colors shadow-lg shadow-blue-500/30"
                >
                    + Nuevo Evento
                </button>
            </div>
            
            <!-- Tabla de eventos -->
            <div v-if="events.length > 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-gray-100">
                            <th class="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Evento</th>
                            <th class="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Deporte</th>
                            <th class="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Fecha</th>
                            <th class="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Tickets</th>
                            <th class="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Estado</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                        <tr v-for="event in events" :key="event.id" class="hover:bg-gray-50/50">
                            <td class="px-6 py-4">
                                <p class="text-sm font-medium text-gray-900">{{ event.organizer }}</p>
                                <p class="text-xs text-slate-500">{{ event.location }}</p>
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600">
                                    {{ event.sport }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm text-slate-500">{{ event.event_date }}</td>
                            <td class="px-6 py-4 text-sm text-slate-500">
                                {{ event.available_tickets }}/{{ event.total_tickets }}
                            </td>
                            <td class="px-6 py-4">
                                <span class="px-2.5 py-1 text-xs font-medium rounded-full"
                                      :class="event.status === 'activo' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'">
                                    {{ event.status }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- Estado vacío -->
            <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">No hay eventos</h3>
                <p class="text-slate-500 mb-4">Crea tu primer evento para empezar</p>
                <button 
                    @click="showCreateModal = true"
                    class="bg-[#2563EB] text-white px-6 py-2.5 rounded-full font-medium hover:bg-[#1d4ed8] transition-colors"
                >
                    Crear Evento
                </button>
            </div>
        </div>
    `,
    
    data() {
        return {
            events: [],
            showCreateModal: false
        };
    },
    
    async created() {
        // Cargar eventos
        await this.loadEvents();
    },
    
    methods: {
        async loadEvents() {
            try {
                // const response = await api.get('/events');
                // this.events = response;
                
                // Datos de ejemplo
                this.events = [];
            } catch (error) {
                console.error('Error cargando eventos:', error);
            }
        }
    }
};