// AdminManageEvents.js
export default {
    template: `
        <div class="animate-fade-in">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold text-gray-900">Gestionar Eventos</h2>
                <div class="flex items-center gap-3">
                    <!-- Filtro por deporte -->
                    <select 
                        v-model="filterSport"
                        class="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                    >
                        <option value="">Todos los deportes</option>
                        <option value="futbol">Fútbol</option>
                        <option value="beisbol">Béisbol</option>
                        <option value="basquetbol">Básquetbol</option>
                    </select>
                    
                    <!-- Buscador -->
                    <div class="relative">
                        <svg class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <input 
                            v-model="searchQuery"
                            type="text"
                            placeholder="Buscar evento..."
                            class="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] w-48"
                        >
                    </div>
                </div>
            </div>
            
            <!-- Tabla de eventos -->
            <div v-if="filteredEvents.length > 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full">
                        <thead>
                            <tr class="border-b border-gray-100 bg-gray-50/50">
                                <th class="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Evento</th>
                                <th class="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Deporte</th>
                                <th class="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Fecha</th>
                                <th class="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Tickets</th>
                                <th class="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Estado</th>
                                <th class="text-right px-6 py-4 text-xs font-semibold text-slate-400 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            <tr v-for="event in filteredEvents" :key="event.id" class="hover:bg-gray-50/50 transition-colors">
                                <td class="px-6 py-4">
                                    <p class="text-sm font-medium text-gray-900">{{ event.organizer }}</p>
                                    <p class="text-xs text-slate-500">{{ event.location }}</p>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600">
                                        {{ event.sport }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 text-sm text-slate-500">
                                    {{ formatDate(event.event_date) }}
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-sm text-slate-500">
                                        <span class="font-medium text-gray-700">{{ event.available_tickets }}</span>
                                        <span class="text-slate-400">/{{ event.total_tickets }}</span>
                                    </div>
                                    <div class="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                                        <div 
                                            class="bg-[#2563EB] h-1.5 rounded-full transition-all"
                                            :style="{ width: ticketPercentage(event) + '%' }"
                                        ></div>
                                    </div>
                                </td>
                                <td class="px-6 py-4">
                                    <span class="px-2.5 py-1 text-xs font-medium rounded-full"
                                          :class="statusClass(event.status)">
                                        {{ event.status }}
                                    </span>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center justify-end gap-2">
                                        <!-- Editar -->
                                        <button 
                                            @click="editEvent(event)"
                                            class="p-2 text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                            </svg>
                                        </button>
                                        
                                        <!-- Cambiar estado -->
                                        <button 
                                            @click="toggleStatus(event)"
                                            class="p-2 rounded-lg transition-colors"
                                            :class="event.status === 'activo' 
                                                ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50' 
                                                : 'text-green-500 hover:text-green-600 hover:bg-green-50'"
                                            :title="event.status === 'activo' ? 'Pausar' : 'Activar'"
                                        >
                                            <svg v-if="event.status === 'activo'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            </svg>
                                            <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                            </svg>
                                        </button>
                                        
                                        <!-- Eliminar -->
                                        <button 
                                            @click="deleteEvent(event)"
                                            class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <!-- Estado vacío -->
            <div v-else class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">No hay eventos</h3>
                <p class="text-slate-500">Crea tu primer evento para empezar a gestionar</p>
            </div>
        </div>
    `,
    
    data() {
        return {
            events: [],
            searchQuery: '',
            filterSport: ''
        };
    },
    
    computed: {
        filteredEvents() {
            return this.events.filter(event => {
                const matchesSearch = !this.searchQuery || 
                    event.organizer?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    event.location?.toLowerCase().includes(this.searchQuery.toLowerCase());
                    
                const matchesSport = !this.filterSport || event.sport === this.filterSport;
                
                return matchesSearch && matchesSport;
            });
        }
    },
    
    async created() {
        await this.loadEvents();
    },
    
    methods: {
        async loadEvents() {
            try {
                // const response = await api.get('/events');
                // this.events = response;
                
                // Datos de ejemplo
                this.events = [
                    {
                        id: 1,
                        organizer: 'Liga Nacional',
                        sport: 'futbol',
                        location: 'Estadio Nacional',
                        event_date: '2026-06-15',
                        total_tickets: 5000,
                        available_tickets: 3200,
                        status: 'activo'
                    },
                    {
                        id: 2,
                        organizer: 'Federación de Béisbol',
                        sport: 'beisbol',
                        location: 'Estadio Monumental',
                        event_date: '2026-07-20',
                        total_tickets: 8000,
                        available_tickets: 1500,
                        status: 'activo'
                    }
                ];
            } catch (error) {
                console.error('Error cargando eventos:', error);
            }
        },
        
        formatDate(date) {
            if (!date) return '';
            return new Date(date).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        },
        
        ticketPercentage(event) {
            if (!event.total_tickets) return 0;
            const sold = event.total_tickets - event.available_tickets;
            return Math.round((sold / event.total_tickets) * 100);
        },
        
        statusClass(status) {
            return status === 'activo' 
                ? 'bg-green-50 text-green-600' 
                : 'bg-red-50 text-red-600';
        },
        
        async editEvent(event) {
            console.log('Editar evento:', event.id);
            // Lógica para editar
        },
        
        async toggleStatus(event) {
            const newStatus = event.status === 'activo' ? 'pausado' : 'activo';
            try {
                // await api.patch(`/events/${event.id}/status`, { status: newStatus });
                event.status = newStatus;
            } catch (error) {
                console.error('Error cambiando estado:', error);
            }
        },
        
        async deleteEvent(event) {
            if (!confirm(`¿Eliminar "${event.organizer}"?`)) return;
            
            try {
                // await api.delete(`/events/${event.id}`);
                this.events = this.events.filter(e => e.id !== event.id);
            } catch (error) {
                console.error('Error eliminando evento:', error);
            }
        }
    }
};