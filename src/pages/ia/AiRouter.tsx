import type { Route } from '../../router.ts';
import { AiHome } from './AiHome.tsx';
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

/** Routes de la section : #/ia, #/ia/module/m01, #/ia/cours/<id>, #/ia/exercice/<id>, #/ia/evaluation/m01, #/ia/cas/m01, #/ia/projets, #/ia/projet/<id>, #/ia/suivi, #/ia/couverture, #/ia/ressources. */
export function AiRouter({ route }: { route: Route }) {
  const [sub, id] = route.params;
  switch (sub) {
    case undefined:
      return <AiHome />;
    case 'module':
      return <ModulePage id={id ?? ''} />;
    case 'cours':
      return <LessonPage id={id ?? ''} />;
    case 'exercice':
      return <AiExercisePage id={id ?? ''} />;
    case 'evaluation':
      return <EvalPage moduleId={id ?? ''} />;
    case 'cas':
      return <CasePage moduleId={id ?? ''} />;
    case 'projets':
      return <ProjectsPage />;
    case 'projet':
      return <ProjectPage id={id ?? ''} />;
    case 'suivi':
      return <TrackingPage />;
    case 'couverture':
      return <CoveragePage />;
    case 'ressources':
      return <ResourcesPage focus={route.query.get('r') ?? undefined} />;
    default:
      return <div className="state" role="alert"><h2>{tr('Page introuvable', 'Page not found')}</h2><a className="btn" href={href('ia')}>Agentic AI</a></div>;
  }
}
