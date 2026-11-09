/* ============================================================================
 * PORTED FILE — DO NOT EDIT THE ASTRONOMY HERE.
 * ----------------------------------------------------------------------------
 * The moon phase and the sign positions, from the Eleven Days Obsidian plugin.
 *
 * Source   : DyllonWright/Eleven-Days (public), src/astro.ts + src/moon.ts
 * Commits  : astro.ts 5be997781e4ee130431affe6ecd4f78d99dbc7dc
 *            moon.ts  6a6beeb3fea56c1d301f388f35736e6c76ead089
 * sha256   : astro.ts 6b44f893cbf57bd1d9e2b7ee971c1b104404f26f95104bb7903604eed4fc1fd7
 *            moon.ts  b2a20f9a87152902224077b61c2c396bdb77aaa53dfaef4b801ab07961fe36c9
 * Copied   : 2026-11-09
 *
 * HOW IT GOT HERE. Both originals are TypeScript, and this site runs no build
 * step, so they were transpiled ONCE, offline, with the plugin repo's own
 * esbuild (--bundle --format=iife --target=es2018, no minification) and the
 * result committed as the plain JavaScript below. Nothing compiles at request
 * time and nothing compiles at deploy time; this file is served exactly as it
 * sits here. Re-running that command against a newer commit is how it gets
 * updated — never by editing the arithmetic in place.
 *
 * Their shared `import buildCalendars from "./engine"` resolved to a four-line
 * shim reading the global that assets/eleven/engine.js already sets, so the
 * engine is NOT duplicated in this bundle. That makes load order load-bearing:
 * engine.js must run before this file, or `buildCalendars` reads undefined.
 *
 * EXPOSED as window.ElevenSky: skyInfo, moonInfo, moonPhase, zodiacOf, SIGNS,
 * jdAtNoon, PLANET_MIN_YEAR, PLANET_MAX_YEAR.
 *
 * RANGE, and why the page checks it. skyInfo returns null outside roughly
 * 1000–3000, and `planetsInRange` goes false outside 1800–2050, where the JPL
 * element table stops being trustworthy. The Sun and Moon keep working across
 * the whole window. The page shows the two lights and says the planets fell
 * out of range rather than drawing numbers nobody should trust.
 *
 * Verified on copy, 2026-11-09: 9 November 2026 gives Sun 17°05' Scorpio and
 * Moon 19°26' Scorpio at a New Moon — the two lights in conjunction, which is
 * what a new moon means, so the solar and lunar paths agree with each other.
 *
 * Provenance also logged in the private hub repo, docs/fleet/PROJECTS.md.
 * ==========================================================================*/

(() => {
  // engine.ts
  var buildCalendars = globalThis.buildCalendars;
  var engine_default = buildCalendars;

  // moon.ts
  var core = engine_default.__core;
  var RAD = Math.PI / 180;
  var SYNODIC = 29.530588861;
  var K_EPOCH_JDE = 245155009766e-5;
  var JD_RD = 17214245e-1;
  var CONTINUOUS = [
    { emoji: "\u{1F311}", name: "New Moon" },
    { emoji: "\u{1F312}", name: "Waxing Crescent" },
    { emoji: "\u{1F313}", name: "First Quarter" },
    { emoji: "\u{1F314}", name: "Waxing Gibbous" },
    { emoji: "\u{1F315}", name: "Full Moon" },
    { emoji: "\u{1F316}", name: "Waning Gibbous" },
    { emoji: "\u{1F317}", name: "Last Quarter" },
    { emoji: "\u{1F318}", name: "Waning Crescent" }
  ];
  var PRINCIPAL = [
    { frac: 0, type: "new", emoji: "\u{1F311}", name: "New Moon" },
    { frac: 0.25, type: "first", emoji: "\u{1F313}", name: "First Quarter" },
    { frac: 0.5, type: "full", emoji: "\u{1F315}", name: "Full Moon" },
    { frac: 0.75, type: "last", emoji: "\u{1F317}", name: "Last Quarter" }
  ];
  function meanArgs(k) {
    const T = k / 1236.85;
    const jdeMean = K_EPOCH_JDE + SYNODIC * k + 15437e-8 * T * T - 15e-8 * T * T * T + 73e-11 * T * T * T * T;
    const E = 1 - 2516e-6 * T - 74e-7 * T * T;
    const M = RAD * (2.5534 + 29.1053567 * k - 14e-7 * T * T - 11e-8 * T * T * T);
    const Mp = RAD * (201.5643 + 385.81693528 * k + 0.0107582 * T * T + 1238e-8 * T * T * T - 58e-9 * T * T * T * T);
    const F = RAD * (160.7108 + 390.67050284 * k - 16118e-7 * T * T - 227e-8 * T * T * T + 11e-9 * T * T * T * T);
    const Om = RAD * (124.7746 - 1.56375588 * k + 20672e-7 * T * T + 215e-8 * T * T * T);
    return { jdeMean, E, M, Mp, F, Om };
  }
  function quarterJDE(k) {
    const { jdeMean, E, M, Mp, F, Om } = meanArgs(k);
    let jde = jdeMean + -0.62801 * Math.sin(Mp) + 0.17172 * E * Math.sin(M) + -0.01183 * E * Math.sin(Mp + M) + 862e-5 * Math.sin(2 * Mp) + 804e-5 * Math.sin(2 * F) + 454e-5 * E * Math.sin(Mp - M) + 204e-5 * E * E * Math.sin(2 * M) + -18e-4 * Math.sin(Mp - 2 * F) + -7e-4 * Math.sin(Mp + 2 * F) + -4e-4 * Math.sin(3 * Mp) + -34e-5 * E * Math.sin(2 * Mp - M) + 32e-5 * E * Math.sin(M + 2 * F) + 32e-5 * E * Math.sin(M - 2 * F) + -28e-5 * E * E * Math.sin(Mp + 2 * M) + 27e-5 * E * Math.sin(2 * Mp + M) + -17e-5 * Math.sin(Om) + -5e-5 * Math.sin(Mp - M - 2 * F) + 4e-5 * Math.sin(2 * Mp + 2 * F) + -4e-5 * Math.sin(Mp + M + 2 * F) + 4e-5 * Math.sin(Mp - 2 * M) + 3e-5 * Math.sin(Mp + M - 2 * F) + 3e-5 * Math.sin(3 * M) + 2e-5 * Math.sin(2 * Mp - 2 * F) + 2e-5 * Math.sin(Mp - M + 2 * F) + -2e-5 * Math.sin(3 * Mp + M);
    const W = 306e-5 - 38e-5 * E * Math.cos(M) + 26e-5 * Math.cos(Mp) - 2e-5 * Math.cos(Mp - M) + 2e-5 * Math.cos(Mp + M) + 2e-5 * Math.cos(2 * F);
    const frac = k - Math.floor(k);
    if (frac < 0.5) jde += W;
    else jde -= W;
    return jde;
  }
  function principalJDE(k, frac) {
    if (frac === 0) return core.nthNewMoon(k);
    if (frac === 0.5) return core.nthNewMoon(k + 0.5);
    return quarterJDE(k + frac);
  }
  function inRange(year) {
    return year >= 1e3 && year <= 3e3;
  }
  function moonPhase(year, month, day) {
    if (!inRange(year)) return null;
    const rd = core.rdFromGreg(year, month, day);
    const jd = core.JDN(rd) + 0.5;
    const prev = core.newMoonBefore(jd);
    const next = core.newMoonAtOrAfter(jd);
    const span = next - prev;
    if (!(span > 0)) return null;
    const fraction = (jd - prev) / span;
    const illumination = (1 - Math.cos(2 * Math.PI * fraction)) / 2;
    const idx = Math.round(fraction * 8) % 8;
    return { ...CONTINUOUS[idx], illumination, fraction, ageDays: jd - prev };
  }
  function moonInfo(year, month, day) {
    const phase = moonPhase(year, month, day);
    if (!phase) return null;
    const rd = core.rdFromGreg(year, month, day);
    const refJd = core.JDN(rd) + 0.5;
    const k0 = Math.floor((refJd - K_EPOCH_JDE) / SYNODIC);
    const events = [];
    for (let k = k0 - 1; k <= k0 + 3; k++) {
      for (const p of PRINCIPAL) {
        const jde = principalJDE(k, p.frac);
        const eventRd = Math.floor(jde - JD_RD);
        const [ey, em, ed] = core.gregFromRD(eventRd);
        events.push({
          type: p.type,
          emoji: p.emoji,
          name: p.name,
          year: ey,
          month: em,
          day: ed,
          daysFromRef: Math.round(jde - refJd)
        });
      }
    }
    events.sort((a, b) => a.daysFromRef - b.daysFromRef);
    return { phase, events };
  }

  // astro.ts
  var core2 = engine_default.__core;
  var RAD2 = Math.PI / 180;
  var DEG = 180 / Math.PI;
  var mod = (a, n) => (a % n + n) % n;
  var TEXT = "\uFE0E";
  var SIGNS = [
    { name: "Aries", glyph: `\u2648${TEXT}`, element: "fire" },
    { name: "Taurus", glyph: `\u2649${TEXT}`, element: "earth" },
    { name: "Gemini", glyph: `\u264A${TEXT}`, element: "air" },
    { name: "Cancer", glyph: `\u264B${TEXT}`, element: "water" },
    { name: "Leo", glyph: `\u264C${TEXT}`, element: "fire" },
    { name: "Virgo", glyph: `\u264D${TEXT}`, element: "earth" },
    { name: "Libra", glyph: `\u264E${TEXT}`, element: "air" },
    { name: "Scorpio", glyph: `\u264F${TEXT}`, element: "water" },
    { name: "Sagittarius", glyph: `\u2650${TEXT}`, element: "fire" },
    { name: "Capricorn", glyph: `\u2651${TEXT}`, element: "earth" },
    { name: "Aquarius", glyph: `\u2652${TEXT}`, element: "air" },
    { name: "Pisces", glyph: `\u2653${TEXT}`, element: "water" }
  ];
  function zodiacOf(longitude) {
    const lon = mod(longitude, 360);
    const index = Math.floor(lon / 30);
    const within = lon - index * 30;
    let degree = Math.floor(within);
    let minute = Math.floor((within - degree) * 60);
    if (minute > 59) {
      minute = 0;
      degree += 1;
    }
    const sign = SIGNS[index];
    return { index, name: sign.name, glyph: sign.glyph, element: sign.element, degree, minute };
  }
  var MOON_TERMS = [
    [0, 0, 1, 0, 6288774],
    [2, 0, -1, 0, 1274027],
    [2, 0, 0, 0, 658314],
    [0, 0, 2, 0, 213618],
    [0, 1, 0, 0, -185116],
    [0, 0, 0, 2, -114332],
    [2, 0, -2, 0, 58793],
    [2, -1, -1, 0, 57066],
    [2, 0, 1, 0, 53322],
    [2, -1, 0, 0, 45758],
    [0, 1, -1, 0, -40923],
    [1, 0, 0, 0, -34720],
    [0, 1, 1, 0, -30383],
    [2, 0, 0, -2, 15327],
    [0, 0, 1, 2, -12528],
    [0, 0, 1, -2, 10980],
    [4, 0, -1, 0, 10675],
    [0, 0, 3, 0, 10034],
    [4, 0, -2, 0, 8548],
    [2, 1, -1, 0, -7888],
    [2, 1, 0, 0, -6766],
    [1, 0, -1, 0, -5163],
    [1, 1, 0, 0, 4987],
    [2, -1, 1, 0, 4036],
    [2, 0, 2, 0, 3994],
    [4, 0, 0, 0, 3861],
    [2, 0, -3, 0, 3665],
    [0, 1, -2, 0, -2689],
    [2, 0, -1, 2, -2602],
    [2, -1, -2, 0, 2390],
    [1, 0, 1, 0, -2348],
    [2, -2, 0, 0, 2236],
    [0, 1, 2, 0, -2120],
    [0, 2, 0, 0, -2069],
    [2, -2, -1, 0, 2048],
    [2, 0, 1, -2, -1773],
    [2, 0, 0, 2, -1595],
    [4, -1, -1, 0, 1215],
    [0, 0, 2, 2, -1110],
    [3, 0, -1, 0, -892],
    [2, 1, 1, 0, -810],
    [4, -1, -2, 0, 759],
    [0, 2, -1, 0, -713],
    [2, 2, -1, 0, -700],
    [2, 1, -2, 0, 691],
    [2, -1, 0, -2, 596],
    [4, 0, 1, 0, 549],
    [0, 0, 4, 0, 537],
    [4, -1, 0, 0, 520],
    [1, 0, -2, 0, -487],
    [2, 1, 0, -2, -399],
    [0, 0, 2, -2, -381],
    [1, 1, 1, 0, 351],
    [3, 0, -2, 0, -340],
    [4, 0, -3, 0, 330],
    [2, -1, 2, 0, 327],
    [0, 2, 1, 0, -323],
    [1, 1, -1, 0, 299],
    [2, 0, 3, 0, 294],
    [2, 0, -1, -2, 0]
  ];
  function lunarLongitude(jd) {
    const T = (jd - 2451545) / 36525;
    const T2 = T * T, T3 = T2 * T, T4 = T3 * T;
    const Lp = 218.3164477 + 481267.88123421 * T - 15786e-7 * T2 + T3 / 538841 - T4 / 65194e3;
    const D = 297.8501921 + 445267.1114034 * T - 18819e-7 * T2 + T3 / 545868 - T4 / 113065e3;
    const M = 357.5291092 + 35999.0502909 * T - 1536e-7 * T2 + T3 / 2449e4;
    const Mp = 134.9633964 + 477198.8675055 * T + 87414e-7 * T2 + T3 / 69699 - T4 / 14712e3;
    const F = 93.272095 + 483202.0175233 * T - 36539e-7 * T2 - T3 / 3526e3 + T4 / 86331e4;
    const A1 = 119.75 + 131.849 * T;
    const A2 = 53.09 + 479264.29 * T;
    const E = 1 - 2516e-6 * T - 74e-7 * T2;
    let sigmaL = 0;
    for (const [cD, cM, cMp, cF, coeff] of MOON_TERMS) {
      const arg = RAD2 * (cD * D + cM * M + cMp * Mp + cF * F);
      const absM = Math.abs(cM);
      const scale = absM === 1 ? E : absM === 2 ? E * E : 1;
      sigmaL += coeff * scale * Math.sin(arg);
    }
    sigmaL += 3958 * Math.sin(RAD2 * A1) + 1962 * Math.sin(RAD2 * (Lp - F)) + 318 * Math.sin(RAD2 * A2);
    const lambda = Lp + sigmaL / 1e6;
    return mod(lambda + nutationInLongitude(T), 360);
  }
  function lunarNodeLongitude(jd) {
    const T = (jd - 2451545) / 36525;
    return mod(125.0445479 - 1934.1362891 * T + 20754e-7 * T * T + T * T * T / 467441, 360);
  }
  function lunarApogeeLongitude(jd) {
    const T = (jd - 2451545) / 36525;
    const T2 = T * T, T3 = T2 * T, T4 = T3 * T;
    const Lp = 218.3164477 + 481267.88123421 * T - 15786e-7 * T2 + T3 / 538841 - T4 / 65194e3;
    const Mp = 134.9633964 + 477198.8675055 * T + 87414e-7 * T2 + T3 / 69699 - T4 / 14712e3;
    return mod(Lp - Mp + 180, 360);
  }
  function nutationInLongitude(T) {
    const omega = RAD2 * (125.04452 - 1934.136261 * T);
    const Ls = RAD2 * (280.4665 + 36000.7698 * T);
    const Lm = RAD2 * (218.3165 + 481267.8813 * T);
    const arcsec = -17.2 * Math.sin(omega) - 1.32 * Math.sin(2 * Ls) - 0.23 * Math.sin(2 * Lm) + 0.21 * Math.sin(2 * omega);
    return arcsec / 3600;
  }
  var PLANETS = [
    {
      key: "mercury",
      name: "Mercury",
      glyph: "\u263F",
      el: [0.38709927, 0.20563593, 7.00497902, 252.2503235, 77.45779628, 48.33076593],
      rate: [37e-8, 1906e-8, -594749e-8, 149472.67411175, 0.16047689, -0.12534081]
    },
    {
      key: "venus",
      name: "Venus",
      glyph: "\u2640",
      el: [0.72333566, 677672e-8, 3.39467605, 181.9790995, 131.60246718, 76.67984255],
      rate: [39e-7, -4107e-8, -7889e-7, 58517.81538729, 268329e-8, -0.27769418]
    },
    {
      key: "mars",
      name: "Mars",
      glyph: "\u2642",
      el: [1.52371034, 0.0933941, 1.84969142, -4.55343205, -23.94362959, 49.55953891],
      rate: [1847e-8, 7882e-8, -813131e-8, 19140.30268499, 0.44441088, -0.29257343]
    },
    {
      key: "jupiter",
      name: "Jupiter",
      glyph: "\u2643",
      el: [5.202887, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909],
      rate: [-11607e-8, -13253e-8, -183714e-8, 3034.74612775, 0.21252668, 0.20469106]
    },
    {
      key: "saturn",
      name: "Saturn",
      glyph: "\u2644",
      el: [9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448],
      rate: [-12506e-7, -50991e-8, 193609e-8, 1222.49362201, -0.41897216, -0.28867794]
    },
    {
      key: "uranus",
      name: "Uranus",
      glyph: "\u2645",
      el: [19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.9542763, 74.01692503],
      rate: [-196176e-8, -4397e-8, -242939e-8, 428.48202785, 0.40805281, 0.04240589]
    },
    {
      key: "neptune",
      name: "Neptune",
      glyph: "\u2646",
      el: [30.06992276, 859048e-8, 1.77004347, -55.12002969, 44.96476227, 131.78422574],
      rate: [26291e-8, 5105e-8, 35372e-8, 218.45945325, -0.32241464, -508664e-8]
    },
    {
      key: "pluto",
      name: "Pluto",
      glyph: "\u2647",
      el: [39.48211675, 0.2488273, 17.14001206, 238.92903833, 224.06891629, 110.30393684],
      rate: [-31596e-8, 517e-7, 4818e-8, 145.20780515, -0.04062942, -0.01183482]
    }
  ];
  var EARTH = {
    key: "earth",
    name: "Earth",
    glyph: "\u2295",
    el: [1.00000261, 0.01671123, -1531e-8, 100.46457166, 102.93768193, 0],
    rate: [562e-8, -4392e-8, -0.01294668, 35999.37244981, 0.32327364, 0]
  };
  function heliocentric(p, T) {
    const a = p.el[0] + p.rate[0] * T;
    const e = p.el[1] + p.rate[1] * T;
    const I = p.el[2] + p.rate[2] * T;
    const L = p.el[3] + p.rate[3] * T;
    const peri = p.el[4] + p.rate[4] * T;
    const node = p.el[5] + p.rate[5] * T;
    const omega = peri - node;
    const M = mod(L - peri + 180, 360) - 180;
    const eDeg = DEG * e;
    let E = M + eDeg * Math.sin(RAD2 * M);
    for (let i = 0; i < 12; i++) {
      const dM = M - (E - eDeg * Math.sin(RAD2 * E));
      const dE = dM / (1 - e * Math.cos(RAD2 * E));
      E += dE;
      if (Math.abs(dE) < 1e-10) break;
    }
    const xp = a * (Math.cos(RAD2 * E) - e);
    const yp = a * Math.sqrt(1 - e * e) * Math.sin(RAD2 * E);
    const cw = Math.cos(RAD2 * omega), sw = Math.sin(RAD2 * omega);
    const cn = Math.cos(RAD2 * node), sn = Math.sin(RAD2 * node);
    const ci = Math.cos(RAD2 * I), si = Math.sin(RAD2 * I);
    return [
      (cw * cn - sw * sn * ci) * xp + (-sw * cn - cw * sn * ci) * yp,
      (cw * sn + sw * cn * ci) * xp + (-sw * sn + cw * cn * ci) * yp,
      sw * si * xp + cw * si * yp
    ];
  }
  var precession = (T) => 1.396971 * T + 3086e-7 * T * T;
  function planetLongitude(p, jd) {
    const T = (jd - 2451545) / 36525;
    const earth = heliocentric(EARTH, T);
    let body = heliocentric(p, T);
    for (let i = 0; i < 2; i++) {
      const dx = body[0] - earth[0], dy = body[1] - earth[1], dz = body[2] - earth[2];
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      const lightDays = dist * 0.0057755183;
      body = heliocentric(p, (jd - lightDays - 2451545) / 36525);
    }
    const x = body[0] - earth[0];
    const y = body[1] - earth[1];
    return mod(DEG * Math.atan2(y, x) + precession(T), 360);
  }
  var STATION_FRACTION = 0.08;
  var PLANET_MIN_YEAR = 1800;
  var PLANET_MAX_YEAR = 2050;
  function classifyMotion(before, after, meanMotion) {
    if (before === null || after === null) return { retrograde: false, stationary: false };
    const perDay = (mod(after - before + 180, 360) - 180) / 2;
    return {
      retrograde: perDay < 0,
      stationary: Math.abs(perDay) < meanMotion * STATION_FRACTION
    };
  }
  var asBody = (key, name, glyph, lon, motion) => ({
    key,
    name,
    glyph,
    longitude: lon,
    zodiac: zodiacOf(lon),
    ...motion
  });
  var STILL = { retrograde: false, stationary: false };
  function skyInfo(year, month, day) {
    if (year < 1e3 || year > 3e3) return null;
    let jd;
    try {
      jd = core2.JDN(core2.rdFromGreg(year, month, day)) + 0.5;
    } catch (e) {
      return null;
    }
    const sun = asBody("sun", "Sun", "\u2609", core2.solarLongitude(jd), STILL);
    const moon = asBody("moon", "Moon", "\u263D", lunarLongitude(jd), STILL);
    const planetsInRange = year >= PLANET_MIN_YEAR && year <= PLANET_MAX_YEAR;
    const planets = planetsInRange ? PLANETS.map((p) => {
      const meanMotion = Math.abs(p.rate[3] / 100 / 365.25);
      return asBody(
        p.key,
        p.name,
        p.glyph,
        planetLongitude(p, jd),
        classifyMotion(planetLongitude(p, jd - 1), planetLongitude(p, jd + 1), meanMotion)
      );
    }) : [];
    const points = [
      asBody("lilith", "Lilith", `\u26B8${TEXT}`, lunarApogeeLongitude(jd), STILL),
      asBody("northNode", "North Node", `\u260A${TEXT}`, lunarNodeLongitude(jd), STILL)
    ];
    return { sun, moon, planets, planetsInRange, points };
  }
  function jdAtNoon(year, month, day) {
    if (year < 1e3 || year > 3e3) return null;
    try {
      return core2.JDN(core2.rdFromGreg(year, month, day)) + 0.5;
    } catch (e) {
      return null;
    }
  }

  // entry.ts
  globalThis.ElevenSky = {
    moonInfo,
    moonPhase,
    skyInfo,
    zodiacOf,
    SIGNS,
    jdAtNoon,
    PLANET_MIN_YEAR,
    PLANET_MAX_YEAR
  };
})();
