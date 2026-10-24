/* ==========================================================================
   Note: indexes in SQL
   Loaded only on this note (front matter `extra_js`). Styles in
   assets/css/notes/indexes.css. Each [data-ix] block gets .is-live when it
   scrolls into view and plays its animation. With reduced motion, the
   blocks keep the final state they're published with.
   One look at a book takes 1.2 seconds: the text's "couple of minutes" for
   100 books.
   Sections:
     1. Helpers           3. A million books    5. The race
     2. Unsorted shelves  4. Sorted library     6. Start
   ========================================================================== */

(() => {
  "use strict";

  /* 1. Helpers ------------------------------------------------------------ */

  const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const es = document.documentElement.lang.startsWith("es");
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const SECONDS_PER_LOOK = 1.2;

  const locale = es ? "es-ES" : "en-GB";
  const whole = new Intl.NumberFormat(locale, { maximumFractionDigits: 0, useGrouping: true });
  const oneDecimal = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 });

  const TEXT = es
    ? {
        found: (i, t) => `¡Encontrado! Posición ${i}, tras ${t}.`,
        goingOn: "…pero SQL sigue leyendo: sin índice no sabe si hay otro ejemplar más adelante.",
        scanDone: (n, i) => `Filas leídas: ${n} de ${n}. El libro estaba en la ${i}.`,
        sortedDone: (g, total, before) => `4 letras y ${g} libros: ${total} vistazos en vez de ${before}.`,
        looks: "vistazos",
        times: (r) => `Con índice, ${r} veces menos vistazos.`,
        days: "días",
        years: "años",
      }
    : {
        found: (i, t) => `Found it! Position ${i}, after ${t}.`,
        goingOn: "…but SQL keeps reading: without an index it can’t know whether there’s another copy further along.",
        scanDone: (n, i) => `Rows read: ${n} of ${n}. The book was number ${i}.`,
        sortedDone: (g, total, before) => `4 letters and ${g} books: ${total} looks instead of ${before}.`,
        looks: "looks",
        times: (r) => `With an index, ${r} times fewer looks.`,
        days: "days",
        years: "years",
      };

  // "1 min 44 s"
  function clock(seconds) {
    const s = Math.round(seconds);
    return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s`;
  }

  // "8 s", "2 min", "1,7 h", "13,9 días", "38 años"
  function duration(seconds) {
    if (seconds < 60) return `${Math.round(seconds)} s`;
    const minutes = seconds / 60;
    if (minutes < 60) return `${oneDecimal.format(minutes)} min`;
    const hours = minutes / 60;
    if (hours < 48) return `${oneDecimal.format(hours)} h`;
    const days = hours / 24;
    if (days < 365) return `${oneDecimal.format(days)} ${TEXT.days}`;
    return `${oneDecimal.format(days / 365.25)} ${TEXT.years}`;
  }

  // The site's robot, from the header, to walk along the shelves
  function borrowRobot(scene) {
    const original = document.querySelector(".site-header .robot");
    if (!original) return null;
    const robot = document.createElement("span");
    robot.className = "ix-robot";
    robot.setAttribute("aria-hidden", "true");
    robot.appendChild(original.cloneNode(true));
    scene.appendChild(robot);
    return robot;
  }


  /* 2. Unsorted shelves ------------------------------------------------------
     One book at a time, and on to the last row even after finding it. */

  function setUpScan(figure) {
    const scene = figure.querySelector(".ix-scene");
    const spines = [...figure.querySelectorAll(".ix-spine")];
    const outLooked = figure.querySelector('[data-out="looked"]');
    const outTime = figure.querySelector('[data-out="time"]');
    const status = figure.querySelector('[data-out="status"]');
    const robot = borrowRobot(scene);
    let run = 0;

    function moveRobot(spine) {
      if (!robot) return;
      const base = scene.getBoundingClientRect();
      const box = spine.getBoundingClientRect();
      const x = box.left - base.left + box.width / 2 - robot.offsetWidth / 2;
      const y = box.top - base.top - robot.offsetHeight - 2;
      robot.style.transform = `translate(${x}px, ${Math.max(0, y)}px)`;
    }

    async function play() {
      const id = ++run;
      for (const s of spines) s.classList.remove("is-checked", "is-current", "is-found", "is-after");
      status.textContent = "";
      let found = 0;
      for (const [k, spine] of spines.entries()) {
        if (id !== run) return;
        const n = k + 1;
        spine.classList.add("is-current");
        moveRobot(spine);
        outLooked.textContent = n;
        outTime.textContent = clock(n * SECONDS_PER_LOOK);
        await sleep(found ? 22 : 45);
        spine.classList.remove("is-current");
        if (spine.dataset.target) {
          found = n;
          spine.classList.add("is-found");
          status.textContent = TEXT.found(n, clock(n * SECONDS_PER_LOOK));
          await sleep(1300);
          if (id !== run) return;
          status.textContent = TEXT.goingOn;
        } else {
          spine.classList.add(found ? "is-after" : "is-checked");
        }
      }
      status.textContent = TEXT.scanDone(spines.length, found);
    }

    figure.querySelector('[data-action="replay"]').addEventListener("click", play);
    // Reduced motion: show where the book was, without the walk
    if (instant) spines.find((s) => s.dataset.target)?.classList.add("is-found");
    return play;
  }


  /* 3. A million books -----------------------------------------------------
     One pixel per book, in the spines' colours, filling in row by row. */

  function setUpMillion(figure) {
    const canvas = figure.querySelector(".ix-sea");
    const count = figure.querySelector('[data-out="count"]');
    const ctx = canvas.getContext("2d");
    const style = getComputedStyle(document.documentElement);
    const colours = Array.from({ length: 8 }, (_, i) => {
      const hex = style.getPropertyValue(`--ix-c${i}`).trim().replace("#", "");
      return [0, 2, 4].map((o) => parseInt(hex.slice(o, o + 2), 16));
    });
    const { width, height } = canvas;
    const image = ctx.createImageData(width, height);
    for (let p = 0; p < width * height; p++) {
      const [r, g, b] = colours[(Math.random() * colours.length) | 0];
      const shade = 0.75 + Math.random() * 0.35;
      image.data.set([r * shade, g * shade, b * shade, 255], p * 4);
    }

    const drawAll = () => ctx.putImageData(image, 0, 0);
    if (instant) drawAll();

    return () => {
      if (instant) return;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / 1800);
        const rows = Math.round(height * easeInOut(t));
        ctx.clearRect(0, 0, width, height);
        if (rows) ctx.putImageData(image, 0, 0, 0, 0, width, rows);
        count.textContent = whole.format(Math.round(1e6 * easeInOut(t)));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
  }


  /* 4. Sorted library ------------------------------------------------------
     A quick look along the letters, A… C… E… G, then one book at a time. */

  function setUpSorted(figure) {
    const letters = [...figure.querySelectorAll(".ix-letters li")];
    const books = [...figure.querySelectorAll(".ix-gshelf li")];
    const outLooks = figure.querySelector('[data-out="looks"]');
    const outTime = figure.querySelector('[data-out="time"]');
    const status = figure.querySelector('[data-out="status"]');
    const scanPosition = Number(document.querySelector(".ix-spine[data-target]")?.dataset.i || 0);
    let run = 0;

    async function play() {
      const id = ++run;
      for (const el of [...letters, ...books]) el.classList.remove("is-current", "is-passed", "is-open", "is-checked", "is-found");
      status.textContent = "";
      let looks = 0;
      const count = () => {
        looks++;
        outLooks.textContent = looks;
        outTime.textContent = `${Math.round(looks * SECONDS_PER_LOOK)} s`;
      };

      for (const letter of ["A", "C", "E", "G"]) {
        if (id !== run) return;
        const el = letters.find((l) => l.dataset.letter === letter);
        el.classList.add("is-current");
        count();
        await sleep(450);
        el.classList.remove("is-current");
        el.classList.add(letter === "G" ? "is-open" : "is-passed");
      }

      for (const [k, book] of books.entries()) {
        if (id !== run) return;
        book.classList.add("is-current");
        count();
        await sleep(500);
        book.classList.remove("is-current");
        if (book.dataset.target) {
          book.classList.add("is-found");
          status.textContent = TEXT.sortedDone(k + 1, looks, scanPosition);
          return;
        }
        book.classList.add("is-checked");
      }
    }

    figure.querySelector('[data-action="replay"]').addEventListener("click", play);
    // Reduced motion: the G shelf open, the book found
    if (instant) {
      letters.find((l) => l.dataset.letter === "G")?.classList.add("is-open");
      books.find((b) => b.dataset.target)?.classList.add("is-found");
    }
    return play;
  }


  /* 5. The race --------------------------------------------------------------
     Worst-case looks for a library of n books: n without an index, ⌈log₂ n⌉
     with one. Bars on a log scale up to a billion. */

  function setUpRace(figure) {
    const input = figure.querySelector("input");
    const output = figure.querySelector("output");
    const lanes = {
      scan: figure.querySelector(".ix-lane--scan .ix-lane__bar"),
      index: figure.querySelector(".ix-lane--index .ix-lane__bar"),
    };
    const outScan = figure.querySelector('[data-out="scan"]');
    const outIndex = figure.querySelector('[data-out="index"]');
    const outRatio = figure.querySelector('[data-out="ratio"]');
    let frame = null;

    // Round to two significant figures, so the sizes read like 3,200,000
    const books = (v) => {
      const n = Math.pow(10, v);
      const magnitude = Math.pow(10, Math.max(0, Math.floor(Math.log10(n)) - 1));
      return Math.round(n / magnitude) * magnitude;
    };

    function render(v) {
      const n = books(v);
      const scan = n;
      const index = Math.max(1, Math.ceil(Math.log2(n)));
      output.value = whole.format(n);
      lanes.scan.style.setProperty("--w", Math.log10(scan) / 9);
      lanes.index.style.setProperty("--w", Math.log10(index) / 9);
      outScan.textContent = `${whole.format(scan)} ${TEXT.looks} · ${duration(scan * SECONDS_PER_LOOK)}`;
      outIndex.textContent = `${whole.format(index)} ${TEXT.looks} · ${duration(index * SECONDS_PER_LOOK)}`;
      outRatio.textContent = TEXT.times(whole.format(Math.round(scan / index)));
    }

    input.addEventListener("input", () => {
      if (frame) cancelAnimationFrame(frame);
      render(Number(input.value));
    });
    render(Number(input.value));

    // When it comes into view, the library grows from 10 books to a million.
    return () => {
      if (instant) return;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / 2800);
        const v = 1 + 5 * easeInOut(t);
        input.value = v;
        render(v);
        frame = t < 1 ? requestAnimationFrame(step) : null;
      };
      frame = requestAnimationFrame(step);
    };
  }


  /* 6. Start ---------------------------------------------------------------- */

  const players = new Map();
  for (const block of document.querySelectorAll("[data-ix]")) {
    const kind = block.dataset.ix;
    if (kind === "scan") players.set(block, setUpScan(block));
    else if (kind === "million") players.set(block, setUpMillion(block));
    else if (kind === "sorted") players.set(block, setUpSorted(block));
    else if (kind === "race") players.set(block, setUpRace(block));
  }

  // With reduced motion, the published final states stay as they are.
  if (instant) {
    for (const block of document.querySelectorAll("[data-ix]")) block.classList.add("is-live");
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

  for (const block of document.querySelectorAll("[data-ix]")) observer.observe(block);
})();
