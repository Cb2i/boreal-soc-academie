import { CONTENT_LOADERS } from '../src/tracks/loaders.ts';
import { collectProse } from '../src/i18n/prose.ts';
const t = process.argv[2]; const n = Number(process.argv[3]); const seed = Number(process.argv[4]);
const C = await CONTENT_LOADERS[t]();
const list: string[] = []; for (const l of C.LESSONS) collectProse({ body: l.body, summary: l.summary }, list);
let x = seed; const rnd = () => (x = (x * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const long = list.filter((s) => s.length > 80);
for (let i = 0; i < n; i++) console.log('-', long[Math.floor(rnd() * long.length)]);
