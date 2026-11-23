// ===== data.js — каталог контента «Апрельского Майнинга» =====
// Оригинальный контент (апрельская тематика), без чужих ассетов.

const DATA = {};

// ---- Формы под видеокарты ----
DATA.FORM = { name: 'Форма под видеокарту', base: 100, grow: 1.5, desc: 'Слот для одной видеокарты', img: 'assets/form-rack.jpg' };

// Изображения (оригинальные, сгенерированы для игры)
DATA.IMAGES = {
  bg: 'assets/bg.jpg', logo: 'assets/logo.jpg', crystal: 'assets/crystal.jpg',
  form: 'assets/form-rack.jpg', cooler: 'assets/cooler.jpg',
  gpuBasic: 'assets/gpu-basic.jpg', gpuMid: 'assets/gpu-mid.jpg', gpuHigh: 'assets/gpu-high.jpg',
  gpuQuantum: 'assets/gpu-quantum.jpg', gpuCosmic: 'assets/gpu-cosmic.jpg', gpuDivine: 'assets/gpu-divine.jpg',
  iconUpgrade: 'assets/icon-upgrade.jpg', iconThermal: 'assets/icon-thermal.jpg',
  iconRate: 'assets/icon-rate.jpg', iconDiscount: 'assets/icon-discount.jpg',
  iconOffline: 'assets/icon-offline.jpg', iconQuest: 'assets/icon-quest.jpg', iconEvent: 'assets/icon-event.jpg',
};

// ---- Видеокарты: 60 уровней ----
const GPU_NAMES = [
  'Geforce Апрель','Ригель RTX','Корочка Pro','Весенний ASIC','Таялый Хеш',
  'Капель X','Проталина Ultra','Сирень Hash','Первоцвет Miner','Подснежник Pro',
  'Грач-500','Верба Quantum','Апрельский Титан','Майский Разгон','Ласточка ASIC',
  'Изумрудный чип','Ледоход X2','Солнечный Фотон','Гроза Майнер','Ураган-7',
  'Мираж Крипто','Космос ASIC','Сингулярность','Абсолют',
  'Плазма-Хеш','Кварк','Нейтрон','Фотонный Блок','Ледяной Кристалл',
  'Метеор','Квазар','Пустотный Чип','Гравитон','Тесла-9000',
  'Ионный Вихрь','Огненный Шторм','Тёмная Материя','Антиматерия','Сверхновая',
  'Гиперпрыжок','Хроно-Чип','Временная Петля','Квантовый Узел','Энтропия',
  'Синтез-Ядро','Плазмоид','Магнитар','Чёрная Дыра','Горизонт Событий',
  'Парадокс','Бесконечность','Абсолют-2','Первопричина','Сингулярность-X',
  'Легенда','Миф','Эпос','Божественный Хеш','Абсолютный Разум','Начало'
];
DATA.GPUS = GPU_NAMES.map(function (name, i) {
  return {
    key: 'gpu' + String(i + 1).padStart(2, '0'),
    name: name,
    base: Math.round(120 * Math.pow(3.3, i)),
    grow: 1.5,
    hr: Math.max(1, Math.round(8 * Math.pow(3.8, i))),
    heat: Math.max(1, Math.round(Math.pow(2.2, i))),
    img: i < 10 ? 'assets/gpu-basic.jpg' : i < 20 ? 'assets/gpu-mid.jpg' : i < 30 ? 'assets/gpu-high.jpg' : i < 40 ? 'assets/gpu-quantum.jpg' : i < 50 ? 'assets/gpu-cosmic.jpg' : 'assets/gpu-divine.jpg',
  };
});

// ---- Кулеры: 16 уровней ----
const COOLER_NAMES = [
  'Вентилятор','Кулер Pro','Жидкое охл.','Азотная петля',
  'Чиллер','Криокамера','Фреон Turbo','Абсолютный ноль',
  'Ледяной Шторм','Плазменный Охладитель','Квантовый Чиллер','Нейтринный Радиатор',
  'Гравитационный Холод','Тесла-Крио','Пустотный Контур','Вечный Мороз'
];
DATA.COOLERS = COOLER_NAMES.map(function (name, i) {
  return {
    key: 'cool' + (i + 1),
    name: name,
    base: Math.round(80 * Math.pow(4.2, i)),
    grow: 1.5,
    cool: Math.max(1, Math.round(Math.pow(4.5, i))),
    img: 'assets/cooler.jpg',
  };
});

// ---- Апгрейды (множители; kind задаёт тип эффекта) ----
DATA.UPGRADES = [
  { key:'overclock', name:'Разгон ядра',        desc:'+30% хешрейта за уровень',   max:25, base:500,  grow:1.70, effect:0.30, kind:'hash' },
  { key:'thermal',   name:'Термопаста',         desc:'+20% охлаждения за уровень', max:25, base:400,  grow:1.65, effect:0.20, kind:'cool' },
  { key:'exchange',  name:'Курс обмена',        desc:'+0.05 к курсу за уровень',   max:20, base:1000, grow:1.80, effect:0.05, kind:'rate' },
  { key:'discount',  name:'Оптовые скидки',     desc:'−4% к ценам за уровень',     max:15, base:2000, grow:1.90, effect:0.04, kind:'price' },
  { key:'offline',   name:'Турбо-офлайн',       desc:'+8% офлайн-дохода за уровень',max:10, base:5000, grow:2.00, effect:0.08, kind:'offline' },

  { key:'memclock',  name:'Разгон памяти',      desc:'+20% хешрейта за уровень',   max:20, base:2000, grow:1.70, effect:0.20, kind:'hash' },
  { key:'airflow',   name:'Корпус с продувкой', desc:'+15% охлаждения за уровень', max:20, base:1500, grow:1.70, effect:0.15, kind:'cool' },
  { key:'partner',   name:'Партнёрство',        desc:'+0.03 к курсу за уровень',   max:20, base:3000, grow:1.70, effect:0.03, kind:'rate' },
  { key:'coupons',   name:'Скидочные талоны',   desc:'−2% к ценам за уровень',     max:20, base:2500, grow:1.70, effect:0.02, kind:'price' },
  { key:'turbine',   name:'Турбина',            desc:'+5% офлайн-дохода за уровень',max:10, base:8000, grow:1.80, effect:0.05, kind:'offline' },

  { key:'turbo',     name:'Турбо-разгон',       desc:'+50% хешрейта за уровень',   max:10, base:50000, grow:2.20, effect:0.50, kind:'hash' },
  { key:'cryopaste', name:'Крио-паста',         desc:'+40% охлаждения за уровень', max:15, base:40000, grow:2.00, effect:0.40, kind:'cool' },
  { key:'bot',       name:'Биржевой бот',       desc:'+0.10 к курсу за уровень',   max:20, base:20000, grow:1.90, effect:0.10, kind:'rate' },
  { key:'tenders',   name:'Тендеры',            desc:'−3% к ценам за уровень',     max:20, base:30000, grow:1.85, effect:0.03, kind:'price' },
  { key:'nightshift',name:'Ночная смена',       desc:'+10% офлайн-дохода за уровень',max:10, base:50000, grow:1.90, effect:0.10, kind:'offline' },

  { key:'chip',      name:'Разгон чипа',        desc:'+40% хешрейта за уровень',   max:15, base:80000, grow:1.90, effect:0.40, kind:'hash' },
  { key:'prothermal',name:'Термопаста PRO',     desc:'+25% охлаждения за уровень', max:15, base:60000, grow:1.90, effect:0.25, kind:'cool' },
  { key:'insider',   name:'Инсайд',             desc:'+0.20 к курсу за уровень',   max:15, base:2e6,   grow:2.10, effect:0.20, kind:'rate' },
  { key:'factory',   name:'Завод напрямую',     desc:'−6% к ценам за уровень',     max:15, base:3e6,   grow:2.05, effect:0.06, kind:'price' },
  { key:'eternal',   name:'Вечный майнинг',     desc:'+15% офлайн-дохода за уровень',max:10, base:5e6,  grow:2.10, effect:0.15, kind:'offline' },

  { key:'quantum',   name:'Квантовый разгон',   desc:'+100% хешрейта за уровень',  max:10, base:5e6,   grow:2.40, effect:1.00, kind:'hash' },
  { key:'abszero',   name:'Абсолютный холод',   desc:'+80% охлаждения за уровень', max:10, base:4e6,   grow:2.30, effect:0.80, kind:'cool' },
  { key:'capital',   name:'Стартовый капитал',  desc:'+500 денег при старте',      max:20, base:1e3,   grow:1.60, effect:500,  kind:'start' },
  { key:'heritage',  name:'Наследство',         desc:'+5 000 денег при старте',    max:10, base:1e5,   grow:1.90, effect:5000, kind:'start' },
  { key:'divine',    name:'Божественный разгон',desc:'+200% хешрейта за уровень',  max:10, base:5e8,   grow:2.60, effect:2.00, kind:'hash' },
];

// ---- Престиж (постоянные бонусы; key совпадает с kind) ----
DATA.PERM = [
  { key:'hash',    name:'Вечный разгон',     desc:'+15% хешрейта за уровень', max:20, base:5, grow:1.6, effect:0.15 },
  { key:'cool',    name:'Абсолютный холод',  desc:'+10% охлаждения за уровень',max:20, base:5, grow:1.6, effect:0.10 },
  { key:'rate',    name:'Золотой курс',      desc:'+0.05 к курсу за уровень', max:10, base:8, grow:1.8, effect:0.05 },
  { key:'start',   name:'Стартовый капитал', desc:'+1000 денег при старте',   max:20, base:3, grow:1.5, effect:1000 },
  { key:'offline', name:'Вечный майнинг',    desc:'+5% офлайн-дохода за уровень',max:10, base:6, grow:1.7, effect:0.05 },
  { key:'price',   name:'Мастер торга',      desc:'−3% к ценам за уровень',   max:10, base:7, grow:1.7, effect:0.03 },
];

// ---- Достижения ----
DATA.ACHIEVEMENTS = [
  { id:'first_form',  name:'Первая форма',   desc:'Купи первую форму',              cond:{stat:'formsBought', value:1},     reward:{money:100} },
  { id:'first_gpu',   name:'Первый хеш',     desc:'Установи первую видеокарту',     cond:{stat:'gpusBought', value:1},      reward:{money:150} },
  { id:'first_cool',  name:'Не перегрелся',  desc:'Купи первый кулер',              cond:{stat:'coolersBought', value:1},   reward:{money:120} },
  { id:'gpus_5',      name:'Мини-ферма',     desc:'5 видеокарт',                    cond:{stat:'gpus', value:5},            reward:{money:500} },
  { id:'gpus_10',     name:'Ферма растёт',   desc:'10 видеокарт',                   cond:{stat:'gpus', value:10},           reward:{money:2000} },
  { id:'gpus_20',     name:'Дата-центр',     desc:'20 видеокарт',                   cond:{stat:'gpus', value:20},           reward:{money:10000} },
  { id:'gpus_30',     name:'Промзона',       desc:'30 видеокарт',                   cond:{stat:'gpus', value:30},           reward:{crystals:3} },
  { id:'cool_5',      name:'Холодильник',    desc:'5 кулеров',                      cond:{stat:'coolers', value:5},         reward:{money:800} },
  { id:'cool_15',     name:'Крио-ферма',     desc:'15 кулеров',                     cond:{stat:'coolers', value:15},        reward:{money:8000} },
  { id:'cool_30',     name:'Абсолютный ноль',desc:'30 кулеров',                     cond:{stat:'coolers', value:30},        reward:{crystals:5} },
  { id:'earn_1k',     name:'Первая тысяча',  desc:'Заработай 1 000 всего',          cond:{stat:'totalEarned', value:1e3},   reward:{money:200} },
  { id:'earn_10k',    name:'Десятка',        desc:'Заработай 10 000 всего',         cond:{stat:'totalEarned', value:1e4},   reward:{money:800} },
  { id:'earn_100k',   name:'Сотка',          desc:'Заработай 100 000 всего',        cond:{stat:'totalEarned', value:1e5},   reward:{money:5000} },
  { id:'earn_1m',     name:'Миллион',        desc:'Заработай 1 млн всего',          cond:{stat:'totalEarned', value:1e6},   reward:{money:20000} },
  { id:'earn_10m',    name:'Мультимиллионер',desc:'Заработай 10 млн всего',         cond:{stat:'totalEarned', value:1e7},   reward:{money:50000} },
  { id:'earn_100m',   name:'Сотня миллионов',desc:'Заработай 100 млн всего',        cond:{stat:'totalEarned', value:1e8},   reward:{crystals:5} },
  { id:'earn_1b',     name:'Крипто-барон',   desc:'Заработай 1 млрд всего',         cond:{stat:'totalEarned', value:1e9},   reward:{crystals:5} },
  { id:'earn_1t',     name:'Хеш-империя',    desc:'Заработай 1 трлн всего',         cond:{stat:'totalEarned', value:1e12},  reward:{crystals:20} },
  { id:'hash_1k',     name:'Килохеш',        desc:'Хешрейт 1 000',                  cond:{stat:'hashrate', value:1e3},      reward:{money:1000} },
  { id:'hash_100k',   name:'Сто килохеш',    desc:'Хешрейт 100 000',                cond:{stat:'hashrate', value:1e5},      reward:{money:10000} },
  { id:'hash_1m',     name:'Мегахеш',        desc:'Хешрейт 1 млн',                  cond:{stat:'hashrate', value:1e6},      reward:{money:20000} },
  { id:'hash_1g',     name:'Гигахеш',        desc:'Хешрейт 1 млрд',                 cond:{stat:'hashrate', value:1e9},      reward:{crystals:10} },
  { id:'hash_1t',     name:'Терахеш',        desc:'Хешрейт 1 трлн',                 cond:{stat:'hashrate', value:1e12},     reward:{crystals:25} },
  { id:'prestige_1',  name:'Реинвест',       desc:'Сделай первый престиж',          cond:{stat:'prestigeCount', value:1},   reward:{crystals:10} },
  { id:'prestige_5',  name:'Серийный инвестор',desc:'5 престижей',                  cond:{stat:'prestigeCount', value:5},   reward:{crystals:25} },
  { id:'prestige_10', name:'Инвест-магнат',  desc:'10 престижей',                   cond:{stat:'prestigeCount', value:10},  reward:{crystals:50} },
  { id:'upg_10',      name:'Прокачка',       desc:'10 уровней апгрейдов',           cond:{stat:'upgradeLevels', value:10},  reward:{money:3000} },
  { id:'upg_50',      name:'Инженер',        desc:'50 уровней апгрейдов',           cond:{stat:'upgradeLevels', value:50},  reward:{crystals:5} },
  { id:'upg_150',     name:'Главный инженер',desc:'150 уровней апгрейдов',          cond:{stat:'upgradeLevels', value:150}, reward:{crystals:15} },
  { id:'auto',        name:'Автопилот',      desc:'Включи автообмен',               cond:{stat:'autoSell', value:1},        reward:{money:1000} },
  { id:'forms_10',    name:'Строитель',      desc:'10 форм',                        cond:{stat:'forms', value:10},          reward:{money:2500} },
  { id:'forms_20',    name:'Застройщик',     desc:'20 форм',                        cond:{stat:'forms', value:20},          reward:{crystals:3} },
  { id:'bought_100',  name:'Оптовая закупка',desc:'Купи 100 единиц оборудования',    cond:{stat:'purchases', value:100},     reward:{money:5000} },
  { id:'bought_500',  name:'Снабженец',      desc:'Купи 500 единиц оборудования',    cond:{stat:'purchases', value:500},     reward:{crystals:8} },
  { id:'quests_10',   name:'Исполнитель',    desc:'Выполни 10 квестов',              cond:{stat:'questsDone', value:10},     reward:{money:4000} },
  { id:'quests_50',   name:'Герой труда',    desc:'Выполни 50 квестов',              cond:{stat:'questsDone', value:50},     reward:{crystals:10} },
  { id:'events_5',    name:'Ловец удачи',    desc:'Запусти 5 событий',               cond:{stat:'eventsStarted', value:5},   reward:{money:3000} },
  { id:'events_25',   name:'Мастер событий', desc:'Запусти 25 событий',              cond:{stat:'eventsStarted', value:25},  reward:{crystals:6} },
  { id:'combo',       name:'Скачок',         desc:'5 престижей и 50 апгрейдов',      cond:{stat:'combo', value:1},           reward:{crystals:15} },
  { id:'offline_1h',  name:'Трудяга',        desc:'Собери офлайн-крипту',            cond:{stat:'collected', value:1},       reward:{money:1500} },
  { id:'million_hash',name:'Небо и звёзды',  desc:'Хешрейт 1 квинтиллион',           cond:{stat:'hashrate', value:1e18},     reward:{crystals:40} },
  { id:'max_ferm',    name:'Предел',         desc:'Заполни все 12 ячеек',            cond:{stat:'filledCells', value:12},    reward:{crystals:4} },
  { id:'research_10', name:'Исследователь',  desc:'10 уровней исследований',         cond:{stat:'researchLevels', value:10}, reward:{money:5000} },
  { id:'research_30', name:'Учёный',         desc:'30 уровней исследований',         cond:{stat:'researchLevels', value:30}, reward:{crystals:6} },
];

// ---- Квесты (прогресс за действия) ----
DATA.QUESTS = [
  { id:'q_mine_1',   name:'Первый блок',     desc:'Добудь 1 000 крипты',        type:'mineCrypto',  target:1e3,  reward:{money:800} },
  { id:'q_mine_2',   name:'Шахтёр',          desc:'Добудь 50 000 крипты',       type:'mineCrypto',  target:5e4,  reward:{money:6000} },
  { id:'q_mine_3',   name:'Крупная жила',    desc:'Добудь 1 млн крипты',        type:'mineCrypto',  target:1e6,  reward:{crystals:3} },
  { id:'q_mine_4',   name:'Золотая жила',    desc:'Добудь 50 млн крипты',       type:'mineCrypto',  target:5e7,  reward:{crystals:8} },
  { id:'q_earn_1',   name:'Первая прибыль',  desc:'Заработай 2 000 денег',      type:'earnMoney',   target:2e3,  reward:{money:600} },
  { id:'q_earn_2',   name:'Окупаемость',     desc:'Заработай 100 000 денег',    type:'earnMoney',   target:1e5,  reward:{money:8000} },
  { id:'q_earn_3',   name:'Прибыльный цех',  desc:'Заработай 10 млн денег',     type:'earnMoney',   target:1e7,  reward:{crystals:6} },
  { id:'q_gpu_1',    name:'Первая карта',    desc:'Купи 1 видеокарту',          type:'buyGpu',      target:1,    reward:{money:300} },
  { id:'q_gpu_2',    name:'Купи 5 карт',     desc:'Купи 5 видеокарт',           type:'buyGpu',      target:5,    reward:{money:2000} },
  { id:'q_gpu_3',    name:'Купи 20 карт',    desc:'Купи 20 видеокарт',          type:'buyGpu',      target:20,   reward:{money:15000} },
  { id:'q_gpu_4',    name:'Купи 50 карт',    desc:'Купи 50 видеокарт',          type:'buyGpu',      target:50,   reward:{crystals:4} },
  { id:'q_cool_1',   name:'Прохлада',        desc:'Купи 3 кулера',              type:'buyCooler',   target:3,    reward:{money:1200} },
  { id:'q_cool_2',   name:'Криомонтаж',      desc:'Купи 10 кулеров',            type:'buyCooler',   target:10,   reward:{money:6000} },
  { id:'q_cool_3',   name:'Ледяной завод',   desc:'Купи 25 кулеров',            type:'buyCooler',   target:25,   reward:{crystals:5} },
  { id:'q_form_1',   name:'Каркас',          desc:'Поставь 3 формы',            type:'buyForm',     target:3,    reward:{money:900} },
  { id:'q_form_2',   name:'Монтаж',          desc:'Поставь 8 форм',             type:'buyForm',     target:8,    reward:{money:5000} },
  { id:'q_form_3',   name:'Застройка',       desc:'Поставь 12 формы',           type:'buyForm',     target:12,   reward:{crystals:3} },
  { id:'q_upg_1',    name:'Настройка',       desc:'Купи 5 апгрейдов',           type:'buyUpgrade',  target:5,    reward:{money:3000} },
  { id:'q_upg_2',    name:'Оптимизация',     desc:'Купи 20 апгрейдов',          type:'buyUpgrade',  target:20,   reward:{money:20000} },
  { id:'q_upg_3',    name:'Инженерия',       desc:'Купи 50 апгрейдов',          type:'buyUpgrade',  target:50,   reward:{crystals:8} },
  { id:'q_prest_1',  name:'Реинвест',        desc:'Сделай престиж',             type:'prestige',    target:1,    reward:{crystals:5} },
  { id:'q_prest_2',  name:'Серия',           desc:'Сделай 3 престижа',          type:'prestige',    target:3,    reward:{crystals:12} },
  { id:'q_off_1',    name:'Смена',           desc:'Собери офлайн-крипту',       type:'collectOffline', target:1, reward:{money:2500} },
  { id:'q_off_2',    name:'Ночная вахта',    desc:'Собери офлайн 3 раза',       type:'collectOffline', target:3, reward:{crystals:3} },
];

// ---- Ежедневные задания (сброс раз в сутки) ----
DATA.DAILY = [
  { id:'d_mine1', name:'Дневная норма',  desc:'Добудь 5 000 крипты',   type:'mineCrypto',   target:5e3,  reward:{money:1500} },
  { id:'d_mine2', name:'Крупный блок',   desc:'Добудь 100 000 крипты', type:'mineCrypto',   target:1e5,  reward:{money:12000} },
  { id:'d_earn1', name:'Дневная касса',  desc:'Заработай 10 000 денег',type:'earnMoney',    target:1e4,  reward:{money:2000} },
  { id:'d_earn2', name:'Оборот',         desc:'Заработай 1 млн денег', type:'earnMoney',    target:1e6,  reward:{crystals:2} },
  { id:'d_gpu1',  name:'Закупка карт',   desc:'Купи 3 видеокарты',     type:'buyGpu',       target:3,    reward:{money:1200} },
  { id:'d_gpu2',  name:'Обновление',     desc:'Купи 10 видеокарт',     type:'buyGpu',       target:10,   reward:{money:6000} },
  { id:'d_cool1', name:'Прохлада',       desc:'Купи 3 кулера',         type:'buyCooler',    target:3,    reward:{money:1000} },
  { id:'d_form1', name:'Монтаж',         desc:'Поставь 2 формы',       type:'buyForm',      target:2,    reward:{money:800} },
  { id:'d_upg1',  name:'Настройка',      desc:'Купи 5 апгрейдов',      type:'buyUpgrade',   target:5,    reward:{money:3000} },
  { id:'d_upg2',  name:'Оптимизация',    desc:'Купи 15 апгрейдов',     type:'buyUpgrade',   target:15,   reward:{money:15000} },
  { id:'d_off1',  name:'Смена',          desc:'Собери офлайн-крипту',  type:'collectOffline',target:1,   reward:{money:2000} },
  { id:'d_prest1',name:'Реинвест дня',   desc:'Сделай престиж',        type:'prestige',     target:1,    reward:{crystals:2} },
];

// ---- События (временные усиления) ----
// kind: 'hash' | 'cool' | 'rate' | 'all'; dur — секунды; mult — прибавка (0.5 = +50%)
DATA.EVENTS = [
  { id:'ev_hash1',  name:'Хеш-бум',        desc:'+50% хешрейта',   kind:'hash', mult:0.5, dur:90 },
  { id:'ev_hash2',  name:'Апрельский пик', desc:'+120% хешрейта',  kind:'hash', mult:1.2, dur:60 },
  { id:'ev_cool1',  name:'Похолодание',    desc:'+60% охлаждения',  kind:'cool', mult:0.6, dur:120 },
  { id:'ev_cool2',  name:'Ледниковый день',desc:'+150% охлаждения', kind:'cool', mult:1.5, dur:70 },
  { id:'ev_rate1',  name:'Курс вверх',     desc:'+80% к курсу',     kind:'rate', mult:0.8, dur:100 },
  { id:'ev_rate2',  name:'Бычий рынок',    desc:'+200% к курсу',    kind:'rate', mult:2.0, dur:45 },
  { id:'ev_all1',   name:'Апрельский марафон', desc:'+40% ко всему', kind:'all', mult:0.4, dur:120 },
  { id:'ev_all2',   name:'Идеальный шторм',desc:'+75% ко всему',    kind:'all', mult:0.75, dur:80 },
  { id:'ev_all3',   name:'Синергия',       desc:'+100% ко всему',   kind:'all', mult:1.0, dur:50 },
  { id:'ev_hash3',  name:'Разгон сети',    desc:'+30% хешрейта',    kind:'hash', mult:0.3, dur:180 },
  { id:'ev_cool3',  name:'Свежий ветер',   desc:'+40% охлаждения',  kind:'cool', mult:0.4, dur:150 },
  { id:'ev_rate3',  name:'Удачная сделка', desc:'+50% к курсу',     kind:'rate', mult:0.5, dur:130 },
];

// ---- Лаборатория (дерево исследований) ----
DATA.RESEARCH = [
  { id:'r_asic',      name:'ASIC-исследования',  desc:'+10% хешрейта за уровень',    kind:'hash',    effect:0.10, max:8,  money:5000,  grow:2.0, req:[] },
  { id:'r_quantum',   name:'Квантовый хеш',      desc:'+25% хешрейта за уровень',    kind:'hash',    effect:0.25, max:6,  money:1e6,   grow:2.2, req:['r_asic'] },
  { id:'r_singular',  name:'Сингулярный майнер', desc:'+60% хешрейта за уровень',    kind:'hash',    effect:0.60, max:5,  crystals:2,  grow:1.8, req:['r_quantum'] },
  { id:'r_liquid',    name:'Жидкостное охл.',    desc:'+15% охлаждения за уровень', kind:'cool',    effect:0.15, max:8,  money:4000,  grow:2.0, req:[] },
  { id:'r_cryo',      name:'Криогеника',         desc:'+30% охлаждения за уровень', kind:'cool',    effect:0.30, max:6,  money:8e5,   grow:2.2, req:['r_liquid'] },
  { id:'r_absolute',  name:'Абсолютный ноль',    desc:'+70% охлаждения за уровень', kind:'cool',    effect:0.70, max:5,  crystals:2,  grow:1.8, req:['r_cryo'] },
  { id:'r_trade',     name:'Биржевая аналитика', desc:'+0.03 к курсу за уровень',   kind:'rate',    effect:0.03, max:10, money:20000, grow:1.9, req:[] },
  { id:'r_bank',      name:'Свой банк',          desc:'+0.08 к курсу за уровень',   kind:'rate',    effect:0.08, max:10, crystals:1,  grow:1.7, req:['r_trade'] },
  { id:'r_logistics', name:'Логистика',          desc:'−2% к ценам за уровень',     kind:'price',   effect:0.02, max:10, money:15000, grow:1.9, req:[] },
  { id:'r_factory',   name:'Свой завод',         desc:'−5% к ценам за уровень',     kind:'price',   effect:0.05, max:10, crystals:1,  grow:1.7, req:['r_logistics'] },
  { id:'r_sleep',     name:'Ночной цикл',        desc:'+4% офлайн-дохода за уровень',kind:'offline', effect:0.04, max:10, money:10000, grow:1.9, req:[] },
  { id:'r_dream',     name:'Вечный сон',         desc:'+8% офлайн-дохода за уровень',kind:'offline', effect:0.08, max:8,  crystals:1,  grow:1.7, req:['r_sleep'] },
  { id:'r_grants',    name:'Гранты',             desc:'+1000 денег при старте',     kind:'start',   effect:1000, max:10, money:5000,  grow:1.9, req:[] },
  { id:'r_legacy',    name:'Наследие',           desc:'+4000 денег при старте',     kind:'start',   effect:4000, max:8,  money:1e6,   grow:2.1, req:['r_grants'] },
];

// Группы вкладок магазина
DATA.SHOP_TABS = [
  { key:'forms',   label:'Формы' },
  { key:'gpus',    label:'Видеокарты' },
  { key:'coolers', label:'Кулеры' },
  { key:'upgrades',label:'Апгрейды' },
];