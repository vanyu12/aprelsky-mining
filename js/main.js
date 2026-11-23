// ===== main.js — запуск игры =====

(function () {
  Game.load();
  Game.applyOffline();
  UI.init();

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