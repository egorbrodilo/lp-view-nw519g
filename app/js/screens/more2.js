// The rest of the sections: wallets, transfers abroad, invoices, top up, send, pay by QR, history, account, subscriptions, support.
(() => {
  const I = APP.icon, esc = APP.esc;
  const rows = (list, icons) => list.map((p, i) => `<div class="li m2-li"><span class="ico">${I(icons[i % icons.length], 1)}</span><span>${Array.isArray(p) ? `<b>${esc(p[0])}</b><span>${esc(p[1])}</span>` : `<b class="m2-plain">${esc(p)}</b>`}</span></div>`).join('');
  const hist = (list) => list.map((h) => `<div class="li"><span class="ico">${I(h.dir === 'in' ? 'down' : 'up')}</span><span><b>${esc(h.t)}</b><span>${esc(h.d)}</span></span><span class="v${h.dir === 'in' ? ' blue' : ''}">${esc(h.v)}</span></div>`).join('');

  APP.screen('wallets', {
    title: 'Транзитные кошельки', tab: 'services',
    render(root, ctx) {
      const W = REAL.wallets;
      root.innerHTML = APP.top('Транзитные кошельки') + `
        <section class="hero m2-hero-w"><canvas></canvas></section>
        <p class="lead center">${esc(W.lead)}</p>
        <button class="btn m2-gap" data-toast="Новый кошелёк создан: демо">${I('plus')}Создать кошелёк</button>
        <div class="panel tight">${ctx.state.wallets.map((w) => `
          <div class="li"><span class="ico">${I('wallet', 1)}</span><span><b>${esc(w.name)}</b><span>AML: ${esc(w.aml)}, демо</span></span><span class="v">${APP.money(w.balance, 'USDT')}</span></div>`).join('')}
        </div>
        <p class="note center">Названия, балансы и статусы кошельков показаны для примера.</p>
        <div class="panel tight m2-gap">${rows(W.points, ['shield', 'plus', 'star', 'grid'])}</div>
        <p class="slogan center m2-slogan">Не только пользоваться,<br>но и создавать, изменять, структурировать.</p>`;
      const cv = APP.$('canvas', root), w = cv.clientWidth, h = cv.clientHeight;
      APP.threads(cv, 8, { cx: w / 2, cy: h / 2 + 6, R: 40, r: 16, D: 96 }, { n: 140, stars: 8 });
    },
  });

  APP.screen('intl', {
    title: 'Международные переводы', tab: 'services',
    render(root) {
      const T = REAL.intl;
      root.innerHTML = APP.top('Международные переводы') + `
        <div class="m2-formula" aria-label="от 111 долларов до бесконечности"><span>$111 — $</span><canvas></canvas></div>
        <p class="lead center">${esc(T.lead)}</p>
        <div class="stack m2-gap">
          <div><div class="label m2-lab">Как отправляете</div><div class="seg"><button class="on">Безналичные</button><button>Наличные</button></div></div>
          <div><div class="label m2-lab">Как получаете</div><div class="seg"><button class="on">В валюте</button><button>USDT</button></div></div>
          <button class="btn" data-toast="Заявка на перевод отправлена: демо">Оставить заявку</button>
        </div>
        <div class="panel tight m2-gap">${rows(T.points, ['people', 'up', 'shop', 'chat'])}</div>
        <p class="slogan center m2-slogan">У любви нет границ<br>и&nbsp;у&nbsp;наших возможностей тоже.</p>`;
      root.addEventListener('click', (e) => {
        const b = e.target.closest('.seg button'); if (!b) return;
        [...b.parentNode.children].forEach((x) => x.classList.toggle('on', x === b));
      });
      const cv = APP.$('canvas', root), w = cv.clientWidth, h = cv.clientHeight;
      APP.threads(cv, 7, { cx: w / 2, cy: h / 2, a: w * 0.44, rot: 0 }, { n: 110, stars: 6 });
    },
  });

  APP.screen('invoice', {
    title: 'Международные расчёты', tab: 'services',
    render(root) {
      const B = REAL.intlBiz;
      root.innerHTML = APP.top('Международные расчёты') + `
        <section class="hero m2-hero-i"><canvas></canvas></section>
        <p class="lead center">${esc(B.lead)}</p>
        <button class="btn m2-gap" data-toast="Инвойс отправлен на расчёт: демо">${I('doc')}Отправить инвойс</button>
        <p class="note center">${esc(B.cta)}</p>
        <div class="panel tight m2-gap">${rows(B.points, ['globe', 'clock', 'eye', 'key', 'shield', 'check', 'lock', 'doc'])}</div>
        <p class="slogan center m2-slogan">Мы с вами от самого начала.<br>Мы с вами до самого конца.</p>`;
      const cv = APP.$('canvas', root), w = cv.clientWidth, h = cv.clientHeight;
      APP.threads(cv, 6, { ax: 44, ay: h * 0.72, bx: w - 44, by: h * 0.36, h: h * 0.42 }, { n: 130, stars: 10 });
    },
  });

  APP.screen('topup', {
    title: 'Пополнение', tab: 'home',
    render(root) {
      root.innerHTML = APP.top('Пополнить баланс') + `
        <label class="field big"><span class="label">Сумма, ₽, демо</span><input inputmode="decimal" value="10 000" aria-label="Сумма пополнения"></label>
        <h2 class="h2 m2-h">Способ</h2>
        <div class="panel tight">
          <button class="li" data-toast="Пополнение через СБП: демо"><span class="ico">${I('bank', 1)}</span><span><b>СБП</b><span>Из приложения банка</span></span>${I('chev', 0, 'chev')}</button>
          <button class="li" data-toast="Пополнение с карты: демо"><span class="ico">${I('card', 1)}</span><span><b>Зарубежные карты</b><span>Оплата картой</span></span>${I('chev', 0, 'chev')}</button>
        </div>
        <p class="note center m2-gap">${esc(REAL.about)}</p>`;
    },
  });

  APP.screen('send', {
    title: 'Перевод', tab: 'home',
    render(root) {
      root.innerHTML = APP.top('Перевести') + `
        <div class="stack">
          <label class="field"><span class="label">Адрес получателя</span><input placeholder="Вставьте адрес кошелька" aria-label="Адрес получателя"></label>
          <label class="field big"><span class="label">Сумма, USDT, демо</span><input inputmode="decimal" value="100" aria-label="Сумма перевода"></label>
          <button class="btn" data-toast="Перевод отправлен: демо">Перевести</button>
          <p class="note center">${esc(REAL.features[1][1])}</p>
        </div>`;
    },
  });

  APP.screen('pay', {
    title: 'Оплата по QR', tab: 'home',
    render(root) {
      root.innerHTML = APP.top('Оплата по QR') + `
        <section class="hero m2-hero-p"><canvas></canvas><div class="over"><p class="lead it">Наведите камеру<br>на QR-код СБП</p></div></section>
        <button class="btn" data-toast="Камера: демо">${I('qr')}Открыть камеру</button>
        <p class="note center m2-gap">Оплата по QR СБП с баланса Love&amp;Pay. Экран показан для примера.</p>`;
      const cv = APP.$('canvas', root), w = cv.clientWidth, h = cv.clientHeight;
      APP.threads(cv, 5, { cx: w / 2, cy: h / 2, a: 128 }, { n: 120, stars: 8 });
    },
  });

  APP.screen('history', {
    title: 'Операции', tab: 'home',
    render(root, ctx) {
      root.innerHTML = APP.top('Операции') + `<div class="panel tight">${hist(ctx.state.history)}</div><p class="note center m2-gap">Операции показаны для примера.</p>`;
    },
  });

  APP.screen('asset', {
    title: 'Счёт', tab: 'home', hidden: true,
    render(root, ctx) {
      const a = ctx.state.assets.find((x) => x.id === ctx.arg) || ctx.state.assets[0];
      root.innerHTML = APP.top(a.name) + `
        <div class="center m2-bal"><div class="label">${esc(a.sub)}, демо</div><div class="amount">${APP.nf(a.amount)}<small>${a.cur === 'RUB' ? '₽' : esc(a.cur)}</small></div></div>
        <div class="actions m2-gap">
          <button class="act" data-go="topup"><i>${I('down', 1)}</i>Пополнить</button>
          <button class="act" data-go="exchange"><i>${I('swap', 1)}</i>Обменять</button>
          <button class="act" data-go="send"><i>${I('up', 1)}</i>Перевести</button>
          <button class="act" data-go="history"><i>${I('clock', 1)}</i>История</button>
        </div>`;
    },
  });

  APP.screen('subs', {
    title: 'Подписки', tab: 'services',
    render(root) {
      root.innerHTML = APP.top('Подписки') + `
        <p class="lead center m2-top">Оплата подписок и Telegram Premium с баланса Love&amp;Pay</p>
        <div class="panel tight m2-gap">
          <button class="li" data-toast="Оплата подписки: демо"><span class="ico">${I('star', 1)}</span><span><b>Оплата подписок</b><span>Укажите сервис и сумму</span></span>${I('chev', 0, 'chev')}</button>
          <button class="li" data-toast="Telegram Premium: демо"><span class="ico">${I('tg', 1)}</span><span><b>Telegram Premium</b><span>Себе или в подарок</span></span>${I('chev', 0, 'chev')}</button>
        </div>
        <p class="note center">Раздел показан для примера: состав подписок и цены уточняются.</p>`;
    },
  });

  APP.screen('support', {
    title: 'Поддержка 24/7', tab: 'profile',
    render(root) {
      root.innerHTML = APP.top('Поддержка 24/7') + `
        <p class="lead center m2-top">${esc(REAL.features[4][1])}</p>
        <div class="chips m2-gap m2-chips"><span class="chip">Карты</span><span class="chip">eSIM</span><span class="chip">Переводы</span><span class="chip">Бизнес</span><span class="chip">Реферальная программа</span></div>
        <button class="btn" data-toast="Чат с поддержкой: демо">${I('chat')}Написать в поддержку</button>
        <p class="slogan center m2-slogan">Те, кто понимает вас.<br>Кто чувствует вас.</p>`;
    },
  });
})();
