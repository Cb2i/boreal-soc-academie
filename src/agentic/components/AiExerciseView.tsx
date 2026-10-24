import { useMemo, useState } from 'react';
import type { AiExercise, ConfigEx, FixEx, OpenEx, QcmEx, ShortEx, WorkflowEx } from '../types.ts';
import { asLegacy } from '../validate.ts';
import type { AiAnswer, AiVerdict } from '../validate.ts';
import type { Verdict } from '../../engine/validate.ts';
import type { InspectEx, MatchEx, OrderEx, PlaceEx } from '../../content/types.ts';
import { Inline, Markdown } from '../../components/Markdown.tsx';
import { OrderMechanic } from '../../mechanics/OrderMechanic.tsx';
import { MatchMechanic } from '../../mechanics/MatchMechanic.tsx';
import { PlaceMechanic } from '../../mechanics/PlaceMechanic.tsx';
import { InspectMechanic } from '../../mechanics/InspectMechanic.tsx';
import { SortableList } from '../../mechanics/SortableList.tsx';
import { useAnnounce } from '../../components/Announcer.tsx';
import { shuffleSeeded } from '../../engine/shuffle.ts';

export function initialAiAnswer(ex: AiExercise): AiAnswer {
  switch (ex.type) {
    case 'qcm':
      return { type: 'qcm', ids: [] };
    case 'short':
      return { type: 'short', value: '' };
    case 'order':
      return { type: 'order', ids: shuffleSeeded(ex.items.map((i) => i.id), ex.id, ex.correct) };
    case 'match':
      return { type: 'match', map: {} };
    case 'place':
      return { type: 'place', map: {} };
    case 'inspect':
      return { type: 'inspect', faulty: [], remedies: {} };
    case 'fix':
      return { type: 'fix', text: ex.starter };
    case 'config':
      return { type: 'config', values: {} };
    case 'workflow':
      return { type: 'workflow', ids: [] };
    case 'open':
      return { type: 'open', checked: [], text: '' };
  }
}

function toLegacyVerdict(v: AiVerdict | null): Verdict | null {
  if (!v) return null;
  return { status: v.correct ? 'perfect' : 'wrong', correct: v.correct, xpFactor: 1, title: v.title, message: v.message, details: v.details, itemFeedback: v.itemFeedback };
}

export interface ViewProps {
  ex: AiExercise;
  answer: AiAnswer;
  onAnswer: (a: AiAnswer) => void;
  verdict: AiVerdict | null;
  disabled: boolean;
  onSubmit: () => void;
  submitLabel?: string;
}

export function AiExerciseView(p: ViewProps) {
  const { ex, answer, onAnswer, verdict, disabled, onSubmit } = p;
  const announce = useAnnounce();
  const lv = toLegacyVerdict(verdict);
  switch (ex.type) {
    case 'qcm':
      return <QcmView ex={ex} ids={(answer as { ids: string[] }).ids} onIds={(ids) => onAnswer({ type: 'qcm', ids })} verdict={verdict} disabled={disabled} onSubmit={onSubmit} label={p.submitLabel} />;
    case 'short':
      return <ShortView ex={ex} value={(answer as { value: string }).value} onValue={(value) => onAnswer({ type: 'short', value })} disabled={disabled} onSubmit={onSubmit} label={p.submitLabel} />;
    case 'order':
      return <OrderMechanic ex={asLegacy(ex) as OrderEx} ids={(answer as { ids: string[] }).ids} onIds={(ids) => onAnswer({ type: 'order', ids })} disabled={disabled} verdict={lv} announce={announce} onSubmit={onSubmit} />;
    case 'match':
      return <MatchMechanic ex={asLegacy(ex) as MatchEx} map={(answer as { map: Record<string, string> }).map} onMap={(map) => onAnswer({ type: 'match', map })} disabled={disabled} verdict={lv} onSubmit={onSubmit} />;
    case 'place':
      return <PlaceMechanic ex={asLegacy(ex) as PlaceEx} map={(answer as { map: Record<string, string> }).map} onMap={(map) => onAnswer({ type: 'place', map })} disabled={disabled} verdict={lv} announce={announce} onSubmit={onSubmit} />;
    case 'inspect': {
      const a = answer as { faulty: string[]; remedies: Record<string, string> };
      return <InspectMechanic ex={asLegacy(ex) as InspectEx} faulty={a.faulty} remedies={a.remedies} onChange={(faulty, remedies) => onAnswer({ type: 'inspect', faulty, remedies })} disabled={disabled} verdict={lv} onSubmit={onSubmit} />;
    }
    case 'fix':
      return <FixView ex={ex} text={(answer as { text: string }).text} onText={(text) => onAnswer({ type: 'fix', text })} disabled={disabled} onSubmit={onSubmit} label={p.submitLabel} />;
    case 'config':
      return <ConfigView ex={ex} values={(answer as { values: Record<string, string | number> }).values} onValues={(values) => onAnswer({ type: 'config', values })} verdict={verdict} disabled={disabled} onSubmit={onSubmit} label={p.submitLabel} />;
    case 'workflow':
      return <WorkflowView ex={ex} ids={(answer as { ids: string[] }).ids} onIds={(ids) => onAnswer({ type: 'workflow', ids })} verdict={verdict} disabled={disabled} announce={announce} onSubmit={onSubmit} label={p.submitLabel} />;
    case 'open':
      return <OpenView ex={ex} a={answer as { checked: string[]; text: string }} onA={(a) => onAnswer({ type: 'open', ...a })} disabled={disabled} onSubmit={onSubmit} />;
  }
}

// --------------------------------------------------------------------- QCM

function QcmView({ ex, ids, onIds, verdict, disabled, onSubmit, label }: { ex: QcmEx; ids: string[]; onIds: (ids: string[]) => void; verdict: AiVerdict | null; disabled: boolean; onSubmit: () => void; label?: string }) {
  const order = useMemo(() => shuffleSeeded(ex.choices.map((c) => c.id), ex.id), [ex.id]);
  const byId = new Map(ex.choices.map((c) => [c.id, c]));
  const revealed = verdict !== null;
  return (
    <div className="stack">
      <fieldset className="stack qcm" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="sr-only">{ex.multi ? 'Plusieurs réponses possibles' : 'Une seule réponse'}</legend>
        {order.map((id) => {
          const c = byId.get(id)!;
          const on = ids.includes(id);
          const fb = revealed ? verdict.itemFeedback?.[id] : undefined;
          return (
            <div key={id} className={`qcm-item${revealed ? (c.correct ? ' is-right' : on ? ' is-wrong' : '') : ''}`}>
              <label className={`choice${fb === true ? ' good' : fb === false ? ' badc' : ''}`}>
                <input type={ex.multi ? 'checkbox' : 'radio'} name={`q-${ex.id}`} checked={on} disabled={disabled} onChange={() => onIds(ex.multi ? (on ? ids.filter((x) => x !== id) : [...ids, id]) : [id])} />
                <span><Inline text={c.text} /></span>
              </label>
              {revealed && (
                <p className="why small">
                  <strong>{c.correct ? 'Bonne réponse' : on ? 'Choix incorrect' : 'À écarter'}.</strong> <Inline text={c.why} />
                </p>
              )}
            </div>
          );
        })}
      </fieldset>
      <div className="row">
        <button type="button" className="btn primary" onClick={onSubmit} disabled={disabled || ids.length === 0}>{label ?? 'Valider'}</button>
        {ex.multi && <span className="muted small">Plusieurs réponses sont possibles.</span>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------- réponse courte

function ShortView({ ex, value, onValue, disabled, onSubmit, label }: { ex: ShortEx; value: string; onValue: (v: string) => void; disabled: boolean; onSubmit: () => void; label?: string }) {
  return (
    <form className="stack" onSubmit={(e) => { e.preventDefault(); if (!disabled && value.trim()) onSubmit(); }}>
      <label htmlFor={`s-${ex.id}`} className="sr-only">Votre réponse</label>
      <input id={`s-${ex.id}`} type="text" value={value} disabled={disabled} placeholder={ex.placeholder ?? 'Votre réponse'} autoComplete="off" spellCheck={false} onChange={(e) => onValue(e.target.value)} />
      <div className="row">
        <button type="submit" className="btn primary" disabled={disabled || !value.trim()}>{label ?? 'Valider'}</button>
      </div>
    </form>
  );
}

// -------------------------------------------------------------- correction

function FixView({ ex, text, onText, disabled, onSubmit, label }: { ex: FixEx; text: string; onText: (t: string) => void; disabled: boolean; onSubmit: () => void; label?: string }) {
  return (
    <div className="stack">
      <label htmlFor={`f-${ex.id}`} className="muted small">Modifiez le texte ci-dessous (langage : {ex.language}).</label>
      <textarea id={`f-${ex.id}`} className="fix-area" rows={Math.min(22, Math.max(8, ex.starter.split('\n').length + 2))} spellCheck={false} value={text} disabled={disabled} onChange={(e) => onText(e.target.value)} />
      <div className="row">
        <button type="button" className="btn primary" onClick={onSubmit} disabled={disabled || !text.trim()}>{label ?? 'Vérifier ma correction'}</button>
        <button type="button" className="btn ghost" disabled={disabled} onClick={() => onText(ex.starter)}>Revenir au texte de départ</button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ configuration

function ConfigView({ ex, values, onValues, verdict, disabled, onSubmit, label }: { ex: ConfigEx; values: Record<string, string | number>; onValues: (v: Record<string, string | number>) => void; verdict: AiVerdict | null; disabled: boolean; onSubmit: () => void; label?: string }) {
  const set = (id: string, v: string | number) => onValues({ ...values, [id]: v });
  const complete = ex.fields.every((f) => values[f.id] !== undefined && values[f.id] !== '');
  return (
    <div className="stack">
      <div className="config-grid">
        {ex.fields.map((f) => {
          const fb = verdict?.itemFeedback?.[f.id];
          const id = `c-${ex.id}-${f.id}`;
          return (
            <div key={f.id} className={`config-row${fb === true ? ' good' : fb === false ? ' badc' : ''}`}>
              <label htmlFor={id}><strong>{f.label}</strong>{f.unit ? <span className="muted small"> ({f.unit})</span> : null}</label>
              {f.kind === 'select' && (
                <select id={id} value={String(values[f.id] ?? '')} disabled={disabled} onChange={(e) => set(f.id, e.target.value)}>
                  <option value="">Choisir…</option>
                  {f.options?.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
                </select>
              )}
              {f.kind === 'toggle' && (
                <select id={id} value={String(values[f.id] ?? '')} disabled={disabled} onChange={(e) => set(f.id, e.target.value)}>
                  <option value="">Choisir…</option>
                  <option value="on">Activé</option>
                  <option value="off">Désactivé</option>
                </select>
              )}
              {f.kind === 'number' && <input id={id} type="number" inputMode="decimal" value={values[f.id] === undefined ? '' : String(values[f.id])} disabled={disabled} onChange={(e) => set(f.id, e.target.value === '' ? '' : Number(e.target.value))} />}
              {verdict && <p className="small why">{fb ? 'Acceptable. ' : 'À revoir. '}<Inline text={f.why} /></p>}
            </div>
          );
        })}
      </div>
      <div className="row"><button type="button" className="btn primary" onClick={onSubmit} disabled={disabled || !complete}>{label ?? 'Valider la configuration'}</button></div>
    </div>
  );
}

// ---------------------------------------------------------------- workflow

function WorkflowView({ ex, ids, onIds, verdict, disabled, announce, onSubmit, label }: { ex: WorkflowEx; ids: string[]; onIds: (ids: string[]) => void; verdict: AiVerdict | null; disabled: boolean; announce: (m: string) => void; onSubmit: () => void; label?: string }) {
  const used = new Set(ids);
  const palette = useMemo(() => shuffleSeeded(ex.blocks.map((b) => b.id), ex.id), [ex.id]);
  const byId = new Map(ex.blocks.map((b) => [b.id, b]));
  const add = (id: string, index?: number) => {
    if (used.has(id) || disabled) return;
    const next = ids.slice();
    next.splice(index ?? next.length, 0, id);
    onIds(next);
    announce(`Nœud ajouté en position ${(index ?? ids.length) + 1}.`);
  };
  return (
    <div className="stack">
      <div>
        <h3 id={`pal-${ex.id}`}>Nœuds disponibles</h3>
        <p className="muted small">Glissez un nœud vers le workflow, ou utilisez « Ajouter ». Au clavier : Tab, Entrée sur « Ajouter », puis Alt+flèches pour réordonner. Certains nœuds sont inutiles ou dangereux : ne les ajoutez que s’ils servent le besoin.</p>
        <div role="group" aria-labelledby={`pal-${ex.id}`} className="stack" style={{ gap: '0.4rem' }}>
          {palette.filter((id) => !used.has(id)).map((id) => (
            <div key={id} className="dnd-item" draggable={!disabled} onDragStart={(e) => { e.dataTransfer.setData('text/plain', id); e.dataTransfer.effectAllowed = 'move'; }}>
              <span className="handle" aria-hidden="true">⋮⋮</span>
              <span className="grow"><Inline text={byId.get(id)!.text} /></span>
              <button type="button" className="btn small" onClick={() => add(id)} disabled={disabled}>Ajouter</button>
            </div>
          ))}
          {palette.every((id) => used.has(id)) && <p className="muted small">Tous les nœuds sont utilisés.</p>}
        </div>
      </div>
      <div onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); const s = e.dataTransfer.getData('text/plain'); if (s && byId.has(s)) add(s); }}>
        <h3>Votre workflow, dans l’ordre</h3>
        {ids.length === 0 ? (
          <div className="zone">Déposez des nœuds ici.</div>
        ) : (
          <SortableList
            ariaLabel="Nœuds du workflow, dans l’ordre"
            announce={announce}
            disabled={disabled}
            feedback={verdict?.itemFeedback}
            items={ids.map((id) => ({ id, label: byId.get(id)?.text ?? id, content: <Inline text={byId.get(id)?.text ?? id} /> }))}
            onChange={onIds}
            onRemove={(id) => onIds(ids.filter((x) => x !== id))}
            onDropExternal={(src, idx) => byId.has(src) && add(src, idx)}
          />
        )}
      </div>
      <div className="row">
        <button type="button" className="btn primary" onClick={onSubmit} disabled={disabled || ids.length === 0}>{label ?? 'Valider mon workflow'}</button>
        <button type="button" className="btn ghost" onClick={() => onIds([])} disabled={disabled || ids.length === 0}>Tout retirer</button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------ travail ouvert

function OpenView({ ex, a, onA, disabled, onSubmit }: { ex: OpenEx; a: { checked: string[]; text: string }; onA: (a: { checked: string[]; text: string }) => void; disabled: boolean; onSubmit: () => void }) {
  const [showModel, setShowModel] = useState(false);
  return (
    <div className="stack">
      <div className="callout"><strong>Livrable demandé.</strong> <Inline text={ex.deliverable} /></div>
      <label htmlFor={`o-${ex.id}`} className="muted small">Votre travail (facultatif, conservé sur cet appareil). Rédigez-le ici ou dans votre propre outil.</label>
      <textarea id={`o-${ex.id}`} rows={8} value={a.text} disabled={disabled} onChange={(e) => onA({ ...a, text: e.target.value })} />
      {ex.model && (
        <div>
          <button type="button" className="btn ghost small" aria-expanded={showModel} onClick={() => setShowModel((v) => !v)}>{showModel ? 'Masquer' : 'Afficher'} un exemple de production</button>
          {showModel && <div className="card" style={{ marginTop: '0.5rem' }}><Markdown source={ex.model} /></div>}
        </div>
      )}
      <fieldset className="stack" style={{ border: 0, padding: 0, margin: 0 }}>
        <legend><strong>Grille d’autoévaluation</strong> <span className="muted small">(cochez ce que votre travail satisfait réellement)</span></legend>
        {ex.rubric.map((r) => (
          <label key={r.id} className="choice">
            <input type="checkbox" checked={a.checked.includes(r.id)} disabled={disabled} onChange={() => onA({ ...a, checked: a.checked.includes(r.id) ? a.checked.filter((x) => x !== r.id) : [...a.checked, r.id] })} />
            <span><Inline text={r.text} /></span>
          </label>
        ))}
      </fieldset>
      <div className="row"><button type="button" className="btn primary" onClick={onSubmit} disabled={disabled}>Enregistrer mon autoévaluation</button></div>
    </div>
  );
}
