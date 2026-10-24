import { useEffect } from 'react';
import { useRoute, href } from './router.ts';
import { AnnouncerProvider } from './components/Announcer.tsx';
import { useProgress } from './state/useProgress.ts';
import { totalXp } from './state/progress.ts';
import { HomePage } from './pages/HomePage.tsx';
import { CatalogPage } from './pages/CatalogPage.tsx';
import { PathPage } from './pages/PathPage.tsx';
import { LessonPage } from './pages/LessonPage.tsx';
import { ExercisePage } from './pages/ExercisePage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { ReviewPage } from './pages/ReviewPage.tsx';
import { PlaygroundPage } from './pages/PlaygroundPage.tsx';
import { LabsPage } from './pages/LabsPage.tsx';
import { CoveragePage } from './pages/CoveragePage.tsx';
import { LimitsPage } from './pages/LimitsPage.tsx';

const NAV: [string, string][] = [
  ['accueil', 'Accueil'],
  ['catalogue', 'Catalogue'],
  ['terrain', 'Terrain KQL'],
  ['tableau', 'Tableau de bord'],
  ['revision', 'Révision'],
  ['labos', 'Labos'],
];

function Logo() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#0b1626" /><path d="M8 44 Q22 14 32 30 T56 18" fill="none" stroke="#3fd0c9" strokeWidth="6" strokeLinecap="round" /><path d="M8 52 Q24 30 34 42 T56 32" fill="none" stroke="#ffb54d" strokeWidth="4" strokeLinecap="round" opacity=".85" /></svg>
  );
}

function ErrorBoundaryFallback() {
  return (
    <div className="state" role="alert">
      <h2>Une erreur est survenue</h2>
      <p>Cette page n’a pas pu s’afficher. Votre progression n’est pas perdue.</p>
      <a className="btn" href={href('accueil')}>Retour à l’accueil</a>
    </div>
  );
}

import { Component } from 'react';
import type { ReactNode } from 'react';
class Boundary extends Component<{ children: ReactNode; resetKey: string }, { failed: boolean; key: string }> {
  state = { failed: false, key: this.props.resetKey };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  static getDerivedStateFromProps(props: { resetKey: string }, st: { failed: boolean; key: string }) {
    return props.resetKey !== st.key ? { failed: false, key: props.resetKey } : null;
  }
  render() {
    return this.state.failed ? <ErrorBoundaryFallback /> : this.props.children;
  }
}

export function App() {
  const route = useRoute();
  const p = useProgress();
  const xp = totalXp(p);

  useEffect(() => {
    const root = document.documentElement;
    if (p.settings.theme === 'auto') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', p.settings.theme);
    const m = p.settings.reducedMotion;
    if (m === 'auto') root.removeAttribute('data-motion');
    else root.setAttribute('data-motion', m === 'on' ? 'reduced' : 'off');
  }, [p.settings.theme, p.settings.reducedMotion]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const h = document.getElementById('main');
    h?.focus({ preventScroll: true });
    document.title = `Boréal : ${route.name === 'accueil' ? 'Azure, Sentinel et KQL' : route.name}`;
  }, [route.name, route.params.join('/')]);

  let page: ReactNode;
  switch (route.name) {
    case 'accueil': page = <HomePage />; break;
    case 'catalogue': page = <CatalogPage />; break;
    case 'parcours': page = route.params[0] ? <PathPage id={route.params[0]} /> : <CatalogPage />; break;
    case 'cours': page = <LessonPage id={route.params[0] ?? ''} />; break;
    case 'exercice': page = <ExercisePage id={route.params[0] ?? ''} />; break;
    case 'revision': page = route.params[0] ? <ExercisePage id={route.params[0]} review /> : <ReviewPage />; break;
    case 'tableau': page = <DashboardPage />; break;
    case 'terrain': page = <PlaygroundPage route={route} />; break;
    case 'labos': page = <LabsPage />; break;
    case 'couverture': page = <CoveragePage />; break;
    case 'limites': page = <LimitsPage />; break;
    default:
      page = (
        <div className="state" role="alert">
          <h2>Page introuvable</h2>
          <p>Cette adresse ne correspond à aucune page.</p>
          <a className="btn" href={href('accueil')}>Retour à l’accueil</a>
        </div>
      );
  }

  return (
    <AnnouncerProvider>
      <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>Aller au contenu</a>
      <header className="site-header">
        <div className="wrap">
          <a className="brand" href={href('accueil')}><Logo /> Boréal</a>
          <nav className="nav" aria-label="Navigation principale">
            {NAV.map(([name, label]) => (
              <a key={name} href={href(name)} aria-current={route.name === name ? 'page' : undefined}>{label}</a>
            ))}
          </nav>
          <span className="xp-chip" aria-label={`${xp} points d’expérience`}>{xp} XP</span>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="wrap">
        <Boundary resetKey={`${route.name}/${route.params.join('/')}`}>{page}</Boundary>
      </main>
      <footer className="footer">
        <div className="wrap row" style={{ justifyContent: 'space-between' }}>
          <span>Boréal, projet d’apprentissage indépendant. Non affilié à Microsoft. Données fictives.</span>
          <span className="row"><a href={href('couverture')}>Couverture</a><a href={href('limites')}>Limites</a></span>
        </div>
      </footer>
    </AnnouncerProvider>
  );
}
