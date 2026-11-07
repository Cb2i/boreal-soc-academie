import { tr } from '../i18n/lang.ts';

/** Bouton de recherche de l'en-tête. Séparé de la palette pour que celle-ci (et le contenu qu'elle indexe) se charge à la demande. */
export function SearchButton({ onOpen }: { onOpen: () => void }) {
  const mac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  return (
    <button type="button" className="search-btn" onClick={onOpen} aria-label={tr('Rechercher un exercice, un cours ou une page', 'Search for an exercise, a lesson or a page')} aria-keyshortcuts="Control+K Meta+K">
      <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M13 13l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      <span className="search-label">{tr('Rechercher', 'Search')}</span>
      <kbd>{mac ? '⌘K' : 'Ctrl K'}</kbd>
    </button>
  );
}
