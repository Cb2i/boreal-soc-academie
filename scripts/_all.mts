import { CONTENT_LOADERS } from '../src/tracks/loaders.ts';
import { collectProse, h } from '../src/i18n/prose.ts';
import { writeFileSync } from 'node:fs';
const out: Record<string, { k: string; s: string }[]> = {};
for (const t of ['ia', 'xdr', 'intune', 'scenarios', 'mdc']) {
  const C = await CONTENT_LOADERS[t]();
  const list: string[] = [];
  const add = (v: unknown) => collectProse(v, list);
  add(C.LEVELS); for (const m of C.MODULES) add(m);
  for (const l of C.LESSONS) add({ title: l.title, summary: l.summary, objectives: l.objectives, prerequisites: l.prerequisites, demo: l.demo, revision: l.revision, body: l.body });
  for (const c of C.COMPETENCIES) add(c); for (const c of C.CASES) add(c);
  for (const e of C.EXERCISES) add(e); for (const p of C.PROJECTS) add(p); add(C.RESOURCES);
  const seen = new Set<string>(); out[t] = [];
  for (const s of list) { const k = h(s); if (seen.has(k)) continue; seen.add(k); out[t].push({ k, s }); }
}
writeFileSync('/tmp/claude-0/w/all.json', JSON.stringify(out));
console.log(Object.entries(out).map(([t, v]) => `${t}:${v.length}`).join(' '));
