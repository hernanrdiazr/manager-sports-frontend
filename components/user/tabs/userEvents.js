import { api } from '../../../services/api.js';
// No modal import needed

const EventCard = {
    props: ['sportEvent'],
    template: `
        <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <!-- Map Container -->
            <div :id="'map-' + sportEvent.id" class="w-full h-48 bg-slate-100 relative z-0"></div>
            
            <!-- Details -->
            <div class="p-6 flex-grow flex flex-col z-10 bg-white relative">
                <div class="flex justify-between items-start mb-4">
                    <span class="px-3 py-1 text-[10px] font-black rounded-full bg-blue-50 text-blue-700 uppercase tracking-widest border border-blue-100">
                        {{ sportEvent.sport }}
                    </span>
                    <span class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ formatDate(sportEvent.event_date) }}</span>
                </div>
                
                <h3 class="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">{{ sportEvent.name || sportEvent.organizer }}</h3>
                <p class="text-xs font-bold text-gray-500 mb-6 flex items-center gap-2 uppercase tracking-wide">
                    <span class="text-blue-500 text-lg">📍</span> 
                    <span class="line-clamp-1">{{ sportEvent.location }}</span>
                </p>
                
                <div class="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Precio</p>
                        <p class="text-xl font-black text-emerald-500">\${{ sportEvent.ticket_price || 0 }}</p>
                    </div>
                    <div>
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-right">Disponibles</p>
                        <p class="text-xl font-black text-gray-800 text-right">{{ sportEvent.available_tickets }}</p>
                    </div>
                </div>

                <div class="flex gap-2 mt-6">
                    <button 
                        v-if="!isFinalized(sportEvent)"
                        @click="$emit('view-details', sportEvent)"
                        class="flex-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 py-3.5 px-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 transform active:scale-95 cursor-pointer text-center"
                    >
                        📋 Detalles
                    </button>
                    <button 
                        v-if="!isFinalized(sportEvent)"
                        @click="$emit('reserve', sportEvent)"
                        class="flex-[2] bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-3.5 px-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 transform active:scale-95 shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer text-center"
                    >
                        🎟️ Reservar
                    </button>
                    <button 
                        v-else
                        @click="$emit('view-details', sportEvent)"
                        class="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 px-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 transform active:scale-95 shadow-md cursor-pointer text-center"
                    >
                        📊 Ver Estadísticas y Resultados
                    </button>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            map: null
        }
    },
    mounted() {
        this.initMap();
    },
    beforeUnmount() {
        if (this.map) {
            this.map.remove();
        }
    },
    methods: {
        initMap() {
            const lat = this.sportEvent.lat || 0;
            const lon = this.sportEvent.lon || 0;
            const mapId = 'map-' + this.sportEvent.id;
            
            this.$nextTick(() => {
                const container = document.getElementById(mapId);
                if (!container) return;

                this.map = L.map(container, { 
                     zoomControl: false,
                     dragging: false,
                     scrollWheelZoom: false,
                     doubleClickZoom: false
                }).setView([lat, lon], 14);
                
                L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
                    crossOrigin: true
                }).addTo(this.map);
                
                const customIcon = L.divIcon({
                    className: 'custom-pin',
                    html: `<div style="background-color: #2563EB; width: 24px; height: 24px; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border-radius: 50%;"></div>`,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12]
                });

                L.marker([lat, lon], { icon: customIcon }).addTo(this.map);
            });
        },
        formatDate(dateStr) {
            if (!dateStr) return '';
            const d = new Date(dateStr);
            return d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' });
        },
        isFinalized(event) {
            const status = (event.status || '').toLowerCase();
            if (status === 'finalizado' || status === 'finalizada') return true;
            
            if (event.event_date) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const eventDate = new Date(event.event_date);
                if (eventDate < today) return true;
            }
            return false;
        }
    }
};

export default {
    components: { EventCard },
    template: `
        <div class="min-h-screen bg-slate-50 py-12 px-6">
            <div class="max-w-7xl mx-auto">
                <!-- Header & Filters -->
                <div class="mb-10 animate-fade-in">
                    <h1 class="text-4xl font-black text-gray-900 mb-2 tracking-tight uppercase italic">Eventos Deportivos</h1>
                    <p class="text-gray-500 mb-8 font-medium">Revisa la cartelera de próximos eventos y consulta estadísticas de partidos completados.</p>
                    
                    <!-- Capsule viewMode toggle -->
                    <div class="flex gap-2 p-1.5 bg-slate-200/60 rounded-full w-fit mb-8 border border-slate-200">
                        <button 
                            @click="viewMode = 'upcoming'"
                            class="px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                            :class="viewMode === 'upcoming' ? 'bg-[#0f172a] text-white shadow' : 'text-slate-500 hover:text-slate-800'"
                        >
                            🔥 Próximos
                        </button>
                        <button 
                            @click="viewMode = 'finalized'"
                            class="px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                            :class="viewMode === 'finalized' ? 'bg-[#0f172a] text-white shadow' : 'text-slate-500 hover:text-slate-800'"
                        >
                            🏆 Resultados
                        </button>
                    </div>

                    <div class="bg-white p-2 rounded-full shadow-md border border-gray-100 flex flex-col md:flex-row gap-4 items-center transition-all hover:shadow-lg">
                        <!-- Search -->
                        <div class="flex-grow flex items-center px-6 py-3 w-full">
                            <span class="text-xl mr-4 opacity-50">🔍</span>
                            <input v-model="searchQuery" type="text" placeholder="Buscar por nombre o ubicación..." class="w-full bg-transparent outline-none text-gray-700 font-bold placeholder-gray-300">
                        </div>
                        
                        <!-- Divider -->
                        <div class="hidden md:block w-px h-8 bg-gray-200"></div>
                        
                        <!-- Sport Filter -->
                        <div class="px-6 py-3 flex items-center gap-3 w-full md:w-auto bg-slate-50 md:bg-transparent rounded-full">
                            <span class="text-gray-400 text-[10px] font-black uppercase tracking-widest">Deporte:</span>
                            <select v-model="sportFilter" class="bg-transparent font-black text-blue-600 outline-none cursor-pointer uppercase text-sm">
                                <option value="todos">Todos</option>
                                <option value="futbol">Fútbol</option>
                                <option value="basquetbol">Básquetbol</option>
                                <option value="beisbol">Béisbol</option>
                                <option value="otro">Otros</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Loading State -->
                <div v-if="loading" class="flex justify-center py-20">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 border-l-transparent"></div>
                </div>
                
                <!-- Empty State -->
                <div v-else-if="filteredEvents.length === 0" class="text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-slate-100 animate-fade-in">
                    <span class="text-5xl mb-6 block">😔</span>
                    <h3 class="text-2xl font-black text-slate-900 mb-2 uppercase italic">No se encontraron eventos</h3>
                    <p class="text-slate-400 font-medium">Intenta ajustar tu búsqueda o no hay eventos disponibles en esta sección.</p>
                    <button @click="resetFilters" class="mt-8 bg-slate-900 text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors">
                        Restablecer Filtros
                    </button>
                </div>

                <!-- Grid -->
                <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <EventCard 
                        v-for="sportEvent in filteredEvents" 
                        :key="sportEvent.id" 
                        :sportEvent="sportEvent" 
                        class="animate-fade-in"
                        @reserve="handleReserveClick"
                        @view-details="handleViewDetailsClick"
                    />
                </div>
            </div>

            <!-- Visualización aparte en ruta dedicada -->
        </div>
    `,
    data() {
        return {
            events: [],
            loading: true,
            searchQuery: '',
            sportFilter: 'todos',
            userReservations: [],
            viewMode: 'upcoming',
            showDetailsModal: false,
            detailsEventId: 0
        }
    },
    computed: {
        filteredEvents() {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            return this.events.filter(event => {
                // Filtro de estado / fecha según pestaña seleccionada (viewMode)
                const status = (event.status || '').toLowerCase();
                const isFinal = status === 'finalizado' || status === 'finalizada';
                const isPast = event.event_date && new Date(event.event_date) < today;
                
                if (this.viewMode === 'upcoming') {
                    // Ocultar eventos finalizados o pasados
                    if (isFinal || isPast) return false;
                } else {
                    // Mostrar solo finalizados o pasados
                    if (!isFinal && !isPast) return false;
                }

                // Filtro por búsqueda
                const query = this.searchQuery.toLowerCase().trim();
                const nameMatch = (event.name || event.organizer || '').toLowerCase().includes(query);
                const locMatch = (event.location || '').toLowerCase().includes(query);
                const matchesSearch = !query || nameMatch || locMatch;
                
                // Filtro por deporte
                const eventSport = (event.sport || '').toLowerCase();
                const matchesSport = this.sportFilter === 'todos' || 
                                     (this.sportFilter === 'otro' && !['futbol', 'basquetbol', 'beisbol'].includes(eventSport)) ||
                                     eventSport === this.sportFilter;
                                     
                return matchesSearch && matchesSport;
            });
        }
    },
    async mounted() {
        await this.loadEvents();
        await this.loadUserReservations();
    },
    methods: {
        async loadEvents() {
            this.loading = true;
            try {
                // Traer todos los eventos (activos y pasados) para filtrarlos localmente
                const response = await api.get('/events');
                this.events = Array.isArray(response) ? response : [];
            } catch (error) {
                console.error("Error cargando eventos:", error);
            } finally {
                this.loading = false;
            }
        },
        async loadUserReservations() {
            try {
                const response = await api.get('/my-reservations');
                this.userReservations = Array.isArray(response) ? response : [];
            } catch (error) {
                console.error("Error cargando reservas del usuario:", error);
            }
        },
        resetFilters() {
            this.searchQuery = '';
            this.sportFilter = 'todos';
        },
        handleViewDetailsClick(event) {
            this.$emit('view-details', event.id);
        },
        async handleReserveClick(event) {
            // Recargar reservas para tener datos frescos antes de validar
            await this.loadUserReservations();

            const alreadyReserved = this.userReservations
                .filter(r => r.event_id === event.id && r.estado.toLowerCase() !== 'rechazado')
                .reduce((sum, r) => sum + (r.cantidad_tickets || 0), 0);

            if (alreadyReserved >= 8) {
                Swal.fire({
                    icon: 'error',
                    title: 'Límite alcanzado',
                    text: 'Ya has comprado/reservado el límite máximo de 8 entradas permitido para este evento.',
                    position: 'top',
                    toast: true,
                    showConfirmButton: false,
                    timer: 4000
                });
                return;
            }

            const maxAllowed = 8 - alreadyReserved;
            const maxTicketsToBuy = Math.min(maxAllowed, event.available_tickets);

            if (maxTicketsToBuy <= 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Sin entradas',
                    text: 'Lo sentimos, no quedan entradas disponibles para este evento.',
                    position: 'top',
                    toast: true,
                    showConfirmButton: false,
                    timer: 3000
                });
                return;
            }

            const { value: formValues } = await Swal.fire({
                title: 'Reservar Entradas',
                html: `
                    <div class="text-left font-sans px-2">
                        <p class="text-sm font-bold text-slate-600 mb-2">Evento: <span class="text-slate-900 font-extrabold">${event.name}</span></p>
                        <p class="text-sm font-bold text-slate-600 mb-4">Precio unitario: <span class="text-emerald-600 font-extrabold">$${event.ticket_price}</span></p>
                        
                        <div class="mb-4">
                            <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Cantidad de Entradas</label>
                            <input 
                                id="swal-ticket-count" 
                                type="number" 
                                min="1" 
                                max="${maxTicketsToBuy}" 
                                value="1" 
                                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                            />
                            <p class="text-[10px] text-slate-400 mt-1">
                                Máximo permitido en esta compra: ${maxTicketsToBuy} tickets 
                                ${alreadyReserved > 0 ? `(Ya tienes ${alreadyReserved} reservados)` : ''}
                            </p>
                        </div>
                        
                        <div class="mb-2">
                            <label class="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Referencia de Pago</label>
                            <input 
                                id="swal-payment-ref" 
                                type="text" 
                                maxlength="6"
                                placeholder="Ej: 123456" 
                                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:outline-none focus:border-blue-500"
                            />
                            <p class="text-[10px] text-slate-400 mt-1">Ingresa la referencia de pago (solo números, máx. 6 dígitos).</p>
                        </div>
                    </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Confirmar Reserva',
                cancelButtonText: 'Cancelar',
                buttonsStyling: false,
                customClass: {
                    confirmButton: 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:from-blue-700 hover:to-cyan-600 transition-colors cursor-pointer mr-3',
                    cancelButton: 'bg-slate-200 text-slate-600 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-300 transition-colors cursor-pointer'
                },
                preConfirm: () => {
                    const ticketCountStr = document.getElementById('swal-ticket-count').value;
                    const ticketCount = parseInt(ticketCountStr);
                    const paymentRef = document.getElementById('swal-payment-ref').value.trim();
                    
                    if (isNaN(ticketCount) || ticketCount < 1) {
                        Swal.showValidationMessage('La cantidad de entradas debe ser al menos 1');
                        return false;
                    }
                    if (ticketCount > maxTicketsToBuy) {
                        Swal.showValidationMessage(`Límite excedido. Solo puedes reservar hasta ${maxTicketsToBuy} entradas adicionales.`);
                        return false;
                    }
                    if (!paymentRef) {
                        Swal.showValidationMessage('El número de referencia de pago es obligatorio');
                        return false;
                    }
                    if (!/^\d{1,6}$/.test(paymentRef)) {
                        Swal.showValidationMessage('La referencia de pago debe ser un número de hasta 6 dígitos');
                        return false;
                    }
                    
                    return { ticketCount, paymentRef };
                }
            });

            if (formValues) {
                const { ticketCount, paymentRef } = formValues;
                try {
                    Swal.fire({
                        title: 'Procesando reserva...',
                        allowOutsideClick: false,
                        didOpen: () => {
                            Swal.showLoading();
                        }
                    });

                    const response = await api.post('/reserve', {
                        event_id: event.id,
                        ticket_count: ticketCount,
                        payment_reference: paymentRef
                    });

                    Swal.fire({
                        icon: 'success',
                        title: 'Reserva Registrada',
                        text: response.mensaje || '¡Tu reserva ha sido registrada con éxito!',
                        position: 'top',
                        toast: true,
                        showConfirmButton: false,
                        timer: 4000
                    });

                    await this.loadEvents();
                    await this.loadUserReservations();
                } catch (error) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error al reservar',
                        text: error.message || 'Ocurrió un error al procesar tu reserva.',
                        position: 'top',
                        toast: true,
                        showConfirmButton: false,
                        timer: 4000
                    });
                }
            }
        }
    }
}
