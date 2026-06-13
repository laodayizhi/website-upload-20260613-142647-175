(function () {
    function loadVideo(video, source) {
        if (!video || !source) {
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (video.__hlsInstance) {
                video.__hlsInstance.destroy();
            }
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false
            });
            video.__hlsInstance = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play().catch(function () {});
            });
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.play().catch(function () {});
            return;
        }

        video.src = source;
        video.play().catch(function () {});
    }

    document.addEventListener('DOMContentLoaded', function () {
        var sections = Array.prototype.slice.call(document.querySelectorAll('[data-player-section]'));
        sections.forEach(function (section) {
            var video = section.querySelector('video');
            var button = section.querySelector('[data-play-button]');
            if (!video || !button) {
                return;
            }
            var source = button.getAttribute('data-src') || video.getAttribute('data-src');
            button.addEventListener('click', function () {
                section.classList.add('is-playing');
                loadVideo(video, source);
            });
            video.addEventListener('play', function () {
                section.classList.add('is-playing');
            });
        });
    });
})();
