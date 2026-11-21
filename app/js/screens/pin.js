// Entry: PIN code. The heart of light is the first thing a person sees.
APP.screen('pin', {
  title: 'Вход по PIN-коду', notab: true,
  render(root) {
    let pin = '';
    root.innerHTML = `
      <div class="pin-wrap">
        <div class="pin-logo">${LOGO.word}</div>
        <div class="hero pin-hero"><canvas></canvas></div>
        <p class="lead it center">${REAL.slogans.cover}</p>
        <div class="label center pin-label">Введите PIN-код</div>
        <div class="pin-dots" aria-live="polite">${'<i></i>'.repeat(4)}</div>
        <div class="pin-pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button data-k="${n}">${n}</button>`).join('')}
          <button class="pin-small" data-toast="Вход через Telegram подтверждён" aria-label="Войти через Telegram">${APP.icon('tg')}</button><button data-k="0">0</button><button class="pin-small" data-k="del" aria-label="Стереть">${APP.icon('back')}</button></div>
        <p class="note center">Вход через Telegram, PIN-код и Seed фраза для восстановления доступа</p>
      </div>`;
    const dots = APP.$$('.pin-dots i', root);
    const paint = () => dots.forEach((d, i) => d.classList.toggle('on', i < pin.length));
    APP.$('.pin-pad', root).addEventListener('click', (e) => {
      const b = e.target.closest('[data-k]'); if (!b) return;
      if (b.dataset.k === 'del') pin = pin.slice(0, -1); else if (pin.length < 4) pin += b.dataset.k;
      paint();
      if (pin.length === 4) setTimeout(() => APP.go('home'), 260);
    });
    const cv = APP.$('canvas', root), w = cv.clientWidth, h = cv.clientHeight;
    APP.threads(cv, 10, { cx: w / 2, cy: h * 0.46, k: Math.min(86, h * 0.42) }, { n: 120, stars: 8 });
  },
});
