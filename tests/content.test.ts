import { describe, expect, it } from 'vitest';
import { ALL_EXERCISES } from '../src/content/index.ts';
import { referenceAnswer, validateExercise } from '../src/engine/validate.ts';

describe('contenu : solutions de référence', () => {
  for (const ex of ALL_EXERCISES) {
    if (ex.type === 'investigate') continue;
    it(`${ex.id} : la solution de référence est validée`, () => {
      const ans = referenceAnswer(ex);
      expect(ans).not.toBeNull();
      const v = validateExercise(ex, ans!);
      expect(v.correct, `${ex.id}: ${v.title} ${v.message}`).toBe(true);
    });
  }
});
