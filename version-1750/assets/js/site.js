(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    function normalize(text) {
        return String(text || '').toLowerCase().replace(/\s+/g, '');
    }

    ready(function () {
        var navToggle = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-site-nav]');
        if (navToggle && nav) {
            navToggle.addEventListener('click', function () {
                nav.classList.toggle('is-open');
            });
        }

        var hero = document.querySelector('[data-hero-slider]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
            var activeIndex = 0;
            var showSlide = function (index) {
                activeIndex = index % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('is-active', slideIndex === activeIndex);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('is-active', dotIndex === activeIndex);
                });
            };
            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    showSlide(index);
                });
            });
            if (slides.length > 1) {
                window.setInterval(function () {
                    showSlide(activeIndex + 1);
                }, 5200);
            }
        }

        var searchData = Array.isArray(window.SEARCH_DATA) ? window.SEARCH_DATA.map(function (item) {
            if (window.location.pathname.indexOf('/movies/') !== -1 || window.location.pathname.indexOf('movies/') !== -1) {
                var copy = Object.assign({}, item);
                copy.url = '../' + item.url.replace(/^\.\//, '');
                copy.cover = '../' + item.cover.replace(/^\.\//, '');
                return copy;
            }
            return item;
        }) : [];
        document.querySelectorAll('[data-site-search]').forEach(function (form) {
            var input = form.querySelector('[data-search-input]');
            var panel = form.querySelector('[data-search-results]');
            if (!input || !panel) {
                return;
            }
            var currentResults = [];
            var renderResults = function () {
                var query = normalize(input.value);
                if (!query) {
                    panel.classList.remove('is-open');
                    panel.innerHTML = '';
                    currentResults = [];
                    return;
                }
                currentResults = searchData.filter(function (item) {
                    return normalize(item.title + item.region + item.type + item.genre + item.tags).indexOf(query) !== -1;
                }).slice(0, 10);
                if (!currentResults.length) {
                    panel.innerHTML = '<div class="search-result"><span></span><span>没有找到匹配影片</span></div>';
                    panel.classList.add('is-open');
                    return;
                }
                panel.innerHTML = currentResults.map(function (item) {
                    return '<a class="search-result" href="' + item.url + '">' +
                        '<img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">' +
                        '<span><strong>' + item.title + '</strong><span>' + item.year + ' · ' + item.region + ' · ' + item.genre + '</span></span>' +
                        '</a>';
                }).join('');
                panel.classList.add('is-open');
            };
            input.addEventListener('input', renderResults);
            input.addEventListener('focus', renderResults);
            form.addEventListener('submit', function (event) {
                if (currentResults.length) {
                    event.preventDefault();
                    window.location.href = currentResults[0].url;
                }
            });
            document.addEventListener('click', function (event) {
                if (!form.contains(event.target)) {
                    panel.classList.remove('is-open');
                }
            });
        });

        document.querySelectorAll('[data-page-filter]').forEach(function (filter) {
            var scope = filter.closest('[data-filter-scope]') || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
            var empty = scope.querySelector('[data-empty-state]');
            var keywordInput = filter.querySelector('[data-filter-keyword]');
            var yearSelect = filter.querySelector('[data-filter-year]');
            var typeSelect = filter.querySelector('[data-filter-type]');
            var applyFilter = function () {
                var keyword = normalize(keywordInput ? keywordInput.value : '');
                var year = yearSelect ? yearSelect.value : '';
                var type = typeSelect ? typeSelect.value : '';
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-title') + card.getAttribute('data-region') + card.getAttribute('data-genre') + card.getAttribute('data-tags'));
                    var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchedYear = !year || card.getAttribute('data-year') === year;
                    var matchedType = !type || card.getAttribute('data-type') === type;
                    var matched = matchedKeyword && matchedYear && matchedType;
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            };
            [keywordInput, yearSelect, typeSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', applyFilter);
                    control.addEventListener('change', applyFilter);
                }
            });
        });

        var backTop = document.querySelector('[data-back-top]');
        if (backTop) {
            window.addEventListener('scroll', function () {
                backTop.classList.toggle('is-visible', window.scrollY > 520);
            });
            backTop.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    });
})();
