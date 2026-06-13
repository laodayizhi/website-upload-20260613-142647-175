(function () {
    var base = "./";

    function getBase() {
        return document.body.getAttribute("data-base") || base;
    }

    function linkTo(path) {
        if (/^https?:\/\//.test(path)) {
            return path;
        }
        return getBase() + path;
    }

    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-menu]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        if (!slides.length) {
            return;
        }
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 6200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }
        restart();
    }

    function initSearch() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
        var panel = document.querySelector("[data-search-panel]");
        var source = window.SEARCH_INDEX || [];
        if (!forms.length || !panel || !source.length) {
            return;
        }

        function render(query) {
            var q = query.trim().toLowerCase();
            if (!q) {
                panel.classList.remove("is-open");
                panel.innerHTML = "";
                return;
            }
            var matches = source.filter(function (item) {
                return item.keyword.toLowerCase().indexOf(q) >= 0;
            }).slice(0, 18);
            if (!matches.length) {
                panel.innerHTML = '<div class="search-item"><strong>未找到相关影片</strong><span>换一个片名、地区或类型试试</span></div>';
                panel.classList.add("is-open");
                return;
            }
            panel.innerHTML = matches.map(function (item) {
                return '<a class="search-item" href="' + linkTo(item.url) + '"><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.meta) + '</span></a>';
            }).join("");
            panel.classList.add("is-open");
        }

        forms.forEach(function (form) {
            var input = form.querySelector("input[name='q']");
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                render(input ? input.value : "");
            });
            if (input) {
                input.addEventListener("input", function () {
                    render(input.value);
                });
                input.addEventListener("focus", function () {
                    render(input.value);
                });
            }
        });

        document.addEventListener("click", function (event) {
            if (panel.contains(event.target)) {
                return;
            }
            var inForm = forms.some(function (form) {
                return form.contains(event.target);
            });
            if (!inForm) {
                panel.classList.remove("is-open");
            }
        });
    }

    function initFilters() {
        var groups = Array.prototype.slice.call(document.querySelectorAll("[data-filter-group]"));
        if (!groups.length) {
            return;
        }
        groups.forEach(function (group) {
            var buttons = Array.prototype.slice.call(group.querySelectorAll("[data-filter-button]"));
            var section = group.closest("section") || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card]"));
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    var value = button.getAttribute("data-filter-button");
                    buttons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    cards.forEach(function (card) {
                        var keys = card.getAttribute("data-keys") || "";
                        card.classList.toggle("is-filtered", value !== "all" && keys.indexOf(value) === -1);
                    });
                });
            });
        });
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    ready(function () {
        initMenu();
        initHero();
        initSearch();
        initFilters();
    });

    window.setupMoviePlayer = function (videoId, buttonId, overlayId, streamUrl) {
        ready(function () {
            var video = document.getElementById(videoId);
            var button = document.getElementById(buttonId);
            var overlay = document.getElementById(overlayId);
            var prepared = false;

            if (!video || !streamUrl) {
                return;
            }

            function attach() {
                if (prepared) {
                    return;
                }
                prepared = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
            }

            function play() {
                attach();
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            if (button) {
                button.addEventListener("click", play);
            }
            if (overlay) {
                overlay.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (!prepared) {
                    play();
                }
            });
        });
    };
})();
