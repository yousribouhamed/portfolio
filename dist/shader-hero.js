(function () {
  const projects = [
    {
      title: 'Mogi Motion',
      subtitle: 'Interactive identity',
      label: 'Motion\nSystem',
      bg: 'linear-gradient(135deg, #efe7d2, #7fa4a0 48%, #101018)',
      card: 'linear-gradient(135deg, rgba(22,88,0,.4), rgba(205,255,1,.32))',
      tilt: '-4deg',
    },
    {
      title: 'Landing Lab',
      subtitle: 'Web showcase',
      label: 'Landing\nPages',
      bg: 'linear-gradient(135deg, #0a0a12, #242344 45%, #78a4d3)',
      card: 'linear-gradient(135deg, rgba(255,255,255,.38), rgba(10,12,28,.2))',
      tilt: '2deg',
    },
    {
      title: 'Visual Engine',
      subtitle: 'Design systems',
      label: 'Design\nSystems',
      bg: 'linear-gradient(135deg, #f8f3e8, #cbd9e4 42%, #10141c)',
      card: 'linear-gradient(135deg, rgba(205,255,1,.26), rgba(255,255,255,.34))',
      tilt: '-1deg',
    },
    {
      title: 'Product Flow',
      subtitle: 'Conversion UX',
      label: 'Product\nFlow',
      bg: 'linear-gradient(135deg, #0b1119, #2f5137 45%, #bac8b8)',
      card: 'linear-gradient(135deg, rgba(255,255,255,.3), rgba(22,88,0,.28))',
      tilt: '3deg',
    },
    {
      title: 'Brand Worlds',
      subtitle: 'Digital storytelling',
      label: 'Brand\nWorlds',
      bg: 'linear-gradient(135deg, #101019, #5e4d74 44%, #dac6a8)',
      card: 'linear-gradient(135deg, rgba(255,255,255,.28), rgba(205,255,1,.2))',
      tilt: '-2deg',
    },
  ];

  let active = 2;
  let timer = null;

  function frame(project, index) {
    return `
      <button class="shader-frame${index === active ? ' is-active' : ''}" type="button" data-index="${index}" data-label="${project.label}" style="--frame-bg:${project.bg};--frame-card:${project.card};--tilt:${project.tilt};--offset:${active}">
        <span class="shader-frame-card" aria-hidden="true"></span>
        <img class="shader-frame-logo" src="/mogi-logo.svg" alt="" />
      </button>
    `;
  }

  function markup() {
    const project = projects[active];
    return `
      <div class="shader-hero-title" aria-live="polite">
        <h1>${project.title}</h1>
        <p><span>${project.subtitle}</span> <strong>View project →</strong></p>
      </div>
      <div class="shader-stage" aria-label="Project carousel">
        <div class="shader-strip">
          <div class="shader-film">
            ${projects.map(frame).join('')}
          </div>
        </div>
      </div>
      <button class="shader-control shader-prev" type="button" aria-label="Previous project">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.8 5.4 8.2 12l6.6 6.6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button class="shader-control shader-next" type="button" aria-label="Next project">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.2 5.4 6.6 6.6-6.6 6.6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="shader-dots" aria-label="Carousel pagination">
        ${projects.map((_, index) => `<button class="shader-dot${index === active ? ' is-active' : ''}" type="button" data-index="${index}" aria-label="Show project ${index + 1}"></button>`).join('')}
      </div>
      <div class="shader-scroll">Scroll to About Us</div>
    `;
  }

  function render(hero) {
    hero.innerHTML = markup();
    hero.querySelector('.shader-prev').addEventListener('click', () => go(hero, active - 1));
    hero.querySelector('.shader-next').addEventListener('click', () => go(hero, active + 1));
    hero.querySelectorAll('.shader-dot,.shader-frame').forEach((button) => {
      button.addEventListener('click', () => go(hero, Number(button.dataset.index)));
    });
  }

  function go(hero, next) {
    active = (next + projects.length) % projects.length;
    render(hero);
    resetAutoplay(hero);
  }

  function resetAutoplay(hero) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    clearInterval(timer);
    timer = setInterval(() => {
      active = (active + 1) % projects.length;
      render(hero);
    }, 4200);
  }

  let attempts = 0;

  function mount() {
    const hero = document.querySelector('#top.hero, .hero');
    if (!hero) {
      if (attempts < 80) {
        attempts += 1;
        window.setTimeout(mount, 50);
      }
      return;
    }
    if (hero.classList.contains('shader-hero')) return;
    document.body.classList.add('shader-hero-ready');
    hero.className = 'hero shader-hero';
    hero.id = 'top';
    render(hero);
    resetAutoplay(hero);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
