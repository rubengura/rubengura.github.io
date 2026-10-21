---
# Copy this file to _projects/project-name.md
# The URL will be /lab/project-name/ (taken from the file name).
# Spanish version: _projects/es/nombre-proyecto.md → /es/lab/nombre-proyecto/

title: Project name
ref: project-name         # same value in the translation; links the two versions
description: One or two sentences on what the project does and why. Shown in lists and link previews.
status: planned          # planned | in-progress | finished
featured: false          # true = also listed on the home page
order: 10                # position in lists (lower comes first)
started: 2026-11-01      # optional; shown as month and year
updated: 2026-11-01
stack: []                # e.g. [Python, dbt, PostgreSQL, Airflow]
repo:                    # https://github.com/rubengura/project-name
demo:                    # optional link to a live demo
related: []              # e.g. [{title: "Note: ...", url: /notes/some-note/}]
---

<!--
  Suggested structure. Keep the sections that apply, delete the rest.
  Planned projects usually only need Problem, Goals and Questions.
-->

## Problem

What problem does this solve, and for whom? Why is it worth solving?

## Context and goals

Constraints, assumptions and what "done" looks like.

## Architecture

<figure>
  <img src="/assets/img/lab/project-name/architecture.svg" alt="Describe the main components and how data flows between them.">
  <figcaption>Main components and data flow.</figcaption>
</figure>

## Stack and why

| Component | Choice | Why |
|-----------|--------|-----|
| Storage   |        |     |
| Transform |        |     |

## Decisions and alternatives

The important decisions, the options considered and why they were ruled out.

## Quality, testing and observability

How correctness is checked, what is monitored, and how failures show up.

## Limitations and next steps

What it doesn't do, what would break first at larger scale, and what I would change.

## Run it yourself

```bash
git clone https://github.com/rubengura/project-name
cd project-name
# ...
```

Data used: public, synthetic or anonymised. Say which, and where it comes from.
