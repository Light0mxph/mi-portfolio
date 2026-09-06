# DiegoCpsx7z — Aztrix Digital Studio

Portfolio personal en español: [diegocpsx7z.site](https://diegocpsx7z.site/).

Ingeniería backend con Java y Node.js, sistemas para Minecraft e integraciones. El proyecto destacado es [AztrixInnovations](https://github.com/Light0mxph/AztrixInnovations).

## Editar y publicar

El sitio publicado es HTML estático completo. GitHub Pages sirve los archivos del repositorio directamente; no necesita instalar dependencias ni ejecutar una compilación en el servidor.

1. Edita las secciones en `sections/`, la estructura en `components/page.html` y la navegación o el pie en `components/`.
2. Edita los estilos en `css/variables.css`, `css/styles.css`, `css/responsive.css` y `css/animations.css`.
3. Edita las interacciones en `js/script.js`, `js/navbar.js`, `js/effects.js` y `js/animations.js`.
4. Actualiza las cifras del perfil en `data/site.json`.
5. Genera los archivos de publicación con Node.js:

```sh
node scripts/build.mjs
```

Incluye los archivos fuente y los generados (`index.html`, `css/portfolio.css`, `js/portfolio.js` y las referencias actualizadas de `terminos/index.html`) en el mismo commit. No edites los tres archivos generados directamente: la siguiente generación reemplaza sus contenidos.

Los términos se editan en `terminos/index.html`; el generador solo actualiza sus referencias a recursos. La página de error es `404.html`.

## Diseño e interacción

- Negro, grafito y acentos cian, con Geist variable alojada localmente.
- Modelo de arquitectura en SVG con controles para API, tareas y datos. El recorrido es una ilustración; no representa telemetría ni ejecuta solicitudes a un backend.
- Proyecto destacado con estructura modular, servicios desplegables y proceso de trabajo.
- Retrato con marco, iluminación y profundidad discreta con ratón.
- Menú móvil nativo, navegación por teclado y enlaces internos que conservan la URL limpia con JavaScript. Sin JavaScript, funcionan como anclas HTML.
- Contacto mediante Discord y GitHub, más términos y condiciones.
- Control para pausar animaciones, preferencias del sistema y ahorro de datos. La elección manual se guarda localmente; no se incorpora analítica.

## Carga y mantenimiento

El contenido no depende de `fetch`: se genera antes de publicar. El navegador recibe una hoja de estilos y un archivo de JavaScript diferido. Los recursos tienen una versión derivada de su contenido.

La animación ambiental se pausa fuera de pantalla y al ocultar la pestaña. Las apariciones son finitas; el seguimiento del ratón solo funciona sobre dos superficies, con un máximo de una actualización por fotograma. No hay un canvas ni un bucle de renderizado continuo en JavaScript.

Las imágenes originales se conservan. El avatar usa un derivado de 96 px; el emblema de la interfaz, uno de 192 px; la imagen social, uno de 1200 px. Las imágenes bajo el primer bloque se cargan de forma diferida y reservan su espacio. Para regenerar un derivado se puede usar la utilidad opcional de Java:

```sh
java -Djava.awt.headless=true scripts/OptimizeImages.java origen.png destino.jpg 192
```

Geist se distribuye con su licencia SIL Open Font License en `assets/fonts/OFL.txt`. No se necesitan Google Fonts ni bibliotecas de animación durante la visita.
