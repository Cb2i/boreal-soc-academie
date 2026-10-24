import { ALL_EXERCISES, ALL_LESSONS } from '../content/index.ts';
import { PATHS } from '../content/paths.ts';
import { href } from '../router.ts';
import { useProgress } from '../state/useProgress.ts';
import { rankFor } from '../engine/scoring.ts';
import { totalXp } from '../state/progress.ts';

export function HomePage() {
  const p = useProgress();
  const xp = totalXp(p);
  const rank = rankFor(xp);
  const doneCount = Object.keys(p.done).length;
  return (
    <div>
      <section className="hero">
        <div>
          <p className="pill info">Gratuit, sans compte, données fictives</p>
          <h1>Apprenez Azure, Sentinel et <em>KQL</em> en pratiquant.</h1>
          <p className="lead">
            Des niveaux, des défis et des enquêtes SOC, avec un moteur KQL qui s’exécute dans votre navigateur. Aucun abonnement Azure requis : les données sont fictives et
            générées localement.
          </p>
          <div className="row">
            {p.last ? (
              <a className="btn primary" href={p.last.route}>Reprendre : {p.last.title}</a>
            ) : (
              <a className="btn primary" href={href('exercice', ALL_EXERCISES.find((e) => e.path === 'kql')?.id ?? '')}>Commencer par le KQL</a>
            )}
            <a className="btn" href={href('catalogue')}>Parcourir le catalogue</a>
            <a className="btn ghost" href={href('terrain')}>Terrain de jeu KQL</a>
          </div>
        </div>
        <div className="card" aria-label="Votre progression">
          <h2 style={{ fontSize: '1.1rem' }}>Votre progression</h2>
          <p style={{ margin: 0 }}><strong>{rank.name}</strong> · {xp} XP · {doneCount} exercice(s) réussi(s)</p>
          <div className="bar" style={{ margin: '0.6rem 0' }} role="progressbar" aria-valuenow={rank.pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progression vers le prochain rang"><span style={{ width: `${rank.pct}%` }} /></div>
          <p className="muted small">{rank.next ? `Prochain rang : ${rank.next.name} à ${rank.next.xp} XP.` : 'Rang maximal atteint.'} La progression reste dans ce navigateur.</p>
        </div>
      </section>

      <section aria-labelledby="paths-h" className="stack">
        <h2 id="paths-h">Sept parcours</h2>
        <div className="grid cols-3">
          {PATHS.map((pa) => {
            const list = ALL_EXERCISES.filter((e) => e.path === pa.id);
            const done = list.filter((e) => p.done[e.id]).length;
            return (
              <a key={pa.id} className="card link" href={href('parcours', pa.id)} style={{ borderTop: `4px solid ${pa.accent}` }}>
                <h3>{pa.title}</h3>
                <p className="muted small">{pa.description}</p>
                <div className="row small">
                  <span className="pill">{list.length} exercice(s)</span>
                  <span className="pill ok">{done} réussi(s)</span>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      <section className="stack" style={{ marginTop: '2rem' }} aria-labelledby="how-h">
        <h2 id="how-h">Comment ça marche</h2>
        <div className="grid cols-3">
          <div className="card"><h3>1. Lisez un court cours</h3><p className="muted">{ALL_LESSONS.length} cours structurés, avec des exemples exécutables.</p></div>
          <div className="card"><h3>2. Pratiquez</h3><p className="muted">Écrivez du KQL, glissez des blocs, corrigez une configuration, enquêtez sur un incident.</p></div>
          <div className="card"><h3>3. Comprenez vos erreurs</h3><p className="muted">Le moteur compare les résultats, pas le texte, et explique la différence.</p></div>
        </div>
        <p className="muted small">Les noms, adresses IP et incidents sont inventés. Les adresses appartiennent aux plages de documentation (RFC 5737). Rien n’est envoyé à un serveur.</p>
      </section>
    </div>
  );
}
