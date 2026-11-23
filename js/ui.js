// ===== ui.js — интерфейс: вкладки, рендер, обработчики =====

const UI = {};
let shopTab = 'forms';
let currentView = 'farm';

function $(id) { return document.getElementById(id); }

// ---- Инициализация ----
UI.init = function () {
  document.querySelectorAll('.navbtn').forEach(btn => {
    btn.addEventListener('click', () => UI.switchView(btn.dataset.view));
  });

  // Ферма
  $('sellBtn').addEventListener('click', () => { const g = Game.sellCrypto(); if (!g) UI.toast('Нечего обменивать', 'warn'); UI.render(); });
  $('collectBtn').addEventListener('click', () => { const v = Game.collectOffline(); if (!v) UI.toast('Нет офлайн-крипты', 'warn'); UI.render(); });
  $('autoSell').addEventListener('change', (e) => { Game.S.autoSell = e.target.checked; Game.checkAchievements(); Game.save(); UI.render(); });

  const dailyBtn = $('dailyBtn');
  if (dailyBtn) dailyBtn.addEventListener('click', () => {
    const r = Game.claimDaily();
    if (r) UI.toast('Награда: +' + Fmt.compact(r.money) + ' 💰' + (r.crystals ? ' +' + r.crystals + ' 💎' : '') + ' (день ' + r.streak + ')', 'good');
    else UI.toast('Награда ещё не готова', 'warn');
    UI.render();
  });
  const boostBtn = $('boostBtn');
  if (boostBtn) boostBtn.addEventListener('click', () => {
    const r = Game.startBoost();
    if (r && !r.ok) UI.toast('Буст на перезарядке', 'warn');
    else UI.toast('Буст ×2 активирован!', 'good');
    UI.render();
  });
  const autoBuy = $('autoBuy');
  if (autoBuy) {
    autoBuy.checked = !!Game.S.autoBuy;
    autoBuy.addEventListener('change', () => { Game.S.autoBuy = autoBuy.checked; Game.save(); UI.render(); });
  }

  const rlist = $('researchList');
  if (rlist) rlist.addEventListener('click', (e) => {
    const b = e.target.closest('[data-research]');
    if (!b) return;
    const r = Game.buyResearch(b.dataset.research);
    if (!r.ok) {
      if (r.reason === 'no-money') UI.toast('Не хватает денег', 'error');
      else if (r.reason === 'no-crystals') UI.toast('Не хватает кристаллов', 'error');
      else if (r.reason === 'locked') UI.toast('Сначала изучи предыдущее', 'warn');
      else if (r.reason === 'maxed') UI.toast('Уже изучено', 'warn');
      return;
    }
    UI.render();
  });

  const setTheme = $('setTheme');
  if (setTheme) setTheme.addEventListener('change', (e) => { Game.S.settings.theme = e.target.value; UI.applyTheme(); Game.save(); });

  // Магазин: вкладки
  $('shopTabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-shop]');
    if (!b) return;
    shopTab = b.dataset.shop;
    UI.renderShop();
    UI.markShopTabs();
  });

  // Магазин: покупки
  $('shopItems').addEventListener('click', (e) => {
    const b = e.target.closest('[data-buy]');
    if (b) { UI.handleBuy(b.dataset.buy, b); return; }
    const p = e.target.closest('[data-perm]');
    if (p) { UI.handlePerm(p.dataset.perm); }
  });

  // Квесты
  const qlist = $('questList');
  if (qlist) qlist.addEventListener('click', (e) => {
    const b = e.target.closest('[data-claim]');
    if (b) { const reward = Game.claimQuest(b.dataset.claim); if (reward) { UI.toast('Квест выполнен!', 'good'); UI.render(); } return; }
    const d = e.target.closest('[data-dailyclaim]');
    if (d) { const reward = Game.claimDailyQuest(d.dataset.dailyclaim); if (reward) { UI.toast('Ежедневное задание выполнено!', 'good'); UI.render(); } }
  });

  // События
  const evBtn = $('eventBtn');
  if (evBtn) evBtn.addEventListener('click', () => {
    const ev = Game.randomEvent();
    if (ev) { UI.toast('Событие: ' + ev.name, 'good'); UI.render(); }
  });

  // Престиж
  $('prestigeBtn').addEventListener('click', () => {
    const g = Game.doPrestige();
    if (g > 0) { UI.confetti(); UI.toast('Реинвест! +' + g + ' 💎', 'good'); UI.render(); }
    else UI.toast('Нужно заработать 1 млн за заход', 'warn');
  });

  // Настройки
  $('setSound').addEventListener('change', (e) => { Game.S.settings.sound = e.target.checked; Sfx.setEnabled(e.target.checked); Game.save(); });
  const sa = $('setAmbient');
  if (sa) sa.addEventListener('change', (e) => { Game.S.settings.ambient = e.target.checked; Sfx.setAmbient(e.target.checked); Game.save(); });
  $('setFormat').addEventListener('change', (e) => { Game.S.settings.numberFormat = e.target.value; Game.save(); UI.render(); });
  $('setAutoSell').addEventListener('change', (e) => { Game.S.autoSell = e.target.checked; Game.checkAchievements(); Game.save(); UI.render(); });

  // Сейв
  $('exportBtn').addEventListener('click', () => {
    const s = Game.exportSave();
    $('saveBox').value = s;
    $('saveBox').select();
    UI.toast('Сейв скопирован в поле', 'good');
  });
  $('importBtn').addEventListener('click', () => {
    const s = $('saveBox').value.trim();
    if (!s) { UI.toast('Вставь строку сейва', 'warn'); return; }
    if (Game.importSave(s)) { UI.toast('Сейв загружен', 'good'); UI.syncSettings(); UI.render(); }
    else UI.toast('Неверный сейв', 'error');
  });
  $('resetBtn').addEventListener('click', () => {
    if (confirm('Точно сбросить весь прогресс?')) { Game.reset(); UI.syncSettings(); UI.render(); UI.toast('Игра сброшена', 'warn'); }
  });

  UI.syncSettings();
  UI.markShopTabs();
  UI.render();
};

UI.syncSettings = function () {
  $('setSound').checked = !!Game.S.settings.sound;
  $('setFormat').value = Game.S.settings.numberFormat || 'short';
  $('setAutoSell').checked = !!Game.S.autoSell;
  $('autoSell').checked = !!Game.S.autoSell;
  const st = $('setTheme'); if (st) st.value = Game.S.settings.theme || 'dark';
  const sa = $('setAmbient'); if (sa) sa.checked = !!Game.S.settings.ambient;
  UI.applyTheme();
  Sfx.setEnabled(!!Game.S.settings.sound);
};

UI.applyTheme = function () {
  const t = (Game.S && Game.S.settings && Game.S.settings.theme) || 'dark';
  document.documentElement.setAttribute('data-theme', t);
};

// Обновление числа с анимацией при изменении
UI._setVal = function (id, text) {
  const el = $(id); if (!el) return;
  if (el.textContent !== text) {
    el.textContent = text;
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
  }
};

// Конфетти на важные события
UI.confetti = function () {
  const colors = ['#37c0ff', '#ffd24a', '#3ddc84', '#b98bff', '#ff5a5a'];
  for (let i = 0; i < 26; i++) {
    const d = document.createElement('div');
    d.className = 'confetti';
    d.style.left = (50 + (Math.random() * 40 - 20)) + '%';
    d.style.background = colors[i % colors.length];
    d.style.animationDelay = (Math.random() * 0.2) + 's';
    d.style.setProperty('--dx', (Math.random() * 300 - 150) + 'px');
    d.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, 1800);
  }
};

// Модалка достижений с очередью
UI._achQueue = [];
UI._achOpen = false;

UI._pushAchievements = function (ids) {
  const list = (ids || []).map(function (id) { return DATA.ACHIEVEMENTS.find(function (a) { return a.id === id; }); }).filter(Boolean);
  if (!list.length) return;
  UI._achQueue = UI._achQueue.concat(list);
  if (!UI._achOpen) UI._showAchievement();
};

UI._showAchievement = function () {
  const a = UI._achQueue.shift();
  if (!a) {
    UI._achOpen = false;
    const ov = $('achModal'); if (ov) ov.remove();
    return;
  }
  UI._achOpen = true;
  let ov = $('achModal');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'achModal';
    ov.className = 'modal-overlay';
    document.body.appendChild(ov);
  }
  const reward = a.reward.money ? '+' + Fmt.compact(a.reward.money) + ' 💰' : '+' + a.reward.crystals + ' 💎';
  ov.innerHTML = `<div class="modal-card">
    <div class="modal-ico">🏆</div>
    <div class="modal-title">Достижение получено!</div>
    <div class="modal-name">${a.name}</div>
    <div class="modal-desc">${a.desc}</div>
    <div class="modal-reward">${reward}</div>
    <button class="primary modal-btn" id="achModalOk">Отлично</button>
  </div>`;
  ov.classList.add('show');
  const btn = $('achModalOk');
  if (btn) btn.addEventListener('click', UI._nextAchievement);
  UI.confetti();
};

UI._nextAchievement = function () {
  const ov = $('achModal'); if (ov) ov.classList.remove('show');
  setTimeout(function () { UI._showAchievement(); }, 180);
};

// ---- Навигация ----
UI.switchView = function (view) {
  currentView = view;
  document.querySelectorAll('.navbtn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + view));
  UI.render();
};

// ---- Рендер ----
UI.render = function () { UI.updateDynamic(); UI.renderView(); };

// Лёгкое обновление каждый тик: только числа и состояния кнопок
UI.updateDynamic = function () {
  if (!Game.S) return;
  UI._setVal('money', Fmt.compact(Game.S.money));
  UI._setVal('crypto', Fmt.compact(Game.S.crypto));
  UI._setVal('hashrate', Fmt.compact(Game.effectiveHashrate()));
  UI._setVal('crystals', Fmt.compact(Game.S.crystals));

  const ratio = Game.coolingRatio();
  const heat = Game.totalHeat();
  $('cooling').textContent = heat > 0 ? Math.min(100, Math.round(ratio * 100)) + '%' : '—';
  $('tempBox').classList.toggle('overheat', heat > 0 && ratio < 1);

  $('rate').textContent = Fmt.compact(Game.cps()) + ' крипты/с';
  const perSec = Game.cps() * Game.rateValue() * (Game.S.autoSell ? 1 : 0);
  $('profit').textContent = 'Доход: ' + Fmt.compact(perSec) + ' 💰/с' + (Game.S.autoSell ? '' : ' (обмен вручную)');
  $('minefill').style.width = ((Game.S.collected % 1) * 100).toFixed(1) + '%';

  const db = $('dailyBtn');
  if (db) {
    const avail = Game.dailyAvailable();
    const prev = Game.dailyPreview();
    db.disabled = !avail;
    db.textContent = avail
      ? ('🎁 Награда: +' + Fmt.compact(prev.money) + ' 💰' + (prev.crystals ? ' +' + prev.crystals + ' 💎' : ''))
      : ('🎁 Через ' + Fmt.time(Math.ceil((Game.DAILY_MS - (Date.now() - (Game.S.daily.lastClaim || 0))) / 1000)));
  }
  const bb = $('boostBtn');
  if (bb) {
    const act = Game.boostRemaining();
    const cd = Game.boostCdRemaining();
    bb.disabled = (cd > 0 && act === 0);
    bb.textContent = act > 0 ? ('⚡ Буст ×2 — ' + act + 'с') : (cd > 0 ? ('⚡ Перезарядка ' + Fmt.time(cd)) : '⚡ Буст ×2 (60с)');
  }
  const ab = $('autoBuy'); if (ab) ab.checked = !!Game.S.autoBuy;

  $('farmInfo').textContent = 'Форм: ' + Game.countForms() + ' · Видеокарт: ' + Game.countGpus() + ' · Кулеров: ' + Game.countCoolers();

  const off = $('offlineMsg');
  if (Game.S.offlinePending > 0) {
    off.classList.remove('hidden');
    off.textContent = 'Пока тебя не было, добыто: ' + Fmt.compact(Game.S.offlinePending) + ' 🪙 — нажми «Собрать»';
  } else off.classList.add('hidden');
};

// Перерисовка списков текущей вкладки (по событиям и раз в секунду)
UI.renderView = function () {
  if (!Game.S) return;
  if (currentView === 'farm') UI.renderGrid();
  else if (currentView === 'shop') UI.renderShop();
  else if (currentView === 'quests') UI.renderQuests();
  else if (currentView === 'events') UI.renderEvents();
  else if (currentView === 'research') UI.renderResearch();
  else if (currentView === 'prestige') UI.renderPrestige();
  else if (currentView === 'achievements') UI.renderAchievements();
  else if (currentView === 'stats') UI.renderStats();

  if (Game.S._newAch && Game.S._newAch.length) {
    const ids = Game.S._newAch;
    Game.S._newAch = null;
    UI._pushAchievements(ids);
  }
};

// ---- Ферма ----
UI.renderGrid = function () {
  const g = $('grid');
  let html = '';
  for (let i = 0; i < Game.S.cells.length; i++) {
    const c = Game.S.cells[i];
    if (!c) {
      html += `<div class="cell empty"><span class="plus">+</span></div>`;
    } else if (c.kind === 'form') {
      if (c.gpu) {
        const gp = DATA.GPUS.find(x => x.key === c.gpu);
        if (gp) {
          html += `<div class="cell form filled"><img class="cellimg" src="${gp.img}" alt=""><div class="cname">${gp.name}</div><div class="cstat">${Fmt.compact(gp.hr)}⚡ ${gp.heat}🔥</div></div>`;
        } else {
          html += `<div class="cell form"><img class="cellimg" src="${DATA.IMAGES.form}" alt=""><div class="cname">Форма</div><div class="cstat dim">пусто</div></div>`;
        }
      } else {
        html += `<div class="cell form"><img class="cellimg" src="${DATA.IMAGES.form}" alt=""><div class="cname">Форма</div><div class="cstat dim">пусто</div></div>`;
      }
    } else if (c.kind === 'cooler') {
      const cl = DATA.COOLERS.find(x => x.key === c.tier);
      if (cl) html += `<div class="cell cooler"><img class="cellimg" src="${cl.img}" alt=""><div class="cname">${cl.name}</div><div class="cstat">${cl.cool}❄</div></div>`;
    }
  }
  g.innerHTML = html;
};

// ---- Магазин ----
UI.markShopTabs = function () {
  $('shopTabs').innerHTML = DATA.SHOP_TABS.map(t =>
    `<button class="tab ${t.key === shopTab ? 'active' : ''}" data-shop="${t.key}">${t.label}</button>`
  ).join('');
};

UI.renderShop = function () {
  const box = $('shopItems');
  let html = '';
  if (shopTab === 'forms') {
    html += UI.card('Форма под видеокарту', DATA.FORM.desc, 'form:', Game.formPrice(), 'Купить форму', undefined, DATA.IMAGES.form);
  } else if (shopTab === 'gpus') {
    for (const gp of DATA.GPUS) {
      html += UI.card(gp.name, `+${Fmt.num(gp.hr)}⚡ · нагрев ${gp.heat}🔥`, 'gpu:' + gp.key, Game.gpuPrice(gp.key), 'Купить видеокарту', Game.gpuCount(gp.key), gp.img);
    }
  } else if (shopTab === 'coolers') {
    for (const cl of DATA.COOLERS) {
      html += UI.card(cl.name, `−${cl.cool}🔥 охлаждения`, 'cooler:' + cl.key, Game.coolerPrice(cl.key), 'Купить кулер', Game.coolerCount(cl.key), cl.img);
    }
  } else {
    const iconByKind = { hash: DATA.IMAGES.iconUpgrade, cool: DATA.IMAGES.iconThermal, rate: DATA.IMAGES.iconRate, price: DATA.IMAGES.iconDiscount, offline: DATA.IMAGES.iconOffline, start: DATA.IMAGES.iconUpgrade };
    for (const u of DATA.UPGRADES) {
      const lvl = Game.S.upgrades[u.key] || 0;
      const maxed = lvl >= u.max;
      const price = maxed ? 0 : Game.upgradePrice(u.key);
      const ic = iconByKind[u.kind] || DATA.IMAGES.iconUpgrade;
      html += `<div class="shop-item shop-with-img">
        <img class="thumb" src="${ic}" alt="">
        <div class="shop-body">
        <div class="item-top"><span class="iname">${u.name}</span><span class="owned">ур. ${lvl}/${u.max}</span></div>
        <div class="desc">${u.desc}</div>
        <button class="buy ${maxed ? 'maxed' : ''}" data-buy="upgrade:${u.key}" ${maxed ? 'disabled' : ''}>${maxed ? 'Максимум' : 'Улучшить — ' + Fmt.compact(price) + ' 💰'}</button>
        </div>
      </div>`;
    }
  }
  box.innerHTML = html;
};

UI.card = function (name, desc, buyKey, price, btnText, owned, img) {
  const ownedHtml = (owned !== undefined && owned > 0) ? `<span class="owned">×${owned}</span>` : '';
  const thumb = img ? `<img class="thumb" src="${img}" alt="">` : '';
  return `<div class="shop-item shop-with-img">
    ${thumb}<div class="shop-body">
    <div class="item-top"><span class="iname">${name} ${ownedHtml}</span></div>
    <div class="desc">${desc}</div>
    <button class="buy" data-buy="${buyKey}">${btnText} — <span class="price">${Fmt.compact(price)}</span> 💰</button>
    </div></div>`;
};

UI.handleBuy = function (key, btn) {
  const parts = key.split(':');
  const type = parts[0], sub = parts[1];
  let r;
  if (type === 'form') r = Game.buyForm();
  else if (type === 'gpu') r = Game.buyGpu(sub);
  else if (type === 'cooler') r = Game.buyCooler(sub);
  else if (type === 'upgrade') r = Game.buyUpgrade(sub);
  if (r && !r.ok) {
    if (r.reason === 'no-money') { btn && btn.classList.add('no-money'); setTimeout(() => btn && btn.classList.remove('no-money'), 500); UI.toast('Не хватает денег', 'error'); }
    else if (r.reason === 'no-form') UI.toast('Сначала поставь форму под видеокарту', 'warn');
    else if (r.reason === 'no-space') UI.toast('Нет места на ферме', 'warn');
    else if (r.reason === 'maxed') UI.toast('Уже максимум', 'warn');
    return;
  }
  UI.render();
};

// ---- Квесты ----
UI.renderQuests = function () {
  const qs = Game.S.quests;
  Game._initDailyQuests();
  const dq = Game.S.dailyQuests;
  const resetIn = Fmt.time(Math.ceil(Game.dailyResetIn() / 1000));
  let html = `<h3 class="subhead">Ежедневные · сброс через ${resetIn}</h3>`;
  for (const id of dq.active) {
    const d = Game.dailyQuestById(id); if (!d) continue;
    const cur = dq.prog[id] || 0;
    const pct = Math.min(100, Math.round(cur / d.target * 100));
    const ready = cur >= d.target;
    const done = !!dq.done[id];
    const reward = d.reward.money ? '+' + Fmt.compact(d.reward.money) + ' 💰' : '+' + d.reward.crystals + ' 💎';
    html += `<div class="shop-item shop-with-img quest ${(ready || done) ? 'ready' : ''}">
      <img class="thumb" src="${DATA.IMAGES.iconQuest}" alt="">
      <div class="shop-body">
      <div class="item-top"><span class="iname">${d.name}</span><span class="owned">${reward}</span></div>
      <div class="desc">${d.desc}</div>
      <div class="bar small"><div class="fill" style="width:${done ? 100 : pct}%"></div></div>
      <div class="ach-meta">${done ? 'Выполнено' : Fmt.compact(cur) + ' / ' + Fmt.compact(d.target)}</div>
      <button class="buy ${done ? 'maxed' : ''}" data-dailyclaim="${d.id}" ${(!ready || done) ? 'disabled' : ''}>${done ? 'Получено' : (ready ? 'Забрать награду' : 'В процессе')}</button>
      </div>
    </div>`;
  }
  html += '<h3 class="subhead">Обычные квесты</h3>';
  let any = false;
  for (const id of qs.active) {
    const q = Game.questById(id);
    if (!q) continue;
    any = true;
    const cur = qs.prog[id] || 0;
    const pct = Math.min(100, Math.round(cur / q.target * 100));
    const ready = cur >= q.target;
    const reward = q.reward.money ? '+' + Fmt.compact(q.reward.money) + ' 💰' : '+' + q.reward.crystals + ' 💎';
    html += `<div class="shop-item shop-with-img quest ${ready ? 'ready' : ''}">
      <img class="thumb" src="${DATA.IMAGES.iconQuest}" alt="">
      <div class="shop-body">
      <div class="item-top"><span class="iname">${q.name}</span><span class="owned">${reward}</span></div>
      <div class="desc">${q.desc}</div>
      <div class="bar small"><div class="fill" style="width:${pct}%"></div></div>
      <div class="ach-meta">${Fmt.compact(cur)} / ${Fmt.compact(q.target)}</div>
      <button class="buy" data-claim="${q.id}" ${ready ? '' : 'disabled'}>${ready ? 'Забрать награду' : 'В процессе'}</button>
      </div>
    </div>`;
  }
  if (!any) html += '<div class="dim">Все обычные квесты выполнены — отличная работа!</div>';
  $('questList').innerHTML = html;
};

// ---- События ----
UI.renderEvents = function () {
  const active = Game.activeEvents();
  const kindName = k => k === 'all' ? 'ко всему' : k === 'hash' ? 'хешрейт' : k === 'cool' ? 'охлаждение' : 'курс';
  let ahead = active.length ? active.map(e => {
    const left = Math.max(0, Math.ceil((e.endsAt - Date.now()) / 1000));
    return `<div class="shop-item shop-with-img event active">
      <img class="thumb" src="${DATA.IMAGES.iconEvent}" alt="">
      <div class="shop-body">
      <div class="item-top"><span class="iname">${e.name}</span><span class="owned">${left}с</span></div>
      <div class="desc">+${Math.round(e.mult * 100)}% к ${kindName(e.kind)}</div>
      </div>
    </div>`;
  }).join('') : '<div class="dim">Активных событий нет. Запусти случайное!</div>';

  const pool = DATA.EVENTS.map(e =>
    `<div class="ach"><img class="ach-thumb" src="${DATA.IMAGES.iconEvent}" alt=""><div class="ach-body">
      <div class="ach-name">${e.name}</div>
      <div class="ach-desc">+${Math.round(e.mult * 100)}% к ${kindName(e.kind)} · ${e.dur}с</div>
    </div></div>`).join('');

  $('eventList').innerHTML = `<h3 class="subhead">Активные</h3>${ahead}<h3 class="subhead">Возможные события</h3><div class="ach-list">${pool}</div>`;
};

// ---- Лаборатория ----
UI.renderResearch = function () {
  let html = '';
  for (const r of DATA.RESEARCH) {
    const lvl = Game.researchLevel(r.id);
    const maxed = lvl >= r.max;
    const locked = Game.researchLocked(r.id);
    const c = Game.researchCost(r.id);
    const cost = [c.money ? Fmt.compact(c.money) + ' 💰' : '', c.crystals ? c.crystals + ' 💎' : ''].filter(Boolean).join(' · ');
    const ic = r.kind === 'hash' ? DATA.IMAGES.iconUpgrade : r.kind === 'cool' ? DATA.IMAGES.iconThermal : r.kind === 'rate' ? DATA.IMAGES.iconRate : r.kind === 'price' ? DATA.IMAGES.iconDiscount : DATA.IMAGES.iconOffline;
    const reqNames = (r.req || []).map(x => { const n = Game.researchById(x); return n ? n.name : x; }).join(', ');
    html += `<div class="shop-item shop-with-img ${locked ? 'locked' : ''}">
      <img class="thumb" src="${ic}" alt="">
      <div class="shop-body">
      <div class="item-top"><span class="iname">${r.name}</span><span class="owned">ур. ${lvl}/${r.max}</span></div>
      <div class="desc">${r.desc}${locked ? ' · 🔒 нужно: ' + reqNames : ''}</div>
      <button class="buy ${maxed ? 'maxed' : ''}" data-research="${r.id}" ${maxed || locked ? 'disabled' : ''}>${maxed ? 'Изучено' : (locked ? 'Заблокировано' : 'Изучить — ' + cost)}</button>
      </div>
    </div>`;
  }
  $('researchList').innerHTML = html;
};

// ---- Престиж ----
UI.renderPrestige = function () {
  $('prestigeRunEarned').textContent = Fmt.compact(Game.S.stats.runEarned);
  const gain = Game.prestigeGain();
  $('prestigeGain').textContent = gain;
  const btn = $('prestigeBtn');
  btn.disabled = gain < 1;
  btn.textContent = gain >= 1 ? 'Реинвест' : 'Нужно 1 млн за заход';

  let html = '';
  for (const p of DATA.PERM) {
    const lvl = Game.S.perm[p.key] || 0;
    const maxed = lvl >= p.max;
    const price = maxed ? 0 : Game.permPrice(p.key);
    html += `<div class="shop-item">
      <div class="item-top"><span class="iname">${p.name}</span><span class="owned">ур. ${lvl}/${p.max}</span></div>
      <div class="desc">${p.desc}</div>
      <button class="buy ${maxed ? 'maxed' : ''}" data-perm="${p.key}" ${maxed ? 'disabled' : ''}>${maxed ? 'Максимум' : 'Купить — ' + Fmt.compact(price) + ' 💎'}</button>
    </div>`;
  }
  $('permItems').innerHTML = html;
};

UI.handlePerm = function (key) {
  const r = Game.buyPerm(key);
  if (!r.ok) {
    if (r.reason === 'no-money') UI.toast('Не хватает кристаллов', 'error');
    else if (r.reason === 'maxed') UI.toast('Уже максимум', 'warn');
    return;
  }
  UI.render();
};

// ---- Достижения ----
UI.renderAchievements = function () {
  $('achCount').textContent = '(' + Game.achievementsUnlocked() + '/' + DATA.ACHIEVEMENTS.length + ')';
  let html = '';
  for (const a of DATA.ACHIEVEMENTS) {
    const pr = Game.achievementProgress(a);
    const done = pr.done;
    const reward = a.reward.money ? '+' + Fmt.compact(a.reward.money) + ' 💰' : '+' + a.reward.crystals + ' 💎';
    const pct = done ? 100 : Math.round(pr.pct * 100);
    html += `<div class="ach ${done ? 'done' : ''}">
      <div class="ach-ico">${done ? '🏆' : '🔒'}</div>
      <div class="ach-body">
        <div class="ach-name">${a.name}</div>
        <div class="ach-desc">${a.desc}</div>
        <div class="bar small"><div class="fill" style="width:${pct}%"></div></div>
        <div class="ach-meta">${done ? 'Получено' : Fmt.compact(pr.cur) + ' / ' + Fmt.compact(pr.target)} · ${reward}</div>
      </div>
    </div>`;
  }
  $('achList').innerHTML = html;
};

// ---- Статистика ----
UI.renderStats = function () {
  const s = Game.S.stats;
  const rows = [
    ['Всего заработано', Fmt.compact(s.totalEarned) + ' 💰'],
    ['Заработано за заход', Fmt.compact(s.runEarned) + ' 💰'],
    ['Добыто крипты', Fmt.compact(s.totalCrypto) + ' 🪙'],
    ['Куплено единиц оборудования', s.purchases || 0],
    ['Выполнено квестов', s.questsDone || 0],
    ['Запущено событий', s.eventsStarted || 0],
    ['Уровней апгрейдов', Game.upgradeLevels()],
    ['Престижей', Game.S.prestigeCount],
    ['Кристаллов', Fmt.compact(Game.S.crystals) + ' 💎'],
    ['Базовый хешрейт', Fmt.compact(Game.totalHashrate())],
    ['Эффективный хешрейт', Fmt.compact(Game.effectiveHashrate())],
    ['КПД охлаждения', Fmt.pct(Game.efficiency())],
    ['Курс обмена', Game.rateValue().toFixed(2) + ' 💰/🪙'],
    ['Офлайн-доход', Fmt.pct(Game.offlineEff())],
    ['В игре', Fmt.time(s.playTime)],
  ];
  $('statsList').innerHTML = rows.map(r => `<div class="stat-row"><span>${r[0]}</span><b>${r[1]}</b></div>`).join('');
};

// ---- Тост ----
UI.toast = function (text, kind) {
  let el = $('toast');
  if (!el) { el = document.createElement('div'); el.id = 'toast'; document.body.appendChild(el); }
  el.textContent = text;
  el.className = 'show ' + (kind || '');
  clearTimeout(UI._toastT);
  UI._toastT = setTimeout(() => { el.className = ''; }, 2400);
};