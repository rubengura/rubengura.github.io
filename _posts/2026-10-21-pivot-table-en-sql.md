---
ref: pivot-sql
title: "Cómo hacer una Pivot Table (tabla dinámica) en SQL"
description: Cómo pasar de filas a columnas en SQL con SUM(CASE …) y GROUP BY, contando cuántos Pokémon hay de cada combinación de tipos.
topics: [data-engineering, learning]
extra_css: /assets/css/notes/pivot.css
extra_js: /assets/js/notes/pivot.js
related:
  - title: "Pivot Tables en SQL con dbt"
    url: /notas/pivot-tables-con-dbt/
---

Si alguna vez has trabajado con Microsoft Excel o Google Spreadsheets, es bastante probable que hayas trabajado con pivot tables (tablas dinámicas) para cambiar la forma en que se representan los datos. Hacer una tabla dinámica con las herramientas mencionadas es muy sencillo: apenas necesitamos unos pocos clics para representar la información de manera adecuada. No obstante, representar esa misma información en SQL es un proceso un poco más laborioso y puede suponer un reto para quienes se han iniciado en este lenguaje de consultas.

En este tutorial utilizaremos los datos de [este repositorio de Kaggle](https://www.kaggle.com/datasets/abcsds/pokemon) como ejemplo para hacer una pivot table que muestre el número de Pokémon que existen por cada tipo.

## Primer vistazo a los datos

Los datos con los que vamos a trabajar tienen la siguiente estructura:

{% include notes/pivot/preview.html %}

El objetivo que queremos conseguir es mostrar cuántos Pokémon de cada tipo hay. El resultado debe quedar tal que así:

<figure data-pt="heat">
<div class="pt-scroll" tabindex="0" role="region" aria-label="Tabla dinámica: Pokémon por tipo 1 y tipo 2">
{% include notes/pivot/heatmap.html %}
</div>
<p class="pt-heat__readout" aria-hidden="true"></p>
<figcaption>Distribución de número de Pokémon por tipos: el tipo 1 en las filas y el tipo 2 en las columnas. «—» son los Pokémon sin segundo tipo y Σ, los totales. Cuanto más intensa la celda, más Pokémon; pasa el ratón por encima para ver la combinación.</figcaption>
</figure>

## Proceso en SQL

A continuación, mostraré el proceso realizado en PostgreSQL para llegar al mismo formato.

**1.** Seleccionamos la columna «Type1» y creamos una columna basada en la columna «Type2» por cada tipo de Pokémon:

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

Esta instrucción nos devolverá el siguiente resultado:

<figure data-pt="step1">
{% include notes/pivot/step1.html %}
<figcaption>Las 10 primeras filas del resultado, de 800. Cada fila tiene un único 1: el de la columna de su tipo 2.</figcaption>
</figure>

En este punto, en cada fila vemos el tipo 1 de Pokémon en la primera columna y, además, vemos si el Pokémon pertenece a una de las categorías de tipo 2, desglosada en el resto de columnas. Por ejemplo, en la primera fila vemos un Pokémon que, además de ser tipo Planta, es tipo Veneno.

**2.** Ahora debemos agrupar la información para indicar el conteo de cada combinación de tipos de Pokémon. Para ello, simplemente añadiremos la suma de elementos de cada columna de tipo 2 agrupado por tipo 1:

{% include notes/pivot/machine.html %}

La consulta de SQL queda de la siguiente manera:

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

Como resultado obtendremos una tabla muy parecida a la que hemos hecho referencia al principio:

<figure data-pt="step2">
{% include notes/pivot/step2.html %}
<figcaption>Una fila por tipo 1. La columna <code>blank</code> recoge los {{ site.data.pokemon_pivot.no_second_type }} Pokémon sin segundo tipo: sin ella, casi la mitad de la tabla no se contaría en ninguna columna.</figcaption>
</figure>

No obstante, hay que tener en cuenta que, a medida que aumenta el número de valores de la columna que quieres pivotar, tendrás que añadir nuevas columnas en la instrucción de SQL, por lo que puede ser poco práctico cuando tienes, por ejemplo, 50 valores distintos (o más).

{% include notes/pivot/scale.html %}

En estos casos, dbt es una herramienta muy práctica que puede facilitar mucho la vida a la hora de simplificar y automatizar queries. Pero esto lo veremos próximamente en otro artículo dedicado al respecto ;).

<div class="pt-continue" data-pt="continue">
  <span class="pt-continue__label">Continuará…</span>
  <a class="pt-continue__next" href="{{ '/notas/pivot-tables-con-dbt/' | relative_url }}">▶ dbt</a>
</div>
