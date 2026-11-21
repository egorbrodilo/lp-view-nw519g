// Slide 10, "И обязательно любите": a heart of light threads. The infinity opens at its crossing point.
(() => {
  const H = DECK.H, buf = H.mkBuf();
  DECK.scene(10, {
    cfg: [{ cx: 960, cy: 486, k: 288 }, { cx: 195, cy: 438, k: 150 }],
    mid: 0.45,
    bg: [[1260, 380, 1.15, 640, 700, 1.0], [300, 330, 1.1, 80, 600, 1.0]],
    prep(time, c) { H.prep(buf, H.heartC, c.k, 0); },
    pt(th, j, s, time, c, o) {
      const k = H.kind(th.q), sc = c.k / 288, t = s * H.TAU;
      th.ph = [0.9, 0.3, 0.9][k];
      H.ribbonPt(buf, j, th, t, [44, 80, 22][k] * sc, [0.45, 0.2, 0.45][k], [5, 12, 3][k] * sc, time, o);
      o[0] += c.cx; o[1] += c.cy;
    },
    al: (th) => [0.38, 0.2, 0.42][H.kind(th.q)],
    lw: (th) => [1.05, 0.8, 0.9][H.kind(th.q)],
    ext: (c) => [c.cx - c.k, c.cx + c.k],
    core: (c) => [c.cx, c.cy - c.k * 0.1, c.k * 0.62]
  });
})();
