(function () {
    function toggleNavigation() {
        var button = document.querySelector('[data-nav-toggle]');
        if (!button) {
            return;
        }
        button.addEventListener('click', function () {
            document.body.classList.toggle('is-nav-open');
        });
    }

    function setupBackTop() {
        var button = document.querySelector('[data-back-top]');
        if (!button) {
            return;
        }
        window.addEventListener('scroll', function () {
            button.classList.toggle('is-visible', window.scrollY > 500);
        });
        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero || !window.HERO_MOVIES || !window.HERO_MOVIES.length) {
            return;
        }
        var title = hero.querySelector('[data-hero-title]');
        var desc = hero.querySelector('[data-hero-desc]');
        var link = hero.querySelector('[data-hero-link]');
        var image = hero.querySelector('[data-hero-image]');
        var panelTitle = hero.querySelector('[data-hero-panel-title]');
        var panelDesc = hero.querySelector('[data-hero-panel-desc]');
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function render(index) {
            current = index;
            var item = window.HERO_MOVIES[index];
            hero.style.setProperty('--hero-image', 'url("' + item.cover + '")');
            title.textContent = item.title;
            desc.textContent = item.oneLine;
            link.setAttribute('href', item.url);
            image.setAttribute('src', item.cover);
            image.setAttribute('alt', item.title);
            panelTitle.textContent = item.title;
            panelDesc.textContent = item.meta;
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                render(index);
            });
        });

        render(0);
        window.setInterval(function () {
            render((current + 1) % window.HERO_MOVIES.length);
        }, 5200);
    }

    function setupGlobalSearch() {
        var input = document.querySelector('[data-global-search]');
        var results = document.querySelector('[data-global-results]');
        if (!input || !results || !window.MOVIE_INDEX) {
            return;
        }

        function renderResults(query) {
            var text = query.trim().toLowerCase();
            if (!text) {
                results.classList.remove('is-visible');
                results.innerHTML = '';
                return;
            }
            var matches = window.MOVIE_INDEX.filter(function (item) {
                return item.searchText.indexOf(text) !== -1;
            }).slice(0, 18);
            results.innerHTML = matches.map(function (item) {
                return '<a class="search-result-item" href="' + item.url + '">' +
                    '<img src="' + item.cover + '" alt="' + item.title + '">' +
                    '<span><strong>' + item.title + '</strong><br>' +
                    '<small>' + item.year + ' · ' + item.region + ' · ' + item.type + '</small></span>' +
                    '</a>';
            }).join('');
            results.classList.toggle('is-visible', matches.length > 0);
        }

        input.addEventListener('input', function () {
            renderResults(input.value);
        });
    }

    function setupLocalFilter() {
        var filter = document.querySelector('[data-filter]');
        if (!filter) {
            return;
        }
        var input = filter.querySelector('[data-filter-search]');
        var year = filter.querySelector('[data-filter-year]');
        var type = filter.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var empty = document.querySelector('[data-empty]');

        function applyFilter() {
            var query = input ? input.value.trim().toLowerCase() : '';
            var yearValue = year ? year.value : '';
            var typeValue = type ? type.value : '';
            var visibleCount = 0;

            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-type') || '',
                    card.getAttribute('data-tags') || ''
                ].join(' ').toLowerCase();
                var isVisible = true;
                if (query && haystack.indexOf(query) === -1) {
                    isVisible = false;
                }
                if (yearValue && card.getAttribute('data-year') !== yearValue) {
                    isVisible = false;
                }
                if (typeValue && card.getAttribute('data-type') !== typeValue) {
                    isVisible = false;
                }
                card.style.display = isVisible ? '' : 'none';
                if (isVisible) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visibleCount === 0);
            }
        }

        [input, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        toggleNavigation();
        setupBackTop();
        setupHero();
        setupGlobalSearch();
        setupLocalFilter();
    });
})();
