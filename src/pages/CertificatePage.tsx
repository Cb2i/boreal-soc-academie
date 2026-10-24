import { ALL_EXERCISES } from '../content/index.ts';
import { PATH_BY_ID } from '../content/paths.ts';
import type { PathId } from '../content/types.ts';
import { store } from '../state/progress.ts';
import { useProgress } from '../state/useProgress.ts';
import { href } from '../router.ts';
import { tr } from '../i18n/lang.ts';

export function pathCompletion(pathId: string, p: { done: Record<string, { xp: number; lastAt: number }> }) {
  const exs = ALL_EXERCISES.filter((e) => e.path === pathId);
  const done = exs.filter((e) => p.done[e.id]);
  return {
    total: exs.length,
    done: done.length,
    complete: exs.length > 0 && done.length === exs.length,
    xp: done.reduce((a, e) => a + p.done[e.id].xp, 0),
    at: done.reduce((a, e) => Math.max(a, p.done[e.id].lastAt), 0),
  };
}

export function CertificatePage({ id }: { id: string }) {
  const p = useProgress();
  const path = PATH_BY_ID[id as PathId];
  if (!path) return <div className="state" role="alert"><h2>{tr('Parcours introuvable', 'Path not found')}</h2><a className="btn" href={href('tableau')}>{tr('Tableau de bord', 'Dashboard')}</a></div>;
  const c = pathCompletion(path.id, p);
  if (!c.complete) {
    return (
      <div className="state" role="status">
        <h2>{tr('Certificat pas encore disponible', 'Certificate not available yet')}</h2>
        <p>{tr(`Il reste ${c.total - c.done} exercice(s) à réussir dans « ${path.title} ».`, `${c.total - c.done} exercise(s) left to complete in “${path.title}”.`)}</p>
        <a className="btn primary" href={href('parcours', path.id)}>{tr('Retour au parcours', 'Back to the path')}</a>
      </div>
    );
  }
  const date = new Date(c.at).toLocaleDateString(tr('fr-CA', 'en-CA'), { year: 'numeric', month: 'long', day: 'numeric' });
  const name = p.certName.trim();
  return (
    <div className="stack" style={{ ['--pc' as string]: path.accent }}>
      <div className="no-print stack">
        <nav className="crumbs" aria-label={tr('Fil d’Ariane', 'Breadcrumb')}><a href={href('tableau')}>{tr('Tableau de bord', 'Dashboard')}</a> / <span aria-current="page">{tr('Certificat', 'Certificate')}</span></nav>
        <h1>{tr('Votre certificat', 'Your certificate')}</h1>
        <div className="row">
          <label htmlFor="cert-name">{tr('Nom à afficher', 'Name to display')}</label>
          <input id="cert-name" type="text" maxLength={60} value={p.certName} placeholder={tr('Votre nom', 'Your name')} onChange={(e) => store.set((s) => ({ ...s, certName: e.target.value.slice(0, 60) }))} />
          <button type="button" className="btn primary" onClick={() => window.print()}>{tr('Imprimer ou enregistrer en PDF', 'Print or save as PDF')}</button>
        </div>
        <p className="muted small">{tr('Le nom reste sur cet appareil, dans votre progression locale. Dans la fenêtre d’impression, choisissez « Enregistrer au format PDF » et orientation paysage.', 'The name stays on this device, in your local progress. In the print dialog, choose “Save as PDF” and landscape orientation.')}</p>
      </div>
      <article className="cert" aria-label={tr('Certificat d’accomplissement', 'Certificate of completion')}>
        <div className="cert-brand">Boube</div>
        <p className="cert-kicker">{tr('Certificat d’accomplissement', 'Certificate of completion')}</p>
        <p className="cert-line">{tr('Décerné à', 'Awarded to')}</p>
        <p className="cert-name">{name || tr('Votre nom', 'Your name')}</p>
        <p className="cert-line">{tr('pour avoir réussi tous les exercices du parcours', 'for completing every exercise of the path')}</p>
        <h2 className="cert-path">{path.title}</h2>
        <p className="cert-meta">{tr(`${c.done} exercices réussis · ${c.xp} XP · ${date}`, `${c.done} exercises completed · ${c.xp} XP · ${date}`)}</p>
        <p className="cert-fine">{tr('Attestation personnelle d’un projet d’apprentissage indépendant. Non officielle, non affiliée à Microsoft. Données fictives.', 'Personal attestation from an independent learning project. Unofficial, not affiliated with Microsoft. Fictional data.')}</p>
      </article>
    </div>
  );
}
