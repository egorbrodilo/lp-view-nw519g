// Services: everything Love&Pay can do, one line each (the lines follow the client's presentation).
APP.screen('services', {
  title: 'Сервисы',
  render(root) {
    const I = APP.icon;
    const list = [
      ['cards', 'card', 'Виртуальные карты', 'Для покупок по всему миру в долларах США'],
      ['esim', 'sim', 'eSIM', 'Интернет за границей без роуминга, 190+ стран'],
      ['intl', 'globe', 'Международные переводы', 'В другие страны: в валюте или USDT'],
      ['wallets', 'wallet', 'Транзитные кошельки', 'Отдельные кошельки под цели и клиентов'],
      ['business', 'shop', 'Для бизнеса', 'QR-коды и платёжные ссылки для приёма оплаты'],
      ['invoice', 'doc', 'Международные расчёты', 'Оплата инвойсов иностранных контрагентов'],
      ['subs', 'star', 'Подписки и Telegram Premium', 'Оплата подписок'],
      ['referral', 'people', 'Реферальная программа', 'Приглашайте друзей и зарабатывайте вместе с нами'],
      ['support', 'chat', 'Поддержка 24/7', 'Любые вопросы можно решить в службе поддержки'],
    ];
    root.innerHTML = `
      <h1 class="h1 svc-title">Сервисы</h1>
      <p class="lead it svc-lead">${REAL.slogans.simple}</p>
      <div class="panel tight">${list.map((s) => `
        <button class="li" data-go="${s[0]}"><span class="ico">${I(s[1], 1)}</span><span><b>${s[2]}</b><span>${s[3]}</span></span>${I('chev', 0, 'chev')}</button>`).join('')}
      </div>`;
  },
});
