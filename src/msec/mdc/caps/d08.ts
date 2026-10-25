import { cap } from '../model.ts';

export const CAPS_D08 = [
  cap('d08.recommandations.priorisation', 'Revue et priorisation des recommandations', {
    plan: 'Plan CSPM de base (gratuit) ; contexte de risque avec Defender CSPM', obj: 'Ordonner les corrections selon le risque et l’effort.', risk: 'Prioriser seulement par nombre de ressources.',
    clouds: 'Azure, AWS, GCP', scope: 'Abonnement, compte ou projet', req: 'Environnement connecté', perm: 'Security Reader pour lire', cost: 'Lecture incluse ; contexte de risque avancé avec Defender CSPM (payant)',
    collect: 'Évaluations de posture', compat: 'Portail Azure et portail Defender', limits: 'Les recommandations en préversion n’affectent pas le niveau de sécurité basé sur le risque.', nature: 'native', src: ['recos', 'recos-review', 'recos-transition'], lessons: ['d08-l1'],
  }),
  cap('d08.remediation.fix', 'Remédiation avec Fix et scripts automatisés', {
    plan: 'Selon la recommandation', obj: 'Corriger plusieurs ressources avec une logique visible.', risk: 'Appliquer Fix en masse sans lecture ni test.',
    clouds: 'Azure (Fix), AWS et GCP (scripts CLI)', scope: 'Ressources sélectionnées', req: 'Recommandation avec Fix ou script', perm: 'Permissions de l’opération sur la ressource ; Security Reader ne suffit pas', cost: 'Aucun coût propre ; la ressource modifiée peut changer de coût',
    collect: 'Aucune', compat: 'Portail Azure', limits: 'Le bouton Fix n’existe que pour certaines recommandations ; la mise à jour de l’état prend plusieurs minutes.', nature: 'native', src: ['recos-remediate'], lessons: ['d08-l1'],
  }),
  cap('d08.remediation.copilot', 'Remédiation assistée par Security Copilot', {
    plan: 'Defender for Cloud et Security Copilot', obj: 'Résumer et corriger des recommandations par langage naturel.', risk: 'Exécuter un script proposé sans revue.',
    clouds: 'Azure', scope: 'Recommandation sélectionnée', req: 'Azure Copilot et unités de calcul de sécurité assignées', perm: 'Permissions de l’opération', cost: 'Unités de calcul de sécurité facturées séparément',
    collect: 'Aucune', compat: 'Portail Azure', limits: 'Dépend de la capacité Security Copilot ; une revue humaine reste nécessaire.', nature: 'licence-supplementaire', src: ['recos-copilot'], lessons: ['d08-l1'],
  }),
  cap('d08.gouvernance.regles', 'Règles de gouvernance', {
    plan: 'Defender CSPM', obj: 'Affecter propriétaires et échéances automatiquement.', risk: 'Écraser des affectations existantes ou compter sur des étiquettes absentes.',
    clouds: 'Azure, AWS, GCP', scope: 'Abonnement, groupe de gestion, compte, organisation', req: 'Defender CSPM', perm: 'Permissions de gestion des règles de gouvernance', cost: 'Inclus au plan Defender CSPM (payant)',
    collect: 'Aucune', compat: 'Rapport de gouvernance en classeur', limits: 'Les exclusions se définissent par l’API ; supprimer une règle ne retire pas les affectations.', nature: 'native', src: ['governance', 'workbooks'], lessons: ['d08-l2'],
  }),
  cap('d08.exemptions.gestion', 'Exemptions de recommandations', {
    plan: 'Plan CSPM de base', obj: 'Exclure une ressource ou une recommandation avec justification.', risk: 'Utiliser mitigated pour un risque accepté ou omettre l’expiration.',
    clouds: 'Azure, AWS, GCP', scope: 'Ressource, abonnement, groupe de gestion', req: 'Recommandation évaluée', perm: 'Permission de créer et supprimer des exemptions au niveau de la portée', cost: 'Aucun coût propre',
    collect: 'Aucune', compat: 'Portail Azure ; Azure Policy en alternative', limits: 'Jusqu’à 24 heures d’effet ; 5 000 exemptions de ressources par abonnement; exemptions créées par l’API potentiellement mal intégrées.', nature: 'native', src: ['exemptions', 'exempt-resource', 'exempt-scale', 'disable-to-exempt', 'policy-exemption'], lessons: ['d08-l3'],
  }),
];
