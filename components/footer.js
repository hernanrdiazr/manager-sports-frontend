export default {
    template: `
    <footer class="relative z-10 bg-[#0F172A] py-12">
      <div class="max-w-7xl mx-auto px-6 sm:px-10">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-[#2563EB] flex items-center justify-center">
              <logo class="w-3.5 h-3.5 text-white" :stroke-width="2.5" />
            </div>
            <span class="text-white text-lg" style="font-weight: 700">
              Oly<span class="text-[#06B6D4]">mpia</span>
            </span>
          </div>

          <div class="flex gap-8">
            <a
              v-for="item in ['Privacidad', 'Términos', 'Soporte']"
              :key="item"
              href="#"
              class="text-slate-400 hover:text-white text-sm transition-colors"
              style="font-weight: 500"
            >
              {{ item }}
            </a>
          </div>

          <p class="text-slate-500 text-xs" style="font-weight: 500">
            © 2026 Olympia. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
    `
};