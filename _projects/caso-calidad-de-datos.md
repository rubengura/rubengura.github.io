---
redirect_from: /es/lab/caso-calidad-de-datos/
ref: data-quality-case-study
title: Cuando el pipeline está en verde y el número está mal
description: Un caso práctico de calidad de datos construido en torno a una pregunta de negocio. Los tests pasan, la métrica engaña, y el proyecto trata de lo que hace falta para detectar la diferencia.
status: planned          # planned | in-progress | finished
featured: true           # show on the home page
order: 1                 # position in lists (lower comes first)
updated: 2026-10-20
stack: []                # e.g. [dbt, PostgreSQL, Python]
repo:                    # https://github.com/rubengura/...
demo:
related:
  - title: "Nota: El dashboard no está roto. La definición, sí."
    url: /notas/el-dashboard-no-esta-roto/
---

## Problema

La mayoría de los controles de calidad de datos miran la forma de los datos: nulos, duplicados, frescura, valores aceptados. Esos controles importan. Pero los fallos que hacen daño a un negocio suelen pasarlos: una definición que cambió en silencio, un join que duplica filas solo para algunos clientes, un filtro del que todo el mundo se ha olvidado.

Cuando eso pasa, el pipeline está en verde y el número sigue estando mal.

## Objetivos

- Construir un dataset de negocio pequeño y realista con datos sintéticos, y plantar problemas en él a propósito, para que cada fallo se conozca de antemano.
- Comparar qué tipos de controles detectan qué problemas, y cuáles se cuelan por todo.
- Contar los resultados para dos públicos: quienes construyen los controles y quienes toman decisiones con los números.

## Preguntas que quiero responder

- ¿Cómo se prueba una *definición*, en lugar de una columna?
- ¿Cómo es un contrato de datos cuando quien lo consume es una persona leyendo un dashboard, no otro sistema?
- ¿Qué problemas sale más barato prevenir con una conversación que con un test?
