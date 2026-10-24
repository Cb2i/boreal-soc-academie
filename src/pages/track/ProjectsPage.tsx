import { useState } from 'react';
import { useTrack } from '../../agentic/TrackContext.tsx';
import type { ProjectStatus } from '../../agentic/state.ts';
import { Inline } from '../../components/Markdown.tsx';
import { tr } from '../../i18n/lang.ts';

const STATUS: { id: ProjectStatus; label: string }[] = [{ id: 'idee', label: 'Idée' }, { id: 'en-cours', label: 'En cours' }, { id: 'realise', label: 'Réalisé' }];

export function ProjectsPage() {
  const { c, p, meta, to } = useTrack();
  const { MODULE_BY_ID, MODULES, PROJECTS } = c;
  const [mod, setMod] = useState('');
  const [level, setLevel] = useState('');
  const list = PROJECTS.filter((x) => (!mod || x.module === mod) && (!level || x.level === level));
  const done = PROJECTS.filter((x) => p.projects[x.id]?.status === 'realise').length;
  return (
    <div className="stack">
      <nav className="crumbs" aria-label={tr('Fil d’Ariane', 'Breadcrumb')}><a href={to()}>{tr(meta.navFr, meta.navEn)}</a> / <span aria-current="page">{tr('Projets', 'Projects')}</span></nav>
      <h1>{tr('Projets', 'Projects')}</h1>
      <p className="lead muted">{tr('Chaque projet décrit un problème, une architecture, des étapes, des critères de réussite et des garde-fous. Vous en suivez l’état vous-même : idée, en cours, réalisé.', 'Each project describes a problem, architecture, steps, success criteria and guardrails.')} <strong>{done}/{PROJECTS.length}</strong> {tr('réalisés.', 'done.')}</p>
      <div className="row filters">
        <label>{tr('Module', 'Module')} <select value={mod} onChange={(e) => setMod(e.target.value)}><option value="">{tr('Tous', 'All')}</option><option value="final">{tr('Projets de synthèse', 'Capstone')}</option>{MODULES.map((m) => <option key={m.id} value={m.id}>{m.n}. {m.title}</option>)}</select></label>
        <label>{tr('Niveau', 'Level')} <select value={level} onChange={(e) => setLevel(e.target.value)}><option value="">{tr('Tous', 'All')}</option><option value="débutant">débutant</option><option value="intermédiaire">intermédiaire</option><option value="avancé">avancé</option></select></label>
      </div>
      <div className="grid cols-3">
        {list.map((x) => {
          const r = p.projects[x.id];
          return (
            <a key={x.id} className="card link" href={to('projet', x.id)}>
              <div className="row"><span className="pill">{x.level}</span><span className="pill">{x.module === 'final' ? tr('Synthèse', 'Capstone') : `${tr('Module', 'Module')} ${MODULE_BY_ID[x.module]?.n}`}</span></div>
              <h3>{x.title}</h3>
              <p className="muted small">{x.problem}</p>
              {r && <span className={`pill${r.status === 'realise' ? ' ok' : ''}`}>{STATUS.find((s) => s.id === r.status)?.label}</span>}
            </a>
          );
        })}
      </div>
      {list.length === 0 && <div className="state">{tr('Aucun projet pour ce filtre.', 'No project for this filter.')}</div>}
    </div>
  );
}

export function ProjectPage({ id }: { id: string }) {
  const { c, p, meta, to, store: aiStore } = useTrack();
  const { LEVELS, MODULE_BY_ID, PROJECT_BY_ID, RESOURCES } = c;
  const x = PROJECT_BY_ID[id];
  if (!x) return <div className="state" role="alert"><h2>{tr('Projet introuvable', 'Project not found')}</h2><a className="btn" href={to('projets')}>{tr('Tous les projets', 'All projects')}</a></div>;
  const r = p.projects[x.id] ?? { status: 'idee' as ProjectStatus, checks: [], notes: '', at: 0 };
  const set = (patch: Partial<typeof r>) => aiStore.set((s) => ({ ...s, projects: { ...s.projects, [x.id]: { ...r, ...patch, at: Date.now() } } }));
  const lv = x.module === 'final' ? LEVELS[5] : LEVELS.find((l) => l.n === MODULE_BY_ID[x.module]?.level) ?? LEVELS[0];
  const res = RESOURCES.filter((q) => x.resources?.includes(q.id));
  const sec = (title: string, body: React.ReactNode) => <section className="card stack"><h2 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h2>{body}</section>;
  const list = (a: string[], ordered = false) => (ordered ? <ol>{a.map((s, i) => <li key={i}><Inline text={s} /></li>)}</ol> : <ul>{a.map((s, i) => <li key={i}><Inline text={s} /></li>)}</ul>);
  return (
    <div className="stack" style={{ ['--pc' as string]: lv.accent }}>
      <nav className="crumbs" aria-label={tr('Fil d’Ariane', 'Breadcrumb')}><a href={to()}>{tr(meta.navFr, meta.navEn)}</a> / <a href={to('projets')}>{tr('Projets', 'Projects')}</a> / <span aria-current="page">{x.title}</span></nav>
      <h1>{x.title}</h1>
      <div className="row"><span className="pill">{x.level}</span>{x.module !== 'final' && <a className="pill" href={to('module', x.module)}>{tr('Module', 'Module')} {MODULE_BY_ID[x.module]?.n}</a>}</div>
      <div className="card stack">
        <h2 style={{ margin: 0, fontSize: '1.1rem' }}>{tr('Votre suivi', 'Your tracking')}</h2>
        <div className="row" role="radiogroup" aria-label={tr('État du projet', 'Project status')}>
          {STATUS.map((s) => <label key={s.id} className="choice" style={{ display: 'inline-flex' }}><input type="radio" name="st" checked={r.status === s.id} onChange={() => set({ status: s.id })} /> <span>{s.label}</span></label>)}
        </div>
        <label htmlFor="pn" className="muted small" style={{ display: 'block' }}>{tr('Notes personnelles (conservées sur cet appareil)', 'Personal notes (kept on this device)')}</label>
        <textarea id="pn" rows={4} style={{ display: 'block', width: '100%', boxSizing: 'border-box' }} value={r.notes} onChange={(e) => set({ notes: e.target.value })} />
      </div>
      {sec(tr('Problème à résoudre', 'Problem to solve'), <p><Inline text={x.problem} /></p>)}
      {sec(tr('Architecture', 'Architecture'), <p><Inline text={x.architecture} /></p>)}
      <div className="grid cols-2">
        {sec(tr('Outils possibles', 'Possible tools'), list(x.tools))}
        {sec(tr('Données nécessaires', 'Data needed'), <p><Inline text={x.data} /></p>)}
      </div>
      {sec(tr('Étapes', 'Steps'), list(x.steps, true))}
      {sec(tr('Critères de réussite', 'Success criteria'), (
        <div className="stack">
          {x.success.map((s, i) => <label key={i} className="choice"><input type="checkbox" checked={r.checks.includes(String(i))} onChange={() => set({ checks: r.checks.includes(String(i)) ? r.checks.filter((c) => c !== String(i)) : [...r.checks, String(i)] })} /><span><Inline text={s} /></span></label>)}
          <p className="muted small">{tr('Cochez ce que votre réalisation satisfait. Aucune note automatique : c’est votre revue.', 'Tick what your work satisfies. No automatic grade.')}</p>
        </div>
      ))}
      <div className="grid cols-2">
        {sec(tr('Risques et garde-fous', 'Risks and guardrails'), list(x.risks))}
        {sec(tr('Extensions possibles', 'Possible extensions'), list(x.extensions))}
      </div>
      {x.connected && sec(tr('Version connectée facultative', 'Optional connected version'), (
        <dl className="defs">
          <dt>{tr('Comptes nécessaires', 'Accounts')}</dt><dd><Inline text={x.connected.accounts} /></dd>
          <dt>{tr('Permissions', 'Permissions')}</dt><dd><Inline text={x.connected.permissions} /></dd>
          <dt>{tr('Coûts possibles', 'Possible costs')}</dt><dd><Inline text={x.connected.costs} /></dd>
          <dt>{tr('Secrets à configurer', 'Secrets to configure')}</dt><dd><Inline text={x.connected.secrets} /></dd>
          <dt>{tr('Nettoyage', 'Cleanup')}</dt><dd><Inline text={x.connected.cleanup} /></dd>
          <dt>{tr('Limites et contrôles humains', 'Limits and human controls')}</dt><dd><Inline text={x.connected.limits} /></dd>
        </dl>
      ))}
      {res.length > 0 && sec(tr('Ressources', 'Resources'), <ul>{res.map((q) => <li key={q.id}><a href={to('ressources') + '?r=' + q.id}>{q.title}</a> <span className={`pill ${q.status === 'teste' ? 'ok' : 'warn'}`}>{q.status === 'teste' ? 'testé' : 'à vérifier'}</span></li>)}</ul>)}
    </div>
  );
}
