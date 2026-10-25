import { cap } from '../model.ts';

export const CAPS_D17 = [
  cap('d17.connecteur', 'Connecteur AWS natif', {
    plan: 'Fonctions de base du connecteur', obj: 'Découvrir les ressources AWS et évaluer la posture.', risk: 'Utiliser un administrateur délégué non pris en charge.',
    clouds: 'AWS (Amazon)', scope: 'Compte unique ou compte de gestion', req: 'Abonnement Azure avec Defender for Cloud et accès à un compte AWS', perm: 'Contributor sur l’abonnement Azure; administrateur AWS pour déployer', cost: 'Aucun frais propre; les plans activés sont facturés',
    collect: 'Inventaire et configuration AWS par API', compat: 'CloudFormation ou Terraform', limits: 'Pas dans Azure Government ni 21Vianet; administrateur délégué non pris en charge.', nature: 'native', src: ['aws', 'aws-auth', 'regions'], lessons: ['d17-l1'],
  }),
  cap('d17.federation', 'Authentification fédérée vers AWS', {
    plan: 'Connecteur AWS', obj: 'Obtenir des identifiants temporaires sans secret durable.', risk: 'Rôle IAM modifié ou refus par un SCP.',
    clouds: 'AWS (Amazon)', scope: 'Rôle IAM par connecteur', req: 'Gabarit déployé', perm: 'Administrateur AWS', cost: 'Aucun',
    collect: 'Jetons Entra', compat: 'Identité Web et politique de confiance', limits: 'Les permissions dépendent des politiques attachées aux rôles.', nature: 'native', src: ['aws-auth'], lessons: ['d17-l1'],
  }),
  cap('d17.acces', 'Niveau d’accès : défaut ou privilège minimal', {
    plan: 'Connecteur AWS', obj: 'Contrôler les permissions accordées à Defender.', risk: 'Accès par défaut trop large ou notifications ignorées.',
    clouds: 'AWS (Amazon)', scope: 'Connecteur', req: 'Choix à la création', perm: 'Administrateur AWS', cost: 'Aucun',
    collect: 'Sans objet', compat: 'CloudFormation et Terraform', limits: 'Le privilège minimal exige de suivre les notifications de nouveaux accès.', nature: 'native', src: ['aws', 'aws-auth'], lessons: ['d17-l1'],
  }),
  cap('d17.servers-aws', 'Defender for Servers sur AWS', {
    plan: 'Defender for Servers', obj: 'Protéger les instances EC2 avec Arc, MDE et évaluation des vulnérabilités.', risk: 'Agent SSM absent, Arc bloqué.',
    clouds: 'AWS (Amazon)', scope: 'Instances EC2', req: 'Arc, agent SSM, extensions MDE et VA', perm: 'Owner sur l’abonnement Azure pour l’autoprovisionnement', cost: 'Par machine; coûts d’API AWS en sus',
    collect: 'Télémétrie MDE et inventaire', compat: 'Servers P1 ou P2', limits: 'Serveurs Arc retirés sept jours après la disparition de l’instance.', nature: 'dependance', src: ['aws', 'servers-enable'], lessons: ['d17-l2'],
  }),
  cap('d17.containers-aws', 'Defender for Containers sur EKS', {
    plan: 'Defender for Containers', obj: 'Protéger les clusters EKS.', risk: 'Audit EKS non activé; accès API écrasé par l’automatisation.',
    clouds: 'AWS (Amazon)', scope: 'Clusters EKS', req: 'SQS, Kinesis Data Firehose, S3 dans la même région; audit EKS', perm: 'Security Admin; administrateur AWS', cost: 'Par cœur ou nœud; coûts de journalisation AWS',
    collect: 'Journaux d’audit et capteur', compat: 'Arc pour Kubernetes', limits: 'Inscription Arc périmée possible après recréation du cluster.', nature: 'dependance', src: ['aws', 'containers-troubleshoot', 'containers-deploy-cli'], lessons: ['d17-l2', 'd17-l3'],
  }),
  cap('d17.databases-aws', 'Defender for Databases sur AWS', {
    plan: 'Defender for Databases', obj: 'Protéger SQL sur EC2 et les bases libres RDS.', risk: 'Préversion pour les bases libres; SCP bloquant.',
    clouds: 'AWS (Amazon)', scope: 'Instances et bases', req: 'Arc et SSM; sauvegardes automatiques et KMS pour RDS', perm: 'Security Admin; administrateur AWS', cost: 'Par instance; clé KMS par région côté AWS',
    collect: 'Configuration et télémétrie', compat: 'SQL sur machines GA; bases libres en préversion', limits: 'STS actif par région; régions non prises en charge selon la liste.', nature: 'dependance', src: ['aws', 'aws-db-verify', 'databases'], lessons: ['d17-l2', 'd17-l3'],
  }),
  cap('d17.sante', 'Santé du connecteur et gabarit', {
    plan: 'Connecteur AWS', obj: 'Suivre la connectivité et mettre à jour le gabarit.', risk: 'Gabarit obsolète, santé dégradée.',
    clouds: 'AWS (Amazon)', scope: 'Connecteur', req: 'Accès au portail', perm: 'Security Reader pour lire; Contributor pour modifier', cost: 'Aucun',
    collect: 'Statut de connectivité', compat: 'Classeur de couverture', limits: 'Délais d’environ 30 minutes après redéploiement.', nature: 'native', src: ['troubleshoot-connectors', 'workbooks'], lessons: ['d17-l3'],
  }),
];
