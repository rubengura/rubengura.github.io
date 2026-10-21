/* ==========================================================================
   Note: Interpreting the p-value correctly
   Loaded only on this note (front matter `extra_js`). Styles in
   assets/css/notes/p-value.css. Each [data-pv] block gets .is-live when it
   scrolls into view, which starts its CSS animation and, for some blocks,
   the code below. With reduced motion, everything shows in its final state.
   Sections:
     1. Helpers             4. Groups              7. Start
     2. Pixel sprites       5. Court (interactive)
     3. Dialogue            6. A hundred trials
   ========================================================================== */

(() => {
  "use strict";

  /* 1. Helpers ------------------------------------------------------------ */

  const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const es = document.documentElement.lang.startsWith("es");
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const SVG = "http://www.w3.org/2000/svg";

  const TEXT = es
    ? {
        guilty: "CULPABLE · se rechaza H₀",
        notGuilty: "NO CULPABLE · pruebas insuficientes",
        observed: "diferencia",
        wrongful: (n, total) => `Condenas por error: <strong>${n}</strong> de ${total}`,
        wrongfulSpoken: (n) => `${n} de 100 juicios a un azúcar inocente acabaron en condena.`,
      }
    : {
        guilty: "GUILTY · H₀ rejected",
        notGuilty: "NOT GUILTY · not enough evidence",
        observed: "difference",
        wrongful: (n, total) => `Wrongful convictions: <strong>${n}</strong> of ${total}`,
        wrongfulSpoken: (n) => `${n} of 100 trials of an innocent sugar ended in a conviction.`,
      };

  // Seeded random numbers, so the first run of the trials is the same for everyone.
  function mulberry32(seed) {
    return () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function gauss(random) {
    const u = 1 - random();
    const v = random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  // Complementary error function (Numerical Recipes, error < 1.2e-7).
  function erfc(x) {
    const z = Math.abs(x);
    const t = 1 / (1 + z / 2);
    const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 +
      t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 +
      t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
    return x >= 0 ? r : 2 - r;
  }

  // Two-tailed p-value for a statistic that is normal under H0.
  const pValue = (z) => erfc(Math.abs(z) / Math.SQRT2);

  function svgEl(name, attrs = {}) {
    const el = document.createElementNS(SVG, name);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
  }


  /* 2. Pixel sprites -------------------------------------------------------
     12×12 grids. Letters are colours from the site's tokens; dots are empty. */

  const PALETTE = {
    G: "var(--phosphor)",
    A: "var(--accent)",
    C: "var(--cyan)",
    M: "var(--magenta)",
    W: "var(--ink)",
    R: "var(--graphite)",
    K: "var(--paper)",
  };

  const SPRITES = {
    sugar: [
      "............",
      "..WWWWWWWW..",
      ".WWWWWWWWWW.",
      ".WWWWWWWWWW.",
      ".WWKWWWWKWW.",
      ".WWKWWWWKWW.",
      ".WWWWWWWWWW.",
      ".WMWWKKWWMW.",
      ".WWWWWWWWWW.",
      ".WWWWWWWWWW.",
      "..WWWWWWWW..",
      "............",
    ],
    judge: [
      "...WWWWWW...",
      "..WWWWWWWW..",
      ".WWAAAAAAWW.",
      ".WWAKAAKAWW.",
      ".WWAAAAAAWW.",
      ".WWAAKKAAWW.",
      "..WWAAAAWW..",
      "...RRRRRR...",
      "..RRRWWRRR.C",
      "..RRRWWRRRCC",
      "..RRRRRRRR.C",
      "..RRRRRRRR..",
    ],
    researcher: [
      "...GGGGGG...",
      "..GGGGGGGG..",
      "..GAAAAAAG..",
      "..ACCACCAA..",
      "..AAAAAAAA..",
      "..AAAKKAAA..",
      "...AAAAAA...",
      "..WWWWWWWW..",
      ".WWWWCWWWWW.",
      ".WWWWCWWWWW.",
      ".WWWWWWWWWW.",
      ".WWWWWWWWWW.",
    ],
    evidence: [
      ".WWWWWWW....",
      ".WWWWWWWW...",
      ".WRRRRRWWW..",
      ".WWWWWWWWWW.",
      ".WRRRRRRRWW.",
      ".WWWWWWWWWW.",
      ".WWWWWWWMWW.",
      ".WWWWCWWMWW.",
      ".WWAWCWWMWW.",
      ".WWAWCWWMWW.",
      ".WWWWWWWWWW.",
      ".WWWWWWWWWW.",
    ],
    scale: [
      ".....AA.....",
      ".....AA.....",
      ".AAAAAAAAAA.",
      ".A...AA...A.",
      "AAA..AA..AAA",
      "AAA..AA..AAA",
      ".....AA.....",
      ".....AA.....",
      ".....AA.....",
      "...AAAAAA...",
      "..AAAAAAAA..",
      "............",
    ],
    gavel: [
      "..CCCCC.....",
      "..CCCCC.....",
      "..CCCCC.....",
      "..CCCCC.....",
      "....A.......",
      ".....A......",
      "......A.....",
      ".......A....",
      "........A...",
      "............",
      ".....RRRRRR.",
      "....RRRRRRRR",
    ],
  };

  function drawSprite(target, name) {
    const grid = SPRITES[name];
    if (!grid) return;
    const svg = svgEl("svg", { viewBox: "0 0 12 12", "aria-hidden": "true", focusable: "false" });
    grid.forEach((row, y) => {
      // One rectangle per run of the same colour
      let x = 0;
      while (x < row.length) {
        const c = row[x];
        let w = 1;
        while (row[x + w] === c) w++;
        if (PALETTE[c]) {
          const rect = svgEl("rect", { x, y, width: w, height: 1 });
          rect.style.fill = PALETTE[c];
          svg.appendChild(rect);
        }
        x += w;
      }
    });
    target.replaceChildren(svg);
  }


  /* 3. Dialogue ------------------------------------------------------------
     Lines appear one at a time, typed like an RPG text box. Screen readers
     get each line whole. */

  function prepareDialogue(box) {
    for (const line of box.querySelectorAll(".pv-dialog__line")) {
      const say = line.querySelector(".pv-dialog__say");
      const full = say.textContent;
      say.textContent = "";
      const shown = document.createElement("span");
      shown.setAttribute("aria-hidden", "true");
      const spoken = document.createElement("span");
      spoken.className = "visually-hidden";
      spoken.textContent = full;
      say.append(shown, spoken);
      line.dataset.full = full;
      line.style.visibility = "hidden";
    }
  }

  async function playDialogue(box) {
    for (const line of box.querySelectorAll(".pv-dialog__line")) {
      const shown = line.querySelector(".pv-dialog__say [aria-hidden]");
      line.style.visibility = "";
      for (const ch of line.dataset.full) {
        shown.textContent += ch;
        await sleep(ch === " " ? 20 : 45);
      }
      await sleep(550);
    }
  }


  /* 4. Groups --------------------------------------------------------------
     One dot per person, filling in, and numbers counting up. */

  function prepareGroups(figure) {
    for (const dots of figure.querySelectorAll(".pv-dots")) {
      const n = Number(dots.dataset.n);
      for (let i = 0; i < n; i++) dots.appendChild(document.createElement("i"));
      if (!instant) for (const dot of dots.children) dot.style.opacity = "0";
    }
  }

  async function playGroups(figure) {
    const dots = [...figure.querySelectorAll(".pv-dots > i")];
    const counters = [...figure.querySelectorAll(".pv-count")];
    const duration = 1400;
    const start = performance.now();
    await new Promise((done) => {
      function frame(now) {
        const t = Math.min(1, (now - start) / duration);
        const k = easeInOut(t);
        for (const group of figure.querySelectorAll(".pv-dots")) {
          const children = group.children;
          const upto = Math.round(children.length * k);
          for (let i = 0; i < upto; i++) children[i].style.opacity = "";
        }
        for (const c of counters) {
          const to = Number(c.dataset.to);
          const decimals = Number(c.dataset.decimals || 0);
          c.textContent = (to * k).toFixed(decimals);
        }
        if (t < 1) requestAnimationFrame(frame);
        else done();
      }
      requestAnimationFrame(frame);
    });
    for (const dot of dots) dot.style.opacity = "";
  }


  /* 5. Court ---------------------------------------------------------------
     The distribution of differences if sugar were innocent: normal, centred
     on 0, with the study's standard error. The shaded tails beyond ± the
     chosen difference are the p-value. */

  function setUpCourt(figure) {
    const se = Number(figure.dataset.se);
    const observed = Number(figure.dataset.observed);
    const input = figure.querySelector("input");
    const output = figure.querySelector("output");
    const chart = figure.querySelector(".pv-court__chart");
    const outT = figure.querySelector('[data-out="t"]');
    const outP = figure.querySelector('[data-out="p"]');
    const outVerdict = figure.querySelector('[data-out="verdict"]');
    const gavel = figure.querySelector(".pv-gavel");
    drawSprite(gavel, "gavel");

    const W = 600, H = 230, left = 20, right = 20, top = 34, bottom = 30;
    const base = H - bottom;
    const axis = svgEl("line", { class: "pv-court__axis", x1: left, x2: W - right, y1: base, y2: base });
    const curve = svgEl("path", { class: "pv-court__curve" });
    const tails = svgEl("path", { class: "pv-court__tail" });
    const ticks = svgEl("g");
    const critical = svgEl("g");
    const marker = svgEl("line", { class: "pv-court__marker", y1: top - 6, y2: base });
    const markerLabel = svgEl("text", { class: "pv-court__marker-label", y: top - 12, "text-anchor": "middle" });
    chart.append(curve, tails, axis, ticks, critical, marker, markerLabel);

    let guilty = null;
    let autoplay = null;

    function update(d) {
      // The view widens as the difference grows, so a large difference shows
      // how far it is from anything chance would produce.
      const D = Math.max(4 * se, d * 1.15);
      const sx = (x) => left + ((x + D) / (2 * D)) * (W - left - right);
      const height = (x) => Math.exp(-0.5 * (x / se) ** 2) * (base - top);

      const steps = 160;
      let path = `M${sx(-D)},${base}`;
      for (let i = 0; i <= steps; i++) {
        const x = -D + (2 * D * i) / steps;
        path += `L${sx(x).toFixed(1)},${(base - height(x)).toFixed(1)}`;
      }
      curve.setAttribute("d", path + `L${sx(D)},${base}Z`);

      // Both tails, |x| ≥ d
      let tail = "";
      for (const sign of [1, -1]) {
        const from = sign * d;
        const to = sign * D;
        tail += `M${sx(from).toFixed(1)},${base}`;
        for (let i = 0; i <= 60; i++) {
          const x = from + ((to - from) * i) / 60;
          tail += `L${sx(x).toFixed(1)},${(base - height(x)).toFixed(1)}`;
        }
        tail += `L${sx(to).toFixed(1)},${base}Z`;
      }
      tails.setAttribute("d", tail);

      // Ticks
      const step = [0.25, 0.5, 1, 2].find((s) => D / s <= 5) || 2;
      ticks.replaceChildren();
      for (let v = -Math.floor(D / step) * step; v <= D + 1e-9; v += step) {
        const t = svgEl("text", { class: "pv-court__tick", x: sx(v).toFixed(1), y: base + 18, "text-anchor": "middle" });
        t.textContent = Number(v.toFixed(2)).toString();
        ticks.appendChild(t);
      }

      // The 5% limit: ±1.96 standard errors
      critical.replaceChildren();
      for (const sign of [1, -1]) {
        const x = sx(sign * 1.96 * se);
        critical.appendChild(svgEl("line", { class: "pv-court__critical", x1: x, x2: x, y1: top, y2: base }));
      }

      const mx = sx(d);
      marker.setAttribute("x1", mx);
      marker.setAttribute("x2", mx);
      // Keep the label inside the chart near the edges
      const anchor = mx > W - right - 70 ? "end" : mx < left + 70 ? "start" : "middle";
      markerLabel.setAttribute("text-anchor", anchor);
      markerLabel.setAttribute("x", anchor === "end" ? mx - 4 : anchor === "start" ? mx + 4 : mx);
      markerLabel.textContent = `${TEXT.observed} ${d.toFixed(2)}`;

      // Readout
      const z = d / se;
      const p = pValue(z);
      output.value = d.toFixed(2);
      outT.textContent = z.toFixed(2);
      outP.textContent = p < 0.001 ? "< 0.001" : p.toFixed(3);
      const nowGuilty = p < 0.05;
      if (nowGuilty !== guilty) {
        outVerdict.textContent = nowGuilty ? TEXT.guilty : TEXT.notGuilty;
        figure.classList.toggle("is-guilty", nowGuilty);
        if (nowGuilty && guilty !== null && !instant) {
          gavel.classList.remove("is-striking");
          void gavel.offsetWidth; // restart the animation
          gavel.classList.add("is-striking");
        }
        guilty = nowGuilty;
      }
    }

    function stopAutoplay() {
      if (autoplay) cancelAnimationFrame(autoplay);
      autoplay = null;
    }

    input.addEventListener("input", () => {
      stopAutoplay();
      update(Number(input.value));
    });

    figure.querySelector('[data-action="study"]').addEventListener("click", () => {
      stopAutoplay();
      input.value = observed;
      update(observed);
    });

    update(Number(input.value));

    // When the court comes into view, the evidence "arrives": the difference
    // grows from 0 to the study's, and the gavel falls on the way.
    return function play() {
      if (instant) return;
      const duration = 3200;
      const start = performance.now();
      function frame(now) {
        const t = Math.min(1, (now - start) / duration);
        const d = observed * easeInOut(t);
        input.value = d;
        update(d);
        autoplay = t < 1 ? requestAnimationFrame(frame) : null;
      }
      autoplay = requestAnimationFrame(frame);
    };
  }


  /* 6. A hundred trials ----------------------------------------------------
     Each trial is a study where H0 is true: its test statistic is standard
     normal, and the judge convicts if p < 0.05. About 5 in 100 will be. */

  function setUpTrials(figure) {
    const grid = figure.querySelector(".pv-trials__grid");
    const summary = figure.querySelector(".pv-trials__summary");
    const visual = document.createElement("span");
    visual.setAttribute("aria-hidden", "true");
    const spoken = document.createElement("span");
    spoken.className = "visually-hidden";
    summary.append(visual, spoken);

    for (let i = 0; i < 100; i++) grid.appendChild(document.createElement("i"));
    visual.innerHTML = TEXT.wrongful(0, 100);

    let run = 0;
    async function play(random) {
      const id = ++run;
      const cells = [...grid.children];
      for (const cell of cells) cell.className = "";
      spoken.textContent = "";
      let convictions = 0;
      for (let i = 0; i < cells.length; i++) {
        if (id !== run) return; // a newer run took over
        const guilty = pValue(gauss(random)) < 0.05;
        if (guilty) convictions++;
        cells[i].className = guilty ? "is-guilty" : "is-innocent";
        visual.innerHTML = TEXT.wrongful(convictions, 100);
        if (!instant) await sleep(guilty ? 220 : 22);
      }
      spoken.textContent = TEXT.wrongfulSpoken(convictions);
    }

    figure.querySelector('[data-action="rerun"]').addEventListener("click", () => play(Math.random));
    return () => play(mulberry32(24)); // seed 24: the first run shows 5 wrongful convictions
  }


  /* 7. Start ---------------------------------------------------------------- */

  for (const el of document.querySelectorAll(".pv-sprite[data-sprite]")) drawSprite(el, el.dataset.sprite);

  const players = new Map();
  for (const block of document.querySelectorAll("[data-pv]")) {
    const kind = block.dataset.pv;
    if (kind === "dialog" && !instant) {
      prepareDialogue(block);
      players.set(block, () => playDialogue(block));
    } else if (kind === "groups") {
      prepareGroups(block);
      if (!instant) players.set(block, () => playGroups(block));
    } else if (kind === "court") {
      players.set(block, setUpCourt(block));
    } else if (kind === "trials") {
      players.set(block, setUpTrials(block));
    }
  }

  // With reduced motion there's nothing to wait for: every block shows its
  // final state straight away.
  if (instant) {
    for (const block of document.querySelectorAll("[data-pv]")) {
      block.classList.add("is-live");
      players.get(block)?.();
    }
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const block = entry.target;
      observer.unobserve(block);
      block.classList.add("is-live");
      players.get(block)?.();
    }
  }, { threshold: 0.35 });

  for (const block of document.querySelectorAll("[data-pv]")) observer.observe(block);
})();
