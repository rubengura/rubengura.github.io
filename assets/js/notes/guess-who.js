/* ==========================================================================
   Note: winning at "Guess Who?" with statistics
   Loaded only on this note (front matter `extra_js`). Styles in
   assets/css/notes/guess-who.css. Each [data-gw] block gets .is-live when
   it scrolls into view, which starts its CSS animation and, for some blocks,
   the code below. With reduced motion, everything shows in its final state.
   Sections:
     1. Helpers       3. The game
     2. Calculator    4. Start
   ========================================================================== */

(() => {
  "use strict";

  /* 1. Helpers ------------------------------------------------------------ */

  const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const es = document.documentElement.lang.startsWith("es");
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const TEXT = es
    ? {
        start: "El ordenador ha elegido un personaje. ¿Quién es?",
        answer: (q, yes) => `${q} → ${yes ? "Sí" : "No"}`,
        win: (name, n) => `¡Es ${name}! Encontrado en ${n} ${n === 1 ? "pregunta" : "preguntas"}.`,
        yes: "sí",
        no: "no",
      }
    : {
        start: "The computer has picked a character. Who is it?",
        answer: (q, yes) => `${q} → ${yes ? "Yes" : "No"}`,
        win: (name, n) => `It’s ${name}! Found in ${n} ${n === 1 ? "question" : "questions"}.`,
        yes: "yes",
        no: "no",
      };

  // Each card's position, for staggered animations
  for (const board of document.querySelectorAll(".gw-board")) {
    [...board.children].forEach((card, n) => card.style.setProperty("--n", n));
  }


  /* 2. Calculator ----------------------------------------------------------
     The calculation is typed out like a terminal command. Screen readers
     get the whole line. */

  function prepareCalc(block) {
    const line = block.querySelector(".gw-calc__line");
    const prompt = line.querySelector(".gw-calc__prompt");
    const full = line.textContent.slice(prompt.textContent.length).trim();
    const result = line.querySelector(".gw-calc__result").textContent;
    const shown = document.createElement("span");
    shown.setAttribute("aria-hidden", "true");
    const spoken = document.createElement("span");
    spoken.className = "visually-hidden";
    spoken.textContent = full;
    line.replaceChildren(prompt, shown, spoken);

    return async () => {
      const typed = full.slice(0, full.length - result.length);
      for (const ch of typed) {
        shown.textContent += ch;
        await sleep(ch === " " ? 15 : 35);
      }
      await sleep(400); // thinking…
      const strong = document.createElement("strong");
      strong.className = "gw-calc__result";
      strong.textContent = result;
      shown.append(strong);
    };
  }


  /* 3. The game ------------------------------------------------------------
     The computer picks a secret character; each question turns face down
     the cards that don't match the answer. Buttons show each question's
     variance over the cards still standing: p × (1 − p). */

  function setUpGame(figure) {
    const cards = [...figure.querySelectorAll(".gw-card")];
    const buttons = [...figure.querySelectorAll(".gw-q")];
    const msg = figure.querySelector('[data-out="msg"]');
    const outAsked = figure.querySelector('[data-out="asked"]');
    const outLeft = figure.querySelector('[data-out="left"]');
    const autoButton = figure.querySelector('[data-action="auto"]');

    let left, secret, asked, busy;

    const has = (card, key) => card.dataset[key] === "1";

    function refresh() {
      outAsked.textContent = asked;
      outLeft.textContent = left.length;
      let best = null;
      for (const b of buttons) {
        const yes = left.filter((c) => has(c, b.dataset.key)).length;
        const p = yes / left.length;
        const v = p * (1 - p);
        b.disabled = busy || yes === 0 || yes === left.length;
        b.style.setProperty("--var", v);
        b.querySelector(".gw-q__var").textContent =
          `${TEXT.yes} ${yes} · ${TEXT.no} ${left.length - yes} · Var ${v.toFixed(4)}`;
        b.classList.remove("is-best");
        if (!b.disabled && (!best || v > best.v)) best = { b, v };
      }
      if (best && left.length > 1) best.b.classList.add("is-best");
      autoButton.disabled = busy || left.length <= 1;
      return best?.b;
    }

    function newGame() {
      left = [...cards];
      secret = cards[Math.floor(Math.random() * cards.length)];
      asked = 0;
      busy = false;
      for (const c of cards) c.classList.remove("is-down", "is-winner");
      msg.textContent = TEXT.start;
      msg.classList.remove("is-win");
      refresh();
    }

    async function ask(button) {
      const key = button.dataset.key;
      const answer = has(secret, key);
      asked++;
      msg.textContent = TEXT.answer(button.querySelector(".gw-q__text").textContent, answer);
      const out = left.filter((c) => has(c, key) !== answer);
      left = left.filter((c) => has(c, key) === answer);
      // Cards turn over in reading order, quickly
      out.forEach((c, i) => c.style.setProperty("--n", instant ? 0 : i * 0.4));
      for (const c of out) c.classList.add("is-down");
      refresh();
      if (left.length === 1) {
        await sleep(instant ? 0 : 700);
        left[0].classList.add("is-winner");
        msg.textContent = TEXT.win(left[0].querySelector(".gw-card__name").textContent, asked);
        msg.classList.add("is-win");
        refresh();
      }
    }

    for (const b of buttons) {
      b.addEventListener("click", () => {
        if (!busy) ask(b);
      });
    }

    figure.querySelector('[data-action="new"]').addEventListener("click", newGame);

    // Let variance play: always the question with the highest variance.
    autoButton.addEventListener("click", async () => {
      busy = true;
      refresh();
      while (left.length > 1) {
        busy = false;
        const best = refresh();
        busy = true;
        best.classList.add("is-pressed");
        await sleep(instant ? 0 : 650);
        best.classList.remove("is-pressed");
        await ask(best);
        await sleep(instant ? 0 : 900);
      }
      busy = false;
      refresh();
    });

    newGame();
  }


  /* 4. Start ---------------------------------------------------------------- */

  const players = new Map();
  for (const block of document.querySelectorAll("[data-gw]")) {
    const kind = block.dataset.gw;
    if (kind === "calc" && !instant) players.set(block, prepareCalc(block));
    else if (kind === "game") setUpGame(block);
  }

  if (instant) {
    for (const block of document.querySelectorAll("[data-gw]")) block.classList.add("is-live");
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
  }, { threshold: 0.3 });

  for (const block of document.querySelectorAll("[data-gw]")) observer.observe(block);
})();
