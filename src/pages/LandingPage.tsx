import { ALL_EXERCISES, ALL_LESSONS } from '../content/index.ts';
import { PATHS } from '../content/paths.ts';
import { useStoreProgress } from '../agentic/state.ts';
import { STORES } from '../tracks/stores.ts';
import { TRACKS } from '../tracks/meta.ts';
import { TRACK_ENTRIES } from '../tracks/entries.ts';
import stats from '../tracks/stats.json';
import { useProgress } from '../state/useProgress.ts';
import { href } from '../router.ts';
import { Ring } from '../components/Ring.tsx';
import { tr } from '../i18n/lang.ts';

type Stat = { modules: number; lessons: number; exercises: number; projects: number; competencies: number; resources: number };
const STATS = stats as Record<string, Stat>;

function TrackCard({ id, delay }: { id: string; delay: number }) {
  const meta = TRACKS.find((t) => t.id === id)!;
  const p = useStoreProgress(STORES[id]);
  const st = STATS[id];
  const seen = Object.keys(p.lessonsSeen).length;
  const passed = Object.values(p.items).filter((r) => r.passed).length;
  const pct = st && st.exercises ? Math.min(100, Math.round((passed / st.exercises) * 100)) : 0;
  return (
    <a className="section-card reveal" href={href(meta.route)} style={{ ['--pc' as string]: meta.accent, animationDelay: `${delay}s` }}>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span className="kicker">{meta.kickerFr}</span>
          <h2>{tr(meta.titleFr, meta.titleEn)}</h2>
        </div>
        <Ring pct={pct} size={44} stroke={5} color={meta.accent}><span className="ring-num">{pct}%</span></Ring>
      </div>
      <p className="muted">{tr(meta.descFr, meta.descEn)}</p>
      {st && <p className="muted small">{st.modules} {tr('modules', 'modules')} · {st.lessons} {tr('leçons', 'lessons')} · {st.exercises} {tr('exercices et questions', 'exercises and questions')} · {st.projects} {tr('labs', 'labs')} · {seen} {tr('leçons consultées', 'lessons viewed')} · {st.competencies} {tr('compétences', 'skills')}</p>}
      <span className="btn primary">{seen > 0 ? tr('Continuer', 'Continue') : tr('Commencer', 'Start')} →</span>
    </a>
  );
}

/** Accueil du site : choix de la section. Chaque section a ses contenus et sa progression, stockés séparément. */
export function LandingPage() {
  const az = useProgress();
  const azDone = Object.keys(az.done).length;
  const azPct = Math.round((azDone / ALL_EXERCISES.length) * 100);
  const live = TRACKS.filter((t) => TRACK_ENTRIES[t.route]);
  return (
    <div className="stack landing">
      <section className="hero reveal" style={{ gridTemplateColumns: '1fr' }}>
        <div>
          <span className="pill info">{tr('Gratuit, sans compte, données fictives', 'Free, no account, fictional data')}</span>
          <h1>{tr('Apprendre la cybersécurité Microsoft et l’IA agentique', 'Learn Microsoft security and agentic AI')}</h1>
          <p className="lead muted">{tr('Des sections indépendantes, chacune avec ses cours, ses exercices, ses évaluations et sa progression. Tout s’exécute dans votre navigateur : aucun abonnement Azure, aucune API payante.', 'Independent sections, each with its own lessons, exercises, assessments and progress. Everything runs in your browser.')}</p>
        </div>
      </section>
      <div className="grid section-cards">
        <a className="section-card reveal" href={href('azure')} style={{ ['--pc' as string]: '#3fd0c9', animationDelay: '0.05s' }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="kicker">{tr('Section 1', 'Section 1')}</span>
              <h2>{tr('Azure, Sentinel et KQL', 'Azure, Sentinel and KQL')}</h2>
            </div>
            <Ring pct={azPct} size={44} stroke={5} color="#3fd0c9"><span className="ring-num">{azPct}%</span></Ring>
          </div>
          <p className="muted">{tr('Fondations Azure, identité, observabilité, Sentinel, KQL et enquêtes SOC, avec un moteur KQL local.', 'Azure foundations, identity, observability, Sentinel, KQL and SOC investigations, with a local KQL engine.')}</p>
          <p className="muted small">{PATHS.length} {tr('parcours', 'paths')} · {ALL_LESSONS.length} {tr('cours', 'lessons')} · {ALL_EXERCISES.length} {tr('exercices', 'exercises')} · {azDone} {tr('réussis', 'completed')}</p>
          <span className="btn primary">{azDone > 0 ? tr('Continuer', 'Continue') : tr('Commencer', 'Start')} →</span>
        </a>
        {live.map((t, i) => <TrackCard key={t.id} id={t.id} delay={0.12 + i * 0.07} />)}
      </div>
      <section className="stack" aria-labelledby="how-h">
        <h2 id="how-h">{tr('Comment ça marche', 'How it works')}</h2>
        <ol className="how">
          <li>{tr('Votre progression est enregistrée dans ce navigateur, séparément pour chaque section. Aucune synchronisation entre appareils : exportez puis importez un fichier pour en changer.', 'Progress is stored in this browser, separately for each section. No device sync.')}</li>
          <li>{tr('Les évaluations sont corrigées par des règles déterministes. Les travaux ouverts ont une grille d’autoévaluation, jamais une note automatique.', 'Assessments are graded by deterministic rules. Open work uses a self-assessment grid.')}</li>
          <li>{tr('Les actions sensibles (isoler un appareil, bloquer un compte, supprimer un message) sont toujours simulées.', 'Sensitive actions are always simulated.')}</li>
        </ol>
      </section>
    </div>
  );
}
