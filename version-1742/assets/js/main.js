(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prevButton = document.querySelector('[data-hero-prev]');
  var nextButton = document.querySelector('[data-hero-next]');
  var activeIndex = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeIndex);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  }

  function startHero() {
    if (!slides.length) {
      return;
    }

    clearInterval(timer);
    timer = setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5200);
  }

  if (slides.length) {
    showSlide(0);
    startHero();

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startHero();
      });
    });

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        startHero();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        startHero();
      });
    }
  }

  var searchInput = document.querySelector('[data-filter-search]');
  var regionSelect = document.querySelector('[data-filter-region]');
  var typeSelect = document.querySelector('[data-filter-type]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var emptyState = document.querySelector('[data-empty-state]');

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var region = regionSelect ? regionSelect.value : '';
    var type = typeSelect ? typeSelect.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = [
        card.getAttribute('data-title') || '',
        card.getAttribute('data-region') || '',
        card.getAttribute('data-type') || '',
        card.getAttribute('data-genre') || '',
        card.textContent || ''
      ].join(' ').toLowerCase();
      var cardRegion = card.getAttribute('data-region') || '';
      var cardType = card.getAttribute('data-type') || '';
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchRegion = !region || cardRegion === region;
      var matchType = !type || cardType === type;
      var shouldShow = matchQuery && matchRegion && matchType;

      card.classList.toggle('is-filtered-out', !shouldShow);

      if (shouldShow) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  [searchInput, regionSelect, typeSelect].forEach(function (control) {
    if (control) {
      control.addEventListener('input', filterCards);
      control.addEventListener('change', filterCards);
    }
  });

  filterCards();
})();

var MoviePlayer = (function () {
  function bind(videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var started = false;
    var hlsInstance = null;

    if (!video || !button || !source) {
      return;
    }

    function load() {
      if (started) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      started = true;
    }

    function play() {
      load();
      button.classList.add('is-hidden');
      video.controls = true;
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          button.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
    video.addEventListener('ended', function () {
      button.classList.remove('is-hidden');
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  return {
    bind: bind
  };
})();
