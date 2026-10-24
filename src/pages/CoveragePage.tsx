import { ALL_EXERCISES } from '../content/index.ts';
import { COMPETENCIES } from '../content/competencies.ts';
import { PATHS } from '../content/paths.ts';
import { EX_TYPE_LABELS, LEVEL_NAMES } from '../content/types.ts';
import type { ExType, Level } from '../content/types.ts';
import { computeCoverage } from '../engine/coverage.ts';
import { tr } from '../i18n/lang.ts';

export const TARGET_TOTAL = 200;
export const TARGET_KQL = 100;

export function CoveragePage() {
  const c = computeCoverage(ALL_EXERCISES);
  return (
    <div className="stack">
      <h1>{tr('Couverture du contenu', 'Content coverage')}</h1>
      <p className="muted">{tr(`Inventaire réel des exercices publiés dans cette version (parcours × niveau × type × compétence). Cibles initiales : ${TARGET_TOTAL} exercices dont ${TARGET_KQL} en KQL.`, `Actual inventory of the exercises published in this version (path × level × type × competency). Initial targets: ${TARGET_TOTAL} exercises including ${TARGET_KQL} in KQL.`)}</p>
      <div className="grid cols-3">
        <div className="card"><p className="muted small">Total</p><h2 style={{ margin: 0 }}>{c.total} / {TARGET_TOTAL}</h2></div>
        <div className="card"><p className="muted small">KQL</p><h2 style={{ margin: 0 }}>{c.kql} / {TARGET_KQL}</h2></div>
        <div className="card"><p className="muted small">{tr('Cases vides (parcours × niveau)', 'Empty cells (path × level)')}</p><h2 style={{ margin: 0 }}>{c.emptyCells.length}</h2></div>
      </div>
      <h2>{tr('Parcours × niveau', 'Path × level')}</h2>
      <div className="table-wrap"><table className="results"><thead><tr><th>{tr('Parcours', 'Path')}</th>{([1, 2, 3, 4] as Level[]).map((l) => <th key={l}>{LEVEL_NAMES[l]}</th>)}<th>Total</th></tr></thead>
        <tbody>{PATHS.map((p) => <tr key={p.id}><td>{p.short}</td>{[1, 2, 3, 4].map((l) => <td key={l}>{c.byPathLevel[p.id][l]}</td>)}<td>{c.byPath[p.id] ?? 0}</td></tr>)}</tbody></table></div>
      <h2>{tr('Par type de mécanique', 'By mechanic type')}</h2>
      <div className="table-wrap"><table className="results"><thead><tr><th>Type</th><th>{tr('Exercices', 'Exercises')}</th></tr></thead><tbody>{(Object.keys(EX_TYPE_LABELS) as ExType[]).map((t) => <tr key={t}><td>{EX_TYPE_LABELS[t]}</td><td>{c.byType[t] ?? 0}</td></tr>)}</tbody></table></div>
      <h2>{tr('Par compétence', 'By competency')}</h2>
      <div className="table-wrap"><table className="results"><thead><tr><th>{tr('Compétence', 'Competency')}</th><th>{tr('Exercices', 'Exercises')}</th></tr></thead><tbody>{COMPETENCIES.map((x) => <tr key={x.id}><td>{x.name}</td><td>{c.byCompetency[x.id] ?? 0}</td></tr>)}</tbody></table></div>
    </div>
  );
}
