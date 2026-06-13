(() => {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', () => {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
  const prev = document.querySelector('[data-hero-prev]');
  const next = document.querySelector('[data-hero-next]');
  let heroIndex = 0;
  let timer = null;

  const showHero = (index) => {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, i) => {
      slide.classList.toggle('is-active', i === heroIndex);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === heroIndex);
    });
  };

  const restart = () => {
    if (timer) {
      window.clearInterval(timer);
    }

    if (slides.length > 1) {
      timer = window.setInterval(() => showHero(heroIndex + 1), 5200);
    }
  };

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      showHero(i);
      restart();
    });
  });

  if (prev) {
    prev.addEventListener('click', () => {
      showHero(heroIndex - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      showHero(heroIndex + 1);
      restart();
    });
  }

  restart();

  const normalize = (value) => (value || '').toString().trim().toLowerCase();

  const applyFilters = () => {
    const list = document.querySelector('[data-filter-list]');
    if (!list) {
      return;
    }

    const cards = Array.from(list.querySelectorAll('.movie-card'));
    const localSearch = document.querySelector('[data-local-search]');
    const searchInput = document.querySelector('[data-search-page-input]');
    const yearSelect = document.querySelector('[data-filter-year]');
    const typeSelect = document.querySelector('[data-filter-type]');
    const query = normalize((localSearch && localSearch.value) || (searchInput && searchInput.value));
    const year = normalize(yearSelect && yearSelect.value);
    const type = normalize(typeSelect && typeSelect.value);

    cards.forEach((card) => {
      const text = normalize(card.dataset.text);
      const cardYear = normalize(card.dataset.year);
      const cardType = normalize(card.dataset.type);
      const matchedText = !query || text.includes(query);
      const matchedYear = !year || cardYear.includes(year);
      const matchedType = !type || cardType.includes(type);
      card.classList.toggle('is-hidden', !(matchedText && matchedYear && matchedType));
    });
  };

  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  const searchPageInput = document.querySelector('[data-search-page-input]');
  const localSearch = document.querySelector('[data-local-search]');

  if (q) {
    if (searchPageInput) {
      searchPageInput.value = q;
    }

    if (localSearch) {
      localSearch.value = q;
    }
  }

  document.querySelectorAll('[data-local-search], [data-search-page-input], [data-filter-year], [data-filter-type]').forEach((control) => {
    control.addEventListener('input', applyFilters);
    control.addEventListener('change', applyFilters);
  });

  const clearButton = document.querySelector('[data-clear-filters]');
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      document.querySelectorAll('[data-local-search], [data-search-page-input]').forEach((input) => {
        input.value = '';
      });

      document.querySelectorAll('[data-filter-year], [data-filter-type]').forEach((select) => {
        select.value = '';
      });

      applyFilters();
    });
  }

  applyFilters();
})();
