const pages = {
  privacidad: {
    title: 'Aviso de Privacidad',
    icon: 'fa-solid fa-shield-halved',
    sections: [
      {
        heading: 'Recopilación de información',
        text: 'En Olympia, la privacidad de tus datos es nuestra prioridad. Recopilamos únicamente la información necesaria para procesar tus reservas y brindarte una experiencia personalizada: nombre, correo electrónico, datos de pago y preferencias deportivas. Toda la información se transmite mediante protocolos de encriptación SSL/TLS y se almacena en servidores seguros con cumplimiento GDPR.'
      },
      {
        heading: 'Uso de la información',
        text: 'Tus datos se utilizan exclusivamente para gestionar reservas, procesar pagos, enviar confirmaciones y notificarte sobre eventos de tu interés. No compartimos información personal con terceros sin tu consentimiento explícito, salvo disposición legal. Podemos utilizar datos agregados anónimos para mejorar nuestros servicios y generar estadísticas de plataforma.'
      },
      {
        heading: 'Tus derechos',
        text: 'Puedes acceder, rectificar, cancelar u oponerte al tratamiento de tus datos en cualquier momento escribiendo a privacidad@olympia.com. Conservamos tu información mientras mantengas una cuenta activa; al solicitarlo, la eliminaremos en un plazo máximo de 30 días hábiles, salvo obligaciones legales que requieran retención.'
      }
    ]
  },
  terminos: {
    title: 'Términos y Condiciones',
    icon: 'fa-solid fa-file-contract',
    sections: [
      {
        heading: 'Aceptación de los términos',
        text: 'Al registrarte y utilizar la plataforma Olympia, aceptas los presentes términos y condiciones. Si no estás de acuerdo, deberás abstenerte de usar el servicio. Olympia se reserva el derecho de modificar estos términos en cualquier momento, notificando los cambios mediante publicación en la plataforma con al menos 15 días de antelación.'
      },
      {
        heading: 'Reservas y pagos',
        text: 'Las reservas están sujetas a disponibilidad. El pago debe realizarse en su totalidad al momento de la reserva. Olympia actúa como intermediario entre el usuario y el organizador del evento; no nos hacemos responsables por cancelaciones o modificaciones del evento por causas de fuerza mayor. En caso de cancelación por parte del organizador, se reembolsará el 100% del valor pagado.'
      },
      {
        heading: 'Limitación de responsabilidad',
        text: 'Olympia no será responsable por daños directos, indirectos, incidentales o consecuentes derivados del uso o la imposibilidad de uso de la plataforma. La responsabilidad máxima de Olympia en cualquier circunstancia se limitará al monto total pagado por el usuario en los últimos 12 meses. Las reclamaciones deben presentarse dentro de los 30 días posteriores al evento.'
      }
    ]
  },
  soporte: {
    title: 'Centro de Soporte',
    icon: 'fa-solid fa-headset',
    sections: [
      {
        heading: 'Ayuda y contacto',
        text: 'Nuestro equipo de soporte está disponible para asistirte con cualquier duda o incidencia. Puedes contactarnos a través del formulario en línea, por correo electrónico a soporte@olympia.com o mediante nuestro chat en vivo de lunes a viernes de 8:00 a 20:00 horas. Respondemos todas las solicitudes en un plazo máximo de 24 horas hábiles.'
      },
      {
        heading: 'Preguntas frecuentes',
        text: 'Antes de contactarnos, te recomendamos revisar nuestra sección de preguntas frecuentes donde encontrarás respuestas a las dudas más comunes: cómo modificar una reserva, políticas de cancelación, métodos de pago aceptados, y cómo descargar tus boletos digitales. La mayoría de las gestiones pueden resolverse sin necesidad de asistencia directa.'
      },
      {
        heading: 'Reportar un problema',
        text: 'Si experimentas algún error técnico o problema con tu cuenta, repórtalo inmediatamente a incidencias@olympia.com incluyendo capturas de pantalla y una descripción detallada. Para incidentes de seguridad (accesos no autorizados, actividades sospechosas), contamos con un equipo de respuesta que actúa en menos de 4 horas.'
      }
    ]
  }
};

export default {
  template: `
    <div class="min-h-screen bg-slate-50 py-12 px-6">
      <div class="max-w-4xl mx-auto">
        <div v-if="page" class="animate-fade-in">
          <div class="flex items-center gap-4 mb-10">
            <div class="w-14 h-14 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center">
              <i :class="page.icon" class="text-2xl text-[#2563EB]"></i>
            </div>
            <div>
              <h1 class="text-3xl font-black text-gray-900 tracking-tight">{{ page.title }}</h1>
              <p class="text-sm text-slate-500 mt-1">Última actualización: mayo 2026</p>
            </div>
          </div>

          <div class="space-y-6">
            <div v-for="(section, i) in page.sections" :key="i"
              class="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div class="flex items-start gap-4">
                <span class="flex-shrink-0 w-8 h-8 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center text-sm font-black">
                  {{ i + 1 }}
                </span>
                <div>
                  <h2 class="text-lg font-bold text-gray-900 mb-3">{{ section.heading }}</h2>
                  <p class="text-slate-600 leading-relaxed text-sm">{{ section.text }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-10 text-center">
            <router-link to="/" class="inline-flex items-center gap-2 text-sm text-[#2563EB] font-bold hover:underline">
              <i class="fa-solid fa-arrow-left"></i> Volver al inicio
            </router-link>
          </div>
        </div>

        <div v-else class="text-center py-20">
          <i class="fa-regular fa-circle-question text-5xl text-slate-300 mb-6 block"></i>
          <h2 class="text-2xl font-black text-gray-900 mb-2">Página no encontrada</h2>
          <p class="text-slate-500 mb-6">La página que buscas no existe.</p>
          <router-link to="/" class="bg-[#2563EB] text-white px-8 py-3 rounded-full text-sm font-black inline-block">
            Ir al inicio
          </router-link>
        </div>
      </div>
    </div>
  `,
  computed: {
    page() {
      return pages[this.$route.params.type];
    }
  }
};
