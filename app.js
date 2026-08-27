/* ОЙМ Ногоон Урлан — shop */
(function () {
  'use strict';

  var PLANTS   = JSON.parse(document.getElementById('plants-data').textContent);
  var PROJECTS = JSON.parse(document.getElementById('projects-data').textContent);
  var ASSETS   = window.OIM_ASSETS || null;          // set by the standalone build
  var src = function (f) { return ASSETS ? (ASSETS[f] || '') : 'assets/' + f; };

  /* ------------------------------------------------------------------
     Facebook хуудасны Messenger. Хуудсаа солибол ЭНЭ МӨРИЙГ л засна.
     ------------------------------------------------------------------ */
  var MESSENGER = 'https://m.me/oimnogoonurlan.mn';

  /* ------------------------------------------------------------------
     Ажилтны портал (oim-dashboard) — website/portal/ санд статикаар
     байрладаг тул сайттай нэг хостод хамт байршина. Нэвтрэлтийг
     портал өөрөө хариуцна (AuthGate → Firebase Authentication).
     ------------------------------------------------------------------ */
  var PORTAL = 'portal/';

  document.querySelectorAll('[data-portal]').forEach(function (a) {
    a.setAttribute('href', PORTAL);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener');
  });

  document.querySelectorAll('[data-messenger]').forEach(function (a) {
    a.setAttribute('href', MESSENGER);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener');
  });

  var CAT_MN = { foliage:'Навчит ургамал', flowering:'Цэцэглэдэг ургамал',
                 trailing:'Мөлхөө ургамал', seedling:'Үрсэлгээ' };
  var SIZE_MN = { lg:'ТОМ', md:'ДУНД', sm:'ЖИЖИГ', xs:'Үрсэлгээ' };

  var LIGHT_MN = { bright:'Тод гэрэл', indirect:'Шууд бус гэрэл', shade:'Сүүдэрт тэсвэртэй' };
  var WATER_MN = { low:'Бага усалгаа', medium:'Дунд усалгаа', high:'Их усалгаа' };
  var WATER_FREQ = { low:'2–4 долоо хоногт нэг', medium:'5–10 хоногт нэг', high:'2–5 хоногт нэг' };
  var LEVEL_MN = { easy:'Хялбар арчилгаа', medium:'Дунд зэрэг арчилгаа', advanced:'Нарийн арчилгаа' };
  var ICON = {
    light:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 4V2M12 22v-2M4 12H2M22 12h-2M6.3 6.3 4.9 4.9M19.1 19.1l-1.4-1.4M17.7 6.3l1.4-1.4M4.9 19.1l1.4-1.4"/></svg>',
    water:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3s6 6.4 6 10.2A6 6 0 0 1 6 13.2C6 9.4 12 3 12 3Z"/></svg>',
    level:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    temp:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 14V5a2 2 0 1 1 4 0v9a4 4 0 1 1-4 0Z"/></svg>'
  };
  var SIZE_RANK = { lg:0, md:1, sm:2, xs:3 };

  var fmt = function (n) { return n.toLocaleString('en-US').replace(/,/g, "’"); };
  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c];
    });
  };

  /* ---------------------------------------------- theme */
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem('oim-theme'); } catch (e) {}
  if (stored === 'dark' || stored === 'light') root.setAttribute('data-theme', stored);

  document.getElementById('themeBtn').addEventListener('click', function () {
    var dark = root.getAttribute('data-theme') === 'dark' ||
      (!root.hasAttribute('data-theme') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    var next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('oim-theme', next); } catch (e) {}
  });

  /* ---------------------------------------------- nav */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      nav.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---------------------------------------------- router */
  var VIEWS = Array.prototype.slice.call(document.querySelectorAll('.view'));
  var navLinks = Array.prototype.slice.call(nav.querySelectorAll('a'));
  var TITLES = {
    home:     'ОЙМ Ногоон Урлан',
    shop:     'Ургамлын каталог · ОЙМ',
    care:     'Арчилгааны заавар · ОЙМ',
    services: 'Тохижилтын үнэ · ОЙМ',
    rental:   'Түрээсийн үнэ · ОЙМ',
    projects: 'Төслүүд · ОЙМ',
    contact:  'Холбоо барих · ОЙМ'
  };

  function routeName() {
    var h = (location.hash || '').replace(/^#\/?/, '').split('?')[0];
    return TITLES.hasOwnProperty(h) && h ? h : 'home';
  }

  function show(name, keepScroll) {
    VIEWS.forEach(function (v) { v.hidden = v.dataset.view !== name; });
    navLinks.forEach(function (a) {
      a.classList.toggle('is-here', a.getAttribute('href') === '#/' + name);
    });
    document.title = TITLES[name] || TITLES.home;
    if (!keepScroll) window.scrollTo(0, 0);
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }

  function go(name) {
    if (routeName() === name) { show(name); return; }
    location.hash = '#/' + name;              /* hashchange fires show() */
  }

  window.addEventListener('hashchange', function () { show(routeName()); });

  /* ---------------------------------------------- catalog state */
  var PRICE_BANDS = [
    { id:'0', label:'15,000₮ хүртэл',      lo:0,      hi:15000 },
    { id:'1', label:'15,000 – 50,000₮',    lo:15001,  hi:50000 },
    { id:'2', label:'50,000 – 300,000₮',   lo:50001,  hi:300000 },
    { id:'3', label:'300,000₮-с дээш',     lo:300001, hi:Infinity }
  ];

  var state = { cat: [], sz: [], pr: [], light: [], water: [], level: [], q: '', sort: 'feat' };

  var grid    = document.getElementById('grid');
  var empty   = document.getElementById('empty');
  var result  = document.getElementById('fResult');
  var chips   = document.getElementById('fChips');
  var badge   = document.getElementById('fBadge');
  var clearBtn= document.getElementById('fClear');
  var rail    = document.getElementById('frail');
  var railScrim = document.getElementById('fScrim');
  var qInput  = document.getElementById('q');
  var sortSel = document.getElementById('sort');

  function bandOf(price) {
    for (var i = 0; i < PRICE_BANDS.length; i++) {
      if (price >= PRICE_BANDS[i].lo && price <= PRICE_BANDS[i].hi) return PRICE_BANDS[i].id;
    }
    return '3';
  }

  function matches(p) {
    if (state.cat.length && state.cat.indexOf(p.cat) === -1) return false;
    if (state.sz.length  && state.sz.indexOf(p.sz)  === -1) return false;
    if (state.pr.length  && state.pr.indexOf(bandOf(p.price)) === -1) return false;
    if (state.light.length && state.light.indexOf(p.care.light) === -1) return false;
    if (state.water.length && state.water.indexOf(p.care.water) === -1) return false;
    if (state.level.length && state.level.indexOf(p.care.level) === -1) return false;
    if (state.q) {
      var hay = (p.en + ' ' + p.mn + ' ' + CAT_MN[p.cat] + ' ' + p.size).toLowerCase();
      if (hay.indexOf(state.q) === -1) return false;
    }
    return true;
  }

  function heightNum(p) {
    if (!p.h) return 0;
    var m = String(p.h).match(/\d+/g);
    return m ? Math.max.apply(null, m.map(Number)) : 0;
  }

  function sortList(list) {
    var s = state.sort;
    if (s === 'lo')  return list.sort(function (a, b) { return a.price - b.price; });
    if (s === 'hi')  return list.sort(function (a, b) { return b.price - a.price; });
    if (s === 'big') return list.sort(function (a, b) { return heightNum(b) - heightNum(a); });
    if (s === 'az')  return list.sort(function (a, b) { return a.mn.localeCompare(b.mn, 'mn'); });
    return list.sort(function (a, b) {          /* featured: big & documented first */
      var ca = a.sym ? 0 : 1, cb = b.sym ? 0 : 1;
      if (ca !== cb) return ca - cb;
      var ra = SIZE_RANK[a.sz], rb = SIZE_RANK[b.sz];
      if (ra !== rb) return ra - rb;
      return b.price - a.price;
    });
  }

  function cardHTML(p) {
    var second = p.img2 ? '<img class="b" src="' + src(p.img2) + '" alt="" loading="lazy">' : '';
    var inCart = cart[p.id];
    return '' +
      '<article class="card" data-id="' + p.id + '">' +
        '<div class="card-media">' +
          '<img class="a" src="' + src(p.img) + '" alt="' + esc(p.mn) + ' — ' + esc(p.en) + '" loading="lazy">' +
          second +
        '</div>' +
        '<button class="card-open" data-open="' + p.id + '" aria-label="' + esc(p.mn) + ' — дэлгэрэнгүй"></button>' +
        '<div class="card-body">' +
          '<p class="card-en">' + esc(p.en) + '</p>' +
          '<h3 class="card-mn">' + esc(p.mn) + '</h3>' +
          '<p class="card-meta">' + esc(SIZE_MN[p.sz]) +
            (p.h ? ' · савтай өндөр ' + esc(p.h) : ' · ' + esc(CAT_MN[p.cat])) + '</p>' +
          '<div class="card-care">' +
            '<span class="ctag ctag-light">' + ICON.light + esc(LIGHT_MN[p.care.light]) + '</span>' +
            '<span class="ctag ctag-water">' + ICON.water + esc(WATER_MN[p.care.water]) + '</span>' +
            '<span class="ctag ctag-level">' + ICON.level + esc(LEVEL_MN[p.care.level]) + '</span>' +
          '</div>' +
          '<div class="card-foot">' +
            '<p class="card-price">' + fmt(p.price) + '₮<small>' +
              (p.note ? esc(p.note) : 'савны үнэ тусдаа') + '</small></p>' +
            '<button class="add' + (inCart ? ' is-in' : '') + '" data-add="' + p.id + '" ' +
              'aria-label="' + esc(p.mn) + ' сагсанд нэмэх">' +
              '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  var CHIP_LABEL = {
    cat: CAT_MN,
    sz: { lg:'Хэмжээ: ТОМ', md:'Хэмжээ: ДУНД', sm:'Хэмжээ: ЖИЖИГ', xs:'Хэмжээ: Үрсэлгээ' },
    light: LIGHT_MN, water: WATER_MN, level: LEVEL_MN
  };
  function chipLabel(kind, val) {
    if (kind === 'pr') {
      for (var i = 0; i < PRICE_BANDS.length; i++) {
        if (PRICE_BANDS[i].id === val) return PRICE_BANDS[i].label;
      }
      return val;
    }
    return (CHIP_LABEL[kind] || {})[val] || val;
  }

  var FACETS = ['cat', 'sz', 'pr', 'light', 'water', 'level'];
  function activeCount() {
    return FACETS.reduce(function (n, k) { return n + state[k].length; }, 0);
  }

  function drawChips() {
    var out = [];
    FACETS.forEach(function (kind) {
      state[kind].forEach(function (val) {
        out.push('<button class="fchip" data-off="' + kind + '" data-val="' + esc(val) + '">' +
          esc(chipLabel(kind, val)) +
          '<span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></span></button>');
      });
    });
    chips.innerHTML = out.join('');
    var n = activeCount();
    badge.hidden = n === 0;
    badge.textContent = n;
    clearBtn.hidden = n === 0;
  }

  function render() {
    var list = sortList(PLANTS.filter(matches));
    grid.innerHTML = list.map(cardHTML).join('');
    empty.hidden = list.length > 0;
    result.innerHTML = (activeCount() || state.q)
      ? '<b>' + list.length + '</b> ургамал олдлоо'
      : 'Нийт <b>' + list.length + '</b> ургамал';
    drawChips();
  }

  function setFilter(kind, val, on) {
    var arr = state[kind];
    var i = arr.indexOf(val);
    if (on && i === -1) arr.push(val);
    if (!on && i !== -1) arr.splice(i, 1);
    render();
  }

  rail.addEventListener('change', function (e) {
    var box = e.target.closest('input[data-f]');
    if (box) setFilter(box.dataset.f, box.value, box.checked);
  });

  chips.addEventListener('click', function (e) {
    var c = e.target.closest('[data-off]');
    if (!c) return;
    setFilter(c.dataset.off, c.dataset.val, false);
    var box = rail.querySelector('input[data-f="' + c.dataset.off + '"][value="' + c.dataset.val + '"]');
    if (box) box.checked = false;
  });

  function clearAll() {
    FACETS.forEach(function (k) { state[k] = []; });
    rail.querySelectorAll('input[data-f]').forEach(function (b) { b.checked = false; });
    render();
  }
  clearBtn.addEventListener('click', clearAll);

  /* filter drawer (small screens) */
  var fOpen = document.getElementById('fOpen');
  function openRail() {
    rail.classList.add('is-open'); railScrim.hidden = false;
    fOpen.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeRail() {
    rail.classList.remove('is-open'); railScrim.hidden = true;
    fOpen.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  fOpen.addEventListener('click', openRail);
  document.getElementById('fClose').addEventListener('click', closeRail);
  railScrim.addEventListener('click', closeRail);

  var qt;
  qInput.addEventListener('input', function () {
    clearTimeout(qt);
    var v = this.value.trim().toLowerCase();
    qt = setTimeout(function () { state.q = v; render(); }, 140);
  });
  sortSel.addEventListener('change', function () { state.sort = this.value; render(); });

  document.querySelectorAll('[data-pick]').forEach(function (t) {
    t.addEventListener('click', function () {
      var parts = t.dataset.pick.split(':');
      clearAll();
      setFilter(parts[0], parts[1], true);
      var box = rail.querySelector('input[data-f="' + parts[0] + '"][value="' + parts[1] + '"]');
      if (box) box.checked = true;
      go('shop');
    });
  });

  document.querySelectorAll('[data-jump]').forEach(function (t) {
    t.addEventListener('click', function () {
      clearAll();
      setFilter('cat', t.dataset.jump, true);
      var box = rail.querySelector('input[data-f="cat"][value="' + t.dataset.jump + '"]');
      if (box) box.checked = true;
      go('shop');
    });
  });

  /* ---------------------------------------------- rental calculator */
  var RENT = {
    live: {
      pct:  { d10:15, d30:30, m3:40 },
      wall: { d10:400000, d30:450000, m3:500000 },
      wallMove: { A:300000, BC:350000, out:350000 },
      wallFit:  200000
    },
    art: {
      pct:  { d10:10, d30:20, m3:30 },
      wall: { d10:100000, d30:150000, m3:200000 },
      wallMove: { A:150000, BC:200000, out:200000 },
      wallFit:  150000
    }
  };
  var POT_MOVE = { A:[200000,300000], BC:[250000,400000], out:[300000,500000] };
  var POT_FIT  = [100000, 180000];
  var DUR_MN   = { d10:'1–10 хоног', d30:'11–30 хоног', m3:'1–3 сар' };
  var TYPE_MN  = { live:'Амьд ургамал', art:'Хиймэл ургамал' };
  var ZONE_MN  = { A:'Хот дотор А бүс', BC:'Хот дотор B, C бүс',
                   out:'Хотын С бүсээс гадагш', rural:'Хөдөө орон нутаг' };

  var rent = { dur:'m3', type:'live', mode:'pot', zone:'A', sides:1,
               value:5000000, area:5.76 };

  var calcEl = document.getElementById('calc');
  if (calcEl) {
    var coRows = document.getElementById('coRows');
    var elVal = document.getElementById('cVal'), elValOut = document.getElementById('cValOut');
    var elArea = document.getElementById('cArea'), elAreaOut = document.getElementById('cAreaOut');
    var elZone = document.getElementById('cZone');

    function money(n) { return fmt(Math.round(n)) + '₮'; }

    function paintTiers() {
      document.querySelectorAll('[data-rate]').forEach(function (e) {
        e.textContent = RENT[e.dataset.rate].pct[rent.dur];
      });
      document.querySelectorAll('[data-wall]').forEach(function (e) {
        e.textContent = money(RENT[e.dataset.wall].wall[rent.dur]);
      });
      document.querySelectorAll('.tier').forEach(function (t) {
        t.classList.toggle('is-on', t.dataset.type === rent.type);
      });
      document.querySelectorAll('.dseg').forEach(function (b) {
        b.classList.toggle('is-on', b.dataset.dur === rent.dur);
      });
    }

    function paintCalc() {
      var R = RENT[rent.type], rows = [], base, moveLabel, move, fit;

      if (rent.mode === 'pot') {
        base = rent.value * R.pct[rent.dur] / 100;
        rows.push(['Түрээс · ' + R.pct[rent.dur] + '% × ' + money(rent.value), money(base)]);
        if (rent.zone === 'rural') {
          moveLabel = 'Тээвэрлэлт'; move = null;
        } else {
          move = POT_MOVE[rent.zone][rent.sides - 1];
          moveLabel = 'Тээвэрлэлт · ' + ZONE_MN[rent.zone] + ', ' + rent.sides + ' талдаа';
        }
        fit = POT_FIT[0] + POT_FIT[1];
        rows.push([moveLabel, move === null ? 'Байршлаас хамаарна' : money(move)]);
        rows.push(['Суурилуулалт, буцаан авах', money(fit)]);
      } else {
        base = rent.area * R.wall[rent.dur];
        rows.push(['Түрээс · ' + rent.area + ' м² × ' + money(R.wall[rent.dur]), money(base)]);
        if (rent.zone === 'rural') { move = null; }
        else { move = R.wallMove[rent.zone]; }
        rows.push(['Тээвэрлэлт · ' + ZONE_MN[rent.zone],
                   move === null ? 'Байршлаас хамаарна' : money(move)]);
        fit = R.wallFit;
        rows.push(['Суурилуулалт, буцаан авах', money(fit)]);
      }

      var total = base + (move || 0) + fit;

      coRows.innerHTML = rows.map(function (r) {
        return '<li><span>' + esc(r[0]) + '</span><b>' + esc(r[1]) + '</b></li>';
      }).join('');
      document.getElementById('coK').textContent =
        TYPE_MN[rent.type] + ' · ' + DUR_MN[rent.dur] +
        (rent.mode === 'wall' ? ' · ургамлан хана' : '');
      document.getElementById('coTotal').textContent = money(total);
      var ex = document.getElementById('coExtra');
      if (rent.zone === 'out') {
        ex.hidden = false; ex.textContent = '+ 20’000₮ / км нэмж тооцно';
      } else if (rent.zone === 'rural') {
        ex.hidden = false; ex.textContent = 'Тээвэрлэлт байршлаас хамаарч нэмэгдэнэ';
      } else { ex.hidden = true; }
      document.getElementById('coDep').textContent =
        rent.mode === 'pot' ? money(rent.value) : 'гэрээгээр';
    }

    function paint() { paintTiers(); paintCalc(); }

    document.querySelectorAll('.dseg').forEach(function (b) {
      b.addEventListener('click', function () { rent.dur = b.dataset.dur; paint(); });
    });
    document.querySelectorAll('.tier-pick, .tier').forEach(function (b) {
      b.addEventListener('click', function () { rent.type = b.dataset.type; paint(); });
    });
    document.querySelectorAll('[data-mode]').forEach(function (b) {
      b.addEventListener('click', function () {
        rent.mode = b.dataset.mode;
        document.querySelectorAll('[data-mode]').forEach(function (o) {
          o.classList.toggle('is-on', o === b);
        });
        document.getElementById('fPot').hidden = rent.mode !== 'pot';
        document.getElementById('fWall').hidden = rent.mode !== 'wall';
        document.getElementById('fSides').hidden = rent.mode !== 'pot';
        paintCalc();
      });
    });
    document.querySelectorAll('[data-sides]').forEach(function (b) {
      b.addEventListener('click', function () {
        rent.sides = +b.dataset.sides;
        document.querySelectorAll('[data-sides]').forEach(function (o) {
          o.classList.toggle('is-on', o === b);
        });
        paintCalc();
      });
    });
    elVal.addEventListener('input', function () {
      rent.value = +this.value; elValOut.textContent = money(rent.value); paintCalc();
    });
    elArea.addEventListener('input', function () {
      rent.area = +this.value; elAreaOut.textContent = rent.area + ' м²'; paintCalc();
    });
    elZone.addEventListener('change', function () { rent.zone = this.value; paintCalc(); });

    elValOut.textContent = money(rent.value);
    elAreaOut.textContent = rent.area + ' м²';
    paint();
  }

  /* ---------------------------------------------- cart */
  var RENT_TERMS = [
    'Ургамлын тогтмол арчилгаа, хяналтыг хангах зорилгоор арчилгааны үйлчилгээг хамт авах шаардлагатай.',
    'Түрээслэгч нь ургамлыг ашиглах хугацаанд цэвэр, эрүүл, бүрэн бүтэн байдлыг хадгалан хамгаалах үүрэгтэй.',
    'Хүлээлгэн өгөх үед ургамал үхсэн, нөхөн сэргээх боломжгүй болсон тохиолдолд тухайн үеийн зах зээлийн үнийг бүрэн төлнө.',
    'Навч мөчир хугарсан, гоёлын болон эрүүл мэндийн байдал алдагдсан бол сэргээх, эмчлэх, солих зардлыг түрээслэгч хариуцна.',
    'Ургамлыг нарны шууд тусгал, хэт халуун, хүйтэн орчин, химийн бодис, механик гэмтлээс хамгаална.',
    'Байршил өөрчлөх, шилжүүлэх, гуравдагч этгээдэд ашиглуулах бол урьдчилан мэдэгдэж зөвшилцөнө.',
    'Захиалга барьцаа төлбөртэй дүн 100% төлөгдсөнөөр баталгаажна. Түрээс дуусмагц ургамлыг бүрэн бүтэн хүлээж аваад барьцаа төлбөрийг буцаана.'
  ];
  var CART_DUR = { d10:{ mn:'1–10 хоног', pct:15 },
                   d30:{ mn:'11–30 хоног', pct:30 },
                   m3: { mn:'1–3 сар',     pct:40 } };
  var checkout = { mode:'buy', dur:'m3', agreed:false };

  var cart = {};
  try { cart = JSON.parse(localStorage.getItem('oim-cart') || '{}') || {}; } catch (e) { cart = {}; }

  var cartEl    = document.getElementById('cart');
  var cartItems = document.getElementById('cartItems');
  var cartFoot  = document.getElementById('cartFoot');
  var cartDot   = document.getElementById('cartDot');
  var toastEl   = document.getElementById('toast');
  var tt;

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(tt);
    tt = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2400);
  }
  function saveCart() {
    try { localStorage.setItem('oim-cart', JSON.stringify(cart)); } catch (e) {}
  }
  function cartCount() {
    return Object.keys(cart).reduce(function (n, k) { return n + cart[k]; }, 0);
  }
  function cartTotal() {
    return Object.keys(cart).reduce(function (n, k) {
      var p = PLANTS[+k]; return n + (p ? p.price * cart[k] : 0);
    }, 0);
  }
  function syncDot() {
    var n = cartCount();
    cartDot.hidden = n === 0;
    cartDot.textContent = n;
    document.querySelectorAll('[data-add]').forEach(function (b) {
      b.classList.toggle('is-in', !!cart[b.dataset.add]);
    });
  }

  function addToCart(id, qty) {
    cart[id] = (cart[id] || 0) + (qty || 1);
    saveCart(); syncDot(); drawCart();
    toast(PLANTS[id].mn + ' сагсанд нэмэгдлээ');
  }
  function setQty(id, q) {
    if (q <= 0) delete cart[id]; else cart[id] = q;
    saveCart(); syncDot(); drawCart();
  }

  function drawCart() {
    var ids = Object.keys(cart);
    if (!ids.length) {
      cartItems.innerHTML = '<p class="cart-empty">Сагс хоосон байна.<br>' +
        'Каталогоос сонирхсон ургамлаа нэмнэ үү.</p>';
      cartFoot.innerHTML = '';
      return;
    }
    cartItems.innerHTML = ids.map(function (k) {
      var p = PLANTS[+k], q = cart[k];
      return '' +
        '<div class="ci">' +
          '<img src="' + src(p.img) + '" alt="">' +
          '<div>' +
            '<p class="ci-n">' + esc(p.mn) + '</p>' +
            '<p class="ci-m">' + esc(SIZE_MN[p.sz]) + (p.h ? ' · ' + esc(p.h) : '') + '</p>' +
            '<p class="ci-p">' + fmt(p.price * q) + '₮</p>' +
          '</div>' +
          '<div class="ci-side">' +
            '<div class="ci-q">' +
              '<button data-q="' + k + '" data-d="-1" aria-label="Хасах">−</button>' +
              '<output>' + q + '</output>' +
              '<button data-q="' + k + '" data-d="1" aria-label="Нэмэх">+</button>' +
            '</div>' +
            '<button class="ci-x" data-rm="' + k + '">Хасах</button>' +
          '</div>' +
        '</div>';
    }).join('');

    var total = cartTotal();
    var lines = ids.map(function (k) {
      var p = PLANTS[+k];
      return '· ' + p.mn + ' (' + p.en + ', ' + SIZE_MN[p.sz] + ') × ' + cart[k] +
             ' — ' + fmt(p.price * cart[k]) + '₮';
    }).join('\n');

    var modeSeg =
      '<div class="ck-seg" role="group" aria-label="Худалдан авах эсвэл түрээслэх">' +
        '<button class="cs' + (checkout.mode === 'buy' ? ' is-on' : '') + '" data-ck="buy">Худалдан авах</button>' +
        '<button class="cs' + (checkout.mode === 'rent' ? ' is-on' : '') + '" data-ck="rent">Түрээслэх</button>' +
      '</div>';

    if (checkout.mode === 'buy') {
      var body = 'Сайн байна уу.\n\nДараах ургамлыг худалдан авах хүсэлтэй байна:\n\n' + lines +
                 '\n\nНийт дүн (савны үнэ ороогүй): ' + fmt(total) + '₮' +
                 '\n\nЗахиалагчийн мэдээлэл\nНэр:\nУтас:\nИ-мэйл:\nХүргэх хаяг:\n\nБаярлалаа.';
      cartFoot.innerHTML = modeSeg +
        '<div class="cart-sum"><span>Нийт дүн</span><b>' + fmt(total) + '₮</b></div>' +
        '<p class="cart-note">Үнэд савны үнэ, тээвэрлэлт ороогүй. Борлуулалтын менежер ' +
          'тантай холбогдож эцсийн үнийг баталгаажуулна.</p>' +
        '<a class="btn btn-solid" href="mailto:oimsales11@gmail.com' +
          '?subject=' + encodeURIComponent('Ургамлын захиалга — oim.mn') +
          '&body=' + encodeURIComponent(body) + '">Захиалгын хүсэлт илгээх</a>' +
        '<a class="btn btn-ghost btn-sm" href="tel:+97677773310">Утсаар захиалах · 7777-3310</a>';
      return;
    }

    /* ---- rental checkout: terms must be accepted before the request goes out ---- */
    var D = CART_DUR[checkout.dur];
    var fee = Math.round(total * D.pct / 100);
    var due = fee + total;                 /* rental fee + refundable deposit */
    var rbody = 'Сайн байна уу.\n\nДараах ургамлыг ТҮРЭЭСЛЭХ хүсэлтэй байна:\n\n' + lines +
      '\n\nТүрээсийн хугацаа: ' + D.mn +
      '\nУргамлын нийт үнийн дүн: ' + fmt(total) + '₮' +
      '\nТүрээсийн төлбөр (' + D.pct + '%): ' + fmt(fee) + '₮' +
      '\nБарьцаа төлбөр: ' + fmt(total) + '₮' +
      '\nНийт төлөх дүн: ' + fmt(due) + '₮' +
      '\n\nТүрээсийн нөхцөлтэй танилцаж, зөвшөөрсөн.' +
      '\n\nЗахиалагчийн мэдээлэл\nНэр:\nУтас:\nИ-мэйл:\nХаяг:\nАшиглах огноо:\n\nБаярлалаа.';

    cartFoot.innerHTML = modeSeg +
      '<div class="ck-dur" role="group" aria-label="Түрээсийн хугацаа">' +
        Object.keys(CART_DUR).map(function (k) {
          return '<button class="cs' + (checkout.dur === k ? ' is-on' : '') + '" data-ckdur="' + k + '">' +
                 CART_DUR[k].mn + '</button>';
        }).join('') +
      '</div>' +
      '<ul class="ck-rows">' +
        '<li><span>Ургамлын үнийн дүн</span><b>' + fmt(total) + '₮</b></li>' +
        '<li><span>Түрээсийн төлбөр · ' + D.pct + '%</span><b>' + fmt(fee) + '₮</b></li>' +
        '<li><span>Барьцаа төлбөр <i>буцаан олгоно</i></span><b>' + fmt(total) + '₮</b></li>' +
      '</ul>' +
      '<div class="cart-sum"><span>Төлөх дүн</span><b>' + fmt(due) + '₮</b></div>' +
      '<p class="cart-note">Тээвэрлэлт, суурилуулалтыг бүсээс хамааруулан нэмж тооцно. ' +
        'Арчилгааны үйлчилгээг хамт авах шаардлагатай.</p>' +

      '<details class="ck-terms"' + (checkout.agreed ? '' : ' open') + '>' +
        '<summary>Түрээсийн нөхцөл <i>' + RENT_TERMS.length + ' заалт</i>' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>' +
        '<ol>' + RENT_TERMS.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ol>' +
      '</details>' +

      '<label class="ck-agree"><input type="checkbox" id="ckAgree"' +
        (checkout.agreed ? ' checked' : '') + '>' +
        '<span>Түрээсийн нөхцөлтэй бүрэн танилцаж, хүлээн зөвшөөрлөө</span></label>' +

      '<a class="btn btn-solid' + (checkout.agreed ? '' : ' is-off') + '"' +
        (checkout.agreed
          ? ' href="mailto:oimsales11@gmail.com?subject=' + encodeURIComponent('Түрээсийн хүсэлт — oim.mn') +
            '&body=' + encodeURIComponent(rbody) + '"'
          : ' aria-disabled="true"') +
        '>Түрээсийн хүсэлт илгээх</a>' +
      '<a class="btn btn-ghost btn-sm" href="tel:+97677773310">Утсаар зөвлөгөө авах · 7777-3310</a>';
  }

  function openCart() {
    drawCart(); cartEl.hidden = false;
    document.body.style.overflow = 'hidden';
    cartEl.querySelector('.x-btn').focus();
  }
  function closeCart() { cartEl.hidden = true; document.body.style.overflow = ''; }

  document.getElementById('cartBtn').addEventListener('click', openCart);
  cartEl.addEventListener('click', function (e) {
    if (e.target.closest('[data-cart-close]')) return closeCart();
    var q = e.target.closest('[data-q]');
    if (q) return setQty(q.dataset.q, (cart[q.dataset.q] || 0) + (+q.dataset.d));
    var rm = e.target.closest('[data-rm]');
    if (rm) return setQty(rm.dataset.rm, 0);
    var ck = e.target.closest('[data-ck]');
    if (ck) { checkout.mode = ck.dataset.ck; return drawCart(); }
    var cd = e.target.closest('[data-ckdur]');
    if (cd) { checkout.dur = cd.dataset.ckdur; return drawCart(); }
    var off = e.target.closest('.btn.is-off');
    if (off) {
      e.preventDefault();
      var box = document.getElementById('ckAgree');
      if (box) { box.focus(); box.closest('.ck-agree').classList.add('shake'); 
                 setTimeout(function(){ box.closest('.ck-agree').classList.remove('shake'); }, 500); }
      toast('Түрээсийн нөхцөлийг хүлээн зөвшөөрнө үү');
    }
  });
  cartEl.addEventListener('change', function (e) {
    if (e.target.id === 'ckAgree') { checkout.agreed = e.target.checked; drawCart(); }
  });

  /* ---------------------------------------------- quick view */
  var sheet = document.getElementById('sheet');
  var sheetBody = document.getElementById('sheetBody');
  var lastFocus = null;

  function openSheet(id) {
    var p = PLANTS[id];
    var imgs = [p.img, p.img2].filter(Boolean);
    var thumbs = imgs.length > 1
      ? '<div class="sv-thumbs">' + imgs.map(function (f, i) {
          return '<button class="' + (i ? '' : 'is-on') + '" data-img="' + src(f) + '" ' +
                 'aria-label="Зураг ' + (i + 1) + '"><img src="' + src(f) + '" alt=""></button>';
        }).join('') + '</div>'
      : '';

    function fact(icon, label, value) {
      return '<div class="sv-fact">' + ICON[icon] +
        '<div><b>' + label + '</b><span>' + esc(value) + '</span></div></div>';
    }
    var facts = '<div class="sv-facts">' +
      fact('light', 'Гэрэл',    LIGHT_MN[p.care.light]) +
      fact('water', 'Усалгаа',  WATER_FREQ[p.care.water]) +
      fact('level', 'Арчилгаа', LEVEL_MN[p.care.level]) +
      fact('temp',  'Температур', p.care.temp || '18–25°C') +
      '</div>';

    var care = '<div class="sv-care">' +
      (p.sym ? '<h4>Бэлгэдэл</h4><p>' + esc(p.sym) + '</p>' : '') +
      (p.wat ? '<h4>Усалгааны горим</h4><p>' + esc(p.wat) + '</p>' : '') +
      (p.loc ? '<h4>Байршил</h4><p>' + esc(p.loc) + '</p>' : '') +
      '</div>';

    sheetBody.innerHTML = '' +
      '<div class="sv">' +
        '<div class="sv-media"><img id="svImg" src="' + src(p.img) + '" alt="' + esc(p.mn) + '">' + thumbs + '</div>' +
        '<div class="sv-body">' +
          '<p class="sv-en">' + esc(p.en) + '</p>' +
          '<h2 class="sv-mn" id="sheetName">' + esc(p.mn) + '</h2>' +
          '<div class="sv-tags">' +
            '<span class="sv-tag">' + esc(CAT_MN[p.cat]) + '</span>' +
            '<span class="sv-tag">Хэмжээ: ' + esc(SIZE_MN[p.sz]) + '</span>' +
            (p.h ? '<span class="sv-tag">Савтай өндөр ' + esc(p.h) + '</span>' : '') +
          '</div>' +
          '<div class="sv-price"><b>' + fmt(p.price) + '₮</b>' +
            (p.note ? '<span>' + esc(p.note) + '</span>' : '') + '</div>' +
          '<p class="sv-pot">' + (p.note
            ? 'Үнэд тавганы үнэ багтсан.'
            : 'Үнэд <b>савны үнэ ороогүй</b>. Сонгосон савны төрөл, хэмжээнээс ' +
              'хамаарч нэмэгдэх бөгөөд менежер эцсийн үнийг баталгаажуулна.') + '</p>' +
          '<div class="sv-buy">' +
            '<div class="qty">' +
              '<button data-sq="-1" aria-label="Хасах">−</button>' +
              '<output id="svQ">1</output>' +
              '<button data-sq="1" aria-label="Нэмэх">+</button>' +
            '</div>' +
            '<button class="btn btn-solid" data-sadd="' + p.id + '">Сагсанд нэмэх</button>' +
          '</div>' +
          facts + care +
        '</div>' +
      '</div>';

    lastFocus = document.activeElement;
    sheet.hidden = false;
    document.body.style.overflow = 'hidden';
    sheet.querySelector('.x-btn').focus();
  }

  function closeSheet() {
    sheet.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }

  grid.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add]');
    if (add) { e.preventDefault(); return addToCart(+add.dataset.add, 1); }
    var open = e.target.closest('[data-open]');
    if (open) return openSheet(+open.dataset.open);
  });

  sheet.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) return closeSheet();
    var t = e.target.closest('[data-img]');
    if (t) {
      document.getElementById('svImg').src = t.dataset.img;
      sheet.querySelectorAll('.sv-thumbs button').forEach(function (b) {
        b.classList.toggle('is-on', b === t);
      });
      return;
    }
    var q = e.target.closest('[data-sq]');
    if (q) {
      var out = document.getElementById('svQ');
      out.textContent = Math.max(1, (+out.textContent) + (+q.dataset.sq));
      return;
    }
    var a = e.target.closest('[data-sadd]');
    if (a) {
      addToCart(+a.dataset.sadd, +document.getElementById('svQ').textContent);
      closeSheet();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!sheet.hidden) closeSheet();
    else if (!cartEl.hidden) closeCart();
    else if (rail.classList.contains('is-open')) closeRail();
  });

  /* ---------------------------------------------- projects + clients */
  document.getElementById('gal').innerHTML = PROJECTS.map(function (g) {
    return '<figure><img src="' + src(g.file) + '" alt="' + esc(g.title) + '" loading="lazy"></figure>';
  }).join('');

  var CLIENTS = JSON.parse(document.getElementById('clients-data').textContent);

  function tile(c, dupe) {
    return '<div class="logo-tile"' + (dupe ? ' data-dupe aria-hidden="true"' : '') + '>' +
      '<img src="' + src(c.file) + '" alt="' + esc(c.name) + '" loading="lazy" ' +
      'width="170" height="66"></div>';
  }
  var half = Math.ceil(CLIENTS.length / 2);
  var rows = [CLIENTS.slice(0, half), CLIENTS.slice(half)];
  document.querySelectorAll('.mq-track').forEach(function (track, i) {
    var row = rows[i] || [];
    track.innerHTML = row.map(function (c) { return tile(c, false); }).join('') +
                      row.map(function (c) { return tile(c, true); }).join('');
  });

  /* ---------------------------------------------- featured strip (home) */
  var featEl = document.getElementById('gridFeat');
  if (featEl) {
    var FEATURED = ['Fern - Boston', 'Sansevieria - Snake plan', 'Zemoculcas plant',
                    'Golden pothos', 'Monstera plant delicosia', 'Peace lily',
                    'Palm tree - Areca', 'Bird of paradise'];
    var picked = FEATURED.map(function (en) {
      var hits = PLANTS.filter(function (p) { return p.en === en; });
      hits.sort(function (a, b) { return SIZE_RANK[a.sz] - SIZE_RANK[b.sz]; });
      return hits[0];
    }).filter(Boolean);
    featEl.innerHTML = picked.map(cardHTML).join('');
    featEl.addEventListener('click', function (e) {
      var add = e.target.closest('[data-add]');
      if (add) { e.preventDefault(); return addToCart(+add.dataset.add, 1); }
      var open = e.target.closest('[data-open]');
      if (open) return openSheet(+open.dataset.open);
    });
  }

  /* ---------------------------------------------- go */
  render();
  show(routeName(), true);
  syncDot();
})();
