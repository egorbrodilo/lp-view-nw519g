// Slide 7, transfers for individuals: the brand infinity as a living glyph in the formula "$111 — $∞".
(() => {
  const H = DECK.H, buf = H.mkBuf();
  DECK.scene(7, {
    cfg: [{ cx: 1486, cy: 709, a: 240, rot: 0 }, { cx: 217.3, cy: 597.2, a: 112, rot: 0 }],
    mid: 0,
    bg: [[1620, 360, 1.0, 900, 800, 1.0], [320, 260, 1.0, 60, 520, 1.0]],
    stars: 18,
    prep(time, c) { H.prep(buf, H.lemn, c.a, 0); },
    pt(th, j, s, time, c, o) {
      const k = H.kind(th.q), sc = c.a / 566, t = s * H.TAU;
      th.ph = [0.55, 0.2, 0.55][k];
      H.ribbonPt(buf, j, th, t, [74, 128, 40][k] * sc, [0.45, 0.2, 0.45][k], [6, 14, 4][k] * sc, time, o);
      H.rot(o, c.rot * Math.PI / 180); o[0] += c.cx; o[1] += c.cy;
    },
    al: (th) => [0.4, 0.2, 0.42][H.kind(th.q)],
    lw: (th) => [1.05, 0.8, 0.9][H.kind(th.q)],
    ext: (c) => [c.cx - c.a * 1.1, c.cx + c.a * 1.1],
    core: (c) => [c.cx, c.cy, c.a * 0.46]
  });
})();
