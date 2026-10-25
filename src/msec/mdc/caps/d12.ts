import { cap } from '../model.ts';

export const CAPS_D12 = [
  cap('d12.storage.plan', 'Plan Defender for Storage par compte', {
    plan: 'Defender for Storage', obj: 'Protéger les comptes de stockage contre les menaces d’activité et de contenu.', risk: 'Comptes exclus sans motif ou coûts imprévus.',
    clouds: 'Azure', scope: 'Abonnement ou compte de stockage', req: 'Abonnement Azure et plan activé', perm: 'Security Admin ou Owner pour activer', cost: 'Tarifé par compte protégé; frais possibles pour fort volume et cycle de vie',
    collect: 'Opérations du stockage sans journaux de ressources', compat: 'Activation par abonnement, compte, Azure Policy ou infrastructure en code', limits: 'Anciennes configurations à migrer; Azure seulement.', nature: 'native', src: ['storage', 'storage-enable', 'storage-portal', 'storage-policy', 'storage-iac'], lessons: ['d12-l1'],
  }),
  cap('d12.storage.activite', 'Surveillance d’activité du stockage', {
    plan: 'Defender for Storage', obj: 'Détecter accès anormaux et opérations suspectes.', risk: 'Interpréter l’absence d’alerte comme preuve.',
    clouds: 'Azure', scope: 'Compte de stockage', req: 'Plan activé', perm: 'Security Reader pour lire les alertes', cost: 'Inclus au plan par compte',
    collect: 'Plans de contrôle et de données', compat: 'Portail Azure et XDR', limits: 'Détection de SAS utilisant des entités sans identité.', nature: 'native', src: ['storage', 'storage-test'], lessons: ['d12-l1'],
  }),
  cap('d12.storage.hash', 'Réputation de hachage', {
    plan: 'Tous les plans Storage', obj: 'Comparer les empreintes aux maliciels connus.', risk: 'La croire équivalente à l’analyse de maliciels.',
    clouds: 'Azure', scope: 'Blob Storage et Azure Files', req: 'Plan activé', perm: 'Security Reader', cost: 'Incluse',
    collect: 'Empreintes de nouveaux objets', compat: 'Microsoft Defender Threat Intelligence', limits: 'Partages SMB et blobs créés par Put Block ou Put Block List non surveillés.', nature: 'native', src: ['storage'], lessons: ['d12-l1'],
  }),
  cap('d12.storage.maliciels-depot', 'Analyse de maliciels au dépôt', {
    plan: 'Defender for Storage (nouveau plan)', obj: 'Analyser chaque objet déposé avec Defender Antivirus.', risk: 'Arrêt silencieux au plafond mensuel.',
    clouds: 'Azure', scope: 'Compte de stockage', req: 'Plan activé; Event Grid et Log Analytics optionnels', perm: 'Security Admin ou Owner', cost: 'Par Go analysé; plafond par défaut de 10 000 Go; lectures, indexation et Event Grid en sus',
    collect: 'Contenu des blobs', compat: 'Balises d’index, alertes, Event Grid, Log Analytics', limits: '50 Go par minute; inefficace pour fragments, chiffrement côté client et sauvegardes.', nature: 'native', src: ['storage-onupload', 'storage-malware-intro', 'storage-malware'], lessons: ['d12-l2'],
  }),
  cap('d12.storage.maliciels-demande', 'Analyse de maliciels à la demande', {
    plan: 'Defender for Storage (nouveau plan)', obj: 'Analyser ponctuellement un conteneur ou un compte.', risk: 'Coût non plafonné sur de grands volumes.',
    clouds: 'Azure', scope: 'Blobs; Azure Files en préversion', req: 'Plan activé', perm: 'Security Admin ou Owner', cost: 'Par Go analysé, sans plafond; estimation affichée avant',
    collect: 'Contenu des blobs', compat: 'Filtres par blob ou conteneur', limits: 'Analyses ciblées et Azure Files en préversion selon la documentation consultée.', nature: 'native', src: ['storage-ondemand', 'storage-malware-intro'], lessons: ['d12-l2'],
  }),
  cap('d12.storage.reponse', 'Réponse automatisée aux maliciels', {
    plan: 'Defender for Storage et services Azure', obj: 'Mettre en quarantaine ou bloquer les fichiers malveillants.', risk: 'Suppression automatique de fichiers légitimes.',
    clouds: 'Azure', scope: 'Compte de stockage', req: 'Event Grid, Functions ou Logic Apps, ABAC', perm: 'Droits de création des ressources de réponse', cost: 'Coûts des services de réponse en sus',
    collect: 'Résultats d’analyse', compat: 'Suppression douce, ABAC, Event Grid, Logic Apps', limits: 'Aucune suppression automatique par défaut; la conception est à la charge de l’organisation.', nature: 'integration', src: ['storage-response', 'storage-malware-intro'], lessons: ['d12-l3'], note: 'Les schémas de réponse sont des conceptions décrites; aucun flux n’a été exécuté dans un locataire réel.', write: 'redigee',
  }),
];
