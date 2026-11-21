// Slide 5, QR for business: a viewfinder frame of light around the QR code (a DOM object centred at cx, cy).
// The numbers in cfg must match LX, LY, LA / PX, PY, PA in src/slides/s05.py: the QR plate stands exactly in the centre.
(() => {
  const H = DECK.H, buf = H.mkBuf(), P = 2 / 5;                 // superellipse: a square with soft corners
  const sq = (t) => { const c = Math.cos(t), s = Math.sin(t); return [Math.sign(c) * Math.pow(Math.abs(c), P), Math.sign(s) * Math.pow(Math.abs(s), P)]; };
  DECK.scene(5, {
    cfg: [{ cx: 960, cy: 414, a: 222 }, { cx: 195, cy: 250, a: 106 }],
    mid: 0.85,
    bg: [[1300, 330, 0.95, 620, 720, 1.0], [300, 230, 0.9, 80, 460, 1.0]],
    stars: 20,
    // phone, page 2: the frame stays in place and holds the "reverse direction" lines, so it steps back only a little
    dim2: 0.6,
    prep(time, c) { H.prep(buf, sq, c.a, time * 0.03); },
    pt(th, j, s, time, c, o) {
      const k = H.kind(th.q), sc = c.a / 236, t = s * H.TAU;
      th.ph = [0.5, 0.2, 0.5][k];
      H.ribbonPt(buf, j, th, t, [17, 40, 9][k] * sc, 0.4, [2.5, 7, 2][k] * sc, time, o);
      o[0] += c.cx; o[1] += c.cy;
    },
    al: (th) => [0.4, 0.2, 0.42][H.kind(th.q)],
    lw: (th) => [1.05, 0.8, 0.9][H.kind(th.q)],
    ext: (c) => [c.cx - c.a, c.cx + c.a],
    core: (c) => [c.cx, c.cy, 0]
  });
})();
