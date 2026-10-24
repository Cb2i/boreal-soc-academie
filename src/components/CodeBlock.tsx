import { highlight } from '../kql/index.ts';
import { href } from '../router.ts';

export function HighlightedCode({ code, lang }: { code: string; lang: string }) {
  if (lang === 'kql') {
    return (
      <>
        {highlight(code).map((t, i) => (t.cls ? <span key={i} className={t.cls}>{t.text}</span> : t.text))}
      </>
    );
  }
  return <>{code}</>;
}

export function CodeBlock({ code, lang, playgroundContext }: { code: string; lang: string; playgroundContext?: string }) {
  const runnable = lang === 'kql';
  return (
    <div style={{ marginBottom: '1em' }}>
      <pre className="code" tabIndex={0} aria-label={`Bloc de code ${lang}`}>
        <code>
          <HighlightedCode code={code} lang={lang} />
        </code>
      </pre>
      {runnable && (
        <a className="btn small ghost" href={`${href('terrain')}?q=${encodeURIComponent(code)}&ctx=${playgroundContext ?? 'sentinel'}`}>
          Essayer dans le terrain de jeu
        </a>
      )}
    </div>
  );
}
