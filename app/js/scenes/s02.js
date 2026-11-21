// Slide 2: two linked rings. Exchange (two sides of a deal) and two that became one.
(() => {
  const H = DECK.H;
  DECK.scene(2, {
    cfg: [{ cx: 1440, cy: 300, r: 165, d: 112, rot: -10 }, { cx: 195, cy: 322, r: 58, d: 39, rot: -10 }],
    mid: 0.8,
    bg: [[1560, 420, 0.95, 420, 760, 1.05], [300, 300, 0.9, 60, 560, 1.0]],
    pt(th, j, s, time, c, o) {
      const k = H.kind(th.q), sc = c.r / 165, t = s * H.TAU + (th.side ? 0 : Math.PI);
      th.ph = [0.5, 0.2, 0.5][k];
      const off = H.ribbonOff(th, t, [22, 46, 12][k] * sc, 0.4, [3, 8, 2][k] * sc, time);
      o[0] = (th.side ? c.d : -c.d) + (c.r + off) * Math.cos(t); o[1] = (c.r + off) * Math.sin(t);
      H.rot(o, c.rot * Math.PI / 180); o[0] += c.cx; o[1] += c.cy;
    },
    al: (th) => [0.4, 0.2, 0.42][H.kind(th.q)],
    lw: (th) => [1.05, 0.8, 0.9][H.kind(th.q)],
    ext: (c) => [c.cx - c.d - c.r, c.cx + c.d + c.r],
    core: (c) => [c.cx, c.cy, c.r * 0.5]
  });
})();
