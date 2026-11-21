// Slide 4, eSIM: signal waves. Wave fronts of light leave the SIM (a DOM object at cx, cy) and fade on their way out.
(() => {
  const H = DECK.H, FRONTS = 6, SPEED = 0.028;
  const phase = (th, time) => ((Math.floor(th.q * FRONTS) + th.g * 0.06) / FRONTS + time * SPEED) % 1;   // 0 at the SIM, 1 at the edge
  DECK.scene(4, {
    cfg: [{ cx: 1390, cy: 450, r0: 124, r1: 460 }, { cx: 195, cy: 306, r0: 44, r1: 165 }],
    mid: 0.9,
    bg: [[1560, 300, 1.0, 1080, 800, 1.0], [310, 210, 1.0, 70, 440, 1.0]],
    stars: 12,
    pt(th, j, s, time, c, o) {
      const ph = phase(th, time), t = s * H.TAU, sc = c.r1 / 500;
      th.ph = 0.4;
      const r = c.r0 + (c.r1 - c.r0) * ph + H.ribbonOff(th, t, (5 + 13 * ph) * sc, 0.3, (1.5 + 4 * ph) * sc, time);
      o[0] = c.cx + r * Math.cos(t); o[1] = c.cy + r * Math.sin(t);
    },
    al: (th, time) => { const ph = phase(th, time); return 0.46 * Math.min(1, ph * 7) * Math.pow(1 - ph, 1.25); },
    lw: () => 0.95,
    white: (th) => th.r < 0.1,
    ext: (c) => [c.cx - c.r1 * 0.8, c.cx + c.r1 * 0.8],
    core: (c) => [c.cx, c.cy, c.r0 * 1.5]
  });
})();
