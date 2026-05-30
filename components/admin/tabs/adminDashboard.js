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
            <div class="mt-8">
                <canvas id="myChart"></canvas>
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
                    label: 'Tickets vendidos',
                    value: (this.stats.indicatorsGestion?.total_asistentes || 0).toLocaleString('es-ES'),
                    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a9 9 0 01-6 0',
                    bgColor: 'bg-blue-50',
                    iconColor: 'text-[#2563EB]'
                },
                {
                    label: 'Porcentaje de ocupación',
                    value: (this.stats.indicatorsGestion?.porcentaje_ocupacion || 0) + '%',
                    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
                    bgColor: 'bg-cyan-50',
                    iconColor: 'text-[#06B6D4]'
                },
                {
                    label: 'Ingresos totales ',
                    value: '$' + (this.stats.indicatorsGestion?.ingresos_totales || 0).toLocaleString('es-ES'),
                    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
                    bgColor: 'bg-purple-50',
                    iconColor: 'text-purple-500'
                },
                {
                    label: 'Promedio de ingresos por evento',
                    value: '$' + (this.stats.indicatorsGestion?.promedio_ingreso_por_evento || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 }),
                    icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
                    bgColor: 'bg-green-50',
                    iconColor: 'text-green-500'
                }
            ];
        }
    },
    mounted() {
        // Crea el gráfico cuando el componente se monta
        this.createChart();
    },

    methods: {
        createChart() {
            const ctx = document.getElementById('myChart').getContext('2d');

            const data = {
                labels: this.stats.eventsHistory?.map(event => new Date(event.event_date).getUTCDate().toLocaleString('es-ES')) || [],
                datasets: [
                    {
                        label: 'Dataset',
                        data: this.stats.eventsHistory?.map(event => event.ticket_count) || [],
                        borderColor: '#2563EB',
                        backgroundColor: 'rgba(229, 229, 229, 0.2)',
                        pointStyle: 'circle',
                        pointRadius: 10,
                        pointHoverRadius: 15
                    }
                ]
            };

            // Destruye el gráfico anterior si existe (útil al actualizar)
            if (this.chart) {
                this.chart.destroy();
            }

            // Configura el gráfico según los datos de stats
            this.chart = new Chart(ctx, {
                type: 'line',
                data: data,
                options: {
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Fecha del evento'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Tickets vendidos'
                            },
                            min: 0,
                            max: Math.round(Math.max(...data.datasets[0].data) * 1.2), // Ajusta el máximo dinámicamente
                            ticks: {
                                // forces step size to be 50 units
                                stepSize: 1
                            }
                        },
                    },
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false,
                        },
                        title: {
                            display: true,
                            text: 'Ventas de tickets por evento',
                            font: {
                                size: 18
                            }
                        }
                    }
                }
            });
        },
        watch: {
            // Si los stats cambian, actualiza el gráfico
            stats: {
                deep: true,
                handler() {
                    this.createChart();
                }
            }
        },

        beforeUnmount() {
            // Limpia la instancia del gráfico al destruir el componente
            if (this.chart) {
                this.chart.destroy();
            }
        }
    }
} 