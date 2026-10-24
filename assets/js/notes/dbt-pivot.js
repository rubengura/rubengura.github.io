/* ==========================================================================
   Note: pivot tables in SQL with dbt
   Loaded only on this note (front matter `extra_js`). Styles in
   assets/css/notes/dbt-pivot.css (with pivot.css, the previous note's).
   Each [data-dp] block gets .is-live when it scrolls into view.
   With reduced motion, everything shows in its final state.
   Sections:
     1. Helpers      3. Quotes or no quotes     5. Start
     2. Compiler     4. Funnel
   ========================================================================== */

(() => {
  "use strict";

  /* 1. Helpers ------------------------------------------------------------ */

  const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const es = document.documentElement.lang.startsWith("es");
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const TYPES = ["Bug", "Dark", "Dragon", "Electric", "Fairy", "Fighting", "Fire", "Flying", "Ghost",
    "Grass", "Ground", "Ice", "Normal", "Poison", "Psychic", "Rock", "Steel", "Water"];

  const TEXT = es
    ? {
        comments: ["    -- Por cada tipo de Pokémon, creamos un SUM(CASE WHEN ...) que seleccione",
                   "    -- el tipo de Pokémon sobre el que estamos iterando."],
        iteration: (i, n, t) => `iteración ${i}/${n} · type = '${t}'`,
        same: (lines) => `✓ Compilado: ${lines} líneas, idéntico a la consulta escrita a mano del artículo anterior`,
        added: (lines, list) => `✓ Compilado: ${lines} líneas. Columnas nuevas (${list}) sin tocar el resto del código`,
        invalid: "Usa solo letras (máximo 12), por ejemplo Sound",
        duplicate: (t) => `${t} ya está en la lista`,
      }
    : {
        comments: ["    -- For each type of Pokémon, we create a SUM(CASE WHEN ...) that picks",
                   "    -- the type of Pokémon we're iterating over."],
        iteration: (i, n, t) => `iteration ${i}/${n} · type = '${t}'`,
        same: (lines) => `✓ Compiled: ${lines} lines, identical to the hand-written query from the previous article`,
        added: (lines, list) => `✓ Compiled: ${lines} lines. New columns (${list}) without touching the rest of the code`,
        invalid: "Letters only (12 at most), e.g. Sound",
        duplicate: (t) => `${t} is already in the list`,
      };


  /* 2. Compiler ------------------------------------------------------------
     Runs the Jinja loop one iteration at a time: lights the loop's line and
     the current value, and writes the SQL line it produces. */

  function setUpCompiler(figure) {
    const listEl = figure.querySelector(".dp-vars__list");
    const form = figure.querySelector(".dp-vars__add");
    const input = form.querySelector("input");
    const body = figure.querySelector(".dp-body");
    const badge = figure.querySelector(".dp-badge-type");
    const out = figure.querySelector(".dp-out code");
    const status = figure.querySelector('[data-out="status"]');
    const playButton = figure.querySelector('[data-action="play"]');
    const stepButton = figure.querySelector('[data-action="step"]');

    let types = [...TYPES];
    let run = 0;   // cancels an animation in progress
    let next = -1; // next iteration in step-by-step mode (-1: not started)

    function renderList() {
      listEl.replaceChildren(...types.map((t) => {
        const li = document.createElement("li");
        const chip = document.createElement("span");
        chip.className = "pt-badge";
        chip.textContent = `'${t}'`;
        if (TYPES.includes(t)) chip.style.setProperty("--type", `var(--t-${t.toLowerCase()})`);
        else chip.classList.add("is-new");
        li.appendChild(chip);
        return li;
      }));
    }

    function line(html, fresh) {
      const span = document.createElement("span");
      span.innerHTML = html + "\n";
      if (fresh && !instant) span.classList.add("is-fresh");
      out.appendChild(span);
      out.parentElement.scrollTop = out.parentElement.scrollHeight;
    }

    function header() {
      out.replaceChildren();
      line("SELECT");
      line('    "Type1"');
      for (const c of TEXT.comments) line(c.replace(/</g, "&lt;"));
    }

    function iteration(i) {
      const t = types[i];
      const isNew = !TYPES.includes(t);
      for (const [k, chip] of [...listEl.querySelectorAll(".pt-badge")].entries()) {
        chip.classList.toggle("is-current", k === i);
      }
      body.classList.add("is-current");
      badge.textContent = `← type = '${t}'`;
      status.classList.remove("is-same");
      status.textContent = TEXT.iteration(i + 1, types.length, t);
      const sql =
        `    , SUM(CASE WHEN "Type2" = '<span class="dp-o-str">${t}</span>' THEN 1 ELSE 0 END) AS <span class="dp-o-name">${t}</span>`;
      line(isNew ? `<span class="dp-o-new">${sql}</span>` : sql, true);
    }

    function finish() {
      line('    , SUM(CASE WHEN "Type2" IS NULL THEN 1 ELSE 0 END) AS blank');
      line("FROM dwh_dbt.pokemon_stats");
      line("GROUP BY 1");
      line("ORDER BY 1");
      body.classList.remove("is-current");
      badge.textContent = "";
      for (const chip of listEl.querySelectorAll(".pt-badge")) chip.classList.remove("is-current");
      // Comments don't count: the hand-written query has none
      const lines = types.length + 6;
      const added = types.filter((t) => !TYPES.includes(t));
      const same = added.length === 0 && types.length === TYPES.length;
      status.textContent = same ? TEXT.same(lines) : TEXT.added(lines, added.join(", "));
      status.classList.toggle("is-same", same);
      next = -1;
    }

    async function compile() {
      const id = ++run;
      next = -1;
      header();
      for (let i = 0; i < types.length; i++) {
        if (id !== run) return;
        iteration(i);
        await sleep(instant ? 0 : 230);
      }
      if (id === run) finish();
    }

    function step() {
      run++; // stop any animation
      if (next === -1) {
        header();
        next = 0;
      }
      iteration(next);
      next++;
      if (next >= types.length) finish();
    }

    playButton.addEventListener("click", compile);
    stepButton.addEventListener("click", step);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const raw = input.value.trim();
      if (!/^[A-Za-z]{1,12}$/.test(raw)) {
        status.classList.remove("is-same");
        status.textContent = TEXT.invalid;
        return;
      }
      const t = raw[0].toUpperCase() + raw.slice(1).toLowerCase();
      if (types.includes(t)) {
        status.classList.remove("is-same");
        status.textContent = TEXT.duplicate(t);
        return;
      }
      types.push(t);
      input.value = "";
      renderList();
      compile();
    });

    figure.querySelector('[data-action="reset"]').addEventListener("click", () => {
      types = [...TYPES];
      renderList();
      compile();
    });

    renderList();
    if (instant) compile();
    return compile;
  }


  /* 3. Quotes or no quotes -------------------------------------------------
     The same value goes through both: it ends up as a string in one and as
     a column name in the other. */

  function setUpQuotes(block) {
    const values = [...block.querySelectorAll(".dp-quote__val")];
    let i = 0;
    return () => {
      if (instant) return;
      setInterval(() => {
        i = (i + 1) % TYPES.length;
        for (const v of values) {
          v.textContent = TYPES[i];
          v.classList.remove("is-flipping");
          void v.offsetWidth; // restart the animation
          v.classList.add("is-flipping");
        }
      }, 1500);
    };
  }


  /* 4. Funnel ----------------------------------------------------------------
     A shower of values (one drop per two rows, in each type's colour) that
     ends up as the short list below. Decorative. */

  function setUpFunnel(figure) {
    const rain = figure.querySelector(".dp-funnel__rain");
    const items = [...figure.querySelectorAll(".dp-funnel__list li")];
    return () => {
      if (instant) return;
      const drops = [];
      for (const li of items) {
        const n = Number(li.querySelector(".dp-funnel__n").textContent);
        const colour = li.style.getPropertyValue("--type");
        for (let k = 0; k < Math.ceil(n / 2); k++) drops.push(colour);
      }
      drops.sort(() => Math.random() - 0.5);
      rain.classList.add("is-raining");
      const height = 72; // 4.5rem: the rain's height while it falls
      const falls = [];
      drops.forEach((colour, k) => {
        const d = document.createElement("span");
        d.className = "dp-drop";
        d.style.setProperty("--type", colour);
        d.style.left = `${Math.random() * 98}%`;
        rain.appendChild(d);
        const fall = d.animate(
          [{ transform: "translateY(-6px)", opacity: 0 }, { opacity: 1, offset: 0.2 },
           { transform: `translateY(${height}px)`, opacity: 0.9 }],
          { duration: 700 + Math.random() * 400, delay: 300 + k * 6, easing: "cubic-bezier(.5,0,1,1)", fill: "both" }
        );
        falls.push(fall.finished.then(() => d.remove()));
      });
      Promise.all(falls).then(() => rain.classList.remove("is-raining"));
    };
  }


  /* 5. Start ---------------------------------------------------------------- */

  const players = new Map();
  for (const block of document.querySelectorAll("[data-dp]")) {
    const kind = block.dataset.dp;
    if (kind === "compiler") players.set(block, setUpCompiler(block));
    else if (kind === "quotes") players.set(block, setUpQuotes(block));
    else if (kind === "funnel") players.set(block, setUpFunnel(block));
  }

  if (instant) {
    for (const block of document.querySelectorAll("[data-dp]")) block.classList.add("is-live");
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

  for (const block of document.querySelectorAll("[data-dp]")) observer.observe(block);
})();
