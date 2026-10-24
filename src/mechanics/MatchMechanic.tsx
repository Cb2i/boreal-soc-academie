import type { MatchEx } from '../content/types.ts';
import type { Verdict } from '../engine/validate.ts';

interface Props {
  ex: MatchEx;
  map: Record<string, string>;
  onMap: (m: Record<string, string>) => void;
  disabled: boolean;
  verdict: Verdict | null;
  onSubmit: () => void;
}

export function MatchMechanic({ ex, map, onMap, disabled, verdict, onSubmit }: Props) {
  return (
    <div className="stack">
      <ul className="dnd-list" style={{ listStyle: 'none', padding: 0 }}>
        {ex.items.map((it) => {
          const fb = verdict?.itemFeedback?.[it.id];
          return (
            <li key={it.id} className={`dnd-item${fb === true ? ' good' : fb === false ? ' badc' : ''}`} style={{ cursor: 'default' }}>
              <label htmlFor={`m-${it.id}`} className="grow" style={{ fontWeight: 500 }}>{it.text}</label>
              <select id={`m-${it.id}`} value={map[it.id] ?? ''} disabled={disabled} onChange={(e) => onMap({ ...map, [it.id]: e.target.value })}>
                <option value="">Choisir…</option>
                {ex.options.map((o) => (
                  <option key={o.id} value={o.id}>{o.text}</option>
                ))}
              </select>
              {fb === true && <span className="pill ok">juste</span>}
              {fb === false && <span className="pill bad">à revoir</span>}
            </li>
          );
        })}
      </ul>
      <div className="row">
        <button type="button" className="btn primary" onClick={onSubmit} disabled={disabled}>Valider les associations</button>
      </div>
    </div>
  );
}
