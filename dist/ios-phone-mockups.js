(function () {
  const OLD_IOS_CARD_WORDS = ['React', 'GSAP', 'Lenis', 'CMS', 'Handoff'];
  const screenImages = [
    'https://res.cloudinary.com/eldoraui/image/upload/v1759051266/469059-640_kwga4s.jpg',
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=800&q=80&sat=-30',
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?auto=format&fit=crop&w=800&q=80'
  ];

  const labels = ['Explore', 'Booking', 'Finance', 'Social', 'Health'];
  const delays = [0, .08, .18, .08, 0];
  const baseRotations = [-18, -8, 0, 8, 18];

  function clamp(value, min = 0, max = 1) {
    return Math.min(max, Math.max(min, value));
  }

  function findIosSection() {
    const textCandidates = Array.from(document.querySelectorAll('body *'))
      .filter((el) => {
        const text = el.textContent || '';
        return /IOS\s*&\s*Android/i.test(text) && /\bApps\b/i.test(text);
      })
      .sort((a, b) => (a.textContent || '').length - (b.textContent || '').length);

    for (const start of textCandidates) {
      let current = start;
      let best = null;
      while (current && current !== document.body) {
        const text = current.textContent || '';
        const imageCount = current.querySelectorAll('img').length;
        const hasOldCardLabels = /React|GSAP|Lenis|CMS|Handoff|Webflow|Build/i.test(text);
        if (/IOS\s*&\s*Android/i.test(text) && /\bApps\b/i.test(text) && (imageCount >= 3 || hasOldCardLabels)) {
          best = current;
        }
        current = current.parentElement;
      }
      if (best) return best;

      current = start.parentElement;
      for (let i = 0; current && current !== document.body && i < 8; i += 1) {
        const siblingScope = current.parentElement || current;
        const possible = Array.from(siblingScope.children).find((el) => {
          const text = el.textContent || '';
          return /IOS\s*&\s*Android/i.test(text) && /\bApps\b/i.test(text) && el.querySelectorAll('img').length >= 3;
        });
        if (possible) return possible;
        current = current.parentElement;
      }
    }
    return null;
  }

  function findIosHeadingBlock() {
    const appLine = Array.from(document.querySelectorAll('body *'))
      .filter((el) => {
        const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
        const rect = el.getBoundingClientRect();
        return /^Apps$/i.test(text) && rect.width > 40 && rect.height > 20;
      })
      .sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top)[0];

    if (appLine) {
      let current = appLine;
      for (let i = 0; current && current !== document.body && i < 7; i += 1) {
        const text = current.textContent || '';
        if (/IOS\s*&\s*Android/i.test(text) && /\bApps\b/i.test(text)) return current;
        current = current.parentElement;
      }
    }

    return Array.from(document.querySelectorAll('body *'))
      .filter((el) => {
        const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
        const rect = el.getBoundingClientRect();
        return /IOS\s*&\s*Android/i.test(text) && /\bApps\b/i.test(text) && rect.height > 50;
      })
      .sort((a, b) => (a.textContent || '').length - (b.textContent || '').length)[0] || null;
  }

  function nearestRowFromLabel(labelEl) {
    let current = labelEl;
    for (let i = 0; current && current !== document.body && i < 8; i += 1) {
      if (current.querySelectorAll && current.querySelectorAll('img').length >= 3) return current;
      current = current.parentElement;
    }
    return null;
  }

  function hideRowsByLabels(words) {
    const rows = new Set();
    for (const word of words) {
      const label = Array.from(document.querySelectorAll('body *')).find((el) => {
        const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
        return text === word;
      });
      const row = label ? nearestRowFromLabel(label) : null;
      if (row && !row.closest('.mogi-ios-phone-showcase')) rows.add(row);
    }
    rows.forEach((row) => row.classList.add('mogi-ios-hidden-cards'));
    return rows;
  }

  function imageRowScore(el, headingRect) {
    if (!el || el.closest('.mogi-ios-phone-showcase')) return -1;
    const images = el.querySelectorAll('img').length;
    if (images < 3) return -1;
    const rect = el.getBoundingClientRect();
    if (rect.height < 80 || rect.width < window.innerWidth * .35) return -1;
    if (rect.top <= headingRect.bottom - 10) return -1;
    const distance = rect.top - headingRect.bottom;
    const text = el.textContent || '';
    const labelBonus = /React|GSAP|Lenis|CMS|Handoff|Mobile|Prototype|Audit|Flow|Dash/i.test(text) ? 500 : 0;
    return 2000 - distance + labelBonus + images * 20;
  }

  function setupByPosition() {
    const heading = findIosHeadingBlock();
    if (!heading) return false;

    const headingRect = heading.getBoundingClientRect();
    const iosRowsByLabel = hideRowsByLabels(OLD_IOS_CARD_WORDS);
    const oldRow = Array.from(document.querySelectorAll('main div, main section, main article, div, section, article, ul, ol'))
      .map((el) => ({ el, score: imageRowScore(el, headingRect) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)[0]?.el || Array.from(iosRowsByLabel)[0] || null;

    const headingParent = heading.parentElement || document.body;
    const parent = headingParent.parentElement || oldRow?.parentElement || headingParent || document.body;
    let showcase = parent.querySelector(':scope > .mogi-ios-phone-showcase');
    if (!showcase) {
      showcase = document.querySelector('.mogi-ios-phone-showcase');
      if (showcase && showcase.parentElement !== parent) showcase.remove();
    }
    if (!showcase) {
      showcase = document.createElement('div');
      showcase.className = 'mogi-ios-phone-showcase';
      showcase.setAttribute('aria-label', 'IOS and Android app mockups');
      labels.forEach((_, index) => showcase.appendChild(createPhone(index)));
      if (headingParent.nextSibling) parent.insertBefore(showcase, headingParent.nextSibling);
      else parent.appendChild(showcase);
    }

    Array.from(document.querySelectorAll('main div, main section, main article, div, section, article, ul, ol'))
      .map((el) => ({ el, score: imageRowScore(el, headingRect) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .forEach((item) => item.el.classList.add('mogi-ios-hidden-cards'));

    const phones = Array.from(showcase.querySelectorAll('.mogi-ios-phone'));

    function update() {
      const rect = showcase.getBoundingClientRect();
      const view = window.innerHeight || document.documentElement.clientHeight || 1;
      const progress = clamp((view - rect.top) / (view + rect.height * .85), 0, 1);

      phones.forEach((phone, index) => {
        const local = clamp((progress - delays[index]) / .72, 0, 1);
        const eased = local < .5 ? 2 * local * local : 1 - Math.pow(-2 * local + 2, 2) / 2;
        const spin = eased * 360;
        const side = index - 2;
        phone.style.setProperty('--phone-y', `${(1 - eased) * 104}px`);
        phone.style.setProperty('--phone-rx', `${(1 - eased) * 62 + eased * 4}deg`);
        phone.style.setProperty('--phone-ry', `${baseRotations[index] + spin}deg`);
        phone.style.setProperty('--phone-rz', `${side * (1 - eased) * 3.5}deg`);
        phone.style.setProperty('--phone-scale', `${.7 + eased * .3}`);
        phone.style.setProperty('--phone-opacity', `${.38 + eased * .62}`);
      });
    }

    if (showcase.dataset.iosScrollBound !== 'true') {
      showcase.dataset.iosScrollBound = 'true';
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update, { passive: true });
    }
    update();
    return true;
  }

  function commonAncestor(nodes) {
    if (!nodes.length) return null;
    const paths = nodes.map((node) => {
      const path = [];
      let current = node;
      while (current && current !== document.body) {
        path.unshift(current);
        current = current.parentElement;
      }
      return path;
    });

    let ancestor = null;
    for (let index = 0; ; index += 1) {
      const item = paths[0][index];
      if (!item || !paths.every((path) => path[index] === item)) break;
      ancestor = item;
    }
    return ancestor;
  }

  function createPhone(index) {
    const card = document.createElement('div');
    card.className = 'mogi-ios-phone-card';
    card.innerHTML = `
      <div class="mogi-ios-phone" style="--phone-rz: ${baseRotations[index] * .18}deg">
        <div class="mogi-ios-screen">
          <img src="${screenImages[index]}" alt="${labels[index]} app screen" loading="lazy">
          <div class="mogi-ios-ui">
            <div class="mogi-ios-kicker">IOS & Android</div>
            <div class="mogi-ios-label">
              <strong>${labels[index]}<br>App</strong>
              <span></span>
            </div>
          </div>
        </div>
        <div class="mogi-ios-camera" aria-hidden="true"><i></i><i></i><i></i></div>
      </div>
    `;
    return card;
  }

  function setup(section) {
    if (!section) return false;

    const existingShowcase = section.querySelector('.mogi-ios-phone-showcase');
    if (existingShowcase && section.dataset.iosPhonesReady === 'true') return true;
    section.dataset.iosPhonesReady = 'true';
    if (existingShowcase) existingShowcase.remove();

    const oldImages = Array.from(section.querySelectorAll('img')).filter((img) => !img.closest('.mogi-ios-phone-showcase'));
    let oldRow = Array.from(section.querySelectorAll('div, ul, ol, section, article'))
      .filter((el) => el.querySelectorAll('img').length >= 3 && !el.closest('.mogi-ios-phone-showcase'))
      .sort((a, b) => (a.textContent || '').length - (b.textContent || '').length)[0];
    oldRow = oldRow || commonAncestor(oldImages);

    if (oldRow && oldRow !== section && !oldRow.classList.contains('mogi-ios-phone-showcase')) {
      oldRow.classList.add('mogi-ios-hidden-cards');
    } else {
      oldImages.forEach((img) => {
        const card = img.closest('figure, li, [class*="card"], [class*="item"]') || img.parentElement;
        if (card && card !== section) card.classList.add('mogi-ios-hidden-cards');
      });
    }

    const showcase = document.createElement('div');
    showcase.className = 'mogi-ios-phone-showcase';
    showcase.setAttribute('aria-label', 'IOS and Android app mockups');
    labels.forEach((_, index) => showcase.appendChild(createPhone(index)));

    if (oldRow && oldRow.parentElement && oldRow !== section) {
      oldRow.parentElement.insertBefore(showcase, oldRow.nextSibling);
    } else {
      section.appendChild(showcase);
    }

    const phones = Array.from(showcase.querySelectorAll('.mogi-ios-phone'));

    function update() {
      const rect = section.getBoundingClientRect();
      const view = window.innerHeight || document.documentElement.clientHeight || 1;
      const progress = clamp((view - rect.top) / (view + rect.height * .72), 0, 1);

      phones.forEach((phone, index) => {
        const local = clamp((progress - delays[index]) / .68, 0, 1);
        const eased = local < .5 ? 2 * local * local : 1 - Math.pow(-2 * local + 2, 2) / 2;
        const spin = eased * 360;
        const side = index - 2;
        phone.style.setProperty('--phone-y', `${(1 - eased) * 96}px`);
        phone.style.setProperty('--phone-rx', `${(1 - eased) * 58 + eased * 5}deg`);
        phone.style.setProperty('--phone-ry', `${baseRotations[index] + spin}deg`);
        phone.style.setProperty('--phone-rz', `${side * (1 - eased) * 3}deg`);
        phone.style.setProperty('--phone-scale', `${.72 + eased * .28}`);
        phone.style.setProperty('--phone-opacity', `${.42 + eased * .58}`);
      });
    }

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return true;
  }

  function boot(attempt = 0) {
    if (setupByPosition()) {
      window.setTimeout(setupByPosition, 300);
      window.setTimeout(setupByPosition, 900);
      window.setTimeout(setupByPosition, 1800);
      window.setTimeout(setupByPosition, 3200);
      return;
    }
    const section = findIosSection();
    if (setup(section)) {
      const observer = new MutationObserver(() => {
        const freshSection = findIosSection();
        if (!freshSection) return;
        const hasPhones = !!freshSection.querySelector('.mogi-ios-phone-showcase');
        const oldRows = Array.from(freshSection.querySelectorAll('div, ul, ol, section, article'))
          .filter((el) => el.querySelectorAll('img').length >= 3 && !el.closest('.mogi-ios-phone-showcase'));
        oldRows.forEach((row) => row.classList.add('mogi-ios-hidden-cards'));
        if (!hasPhones) {
          freshSection.dataset.iosPhonesReady = 'false';
          setup(freshSection);
        }
      });
      observer.observe(section, { childList: true, subtree: true });
      return;
    }
    if (attempt < 80) window.setTimeout(() => boot(attempt + 1), 120);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => boot());
  } else {
    boot();
  }

  let guardRuns = 0;
  const guard = window.setInterval(() => {
    guardRuns += 1;
    setupByPosition();
    if (guardRuns > 24) window.clearInterval(guard);
  }, 500);

  window.__mogiRefreshIosPhones = setupByPosition;
})();
