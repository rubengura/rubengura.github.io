---
ref: signals-and-scenarios
title: Señales y escenarios
description: Un experimento para usar datos públicos en el pensamiento de futuros. La idea es seguir señales de cambio y conectarlas con escenarios explícitos que se puedan revisar a medida que se mueven los datos.
status: planned          # planned | in-progress | finished
featured: true           # show on the home page
order: 3                 # position in lists (lower comes first)
updated: 2026-10-20
stack: []                # e.g. [dbt, PostgreSQL, Python]
repo:                    # https://github.com/rubengura/...
demo:
---

## Problema

El trabajo de futuros suele apoyarse en señales de cambio recogidas y valoradas a mano. El trabajo con datos, en cambio, suele dar por hecho que el futuro se parecerá al pasado. Me interesa el espacio entre los dos: usar datos para mantener honestos los escenarios, sin pretender predecir nada.

## Objetivos

- Elegir un ámbito y un puñado de indicadores públicos que se actualicen con regularidad.
- Describir unos pocos escenarios explícitos, e indicar qué indicadores harían cada uno más o menos plausible.
- Construir un pipeline pequeño que mantenga los indicadores al día y muestre cómo cambia con el tiempo la evidencia de cada escenario.
- Ser claro con la incertidumbre en todo momento. Nada de previsiones disfrazadas de certezas.

## Preguntas que quiero responder

- ¿Qué ámbito tiene datos públicos lo bastante buenos para esto?
- ¿Cómo se representa un escenario para que los datos puedan actualizarlo sin convertirlo en una previsión?
- ¿Qué puede aportar un pipeline de datos a la prospectiva, y qué debería dejar en paz?
