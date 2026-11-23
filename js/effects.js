// ===== effects.js — лёгкие частицы на фоне (цифровая пыль) =====
// Рисует на canvas#bg, не мешает кликам, экономно по ресурсам.

(function () {
  const canvas = document.getElementById('bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1, parts = [], raf = 0;

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function init() {
    parts = [];
    const n = Math.min(70, Math.round((w * h) / 24000));
    for (let i = 0; i < n; i++) {
      parts.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        vy: -(Math.random() * 0.25 + 0.05),
        vx: (Math.random() - 0.5) * 0.12,
        a: Math.random() * 0.5 + 0.2,
        hue: Math.random() < 0.5 ? 190 : 265,
        ph: Math.random() * Math.PI * 2,
      });
    }
  }

  function draw(t) {
    if (!w) return;
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -12) { p.y = h + 12; p.x = Math.random() * w; }
      if (p.x < -12) p.x = w + 12;
      if (p.x > w + 12) p.x = -12;
      const tw = 0.6 + 0.4 * Math.sin((t || 0) / 900 + p.ph);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(' + p.hue + ', 90%, 66%, ' + (p.a * tw) + ')';
      ctx.fill();
    }
    raf = requestAnimationFrame(draw);
  }

  function start() { if (!raf) raf = requestAnimationFrame(draw); }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  window.addEventListener('resize', function () { resize(); init(); });
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });

  resize(); init(); start();
})();