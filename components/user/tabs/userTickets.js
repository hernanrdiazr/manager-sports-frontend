import { api } from '../../../services/api.js';

export default {
    template: `
        <div class="min-h-screen bg-slate-50 py-12 px-6">
            <div class="max-w-6xl mx-auto">
                
                <!-- Header -->
                <div class="mb-10 animate-fade-in flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 class="text-4xl font-black text-gray-900 mb-2 tracking-tight uppercase italic">Mis Entradas</h1>
                        <p class="text-gray-500 font-medium">Revisa tus reservaciones y el estado de tus comprobantes de pago.</p>
                    </div>
                    <button 
                        @click="loadTickets" 
                        class="flex items-center gap-2 bg-white text-slate-700 hover:text-slate-900 border border-slate-200 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm hover:shadow transition-all"
                    >
                        <i class="fa-solid fa-arrows-rotate"></i> Actualizar
                    </button>
                </div>

                <!-- Loading State -->
                <div v-if="loading" class="flex justify-center py-20">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 border-l-transparent"></div>
                </div>

                <!-- Empty State -->
                <div v-else-if="tickets.length === 0" class="text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-slate-100 animate-fade-in">
                    <i class="fa-solid fa-ticket text-6xl mb-6 block text-slate-300 animate-bounce"></i>
                    <h3 class="text-2xl font-black text-slate-900 mb-2 uppercase italic">No tienes entradas</h3>
                    <p class="text-slate-400 font-medium max-w-md mx-auto">Aún no has reservado entradas para ningún evento deportivo. Explora la cartelera y asegura tu lugar.</p>
                </div>

                <!-- Tickets List -->
                <div v-else class="space-y-6">
                    <div 
                        v-for="ticket in tickets" 
                        :key="ticket.id"
                        class="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col lg:flex-row overflow-hidden relative group animate-fade-in"
                    >
                        <!-- Left Side: Event Details -->
                        <div class="p-6 lg:p-8 flex-grow flex flex-col justify-between z-10">
                            <div>
                                <div class="flex flex-wrap items-center gap-2 mb-4">
                                    <span class="px-3 py-1 text-[10px] font-black rounded-full bg-blue-50 text-blue-700 uppercase tracking-widest border border-blue-100">
                                        {{ ticket.evento }}
                                    </span>
                                    <span 
                                        :class="statusClasses[ticket.estado.toLowerCase()] || 'bg-slate-50 text-slate-600 border-slate-200'"
                                        class="px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest border"
                                    >
                                        {{ ticket.estado }}
                                    </span>
                                </div>

                                <h3 class="text-2xl font-black text-slate-900 tracking-tight leading-none mb-3">
                                    {{ ticket.evento_nombre || 'Evento Deportivo' }}
                                </h3>

                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 text-slate-400">
                                            <i class="fa-solid fa-calendar-days text-lg"></i>
                                        </div>
                                        <div>
                                            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fecha Evento</p>
                                            <p class="text-sm font-bold text-slate-700">{{ formatDate(ticket.evento_fecha) }}</p>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-100 text-slate-400">
                                            <i class="fa-solid fa-location-dot text-lg"></i>
                                        </div>
                                        <div>
                                            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ubicación</p>
                                            <p class="text-sm font-bold text-slate-700 truncate max-w-[200px]">{{ ticket.evento_ubicacion || 'Por definir' }}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="mt-8 pt-6 border-t border-dashed border-slate-100 flex flex-wrap justify-between items-center gap-4">
                                <div class="flex gap-6">
                                    <div>
                                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Referencia de Pago</p>
                                        <p class="text-xs font-mono font-black text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">{{ ticket.referencia }}</p>
                                    </div>
                                    <div>
                                        <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Fecha Pago</p>
                                        <p class="text-xs font-bold text-slate-600">{{ formatDate(ticket.fecha_reportada) }}</p>
                                    </div>
                                </div>
                                <div class="text-slate-400 text-xs font-bold">
                                    Reserva #{{ ticket.id }}
                                </div>
                            </div>
                        </div>

                        <!-- Tear-off Divider -->
                        <div class="hidden lg:flex flex-col items-center justify-between w-6 relative py-4 select-none shrink-0">
                            <div class="w-6 h-6 bg-slate-50 rounded-full border border-slate-100 -mt-7 -translate-y-px z-20"></div>
                            <div class="w-0.5 flex-1 border-r border-dashed border-slate-300"></div>
                            <div class="w-6 h-6 bg-slate-50 rounded-full border border-slate-100 -mb-7 translate-y-px z-20"></div>
                        </div>

                        <!-- Right Side: Tear-off Stub -->
                        <div 
                            :class="ticket.estado.toLowerCase() === 'aprobado' ? 'bg-gradient-to-br from-emerald-500/5 to-teal-500/5' : 'bg-gradient-to-br from-amber-500/5 to-orange-500/5'"
                            class="p-6 lg:p-8 lg:w-72 border-t lg:border-t-0 lg:border-l border-slate-100 flex flex-col justify-between items-center text-center shrink-0 z-10"
                        >
                            <div class="w-full">
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Entradas</p>
                                <p class="text-5xl font-black text-slate-900 leading-none mb-1 font-sans">{{ ticket.cantidad_tickets }}</p>
                                <p class="text-xs font-bold text-slate-500">Unidades</p>
                            </div>

                            <div class="w-full my-6">
                                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pagado</p>
                                <p class="text-2xl font-black text-emerald-600 font-sans">$ {{ ticket.total_pagado }}</p>
                            </div>

                            <!-- Ticket Stamp -->
                            <div class="w-full space-y-3">
                                <div 
                                    v-if="ticket.estado.toLowerCase() === 'aprobado' || ticket.estado.toLowerCase() === 'aprobada'"
                                    class="border-4 border-emerald-500/30 text-emerald-600 font-black text-xs uppercase tracking-widest px-4 py-2.5 rounded-2xl transform -rotate-3 inline-block animate-pulse"
                                >
                                    <i class="fa-solid fa-circle-check mr-1"></i> VÁLIDO / COMPRADO
                                </div>
                                <div 
                                    v-else-if="ticket.estado.toLowerCase() === 'cancelada'"
                                    class="border-4 border-red-500/30 text-red-600 font-black text-xs uppercase tracking-widest px-4 py-2.5 rounded-2xl transform rotate-3 inline-block bg-red-50"
                                >
                                    <i class="fa-solid fa-circle-xmark mr-1"></i> EVENTO CANCELADO
                                </div>
                                <div 
                                    v-else
                                    class="border-4 border-amber-500/30 text-amber-600 font-black text-xs uppercase tracking-widest px-4 py-2.5 rounded-2xl transform rotate-3 inline-block"
                                >
                                    <i class="fa-solid fa-clock mr-1"></i> PAGO PENDIENTE
                                </div>

                                <button 
                                    v-if="ticket.estado.toLowerCase() === 'aprobado' || ticket.estado.toLowerCase() === 'aprobada'"
                                    @click="printTicket(ticket)"
                                    class="w-full mt-3 bg-slate-900 hover:bg-slate-800 text-white py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 shadow-sm hover:shadow cursor-pointer"
                                >
                                    <i class="fa-solid fa-print"></i> Imprimir Entrada
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `,
    data() {
        return {
            tickets: [],
            loading: true,
            statusClasses: {
                'pendiente': 'bg-amber-50 text-amber-700 border-amber-100',
                'aprobado': 'bg-emerald-50 text-emerald-700 border-emerald-100',
                'rechazado': 'bg-red-50 text-red-700 border-red-100',
                'aprobada': 'bg-emerald-50 text-emerald-700 border-emerald-100',
                'cancelada': 'bg-red-100 text-red-700 border-red-200'
            }
        };
    },
    async mounted() {
        await this.loadTickets();
    },
    methods: {
        async loadTickets() {
            this.loading = true;
            try {
                const response = await api.get('/my-reservations');
                this.tickets = Array.isArray(response) ? response : [];
            } catch (error) {
                console.error("Error cargando tickets:", error);
            } finally {
                this.loading = false;
            }
        },
        formatDate(dateStr) {
            if (!dateStr) return 'Por definir';
            const d = new Date(dateStr);
            return d.toLocaleDateString('es-ES', { 
                weekday: 'short',
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        },
        printTicket(ticket) {
            const printWindow = window.open('', '_blank');
            if (!printWindow) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Bloqueador de ventanas',
                    text: 'Por favor, permite ventanas emergentes para poder imprimir tu entrada.',
                    position: 'top',
                    toast: true,
                    showConfirmButton: false,
                    timer: 4000
                });
                return;
            }

            const formattedDate = this.formatDate(ticket.evento_fecha);
            
            printWindow.document.write(`
                <html>
                <head>
                    <title>Entrada #${ticket.id} - ${ticket.evento_nombre}</title>
                    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet" crossorigin>
                    <style>
                        body {
                            font-family: 'Inter', sans-serif;
                            background-color: #ffffff;
                            color: #0F172A;
                            margin: 0;
                            padding: 40px;
                            display: flex;
                            justify-content: center;
                        }
                        .ticket {
                            width: 600px;
                            border: 3px solid #0f172a;
                            border-radius: 24px;
                            overflow: hidden;
                            position: relative;
                            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                        }
                        .header {
                            background: linear-gradient(135deg, #2563EB, #06B6D4);
                            color: white;
                            padding: 24px;
                            text-align: center;
                        }
                        .header h1 {
                            margin: 0;
                            font-size: 24px;
                            font-weight: 900;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                        }
                        .header p {
                            margin: 4px 0 0 0;
                            font-size: 12px;
                            font-weight: 700;
                            text-transform: uppercase;
                            opacity: 0.9;
                            letter-spacing: 2px;
                        }
                        .content {
                            padding: 30px;
                        }
                        .event-name {
                            font-size: 22px;
                            font-weight: 900;
                            margin-bottom: 20px;
                            color: #0F172A;
                        }
                        .details {
                            display: grid;
                            grid-template-cols: 1fr 1fr;
                            gap: 20px;
                            margin-bottom: 30px;
                        }
                        .detail-group {
                            display: flex;
                            flex-direction: column;
                        }
                        .detail-label {
                            font-size: 9px;
                            font-weight: 900;
                            color: #94A3B8;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            margin-bottom: 4px;
                        }
                        .detail-value {
                            font-size: 14px;
                            font-weight: 700;
                            color: #334155;
                        }
                        .divider {
                            border-top: 2px dashed #CBD5E1;
                            margin: 20px 0;
                            position: relative;
                        }
                        .stub {
                            padding: 20px 30px;
                            background-color: #F8FAFC;
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            border-top: 1px solid #E2E8F0;
                        }
                        .barcode-placeholder {
                            width: 150px;
                            height: 40px;
                            background: repeating-linear-gradient(90deg, #0F172A, #0F172A 2px, transparent 2px, transparent 6px);
                        }
                        .ticket-id {
                            font-size: 11px;
                            font-weight: 700;
                            color: #94A3B8;
                        }
                        .valid-stamp {
                            border: 3px solid #10B981;
                            color: #10B981;
                            font-weight: 900;
                            font-size: 10px;
                            padding: 6px 12px;
                            border-radius: 8px;
                            text-transform: uppercase;
                            letter-spacing: 1px;
                            transform: rotate(-3deg);
                        }
                        @media print {
                            body {
                                padding: 0;
                                background-color: white;
                            }
                            .ticket {
                                border: 3px solid #000000;
                                box-shadow: none;
                            }
                            .stub {
                                border-top: 1px solid #000000;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="ticket">
                        <div class="header">
                            <h1>Entrada Oficial</h1>
                            <p>Sport Manager / Olympia</p>
                        </div>
                        <div class="content">
                            <div class="event-name">${ticket.evento_nombre || 'Evento Deportivo'}</div>
                            
                            <div class="details">
                                <div class="detail-group">
                                    <span class="detail-label">Deporte</span>
                                    <span class="detail-value" style="text-transform: uppercase;">${ticket.evento}</span>
                                </div>
                                <div class="detail-group">
                                    <span class="detail-label">Fecha del Evento</span>
                                    <span class="detail-value">${formattedDate}</span>
                                </div>
                                <div class="detail-group" style="grid-column: span 2;">
                                    <span class="detail-label">Ubicación</span>
                                    <span class="detail-value">${ticket.evento_ubicacion || 'Por definir'}</span>
                                </div>
                                <div class="detail-group">
                                    <span class="detail-label">Cantidad de Entradas</span>
                                    <span class="detail-value">${ticket.cantidad_tickets} unidad(es)</span>
                                </div>
                                <div class="detail-group">
                                    <span class="detail-label">Monto Total Pagado</span>
                                    <span class="detail-value" style="color: #10B981;">$${ticket.total_pagado}</span>
                                </div>
                                <div class="detail-group">
                                    <span class="detail-label">Referencia de Pago</span>
                                    <span class="detail-value">${ticket.referencia}</span>
                                </div>
                                <div class="detail-group">
                                    <span class="detail-label">Número de Reserva</span>
                                    <span class="detail-value">#${ticket.id}</span>
                                </div>
                            </div>
                            
                            <div class="divider"></div>
                        </div>
                        
                        <div class="stub">
                            <div class="detail-group">
                                <div class="barcode-placeholder"></div>
                                <div class="ticket-id" style="margin-top: 5px;">ID Reserva: ${ticket.id}</div>
                            </div>
                            <div class="valid-stamp">✓ E-TICKET VÁLIDO</div>
                        </div>
                    </div>
                    
                    <script>
                        window.onload = function() {
                            window.print();
                            setTimeout(function() { window.close(); }, 500);
                        };
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    }
};
