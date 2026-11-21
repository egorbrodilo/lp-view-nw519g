// Slide 1, cover: the brand sign, an infinity of light threads (blue loop and pink loop, light where they cross).
(() => {
  const H = DECK.H, buf = H.mkBuf();
  DECK.scene(1, {
    cfg: [{ cx: 1392, cy: 540, a: 500, rot: -13 }, { cx: 198, cy: 254, a: 184, rot: -62 }],
    mid: 0,
    bg: [[1680, 250, 1.0, 1000, 930, 1.0], [330, 150, 1.0, 60, 520, 1.0]],
    prep(time, c) { H.prep(buf, H.lemn, c.a, 0); },
    pt(th, j, s, time, c, o) {
      const k = H.kind(th.q), sc = c.a / 566, t = s * H.TAU;
      th.ph = [0.55, 0.2, 0.55][k];
      H.ribbonPt(buf, j, th, t, [74, 128, 40][k] * sc, [0.45, 0.2, 0.45][k], [6, 14, 4][k] * sc, time, o);
      H.rot(o, c.rot * Math.PI / 180); o[0] += c.cx; o[1] += c.cy;
    },
    al: (th) => [0.38, 0.2, 0.42][H.kind(th.q)],
    lw: (th) => [1.05, 0.8, 0.9][H.kind(th.q)],
    ext: (c) => { const w = c.a * Math.abs(Math.cos(c.rot * Math.PI / 180)) + c.a * 0.1; return [c.cx - w, c.cx + w]; },
    core: (c) => [c.cx, c.cy, c.a * 0.46]
  });
})();
