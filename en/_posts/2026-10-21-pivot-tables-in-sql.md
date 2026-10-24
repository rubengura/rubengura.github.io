---
ref: pivot-sql
title: "How to make a pivot table in SQL"
description: Turning rows into columns in SQL with SUM(CASE …) and GROUP BY, by counting how many Pokémon there are of each combination of types.
topics: [data-engineering, learning]
extra_css: /assets/css/notes/pivot.css
extra_js: /assets/js/notes/pivot.js
related:
  - title: "Pivot tables in SQL with dbt"
    url: /en/notes/pivot-tables-with-dbt/
---

If you've ever used Microsoft Excel or Google Sheets, you've probably used pivot tables to change the way data is laid out. Making a pivot table in those tools is very easy: a few clicks and the data looks the way you want. Getting the same layout in SQL takes more work, though, and it can be a challenge for anyone who's just starting with the language.

In this tutorial we'll use the data from [this Kaggle dataset](https://www.kaggle.com/datasets/abcsds/pokemon) to build a pivot table showing how many Pokémon there are of each type.

## A first look at the data

The data we'll work with looks like this:

{% include notes/pivot/preview.html %}

What we want is to show how many Pokémon of each type there are. The result should look like this:

<figure data-pt="heat">
<div class="pt-scroll" tabindex="0" role="region" aria-label="Pivot table: Pokémon by first and second type">
{% include notes/pivot/heatmap.html %}
</div>
<p class="pt-heat__readout" aria-hidden="true"></p>
<figcaption>Number of Pokémon by type: first type in the rows, second type in the columns. “—” is Pokémon without a second type, and Σ the totals. The brighter the cell, the more Pokémon; hover over one to see the pair.</figcaption>
</figure>

## In SQL

Here's how I got to the same layout in PostgreSQL.

**1.** We select the “Type1” column and create a column from “Type2” for each type of Pokémon:

```sql
SELECT
 "Type1"
 , CASE WHEN "Type2" = 'Bug' THEN 1 ELSE 0 END       AS Bug
 , CASE WHEN "Type2" = 'Dark' THEN 1 ELSE 0 END      AS Dark
 , CASE WHEN "Type2" = 'Dragon' THEN 1 ELSE 0 END    AS Dragon
 , CASE WHEN "Type2" = 'Electric' THEN 1 ELSE 0 END  AS Electric
 , CASE WHEN "Type2" = 'Fairy' THEN 1 ELSE 0 END     AS Fairy
 , CASE WHEN "Type2" = 'Fighting' THEN 1 ELSE 0 END  AS Fighting
 , CASE WHEN "Type2" = 'Fire' THEN 1 ELSE 0 END      AS Fire
 , CASE WHEN "Type2" = 'Flying' THEN 1 ELSE 0 END    AS Flying
 , CASE WHEN "Type2" = 'Ghost' THEN 1 ELSE 0 END     AS Ghost
 , CASE WHEN "Type2" = 'Grass' THEN 1 ELSE 0 END     AS Grass
 , CASE WHEN "Type2" = 'Ground' THEN 1 ELSE 0 END    AS Ground
 , CASE WHEN "Type2" = 'Ice' THEN 1 ELSE 0 END       AS Ice
 , CASE WHEN "Type2" = 'Normal' THEN 1 ELSE 0 END    AS Normal
 , CASE WHEN "Type2" = 'Poison' THEN 1 ELSE 0 END    AS Poison
 , CASE WHEN "Type2" = 'Psychic' THEN 1 ELSE 0 END   AS Psychic
 , CASE WHEN "Type2" = 'Rock' THEN 1 ELSE 0 END      AS Rock
 , CASE WHEN "Type2" = 'Steel' THEN 1 ELSE 0 END     AS Steel
 , CASE WHEN "Type2" = 'Water' THEN 1 ELSE 0 END     AS Water
 , CASE WHEN "Type2" IS NULL THEN 1 ELSE 0 END       AS blank
FROM dwh_dbt.pokemon_stats;
```

This query returns:

<figure data-pt="step1">
{% include notes/pivot/step1.html %}
<figcaption>The first 10 of 800 rows. Each row has exactly one 1: in the column of its second type.</figcaption>
</figure>

At this point, each row shows the Pokémon's first type in the first column and, across the other columns, which second type it has, if any. For example, the first row is a Pokémon that's Grass and also Poison.

**2.** Now we need to group the data to count each combination of types. To do that, we simply sum each second-type column, grouped by the first type:

{% include notes/pivot/machine.html %}

The SQL query becomes:

```sql
SELECT
 "Type1"
 , SUM(CASE WHEN "Type2" = 'Bug' THEN 1 ELSE 0 END)      AS Bug
 , SUM(CASE WHEN "Type2" = 'Dark' THEN 1 ELSE 0 END)     AS Dark
 , SUM(CASE WHEN "Type2" = 'Dragon' THEN 1 ELSE 0 END)   AS Dragon
 , SUM(CASE WHEN "Type2" = 'Electric' THEN 1 ELSE 0 END) AS Electric
 , SUM(CASE WHEN "Type2" = 'Fairy' THEN 1 ELSE 0 END)    AS Fairy
 , SUM(CASE WHEN "Type2" = 'Fighting' THEN 1 ELSE 0 END) AS Fighting
 , SUM(CASE WHEN "Type2" = 'Fire' THEN 1 ELSE 0 END)     AS Fire
 , SUM(CASE WHEN "Type2" = 'Flying' THEN 1 ELSE 0 END)   AS Flying
 , SUM(CASE WHEN "Type2" = 'Ghost' THEN 1 ELSE 0 END)    AS Ghost
 , SUM(CASE WHEN "Type2" = 'Grass' THEN 1 ELSE 0 END)    AS Grass
 , SUM(CASE WHEN "Type2" = 'Ground' THEN 1 ELSE 0 END)   AS Ground
 , SUM(CASE WHEN "Type2" = 'Ice' THEN 1 ELSE 0 END)      AS Ice
 , SUM(CASE WHEN "Type2" = 'Normal' THEN 1 ELSE 0 END)   AS Normal
 , SUM(CASE WHEN "Type2" = 'Poison' THEN 1 ELSE 0 END)   AS Poison
 , SUM(CASE WHEN "Type2" = 'Psychic' THEN 1 ELSE 0 END)  AS Psychic
 , SUM(CASE WHEN "Type2" = 'Rock' THEN 1 ELSE 0 END)     AS Rock
 , SUM(CASE WHEN "Type2" = 'Steel' THEN 1 ELSE 0 END)    AS Steel
 , SUM(CASE WHEN "Type2" = 'Water' THEN 1 ELSE 0 END)    AS Water
 , SUM(CASE WHEN "Type2" IS NULL THEN 1 ELSE 0 END)      AS blank
FROM dwh_dbt.pokemon_stats
GROUP BY 1
ORDER BY 1;
```

The result is very close to the table we started with:

<figure data-pt="step2">
{% include notes/pivot/step2.html %}
<figcaption>One row per first type. The <code>blank</code> column holds the {{ site.data.pokemon_pivot.no_second_type }} Pokémon without a second type: without it, almost half the table wouldn't be counted in any column.</figcaption>
</figure>

Bear in mind, though, that as the number of values in the column you're pivoting grows, you'll have to add more columns to the query, which gets impractical when you have, say, 50 distinct values (or more).

{% include notes/pivot/scale.html %}

In those cases dbt is a very handy tool that can make life much easier by simplifying and automating queries. But that's for another article, coming soon ;).

<div class="pt-continue" data-pt="continue">
  <span class="pt-continue__label">To be continued…</span>
  <a class="pt-continue__next" href="{{ '/en/notes/pivot-tables-with-dbt/' | relative_url }}">▶ dbt</a>
</div>
