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

const nav = (): [string, string][] => [
  ['accueil', tr('Accueil', 'Home')],
  ['catalogue', tr('Catalogue', 'Catalog')],
  ['terrain', tr('Terrain KQL', 'KQL playground')],
  ['tableau', tr('Tableau de bord', 'Dashboard')],
  ['revision', tr('Révision', 'Review')],
  ['labos', tr('Labos', 'Labs')],
];

function Logo() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#0b1626" /><path d="M8 44 Q22 14 32 30 T56 18" fill="none" stroke="#3fd0c9" strokeWidth="6" strokeLinecap="round" /><path d="M8 52 Q24 30 34 42 T56 32" fill="none" stroke="#ffb54d" strokeWidth="4" strokeLinecap="round" opacity=".85" /></svg>
  );
}

function ErrorBoundaryFallback() {
  return (
    <div className="state" role="alert">
      <h2>{tr('Une erreur est survenue', 'Something went wrong')}</h2>
      <p>{tr('Cette page n’a pas pu s’afficher. Votre progression n’est pas perdue.', 'This page could not be displayed. Your progress is not lost.')}</p>
      <a className="btn" href={href('accueil')}>{tr('Retour à l’accueil', 'Back to home')}</a>
    </div>
  );
}

import { Component } from 'react';
import type { ReactNode } from 'react';
import { tr, useLang, setLang } from './i18n/lang.ts';
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
  const lang = useLang();
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
    document.title = `Boube : ${route.name === 'accueil' ? tr('Azure, Sentinel et KQL', 'Azure, Sentinel and KQL') : route.name}`;
  }, [route.name, route.params.join('/'), lang]);

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
          <h2>{tr('Page introuvable', 'Page not found')}</h2>
          <p>{tr('Cette adresse ne correspond à aucune page.', 'This address does not match any page.')}</p>
          <a className="btn" href={href('accueil')}>{tr('Retour à l’accueil', 'Back to home')}</a>
        </div>
      );
  }

  return (
    <AnnouncerProvider>
      <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>{tr('Aller au contenu', 'Skip to content')}</a>
      <header className="site-header">
        <div className="wrap">
          <a className="brand" href={href('accueil')}><Logo /> Boube</a>
          <nav className="nav" aria-label={tr('Navigation principale', 'Main navigation')}>
            {nav().map(([name, label]) => (
              <a key={name} href={href(name)} aria-current={route.name === name ? 'page' : undefined}>{label}</a>
            ))}
          </nav>
          <button
            type="button"
            className="btn small lang-btn"
            lang={lang === 'fr' ? 'en' : 'fr'}
            onClick={() => void setLang(lang === 'fr' ? 'en' : 'fr')}
            aria-label={lang === 'fr' ? 'Switch the interface and content to English' : 'Passer l’interface et le contenu en français'}
            title={lang === 'fr' ? 'English' : 'Français'}
          >
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
          <span className="xp-chip" aria-label={tr(`${xp} points d’expérience`, `${xp} experience points`)}>{xp} XP</span>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="wrap">
        <Boundary resetKey={`${route.name}/${route.params.join('/')}`}>{page}</Boundary>
      </main>
      <footer className="footer">
        <div className="wrap row" style={{ justifyContent: 'space-between' }}>
          <span>{tr('Boube, projet d’apprentissage indépendant. Non affilié à Microsoft. Données fictives.', 'Boube, an independent learning project. Not affiliated with Microsoft. Fictional data.')}</span>
          <span className="row"><a href={href('couverture')}>{tr('Couverture', 'Coverage')}</a><a href={href('limites')}>{tr('Limites', 'Limits')}</a></span>
        </div>
      </footer>
    </AnnouncerProvider>
  );
}
