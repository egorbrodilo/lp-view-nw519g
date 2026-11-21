// Profile: security (the three means named by the client), programme and support links, about the service.
APP.screen('profile', {
  title: 'Профиль',
  render(root) {
    const I = APP.icon;
    root.innerHTML = `
      <h1 class="h1 pr-title">Профиль</h1>
      <div class="panel pr-user"><span class="pr-ava">${LOGO.mono}</span><span><b class="h3">Гость</b><span class="muted pr-sub">демо-профиль</span></span></div>
      <section class="stack pr-sec">
        <h2 class="h2">Безопасность</h2>
        <div class="panel tight">
          <div class="li"><span class="ico">${I('tg', 1)}</span><span><b>Вход через Telegram</b><span>Включён</span></span>${I('check', 0, 'chev')}</div>
          <button class="li" data-go="pin"><span class="ico">${I('lock', 1)}</span><span><b>PIN-код</b><span>Изменить</span></span>${I('chev', 0, 'chev')}</button>
          <button class="li" data-toast="Seed фраза: демо"><span class="ico">${I('key', 1)}</span><span><b>Seed фраза</b><span>Для восстановления доступа</span></span>${I('chev', 0, 'chev')}</button>
        </div>
      </section>
      <section class="stack pr-sec">
        <h2 class="h2">Love&amp;Pay</h2>
        <div class="panel tight">
          <button class="li" data-go="referral"><span class="ico">${I('people', 1)}</span><span><b>Реферальная программа</b><span>Приглашайте друзей и зарабатывайте вместе с нами</span></span>${I('chev', 0, 'chev')}</button>
          <button class="li" data-go="support"><span class="ico">${I('chat', 1)}</span><span><b>Поддержка 24/7</b><span>Любые вопросы можно решить в службе поддержки</span></span>${I('chev', 0, 'chev')}</button>
          <button class="li" data-go="services"><span class="ico">${I('grid', 1)}</span><span><b>Все сервисы</b><span>Карты, eSIM, переводы, бизнес</span></span>${I('chev', 0, 'chev')}</button>
        </div>
      </section>
      <p class="slogan center pr-slogan">Пусть чувства<br>обретают форму</p>`;
  },
});
