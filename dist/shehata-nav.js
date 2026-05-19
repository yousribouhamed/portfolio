(function () {
  const navItems = [
    { label: 'About', target: 'top' },
    { label: 'Career', target: 'services' },
    { label: 'Experiments', target: 'work' },
    { label: 'Founder', target: 'clients' },
    { label: 'Tools', target: 'work' },
  ];

  function findSection(id) {
    return (
      document.getElementById(id) ||
      document.querySelector(`[data-nav="${id}"]`) ||
      document.querySelector(`.${id}-section`) ||
      document.querySelector(`.${id}`)
    );
  }

  function buildNav() {
    if (document.getElementById('mogi-shehata-nav')) return;

    const nav = document.createElement('nav');
    nav.id = 'mogi-shehata-nav';
    nav.setAttribute('aria-label', 'Section navigation');
    nav.innerHTML = `
      <a href="#top" class="mogi-nav-logo" aria-label="Home">
        <img src="/mogi-logo.svg" alt="Mogi" />
      </a>
      <ul class="mogi-nav-pill" role="list">
        ${navItems.map((item) => `<li><a href="#${item.target}" data-target="${item.target}">${item.label}</a></li>`).join('')}
        <span class="mogi-nav-indicator" aria-hidden="true"></span>
      </ul>
      <a href="mailto:hello@mogi.studio?subject=Let%27s%20Talk" class="mogi-nav-cta">Let's Talk</a>
    `;
    document.body.appendChild(nav);
    setupNav(nav);
  }

  function setupNav(nav) {
    const links = Array.from(nav.querySelectorAll('.mogi-nav-pill a[data-target]'));
    const indicator = nav.querySelector('.mogi-nav-indicator');
    const pill = nav.querySelector('.mogi-nav-pill');
    const targets = links
      .map((link) => ({ link, section: findSection(link.dataset.target) }))
      .filter((item) => item.section);

    function moveIndicator(link) {
      if (!pill || !indicator || !link) return;
      const pillRect = pill.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      indicator.style.left = `${linkRect.left - pillRect.left}px`;
      indicator.style.width = `${linkRect.width}px`;
      indicator.classList.add('is-ready');
    }

    function setActive(link) {
      links.forEach((item) => item.classList.toggle('is-active', item === link));
      moveIndicator(link);
    }

    function updateActive() {
      const mid = window.scrollY + window.innerHeight * 0.35;
      let best = null;
      let bestDist = Infinity;

      targets.forEach((target) => {
        const top = target.section.offsetTop;
        const bottom = top + target.section.offsetHeight;
        if (mid >= top && mid <= bottom) {
          const dist = Math.abs((top + bottom) / 2 - mid);
          if (dist < bestDist) {
            bestDist = dist;
            best = target;
          }
        }
      });

      if (best) {
        setActive(best.link);
      } else {
        links.forEach((link) => link.classList.remove('is-active'));
        indicator && indicator.classList.remove('is-ready');
      }
    }

    links.forEach((link) => {
      link.addEventListener('click', (event) => {
        const section = findSection(link.dataset.target);
        if (!section) return;
        event.preventDefault();
        const navHeight = nav.offsetHeight + 28;
        window.scrollTo({ top: section.offsetTop - navHeight, behavior: 'smooth' });
      });
    });

    window.addEventListener('scroll', updateActive, { passive: true });
    window.addEventListener('resize', () => {
      const active = nav.querySelector('.mogi-nav-pill a.is-active');
      if (active) moveIndicator(active);
    });

    requestAnimationFrame(updateActive);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildNav);
  } else {
    buildNav();
  }
})();
