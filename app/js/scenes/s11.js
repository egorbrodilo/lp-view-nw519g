// Slide 11, the last one: feelings take shape. The threads come back to the brand sign, the calm infinity.
// The sign stands alone above the text: the slogan starts right under it (desktop y = 487, phone y = 308).
// If a or cy grows, move the text in src/slides/s11.py down as well.
(() => {
  const H = DECK.H, buf = H.mkBuf();
  DECK.scene(11, {
    cfg: [{ cx: 960, cy: 288, a: 362, rot: 0 }, { cx: 195, cy: 196, a: 152, rot: 0 }],
    mid: 0,
    bg: [[1390, 380, 1.1, 530, 520, 1.1], [310, 170, 1.0, 80, 330, 1.0]],
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
