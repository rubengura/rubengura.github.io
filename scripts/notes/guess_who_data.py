#!/usr/bin/env python3
"""Characters, questions and figures for the note on "Guess Who?" and variance.

The note needs a board of 20 characters that matches its text: 10 women
(so "Is it a woman?" is the only question with the maximum variance, 0.25),
5 with glasses, and Liz, a woman without glasses. Every character has a
unique combination of features, so any game can be solved.

This script is the single source for all of it, and writes:

  _data/guess_who.yml                       characters, questions, strategy stats
  _includes/notes/guess-who/sprites.svg     one pixel-art <symbol> per character
  _includes/notes/guess-who/board.html      the board (used several times)
  _includes/notes/guess-who/curve.svg       variance curve with each question on it

    python3 scripts/notes/guess_who_data.py

Standard library only.
"""

from __future__ import annotations

from pathlib import Path
from statistics import mean

ROOT = Path(__file__).resolve().parent.parent.parent
OUT = ROOT / "_includes/notes/guess-who"

# name, woman, hair (blond|dark|red|white|bald), long hair, glasses, hat, beard, earrings, shirt (1-4)
CHARACTERS = [
    ("Liz",    1, "red",   1, 0, 0, 0, 1, 1),
    ("Hugo",   0, "dark",  0, 0, 0, 1, 0, 2),
    ("Ana",    1, "blond", 1, 1, 0, 0, 0, 3),
    ("Leo",    0, "blond", 0, 1, 0, 0, 0, 4),
    ("Marta",  1, "dark",  1, 0, 1, 0, 0, 2),
    ("Pablo",  0, "bald",  0, 0, 0, 1, 0, 1),
    ("Sofía",  1, "dark",  0, 0, 0, 0, 1, 4),
    ("Mario",  0, "dark",  0, 0, 1, 0, 0, 3),
    ("Lucía",  1, "white", 1, 1, 0, 0, 0, 1),
    ("Diego",  0, "red",   0, 0, 0, 0, 0, 2),
    ("Carmen", 1, "dark",  1, 0, 0, 0, 1, 3),
    ("Jorge",  0, "white", 0, 0, 0, 1, 0, 4),
    ("Elena",  1, "blond", 0, 0, 1, 0, 0, 1),
    ("Álex",   0, "blond", 0, 0, 1, 0, 0, 2),
    ("Paula",  1, "blond", 1, 0, 0, 0, 0, 4),
    ("Tomás",  0, "bald",  0, 1, 0, 0, 0, 3),
    ("Irene",  1, "red",   1, 1, 0, 0, 0, 2),
    ("Raúl",   0, "dark",  0, 0, 0, 0, 0, 1),
    ("Noa",    1, "dark",  0, 0, 0, 0, 0, 3),
    ("Iván",   0, "white", 0, 0, 0, 0, 0, 4),
]

# key, test, Spanish, English
QUESTIONS = [
    ("woman",    lambda c: c["woman"],           "¿Es mujer?",                 "Is it a woman?"),
    ("dark",     lambda c: c["hair"] == "dark",  "¿Tiene el pelo moreno?",     "Do they have dark hair?"),
    ("long",     lambda c: c["long"],            "¿Tiene el pelo largo?",      "Do they have long hair?"),
    ("blond",    lambda c: c["hair"] == "blond", "¿Tiene el pelo rubio?",      "Do they have blond hair?"),
    ("glasses",  lambda c: c["glasses"],         "¿Lleva gafas?",              "Do they wear glasses?"),
    ("hat",      lambda c: c["hat"],             "¿Lleva sombrero?",           "Do they wear a hat?"),
    ("red",      lambda c: c["hair"] == "red",   "¿Es pelirrojo o pelirroja?", "Do they have red hair?"),
    ("white",    lambda c: c["hair"] == "white", "¿Tiene el pelo blanco?",     "Do they have white hair?"),
    ("beard",    lambda c: c["beard"],           "¿Tiene barba?",              "Do they have a beard?"),
    ("earrings", lambda c: c["earrings"],        "¿Lleva pendientes?",         "Do they wear earrings?"),
    ("bald",     lambda c: c["hair"] == "bald",  "¿Es calvo o calva?",         "Are they bald?"),
]


def characters() -> list[dict]:
    keys = ("name", "woman", "hair", "long", "glasses", "hat", "beard", "earrings", "shirt")
    out = []
    for row in CHARACTERS:
        c = dict(zip(keys, row))
        c["id"] = (c["name"].lower().replace("í", "i").replace("á", "a").replace("ú", "u"))
        out.append(c)
    return out


def check(chars: list[dict]) -> None:
    """The board must match the text of the note."""
    assert len(chars) == 20
    assert sum(c["woman"] for c in chars) == 10
    assert sum(c["glasses"] for c in chars) == 5
    liz = next(c for c in chars if c["name"] == "Liz")
    assert liz["woman"] and not liz["glasses"]
    signatures = {tuple(int(bool(test(c))) for _, test, _, _ in QUESTIONS) for c in chars}
    assert len(signatures) == 20, "two characters can't be told apart"


def variance(yes: int, n: int) -> float:
    p = yes / n
    return p * (1 - p)


def play(secret: dict, chars: list[dict], choose) -> int:
    """Questions needed to identify `secret`, picking questions with `choose`."""
    left = chars
    asked = 0
    while len(left) > 1:
        useful = [q for q in QUESTIONS if 0 < sum(bool(q[1](c)) for c in left) < len(left)]
        q = choose(useful, left)
        answer = bool(q[1](secret))
        left = [c for c in left if bool(q[1](c)) == answer]
        asked += 1
    return asked


def by_variance(useful, left):
    return max(useful, key=lambda q: variance(sum(bool(q[1](c)) for c in left), len(left)))


def most_specific(useful, left):
    return min(useful, key=lambda q: sum(bool(q[1](c)) for c in left))


# Sprites --------------------------------------------------------------------

def sprite(c: dict) -> list[list[str | None]]:
    """A 16×16 grid of colour names (None = empty)."""
    g: list[list[str | None]] = [[None] * 16 for _ in range(16)]

    def put(x, y, colour):
        if 0 <= x < 16 and 0 <= y < 16:
            g[y][x] = colour

    hair = None if c["hair"] == "bald" else c["hair"]
    # Shoulders and neck
    for y in range(13, 16):
        for x in range(2, 14):
            put(x, y, f"shirt{c['shirt']}")
    put(7, 12, "skin"); put(8, 12, "skin")
    # Long hair falls behind the face and over the shoulders; women with
    # short hair get a chin-length bob, so they read as women at 16 pixels.
    if hair and c["long"]:
        for y in range(4, 14):
            put(3, y, hair); put(12, y, hair)
        for y in range(9, 14):
            put(2, y, hair); put(13, y, hair)
    elif hair and c["woman"]:
        for y in range(4, 10):
            put(3, y, hair); put(12, y, hair)
    # Face
    for y in range(4, 12):
        for x in range(4, 12):
            put(x, y, "skin")
    put(3, 7, "skin"); put(12, 7, "skin")  # ears
    # Hair on top
    if hair:
        for x in range(5, 11):
            put(x, 2, hair)
        for x in range(4, 12):
            put(x, 3, hair)
        for x in (4, 5, 10, 11):
            put(x, 4, hair)
    else:
        put(3, 6, "white"); put(12, 6, "white")  # a little hair at the sides
    # Eyes and mouth
    put(6, 7, "eye"); put(9, 7, "eye")
    put(7, 10, "mouth"); put(8, 10, "mouth")
    # Beard
    if c["beard"]:
        beard = hair or "dark"
        for x in (4, 11):
            put(x, 9, beard)
        for x in (4, 5, 6, 9, 10, 11):
            put(x, 10, beard)
        for x in range(4, 12):
            put(x, 11, beard)
    # Glasses
    if c["glasses"]:
        for x in (5, 6, 7, 8, 9, 10):
            put(x, 6, "glasses"); put(x, 8, "glasses")
        for x in (5, 7, 8, 10):
            put(x, 7, "glasses")
    # Earrings
    if c["earrings"]:
        put(3, 10, "earring"); put(12, 10, "earring")
    # Hat
    if c["hat"]:
        for y in (0, 1, 2):
            for x in range(5, 11):
                put(x, y, "hat")
        for x in range(3, 13):
            put(x, 3, "hat")
    return g


def symbol(c: dict) -> str:
    rects = []
    for y, row in enumerate(sprite(c)):
        x = 0
        while x < 16:
            colour = row[x]
            w = 1
            while x + w < 16 and row[x + w] == colour:
                w += 1
            if colour:
                rects.append(f'<rect class="gw-px gw-px--{colour}" x="{x}" y="{y}" width="{w}" height="1"/>')
            x += w
    return f'<symbol id="gw-{c["id"]}" viewBox="0 0 16 16">{"".join(rects)}</symbol>'


# Writers ---------------------------------------------------------------------

def write_sprites(chars):
    body = "\n".join(symbol(c) for c in chars)
    (OUT / "sprites.svg").write_text(
        "{%- comment -%} Generated by scripts/notes/guess_who_data.py. Don't edit by hand. {%- endcomment -%}\n"
        '<svg class="gw-sprites" width="0" height="0" aria-hidden="true" focusable="false">\n'
        f"{body}\n</svg>\n",
        encoding="utf-8",
    )


def write_board(chars):
    attrs = lambda c: " ".join(
        f'data-{q[0]}="{int(bool(q[1](c)))}"' for q in QUESTIONS
    )
    cards = []
    for c in chars:
        classes = ['gw-card']
        flags = ""
        if not c["woman"]:
            flags += "{% if include.down == 'men' %} is-down{% endif %}"
        if c["glasses"]:
            flags += "{% if include.mark == 'glasses' %} is-marked{% endif %}"
        down_note = "" if c["woman"] else (
            "{% if include.down == 'men' %}<span class=\"visually-hidden\"> "
            "({% if page.lang == 'es-ES' %}descartado{% else %}ruled out{% endif %})</span>{% endif %}"
        )
        cards.append(
            f'  <li class="{" ".join(classes)}{flags}" data-id="{c["id"]}" {attrs(c)}>'
            f'<span class="gw-card__inner"><span class="gw-card__face">'
            f'<svg class="gw-card__sprite" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><use href="#gw-{c["id"]}"/></svg>'
            f'<span class="gw-card__name">{c["name"]}{down_note}</span></span>'
            f'<span class="gw-card__back" aria-hidden="true"></span></span></li>'
        )
    (OUT / "board.html").write_text(
        "{%- comment -%}\n"
        "  Generated by scripts/notes/guess_who_data.py. Don't edit by hand.\n"
        "  The 20-character board. Params: label (aria-label), down='men' (men face\n"
        "  down), mark='glasses' (highlight glasses). Needs sprites.svg on the page.\n"
        "{%- endcomment -%}\n"
        '<ul class="gw-board" aria-label="{{ include.label }}">\n' + "\n".join(cards) + "\n</ul>\n",
        encoding="utf-8",
    )


def write_curve(questions):
    W, H = 600, 276
    left, right, top, bottom = 48, 20, 40, 40
    pw, ph = W - left - right, H - top - bottom
    sx = lambda p: left + p * pw
    sy = lambda v: top + ph - v / 0.25 * ph
    es, el, end = "{% if page.lang == 'es-ES' %}", "{% else %}", "{% endif %}"

    path = "M" + " L".join(f"{sx(i / 100):.1f},{sy((i / 100) * (1 - i / 100)):.1f}" for i in range(101))
    out = [
        "{%- comment -%} Generated by scripts/notes/guess_who_data.py. Don't edit by hand. {%- endcomment -%}",
        f'<svg class="gw-curve" viewBox="0 0 {W} {H}" role="img" aria-labelledby="gw-curve-title">',
        f'<title id="gw-curve-title">{es}La varianza p × (1 − p) forma una parábola que llega a su máximo, 0.25, cuando p = 0.5. «¿Es mujer?» está justo en la cima; el resto de preguntas quedan por debajo.{el}The variance p × (1 − p) is a parabola that peaks at 0.25 when p = 0.5. “Is it a woman?” sits right at the top; every other question is lower.{end}</title>',
    ]
    for v in (0, 0.05, 0.10, 0.15, 0.20, 0.25):
        y = sy(v)
        out.append(f'<line class="gw-curve__grid" x1="{left}" x2="{W - right}" y1="{y:.1f}" y2="{y:.1f}"/>')
        out.append(f'<text class="gw-curve__tick" x="{left - 8}" y="{y + 4:.1f}" text-anchor="end">{v:.2f}</text>')
    for p in (0, 0.25, 0.5, 0.75, 1):
        out.append(f'<text class="gw-curve__tick" x="{sx(p):.1f}" y="{H - bottom + 18}" text-anchor="middle">{p:g}</text>')
    out.append(f'<text class="gw-curve__axis" x="{left + pw / 2:.1f}" y="{H - 4}" text-anchor="middle">{es}p = probabilidad de que la respuesta sea «sí»{el}p = probability that the answer is “yes”{end}</text>')
    out.append(f'<path class="gw-curve__line" pathLength="1" d="{path}"/>')

    # Questions grouped by p, as points on the curve
    groups: dict[int, list] = {}
    for q in questions:
        groups.setdefault(q["yes"], []).append(q)
    for i, (yes, qs) in enumerate(sorted(groups.items())):
        p = yes / 20
        x, y = sx(p), sy(p * (1 - p))
        best = " gw-curve__point--best" if yes == 10 else ""
        out.append(f'<g class="gw-curve__point{best}" style="--i:{i}">')
        out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{7 if best else 5}"/>')
        label = f"{yes}/20" + (f" ×{len(qs)}" if len(qs) > 1 else "")
        out.append(f'<text x="{x:.1f}" y="{y - 14:.1f}" text-anchor="middle">{label}</text>')
        out.append("</g>")
    out.append("</svg>")
    (OUT / "curve.svg").write_text("\n".join(out) + "\n", encoding="utf-8")


def main() -> None:
    chars = characters()
    check(chars)

    questions = []
    for key, test, es_text, en_text in QUESTIONS:
        yes = sum(bool(test(c)) for c in chars)
        questions.append({"key": key, "es": es_text, "en": en_text, "yes": yes,
                          "p_yes": yes / 20, "p_no": 1 - yes / 20, "var": variance(yes, 20)})
    questions.sort(key=lambda q: -q["var"])
    assert questions[0]["key"] == "woman" and questions[1]["var"] < 0.25

    greedy = [play(c, chars, by_variance) for c in chars]
    specific = [play(c, chars, most_specific) for c in chars]

    lines = ["# Generated by scripts/notes/guess_who_data.py. Don't edit by hand.",
             "# Board and questions for the note on \"Guess Who?\" and variance.", "characters:"]
    for c in chars:
        lines.append(f'  - {{id: {c["id"]}, name: "{c["name"]}"}}')
    lines.append("questions:")
    for q in questions:
        # Numbers as text too: Liquid can't format "0.50" or "0.1875" itself.
        # `n_yes`, not `yes`: YAML reads a key called yes as the boolean true.
        lines.append(f'  - {{key: {q["key"]}, es: "{q["es"]}", en: "{q["en"]}", n_yes: {q["yes"]}, '
                     f'p_yes: "{q["p_yes"]:.2f}", p_no: "{q["p_no"]:.2f}", var: {q["var"]:.4f}, '
                     f'var_text: "{q["var"]:.4f}"}}')
    lines += [
        "strategy:",
        f"  variance: {{mean: {mean(greedy):.1f}, max: {max(greedy)}}}",
        f"  specific: {{mean: {mean(specific):.1f}, max: {max(specific)}}}",
    ]
    (ROOT / "_data/guess_who.yml").write_text("\n".join(lines) + "\n", encoding="utf-8")

    OUT.mkdir(parents=True, exist_ok=True)
    write_sprites(chars)
    write_board(chars)
    write_curve(questions)

    for q in questions:
        print(f'{q["es"]:30} {q["yes"]:2}/20  var {q["var"]:.4f}')
    print(f"variance strategy: mean {mean(greedy):.2f}, max {max(greedy)} questions")
    print(f"most specific first: mean {mean(specific):.2f}, max {max(specific)} questions")


if __name__ == "__main__":
    main()
