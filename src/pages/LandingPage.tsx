import { ALL_EXERCISES, ALL_LESSONS } from '../content/index.ts';
import { PATHS } from '../content/paths.ts';
import { COMPETENCIES as AI_COMP, EXERCISES as AI_EX, LESSONS as AI_LESSONS, MODULES as AI_MODULES, PROJECTS as AI_PROJECTS } from '../agentic/content/index.ts';
import { useAi } from '../agentic/state.ts';
import { useProgress } from '../state/useProgress.ts';
import { href } from '../router.ts';
import { Ring } from '../components/Ring.tsx';
import { tr } from '../i18n/lang.ts';

/** Accueil du site : choix de la grande section. Les deux sections ont des contenus et des progressions indépendants. */
export function LandingPage() {
  const az = useProgress();
  const ai = useAi();
  const azDone = Object.keys(az.done).length;
  const azPct = Math.round((azDone / ALL_EXERCISES.length) * 100);
  const aiSeen = AI_LESSONS.filter((l) => ai.lessonsSeen[l.id]).length;
  const aiPassed = AI_EX.filter((e) => e.role !== 'eval' && ai.items[e.id]?.passed).length;
  const aiTotal = AI_EX.filter((e) => e.role !== 'eval').length || 1;
  const aiPct = Math.round((aiPassed / aiTotal) * 100);
  return (
    <div className="stack landing">
      <section className="hero reveal" style={{ gridTemplateColumns: '1fr' }}>
        <div>
          <span className="pill info">{tr('Gratuit, sans compte, données fictives', 'Free, no account, fictional data')}</span>
          <h1>{tr('Apprendre la cybersécurité Microsoft et l’IA agentique', 'Learn Microsoft security and agentic AI')}</h1>
          <p className="lead muted">{tr('Deux sections indépendantes, chacune avec ses cours, ses exercices, ses évaluations et sa progression. Tout s’exécute dans votre navigateur : aucun abonnement Azure, aucune API payante.', 'Two independent sections, each with its own lessons, exercises, assessments and progress. Everything runs in your browser.')}</p>
        </div>
      </section>
      <div className="grid cols-2 section-cards">
        <a className="section-card reveal" href={href('azure')} style={{ ['--pc' as string]: '#3fd0c9', animationDelay: '0.05s' }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="kicker">{tr('Section 1', 'Section 1')}</span>
              <h2>{tr('Azure, Sentinel et KQL', 'Azure, Sentinel and KQL')}</h2>
            </div>
            <Ring pct={azPct} size={56} stroke={6} color="#3fd0c9"><span className="ring-num">{azPct}%</span></Ring>
          </div>
          <p className="muted">{tr('Fondations Azure, identité, observabilité, Sentinel, KQL et enquêtes SOC, avec un moteur KQL local.', 'Azure foundations, identity, observability, Sentinel, KQL and SOC investigations, with a local KQL engine.')}</p>
          <p className="muted small">{PATHS.length} {tr('parcours', 'paths')} · {ALL_LESSONS.length} {tr('cours', 'lessons')} · {ALL_EXERCISES.length} {tr('exercices', 'exercises')} · {azDone} {tr('réussis', 'completed')}</p>
          <span className="btn primary">{azDone > 0 ? tr('Continuer', 'Continue') : tr('Commencer', 'Start')} →</span>
        </a>
        <a className="section-card reveal" href={href('ia')} style={{ ['--pc' as string]: '#9b8cff', animationDelay: '0.12s' }}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="kicker">{tr('Section 2', 'Section 2')}</span>
              <h2>Agentic AI for Cybersecurity</h2>
            </div>
            <Ring pct={aiPct} size={56} stroke={6} color="#9b8cff"><span className="ring-num">{aiPct}%</span></Ring>
          </div>
          <p className="muted">{tr('Du débutant à l’expert : fondations de l’IA, automatisation et n8n, applications LLM, agents, cybersécurité, sécurité et production, projets.', 'From beginner to expert. Written in French.')}</p>
          <p className="muted small">{AI_MODULES.length} {tr('modules', 'modules')} · {AI_LESSONS.length} {tr('leçons', 'lessons')} · {AI_EX.length} {tr('exercices et questions', 'exercises and questions')} · {AI_PROJECTS.length} {tr('projets', 'projects')} · {aiSeen} {tr('leçons consultées', 'lessons viewed')} · {AI_COMP.length} {tr('compétences', 'skills')}</p>
          <span className="btn primary">{aiSeen > 0 ? tr('Continuer', 'Continue') : tr('Commencer', 'Start')} →</span>
        </a>
      </div>
      <section className="how card stack">
        <h2 style={{ margin: 0 }}>{tr('Comment ça marche', 'How it works')}</h2>
        <ul>
          <li>{tr('Votre progression est enregistrée dans ce navigateur, séparément pour chaque section. Aucune synchronisation entre appareils : exportez puis importez un fichier pour en changer.', 'Progress is stored in this browser, separately for each section. No device sync.')}</li>
          <li>{tr('Les évaluations sont corrigées par des règles déterministes. Les travaux ouverts ont une grille d’autoévaluation, jamais une note automatique.', 'Assessments are graded by deterministic rules. Open work uses a self-assessment grid.')}</li>
          <li>{tr('Les actions sensibles (isoler un appareil, bloquer un compte, supprimer un message) sont toujours simulées.', 'Sensitive actions are always simulated.')}</li>
        </ul>
      </section>
    </div>
  );
}
