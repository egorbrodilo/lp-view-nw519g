// Slide 3, virtual cards: a globe of meridians and parallels with an orbit ribbon; the cards (DOM) fly on the orbit.
(() => {
  const H = DECK.H, buf = H.mkBuf();
  DECK.scene(3, {
    cfg: [{ cx: 860, cy: 560, R: 300, rx: 372, ry: 126, rot: -17 }, { cx: 195, cy: 318, R: 104, rx: 146, ry: 48, rot: -17 }],
    mid: 0.9,
    bg: [[1190, 840, 0.8, 660, 330, 1.0], [300, 420, 0.8, 70, 250, 1.0]],
    prep(time, c) { H.prep(buf, (u) => [Math.cos(u), Math.sin(u) * c.ry / c.rx], c.rx, time * 0.05); },
    pt(th, j, s, time, c, o) {
      const q = th.q, t = s * H.TAU, sc = c.R / 304;
      if (q < 0.46 || q >= 0.88) {                    // orbit ribbon: core, halo, white highlights
        const k = q < 0.36 ? 0 : q < 0.46 ? 1 : 2;
        th.ph = [0.6, 0.2, 0.6][k];
        H.ribbonPt(buf, j, th, t + time * 0.05, [30, 62, 16][k] * sc, 0.4, [4, 10, 3][k] * sc, time, o);
      } else if (q < 0.72) {                          // meridians
        const an = Math.PI * (q - 0.46) / 0.26 + time * 0.04, rx = c.R * Math.cos(an);
        o[0] = rx * Math.cos(t) + 2.2 * sc * th.amp * Math.sin(th.k1 * t + th.p1 + time * 0.4); o[1] = c.R * Math.sin(t);
      } else {                                        // parallels
        const la = -1.3 + 2.6 * (q - 0.72) / 0.16, rr = c.R * Math.cos(la);
        o[0] = rr * Math.cos(t); o[1] = rr * 0.24 * Math.sin(t) + c.R * Math.sin(la) * 0.94 + 1.5 * sc * th.amp * Math.sin(th.k1 * t + th.p1);
      }
      H.rot(o, c.rot * Math.PI / 180); o[0] += c.cx; o[1] += c.cy;
    },
    al: (th) => th.q < 0.36 ? 0.38 : th.q < 0.46 ? 0.2 : th.q < 0.72 ? 0.26 : th.q < 0.88 ? 0.2 : 0.4,
    lw: (th) => th.q < 0.36 ? 1 : 0.8,
    white: (th) => th.q >= 0.88,
    ext: (c) => [c.cx - c.rx, c.cx + c.rx],
    core: (c) => [c.cx, c.cy, 0],
    // the dense core of the orbit passes in front of the cards, below the long axis of the orbit
    front: (th) => th.q < 0.36,
    frontLine: (c) => [c.cx, c.cy, c.rot]
  });
})();
