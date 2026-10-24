/* ==========================================================================
   Note: how to make a pivot table in SQL
   Loaded only on this note (front matter `extra_js`). Styles in
   assets/css/notes/pivot.css. Each [data-pt] block gets .is-live when it
   scrolls into view, which starts its CSS animation and, for some blocks,
   the code below. With reduced motion, everything shows in its final state.
   Sections:
     1. Helpers         3. Pivot machine      5. Start
     2. Heatmap         4. Query generator
   ========================================================================== */

(() => {
  "use strict";

  /* 1. Helpers ------------------------------------------------------------ */

  const instant = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const es = document.documentElement.lang.startsWith("es");
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  const TEXT = es
    ? { none: "sin segundo tipo", and: "y" }
    : { none: "without a second type", and: "and" };

  // Stagger the LEDs in the first query's result, one row at a time,
  // and every result's rows.
  document.querySelectorAll('[data-pt="step1"] .pt-on').forEach((el, i) => el.style.setProperty("--i", i));
  for (const grid of document.querySelectorAll(".pt-result__grid")) {
    [...grid.tBodies[0].rows].forEach((row, r) => row.style.setProperty("--r", r));
  }


  /* 2. Heatmap -------------------------------------------------------------
     Hovering a cell lights its row and column, and spells out the pair. */

  function setUpHeatmap(figure) {
    const table = figure.querySelector(".pt-heat");
    const readout = figure.querySelector(".pt-heat__readout");
    const rows = [...table.tBodies[0].rows];
    let lit = [];

    function clear() {
      for (const cell of lit) cell.classList.remove("is-cross", "is-focus");
      lit = [];
      if (readout) readout.textContent = "";
    }

    table.addEventListener("pointerover", (event) => {
      const cell = event.target.closest("tbody td");
      if (!cell) return;
      clear();
      const col = cell.cellIndex;
      const row = cell.parentElement;
      for (const r of rows) {
        const c = r.cells[col];
        if (c) lit.push(c);
      }
      for (const c of row.cells) if (c.tagName === "TD") lit.push(c);
      for (const c of lit) c.classList.add("is-cross");
      cell.classList.add("is-focus");
      if (readout) readout.textContent = cell.title || "";
    });
    table.addEventListener("pointerleave", clear);
  }


  /* 3. Pivot machine -------------------------------------------------------
     Every row of the chosen first type becomes a chip that flies into the
     column of its second type: GROUP BY gathers, SUM(CASE …) counts. */

  function setUpMachine(figure) {
    const { types, pokemon } = JSON.parse(figure.querySelector(".pt-data").textContent);
    const rowsBox = figure.querySelector(".pt-machine__rows");
    const bucketsBox = figure.querySelector(".pt-machine__buckets");
    const buttons = [...figure.querySelectorAll(".pt-machine__type")];
    const outType = figure.querySelector('[data-out="type"]');
    const outN = figure.querySelector('[data-out="n"]');
    const outSummary = figure.querySelector('[data-out="summary"]');

    // One bucket per second type, plus "—" for none (the blank column)
    const columns = [...types, ""];
    const buckets = columns.map((t) => {
      const b = document.createElement("div");
      b.className = "pt-bucket";
      if (t) b.style.setProperty("--type", `var(--t-${t.toLowerCase()})`);
      b.innerHTML =
        '<span class="pt-bucket__count">0</span><span class="pt-bucket__well"><span class="pt-bucket__bar"></span></span>' +
        `<span class="pt-bucket__label" title="${t || "NULL"}">${t ? t.slice(0, 3) : "—"}</span>`;
      bucketsBox.appendChild(b);
      return { el: b, count: b.querySelector(".pt-bucket__count"), well: b.querySelector(".pt-bucket__well"), n: 0 };
    });

    let run = 0;

    async function pivot(type1) {
      const id = ++run;
      for (const b of buttons) b.setAttribute("aria-pressed", String(b.dataset.type === type1));
      outType.textContent = type1;

      const group = pokemon.filter((p) => p[1] === type1);
      const finals = columns.map((t) => group.filter((p) => p[2] === t).length);
      const max = Math.max(...finals);
      outN.textContent = group.length;

      for (const b of buckets) {
        b.n = 0;
        b.count.textContent = "0";
        b.el.style.setProperty("--h", 0);
      }
      outSummary.textContent = "";
      rowsBox.replaceChildren();
      rowsBox.scrollTop = 0;

      const chips = group.map(([name, , type2]) => {
        const chip = document.createElement("span");
        chip.className = "pt-chip";
        chip.textContent = name;
        if (type2) chip.style.setProperty("--type", `var(--t-${type2.toLowerCase()})`);
        rowsBox.appendChild(chip);
        return { chip, column: columns.indexOf(type2) };
      });

      const land = (column) => {
        const b = buckets[column];
        b.n++;
        b.count.textContent = b.n;
        b.el.style.setProperty("--h", b.n / max);
        b.el.classList.add("is-hit");
        setTimeout(() => b.el.classList.remove("is-hit"), 150);
      };

      if (instant) {
        for (const { chip, column } of chips) {
          chip.classList.add("is-sent");
          land(column);
        }
      } else {
        // The whole group takes about three seconds, however big it is.
        const gap = Math.max(12, 3000 / chips.length);
        const flights = [];
        for (const { chip, column } of chips) {
          if (id !== run) return; // another type was picked
          // Keep the chip being sent in view inside the box
          const box = rowsBox.getBoundingClientRect();
          const at = chip.getBoundingClientRect();
          if (at.bottom > box.bottom - 6) rowsBox.scrollTop += at.top - box.top - 8;
          // Positions relative to the machine, so scrolling the page mid-flight
          // doesn't knock the chips off course
          const base = figure.getBoundingClientRect();
          const from = chip.getBoundingClientRect();
          const to = buckets[column].well.getBoundingClientRect();
          const ghost = chip.cloneNode(true);
          ghost.classList.add("pt-chip--flying");
          ghost.style.left = `${from.left - base.left}px`;
          ghost.style.top = `${from.top - base.top}px`;
          figure.appendChild(ghost);
          chip.classList.add("is-sent");
          const dx = to.left + to.width / 2 - (from.left + from.width / 2);
          const dy = to.bottom - 10 - (from.top + from.height / 2);
          const flight = ghost.animate(
            [
              { transform: "translate(0, 0) scale(1)", opacity: 1 },
              { transform: `translate(${dx}px, ${dy}px) scale(0.4)`, opacity: 0.2 },
            ],
            { duration: 450, easing: "cubic-bezier(.4,0,.6,1)" }
          );
          flights.push(flight.finished.then(() => {
            ghost.remove();
            if (id === run) land(column);
          }));
          await sleep(gap);
        }
        await Promise.all(flights);
        if (id !== run) return;
      }

      // For screen readers, the resulting row in words
      const parts = columns
        .map((t, i) => [finals[i], t])
        .filter(([n, t]) => n && t)
        .sort((a, b) => b[0] - a[0])
        .map(([n, t]) => `${n} ${t}`);
      outSummary.textContent =
        `${type1}: ${parts.join(", ")} ${TEXT.and} ${finals[finals.length - 1]} ${TEXT.none}.`;
    }

    for (const b of buttons) b.addEventListener("click", () => pivot(b.dataset.type));
    return () => pivot("Grass"); // the type of the first row: Bulbasaur
  }


  /* 4. Query generator -----------------------------------------------------
     Writes the query for N distinct values and counts its lines. */

  function setUpScale(figure) {
    const input = figure.querySelector("input");
    const output = figure.querySelector("output");
    const code = figure.querySelector(".pt-scale__code code");
    const outLines = figure.querySelector('[data-out="lines"]');
    const outSums = figure.querySelector('[data-out="sums"]');
    const TYPES = ["Bug", "Dark", "Dragon", "Electric", "Fairy", "Fighting", "Fire", "Flying", "Ghost",
      "Grass", "Ground", "Ice", "Normal", "Poison", "Psychic", "Rock", "Steel", "Water"];
    let previous = 18;

    function render(n) {
      const value = (i) => TYPES[i] || `value_${String(i + 1).padStart(3, "0")}`;
      const lines = ['SELECT', ' "Type1"'];
      for (let i = 0; i < n; i++) {
        const v = value(i);
        const line = ` , SUM(CASE WHEN "Type2" = '${v}' THEN 1 ELSE 0 END) AS ${v.toLowerCase()}`;
        lines.push(i >= previous ? `<span class="pt-new">${line}</span>` : line);
      }
      lines.push(' , SUM(CASE WHEN "Type2" IS NULL THEN 1 ELSE 0 END) AS blank', "FROM dwh_dbt.pokemon_stats", "GROUP BY 1", "ORDER BY 1;");
      code.innerHTML = lines.join("\n");
      output.value = n;
      outLines.textContent = lines.length;
      outSums.textContent = n + 1;
      // Show where the query is growing
      const box = code.parentElement;
      box.scrollTop = box.scrollHeight;
    }

    input.addEventListener("input", () => {
      stop();
      render(Number(input.value));
      previous = Number(input.value);
    });
    render(18);

    let frame = null;
    const stop = () => frame && cancelAnimationFrame(frame);

    // When it comes into view, the column grows from 18 values to 50.
    return () => {
      if (instant) return;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / 2600);
        const n = Math.round(18 + 32 * easeInOut(t));
        input.value = n;
        render(n);
        frame = t < 1 ? requestAnimationFrame(step) : null;
      };
      frame = requestAnimationFrame(step);
    };
  }


  /* 5. Start ---------------------------------------------------------------- */

  const players = new Map();
  for (const block of document.querySelectorAll("[data-pt]")) {
    const kind = block.dataset.pt;
    if (kind === "heat") setUpHeatmap(block);
    else if (kind === "machine") players.set(block, setUpMachine(block));
    else if (kind === "scale") players.set(block, setUpScale(block));
  }

  if (instant) {
    for (const block of document.querySelectorAll("[data-pt]")) {
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
  }, { threshold: 0.3 });

  for (const block of document.querySelectorAll("[data-pt]")) observer.observe(block);
})();
