// Love&Pay light threads for the app: the same scenes as in the deck (src/scenes/sNN.js register themselves with
// DECK.scene), drawn into any canvas. DECK.view(canvas, sceneNumber, cfg) returns a living picture of one scene.
window.DECK = (() => {
  const BLUE_D = '#22ADE6', BLUE = '#67D2F6', PINK = '#FF6B76', PINK_D = '#F0405A';
  const TAU = Math.PI * 2, M = 64;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SHOT = !!window.APP_SHOT;                      // snapshot mode: every view draws one frame and stops

  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const R = rng(11), TH = [];
  for (let k = 0; k < 250; k++) {
    TH.push({
      i: k, side: k % 2, q: (k * 0.61803398875) % 1, u: R() * 2 - 1, r: R(), amp: 0.4 + R(),
      k1: 2 + Math.floor(R() * 4), p1: R() * 6.283, k2: 5 + 2 * Math.floor(R() * 3), p2: R() * 6.283,
      w: 0.7 + 0.6 * R(), al: 0.75 + 0.5 * R(), g: R(), ph: 0
    });
  }

  const lerp = (a, b, f) => a + (b - a) * f;
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const sm = (f) => f * f * (3 - 2 * f);
  const lemn = (t) => { const s = Math.sin(t), c = Math.cos(t), d = 1 + s * s; return [c / d, s * c / d]; };
  const heartC = (t) => {
    const s = Math.PI / 2 - t, a = Math.sin(s);
    return [16 * a * a * a / 17, -(13 * Math.cos(s) - 5 * Math.cos(2 * s) - 2 * Math.cos(3 * s) - Math.cos(4 * s)) / 17];
  };
  const kind = (q) => q < 0.70 ? 0 : q < 0.88 ? 1 : 2;
  const rot = (o, a) => { const c = Math.cos(a), s = Math.sin(a), x = o[0]; o[0] = x * c - o[1] * s; o[1] = x * s + o[1] * c; };
  const mkBuf = () => ({ cx: new Float32Array(111), cy: new Float32Array(111), nx: new Float32Array(111), ny: new Float32Array(111) });
  function prep(buf, f, A, shift) {
    for (let j = 0; j < M; j++) {
      const t = j / M * TAU + (shift || 0), c = f(t), a = f(t - 0.012), b = f(t + 0.012);
      let nx = -(b[1] - a[1]), ny = b[0] - a[0];
      const L = Math.hypot(nx, ny) || 1;
      buf.cx[j] = c[0] * A; buf.cy[j] = c[1] * A; buf.nx[j] = nx / L; buf.ny[j] = ny / L;
    }
  }
  function ribbonOff(th, t, W, dp, wob, time) {
    const ph = t + th.ph + time * 0.16;
    return W * (th.u * Math.cos(ph) + (th.u * th.u - 0.5) * dp * Math.sin(ph))
      + wob * th.amp * (Math.sin(th.k1 * t + th.p1 + time * 0.5) + 0.4 * Math.sin(th.k2 * t + th.p2 - time * 0.35));
  }
  function ribbonPt(buf, j, th, t, W, dp, wob, time, o) {
    const off = ribbonOff(th, t, W, dp, wob, time);
    o[0] = buf.cx[j] + buf.nx[j] * off; o[1] = buf.cy[j] + buf.ny[j] * off;
  }
  const H = { TAU, lerp, clamp, sm, lemn, heartC, kind, rot, mkBuf, prep, ribbonOff, ribbonPt, rng };

  const DEFS = {};
  function scene(n, def) { DEFS[n] = def; }

  // one loop for all living views; a view is skipped while it is detached or off screen
  const views = new Set();
  let running = false;
  function loop(now) {
    if (!views.size) { running = false; return; }
    if (!document.hidden) for (const v of views) v.tick(now / 1000);
    requestAnimationFrame(loop);
  }

  // cfg: placement of the scene in css px of the canvas (the same fields as cfg of the scene in the deck).
  // opts: n (threads, default 120), stars, glow (default true), speed.
  function view(canvas, n, cfg, opts) {
    const S = DEFS[n], o = opts || {};
    if (!S) throw new Error('no scene ' + n);
    const N = Math.min(o.n || 120, 250), X = new Float32Array(N * M), Y = new Float32Array(N * M), p = [0, 0];
    const glow = document.createElement('canvas'), ctx = canvas.getContext('2d'), gctx = glow.getContext('2d');
    let w = 0, h = 0, dpr = 1, c = cfg, seen = true;
    const isWhite = (th) => S.white ? S.white(th) : kind(th.q) === 2;
    function size() {
      const r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width); h = Math.max(1, r.height); dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      glow.width = Math.ceil(w / 4); glow.height = Math.ceil(h / 4);
    }
    function draw(time) {
      const pulse = reduce || SHOT ? 0.25 : (() => { const u = (time % 1.9) / 1.9; return Math.exp(-Math.pow((u - 0.12) / 0.055, 2)) + 0.6 * Math.exp(-Math.pow((u - 0.31) / 0.07, 2)); })();
      if (S.prep) S.prep(time, c);
      for (let k = 0; k < N; k++) {
        const th = TH[k];
        for (let j = 0; j < M; j++) { S.pt(th, j, j / M, time, c, p); X[k * M + j] = p[0]; Y[k * M + j] = p[1]; }
        th._al = S.al(th, time) * th.al; th._lw = S.lw(th) * th.w; th._wh = isWhite(th);
      }
      const e = S.ext(c), mid = S.mid;
      const mk = (g2, white) => {
        const g = g2.createLinearGradient(e[0], 0, e[1], 0);
        if (white) {
          g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(0.42, 'rgba(255,255,255,.95)');
          g.addColorStop(0.5, 'rgba(255,255,255,' + mid + ')'); g.addColorStop(0.58, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,.95)');
        } else {
          g.addColorStop(0, BLUE_D); g.addColorStop(0.34, BLUE);
          g.addColorStop(0.47, 'rgba(206,176,214,' + mid + ')'); g.addColorStop(0.53, 'rgba(206,176,214,' + mid + ')');
          g.addColorStop(0.66, PINK); g.addColorStop(1, PINK_D);
        }
        return g;
      };
      const sub = (g2, k) => { const b = k * M; g2.moveTo(X[b], Y[b]); for (let j = 1; j < M; j++) g2.lineTo(X[b + j], Y[b + j]); g2.closePath(); };
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      // soft glow: thick lines on a quarter-size canvas, stretched back
      if (o.glow !== false) {
        gctx.setTransform(0.25, 0, 0, 0.25, 0, 0); gctx.clearRect(0, 0, w + 8, h + 8);
        gctx.strokeStyle = mk(gctx, false); gctx.lineWidth = 6; gctx.lineJoin = 'bevel'; gctx.globalAlpha = 0.34; gctx.beginPath();
        for (let k = 0; k < N; k += 3) { if (!TH[k]._wh && TH[k]._al > 0.05) sub(gctx, k); }
        gctx.stroke();
        ctx.imageSmoothingEnabled = true; ctx.globalAlpha = 0.9; ctx.drawImage(glow, 0, 0, glow.width, glow.height, 0, 0, glow.width * 4, glow.height * 4);
      }
      // core light
      const k0 = S.core(c), cr = k0[2] * (1 + 0.1 * pulse);
      if (cr > 1) {
        const g = ctx.createRadialGradient(k0[0], k0[1], 0, k0[0], k0[1], cr);
        g.addColorStop(0, 'rgba(255,255,255,.98)'); g.addColorStop(0.45, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(k0[0], k0[1], cr, 0, TAU); ctx.fill();
      }
      // threads, grouped by colour, opacity step and width step
      ctx.lineJoin = 'bevel';
      const gc = mk(ctx, false), gw = mk(ctx, true), groups = new Map();
      for (let k = 0; k < N; k++) {
        const th = TH[k];
        if (th._al < 0.012) continue;
        const key = (th._wh ? 1000 : 0) + Math.round(th._al * 14) * 10 + Math.round(th._lw * 3);
        let g = groups.get(key);
        if (!g) groups.set(key, g = []);
        g.push(k);
      }
      for (const [key, list] of groups) {
        ctx.beginPath();
        for (const k of list) sub(ctx, k);
        ctx.strokeStyle = key >= 1000 ? gw : gc;
        ctx.globalAlpha = Math.min(1, (Math.floor(key % 1000 / 10) / 14) * 1.05);
        ctx.lineWidth = Math.max(0.5, (key % 10) / 3) * 0.62 * (1 + 0.05 * pulse);
        ctx.stroke();
      }
      // falling stars
      ctx.fillStyle = '#fff'; ctx.lineCap = 'round';
      const SP = o.stars === undefined ? 10 : o.stars, TS = 7;
      for (let s = 0; s < SP; s++) {
        const k = (s * 7 + 3) % N, th = TH[k];
        if (th._al < 0.05) continue;
        const sp = 0.014 + ((s * 37) % 11) * 0.0026, pos = (s * 0.137 + time * sp) % 1, tl = 0.034 + ((s * 13) % 7) * 0.007;
        const tw = 0.72 + 0.28 * Math.sin(time * 1.3 + s * 2.1), sz = 0.9 * (0.8 + (s % 4) * 0.22);
        let hx = 0, hy = 0, tx = 0, ty = 0;
        ctx.beginPath();
        for (let q = 0; q <= TS; q++) {
          const u = (((pos - tl * (1 - q / TS)) % 1) + 1) % 1 * M, i0 = Math.floor(u), g = u - i0, a0 = k * M + i0, b0 = k * M + (i0 + 1) % M;
          hx = X[a0] + (X[b0] - X[a0]) * g; hy = Y[a0] + (Y[b0] - Y[a0]) * g;
          if (q === 0) { tx = hx; ty = hy; ctx.moveTo(hx, hy); } else ctx.lineTo(hx, hy);
        }
        const tg = ctx.createLinearGradient(tx, ty, hx, hy);
        tg.addColorStop(0, 'rgba(255,255,255,0)'); tg.addColorStop(1, 'rgba(255,255,255,.95)');
        ctx.strokeStyle = tg; ctx.globalAlpha = tw; ctx.lineWidth = sz * 1.5; ctx.stroke();
        ctx.globalAlpha = 0.16 * tw; ctx.beginPath(); ctx.arc(hx, hy, sz * 4.6, 0, TAU); ctx.fill();
        ctx.globalAlpha = 0.98; ctx.beginPath(); ctx.arc(hx, hy, sz * 1.1, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    const v = {
      tick(time) { if (!canvas.isConnected) { v.stop(); return; } if (seen) draw(time * (o.speed || 1)); },
      set(next) { c = next; if (SHOT || reduce) draw(0); },
      resize() { size(); if (SHOT || reduce) draw(0); },
      stop() { views.delete(v); if (io) io.disconnect(); },
    };
    size();
    let io = null;
    if (SHOT || reduce) { draw(0); return v; }
    if ('IntersectionObserver' in window) { io = new IntersectionObserver((es) => { seen = es[0].isIntersecting; }); io.observe(canvas); }
    views.add(v);
    if (!running) { running = true; requestAnimationFrame(loop); }
    return v;
  }

  return { scene, view, H, TH };
})();
