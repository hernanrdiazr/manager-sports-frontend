// AdminDashboard.js
export default {
    template: `
        <div class="animate-fade-in">
            <h2 class="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
            
            <!-- Stats Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div v-for="card in statsCards" :key="card.label"
                     class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-12 h-12 rounded-xl flex items-center justify-center"
                             :class="card.bgColor">
                            <svg class="w-6 h-6" :class="card.iconColor" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                                <path stroke-linecap="round" stroke-linejoin="round" :d="card.icon"/>
                            </svg>
                        </div>
                    </div>
                    <p class="text-2xl font-bold text-gray-900">{{ card.value }}</p>
                    <p class="text-sm text-slate-500 mt-1">{{ card.label }}</p>
                </div>
            </div>
        </div>
    `,
    
    props: {
        stats: {
            type: Object,
            default: () => ({
                totalUsers: 0,
                totalEvents: 0,
                totalTickets: 0,
                monthlyRevenue: 0
            })
        }
    },
    
    computed: {
        statsCards() {
            return [
                {
                    label: 'Total Usuarios',
                    value: this.stats.totalUsers || 0,
                    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a9 9 0 01-6 0',
                    bgColor: 'bg-blue-50',
                    iconColor: 'text-[#2563EB]'
                },
                {
                    label: 'Eventos Activos',
                    value: this.stats.totalEvents || 0,
                    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                    bgColor: 'bg-cyan-50',
                    iconColor: 'text-[#06B6D4]'
                },
                {
                    label: 'Tickets Vendidos',
                    value: this.stats.totalTickets || 0,
                    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
                    bgColor: 'bg-purple-50',
                    iconColor: 'text-purple-500'
                },
                {
                    label: 'Ingresos Mensuales',
                    value: this.stats.monthlyRevenue ? `\$${this.stats.monthlyRevenue}` : '\$0',
                    icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
                    bgColor: 'bg-green-50',
                    iconColor: 'text-green-500'
                }
            ];
        }
    }
};