import { ALL_EXERCISES, ALL_LESSONS } from '../content/index.ts';
import { PATHS } from '../content/paths.ts';
import { href } from '../router.ts';
import { useProgress } from '../state/useProgress.ts';
import { rankFor } from '../engine/scoring.ts';
import { totalXp } from '../state/progress.ts';
import { tr } from '../i18n/lang.ts';

export function HomePage() {
  const p = useProgress();
  const xp = totalXp(p);
  const rank = rankFor(xp);
  const doneCount = Object.keys(p.done).length;
  return (
    <div>
      <section className="hero">
        <div>
          <p className="pill info">{tr('Gratuit, sans compte, données fictives', 'Free, no account, fictional data')}</p>
          <h1>{tr(<>Apprenez Azure, Sentinel et <em>KQL</em> en pratiquant.</>, <>Learn Azure, Sentinel and <em>KQL</em> by doing.</>)}</h1>
          <p className="lead">
            {tr(
              'Des niveaux, des défis et des enquêtes SOC, avec un moteur KQL qui s’exécute dans votre navigateur. Aucun abonnement Azure requis : les données sont fictives et générées localement.',
              'Levels, challenges and SOC investigations, with a KQL engine that runs in your browser. No Azure subscription required: the data is fictional and generated locally.',
            )}
          </p>
          <div className="row">
            {p.last ? (
              <a className="btn primary" href={p.last.route}>{tr('Reprendre', 'Resume')} : {p.last.title}</a>
            ) : (
              <a className="btn primary" href={href('exercice', ALL_EXERCISES.find((e) => e.path === 'kql')?.id ?? '')}>{tr('Commencer par le KQL', 'Start with KQL')}</a>
            )}
            <a className="btn" href={href('catalogue')}>{tr('Parcourir le catalogue', 'Browse the catalog')}</a>
            <a className="btn ghost" href={href('terrain')}>{tr('Terrain de jeu KQL', 'KQL playground')}</a>
          </div>
        </div>
        <div className="card" aria-label={tr('Votre progression', 'Your progress')}>
          <h2 style={{ fontSize: '1.1rem' }}>{tr('Votre progression', 'Your progress')}</h2>
          <p style={{ margin: 0 }}><strong>{rank.name}</strong> · {xp} XP · {doneCount} {tr('exercice(s) réussi(s)', 'exercise(s) completed')}</p>
          <div className="bar" style={{ margin: '0.6rem 0' }} role="progressbar" aria-valuenow={rank.pct} aria-valuemin={0} aria-valuemax={100} aria-label={tr('Progression vers le prochain rang', 'Progress toward the next rank')}><span style={{ width: `${rank.pct}%` }} /></div>
          <p className="muted small">{rank.next ? tr(`Prochain rang : ${rank.next.name} à ${rank.next.xp} XP.`, `Next rank: ${rank.next.name} at ${rank.next.xp} XP.`) : tr('Rang maximal atteint.', 'Top rank reached.')} {tr('La progression reste dans ce navigateur.', 'Progress stays in this browser.')}</p>
        </div>
      </section>

      <section aria-labelledby="paths-h" className="stack">
        <h2 id="paths-h">{tr('Sept parcours', 'Seven paths')}</h2>
        <div className="grid cols-3">
          {PATHS.map((pa) => {
            const list = ALL_EXERCISES.filter((e) => e.path === pa.id);
            const done = list.filter((e) => p.done[e.id]).length;
            return (
              <a key={pa.id} className="card link" href={href('parcours', pa.id)} style={{ borderTop: `4px solid ${pa.accent}` }}>
                <h3>{pa.title}</h3>
                <p className="muted small">{pa.description}</p>
                <div className="row small">
                  <span className="pill">{list.length} {tr('exercice(s)', 'exercise(s)')}</span>
                  <span className="pill ok">{done} {tr('réussi(s)', 'completed')}</span>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      <section className="stack" style={{ marginTop: '2rem' }} aria-labelledby="how-h">
        <h2 id="how-h">{tr('Comment ça marche', 'How it works')}</h2>
        <div className="grid cols-3">
          <div className="card"><h3>{tr('1. Lisez un court cours', '1. Read a short lesson')}</h3><p className="muted">{tr(`${ALL_LESSONS.length} cours structurés, avec des exemples exécutables.`, `${ALL_LESSONS.length} structured lessons with runnable examples.`)}</p></div>
          <div className="card"><h3>{tr('2. Pratiquez', '2. Practice')}</h3><p className="muted">{tr('Écrivez du KQL, glissez des blocs, corrigez une configuration, enquêtez sur un incident.', 'Write KQL, drag blocks, fix a configuration, investigate an incident.')}</p></div>
          <div className="card"><h3>{tr('3. Comprenez vos erreurs', '3. Understand your mistakes')}</h3><p className="muted">{tr('Le moteur compare les résultats, pas le texte, et explique la différence.', 'The engine compares results, not text, and explains the difference.')}</p></div>
        </div>
        <p className="muted small">{tr('Les noms, adresses IP et incidents sont inventés. Les adresses appartiennent aux plages de documentation (RFC 5737). Rien n’est envoyé à un serveur.', 'Names, IP addresses and incidents are made up. The addresses belong to the documentation ranges (RFC 5737). Nothing is sent to a server.')}</p>
      </section>
    </div>
  );
}
