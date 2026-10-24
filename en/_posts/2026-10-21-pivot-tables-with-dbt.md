---
ref: dbt-pivot
title: "Pivot tables in SQL with dbt"
description: How to pivot a table in dbt with variables, Jinja loops and dbt_utils, without writing a SUM(CASE WHEN …) by hand for every value.
topics: [data-engineering, learning]
extra_css: [/assets/css/notes/pivot.css, /assets/css/notes/dbt-pivot.css]
extra_js: /assets/js/notes/dbt-pivot.js
related:
  - title: "How to make a pivot table in SQL"
    url: /en/notes/pivot-tables-in-sql/
---

A few days ago, in [my previous article]({{ '/en/notes/pivot-tables-in-sql/' | relative_url }}), I showed how to make a pivot table in SQL.

The main drawback of pivoting in SQL is that, for every category in the column we want to pivot, we have to add a new column to the SELECT clause, picking that category in the CASE WHEN. In the example from the previous article, the query ended up like this:

<figure>
{% include notes/dbt-pivot/handwritten.html %}
<figcaption>From one line to the next, only the Pokémon type changes, highlighted: twice per line.</figcaption>
</figure>

In other words, to pivot a column with 18 distinct values we need 18 different columns. What if the column had 200 values? You can imagine how much copying and pasting you'd have to do, and then pick the right category in each line…

Luckily, tools like dbt make this a lot simpler.

## What is dbt?

dbt is a tool that brings software engineering good practice to writing SQL. Because dbt brings together Python and Jinja (a templating language), you can automate, parameterise and simplify SQL scripts.

And making a pivot table is a wonderful example of what dbt is good at.

Two of its features are variables and loops. First, we can store the distinct categories of the column we want to pivot in a list, like this:

{% raw %}
```sql
{% set pokemon_types = ["Bug", "Dark", "Dragon", "Electric", "Fairy",
 "Fighting", "Fire", "Flying", "Ghost", "Grass", "Ground", "Ice", "Normal",
 "Poison", "Psychic", "Rock", "Steel", "Water"] %}
```
{% endraw %}

This creates a variable called `pokemon_types` holding a list with every type of Pokémon.

Now we can loop over the list and apply the SUM(CASE WHEN …) to each value. The code becomes:

{% raw %}
```sql
SELECT
    "Type1"
    -- For each type of Pokémon, we create a SUM(CASE WHEN ...) that picks
    -- the type of Pokémon we're iterating over.
    {%- for type in pokemon_types %}
    , SUM(CASE WHEN "Type2" = '{{ type }}' THEN 1 ELSE 0 END) AS {{ type }}
    {%- endfor %}
    , SUM(CASE WHEN "Type2" IS NULL THEN 1 ELSE 0 END) AS blank
FROM dwh_dbt.pokemon_stats
GROUP BY 1
ORDER BY 1
```

The first script and this one are exactly the same, but with dbt we only have to write the SUM(CASE WHEN …) once. For each type of Pokémon (`type`) in `pokemon_types`, one line is generated. On the first iteration, `type` is Bug: the first column is named `{{ type }}` → Bug, and it counts every Pokémon of type `'{{ type }}'`. On the second iteration, `type` becomes Dark, and so on through the whole list.
{% endraw %}

{% include notes/dbt-pivot/compiler.html %}

{% raw %}
**IMPORTANT:** Jinja only replaces `{{ type }}` with its value; it's SQL that interprets the result. When `'{{ type }}'` is in quotes, the result (`'Bug'`) is a string; without quotes (`{{ type }}`), the result (`Bug`) is read as a column name.
{% endraw %}

{% include notes/dbt-pivot/quotes.html %}

Adding categories to the pivot table is now easier: just add the value to `pokemon_types`, and dbt adds the extra column when it compiles the code.

But the simplification doesn't stop there!

Like Python, dbt has libraries you can use to make all sorts of jobs easier, and pivot tables happen to be one of the functions in the `dbt_utils` library. So we can cut the manual changes to our script even further:

{% raw %}
```sql
-- A list with every distinct type of Pokémon
{% set pokemon_types = dbt_utils.get_column_values(
                         table=ref('pokemon_stats'),
                         column='"Type2"',
                         where='"Type2" is not null') %}

SELECT
    "Type1"
    -- Pivot the "Type2" column on the values in the
    -- pokemon_types list
    , {{ dbt_utils.pivot('"Type2"', pokemon_types) }}
    , SUM(CASE WHEN "Type2" IS NULL THEN 1 ELSE 0 END) AS blank
FROM {{ ref('pokemon_stats') }}
GROUP BY 1
ORDER BY 1
```
{% endraw %}

To fill `pokemon_types` with the types of Pokémon we use `get_column_values`, which finds every distinct value in a given table and column. That way, if new types of Pokémon appeared in the future, we wouldn't have to add them by hand: the function would find them for us.

`where='"Type2" is not null'` leaves out the Pokémon without a second type, which we still count separately in the `blank` column: without that filter, `get_column_values` would also return the null value, and `pivot` would create a column called “None” full of zeros. The double quotes in `'"Type2"'` are needed in PostgreSQL because the column name has capital letters.

{% include notes/dbt-pivot/funnel.html %}

Although it's beyond the scope of this article, it's worth mentioning that dbt uses the `ref` function to refer to the tables and views in the database. Here, instead of referring to the schema and table where the data lives (`dwh_dbt.pokemon_stats`), we use `ref('pokemon_stats')`.

Finally, in the SELECT, we replace the loop with the `pivot` function, which takes two arguments:

1. The column we want to pivot.
2. The values we want to pivot on.

<details class="dp-details">
<summary>See the SQL that <code>dbt_utils.pivot</code> compiles to</summary>
{% include notes/dbt-pivot/compiled.html %}
</details>

{% include notes/dbt-pivot/score.html %}

## What do you think?

Reading SQL mixed with Jinja can feel a bit tedious at first, but once you get used to it, the amount of code you can simplify and automate makes it a very productive tool.
