---
redirect_from: /es/notas/interpretar-el-valor-p/
ref: p-value
title: "Interpretar el valor p (p-value) correctamente"
description: Qué significa de verdad el valor p, contado como un juicio en el que el azúcar es el acusado y el valor p hace de juez.
topics: [psychology, learning]
extra_css: /assets/css/notes/p-value.css
extra_js: /assets/js/notes/p-value.js
---

Cuando llevamos a cabo una investigación científica a través de un análisis estadístico inferencial, nos encontramos con que rechazar o no la hipótesis nula depende del valor p (*p-value* en inglés). La interpretación de este valor suele ser errónea y, aunque a efectos prácticos no repercute en la validez del estudio, entender bien su significado ayuda a tener una mejor comprensión y a ser más críticos con los resultados obtenidos.

Normalmente el valor p se interpreta como:

<div class="pv-defs" data-pv="defs">
  <div class="pv-def pv-def--wrong">
    <p class="pv-def__label"><span class="pv-def__mark" aria-hidden="true">✗</span> Definición incorrecta</p>
    <p class="pv-def__text">La probabilidad de que la hipótesis nula sea cierta, de manera que valores p inferiores a 0.05 indicarían que la probabilidad de encontrarnos ante la hipótesis nula es inferior al 5%.</p>
  </div>
  <div class="pv-def pv-def--right">
    <p class="pv-def__label"><span class="pv-def__mark" aria-hidden="true">✓</span> Definición correcta</p>
    <p class="pv-def__text">La probabilidad de obtener un resultado de la prueba estadística utilizada (por ejemplo, una comparación de medias a través de una prueba t) igual o más extremo que el observado, <strong>suponiendo que la hipótesis nula es cierta</strong>.</p>
  </div>
</div>

Esta definición es demasiado abstracta y en menos de 1 minuto la habrás olvidado y seguirás teniendo la definición incorrecta en tu cabeza, así que vamos a poner un ejemplo que ayude a entender qué hace el valor p.

## El juicio

Imaginemos que una investigación es un proceso judicial con el siguiente escenario:

<div class="pv-window" data-pv="cast">
  <div class="pv-window__bar" aria-hidden="true"><span></span><span></span><span></span><span class="pv-window__title">juicio.exe</span></div>
  <ul class="pv-cast">
    <li class="pv-cast__item"><span class="pv-sprite" data-sprite="scale" aria-hidden="true"></span><span class="pv-cast__role">El caso</span><span class="pv-cast__text">Un investigador quiere demostrar que el azúcar afecta al IMC (Índice de Masa Corporal).</span></li>
    <li class="pv-cast__item"><span class="pv-sprites"><span class="pv-sprite" data-sprite="researcher" aria-hidden="true"></span><span class="pv-sprite" data-sprite="sugar" aria-hidden="true"></span></span><span class="pv-cast__role">Las partes</span><span class="pv-cast__text">El investigador actúa como denunciante y el objeto de estudio, el azúcar, como demandado.</span></li>
    <li class="pv-cast__item"><span class="pv-sprite" data-sprite="evidence" aria-hidden="true"></span><span class="pv-cast__role">Las pruebas</span><span class="pv-cast__text">El estudio que el investigador realiza compone las evidencias que se presentan al juez.</span></li>
    <li class="pv-cast__item"><span class="pv-sprite" data-sprite="judge" aria-hidden="true"></span><span class="pv-cast__role">El juez</span><span class="pv-cast__text">El juez es el valor p.</span></li>
  </ul>
</div>

El juez, al iniciar el juicio, pregunta al acusado, el azúcar, cómo se declara. Este, obviamente, se declara inocente.

<div class="pv-dialog" data-pv="dialog">
  <p class="pv-dialog__line"><span class="pv-sprite pv-sprite--small" data-sprite="judge" aria-hidden="true"></span><span class="pv-dialog__who">Juez</span><span class="pv-dialog__say">¿Cómo se declara el acusado?</span></p>
  <p class="pv-dialog__line"><span class="pv-sprite pv-sprite--small" data-sprite="sugar" aria-hidden="true"></span><span class="pv-dialog__who">Azúcar</span><span class="pv-dialog__say">Inocente, señoría.</span></p>
</div>

Teniendo en cuenta que solo puede haber dos sentencias (inocente o culpable) y que estas se corresponden, respectivamente, con la hipótesis nula y la hipótesis alternativa, el ejemplo nos indica que en una investigación siempre partimos de la hipótesis nula, es decir, en nuestro contexto, que el azúcar no afecta al Índice de Masa Corporal.

<div class="pv-verdicts" data-pv="verdicts">
  <div class="pv-verdict pv-verdict--null">
    <span class="pv-verdict__start" aria-hidden="true">▶ inicio</span>
    <span class="pv-verdict__tag">H<sub>0</sub></span>
    <strong class="pv-verdict__name">Inocente</strong>
    <span class="pv-verdict__text">El azúcar no afecta al IMC. Es el punto de partida.</span>
  </div>
  <div class="pv-verdict pv-verdict--alt">
    <span class="pv-verdict__tag">H<sub>1</sub></span>
    <strong class="pv-verdict__name">Culpable</strong>
    <span class="pv-verdict__text">El azúcar afecta al IMC. Hay que demostrarlo.</span>
  </div>
</div>

El investigador recopila información sobre el IMC de 586 personas divididas en dos grupos: 286 sujetos que no consumen azúcar frente a 300 que sí lo hacen. Los resultados muestran que el valor medio de IMC del grupo de sujetos que no consumen azúcar es de 22.4, frente al 30.1 de los sujetos que sí consumen azúcar.

<figure class="pv-groups" data-pv="groups">
  <div class="pv-group pv-group--none">
    <p class="pv-group__name">No consumen azúcar</p>
    <div class="pv-dots" data-n="286" aria-hidden="true"></div>
    <p class="pv-group__stat"><span class="pv-count" data-to="286">286</span> personas</p>
    <p class="pv-group__mean">IMC medio <strong class="pv-count" data-to="22.4" data-decimals="1">22.4</strong></p>
    <span class="pv-meter" style="--value: 0.64" aria-hidden="true"></span>
  </div>
  <div class="pv-group pv-group--sugar">
    <p class="pv-group__name">Consumen azúcar</p>
    <div class="pv-dots" data-n="300" aria-hidden="true"></div>
    <p class="pv-group__stat"><span class="pv-count" data-to="300">300</span> personas</p>
    <p class="pv-group__mean">IMC medio <strong class="pv-count" data-to="30.1" data-decimals="1">30.1</strong></p>
    <span class="pv-meter" style="--value: 0.86" aria-hidden="true"></span>
  </div>
  <figcaption>Cada punto es una persona. Las barras comparan el IMC medio de cada grupo en una escala de 0 a 35.</figcaption>
</figure>

Sin embargo, para el juez esta diferencia en el valor de IMC no es suficiente para declarar que el azúcar podría ser el culpable. Es necesario presentar más evidencias. Aún existe la posibilidad de que esta diferencia de medias se deba al azar. Es decir, podría ser que en realidad el valor del IMC de los participantes consumidores de azúcar sea estadísticamente igual al de los sujetos que no consumen azúcar. De esta manera, la diferencia encontrada, supuestamente, por la presencia del azúcar se debería en realidad a la mala suerte o, mejor dicho, a la casualidad.

En resumen, seguimos ante la hipótesis de que la media obtenida por cada grupo no se debe a la presencia del azúcar (hipótesis nula).

Así que el investigador también presenta la distribución del IMC en cada grupo de sujetos. El siguiente histograma muestra dicha distribución:

<figure class="pv-figure" data-pv="hist">
{% include notes/p-value/histogram.svg %}
<figcaption>Histograma de la distribución del IMC para cada grupo de sujetos (en <span class="pv-key pv-key--none">azul</span> los participantes no consumidores de azúcar y en <span class="pv-key pv-key--sugar">magenta</span> los consumidores). Datos simulados con fines ilustrativos.</figcaption>
</figure>

Y además, conjuntamente con la distribución, el investigador presenta una prueba estadística: la prueba t. Sin entrar en detalles matemáticos, esta prueba compara las medias de cada grupo teniendo en cuenta también la desviación estándar.

El juez, tras examinar el resultado de la prueba estadística, concluye que, si el azúcar fuera inocente (si ambos grupos tuvieran de media el mismo IMC), sería muy improbable (menos de un 5% de probabilidad) encontrar una diferencia como la observada o mayor. Por eso el juez, finalmente, dictamina que el azúcar es culpable de las diferencias en los valores del IMC de cada grupo (es decir, rechazamos la hipótesis nula en favor de la hipótesis alternativa).

{% include notes/p-value/court.html %}

Hay que tener en cuenta que, aunque la probabilidad sea muy baja, no es nula. Y es que, tal y como podría ocurrir en un juicio real, que el juez considere que hay suficientes evidencias para culpabilizar al azúcar de las diferencias de IMC de los sujetos no implica que en realidad el azúcar sea el verdadero culpable de este efecto. El juez tiene el deber de juzgar, pero no posee la verdad absoluta. Para nuestro ejemplo podría existir otra variable, otro culpable, que no se ha tenido en cuenta en el juicio.

{% include notes/p-value/trials.html %}

A modo de conclusión, y teniendo en cuenta la correcta definición del valor p y el ejemplo presentado, me gustaría que os quedarais con los dos siguientes puntos:

<ol class="pv-takeaways" data-pv="takeaways">
  <li class="pv-takeaway"><span class="pv-takeaway__badge" aria-hidden="true">★ Lección 1</span><p><strong>El culpable, la mayoría de veces, se declara inocente:</strong> es decir, partimos de la hipótesis nula.</p></li>
  <li class="pv-takeaway"><span class="pv-takeaway__badge" aria-hidden="true">★ Lección 2</span><p><strong>Incluso cuando el valor p nos indica que debemos rechazar la hipótesis nula, NO significa que la hipótesis alternativa sea cierta.</strong> Los jueces también se pueden equivocar.</p></li>
</ol>
