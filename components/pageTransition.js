// PageTransition.js - Componente de transición entre páginas
export default {
    template: `
        <transition 
            name="page-fade" 
            mode="out-in"
            @before-leave="beforeLeave"
            @after-enter="afterEnter"
        >
            <slot></slot>
        </transition>
    `,
    
    methods: {
        beforeLeave() {
            // Opcional: acciones antes de cambiar de página
        },
        afterEnter() {
            // Scroll al inicio al cambiar de página
            window.scrollTo(0, 0);
        }
    }
};