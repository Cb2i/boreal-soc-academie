import { cap } from '../model.ts';

export const CAPS_D20 = [
  cap('d20.connecteurs', 'Connecteurs DevOps (GitHub, Azure DevOps, GitLab)', {
    plan: 'CSPM de base pour la connexion', obj: 'Découvrir dépôts et pipelines et évaluer la posture DevOps.', risk: 'Compte autorisant perdu ou surprivilégié.',
    clouds: 'Azure commercial', scope: 'Organisations, projets et groupes', req: 'Plateforme prise en charge dans une région listée', perm: 'Droits d’administration de la plateforme; Contributor ou Security Admin sur l’abonnement', cost: 'Connexion Azure DevOps sans frais supplémentaires; fonctions payantes selon le plan',
    collect: 'Inventaire de dépôts et builds, constats de posture', compat: 'Application GitHub, autorisation Azure DevOps ou GitLab', limits: 'Pas de cloud souverain; pas de résidence des données GitHub; un seul connecteur par organisation et locataire.', nature: 'integration', src: ['devops', 'devops-support', 'devops-github', 'devops-ado'], lessons: ['d20-l1'],
  }),
  cap('d20.sans-agent', 'Analyse de code sans agent', {
    plan: 'Defender CSPM', obj: 'Analyser dépôts et IaC sans modifier les pipelines.', risk: 'Fonction en préversion utilisée en production sans réserve.',
    clouds: 'Azure commercial', scope: 'Azure DevOps et GitHub', req: 'Connecteur et plan activés; dépôt de moins de 1 Go', perm: 'Project Collection Administrator et Contributor sur l’abonnement', cost: 'Selon le plan Defender CSPM',
    collect: 'Contenu du dépôt pour analyse', compat: 'Outils de Template Analyzer, Checkov, Bandit, ESLint, Trivy et Syft', limits: 'Préversion; analyse quotidienne de la branche par défaut.', nature: 'licence-supplementaire', src: ['devops-agentless', 'devops-support'], lessons: ['d20-l2'],
  }),
  cap('d20.msdo', 'Microsoft Security DevOps (action et extension)', {
    plan: 'CSPM de base pour l’IaC', obj: 'Analyser le code dans les pipelines et alimenter les annotations.', risk: 'Workflow modifié sans revue.',
    clouds: 'Azure commercial', scope: 'Dépôts et pipelines choisis', req: 'Connecteur; permissions de workflow en lecture et écriture; id-token: write', perm: 'Write sur le dépôt GitHub; Project Collection Administrator pour l’extension', cost: 'Selon le plan',
    collect: 'Résultats d’analyse envoyés à Defender', compat: 'GitHub Actions ou extension Azure DevOps', limits: 'Les annotations GitHub exigent GitHub Advanced Security.', nature: 'integration', src: ['devops-github-action', 'devops-pr'], lessons: ['d20-l2'],
  }),
  cap('d20.annotations', 'Annotations de demandes de tirage', {
    plan: 'Defender CSPM', obj: 'Montrer les constats dans la demande de tirage.', risk: 'Exceptions non auditées.',
    clouds: 'Azure commercial', scope: 'GitHub avec GHAS; Azure DevOps (IaC)', req: 'Connecteur; workflow ou validation de build', perm: 'Contributor ou Owner de l’abonnement', cost: 'Selon le plan',
    collect: 'Constats sur les différences introduites', compat: 'GitHub et Azure DevOps', limits: 'Pas d’annotations en ligne pour GitLab; Azure DevOps limité à l’IaC.', nature: 'licence-supplementaire', src: ['devops-pr', 'devops-pr-review'], lessons: ['d20-l2'],
  }),
  cap('d20.code-cloud', 'Cartographie du code vers le cloud', {
    plan: 'Defender CSPM', obj: 'Relier une image en exécution à son pipeline et son dépôt.', risk: 'Compter sur des images construites à la main.',
    clouds: 'Azure commercial', scope: 'Images de conteneurs et IaC', req: 'Plan activé; image construite par un pipeline; registre ou cluster pris en charge', perm: 'Security Admin pour configurer; Security Reader pour consulter', cost: 'Selon le plan',
    collect: 'Métadonnées de build, étiquettes OCI, attestations', compat: 'Azure DevOps, GitHub, étiquettes Docker, attestations GitHub', limits: 'Affichage jusqu’à quatre heures; images antérieures à la connexion peu prises en charge.', nature: 'licence-supplementaire', src: ['devops-image-mapping', 'attack-path-defender'], lessons: ['d20-l3'],
  }),
  cap('d20.cli', 'CLI Defender for Cloud et ingestion DevOps', {
    plan: 'Selon le plan', obj: 'Envoyer des résultats d’analyse depuis des pipelines variés.', risk: 'Secret d’ingestion exposé.',
    clouds: 'Azure commercial', scope: 'Pipelines et postes de développement', req: 'Connecteur ou jeton d’ingestion avec expiration', perm: 'Security Admin pour générer le jeton', cost: 'Selon le plan',
    collect: 'Résultats d’analyse', compat: 'Authentification par connecteur ou par jeton', limits: 'Ingestion DevOps présentée en préversion dans la documentation consultée.', nature: 'integration', src: ['devops-cli-auth'], lessons: ['d20-l3'],
  }),
];
