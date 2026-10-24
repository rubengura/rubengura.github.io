/* ==========================================================================
   rubengura.github.io — small enhancements

   Everything here is optional: the site reads the same without JavaScript.
   Motion is skipped when the visitor's system asks for reduced motion.
   Sections:
     1. Helpers          4. Signal from noise    6. Achievements
     2. Scroll reveal    5. Reading progress     7. Konami code
     3. Old-computer typing
   ========================================================================== */

(() => {
  "use strict";

  /* 1. Helpers ------------------------------------------------------------ */

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const darkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  // Seeded random numbers, so the scatter plot is the same on every visit.
  function mulberry32(seed) {
    return () => {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function token(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }

  // localStorage can be missing or blocked (private windows, strict settings).
  const store = {
    read(key, fallback) {
      try {
        return JSON.parse(localStorage.getItem(key)) ?? fallback;
      } catch {
        return fallback;
      }
    },
    write(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* nothing to do: achievements just won't persist */
      }
    },
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


  /* 2. Scroll reveal -------------------------------------------------------
     List items and section titles rise into place the first time they
     scroll into view. Elements are only hidden once this script runs. */

  function scrollReveal() {
    if (reduceMotion.matches || !("IntersectionObserver" in window)) return;

    // Titles and short texts are typed instead (section 3).
    const targets = document.querySelectorAll(
      ".split__more, .entry-list__item, .topics__list > div, .index__key, .related"
    );

    const observer = new IntersectionObserver((entries) => {
      let order = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.style.transitionDelay = `${Math.min(order++, 6) * 70}ms`;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -6% 0px" });

    for (const el of targets) {
      el.classList.add("reveal");
      observer.observe(el);
    }
  }


  /* 3. Old-computer typing ------------------------------------------------
     Titles and short texts are typed out, with a cursor and the odd stall,
     like an old machine printing to the screen. One machine types what's on
     screen, in reading order, and waits for you to scroll to the rest. If
     you scroll past text it hasn't typed yet, it hurries through it (no
     stalls) to catch up with where you are.
     Screen readers get the whole text from the start, and the original text
     is put back when each element is done. Long reading text is left alone:
     nobody should have to wait to read. */

  const TYPE_TITLES =
    ".hero__line, .entry__title, .index__title, .split__title, .topics__title, " +
    ".entry-list__title, .related__title, .topics__list dt";
  const TYPE_TEXTS =
    ".hero__intro p, .entry__lede, .index__lede p, .split__lede, " +
    ".entry-list__desc, .topics__list dd";
  const CATCH_UP_MS = 450; // time to reach the reader after they scroll ahead

  function oldComputerTyping() {
    if (reduceMotion.matches || !("IntersectionObserver" in window)) return;

    // Titles that travel between pages (view transitions) must already be
    // there when the new page appears, so they aren't typed after a link
    // inside the site.
    const cameFromSite =
      document.referrer.startsWith(location.origin) && "startViewTransition" in document;

    const pending = [];       // still to type, in reading order
    let catchUpUntil = 0;     // deadline while catching up, 0 otherwise
    let running = false;

    const cursor = document.createElement("span");
    cursor.className = "tw-cursor";
    cursor.setAttribute("aria-hidden", "true");

    function prepare(el, fast) {
      if (cameFromSite && el.style.viewTransitionName) return;

      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) {
        if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
      }
      if (!nodes.length) return;

      const chars = [];
      const restore = [];
      for (const node of nodes) {
        // What you see: one span per character. What a screen reader hears:
        // the text as it was.
        const visual = document.createElement("span");
        visual.setAttribute("aria-hidden", "true");
        for (const ch of node.nodeValue) {
          if (/\s/.test(ch)) {
            visual.append(ch); // spaces stay text, so lines wrap as before
            continue;
          }
          const c = document.createElement("span");
          c.className = "tw-c";
          c.textContent = ch;
          visual.append(c);
          chars.push(c);
        }
        const spoken = document.createElement("span");
        spoken.className = "visually-hidden";
        spoken.textContent = node.nodeValue;
        node.replaceWith(visual, spoken);
        restore.push([visual, spoken, node]);
      }

      el.classList.add("tw-pending");
      pending.push({ el, chars, restore, fast, next: 0 });
    }

    function finish(item) {
      for (const [visual, spoken, node] of item.restore) {
        visual.replaceWith(node);
        spoken.remove();
      }
      item.el.classList.remove("tw-pending");
      pending.splice(pending.indexOf(item), 1);
    }

    // Shows up to `count` more characters of `item`.
    function reveal(item, count) {
      const end = Math.min(item.chars.length, item.next + count);
      for (let i = item.next; i < end; i++) item.chars[i].classList.add("is-on");
      item.next = end;
      item.chars[end - 1].after(cursor);
      if (item.next === item.chars.length) finish(item);
    }

    // Sorts what's left by where it is now: above the screen (the reader
    // has scrolled past it), and the first item on screen.
    function whereIsEverything() {
      const above = [];
      let onScreen = null;
      for (const item of pending) {
        const box = item.el.getBoundingClientRect();
        if (box.bottom <= 0) above.push(item);
        else if (!onScreen && box.top < window.innerHeight) onScreen = item;
      }
      return { above, onScreen };
    }

    async function run() {
      running = true;
      while (pending.length) {
        const { above, onScreen } = whereIsEverything();

        if (above.length) {
          // Catching up: spread what's left over the remaining time, a frame
          // at a time, with no stalls.
          const now = performance.now();
          if (!catchUpUntil) catchUpUntil = now + CATCH_UP_MS;
          const frames = Math.max(1, (catchUpUntil - now) / 16);
          let budget = Math.ceil(above.reduce((n, item) => n + item.chars.length - item.next, 0) / frames);
          for (const item of above) {
            if (budget <= 0) break;
            const count = Math.min(budget, item.chars.length - item.next);
            reveal(item, count);
            budget -= count;
          }
          await sleep(16);
          continue;
        }
        catchUpUntil = 0;

        // Nothing left on screen: wait for the reader to scroll.
        if (!onScreen) break;

        // In step with the reader: the normal pace, stalls included.
        reveal(onScreen, onScreen.fast ? 4 : 1);
        let wait = (onScreen.fast ? 14 : 38) * (0.5 + Math.random());
        if (Math.random() < (onScreen.fast ? 0.02 : 0.05)) wait += 120 + Math.random() * 380; // a lag
        await sleep(wait);
      }
      cursor.remove();
      running = false;
    }

    // Wake the machine whenever something comes into view or the page moves.
    const wake = () => {
      if (!running && pending.length) run();
    };
    const observer = new IntersectionObserver(wake);
    window.addEventListener("scroll", wake, { passive: true });

    for (const el of document.querySelectorAll(TYPE_TITLES)) prepare(el, false);
    for (const el of document.querySelectorAll(TYPE_TEXTS)) prepare(el, true);
    pending.sort((a, b) =>
      a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
    );
    for (const item of pending) observer.observe(item.el);
  }


  /* 4. Signal from noise ---------------------------------------------------
     The home page figure: points start as noise and settle into a
     correlation, then the regression line is drawn through them. Squares
     are systems, circles are ideas (the same shapes as the mark). The
     points move out of the pointer's way and spring back. */

  function signalFromNoise() {
    const figure = document.querySelector(".hero__figure");
    if (!figure) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    figure.appendChild(canvas);

    // Data, in unit coordinates (0–1, y pointing up).
    const rand = mulberry32(2017); // the year I started working with data
    const gauss = () => {
      const u = 1 - rand();
      const v = rand();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };

    const points = Array.from({ length: 64 }, (_, i) => {
      const ux = 0.02 + 0.96 * rand();
      return {
        ux,
        uy: clamp(0.14 + 0.66 * ux + 0.1 * gauss(), 0.03, 0.97),
        kind: i % 3 === 0 ? "system" : "idea",
        delay: rand() * 700,
        phase: rand() * Math.PI * 2,
        x: 0, y: 0, vx: 0, vy: 0,
        start: [rand(), rand()],
      };
    });

    // Ordinary least squares and Pearson's r, computed from the points drawn.
    const n = points.length;
    const mx = points.reduce((s, p) => s + p.ux, 0) / n;
    const my = points.reduce((s, p) => s + p.uy, 0) / n;
    let sxy = 0, sxx = 0, syy = 0;
    for (const p of points) {
      sxy += (p.ux - mx) * (p.uy - my);
      sxx += (p.ux - mx) ** 2;
      syy += (p.uy - my) ** 2;
    }
    const slope = sxy / sxx;
    const intercept = my - slope * mx;
    const r = sxy / Math.sqrt(sxx * syy);

    let width = 0, height = 0, pad = 12;
    let colours = {};
    let pointer = null;
    let startTime = null;
    let frameId = null;
    let onScreen = true;

    const toX = (ux) => pad + ux * (width - pad * 2);
    const toY = (uy) => height - pad - uy * (height - pad * 2);

    function readColours() {
      colours = {
        ink: token("--ink"),
        accent: token("--accent"),
        graphite: token("--graphite"),
        rule: token("--rule-strong"),
        font: token("--font-sans"),
      };
    }

    function resize() {
      const box = figure.getBoundingClientRect();
      const ratio = window.devicePixelRatio || 1;
      const sx = width ? box.width / width : 1;
      const sy = height ? box.height / height : 1;
      width = box.width;
      height = box.height;
      pad = Math.max(10, Math.min(width, height) * 0.08);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      for (const p of points) {
        p.x *= sx;
        p.y *= sy;
      }
    }

    function drawPoint(p) {
      if (p.kind === "system") {
        ctx.fillStyle = colours.ink;
        ctx.fillRect(p.x - 2.5, p.y - 2.5, 5, 5);
      } else {
        ctx.strokeStyle = colours.accent;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    function drawScene(lineProgress) {
      ctx.clearRect(0, 0, width, height);

      // Axes
      ctx.strokeStyle = colours.rule;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pad * 0.4, pad * 0.4);
      ctx.lineTo(pad * 0.4, height - pad * 0.4);
      ctx.lineTo(width - pad * 0.4, height - pad * 0.4);
      ctx.stroke();

      for (const p of points) drawPoint(p);

      if (lineProgress <= 0) return;

      // Regression line, drawn from left to right
      const x0 = 0, x1 = easeOut(lineProgress);
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.strokeStyle = colours.ink;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      ctx.moveTo(toX(x0), toY(intercept + slope * x0));
      ctx.lineTo(toX(x1), toY(intercept + slope * x1));
      ctx.stroke();

      // r label, fading in once the line is complete
      ctx.globalAlpha = clamp((lineProgress - 0.85) / 0.15, 0, 1);
      ctx.fillStyle = colours.graphite;
      ctx.font = `italic 600 12px ${colours.font}`;
      ctx.textAlign = "right";
      ctx.fillText(`r = ${r.toFixed(2)}`, width - pad, pad + 4);
      ctx.restore();
    }

    function placeAtRest() {
      for (const p of points) {
        p.x = toX(p.ux);
        p.y = toY(p.uy);
        p.vx = p.vy = 0;
      }
    }

    function frame(now) {
      if (startTime === null) startTime = now;
      const t = now - startTime;

      for (const p of points) {
        if (t < p.delay) continue;
        // Spring towards the point's place, with a slow drift so it feels alive
        const hx = toX(p.ux) + Math.sin(now / 1700 + p.phase) * 1.2;
        const hy = toY(p.uy) + Math.cos(now / 1900 + p.phase) * 1.2;
        let ax = (hx - p.x) * 0.045;
        let ay = (hy - p.y) * 0.045;

        if (pointer) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy) || 1;
          const reach = 56;
          if (dist < reach) {
            const push = (1 - dist / reach) * 2.4;
            ax += (dx / dist) * push;
            ay += (dy / dist) * push;
          }
        }

        p.vx = (p.vx + ax) * 0.86;
        p.vy = (p.vy + ay) * 0.86;
        p.x += p.vx;
        p.y += p.vy;
      }

      drawScene(clamp((t - 1400) / 1000, 0, 1));
      frameId = onScreen && !document.hidden ? requestAnimationFrame(frame) : null;
    }

    function play() {
      if (frameId === null && onScreen && !document.hidden) {
        frameId = requestAnimationFrame(frame);
      }
    }

    function drawStill() {
      placeAtRest();
      drawScene(1);
    }

    readColours();
    resize();

    if (reduceMotion.matches) {
      drawStill();
      document.fonts?.ready.then(drawStill);
      new ResizeObserver(() => { resize(); drawStill(); }).observe(figure);
      darkScheme.addEventListener("change", () => { readColours(); drawStill(); });
      return;
    }

    // Start from noise: random positions across the whole figure.
    for (const p of points) {
      p.x = p.start[0] * width;
      p.y = p.start[1] * height;
    }

    new ResizeObserver(resize).observe(figure);
    darkScheme.addEventListener("change", readColours);

    new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      play();
    }).observe(figure);
    document.addEventListener("visibilitychange", play);

    figure.addEventListener("pointermove", (event) => {
      const box = canvas.getBoundingClientRect();
      pointer = { x: event.clientX - box.left, y: event.clientY - box.top };
    });
    figure.addEventListener("pointerleave", () => { pointer = null; });

    play();
  }


  /* 5. Reading progress ----------------------------------------------------
     A thin bar at the top of notes and projects, like an experience bar.
     It fills as the text is read and glows once at the end. */

  function readingProgress() {
    const article = document.querySelector("[data-reading]");
    if (!article) return;

    const text = article.querySelector(".prose") || article;
    const bar = document.createElement("div");
    bar.className = "progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    const openedAt = Date.now();
    let queued = false;

    function update() {
      queued = false;
      const box = text.getBoundingClientRect();
      const read = clamp((window.innerHeight - box.top) / box.height, 0, 1);
      bar.style.transform = `scaleX(${read})`;

      const done = read > 0.995;
      bar.classList.toggle("is-complete", done);
      // Twenty seconds is a low bar, but it keeps a quick scroll from counting.
      if (done && article.dataset.reading === "note" && Date.now() - openedAt > 20000) {
        unlock("close-reader");
      }
    }

    const request = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    update();
  }


  /* 6. Achievements --------------------------------------------------------
     A few small rewards for exploring, stored in this browser only. The
     footer shows how many are left, because an unfinished set is hard to
     ignore (the Zeigarnik effect). */

  // Text in the page's language (<html lang>), English as the fallback.
  const TEXT = {
    en: {
      unlocked: "Achievement unlocked",
      tally: (got, total) => `${got} of ${total} achievements unlocked`,
      none: "Keep exploring",
      achievements: {
        "explorer": { title: "Explorer", text: "Visited the Lab, the Notes and the About page." },
        "close-reader": { title: "Close reader", text: "Read a note all the way to the end." },
        "off-the-map": { title: "Off the map", text: "Found a page that doesn’t exist." },
        "old-school": { title: "Old school", text: "↑ ↑ ↓ ↓ ← → ← → B A" },
      },
    },
    es: {
      unlocked: "Logro desbloqueado",
      tally: (got, total) => `${got} de ${total} logros desbloqueados`,
      none: "Sigue explorando",
      achievements: {
        "explorer": { title: "Mapa completo", text: "Has visitado el Lab, las Notas y Sobre mí." },
        "close-reader": { title: "Lectura atenta", text: "Has leído una nota hasta el final." },
        "off-the-map": { title: "Fuera del mapa", text: "Has encontrado una página que no existe." },
        "old-school": { title: "De la vieja escuela", text: "↑ ↑ ↓ ↓ ← → ← → B A" },
      },
    },
  };
  const text = TEXT[root.lang.slice(0, 2)] || TEXT.en;
  const ACHIEVEMENTS = text.achievements;

  // Sections count for Explorer in either language.
  const SECTIONS = {
    lab: ["/lab/", "/en/lab/"],
    notes: ["/notas/", "/en/notes/"],
    about: ["/sobre-mi/", "/en/about/"],
  };
  const UNLOCKED_KEY = "rg:achievements";
  const VISITED_KEY = "rg:visited";

  let toastRegion = null;

  function unlocked() {
    const list = store.read(UNLOCKED_KEY, []);
    return Array.isArray(list) ? list.filter((id) => id in ACHIEVEMENTS) : [];
  }

  function unlock(id) {
    const list = unlocked();
    if (list.includes(id)) return;
    list.push(id);
    store.write(UNLOCKED_KEY, list);
    showToast(ACHIEVEMENTS[id]);
    renderTally();
  }

  function showToast({ title, text: detail }) {
    if (!toastRegion) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML =
      '<span class="toast__icon"></span>' +
      '<span class="toast__body">' +
      `<span class="toast__label">${text.unlocked}</span>` +
      '<span class="toast__title"></span>' +
      '<span class="toast__text"></span></span>';
    toast.querySelector(".toast__title").textContent = title;
    toast.querySelector(".toast__text").textContent = detail;
    // The robot from the header comes along to celebrate.
    const robot = document.querySelector(".site-header .robot");
    if (robot) toast.querySelector(".toast__icon").append(robot.cloneNode(true));
    toastRegion.appendChild(toast);

    setTimeout(() => {
      if (reduceMotion.matches) {
        toast.remove();
        return;
      }
      toast.classList.add("is-leaving");
      toast.addEventListener("animationend", () => toast.remove(), { once: true });
    }, 6000);
  }

  function renderTally() {
    const footer = document.querySelector(".site-footer__inner");
    if (!footer) return;

    let tally = footer.querySelector(".tally");
    if (!tally) {
      tally = document.createElement("p");
      tally.className = "tally";
      footer.insertBefore(tally, footer.querySelector(".site-footer__colophon"));
    }

    const got = unlocked();
    const ids = Object.keys(ACHIEVEMENTS);
    const glyphs = ids
      .map((id, i) => {
        const shape = i % 2 ? "idea" : "system";
        const state = got.includes(id) ? " is-unlocked" : "";
        return `<span class="tally__glyph tally__glyph--${shape}${state}"></span>`;
      })
      .join("");
    tally.innerHTML =
      `<span class="tally__glyphs" aria-hidden="true">${glyphs}</span>` +
      `<span>${text.tally(got.length, ids.length)}</span>`;
    tally.title = got.length
      ? got.map((id) => ACHIEVEMENTS[id].title).join(", ")
      : text.none;
  }

  function achievements() {
    toastRegion = document.createElement("div");
    toastRegion.className = "toasts";
    toastRegion.setAttribute("role", "status");
    toastRegion.setAttribute("aria-live", "polite");
    document.body.appendChild(toastRegion);

    renderTally();

    const pageAchievement = document.body.dataset.achievement;
    if (pageAchievement in ACHIEVEMENTS) {
      setTimeout(() => unlock(pageAchievement), 900);
    }

    const section = Object.keys(SECTIONS).find((name) =>
      SECTIONS[name].some((path) => location.pathname.startsWith(path))
    );
    if (section) {
      const visited = new Set(store.read(VISITED_KEY, []));
      visited.add(section);
      store.write(VISITED_KEY, [...visited]);
      if (visited.size === 3) setTimeout(() => unlock("explorer"), 900);
    }
  }


  /* 7. Konami code ---------------------------------------------------------
     ↑ ↑ ↓ ↓ ← → ← → B A, for anyone who grew up with a controller. */

  function konami() {
    const sequence = [
      "arrowup", "arrowup", "arrowdown", "arrowdown",
      "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a",
    ];
    let position = 0;

    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      position = key === sequence[position] ? position + 1 : key === sequence[0] ? 1 : 0;
      if (position < sequence.length) return;
      position = 0;
      burst();
      unlock("old-school");
    });
  }

  // Squares and circles flying out from the middle of the screen.
  function burst() {
    if (reduceMotion.matches) return;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;

    for (let i = 0; i < 36; i++) {
      const piece = document.createElement("span");
      piece.className = `particle particle--${i % 3 === 0 ? "system" : "idea"}`;
      piece.style.left = `${cx}px`;
      piece.style.top = `${cy}px`;
      document.body.appendChild(piece);

      const angle = Math.random() * Math.PI * 2;
      const distance = 120 + Math.random() * Math.min(cx, cy) * 0.9;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance + 60; // a little gravity
      piece
        .animate(
          [
            { transform: "translate(-50%, -50%) scale(0.4) rotate(0deg)", opacity: 1 },
            { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${Math.random() * 360}deg)`, opacity: 0 },
          ],
          { duration: 900 + Math.random() * 600, easing: "cubic-bezier(.15,.7,.3,1)" }
        )
        .finished.then(() => piece.remove());
    }
  }


  achievements();
  scrollReveal();
  oldComputerTyping();
  signalFromNoise();
  readingProgress();
  konami();
})();
