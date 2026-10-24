import { useTrack } from '../../agentic/TrackContext.tsx';
import { tr } from '../../i18n/lang.ts';

/** Matrice de couverture : module, compétence, leçons, exercices, évaluation, projets. Générée depuis le contenu. */
export function CoveragePage() {
  const { c, meta, to } = useTrack();
  const { CASE_BY_MODULE, COMP_BY_ID, EXERCISES, LESSONS, MODULES, PROJECTS } = c;
  const rows = MODULES.flatMap((m) =>
    m.competencies.map((cid, i) => {
      const c = COMP_BY_ID[cid];
      const lessons = LESSONS.filter((l) => l.module === m.id && EXERCISES.some((e) => e.competency === c.id && (e.id === l.guided || e.id === l.autonomous || l.quiz.includes(e.id))));
      const lessonEx = EXERCISES.filter((e) => e.competency === c.id && (e.role === 'guided' || e.role === 'autonomous' || e.role === 'quiz'));
      const ev = EXERCISES.filter((e) => e.competency === c.id && e.role === 'eval');
      const cs = EXERCISES.filter((e) => e.competency === c.id && e.role === 'case');
      return { m, c, first: i === 0, span: m.competencies.length, lessons, lessonEx, ev, cs };
    }),
  );
  const proj = (id: string) => PROJECTS.filter((p) => p.module === id);
  return (
    <div className="stack">
      <nav className="crumbs" aria-label={tr('Fil d’Ariane', 'Breadcrumb')}><a href={to()}>{tr(meta.navFr, meta.navEn)}</a> / <span aria-current="page">{tr('Couverture', 'Coverage')}</span></nav>
      <h1>{tr('Matrice de couverture', 'Coverage matrix')}</h1>
      <p className="muted">{tr('Pour chaque module : les compétences visées, les leçons et exercices qui les enseignent, les évaluations et cas pratiques qui les vérifient, et les projets qui les prolongent. La matrice est générée depuis le contenu : si un maillon manque, les tests échouent.', 'For each module: skills, lessons and exercises, assessments and cases, projects. Generated from the content.')}</p>
      <div className="table-wrap">
        <table className="grid-table coverage">
          <thead><tr><th scope="col">{tr('Module', 'Module')}</th><th scope="col">{tr('Compétence', 'Skill')}</th><th scope="col">{tr('Leçons', 'Lessons')}</th><th scope="col">{tr('Exercices', 'Exercises')}</th><th scope="col">{tr('Évaluation', 'Assessment')}</th><th scope="col">{tr('Cas pratique', 'Case')}</th><th scope="col">{tr('Projets', 'Projects')}</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.c.id}>
                {r.first && <th scope="rowgroup" rowSpan={r.span}><a href={to('module', r.m.id)}>{r.m.n}. {r.m.title}</a></th>}
                <td>{r.c.name}</td>
                <td>{r.lessons.map((l, i) => <span key={l.id}>{i > 0 ? ', ' : ''}<a href={to('cours', l.id)}>{l.title}</a></span>)}</td>
                <td>{r.lessonEx.length}</td>
                <td>{r.ev.length}</td>
                <td>{r.cs.length ? `${r.cs.length} (${CASE_BY_MODULE[r.m.id]?.title ?? ''})` : '-'}</td>
                {r.first && <td rowSpan={r.span}>{proj(r.m.id).map((p) => <div key={p.id}><a href={to('projet', p.id)}>{p.title}</a></div>)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
