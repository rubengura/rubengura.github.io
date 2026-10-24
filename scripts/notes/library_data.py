#!/usr/bin/env python3
"""The library for the note on SQL indexes.

100 real books, with their authors. The note's story: you look for "One
Hundred Years of Solitude" by Gabriel García Márquez, first in an unsorted
library (one book at a time), then in one sorted by the author's surname
(A… C… E… G, then one at a time inside G). This script writes:

  _data/library.yml                        where the book is, the G shelf, the letters
  _includes/notes/indexes/shelf.html       100 book spines, in their unsorted order

    python3 scripts/notes/library_data.py

Standard library only.
"""

from __future__ import annotations

import random
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
OUT = ROOT / "_includes/notes/indexes"
SEED = 1967          # the year Cien años de soledad was published
TARGET_POSITION = 87  # where it sits on the unsorted shelves (1-based)

# Spanish title, English title, author, the author as a library sorts it
BOOKS = [
    ("Cien años de soledad", "One Hundred Years of Solitude", "Gabriel García Márquez", "García Márquez"),
    ("Crónica de una muerte anunciada", "Chronicle of a Death Foretold", "Gabriel García Márquez", "García Márquez"),
    ("Don Quijote de la Mancha", "Don Quixote", "Miguel de Cervantes", "Cervantes"),
    ("La sombra del viento", "The Shadow of the Wind", "Carlos Ruiz Zafón", "Ruiz Zafón"),
    ("Rayuela", "Hopscotch", "Julio Cortázar", "Cortázar"),
    ("Pedro Páramo", "Pedro Páramo", "Juan Rulfo", "Rulfo"),
    ("Ficciones", "Ficciones", "Jorge Luis Borges", "Borges"),
    ("El Aleph", "The Aleph", "Jorge Luis Borges", "Borges"),
    ("La casa de los espíritus", "The House of the Spirits", "Isabel Allende", "Allende"),
    ("La ciudad y los perros", "The Time of the Hero", "Mario Vargas Llosa", "Vargas Llosa"),
    ("Conversación en La Catedral", "Conversation in the Cathedral", "Mario Vargas Llosa", "Vargas Llosa"),
    ("El túnel", "The Tunnel", "Ernesto Sabato", "Sabato"),
    ("Como agua para chocolate", "Like Water for Chocolate", "Laura Esquivel", "Esquivel"),
    ("Nada", "Nada", "Carmen Laforet", "Laforet"),
    ("La colmena", "The Hive", "Camilo José Cela", "Cela"),
    ("Tiempo de silencio", "Time of Silence", "Luis Martín-Santos", "Martín-Santos"),
    ("Los santos inocentes", "The Holy Innocents", "Miguel Delibes", "Delibes"),
    ("El camino", "The Path", "Miguel Delibes", "Delibes"),
    ("La Regenta", "La Regenta", "Leopoldo Alas «Clarín»", "Alas"),
    ("Fortunata y Jacinta", "Fortunata and Jacinta", "Benito Pérez Galdós", "Pérez Galdós"),
    ("Marianela", "Marianela", "Benito Pérez Galdós", "Pérez Galdós"),
    ("El árbol de la ciencia", "The Tree of Knowledge", "Pío Baroja", "Baroja"),
    ("Niebla", "Mist", "Miguel de Unamuno", "Unamuno"),
    ("Luces de bohemia", "Bohemian Lights", "Ramón del Valle-Inclán", "Valle-Inclán"),
    ("La casa de Bernarda Alba", "The House of Bernarda Alba", "Federico García Lorca", "García Lorca"),
    ("Platero y yo", "Platero and I", "Juan Ramón Jiménez", "Jiménez"),
    ("La vida es sueño", "Life Is a Dream", "Pedro Calderón de la Barca", "Calderón de la Barca"),
    ("Lazarillo de Tormes", "Lazarillo de Tormes", "Anónimo", "Anónimo"),
    ("Los detectives salvajes", "The Savage Detectives", "Roberto Bolaño", "Bolaño"),
    ("2666", "2666", "Roberto Bolaño", "Bolaño"),
    ("La tregua", "The Truce", "Mario Benedetti", "Benedetti"),
    ("Patria", "Homeland", "Fernando Aramburu", "Aramburu"),
    ("Corazón tan blanco", "A Heart So White", "Javier Marías", "Marías"),
    ("Soldados de Salamina", "Soldiers of Salamis", "Javier Cercas", "Cercas"),
    ("La plaza del Diamante", "In Diamond Square", "Mercè Rodoreda", "Rodoreda"),
    ("Réquiem por un campesino español", "Requiem for a Spanish Peasant", "Ramón J. Sender", "Sender"),
    ("El mundo de Sofía", "Sophie's World", "Jostein Gaarder", "Gaarder"),
    ("Hamlet", "Hamlet", "William Shakespeare", "Shakespeare"),
    ("Orgullo y prejuicio", "Pride and Prejudice", "Jane Austen", "Austen"),
    ("Cumbres borrascosas", "Wuthering Heights", "Emily Brontë", "Brontë, Emily"),
    ("Jane Eyre", "Jane Eyre", "Charlotte Brontë", "Brontë, Charlotte"),
    ("Moby Dick", "Moby-Dick", "Herman Melville", "Melville"),
    ("Crimen y castigo", "Crime and Punishment", "Fiódor Dostoievski", "Dostoievski"),
    ("Guerra y paz", "War and Peace", "León Tolstói", "Tolstói"),
    ("Anna Karénina", "Anna Karenina", "León Tolstói", "Tolstói"),
    ("Madame Bovary", "Madame Bovary", "Gustave Flaubert", "Flaubert"),
    ("Los miserables", "Les Misérables", "Victor Hugo", "Hugo"),
    ("El conde de Montecristo", "The Count of Monte Cristo", "Alejandro Dumas", "Dumas"),
    ("Frankenstein", "Frankenstein", "Mary Shelley", "Shelley"),
    ("Drácula", "Dracula", "Bram Stoker", "Stoker"),
    ("1984", "Nineteen Eighty-Four", "George Orwell", "Orwell"),
    ("Rebelión en la granja", "Animal Farm", "George Orwell", "Orwell"),
    ("Un mundo feliz", "Brave New World", "Aldous Huxley", "Huxley"),
    ("Fahrenheit 451", "Fahrenheit 451", "Ray Bradbury", "Bradbury"),
    ("Crónicas marcianas", "The Martian Chronicles", "Ray Bradbury", "Bradbury"),
    ("Dune", "Dune", "Frank Herbert", "Herbert"),
    ("Fundación", "Foundation", "Isaac Asimov", "Asimov"),
    ("Yo, robot", "I, Robot", "Isaac Asimov", "Asimov"),
    ("¿Sueñan los androides con ovejas eléctricas?", "Do Androids Dream of Electric Sheep?", "Philip K. Dick", "Dick"),
    ("Neuromante", "Neuromancer", "William Gibson", "Gibson"),
    ("La mano izquierda de la oscuridad", "The Left Hand of Darkness", "Ursula K. Le Guin", "Le Guin"),
    ("Solaris", "Solaris", "Stanisław Lem", "Lem"),
    ("El señor de los anillos", "The Lord of the Rings", "J. R. R. Tolkien", "Tolkien"),
    ("El hobbit", "The Hobbit", "J. R. R. Tolkien", "Tolkien"),
    ("Matar a un ruiseñor", "To Kill a Mockingbird", "Harper Lee", "Lee"),
    ("El gran Gatsby", "The Great Gatsby", "F. Scott Fitzgerald", "Fitzgerald"),
    ("Las uvas de la ira", "The Grapes of Wrath", "John Steinbeck", "Steinbeck"),
    ("El viejo y el mar", "The Old Man and the Sea", "Ernest Hemingway", "Hemingway"),
    ("Ulises", "Ulysses", "James Joyce", "Joyce"),
    ("La señora Dalloway", "Mrs Dalloway", "Virginia Woolf", "Woolf"),
    ("En busca del tiempo perdido", "In Search of Lost Time", "Marcel Proust", "Proust"),
    ("La metamorfosis", "The Metamorphosis", "Franz Kafka", "Kafka"),
    ("El proceso", "The Trial", "Franz Kafka", "Kafka"),
    ("El extranjero", "The Stranger", "Albert Camus", "Camus"),
    ("La peste", "The Plague", "Albert Camus", "Camus"),
    ("El principito", "The Little Prince", "Antoine de Saint-Exupéry", "Saint-Exupéry"),
    ("Lolita", "Lolita", "Vladimir Nabokov", "Nabokov"),
    ("El nombre de la rosa", "The Name of the Rose", "Umberto Eco", "Eco"),
    ("Si una noche de invierno un viajero", "If on a Winter's Night a Traveler", "Italo Calvino", "Calvino"),
    ("Ensayo sobre la ceguera", "Blindness", "José Saramago", "Saramago"),
    ("El tambor de hojalata", "The Tin Drum", "Günter Grass", "Grass"),
    ("El perfume", "Perfume", "Patrick Süskind", "Süskind"),
    ("La insoportable levedad del ser", "The Unbearable Lightness of Being", "Milan Kundera", "Kundera"),
    ("Tokio blues", "Norwegian Wood", "Haruki Murakami", "Murakami"),
    ("Beloved", "Beloved", "Toni Morrison", "Morrison"),
    ("El señor de las moscas", "Lord of the Flies", "William Golding", "Golding"),
    ("Fausto", "Faust", "Johann Wolfgang von Goethe", "Goethe"),
    ("Almas muertas", "Dead Souls", "Nikolái Gógol", "Gógol"),
    ("Las venas abiertas de América Latina", "Open Veins of Latin America", "Eduardo Galeano", "Galeano"),
    ("American Gods", "American Gods", "Neil Gaiman", "Gaiman"),
    ("El poder y la gloria", "The Power and the Glory", "Graham Greene", "Greene"),
    ("La isla del tesoro", "Treasure Island", "Robert Louis Stevenson", "Stevenson"),
    ("Robinson Crusoe", "Robinson Crusoe", "Daniel Defoe", "Defoe"),
    ("Los viajes de Gulliver", "Gulliver's Travels", "Jonathan Swift", "Swift"),
    ("Alicia en el país de las maravillas", "Alice's Adventures in Wonderland", "Lewis Carroll", "Carroll"),
    ("Mujercitas", "Little Women", "Louisa May Alcott", "Alcott"),
    ("Grandes esperanzas", "Great Expectations", "Charles Dickens", "Dickens"),
    ("La Odisea", "The Odyssey", "Homero", "Homero"),
    ("La Divina Comedia", "The Divine Comedy", "Dante Alighieri", "Alighieri"),
    ("Las ciudades invisibles", "Invisible Cities", "Italo Calvino", "Calvino"),
]

# Book-cloth colours for the spines (classes .ix-c0 … .ix-c7 in the CSS)
COLOURS = 8


def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace('"', "&quot;").replace("<", "&lt;")


def fold(s: str) -> str:
    """Sort key that ignores accents, like a library catalogue."""
    table = str.maketrans("ÁÉÍÓÚÜÑáéíóúüñöëł", "AEIOUUNaeiouunoel")
    return s.translate(table).lower()


def main() -> None:
    assert len(BOOKS) == 100, f"expected 100 books, found {len(BOOKS)}"
    target = BOOKS[0]
    rng = random.Random(SEED)
    others = BOOKS[1:]
    rng.shuffle(others)
    shelf = others[:TARGET_POSITION - 1] + [target] + others[TARGET_POSITION - 1:]
    assert shelf.index(target) == TARGET_POSITION - 1

    # The spines, four shelves of 25
    es, el, end = "{% if page.lang == 'es-ES' %}", "{% else %}", "{% endif %}"
    out = ["{%- comment -%} Generated by scripts/notes/library_data.py. Don't edit by hand. {%- endcomment -%}",
           '<div class="ix-shelves" aria-hidden="true">']
    for row in range(4):
        out.append('<div class="ix-shelf">')
        for i in range(row * 25, row * 25 + 25):
            t_es, t_en, author, _ = shelf[i]
            height = rng.randint(72, 100)
            colour = rng.randrange(COLOURS)
            mark = ' data-target="1"' if shelf[i] is target else ""
            out.append(f'<span class="ix-spine ix-c{colour}" style="--h: {height}%" data-i="{i + 1}"{mark} '
                       f'title="{es}{esc(t_es)}{el}{esc(t_en)}{end} · {esc(author)}"></span>')
        out.append("</div>")
    out.append("</div>")
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "shelf.html").write_text("\n".join(out) + "\n", encoding="utf-8")

    # The same library sorted by surname: its letters, and the G shelf
    by_author = sorted(BOOKS, key=lambda b: (fold(b[3]), fold(b[0])))
    letters = sorted({fold(b[3])[0].upper() for b in BOOKS})
    g_shelf = [b for b in by_author if fold(b[3]).startswith("g")]
    looks_in_g = g_shelf.index(target) + 1

    lines = ["# Generated by scripts/notes/library_data.py. Don't edit by hand.",
             f"books: {len(BOOKS)}", f"target_position: {TARGET_POSITION}",
             "letters: [" + ", ".join(letters) + "]",
             f"looks_in_g: {looks_in_g}", "g_shelf:"]
    for t_es, t_en, author, _ in g_shelf:
        lines.append(f'  - {{es: "{t_es}", en: "{t_en}", author: "{author}", target: {str((t_es, t_en, author, _) == target).lower()}}}')
    (ROOT / "_data/library.yml").write_text("\n".join(lines) + "\n", encoding="utf-8")

    print(f"target at {TARGET_POSITION} of {len(BOOKS)}; letters {''.join(letters)}; "
          f"G shelf {len(g_shelf)} books, target is #{looks_in_g}: {[b[3] for b in g_shelf]}")


if __name__ == "__main__":
    main()
