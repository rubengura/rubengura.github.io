---
# Copy this file to _posts/YYYY-MM-DD-short-title.md
# The URL will be /notes/short-title/ (taken from the file name, without the date).
# Spanish version: es/_posts/YYYY-MM-DD-titulo-corto.md → /es/notas/titulo-corto/

title: "Title in sentence case"
ref: short-title                # same value in the translation; links the two versions
description: One or two sentences. Shown in lists, search results, link previews and the RSS feed.
topics: [data-engineering]     # ids from _data/topics.yml
# updated: 2026-11-02          # add when you revise a published note
# draft: true                  # shows a "Draft" label and asks search engines not to index it
# notice: Custom text for the draft notice.
related:                       # optional; delete if unused
  - title: "Something related"
    url: /lab/project-name/    # internal links start with /, external ones with https://
---

Opening paragraph. Say what the note is about and why it matters, without a preamble.

## A section heading

Body text. Markdown works as usual: **bold**, *italic*, `inline code`, [links](https://example.com), lists and tables.

```python
# Code blocks get syntax highlighting when you name the language.
print("hello")
```

<figure>
  <img src="/assets/img/notes/short-title/figure.png" alt="Describe what the image shows, not that it is an image.">
  <figcaption>Optional caption.</figcaption>
</figure>

A sentence with a footnote.[^1]

[^1]: Footnotes are collected at the end of the note.
