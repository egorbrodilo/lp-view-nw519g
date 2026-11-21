// eSIM: signal waves around the SIM, "190+ стран" as the hero number, the client's points as a list.
APP.screen('esim', {
  title: 'eSIM', tab: 'services',
  render(root) {
    const E = REAL.esim, icons = ['wallet', 'qr', 'clock', 'chat', 'people'];
    root.innerHTML = APP.top('Love&Pay eSIM') + `
      <section class="hero esim-hero"><canvas></canvas><div class="esim-sim">${APP.icon('sim', 1)}</div></section>
      <div class="center"><div class="amount esim-num">190+<small>стран</small></div>
      <p class="lead esim-lead">${APP.esc(E.about)}</p></div>
      <button class="btn esim-btn" data-toast="Подбор eSIM: демо">Подобрать eSIM</button>
      <div class="panel tight esim-list">${E.points.slice(1).map((p, i) => `
        <div class="li"><span class="ico">${APP.icon(icons[i], 1)}</span><span><b>${APP.esc(p)}</b></span><span></span></div>`).join('')}
      </div>
      <p class="slogan center esim-slogan">Отсутствие ограничений<br>в&nbsp;выражении ваших чувств.</p>`;
    const cv = APP.$('canvas', root), w = cv.clientWidth, h = cv.clientHeight;
    APP.threads(cv, 4, { cx: w / 2, cy: h / 2, r0: 34, r1: Math.min(150, h * 0.62) }, { n: 130, stars: 6 });
  },
});
