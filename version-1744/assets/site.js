(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  var filterInput = document.getElementById('movie-filter');
  var filterList = document.querySelector('[data-filter-list]');

  if (filterInput && filterList) {
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q') || '';

    if (queryValue) {
      filterInput.value = queryValue;
    }

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function filterCards() {
      var keyword = normalize(filterInput.value);
      var cards = Array.prototype.slice.call(filterList.children);

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.textContent
        ].join(' '));

        card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
      });
    }

    filterInput.addEventListener('input', filterCards);
    filterCards();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play]');
    var source = player.getAttribute('data-video');
    var started = false;
    var hlsInstance = null;

    function attachSource() {
      if (!video || !source || started) {
        return;
      }

      started = true;

      if (button) {
        button.classList.add('hidden');
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }

      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', attachSource);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          attachSource();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  });
})();
