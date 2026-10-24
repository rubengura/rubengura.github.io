---
ref: guess-who
title: "How to win at “Guess Who?” with statistics"
description: The best strategy for finding the character in as few questions as possible, explained with probabilities and variance.
topics: [psychology, learning]
extra_css: /assets/css/notes/guess-who.css
extra_js: /assets/js/notes/guess-who.js
---

{% include notes/guess-who/sprites.svg %}

The other day I was playing “Guess Who?” on the beach, and I started thinking about the best strategy to win in as few questions as possible.

## How the game works

In case anyone's wondering what the game is, it's very simple:

Each player has 20 cards with the faces of different people (as you can see below), plus one card you can't see: the person the other player has to guess. The goal is to guess your opponent's card before they guess yours.

<figure data-gw="board">
{% include notes/guess-who/board.html label="The 20 cards on the board" %}
<figcaption>The 20 cards on the board.</figcaption>
</figure>

Players take turns asking yes-or-no questions about the hidden character, and cards are knocked down depending on the answer. For example, say the person I have to guess is Liz (obviously, I'm not supposed to be able to see that card) and I start by asking whether the person is a man. My opponent will say no, so I can knock down every man on the board.

<figure data-gw="example">
<div class="gw-dialog">
  <p><span class="gw-dialog__who">Me:</span> Is it a man?</p>
  <p><span class="gw-dialog__who">Opponent:</span> No.</p>
</div>
{% include notes/guess-who/board.html label="The board after the question: the men are ruled out" down="men" %}
<figcaption>The cards left after the example question.</figcaption>
</figure>

On the first turn, the chance of guessing the character outright is 1 in 20, so it's not a good idea to just blurt out a name. Instead, the ideal is to rule out as many cards as possible on every turn. But careful: very specific questions can be a great move if you're right, and of very little help if the character doesn't have that feature.

## So what's the best strategy?

To answer that, you'll have to forgive me: I'm going to talk about probability and variance (this is a statistics article, after all).

From the point of view of probability theory, every question we ask during the game has two possible outcomes: yes or no.

The probability of a yes is the number of characters with the feature we're asking about, out of the total. For example, we ask whether the person wears glasses. There are 5 characters with glasses on the board, so the probability of a yes is 5/20, and the probability of a no is 15/20. If we ask this on the first turn and the answer is yes, we cut the options a lot, from 20 to 5. But if the answer is no, as it would be for Liz, we only get down to 15.

<figure data-gw="glasses">
{% include notes/guess-who/board.html label="The 5 characters with glasses, highlighted" mark="glasses" %}
<div class="gw-split">
  <div class="gw-split__bar" aria-hidden="true"><span class="gw-split__yes" style="--share: 5">5</span><span class="gw-split__no" style="--share: 15">15</span></div>
  <p class="gw-split__legend"><span>If yes: 5 cards left</span><span>If no: 15 left</span></p>
</div>
<figcaption>“Do they wear glasses?”: 5 of the 20 characters have that feature.</figcaption>
</figure>

For each question, given its probability of a yes and of a no, we can work out its variance. When we're dealing with probabilities, the variance of a question is the probability of a yes multiplied by the probability of a no.

<p class="gw-formula" data-gw="formula">Var(question) = P(yes) <span class="gw-x">×</span> P(no)</p>

In the example above, asking whether the character wears glasses, the probability of a yes is 5/20 (0.25) and the probability of a no is 15/20 (0.75). The variance is:

<div class="gw-calc" data-gw="calc">
  <p class="gw-calc__line"><span class="gw-calc__prompt" aria-hidden="true">&gt;</span>0.25 × 0.75 = <strong class="gw-calc__result">0.1875</strong></p>
</div>

Great! Very nice, but… what am I supposed to do with it? Well, the goal is to find the question with the highest variance.

Here's a table of questions you could ask on the first turn, with their probabilities of a yes and a no, and their variance:

{% include notes/guess-who/table.html %}

As you can see, the highest variance comes from asking “Is it a woman?”. That's because variance is always highest when the probability of a yes equals the probability of a no: there's no risk of being left with more cards than necessary.

<figure data-gw="curve">
{% include notes/guess-who/curve.svg %}
<figcaption>The variance p × (1 − p) of each first-turn question. They all sit below the peak, which only “Is it a woman?” (10/20) reaches. Another way to see it: the number of cards you can expect to keep after a question is exactly 20 × (1 − 2 × Var). With “Do they wear glasses?” you expect to keep 12.5; with “Is it a woman?”, 10, half the board, whatever the answer.</figcaption>
</figure>

Repeat this on every turn and, unless luck smiles on your opponent, you'll very probably win. Try it:

{% include notes/guess-who/game.html %}

## Conclusion

<div class="gw-takeaway" data-gw="takeaway">
  <span class="gw-takeaway__badge" aria-hidden="true">★ Lesson learned</span>
  <p>With this example, I wanted to show, in a practical way and in a real setting, how useful the variance of probabilities can be.</p>
</div>
