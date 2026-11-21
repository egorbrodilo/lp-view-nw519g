// Cards: the list (two Love&Pay cards over the living globe with an orbit) and a card page with the real terms.
(() => {
  const face = (c, cls) => `<div class="cards-face cards-${c.id} ${cls || ''}"><span class="cards-mono">${LOGO.mono}</span><i class="cards-chip"></i><b class="cards-net">${APP.esc(c.net)}</b></div>`;

  APP.screen('cards', {
    title: 'Карты',
    render(root, ctx) {
      const R = REAL.cards, D = ctx.state, visa = D.cards[0];
      root.innerHTML = `
        <h1 class="h1 cards-title">Карты</h1>
        <p class="muted cards-lead">${APP.esc(R.about)}</p>
        <section class="hero cards-hero"><canvas></canvas>
          <button class="cards-pos cards-pos1" data-go="card/visa" aria-label="Карта Love&Pay Visa">${face(R.visa)}</button>
          <button class="cards-pos cards-pos2" data-go="card/mc" aria-label="Карта Love&Pay Mastercard">${face(R.mc)}</button>
        </section>
        <div class="panel tight">
          <button class="li" data-go="card/visa"><span class="ico">${APP.icon('card', 1)}</span><span><b>Love&amp;Pay Visa</b><span>•• ${APP.esc(visa.last)}, демо-баланс</span></span><span class="v">${APP.money(visa.balance, 'USD')}</span></button>
          <button class="li" data-go="card/mc"><span class="ico">${APP.icon('plus', 1)}</span><span><b>Love&amp;Pay Mastercard</b><span>Выпуск карты: 50 $, 10 $ поступают на баланс</span></span>${APP.icon('chev', 0, 'chev')}</button>
        </div>
        <p class="slogan center cards-slogan">Платить не значит тратить,<br>платить значит творить.</p>`;
      const cv = APP.$('canvas', root), w = cv.clientWidth, h = cv.clientHeight;
      APP.threads(cv, 3, { cx: w / 2, cy: h / 2 + 4, R: 96, rx: 150, ry: 50, rot: -17 }, { n: 130, stars: 8 });
    },
  });

  APP.screen('card', {
    title: 'Карта Visa', tab: 'cards', link: 'card/visa',
    render(root, ctx) {
      const c = ctx.arg === 'mc' ? REAL.cards.mc : REAL.cards.visa, mine = ctx.state.cards.find((x) => x.id === c.id) || {}, issued = mine.issued !== false;
      root.innerHTML = APP.top(c.name) + `
        <div class="cards-big">${face(c, 'cards-lg')}</div>
        ${issued ? `<div class="center cards-bal"><div class="label">Баланс карты, демо</div><div class="amount">${APP.nf(mine.balance || 0)}<small>$</small></div></div>
        <div class="actions cards-actions">
          <button class="act" data-toast="Пополнение карты: демо"><i>${APP.icon('down', 1)}</i>Пополнить</button>
          <button class="act" data-toast="Реквизиты карты: демо"><i>${APP.icon('eye', 1)}</i>Реквизиты</button>
          <button class="act" data-toast="Карта заморожена: демо"><i>${APP.icon('snow', 1)}</i>Заморозить</button>
          <button class="act" data-go="history"><i>${APP.icon('clock', 1)}</i>История</button>
        </div>` : `<button class="btn cards-issue" data-toast="Заявка на выпуск карты: демо">Выпустить за ${c.issue}&nbsp;$</button>`}
        <section class="stack cards-terms">
          <h2 class="h2">Условия</h2>
          <dl class="panel tight">${c.terms.map((t) => `<div class="kv"><dt>${APP.esc(t[0])}</dt><dd>${APP.esc(t[1])}</dd></div>`).join('')}</dl>
          <p class="note">Условия карты указаны по материалам Love&amp;Pay. Баланс и номер карты показаны для примера.</p>
        </section>`;
    },
  });
})();
