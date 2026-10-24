import { ALL_EXERCISES, ALL_LESSONS } from '../content/index.ts';
import { PATHS, PATH_BY_ID } from '../content/paths.ts';
import type { PathId } from '../content/types.ts';
import { href } from '../router.ts';
import { useProgress } from '../state/useProgress.ts';
import { rankFor } from '../engine/scoring.ts';
import { totalXp } from '../state/progress.ts';
import { nextStep, recommendedPath } from '../engine/next.ts';
import type { Step } from '../engine/next.ts';
import { Ring } from '../components/Ring.tsx';
import { tr } from '../i18n/lang.ts';

function stepLink(s: Step): { to: string; title: string; kicker: string } {
  return s.kind === 'lesson'
    ? { to: href('cours', s.lesson.id), title: s.lesson.title, kicker: tr(`Cours · ${s.lesson.minutes} min`, `Lesson · ${s.lesson.minutes} min`) }
    : { to: href('exercice', s.ex.id), title: s.ex.title, kicker: tr(`Exercice · niveau ${s.ex.level}`, `Exercise · level ${s.ex.level}`) };
}

export function HomePage() {
  const p = useProgress();
  const xp = totalXp(p);
  const rank = rankFor(xp);
  const doneCount = Object.keys(p.done).length;
  const total = ALL_EXERCISES.length;
  const fresh = doneCount === 0 && !p.last;
  const recId = recommendedPath(ALL_EXERCISES, PATHS, p);
  const rec = PATH_BY_ID[recId];
  const step = nextStep(ALL_EXERCISES, ALL_LESSONS, recId, p);
  const sl = step ? stepLink(step) : null;

  const profiles: { id: PathId; icon: string; title: string; text: string }[] = [
    { id: 'azure-foundations', icon: '☁', title: tr('Je débute dans Azure', 'I am new to Azure'), text: tr('Portée, ressources, outils : les bases pour ne plus se perdre.', 'Scopes, resources, tools: the basics so you never get lost.') },
    { id: 'kql', icon: '⌕', title: tr('Je veux apprendre le KQL', 'I want to learn KQL'), text: tr('Du filtre à la jointure, avec un moteur local et des données fictives.', 'From filter to join, with a local engine and fictional data.') },
    { id: 'sentinel', icon: '◉', title: tr('Je veux détecter dans Sentinel', 'I want to detect in Sentinel'), text: tr('Règles, automatisation, triage : le quotidien d’un analyste.', 'Rules, automation, triage: an analyst’s daily work.') },
    { id: 'soc', icon: '⚑', title: tr('Je veux enquêter comme en SOC', 'I want to investigate like in a SOC'), text: tr('Des incidents complets à reconstituer, preuves à l’appui.', 'Full incidents to reconstruct, backed by evidence.') },
  ];

  return (
    <div>
      <section className="hero">
        <div className="reveal">
          <p className="pill info">{tr('Gratuit, sans compte, données fictives', 'Free, no account, fictional data')}</p>
          <h1>{tr(<>Apprenez Azure, Sentinel et <em>KQL</em> en pratiquant.</>, <>Learn Azure, Sentinel and <em>KQL</em> by doing.</>)}</h1>
          <p className="lead">
            {tr(
              'Des niveaux, des défis et des enquêtes SOC, avec un moteur KQL qui s’exécute dans votre navigateur. Aucun abonnement Azure requis : les données sont fictives et générées localement.',
              'Levels, challenges and SOC investigations, with a KQL engine that runs in your browser. No Azure subscription required: the data is fictional and generated locally.',
            )}
          </p>
          <div className="stats-row" aria-label={tr('Contenu', 'Content')}>
            <span><strong>{total}</strong> {tr('exercices', 'exercises')}</span>
            <span><strong>{ALL_LESSONS.length}</strong> {tr('cours', 'lessons')}</span>
            <span><strong>{PATHS.length}</strong> {tr('parcours', 'paths')}</span>
            <span><strong>6</strong> {tr('labs', 'labs')}</span>
          </div>
          <div className="row" style={{ marginTop: '1rem' }}>
            <a className="btn ghost" href={href('catalogue')}>{tr('Parcourir le catalogue', 'Browse the catalog')}</a>
            <a className="btn ghost" href={href('terrain')}>{tr('Terrain de jeu KQL', 'KQL playground')}</a>
            <button type="button" className="btn ghost" onClick={() => window.dispatchEvent(new Event('boube:search'))}>{tr('Rechercher', 'Search')} <kbd>Ctrl K</kbd></button>
          </div>
        </div>

        <aside className="next-card reveal" style={{ ['--pc' as string]: rec.accent, animationDelay: '0.1s' }} aria-label={tr('Votre prochaine étape', 'Your next step')}>
          <p className="kicker">{fresh ? tr('Commencez ici', 'Start here') : tr('Votre prochaine étape', 'Your next step')}</p>
          {sl ? (
            <>
              <h2>{sl.title}</h2>
              <p className="muted small">{rec.title} · {sl.kicker}</p>
              <a className="btn primary big" href={sl.to}>{fresh ? tr('Lancer mon premier pas', 'Take my first step') : tr('Continuer', 'Continue')} →</a>
              {p.last && !fresh && <p className="muted small" style={{ marginTop: '0.6rem' }}>{tr('Dernier ouvert', 'Last opened')} : <a href={p.last.route}>{p.last.title}</a></p>}
            </>
          ) : (
            <>
              <h2>{tr('Parcours terminé', 'Path completed')}</h2>
              <p className="muted small">{tr('Choisissez un autre parcours ci-dessous.', 'Pick another path below.')}</p>
            </>
          )}
          <div className="next-prog">
            <Ring pct={rank.pct} size={58} color="var(--accent-2)"><span className="ring-num">{rank.pct}%</span></Ring>
            <div>
              <strong>{rank.name}</strong> · {xp} XP
              <div className="muted small">{doneCount}/{total} {tr('réussis', 'completed')}{rank.next ? ` · ${tr('prochain rang', 'next rank')} ${rank.next.name} (${rank.next.xp} XP)` : ''}</div>
            </div>
          </div>
        </aside>
      </section>

      {doneCount < 3 && (
        <section className="stack reveal" style={{ animationDelay: '0.15s' }} aria-labelledby="start-h">
          <h2 id="start-h">{tr('Par où commencer ?', 'Where to start?')}</h2>
          <div className="grid cols-4">
            {profiles.map((pr) => (
              <a key={pr.id} className="card link profile" href={href('parcours', pr.id)} style={{ ['--pc' as string]: PATH_BY_ID[pr.id].accent }}>
                <span className="profile-icon" aria-hidden="true">{pr.icon}</span>
                <h3>{pr.title}</h3>
                <p className="muted small">{pr.text}</p>
                <span className="go">{tr('Ouvrir le parcours', 'Open the path')} →</span>
              </a>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="paths-h" className="stack" style={{ marginTop: '2rem' }}>
        <h2 id="paths-h">{tr('Vos parcours', 'Your paths')}</h2>
        <div className="grid cols-3 stagger">
          {PATHS.map((pa, idx) => {
            const list = ALL_EXERCISES.filter((e) => e.path === pa.id);
            const done = list.filter((e) => p.done[e.id]).length;
            const pct = list.length ? Math.round((done / list.length) * 100) : 0;
            const isRec = pa.id === recId;
            return (
              <a key={pa.id} className={`card link path-card${isRec ? ' rec' : ''}`} href={href('parcours', pa.id)} style={{ ['--pc' as string]: pa.accent, ['--i' as string]: idx }}>
                {isRec && <span className="ribbon">{tr('Recommandé', 'Recommended')}</span>}
                <div className="path-card-top">
                  <Ring pct={pct} size={52} stroke={6} color={pa.accent}><span className="ring-num">{pct}%</span></Ring>
                  <h3>{pa.title}</h3>
                </div>
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
        <ol className="how">
          <li><h3>{tr('Lisez un court cours', 'Read a short lesson')}</h3><p className="muted">{tr(`${ALL_LESSONS.length} cours structurés, avec des exemples exécutables.`, `${ALL_LESSONS.length} structured lessons with runnable examples.`)}</p></li>
          <li><h3>{tr('Pratiquez', 'Practice')}</h3><p className="muted">{tr('Écrivez du KQL, glissez des blocs, corrigez une configuration, enquêtez sur un incident.', 'Write KQL, drag blocks, fix a configuration, investigate an incident.')}</p></li>
          <li><h3>{tr('Comprenez vos erreurs', 'Understand your mistakes')}</h3><p className="muted">{tr('Le moteur compare les résultats, pas le texte, et explique la différence.', 'The engine compares results, not text, and explains the difference.')}</p></li>
        </ol>
        <p className="muted small">{tr('Les noms, adresses IP et incidents sont inventés. Les adresses appartiennent aux plages de documentation (RFC 5737). Rien n’est envoyé à un serveur.', 'Names, IP addresses and incidents are made up. The addresses belong to the documentation ranges (RFC 5737). Nothing is sent to a server.')}</p>
      </section>
    </div>
  );
}
