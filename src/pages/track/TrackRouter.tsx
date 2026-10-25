import type { Route } from '../../router.ts';
import { TrackProvider, useTrack } from '../../agentic/TrackContext.tsx';
import type { Track } from '../../agentic/TrackContext.tsx';
import { TrackHome } from './TrackHome.tsx';
import { ModulePage } from './ModulePage.tsx';
import { LessonPage } from './LessonPage.tsx';
import { AiExercisePage } from './ExercisePage.tsx';
import { EvalPage } from './EvalPage.tsx';
import { CasePage } from './CasePage.tsx';
import { ProjectPage, ProjectsPage } from './ProjectsPage.tsx';
import { TrackingPage } from './TrackingPage.tsx';
import { CoveragePage } from './CoveragePage.tsx';
import { ResourcesPage } from './ResourcesPage.tsx';
import { href } from '../../router.ts';
import { tr } from '../../i18n/lang.ts';

/**
 * Routes d'un parcours : #/<route>, #/<route>/module/<id>, /cours/<id>, /exercice/<id>, /evaluation/<module>, /cas/<module>,
 * /projets, /projet/<id>, /suivi, /couverture, /ressources, plus les pages propres au parcours (sources, catalogue, fiche…).
 */
function Inner({ route }: { route: Route }) {
  const { track, meta } = useTrack();
  const [sub, id] = route.params;
  const extra = sub ? track.pages?.[sub] : undefined;
  if (extra) {
    const Extra = extra;
    return <Extra />;
  }
  switch (sub) {
    case undefined:
      return <TrackHome />;
    case 'module':
      return <ModulePage key={id} id={id ?? ''} />;
    case 'cours':
      return <LessonPage key={id} id={id ?? ''} />;
    case 'exercice':
      return <AiExercisePage key={id} id={id ?? ''} />;
    case 'evaluation':
      return <EvalPage key={id} moduleId={id ?? ''} />;
    case 'cas':
      return <CasePage key={id} moduleId={id ?? ''} />;
    case 'projets':
      return <ProjectsPage />;
    case 'projet':
      return <ProjectPage key={id} id={id ?? ''} />;
    case 'suivi':
      return <TrackingPage />;
    case 'couverture':
      return <CoveragePage />;
    case 'ressources':
      return <ResourcesPage focus={route.query.get('r') ?? undefined} />;
    default:
      return <div className="state" role="alert"><h2>{tr('Page introuvable', 'Page not found')}</h2><a className="btn" href={href(meta.route)}>{tr(meta.navFr, meta.navEn)}</a></div>;
  }
}

export function TrackRouter({ track, route }: { track: Track; route: Route }) {
  return (
    <TrackProvider track={track}>
      <Inner route={route} />
    </TrackProvider>
  );
}
