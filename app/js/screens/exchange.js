// Exchange: two linked rings of light (two sides of a deal), "you give / you get" with a demo rate.
APP.screen('exchange', {
  title: 'Обмен',
  render(root, ctx) {
    const rate = ctx.state.rate.usdtRub;
    root.innerHTML = `
      <h1 class="h1 ex-title">Обмен</h1>
      <p class="muted ex-lead">${APP.esc(REAL.features[1][1])}</p>
      <section class="hero ex-hero"><canvas></canvas></section>
      <div class="panel ex-box">
        <label class="field big"><span class="label">Отдаёте, ₽</span><input class="ex-from" inputmode="decimal" value="10 000" aria-label="Сумма в рублях"></label>
        <div class="ex-mid"><span class="hr"></span><span class="ex-swap">${APP.icon('swap', 1)}</span><span class="hr"></span></div>
        <div><div class="label">Получаете, USDT</div><div class="amount ex-to">125,00</div></div>
      </div>
      <dl class="panel tight"><div class="kv"><dt>Курс, демо</dt><dd>1 USDT = ${APP.nf(rate)} ₽</dd></div></dl>
      <button class="btn" data-toast="Обмен выполнен: демо">Обменять</button>
      <p class="note center">Курс показан для примера. Пополнить баланс можно через СБП и зарубежные карты.</p>`;
    const from = APP.$('.ex-from', root), to = APP.$('.ex-to', root);
    from.addEventListener('input', () => {
      const v = parseFloat(from.value.replace(/\s/g, '').replace(',', '.')) || 0;
      to.textContent = APP.nf(v / rate);
    });
    const cv = APP.$('canvas', root), w = cv.clientWidth, h = cv.clientHeight;
    APP.threads(cv, 2, { cx: w / 2, cy: h / 2, r: 46, d: 31, rot: -10 }, { n: 120, stars: 7 });
  },
});
