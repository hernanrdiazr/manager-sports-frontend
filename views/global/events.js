import { api } from '../../services/api.js';

export default {
  template: `
    <div class="min-h-screen bg-slate-50 py-12 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="mb-10">
          <h1 class="text-4xl font-black text-gray-900 mb-2 tracking-tight uppercase italic">Eventos Deportivos</h1>
          <p class="text-gray-500 mb-8 font-medium">Explora los próximos eventos y los que están en vivo.</p>

          <!-- Filters -->
          <div class="bg-white p-2 rounded-full shadow-md border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
            <div class="flex-grow flex items-center px-6 py-3 w-full">
              <span class="mr-2 text-slate-400"><i class="fa-solid fa-magnifying-glass"></i></span>
              <input v-model="searchQuery" type="text" placeholder="Buscar por nombre o ubicación..." class="w-full bg-transparent outline-none text-gray-700 font-bold placeholder-gray-300">
            </div>
            <div class="hidden md:block w-px h-8 bg-gray-200"></div>
            <div class="px-6 py-3 flex items-center gap-3 w-full md:w-auto bg-slate-50 md:bg-transparent rounded-full">
              <span class="text-gray-400 text-[10px] font-black uppercase tracking-widest">Deporte:</span>
              <select v-model="sportFilter" class="bg-transparent font-black text-blue-600 outline-none cursor-pointer uppercase text-sm">
                <option value="todos">Todos</option>
                <option value="futbol">Fútbol</option>
                <option value="basquetbol">Básquetbol</option>
                <option value="beisbol">Béisbol</option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="loading" class="flex justify-center py-20">
          <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 border-l-transparent"></div>
        </div>

        <div v-else-if="filteredEvents.length === 0" class="text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
          <i class="fa-regular fa-face-frown text-5xl mb-6 block text-slate-300"></i>
          <h3 class="text-2xl font-black text-slate-900 mb-2 uppercase italic">No se encontraron eventos</h3>
          <p class="text-slate-400 font-medium">No hay eventos disponibles en este momento.</p>
          <button @click="resetFilters" class="mt-8 bg-slate-900 text-white px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors cursor-pointer">
            Restablecer Filtros
          </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div v-for="event in filteredEvents" :key="event.id" class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div class="p-6 flex-grow flex flex-col">
              <div class="flex justify-between items-start mb-4">
                <span class="px-3 py-1 text-[10px] font-black rounded-full bg-blue-50 text-blue-700 uppercase tracking-widest border border-blue-100">
                  {{ sportLabel(event.sport) }}
                </span>
                <span class="text-xs font-black text-slate-400 uppercase tracking-widest">{{ formatDate(event.event_date) }}</span>
              </div>
              <h3 class="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-tight">{{ event.name }}</h3>
              <p class="text-xs font-bold text-gray-500 mb-6 flex items-center gap-2 uppercase tracking-wide">
                <span class="text-blue-500 text-lg">📍</span>
                <span class="line-clamp-1">{{ event.location }}</span>
              </p>
              <div class="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Precio</p>
                  <p class="text-xl font-black text-emerald-500">\${{ event.ticket_price || 0 }}</p>
                </div>
                <div>
                  <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-right">Disponibles</p>
                  <p class="text-xl font-black text-gray-800 text-right">{{ event.available_tickets }}</p>
                </div>
              </div>
              <div class="flex gap-2 mt-6">
                <router-link :to="'/login?redirect=events&eventId=' + event.id"
                  class="flex-1 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 py-3.5 px-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all text-center"
                >
                  <i class="fa-solid fa-list-check mr-1"></i> Detalles
                </router-link>
                <router-link :to="'/register?redirect=events'"
                  class="flex-[2] bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-3.5 px-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md text-center"
                >
                  <i class="fa-solid fa-ticket mr-1"></i> Reservar
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      events: [],
      loading: true,
      searchQuery: '',
      sportFilter: 'todos'
    };
  },
  computed: {
    filteredEvents() {
      return this.events.filter(event => {
        const s = (event.status || '').toLowerCase();
        if (s === 'finalizado' || s === 'cancelado') return false;
        const q = this.searchQuery.toLowerCase().trim();
        const nameMatch = (event.name || '').toLowerCase().includes(q);
        const locMatch = (event.location || '').toLowerCase().includes(q);
        if (q && !nameMatch && !locMatch) return false;
        const es = (event.sport || '').toLowerCase();
        if (this.sportFilter !== 'todos' && es !== this.sportFilter) return false;
        return true;
      });
    }
  },
  async mounted() {
    await this.loadEvents();
  },
  methods: {
    async loadEvents() {
      this.loading = true;
      try {
        const response = await api.get('/events');
        this.events = Array.isArray(response) ? response : [];
      } catch (e) {
        console.error('Error cargando eventos:', e);
      } finally {
        this.loading = false;
      }
    },
    resetFilters() {
      this.searchQuery = '';
      this.sportFilter = 'todos';
    },
    sportLabel(sport) {
      const map = { futbol: 'Fútbol', basquetbol: 'Básquetbol', beisbol: 'Béisbol' };
      return map[sport] || sport;
    },
    formatDate(dateStr) {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        const n = new Date(String(dateStr).replace(' ', 'T'));
        if (!isNaN(n.getTime())) return n.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' });
        return dateStr;
      }
      return d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }
};
