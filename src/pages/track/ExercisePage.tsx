import { useTrack } from '../../agentic/TrackContext.tsx';
import { InlineExercise } from '../../agentic/components/InlineExercise.tsx';
import { tr } from '../../i18n/lang.ts';

export function AiExercisePage({ id }: { id: string }) {
  const { c, meta, to } = useTrack();
  const { EX_BY_ID, MODULE_BY_ID } = c;
  const ex = EX_BY_ID[id];
  if (!ex) return <div className="state" role="alert"><h2>{tr('Exercice introuvable', 'Exercise not found')}</h2><a className="btn" href={to()}>{tr('Retour', 'Back')}</a></div>;
  const m = MODULE_BY_ID[ex.module];
  return (
    <div className="stack">
      <nav className="crumbs" aria-label={tr('Fil d’Ariane', 'Breadcrumb')}><a href={to()}>{tr(meta.navFr, meta.navEn)}</a> / <a href={to('module', m.id)}>{tr('Module', 'Module')} {m.n}</a> / <span aria-current="page">{ex.title}</span></nav>
      <InlineExercise ex={ex} />
      {ex.lesson && <p><a href={to('cours', ex.lesson)}>{tr('Relire la leçon associée', 'Re-read the related lesson')}</a></p>}
    </div>
  );
}
