/**
 * THE ROYAL VOID — script.js
 * DiegoCpsx7z · Aztrix Prime Studio
 *
 * Bugs fixed vs original:
 * 1. initCursorGlow: la función move() se llamaba con valores congelados
 *    en el RAF en lugar de leer el estado vivo → ahora usa state directamente.
 * 2. colorizeJSON: el regex de números (%/ms) nunca disparaba porque los
 *    valores ya estaban dentro de spans de string. Reemplazado por un
 *    tokenizer de una sola pasada sobre el JSON raw.
 * 3. initActiveNav: múltiples secciones visibles hacían parpadear el nav.
 *    Ahora usa scrollY para elegir la sección más próxima al viewport.
 * 4. Añadido will-change y cancelación de RAF para evitar memory leaks.
 * 5. Añadido scroll-progress bar.
 * 6. initCursorGlow ya no crea múltiples loops de RAF.
 */

(() => {
  'use strict';

  /* ─── Helpers ─────────────────────────────────────────────── */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
  const prefersReducedMotion = () =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── State (single source of truth) ─────────────────────── */
  const state = {
    menuOpen: false,
    /* Cursor glow — live target updated on pointermove */
    glowTargetX: window.innerWidth  * 0.5,
    glowTargetY: window.innerHeight * 0.3,
    glowCurrentX: window.innerWidth  * 0.5,
    glowCurrentY: window.innerHeight * 0.3,
    glowRafId: null,
    /* Scroll progress */
    scrollRafId: null,
  };

  /* ═══════════════════════════════════════════════════════════
     SCROLL PROGRESS
     ═══════════════════════════════════════════════════════════ */
  function initScrollProgress() {
    const bar = $('#scrollBar');
    if (!bar) return;

    function update() {
      const scrolled = window.scrollY;
      const total    = document.documentElement.scrollHeight - window.innerHeight;
      const pct      = total > 0 ? (scrolled / total) * 100 : 0;
      bar.style.width = `${clamp(pct, 0, 100)}%`;
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ═══════════════════════════════════════════════════════════
     NAV — sticky background on scroll
     ═══════════════════════════════════════════════════════════ */
  function initNavScroll() {
    const shell = $('.nav-shell');
    if (!shell) return;
    window.addEventListener('scroll', () => {
      shell.classList.toggle('scrolled', window.scrollY > 48);
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════════
     MOBILE MENU
     ═══════════════════════════════════════════════════════════ */
  function initMenu() {
    const toggle = $('#menuToggle');
    const menu   = $('#siteMenu');
    if (!toggle || !menu) return;

    const close = () => {
      state.menuOpen = false;
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
    };

    toggle.addEventListener('click', () => {
      state.menuOpen = !state.menuOpen;
      toggle.setAttribute('aria-expanded', String(state.menuOpen));
      menu.classList.toggle('is-open', state.menuOpen);
    });

    /* Close on any menu-link click */
    $$('#siteMenu a').forEach(link => link.addEventListener('click', close));

    /* Close on Escape */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && state.menuOpen) close();
    });

    /* Close on outside click */
    document.addEventListener('pointerdown', e => {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) close();
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════════
     ACTIVE NAV LINK
     Bug fix: usar la sección cuyo top esté más cerca de scrollY
     en lugar de dejar que IntersectionObserver colisione múltiples
     entradas simultáneas.
     ═══════════════════════════════════════════════════════════ */
  function initActiveNav() {
    const links    = $$('#siteMenu a[href^="#"]');
    const sections = $$('main section[id]');
    if (!links.length || !sections.length) return;

    function updateActive() {
      const mid = window.scrollY + window.innerHeight * 0.35;
      let closest = null;
      let closestDist = Infinity;

      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        const top  = rect.top + window.scrollY;
        const dist = Math.abs(top - mid);
        if (dist < closestDist) {
          closestDist = dist;
          closest = section.id;
        }
      });

      links.forEach(link => {
        link.classList.toggle(
          'is-active',
          link.getAttribute('href') === `#${closest}`
        );
      });
    }

    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();
  }

  /* ═══════════════════════════════════════════════════════════
     REVEAL ON SCROLL
     ═══════════════════════════════════════════════════════════ */
  function initReveal() {
    const nodes = $$('.reveal');
    if (!nodes.length) return;

    if (prefersReducedMotion()) {
      nodes.forEach(n => n.classList.add('is-visible'));
      return;
    }

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.13, rootMargin: '0px 0px -6% 0px' });

    nodes.forEach(n => io.observe(n));
  }

  /* ═══════════════════════════════════════════════════════════
     NUMBER COUNTER ANIMATION
     ═══════════════════════════════════════════════════════════ */
  function animateNumber(el, target, { prefix = '', suffix = '', mode = 'integer', duration = 1500 } = {}) {
    if (!el) return;
    const start = performance.now();

    function tick(now) {
      const progress = clamp((now - start) / duration, 0, 1);
      const eased    = 1 - Math.pow(1 - progress, 4);
      const value    = target * eased;
      const display  = mode === 'fixed'
        ? value.toFixed(1).replace(/\.0$/, '')
        : String(Math.round(value));
      el.textContent = `${prefix}${display}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function initMetrics() {
    const metrics = $$('.mini-metric');
    if (!metrics.length) return;

    /* Reduced motion: set final value immediately */
    if (prefersReducedMotion()) {
      metrics.forEach(m => {
        const el     = $('.mini-metric__value', m);
        const target = parseFloat(m.dataset.target || '0');
        const mode   = m.dataset.mode || 'integer';
        const prefix = m.dataset.prefix || '';
        const suffix = m.dataset.suffix || '';
        const display = mode === 'fixed'
          ? target.toFixed(1).replace(/\.0$/, '')
          : String(Math.round(target));
        if (el) el.textContent = `${prefix}${display}${suffix}`;
      });
      return;
    }

    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const m      = entry.target;
        const el     = $('.mini-metric__value', m);
        const target = parseFloat(m.dataset.target || '0');
        animateNumber(el, target, {
          prefix:   m.dataset.prefix || '',
          suffix:   m.dataset.suffix || '',
          mode:     m.dataset.mode   || 'integer',
          duration: 1700,
        });
        io.unobserve(m);
      });
    }, { threshold: 0.5 });

    metrics.forEach(m => io.observe(m));
  }

  /* ═══════════════════════════════════════════════════════════
     TERMINAL — JSON BUILDER + TOKENIZER
     Bug fix: el colorizer original intentaba hacer match de
     números como "99.9%" dentro de strings ya envueltas por
     <span class="json-string">, lo cual nunca disparaba.
     Ahora tokenizamos el JSON raw en una sola pasada.
     ═══════════════════════════════════════════════════════════ */
  function buildProfileJSON() {
    return {
      identity: {
        alias:   'DiegoCpsx7z',
        role:    'Arquitectura de Alto Rendimiento',
        studio:  'Aztrix Prime Studio',
      },
      authority: {
        position:   'CEO',
        experience: ['CoreMC', 'NeonCore Cloud', 'Aztrix Prime Studio'],
      },
      performance: {
        uptime:            '99.9%',
        tps_optimization:  '+40%',
        latency_reduction: '-35ms',
        stability_sla:     'critical-grade',
      },
      specialization: [
        'PaperMC Performance',
        'Optimización de Infraestructura Crítica',
        'Auditoría de rendimiento',
        'Cloud Architecture',
      ],
      status: 'AVAILABLE_FOR_PREMIUM_PROJECTS',
    };
  }

  /**
   * Tokenizer de una sola pasada: itera carácter a carácter sobre
   * el JSON ya serializado y emite spans de colores sin regex anidados.
   * Esto evita el bug donde los valores string envolvían métricas
   * como "99.9%" antes de que el regex de números pudiera capturarlas.
   */
  function tokenizeJSON(raw) {
    let out = '';
    let i   = 0;
    const len = raw.length;

    while (i < len) {
      const ch = raw[i];

      /* ── Whitespace ── */
      if (/\s/.test(ch)) { out += ch; i++; continue; }

      /* ── String ── */
      if (ch === '"') {
        let str = '"';
        i++;
        while (i < len) {
          const sc = raw[i];
          str += sc;
          if (sc === '\\') { i++; if (i < len) { str += raw[i]; i++; } continue; }
          if (sc === '"')  { i++; break; }
          i++;
        }

        /* Peek forward for colon → key */
        let j = i;
        while (j < len && /[ \t]/.test(raw[j])) j++;
        if (raw[j] === ':') {
          out += `<span class="json-key">${str}</span>`;
        } else {
          /* Value string: strip outer quotes to inspect the value */
          const inner = str.slice(1, -1);
          out += `<span class="json-str">${str}</span>`;
        }
        continue;
      }

      /* ── Numbers ── */
      if (ch === '-' || (ch >= '0' && ch <= '9')) {
        let num = '';
        while (i < len && /[-\d.eE+]/.test(raw[i])) { num += raw[i]; i++; }
        out += `<span class="json-num">${num}</span>`;
        continue;
      }

      /* ── Booleans / null ── */
      if (raw.startsWith('true',  i)) { out += `<span class="json-bool">true</span>`;   i += 4; continue; }
      if (raw.startsWith('false', i)) { out += `<span class="json-bool">false</span>`;  i += 5; continue; }
      if (raw.startsWith('null',  i)) { out += `<span class="json-null">null</span>`;   i += 4; continue; }

      /* ── Structural characters ── */
      if ('{}[],'.includes(ch)) { out += `<span class="json-brace">${ch}</span>`; i++; continue; }

      /* ── Colon (separator) ── */
      if (ch === ':') { out += ch; i++; continue; }

      out += ch; i++;
    }

    return out;
  }

  async function typeTerminal() {
    const output = $('#terminal-output');
    if (!output) return;

    const raw   = JSON.stringify(buildProfileJSON(), null, 2);
    const lines = raw.split('\n');

    if (prefersReducedMotion()) {
      output.innerHTML = tokenizeJSON(raw);
      return;
    }

    output.innerHTML = '';
    let rendered = '';

    for (let i = 0; i < lines.length; i++) {
      rendered += lines[i] + '\n';
      output.innerHTML = tokenizeJSON(rendered) + '<span class="cursor-line"></span>';
      /* First line slightly slower for dramatic effect */
      await new Promise(r => setTimeout(r, i === 0 ? 200 : 62));
    }
    /* Remove cursor after typing finishes */
    await new Promise(r => setTimeout(r, 900));
    output.innerHTML = tokenizeJSON(raw);
  }

  /* ═══════════════════════════════════════════════════════════
     CURSOR GLOW
     Bug fix: la versión original pasaba state.targetX/Y al RAF
     como valores congelados en el momento de la llamada:
       requestAnimationFrame(() => move(state.targetX, state.targetY))
     Eso congelaba el target en el último valor conocido y el glow
     dejaba de seguir al cursor suavemente. Ahora move() lee
     state.glowTargetX/Y directamente en cada frame.
     ═══════════════════════════════════════════════════════════ */
  function initCursorGlow() {
    const glow = $('.cursor-glow');
    if (!glow || prefersReducedMotion()) return;

    /* Update target on pointer move */
    document.addEventListener('pointermove', e => {
      state.glowTargetX = e.clientX;
      state.glowTargetY = e.clientY;
    }, { passive: true });

    function tick() {
      /* Smooth lerp — reads live state every frame */
      state.glowCurrentX += (state.glowTargetX - state.glowCurrentX) * 0.075;
      state.glowCurrentY += (state.glowTargetY - state.glowCurrentY) * 0.075;

      glow.style.transform =
        `translate(${state.glowCurrentX}px, ${state.glowCurrentY}px) translate(-50%, -50%)`;

      state.glowRafId = requestAnimationFrame(tick);
    }

    /* Single loop — never duplicated */
    if (!state.glowRafId) state.glowRafId = requestAnimationFrame(tick);
  }

  /* ═══════════════════════════════════════════════════════════
     TERMINAL CARD TILT (bonus — mousemove 3D parallax)
     ═══════════════════════════════════════════════════════════ */
  function initTerminalTilt() {
    const card = $('#terminalCard');
    if (!card || prefersReducedMotion()) return;

    card.addEventListener('mousemove', e => {
      const rect  = card.getBoundingClientRect();
      const x     = (e.clientX - rect.left) / rect.width  - 0.5;
      const y     = (e.clientY - rect.top)  / rect.height - 0.5;
      card.style.transform = `perspective(1200px) rotateY(${x * 10}deg) rotateX(${-y * 7}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
      card.style.transform  = 'perspective(1200px) rotateY(-5deg) rotateX(3.5deg)';
      setTimeout(() => { card.style.transition = ''; }, 650);
    });
  }

  /* ═══════════════════════════════════════════════════════════
     PARTICLES
     ═══════════════════════════════════════════════════════════ */
  function initParticles() {
    const canvas = $('#particle-canvas');
    if (!canvas || prefersReducedMotion()) return;

    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, particles = [];
    const MAX_DIST = 145;

    function resize() {
      const dpr = Math.min(devicePixelRatio, 2);
      W = canvas.width  = window.innerWidth  * dpr;
      H = canvas.height = window.innerHeight * dpr;
      canvas.style.width  = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      const count = clamp(Math.round(50 * (window.innerWidth / 1440)), 24, 68);
      particles = Array.from({ length: count }, () => ({
        x:  Math.random() * W,
        y:  Math.random() * H,
        vx: (Math.random() - 0.5) * 0.26 * dpr,
        vy: (Math.random() - 0.5) * 0.26 * dpr,
        r:  (Math.random() * 1.2 + 0.4) * dpr,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const dpr     = Math.min(devicePixelRatio, 2);
      const maxDist = MAX_DIST * dpr;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20 || p.x > W + 20) p.vx *= -1;
        if (p.y < -20 || p.y > H + 20) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(205,165,80,.48)';
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a  = particles[i];
          const b  = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d  = Math.hypot(dx, dy);
          if (d < maxDist) {
            const alpha = (1 - d / maxDist) * 0.16;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(96,58,158,${alpha})`;
            ctx.lineWidth   = 1;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize, { passive: true });
  }

  /* ═══════════════════════════════════════════════════════════
     SMOOTH SCROLL
     ═══════════════════════════════════════════════════════════ */
  function initSmoothScroll() {
    document.documentElement.style.scrollBehavior =
      prefersReducedMotion() ? 'auto' : 'smooth';
  }

  /* ═══════════════════════════════════════════════════════════
     BOOT
     ═══════════════════════════════════════════════════════════ */
  async function init() {
    initSmoothScroll();
    initScrollProgress();
    initNavScroll();
    initMenu();
    initReveal();
    initMetrics();
    initActiveNav();
    initCursorGlow();
    initParticles();
    initTerminalTilt();
    await typeTerminal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
