(function () {
  function normalize(text) {
    return text.replace(/\s+/g, ' ').trim();
  }

  function mount() {
    const heading = Array.from(document.querySelectorAll('h1, h2, h3')).find((node) =>
      normalize(node.textContent).toLowerCase() === 'trusted by leading innovators in web3'
    );
    if (!heading || heading.dataset.mogiTrustedSplit === 'true') return;

    heading.classList.add('mogi-trusted-heading');
    heading.textContent = '';

    [
      { text: 'Trusted by', cls: 'mogi-trusted-line mogi-trusted-by-line' },
      { text: 'Leading Innovators', cls: 'mogi-trusted-line' },
      { text: 'in Web3', cls: 'mogi-trusted-line' },
    ].forEach((line) => {
      const span = document.createElement('span');
      span.className = line.cls;
      span.textContent = line.text;
      heading.appendChild(span);
    });

    heading.dataset.mogiTrustedSplit = 'true';
  }

  let attempts = 0;
  function retry() {
    mount();
    if (!document.querySelector('.mogi-trusted-heading') && attempts < 80) {
      attempts += 1;
      window.setTimeout(retry, 50);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', retry);
  } else {
    retry();
  }
})();
