// ===== main.js — запуск игры =====

(function () {
  Game.load();
  Game.applyOffline();
  UI.init();

  // PWA: регистрация service worker и установка приложения
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const ib = document.getElementById('installBtn');
    if (ib) ib.classList.remove('hidden');
  });
  const installBtn = document.getElementById('installBtn');
  if (installBtn) installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) { UI.toast('Установка недоступна в этом браузере', 'warn'); return; }
    deferredPrompt.prompt();
    try { await deferredPrompt.userChoice; } catch (e) {}
    deferredPrompt = null;
    installBtn.classList.add('hidden');
  });

  // Первый жест пользователя разблокирует звук в браузере
  const unlock = () => {
    Sfx.init();
    if (Sfx.ctx && Sfx.ctx.state === 'suspended') Sfx.ctx.resume().catch(() => {});
    if (Game.S && Game.S.settings.ambient) Sfx.setAmbient(true);
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);

  // Игровой цикл ~10 тиков/с
  let last = Date.now();
  let frames = 0;
  setInterval(() => {
    const now = Date.now();
    const dt = Math.min(5, (now - last) / 1000);
    last = now;
    Game.tick(dt);
    Game.save();
    UI.updateDynamic();
    if ((++frames % 10) === 0) UI.renderView();
  }, 100);

  // Доп. автосохранение
  setInterval(() => Game.save(), 15000);
  window.addEventListener('beforeunload', () => Game.save());
})();