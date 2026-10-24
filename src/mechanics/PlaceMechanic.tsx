import { useState } from 'react';
import type { PlaceEx } from '../content/types.ts';
import type { Verdict } from '../engine/validate.ts';
import { tr } from '../i18n/lang.ts';

interface Props {
  ex: PlaceEx;
  map: Record<string, string>;
  onMap: (m: Record<string, string>) => void;
  disabled: boolean;
  verdict: Verdict | null;
  announce: (m: string) => void;
  onSubmit: () => void;
}

export function PlaceMechanic({ ex, map, onMap, disabled, verdict, announce, onSubmit }: Props) {
  const [over, setOver] = useState<string | null>(null);
  const place = (itemId: string, zoneId: string) => {
    const next = { ...map };
    if (zoneId) next[itemId] = zoneId;
    else delete next[itemId];
    onMap(next);
    const it = ex.items.find((i) => i.id === itemId);
    const z = ex.zones.find((zz) => zz.id === zoneId);
    announce(zoneId ? tr(`${it?.text} placé dans ${z?.label}.`, `${it?.text} placed in ${z?.label}.`) : tr(`${it?.text} retiré.`, `${it?.text} removed.`));
  };
  const chip = (id: string) => {
    const it = ex.items.find((i) => i.id === id)!;
    const fb = verdict?.itemFeedback?.[id];
    return (
      <span
        key={id}
        className={`chip${fb === true ? ' good' : fb === false ? ' badc' : ''}`}
        draggable={!disabled}
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', id);
          e.dataTransfer.effectAllowed = 'move';
        }}
      >
        {it.text}
        <label className="sr-only" htmlFor={`pl-${id}`}>{tr('Placer', 'Place')} {it.text} {tr('dans', 'in')}</label>
        <select id={`pl-${id}`} value={map[id] ?? ''} disabled={disabled} onChange={(e) => place(id, e.target.value)} style={{ minHeight: 28, padding: '0.1rem 0.3rem' }}>
          <option value="">{tr('Non placé', 'Not placed')}</option>
          {ex.zones.map((z) => (
            <option key={z.id} value={z.id}>{z.label}</option>
          ))}
        </select>
      </span>
    );
  };
  const unplaced = ex.items.filter((i) => !map[i.id]);
  return (
    <div className="stack">
      <p className="muted small">{tr('Glissez chaque élément vers une zone, ou choisissez la zone dans la liste « Placer dans » (alternative clavier et tactile).', 'Drag each item into a zone, or choose the zone from the “Place in” list (keyboard and touch alternative).')}</p>
      <div>
        <h3>{tr('À placer', 'To place')}</h3>
        <div className="zone" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const s = e.dataTransfer.getData('text/plain'); if (s) place(s, ''); }}>
          {unplaced.length === 0 ? <span className="muted small">{tr('Tous les éléments sont placés.', 'All items are placed.')}</span> : unplaced.map((i) => chip(i.id))}
        </div>
      </div>
      <div className="grid cols-2">
        {ex.zones.map((z) => (
          <div
            key={z.id}
            className={`zone${over === z.id ? ' over' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setOver(z.id); }}
            onDragLeave={() => setOver(null)}
            onDrop={(e) => { e.preventDefault(); setOver(null); const s = e.dataTransfer.getData('text/plain'); if (s) place(s, z.id); }}
            role="group"
            aria-label={tr(`Zone : ${z.label}`, `Zone: ${z.label}`)}
          >
            <h4>{z.label}</h4>
            {z.description && <p className="muted small">{z.description}</p>}
            {ex.items.filter((i) => map[i.id] === z.id).map((i) => chip(i.id))}
          </div>
        ))}
      </div>
      <div className="row">
        <button type="button" className="btn primary" onClick={onSubmit} disabled={disabled}>{tr('Valider le placement', 'Submit placement')}</button>
      </div>
    </div>
  );
}
