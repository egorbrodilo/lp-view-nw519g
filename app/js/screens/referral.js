// Referral programme: two orbits of light (line 1 and line 2), the personal link, and the real terms table.
APP.screen('referral', {
  title: 'Реферальная программа', tab: 'services',
  render(root, ctx) {
    const R = REAL.referral, D = ctx.state.referral;
    root.innerHTML = APP.top('Реферальная программа') + `
      <section class="hero ref-hero"><canvas></canvas></section>
      <p class="lead center">${APP.esc(R.lead[0])}</p>
      <div class="panel ref-link">
        <div class="label">Ваша ссылка, демо</div>
        <div class="rowx"><b class="ref-url">${APP.esc(D.link)}</b><button class="btn sm ghost" data-copy="${APP.esc(D.link)}">${APP.icon('copy')}Копировать</button></div>
      </div>
      <div class="ref-stats">
        <div class="panel"><div class="label">1 линия</div><div class="num ref-n">${D.line1}</div><span class="muted">приглашены вами</span></div>
        <div class="panel"><div class="label">2 линия</div><div class="num ref-n">${D.line2}</div><span class="muted">приглашены ими</span></div>
      </div>
      <p class="note center">Число приглашённых показано для примера.</p>
      <section class="stack ref-sec">
        <h2 class="h2">Условия программы</h2>
        <div class="panel tight">
          <table class="ref-table">
            <thead><tr><th scope="col">Продукт</th><th scope="col">1 линия</th><th scope="col">2 линия</th></tr></thead>
            <tbody>${R.terms.map((t) => `<tr><th scope="row">${APP.esc(t[0])}</th><td class="ref-l1">${APP.esc(t[1])}</td><td>${APP.esc(t[2])}</td></tr>`).join('')}</tbody>
          </table>
        </div>
        <p class="note">${APP.esc(R.termsNote)}</p>
      </section>
      <section class="stack ref-sec">
        <h2 class="h2">${APP.esc(R.agentTitle)}</h2>
        <p class="muted">${APP.esc(R.agent)}</p>
        <button class="btn ghost" data-toast="Заявка партнёра: демо">Стать бизнес-партнёром</button>
      </section>
      <p class="slogan center ref-slogan">${APP.esc(REAL.slogans.referral)}</p>`;
    const cv = APP.$('canvas', root), w = cv.clientWidth, h = cv.clientHeight;
    APP.threads(cv, 9, { cx: w / 2, cy: h / 2, r1: 44, r2: 88 }, { n: 140, stars: 8 });
  },
});
