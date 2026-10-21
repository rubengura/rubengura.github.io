# Design system

Everything lives in [`assets/css/main.css`](../assets/css/main.css). The tokens at the top of that file are the only place where colours, sizes and spacing are defined; components refer to them by name.

## Idea

An editorial notebook. Two things organise the visual language:

- **Systems and ideas.** The home headline steps from the left column ("Building reliable systems.") to the right one ("Exploring complex ideas."), and the sections below follow the same split: projects on the left, notes on the right. The mark repeats the diagonal: a solid square (a system) joined to an open circle (an idea).
- **A notebook margin.** On wide screens, notes and projects keep their metadata (dates, status, stack, topics) in a margin column beside the text. The Lab and Notes listings use the same margin for their keys: the status, or the year.

That's the one bold move in layout. Colour and type carry the rest: a phosphor terminal palette and a pixel display font. No cards and no gradients; glows only on titles and on things that float above the page (achievement toasts).

On top of that, a layer of play (see *Motion and play* below). It reuses the same two shapes, squares for systems and circles for ideas, so it reads as part of the identity rather than decoration.

## Colour

An old phosphor terminal: green on near-black, with amber (the other classic monitor) as the accent. Cyan and magenta are signals, used sparingly so the page isn't monochrome without becoming noisy. One theme only; print switches to black on white.

| Token | Value | Use |
|---|---|---|
| `--paper` | `#070b08` | Background, near-black with a trace of green |
| `--ink` | `#8ef0a7` | Reading text: a softer phosphor, easier over long paragraphs |
| `--phosphor` | `#36e06c` | Titles, wordmark, the mark's square (systems), current language |
| `--graphite` | `#5fae76` | Secondary text and metadata |
| `--rule` | `#163522` | Hairlines between sections |
| `--rule-strong` | `#2d6b40` | Stronger borders, chart axes |
| `--accent` | `#ffb547` | Amber: links, focus ring, "ideas" (the mark's circle, the second headline line, scatter circles), progress bar, in-progress status |
| `--cyan` | `#5fd7e8` | Finished status, notice border, strings in code |
| `--magenta` | `#ff7ac6` | Draft tag, numbers in code |
| `--highlight` | `#3dff7a` | Text selection and `<mark>`, with `--paper` text |
| `--tint` | `#0d1710` | Notices, code, icon tiles |

Contrast on `--paper`: ink 14:1, graphite 7.4:1, accent 11:1, cyan 11.7:1, magenta 8.4:1 (all above WCAG AA, most above AAA).

CRT effects: titles glow with their own colour (`--glow`), faint scan lines cover the page (`body::after`) and a block cursor blinks after the home headline. Scan lines and glow are switched off for `prefers-contrast: more` and in print; the cursor stops blinking with reduced motion.

## Typography

| Role | Typeface | Why |
|---|---|---|
| Titles, wordmark, language switch | rubengura LED (own pixel font) | A pixel redrawing of Rubik Bold, with a hand-drawn 5. It gives the site its voice (data on a screen, a nod to video games) without touching reading text. 3.5 KB. |
| Reading text and the headings inside it | Newsreader (variable, with optical sizes) | Designed for reading on screens; the optical-size axis makes the large headline finer and the body text sturdier automatically. |
| Interface: navigation, metadata, notices, tables | Atkinson Hyperlegible Next | Designed by the Braille Institute from legibility research, with distinct shapes for easily confused characters. Clear at small sizes, and a quiet nod to the psychology of reading. |
| Code | System monospace | Only appears in code; no extra download. |

Display sizes for rubengura LED are multiples of its pixel (1/27.5 em), so the pixels land on whole screen pixels: `--led-xs` 13.75px (switch), `--led-sm` 20.625px (wordmark, list titles, toasts), `--led-md` 27.5px (section titles; page titles on small screens), `--led-lg` 41.25px (page titles; home headline on small screens), `--led-xl` 55px (home headline). It has one weight and no italic; `font-synthesis: none` keeps browsers from faking them.

Scale for the other faces (the classic typographic scale, in rem): 0.875 · 1 · 1.125–1.25 (body) · 1.3125 · 1.5 · 1.75–2.25 · 2.25–3 · 2.5–4.5 (home headline). Larger sizes shrink smoothly on small screens with `clamp()`.

Rules of thumb:

- Body text is 18–20px with a 1.6 line height; reading columns stay around 65–70 characters (`--text-col`).
- Sentence case everywhere. No all-caps labels, no letter-spaced eyebrows above headings.
- Emphasis in body text is italic; bold is for labels inside notices and lists.

## Spacing and layout

Spacing tokens `--space-1` to `--space-10`: 4, 8, 12, 16, 24, 32, 48, 64, 96 and 128px.

| Token | Value | Use |
|---|---|---|
| `--wrap` | 72rem | Maximum content width |
| `--gutter` | 1–3rem | Side padding, grows with the screen |
| `--margin-col` | 12rem | Notebook margin (wide screens only) |
| `--text-col` | 38rem | Reading column |
| `--col-gap` | 4rem | Gap between columns |

Breakpoints: 56rem (home becomes two columns) and 64rem (notes and projects get the margin column). Below those, everything is a single column in reading order.

## Components

| Component | Where | Notes |
|---|---|---|
| Header with robot, nav and language switch | every page | Current section is underlined in `--accent` and marked with `aria-current`. |
| Entry list | home, Lab, Notes | Title (serif), description (graphite), metadata line (sans). Only the title is a link. |
| Status marker | projects | Empty circle = planned, half = in progress, full = finished. The shape carries the meaning and is always paired with a text label. |
| Metadata list (`.meta`) | notes, projects | A `<dl>`; in the margin on wide screens, above the text on small ones. |
| Notice | drafts, planned and in-progress projects | Tinted block in the interface font. |
| Tag | draft label in lists | Outlined, small. |
| Related links | end of notes and projects | From the `related` front matter. |
| Language switch | header | A pill with EN and ES; the current language is filled in ink, the other links to this page's translation. |
| Topic icons | home, "What I write about" | 32px inline SVG on a tinted tile (`_includes/topic-icon.html`). Squares are systems (ink), circles are ideas (accent), lines are ink at 2px. On hover, circles grow and squares turn, like the mark. |
| Prose | Markdown content | Headings, lists, quotes, code, tables, figures with captions, footnotes. |

## Interaction states

- **Links in text:** accent colour with a light underline; the underline darkens on hover.
- **Titles in lists:** ink, no underline; accent and underline on hover.
- **Keyboard focus:** a 2px accent outline, offset from the element, on everything focusable. Never removed.
- **Current page:** accent underline in the navigation.

## Motion and play

Section 9 of `main.css` and `assets/js/site.js`. All movement is inside `@media (prefers-reduced-motion: no-preference)`; with reduced motion the scatter plot is drawn still and nothing else moves.

| Element | Where | What it does |
|---|---|---|
| Signal from noise | home hero (`.hero__figure`) | A canvas scatter plot: points start as noise, settle into a correlation, then the least-squares line is drawn and Pearson's *r* is shown (computed from the points, seeded so it's the same every visit). Points dodge the pointer and spring back. Decorative, `aria-hidden`, hidden without JavaScript. |
| Page transitions | every page | Cross-document View Transitions: the page fades and rises; the header stays put. List titles and the page title share a `view-transition-name` (`t-<url>`), so a title travels from the list to the page. |
| Entrances | home, Lab, Notes | The headline steps in line by line; list items and section titles rise in once as they scroll into view. |
| Menu cursor | entry lists | An accent triangle beside the hovered or focused title, nudging like an old role-playing game menu. |
| Robot | header logo, achievement toasts | Waves twice on load and while hovered, blinks every few seconds, its antenna bulb pulses. |
| Old-computer typing | titles and short texts, everywhere | Typed character by character, with an amber block cursor and random stalls. One machine types what's on screen in reading order and waits for the reader to scroll to the rest. Anything the reader scrolls past before it's typed is finished within 450 ms (`CATCH_UP_MS`), with no stalls, so the typing always catches up with where they are; jumping to the bottom never leaves hidden text above. Screen readers get the full text from the start; the original text is restored when typing ends. Article bodies are never typed. Titles that travel between pages aren't typed after an internal link, so the view transition has something to land on. |
| Reading progress | notes and projects (`data-reading`) | A 3px accent bar at the top, like an experience bar; glows once at 100%. |
| Achievements | everywhere | Toasts in a `role="status"` region, plus a tally in the footer. |

Timing tokens: `--ease-out` for entrances and transitions, `--ease-spring` for small rewards (mark, toasts). Durations stay between 150 and 800ms.

## Accessibility baseline

Semantic landmarks (header, nav, main, footer), a skip link, one `<h1>` per page, visible focus, AA contrast, alt text on every image, no information carried by colour alone, and no motion when the visitor asks for reduced motion. Nothing essential depends on JavaScript.
