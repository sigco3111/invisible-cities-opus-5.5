import { CITIES, INTERLUDES } from '../src/data.js';
import { existsSync, readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
assert.equal(CITIES.length,55);assert.equal(INTERLUDES.length,10);
for(const c of CITIES){assert.equal(c.id,c.name.toLowerCase());assert.ok(existsSync(`src/cities/${c.id}.js`));assert.match(c.displayName,/[가-힣]/);assert.match(c.motif,/[가-힣]/);assert.equal(c.paragraphs.length,2);assert.ok(c.originalText);assert.ok(!/[A-Za-z]/.test(c.text));}
for(const il of INTERLUDES){assert.match(il.title,/[가-힣]/);assert.match(il.text,/[가-힣]/);assert.ok(il.originalText);}
assert.ok(!readFileSync('.github/workflows/deploy.yml','utf8').includes('  push:'));
console.log('PASS: 55 Korean cities, 10 dialogues, original IDs/models, two paragraphs, no automatic push deployment.');
