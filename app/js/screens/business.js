// For business: a QR code in a viewfinder of light, the amount to request, the client's benefits and tools.
APP.screen('business', {
  title: 'Для бизнеса', tab: 'services',
  render(root) {
    const B = REAL.business, icons = ['shield', 'chart', 'qr', 'clock'], micons = ['chart', 'code', 'user'];
    let cur = 'RUB';
    root.innerHTML = APP.top('Love&Pay для бизнеса') + `
      <h1 class="h1 center">QR-код для бизнеса</h1>
      <p class="lead center biz-lead">${APP.esc(B.lead[0])}</p>
      <section class="hero biz-hero"><canvas></canvas><div class="qrplate biz-qr">${APP.qr('#2B2130')}</div></section>
      <div class="seg biz-seg" role="tablist"><button class="on" data-cur="RUB">Рубли</button><button data-cur="KGS">Сомы</button></div>
      <label class="field big biz-field"><span class="label">Сумма к оплате, демо</span><input inputmode="decimal" value="2 500" aria-label="Сумма к оплате"></label>
      <button class="btn" data-toast="QR-код на сумму создан: демо">Создать QR-код</button>
      <button class="btn ghost biz-link" data-copy="${APP.esc(REAL.botUrl)}">${APP.icon('link')}Платёжная ссылка</button>
      <p class="note center">${APP.esc(B.lead[1])}</p>
      <section class="stack biz-sec">
        <div class="panel tight">${B.benefits.map((b, i) => `
          <div class="li"><span class="ico">${APP.icon(icons[i], 1)}</span><span><b>${APP.esc(b[0])}</b><span>${APP.esc(b[1])}</span></span><span></span></div>`).join('')}
        </div>
        <p class="lead it center">${APP.esc(B.payouts)}</p>
      </section>
      <section class="stack biz-sec">
        <h2 class="h2">Всё для управления бизнесом</h2>
        <div class="panel tight">${B.manage.map((m, i) => `
          <div class="li"><span class="ico">${APP.icon(micons[i], 1)}</span><span><b>${APP.esc(m[0])}</b><span>${APP.esc(m[1])}</span></span><span></span></div>`).join('')}
        </div>
      </section>
      <p class="slogan center biz-slogan">Те, кто понимает вас.<br>Кто чувствует вас.</p>`;
    APP.$('.biz-seg', root).addEventListener('click', (e) => {
      const b = e.target.closest('[data-cur]'); if (!b) return;
      cur = b.dataset.cur; APP.$$('.biz-seg button', root).forEach((x) => x.classList.toggle('on', x === b));
    });
    const cv = APP.$('canvas', root), w = cv.clientWidth, h = cv.clientHeight;
    APP.threads(cv, 5, { cx: w / 2, cy: h / 2, a: 104 }, { n: 120, stars: 8 });
  },
});
