import { describe, expect, it } from 'vitest';
import { CONTENT_LOADERS } from '../src/tracks/loaders.ts';
import { buildDataset, contextTables, SIM_NOW } from '../src/data/dataset.ts';
import { runQuery } from '../src/kql/index.ts';

const dash = String.fromCharCode(0x2014);
const ds = buildDataset(1);
const kqlBlocks = (md: string) => [...md.matchAll(/```kql\n([\s\S]*?)```/g)].map((m) => m[1].trim());

for (const [id, load] of Object.entries(CONTENT_LOADERS)) {
  describe(`labs du parcours ${id}`, async () => {
    const C = await load();
    const labs = C.PROJECTS.filter((p) => p.lab);
    it('chaque lab guidé est complet', () => {
      for (const p of labs) {
        const lab = p.lab!;
        expect(lab.client.length, `${p.id} contexte`).toBeGreaterThan(300);
        expect(lab.mission.length, `${p.id} mission`).toBeGreaterThan(60);
        expect(lab.parts.length, `${p.id} parties`).toBeGreaterThanOrEqual(4);
        for (const [i, pt] of lab.parts.entries()) {
          expect(pt.steps.length, `${p.id} partie ${i + 1} consignes`).toBeGreaterThan(250);
          expect(pt.expected.length, `${p.id} partie ${i + 1} corrigé`).toBeGreaterThan(200);
          expect(pt.check.length, `${p.id} partie ${i + 1} contrôle`).toBeGreaterThan(25);
          expect(pt.goal.length, `${p.id} partie ${i + 1} objectif`).toBeGreaterThan(25);
        }
        expect(lab.deliverables.length, `${p.id} livrables`).toBeGreaterThanOrEqual(3);
        expect(p.success.length, `${p.id} critères`).toBeGreaterThanOrEqual(3);
        expect(JSON.stringify(p).includes(dash), p.id).toBe(false);
      }
    });
    it('chaque requête KQL des labs s\'exécute dans le terrain de jeu et rend des lignes', () => {
      for (const p of labs) {
        const lab = p.lab!;
        const ctx = contextTables(ds, lab.context ?? 'defender-xdr');
        const texts = [lab.client, ...lab.parts.flatMap((x) => [x.steps, x.expected])];
        for (const q of texts.flatMap(kqlBlocks)) {
          const r = runQuery(q, { tables: ctx.tables, unavailableTables: ctx.unavailable, now: SIM_NOW });
          expect(r.ok, `${p.id} : ${q.slice(0, 80)}`).toBe(true);
          if (r.ok) expect(r.table.rows.length, `${p.id} (aucun résultat) : ${q.slice(0, 80)}`).toBeGreaterThan(0);
        }
      }
    });
  });
}
