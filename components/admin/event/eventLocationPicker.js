export default {
    props: {
        modelValue: { type: String, default: '' },
        placeholder: { type: String, default: 'Ej: Estadio Olímpico, Caracas' }
    },
    emits: ['update:modelValue'],
    template: `
        <div class="space-y-3" style="position: relative;">
            <div class="relative">
                <input
                    ref="searchInput"
                    v-model="searchQuery"
                    @input="onSearchInput"
                    @keydown.enter.prevent="searchAddress"
                    @blur="onBlur"
                    @focus="onFocus"
                    type="text"
                    autocomplete="off"
                    :placeholder="placeholder"
                    class="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 pr-10"
                />
                <svg class="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
            </div>
            <div ref="mapContainer" class="w-full h-52 rounded-xl border border-gray-200 overflow-hidden bg-slate-100"></div>
            <p v-if="modelValue" class="text-xs text-slate-500 flex items-center gap-1">
                <svg class="w-3.5 h-3.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                <span class="truncate">{{ modelValue }}</span>
            </p>
            <Teleport to="body">
                <div v-if="suggestions.length && showSuggestions"
                     :style="suggestionsStyle"
                     class="fixed z-[9999] bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    <button v-for="(s, i) in suggestions" :key="i"
                            type="button"
                            @mousedown.prevent="selectSuggestion(s)"
                            class="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors">
                        <span class="font-medium text-gray-900">{{ s.name }}</span>
                        <span class="block text-xs text-slate-400 mt-0.5 truncate">{{ s.display_name }}</span>
                    </button>
                </div>
            </Teleport>
        </div>
    `,
    data() {
        return {
            searchQuery: this.modelValue || '',
            suggestions: [],
            showSuggestions: false,
            hasFocus: false,
            map: null,
            marker: null,
            leafletLoaded: false,
            inputRect: null
        };
    },
    computed: {
        suggestionsStyle() {
            if (!this.inputRect) return {};
            return {
                top: (this.inputRect.bottom + 4) + 'px',
                left: this.inputRect.left + 'px',
                width: this.inputRect.width + 'px'
            };
        }
    },
    watch: {
        modelValue(val) {
            if (val !== this.searchQuery && !this.hasFocus) {
                this.searchQuery = val || '';
            }
        },
        showSuggestions(val) {
            if (val) {
                this.$nextTick(() => this.updatePosition());
            }
        }
    },
    async mounted() {
        await this.loadLeaflet();
        this.initMap();
        this._onScroll = () => this.updatePosition();
        this._onResize = () => this.updatePosition();
        window.addEventListener('scroll', this._onScroll, true);
        window.addEventListener('resize', this._onResize);
    },
    beforeUnmount() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        window.removeEventListener('scroll', this._onScroll, true);
        window.removeEventListener('resize', this._onResize);
    },
    methods: {
        updatePosition() {
            if (this.$refs.searchInput) {
                this.inputRect = this.$refs.searchInput.getBoundingClientRect();
            }
        },
        async loadLeaflet() {
            if (window.L) { this.leafletLoaded = true; return; }
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
            this.leafletLoaded = true;
        },
        initMap() {
            if (!this.leafletLoaded || !this.$refs.mapContainer) return;
            if (this.map) return;
            this.map = L.map(this.$refs.mapContainer, {
                zoom: 6,
                center: [6.4238, -66.5897],
                zoomControl: false,
                attributionControl: false
            });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19
            }).addTo(this.map);
            this.marker = L.marker([6.4238, -66.5897], { draggable: true }).addTo(this.map);
            this.marker.on('dragend', async () => {
                const pos = this.marker.getLatLng();
                const addr = await this.reverseGeocode(pos.lat, pos.lng);
                this.searchQuery = addr;
                this.$emit('update:modelValue', addr);
            });
            setTimeout(() => this.map.invalidateSize(), 300);
        },
        onFocus() {
            this.hasFocus = true;
            if (this.suggestions.length) {
                this.showSuggestions = true;
            }
        },
        onBlur() {
            this.hasFocus = false;
            setTimeout(() => { this.showSuggestions = false; }, 200);
        },
        async onSearchInput() {
            if (this.searchQuery.length < 2) {
                this.suggestions = [];
                this.showSuggestions = false;
                return;
            }
            clearTimeout(this._searchTimer);
            this._searchTimer = setTimeout(() => this.searchAddress(), 350);
        },
        async searchAddress() {
            const q = this.searchQuery.trim();
            if (q.length < 2) return;
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&countrycodes=ve`);
                const data = await res.json();
                this.suggestions = data || [];
                this.showSuggestions = data?.length > 0;
            } catch {
                this.suggestions = [];
                this.showSuggestions = false;
            }
        },
        selectSuggestion(s) {
            this.searchQuery = s.display_name;
            this.showSuggestions = false;
            this.$emit('update:modelValue', s.display_name);
            this.flyTo(s.lat, s.lon);
        },
        flyTo(lat, lng) {
            if (!this.map) return;
            const pos = [parseFloat(lat), parseFloat(lng)];
            this.map.setView(pos, 15);
            this.marker.setLatLng(pos);
        },
        async reverseGeocode(lat, lng) {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                const data = await res.json();
                return data?.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            } catch {
                return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            }
        }
    }
};
