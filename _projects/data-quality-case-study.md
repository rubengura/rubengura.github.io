---
ref: data-quality-case-study
title: When the pipeline is green and the number is wrong
description: A data quality case study built around a business question. The tests pass, the metric misleads, and the project is about what it takes to catch the difference.
status: planned          # planned | in-progress | finished
featured: true           # show on the home page
order: 1                 # position in lists (lower comes first)
updated: 2026-10-20
stack: []                # e.g. [dbt, PostgreSQL, Python]
repo:                    # https://github.com/rubengura/...
demo:
related:
  - title: "Note: The dashboard isn’t broken. The definition is."
    url: /notes/the-dashboard-isnt-broken/
---

## Problem

Most data quality checks look at the shape of the data: nulls, duplicates, freshness, accepted values. Those checks matter. But the failures that hurt a business usually pass them: a definition that changed quietly, a join that duplicates rows only for some customers, a filter that everyone has forgotten about.

When that happens, the pipeline is green and the number is still wrong.

## Goals

- Build a small, realistic business dataset with synthetic data, and plant problems in it on purpose, so every issue is known in advance.
- Compare which kinds of checks catch which problems, and which ones slip through everything.
- Write the results up for two audiences: engineers who build the checks, and the people who make decisions with the numbers.

## Questions I want to answer

- How do you test a *definition*, rather than a column?
- What does a data contract look like when the consumer is a person reading a dashboard, not another system?
- Which problems are cheaper to prevent with a conversation than with a test?
