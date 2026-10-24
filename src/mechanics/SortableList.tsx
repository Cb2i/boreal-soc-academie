import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { tr } from '../i18n/lang.ts';

export interface SortItem {
  id: string;
  content: ReactNode;
  label: string;
}

interface Props {
  items: SortItem[];
  onChange: (ids: string[]) => void;
  feedback?: Record<string, boolean>;
  disabled?: boolean;
  onRemove?: (id: string) => void;
  /** Identifiant de groupe pour accepter des éléments déposés depuis l'extérieur. */
  onDropExternal?: (externalId: string, index: number) => void;
  ariaLabel: string;
  announce: (msg: string) => void;
}

export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length || from === to) return arr;
  const copy = arr.slice();
  const [x] = copy.splice(from, 1);
  copy.splice(to, 0, x);
  return copy;
}

/** Liste réordonnable : glisser-déposer + boutons + Alt+flèches (alternative accessible au glisser-déposer). */
export function SortableList({ items, onChange, feedback, disabled, onRemove, onDropExternal, ariaLabel, announce }: Props) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLLIElement | null>>({});
  const ids = items.map((i) => i.id);

  const move = (id: string, delta: number) => {
    const from = ids.indexOf(id);
    const to = from + delta;
    if (to < 0 || to >= ids.length) return;
    onChange(moveItem(ids, from, to));
    const it = items[from];
    announce(tr(`${it.label} déplacé en position ${to + 1} sur ${ids.length}.`, `${it.label} moved to position ${to + 1} of ${ids.length}.`));
    requestAnimationFrame(() => refs.current[id]?.focus());
  };

  return (
    <ol className="dnd-list" aria-label={ariaLabel}>
      {items.map((it, idx) => {
        const fb = feedback?.[it.id];
        return (
          <li
            key={it.id}
            ref={(el) => {
              refs.current[it.id] = el;
            }}
            tabIndex={0}
            className={`dnd-item${dragId === it.id ? ' dragging' : ''}${overId === it.id ? ' over' : ''}${fb === true ? ' good' : fb === false ? ' badc' : ''}`}
            draggable={!disabled}
            onDragStart={(e) => {
              setDragId(it.id);
              e.dataTransfer.setData('text/plain', it.id);
              e.dataTransfer.effectAllowed = 'move';
            }}
            onDragEnd={() => {
              setDragId(null);
              setOverId(null);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setOverId(it.id);
            }}
            onDragLeave={() => setOverId((o) => (o === it.id ? null : o))}
            onDrop={(e) => {
              e.preventDefault();
              const src = e.dataTransfer.getData('text/plain') || dragId;
              setOverId(null);
              setDragId(null);
              if (!src) return;
              if (ids.includes(src)) onChange(moveItem(ids, ids.indexOf(src), idx));
              else onDropExternal?.(src, idx);
            }}
            onKeyDown={(e) => {
              if (disabled) return;
              if (e.altKey && e.key === 'ArrowUp') {
                e.preventDefault();
                move(it.id, -1);
              } else if (e.altKey && e.key === 'ArrowDown') {
                e.preventDefault();
                move(it.id, 1);
              }
            }}
            aria-label={tr(`${idx + 1} sur ${ids.length} : ${it.label}. Alt plus flèche haut ou bas pour déplacer.`, `${idx + 1} of ${ids.length}: ${it.label}. Alt plus up or down arrow to move.`)}
          >
            <span className="handle" aria-hidden="true">⋮⋮</span>
            <span className="grow">{it.content}</span>
            {fb === true && <span className="pill ok">{tr('bien placé', 'well placed')}</span>}
            {fb === false && <span className="pill bad">{tr('à revoir', 'review')}</span>}
            {!disabled && (
              <span className="row" style={{ gap: '0.25rem' }}>
                <button type="button" className="btn small icon-btn" onClick={() => move(it.id, -1)} disabled={idx === 0} aria-label={tr(`Monter : ${it.label}`, `Move up: ${it.label}`)}>↑</button>
                <button type="button" className="btn small icon-btn" onClick={() => move(it.id, 1)} disabled={idx === items.length - 1} aria-label={tr(`Descendre : ${it.label}`, `Move down: ${it.label}`)}>↓</button>
                {onRemove && (
                  <button type="button" className="btn small icon-btn danger" onClick={() => onRemove(it.id)} aria-label={tr(`Retirer : ${it.label}`, `Remove: ${it.label}`)}>✕</button>
                )}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
