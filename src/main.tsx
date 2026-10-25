import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/jetbrains-mono';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/600.css';
import './styles/base.css';
import { App } from './App.tsx';
import { initLang } from './i18n/lang.ts';

// Routage par hash (#/...) : un lien d'ancre interne (#objectifs) ne doit pas changer de route, seulement défiler jusqu'à la section.
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
  if (!a) return;
  const h = a.getAttribute('href') ?? '';
  if (h.length < 2 || h.startsWith('#/')) return;
  const el = document.getElementById(decodeURIComponent(h.slice(1)));
  e.preventDefault();
  if (!el) return;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
});

void initLang().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
