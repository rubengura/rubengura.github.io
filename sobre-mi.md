---
redirect_from: /es/sobre-mi/
ref: about
title: Sobre mí
description: Rubén Guerrero es ingeniero de datos y estudió psicología. Cómo llegó hasta aquí, cómo entiende la ingeniería y para qué sirve esta web.
lede: Soy Rubén Guerrero. Trabajo como ingeniero de datos y llevo trabajando con datos desde 2017.
permalink: /sobre-mi/
---

## De la psicología a los datos

Estudié psicología. Lo que me atrapaba era el comportamiento: por qué decidimos lo que decidimos, y cuánto de eso ocurre antes de que nadie se ponga a razonar. La psicología del comportamiento y el neuromarketing eran las partes a las que siempre volvía.

Desde 2017 he trabajado en análisis de datos, ciencia de datos, analytics engineering e ingeniería de datos. Con el tiempo mi trabajo se ha ido desplazando aguas arriba, del gráfico hacia los sistemas que hay debajo. Las preguntas de la psicología vinieron conmigo: cómo lee alguien un número, qué espera que diga y qué hace cuando le sorprende.

## Cómo entiendo la ingeniería

Un pipeline que funciona no es lo mismo que unos datos en los que la gente puede confiar. La mayoría de los problemas que me interesan están en el hueco entre las dos cosas: definiciones que nadie escribió, supuestos metidos dentro de un modelo, una métrica que dos equipos leen de forma distinta.

Prefiero entender bien unas pocas herramientas, y poder explicar por qué las elegí, a enumerar muchas. Cuando documento un proyecto aquí, me importan más las decisiones y las alternativas que descarté que el stack.

Escribir es parte del trabajo. Explicar una decisión es la forma más rápida que conozco de descubrir si de verdad la entendí.

No sé todo aquello sobre lo que escribo, y la web no finge lo contrario. Los proyectos están marcados como planificados, en curso o terminados, y las notas pueden estar equivocadas.

Las herramientas que más uso ahora mismo son SQL, dbt, Python, PostgreSQL, Airflow, Docker y AWS, incluido Redshift.

## Fuera del pipeline

Leo mucha ciencia ficción, sobre todo historias construidas alrededor de una pregunta filosófica, científica o social de verdad. Relacionado con eso, me interesan los estudios de futuros: los escenarios y la prospectiva como forma de pensar en lo que podría pasar, no de predecirlo.

También me importa cómo la IA está cambiando el trabajo y la sociedad, de vez en cuando escribo ficción, y me gustan los videojuegos narrativos y los mundos de ficción que premian explorar.

## Para qué sirve esta web

Es un lugar para documentar bien los proyectos, para publicar lo que aprendo mientras lo aprendo y para dar algo de espacio a las ideas que no caben en un pipeline. Está escrita para gente que trabaja con datos, para cualquiera con curiosidad por la psicología, la tecnología o los futuros posibles, y para mi yo del futuro.

## En otros sitios

{% for link in site.social.links -%}
- {% include profile-link.html url=link %}
{% endfor -%}
- [Feed de notas (RSS)]({{ '/feed.xml' | relative_url }})
