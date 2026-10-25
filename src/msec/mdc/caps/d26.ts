import { cap } from '../model.ts';

export const CAPS_D26 = [
  cap('d26.cnapp', 'Plateforme CNAPP de Defender for Cloud', {
    plan: 'Selon les plans choisis', obj: 'Réunir posture, protection des charges de travail et sécurité du développement.', risk: 'Activer des plans sans lien avec un risque.',
    clouds: 'Azure, AWS (Amazon) et GCP (Google)', scope: 'Abonnements, comptes et projets', req: 'Périmètre et approbations définis', perm: 'Rôles selon la gouvernance', cost: 'Estimer avec le calculateur officiel et dater',
    collect: 'Selon les plans', compat: 'Portail Azure et portail Defender selon la fonction', limits: 'Parité entre clouds non supposée; voir la matrice de couverture.', nature: 'native', src: ['intro', 'multicloud-matrix', 'plan-mgmt'], lessons: ['d26-l1'],
  }),
  cap('d26.deploiement-phases', 'Déploiement par phases', {
    plan: 'Selon les plans choisis', obj: 'Étendre la protection avec preuves, gouvernance et retour arrière.', risk: 'Vague unique à coût et bruit imprévus.',
    clouds: 'Azure, AWS (Amazon) et GCP (Google)', scope: 'Lots d’abonnements', req: 'Pilote isolé', perm: 'Security Admin et rôles de gouvernance', cost: 'Écart entre coût estimé et observé suivi',
    collect: 'Preuves de couverture et de coût', compat: 'Azure Policy, classeurs, Resource Graph', limits: 'Les critères doivent être mesurables et datés.', nature: 'native', src: ['planning-guide', 'governance', 'onboard-mg'], lessons: ['d26-l2'],
  }),
  cap('d26.rapport-direction', 'Rapport de direction vérifiable', {
    plan: 'Fonctions de base', obj: 'Rapporter couverture, posture, coûts et limites avec date et portée.', risk: 'Chiffres sans date ni portée.',
    clouds: 'Azure principalement', scope: 'Abonnements lisibles', req: 'Accès aux classeurs et à Resource Graph', perm: 'Reader sur la portée', cost: 'Sans frais propres',
    collect: 'Résultats de requêtes et de classeurs', compat: 'Resource Graph, classeurs, Power BI', limits: 'Troncature à 1 000 enregistrements et mises à jour différées.', nature: 'native', src: ['workbooks', 'resource-graph', 'secure-score'], lessons: ['d26-l3'],
  }),
];
