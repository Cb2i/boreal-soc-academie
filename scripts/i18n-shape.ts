// Forme traduisible du contenu : sert à l'extraction (aide à la traduction) et à la validation des overlays.
import type { Exercise, Lab, Lesson, PathDef, Competency } from '../src/content/types.ts';

type O = Record<string, unknown>;
const pick = (src: O, keys: string[]): O => {
  const out: O = {};
  for (const k of keys) if (src[k] !== undefined) out[k] = src[k];
  return out;
};
const rules = (check: unknown): O | undefined => {
  const r = (check as { rules?: { message: string }[] } | undefined)?.rules;
  return r && r.length ? { rules: r.map((x) => ({ message: x.message })) } : undefined;
};
const idText = (list: { id: string; text: string }[] | undefined) => list?.map((x) => ({ id: x.id, text: x.text }));

/** Champs textuels d'un exercice, dans la forme attendue pour un overlay. */
export function exerciseShape(e: Exercise): O {
  const o: O = pick(e as unknown as O, ['title', 'objective', 'statement', 'hints', 'explanation', 'commonMistakes', 'resources']);
  switch (e.type) {
    case 'kql-write':
    case 'kql-fix':
    case 'kql-blocks': {
      const r = rules(e.check);
      if (r) o.check = r;
      break;
    }
    case 'order':
      o.items = idText(e.items);
      break;
    case 'match':
      o.items = idText(e.items);
      o.options = idText(e.options);
      break;
    case 'place':
      o.items = idText(e.items);
      o.zones = e.zones.map((z) => ({ id: z.id, label: z.label, ...(z.description ? { description: z.description } : {}) }));
      break;
    case 'inspect':
      o.lines = e.lines.map((l) => ({
        id: l.id,
        text: l.text,
        ...(l.faulty?.remedies ? { faulty: { remedies: idText(l.faulty.remedies) } } : {}),
      }));
      break;
    case 'read-results':
      o.question = e.question;
      if (e.choices) o.choices = idText(e.choices);
      break;
    case 'choice':
      o.choices = idText(e.choices);
      break;
    case 'investigate':
      o.scenario = e.scenario;
      o.steps = e.steps.map((s) => {
        const st: O = { id: s.id, prompt: s.prompt };
        if (s.choices) st.choices = idText(s.choices);
        if (s.evidence) st.evidence = s.evidence.map((ev) => ({ title: ev.title, ...(ev.text ? { text: ev.text } : {}) }));
        const r = rules(s.kql?.check);
        if (r) st.kql = { check: r };
        st.explanation = s.explanation;
        return st;
      });
      break;
  }
  return o;
}

export const lessonShape = (l: Lesson): O => pick(l as unknown as O, ['title', 'summary', 'body']);
export const labShape = (l: Lab): O => pick(l as unknown as O, ['title', 'summary', 'prerequisites', 'licenses', 'cost', 'steps', 'checks', 'cleanup']);
export const pathShape = (p: PathDef): O => pick(p as unknown as O, ['title', 'short', 'description', 'topics']);
export const competencyShape = (c: Competency): O => pick(c as unknown as O, ['name', 'description']);
