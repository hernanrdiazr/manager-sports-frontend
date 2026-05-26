export default {
    props: {
        modelValue: Boolean,
        activeTab: String,
        currentUser: Object
    },
    emits: ['update:modelValue', 'tab-change'],
    template: `
        <aside 
            class="fixed inset-y-0 left-0 z-40 w-64 bg-[#0F172A] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto"
            :class="modelValue ? 'translate-x-0' : '-translate-x-full'"
        >
            <!-- Logo -->
            <div class="flex items-center justify-between h-16 px-6 border-b border-white/10">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-gradient-to-br from-[#2563EB] to-[#06B6D4] rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                        </svg>
                    </div>
                    <span class="text-white font-bold text-lg">Sport Manager</span>
                </div>
                <button @click="$emit('update:modelValue', false)" class="lg:hidden text-slate-400 hover:text-white">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            <!-- Navegación -->
            <nav class="mt-6 px-4 space-y-1">
                <button
                    @click="selectTab('events-list')"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                    :class="activeTab === 'events-list'
                        ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/30'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'"
                >
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    Eventos Disponibles
                </button>

                <button
                    @click="selectTab('my-tickets')"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                    :class="activeTab === 'my-tickets'
                        ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/30'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'"
                >
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
                    </svg>
                    Mis Entradas
                </button>
            </nav>

            <!-- Footer: perfil del usuario -->
            <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                <div class="flex items-center gap-3 px-3 py-2">
                    <div class="w-8 h-8 bg-[#2563EB]/20 rounded-full flex items-center justify-center">
                        <span class="text-[#2563EB] text-sm font-bold">
                            {{ userInitial }}
                        </span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-white truncate">{{ userName }}</p>
                        <p class="text-xs text-slate-400 truncate">{{ userEmail }}</p>
                    </div>
                </div>
            </div>
        </aside>
    `,

    computed: {
        userInitial() {
            return this.currentUser?.name?.charAt(0).toUpperCase() || 'U';
        },
        userName() {
            return this.currentUser?.name || 'Usuario';
        },
        userEmail() {
            return this.currentUser?.email || '';
        }
    },

    methods: {
        selectTab(tabId) {
            this.$emit('tab-change', tabId);
            this.$emit('update:modelValue', false);
        }
    }
};
