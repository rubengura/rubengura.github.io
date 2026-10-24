---
ref: sql-indexes
title: "Indexes in SQL"
description: Why an index finds a record almost as fast in a table of a hundred rows as in one of a million, explained with a library.
topics: [data-engineering, learning]
extra_css: /assets/css/notes/indexes.css
extra_js: /assets/js/notes/indexes.js
---

Indexes are data structures in SQL that let you retrieve data from a table quickly, however much data it holds.

But why are they so efficient? Rather than talk technicalities and how *Big-O complexity* comes into play… let me explain with the most ordinary of examples.

Imagine you walk into a library to borrow *One Hundred Years of Solitude* by Gabriel García Márquez. It's a tiny library, with barely 100 books.

Unfortunately, the books aren't sorted alphabetically by author, so you have to check them one by one to see if it's there. As there weren't many books, it took you a couple of minutes to find it.

The SQL equivalent would be something like this:

```sql
SELECT *
FROM books
WHERE title = 'One Hundred Years of Solitude'
  AND author = 'Gabriel García Márquez';
```

The `books` table has 100 rows with the titles and authors of the books available. As the rows aren't indexed, the whole table has to be read to find the book (if it's in the table at all).

{% include notes/indexes/scan.html %}

Now, what happens if we walk into a library with more than a million books, and they aren't organised in any way? Well, good luck finding your book…

{% include notes/indexes/million.html %}

This is where indexes play a huge part, and you can probably already see how the library example fits the idea.

Libraries sort their books (besides by subject) alphabetically by author, so you don't have to bother checking them one by one. You just glance along the shelves at the authors' initials (A… C… E… G, it must be around here!) and, once you've found G, then yes, check them one by one.

{% include notes/indexes/sorted.html %}

Whether the library is small, medium-sized or huge, finding the shelf for G will be quick. And yes, it will always take a little longer to find a book in a bigger library than in a small one, but the time it takes is tiny compared with how long you'd spend if you had to look through the WHOLE library.

{% include notes/indexes/race.html %}

So, you see, although technically indexes are a fairly complex concept, the principle behind them is quite simple in practice.
