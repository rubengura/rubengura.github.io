---
ref: analytics-platform
title: Una pequeña plataforma analítica, de principio a fin
description: Ingerir un dataset público, modelarlo en un data warehouse, probarlo, orquestarlo y servirlo, manteniendo el conjunto lo bastante pequeño como para poder razonar sobre él.
status: planned          # planned | in-progress | finished
featured: true           # show on the home page
order: 2                 # position in lists (lower comes first)
updated: 2026-10-20
stack: []                # e.g. [dbt, PostgreSQL, Python]
repo:                    # https://github.com/rubengura/...
demo:
---

## Problema

Los portfolios de ingeniería de datos suelen enseñar una sola pieza del stack: un DAG, un proyecto de dbt o un dashboard. Las decisiones que más me interesan ocurren donde esas piezas se encuentran. ¿Cómo llegan los datos? ¿Dónde se validan? ¿Quién es responsable de cada definición? ¿Y qué pasa cuando una fuente cambia sin avisar?

## Objetivos

- Construir un flujo completo, desde la ingesta hasta un modelo que alguien pudiera usar de verdad, solo con datos públicos.
- Que sea reproducible en un portátil, con instrucciones de instalación lo bastante cortas como para seguirlas.
- Documentar cada decisión importante, incluidas las que revisaría.
- Tratar los tests y la observabilidad como parte del diseño desde el principio, no como algo que se añade al final.

## Preguntas que quiero responder

- ¿Qué dataset público es lo bastante desordenado como para ser realista, pero lo bastante estable como para reproducirlo?
- ¿Cómo de pequeña puede ser una plataforma y seguir mostrando problemas reales de orquestación, testing y monitorización?
- ¿Dónde está la frontera entre un entorno local útil y uno que solo funciona en mi máquina?
