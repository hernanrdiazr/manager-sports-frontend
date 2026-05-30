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
          <button
            v-for="item in navItems"
            :key="item.label"
            @click="item.action"
            class="text-slate-400 hover:text-white transition-colors duration-200 text-sm cursor-pointer"
            style="font-weight: 500; background: none; border: none;"
          >
            {{ item.label }}
          </button>
        </nav>

        <div class="hidden min-[1200px]:flex items-center gap-3">
          <router-link to="/login" class="text-slate-400 hover:text-white text-sm transition-colors" style="font-weight: 500">
            Iniciar sesión
          </router-link>
          <router-link to="/register">
            <button class="bg-[#2563EB] text-white px-5 py-2 rounded-full text-sm hover:bg-[#1d4ed8] transition-all duration-200" style="font-weight: 600">
              Registrarse
            </button>
          </router-link>
        </div>

        <!-- Mobile Menu Button -->
        <button class="min-[1200px]:hidden text-slate-400 hover:text-white transition-colors" @click="toggleMenu">
          <close-hamburger v-if="menuOpen" class="w-6 h-6"></close-hamburger>
          <hamburger v-else class="w-6 h-6"></hamburger>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div v-if="menuOpen" class="min-[1200px]:hidden border-t border-slate-800 px-6 py-6 flex flex-col gap-4">
        <button
          v-for="item in navItems"
          :key="item.label"
          @click="item.action(); menuOpen = false"
          class="text-left text-slate-400 hover:text-white transition-colors text-sm cursor-pointer"
          style="font-weight: 500; background: none; border: none;"
        >
          {{ item.label }}
        </button>
        <div class="pt-2 flex flex-col gap-3">
          <router-link to="/login" class="text-slate-400 text-sm text-center" style="font-weight: 500" @click="menuOpen = false">
            Iniciar sesión
          </router-link>
          <router-link to="/register" class="w-full text-center" @click="menuOpen = false">
            <button class="w-full bg-[#2563EB] text-white py-2 rounded-full text-sm" style="font-weight: 600">
              Registrarse
            </button>
          </router-link>
        </div>
      </div>
    </header>
  `,
  data() {
    return {
      menuOpen: false
    };
  },
  computed: {
    navItems() {
      return [
        { label: '¿Cómo funciona?', action: () => this.scrollToHowItWorks() },
        { label: 'Eventos', action: () => this.$router.push('/events') },
        { label: 'Rankings y Estadísticas', action: () => this.$router.push('/rankings') }
      ];
    }
  },
  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    scrollToHowItWorks() {
      if (this.$route.path !== '/') {
        this.$router.push('/').then(() => {
          this.$nextTick(() => {
            document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
          });
        });
      } else {
        document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }
};
