// Placeholder used while a city has no generator of its own.
import { THREE, Builder, M, C, house, tower, scatter, groundDisc } from '../kit.js';

export function fallback({ rng, accent }) {
  const b = new Builder();
  groundDisc(b, { r: 10, color: C.sand });
  for (const p of scatter(rng, { count: 40, rMax: 9, size: [0.8, 1.6] })) {
    house(b, { x: p.x, z: p.z, w: p.w, d: p.d, h: rng.range(0.8, 2.4), ry: p.ry, r: rng });
  }
  tower(b, { h: 7, r: 0.8, cap: 'spire', capColor: accent, rand: rng });
  const g = new THREE.Group();
  g.add(b.build());
  return { object: g };
}
