// Slide 8, transit wallets: a constellation. One big ring (all wallets in one place) and K small rings around it
// (separate wallets), joined to the centre by fine spokes. The small rings do not move, so DOM name tags can sit
// next to them: ring k is centred at DECK.s08pos(cfg, k). The same numbers live in src/slides/s08.py (LC, PC).
(() => {
  const H = DECK.H, K = 5;
  const pos = (c, k) => { const a = (-90 + 36 + k * 72) * Math.PI / 180; return [c.cx + c.D * Math.cos(a), c.cy + c.D * Math.sin(a) * 0.82]; };
  DECK.s08pos = pos;
  // thread groups by q: the big ring (its core, then a soft halo), the small rings, the spokes
  const BIG = 0.25, HALO = 0.33, SMALL = 0.87, SW = (SMALL - HALO) / K, PW = (1 - SMALL) / K;
  DECK.scene(8, {
    cfg: [{ cx: 1352, cy: 524, R: 164, r: 62, D: 344 }, { cx: 195, cy: 330, R: 60, r: 25, D: 138 }],
    mid: 0.9,
    bg: [[1600, 330, 1.0, 1040, 800, 1.0], [310, 230, 0.95, 70, 450, 1.0]],
    stars: 22,
    pt(th, j, s, time, c, o) {
      const q = th.q, t = s * H.TAU, sc = c.R / 150;
      if (q < HALO) {                                   // the big ring
        const halo = q >= BIG;
        th.ph = halo ? 0.2 : 0.5;
        const r = c.R + H.ribbonOff(th, t, (halo ? 38 : 19) * sc, 0.4, (halo ? 6.5 : 2.6) * sc, time);
        o[0] = c.cx + r * Math.cos(t); o[1] = c.cy + r * Math.sin(t);
      } else if (q < SMALL) {                           // small rings
        const k = Math.min(K - 1, Math.floor((q - HALO) / SW)), p = pos(c, k);
        th.ph = 0.3 + k;
        const r = c.r + H.ribbonOff(th, t, 9 * sc, 0.4, 1.6 * sc, time);
        o[0] = p[0] + r * Math.cos(t); o[1] = p[1] + r * Math.sin(t);
      } else {                                          // spokes: there and back along a slightly bent line
        const k = Math.min(K - 1, Math.floor((q - SMALL) / PW)), p = pos(c, k), back = s >= 0.5, v = back ? (1 - s) * 2 : s * 2;
        const dx = p[0] - c.cx, dy = p[1] - c.cy, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
        const a0 = c.R + 8 * sc, a1 = L - c.r - 5 * sc, d = a0 + (a1 - a0) * v;
        const bend = (back ? -1 : 1) * (2 + 6 * th.r) * sc * Math.sin(Math.PI * v);
        o[0] = c.cx + ux * d - uy * bend; o[1] = c.cy + uy * d + ux * bend;
      }
    },
    al: (th) => th.q < BIG ? 0.4 : th.q < HALO ? 0.17 : th.q < SMALL ? 0.36 : 0.3,
    lw: (th) => th.q < BIG ? 1 : th.q < HALO ? 0.8 : th.q < SMALL ? 1 : 0.8,
    white: (th) => (th.q < BIG || (th.q >= HALO && th.q < SMALL)) && th.g < 0.1,
    ext: (c) => [c.cx - c.D - c.r, c.cx + c.D + c.r],
    core: (c) => [c.cx, c.cy, c.R * 0.55]
  });
})();
