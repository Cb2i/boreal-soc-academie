import type { ReactNode } from 'react';
import type { Route } from '../router.ts';
import { HomePage } from './HomePage.tsx';
import { CatalogPage } from './CatalogPage.tsx';
import { PathPage } from './PathPage.tsx';
import { LessonPage } from './LessonPage.tsx';
import { ExercisePage } from './ExercisePage.tsx';
import { DashboardPage } from './DashboardPage.tsx';
import { ReviewPage } from './ReviewPage.tsx';
import { PlaygroundPage } from './PlaygroundPage.tsx';
import { LabsPage } from './LabsPage.tsx';
import { CoveragePage } from './CoveragePage.tsx';
import { LimitsPage } from './LimitsPage.tsx';
import { PlacementPage } from './PlacementPage.tsx';
import { CertificatePage } from './CertificatePage.tsx';

export default function AzureRoutes({ route }: { route: Route }) {
  let page: ReactNode = null;
  switch (route.name) {
    case 'azure': page = <HomePage />; break;
    case 'catalogue': page = <CatalogPage />; break;
    case 'parcours': page = route.params[0] ? <PathPage id={route.params[0]} /> : <CatalogPage />; break;
    case 'cours': page = <LessonPage key={route.params[0]} id={route.params[0] ?? ''} />; break;
    case 'exercice': page = <ExercisePage key={route.params[0]} id={route.params[0] ?? ''} />; break;
    case 'revision': page = route.params[0] ? <ExercisePage key={route.params[0]} id={route.params[0]} review /> : <ReviewPage />; break;
    case 'niveau': page = route.params[0] ? <PlacementPage id={route.params[0]} /> : <CatalogPage />; break;
    case 'certificat': page = <CertificatePage id={route.params[0] ?? ''} />; break;
    case 'tableau': page = <DashboardPage />; break;
    case 'terrain': page = <PlaygroundPage route={route} />; break;
    case 'labos': page = <LabsPage />; break;
    case 'couverture': page = <CoveragePage />; break;
    case 'limites': page = <LimitsPage />; break;
  }
  return <>{page}</>;
}
