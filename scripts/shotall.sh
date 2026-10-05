#!/bin/sh
# Render every city solo; prints any console errors. Usage: sh scripts/shotall.sh <outdir>
OUT=$1; mkdir -p "$OUT"
one() { node scripts/shot.mjs "$1" front "$OUT/$1.png" 8 2>&1 | grep -v -i 'clock\|pcfsoft\|404\|saved' | sed "s/^/$1: /"; }
for id in $(node -e "import('./src/data.js').then(m=>console.log(m.CITIES.map(c=>c.id).join(' ')))"); do
  one $id &
  while [ $(jobs -r | wc -l) -ge 6 ]; do sleep 0.3; done
done
wait
