(function () {
    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function updateCards(panel) {
        var root = panel.closest('main') || document;
        var input = root.querySelector('[data-filter-input]');
        var typeSelect = root.querySelector('[data-filter-type]');
        var regionSelect = root.querySelector('[data-filter-region]');
        var yearSelect = root.querySelector('[data-filter-year]');
        var keyword = normalize(input && input.value);
        var type = normalize(typeSelect && typeSelect.value);
        var region = normalize(regionSelect && regionSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var cards = root.querySelectorAll('[data-movie-card]');
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.tags,
                card.textContent
            ].join(' '));
            var matched = true;

            if (keyword && text.indexOf(keyword) === -1) {
                matched = false;
            }
            if (type && normalize(card.dataset.type) !== type) {
                matched = false;
            }
            if (region && normalize(card.dataset.region) !== region) {
                matched = false;
            }
            if (year && normalize(card.dataset.year) !== year) {
                matched = false;
            }

            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        var empty = root.querySelector('[data-empty-state]');
        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    function initFilters() {
        document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
            panel.querySelectorAll('input, select').forEach(function (control) {
                control.addEventListener('input', function () {
                    updateCards(panel);
                });
                control.addEventListener('change', function () {
                    updateCards(panel);
                });
            });
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
            var firstInput = document.querySelector('[data-filter-input]');
            if (firstInput) {
                firstInput.value = query;
                var panel = firstInput.closest('[data-filter-panel]');
                if (panel) {
                    updateCards(panel);
                }
            }
        }
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initImages() {
        document.querySelectorAll('.cover-image').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('is-hidden');
            });
        });
    }

    function startVideo(video, button) {
        var hlsUrl = video.getAttribute('data-hls');
        if (!hlsUrl) {
            return;
        }
        if (!video.dataset.ready) {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = hlsUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(hlsUrl);
                hls.attachMedia(video);
                video._hls = hls;
            } else {
                video.src = hlsUrl;
            }
            video.dataset.ready = '1';
        }
        if (button) {
            button.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    function initPlayers() {
        document.querySelectorAll('.player-shell').forEach(function (shell) {
            var video = shell.querySelector('video[data-hls]');
            var button = shell.querySelector('[data-player-start]');
            if (!video) {
                return;
            }
            if (button) {
                button.addEventListener('click', function () {
                    startVideo(video, button);
                });
            }
            video.addEventListener('click', function () {
                if (!video.dataset.ready) {
                    startVideo(video, button);
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initImages();
        initFilters();
        initPlayers();
    });
})();
