(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        initMenu();
        initHero();
        initListingFilters();
        initVideoPlayer();
        syncSearchInput();
    });

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var prev = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(target) {
            if (!slides.length) {
                return;
            }
            index = (target + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                show(i);
                start();
            });
        });
        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initListingFilters() {
        var list = document.querySelector('[data-card-list]');
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));
        var input = document.querySelector('[data-page-search]');
        var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
        var empty = document.querySelector('[data-empty-state]');
        var activeFilter = '';

        function apply() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesFilter = !activeFilter || text.indexOf(activeFilter) !== -1;
                var shouldShow = matchesQuery && matchesFilter;
                card.style.display = shouldShow ? '' : 'none';
                if (shouldShow) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', apply);
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                input.value = q;
            }
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                chip.classList.add('is-active');
                activeFilter = (chip.getAttribute('data-filter') || '').toLowerCase();
                apply();
            });
        });
        apply();
    }

    function syncSearchInput() {
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (!q) {
            return;
        }
        Array.prototype.slice.call(document.querySelectorAll('input[type="search"]')).forEach(function (input) {
            if (!input.value) {
                input.value = q;
            }
        });
    }

    function initVideoPlayer() {
        var video = document.querySelector('[data-player-video]');
        var startButton = document.querySelector('[data-player-start]');
        if (!video) {
            return;
        }
        var hlsUrl = video.getAttribute('data-hls');
        var attached = false;
        var hlsInstance = null;

        function play() {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
            if (startButton) {
                startButton.classList.add('is-hidden');
            }
        }

        function attachAndPlay() {
            if (!hlsUrl) {
                play();
                return;
            }
            if (attached) {
                play();
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = hlsUrl;
                video.addEventListener('loadedmetadata', play, { once: true });
                video.load();
                return;
            }
            loadHls(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        maxBufferLength: 30
                    });
                    hlsInstance.loadSource(hlsUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, play);
                    return;
                }
                video.src = hlsUrl;
                video.addEventListener('loadedmetadata', play, { once: true });
                video.load();
            });
        }

        function loadHls(callback) {
            if (window.Hls) {
                callback();
                return;
            }
            var existing = document.querySelector('script[data-hls-library]');
            if (existing) {
                existing.addEventListener('load', callback, { once: true });
                existing.addEventListener('error', callback, { once: true });
                return;
            }
            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
            script.async = true;
            script.setAttribute('data-hls-library', 'true');
            script.addEventListener('load', callback, { once: true });
            script.addEventListener('error', callback, { once: true });
            document.head.appendChild(script);
        }

        if (startButton) {
            startButton.addEventListener('click', attachAndPlay);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                attachAndPlay();
            }
        });
        video.addEventListener('play', function () {
            if (startButton) {
                startButton.classList.add('is-hidden');
            }
        });
        video.addEventListener('pause', function () {
            if (startButton && video.currentTime === 0) {
                startButton.classList.remove('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
