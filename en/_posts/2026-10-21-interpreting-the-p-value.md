---
redirect_from: /notes/interpreting-the-p-value/
ref: p-value
title: "Interpreting the p-value correctly"
description: What the p-value really means, told as a trial in which sugar is the defendant and the p-value is the judge.
topics: [psychology, learning]
extra_css: /assets/css/notes/p-value.css
extra_js: /assets/js/notes/p-value.js
---

When we carry out scientific research through inferential statistics, whether or not we reject the null hypothesis depends on the p-value. This value is often misread and, although in practice that doesn't affect the validity of a study, understanding what it means helps us understand our results better and be more critical of them.

The p-value is usually read as:

<div class="pv-defs" data-pv="defs">
  <div class="pv-def pv-def--wrong">
    <p class="pv-def__label"><span class="pv-def__mark" aria-hidden="true">✗</span> Wrong definition</p>
    <p class="pv-def__text">The probability that the null hypothesis is true, so a p-value below 0.05 would mean there's less than a 5% chance that the null hypothesis holds.</p>
  </div>
  <div class="pv-def pv-def--right">
    <p class="pv-def__label"><span class="pv-def__mark" aria-hidden="true">✓</span> Right definition</p>
    <p class="pv-def__text">The probability of getting a result from the statistical test (for example, comparing means with a t-test) as extreme as the one observed, or more, <strong>assuming the null hypothesis is true</strong>.</p>
  </div>
</div>

That definition is too abstract. Within a minute you'll have forgotten it and the wrong one will still be in your head, so let's use an example of what the p-value actually does.

## The trial

Imagine that a piece of research is a court case, set up like this:

<div class="pv-window" data-pv="cast">
  <div class="pv-window__bar" aria-hidden="true"><span></span><span></span><span></span><span class="pv-window__title">trial.exe</span></div>
  <ul class="pv-cast">
    <li class="pv-cast__item"><span class="pv-sprite" data-sprite="scale" aria-hidden="true"></span><span class="pv-cast__role">The case</span><span class="pv-cast__text">A researcher wants to show that sugar affects BMI (body mass index).</span></li>
    <li class="pv-cast__item"><span class="pv-sprites"><span class="pv-sprite" data-sprite="researcher" aria-hidden="true"></span><span class="pv-sprite" data-sprite="sugar" aria-hidden="true"></span></span><span class="pv-cast__role">The parties</span><span class="pv-cast__text">The researcher is the prosecution, and the object of study, sugar, is the defendant.</span></li>
    <li class="pv-cast__item"><span class="pv-sprite" data-sprite="evidence" aria-hidden="true"></span><span class="pv-cast__role">The evidence</span><span class="pv-cast__text">The study the researcher carries out is the evidence put before the judge.</span></li>
    <li class="pv-cast__item"><span class="pv-sprite" data-sprite="judge" aria-hidden="true"></span><span class="pv-cast__role">The judge</span><span class="pv-cast__text">The judge is the p-value.</span></li>
  </ul>
</div>

When the trial opens, the judge asks the defendant, sugar, how it pleads. Naturally, it pleads not guilty.

<div class="pv-dialog" data-pv="dialog">
  <p class="pv-dialog__line"><span class="pv-sprite pv-sprite--small" data-sprite="judge" aria-hidden="true"></span><span class="pv-dialog__who">Judge</span><span class="pv-dialog__say">How does the defendant plead?</span></p>
  <p class="pv-dialog__line"><span class="pv-sprite pv-sprite--small" data-sprite="sugar" aria-hidden="true"></span><span class="pv-dialog__who">Sugar</span><span class="pv-dialog__say">Not guilty, your honour.</span></p>
</div>

There can only be two verdicts, not guilty or guilty, and they match the null and the alternative hypothesis respectively. So the example tells us that research always starts from the null hypothesis: here, that sugar has no effect on body mass index.

<div class="pv-verdicts" data-pv="verdicts">
  <div class="pv-verdict pv-verdict--null">
    <span class="pv-verdict__start" aria-hidden="true">▶ start</span>
    <span class="pv-verdict__tag">H<sub>0</sub></span>
    <strong class="pv-verdict__name">Not guilty</strong>
    <span class="pv-verdict__text">Sugar doesn't affect BMI. This is where we start.</span>
  </div>
  <div class="pv-verdict pv-verdict--alt">
    <span class="pv-verdict__tag">H<sub>1</sub></span>
    <strong class="pv-verdict__name">Guilty</strong>
    <span class="pv-verdict__text">Sugar affects BMI. This has to be shown.</span>
  </div>
</div>

The researcher collects the BMI of 586 people in two groups: 286 who don't eat sugar and 300 who do. The mean BMI of the group that doesn't eat sugar is 22.4, against 30.1 for the group that does.

<figure class="pv-groups" data-pv="groups">
  <div class="pv-group pv-group--none">
    <p class="pv-group__name">Don't eat sugar</p>
    <div class="pv-dots" data-n="286" aria-hidden="true"></div>
    <p class="pv-group__stat"><span class="pv-count" data-to="286">286</span> people</p>
    <p class="pv-group__mean">Mean BMI <strong class="pv-count" data-to="22.4" data-decimals="1">22.4</strong></p>
    <span class="pv-meter" style="--value: 0.64" aria-hidden="true"></span>
  </div>
  <div class="pv-group pv-group--sugar">
    <p class="pv-group__name">Eat sugar</p>
    <div class="pv-dots" data-n="300" aria-hidden="true"></div>
    <p class="pv-group__stat"><span class="pv-count" data-to="300">300</span> people</p>
    <p class="pv-group__mean">Mean BMI <strong class="pv-count" data-to="30.1" data-decimals="1">30.1</strong></p>
    <span class="pv-meter" style="--value: 0.86" aria-hidden="true"></span>
  </div>
  <figcaption>Each dot is a person. The bars compare each group's mean BMI on a scale from 0 to 35.</figcaption>
</figure>

For the judge, though, this difference in BMI isn't enough to declare sugar guilty. More evidence is needed. The difference in means could still be down to chance. In other words, the BMI of the people who eat sugar might really be statistically the same as that of the people who don't, and the difference we put down to sugar would then be bad luck or, more precisely, chance.

In short, we're still working with the hypothesis that each group's mean has nothing to do with sugar (the null hypothesis).

So the researcher also presents the distribution of BMI in each group. The histogram below shows it:

<figure class="pv-figure" data-pv="hist">
{% include notes/p-value/histogram.svg %}
<figcaption>Histogram of BMI in each group (people who don't eat sugar in <span class="pv-key pv-key--none">cyan</span>, people who do in <span class="pv-key pv-key--sugar">magenta</span>). Simulated data, for illustration.</figcaption>
</figure>

Along with the distribution, the researcher presents a statistical test: the t-test. Without going into the maths, it compares the means of the two groups, taking their standard deviations into account.

After examining the result of the test, the judge concludes that, if sugar were innocent (if both groups had the same mean BMI), a difference as large as the one observed, or larger, would be very unlikely (less than a 5% chance). So the judge rules that sugar is guilty of the differences in BMI between the groups (that is, we reject the null hypothesis in favour of the alternative).

{% include notes/p-value/court.html %}

Bear in mind that a very low probability is still not zero. Just as in a real trial, the judge finding enough evidence to blame sugar for the difference in BMI doesn't mean sugar really is the culprit. The judge's job is to judge, not to know the absolute truth. In our example there could be another variable, another culprit, that never came up at the trial.

{% include notes/p-value/trials.html %}

To sum up, with the right definition of the p-value and this example in mind, these are the two points I'd like you to keep:

<ol class="pv-takeaways" data-pv="takeaways">
  <li class="pv-takeaway"><span class="pv-takeaway__badge" aria-hidden="true">★ Lesson 1</span><p><strong>The culprit nearly always pleads not guilty:</strong> that is, we start from the null hypothesis.</p></li>
  <li class="pv-takeaway"><span class="pv-takeaway__badge" aria-hidden="true">★ Lesson 2</span><p><strong>Even when the p-value tells us to reject the null hypothesis, that does NOT mean the alternative hypothesis is true.</strong> Judges can get it wrong too.</p></li>
</ol>
