---
redirect_from: /es/notas/el-dashboard-no-esta-roto/
ref: dashboard-definition
title: "El dashboard no está roto. La definición, sí."
description: Por qué una métrica puede estar mal aunque pasen todos los tests del pipeline, y por qué el arreglo suele ser una conversación más que un parche.
topics: [data-engineering, psychology]
draft: true
notice: Esta nota se escribió para probar el diseño de la web y todavía no está revisada. La redacción cambiará.
sitemap: false
related:
  - title: "Proyecto planificado: Cuando el pipeline está en verde y el número está mal"
    url: /lab/caso-calidad-de-datos/
---

Imagina dos dashboards que no coinciden. Uno dice que el producto tuvo 48.000 usuarios activos el mes pasado. El otro dice 61.000. Los dos pipelines se ejecutaron a tiempo y todos los tests pasaron: ningún nulo inesperado, claves únicas, datos frescos.

No hay nada roto. Y aun así, uno de esos números está a punto de presentarse a alguien como la verdad.

## Dos consultas correctas

La diferencia suele ser una definición, no un bug. Esta es la misma idea, un «usuario activo», escrita dos veces:

```sql
-- Marketing: cualquiera que abrió la app
select count(distinct user_id)
from events
where event_name = 'app_open'
  and event_date >= date '2026-09-01'
  and event_date <  date '2026-10-01';

-- Producto: cualquiera que hizo algo con sentido
select count(distinct user_id)
from events
where event_name in ('create_item', 'share_item')
  and event_date >= date '2026-09-01'
  and event_date <  date '2026-10-01';
```

Las dos consultas son correctas. Responden a preguntas distintas, y ninguno de los títulos de los dashboards dice a cuál está respondiendo.

## Por qué los tests no lo detectan

La mayoría de los tests de datos comprueban la forma de los datos: tipos, nulos, unicidad, frescura. Son necesarios, y no dicen casi nada sobre el significado. Un test puede confirmar que `user_id` nunca es nulo. No puede decirte que dos equipos usan la palabra «activo» para cosas distintas.

Aquí es donde la psicología resulta útil. Casi nunca leemos un número aislado. Lo leemos frente a algo: el valor del mes pasado, un objetivo, lo que esperábamos ver.[^anclaje] Una métrica sin una definición escrita deja un hueco, y cada cual lo rellena con la suya. La mayoría de las veces ni se da cuenta de que lo ha hecho.

## Lo que de verdad ayuda

- **Escribe la definición donde vive el número.** No en una wiki a tres clics, sino en el modelo, la capa semántica o la descripción del dashboard.
- **Dale a cada definición una persona responsable.** Alguien que pueda decir «esto es lo que queremos decir» y cambiarlo a propósito.
- **Prueba la relación, no solo los datos.** Por ejemplo, comprueba que los dos recuentos de «usuarios activos» se mantienen dentro de una proporción esperada, y trata un cambio brusco como una pregunta que hacer, no como un error que silenciar.

Nada de esto es técnicamente difícil. La mayor parte consiste en ponerse de acuerdo con las palabras, que es justo la parte que los equipos de ingeniería tienden a saltarse.

[^anclaje]: El anclaje es el ejemplo clásico. En los experimentos de Tversky y Kahneman de 1974, un valor de partida arbitrario arrastraba hacia sí las estimaciones posteriores de la gente.
