import { moduleStats, recommend } from '../../agentic/engine.ts';
import { useTrack } from '../../agentic/TrackContext.tsx';
import { Ring } from '../../components/Ring.tsx';
import { Inline } from '../../components/Markdown.tsx';
import { tr } from '../../i18n/lang.ts';

export function TrackHome() {
  const { c, p, cat: CAT, meta, to, track } = useTrack();
  const { CASE_BY_MODULE, LEVELS, MODULES, PROJECTS, LESSONS, EXERCISES, COMPETENCIES } = c;
  const next = recommend(CAT, p);
  const totalLessons = LESSONS.length;
  const seen = LESSONS.filter((l) => p.lessonsSeen[l.id]).length;
  const validated = COMPETENCIES.filter((c) => {
    const ev = EXERCISES.filter((e) => e.competency === c.id && (e.role === 'eval' || e.role === 'case') && e.type !== 'open');
    return ev.length > 0 && ev.every((e) => p.items[e.id]) && ev.reduce((a, e) => a + p.items[e.id].best, 0) / ev.length >= 0.7;
  }).length;
  const link = next.kind === 'lesson' ? to('cours', next.id) : next.kind === 'evaluation' ? to('evaluation', next.module) : next.kind === 'case' ? to('cas', next.module) : next.kind === 'remediation' ? to('module', next.module) : to('projets');
  const label = next.kind === 'lesson' ? tr('Lire la leçon', 'Read the lesson') : next.kind === 'evaluation' ? tr('Passer l’évaluation', 'Take the assessment') : next.kind === 'case' ? tr('Ouvrir le cas pratique', 'Open the practical case') : next.kind === 'remediation' ? tr('Voir la remédiation', 'See remediation') : tr('Voir les projets', 'See the projects');
  return (
    <div className="stack ai-home">
      <section className="ai-hero reveal">
        <div>
          <span className="kicker">{meta.kickerFr}</span>
          <h1>{tr(meta.titleFr, meta.titleEn)}</h1>
          <p className="lead muted">{track.home?.lead ?? tr(meta.descFr, meta.descEn)}</p>
          <div className="stats-row">
            <span><strong>{MODULES.length}</strong> {tr('modules', 'modules')}</span>
            <span><strong>{totalLessons}</strong> {tr('leçons', 'lessons')}</span>
            <span><strong>{EXERCISES.length}</strong> {tr('exercices et questions', 'exercises and questions')}</span>
            <span><strong>{PROJECTS.length}</strong> {tr('labs', 'labs')}</span>
          </div>
          <p className="muted small">{tr('Le contenu de cette section est rédigé en français uniquement.', 'The content of this section is written in French only.')}</p>
          {(track.home?.notes ?? []).map((n, i) => <p key={i} className="muted small"><Inline text={n} /></p>)}
        </div>
        <aside className="next-card" aria-label={tr('Votre prochaine étape', 'Your next step')}>
          <span className="kicker">{tr('Votre prochaine étape', 'Your next step')}</span>
          {next.kind === 'done' ? <h2>{next.reason}</h2> : <h2>{next.title}</h2>}
          {next.kind !== 'done' && <p className="muted small">{next.reason}</p>}
          <a className="btn primary big" href={link}>{label} →</a>
          <div className="row" style={{ marginTop: '0.6rem' }}>
            <span className="muted small">{tr(`${seen} leçon(s) consultée(s) sur ${totalLessons}`, `${seen} of ${totalLessons} lessons viewed`)}</span>
            <span className="muted small">·</span>
            <span className="muted small">{tr(`${validated} compétence(s) validée(s) sur ${COMPETENCIES.length}`, `${validated} of ${COMPETENCIES.length} skills validated`)}</span>
          </div>
        </aside>
      </section>

      {LEVELS.filter((lv) => lv.capstone || MODULES.some((m) => m.level === lv.n)).map((lv) => {
        const mods = MODULES.filter((m) => m.level === lv.n);
        return (
          <section key={lv.n} className="ai-level" style={{ ['--pc' as string]: lv.accent }} aria-labelledby={`lv-${lv.n}`}>
            <h2 id={`lv-${lv.n}`}><span className="lvl-n">{lv.n}</span> {lv.title}</h2>
            <p className="muted">{lv.summary}</p>
            {lv.n === 6 ? (
              <a className="card link" href={to('projets')}><strong>{tr('Labs de synthèse', 'Capstone labs')}</strong><p className="muted small">{PROJECTS.filter((x) => x.module === 'final').length} {tr('labs complets, avec contexte client, mission, données, parties guidées et corrigés.', 'complete labs.')}</p></a>
            ) : (
              <div className={`grid cols-3${mods.length === 4 ? ' n4' : ''}`}>
                {mods.map((m) => {
                  const st = moduleStats(m, CAT, p, PROJECTS.filter((x) => x.module === m.id).map((x) => x.id));
                  const pct = Math.round(((st.lessonsSeen / st.lessons) * 0.4 + (st.exercisesPassed / st.exercises) * 0.6) * 100);
                  return (
                    <a key={m.id} className="card link ai-mod" href={to('module', m.id)}>
                      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span className="muted small">{tr('Module', 'Module')} {m.n}</span>
                          <h3 style={{ margin: '0.1em 0 0.3em' }}>{m.title}</h3>
                        </div>
                        <Ring pct={pct} size={44} stroke={5} color={lv.accent}><span className="ring-num">{pct}%</span></Ring>
                      </div>
                      <p className="muted small">{m.summary}</p>
                      <p className="muted small">{st.lessons} {tr('leçons', 'lessons')} · {st.competenciesValidated}/{st.competencies} {tr('compétences validées', 'skills validated')}{st.evalScore !== null ? ` · ${tr('évaluation', 'assessment')} ${Math.round(st.evalScore * 100)} %` : ''}</p>
                      {CASE_BY_MODULE[m.id] && st.caseScore !== null && <span className="pill ok">{tr('Cas pratique fait', 'Case done')}</span>}
                    </a>
                  );
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
