# Brief for city builders

You are building procedural 3D dioramas for a three.js atlas of Italo Calvino's *Invisible Cities*.
Project: `/Users/pmigdal/my_repos/vibe_coding/invisible-opus-more` (Vite + three r186, pnpm).

## Ground rules
- The dev server is ALREADY running at http://127.0.0.1:5199 (hot reload). Do not start another, do not install packages.
- Only create/edit your own files: `src/cities/<id>.js` (and optional private helpers named `src/cities/_<yourprefix>_*.js`).
  Other agents work in parallel on other cities and on the main app. Never edit `src/kit.js`, `src/main.js`, `src/world.js`, `src/data.js`.
  If kit.js has a bug or lacks something, work around it locally in your file and mention it in your report.
- Read first: `src/kit.js` (shared builder kit), `src/cities/_fallback.js` (minimal example), `src/data.js` (the text of your cities — it is what the viewer reads next to your diorama).

## Contract
`src/cities/<id>.js`:
```js
import { THREE, Builder, M, C, Lines, house, tower, solid, glowMat /* … */ } from '../kit.js';
export default function build({ rng, city, accent }) {
  const b = new Builder();
  // … static geometry into b …
  const object = new THREE.Group();
  object.add(b.build());
  // … animated meshes added to object …
  return { object, update(t, dt) { /* cheap per-frame animation */ } };
}
```
- `rng`: seeded RNG — `rng()`, `rng.range(a,b)`, `rng.int(a,b)`, `rng.pick(arr)`, `rng.chance(p)`, `rng.inDisc(R, minR)`, `rng.gauss()`, `rng.shuffle(arr)`.
  Use it instead of Math.random so the build is deterministic. Kit helpers take it as `r: rng` (house, windows, tree) or `rand: rng` (tower, rock).
- `accent`: the category colour (hex string). Use it as a subtle unifying touch (banners, glass tint, a glow), not as the main colour.
- Coordinates: y = 0 is the top of a round stone plinth of radius 11. Keep the footprint within radius ~10.5
  (slight overhang ok). Typical height 3–14; strongly vertical concepts may go up to ~24. 1 unit ≈ one storey; a person ≈ 0.35 tall.
  Nothing can go below y = 0 (the plinth is solid) — if the idea needs an underground, raise the ground on a block and cut it away.
- Static geometry goes through `Builder` (it merges into ~1 mesh per material → very few draw calls).
  Animated parts are separate Meshes/Groups/InstancedMeshes. Builder can also build a sub-group: make a second `new Builder()`,
  `.build()` it, and animate that Group as a whole (great for rotating wheels, swaying nets, floating globes…).
- Budget per city: ≤ ~150k triangles, ≤ ~40 draw calls. Use InstancedMesh for many identical moving things (birds, people, particles).
- `update(t, dt)` runs every frame only while the city is on screen; `t` is seconds. Keep it cheap: no allocations in loops,
  no geometry rebuilding (except tiny buffers). Animation should be calm and poetic (slow, looping), not frantic.
- Materials: `M.stone`, `M.smooth`, `M.flat` (faceted), `M.wood`, `M.cloth` (double-sided), `M.metal` (tint with C.gold/C.silver),
  `M.rough_metal`, `M.water`, `M.glass` (transparent), `M.glow` (unlit; vertex colour × `glow` intensity → blooms). All use vertex colours via
  the `color` option. For stand-alone animated meshes use `solid(color, opts)` / `glowMat(color, intensity)` or the M.* materials
  (M.* need a `color` vertex attribute — easiest to make animated parts with a separate Builder).
  `Lines` builds thin lines (strings, ropes, constellations) in one draw call.

## Look
- Global lighting: dusk sun low from (-x, +y, -z) side, cool hemisphere fill, ACES tone mapping, bloom on bright emissives,
  fog, tilt-shift. Background is a dark wooden chessboard and a twilight sky.
- Visual language: refined museum miniature — porcelain, plaster, brass and glass; warm palette `C.*`.
- Each city needs ONE strong, instantly readable idea taken from the text — a silhouette you'd recognise at overview distance
  (~150 units away, where the whole city is ~60 px wide) — plus rich detail that rewards a close look (~25–40 units away).
  Prefer the poetic/surreal core of the text over literal clutter.
- Use glow sparingly and meaningfully (lit windows, lamps, magic). Large glowing areas blow out the bloom.
- Avoid: plain grids of identical boxes; inexplicable floating things; z-fighting (offset coplanar faces by ≥ 0.01);
  text/letters; giant flat untextured planes; everything the same colour.
- Make each of your cities clearly different from the others in silhouette, palette and composition.

## Verify (mandatory)
Headless Chrome + playwright-core is set up:
```
node scripts/shot.mjs <id> <view> <out.png> [t]
```
views: `front` | `side` | `back` | `top` | `close` | `low`; `t` = animation time in seconds (default 2), so you can
check animation states (e.g. t=0, 5, 10). Put screenshots in your own scratch folder and inspect them with the Read tool.
The script prints console errors — fix them all. Iterate until each city is beautiful and recognisable from at least
`front`, `side` and `close`. Overall app check: `node scripts/shot.mjs app <out.png> <id> 9000` loads the full app and flies to your city.

## Report
At the end, for each city: 1–2 sentences on the idea and what you built, and anything you're unsure about. No code.
