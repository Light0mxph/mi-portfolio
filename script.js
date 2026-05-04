(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const state = {
    menuOpen: false,
    glowX: window.innerWidth / 2,
    glowY: window.innerHeight / 2
  };

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function formatValue(value, mode) {
    if (mode === 'fixed') {
      return Number(value).toFixed(1).replace(/\.0$/, '');
    }
    return String(Math.round(value));
  }

  function animateNumber(el, target, options = {}) {
    const { prefix = '', suffix = '', mode = 'integer', duration = 1400 } = options;
    if (!el) return;

    const start = performance.now();

    function tick(now) {
      const progress = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const value = target * eased;
      el.textContent = `${prefix}${formatValue(value, mode)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  function initReveal() {
    const nodes = $$('.reveal');
    if (!nodes.length) return;

    if (prefersReducedMotion()) {
      nodes.forEach((node) => node.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.16,
      rootMargin: '0px 0px -8% 0px'
    });

    nodes.forEach((node) => observer.observe(node));
  }

  function initMetrics() {
    const metrics = $$('.mini-metric');
    if (!metrics.length) return;

    if (prefersReducedMotion()) {
      metrics.forEach((metric) => {
        const valueEl = $('.mini-metric__value', metric);
        const target = parseFloat(metric.dataset.target || '0');
        const prefix = metric.dataset.prefix || '';
        const suffix = metric.dataset.suffix || '';
        const mode = metric.dataset.mode || 'integer';
        valueEl.textContent = `${prefix}${formatValue(target, mode)}${suffix}`;
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const metric = entry.target;
        const valueEl = $('.mini-metric__value', metric);
        const target = parseFloat(metric.dataset.target || '0');
        const prefix = metric.dataset.prefix || '';
        const suffix = metric.dataset.suffix || '';
        const mode = metric.dataset.mode || 'integer';
        animateNumber(valueEl, target, { prefix, suffix, mode, duration: 1600 });
        observer.unobserve(metric);
      });
    }, { threshold: 0.55 });

    metrics.forEach((metric) => observer.observe(metric));
  }

  function buildTerminalJSON() {
    return {
      identity: {
        alias: 'DiegoCpsx7z',
        role: 'Arquitectura de alto rendimiento',
        studio: 'Aztrix Prime Studio'
      },
      authority: {
        position: 'CEO',
        experience: ['CoreMC', 'NeonCore Cloud', 'Aztrix Prime Studio']
      },
      performance: {
        uptime: '99.9%',
        tps_optimization: '+40%',
        latency_reduction: '-35ms',
        stability_sla: 'critical-grade'
      },
      specialization: [
        'PaperMC Performance',
        'Optimización de Infraestructura Crítica',
        'Auditoría de rendimiento',
        'Cloud architecture'
      ],
      signal: 'AVAILABLE_FOR_PREMIUM_PROJECTS'
    };
  }

  function colorizeJSON(source) {
    return source
      .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
      .replace(/: "([^"]*)"/g, ': <span class="json-string">"$1"</span>')
      .replace(/: ([0-9]+(?:\.[0-9]+)?)%/g, ': <span class="json-number">$1%</span>')
      .replace(/: ([0-9]+(?:\.[0-9]+)?)ms/g, ': <span class="json-number">$1ms</span>')
      .replace(/: (true|false|null)/g, ': <span class="json-bool">$1</span>')
      .replace(/([{}\[\],])/g, '<span class="json-brace">$1</span>');
  }

  async function typeTerminal() {
    const output = $('#terminal-output');
    if (!output) return;

    const payload = JSON.stringify(buildTerminalJSON(), null, 2);
    const lines = payload.split('\n');

    if (prefersReducedMotion()) {
      output.innerHTML = colorizeJSON(payload);
      return;
    }

    output.innerHTML = '';
    let rendered = '';

    for (let i = 0; i < lines.length; i++) {
      rendered += `${lines[i]}\n`;
      output.innerHTML = `${colorizeJSON(rendered)}<span class="cursor-line"></span>`;
      await new Promise((resolve) => setTimeout(resolve, i === 0 ? 180 : 70));
    }
  }

  function initMenu() {
    const toggle = $('#menuToggle');
    const menu = $('#siteMenu');
    if (!toggle || !menu) return;

    function closeMenu() {
      state.menuOpen = false;
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
    }

    toggle.addEventListener('click', () => {
      state.menuOpen = !state.menuOpen;
      toggle.setAttribute('aria-expanded', String(state.menuOpen));
      menu.classList.toggle('is-open', state.menuOpen);
    });

    $$('#siteMenu a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });

    document.addEventListener('click', (event) => {
      if (!menu.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    });
  }

  function initActiveNav() {
    const links = $$('#siteMenu a[href^="#"]');
    const sections = $$('main section[id]');
    if (!links.length || !sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        links.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`));
      });
    }, {
      threshold: 0.3,
      rootMargin: '-20% 0px -55% 0px'
    });

    sections.forEach((section) => observer.observe(section));
  }

  function initCursorGlow() {
    const glow = $('.cursor-glow');
    if (!glow || prefersReducedMotion()) return;

    const move = (x, y) => {
      state.glowX += (x - state.glowX) * 0.08;
      state.glowY += (y - state.glowY) * 0.08;
      glow.style.transform = `translate(${state.glowX}px, ${state.glowY}px) translate(-50%, -50%)`;
      requestAnimationFrame(() => move(state.targetX, state.targetY));
    };

    state.targetX = window.innerWidth * 0.5;
    state.targetY = window.innerHeight * 0.3;

    document.addEventListener('pointermove', (e) => {
      state.targetX = e.clientX;
      state.targetY = e.clientY;
    }, { passive: true });

    requestAnimationFrame(() => move(state.targetX, state.targetY));
  }

  function initParticles() {
    const canvas = $('#particle-canvas');
    if (!canvas || prefersReducedMotion()) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let particles = [];

    const config = {
      count: 52,
      maxDistance: 148
    };

    function resize() {
      width = canvas.width = window.innerWidth * devicePixelRatio;
      height = canvas.height = window.innerHeight * devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      particles = Array.from({ length: clamp(Math.round(config.count * (window.innerWidth / 1440)), 28, 72) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.28 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.28 * devicePixelRatio,
        r: (Math.random() * 1.25 + 0.45) * devicePixelRatio
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -20 || p.x > width + 20) p.vx *= -1;
        if (p.y < -20 || p.y > height + 20) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(215,180,106,.45)';
        ctx.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);

          if (dist < config.maxDistance * devicePixelRatio) {
            const alpha = (1 - dist / (config.maxDistance * devicePixelRatio)) * 0.18;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(100,64,160,${alpha})`;
            ctx.lineWidth = 1;
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

  function initSmoothScroll() {
    document.documentElement.style.scrollBehavior = prefersReducedMotion() ? 'auto' : 'smooth';
  }

  async function init() {
    initSmoothScroll();
    initMenu();
    initReveal();
    initMetrics();
    initActiveNav();
    initCursorGlow();
    initParticles();
    await typeTerminal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
