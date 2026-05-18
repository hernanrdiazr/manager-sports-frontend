export default {
  template: `
      <!-- Hero Section -->
      <section class="relative overflow-hidden">
        <div class="absolute inset-0" style="background: linear-gradient(135deg, #0F172A 0%, #1e3a5f 40%, #0e4f6e 70%, #0F172A 100%)"></div>
        <div class="absolute inset-0 opacity-10" style="background-image: url('https://images.unsplash.com/photo-1770479086965-430e49d96e23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBzdGFkaXVtJTIwY3Jvd2QlMjBhZXJpYWx8ZW58MXx8fHwxNzc3NzY1MzkwfDA&ixlib=rb-4.1.0&q=80&w=1080'); background-size: cover; background-position: center;"></div>
        
        <div class="relative max-w-5xl mx-auto px-6 sm:px-10 pt-28 pb-36 text-center">
        <!-- Imagen izquierda -->
<img 
  src="assets/img/tu-imagen-izquierda.png"
  class="hidden md:block absolute left-[-90px] top-[70%] -translate-y-1/2 w-80 opacity-50"
  alt="decoración izquierda"
/>

<!-- Imagen derecha -->
<img 
  src="assets/img/tu-imagen-derecha.png"
  class="hidden md:block absolute right-[-90px] top-[70%] -translate-y-1/2 w-80 opacity-50"
  alt="decoración derecha"
/>

          <div class="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-[#06B6D4] px-4 py-1.5 rounded-full text-sm mb-8" style="font-weight: 600">
            <star class="w-3.5 h-3.5"></star>
            La plataforma líder en logística deportiva
          </div>

          <h2 class="text-white mb-6" style="font-size: clamp(2.2rem, 5vw, 3.5rem); font-weight: 800; line-height: 1.15; letter-spacing: -0.03em;">
            Tu Acceso Fácil y Seguro a Todos los Eventos Deportivos de <span style="color: #fffb00;">Ven</span>
<span style="color: #0091ff;">ezu</span>
<span style="color: #ff0000;">ela</span>

          </h2>

          <p class="text-slate-300 mb-14 max-w-2xl mx-auto" style="font-size: 1.125rem; line-height: 1.75">
            Regístrate para comprar tus boletos y asegurar tu lugar en los mejores eventos deportivos del país.
          </p>

          <!-- Glassmorphism Card -->
          <div class="inline-block rounded-3xl p-10 sm:p-14" style="background: rgba(255,255,255,0.07); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 20px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1);">
            <p class="text-slate-300 mb-6 text-sm" style="font-weight: 500">Únete al equipo de <span class="text-white" style="font-weight: 700">fanáticos</span> que ya usan Olympia</p>
            <button @click="test" class="group inline-flex items-center gap-3 text-white px-10 py-4 rounded-full transition-all duration-300 hover:scale-105" style="background: linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%); box-shadow: 0 6px 30px rgba(37,99,235,0.5); font-size: 1rem; font-weight: 700;">
              Registrarse ahora
              <arrow-right class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"></arrow-right>
            </button>
            <div class="flex items-center justify-center gap-6 mt-6">
              <div v-for="benefit in benefits" :key="benefit.label" class="flex items-center gap-1.5 text-slate-400 text-xs" style="font-weight: 500">
                <component :is="benefit.icon" class="w-3.5 h-3.5 text-[#06B6D4]" :stroke-width="2"></component>
                {{ benefit.label }}
              </div>
            </div>
          </div>
        </div>
      </section>

    <!-- How it works section -->
    <section class="bg-white py-32">
      <div class="max-w-6xl mx-auto px-6 sm:px-10">
        <div class="text-center mb-20">
          <span class="text-[#06B6D4] text-sm uppercase tracking-widest" style="font-weight: 700">
            Cómo funciona
          </span>
          <h3
            class="text-[#0F172A] mt-3"
            style="font-size: clamp(1.6rem, 3vw, 2.25rem); font-weight: 800; letter-spacing: -0.025em;"
          >
            Tres pasos para tu próximo evento
          </h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <!-- Connector line -->
          <div
            class="hidden md:block absolute top-10 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-[#2563EB] via-[#06B6D4] to-[#2563EB] opacity-30"
          />

          <div
            v-for="(step, i) in steps"
            :key="step.title"
            class="group relative bg-white rounded-2xl p-8 text-center transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
            style="border: 1px solid #f1f5f9; box-shadow: 0 2px 20px rgba(15,23,42,0.05);"
          >
            <div
              class="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center text-xs"
              style="background: linear-gradient(135deg, #2563EB, #06B6D4); color: white; font-weight: 800;"
            >
              {{ i + 1 }}
            </div>

            <div
              class="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 transition-colors duration-300 group-hover:bg-[#06B6D4]/20"
              style="background: rgba(6,182,212,0.08)"
            >
              <component :is="step.icon" class="w-9 h-9 text-[#06B6D4]" :stroke-width="1.5" />
            </div>

            <h4 class="text-[#0F172A] mb-3" style="font-size: 1.1rem; font-weight: 700;">
              {{ step.title }}
            </h4>
            <p class="text-slate-500 leading-relaxed text-sm">
              {{ step.desc }}
            </p>
          </div>
        </div>
      </div>
    </section>

      <!-- Stats -->
      <section class="bg-[#0F172A] py-16">
        <div class="max-w-5xl mx-auto px-6 sm:px-10">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div v-for="stat in stats" :key="stat.label">
              <p class="text-white mb-1" style="font-size: 1.8rem; font-weight: 800; background: linear-gradient(90deg, #2563EB, #06B6D4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                {{ stat.value }}
              </p>
              <p class="text-slate-400 text-sm" style="font-weight: 500">{{ stat.label }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="bg-white py-32">
      <div class="max-w-3xl mx-auto px-6 sm:px-10 text-center">
        <h3
          class="text-[#0F172A] mb-5"
          style="font-size: clamp(1.6rem, 3vw, 2.25rem); font-weight: 800; letter-spacing: -0.025em;"
        >
          ¿Listo para vivir la experiencia?
        </h3>
        <p class="text-slate-500 mb-10" style="line-height: 1.75">
          Crea tu cuenta gratis y empieza a disfrutar de los mejores eventos deportivos sin complicaciones.
        </p>
        <button
          class="group inline-flex items-center gap-3 text-white px-12 py-5 rounded-full transition-all duration-300 hover:scale-105"
          style="background: linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%); box-shadow: 0 6px 30px rgba(37,99,235,0.4); font-size: 1rem; font-weight: 700;"
        >
          Registrarse ahora
          <arrow-right class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </section>
    </div>
  `,
  data() {
    return {
      menuOpen: false,
      navItems: ["Eventos", "Cómo funciona", "Precios", "Contacto"],
      benefits: [
        { icon: 'shield', label: "Pago seguro" },
        { icon: 'logo-cyan', label: "Acceso instantáneo" },
        { icon: 'star-outlined', label: "Sin comisiones" }
      ],
   steps : [
  {
    icon: 'user',
    title: "Crea tu cuenta",
    desc: "Regístrate en segundos y accede a una plataforma segura diseñada para amantes del deporte.",
  },
  {
    icon: 'calendar',
    title: "Selecciona tu evento",
    desc: "Explora una amplia cartelera de eventos deportivos y elige el que más te apasione.",
  },
  {
    icon: 'ticket',
    title: "Obtén tu entrada",
    desc: "Recibe tu boleto digital al instante en tu correo y asegura tu lugar en las gradas.",
  },
],
    stats: [
    { value: "100%", label: "Trazabilidad de pagos" },
    { value: "Tiempo Real", label: "Control de asistencia" },
    { value: "Multi-deporte", label: "Métricas adaptables" },
    { value: "24/7", label: "Soporte" }
]
    };
  },
  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    test() {
      alert("¡Registro iniciado!");
    }
  }
};