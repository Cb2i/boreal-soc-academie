import type { OrderEx } from '../content/types.ts';
import type { Verdict } from '../engine/validate.ts';
import { Markdown } from '../components/Markdown.tsx';
import { SortableList } from './SortableList.tsx';
import { tr } from '../i18n/lang.ts';

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
      <p className="muted small">{tr('Glissez les étapes, ou utilisez les boutons ↑ ↓ (Alt+flèche haut ou bas au clavier).', 'Drag the steps, or use the ↑ ↓ buttons (Alt+up or down arrow on the keyboard).')}</p>
      <SortableList
        ariaLabel={tr('Étapes à ordonner', 'Steps to order')}
        announce={announce}
        disabled={disabled}
        feedback={verdict?.itemFeedback}
        items={ids.map((id) => ({ id, label: byId.get(id)?.text ?? id, content: <Markdown source={byId.get(id)?.text ?? ''} /> }))}
        onChange={onIds}
      />
      <div className="row">
        <button type="button" className="btn primary" onClick={onSubmit} disabled={disabled}>{tr('Valider l’ordre', 'Submit order')}</button>
      </div>
    </div>
  );
}
