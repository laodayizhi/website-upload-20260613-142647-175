(() => {
  const video = document.querySelector('[data-player-video]');
  const button = document.querySelector('[data-player-start]');

  if (!video || !button) {
    return;
  }

  let loaded = false;
  let hlsInstance = null;

  const start = () => {
    const stream = button.getAttribute('data-stream') || video.getAttribute('data-stream');

    if (!stream) {
      return;
    }

    if (!loaded) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }

      loaded = true;
    }

    button.classList.add('is-hidden');
    video.controls = true;

    const promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(() => {});
    }
  };

  button.addEventListener('click', start);
  video.addEventListener('click', () => {
    if (!loaded || video.paused) {
      start();
    }
  });

  window.addEventListener('pagehide', () => {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
