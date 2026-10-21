---
ref: signals-and-scenarios
title: Signals and scenarios
description: An experiment in using public data for futures thinking. The plan is to track signals of change and connect them to explicit scenarios that can be revised as the data moves.
status: planned          # planned | in-progress | finished
featured: true           # show on the home page
order: 3                 # position in lists (lower comes first)
updated: 2026-10-20
stack: []                # e.g. [dbt, PostgreSQL, Python]
repo:                    # https://github.com/rubengura/...
demo:
---

## Problem

Futures work often relies on signals of change collected and judged by hand. Data work, meanwhile, often assumes the future will look like the past. I’m curious about the space in between: using data to keep scenarios honest, without pretending to predict anything.

## Goals

- Choose one domain and a handful of public indicators that are updated regularly.
- Describe a few explicit scenarios, and state which indicators would make each one more or less plausible.
- Build a small pipeline that keeps the indicators current and shows how the evidence for each scenario changes over time.
- Be clear about uncertainty throughout. No forecasts dressed up as certainty.

## Questions I want to answer

- Which domain has public data that is good enough for this?
- How do you represent a scenario so that data can update it, without turning it into a forecast?
- What can a data pipeline add to foresight work, and what should it leave alone?
