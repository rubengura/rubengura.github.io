---
ref: sql-indexes
title: "Índices en SQL"
description: Por qué un índice encuentra un registro casi igual de rápido en una tabla de cien filas que en una de un millón, explicado con una biblioteca.
topics: [data-engineering, learning]
extra_css: /assets/css/notes/indexes.css
extra_js: /assets/js/notes/indexes.js
---

Los índices son estructuras de datos en SQL que permiten recuperar rápidamente datos de una tabla, independientemente del volumen de datos que haya dentro.

Pero, ¿por qué son tan eficientes? En vez de hablar de tecnicismos y de cómo la *Big-O complexity* entra en juego… Deja que te lo explique con un ejemplo de lo más mundano.

Imagina que entras en una biblioteca para tomar prestado «Cien años de soledad», de Gabriel García Márquez. Se trata de una biblioteca muy pequeña, de apenas 100 ejemplares.

Por desgracia, los libros no están ordenados alfabéticamente por autor, por lo que te toca ir mirando uno a uno para ver si lo tienen. Como no había muchos libros en la biblioteca, has tardado un par de minutos hasta encontrarlo.

El equivalente en SQL sería algo así:

```sql
SELECT *
FROM libros
WHERE título = 'Cien años de soledad'
  AND autor = 'Gabriel García Márquez';
```

La tabla `libros` contiene 100 filas con los títulos y los nombres del autor de los ejemplares disponibles. Al no estar indexados los registros, se tiene que recorrer toda la tabla para identificar el ejemplar (si existe dentro de la tabla).

{% include notes/indexes/scan.html %}

Ahora bien, ¿qué ocurre si entramos en una biblioteca con más de un millón de libros y estos no están organizados de ninguna manera? Pues nada, buena suerte encontrando tu libro…

{% include notes/indexes/million.html %}

Aquí es donde los índices juegan un papel importantísimo, y seguro que ya estarás viendo cómo el ejemplo de la biblioteca casa con este concepto.

Las bibliotecas ordenan sus libros (aparte de por temática) por orden alfabético del autor, por lo que no tienes que molestarte en mirar libro a libro. Simplemente tienes que echar un vistazo rápido por las estanterías mirando la inicial del autor (A… C… E… G, ¡tiene que estar por aquí!) y, una vez encontramos la G, aquí ya sí, mirar uno a uno.

{% include notes/indexes/sorted.html %}

Tanto si la biblioteca es pequeña, mediana o inmensa, buscar la estantería que contiene la G será rápido. Y sí, siempre tardarás un poco más en encontrar un libro en una biblioteca más grande que en una pequeña, pero el tiempo que tardas es ínfimo si lo comparas con lo que tardarías en encontrar el libro si tuvieras que mirar el libro por TODA la biblioteca.

{% include notes/indexes/race.html %}

Así que, ya ves, aunque a nivel técnico los índices son un concepto relativamente complejo, el principio subyacente es bastante simple en la práctica.
