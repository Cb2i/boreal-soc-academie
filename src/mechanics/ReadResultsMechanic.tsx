import { useMemo } from 'react';
import type { ReadResultsEx } from '../content/types.ts';
import type { Verdict } from '../engine/validate.ts';
import { execute, VISIBLE_SEED } from '../engine/validate.ts';
import { CodeBlock } from '../components/CodeBlock.tsx';
import { ResultTable } from '../components/ResultTable.tsx';
import { Markdown } from '../components/Markdown.tsx';

interface Props {
  ex: ReadResultsEx;
  value: string;
  choices: string[];
  onValue: (v: string) => void;
  onChoices: (c: string[]) => void;
  disabled: boolean;
  verdict: Verdict | null;
  onSubmit: () => void;
}

export function ReadResultsMechanic({ ex, value, choices, onValue, onChoices, disabled, verdict, onSubmit }: Props) {
  const run = useMemo(() => execute(ex.context, ex.query, VISIBLE_SEED), [ex.context, ex.query]);
  return (
    <div className="stack">
      <CodeBlock code={ex.query} lang="kql" playgroundContext={ex.context} />
      {run.ok ? <ResultTable table={run.table} caption="Résultat de la requête affichée" /> : <div className="verdict bad">{run.error.message}</div>}
      <h3>Question</h3>
      <Markdown source={ex.question} />
      {ex.answerKind === 'choice' ? (
        <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack">
          <legend className="sr-only">Réponses possibles</legend>
          {(ex.choices ?? []).map((c) => {
            const on = choices.includes(c.id);
            const fb = verdict?.itemFeedback?.[c.id];
            return (
              <label key={c.id} className={`choice${fb === true ? ' good' : fb === false ? ' badc' : ''}`}>
                <input
                  type={(ex.correct?.length ?? 1) > 1 ? 'checkbox' : 'radio'}
                  name="rr"
                  checked={on}
                  disabled={disabled}
                  onChange={() => onChoices((ex.correct?.length ?? 1) > 1 ? (on ? choices.filter((x) => x !== c.id) : [...choices, c.id]) : [c.id])}
                />
                <span>{c.text}</span>
              </label>
            );
          })}
        </fieldset>
      ) : (
        <div className="row">
          <label htmlFor="rr-input" className="sr-only">Votre réponse</label>
          <input id="rr-input" type="text" value={value} disabled={disabled} onChange={(e) => onValue(e.target.value)} placeholder="Votre réponse" onKeyDown={(e) => e.key === 'Enter' && onSubmit()} />
        </div>
      )}
      <div className="row">
        <button type="button" className="btn primary" onClick={onSubmit} disabled={disabled}>Valider ma réponse</button>
      </div>
    </div>
  );
}
