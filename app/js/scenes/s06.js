// Slide 6, international settlements: routes of a payment. A bundle of light arcs flies from point A (ax, ay)
// to point B (bx, by); every thread goes there along its own arc and returns along a slightly lower one.
(() => {
  const H = DECK.H;
  DECK.scene(6, {
    cfg: [{ ax: 1012, ay: 456, bx: 1792, by: 240, h: 232 }, { ax: 44, ay: 548, bx: 346, by: 270, h: 140 }],
    mid: 0.9,
    bg: [[1650, 250, 0.95, 980, 560, 0.95], [320, 258, 0.9, 60, 528, 0.9]],
    dim2: 0.3,                                                                   // second phone page: the route stays as a quiet trace behind the text
    stars: 26,
    pt(th, j, s, time, c, o) {
      const back = s >= 0.5, v = back ? (1 - s) * 2 : s * 2, e = H.sm(v);          // 0 -> 1 -> 0 along the route
      const dx = c.bx - c.ax, dy = c.by - c.ay, L = Math.hypot(dx, dy) || 1, nx = dy / L, ny = -dx / L;   // normal that points up
      const up = th.g < 0.78 ? 0.18 + 0.82 * th.r : -(0.08 + 0.3 * th.r);          // most routes arc above the chord, a few below
      const hh = c.h * up * (back ? 0.84 : 1), sc = c.h / 250;
      const env = Math.sin(Math.PI * Math.pow(e, 0.78 + 0.55 * th.p2 / H.TAU));        // every route has its own apex: early, in the middle or late
      const off = hh * env + 3 * sc * th.amp * Math.sin(th.k1 * v * 3 + th.p1 + time * 0.5) * env;
      o[0] = c.ax + dx * e + nx * off; o[1] = c.ay + dy * e + ny * off;
    },
    al: (th) => th.g < 0.78 ? 0.3 : 0.2,
    lw: () => 0.9,
    white: (th) => th.u > 0.8,
    ext: (c) => [Math.min(c.ax, c.bx), Math.max(c.ax, c.bx)],
    core: (c) => [c.bx, c.by, c.h * 0.26]
  });
})();
