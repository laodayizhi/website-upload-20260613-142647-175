(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-nav");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero-slider]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setupFilters() {
    var input = document.querySelector(".filter-input");
    var year = document.querySelector(".filter-year");
    var region = document.querySelector(".filter-region");
    var type = document.querySelector(".filter-type");
    var items = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-row"));
    if (!items.length || (!input && !year && !region && !type)) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q");
    if (q && input) {
      input.value = q;
    }
    function matchItem(item) {
      var query = normalize(input && input.value);
      var y = normalize(year && year.value);
      var r = normalize(region && region.value);
      var t = normalize(type && type.value);
      var text = normalize([
        item.getAttribute("data-title"),
        item.getAttribute("data-tags"),
        item.getAttribute("data-region"),
        item.getAttribute("data-type"),
        item.getAttribute("data-year")
      ].join(" "));
      var itemYear = normalize(item.getAttribute("data-year"));
      var itemRegion = normalize(item.getAttribute("data-region"));
      var itemType = normalize(item.getAttribute("data-type"));
      return (!query || text.indexOf(query) !== -1) &&
        (!y || itemYear.indexOf(y) !== -1) &&
        (!r || itemRegion.indexOf(r) !== -1 || text.indexOf(r) !== -1) &&
        (!t || itemType.indexOf(t) !== -1 || text.indexOf(t) !== -1);
    }
    function apply() {
      items.forEach(function (item) {
        item.classList.toggle("is-filter-hidden", !matchItem(item));
      });
    }
    [input, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();

function initMoviePlayer(source) {
  var video = document.getElementById("movie-player");
  var cover = document.querySelector(".player-cover");
  if (!video || !source) {
    return;
  }
  var attached = false;
  function attach() {
    if (attached) {
      return;
    }
    attached = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
      video.hlsInstance = hls;
    } else {
      video.src = source;
    }
  }
  function play() {
    attach();
    if (cover) {
      cover.classList.add("is-hidden");
    }
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }
  if (cover) {
    cover.addEventListener("click", play);
  }
  video.addEventListener("play", function () {
    if (cover) {
      cover.classList.add("is-hidden");
    }
  });
  video.addEventListener("click", function () {
    if (video.paused) {
      play();
    }
  });
}
