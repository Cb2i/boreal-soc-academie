import { describe, expect, it } from 'vitest';
import { CONTENT_LOADERS } from '../src/tracks/loaders.ts';
import { FLOWS, FLOW_BY_LESSON } from '../src/diagrams/index.ts';

const dash = String.fromCharCode(0x2014);

describe('schémas animés', () => {
  it('chaque flux est cohérent', () => {
    for (const f of FLOWS) {
      const ids = new Set(f.nodes.map((n) => n[0]));
      expect(ids.size, f.lesson).toBe(f.nodes.length);
      expect(f.nodes.length, f.lesson).toBeGreaterThanOrEqual(4);
      expect(f.nodes.length, f.lesson).toBeLessThanOrEqual(10);
      expect(f.steps.length, f.lesson).toBeGreaterThanOrEqual(3);
      for (const s of f.steps) { expect(ids.has(s[0]) && ids.has(s[1]), `${f.lesson} ${s[2]}`).toBe(true); expect(s[3].length, `${f.lesson} ${s[2]}`).toBeGreaterThan(8); }
      expect(JSON.stringify(f).includes(dash), f.lesson).toBe(false);
    }
    expect(Object.keys(FLOW_BY_LESSON).length).toBe(FLOWS.length);
  });
  it('chaque cours du parcours Azure a son schéma', async () => {
    const { LESSON_BY_ID } = await import('../src/content/index.ts');
    expect(Object.keys(LESSON_BY_ID).filter((id) => !FLOW_BY_LESSON[id])).toEqual([]);
  });
  for (const [id, load] of Object.entries(CONTENT_LOADERS)) {
    it(`chaque leçon du parcours ${id} a son schéma`, async () => {
      const C = await load();
      const missing = C.LESSONS.filter((l) => !FLOW_BY_LESSON[l.id]).map((l) => l.id);
      expect(missing).toEqual([]);
    });
  }
});
