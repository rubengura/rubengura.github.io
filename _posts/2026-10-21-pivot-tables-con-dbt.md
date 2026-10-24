---
ref: dbt-pivot
title: "Pivot Tables en SQL con dbt"
description: Cómo pivotar una tabla en dbt con variables, bucles de Jinja y dbt_utils, sin escribir a mano un SUM(CASE WHEN …) por cada valor.
topics: [data-engineering, learning]
extra_css: [/assets/css/notes/pivot.css, /assets/css/notes/dbt-pivot.css]
extra_js: /assets/js/notes/dbt-pivot.js
related:
  - title: "Cómo hacer una Pivot Table (tabla dinámica) en SQL"
    url: /notas/pivot-table-en-sql/
---

Hace unos días os explicaba en [mi anterior artículo]({{ '/notas/pivot-table-en-sql/' | relative_url }}) cómo hacer una Pivot Table con SQL.

La principal desventaja de pivotar en SQL es que, por cada categoría que existe en la columna que queremos pivotar, debemos añadir una nueva columna en nuestra cláusula SELECT, seleccionando la categoría de interés en el CASE WHEN. En el ejemplo que vimos en el artículo anterior, la query quedó de la siguiente manera:

<figure>
{% include notes/dbt-pivot/handwritten.html %}
<figcaption>De una línea a otra solo cambia el tipo de Pokémon, resaltado: dos veces por línea.</figcaption>
</figure>

Es decir, que para pivotar una columna con 18 valores distintos, necesitamos crear 18 columnas distintas. ¿Y si la columna tuviese 200 valores? Te puedes hacer una idea de cuántos copy paste tendrás que hacer para después seleccionar la categoría de interés…

Por suerte, este proceso se simplifica enormemente gracias a herramientas como dbt.

## ¿Qué es dbt?

dbt es una herramienta que permite aplicar las buenas prácticas de la ingeniería de software a la hora de picar SQL. Gracias a la integración que dbt hace de Python y Jinja (un lenguaje de plantillas), se pueden automatizar, parametrizar y simplificar scripts de SQL.

Y la creación de una pivot table es un maravilloso ejemplo para ilustrar las bondades de dbt.

Dos de las funcionalidades que tiene esta herramienta son la creación de variables y el uso de bucles. Por un lado, podemos guardar dentro de una lista el conjunto de categorías distintas que puede tener la columna que queremos pivotar de la siguiente manera:

{% raw %}
```sql
{% set pokemon_types = ["Bug", "Dark", "Dragon", "Electric", "Fairy",
 "Fighting", "Fire", "Flying", "Ghost", "Grass", "Ground", "Ice", "Normal",
 "Poison", "Psychic", "Rock", "Steel", "Water"] %}
```
{% endraw %}

Con esta instrucción, hemos creado una variable llamada `pokemon_types` que contiene una lista de valores con todos los tipos de Pokémon.

Ahora podemos utilizar un bucle para iterar sobre esta lista de valores y aplicar la cláusula SUM(CASE WHEN …) sobre cada una de ellas. El código resultante sería el siguiente:

{% raw %}
```sql
SELECT
    "Type1"
    -- Por cada tipo de Pokémon, creamos un SUM(CASE WHEN ...) que seleccione
    -- el tipo de Pokémon sobre el que estamos iterando.
    {%- for type in pokemon_types %}
    , SUM(CASE WHEN "Type2" = '{{ type }}' THEN 1 ELSE 0 END) AS {{ type }}
    {%- endfor %}
    , SUM(CASE WHEN "Type2" IS NULL THEN 1 ELSE 0 END) AS blank
FROM dwh_dbt.pokemon_stats
GROUP BY 1
ORDER BY 1
```

El primer script que hemos visto y este son exactamente iguales; sin embargo, gracias a dbt solamente necesitamos escribir una vez la cláusula SUM(CASE WHEN …). Por cada tipo de Pokémon (`type`) en `pokemon_types`, se genera una instrucción. En la primera iteración, la variable `type` es Bug. Se genera la primera columna, cuyo nombre es `{{ type }}` → Bug, y contará todos los Pokémon de tipo `'{{ type }}'`. En la segunda iteración, la variable `type` pasa a ser Dark y se repite el proceso hasta pasar por toda la lista de valores.
{% endraw %}

{% include notes/dbt-pivot/compiler.html %}

{% raw %}
**IMPORTANTE:** nótese que Jinja solo sustituye `{{ type }}` por su valor; quien lo interpreta es SQL. Cuando `'{{ type }}'` lleva comillas, el resultado (`'Bug'`) es un string, mientras que cuando se escribe sin comillas (`{{ type }}`), el resultado (`Bug`) se considera el nombre de una columna.
{% endraw %}

{% include notes/dbt-pivot/quotes.html %}

Ahora es más fácil añadir nuevas categorías en nuestra pivot table: solo es necesario añadir el valor en la variable `pokemon_types` y dbt se encargará de añadir la columna adicional al compilar el código.

¡Pero la simplificación del código no acaba aquí!

dbt, del mismo modo que Python, tiene librerías que puedes utilizar para facilitar procesos de toda índole, y justamente la creación de las pivot tables está recogida en una de las funciones de la librería `dbt_utils`. Por lo que podemos reducir el número de cambios manuales sobre nuestro script aún más de la siguiente manera:

{% raw %}
```sql
-- Creamos una lista que contiene todos los tipos diferentes de Pokémon
{% set pokemon_types = dbt_utils.get_column_values(
                         table=ref('pokemon_stats'),
                         column='"Type2"',
                         where='"Type2" is not null') %}

SELECT
    "Type1"
    -- Pivotamos la columna "Type2" con los valores recogidos en la lista
    -- pokemon_types
    , {{ dbt_utils.pivot('"Type2"', pokemon_types) }}
    , SUM(CASE WHEN "Type2" IS NULL THEN 1 ELSE 0 END) AS blank
FROM {{ ref('pokemon_stats') }}
GROUP BY 1
ORDER BY 1
```
{% endraw %}

Para asignar el listado de tipos de Pokémon en la variable `pokemon_types`, utilizamos la función `get_column_values`, que se encarga de identificar todos los valores distintos de una tabla y columna seleccionada. De esta manera, si en el futuro apareciesen nuevos tipos de Pokémon, no tendríamos que añadir los valores manualmente. La función se encargará de identificarlo por nosotros.

Con `where='"Type2" is not null'` dejamos fuera a los Pokémon sin segundo tipo, que seguimos contando aparte en la columna `blank`: sin ese filtro, `get_column_values` también devolvería el valor nulo y `pivot` crearía una columna llamada «None» llena de ceros. Las comillas dobles de `'"Type2"'` hacen falta en PostgreSQL porque el nombre de la columna lleva mayúsculas.

{% include notes/dbt-pivot/funnel.html %}

Aunque está fuera del alcance de este artículo, cabe mencionar que en dbt se hace uso de la función `ref` para referenciar las diferentes tablas o vistas de nuestra base de datos. En este caso particular, en vez de referenciar al esquema y tabla en el que tenemos guardada la información (`dwh_dbt.pokemon_stats`), utilizaremos `ref('pokemon_stats')`.

Finalmente, en la sección del SELECT, sustituimos el bucle por la función `pivot`, que recoge dos argumentos:

1. La columna que queremos pivotar.
2. Los valores que queremos tener en cuenta para pivotar.

<details class="dp-details">
<summary>Ver el SQL que genera <code>dbt_utils.pivot</code> al compilar</summary>
{% include notes/dbt-pivot/compiled.html %}
</details>

{% include notes/dbt-pivot/score.html %}

## ¿Qué te ha parecido?

Puede que al principio leer código SQL con Jinja resulte un poco tedioso, pero a la que te acostumbras, la cantidad de código que puedes simplificar y automatizar hace que sea una herramienta muy productiva.
