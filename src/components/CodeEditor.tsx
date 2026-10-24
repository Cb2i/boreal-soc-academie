import { useRef } from 'react';
import { highlight } from '../kql/index.ts';
import { tr } from '../i18n/lang.ts';

interface Props {
  value: string;
  onChange: (v: string) => void;
  onRun?: () => void;
  label: string;
  error?: { line: number; col: number } | null;
  readOnly?: boolean;
  minRows?: number;
}

/** Éditeur : textarea transparent superposé à une couche colorée. Tab garde son comportement natif (navigation clavier accessible). */
export function CodeEditor({ value, onChange, onRun, label, error, readOnly, minRows = 6 }: Props) {
  const preRef = useRef<HTMLPreElement>(null);
  const tokens = highlight(value + '\n');
  return (
    <div className={`editor${error ? ' err' : ''}`}>
      <pre ref={preRef} aria-hidden="true">
        {tokens.map((t, i) => (t.cls ? <span key={i} className={t.cls}>{t.text}</span> : t.text))}
      </pre>
      <textarea
        aria-label={label}
        aria-describedby="editor-help"
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        readOnly={readOnly}
        rows={minRows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={(e) => {
          if (preRef.current) preRef.current.scrollTop = e.currentTarget.scrollTop;
        }}
        onKeyDown={(e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            onRun?.();
          }
        }}
      />
      <span id="editor-help" className="sr-only">
        {tr('Ctrl plus Entrée exécute la requête. La touche Tab déplace le focus hors de l’éditeur.', 'Ctrl plus Enter runs the query. The Tab key moves focus out of the editor.')}
      </span>
    </div>
  );
}
