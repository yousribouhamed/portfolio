(function () {
  function findIntroBlock() {
    const heading = Array.from(document.querySelectorAll('h1, h2, h3')).find((node) => {
      const text = node.textContent.replace(/\s+/g, ' ').trim().toLowerCase();
      return text.includes('16 years') && text.includes('making users');
    });

    if (!heading) return null;

    const directBlock = heading.parentElement;
    if (directBlock && directBlock.textContent.replace(/\s+/g, ' ').trim().toLowerCase().includes('16 years')) {
      return directBlock;
    }

    return heading;
  }

  let attempts = 0;
  function removeIntroBlock() {
    const block = findIntroBlock();
    if (!block) {
      if (attempts < 100) {
        attempts += 1;
        window.setTimeout(removeIntroBlock, 50);
      }
      return;
    }

    block.remove();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', removeIntroBlock);
  } else {
    removeIntroBlock();
  }
})();
