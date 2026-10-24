---
redirect_from: /lab/analytics-platform/
ref: analytics-platform
title: A small analytics platform, end to end
description: Ingest a public dataset, model it in a warehouse, test it, orchestrate it and serve it, while keeping the whole thing small enough to reason about.
status: planned          # planned | in-progress | finished
featured: true           # show on the home page
order: 2                 # position in lists (lower comes first)
updated: 2026-10-20
stack: []                # e.g. [dbt, PostgreSQL, Python]
repo:                    # https://github.com/rubengura/...
demo:
---

## Problem

Data engineering portfolios tend to show one piece of the stack: a DAG, a dbt project or a dashboard. The decisions I find most interesting happen where those pieces meet. How does data arrive? Where is it validated? Who owns each definition? And what happens when a source changes without warning?

## Goals

- Build a complete flow from ingestion to a model someone could actually use, with public data only.
- Make it reproducible on a laptop, with setup instructions short enough to follow.
- Document every significant decision, including the ones I would revisit.
- Treat testing and observability as part of the design from the start, not something added at the end.

## Questions I want to answer

- Which public dataset is messy enough to be realistic, but stable enough to reproduce?
- How small can a platform be and still show real orchestration, testing and monitoring concerns?
- Where is the line between a useful local setup and one that only works on my machine?
