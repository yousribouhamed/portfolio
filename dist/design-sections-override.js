(function () {
  const TITLE_PARTS = [
    'websites',
    'visual branding',
    'product design',
    'product enhancement',
    'webflow',
    'react builds',
  ];

  function normalize(text) {
    return text.replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function isDesignTitle(node) {
    const text = normalize(node.textContent || '');
    return TITLE_PARTS.some((part) => text.includes(part));
  }

  function getCard(title) {
    let node = title.parentElement;
    for (let i = 0; i < 5 && node && node.parentElement; i += 1) {
      const text = normalize(node.textContent || '');
      if (text.includes(normalize(title.textContent || '')) && text.length < 500) return node;
      node = node.parentElement;
    }
    return title.parentElement || title;
  }

  function titleLines(text) {
    const clean = normalize(text);
    if (clean.includes('websites')) return ['Websites', '&Landing Pages'];
    if (clean.includes('visual branding')) return ['Visual', 'Branding'];
    if (clean.includes('product design') || clean.includes('product enhancement')) return ['Product Design', 'Enhancement'];
    if (clean.includes('webflow') || clean.includes('react builds')) return ['IOS&Android', 'Apps'];
    return text.split(/\s+/).filter(Boolean);
  }

  function splitTitleLines(title) {
    if (title.dataset.mogiLineSplit === 'true') return;
    const lines = titleLines(title.textContent || '');
    if (!lines.length) return;

    title.textContent = '';
    lines.forEach((line) => {
      const span = document.createElement('span');
      span.className = 'mogi-title-line';
      span.textContent = line;
      title.appendChild(span);
    });
    title.dataset.mogiLineSplit = 'true';
  }

  function setup() {
    const areaTitle = Array.from(document.querySelectorAll('h1, h2, h3')).find((node) =>
      normalize(node.textContent || '').includes('i help companies succeed')
    );
    if (areaTitle) {
      let area = areaTitle.parentElement;
      for (let i = 0; i < 7 && area && area.parentElement; i += 1) {
        const text = normalize(area.textContent || '');
        if (
          text.includes('websites') &&
          text.includes('visual branding') &&
          text.includes('product design')
        ) {
          area.classList.add('mogi-design-area');
          area.style.setProperty('opacity', '1', 'important');
          area.style.setProperty('visibility', 'visible', 'important');
          area.querySelectorAll('*').forEach((node) => {
            node.style.setProperty('opacity', '1', 'important');
            node.style.setProperty('visibility', 'visible', 'important');
          });
          break;
        }
        area = area.parentElement;
      }
    }

    const titles = Array.from(document.querySelectorAll('h2, h3, h4')).filter(isDesignTitle);
    titles.forEach((title) => {
      title.classList.add('mogi-design-title');
      splitTitleLines(title);
      const card = getCard(title);
      card.classList.add('mogi-design-card');
      card.style.setProperty('opacity', '1', 'important');
      card.style.setProperty('visibility', 'visible', 'important');
      card.style.setProperty('transform', 'none', 'important');
      if (card.nextElementSibling) {
        card.nextElementSibling.classList.add('mogi-design-card');
        card.nextElementSibling.style.setProperty('opacity', '1', 'important');
        card.nextElementSibling.style.setProperty('visibility', 'visible', 'important');
        card.nextElementSibling.style.setProperty('transform', 'none', 'important');
        card.nextElementSibling.querySelectorAll('*').forEach((node) => {
          node.style.setProperty('opacity', '1', 'important');
          node.style.setProperty('visibility', 'visible', 'important');
        });
      }
    });
    update();
  }

  function update() {
    const cards = Array.from(document.querySelectorAll('.mogi-design-card'));
    const viewport = window.innerHeight || document.documentElement.clientHeight;

    cards.forEach((card) => {
      const title = card.querySelector('.mogi-design-title');
      if (!title) return;

      const rect = card.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (viewport * 0.88 - rect.top) / (viewport * 0.72)));
      const passed = rect.top < viewport * 0.16;

      card.classList.toggle('is-in-view', progress > 0 && rect.bottom > 0);
      card.classList.toggle('is-passed', passed);
      card.style.setProperty('opacity', '1', 'important');
      card.style.setProperty('visibility', 'visible', 'important');
      card.style.setProperty('transform', 'none', 'important');
      title.style.setProperty('--title-fill', `${Math.round(progress * 100)}%`);
      title.classList.toggle('is-color-filled', progress > 0.08);

      const lines = Array.from(title.querySelectorAll('.mogi-title-line'));
      lines.forEach((line, index) => {
        const delayed = Math.max(0, Math.min(1, (progress - index * 0.18) / 0.72));
        const eased = delayed < 0.5
          ? 4 * delayed * delayed * delayed
          : 1 - Math.pow(-2 * delayed + 2, 3) / 2;
        const scale = 0.7 + eased * 0.3;
        line.style.setProperty('--line-scale', scale.toFixed(3));
      });
    });
  }

  let attempts = 0;
  function mount() {
    setup();
    if (!document.querySelector('.mogi-design-title') && attempts < 80) {
      attempts += 1;
      window.setTimeout(mount, 50);
      return;
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('wheel', update, { passive: true });
    window.addEventListener('resize', update);
    requestAnimationFrame(update);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
