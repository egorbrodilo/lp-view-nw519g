// Love&Pay deck engine: living light threads behind the slides.
// One set of threads flows, pulses like a heartbeat and re-forms between scenes while the reader scrolls.
// Scenes live in src/scenes/sNN.js and register themselves with DECK.scene(slideNumber, definition).
window.DECK = (() => {
  const BLUE_D = '#22ADE6', BLUE = '#67D2F6', PINK = '#FF6B76', PINK_D = '#F0405A';
  const TAU = Math.PI * 2;
  const SHOT = window.DECK_START !== undefined;            // snapshot mode: one fixed frame of one slide
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = Math.min(innerWidth, innerHeight) < 560;
  let N = small ? 140 : 220;                               // threads
  const M = small ? 64 : 80;                               // points per thread (every thread is a closed polyline)

  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // Thread descriptors. q is spread evenly over 0..1 (use it to split threads into groups by ranges),
  // u is a random place across a ribbon (-1..1), r and g are independent randoms 0..1.
  const R = rng(11), TH = [];
  for (let k = 0; k < 250; k++) {
    TH.push({
      i: k, side: k % 2, q: (k * 0.61803398875) % 1, u: R() * 2 - 1, r: R(), amp: 0.4 + R(),
      k1: 2 + Math.floor(R() * 4), p1: R() * 6.283, k2: 5 + 2 * Math.floor(R() * 3), p2: R() * 6.283,
      w: 0.7 + 0.6 * R(), al: 0.75 + 0.5 * R(), g: R(), ph: 0
    });
  }

  // ---- helpers for scenes
  const lerp = (a, b, f) => a + (b - a) * f;
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const sm = (f) => f * f * (3 - 2 * f);
  const lemn = (t) => { const s = Math.sin(t), c = Math.cos(t), d = 1 + s * s; return [c / d, s * c / d]; };
  const heartC = (t) => {
    const s = Math.PI / 2 - t, a = Math.sin(s);
    return [16 * a * a * a / 17, -(13 * Math.cos(s) - 5 * Math.cos(2 * s) - 2 * Math.cos(3 * s) - Math.cos(4 * s)) / 17];
  };
  const kind = (q) => q < 0.70 ? 0 : q < 0.88 ? 1 : 2;      // 0 main, 1 halo, 2 white highlight
  const rot = (o, a) => { const c = Math.cos(a), s = Math.sin(a), x = o[0]; o[0] = x * c - o[1] * s; o[1] = x * s + o[1] * c; };
  // Centre line and normals of a ribbon are the same for all its threads: computed once per frame.
  const mkBuf = () => ({ cx: new Float32Array(111), cy: new Float32Array(111), nx: new Float32Array(111), ny: new Float32Array(111) });
  function prep(buf, f, A, shift) {
    for (let j = 0; j < M; j++) {
      const t = j / M * TAU + (shift || 0), c = f(t), a = f(t - 0.012), b = f(t + 0.012);
      let nx = -(b[1] - a[1]), ny = b[0] - a[0];
      const L = Math.hypot(nx, ny) || 1;
      buf.cx[j] = c[0] * A; buf.cy[j] = c[1] * A; buf.nx[j] = nx / L; buf.ny[j] = ny / L;
    }
  }
  // Sideways offset of a thread inside a ribbon: W is the half-width, dp the "depth" of the twist, wob the waviness.
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

  // ---- scenes
  const DEFS = {};
  function scene(n, def) { DEFS[n] = def; }

  // ---- layout: a 1920x1080 stage in landscape, a 390x844 stage in portrait, both centred in the viewport
  let lay, SC = [], slides = [], tops = [], heights = [], snaps = [], deck = null;
  // The height of one page is the real height of a one-page slide (100svh in CSS), not innerHeight: on a phone
  // innerHeight grows and shrinks while the address bar hides and shows during scrolling. Using it made the
  // threads half-morph into the next slide and jump back and forth, out of step with the text.
  function pageH() {
    const one = slides.find((s) => !s.classList.contains('two')) || slides[0];
    const h = one ? one.offsetHeight : 0;
    return h > 100 ? h : (deck ? deck.clientHeight : innerHeight);
  }
  function layout() {
    const iw = innerWidth, ih = pageH(), portrait = iw / ih < 0.8;
    const px = portrait ? Math.min(iw, ih * 0.46209) / 390 : Math.min(iw, ih * 1.77778) / 1920;
    const sw = (portrait ? 390 : 1920) * px, sh = (portrait ? 844 : 1080) * px;
    lay = { px, ox: (iw - sw) / 2, oy: (ih - sh) / 2, portrait, iw, ih };
    tops = slides.map((s) => s.offsetTop); heights = slides.map((s) => s.offsetHeight);
    snaps = [];
    slides.forEach((s, i) => {
      snaps.push(tops[i]);
      for (let y = tops[i] + ih; y < tops[i] + heights[i] - ih * 0.5; y += ih) snaps.push(y);   // inner pages of tall slides
    });
  }

  // where we are: slide index i, transition f towards slide i+1, inner scroll u of a tall slide (0..1)
  function where() {
    if (SHOT) return { i: window.DECK_START, f: 0, u: window.DECK_PAGE ? 1 : 0 };
    // measurements go stale while a phone browser moves its bars or a window is resized: check them every time
    // (two cheap reads) and re-measure when the page height or the slide positions have moved
    if (slides.length && (Math.abs(pageH() - lay.ih) > 0.5 || innerWidth !== lay.iw || slides[slides.length - 1].offsetTop !== tops[tops.length - 1])) {
      if (innerWidth === canW && innerHeight <= canH) layout(); else size();
    }
    const y = deck ? deck.scrollTop : (window.scrollY || 0), vh = lay.ih;
    let i = 0;
    while (i < tops.length - 1 && y >= tops[i + 1]) i++;
    const inner = Math.max(1, heights[i] - vh);
    const u = heights[i] > vh * 1.2 ? clamp((y - tops[i]) / inner) : 0;
    const f = i < tops.length - 1 ? clamp((y - (tops[i + 1] - vh)) / vh) : 0;
    return { i, f, u };
  }

  // ---- canvases
  const $ = (id) => document.getElementById(id);
  let cv, gl, fr, core, b1, b2, ctx, gctx, fctx, dpr, frontClean = false, coreOn = null, canW = 0, canH = 0;
  function size() {
    layout();
    // canvases cover the largest viewport (address bar hidden), so they never need to be re-created while scrolling
    canW = lay.iw; canH = Math.max(innerHeight, lay.ih, canH && canW === lay.iw ? canH : 0);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (!SHOT) dpr = Math.max(1, Math.min(dpr, 1.6, Math.sqrt(3.0e6 / (canW * canH))));
    for (const c of [cv, fr]) {
      c.width = Math.round(canW * dpr); c.height = Math.round(canH * dpr);
      c.style.width = canW + 'px'; c.style.height = canH + 'px';
    }
    // glow: a quarter-size canvas is blurred while it is small (cheap) and only then scaled up by the compositor
    gl.width = Math.ceil(canW / 4); gl.height = Math.ceil(canH / 4);
    gl.style.width = gl.width + 'px'; gl.style.height = gl.height + 'px';
    gl.style.transformOrigin = '0 0'; gl.style.transform = 'scale(4)';
    gl.style.filter = 'blur(' + (lay.portrait ? 2.5 : Math.max(2.5, 5.5 * lay.px)) + 'px)';
    ctx = cv.getContext('2d'); fctx = fr.getContext('2d'); gctx = gl.getContext('2d');
    frontClean = false;
  }

  const X = new Float32Array(250 * 111), Y = new Float32Array(250 * 111), pA = [0, 0], pB = [0, 0];
  const beat = (time) => {
    const u = (time % 1.9) / 1.9;
    return Math.exp(-Math.pow((u - 0.12) / 0.055, 2)) + 0.6 * Math.exp(-Math.pow((u - 0.31) / 0.07, 2));
  };
  let pointer = [0, 0], ptarget = [0, 0];
  const isWhite = (S, th) => S.white ? S.white(th) : kind(th.q) === 2;

  function frame(w, time) {
    const { px, ox, oy, portrait, iw, ih } = lay, o = portrait ? 1 : 0;
    const i = Math.min(w.i, SC.length - 1), last = i >= SC.length - 1;
    const f = last ? 0 : w.f, A = SC[i], B = last ? SC[i] : SC[i + 1], ca = A.cfg[o], cb = B.cfg[o];
    const pulse = reduce || SHOT ? 0.25 : beat(time), wpulse = 1 + 0.05 * pulse;
    const sx = ox + pointer[0] * 14 * px, sy = oy + pointer[1] * 10 * px;
    const fe = sm(f);
    // on the second page of a tall slide the picture steps back and the text takes over
    const dimA = 1 - (1 - (A.dim2 === undefined ? 0.2 : A.dim2)) * w.u, dim = lerp(dimA, 1, fe);

    // points
    if (f < 1 && A.prep) A.prep(time, ca);
    if (f > 0 && B.prep) B.prep(time, cb);
    for (let k = 0; k < N; k++) {
      const th = TH[k], ft = f <= 0 ? 0 : f >= 1 ? 1 : sm(clamp(f * 1.5 - th.r * 0.5));
      for (let j = 0; j < M; j++) {
        const s = j / M;
        if (ft < 1) A.pt(th, j, s, time, ca, pA);
        if (ft > 0) B.pt(th, j, s, time, cb, pB);
        const x = ft <= 0 ? pA[0] : ft >= 1 ? pB[0] : lerp(pA[0], pB[0], ft);
        const y = ft <= 0 ? pA[1] : ft >= 1 ? pB[1] : lerp(pA[1], pB[1], ft);
        X[k * M + j] = sx + x * px; Y[k * M + j] = sy + y * px;
      }
      const alA = ft < 1 ? A.al(th, time) : 0, alB = ft > 0 ? B.al(th, time) : 0;
      th._al = lerp(alA, alB, ft) * th.al * dim;
      th._lw = lerp(A.lw(th), B.lw(th), ft) * th.w;
      th._wh = isWhite(ft < 0.5 ? A : B, th);
    }

    // colour: blue on the left edge of the shape, pink on the right, light in the middle
    const ea = A.ext(ca), eb = B.ext(cb);
    const g0 = sx + lerp(ea[0], eb[0], fe) * px, g1 = sx + lerp(ea[1], eb[1], fe) * px, mid = lerp(A.mid, B.mid, fe);
    const mk = (c, white) => {
      const g = c.createLinearGradient(g0, 0, g1, 0);
      if (white) {
        g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(0.42, 'rgba(255,255,255,.95)');
        g.addColorStop(0.5, 'rgba(255,255,255,' + mid + ')');
        g.addColorStop(0.58, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,.95)');
      } else {
        g.addColorStop(0, BLUE_D); g.addColorStop(0.34, BLUE);
        g.addColorStop(0.47, 'rgba(206,176,214,' + mid + ')'); g.addColorStop(0.53, 'rgba(206,176,214,' + mid + ')');
        g.addColorStop(0.66, PINK); g.addColorStop(1, PINK_D);
      }
      return g;
    };
    const sub = (c, k) => {
      const b = k * M;
      c.moveTo(X[b], Y[b]);
      for (let j = 1; j < M; j++) c.lineTo(X[b + j], Y[b + j]);
      c.closePath();
    };
    const lwCss = portrait ? 0.62 : Math.max(px, 0.55);

    // main canvas. Threads with the same colour, opacity step and width step go into one path:
    // a few dozen strokes instead of hundreds.
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.lineJoin = 'bevel';
    const gc = mk(ctx, false), gw = mk(ctx, true);
    const groups = new Map();
    for (let k = 0; k < N; k++) {
      const th = TH[k];
      if (th._al < 0.012) continue;
      const key = (th._wh ? 1000 : 0) + Math.round(th._al * 14) * 10 + Math.round(th._lw * 3);
      let g = groups.get(key);
      if (!g) groups.set(key, g = []);
      g.push(k);
    }
    const keyAlpha = (key) => Math.min(1, (Math.floor(key % 1000 / 10) / 14) * 1.12);
    const keyWidth = (key) => Math.max(0.5, (key % 10) / 3) * lwCss;
    for (const [key, list] of groups) {
      ctx.beginPath();
      for (const k of list) sub(ctx, k);
      ctx.strokeStyle = key >= 1000 ? gw : gc;
      ctx.globalAlpha = keyAlpha(key) * (portrait ? 0.85 : 1);
      ctx.lineWidth = keyWidth(key) * wpulse;
      ctx.stroke();
    }

    // falling stars: lights glide along the threads without steps (position is interpolated between
    // thread points) and leave a tail that fades out
    ctx.fillStyle = '#fff'; ctx.lineCap = 'round';
    const base = (portrait ? 0.95 : Math.max(px, 0.62)) * 1.15, TS = 7;
    const SA = A.stars === undefined ? (small ? 16 : 30) : A.stars, SB = B.stars === undefined ? (small ? 16 : 30) : B.stars;
    const SP = Math.round(lerp(SA, SB, fe));
    for (let n = 0; n < SP; n++) {
      const k = (n * 7 + 3) % N, th = TH[k];
      if (th._al < 0.05) continue;
      const sp = 0.014 + ((n * 37) % 11) * 0.0026, pos = (n * 0.137 + time * sp) % 1, tl = 0.034 + ((n * 13) % 7) * 0.007;
      const tw = (0.72 + 0.28 * Math.sin(time * 1.3 + n * 2.1)) * dim, size = base * (0.8 + (n % 4) * 0.22);
      let hx = 0, hy = 0, tx = 0, ty = 0;
      ctx.beginPath();
      for (let q = 0; q <= TS; q++) {
        const u = (((pos - tl * (1 - q / TS)) % 1) + 1) % 1 * M, i0 = Math.floor(u), g = u - i0;
        const a0 = k * M + i0, b0 = k * M + (i0 + 1) % M;
        hx = X[a0] + (X[b0] - X[a0]) * g; hy = Y[a0] + (Y[b0] - Y[a0]) * g;
        if (q === 0) { tx = hx; ty = hy; ctx.moveTo(hx, hy); } else ctx.lineTo(hx, hy);
      }
      const tg = ctx.createLinearGradient(tx, ty, hx, hy);
      tg.addColorStop(0, 'rgba(255,255,255,0)'); tg.addColorStop(1, 'rgba(255,255,255,.95)');
      ctx.strokeStyle = tg; ctx.globalAlpha = tw; ctx.lineWidth = size * 1.5; ctx.stroke();
      ctx.globalAlpha = 0.14 * tw; ctx.beginPath(); ctx.arc(hx, hy, size * 5.2, 0, TAU); ctx.fill();
      ctx.globalAlpha = 0.3 * tw; ctx.beginPath(); ctx.arc(hx, hy, size * 2.5, 0, TAU); ctx.fill();
      ctx.globalAlpha = 0.98 * dim; ctx.beginPath(); ctx.arc(hx, hy, size * 1.15, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;

    // glow layer (quarter resolution, blurred by css)
    gctx.setTransform(0.25, 0, 0, 0.25, 0, 0); gctx.clearRect(0, 0, canW + 8, canH + 8);
    gctx.strokeStyle = mk(gctx, false); gctx.lineWidth = (portrait ? 5 : 8 * px) * wpulse; gctx.lineJoin = 'bevel';
    gctx.globalAlpha = 0.3 * dim; gctx.beginPath();
    for (let k = 0; k < N; k += 4) { if (!TH[k]._wh && TH[k]._al > 0.05) sub(gctx, k); }
    gctx.stroke();

    // threads that pass in front of DOM objects of a slide (a scene may ask for it with front / frontLine)
    let FS = null, near = 0;
    for (const [S, pos] of [[A, i], [B, i + 1]]) {
      if (!S.front) continue;
      const n = clamp(1 - Math.abs((i + f) - pos) * 4);
      if (n > near) { near = n; FS = S; }
    }
    if (near > 0 || !frontClean) {
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0); fctx.clearRect(0, 0, canW, canH);
      fr.style.opacity = near; frontClean = near <= 0;
    }
    if (near > 0) {
      const c = FS.cfg[o], ln = FS.frontLine(c), a = ln[2] * Math.PI / 180, cx = sx + ln[0] * px, cy = sy + ln[1] * px, d = 4000;
      const ux = Math.cos(a), uy = Math.sin(a), vx = -uy, vy = ux;
      fctx.save(); fctx.beginPath();
      fctx.moveTo(cx - ux * d, cy - uy * d); fctx.lineTo(cx + ux * d, cy + uy * d);
      fctx.lineTo(cx + ux * d + vx * d, cy + uy * d + vy * d); fctx.lineTo(cx - ux * d + vx * d, cy - uy * d + vy * d);
      fctx.closePath(); fctx.clip();
      const g2 = mk(fctx, false), w2 = mk(fctx, true);
      fctx.lineJoin = 'bevel';
      for (const [key, list] of groups) {
        fctx.beginPath();
        let any = false;
        for (const k of list) { if (FS.front(TH[k])) { sub(fctx, k); any = true; } }
        if (!any) continue;
        fctx.strokeStyle = key >= 1000 ? w2 : g2; fctx.globalAlpha = keyAlpha(key); fctx.lineWidth = keyWidth(key);
        fctx.stroke();
      }
      fctx.restore();
    }

    // core light and background colour fields: only transform changes (no layout, no repaint)
    const k1 = A.core(ca), k2 = B.core(cb), cr = lerp(k1[2], k2[2], fe) * px * (1 + 0.1 * pulse);
    core.style.transform = 'translate(' + (sx + lerp(k1[0], k2[0], fe) * px - 200) + 'px,' + (sy + lerp(k1[1], k2[1], fe) * px - 200) + 'px) scale(' + (cr / 200) + ')';
    const on = cr > 1 ? dim : 0;
    if (on !== coreOn) { coreOn = on; core.style.opacity = on; }
    const ba = A.bg[o], bb = B.bg[o], br = (portrait ? 330 : 820) * px, drift = SHOT || reduce ? 0 : time;
    const place = (el, x, y, s, ph) => {
      const r = br * s;
      el.style.transform = 'translate(' + (ox + x * px - 500 + Math.sin(drift * 0.11 + ph) * 26 * px) + 'px,' + (oy + y * px - 500 + Math.cos(drift * 0.09 + ph) * 22 * px) + 'px) scale(' + (r / 500) + ')';
    };
    place(b1, lerp(ba[0], bb[0], fe), lerp(ba[1], bb[1], fe), lerp(ba[2], bb[2], fe), 0);
    place(b2, lerp(ba[3], bb[3], fe), lerp(ba[4], bb[4], fe), lerp(ba[5], bb[5], fe), 2);
  }

  function start() {
    cv = $('threads'); gl = $('glow'); fr = $('front'); core = $('core'); b1 = $('blobPink'); b2 = $('blobBlue');
    deck = document.getElementById('deck'); slides = [...document.querySelectorAll('.slide')];
    SC = slides.map((s) => DEFS[+s.dataset.n]);
    SC.forEach((d, i) => { if (!d) throw new Error('no scene for slide ' + slides[i].dataset.n); });
    size();
    const stages = [...document.querySelectorAll('.stage')];
    if (SHOT || !('IntersectionObserver' in window)) stages.forEach((s) => s.classList.add('in'));
    else {
      // text appears when 40% of a page is in view and disappears only when the page has left the screen completely,
      // so small scroll and address-bar movements never make it blink
      const io = new IntersectionObserver((es) => es.forEach((e) => {
        if (e.intersectionRatio >= 0.4) e.target.classList.add('in'); else if (!e.isIntersecting) e.target.classList.remove('in');
      }), { threshold: [0, 0.4] });
      stages.forEach((s) => io.observe(s));
    }
    frame(where(), 0);
    if (SHOT) return;
    // a height-only change (the phone address bar) only re-measures the slides; the canvases stay as they are
    addEventListener('resize', () => {
      if (innerWidth === canW && innerHeight <= canH) layout(); else size();
      frame(where(), performance.now() / 1000);
    });
    addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') ptarget = [e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5]; });
    addEventListener('keydown', (e) => {
      const d = { ArrowRight: 1, ArrowDown: 1, PageDown: 1, ' ': 1, ArrowLeft: -1, ArrowUp: -1, PageUp: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      const y = deck ? deck.scrollTop : (window.scrollY || 0);
      let target = y;
      if (d > 0) { const n = snaps.find((s) => s > y + 4); target = n === undefined ? snaps[snaps.length - 1] : n; }
      else { const p = snaps.filter((s) => s < y - 4); target = p.length ? p[p.length - 1] : 0; }
      (deck || window).scrollTo({ top: target, behavior: 'smooth' });
    });
    if (reduce) { (deck || window).addEventListener('scroll', () => frame(where(), 0), { passive: true }); return; }
    let slow = 0, frames = 0, last = performance.now();
    (function loop(now) {
      const dt = now - last; last = now;
      if (!document.hidden) {
        pointer[0] += (ptarget[0] - pointer[0]) * 0.05; pointer[1] += (ptarget[1] - pointer[1]) * 0.05;
        frame(where(), now / 1000);
        // slower devices get fewer threads
        if (++frames > 20 && frames < 140) { if (dt > 30) slow++; if (frames === 139 && slow > 60 && N > 110) N = Math.round(N * 0.6); }
      }
      requestAnimationFrame(loop);
    })(last);
  }

  return { scene, start, H, TH, where: () => where(), lay: () => lay };
})();

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

// Slide 3, virtual cards: a globe of meridians and parallels with an orbit ribbon; the cards (DOM) fly on the orbit.
(() => {
  const H = DECK.H, buf = H.mkBuf();
  DECK.scene(3, {
    cfg: [{ cx: 838, cy: 560, R: 300, rx: 372, ry: 126, rot: -17 }, { cx: 195, cy: 318, R: 104, rx: 146, ry: 48, rot: -17 }],
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

// Slide 4, eSIM: signal waves. Wave fronts of light leave the SIM (a DOM object at cx, cy) and fade on their way out.
(() => {
  const H = DECK.H, FRONTS = 6, SPEED = 0.028;
  const phase = (th, time) => ((Math.floor(th.q * FRONTS) + th.g * 0.06) / FRONTS + time * SPEED) % 1;   // 0 at the SIM, 1 at the edge
  DECK.scene(4, {
    cfg: [{ cx: 1390, cy: 450, r0: 124, r1: 460 }, { cx: 195, cy: 306, r0: 44, r1: 165 }],
    mid: 0.9,
    bg: [[1560, 300, 1.0, 1080, 800, 1.0], [310, 210, 1.0, 70, 440, 1.0]],
    stars: 12,
    pt(th, j, s, time, c, o) {
      const ph = phase(th, time), t = s * H.TAU, sc = c.r1 / 500;
      th.ph = 0.4;
      const r = c.r0 + (c.r1 - c.r0) * ph + H.ribbonOff(th, t, (5 + 13 * ph) * sc, 0.3, (1.5 + 4 * ph) * sc, time);
      o[0] = c.cx + r * Math.cos(t); o[1] = c.cy + r * Math.sin(t);
    },
    al: (th, time) => { const ph = phase(th, time); return 0.46 * Math.min(1, ph * 7) * Math.pow(1 - ph, 1.25); },
    lw: () => 0.95,
    white: (th) => th.r < 0.1,
    ext: (c) => [c.cx - c.r1 * 0.8, c.cx + c.r1 * 0.8],
    core: (c) => [c.cx, c.cy, c.r0 * 1.5]
  });
})();

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

// Slide 8, transit wallets: a constellation. One big ring (all wallets in one place) and K small rings around it
// (separate wallets), joined to the centre by fine spokes. The small rings do not move, so DOM name tags can sit
// next to them: ring k is centred at DECK.s08pos(cfg, k). The same numbers live in src/slides/s08.py (LC, PC).
(() => {
  const H = DECK.H, K = 5;
  const pos = (c, k) => { const a = (-90 + 36 + k * 72) * Math.PI / 180; return [c.cx + c.D * Math.cos(a), c.cy + c.D * Math.sin(a) * 0.82]; };
  DECK.s08pos = pos;
  // thread groups by q: the big ring (its core, then a soft halo), the small rings, the spokes
  const BIG = 0.25, HALO = 0.33, SMALL = 0.87, SW = (SMALL - HALO) / K, PW = (1 - SMALL) / K;
  DECK.scene(8, {
    cfg: [{ cx: 1352, cy: 524, R: 164, r: 62, D: 344 }, { cx: 195, cy: 330, R: 60, r: 25, D: 138 }],
    mid: 0.9,
    bg: [[1600, 330, 1.0, 1040, 800, 1.0], [310, 230, 0.95, 70, 450, 1.0]],
    stars: 22,
    pt(th, j, s, time, c, o) {
      const q = th.q, t = s * H.TAU, sc = c.R / 150;
      if (q < HALO) {                                   // the big ring
        const halo = q >= BIG;
        th.ph = halo ? 0.2 : 0.5;
        const r = c.R + H.ribbonOff(th, t, (halo ? 38 : 19) * sc, 0.4, (halo ? 6.5 : 2.6) * sc, time);
        o[0] = c.cx + r * Math.cos(t); o[1] = c.cy + r * Math.sin(t);
      } else if (q < SMALL) {                           // small rings
        const k = Math.min(K - 1, Math.floor((q - HALO) / SW)), p = pos(c, k);
        th.ph = 0.3 + k;
        const r = c.r + H.ribbonOff(th, t, 9 * sc, 0.4, 1.6 * sc, time);
        o[0] = p[0] + r * Math.cos(t); o[1] = p[1] + r * Math.sin(t);
      } else {                                          // spokes: there and back along a slightly bent line
        const k = Math.min(K - 1, Math.floor((q - SMALL) / PW)), p = pos(c, k), back = s >= 0.5, v = back ? (1 - s) * 2 : s * 2;
        const dx = p[0] - c.cx, dy = p[1] - c.cy, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
        const a0 = c.R + 8 * sc, a1 = L - c.r - 5 * sc, d = a0 + (a1 - a0) * v;
        const bend = (back ? -1 : 1) * (2 + 6 * th.r) * sc * Math.sin(Math.PI * v);
        o[0] = c.cx + ux * d - uy * bend; o[1] = c.cy + uy * d + ux * bend;
      }
    },
    al: (th) => th.q < BIG ? 0.4 : th.q < HALO ? 0.17 : th.q < SMALL ? 0.36 : 0.3,
    lw: (th) => th.q < BIG ? 1 : th.q < HALO ? 0.8 : th.q < SMALL ? 1 : 0.8,
    white: (th) => (th.q < BIG || (th.q >= HALO && th.q < SMALL)) && th.g < 0.1,
    ext: (c) => [c.cx - c.D - c.r, c.cx + c.D + c.r],
    core: (c) => [c.cx, c.cy, c.R * 0.55]
  });
})();

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

DECK.start();
