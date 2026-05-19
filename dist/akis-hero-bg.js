(function () {
  const LIME = '#CDFF01';
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function findHero() {
    return document.querySelector('.hero.shader-hero') || document.querySelector('#top.hero') || document.querySelector('#top');
  }

  function setup(hero) {
    if (!hero || hero.dataset.akisBgReady === 'true') return;
    hero.dataset.akisBgReady = 'true';
    hero.classList.add('akis-hero-active');

    const canvas = document.createElement('canvas');
    canvas.className = 'akis-bg-canvas';
    canvas.setAttribute('aria-hidden', 'true');

    const glow = document.createElement('div');
    glow.className = 'akis-bg-glow';
    glow.setAttribute('aria-hidden', 'true');

    const ctx = canvas.getContext('2d', { alpha: true });
    let width = 0;
    let height = 0;
    let dpr = 1;
    let points = [];
    let frame = 0;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0, active: false };

    function mountLayers() {
      if (!canvas.isConnected) hero.prepend(canvas);
      if (!glow.isConnected) {
        if (canvas.nextSibling) hero.insertBefore(glow, canvas.nextSibling);
        else hero.prepend(glow);
      }
    }

    function makePoints() {
      const area = Math.max(1, width * height);
      const count = reduceMotion ? 34 : Math.min(118, Math.max(52, Math.round(area / 18500)));
      points = Array.from({ length: count }, (_, index) => {
        const col = index % 12;
        const row = Math.floor(index / 12);
        return {
          x: (col / 11) * width + (Math.random() - .5) * 90,
          y: ((row + .5) / Math.ceil(count / 12)) * height + (Math.random() - .5) * 80,
          ox: Math.random() * 1000,
          oy: Math.random() * 1000,
          vx: (Math.random() - .5) * .22,
          vy: (Math.random() - .5) * .22,
          r: Math.random() * 1.7 + .65
        };
      });
    }

    function resize() {
      const rect = hero.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!mouse.active) {
        mouse.x = mouse.tx = width * .5;
        mouse.y = mouse.ty = height * .45;
        hero.style.setProperty('--akis-x', `${mouse.x}px`);
        hero.style.setProperty('--akis-y', `${mouse.y}px`);
      }
      makePoints();
    }

    function setMouse(event) {
      const rect = hero.getBoundingClientRect();
      mouse.tx = event.clientX - rect.left;
      mouse.ty = event.clientY - rect.top;
      mouse.active = true;
      hero.style.setProperty('--akis-alpha', '.92');
    }

    function leaveMouse() {
      mouse.active = false;
      mouse.tx = width * .5;
      mouse.ty = height * .45;
      hero.style.setProperty('--akis-alpha', '.58');
    }

    function draw(time) {
      frame = window.requestAnimationFrame(draw);
      mountLayers();
      if (!ctx || !width || !height) return;

      mouse.x += (mouse.tx - mouse.x) * .075;
      mouse.y += (mouse.ty - mouse.y) * .075;
      hero.style.setProperty('--akis-x', `${mouse.x}px`);
      hero.style.setProperty('--akis-y', `${mouse.y}px`);

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const pulse = Math.sin(time * .0012) * .5 + .5;
      const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, Math.max(width, height) * .42);
      gradient.addColorStop(0, `rgba(205,255,1,${mouse.active ? .22 : .13})`);
      gradient.addColorStop(.36, `rgba(205,255,1,${.055 + pulse * .025})`);
      gradient.addColorStop(1, 'rgba(205,255,1,0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      const speed = reduceMotion ? .0004 : .001;
      for (const p of points) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.max(1, Math.hypot(dx, dy));
        const influence = mouse.active ? Math.max(0, 1 - dist / 260) : 0;
        p.x += Math.sin(time * speed + p.ox) * .18 + p.vx + (dx / dist) * influence * 1.15;
        p.y += Math.cos(time * speed + p.oy) * .18 + p.vy + (dy / dist) * influence * 1.15;

        if (p.x < -30) p.x = width + 30;
        if (p.x > width + 30) p.x = -30;
        if (p.y < -30) p.y = height + 30;
        if (p.y > height + 30) p.y = -30;
      }

      for (let i = 0; i < points.length; i += 1) {
        const a = points[i];
        for (let j = i + 1; j < points.length; j += 1) {
          const b = points[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist > 150) continue;
          const alpha = (1 - dist / 150) * .16;
          ctx.strokeStyle = `rgba(205,255,1,${alpha})`;
          ctx.lineWidth = .75;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      for (const p of points) {
        const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        const alpha = .34 + Math.max(0, 1 - dist / 240) * .44;
        ctx.fillStyle = `rgba(205,255,1,${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = `rgba(205,255,1,${mouse.active ? .34 : .18})`;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 78 + pulse * 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    mountLayers();
    resize();
    window.addEventListener('resize', resize, { passive: true });
    hero.addEventListener('pointermove', setMouse, { passive: true });
    hero.addEventListener('pointerleave', leaveMouse, { passive: true });

    const observer = new MutationObserver(mountLayers);
    observer.observe(hero, { childList: true });
    frame = window.requestAnimationFrame(draw);

    window.addEventListener('pagehide', () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    }, { once: true });
  }

  function boot(attempt = 0) {
    const hero = findHero();
    if (hero) {
      setup(hero);
      return;
    }
    if (attempt < 40) window.setTimeout(() => boot(attempt + 1), 120);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => boot());
  } else {
    boot();
  }
})();
