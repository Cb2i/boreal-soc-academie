import { cap } from '../model.ts';

export const CAPS_D03 = [
  cap('d03.rbac.roles-azure', 'Rôles Azure pour Defender for Cloud', {
    plan: 'Tous plans', obj: 'Attribuer le rôle minimal pour lire, exempter, activer ou corriger.', risk: 'Owner distribué par commodité ou rôle insuffisant qui bloque une capacité.',
    clouds: 'Azure, AWS et GCP via l’abonnement hôte du connecteur', scope: 'Groupe de gestion, abonnement, groupe de ressources', req: 'Compte Entra et attribution Azure RBAC', perm: 'Security Reader, Security Admin, Contributor, Owner selon la tâche', cost: 'Aucun frais',
    collect: 'Sans objet', compat: 'Disponibilité générale', limits: 'Security Reader ne voit pas les données de conformité aux politiques ; Owner est exigé pour certaines capacités.', nature: 'native', src: ['permissions', 'assign-access'], lessons: ['d03-l1'],
  }),
  cap('d03.rbac.unifie-etendues-cloud', 'RBAC unifié du portail Defender et étendues cloud', {
    plan: 'Tous plans', obj: 'Accorder un accès granulaire par ensemble de données et par environnement cloud.', risk: 'Permissions d’un seul portail configurées alors que les deux sont utilisés.',
    clouds: 'Azure, AWS, GCP', scope: 'Locataire avec étendues cloud', req: 'Rôles Entra ; équipes et environnements définis', perm: 'Rôles Entra et permissions du RBAC unifié', cost: 'Aucun frais propre',
    collect: 'Sans objet', compat: 'Variable selon l’expérience du portail Defender', limits: 'Les permissions du portail Azure et du portail Defender sont indépendantes.', nature: 'integration', src: ['portal-defender', 'portal-faq', 'plan-mgmt'], lessons: ['d03-l2'],
  }),
  cap('d03.portails.comparaison', 'Comparaison des capacités entre portail Azure et portail Defender', {
    plan: 'Tous plans', obj: 'Savoir dans quel portail trouver chaque capacité.', risk: 'Promettre une fonction qui vit encore dans l’autre portail.',
    clouds: 'Azure, AWS, GCP', scope: 'Locataire', req: 'Accès aux deux portails', perm: 'Lecture dans les deux portails', cost: 'Aucun frais',
    collect: 'Sans objet', compat: 'Évolue au fil des mises à jour', limits: 'Plusieurs capacités (classeurs, export, automatisation) restent côté portail Azure à la date de consultation.', nature: 'integration', src: ['portal-compare'], lessons: ['d03-l2'],
  }),
  cap('d03.multilocataire.lighthouse', 'Accès multilocataire : Azure Lighthouse et vue multilocataire', {
    plan: 'Tous plans', obj: 'Gérer la posture et les incidents de plusieurs locataires.', risk: 'Promettre une console unique que les limites documentées empêchent.',
    clouds: 'Azure (locataires délégués)', scope: 'Locataires délégués', req: 'Délégation Lighthouse ou accès à la vue multilocataire', perm: 'Rôles délégués ou rôles Entra dans les locataires', cost: 'Aucun frais propre',
    collect: 'Sans objet', compat: 'Posture : Lighthouse ; incidents : vue multilocataire', limits: 'Le connecteur Defender for Cloud de Sentinel ne lit pas les abonnements d’autres locataires, même avec Lighthouse.', nature: 'integration', src: ['portal-faq', 'sentinel-connector'], lessons: ['d03-l2'],
  }),
  cap('d03.identites.provisionnement', 'Identités de provisionnement et permissions par plan', {
    plan: 'Servers, Containers, Databases, CIEM selon le plan', obj: 'Comprendre quelles identités déploient quels composants avec quels rôles.', risk: 'Échec de déploiement qu’on attribue à tort à l’utilisateur.',
    clouds: 'Azure, AWS, GCP', scope: 'Abonnement', req: 'Plan activé', perm: 'Rôles des identités de service, Owner ou rôles spécifiques selon le plan', cost: 'Aucun frais propre',
    collect: 'Extensions et capteurs', compat: 'Variable par plan', limits: 'Les rôles exacts changent selon le plan : lire la page de permissions du plan.', nature: 'dependance', src: ['permissions', 'containers-arch'], lessons: ['d03-l3'],
  }),
  cap('d03.connecteurs.federation', 'Connecteurs AWS et GCP : fédération d’identité et permissions', {
    plan: 'Tous plans avec connecteur', obj: 'Connecter AWS et GCP sans secret longue durée.', risk: 'Connecteur partiellement connecté après un nouveau plan.',
    clouds: 'AWS et GCP (multicloud)', scope: 'Compte AWS, organisation, projet GCP', req: 'Contributor sur l’abonnement hôte ; droits sur le compte ou le projet pour déployer le modèle', perm: 'Rôle IAM assumé par fédération ; comptes de service GCP', cost: 'Coûts éventuels des services du fournisseur (par exemple l’agent OS Config sur GCP)',
    collect: 'API du fournisseur', compat: 'Régions et clouds gouvernementaux limités : voir la documentation', limits: 'Ré-exécuter le modèle ou le script après chaque nouveau plan.', nature: 'native', src: ['aws', 'aws-auth', 'gcp', 'gcp-auth', 'troubleshoot-connectors'], lessons: ['d03-l3'],
  }),
];
