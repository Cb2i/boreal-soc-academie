import type { OrderEx } from '../content/types.ts';
import type { Verdict } from '../engine/validate.ts';
import { Markdown } from '../components/Markdown.tsx';
import { SortableList } from './SortableList.tsx';

interface Props {
  ex: OrderEx;
  ids: string[];
  onIds: (ids: string[]) => void;
  disabled: boolean;
  verdict: Verdict | null;
  announce: (m: string) => void;
  onSubmit: () => void;
}

export function OrderMechanic({ ex, ids, onIds, disabled, verdict, announce, onSubmit }: Props) {
  const byId = new Map(ex.items.map((i) => [i.id, i]));
  return (
    <div className="stack">
      <p className="muted small">Glissez les étapes, ou utilisez les boutons ↑ ↓ (Alt+flèche haut ou bas au clavier).</p>
      <SortableList
        ariaLabel="Étapes à ordonner"
        announce={announce}
        disabled={disabled}
        feedback={verdict?.itemFeedback}
        items={ids.map((id) => ({ id, label: byId.get(id)?.text ?? id, content: <Markdown source={byId.get(id)?.text ?? ''} /> }))}
        onChange={onIds}
      />
      <div className="row">
        <button type="button" className="btn primary" onClick={onSubmit} disabled={disabled}>Valider l’ordre</button>
      </div>
    </div>
  );
}
