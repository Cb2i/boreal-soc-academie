import type { ChoiceEx } from '../content/types.ts';
import type { Verdict } from '../engine/validate.ts';

interface Props {
  ex: ChoiceEx;
  ids: string[];
  onIds: (ids: string[]) => void;
  disabled: boolean;
  verdict: Verdict | null;
  onSubmit: () => void;
}

export function ChoiceMechanic({ ex, ids, onIds, disabled, verdict, onSubmit }: Props) {
  return (
    <div className="stack">
      <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack">
        <legend className="sr-only">{ex.multi ? 'Plusieurs réponses possibles' : 'Une seule réponse'}</legend>
        {ex.choices.map((c) => {
          const on = ids.includes(c.id);
          const fb = verdict?.itemFeedback?.[c.id];
          return (
            <label key={c.id} className={`choice${fb === true ? ' good' : fb === false ? ' badc' : ''}`}>
              <input type={ex.multi ? 'checkbox' : 'radio'} name="ch" checked={on} disabled={disabled} onChange={() => onIds(ex.multi ? (on ? ids.filter((x) => x !== c.id) : [...ids, c.id]) : [c.id])} />
              <span>{c.text}</span>
            </label>
          );
        })}
      </fieldset>
      <div className="row">
        <button type="button" className="btn primary" onClick={onSubmit} disabled={disabled || ids.length === 0}>Valider</button>
        {ex.multi && <span className="muted small">Plusieurs réponses sont possibles.</span>}
      </div>
    </div>
  );
}
