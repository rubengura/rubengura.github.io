# rubengura.github.io

The personal website of Rubén Guerrero, live at **https://rubengura.github.io/**.

It's two things in one place: an engineering portfolio (documented data engineering projects) and a working notebook (notes on data, psychology, AI, science fiction and possible futures).

## How it works

The site is built with [Jekyll](https://jekyllrb.com/), which GitHub Pages runs automatically on every push to `master`. There is no separate build pipeline, no Node.js and no database. One small script (`assets/js/site.js`) adds animations and a few playful touches; the site works the same without it. Content is written in Markdown; layouts are HTML templates.

```
_config.yml        Site settings: name, links, navigation, URLs, plugins
_data/i18n.yml     Interface text in English and Spanish: navigation, labels, headline
_data/topics.yml   The topics used to label notes, in both languages
_posts/            Notes in Spanish, the default language (one Markdown file per note)
_projects/         Engineering Lab projects in Spanish (one Markdown file per project)
_projects/en/      English translations of projects
en/                English pages: home, Lab, Notes, About, feed, and en/_posts/ for notes
_templates/        Copy-paste starting points for a new note or project (not published)
_layouts/          Page templates: default, page, note, project
_includes/         Reusable pieces: header, footer, lists, status marker…
assets/css/        main.css, the whole design system in one file
assets/js/         site.js: scatter plot, scroll reveal, reading progress, achievements
assets/fonts/      Self-hosted fonts and their licences (rubengura-led.woff2 is generated, see below)
assets/img/        Icons, social preview image, images for notes and projects
index.html         Home (Spanish)
sobre-mi.md        About (Spanish)
lab/index.html     Engineering Lab listing (Spanish)
notas/index.html   Notes listing (Spanish)
404.html           "Page not found"
docs/              Design system and decision log (not published)
scripts/           Checks to run before publishing (not published)
```

## Run it locally

> `jekyll serve` doesn't reload `_config.yml`. After changing it, stop the server (Ctrl+C) and start it again, or pages will be built with the old settings.

You need Ruby 3.x (GitHub Pages uses 3.3) and Bundler.

```bash
bundle config set --local path vendor/bundle   # keep gems inside the project
bundle install                                  # first time, and after changing the Gemfile
bundle exec jekyll serve --livereload
```

Then open http://localhost:4000. Pages reload when you save a file; changes to `_config.yml` need a restart.

The `Gemfile` uses the `github-pages` gem, so you get the same Jekyll version and plugins that GitHub uses in production. Commit the `Gemfile.lock` that `bundle install` creates.

## Publish a note

1. Copy `_templates/note.md` to `_posts/YYYY-MM-DD-titulo-corto.md`. The date in the file name is the publication date; the rest becomes the URL: `/notas/titulo-corto/`. For the English version, see "Two languages" below.
2. Fill in the front matter: `title`, `description` (one or two sentences, also used by search engines and the RSS feed) and `topics` (ids from `_data/topics.yml`).
3. Write the note in Markdown below the front matter.
4. Preview it locally, run the checks (below), commit and push.

The note appears automatically on the home page, in `/notas/`, in the RSS feed and in the sitemap.

**Not ready yet?** Two options:

- Put the file in a `_drafts/` folder (without a date in the name). It won't be published. Preview it with `bundle exec jekyll serve --drafts`.
- Keep it in `_posts/` with `draft: true`. It's published with a visible "Draft" label, left out of the sitemap and the RSS feed, and marked `noindex` for search engines.

Images for a note go in `assets/img/notes/<short-title>/`.

## Interactive notes

A note can bring its own styles and script, loaded only on that page:

```yaml
extra_css: /assets/css/notes/note-name.css
extra_js: /assets/js/notes/note-name.js
```

Either can be a list, so a series can share styles: the dbt note loads `[/assets/css/notes/pivot.css, /assets/css/notes/dbt-pivot.css]`.

Notes that show Jinja or Liquid code (`{{ … }}`, `{% … %}`) must wrap it in `{% raw %}` … `{% endraw %}`, or Jekyll will try to run it.

Reusable pieces of a note go in `_includes/notes/note-name/`, and any data it needs in `_data/`. Two notes work this way. The p-value note's figures come from `scripts/notes/p_value_data.py` (simulated, seeded data). The "Guess Who?" note's board, questions, sprites and strategy figures all come from `scripts/notes/guess_who_data.py`: change a character there and rerun it. The pivot-table note runs its two queries on the real Kaggle dataset with `scripts/notes/pivot_data.py path/to/Pokemon.csv` (the CSV isn't kept in the repository; download it from Kaggle). The dbt note's figures come from `scripts/notes/dbt_pivot_data.py`, which reads the data the pivot script already wrote. The indexes note's library (100 real books, shuffled with a fixed seed) comes from `scripts/notes/library_data.py`. In all of them, the widgets work in both languages because the includes read `page.lang`.

## Add a project

1. Copy `_templates/project.md` to `_projects/project-name.md`. The URL will be `/lab/project-name/`.
2. Set `status` to `planned`, `in-progress` or `finished`. The Lab page groups projects by status, and the page shows a notice for planned and in-progress work.
3. Set `featured: true` to also list it on the home page, and `order` to control its position.
4. Keep the sections from the template that apply. A planned project only needs the problem, goals and open questions.

Images and diagrams go in `assets/img/lab/project-name/`. SVG works best for architecture diagrams: it stays sharp and is small.

## Two languages

The site is Spanish first: Spanish at the root, English under `/en/`. A switch in the header (ES | EN, the default language first) takes readers to the same page in the other language, or to that language's home page if there's no translation yet.

| Spanish (default) | English |
|---|---|
| `_posts/2026-10-20-titulo-corto.md` → `/notas/titulo-corto/` | `en/_posts/2026-10-20-short-title.md` → `/en/notes/short-title/` |
| `_projects/nombre-proyecto.md` → `/lab/nombre-proyecto/` | `_projects/en/project-name.md` → `/en/lab/project-name/` |
| `sobre-mi.md` → `/sobre-mi/` | `en/about.md` → `/en/about/` |

The folder sets the language (`lang: es-ES` or `en-GB`), so you don't need to write it. What links a page to its translation is `ref`: give both files the same value, for example `ref: dashboard-definition`. Without a match, the switch goes to the other home page; nothing breaks.

- **Translating a note:** copy the file into `en/_posts/`, keep the date and `ref`, translate the text and use English links in `related` (`/en/...`).
- **Interface text** (navigation, labels, dates, notices, the home headline): `_data/i18n.yml`. Any new label goes in both languages.
- **Topics:** each one has a `name` and `description` per language in `_data/topics.yml`, and an icon in `_includes/topic-icon.html`.
- **Feeds:** `/feed.xml` (Spanish) and `/en/feed.xml` (English), one per language.
- **Old addresses:** the site was English-first until 24 October 2026. Pages published before then keep working through `redirect_from` in their front matter (jekyll-redirect-from, page in `_layouts/redirect.html`). If you move a published page, add its old address there.

## Night and day

Night (the terminal look) is the default. The switch in the header (☾ | ☀) changes to day mode and the visitor's browser remembers the choice (`localStorage`, key `rg:theme`). The day palette is the `:root[data-theme="day"]` block in `assets/css/main.css`: every colour a page uses comes from those tokens, so new components get day mode for free as long as they use tokens rather than fixed colours.

## The display font

Titles and the wordmark use *rubengura LED*, a pixel font of my own. Its source is `scripts/fonts/rubengura-led.json` (each glyph as rows of pixels). After editing it, rebuild the web font and commit both files:

```bash
pip install fonttools brotli     # once
python3 scripts/build_font.py    # writes assets/fonts/rubengura-led.woff2
```

## Other common changes

| To change… | Edit |
|---|---|
| Name and description | `_config.yml` |
| Home headline, navigation, interface text | `_data/i18n.yml` |
| GitHub, LinkedIn and other profile links | `social.links` in `_config.yml` |
| Topics for notes, and their icons | `_data/topics.yml`, `_includes/topic-icon.html` |
| Colours, fonts, spacing | the tokens at the top of `assets/css/main.css` |
| Shapes of the display font | `scripts/fonts/rubengura-led.json`, then `scripts/build_font.py` |
| The About page | `sobre-mi.md` and `en/about.md` |

## Check before publishing

```bash
bundle exec jekyll build
python3 scripts/check_site.py              # links, images, titles, descriptions, headings
python3 scripts/check_site.py --external   # also checks that external links respond
```

The script needs only Python's standard library. It exits with an error if something is broken.

Worth doing by hand when the layout changes: run Lighthouse in Chrome DevTools (accessibility, performance, SEO), look at the page at phone width, and switch your system to dark mode.

## Deploy

Push to `master`. That's it.

GitHub Pages builds the site with Jekyll and publishes it within a minute or two. You can follow the build under the repository's **Actions** tab ("pages build and deployment"). If a build fails, the previous version stays online and the error appears there.

Repository settings, for reference: **Settings → Pages → Build and deployment → Source: Deploy from a branch → `master` / `(root)`**.

GitHub Pages only runs [its own list of plugins](https://pages.github.com/versions/). This site uses three of them: `jekyll-seo-tag` (titles, descriptions, social previews), `jekyll-sitemap` and `jekyll-feed` (RSS). Custom plugins would need a GitHub Actions build instead; nothing here needs one yet.

## More

- [`docs/design-system.md`](docs/design-system.md): colours, typography, spacing and components.
- [`docs/decisions.md`](docs/decisions.md): what was decided and why, plus open tasks.

Fonts: [Newsreader](https://github.com/productiontype/Newsreader) and [Atkinson Hyperlegible Next](https://www.brailleinstitute.org/freefont/), both under the SIL Open Font License (see `assets/fonts/`).
