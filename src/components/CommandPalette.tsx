import { useEffect, useMemo, useRef, useState } from 'react';
import { ALL_EXERCISES, ALL_LABS, ALL_LESSONS } from '../content/index.ts';
import { PATHS } from '../content/paths.ts';
import { isUnlocked } from '../engine/unlock.ts';
import { href, navigate } from '../router.ts';
import { useProgress } from '../state/useProgress.ts';
import { tr, useLang } from '../i18n/lang.ts';

interface Item { key: string; label: string; kind: string; hint: string; to: string; locked?: boolean; done?: boolean }

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

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

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const lang = useLang();
  const p = useProgress();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const items = useMemo<Item[]>(() => {
    const pages: Item[] = [
      ['accueil', tr('Accueil', 'Home')],
      ['catalogue', tr('Catalogue', 'Catalog')],
      ['terrain', tr('Terrain de jeu KQL', 'KQL playground')],
      ['tableau', tr('Tableau de bord', 'Dashboard')],
      ['revision', tr('Révision espacée', 'Spaced review')],
      ['labos', tr('Labs Azure', 'Azure labs')],
      ['couverture', tr('Couverture du contenu', 'Content coverage')],
      ['limites', tr('Limites connues', 'Known limits')],
    ].map(([n, l]) => ({ key: `p-${n}`, label: l, kind: tr('Page', 'Page'), hint: '', to: href(n) }));
    const paths: Item[] = PATHS.map((x) => ({ key: `pa-${x.id}`, label: x.title, kind: tr('Parcours', 'Path'), hint: x.topics.join(', '), to: href('parcours', x.id) }));
    const lessons: Item[] = ALL_LESSONS.map((l) => ({ key: `l-${l.id}`, label: l.title, kind: tr('Cours', 'Lesson'), hint: l.summary, to: href('cours', l.id), done: p.lessonsDone.includes(l.id) }));
    const labs: Item[] = ALL_LABS.map((l) => ({ key: `lab-${l.id}`, label: l.title, kind: 'Lab', hint: '', to: href('labos') }));
    const exs: Item[] = ALL_EXERCISES.map((e) => ({
      key: `e-${e.id}`,
      label: e.title,
      kind: e.id,
      hint: e.objective,
      to: href('exercice', e.id),
      locked: !isUnlocked(e, ALL_EXERCISES, p.done, p.settings.unlockAll, p.startLevel[e.path]),
      done: !!p.done[e.id],
    }));
    return [...pages, ...paths, ...lessons, ...labs, ...exs];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, p.done, p.lessonsDone, p.settings.unlockAll, p.startLevel]);

  const results = useMemo(() => {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    if (terms.length === 0) return items.filter((i) => i.key.startsWith('p-') || i.key.startsWith('pa-'));
    const scored: { i: Item; s: number }[] = [];
    for (const i of items) {
      const hay = norm(`${i.label} ${i.kind} ${i.hint}`);
      if (!terms.every((t) => hay.includes(t))) continue;
      const title = norm(i.label);
      const s = terms.reduce((a, t) => a + (title.startsWith(t) ? 3 : title.includes(t) ? 2 : 1), 0) + (i.kind === norm(q) ? 5 : 0);
      scored.push({ i, s });
    }
    return scored.sort((a, b) => b.s - a.s).slice(0, 40).map((x) => x.i);
  }, [q, items]);

  useEffect(() => {
    if (open) {
      opener.current = document.activeElement as HTMLElement | null;
      setQ('');
      setSel(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      opener.current?.focus?.();
    }
  }, [open]);
  useEffect(() => setSel(0), [q]);
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }, [sel, results]);

  if (!open) return null;
  const go = (it: Item | undefined) => {
    if (!it) return;
    onClose();
    navigate(it.to);
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(results.length - 1, s + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); go(results[sel]); }
    else if (e.key === 'Tab') { e.preventDefault(); inputRef.current?.focus(); }
  };
  return (
    <div className="cmd-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cmd" role="dialog" aria-modal="true" aria-label={tr('Rechercher', 'Search')} onKeyDown={onKey}>
        <input
          ref={inputRef}
          autoFocus
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={tr('Rechercher : summarize, NSG, PIM, spray, kql-045…', 'Search: summarize, NSG, PIM, spray, kql-045…')}
          role="combobox"
          aria-expanded="true"
          aria-controls="cmd-list"
          aria-activedescendant={results[sel] ? `cmd-${results[sel].key}` : undefined}
          aria-label={tr('Rechercher dans le contenu', 'Search the content')}
          autoComplete="off"
          spellCheck={false}
        />
        <ul id="cmd-list" ref={listRef} role="listbox" aria-label={tr('Résultats', 'Results')}>
          {results.length === 0 && <li className="cmd-empty" role="option" aria-selected="false">{tr('Aucun résultat. Essayez un autre mot (ex. « jointure », « RBAC »).', 'No results. Try another word (e.g. “join”, “RBAC”).')}</li>}
          {results.map((it, idx) => (
            <li key={it.key} id={`cmd-${it.key}`} role="option" aria-selected={idx === sel} className={idx === sel ? 'on' : ''} onMouseMove={() => setSel(idx)} onClick={() => go(it)}>
              <span className="cmd-kind">{it.kind}</span>
              <span className="cmd-main">
                <strong>{it.label}</strong>
                {it.hint && <span className="cmd-hint">{it.hint}</span>}
              </span>
              <span className="cmd-flags">{it.done ? '✓' : it.locked ? '🔒' : ''}</span>
            </li>
          ))}
        </ul>
        <div className="cmd-foot muted small">
          <span><kbd>↑</kbd> <kbd>↓</kbd> {tr('naviguer', 'navigate')}</span>
          <span><kbd>↵</kbd> {tr('ouvrir', 'open')}</span>
          <span><kbd>Esc</kbd> {tr('fermer', 'close')}</span>
        </div>
      </div>
    </div>
  );
}
