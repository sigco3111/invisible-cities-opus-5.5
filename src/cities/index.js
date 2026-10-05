// Lazy registry of city generators: src/cities/<id>.js exports default build().
import { fallback } from './_fallback.js';

const modules = import.meta.glob(['./*.js', '!./index.js', '!./_*.js']);

export async function loadBuilder(id) {
  const key = `./${id}.js`;
  if (!modules[key]) return fallback;
  try {
    const m = await modules[key]();
    return m.default || fallback;
  } catch (e) {
    console.error(`City module ${id} failed to load`, e);
    return fallback;
  }
}

export function hasBuilder(id) {
  return !!modules[`./${id}.js`];
}
