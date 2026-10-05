# Invisible Cities — an atlas

A three.js atlas of the fifty-five cities Marco Polo describes to Kublai Khan in Italo Calvino’s
*Invisible Cities* (1972). Every city is a procedurally generated miniature diorama standing on
the Khan’s endless chessboard.

```sh
pnpm install
pnpm dev        # http://127.0.0.1:5199
pnpm build      # static site in dist/
```

## What is in it

- **55 dioramas**, one per city, each built in code from a shared kit of porcelain-and-brass
  architecture (`src/cities/<city>.js`, `src/kit.js`). Most are animated.
- **Three layouts** of the board, animated between:
  - *Atlas*: eleven kinds of city in columns, numbered 1–5. The luminous thread on the floor follows the
    order Marco tells them, so you can see the book's braided structure.
  - *Journey*: a spiral in reading order. Venice rises at its centre: “every time I describe a city
    I am saying something about Venice.”
  - *Chapters*: the nine chapters as rows (10, 5, 5, 5, 5, 5, 5, 5, 10).
- **The Khan's garden pavilion** at the head of the board. Click it to read the frame dialogues.
- **Tour mode**: Marco takes you through all 55 cities in order, with the conversations between chapters.
- **Contents**: the book's table of contents as a chapter × kind grid.
- Kind filters, dusk/night lighting, a generative soundscape (drone, wind and Karplus–Strong plucked strings
  in a hijaz mode), tilt-shift, bloom and film grain.

Keys: `←/→` previous/next city, `↑/↓` same kind, `1/2/3` layouts, `T` tour, `C` contents, `N` night,
`M` sound, `H` hide the interface, `Esc` back.

Deep links: `/#octavia` opens a city. `/?solo=octavia&view=side` renders one diorama alone (used by
`scripts/shot.mjs` for screenshots).

## A note on the texts

The city texts and dialogues are paraphrases written for this atlas, not quotations from the
book (except for a few short phrases). Read the book itself (trans. William Weaver, 1974).
