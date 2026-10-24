---
ref: guess-who
title: "Cómo ganar al «¿Quién es quién?» con estadística"
description: La mejor estrategia para adivinar el personaje con el menor número de preguntas, explicada con probabilidades y varianza.
topics: [psychology, learning]
extra_css: /assets/css/notes/guess-who.css
extra_js: /assets/js/notes/guess-who.js
---

{% include notes/guess-who/sprites.svg %}

El otro día estaba jugando al «¿Quién es quién?» en la playa y pensaba en la mejor estrategia para ganar la partida haciendo el menor número de preguntas posibles.

## Funcionamiento del juego

Por si alguien se pregunta en qué consiste el juego, es muy sencillo:

Cada jugador tiene un total de 20 cartas con caras de distintas personas (tal y como podéis ver en la imagen) más una carta que es la persona que el otro jugador debe adivinar y que no puedes ver. El objetivo es adivinar qué carta tiene el rival antes de que el rival adivine la carta que tienes tú.

<figure data-gw="board">
{% include notes/guess-who/board.html label="Las 20 cartas del tablero" %}
<figcaption>Las 20 cartas del tablero.</figcaption>
</figure>

Por turnos se realizan preguntas de «Sí» o «No» sobre características del personaje a adivinar y, en función de la respuesta, se van eliminando cartas. Por ejemplo, si debo adivinar que la persona que buscamos identificar es Liz (obviamente, se supone que esta carta no puedo verla) y, para empezar, pregunto si la persona objetivo es un hombre, el rival me responderá que no, por lo que puedo eliminar del tablero todos los personajes varones.

<figure data-gw="example">
<div class="gw-dialog">
  <p><span class="gw-dialog__who">Yo:</span> ¿Es un hombre?</p>
  <p><span class="gw-dialog__who">Rival:</span> No.</p>
</div>
{% include notes/guess-who/board.html label="El tablero tras la pregunta: los hombres, descartados" down="men" %}
<figcaption>Cartas disponibles al realizar la pregunta de ejemplo.</figcaption>
</figure>

Bien, durante el primer turno del juego, la probabilidad inicial de acierto del personaje a identificar es de 1/20, por lo que no es recomendable arriesgarse a decir un nombre a la virulé. Por el contrario, lo ideal será poder descartar el mayor número de cartas posible en cada turno. Pero, ¡cuidado!, hay que tener en cuenta que las preguntas muy específicas, aunque pueden ser una gran jugada si aciertas, pueden ser de muy poca ayuda si el personaje no cumple dicha característica.

## Entonces, ¿cuál es la mejor estrategia?

Para responder a esta pregunta, me vais a tener que perdonar: voy a tener que hablar de probabilidades y varianza (en definitiva, se trata de un artículo de estadística).

Desde el punto de vista de la teoría de la probabilidad, con cada pregunta que realizamos en la partida nos encontramos ante un escenario con dos posibles resultados: sí o no.

La probabilidad de acierto en cada pregunta se calcula identificando cuántos personajes cumplen el rasgo sobre el que se pregunta respecto al total. Por ejemplo: preguntamos si la persona objetivo lleva gafas. En el tablero hay 5 personajes con gafas, por lo que la probabilidad de acertar es 5/20, siendo 15/20 la probabilidad de fallar. Así, si realizamos esta pregunta en el primer turno y acertamos, reducimos considerablemente el abanico de opciones, de 20 a 5. Pero, si no acertamos, como sería nuestro caso, solo lo reducimos a 15 opciones.

<figure data-gw="glasses">
{% include notes/guess-who/board.html label="Los 5 personajes con gafas, destacados" mark="glasses" %}
<div class="gw-split">
  <div class="gw-split__bar" aria-hidden="true"><span class="gw-split__yes" style="--share: 5">5</span><span class="gw-split__no" style="--share: 15">15</span></div>
  <p class="gw-split__legend"><span>Si acierto: quedan 5 cartas</span><span>Si fallo: quedan 15</span></p>
</div>
<figcaption>«¿Lleva gafas?»: 5 de los 20 personajes cumplen el rasgo.</figcaption>
</figure>

De cada pregunta, con su probabilidad de acierto y de fallo asociadas, se puede calcular la varianza. Cuando tratamos con probabilidades, la varianza de una pregunta se obtiene al multiplicar la probabilidad de acertar por la probabilidad de fallar.

<p class="gw-formula" data-gw="formula">Var(Pregunta) = Prob. acierto <span class="gw-x">×</span> Prob. fallo</p>

En el ejemplo anterior, al preguntar si el personaje que queremos descubrir lleva gafas, la probabilidad de acertar es de 5/20 (0.25), mientras que la probabilidad de fallar es de 15/20 (0.75). Al calcular la varianza obtenemos:

<div class="gw-calc" data-gw="calc">
  <p class="gw-calc__line"><span class="gw-calc__prompt" aria-hidden="true">&gt;</span>0.25 × 0.75 = <strong class="gw-calc__result">0.1875</strong></p>
</div>

¡Genial! Muy bonito, pero… ¿qué tengo que hacer con esto? Pues bien, el objetivo final es encontrar la pregunta cuya varianza es máxima.

A continuación, os dejo una tabla con una lista de preguntas que se pueden hacer en el primer turno, sus probabilidades de acierto y fallo asociadas y la varianza obtenida:

{% include notes/guess-who/table.html %}

Como habréis observado, la varianza máxima se obtiene si realizamos la pregunta «¿Es mujer?». Esto se debe a que la varianza más alta se obtiene siempre que la probabilidad de acertar es igual a la probabilidad de fallar, ya que el riesgo de quedarnos con más cartas de las necesarias en el tablero es nulo.

<figure data-gw="curve">
{% include notes/guess-who/curve.svg %}
<figcaption>La varianza p × (1 − p) de cada pregunta del primer turno. Todas quedan por debajo de la cima, donde solo llega «¿Es mujer?» (10/20). Hay una forma más de verlo: las cartas que esperas conservar tras una pregunta son exactamente 20 × (1 − 2 × Var). Con «¿Lleva gafas?» esperas quedarte con 12.5; con «¿Es mujer?», con 10, la mitad, respondan lo que respondan.</figcaption>
</figure>

Repitiendo este proceso a lo largo de cada turno, y si la suerte no sonríe a tu rival, es muy probable que ganes la partida. Pruébalo:

{% include notes/guess-who/game.html %}

## Conclusión

<div class="gw-takeaway" data-gw="takeaway">
  <span class="gw-takeaway__badge" aria-hidden="true">★ Lección aprendida</span>
  <p>En definitiva, con este ejemplo, os quería enseñar de una manera práctica y aplicada a un escenario real la utilidad del concepto de varianza de probabilidades.</p>
</div>
