import { describe, expect, it } from 'vitest';
import { runQuery } from '../src/kql/index.ts';
import type { Row, Table } from '../src/kql/index.ts';

const NOW = new Date('2026-03-12T12:00:00Z');
const d = (s: string) => new Date(s);

const ev: Table = {
  columns: ['T', 'User', 'Msg', 'N'],
  types: { T: 'datetime', User: 'string', Msg: 'string', N: 'number' },
  rows: [
    { T: d('2026-03-12T10:05:00Z'), User: 'bob', Msg: 'login user=bob ip=1.1.1.1 ok', N: 3 },
    { T: d('2026-03-12T10:10:00Z'), User: 'alice', Msg: 'login user=alice ip=2.2.2.2 ok', N: 1 },
    { T: d('2026-03-12T12:30:00Z'), User: 'bob', Msg: 'login user=bob ip=3.3.3.3 ok', N: 5 },
    { T: d('2026-03-12T10:20:00Z'), User: 'alice', Msg: 'garbage line', N: 2 },
  ] as Row[],
};
const run = (q: string) => runQuery(q, { tables: { Ev: ev }, now: NOW });
const ok = (q: string) => {
  const r = run(q);
  if (!r.ok) throw new Error(`${r.error.kind}: ${r.error.message}`);
  return r.table;
};

describe('KQL : fonctions de fenêtre', () => {
  it('row_number() après sort', () => {
    const t = ok('Ev | sort by T asc | extend i = row_number() | project User, i');
    expect(t.rows.map((r) => r.i)).toEqual([1, 2, 3, 4]);
  });
  it('row_number(start)', () => {
    const t = ok('Ev | sort by N asc | extend i = row_number(10) | project i');
    expect(t.rows.map((r) => r.i)).toEqual([10, 11, 12, 13]);
  });
  it('prev, next et row_cumsum', () => {
    const t = ok('Ev | sort by N asc | extend p = prev(N), n = next(N), c = row_cumsum(N) | project N, p, n, c');
    expect(t.rows.map((r) => r.p)).toEqual([null, 1, 2, 3]);
    expect(t.rows.map((r) => r.n)).toEqual([2, 3, 5, null]);
    expect(t.rows.map((r) => r.c)).toEqual([1, 3, 6, 11]);
  });
  it('serialize permet row_number sans tri', () => {
    expect(ok('Ev | serialize | extend i = row_number() | project i').rows.map((r) => r.i)).toEqual([1, 2, 3, 4]);
  });
  it('refuse row_number() sur un jeu non sérialisé', () => {
    const r = run('Ev | extend i = row_number()');
    expect(r.ok).toBe(false);
  });
  it('summarize retire la sérialisation', () => {
    expect(run('Ev | sort by T asc | summarize c = count() by User | extend i = row_number()').ok).toBe(false);
  });
});

describe('KQL : parse', () => {
  it('extrait des colonnes typées', () => {
    const t = ok('Ev | parse Msg with "login user=" U " ip=" Ip " ok" | where isnotempty(U) | project U, Ip');
    expect(t.rows.map((r) => [r.U, r.Ip])).toEqual([['bob', '1.1.1.1'], ['alice', '2.2.2.2'], ['bob', '3.3.3.3']]);
  });
  it('mode simple : sans correspondance les colonnes sont vides', () => {
    const t = ok('Ev | parse Msg with "user=" U " ip=" Ip " ok" | project Msg, U');
    const g = t.rows.find((r) => r.Msg === 'garbage line')!;
    expect(g.U === null || g.U === '').toBe(true);
  });
  it('parse-where retire les lignes sans correspondance', () => {
    expect(ok('Ev | parse-where Msg with "user=" U " ip=" Ip " ok"').rows).toHaveLength(3);
  });
  it('type long', () => {
    const t = ok('Ev | extend M = strcat("n=", tostring(N)) | parse M with "n=" K:long | project K');
    expect(t.rows.map((r) => r.K).sort()).toEqual([1, 2, 3, 5]);
  });
});

describe('KQL : make-series', () => {
  it('produit des tableaux alignés avec valeur par défaut', () => {
    const t = ok('Ev | make-series c = count() default = 0 on T from datetime(2026-03-12T10:00:00Z) to datetime(2026-03-12T13:00:00Z) step 1h by User');
    const bob = t.rows.find((r) => r.User === 'bob')!;
    expect(bob.c).toEqual([1, 0, 1]);
    const alice = t.rows.find((r) => r.User === 'alice')!;
    expect(alice.c).toEqual([2, 0, 0]);
    expect((bob.T as unknown[]).length).toBe(3);
  });
  it('refuse un step invalide', () => {
    expect(run('Ev | make-series c = count() on T step 0h').ok).toBe(false);
  });
});
