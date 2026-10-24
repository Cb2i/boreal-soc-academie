import { useState } from 'react';
import type { InvestigateEx, InvestigateStep } from '../content/types.ts';
import { validateStep, execute, VISIBLE_SEED } from '../engine/validate.ts';
import type { Verdict } from '../engine/validate.ts';
import { CodeBlock } from '../components/CodeBlock.tsx';
import { CodeEditor } from '../components/CodeEditor.tsx';
import { Markdown } from '../components/Markdown.tsx';
import { ResultTable } from '../components/ResultTable.tsx';
import { SchemaPanel } from '../components/SchemaPanel.tsx';
import { tr } from '../i18n/lang.ts';

interface Props {
  ex: InvestigateEx;
  doneSteps: string[];
  onStepDone: (stepId: string, verdict: Verdict) => void;
  onAttempt: (stepId: string) => void;
  disabled: boolean;
  announce: (m: string) => void;
}

function Evidence({ ex, step }: { ex: InvestigateEx; step: InvestigateStep }) {
  return (
    <>
      {(step.evidence ?? []).map((ev, i) => {
        const run = ev.query ? execute(ex.context, ev.query, VISIBLE_SEED) : null;
        return (
          <div className="card stack" key={i}>
            <strong>{tr('Preuve', 'Evidence')} : {ev.title}</strong>
            {ev.text && <Markdown source={ev.text} />}
            {ev.query && <CodeBlock code={ev.query} lang="kql" playgroundContext={ex.context} />}
            {run && run.ok && <ResultTable table={run.table} caption={ev.title} />}
            {run && !run.ok && <div className="verdict bad">{run.error.message}</div>}
          </div>
        );
      })}
    </>
  );
}

function StepView({ ex, step, index, done, current, onDone, onAttempt, announce }: { ex: InvestigateEx; step: InvestigateStep; index: number; done: boolean; current: boolean; onDone: (v: Verdict) => void; onAttempt: () => void; announce: (m: string) => void }) {
  const [ids, setIds] = useState<string[]>([]);
  const [value, setValue] = useState('');
  const [query, setQuery] = useState(step.kql?.starter ?? '');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [showExpl, setShowExpl] = useState(false);
  const open = done || current;
  if (!open) return (
    <li className="card muted">{tr(`Étape ${index + 1} (verrouillée jusqu’à la fin de l’étape précédente)`, `Step ${index + 1} (locked until the previous step is complete)`)}</li>
  );
  const submit = () => {
    const v = validateStep(ex, step, { ids, value, query });
    setVerdict(v);
    announce(v.correct ? tr('Étape validée.', 'Step validated.') : tr('Réponse incorrecte pour cette étape.', 'Incorrect answer for this step.'));
    if (v.correct) {
      setShowExpl(true);
      onDone(v);
    } else onAttempt();
  };
  return (
    <li className="card stack" aria-current={current ? 'step' : undefined}>
      <h3>{tr('Étape', 'Step')} {index + 1} {done && <span className="pill ok">{tr('réussie', 'completed')}</span>}</h3>
      <Markdown source={step.prompt} />
      <Evidence ex={ex} step={step} />
      {step.kind === 'kql' && (
        <>
          <SchemaPanel context={ex.context} tables={ex.tables} />
          <CodeEditor value={query} onChange={setQuery} label={tr(`Requête de l’étape ${index + 1}`, `Query for step ${index + 1}`)} readOnly={done} onRun={submit} />
        </>
      )}
      {(step.kind === 'choice' || step.kind === 'multi') && (
        <fieldset style={{ border: 0, padding: 0, margin: 0 }} className="stack">
          <legend className="sr-only">{tr('Réponses possibles', 'Possible answers')}</legend>
          {(step.choices ?? []).map((c) => {
            const on = ids.includes(c.id);
            return (
              <label key={c.id} className="choice">
                <input type={step.kind === 'multi' ? 'checkbox' : 'radio'} name={`st-${step.id}`} checked={on} disabled={done} onChange={() => setIds(step.kind === 'multi' ? (on ? ids.filter((x) => x !== c.id) : [...ids, c.id]) : [c.id])} />
                <span>{c.text}</span>
              </label>
            );
          })}
        </fieldset>
      )}
      {step.kind === 'number' && (
        <div className="row">
          <label htmlFor={`n-${step.id}`} className="sr-only">{tr('Votre réponse', 'Your answer')}</label>
          <input id={`n-${step.id}`} type="text" value={value} disabled={done} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
        </div>
      )}
      {!done && <div className="row"><button type="button" className="btn primary" onClick={submit}>{tr('Valider cette étape', 'Submit this step')}</button></div>}
      <div aria-live="polite">
        {verdict && !verdict.correct && (
          <div className="verdict bad anim-pop">
            <h3>{verdict.title}</h3>
            <p>{verdict.message}</p>
            {verdict.hint && <p className="muted">{tr('Piste', 'Hint')} : {verdict.hint}</p>}
            {verdict.examples?.map((e, i) => <p key={i} className="small muted">{e}</p>)}
          </div>
        )}
        {(done || showExpl) && (
          <div className="verdict ok anim-pop">
            <h3>{tr('Explication', 'Explanation')}</h3>
            <Markdown source={step.explanation} />
          </div>
        )}
      </div>
    </li>
  );
}

export function InvestigateMechanic({ ex, doneSteps, onStepDone, onAttempt, announce }: Props) {
  const firstOpen = ex.steps.findIndex((s) => !doneSteps.includes(s.id));
  return (
    <div className="stack">
      <div className="callout"><Markdown source={ex.scenario} /></div>
      <div className="bar" role="progressbar" aria-valuemin={0} aria-valuemax={ex.steps.length} aria-valuenow={doneSteps.length} aria-label={tr('Progression de l’enquête', 'Investigation progress')}><span style={{ width: `${(doneSteps.length / ex.steps.length) * 100}%` }} /></div>
      <ol style={{ listStyle: 'none', padding: 0 }} className="stack">
        {ex.steps.map((s, i) => (
          <StepView key={s.id} ex={ex} step={s} index={i} done={doneSteps.includes(s.id)} current={i === firstOpen} onDone={(v) => onStepDone(s.id, v)} onAttempt={() => onAttempt(s.id)} announce={announce} />
        ))}
      </ol>
    </div>
  );
}
