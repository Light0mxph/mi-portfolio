/**
 * DiegoCpsx7z Portfolio — script.js
 * ─────────────────────────────────────────────────────────
 * Arquitectura: IIFE encapsulada, ES6+ estricto
 * Módulos:
 *   1. ParticleEngine     — Canvas neural de fondo
 *   2. NavigationModule   — Nav sticky + hamburguesa
 *   3. ScrollReveal       — IntersectionObserver animaciones
 *   4. TerminalTyper      — Efecto typewriter en JSON
 *   5. MetricsCounter     — Contadores animados de métricas
 *   6. ActiveNavHighlight — Resaltado de sección activa
 * ─────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  // ─── Utilidades ──────────────────────────────────────────
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const clamp = (val, min, max) => Math.min(Math.max(val, min), max);

  /** Detección de preferencia de movimiento reducido */
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ═══════════════════════════════════════════════════════════
  //  1. PARTICLE ENGINE — Red Neural en Canvas
  // ═══════════════════════════════════════════════════════════
  const ParticleEngine = (function () {

    const canvas = $('#particle-canvas');
    if (!canvas) return { init: () => {} };

    const ctx = canvas.getContext('2d');

    // Configuración
    const CONFIG = {
      count:          80,       // Número de partículas
      maxRadius:      2.5,      // Radio máximo
      minRadius:      0.8,      // Radio mínimo
      speed:          0.4,      // Velocidad base
      connectDist:    140,      // Distancia máxima para conectar
      opacityParticle:0.5,
      lineOpacityBase:0.25,
      accentCyan:     [0, 229, 255],
      accentViolet:   [139, 92, 246],
    };

    let particles = [];
    let animFrameId = null;
    let W, H;

    /** Clase Partícula */
    class Particle {
      constructor () {
        this.reset();
      }

      reset () {
        this.x  = Math.random() * W;
        this.y  = Math.random() * H;
        this.vx = (Math.random() - 0.5) * CONFIG.speed;
        this.vy = (Math.random() - 0.5) * CONFIG.speed;
        this.r  = CONFIG.minRadius + Math.random() * (CONFIG.maxRadius - CONFIG.minRadius);
        // Alterna entre cyan y violet con probabilidad
        this.color = Math.random() > 0.6 ? CONFIG.accentViolet : CONFIG.accentCyan;
      }

      update () {
        this.x += this.vx;
        this.y += this.vy;

        // Rebote en bordes
        if (this.x < 0 || this.x > W) this.vx *= -1;
        if (this.y < 0 || this.y > H) this.vy *= -1;

        this.x = clamp(this.x, 0, W);
        this.y = clamp(this.y, 0, H);
      }

      draw () {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${this.color.join(',')}, ${CONFIG.opacityParticle})`;
        ctx.fill();
      }
    }

    /** Redimensionar canvas */
    function resize () {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    /** Dibujar líneas entre partículas cercanas */
    function connectParticles () {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONFIG.connectDist) {
            const alpha = CONFIG.lineOpacityBase * (1 - dist / CONFIG.connectDist);

            // Gradiente de línea entre los colores de cada partícula
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, `rgba(${a.color.join(',')}, ${alpha})`);
            grad.addColorStop(1, `rgba(${b.color.join(',')}, ${alpha})`);

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    }

    /** Loop de animación */
    function loop () {
      ctx.clearRect(0, 0, W, H);

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      connectParticles();
      animFrameId = requestAnimationFrame(loop);
    }

    /** Inicializar */
    function init () {
      if (prefersReducedMotion()) {
        canvas.style.display = 'none';
        return;
      }

      resize();

      // Calcular cantidad de partículas según el viewport
      const density = Math.round(CONFIG.count * (W / 1440));
      const count   = clamp(density, 40, 120);

      particles = Array.from({ length: count }, () => new Particle());

      loop();

      // Throttle resize
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          resize();
          particles.forEach(p => p.reset());
        }, 200);
      });
    }

    return { init };
  })();

  // ═══════════════════════════════════════════════════════════
  //  2. NAVIGATION MODULE — Sticky + Hamburguesa
  // ═══════════════════════════════════════════════════════════
  const NavigationModule = (function () {

    const navWrapper  = $('.nav-wrapper');
    const hamburger   = $('#hamburger');
    const navMenu     = $('#nav-menu');
    const navLinks    = $$('.nav__link');

    function handleScroll () {
      const scrolled = window.scrollY > 40;
      navWrapper.classList.toggle('scrolled', scrolled);
    }

    function toggleMenu () {
      const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!isOpen));
      navMenu.classList.toggle('is-open', !isOpen);
      // Bloquear scroll del body
      document.body.style.overflow = !isOpen ? 'hidden' : '';
    }

    function closeMenu () {
      hamburger.setAttribute('aria-expanded', 'false');
      navMenu.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    function init () {
      if (!navWrapper || !hamburger) return;

      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll(); // Estado inicial

      hamburger.addEventListener('click', toggleMenu);

      // Cerrar al hacer click en un enlace
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          closeMenu();
        });
      });

      // Cerrar con Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
      });
    }

    return { init };
  })();

  // ═══════════════════════════════════════════════════════════
  //  3. SCROLL REVEAL — IntersectionObserver
  // ═══════════════════════════════════════════════════════════
  const ScrollReveal = (function () {

    const SELECTORS = '.reveal-text, .reveal-fade, .reveal-up';

    function init () {
      const elements = $$(SELECTORS);
      if (!elements.length) return;

      // Si prefiere reducción de movimiento, mostrar todo directamente
      if (prefersReducedMotion()) {
        elements.forEach(el => el.classList.add('is-visible'));
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              // Unobserve tras animar para performance
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold:  0.15,
          rootMargin: '0px 0px -60px 0px',
        }
      );

      elements.forEach(el => observer.observe(el));
    }

    return { init };
  })();

  // ═══════════════════════════════════════════════════════════
  //  4. TERMINAL TYPER — Efecto Hacker JSON
  // ═══════════════════════════════════════════════════════════
  const TerminalTyper = (function () {

    const output = $('#terminal-output');
    if (!output) return { init: () => {} };

    /** Datos del perfil en JSON */
    const PROFILE = {
      alias:         'DiegoCpsx7z',
      role:          'Setups Specialist & Mod Developer',
      organization:  'Aztrix Prime Studio',
      positions:     ['CEO @ Aztrix Prime Studio', 'Manager @ CoreMC', 'Técnico @ NeonCore Cloud'],
      specialties:   ['PaperMC Performance', 'Minecraft Mods', 'Server Infrastructure', 'JVM Tuning'],
      status:        'AVAILABLE',
      location:      'Server-Side 🌐',
    };

    /** Coloreado de sintaxis JSON */
    function colorize (text) {
      return text
        .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
        .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
        .replace(/: (\d+)/g, ': <span class="json-number">$1</span>')
        .replace(/: (true|false|null)/g, ': <span class="json-bool">$1</span>')
        .replace(/([{}\[\],])/g, '<span class="json-bracket">$1</span>');
    }

    /** Convierte el objeto en líneas JSON con indentación */
    function buildLines () {
      const json = JSON.stringify(PROFILE, null, 2);
      return json.split('\n');
    }

    /** Efecto typewriter línea por línea */
    async function typeLines (lines) {
      // Cursor inicial
      output.innerHTML = '<span class="cursor-blink"></span>';

      let rendered = '';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        rendered += colorize(line) + '\n';
        output.innerHTML = rendered + '<span class="cursor-blink"></span>';

        // Pequeño delay entre líneas
        const delay = i === 0 ? 200 : 60 + Math.random() * 40;
        await sleep(delay);
      }

      // Cursor permanente al final
    }

    function sleep (ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    /** Iniciar cuando el terminal es visible */
    function init () {
      if (prefersReducedMotion()) {
        const lines = buildLines();
        output.innerHTML = colorize(lines.join('\n'));
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              typeLines(buildLines());
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );

      observer.observe(output);
    }

    return { init };
  })();

  // ═══════════════════════════════════════════════════════════
  //  5. METRICS COUNTER — Contadores Animados
  // ═══════════════════════════════════════════════════════════
  const MetricsCounter = (function () {

    const cards = $$('[data-target]');
    if (!cards.length) return { init: () => {} };

    /**
     * Anima un número de 0 a target en `duration` ms
     * con función de easing ease-out-expo
     */
    function animateCount (el, target, suffix, duration = 1400) {
      const start     = performance.now();
      const numEl     = el.querySelector('.metric-card__number');
      if (!numEl) return;

      function easeOutExpo (t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      }

      function step (now) {
        const elapsed  = now - start;
        const progress = clamp(elapsed / duration, 0, 1);
        const eased    = easeOutExpo(progress);
        const value    = Math.round(eased * target);

        numEl.textContent = value + suffix;

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    }

    function init () {
      if (prefersReducedMotion()) {
        cards.forEach(card => {
          const numEl  = card.querySelector('.metric-card__number');
          const target = parseInt(card.dataset.target, 10);
          const suffix = card.dataset.suffix || '';
          if (numEl) numEl.textContent = target + suffix;
        });
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const card   = entry.target;
              const target = parseInt(card.dataset.target, 10);
              const suffix = card.dataset.suffix || '';
              animateCount(card, target, suffix);
              observer.unobserve(card);
            }
          });
        },
        { threshold: 0.4 }
      );

      cards.forEach(card => observer.observe(card));
    }

    return { init };
  })();

  // ═══════════════════════════════════════════════════════════
  //  6. ACTIVE NAV HIGHLIGHT — Sección activa en navbar
  // ═══════════════════════════════════════════════════════════
  const ActiveNavHighlight = (function () {

    const sections = $$('section[id], .hero[id]');
    const navLinks = $$('.nav__link[href^="#"]');
    if (!sections.length || !navLinks.length) return { init: () => {} };

    function getActiveLink (id) {
      return navLinks.find(link => link.getAttribute('href') === `#${id}`);
    }

    function setActive (link) {
      navLinks.forEach(l => l.classList.remove('nav__link--active'));
      if (link) link.classList.add('nav__link--active');
    }

    function init () {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const link = getActiveLink(entry.target.id);
              setActive(link);
            }
          });
        },
        {
          threshold:  0,
          rootMargin: '-40% 0px -55% 0px',
        }
      );

      sections.forEach(s => observer.observe(s));
    }

    return { init };
  })();

  // ═══════════════════════════════════════════════════════════
  //  7. SMOOTH ANCHOR SCROLLING — Links internos
  // ═══════════════════════════════════════════════════════════
  const SmoothScroll = (function () {

    function init () {
      $$('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          const targetId = this.getAttribute('href');
          const target   = $(targetId);
          if (!target) return;

          e.preventDefault();

          const navH   = $('.nav-wrapper')?.offsetHeight || 68;
          const top    = target.getBoundingClientRect().top + window.scrollY - navH;

          window.scrollTo({ top, behavior: 'smooth' });
        });
      });
    }

    return { init };
  })();

  // ═══════════════════════════════════════════════════════════
  //  8. HERO PARALLAX — Efecto de profundidad sutil en scroll
  // ═══════════════════════════════════════════════════════════
  const HeroParallax = (function () {

    const heroContent  = $('.hero__content');
    const heroTerminal = $('.hero__terminal-wrapper');
    if (!heroContent || prefersReducedMotion()) return { init: () => {} };

    let ticking = false;

    function onScroll () {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY;
          const heroH   = document.getElementById('hero')?.offsetHeight || window.innerHeight;

          if (scrollY < heroH) {
            const pct = scrollY / heroH;
            heroContent.style.transform  = `translateY(${pct * 40}px)`;
            heroContent.style.opacity    = 1 - pct * 0.7;
            if (heroTerminal) {
              heroTerminal.style.transform = `translateY(${pct * 25}px)`;
              heroTerminal.style.opacity   = 1 - pct * 0.5;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    function init () {
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    return { init };
  })();

  // ═══════════════════════════════════════════════════════════
  //  9. CURSOR GLOW — Resplandor que sigue al cursor
  // ═══════════════════════════════════════════════════════════
  const CursorGlow = (function () {

    function init () {
      if (prefersReducedMotion() || window.matchMedia('(pointer: coarse)').matches) return;

      const glow = document.createElement('div');
      glow.style.cssText = `
        position: fixed;
        width: 300px;
        height: 300px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(0,229,255,0.04), transparent 70%);
        pointer-events: none;
        z-index: 0;
        transform: translate(-50%, -50%);
        transition: opacity 0.4s;
        opacity: 0;
      `;
      document.body.appendChild(glow);

      let mx = 0, my = 0, cx = 0, cy = 0;
      let animId = null;

      document.addEventListener('mousemove', (e) => {
        mx = e.clientX;
        my = e.clientY;
        glow.style.opacity = '1';
      });

      document.addEventListener('mouseleave', () => {
        glow.style.opacity = '0';
      });

      function lerp (a, b, t) { return a + (b - a) * t; }

      function animate () {
        cx = lerp(cx, mx, 0.08);
        cy = lerp(cy, my, 0.08);
        glow.style.left = cx + 'px';
        glow.style.top  = cy + 'px';
        animId = requestAnimationFrame(animate);
      }

      animate();
    }

    return { init };
  })();

  // ═══════════════════════════════════════════════════════════
  //  INICIALIZACIÓN PRINCIPAL
  // ═══════════════════════════════════════════════════════════

  function bootstrap () {
    ParticleEngine.init();
    NavigationModule.init();
    ScrollReveal.init();
    TerminalTyper.init();
    MetricsCounter.init();
    ActiveNavHighlight.init();
    SmoothScroll.init();
    HeroParallax.init();
    CursorGlow.init();

    // Añadir estilo de active link al CSS dinámicamente
    const style = document.createElement('style');
    style.textContent = `
      .nav__link--active {
        color: var(--accent-cyan) !important;
      }
      .nav__link--active::after {
        width: 100% !important;
      }
    `;
    document.head.appendChild(style);
  }

  // Esperar a que el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }

})();
