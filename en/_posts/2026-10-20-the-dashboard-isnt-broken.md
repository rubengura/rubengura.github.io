---
redirect_from: /notes/the-dashboard-isnt-broken/
ref: dashboard-definition
title: "The dashboard isn’t broken. The definition is."
description: Why a metric can be wrong even when every pipeline test passes, and why the fix is usually a conversation rather than a patch.
topics: [data-engineering, psychology]
draft: true
notice: This note was written to try out the layout of the site, and it hasn’t been reviewed yet. Expect the wording to change.
sitemap: false
related:
  - title: "Planned project: When the pipeline is green and the number is wrong"
    url: /en/lab/data-quality-case-study/
---

Imagine two dashboards that disagree. One says the product had 48,000 active users last month. The other says 61,000. Both pipelines ran on time, and every test passed: no unexpected nulls, unique keys, fresh data.

Nothing is broken. And yet one of those numbers is about to be presented to someone as the truth.

## Two correct queries

The difference is usually a definition, not a bug. Here is the same idea, an “active user”, written twice:

```sql
-- Marketing: anyone who opened the app
select count(distinct user_id)
from events
where event_name = 'app_open'
  and event_date >= date '2026-09-01'
  and event_date <  date '2026-10-01';

-- Product: anyone who did something meaningful
select count(distinct user_id)
from events
where event_name in ('create_item', 'share_item')
  and event_date >= date '2026-09-01'
  and event_date <  date '2026-10-01';
```

Both queries are correct. They answer different questions, and neither dashboard title says which one it’s answering.

## Why the tests don’t catch it

Most data tests check the shape of the data: types, nulls, uniqueness, freshness. They are necessary, and they say almost nothing about meaning. A test can confirm that `user_id` is never null. It can’t tell you that two teams use the word “active” for different things.

This is where psychology becomes useful. People rarely read a number on its own. They read it against something: last month’s value, a target, what they expected to see.[^anchoring] A metric without a written definition leaves a gap, and everyone fills it with their own. Most of the time they don’t notice they’ve done it.

## What actually helps

- **Write the definition where the number lives.** Not in a wiki three clicks away, but in the model, the semantic layer or the dashboard description.
- **Give each definition one owner.** Someone who can say “this is what we mean” and change it deliberately.
- **Test the relationship, not only the data.** For example, check that the two “active user” counts stay within an expected ratio, and treat a sudden change as a question to ask rather than an error to silence.

None of this is technically hard. Most of it is agreeing on words, which is exactly the part engineering teams tend to skip.

[^anchoring]: Anchoring is the classic example. In Tversky and Kahneman’s 1974 experiments, an arbitrary starting value pulled people’s later estimates towards it.
