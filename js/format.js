// ===== format.js — форматирование чисел и времени =====
// Поддерживает «короткий» формат (K/M/B/…) и научный (1.23e6).

const Fmt = {};

const SHORT_UNITS = [
  { v:1e3, s:'K' }, { v:1e6, s:'M' }, { v:1e9, s:'B' },
  { v:1e12, s:'T' }, { v:1e15, s:'Qa' }, { v:1e18, s:'Qi' },
  { v:1e21, s:'Sx' }, { v:1e24, s:'Sp' }, { v:1e27, s:'Oc' },
  { v:1e30, s:'No' }, { v:1e33, s:'Dc' },
];

// mode: 'short' | 'sci'
Fmt.num = function (n, mode) {
  if (n === Infinity) return '∞';
  if (!isFinite(n) || isNaN(n)) return '0';
  const neg = n < 0;
  n = Math.abs(n);
  let out;
  if (mode === 'sci') {
    if (n < 1000) out = Fmt._trim(n);
    else out = Fmt._sci(n);
  } else {
    if (n < 1000) out = Fmt._trim(n);
    else {
      let unit = null;
      for (const u of SHORT_UNITS) { if (n >= u.v) unit = u; else break; }
      if (!unit) out = Fmt._trim(n);
      else {
        const v = n / unit.v;
        out = (v >= 100 ? Math.floor(v) : Fmt._fix(v)) + unit.s;
      }
    }
  }
  return neg ? '−' + out : out;
};

Fmt._fix = function (v) {
  if (v >= 10) return v.toFixed(1).replace(/\.0$/, '');
  return v.toFixed(2).replace(/\.?0+$/, '');
};

Fmt._trim = function (n) {
  if (Number.isInteger(n)) return String(n);
  if (n >= 100) return String(Math.floor(n));
  if (n >= 10) return n.toFixed(1).replace(/\.0$/, '');
  return n.toFixed(2).replace(/\.?0+$/, '');
};

Fmt._sci = function (n) {
  const e = Math.floor(Math.log10(n));
  const m = n / Math.pow(10, e);
  return m.toFixed(2).replace(/\.?0+$/, '') + 'e' + e;
};

// Деньги/крипта — с текущим выбранным форматом
Fmt.compact = function (n) {
  const mode = (typeof Game !== 'undefined' && Game.S && Game.S.settings) ? Game.S.settings.numberFormat : 'short';
  return Fmt.num(n, mode);
};

// Время в формате «1ч 23м» / «12с»
Fmt.time = function (seconds) {
  seconds = Math.max(0, Math.floor(seconds));
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return d + 'д ' + h + 'ч';
  if (h > 0) return h + 'ч ' + m + 'м';
  if (m > 0) return m + 'м ' + s + 'с';
  return s + 'с';
};

// Проценты
Fmt.pct = function (x) {
  const v = Math.round(x * 100);
  return v + '%';
};