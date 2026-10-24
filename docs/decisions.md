# Decisions and open tasks

A short log of what was decided and why, so future changes can be made on purpose. Newest first within each section.

## Decisions

### 2026-10-24 · Spanish first, day mode, a Home tab

**Spanish at the root, English under `/en/`.**
Rubén wanted the site to be in Spanish by default. Moving the Spanish pages to the root (`/`, `/lab/`, `/notas/`, `/sobre-mi/`) and English to `/en/` makes Spanish the default for visitors and search engines alike, rather than redirecting the home page and leaving English as the "real" site. Addresses published before the move redirect to their new place with jekyll-redirect-from (on GitHub Pages' list of plugins); the redirect page is `_layouts/redirect.html`, so it passes the site checks. Two old addresses can't redirect because Spanish pages now live there: `/` and `/lab/`. `/feed.xml` is now the Spanish feed; the English one is `/en/feed.xml`.
*Ruled out:* redirecting `/` to `/es/` (one line, but English would stay the canonical site); choosing the language from the browser (decided against in the first version).

**Day mode, night by default.**
A switch in the header (☾ | ☀, the same pill as the language switch) sets `data-theme="day"`. Night stays the default for everyone; the choice is remembered in the visitor's browser and applied by an inline script in `<head>` before the first paint, so there's no flash. The day palette keeps the teal identity on light paper, with every text colour above 4.5:1; glow and scan lines are off in day mode. The change is revealed in a circle growing from the switch (a same-page view transition), or instantly with reduced motion.
*Ruled out:* following the operating system's setting (Rubén chose night for everyone first).

**A Home tab.**
"Inicio" / "Home" comes first in the navigation. It's only marked as current on the home page itself, since every address starts with `/`.

### 2026-10-24 · Teal instead of green

**The phosphor turns teal.** Text colours now come from a teal palette chosen by Rubén: `#c9fff4` (reading text), `#2de0c8` (titles), `#7fd1c1` (a new `--phosphor-dim` for headings inside text, margin labels and navigation) and `#87c4bf` (secondary text). Background, panels and rules took a teal tint to match, and the stronger rule was lightened to keep 3:1 for control borders. `--cyan` moved towards blue (`#5cc8ff`), because the old cyan was almost the new teal; captions that named it now say blue. Amber and magenta stay. The favicon moved to teal and amber too.

### 2026-10-21 · Interactive notes

**Code in tutorials is run before it's published.**
The dbt note's models were compiled and run with dbt (dbt-core 1.12, dbt-duckdb, dbt_utils 1.4) on the same Kaggle data. That's how the note's claims were checked: the Jinja loop compiles to exactly the hand-written query, and the dbt_utils version returns the same counts once nulls are filtered out (without the filter it adds a "None" column of zeros). Points DuckDB can't check, like PostgreSQL folding unquoted names to lower case, are stated as such.

**Wide code may use the room to the right of the text.**
On wide screens, code blocks (and code-based components, through the `--breakout` token in main.css) extend into the free space right of the reading column, so typical SQL lines don't wrap. Narrow screens keep wrapping, as decided for the first version.

**Query results come from the real data, not from screenshots.**
The pivot-table note's results (the first rows, the grouped table, the heatmap, the pivot machine) are computed from the Kaggle dataset by `scripts/notes/pivot_data.py`, which also checks it's the dataset the note describes (800 rows, Bulbasaur first, the 18 types). The CSV stays out of the repository; only the derived counts and the name/type columns are kept.

**Generated boards and figures are checked against the text.**
The "Guess Who?" note's board is invented (original pixel characters, only Liz's name comes from the text). `scripts/notes/guess_who_data.py` asserts that it matches what the note says (20 cards, 10 women, 5 with glasses, Liz without glasses, every character distinguishable) before writing anything, so editing a character can't silently break the article.

**Notes can load their own CSS and JavaScript.**
`extra_css` and `extra_js` in a note's front matter add a stylesheet and a script to that page only, so a note with charts and simulations doesn't weigh down the rest of the site. First use: the p-value note (`assets/css/notes/p-value.css`, `assets/js/notes/p-value.js`).
*Guardrails:* the text and the static figures (the histogram is inline SVG generated at build time) work without JavaScript; only the simulations (`.pv-needs-js`) are hidden then. With reduced motion every block shows its final state.

**Illustrative data is simulated, seeded and labelled as such.**
The p-value note describes a fictional study. `scripts/notes/p_value_data.py` simulates it with a fixed seed so the histogram and the numbers in the widgets always agree, and the caption says the data is simulated.

### 2026-10-21 · A robot logo and old-computer typing

**The robot replaces the square-and-circle mark in the header.**
A small, friendly robot (head and half a body) whose arms end in semicircle claws, waving. The original mark lives on, on its chest, so the systems-and-ideas idea is still there. It's one inline SVG (`_includes/robot.html`), coloured by the tokens; the achievement toasts clone it rather than keeping a second copy.

**Sections type themselves in, like an old computer.**
Titles and short texts appear character by character with a cursor and random stalls (`oldComputerTyping` in `site.js`). Kept short on purpose: reading text is never typed, the queue speeds up when you scroll fast, and with reduced motion nothing is typed at all.

**Titles turned down a notch.** `--phosphor` went from `#3dff7a` to `#36e06c`, and the glow is softer.

### 2026-10-21 · Terminal colours

**Green phosphor on black, with amber, cyan and magenta.**
The site now looks like an old computer screen, which fits the pixel display font and the video game touches. Reading text uses a softer green than the titles so long notes don't tire the eyes, and amber carries the "ideas" half of the identity (systems in green, ideas in amber). Cyan and magenta mark status and code.
*Replaces:* the light/dark pair that followed the system setting. There is one dark theme now (`color-scheme: dark`); print is still black on white.
*Guardrails:* every text colour is above AA contrast; scan lines and glow are off for `prefers-contrast: more`.

### 2026-10-21 · Own display font

**rubengura LED for titles and the wordmark.**
A pixel redrawing of Rubik Bold, kept as source (`scripts/fonts/rubengura-led.json`) and built into `assets/fonts/rubengura-led.woff2` by `scripts/build_font.py` (fontTools). The script traces each glyph into one outline, so there are no seams between pixels. Typographic quotes and the em dash borrow the straight quote and the en dash; the j tucks its tail under the previous letter, as in Rubik.
*Scope:* titles, section and list titles, the wordmark, the language switch and achievement titles. Reading text stays in Newsreader and the interface in Atkinson Hyperlegible Next: a bold pixel face is tiring over paragraphs.
*Licence:* Rubik is under the SIL Open Font License, so the derived font is too (`assets/fonts/LICENSE-rubengura-LED.txt`).

### 2026-10-21 · English and Spanish

**Two languages, with Spanish under `/es/`.**
English stays at the root, so no existing URL changes. Spanish pages use Spanish slugs (`/es/notas/`, `/es/sobre-mi/`). Built with plain Jekyll: GitHub Pages doesn't run i18n plugins such as jekyll-polyglot. The folder sets `lang` through front matter defaults, translations share a `ref`, and `_includes/translation.html` finds the match for the header switch and the `hreflang` links.
*Ruled out:* swapping text with JavaScript (invisible to search engines and feeds, and it breaks without JavaScript); a plugin (needs a GitHub Actions build).
*Revisit if:* a third language arrives, or keeping translations in step becomes a chore; at that point a static site generator with built-in i18n (Astro) earns its cost.

**No automatic redirect by browser language.**
The switch is always visible and the choice is the reader's. Redirecting by `Accept-Language` needs JavaScript on the home page and often guesses wrong (a Spanish speaker reading in English at work).

**Own Atom feeds instead of jekyll-feed.**
jekyll-feed puts every post in one feed and can only split by category. Two small templates (`feed.xml`, `es/feed.xml`, both using `_includes/atom.xml`) give one feed per language.

**Topic icons.**
Each topic on the home page has an icon drawn with the mark's shapes: squares for systems in ink, circles for ideas in accent. Inline SVG, so they follow the colour tokens in both themes.

### 2026-10-21 · Motion and a bit of play

**One small script, and motion where it helps.**
The first version was deliberately still. It read well but felt anonymous, and the site is meant to show who's behind it: data, psychology and video games. `assets/js/site.js` (no libraries, no build step) adds the home page scatter plot, scroll reveal, the reading progress bar and achievements. Page transitions are pure CSS (cross-document View Transitions), so browsers without support simply navigate as before.
*Guardrails:* everything is progressive enhancement (the site reads the same without JavaScript); all movement sits behind `prefers-reduced-motion: no-preference`; no motion inside the reading column; achievements live only in the visitor's browser (`localStorage`) and nothing is sent anywhere.
*Revisit if:* the script grows past what fits in one readable file, or any of it starts getting in the way of reading.

**Achievements, with a visible tally.**
Four of them: Explorer (Lab, Notes and About visited), Close reader (a note read to the end, after at least 20 seconds), Off the map (the 404 page) and Old school (the Konami code). The footer shows "n of 4", because an unfinished set is hard to ignore (the Zeigarnik effect). Add or rename them in the `ACHIEVEMENTS` object in `site.js`; a page can award one with `achievement: <id>` in its front matter.

### 2026-10-20 · First version (MVP)

**Jekyll, built natively by GitHub Pages.**
GitHub Pages already runs every repository through Jekyll, so using it adds no pipeline: push to `master` and the site is published. It solves the main maintenance problem of a hand-written HTML site (adding a note or a project means editing listings in several places) with Markdown files and templates. Plugins are limited to the [GitHub Pages list](https://pages.github.com/versions/), which covers what's needed (SEO tags, sitemap, RSS).
*Ruled out:* plain HTML (every new note means editing several pages); Astro or Eleventy (better developer experience, but they add Node.js, a GitHub Actions workflow and dependency upgrades, for features the site doesn't need yet).
*Revisit if:* a feature needs a custom plugin, or GitHub's Jekyll version (3.10) starts getting in the way. Moving to a GitHub Actions build with Jekyll 4 would keep all content and templates.

**No theme, no JavaScript.**
Themes bring a look that's hard to escape and code that's hard to read. The layouts and one CSS file are small enough to understand completely. Nothing on the site needs JavaScript yet. *Superseded in part on 2026-10-21: see "Motion and a bit of play".*

**Self-hosted fonts.**
No requests to third-party font services (faster, and no visitor data sent to anyone). Cost: about 170 KB of fonts on the first visit to the home page, cached afterwards.

**Dark mode follows the system, with no toggle.**
With colour tokens it costs one extra block of CSS. A toggle would need JavaScript and stored state; not worth it yet. *Superseded on 2026-10-21: one terminal theme, see "Terminal colours".*

**Notes are Jekyll posts; projects are a collection.**
Posts give dates, the RSS feed and chronological order for free. Projects aren't chronological, so they're a separate collection with a `status` and an `order`.

**"Reading & Futures" and "Personal Projects" are not separate sections yet.**
Reading notes and futures pieces are notes with the `reading` and `futures` topics. A dedicated page can be generated from those topics later without moving any content. Personal projects can join the projects collection (for example with a `kind` field) when the first one exists.

**Topics instead of free-form categories.**
A fixed list in `_data/topics.yml` keeps labels consistent and gives the home page its "What I write about" section.

**Drafts can be published, clearly labelled.**
`draft: true` shows a notice, keeps the page out of the sitemap and the RSS feed, and adds `noindex`. Unpublished work goes in `_drafts/`.

**Previous site replaced.**
The 2023 single page (`index.html` with a work history table and star ratings for skills) was removed. The ratings were the kind of meaningless skill bars the new site avoids, and the roles were out of date. It remains in the git history.

**Language: British English.**
Consistent spelling across the site (behaviour, modelling, judgement). Spanish pages (added 2026-10-21) use Castilian Spanish.

**Link checking with a small Python script instead of html-proofer.**
Standard library only, so it runs anywhere Python does, and it's short enough to read and change.

**Code blocks wrap long lines instead of scrolling sideways.**
A horizontally scrolling block has to be keyboard-focusable to be accessible, and Markdown output can't add that. Wrapping avoids the problem; code samples should still be kept short.

## Known issues

- Footnotes: kramdown (the Markdown converter GitHub Pages uses) adds `role="doc-noteref"` and `role="doc-endnote"` to footnote markup. Accessibility checkers flag these as minor (one is deprecated, the other isn't allowed on `<sup>`). Screen readers still read footnotes correctly. Fixing it would need a custom plugin, which GitHub Pages doesn't run. Not worth it for now.

## Open tasks

Needs input:

- [ ] LinkedIn URL (add to `social.links` in `_config.yml`).
- [ ] Review the About page: it's a first draft written from the project brief.
- [ ] Confirm the tools listed on the About page.
- [ ] Decide whether to show employers or a work history (currently not shown).
- [ ] Decide whether to add a contact email.
- [ ] Choose a licence for the content and the code.
- [ ] Rewrite or replace the demo note, then remove `draft: true`.

Next steps, in order of usefulness:

- [ ] Start the first project for real and replace its "planned" page as the work progresses.
- [ ] Optional: a GitHub Actions workflow that builds the site and runs `scripts/check_site.py` on pull requests.
- [ ] Optional, later: topic pages (for example a Reading & Futures page built from the `reading` and `futures` topics) once there are enough notes.
