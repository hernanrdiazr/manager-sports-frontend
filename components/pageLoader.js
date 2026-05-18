// PageLoader.js - Loader minimalista con la paleta de colores
export default {
    template: `
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A] transition-opacity duration-300"
             :class="{ 'opacity-0 pointer-events-none': !visible }">
            <div class="text-center">
                <!-- Loader animado -->
                <div class="relative w-16 h-16 mx-auto mb-6">
                    <!-- Círculo exterior -->
                    <div class="absolute inset-0 rounded-full border-2 border-white/10"></div>
                    
                    <!-- Círculo animado con gradiente -->
                    <svg class="absolute inset-0 w-full h-full animate-spin" viewBox="0 0 64 64">
                        <circle 
                            cx="32" cy="32" r="30" 
                            fill="none" 
                            stroke="url(#gradient)" 
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-dasharray="188.5"
                            stroke-dashoffset="94.25"
                            class="transition-all duration-300"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#2563EB;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#06B6D4;stop-opacity:1" />
                            </linearGradient>
                        </defs>
                    </svg>
                    
                    <!-- Logo o ícono en el centro -->
                    <div class="absolute inset-0 flex items-center justify-center">
                        <svg class="w-6 h-6 text-[#06B6D4] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                    </div>
                </div>
                
                <!-- Texto de carga -->
                <div class="space-y-2">
                    <p class="text-white font-medium text-sm tracking-wide">
                        {{ message }}
                    </p>
                    <!-- Barra de progreso minimalista -->
                    <div class="w-32 h-0.5 bg-white/10 rounded-full overflow-hidden mx-auto">
                        <div class="h-full bg-gradient-to-r from-[#2563EB] to-[#06B6D4] rounded-full animate-loading-bar"></div>
                    </div>
                </div>
            </div>
        </div>
    `,
    
    props: {
        message: {
            type: String,
            default: 'Cargando...'
        },
        visible: {
            type: Boolean,
            default: true
        }
    }
};