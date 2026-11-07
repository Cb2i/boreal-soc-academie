import type { AiProject } from '../../agentic/types.ts';

type Lvl = AiProject['level'];
const PR = (n: number, level: Lvl, title: string, problem: string, architecture: string, steps: string[], success: string[], risks: string[], extensions: string[]): AiProject => ({
  id: `pf${String(n).padStart(2, '0')}`, module: 'final', level, title, problem, architecture,
  tools: ['Tableur', 'Éditeur de texte'], data: 'Données fictives de Nordlys Technologies fournies dans l’énoncé.',
  steps, success, risks, extensions,
});

export const PURVIEW_FINAL_PROJECTS: AiProject[] = [
  PR(1, 'intermédiaire', 'Programme de classification et d’étiquetage', 'Concevoir pour Nordlys Technologies la taxonomie d’étiquettes, les types d’informations sensibles visés et le plan de déploiement en phases.', 'Document : taxonomie à cinq étiquettes ou moins, politique de publication, étiquetage par défaut, mesure des faux positifs, retour arrière.',
    ['Inventorier les données sensibles.', 'Choisir les types d’informations sensibles et tester les faux positifs.', 'Définir les étiquettes et leur priorité.', 'Planifier la publication par groupes pilotes.', 'Définir les mesures de succès.'],
    ['La taxonomie reste lisible (cinq étiquettes principales ou moins).', 'Chaque type d’information sensible a un test et un seuil.', 'Le retour arrière existe.'], ['Créer trop d’étiquettes.', 'Activer l’étiquetage obligatoire sans pilote.'], ['Ajouter l’étiquetage automatique en simulation.']),
  PR(2, 'avancé', 'Déploiement DLP en quatre temps', 'Planifier une politique DLP du plan à l’application : simulation, simulation avec conseils de politique, puis activation, avec mesure de l’impact.', 'Plan : emplacements, règles, priorités, durées de simulation, critères de passage, communication aux utilisateurs.',
    ['Cadrer les données et les emplacements.', 'Définir les règles et leur priorité.', 'Simuler et mesurer les correspondances.', 'Passer aux conseils de politique.', 'Appliquer et surveiller.'],
    ['Chaque passage a un critère mesurable.', 'Les limites de la simulation sont notées.', 'Le traitement des alertes est décrit.'], ['Appliquer sans simulation.', 'Ignorer les faux positifs.'], ['Relier les alertes au portail Defender.']),
  PR(3, 'avancé', 'Dossier de preuve : audit, rétention et eDiscovery', 'Préparer pour une enquête fictive la chaîne de preuve : recherche d’audit, conservation légale, collecte et exportation.', 'Procédure : rôles, recherche d’audit datée, blocage, recherche, ensemble de révision, exportation, retour arrière.',
    ['Définir les rôles et l’étendue.', 'Rechercher dans l’audit avec dates et accès.', 'Placer le blocage nécessaire.', 'Collecter et réviser.', 'Exporter dans le délai et documenter.'],
    ['Les limites de rétention et de blocage sont citées.', 'La chaîne de preuve est tracée.', 'Les exportations expirent dans le délai documenté.'], ['Confondre rétention et blocage.', 'Oublier l’étendue des unités administratives.'], ['Ajouter l’escalade depuis la gestion des risques internes.']),
];
