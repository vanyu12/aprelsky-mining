// ===== systems.js — состояние, экономика, апгрейды, престиж, достижения, квесты, события =====

const SAVE_KEY_V3 = 'aprelsky-mining-save-v3';
const SAVE_KEY_V2 = 'aprelsky-mining-save-v2';
const BASE_RATE = 0.5;
const OFFLINE_CAP_H = 8;
const OFFLINE_BASE = 0.5;
const GRID_COLS = 4;
const GRID_ROWS = 3;
const CELLS = GRID_COLS * GRID_ROWS;

const Game = {};
Game.S = null;

// ---- Состояние по умолчанию ----
Game.defaultState = function () {
  const cells = [];
  for (let i = 0; i < CELLS; i++) cells.push(null);
  const upgrades = {};
  for (const u of DATA.UPGRADES) upgrades[u.key] = 0;
  const perm = {};
  for (const p of DATA.PERM) perm[p.key] = 0;
  return {
    v: 3,
    money: 300,
    crypto: 0,
    cells,
    autoSell: false,
    upgrades,
    perm,
    crystals: 0,
    prestigeCount: 0,
    stats: {
      totalEarned: 0, runEarned: 0, totalCrypto: 0,
      gpusBought: 0, formsBought: 0, coolersBought: 0,
      purchases: 0, questsDone: 0, eventsStarted: 0, offlineCollected: 0,
      clicks: 0, playTime: 0, startedAt: Date.now(),
    },
    achievements: {},
    research: {},
    quests: { active: DATA.QUESTS.slice(0, 3).map(function (q) { return q.id; }), prog: {}, done: {} },
    dailyQuests: { day: '', prog: {}, done: {}, active: [] },
    events: [],
    settings: { sound: true, numberFormat: 'short', theme: 'dark', ambient: false },
    lastTick: Date.now(),
    offlinePending: 0,
    collected: 0,
    daily: { lastClaim: 0, streak: 0 },
    boostUntil: 0,
    boostCdUntil: 0,
    autoBuy: false,
    _autoBuyAt: 0,
  };
};

// ---- Загрузка/сохранение ----
Game.load = function () {
  try {
    let raw = localStorage.getItem(SAVE_KEY_V3);
    if (!raw) {
      const old = localStorage.getItem(SAVE_KEY_V2);
      if (old) { Game.S = Game._migrate(JSON.parse(old)); Game.S.lastTick = Date.now(); Game._sanitize(); Game._initQuests(); Game._initDailyQuests(); Game.save(); return true; }
    }
    if (raw) {
      const p = JSON.parse(raw);
      Game.S = Game._merge(Game.defaultState(), p);
      if (!Array.isArray(Game.S.cells) || Game.S.cells.length !== CELLS) Game.S.cells = Game.defaultState().cells;
      Game.S.lastTick = Date.now();
      Game._sanitize();
      Game._initQuests(); Game._initDailyQuests();
      return true;
    }
  } catch (e) { /* повреждённый сейв — пересоздаём */ }
  Game.S = Game.defaultState();
  Game._initQuests(); Game._initDailyQuests();
  Game.save();
  return false;
};

Game._merge = function (base, src) {
  const out = base;
  for (const k of Object.keys(src)) {
    if (k === 'upgrades' || k === 'perm' || k === 'stats' || k === 'settings' || k === 'achievements' || k === 'quests' || k === 'daily' || k === 'research' || k === 'dailyQuests') {
      out[k] = Object.assign(out[k] || {}, src[k] || {});
    } else {
      out[k] = src[k];
    }
  }
  out.v = 3;
  if (!out.quests || typeof out.quests !== 'object') out.quests = { active: [], prog: {}, done: {} };
  if (!Array.isArray(out.events)) out.events = [];
  return out;
};

Game._migrate = function (old) {
  const s = Game.defaultState();
  if (typeof old.money === 'number') s.money = old.money;
  if (typeof old.crypto === 'number') s.crypto = old.crypto;
  if (Array.isArray(old.cells)) s.cells = old.cells.slice(0, CELLS);
  while (s.cells.length < CELLS) s.cells.push(null);
  s.autoSell = !!old.autoSell;
  return s;
};

// Приводит ячейки к валидным ключам новой модели (миграция со старых сейвов)
Game._sanitize = function () {
  const alias = { gpu1:'gpu01', gpu2:'gpu02', gpu3:'gpu03', gpu4:'gpu04', gpu5:'gpu05' };
  const gpuKeys = new Set(DATA.GPUS.map(g => g.key));
  const coolKeys = new Set(DATA.COOLERS.map(c => c.key));
  Game.S.cells = Game.S.cells.map(function (c) {
    if (!c || typeof c !== 'object') return null;
    if (c.kind === 'form') {
      let g = c.gpu;
      if (g) { if (alias[g]) g = alias[g]; if (!gpuKeys.has(g)) g = null; }
      return { kind: 'form', gpu: g || null };
    }
    if (c.kind === 'cooler') {
      return (c.tier && coolKeys.has(c.tier)) ? { kind: 'cooler', tier: c.tier } : null;
    }
    return null;
  });
};

Game.save = function () {
  try { localStorage.setItem(SAVE_KEY_V3, JSON.stringify(Game.S)); } catch (e) {}
};

Game.exportSave = function () {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify(Game.S)))); } catch (e) { return ''; }
};

Game.importSave = function (str) {
  try {
    const json = decodeURIComponent(escape(atob(str.trim())));
    const p = JSON.parse(json);
    Game.S = Game._merge(Game.defaultState(), p);
    if (!Array.isArray(Game.S.cells) || Game.S.cells.length !== CELLS) Game.S.cells = Game.defaultState().cells;
    Game.S.lastTick = Date.now();
    Game._sanitize();
    Game._initQuests(); Game._initDailyQuests();
    Game.save();
    return true;
  } catch (e) { return false; }
};

Game.reset = function () {
  try { localStorage.removeItem(SAVE_KEY_V3); localStorage.removeItem(SAVE_KEY_V2); } catch (e) {}
  Game.S = Game.defaultState();
  Game._initQuests(); Game._initDailyQuests();
  Game.save();
};

// ---- Подсчёты ----
Game.countForms = function () { return Game.S.cells.filter(c => c && c.kind === 'form').length; };
Game.emptyForms = function () { return Game.S.cells.filter(c => c && c.kind === 'form' && !c.gpu).length; };
Game.countCoolers = function () { return Game.S.cells.filter(c => c && c.kind === 'cooler').length; };
Game.countGpus = function () { return Game.S.cells.filter(c => c && c.kind === 'form' && c.gpu).length; };
Game.emptyCells = function () { return Game.S.cells.reduce((n, c) => n + (c ? 0 : 1), 0); };
Game.filledCells = function () { return Game.S.cells.reduce((n, c) => n + (c ? 1 : 0), 0); };
Game.gpuCount = function (key) { return Game.S.cells.filter(c => c && c.kind === 'form' && c.gpu === key).length; };
Game.coolerCount = function (key) { return Game.S.cells.filter(c => c && c.kind === 'cooler' && c.tier === key).length; };

// ---- Множители (обобщённые по kind) ----
Game.mult = function (kind) {
  let add = 0;
  for (const u of DATA.UPGRADES) { if (u.kind === kind) add += u.effect * (Game.S.upgrades[u.key] || 0); }
  for (const p of DATA.PERM) { if (p.key === kind) add += p.effect * (Game.S.perm[p.key] || 0); }
  for (const r of DATA.RESEARCH) { if (r.kind === kind) add += r.effect * (Game.S.research[r.id] || 0); }
  return add;
};
Game.hashMult = function () { return 1 + Game.mult('hash'); };
Game.coolMult = function () { return 1 + Game.mult('cool'); };
Game.rateValue = function () { return (BASE_RATE + Game.mult('rate')) * Game.eventMult('rate'); };
Game.priceMult = function () { return Math.max(0.2, 1 - Game.mult('price')); };
Game.offlineEff = function () { return Math.min(0.95, OFFLINE_BASE + Game.mult('offline')); };
Game.startMoney = function () { return 300 + Game.mult('start'); };

// ---- Экономика ----
Game.baseHashrate = function () {
  let h = 0;
  for (const g of DATA.GPUS) h += g.hr * Game.gpuCount(g.key);
  return h;
};
Game.totalHashrate = function () { return Game.baseHashrate() * Game.hashMult(); };

Game.totalHeat = function () {
  let ht = 0;
  for (const g of DATA.GPUS) ht += g.heat * Game.gpuCount(g.key);
  return ht;
};
Game.totalCooling = function () {
  let c = 0;
  for (const k of DATA.COOLERS) c += k.cool * Game.coolerCount(k.key);
  return c * Game.coolMult() * Game.eventMult('cool');
};

Game.coolingRatio = function () {
  const heat = Game.totalHeat();
  if (heat <= 0) return 1;
  return Game.totalCooling() / heat;
};
Game.efficiency = function () {
  const r = Game.coolingRatio();
  if (r >= 1) return 1;
  return 0.25 + 0.75 * r;
};
Game.effectiveHashrate = function () { return Game.totalHashrate() * Game.efficiency() * Game.eventMult('hash') * Game.boostMult(); };
Game.cps = function () { return Game.effectiveHashrate(); };

// ---- Цены ----
Game.formPrice = function () {
  return Math.floor(DATA.FORM.base * Math.pow(DATA.FORM.grow, Game.countForms()) * Game.priceMult());
};
Game.gpuPrice = function (key) {
  const g = DATA.GPUS.find(x => x.key === key); if (!g) return Infinity;
  return Math.floor(g.base * Math.pow(g.grow, Game.gpuCount(key)) * Game.priceMult());
};
Game.coolerPrice = function (key) {
  const c = DATA.COOLERS.find(x => x.key === key); if (!c) return Infinity;
  return Math.floor(c.base * Math.pow(c.grow, Game.coolerCount(key)) * Game.priceMult());
};
Game.upgradePrice = function (key) {
  const u = DATA.UPGRADES.find(x => x.key === key); if (!u) return Infinity;
  return Math.floor(u.base * Math.pow(u.grow, Game.S.upgrades[key] || 0));
};
Game.permPrice = function (key) {
  const p = DATA.PERM.find(x => x.key === key); if (!p) return Infinity;
  return Math.floor(p.base * Math.pow(p.grow, Game.S.perm[key] || 0));
};

// ---- Покупки ----
Game.buyForm = function () {
  if (Game.emptyCells() <= 0) return { ok: false, reason: 'no-space' };
  const price = Game.formPrice();
  if (Game.S.money < price) return { ok: false, reason: 'no-money' };
  Game.S.money -= price;
  const i = Game.S.cells.findIndex(c => !c);
  Game.S.cells[i] = { kind: 'form', gpu: null };
  Game.S.stats.formsBought++;
  Game._afterBuy('form');
  return { ok: true };
};

Game.buyGpu = function (key) {
  if (Game.emptyForms() <= 0) return { ok: false, reason: 'no-form' };
  const price = Game.gpuPrice(key);
  if (Game.S.money < price) return { ok: false, reason: 'no-money' };
  Game.S.money -= price;
  const i = Game.S.cells.findIndex(c => c && c.kind === 'form' && !c.gpu);
  Game.S.cells[i].gpu = key;
  Game.S.stats.gpusBought++;
  Game._afterBuy('gpu');
  return { ok: true };
};

Game.buyCooler = function (key) {
  if (Game.emptyCells() <= 0) return { ok: false, reason: 'no-space' };
  const price = Game.coolerPrice(key);
  if (Game.S.money < price) return { ok: false, reason: 'no-money' };
  Game.S.money -= price;
  const i = Game.S.cells.findIndex(c => !c);
  Game.S.cells[i] = { kind: 'cooler', tier: key };
  Game.S.stats.coolersBought++;
  Game._afterBuy('cooler');
  return { ok: true };
};

Game.buyUpgrade = function (key) {
  const u = DATA.UPGRADES.find(x => x.key === key); if (!u) return { ok: false, reason: 'bad' };
  const lvl = Game.S.upgrades[key] || 0;
  if (lvl >= u.max) return { ok: false, reason: 'maxed' };
  const price = Game.upgradePrice(key);
  if (Game.S.money < price) return { ok: false, reason: 'no-money' };
  Game.S.money -= price;
  Game.S.upgrades[key] = lvl + 1;
  Game._afterBuy('upgrade');
  return { ok: true };
};

Game.buyPerm = function (key) {
  const p = DATA.PERM.find(x => x.key === key); if (!p) return { ok: false, reason: 'bad' };
  const lvl = Game.S.perm[key] || 0;
  if (lvl >= p.max) return { ok: false, reason: 'maxed' };
  const price = Game.permPrice(key);
  if (Game.S.crystals < price) return { ok: false, reason: 'no-money' };
  Game.S.crystals -= price;
  Game.S.perm[key] = lvl + 1;
  Game._afterBuy('perm');
  return { ok: true };
};

Game._afterBuy = function (kind) {
  const map = { form: 'buyForm', gpu: 'buyGpu', cooler: 'buyCooler', upgrade: 'buyUpgrade' };
  if (map[kind]) {
    Game.S.stats.purchases = (Game.S.stats.purchases || 0) + 1;
    Game.questProgress(map[kind], 1);
  }
  if (typeof Sfx !== 'undefined' && Game.S.settings.sound) Sfx.play('buy');
  Game.save();
};

// ---- Обмен ----
Game.sellCrypto = function () {
  const gained = Game.S.crypto * Game.rateValue();
  if (gained <= 0) return 0;
  Game.S.money += gained;
  Game.S.stats.totalEarned += gained;
  Game.S.stats.runEarned += gained;
  Game.S.crypto = 0;
  Game.questProgress('earnMoney', gained);
  if (typeof Sfx !== 'undefined' && Game.S.settings.sound) Sfx.play('sell');
  Game.save();
  return gained;
};

// ---- Тик ----
Game.tick = function (dtSec) {
  Game._initDailyQuests();
  const rate = Game.cps();
  const gainedCrypto = rate * dtSec;
  Game.S.crypto += gainedCrypto;
  Game.S.stats.totalCrypto += gainedCrypto;
  Game.S.collected += gainedCrypto;
  Game.questProgress('mineCrypto', gainedCrypto);
  if (Game.S.autoSell && Game.S.crypto > 0) {
    const money = Game.S.crypto * Game.rateValue();
    Game.S.money += money;
    Game.S.stats.totalEarned += money;
    Game.S.stats.runEarned += money;
    Game.S.crypto = 0;
    Game.questProgress('earnMoney', money);
  }
  Game.S.stats.playTime += dtSec;
  if (Game.S.autoBuy) {
    const now = Date.now();
    if (now - (Game.S._autoBuyAt || 0) > 1000) { Game.S._autoBuyAt = now; Game._autoBuyStep(); }
  }
  Game.checkAchievements();
  return gainedCrypto;
};

// ---- Офлайн ----
Game.offlineHours = function () { return OFFLINE_CAP_H; };
Game.applyOffline = function () {
  const now = Date.now();
  const sec = Math.min((now - Game.S.lastTick) / 1000, OFFLINE_CAP_H * 3600);
  if (sec > 30) Game.S.offlinePending = Math.floor(Game.cps() * sec * Game.offlineEff());
  Game.S.lastTick = now;
  return Game.S.offlinePending;
};
Game.collectOffline = function () {
  const v = Game.S.offlinePending;
  if (v > 0) {
    Game.S.crypto += v;
    Game.S.stats.totalCrypto += v;
    Game.S.stats.offlineCollected = (Game.S.stats.offlineCollected || 0) + 1;
    Game.S.offlinePending = 0;
    Game.questProgress('collectOffline', 1);
    if (typeof Sfx !== 'undefined' && Game.S.settings.sound) Sfx.play('offline');
    Game.save();
  }
  return v;
};

// ---- Престиж ----
Game.prestigeGain = function () {
  if (Game.S.stats.runEarned < 1e6) return 0;
  return Math.floor(Math.pow(Game.S.stats.runEarned / 1e6, 0.5));
};
Game.canPrestige = function () { return Game.prestigeGain() >= 1; };

Game.doPrestige = function () {
  const gain = Game.prestigeGain();
  if (gain < 1) return 0;
  Game.S.crystals += gain;
  Game.S.prestigeCount++;
  Game.S.cells = Game.defaultState().cells;
  Game.S.money = Game.startMoney();
  Game.S.crypto = 0;
  Game.S.upgrades = {};
  for (const u of DATA.UPGRADES) Game.S.upgrades[u.key] = 0;
  Game.S.events = [];
  Game.S.stats.runEarned = 0;
  Game.questProgress('prestige', 1);
  if (typeof Sfx !== 'undefined' && Game.S.settings.sound) Sfx.play('prestige');
  Game.checkAchievements();
  Game.save();
  return gain;
};

// ---- Квесты ----
Game._initQuests = function () {
  if (!Game.S.quests || typeof Game.S.quests !== 'object') Game.S.quests = { active: [], prog: {}, done: {} };
  const q = Game.S.quests;
  if (!Array.isArray(q.active)) q.active = [];
  if (!q.prog) q.prog = {};
  if (!q.done) q.done = {};
  q.active = q.active.filter(function (id) { return DATA.QUESTS.some(function (x) { return x.id === id; }) && !q.done[id]; });
  while (q.active.length < 3) {
    const next = DATA.QUESTS.find(function (x) { return !q.done[x.id] && q.active.indexOf(x.id) === -1; });
    if (!next) break;
    q.active.push(next.id);
  }
};
Game.questById = function (id) { return DATA.QUESTS.find(function (x) { return x.id === id; }); };
Game.questProgress = function (type, amount) {
  const qs = Game.S.quests; if (!qs || !Array.isArray(qs.active)) return;
  for (const id of qs.active) {
    const q = Game.questById(id); if (!q || q.type !== type || qs.done[id]) continue;
    qs.prog[id] = (qs.prog[id] || 0) + amount;
  }
  Game._dailyProgress(type, amount);
};
Game.questReady = function (id) {
  const q = Game.questById(id); if (!q) return false;
  return (Game.S.quests.prog[id] || 0) >= q.target;
};
Game.claimQuest = function (id) {
  const qs = Game.S.quests; const q = Game.questById(id);
  if (!q || qs.done[id] || qs.active.indexOf(id) === -1) return null;
  if ((qs.prog[id] || 0) < q.target) return null;
  if (q.reward.money) { Game.S.money += q.reward.money; Game.S.stats.totalEarned += q.reward.money; Game.S.stats.runEarned += q.reward.money; }
  if (q.reward.crystals) Game.S.crystals += q.reward.crystals;
  qs.done[id] = true;
  Game.S.stats.questsDone = (Game.S.stats.questsDone || 0) + 1;
  qs.active = qs.active.filter(function (x) { return x !== id; });
  Game._initQuests(); Game._initDailyQuests();
  if (typeof Sfx !== 'undefined' && Game.S.settings.sound) Sfx.play('achievement');
  Game.checkAchievements();
  Game.save();
  return q.reward;
};

// ---- Ежедневные задания ----
Game._dailyKey = function () {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + day;
};
Game._pickDaily = function (dayKey) {
  let seed = 0;
  for (let i = 0; i < dayKey.length; i++) seed = (seed * 31 + dayKey.charCodeAt(i)) >>> 0;
  const idxs = DATA.DAILY.map(function (_, i) { return i; });
  for (let i = idxs.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const j = seed % (i + 1);
    const t = idxs[i]; idxs[i] = idxs[j]; idxs[j] = t;
  }
  return idxs.slice(0, 3).map(function (i) { return DATA.DAILY[i].id; });
};
Game._initDailyQuests = function () {
  const today = Game._dailyKey();
  if (!Game.S.dailyQuests || typeof Game.S.dailyQuests !== 'object') Game.S.dailyQuests = { day: '', prog: {}, done: {}, active: [] };
  if (Game.S.dailyQuests.day !== today) {
    Game.S.dailyQuests = { day: today, prog: {}, done: {}, active: Game._pickDaily(today) };
  }
  if (!Array.isArray(Game.S.dailyQuests.active) || Game.S.dailyQuests.active.length !== 3) {
    Game.S.dailyQuests.active = Game._pickDaily(today);
  }
};
Game.dailyQuestById = function (id) { return DATA.DAILY.find(function (x) { return x.id === id; }); };
Game._dailyProgress = function (type, amount) {
  const q = Game.S.dailyQuests; if (!q || !Array.isArray(q.active)) return;
  for (const id of q.active) {
    const d = Game.dailyQuestById(id); if (!d || d.type !== type || q.done[id]) continue;
    q.prog[id] = (q.prog[id] || 0) + amount;
  }
};
Game.claimDailyQuest = function (id) {
  const q = Game.S.dailyQuests; const d = Game.dailyQuestById(id);
  if (!d || !q || q.done[id] || q.active.indexOf(id) === -1) return null;
  if ((q.prog[id] || 0) < d.target) return null;
  if (d.reward.money) { Game.S.money += d.reward.money; Game.S.stats.totalEarned += d.reward.money; Game.S.stats.runEarned += d.reward.money; }
  if (d.reward.crystals) Game.S.crystals += d.reward.crystals;
  q.done[id] = true;
  Game.checkAchievements(); Game.save();
  return d.reward;
};
Game.dailyResetIn = function () {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  return next.getTime() - now.getTime();
};

// ---- События ----
Game.pruneEvents = function () {
  const now = Date.now();
  Game.S.events = (Game.S.events || []).filter(function (e) { return e.endsAt > now; });
};
Game.eventMult = function (kind) {
  const evs = Game.S.events || [];
  const now = Date.now();
  let m = 1;
  for (const e of evs) { if (e.endsAt > now && (e.kind === kind || e.kind === 'all')) m *= (1 + e.mult); }
  return m;
};
Game.startEvent = function (id) {
  let ev = id ? DATA.EVENTS.find(function (x) { return x.id === id; }) : null;
  if (!ev) ev = DATA.EVENTS[Math.floor(Math.random() * DATA.EVENTS.length)];
  if (!ev) return null;
  Game.pruneEvents();
  Game.S.events.push({ id: ev.id, name: ev.name, kind: ev.kind, mult: ev.mult, endsAt: Date.now() + ev.dur * 1000 });
  Game.S.stats.eventsStarted = (Game.S.stats.eventsStarted || 0) + 1;
  if (typeof Sfx !== 'undefined' && Game.S.settings.sound) Sfx.play('offline');
  Game.checkAchievements();
  Game.save();
  return ev;
};
Game.randomEvent = function () { return Game.startEvent(null); };
Game.activeEvents = function () { Game.pruneEvents(); return Game.S.events; };

// ---- Буст ----
Game.boostMult = function () { return Date.now() < (Game.S.boostUntil || 0) ? 2 : 1; };
Game.boostRemaining = function () { return Math.max(0, Math.ceil(((Game.S.boostUntil || 0) - Date.now()) / 1000)); };
Game.boostCdRemaining = function () { return Math.max(0, Math.ceil(((Game.S.boostCdUntil || 0) - Date.now()) / 1000)); };
Game.startBoost = function () {
  const now = Date.now();
  if (now < (Game.S.boostCdUntil || 0)) return { ok: false, reason: 'cooldown' };
  Game.S.boostUntil = now + 60000;
  Game.S.boostCdUntil = now + 300000;
  if (typeof Sfx !== 'undefined' && Game.S.settings.sound) Sfx.play('prestige');
  Game.save();
  return { ok: true };
};

// ---- Ежедневная награда ----
Game.DAILY_MS = 24 * 3600 * 1000;
Game.dailyAvailable = function () {
  const last = (Game.S.daily && Game.S.daily.lastClaim) || 0;
  return Date.now() - last >= Game.DAILY_MS;
};
Game.dailyPreview = function () {
  const d = Game.S.daily || { lastClaim: 0, streak: 0 };
  const next = (d.lastClaim && (Date.now() - d.lastClaim) <= 2 * Game.DAILY_MS) ? (d.streak || 0) + 1 : 1;
  return { streak: next, money: 1000 + (next - 1) * 500, crystals: (next % 7 === 0) ? 5 : 0 };
};
Game.claimDaily = function () {
  if (!Game.dailyAvailable()) return null;
  const p = Game.dailyPreview();
  Game.S.daily = { lastClaim: Date.now(), streak: p.streak };
  Game.S.money += p.money;
  Game.S.stats.totalEarned += p.money;
  Game.S.stats.runEarned += p.money;
  if (p.crystals) Game.S.crystals += p.crystals;
  if (typeof Sfx !== 'undefined' && Game.S.settings.sound) Sfx.play('achievement');
  Game.checkAchievements();
  Game.save();
  return p;
};

// ---- Авто-скупка ----
Game._autoBuyStep = function () {
  if (Game.totalHeat() > 0 && Game.coolingRatio() < 1 && Game.emptyCells() > 0) {
    for (const c of DATA.COOLERS) { const pr = Game.coolerPrice(c.key); if (Game.S.money >= pr) { Game.buyCooler(c.key); return true; } }
  }
  if (Game.emptyForms() > 0) {
    for (const g of DATA.GPUS) { const pr = Game.gpuPrice(g.key); if (Game.S.money >= pr) { Game.buyGpu(g.key); return true; } }
  }
  if (Game.emptyCells() > 0) {
    if (Game.S.money >= Game.formPrice()) { Game.buyForm(); return true; }
  }
  return false;
};

// ---- Лаборатория ----
Game.researchLevel = function (id) { return Game.S.research[id] || 0; };
Game.researchLevels = function () { let n = 0; for (const k of Object.keys(Game.S.research)) n += Game.S.research[k] || 0; return n; };
Game.researchById = function (id) { return DATA.RESEARCH.find(function (r) { return r.id === id; }); };
Game.researchCost = function (id) {
  const r = Game.researchById(id); if (!r) return { money: 0, crystals: 0 };
  const lvl = Game.researchLevel(id);
  return {
    money: r.money ? Math.floor(r.money * Math.pow(r.grow, lvl)) : 0,
    crystals: r.crystals ? Math.floor(r.crystals * Math.pow(1.6, lvl)) : 0,
  };
};
Game.researchLocked = function (id) {
  const r = Game.researchById(id); if (!r) return true;
  return (r.req || []).some(function (x) { return Game.researchLevel(x) < 1; });
};
Game.buyResearch = function (id) {
  const r = Game.researchById(id); if (!r) return { ok: false, reason: 'bad' };
  if (Game.researchLocked(id)) return { ok: false, reason: 'locked' };
  const lvl = Game.researchLevel(id);
  if (lvl >= r.max) return { ok: false, reason: 'maxed' };
  const c = Game.researchCost(id);
  if (Game.S.money < c.money) return { ok: false, reason: 'no-money' };
  if (Game.S.crystals < c.crystals) return { ok: false, reason: 'no-crystals' };
  Game.S.money -= c.money; Game.S.crystals -= c.crystals;
  Game.S.research[id] = lvl + 1;
  if (typeof Sfx !== 'undefined' && Game.S.settings.sound) Sfx.play('buy');
  Game.checkAchievements(); Game.save();
  return { ok: true };
};

// ---- Достижения ----
Game.upgradeLevels = function () {
  let n = 0;
  for (const k of Object.keys(Game.S.upgrades)) n += Game.S.upgrades[k] || 0;
  return n;
};

Game.getStat = function (name) {
  switch (name) {
    case 'formsBought': return Game.S.stats.formsBought;
    case 'gpusBought': return Game.S.stats.gpusBought;
    case 'coolersBought': return Game.S.stats.coolersBought;
    case 'purchases': return Game.S.stats.purchases || 0;
    case 'questsDone': return Game.S.stats.questsDone || 0;
    case 'eventsStarted': return Game.S.stats.eventsStarted || 0;
    case 'collected': return Game.S.stats.offlineCollected || 0;
    case 'gpus': return Game.countGpus();
    case 'coolers': return Game.countCoolers();
    case 'forms': return Game.countForms();
    case 'filledCells': return Game.filledCells();
    case 'totalEarned': return Game.S.stats.totalEarned;
    case 'hashrate': return Game.effectiveHashrate();
    case 'prestigeCount': return Game.S.prestigeCount;
    case 'upgradeLevels': return Game.upgradeLevels();
    case 'autoSell': return Game.S.autoSell ? 1 : 0;
    case 'researchLevels': return Game.researchLevels();
    case 'combo': return (Game.S.prestigeCount >= 5 && Game.upgradeLevels() >= 50) ? 1 : 0;
    default: return 0;
  }
};

Game.checkAchievements = function () {
  const unlocked = [];
  for (const a of DATA.ACHIEVEMENTS) {
    if (Game.S.achievements[a.id]) continue;
    if (Game.getStat(a.cond.stat) >= a.cond.value) {
      Game.S.achievements[a.id] = true;
      if (a.reward.money) {
        Game.S.money += a.reward.money;
        Game.S.stats.totalEarned += a.reward.money;
        Game.S.stats.runEarned += a.reward.money;
      }
      if (a.reward.crystals) Game.S.crystals += a.reward.crystals;
      unlocked.push(a);
    }
  }
  if (unlocked.length) {
    Game.S._newAch = unlocked.map(function (a) { return a.id; });
    if (typeof Sfx !== 'undefined' && Game.S.settings.sound) Sfx.play('achievement');
  }
  return unlocked;
};

Game.achievementProgress = function (a) {
  const cur = Game.getStat(a.cond.stat);
  const target = a.cond.value;
  return { cur, target, done: !!Game.S.achievements[a.id], pct: Math.min(1, cur / target) };
};

Game.achievementsUnlocked = function () {
  return DATA.ACHIEVEMENTS.filter(function (a) { return Game.S.achievements[a.id]; }).length;
};