export default {
  template: `
    <header class="bg-[#0F172A] sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 sm:px-10 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
            <logo class="w-4 h-4 text-white" :stroke-width="2.5"></logo>
          </div>
          <span class="text-white text-xl" style="font-weight: 700; letter-spacing: -0.02em">
            Oly<span class="text-[#06B6D4]">mpia</span>
          </span>
        </div>

        <!-- Desktop Nav -->
        <nav class="hidden min-[1200px]:flex items-center gap-8">
          <!-- Ahora navItems existe en data(), por lo que esto funcionará -->
          <a v-for="item in navItems" :key="item" href="#" 
             class="text-slate-400 hover:text-white transition-colors duration-200 text-sm" 
             style="font-weight: 500">
            {{ item }}
          </a>
        </nav>

        <div class="hidden min-[1200px]:flex items-center gap-3">
          <a href="#" class="text-slate-400 hover:text-white text-sm transition-colors" style="font-weight: 500">
            Iniciar sesión
          </a>
          <button class="bg-[#2563EB] text-white px-5 py-2 rounded-full text-sm hover:bg-[#1d4ed8] transition-all duration-200" style="font-weight: 600">
            Registrarse
          </button>
        </div>

        <!-- Mobile Menu Button -->
        <button class="min-[1200px]:hidden text-slate-400 hover:text-white transition-colors" @click="toggleMenu">
          <close-hamburger v-if="menuOpen" class="w-6 h-6"></close-hamburger>
          <hamburger v-else class="w-6 h-6"></hamburger>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div v-if="menuOpen" class="min-[1200px]:hidden border-t border-slate-800 px-6 py-6 flex flex-col gap-4">
        <a v-for="item in navItems" :key="item" href="#" class="text-slate-400 hover:text-white transition-colors text-sm" style="font-weight: 500">
          {{ item }}
        </a>
        <div class="pt-2 flex flex-col gap-3">
          <a href="#" class="text-slate-400 text-sm text-center" style="font-weight: 500">Iniciar sesión</a>
          <button class="bg-[#2563EB] text-white py-2 rounded-full text-sm" style="font-weight: 600">Registrarse</button>
        </div>
      </div>
    </header>
  `,
  data() {
    return {
      menuOpen: false,
      navItems: ["¿Quiénes somos?", "¿Cómo funciona?", "Eventos", "Rankings y Estadísticas", "Contáctanos"]
    };
  },
  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    }
  }
};