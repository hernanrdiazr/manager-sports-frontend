import { api } from '../../services/api.js';

export default {
  template: `
    <div class="min-h-screen bg-slate-50 py-12 px-6">
      <div class="max-w-7xl mx-auto">
        <div class="mb-10">
          <h1 class="text-4xl font-black text-gray-900 mb-2 tracking-tight uppercase italic">Rankings y Estadísticas</h1>
          <p class="text-gray-500 mb-8 font-medium">Resultados de eventos finalizados con sus marcadores finales.</p>

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

        <div v-else-if="filteredRankings.length === 0" class="text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
          <i class="fa-regular fa-face-frown text-5xl mb-6 block text-slate-300"></i>
          <h3 class="text-2xl font-black text-slate-900 mb-2 uppercase italic">Sin resultados</h3>
          <p class="text-slate-400 font-medium">Aún no hay eventos finalizados para mostrar.</p>
        </div>

        <div v-else class="space-y-4">
          <div v-for="r in filteredRankings" :key="r.event.id"
            class="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
          >
            <div class="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
              <!-- Event info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1 flex-wrap">
                  <span class="px-2 py-0.5 text-[10px] font-black rounded-full bg-blue-50 text-blue-700 uppercase tracking-widest border border-blue-100">
                    {{ sportLabel(r.event.sport) }}
                  </span>
                  <span class="text-[10px] text-slate-400 font-black uppercase tracking-wider">{{ formatDate(r.event.event_date) }}</span>
                </div>
                <h3 class="text-lg font-bold text-gray-900 truncate">{{ r.event.name }}</h3>
                <p class="text-xs text-slate-500 truncate">{{ r.event.location }}</p>
              </div>

              <!-- Score -->
              <div class="flex items-center gap-4 lg:gap-6 shrink-0">
                <div class="text-right min-w-[80px]">
                  <p class="text-[10px] text-slate-400 font-bold uppercase truncate">{{ r.homeTeam }}</p>
                  <p class="text-3xl font-black text-gray-900 tabular-nums">{{ r.result.home_score }}</p>
                </div>
                <div class="text-center">
                  <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <span class="text-xs font-black text-slate-400">VS</span>
                  </div>
                </div>
                <div class="text-left min-w-[80px]">
                  <p class="text-[10px] text-slate-400 font-bold uppercase truncate">{{ r.awayTeam }}</p>
                  <p class="text-3xl font-black text-gray-900 tabular-nums">{{ r.result.away_score }}</p>
                </div>
              </div>

              <!-- Sport icon -->
              <div class="hidden lg:flex items-center justify-center w-12 h-12 rounded-xl bg-slate-50 shrink-0">
                <i :class="sportIcon(r.event.sport)" class="text-2xl"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      rankings: [],
      loading: true,
      searchQuery: '',
      sportFilter: 'todos'
    };
  },
  computed: {
    filteredRankings() {
      return this.rankings.filter(r => {
        const q = this.searchQuery.toLowerCase().trim();
        const nameMatch = (r.event.name || '').toLowerCase().includes(q);
        const locMatch = (r.event.location || '').toLowerCase().includes(q);
        if (q && !nameMatch && !locMatch) return false;
        const es = (r.event.sport || '').toLowerCase();
        if (this.sportFilter !== 'todos' && es !== this.sportFilter) return false;
        return true;
      });
    }
  },
  async mounted() {
    await this.loadRankings();
  },
  methods: {
    async loadRankings() {
      this.loading = true;
      try {
        const events = await api.get('/events');
        const all = Array.isArray(events) ? events : [];
        const finalized = all.filter(e => (e.status || '').toLowerCase() === 'finalizado');

        const enriched = await Promise.all(finalized.map(async (event) => {
          try {
            const [result, teams] = await Promise.all([
              api.get(`/events/${event.id}/result`),
              api.get(`/events/${event.id}/teams`)
            ]);
            const home = Array.isArray(teams) ? teams.find(t => t.is_home) : null;
            const away = Array.isArray(teams) ? teams.find(t => !t.is_home) : null;
            return {
              event,
              result: result || { home_score: 0, away_score: 0 },
              homeTeam: home?.name || 'Local',
              awayTeam: away?.name || 'Visitante'
            };
          } catch {
            return {
              event,
              result: { home_score: 0, away_score: 0 },
              homeTeam: 'Local',
              awayTeam: 'Visitante'
            };
          }
        }));

        this.rankings = enriched;
      } catch (e) {
        console.error('Error cargando rankings:', e);
      } finally {
        this.loading = false;
      }
    },
    sportLabel(sport) {
      const map = { futbol: 'Fútbol', basquetbol: 'Básquetbol', beisbol: 'Béisbol' };
      return map[sport] || sport;
    },
    sportIcon(sport) {
      const map = { futbol: 'fa-solid fa-futbol', basquetbol: 'fa-solid fa-basketball', beisbol: 'fa-solid fa-baseball' };
      return map[sport] || 'fa-solid fa-trophy';
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
