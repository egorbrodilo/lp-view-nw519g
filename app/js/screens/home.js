// Home: total balance over the living infinity, quick actions, accounts, services, recent operations.
APP.screen('home', {
  title: 'Главная',
  render(root, ctx) {
    const D = ctx.state, I = APP.icon;
    const services = [
      ['cards', 'card', 'Карты'], ['esim', 'sim', 'eSIM'], ['intl', 'globe', 'Переводы за рубеж'],
      ['wallets', 'wallet', 'Транзитные кошельки'], ['business', 'shop', 'Для бизнеса'], ['subs', 'star', 'Подписки'],
    ];
    root.innerHTML = `
      <div class="rowx home-head"><span class="home-logo">${LOGO.word}</span><span class="badge">демо-данные</span></div>
      <section class="hero home-hero"><canvas></canvas><div class="over">
        <div class="label">Общий баланс</div>
        <div class="amount">${APP.nf(D.balance.total)}<small>USDT</small></div>
        <div class="muted home-sub">≈ ${APP.money(D.balance.total * D.rate.usdtRub, 'RUB', 0)} по демо-курсу</div>
      </div></section>
      <div class="actions">
        <button class="act" data-go="topup"><i>${I('down', 1)}</i>Пополнить</button>
        <button class="act" data-go="exchange"><i>${I('swap', 1)}</i>Обменять</button>
        <button class="act" data-go="send"><i>${I('up', 1)}</i>Перевести</button>
        <button class="act" data-go="pay"><i>${I('qr', 1)}</i>По QR</button>
      </div>
      <section class="stack home-sec">
        <h2 class="h2">Счета</h2>
        <div class="panel tight">${D.assets.map((a) => `
          <button class="li" data-go="${a.id === 'card' ? 'card/visa' : 'asset/' + a.id}"><span class="ico">${I(a.id === 'card' ? 'card' : a.id === 'rub' ? 'bank' : 'wallet', 1)}</span>
          <span><b>${APP.esc(a.name)}</b><span>${APP.esc(a.sub)}</span></span><span class="v">${APP.money(a.amount, a.cur)}</span></button>`).join('')}
        </div>
      </section>
      <section class="stack home-sec">
        <div class="rowx"><h2 class="h2">Сервисы</h2><a class="muted" href="#/services">Все</a></div>
        <div class="home-grid">${services.map((s) => `<button class="home-svc" data-go="${s[0]}">${I(s[1], 1)}<span>${s[2]}</span></button>`).join('')}</div>
      </section>
      <section class="stack home-sec">
        <div class="rowx"><h2 class="h2">Операции</h2><a class="muted" href="#/history">Все</a></div>
        <div class="panel tight">${D.history.slice(0, 4).map((h) => `
          <div class="li"><span class="ico">${I(h.dir === 'in' ? 'down' : 'up')}</span><span><b>${APP.esc(h.t)}</b><span>${APP.esc(h.d)}</span></span><span class="v${h.dir === 'in' ? ' blue' : ''}">${APP.esc(h.v)}</span></div>`).join('')}
        </div>
      </section>
      <p class="slogan center home-slogan">Платите в радости,<br>в&nbsp;счастье, в&nbsp;любви.</p>`;
    const cv = APP.$('canvas', root), w = cv.clientWidth, h = cv.clientHeight;
    APP.threads(cv, 1, { cx: w / 2, cy: h / 2, a: Math.min(184, w * 0.472), rot: -4 }, { n: 130, stars: 9 });
  },
});
