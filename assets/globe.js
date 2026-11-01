/* THE MASTHEAD GLOBE — ONE SPHERE, TWELVE MASKS, SATURN UNDERNEATH.
   ──────────────────────────────────────────────────────────────────────────
   The lockup's planet shipped as a flat gold disc with two arcs whose scaleY
   pulsed, which read as a breath rather than a turn, and whose arcs sat 4px
   below the body's centre so the ring clipped the disc instead of bisecting
   it. Both faults were geometric, and the fix put one orthographic
   projection under everything: a camera elevated TILT above the equatorial
   plane, a body of radius R, everything concentric on the group's origin.

   THE PREMISE (the owner's, 2026-11-01). The neutral state between bodies is
   not a generic wireframe — it is SATURN. Its ring armature never leaves the
   frame: it dims to a trace while another body wears the sphere and returns
   to full when the mask drops. Every other planet is something Saturn is
   briefly pretending to be, which is the gnostic reading of the demiurge put
   into motion rather than into a caption.

   THE BEAT. Eleven seconds a body — in, hold, one quirk, settle, strip —
   and twelve bodies make 132 for a full turn. That number is why: 132 is
   6 x 22 and 4 x 33, so the globe, the 22s light sweep behind the wordmark,
   the 33s craft and the 220/440s wind all divide into one number and meet
   there. 22 carries the alphabet, the paths and the Major Arcana.

   WHAT EACH QUIRK SAYS. One beat of motion per body, and each one encodes
   something true: Venus turns backwards, the Moon librates instead of
   spinning, Jupiter's bands shear at different rates, Uranus flips onto its
   side and back, Mercury sends, Mars is visited.

   THE PROJECTION. For a surface point at latitude L and longitude P:

     n  = (cos L cos P, sin L, cos L sin P)      the unit normal
     d  = (0, sin TILT, cos TILT)                the view direction
     x  = R * n.x
     y  = -R * (n.y * cos TILT - n.z * sin TILT) screen y, down positive
     visible  <=>  n . d > 0

   The equator projects to an ellipse of semi-axes R and R sin TILT, which is
   the ellipse the rings trace, so rings and globe share one tilt by
   construction rather than by eye. Opening the rings therefore swings the
   poles with them: every projection below reads sNow, computed per frame.

   NOTHING READS A PERIOD OFF THE CLOCK. Angles accumulate — each frame adds
   dt times the current rate — so a body handing over to one with a different
   day length bends the motion instead of snapping the phase. Roll and tilt
   ease across the handover for the same reason.

   Paint order carries the depth: the ring's far half, the body, the ring's
   near half. The far half's apex sits inside the body's silhouette, so the
   body hides it and the ring visibly passes behind. */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var TILT = 26 * Math.PI / 180, S = Math.sin(TILT), C = Math.cos(TILT);
  var CX = 100, CY = 100, R = 30, RAD = Math.PI / 180;
  var WIRE = [77, 227, 255];              /* the neutral state's line colour */
  var GOLD = [232, 200, 135];

  /* ── SATURN AS THE SUBSTRATE ───────────────────────────────────────────
     The premise, and the reason this is not a carousel of planets: the
     neutral state between bodies IS Saturn. Its ring armature never leaves
     the frame — it dims to a ghost while another body wears the sphere, and
     comes back to full when the mask drops. Every other planet is something
     Saturn is briefly pretending to be, which is the gnostic reading of the
     demiurge put into motion rather than into a caption. */
  var SUB_RINGS = [[52, .9, .62], [47, .5, .32], [42, .5, .34], [37, .5, .3], [33, .9, .5]];
  var SUB_SPOKES = 14, SUB_IN = 33, SUB_OUT = 52, SUB_HEX = 68;
  var GHOST = .05;         /* a mask leaves only a trace of the armature */
  var NEUTRAL_ROLL = -14;  /* the armature's resting lean, eased to and from */

  /* ── THE BODIES ────────────────────────────────────────────────────────
     Every one is the same sphere. What differs: the fill, the wireframe
     tint, whether it carries rings, and one quirk — a single beat of motion
     that says something true about that body and nothing else needs to. */
  var BODIES = [
    { name: "Sun", core: ["#fffbe8", "#ffc83d", "#8a4a06"], wire: [255, 246, 214],
      spin: 26, corona: "#ffd36b", quirk: "flare" },
    /* Mercury carries the messenger, so it sends: two pulses race off it and
       nothing else happens. The 3:2 stutter it used to do was true and
       completely invisible, which is the wrong trade for a one-beat quirk. */
    { name: "Mercury", core: ["#e6e0d2", "#8e887c", "#2a2722"], wire: [220, 214, 200],
      spin: 54, scale: .62, ping: "#dfe8ff", quirk: "ping" },
    /* Venus is the veiled one — nobody saw its surface until radar. The haze
       swells until it swallows the sphere, then lifts. It keeps turning
       backwards underneath, which is true and costs nothing to leave in. */
    { name: "Venus", core: ["#fff4d8", "#d8ab63", "#4b3415"], wire: [246, 222, 170],
      spin: 44, haze: "#f6d98a", quirk: "veil" },
    { name: "Earth", core: ["#dff0ff", "#3f7fc4", "#0d2645"], wire: [196, 226, 248],
      spin: 20, roll: -23, cap: [66, "#e8f3ff"],
      marks: [{ lat: 22, lon: 60, span: 52, w: 5.5, col: "#4f9d5e" },
              { lat: -2, lon: 95, span: 30, w: 7, col: "#3f8a50" },
              { lat: -28, lon: 196, span: 44, w: 6, col: "#53a567" },
              { lat: 40, lon: 285, span: 36, w: 4.5, col: "#46925a" },
              { lat: -46, lon: 330, span: 22, w: 3.5, col: "#5fae70" }],
      quirk: "launch" },
    { name: "Moon", core: ["#e6e0d2", "#8e887c", "#2a2722"], wire: [206, 200, 188],
      spin: 90, scale: .56, quirk: "librate" },
    /* Mars gets the visitor, and it answers Earth's rocket: one body sends
       something up, the next has something leave it that was never ours.
       The dark marks are its albedo features — Mars was bare before, which
       is why the old dust-storm quirk had nothing to move. */
    { name: "Mars", core: ["#ffd9bf", "#c2663a", "#3d1a0c"], wire: [243, 188, 152],
      spin: 21, roll: -25, scale: .8, cap: [68, "#ffeede"], saucer: "#cfe8d6",
      marks: [{ lat: -8, lon: 40, span: 64, w: 5, col: "#8a4526" },
              { lat: 14, lon: 150, span: 40, w: 4, col: "#7d3e21" },
              { lat: -30, lon: 260, span: 34, w: 3.5, col: "#93502c" }],
      quirk: "visitor" },
    { name: "Jupiter", core: ["#fdeccd", "#cf9d5f", "#432c12"], wire: [240, 207, 156],
      spin: 9, scale: 1.12,
      marks: [{ lat: 26, lon: 0, span: 170, w: 4.2, col: "#a86a34", rate: 1.5 },
              { lat: 4, lon: 120, span: 180, w: 4.6, col: "#f6dcae", rate: .7 },
              { lat: -24, lon: 60, span: 160, w: 4.2, col: "#9c5f32", rate: 1.35 },
              { lat: -17, lon: 250, span: 40, w: 13, col: "#c9452a", rate: 1.35 },
              { lat: -17, lon: 250, span: 26, w: 7, col: "#f08a52", rate: 1.35 }],
      quirk: "shear" },
    { name: "Saturn", core: ["#f7ecd4", "#c9a24b", "#4a3310"], wire: [242, 234, 217],
      spin: 11, unmasked: true, quirk: "ringopen" },
    { name: "Uranus", core: ["#e4fbfd", "#7fc6ce", "#17383d"], wire: [191, 232, 234],
      spin: 17, vertical: true, scale: .88,
      rings: [[44, .8, .5], [38, .5, .28]], ringCol: "#9fd8dd", spokes: 10,
      spokeIn: 38, spokeOut: 44, quirk: "seasons" },
    { name: "Neptune", core: ["#dfe6ff", "#4a5fb8", "#121a42"], wire: [195, 206, 245],
      spin: 16, roll: -28, scale: .86, rings: [[42, .6, .3]], ringCol: "#8f9ede",
      marks: [{ lat: -18, lon: 120, span: 24, w: 4.5, col: "#1e2a5c" }],
      quirk: "superwind" },
    { name: "Pluto", core: ["#e6e0d2", "#8e887c", "#2a2722"], wire: [200, 194, 180],
      spin: 40, scale: .5, quirk: "tumble" },
    { name: "Quasar", core: ["#ffffff", "#8fc3ff", "#101c3a"], wire: [220, 234, 255],
      spin: 7, scale: .7, rings: [[50, 1.1, .6], [44, .6, .35], [38, .6, .3]],
      ringCol: "#9fd0ff", spokes: 16, spokeIn: 34, spokeOut: 50,
      jets: "#bcd9ff", quirk: "jetfire" }
  ];

  /* ── THE BEAT ──────────────────────────────────────────────────────────
     sphere, quirk, sphere again, then stripped back to wireframe. The
     fourth leg is the handover: the fill is already gone when the next
     body's palette swaps in, so nothing cross-fades. */
  /* ELEVEN SECONDS A BODY, AND THE WHOLE BAND SHARES ONE ROOT.
     The beat used to total 7.7s, which was arbitrary — the sum of five
     numbers picked by feel. Twelve bodies at 11s makes 132 for a full turn
     of the wheel: 6 x 22 and 4 x 33, so the globe, the 22s light sweep and
     the 33s craft all divide into the same number and meet there. The hold
     and the quirk take 2.2 and 3.3 directly.

     The per-body spin rates below are NOT on this scheme and should not be:
     they carry each body's own day length against the others, which is the
     thing that makes Jupiter look fast and Mercury look slow. */
  var T_IN = 1.5, T_HOLD = 2.2, T_QUIRK = 3.3, T_SETTLE = 2.0, T_OUT = 2.0;
  var CYCLE = T_IN + T_HOLD + T_QUIRK + T_SETTLE + T_OUT;   /* 11 */

  function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function mix(a, b, t) {
    return "rgb(" + Math.round(a[0] + (b[0] - a[0]) * t) + "," +
      Math.round(a[1] + (b[1] - a[1]) * t) + "," +
      Math.round(a[2] + (b[2] - a[2]) * t) + ")";
  }

  function el(name, attrs) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) { n.setAttribute(k, attrs[k]); }
    return n;
  }

  function Globe(svg, opts) {
    opts = opts || {};
    this.svg = svg;
    this.lats = [0, 30, -30, 58, -58];
    this.mers = 12;
    this.onLabel = opts.onLabel;
    this.index = 0;
    /* Angles accumulate rather than being read off the clock, so a change of
       rate bends the motion instead of snapping the phase. */
    this.phase = 0; this.ringPhase = 0; this.subPhase = 0; this.hexPhase = 0;
    this.lastT = null; this.rollNow = NEUTRAL_ROLL; this.openNow = 1;

    var uid = "g" + Math.random().toString(36).slice(2, 8);
    var defs = el("defs", {});
    this.grad = el("radialGradient", { id: uid + "-core", cx: "34%", cy: "28%", r: "78%" });
    this.stops = [el("stop", { offset: "0%" }), el("stop", { offset: "45%" }),
                  el("stop", { offset: "100%" })];
    for (var i = 0; i < 3; i++) { this.grad.appendChild(this.stops[i]); }
    var shade = el("radialGradient", { id: uid + "-shade", cx: "74%", cy: "80%", r: "76%" });
    shade.appendChild(el("stop", { offset: "0%", "stop-color": "#000", "stop-opacity": ".5" }));
    shade.appendChild(el("stop", { offset: "55%", "stop-color": "#000", "stop-opacity": ".16" }));
    shade.appendChild(el("stop", { offset: "100%", "stop-color": "#000", "stop-opacity": "0" }));
    this.clip = el("clipPath", { id: uid + "-clip" });
    this.clipCircle = el("circle", { r: R });
    this.clip.appendChild(this.clipCircle);
    defs.appendChild(this.grad); defs.appendChild(shade); defs.appendChild(this.clip);
    svg.appendChild(defs);

    this.root = el("g", { transform: "translate(" + CX + " " + CY + ")" });
    svg.appendChild(this.root);

    this.corona = el("g", {}); this.root.appendChild(this.corona);
    for (i = 0; i < 24; i++) { this.corona.appendChild(el("line", { "stroke-width": ".8" })); }
    this.jets = el("g", {}); this.root.appendChild(this.jets);
    this.jets.appendChild(el("polygon", {})); this.jets.appendChild(el("polygon", {}));
    this.jets.appendChild(el("polygon", {})); this.jets.appendChild(el("polygon", {}));
    this.haze = el("circle", { fill: "none", "stroke-width": "3" });
    this.root.appendChild(this.haze);

    this.ringFar = el("g", {}); this.root.appendChild(this.ringFar);
    this.bodyFill = el("circle", { r: R }); this.root.appendChild(this.bodyFill);
    this.bodyFill.setAttribute("fill", "url(#" + uid + "-core)");

    this.spinG = el("g", {});
    this.surface = el("g", { "clip-path": "url(#" + uid + "-clip)" });
    this.spinG.appendChild(this.surface);
    this.root.appendChild(this.spinG);

    this.latNodes = []; this.merNodes = []; this.markNodes = [];
    for (i = 0; i < this.lats.length * 2; i++) {
      var p = el("path", { fill: "none", "stroke-width": ".6" });
      this.surface.appendChild(p); this.latNodes.push(p);
    }
    for (i = 0; i < this.mers; i++) {
      var m = el("path", { fill: "none", "stroke-width": ".6" });
      this.surface.appendChild(m); this.merNodes.push(m);
    }
    for (i = 0; i < 6; i++) {
      var k = el("path", { fill: "none", "stroke-linecap": "round" });
      this.surface.appendChild(k); this.markNodes.push(k);
    }
    this.capNode = el("path", { stroke: "none" }); this.surface.appendChild(this.capNode);
    /* The rocket sits OUTSIDE the surface clip — it has to leave the sphere. */
    this.rocket = el("g", {});
    this.rocketTrail = el("path", { fill: "none", stroke: "#ffd9a0",
      "stroke-width": "1.4", "stroke-linecap": "round" });
    this.rocketBody = el("circle", { r: "1.6", fill: "#fff6e0" });
    this.rocket.appendChild(this.rocketTrail);
    this.rocket.appendChild(this.rocketBody);

    /* Two pulse rings for the messenger, one saucer for the visitor. Both
       live outside the surface clip for the same reason the rocket does. */
    this.pings = [el("circle", { fill: "none", "stroke-width": "1.1", opacity: "0" }),
                  el("circle", { fill: "none", "stroke-width": "1.1", opacity: "0" })];
    this.rocket.appendChild(this.pings[0]);
    this.rocket.appendChild(this.pings[1]);

    this.saucer = el("g", { opacity: "0" });
    this.saucer.appendChild(el("ellipse", { rx: "11", ry: "2.8", fill: "#bfe6cc" }));
    this.saucer.appendChild(el("ellipse", { rx: "5.2", ry: "3.9", cy: "-2.2", fill: "#eaf7ee" }));
    this.saucer.appendChild(el("ellipse", { rx: "15", ry: "5.2", fill: "none",
      stroke: "#8fd4a8", "stroke-width": ".8", opacity: ".55" }));
    this.saucer.appendChild(el("circle", { cx: "-5", cy: "0", r: "1.1", fill: "#fff6c0" }));
    this.saucer.appendChild(el("circle", { cx: "0", cy: "1", r: "1.1", fill: "#fff6c0" }));
    this.saucer.appendChild(el("circle", { cx: "5", cy: "0", r: "1.1", fill: "#fff6c0" }));
    this.rocket.appendChild(this.saucer);
    this.rocket.setAttribute("pointer-events", "none");
    this.hexNode = el("polygon", { "stroke-width": ".8", "stroke-linejoin": "round" });
    this.surface.appendChild(this.hexNode);

    /* The rocket and the saucer leave the sphere, so they hang off the root
       rather than the spin group — inside it the shade and rim circles, which
       are painted afterwards, laid over them. */
    this.root.appendChild(this.rocket);
    this.shade = el("circle", { r: R, fill: "url(#" + uid + "-shade)" });
    this.root.appendChild(this.shade);
    this.rim = el("circle", { r: R - .4, fill: "none", "stroke-width": ".8" });
    this.root.appendChild(this.rim);
    this.ringNear = el("g", {}); this.root.appendChild(this.ringNear);
    this.veil = el("circle", { opacity: "0" }); this.root.appendChild(this.veil);

    this.subNodes = []; this.subSpokes = [];
    for (i = 0; i < SUB_RINGS.length; i++) {
      var sfar = el("path", { fill: "none", "stroke-linecap": "round", stroke: "#e8c887" });
      var snear = el("path", { fill: "none", "stroke-linecap": "round", stroke: "#e8c887" });
      this.ringFar.appendChild(sfar); this.ringNear.appendChild(snear);
      this.subNodes.push([sfar, snear]);
    }
    for (i = 0; i < SUB_SPOKES; i++) {
      var ssp = el("line", { "stroke-width": ".55", "stroke-linecap": "round", stroke: "#e8c887" });
      this.ringNear.appendChild(ssp);
      this.subSpokes.push({ node: ssp, half: "near" });
    }
    this.subHex = el("polygon", { "stroke-width": ".8", "stroke-linejoin": "round", fill: "none" });
    this.surface.appendChild(this.subHex);

    this.ringNodes = []; this.spokeNodes = [];
    for (i = 0; i < 6; i++) {
      var far = el("path", { fill: "none", "stroke-linecap": "round" });
      var near = el("path", { fill: "none", "stroke-linecap": "round" });
      this.ringFar.appendChild(far); this.ringNear.appendChild(near);
      this.ringNodes.push([far, near]);
    }
    for (i = 0; i < 16; i++) {
      var sp = el("line", { "stroke-width": ".55", "stroke-linecap": "round" });
      this.ringNear.appendChild(sp);
      this.spokeNodes.push({ node: sp, half: "near" });
    }
    this.apply(0);
  }

  Globe.prototype.apply = function (i) {
    var b = BODIES[i];
    this.body = b;
    this.scale = b.scale || 1;
    for (var k = 0; k < 3; k++) { this.stops[k].setAttribute("stop-color", b.core[k]); }
    if (this.onLabel) { this.onLabel(b.name); }
  };

  /* One frame. `t` is seconds since the loop began.

     NOTHING HERE READS A PERIOD OFF THE CLOCK. Spin used to come out of
     `t * 2pi / period`, which is continuous only while the period holds —
     the moment a body handed over to one with a different day length, the
     phase jumped. Angle now accumulates: each frame adds dt times the
     current rate, so a rate change bends the motion instead of snapping it.
     Roll and tilt ease across the handover for the same reason.

     ONE TILT, NOT TWO. The ring plane and the equator are the same plane,
     so a ring that opens has to swing the poles with it. Every projection
     below reads sNow/cNow, computed once per frame, rather than the fixed
     S and C — which is what couples the axis to the rings. */
  Globe.prototype.draw = function (t) {
    var idx = Math.floor(t / CYCLE) % BODIES.length;
    if (idx !== this.index) { this.index = idx; this.apply(idx); }
    var b = this.body, u = t % CYCLE, i;
    var dt = this.lastT === null ? 0 : Math.min(.05, t - this.lastT);
    this.lastT = t;

    var solid, quirk = 0;
    if (u < T_IN) { solid = ease(u / T_IN); }
    else if (u < T_IN + T_HOLD) { solid = 1; }
    else if (u < T_IN + T_HOLD + T_QUIRK) {
      solid = 1; quirk = (u - T_IN - T_HOLD) / T_QUIRK;
    } else if (u < CYCLE - T_OUT) { solid = 1; }
    else { solid = 1 - ease((u - (CYCLE - T_OUT)) / T_OUT); }

    var q = quirk === 0 ? 0
      : ease(clamp01(quirk < .3 ? quirk / .3 : quirk > .75 ? (1 - quirk) / .25 : 1));
    var bell = quirk === 0 ? 0 : Math.sin(Math.PI * quirk);
    var kind = b.quirk;

    /* ── rates, integrated ───────────────────────────────────────────── */
    var rate = 2 * Math.PI / b.spin;
    if (kind === "retrograde" || kind === "veil") { rate *= 1 - 2.6 * q; }
    if (kind === "superwind") { rate *= 1 + 2.6 * q; }
    if (kind === "stutter") { rate *= 1 + 1.6 * Math.sin(t * 7) * q; }
    if (kind === "seasons") { rate *= 1 + 1.9 * q; }
    this.phase += dt * rate;
    this.ringPhase += dt * 2 * Math.PI / (b.spin * 1.5);
    this.subPhase += dt * 2 * Math.PI / 22;
    this.hexPhase += dt * 2 * Math.PI / 11;
    var spin = this.phase;

    /* ── roll and tilt, eased across the handover ────────────────────── */
    /* A body on its side flips ONCE on the way in and ONCE on the way back.
       Its quirk happens while it is over, never by flipping again: the
       transition is the flip, and the beat in between is the planet. The
       flip home lands before the strip, so it plays on a solid sphere
       rather than on something already dissolving. */
    var tipped = b.vertical && u < T_IN + T_HOLD + T_QUIRK + T_SETTLE * .35;
    var wantRoll = b.vertical
      ? (tipped ? NEUTRAL_ROLL + (90 - NEUTRAL_ROLL) * solid : NEUTRAL_ROLL)
      : NEUTRAL_ROLL + ((b.roll || NEUTRAL_ROLL) - NEUTRAL_ROLL) * solid;
    if (kind === "librate") { wantRoll += q * Math.sin(t * 2.4) * 16; }
    if (kind === "seasons") { wantRoll += q * Math.sin(t * 1.1) * 9; }
    if (kind === "tumble") { wantRoll += q * Math.sin(t * 1.7) * 40; }
    /* A low-pass on roll, so nothing a quirk does arrives as a step. */
    this.rollNow += (wantRoll - this.rollNow) * Math.min(1, dt * 6);
    var roll = this.rollNow;

    /* The rings open, and the whole axis swings with them. Starts and ends
       at the resting tilt, so the beat never snaps at either edge. */
    var open = kind === "ringopen" ? 1 - .78 * bell : 1;
    this.openNow += (open - this.openNow) * Math.min(1, dt * 5);
    var sNow = S * this.openNow;
    var cNow = Math.sqrt(Math.max(.02, 1 - sNow * sNow));

    this.spinG.setAttribute("transform", "rotate(" + roll.toFixed(2) + ")");
    this.ringFar.setAttribute("transform", "rotate(" + roll.toFixed(2) + ")");
    this.ringNear.setAttribute("transform", "rotate(" + roll.toFixed(2) + ")");

    var rad = R * (1 + (this.scale - 1) * solid);
    this.clipCircle.setAttribute("r", rad);
    this.bodyFill.setAttribute("r", rad);
    this.shade.setAttribute("r", rad);
    this.rim.setAttribute("r", rad - .4);

    var wireCol = mix(WIRE, b.wire, solid);
    /* Wearing a mask means the armature recedes: the body goes nearly opaque
       and the lines drop to a trace, so the sphere reads as a planet rather
       than as a planet drawn over a diagram. */
    var wireOp = .9 - .74 * solid;

    this.bodyFill.setAttribute("opacity", (solid * .96).toFixed(3));
    this.shade.setAttribute("opacity", (solid * .8).toFixed(3));
    this.rim.setAttribute("stroke", wireCol);
    this.rim.setAttribute("opacity", (.2 + .5 * (1 - solid)).toFixed(3));

    for (i = 0; i < this.lats.length; i++) {
      var la = this.lats[i] * RAD;
      var rx = rad * Math.cos(la), ry = rx * sNow, cy = -rad * Math.sin(la) * cNow;
      this.latNodes[i * 2].setAttribute("d",
        "M " + (-rx).toFixed(1) + " " + cy.toFixed(1) + " A " + rx.toFixed(1) + " " +
        ry.toFixed(1) + " 0 0 1 " + rx.toFixed(1) + " " + cy.toFixed(1));
      this.latNodes[i * 2 + 1].setAttribute("d",
        "M " + rx.toFixed(1) + " " + cy.toFixed(1) + " A " + rx.toFixed(1) + " " +
        ry.toFixed(1) + " 0 0 1 " + (-rx).toFixed(1) + " " + cy.toFixed(1));
      this.latNodes[i * 2].setAttribute("stroke", wireCol);
      this.latNodes[i * 2 + 1].setAttribute("stroke", wireCol);
      this.latNodes[i * 2].setAttribute("opacity", (wireOp * .35).toFixed(3));
      this.latNodes[i * 2 + 1].setAttribute("opacity", (wireOp * .8).toFixed(3));
    }

    var pole = rad * cNow;
    for (i = 0; i < this.mers; i++) {
      var lon = spin + i * 2 * Math.PI / this.mers;
      this.merNodes[i].setAttribute("d",
        "M 0 " + (-pole).toFixed(1) + " Q " + (2 * rad * Math.cos(lon)).toFixed(1) + " " +
        (2 * rad * Math.sin(lon) * sNow).toFixed(1) + " 0 " + pole.toFixed(1));
      this.merNodes[i].setAttribute("stroke", wireCol);
      this.merNodes[i].setAttribute("opacity",
        (wireOp * (.28 + .72 * Math.max(0, Math.sin(lon)))).toFixed(3));
    }

    var marks = b.marks || [];
    for (i = 0; i < this.markNodes.length; i++) {
      var node = this.markNodes[i];
      if (i >= marks.length) { node.setAttribute("d", ""); continue; }
      var mk = marks[i];
      var mrate = mk.rate || 1;
      if (kind === "shear") { mrate *= 1 + q * (i % 2 ? -1.4 : 1.4); }
      if (kind === "duststorm") { mrate *= 1 + q * 2; }
      var base = mk.lon * RAD + spin * mrate;
      var la2 = mk.lat * RAD, cosL = Math.cos(la2), sinL = Math.sin(la2);
      var d = "", pen = false;
      for (var sm = 0; sm <= 14; sm++) {
        var lo = base + (sm / 14 - .5) * mk.span * RAD;
        var depth = sinL * sNow + cosL * Math.sin(lo) * cNow;
        if (depth <= .02) { pen = false; continue; }
        var x = rad * cosL * Math.cos(lo);
        var y = -rad * sinL * cNow + rad * cosL * Math.sin(lo) * sNow;
        d += (pen ? " L " : " M ") + x.toFixed(1) + " " + y.toFixed(1);
        pen = true;
      }
      node.setAttribute("d", d);
      node.setAttribute("stroke", mk.col);
      node.setAttribute("stroke-width", mk.w);
      node.setAttribute("opacity", (solid * .8).toFixed(3));
    }

    if (b.cap) {
      var cl = b.cap[0] * RAD, crx = rad * Math.cos(cl);
      var ccy = -rad * Math.sin(cl) * cNow;
      this.capNode.setAttribute("d",
        "M " + (-crx).toFixed(1) + " " + ccy.toFixed(1) + " A " + crx.toFixed(1) + " " +
        (crx * sNow).toFixed(1) + " 0 0 1 " + crx.toFixed(1) + " " + ccy.toFixed(1) + " Z");
      this.capNode.setAttribute("fill", b.cap[1]);
      this.capNode.setAttribute("opacity", (solid * .5).toFixed(3));
    } else { this.capNode.setAttribute("d", ""); }

    /* ── Earth's one trick: something leaves it ──────────────────────── */
    if (kind === "launch" && quirk > .04 && quirk < .96) {
      var fly = (quirk - .04) / .92;
      var llat = 26 * RAD, llon = spin + 1.1;
      var ldepth = Math.sin(llat) * sNow + Math.cos(llat) * Math.sin(llon) * cNow;
      var lx = rad * Math.cos(llat) * Math.cos(llon);
      var ly = -rad * Math.sin(llat) * cNow + rad * Math.cos(llat) * Math.sin(llon) * sNow;
      var len = Math.sqrt(lx * lx + ly * ly) || 1;
      /* Out along the local vertical, then curved off by its own momentum —
         enough of an arc to read as an ascent rather than a thrown stone. */
      var climb = 62 * fly * fly;
      var drift = 26 * fly * fly * fly;
      var px = lx / len * (len + climb) - ly / len * drift;
      var py = ly / len * (len + climb) + lx / len * drift;
      var fade = ldepth > 0 ? Math.min(1, (1 - fly) * 2.2) : 0;
      this.rocketTrail.setAttribute("d",
        "M " + lx.toFixed(1) + " " + ly.toFixed(1) +
        " Q " + ((lx + px) / 2 - ly / len * drift * .6).toFixed(1) + " " +
        ((ly + py) / 2 + lx / len * drift * .6).toFixed(1) + " " +
        px.toFixed(1) + " " + py.toFixed(1));
      this.rocketTrail.setAttribute("opacity", (.55 * fade).toFixed(3));
      this.rocketBody.setAttribute("cx", px.toFixed(1));
      this.rocketBody.setAttribute("cy", py.toFixed(1));
      this.rocketBody.setAttribute("opacity", fade.toFixed(3));
    } else {
      this.rocketTrail.setAttribute("opacity", "0");
      this.rocketBody.setAttribute("opacity", "0");
    }

    /* ── Mercury sends ───────────────────────────────────────────────── */
    for (i = 0; i < 2; i++) {
      var pg = this.pings[i];
      if (kind !== "ping" || quirk === 0) { pg.setAttribute("opacity", "0"); continue; }
      /* Two pulses, the second half a beat behind the first, each racing out
         and thinning as it goes. */
      var ph = (quirk * 2.2 - i * .5) % 1;
      if (ph < 0 || quirk * 2.2 - i * .5 < 0) { pg.setAttribute("opacity", "0"); continue; }
      pg.setAttribute("r", (rad + 2 + ph * 34).toFixed(1));
      pg.setAttribute("stroke", b.ping);
      pg.setAttribute("stroke-width", (1.3 * (1 - ph)).toFixed(2));
      pg.setAttribute("opacity", (.6 * (1 - ph) * (1 - ph) * solid).toFixed(3));
    }

    /* ── Venus is swallowed, then let go ─────────────────────────────── */
    if (kind === "veil") {
      this.veil.setAttribute("r", (rad + 1.5).toFixed(1));
      this.veil.setAttribute("fill", b.haze);
      this.veil.setAttribute("opacity", (.9 * bell * solid).toFixed(3));
    } else { this.veil.setAttribute("opacity", "0"); }

    /* ── Mars has a visitor ──────────────────────────────────────────── */
    if (kind === "visitor" && quirk > .05 && quirk < .97) {
      var vf = (quirk - .05) / .92;
      /* up off the limb, a hold while it looks around, then gone sideways */
      var rise = vf < .35 ? (vf / .35) : 1;
      var away = vf < .62 ? 0 : Math.pow((vf - .62) / .38, 2.2);
      var vx = -rad * .62 - away * 86;
      var vy = -rad * 1.02 - rise * 22 + Math.sin(t * 3.4) * 1.4 - away * 14;
      var vo = Math.min(1, rise * 2) * (1 - away * .9);
      this.saucer.setAttribute("transform",
        "translate(" + vx.toFixed(1) + " " + vy.toFixed(1) + ") rotate(" + (-away * 22).toFixed(1) + ")");
      this.saucer.setAttribute("opacity", (vo * solid).toFixed(3));
    } else { this.saucer.setAttribute("opacity", "0"); }

    /* ── the substrate: Saturn, under everything ─────────────────────── */
    var subOp = b.unmasked ? 1 : (1 - solid) + solid * GHOST;
    /* The armature answers to the same neutral palette as the sphere: neon
       while nothing wears it, gold once a body does. Saturn alone keeps its
       own gold throughout, because when Saturn wears the sphere the mask and
       the face are the same thing. */
    var subTint = b.unmasked ? "#e8c887" : mix(WIRE, GOLD, solid);
    for (i = 0; i < this.subNodes.length; i++) {
      var sp2 = this.subNodes[i], sr = SUB_RINGS[i][0], sry = sr * sNow;
      sp2[0].setAttribute("d", "M " + (-sr) + " 0 A " + sr + " " + sry.toFixed(1) + " 0 0 1 " + sr + " 0");
      sp2[1].setAttribute("d", "M " + sr + " 0 A " + sr + " " + sry.toFixed(1) + " 0 0 1 " + (-sr) + " 0");
      sp2[0].setAttribute("stroke-width", SUB_RINGS[i][1]);
      sp2[1].setAttribute("stroke-width", SUB_RINGS[i][1]);
      sp2[0].setAttribute("stroke", subTint); sp2[1].setAttribute("stroke", subTint);
      sp2[0].setAttribute("opacity", (SUB_RINGS[i][2] * subOp * .4).toFixed(3));
      sp2[1].setAttribute("opacity", (SUB_RINGS[i][2] * subOp).toFixed(3));
    }
    for (i = 0; i < this.subSpokes.length; i++) {
      var sh = this.subSpokes[i];
      var sa2 = this.subPhase + i * 2 * Math.PI / SUB_SPOKES;
      var sc2 = Math.cos(sa2), ss2 = Math.sin(sa2);
      sh.node.setAttribute("stroke", subTint);
      sh.node.setAttribute("x1", (SUB_IN * sc2).toFixed(1));
      sh.node.setAttribute("y1", (SUB_IN * ss2 * sNow).toFixed(1));
      sh.node.setAttribute("x2", (SUB_OUT * sc2).toFixed(1));
      sh.node.setAttribute("y2", (SUB_OUT * ss2 * sNow).toFixed(1));
      var sNear = ss2 > 0, sWant = sNear ? "near" : "far";
      if (sh.half !== sWant) {
        (sNear ? this.ringNear : this.ringFar).appendChild(sh.node);
        sh.half = sWant;
      }
      sh.node.setAttribute("opacity",
        (subOp * (sNear ? .42 : .16) * (.3 + .7 * Math.abs(ss2))).toFixed(3));
    }
    var shr = rad * Math.cos(SUB_HEX * RAD), shcy = -rad * Math.sin(SUB_HEX * RAD) * cNow;
    var spts = [];
    for (i = 0; i < 6; i++) {
      var sha = this.hexPhase + i * Math.PI / 3;
      spts.push((shr * Math.cos(sha)).toFixed(1) + "," +
        (shcy + shr * Math.sin(sha) * sNow).toFixed(1));
    }
    this.subHex.setAttribute("points", spts.join(" "));
    this.subHex.setAttribute("stroke", subTint);
    this.subHex.setAttribute("opacity", (subOp * .8).toFixed(3));
    this.subHex.setAttribute("fill", b.unmasked
      ? "rgba(20,13,3," + (.5 * solid).toFixed(2) + ")" : "none");

    /* ── rings a body brings of its own ──────────────────────────────── */
    var rings = b.rings || [];
    for (i = 0; i < this.ringNodes.length; i++) {
      var pair = this.ringNodes[i];
      if (i >= rings.length) {
        pair[0].setAttribute("d", ""); pair[1].setAttribute("d", ""); continue;
      }
      var rr = rings[i][0], rw = rings[i][1], ro = rings[i][2] * solid, ryy = rr * sNow;
      pair[0].setAttribute("d", "M " + (-rr) + " 0 A " + rr + " " + ryy.toFixed(1) + " 0 0 1 " + rr + " 0");
      pair[1].setAttribute("d", "M " + rr + " 0 A " + rr + " " + ryy.toFixed(1) + " 0 0 1 " + (-rr) + " 0");
      pair[0].setAttribute("stroke", b.ringCol); pair[1].setAttribute("stroke", b.ringCol);
      pair[0].setAttribute("stroke-width", rw); pair[1].setAttribute("stroke-width", rw);
      pair[0].setAttribute("opacity", (ro * .4).toFixed(3));
      pair[1].setAttribute("opacity", ro.toFixed(3));
    }

    var nSpokes = b.spokes || 0;
    for (i = 0; i < this.spokeNodes.length; i++) {
      var held = this.spokeNodes[i];
      if (i >= nSpokes) { held.node.setAttribute("opacity", "0"); continue; }
      var a = this.ringPhase + i * 2 * Math.PI / nSpokes;
      var ca = Math.cos(a), sa = Math.sin(a);
      held.node.setAttribute("x1", (b.spokeIn * ca).toFixed(1));
      held.node.setAttribute("y1", (b.spokeIn * sa * sNow).toFixed(1));
      held.node.setAttribute("x2", (b.spokeOut * ca).toFixed(1));
      held.node.setAttribute("y2", (b.spokeOut * sa * sNow).toFixed(1));
      held.node.setAttribute("stroke", b.ringCol);
      var nearSide = sa > 0, want = nearSide ? "near" : "far";
      if (held.half !== want) {
        (nearSide ? this.ringNear : this.ringFar).appendChild(held.node);
        held.half = want;
      }
      held.node.setAttribute("opacity",
        (solid * (nearSide ? .42 : .16) * (.3 + .7 * Math.abs(sa))).toFixed(3));
    }

    var flare = kind === "flare" ? 1 + 1.5 * q : 1;
    for (i = 0; i < 24; i++) {
      var ln = this.corona.children[i];
      if (!b.corona) { ln.setAttribute("opacity", "0"); continue; }
      var ang = i * Math.PI / 12 + t * .06;
      var r1 = rad + 2, r2 = rad + (i % 2 ? 7 : 12) * flare;
      ln.setAttribute("x1", (r1 * Math.cos(ang)).toFixed(1));
      ln.setAttribute("y1", (r1 * Math.sin(ang)).toFixed(1));
      ln.setAttribute("x2", (r2 * Math.cos(ang)).toFixed(1));
      ln.setAttribute("y2", (r2 * Math.sin(ang)).toFixed(1));
      ln.setAttribute("stroke", b.corona);
      ln.setAttribute("opacity", (solid * .5).toFixed(3));
    }

    /* The jets fire along the axis, so they swing with roll and tilt too. */
    var jetLen = kind === "jetfire" ? .4 + 1.3 * q : .4;
    for (i = 0; i < 4; i++) {
      var jn = this.jets.children[i];
      if (!b.jets) { jn.setAttribute("opacity", "0"); continue; }
      var sign = i < 2 ? -1 : 1, wide = i % 2 === 0;
      var tip = sign * (pole + 46 * jetLen), w = wide ? 13 : 5;
      jn.setAttribute("points", "0," + (sign * pole * .3).toFixed(1) + " " +
        (-w) + "," + tip.toFixed(1) + " " + w + "," + tip.toFixed(1));
      jn.setAttribute("fill", b.jets);
      jn.setAttribute("opacity", (solid * (wide ? .15 : .3)).toFixed(3));
    }
    this.jets.setAttribute("transform", "rotate(" + roll.toFixed(2) + ")");
    this.rocket.setAttribute("transform", "rotate(" + roll.toFixed(2) + ")");

    this.haze.setAttribute("r", rad + 4);
    this.haze.setAttribute("stroke", b.haze || "none");
    this.haze.setAttribute("opacity", b.haze ? (solid * .22).toFixed(3) : 0);
  };

  /* ── WIRING, ON THE SITE ──────────────────────────────────────────────
     scripts/apply-masthead.py writes a still Saturn into the lockup so a
     visitor with no JavaScript gets a correctly drawn ringed globe rather
     than a hole. When this file runs it clears that and takes over. */
  var planets = document.querySelectorAll(".lockup .planet");
  if (!planets.length) { return; }

  var globes = [];
  for (var g = 0; g < planets.length; g++) {
    var svg = planets[g];
    var still = svg.querySelector(".planet-still");
    if (still) { still.parentNode.removeChild(still); }
    globes.push(new Globe(svg));
  }

  function drawAll(now) {
    for (var j = 0; j < globes.length; j++) { globes[j].draw(now / 1000); }
  }

  /* The light sweep stops at the wordmark's edge, so it has to know how
     wide the wordmark is — and the lockup scales with the viewport, so it
     has to ask again when that changes. Without this the CSS default
     applies, which is close enough that nothing looks broken. */
  function measureSweep() {
    document.querySelectorAll(".lockup").forEach(function (lock) {
      var w = lock.getBoundingClientRect().width;
      if (w) { lock.style.setProperty("--sweep", Math.round(w / 2 + 34) + "px"); }
    });
  }
  measureSweep();
  window.addEventListener("resize", measureSweep);

  /* Honoured everywhere else on this site, so honoured here: one frame and
     no loop left running. */
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduce && reduce.matches) {
    drawAll(0);
    return;
  }

  var frame = null;
  function tick(now) { drawAll(now); frame = window.requestAnimationFrame(tick); }
  function start() { if (frame === null) { frame = window.requestAnimationFrame(tick); } }
  function stop() { if (frame !== null) { window.cancelAnimationFrame(frame); frame = null; } }

  drawAll(0);

  /* A masthead scrolled off the top costs nothing to stop drawing. */
  if (window.IntersectionObserver) {
    var watch = new IntersectionObserver(function (entries) {
      if (entries[entries.length - 1].isIntersecting) { start(); } else { stop(); }
    });
    watch.observe(planets[0]);
  } else {
    start();
  }
}());
