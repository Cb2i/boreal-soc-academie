import type { InspectEx } from '../content/types.ts';
import type { Verdict } from '../engine/validate.ts';
import { HighlightedCode } from '../components/CodeBlock.tsx';

interface Props {
  ex: InspectEx;
  faulty: string[];
  remedies: Record<string, string>;
  onChange: (faulty: string[], remedies: Record<string, string>) => void;
  disabled: boolean;
  verdict: Verdict | null;
  onSubmit: () => void;
}

export function InspectMechanic({ ex, faulty, remedies, onChange, disabled, verdict, onSubmit }: Props) {
  const toggle = (id: string) => {
    const on = faulty.includes(id);
    const nf = on ? faulty.filter((x) => x !== id) : [...faulty, id];
    const nr = { ...remedies };
    if (on) delete nr[id];
    onChange(nf, nr);
  };
  return (
    <div className="stack">
      <p className="muted small">Sélectionnez les lignes défectueuses (touche Espace ou Entrée sur la ligne). Si un correctif est demandé, choisissez-le dans la liste qui apparaît.</p>
      <div className="card" style={{ padding: '0.6rem' }} role="group" aria-label="Lignes de la configuration">
        {ex.lines.map((l, i) => {
          const sel = faulty.includes(l.id);
          const fb = verdict?.itemFeedback?.[l.id];
          const rem = l.faulty?.remedies;
          return (
            <div key={l.id}>
              <button
                type="button"
                className={`codeline${sel ? ' sel' : ''}${fb === true ? ' good' : fb === false ? ' badc' : ''}`}
                aria-pressed={sel}
                disabled={disabled}
                onClick={() => toggle(l.id)}
                style={{ width: '100%', background: 'transparent', border: 0, color: 'inherit', textAlign: 'left', cursor: disabled ? 'default' : 'pointer' }}
              >
                <span className="no">{i + 1}</span>
                <pre><HighlightedCode code={l.text} lang={ex.language} /></pre>
                {sel && <span className="pill warn">suspecte</span>}
              </button>
              {sel && rem && rem.length > 0 && (
                <div style={{ margin: '0.2rem 0 0.5rem 2.6rem' }}>
                  <label htmlFor={`rem-${l.id}`} className="small">Correctif pour la ligne {i + 1} : </label>
                  <select id={`rem-${l.id}`} value={remedies[l.id] ?? ''} disabled={disabled} onChange={(e) => onChange(faulty, { ...remedies, [l.id]: e.target.value })}>
                    <option value="">Choisir un correctif…</option>
                    {rem.map((r) => (
                      <option key={r.id} value={r.id}>{r.text}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="row">
        <button type="button" className="btn primary" onClick={onSubmit} disabled={disabled}>Valider l’inspection</button>
        <span className="muted small">{faulty.length} ligne(s) sélectionnée(s)</span>
      </div>
    </div>
  );
}
