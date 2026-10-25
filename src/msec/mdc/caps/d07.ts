import { cap } from '../model.ts';

export const CAPS_D07 = [
  cap('d07.standards.affectation', 'Affectation de standards de conformité', {
    plan: 'Au moins un plan payant (hors Servers P1 et API P1)', obj: 'Suivre la conformité à un standard sur une étendue donnée.', risk: 'Standard affecté sur une étendue sans ressource pertinente.',
    clouds: 'Azure, AWS, GCP', scope: 'Abonnement, groupe de gestion, compte AWS, projet GCP', req: 'Plan payant éligible activé', perm: 'Owner ou Policy Contributor pour ajouter ; Reader pour lire les données de politique', cost: 'Aucun coût propre au standard ; le plan payant est facturé',
    collect: 'Initiative Azure Policy et évaluations des connecteurs', compat: 'Affectation dans le portail Azure ; suivi aussi dans le portail Defender', limits: 'Un standard sans ressource évaluée pertinente n’apparaît pas.', nature: 'native', src: ['compliance', 'compliance-assign', 'compliance-standards'], lessons: ['d07-l1'],
  }),
  cap('d07.controles.attestation', 'Évaluations manuelles et attestation', {
    plan: 'Plan payant éligible', obj: 'Documenter les contrôles de procédure avec une preuve.', risk: 'Attestation sans preuve ni date.',
    clouds: 'Azure, AWS, GCP', scope: 'Abonnements sélectionnés', req: 'Standard affecté', perm: 'Rôle permettant l’attestation sur les abonnements', cost: 'Aucun coût propre',
    collect: 'Saisie humaine et pièces jointes', compat: 'Portail Azure', limits: 'L’attestation est déclarative, non une vérification technique.', nature: 'native', src: ['compliance-dashboard', 'compliance-faq'], lessons: ['d07-l2'],
  }),
  cap('d07.controles.grises', 'Contrôles sans évaluation associée', {
    plan: 'Plan payant éligible', obj: 'Distinguer les contrôles non évalués des contrôles conformes.', risk: 'Compter les contrôles grisés comme conformes.',
    clouds: 'Azure, AWS, GCP', scope: 'Standard affecté', req: 'Standard affecté', perm: 'Lecture du tableau de bord', cost: 'Aucun coût propre',
    collect: 'Évaluations Azure Policy et connecteurs', compat: 'Vue de responsabilité partagée propre à Azure', limits: 'Évaluations environ toutes les 12 heures, sans délai garanti sur de grands périmètres.', nature: 'native', src: ['compliance-faq', 'compliance-dashboard'], lessons: ['d07-l2'],
  }),
  cap('d07.rapports.telechargement', 'Rapports de conformité PDF, CSV et rapports d’audit', {
    plan: 'Plan payant éligible', obj: 'Produire des livrables de preuve datés et délimités.', risk: 'Présenter le rapport de certification de Microsoft comme preuve de sa propre conformité.',
    clouds: 'Azure principalement', scope: 'Standard fourni par Microsoft', req: 'Standard affecté', perm: 'Accès au tableau de bord de conformité', cost: 'Aucun coût propre',
    collect: 'Évaluations de conformité', compat: 'Portail Azure', limits: 'Aucun rapport téléchargeable pour un standard personnalisé.', nature: 'native', src: ['compliance-dashboard', 'compliance-faq'], lessons: ['d07-l3'],
  }),
  cap('d07.suivi.export-automatisation', 'Export continu et automatisation de la conformité', {
    plan: 'Plan payant éligible', obj: 'Suivre la conformité dans le temps et réagir aux changements.', risk: 'Alertes trop bruyantes ou coûts de stockage non prévus.',
    clouds: 'Azure, AWS, GCP', scope: 'Abonnement', req: 'Espace Log Analytics ou Event Hubs ; application logique pour le flux', perm: 'Security Admin et Contributor sur la cible d’export', cost: 'Coûts d’ingestion Log Analytics et d’exécution Logic Apps à estimer',
    collect: 'Export continu des données de conformité', compat: 'Classeur de conformité dans le temps', limits: 'Les coûts dépendent du volume ; vérifier les types de données exportables.', nature: 'integration', src: ['continuous-export', 'workbooks', 'compliance-manager'], lessons: ['d07-l3'],
  }),
];
