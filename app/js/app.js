// Love&Pay mini app concept: shell. Screens register themselves with APP.screen(name, definition).
window.APP = (() => {
  const SCREENS = {};
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---- icons: fine lines on a 24x24 grid. icon('card') inherits the text colour, icon('card', 1) uses the brand gradient.
  const ICONS = {
    home: '<path d="M4 11.2 12 4.5l8 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-3.8v-5.6H9.3v5.6H5.5A1.5 1.5 0 0 1 4 19z"/>',
    card: '<rect x="2.8" y="5.5" width="18.4" height="13" rx="2.6"/><path d="M2.8 9.8h18.4M6.4 14.8h3.4"/>',
    swap: '<path d="M4.5 8.5h13.2M14.6 5.2l3.3 3.3-3.3 3.3M19.5 15.5H6.3M9.4 12.2l-3.3 3.3 3.3 3.3"/>',
    grid: '<rect x="4" y="4" width="6.6" height="6.6" rx="1.8"/><rect x="13.4" y="4" width="6.6" height="6.6" rx="1.8"/><rect x="4" y="13.4" width="6.6" height="6.6" rx="1.8"/><rect x="13.4" y="13.4" width="6.6" height="6.6" rx="1.8"/>',
    user: '<circle cx="12" cy="8.4" r="3.9"/><path d="M4.6 20c.9-3.6 3.8-5.4 7.4-5.4s6.500 1.800 7.400 5.400"/>',
    back: '<path d="M14.5 5.5 8 12l6.5 6.5"/>',
    chev: '<path d="M9.5 5.5 16 12l-6.500 6.500"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    up: '<path d="M12 19V5M6.500 10.500 12 5l5.500 5.500"/>',
    down: '<path d="M12 5v14M6.500 13.500 12 19l5.500-5.500"/>',
    qr: '<rect x="4" y="4" width="6" height="6" rx="1.2"/><rect x="14" y="4" width="6" height="6" rx="1.2"/><rect x="4" y="14" width="6" height="6" rx="1.2"/><path d="M14 14h2.500v2.500H14zM17.500 17.500H20V20h-2.500zM20 14v.01M14 20v.01"/>',
    sim: '<path d="M7 3.500h6.500L18.500 8.500V19A1.500 1.500 0 0 1 17 20.500H7A1.500 1.500 0 0 1 5.500 19V5A1.500 1.500 0 0 1 7 3.500z"/><rect x="8.500" y="11" width="7" height="6" rx="1.200"/><path d="M12 11v6M8.500 14h7"/>',
    globe: '<circle cx="12" cy="12" r="8.200"/><path d="M3.800 12h16.400M12 3.800c2.600 2.300 3.900 5 3.900 8.200s-1.300 5.900-3.900 8.200c-2.600-2.300-3.900-5-3.900-8.200s1.300-5.900 3.900-8.200z"/>',
    wallet: '<path d="M4 7.500A2.500 2.500 0 0 1 6.500 5h10.300a1.500 1.500 0 0 1 1.500 1.500V8"/><rect x="4" y="8" width="16.500" height="11" rx="2.400"/><path d="M15.500 13.500h5v3h-5a1.500 1.500 0 0 1 0-3z"/>',
    shop: '<path d="M4.500 9.500 5.800 4.800h12.400l1.300 4.700M4.500 9.500v9A1.500 1.500 0 0 0 6 20h12a1.500 1.500 0 0 0 1.500-1.500v-9M4.500 9.500c0 1.500 1.100 2.700 2.500 2.700s2.500-1.200 2.500-2.700c0 1.500 1.100 2.700 2.500 2.700s2.500-1.200 2.500-2.700c0 1.500 1.100 2.700 2.500 2.700s2.500-1.200 2.500-2.700"/>',
    doc: '<path d="M7 3.500h7l4.500 4.500V19A1.500 1.500 0 0 1 17 20.500H7A1.500 1.500 0 0 1 5.500 19V5A1.500 1.500 0 0 1 7 3.500z"/><path d="M14 3.500V8h4.500M8.800 12.500h6.400M8.800 16h4.400"/>',
    people: '<circle cx="12" cy="6.300" r="2.600"/><circle cx="5.600" cy="16.800" r="2.300"/><circle cx="18.400" cy="16.800" r="2.300"/><path d="M10.600 8.500 6.700 14.700M13.400 8.500l3.900 6.200M8 16.800h8"/>',
    chat: '<path d="M5.500 5h13A1.500 1.500 0 0 1 20 6.500v8a1.500 1.500 0 0 1-1.500 1.500H11l-4.500 3.500V16H5.500A1.500 1.500 0 0 1 4 14.500v-8A1.500 1.500 0 0 1 5.500 5z"/><path d="M12 13.400c-2.100-1.500-3.100-2.600-3.100-3.800a1.600 1.600 0 0 1 3.100-.6 1.600 1.600 0 0 1 3.100.6c0 1.200-1 2.300-3.100 3.800z"/>',
    shield: '<path d="M12 3.500 19 6v5.300c0 4.600-2.900 7.900-7 9.700-4.100-1.800-7-5.100-7-9.700V6z"/><circle cx="12" cy="11" r="1.900"/><path d="M12 12.900v2.900"/>',
    lock: '<rect x="5.500" y="10.500" width="13" height="9.500" rx="2.200"/><path d="M8.500 10.500V8a3.500 3.500 0 0 1 7 0v2.500"/>',
    key: '<circle cx="8" cy="15.500" r="3.500"/><path d="M10.600 13 19 4.600M16 7.600l2.400 2.400M13.600 10l1.900 1.900"/>',
    star: '<path d="m12 4 2.300 4.900 5.200.7-3.800 3.700.9 5.300L12 16.100l-4.600 2.500.9-5.300-3.800-3.700 5.200-.7z"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.700 0l3-3a4 4 0 0 0-5.700-5.700l-1.100 1.100M14 10a4 4 0 0 0-5.700 0l-3 3a4 4 0 0 0 5.700 5.700l1.100-1.100"/>',
    copy: '<rect x="8.500" y="8.500" width="11" height="11" rx="2.200"/><path d="M15.500 8.500V6.700A2.200 2.200 0 0 0 13.300 4.500H6.700A2.200 2.200 0 0 0 4.500 6.700v6.600a2.200 2.200 0 0 0 2.200 2.200h1.800"/>',
    check: '<path d="m5 12.500 4.500 4.500L19 7.500"/>',
    clock: '<circle cx="12" cy="12" r="8.200"/><path d="M12 7.500V12l3 2"/>',
    chart: '<path d="M4.500 19.500h15M7 16.500v-5M12 16.500V7M17 16.500v-8"/>',
    code: '<path d="m8.500 8-4 4 4 4M15.500 8l4 4-4 4M13.500 5.500l-3 13"/>',
    plane: '<path d="M20 4 3.500 10.500l6 2.500 2.500 6z"/><path d="M9.500 13 20 4"/>',
    bank: '<path d="M4 9.500 12 4.500l8 5M5.500 9.500h13M6.500 9.500v7M10.200 9.500v7M13.800 9.500v7M17.500 9.500v7M4.500 19.500h15M5.500 16.500h13"/>',
    gift: '<rect x="4.500" y="9.500" width="15" height="10.500" rx="1.800"/><path d="M3.500 9.500h17v-2.500h-17zM12 7v13M12 7c-1.800-3.400-5.500-3-5 0M12 7c1.800-3.400 5.500-3 5 0"/>',
    eye: '<path d="M2.800 12c2.300-4 5.400-6 9.200-6s6.900 2 9.200 6c-2.300 4-5.400 6-9.200 6s-6.900-2-9.200-6z"/><circle cx="12" cy="12" r="2.800"/>',
    more: '<circle cx="5.500" cy="12" r="1.100"/><circle cx="12" cy="12" r="1.100"/><circle cx="18.500" cy="12" r="1.100"/>',
    snow: '<path d="M12 3.500v17M4.600 7.700l14.800 8.600M4.600 16.300l14.800-8.600M9.500 4.800 12 7l2.500-2.200M9.500 19.200 12 17l2.500 2.200"/>',
    tg: '<path d="M20.500 4.500 3.500 11l5 1.900 1.900 5.600 2.900-3.500 4.400 3.200z"/><path d="m8.500 12.900 8-5"/>',
    inf: '<path d="M12 12c-1.700-2.300-3.300-3.500-5-3.500a3.500 3.500 0 0 0 0 7c1.700 0 3.300-1.200 5-3.500zm0 0c1.700 2.300 3.300 3.500 5 3.500a3.500 3.500 0 0 0 0-7c-1.700 0-3.300 1.200-5 3.500z"/>',
  };
  const icon = (name, grad, cls) => '<svg class="i' + (grad ? ' g' : '') + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || ICONS.more) + '</svg>';
  const addIcon = (name, paths) => { ICONS[name] = paths; };

  // ---- formatting
  const nf = (v, d) => Number(v).toLocaleString('ru-RU', { minimumFractionDigits: d === undefined ? 2 : d, maximumFractionDigits: d === undefined ? 2 : d });
  const SIGN = { USD: '$', USDT: 'USDT', RUB: '₽', KGS: 'сом' };
  const money = (v, cur, d) => (cur === 'USD' ? nf(v, d) + ' $' : nf(v, d) + ' ' + (SIGN[cur] || cur));

  // ---- the QR code of the client's mini app (real, scannable): APP.qr() -> svg string
  function qr(color) {
    const m = window.QR || '', n = Math.round(Math.sqrt(m.length));
    let cells = '';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (m[y * n + x] === '1') cells += '<rect x="' + (x + 0.07) + '" y="' + (y + 0.07) + '" width=".86" height=".86" rx=".24"/>';
    return '<svg class="qr" viewBox="-1 -1 ' + (n + 2) + ' ' + (n + 2) + '" fill="' + (color || 'currentColor') + '" role="img" aria-label="QR-код мини-приложения Love&amp;Pay">' + cells + '</svg>';
  }

  // ---- living thread pictures: APP.threads(canvas, sceneNumber, cfg, opts). They stop by themselves when the screen is replaced.
  const threads = (canvas, n, cfg, opts) => DECK.view(canvas, n, cfg, opts);

  // ---- sheet and toast
  let toastT = 0;
  function toast(text) {
    const t = $('#toast'); t.textContent = text; t.classList.add('on');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2000);
  }
  function sheet(html, wire) {
    const s = $('#sheet');
    s.innerHTML = '<div class="scrim" data-close></div><div class="box" role="dialog" aria-modal="true"><div class="grab"></div>' + html + '</div>';
    s.classList.add('on');
    s.onclick = (e) => { if (e.target.closest('[data-close]')) closeSheet(); };
    if (wire) wire($('.box', s));
    return $('.box', s);
  }
  function closeSheet() { const s = $('#sheet'); s.classList.remove('on'); s.innerHTML = ''; }

  // ---- screens and routing. Route: #/name or #/name/arg (optionally ?sheet=xxx for snapshots)
  function screen(name, def) { SCREENS[name] = def; }
  const TABS = [['home', 'Главная', 'home'], ['cards', 'Карты', 'card'], ['exchange', 'Обмен', 'swap'], ['services', 'Сервисы', 'grid'], ['profile', 'Профиль', 'user']];
  function parse() {
    const raw = (location.hash || '#/home').replace(/^#\/?/, ''), q = raw.split('?');
    const parts = q[0].split('/').filter(Boolean), params = {};
    (q[1] || '').split('&').filter(Boolean).forEach((kv) => { const p = kv.split('='); params[p[0]] = decodeURIComponent(p[1] || ''); });
    return { name: parts[0] || 'home', arg: parts[1], params };
  }
  const go = (route) => { location.hash = '#/' + route.replace(/^#?\/?/, ''); };
  const back = () => { if (history.length > 1) history.back(); else go('home'); };

  // header of an inner screen: APP.top('Title') -> html with a back button
  const top = (title, opts) => '<header class="top' + (opts && opts.left ? ' left' : '') + '"><button class="back" data-back aria-label="Назад">' + icon('back') + '</button><div class="t">' + esc(title) + '</div></header>';

  // a section that is not built yet says so honestly instead of silently showing another screen
  const SOON = {
    title: '', tab: '',
    render(root) {
      root.innerHTML = top('Раздел') + '<div class="soon"><p class="h2 it center">Этот раздел появится в&nbsp;следующей версии прототипа</p><button class="btn ghost" data-go="home">На главную</button></div>';
    },
  };

  function render() {
    const r = parse(), def = SCREENS[r.name] || SOON, view = $('#view');
    closeSheet();
    const root = document.createElement('div');
    root.className = 'screen s-' + r.name.replace(/[^a-z0-9_-]/gi, '');
    view.innerHTML = ''; view.appendChild(root); view.scrollTop = 0;
    const notab = !!def.notab;
    view.classList.toggle('notab', notab); $('.tabbar').classList.toggle('hide', notab); $('.fade').classList.toggle('hide', notab);
    $$('.tabbar a').forEach((a) => a.classList.toggle('on', a.dataset.tab === (def.tab === undefined ? r.name : def.tab)));
    try {
      def.render(root, { arg: r.arg, params: r.params, state: window.DATA });
      if (r.params.sheet && def.sheets && def.sheets[r.params.sheet]) def.sheets[r.params.sheet](root);
    } catch (e) {
      root.innerHTML = top('Ошибка') + '<p class="note">Экран не открылся: ' + esc(e && e.message ? e.message : String(e)) + '</p>';
    }
    document.title = 'Love&Pay' + (def.title ? ': ' + def.title : '');
  }

  function copy(text, msg) {
    try { if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {}); } catch (e) { /* no clipboard here */ }
    toast(msg || 'Скопировано');
  }

  function start() {
    $('.tabbar').innerHTML = TABS.map((t) => '<a href="#/' + t[0] + '" data-tab="' + t[0] + '">' + icon(t[2]) + '<span>' + t[1] + '</span></a>').join('');
    const nav = $('.desk-note nav');
    if (nav) nav.innerHTML = Object.keys(SCREENS).filter((k) => SCREENS[k].title && !SCREENS[k].hidden).map((k) => '<a href="#/' + (SCREENS[k].link || k) + '">' + esc(SCREENS[k].title) + '</a>').join('');
    if (window.APP_START) history.replaceState(null, '', window.APP_START);
    // one click handler for the whole phone: screens and sheets
    $('.phone').addEventListener('click', (e) => {
      const b = e.target.closest('[data-back]'); if (b) { back(); return; }
      const g = e.target.closest('[data-go]'); if (g) { closeSheet(); go(g.dataset.go); return; }
      const c = e.target.closest('[data-copy]'); if (c) { copy(c.dataset.copy); return; }
      const t = e.target.closest('[data-toast]'); if (t) toast(t.dataset.toast);
    });
    addEventListener('hashchange', render);
    render();
  }

  return { screen, start, go, back, top, icon, addIcon, money, nf, esc, toast, sheet, closeSheet, threads, qr, copy, $, $$ };
})();
