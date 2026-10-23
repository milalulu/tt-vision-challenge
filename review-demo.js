(() => {
  const a = document.getElementById('angle-a');
  const b = document.getElementById('angle-b');
  const videos = [a, b];
  const play = document.getElementById('demo-play');
  const slider = document.getElementById('demo-position');
  const clock = document.getElementById('demo-time');
  const status = document.getElementById('demo-status');
  const fps = 30, lastFrame = 120;
  let running = false, pending = false, generation = 0, animation = 0;
  const description = '3D-пример: один эпизод с двух ракурсов. Управляйте кнопками под видео.';
  const sources = new WeakMap();

  // Static hosting may ignore HTTP Range. Small complete blobs make frame seeking
  // reliable in every browser; requests begin only after a visitor interacts.
  function prepare(video) {
    if (sources.has(video)) return sources.get(video);
    const source = video.dataset.originalSource || video.getAttribute('src');
    video.dataset.originalSource = source;
    const task = (async () => {
      const response = await fetch(source, { signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error('Video unavailable');
      const blob = await response.blob();
      video.src = URL.createObjectURL(blob);
      video.preload = 'auto';
      video.load();
      await ready(video);
    })().catch(error => { sources.delete(video); throw error; });
    sources.set(video, task);
    return task;
  }

  function renderTime(time = a.currentTime) {
    const frame = Math.max(0, Math.min(lastFrame, Math.round(time * fps)));
    slider.value = String(frame);
    clock.textContent = `00:${String(Math.floor(frame / fps)).padStart(2, '0')}.${String(Math.round((frame % fps) * 1000 / fps)).padStart(3, '0')}`;
    slider.setAttribute('aria-valuetext', `Кадр ${frame + 1} из ${lastFrame + 1}`);
  }
  function pause() {
    generation++;
    running = pending = false;
    cancelAnimationFrame(animation);
    videos.forEach(video => video.pause());
    play.textContent = a.currentTime >= lastFrame / fps ? 'Сначала' : 'Воспроизвести';
    play.setAttribute('aria-pressed', 'false');
    renderTime();
  }
  function ready(video) {
    if (video.readyState >= 3) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => finish(new Error('timeout')), 12000);
      const check = () => { if (video.readyState >= 3) finish(); };
      const failed = () => finish(new Error('media'));
      function finish(error) {
        clearTimeout(timer);
        video.removeEventListener('canplay', check);
        video.removeEventListener('error', failed);
        error ? reject(error) : resolve();
      }
      video.addEventListener('canplay', check);
      video.addEventListener('error', failed);
      video.preload = 'auto';
      if (video.networkState === HTMLMediaElement.NETWORK_EMPTY) video.load();
      check();
    });
  }
  function tick() {
    if (!running) return;
    if (a.currentTime >= lastFrame / fps) {
      pause(); videos.forEach(video => { video.currentTime = lastFrame / fps; });
      renderTime(lastFrame / fps); play.textContent = 'Сначала'; return;
    }
    if (!b.seeking && Math.abs(a.currentTime - b.currentTime) > 0.065) b.currentTime = a.currentTime;
    renderTime(); animation = requestAnimationFrame(tick);
  }
  async function start() {
    const request = ++generation;
    pending = true;
    play.textContent = 'Отменить загрузку';
    status.textContent = 'Подготавливаем оба ракурса…';
    try {
      await Promise.all(videos.map(prepare));
      await Promise.all(videos.map(ready));
      if (request !== generation) return;
      if (a.currentTime >= lastFrame / fps) a.currentTime = 0;
      b.currentTime = a.currentTime;
      // Both elements have the same episode, frame count and playback rate.
      running = true;
      await Promise.all(videos.map(video => video.play()));
      if (request !== generation) { videos.forEach(video => video.pause()); return; }
      pending = false;
      play.textContent = 'Пауза'; play.setAttribute('aria-pressed', 'true');
      status.textContent = description;
      animation = requestAnimationFrame(tick);
    } catch {
      if (request !== generation) return;
      pause(); status.textContent = 'Не удалось загрузить видео. Проверьте соединение и нажмите «Воспроизвести» ещё раз.';
    }
  }
  async function seek(frame) {
    pause();
    const request = ++generation;
    const time = Math.max(0, Math.min(lastFrame, frame)) / fps;
    renderTime(time);
    try {
      await Promise.all(videos.map(prepare));
      if (request !== generation) return;
      videos.forEach(video => { video.currentTime = time; });
      play.textContent = time >= lastFrame / fps ? 'Сначала' : 'Воспроизвести';
      status.textContent = description;
    } catch {
      if (request !== generation) return;
      status.textContent = 'Не удалось загрузить эпизод. Проверьте соединение и повторите попытку.';
    }
  }
  play.addEventListener('click', () => {
    if (running || pending) { pause(); status.textContent = description; }
    else start();
  });
  document.getElementById('demo-prev').addEventListener('click', () => seek(Number(slider.value) - 1));
  document.getElementById('demo-next').addEventListener('click', () => seek(Number(slider.value) + 1));
  slider.addEventListener('input', () => seek(Number(slider.value)));
  document.getElementById('demo-speed').addEventListener('change', event => {
    videos.forEach(video => { video.playbackRate = Number(event.target.value); });
  });
  videos.forEach(video => {
    video.addEventListener('ended', () => seek(lastFrame));
    video.addEventListener('error', () => {
      pause(); status.textContent = 'Видео пока недоступно. Попробуйте воспроизвести его ещё раз после восстановления связи.';
    });
    video.addEventListener('waiting', () => {
      if (!running || pending) return;
      pause(); start();
    });
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });

  const stage = document.getElementById('image-link');
  const controls = document.querySelector('.demo-controls');
  const stageHome = document.createComment('Review stage');
  const controlsHome = document.createComment('Review controls');
  stage.before(stageHome); controls.before(controlsHome);
  const dialog = document.getElementById('image-dialog');
  document.getElementById('full-image').addEventListener('click', event => {
    event.preventDefault();
    dialog.querySelector('.dialog-scroll').append(stage);
    dialog.querySelector('.dialog-controls').append(controls);
    dialog.showModal();
  });
  document.getElementById('close-image').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { stageHome.after(stage); controlsHome.after(controls); });
  const film = document.getElementById('film-dialog');
  const promo = document.getElementById('promo-video');
  document.querySelector('.film-open').addEventListener('click', async () => {
    pause(); film.showModal();
    try { await prepare(promo); film.querySelector('.film-status').textContent = ''; if (film.open) await promo.play(); }
    catch { film.querySelector('.film-status').textContent = 'Не удалось загрузить ролик. Закройте окно и попробуйте ещё раз.'; }
  });
  document.getElementById('close-film').addEventListener('click', () => film.close());
  film.addEventListener('close', () => promo.pause());
  for (const modal of [dialog, film]) {
    modal.addEventListener('click', event => {
      const rect = modal.getBoundingClientRect();
      if (event.target === modal && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) modal.close();
    });
  }
  renderTime();
})();
