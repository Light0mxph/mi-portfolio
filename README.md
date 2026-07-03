# DiegoCpsx7z — Aztrix Digital Studio

Portafolio personal — [diegocpsx7z.site](https://diegocpsx7z.site)

Ingeniero backend (Java · Node.js), creador de **AztrixInnovations**, el core open source Folia-safe para plugins de Minecraft.

## Stack

- HTML, CSS y JS nativo. Sin frameworks, sin build step.
- Arquitectura modular: secciones y componentes cargados por `fetch` (`sections/`, `components/`).
- Sistema de diseño en tokens (`css/variables.css`): dark editorial, glass, aurora + malla de puntos, grano.

## Detalles de la interfaz

- Navegación móvil por dock inferior flotante (sin menú hamburguesa) con scroll-spy e indicador activo.
- Canvas ambiental de "hilos" ondulantes con pulsos (`js/effects.js`), pausado en tab oculto y desactivado con `prefers-reduced-motion`.
- Spotlight que sigue el cursor en cards, botones magnéticos, scroll-progress y scroll-spy en la navegación.
- Reveals con IntersectionObserver, stagger y contadores animados.
- Preloader con red de seguridad (nunca se queda atascado aunque falle un `fetch`).
- Accesible: skip-link, `:focus-visible`, jerarquía semántica y respeto total a `prefers-reduced-motion`.

Desarrollado íntegramente desde Termux (Android) y desplegado con GitHub Pages.
