// Constructeurs compacts pour écrire les exercices : un module = un fichier de données lisible.
import type {
  AiChoice, AiExercise, ConfigEx, ConfigField, Dim, FixEx, FixRule, InspectAi, InspectLineAi, Item, MatchAi, OpenEx, OrderAi, PlaceAi, QcmEx, Role, ShortEx, WorkflowEx,
} from '../types.ts';

interface Common {
  id: string;
  title: string;
  comp: string;
  tags: string[];
  role: Role;
  dim: Dim;
  /** Énoncé (mini-markdown). */
  st: string;
  hints?: string[];
  /** Correction expliquée. */
  exp: string;
  /** Erreurs fréquentes. */
  bad?: string[];
  lesson?: string;
}

export const items = (pairs: [string, string][]): Item[] => pairs.map(([id, text]) => ({ id, text }));

export function author(module: string) {
  const base = (c: Common) => ({
    id: c.id,
    module,
    title: c.title,
    competency: c.comp,
    tags: c.tags,
    role: c.role,
    dim: c.dim,
    statement: c.st,
    hints: c.hints,
    explanation: c.exp,
    mistakes: c.bad,
    lesson: c.lesson,
  });
  return {
    /** QCM : chaque choix est [texte, correct, explication de ce choix]. */
    qcm(c: Common & { multi?: boolean }, choices: [string, boolean, string][]): QcmEx {
      const ch: AiChoice[] = choices.map(([text, correct, why], i) => ({ id: String.fromCharCode(97 + i), text, correct, why }));
      return { ...base(c), type: 'qcm', choices: ch, multi: c.multi ?? ch.filter((x) => x.correct).length > 1 };
    },
    short(c: Common & { accepted: string[]; patterns?: string[]; numeric?: { value: number; tol?: number }; ph?: string }): ShortEx {
      return { ...base(c), type: 'short', accepted: c.accepted, patterns: c.patterns, numeric: c.numeric, placeholder: c.ph };
    },
    order(c: Common & { items: [string, string][]; correct: string[]; alt?: string[][] }): OrderAi {
      return { ...base(c), type: 'order', items: items(c.items), correct: c.correct, alternatives: c.alt };
    },
    match(c: Common & { items: [string, string][]; options: [string, string][]; answer: Record<string, string | string[]> }): MatchAi {
      const answer: Record<string, string[]> = {};
      for (const [k, v] of Object.entries(c.answer)) answer[k] = Array.isArray(v) ? v : [v];
      return { ...base(c), type: 'match', items: items(c.items), options: items(c.options), answer };
    },
    place(c: Common & { items: [string, string][]; zones: [string, string, string?][]; answer: Record<string, string> }): PlaceAi {
      return { ...base(c), type: 'place', items: items(c.items), zones: c.zones.map(([id, label, description]) => ({ id, label, description })), answer: c.answer };
    },
    /** Lignes : [id, texte, défaut?]. Un défaut est { ok: id du bon correctif, fixes: [[id, texte], ...] }. */
    inspect(c: Common & { language: InspectAi['language']; lines: [string, string, { ok: string; fixes: [string, string][] }?][] }): InspectAi {
      const lines: InspectLineAi[] = c.lines.map(([id, text, f]) => ({ id, text, faulty: f ? { correctRemedy: f.ok, remedies: f.fixes.map(([rid, rt]) => ({ id: rid, text: rt })) } : undefined }));
      return { ...base(c), type: 'inspect', language: c.language, lines };
    },
    fix(c: Common & { language: FixEx['language']; starter: string; rules: FixRule[]; solution: string }): FixEx {
      return { ...base(c), type: 'fix', language: c.language, starter: c.starter, rules: c.rules, solution: c.solution };
    },
    config(c: Common & { fields: ConfigField[]; constraints?: ConfigEx['constraints']; solution: Record<string, string | number> }): ConfigEx {
      return { ...base(c), type: 'config', fields: c.fields, constraints: c.constraints, solution: c.solution };
    },
    workflow(c: Common & { blocks: [string, string][]; required: string[]; forbidden?: string[]; before?: [string, string][]; max?: number; notes?: Record<string, string>; solution: string[] }): WorkflowEx {
      return { ...base(c), type: 'workflow', blocks: items(c.blocks), required: c.required, forbidden: c.forbidden ?? [], before: c.before ?? [], maxLength: c.max, notes: c.notes, solution: c.solution };
    },
    open(c: Common & { deliverable: string; rubric: [string, string, Dim][]; model?: string }): OpenEx {
      return { ...base(c), type: 'open', deliverable: c.deliverable, rubric: c.rubric.map(([id, text, dim]) => ({ id, text, dim })), model: c.model };
    },
  };
}

export type Authoring = ReturnType<typeof author>;
export type { AiExercise };

/** Sources vérifiées : date de vérification commune pour une session de recherche. */
export const VERIFIED = '2026-10-24';
export const src = (title: string, url: string, verified = VERIFIED) => ({ title, url, verified });
