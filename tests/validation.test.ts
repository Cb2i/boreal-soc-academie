import { describe, expect, it } from 'vitest';
import { ALL_EXERCISES, EXERCISE_BY_ID } from '../src/content/index.ts';
import { validateExercise, validateStep, computeXp } from '../src/engine/validate.ts';
import type { Answer } from '../src/engine/validate.ts';
import type { Exercise, InvestigateEx } from '../src/content/types.ts';

const ex = (id: string) => EXERCISE_BY_ID[id] as Exercise;
const q = (id: string, query: string) => validateExercise(ex(id), { type: ex(id).type, query } as Answer);

describe('KQL : les quatre issues et les erreurs', () => {
  it('une solution équivalente est acceptée (comparaison de résultats, pas de chaînes)', () => {
    expect(q('kql-003', 'SigninLogs\n| where ResultType != "0"\n| summarize Echecs = count() by UserPrincipalName\n| order by Echecs desc\n| take 3').correct).toBe(true);
  });
  it('erreur de syntaxe', () => {
    const v = q('kql-003', 'SigninLogs | wher x');
    expect(v.status).toBe('syntax');
    expect(v.correct).toBe(false);
  });
  it('syntaxe non prise en charge par le moteur local', () => {
    const v = q('kql-003', 'SigninLogs | make-series n=count() on TimeGenerated step 1h');
    expect(v.status).toBe('unsupported');
    expect(v.correct).toBe(false);
  });
  it('exécutable mais mauvais résultat', () => {
    const v = q('kql-003', 'SigninLogs | take 3');
    expect(v.status).toBe('wrong');
    expect(v.correct).toBe(false);
  });
  it('colonne en trop refusée en mode exact', () => {
    const v = q('kql-003', 'SigninLogs | where ResultType != "0" | summarize Echecs = count(), Autres = dcount(IPAddress) by UserPrincipalName | top 3 by Echecs desc');
    expect(v.correct).toBe(false);
  });
  it('correct mais optimisable : agrégation avant filtre', () => {
    const v = q('kql-003', 'SigninLogs | summarize Echecs = countif(ResultType != "0") by UserPrincipalName | top 3 by Echecs desc');
    expect(v.status).toBe('optimizable');
    expect(v.correct).toBe(true);
  });
  it('correct mais raisonnement défaillant : date écrite en dur', () => {
    const v = q('kql-005', 'SigninLogs\n| where TimeGenerated > datetime(2026-03-11T12:00:00Z)\n| where ResultType != "0"');
    expect(v.status).toBe('reasoning');
  });
  it('take avant sort est refusé même si le sous-ensemble ressemble au résultat', () => {
    const v = q('kql-072', 'CommonSecurityLog | take 5 | sort by SentBytes desc | project SourceIP, SentBytes');
    expect(v.correct).toBe(false);
  });
  it('un résultat correct sur le jeu visible mais faux sur le jeu caché est refusé', () => {
    // Codage en dur d’une valeur lue dans le résultat visible : ne généralise pas au second jeu de données.
    const v = q('kql-003', 'datatable(UserPrincipalName:string, Echecs:long)["c.tremblay@nordlys.example", 42, "m.gagnon@nordlys.example", 9, "i.gagne@nordlys.example", 8]');
    expect(v.correct).toBe(false);
  });
  it('requête vide', () => {
    expect(q('kql-003', '   ').correct).toBe(false);
  });
});

describe('autres mécaniques : réponses fausses refusées', () => {
  it('order : ordre inversé', () => {
    const o = ex('az-022');
    if (o.type !== 'order') throw new Error('type');
    expect(validateExercise(o, { type: 'order', ids: [...o.correct].reverse() }).correct).toBe(false);
    expect(validateExercise(o, { type: 'order', ids: o.correct }).correct).toBe(true);
  });
  it('place : un élément dans la mauvaise zone', () => {
    const p = ex('az-019');
    if (p.type !== 'place') throw new Error('type');
    const map = { ...p.answer };
    const first = p.items[0].id;
    const other = p.zones.find((z) => z.id !== map[first])!.id;
    map[first] = other;
    expect(validateExercise(p, { type: 'place', map }).correct).toBe(false);
  });
  it('choice : mauvaise réponse et réponse partielle pour un choix multiple', () => {
    const c = ex('az-024');
    if (c.type !== 'choice') throw new Error('type');
    expect(c.multi).toBe(true);
    expect(validateExercise(c, { type: 'choice', ids: [c.correct[0]] }).correct).toBe(false);
    expect(validateExercise(c, { type: 'choice', ids: c.correct }).correct).toBe(true);
  });
  it('inspect : mauvais correctif refusé', () => {
    const i = ex('az-021');
    if (i.type !== 'inspect') throw new Error('type');
    const faulty = i.lines.filter((l) => l.faulty).map((l) => l.id);
    const remedies: Record<string, string> = {};
    for (const l of i.lines) if (l.faulty) remedies[l.id] = l.faulty.remedies!.find((r) => r.id !== l.faulty!.correctRemedy)!.id;
    expect(validateExercise(i, { type: 'inspect', faulty, remedies }).correct).toBe(false);
  });
  it('read-results : valeur fausse refusée', () => {
    const r = ex('kql-099');
    expect(validateExercise(r, { type: 'read-results', value: '-1' }).correct).toBe(false);
  });
});

describe('enquêtes multi-étapes', () => {
  const invs = ALL_EXERCISES.filter((e): e is InvestigateEx => e.type === 'investigate');
  it('il existe des enquêtes', () => expect(invs.length).toBeGreaterThanOrEqual(8));
  for (const iv of invs) {
    it(`${iv.id} : les réponses de référence sont acceptées et les fausses refusées`, () => {
      for (const st of iv.steps) {
        if (st.kind === 'choice' || st.kind === 'multi') {
          expect(validateStep(iv, st, { ids: st.correct }).correct).toBe(true);
          const wrong = st.choices!.filter((c) => !st.correct!.includes(c.id)).map((c) => c.id);
          expect(validateStep(iv, st, { ids: wrong.slice(0, 1) }).correct).toBe(false);
          expect(validateStep(iv, st, { ids: [] }).correct).toBe(false);
        } else if (st.kind === 'number') {
          expect(validateStep(iv, st, { value: '-12345' }).correct).toBe(false);
          expect(validateStep(iv, st, { value: '' }).correct).toBe(false);
        } else {
          expect(validateStep(iv, st, { query: st.kql!.solutions[0] }).correct).toBe(true);
          expect(validateStep(iv, st, { query: 'SigninLogs | take 1' }).correct).toBe(false);
        }
      }
    });
  }
});

describe('XP', () => {
  it('pas de points pour une réponse fausse, bonus au premier essai, pénalité d’indices', () => {
    const e = ex('kql-003');
    const ok = q('kql-003', 'SigninLogs | where ResultType != "0" | summarize Echecs = count() by UserPrincipalName | top 3 by Echecs desc');
    const bad = q('kql-003', 'SigninLogs | take 3');
    expect(computeXp(e, bad, { hintsUsed: 0, attempts: 1 })).toBe(0);
    const first = computeXp(e, ok, { hintsUsed: 0, attempts: 1 });
    const hinted = computeXp(e, ok, { hintsUsed: 2, attempts: 1 });
    expect(first).toBeGreaterThan(hinted);
    expect(hinted).toBeGreaterThan(0);
  });
  it('une mission rapporte plus qu’un exercice de même niveau', () => {
    const m = ex('az-036');
    const v = validateExercise(m, { type: 'place', map: (m as Extract<Exercise, { type: 'place' }>).answer });
    const plain = { ...m, kind: 'exercise' as const };
    expect(computeXp(m, v, { hintsUsed: 0, attempts: 1 })).toBeGreaterThan(computeXp(plain, v, { hintsUsed: 0, attempts: 1 }));
  });
});
