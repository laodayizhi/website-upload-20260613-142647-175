(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        var target = form.getAttribute("action") || "./search.html";
        if (query) {
          window.location.href = target + "?q=" + encodeURIComponent(query);
        } else {
          window.location.href = target;
        }
      });
    });

    document.querySelectorAll("[data-hero-carousel]").forEach(function (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer;

      function show(index) {
        if (!slides.length) {
          return;
        }

        current = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function start() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          show(index);
          start();
        });
      });

      show(0);
      start();
    });

    document.querySelectorAll("[data-filter-input]").forEach(function (input) {
      var scope = document.querySelector("[data-filter-scope]");
      var empty = document.querySelector("[data-empty-state]");

      function applyFilter() {
        var query = normalize(input.value);
        var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll("[data-card]")) : [];
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-meta"),
            card.textContent
          ].join(" "));
          var matched = !query || haystack.indexOf(query) !== -1;
          card.classList.toggle("is-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      }

      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q");
      if (initial && input.hasAttribute("data-search-page-input")) {
        input.value = initial;
      }

      input.addEventListener("input", applyFilter);
      applyFilter();
    });

    document.querySelectorAll("[data-player-wrap]").forEach(function (wrap) {
      var video = wrap.querySelector("[data-player]");
      var button = wrap.querySelector("[data-play]");
      var loaded = false;
      var hlsInstance = null;

      function loadStream() {
        if (!video || loaded) {
          return;
        }

        var stream = video.getAttribute("data-stream");
        if (!stream) {
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          loaded = true;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
          loaded = true;
          return;
        }

        video.src = stream;
        loaded = true;
      }

      function playVideo() {
        loadStream();
        wrap.classList.add("is-playing");
        if (video) {
          var request = video.play();
          if (request && typeof request.catch === "function") {
            request.catch(function () {});
          }
        }
      }

      if (button) {
        button.addEventListener("click", playVideo);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) {
            playVideo();
          }
        });

        video.addEventListener("play", function () {
          wrap.classList.add("is-playing");
        });
      }

      window.addEventListener("pagehide", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
