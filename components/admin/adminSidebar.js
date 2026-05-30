// AdminSidebar.js
export default {
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
                    v-for="item in menuItems"
                    :key="item.id"
                    @click="selectTab(item.id)"
                    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                    :class="activeTab === item.id 
                        ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-500/30' 
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'"
                >
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon"/>
                    </svg>
                    {{ item.label }}
                </button>
            </nav>

            <!-- Footer -->
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
    
    props: {
        modelValue: Boolean,
        activeTab: String,
        currentUser: Object
    },
    
    emits: ['update:modelValue', 'tab-change'],
    
    computed: {
        userInitial() {
            return this.currentUser?.name?.charAt(0) || 'A';
        },
        userName() {
            return this.currentUser?.name || 'Admin';
        },
        userEmail() {
            return this.currentUser?.email || '';
        },
        menuItems() {
            return [
                { 
                    id: 'dashboard', 
                    label: 'Dashboard', 
                    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' 
                },
                {
                    id: 'teams',
                    label: 'Equipos',
                    icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z'
                },
                {
                    id: 'events-create',
                    label: 'Crear eventos',
                    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                },
                { 
                    id: 'events-manage', 
                    label: 'Gestionar eventos', 
                    icon: 'M4 6h16M4 10h16M4 14h16M4 18h16' 
                },
                { 
                    id: 'reservations', 
                    label: 'Reservas (espectadores)', 
                    icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' 
                },
            ];
        }
    },
    
    methods: {
        selectTab(tabId) {
            this.$emit('tab-change', tabId);
            this.$emit('update:modelValue', false);
        }
    }
};