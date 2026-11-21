// Slide 9, referral programme: "love that is enough for everyone".
// You are the light in the centre. Rays of light go from you to the people you invited (the first line, small rings
// on the inner orbit) and from each of them to the two people they invited (the second line, the outer orbit).
// cx, cy must match LX, LY / PX, PY in src/slides/s09.py: the word «вы» stands exactly in the centre.
(() => {
  const H = DECK.H, N1 = 5, N2 = 10;
  const a1 = (k, time) => k * H.TAU / N1 - 1.5 + time * 0.022;                       // people of the first line
  const a2 = (j, time) => a1(j >> 1, time) + (j % 2 ? 1 : -1) * (H.TAU / (2 * N2) + 0.04 * Math.sin(time * 0.21 + j));   // each of them has two guests
  // a ray of light: a soft bundle of threads along a curve from (x0, y0) to (x1, y1) with the control point (xc, yc).
  // Every thread runs there and back along the same line, so the ray has no outline, only light.
  function ray(th, t, x0, y0, xc, yc, x1, y1, W, time, o) {
    const u = (1 - Math.cos(t)) / 2, v = 1 - u, env = Math.sin(Math.PI * u);
    const tx = 2 * v * (xc - x0) + 2 * u * (x1 - xc), ty = 2 * v * (yc - y0) + 2 * u * (y1 - yc), L = Math.hypot(tx, ty) || 1;
    const off = W * th.u * (0.3 + 0.7 * env) + 0.28 * W * th.amp * env * Math.sin(th.k1 * 1.6 * u + th.p1 + time * 0.5);
    o[0] = v * v * x0 + 2 * u * v * xc + u * u * x1 - ty / L * off; o[1] = v * v * y0 + 2 * u * v * yc + u * u * y1 + tx / L * off;
  }
  DECK.scene(9, {
    cfg: [{ cx: 946, cy: 412, r1: 136, r2: 258 }, { cx: 195, cy: 428, r1: 83, r2: 158 }],
    mid: 0.9,
    bg: [[1250, 330, 1.0, 660, 720, 1.0], [300, 250, 0.95, 80, 480, 1.0]],
    stars: 22,
    dim2: 0.16,
    pt(th, j, s, time, c, o) {
      const q = th.q, t = s * H.TAU, sc = c.r2 / 290, R1 = 19 * sc, R2 = 13 * sc;
      if (q < 0.18) {                                   // inner orbit
        th.ph = 0.5;
        const r = c.r1 + H.ribbonOff(th, t, 7 * sc, 0.4, 1.5 * sc, time);
        o[0] = c.cx + r * Math.cos(t); o[1] = c.cy + r * Math.sin(t);
      } else if (q < 0.40) {                            // outer orbit
        th.ph = 1.4;
        const r = c.r2 + H.ribbonOff(th, t, 10 * sc, 0.4, 2.1 * sc, time);
        o[0] = c.cx + r * Math.cos(t); o[1] = c.cy + r * Math.sin(t);
      } else if (q < 0.55) {                            // people of the first line
        const k = Math.min(N1 - 1, Math.floor((q - 0.40) / 0.03)), a = a1(k, time);
        th.ph = k;
        const r = R1 + H.ribbonOff(th, t, 3.4 * sc, 0.4, 0.7 * sc, time);
        o[0] = c.cx + c.r1 * Math.cos(a) + r * Math.cos(t); o[1] = c.cy + c.r1 * Math.sin(a) + r * Math.sin(t);
      } else if (q < 0.72) {                            // people of the second line
        const k = Math.min(N2 - 1, Math.floor((q - 0.55) / 0.017)), a = a2(k, time);
        th.ph = k;
        const r = R2 + H.ribbonOff(th, t, 2.6 * sc, 0.4, 0.6 * sc, time);
        o[0] = c.cx + c.r2 * Math.cos(a) + r * Math.cos(t); o[1] = c.cy + c.r2 * Math.sin(a) + r * Math.sin(t);
      } else if (q < 0.82) {                            // rays from you to the first line (they rise out of the light in the centre)
        const k = Math.min(N1 - 1, Math.floor((q - 0.72) / 0.02)), a = a1(k, time), ca = Math.cos(a), sa = Math.sin(a);
        const r0 = c.r1 * 0.37, r1 = c.r1 - R1 - 3 * sc, rm = (r0 + r1) / 2;   // r0 leaves room for the word «вы»
        ray(th, t, c.cx + r0 * ca, c.cy + r0 * sa, c.cx + rm * ca, c.cy + rm * sa, c.cx + r1 * ca, c.cy + r1 * sa, 5 * sc, time, o);
      } else {                                          // from each of the first line to the two of the second
        const k = Math.min(N2 - 1, Math.floor((q - 0.82) / 0.018)), a = a1(k >> 1, time), b = a2(k, time), ca = Math.cos(a), sa = Math.sin(a);
        const r0 = c.r1 + R1 + 3 * sc, rc = c.r1 + 0.62 * (c.r2 - c.r1);
        const xc = c.cx + rc * ca, yc = c.cy + rc * sa, gx = c.cx + c.r2 * Math.cos(b), gy = c.cy + c.r2 * Math.sin(b);
        const dx = gx - xc, dy = gy - yc, L = Math.hypot(dx, dy) || 1, e = (R2 + 3 * sc) / L;
        ray(th, t, c.cx + r0 * ca, c.cy + r0 * sa, xc, yc, gx - dx * e, gy - dy * e, 3.8 * sc, time, o);
      }
    },
    al: (th) => th.q < 0.40 ? 0.34 : th.q < 0.72 ? 0.42 : 0.38,
    lw: () => 0.95,
    white: (th) => th.g < 0.1 && th.q < 0.72,          // highlights only on the orbits and the people: a ray must never turn out all white
    ext: (c) => [c.cx - c.r2 - 20, c.cx + c.r2 + 20],
    core: (c) => [c.cx, c.cy, c.r1 * 0.5]
  });
})();
