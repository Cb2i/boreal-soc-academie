import { afterAll, describe, expect, it } from 'vitest';
import { ALL_EXERCISES, ALL_LESSONS as LESSONS, ALL_LABS as LABS } from '../src/content/index.ts';
import { PATHS } from '../src/content/paths.ts';
import { getLang, setLang, tr } from '../src/i18n/lang.ts';
import { referenceAnswer, validateExercise } from '../src/engine/validate.ts';

describe('langue : bascule français / anglais', () => {
  afterAll(async () => {
    await setLang('fr');
  });

  it('la langue par défaut est le français', () => {
    expect(getLang()).toBe('fr');
    expect(tr('Accueil', 'Home')).toBe('Accueil');
  });

  it('en anglais, chaque exercice, cours, labo et parcours est traduit', async () => {
    const fr = {
      ex: ALL_EXERCISES.map((e) => [e.id, e.title, e.statement] as const),
      lessons: LESSONS.map((l) => [l.id, l.title] as const),
      labs: LABS.map((l) => [l.id, l.title] as const),
      paths: PATHS.map((p) => [p.id, p.description] as const),
    };
    await setLang('en');
    expect(getLang()).toBe('en');
    expect(tr('Accueil', 'Home')).toBe('Home');
    for (const [id, title, statement] of fr.ex) {
      const e = ALL_EXERCISES.find((x) => x.id === id)!;
      expect(e.title, id).not.toBe(title);
      expect(e.statement, id).not.toBe(statement);
    }
    for (const [id, title] of fr.lessons) expect(LESSONS.find((x) => x.id === id)!.title, id).not.toBe(title);
    for (const [id, title] of fr.labs) expect(LABS.find((x) => x.id === id)!.title, id).not.toBe(title);
    for (const [id, desc] of fr.paths) expect(PATHS.find((x) => x.id === id)!.description, id).not.toBe(desc);
  });

  it('en anglais, les solutions de référence restent validées', () => {
    for (const ex of ALL_EXERCISES) {
      if (ex.type === 'investigate') continue;
      const ans = referenceAnswer(ex);
      expect(ans, ex.id).not.toBeNull();
      const v = validateExercise(ex, ans!);
      expect(v.correct, `${ex.id}: ${v.title} ${v.message}`).toBe(true);
    }
  });

  it('le retour au français restaure le contenu d’origine', async () => {
    await setLang('fr');
    expect(getLang()).toBe('fr');
    const e = ALL_EXERCISES.find((x) => x.id === 'kql-001')!;
    expect(/[éèàç]|[A-Za-z]/.test(e.title)).toBe(true);
    expect(tr('Accueil', 'Home')).toBe('Accueil');
  });
});
