---
ref: about
title: About
description: Rubén Guerrero is a data engineer who studied psychology. How he got here, how he thinks about engineering, and what this site is for.
lede: I’m Rubén Guerrero. I work as a data engineer, and I’ve been working with data since 2017.
permalink: /about/
---

## From psychology to data

I studied psychology. What held my attention was behaviour: why people decide what they decide, and how much of that happens before anyone starts reasoning about it. Behavioural psychology and neuromarketing were the parts I kept coming back to.

Since 2017 I’ve worked in data analysis, data science, analytics engineering and data engineering. Over time my work has moved upstream, from the chart towards the systems underneath it. The questions from psychology came along: how people read a number, what they expect it to say, and what they do when it surprises them.

## How I think about engineering

A pipeline that runs is not the same thing as data people can trust. Most of the problems I find interesting sit in the gap between the two: definitions nobody wrote down, assumptions baked into a model, a metric read differently by two teams.

I’d rather understand a few tools well, and be able to explain why I chose them, than list many. When I document a project here, the decisions and the alternatives I ruled out matter more to me than the stack.

Writing is part of the work. Explaining a decision is the fastest way I know to find out whether I actually understood it.

I don’t know everything I write about here, and the site doesn’t pretend otherwise. Projects are marked as planned, in progress or finished, and notes can be wrong.

The tools I use most at the moment are SQL, dbt, Python, PostgreSQL, Airflow, Docker and AWS, including Redshift.

## Outside the pipeline

I read a lot of science fiction, especially stories built around a real philosophical, scientific or social question. Related to that, I’m interested in futures studies: scenarios and foresight as a way of thinking about what could happen, not of predicting it.

I also care about how AI is changing work and society, I write fiction now and then, and I like narrative video games and fictional worlds that reward exploring.

## What this site is for

It’s a place to document projects properly, to publish what I learn while I’m learning it, and to give some room to ideas that don’t fit in a pipeline. It’s written for people who work with data, for anyone curious about psychology, technology or possible futures, and for my future self.

## Elsewhere

{% for link in site.social.links -%}
- {% include profile-link.html url=link %}
{% endfor -%}
- [Notes feed (RSS)]({{ '/feed.xml' | relative_url }})
