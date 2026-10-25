// Module 17 : Defender for Cloud sur AWS (niveau 4).
import { dsl, md } from './dsl.ts';

const { lesson, Q, M, MT, OR, CF, IN, WF, FX, SH, OP, comps, P, assemble } = dsl('d17');
const c1 = { comp: 'd17-c1', lesson: 'd17-l1', tags: ['connecteur-aws', 'federation', 'cloudformation', 'permissions'] };
const c2 = { comp: 'd17-c2', lesson: 'd17-l2', tags: ['plans-aws', 'prerequis-aws', 'gabarit', 'couts-aws'] };
const c3 = { comp: 'd17-c3', lesson: 'd17-l3', tags: ['sante-connecteur', 'depannage-aws', 'scp', 'retour-arriere'] };

const l1 = lesson(1, {
  title: 'Le connecteur AWS : fédération, niveau d’accès et portée', minutes: 50,
  summary: 'Connecter un compte ou une organisation AWS, choisir le niveau d’accès et la méthode de déploiement, et comprendre l’authentification fédérée.',
  objectives: ['Distinguer compte unique et compte de gestion.', 'Choisir entre accès par défaut et privilège minimal.', 'Décrire l’authentification fédérée sans secret durable.'],
  prerequisites: ['Module 4 : déploiement et couverture', 'Module 3 : gouvernance et permissions'],
  body: md(
    '## Un connecteur natif, pas un agent',
    'Le connecteur AWS natif de Defender for Cloud découvre les ressources AWS, évalue la posture et remonte recommandations et alertes. On crée le connecteur dans **Environment settings** en choisissant **Add environment**, puis **Amazon Web Services**. Il faut un abonnement Azure avec Defender for Cloud activé, l’accès à un compte AWS et au moins le rôle **Contributor** sur l’abonnement Azure qui hébergera la ressource de connecteur. Le connecteur n’est **pas disponible** dans les clouds gouvernementaux nationaux (Azure Government, 21Vianet).',
    '## Compte unique ou compte de gestion',
    'Le type **Single account** connecte un compte. Le type **Management account** crée un connecteur pour le compte de gestion AWS et provisionne automatiquement des connecteurs pour les comptes membres découverts et les nouveaux comptes; on peut exclure des comptes par leur identifiant. Point important : pour l’intégration par organisation, on utilise **uniquement le compte de gestion**; les **comptes d’administrateur délégué ne sont pas pris en charge**. Pour de grands environnements, la documentation recommande de ne pas dépasser environ 10 000 ressources par vue du portail Azure et de répartir les connecteurs entre plusieurs abonnements.',
    '## Niveau d’accès et déploiement',
    '**Accès par défaut** : accorde les permissions pour les fonctions actuelles **et futures**. **Privilège minimal** : n’accorde que les permissions nécessaires aujourd’hui, avec des notifications quand de nouveaux accès deviennent requis. Le second est préférable en environnement réglementé, mais il demande de suivre les notifications et de mettre à jour le gabarit. Le déploiement se fait par **AWS CloudFormation** ou **Terraform**; pour un compte de gestion, CloudFormation utilise un **StackSet**, et l’erreur « You must enable organizations access to operate a service managed stack set » signifie que l’**accès approuvé** (trusted access) d’AWS Organizations n’est pas activé : on l’active sur la page des StackSets, puis on relance. Si on téléverse le gabarit, AWS crée un compartiment S3 qui peut déclencher la recommandation sur le protocole SSL; la documentation propose une politique de compartiment pour la corriger.',
    '## Authentification fédérée',
    'Defender for Cloud s’authentifie à AWS par **fédération d’identité Web** avec Microsoft Entra ID et des **identifiants temporaires** : aucun secret durable n’est stocké. Le rôle IAM créé par le gabarit contient une politique de confiance; AWS valide l’audience, la signature du jeton, l’empreinte du certificat et des conditions au niveau du rôle avant d’émettre des identifiants. Les permissions sont contrôlées séparément par les politiques IAM attachées à chaque rôle.',
    '## Réglages à décider',
    '| Réglage | Choix | Pourquoi |',
    '| --- | --- | --- |',
    '| Régions | Seulement celles qui hébergent des ressources | Moins de bruit et de coûts d’API |',
    '| Intervalle d’analyse | 4, 6, 12 ou 24 heures | Fraîcheur contre appels d’API; certains collecteurs sont à intervalle fixe |',
    '| Accès | Défaut ou privilège minimal | Fonctions futures contre contrôle strict |',
    '| Portée | Compte unique ou gestion | Ampleur et exclusions |',
    '## Conflit avec Sentinel',
    'Un compte AWS déjà connecté à Microsoft Sentinel ne peut pas être connecté tel quel à Defender for Cloud : les deux ingèrent CloudTrail et une file SQS n’a qu’un consommateur. Il faut suivre la procédure de **diffusion SNS** de la documentation.',
    '## Erreurs fréquentes',
    '- Utiliser un compte d’administrateur délégué pour l’organisation.',
    '- Oublier l’accès approuvé d’Organizations pour le StackSet.',
    '- Choisir l’accès par défaut sans en mesurer les permissions futures.',
  ),
  demo: { title: 'Choisir la portée', body: md(
    'Organisation AWS **fictive** (12 comptes) :',
    '```text',
    'Compte de gestion : connecteur Management account; 2 comptes exclus (sandbox)',
    'Accès : privilège minimal; mise à jour du gabarit planifiée à chaque nouveau plan',
    'Régions : ca-central-1 et us-east-1 seulement; intervalle 12 heures',
    '```',
    '**Lecture commentée.** Chaque réglage est un compromis écrit.',
    '**Ce que la démo ne prouve pas.** Aucun compte AWS réel.') },
  revision: md('## Fiche : connecteur AWS', '- Compte unique ou compte de gestion (pas administrateur délégué).', '- Accès par défaut ou privilège minimal.', '- CloudFormation (StackSet) ou Terraform.', '- Fédération Entra, identifiants temporaires.', '- Sentinel déjà connecté : procédure SNS.'),
  links: ['aws', 'aws-auth', 'aws-sentinel', 'regions', 'multicloud-matrix'], teaches: ['connecteur-aws', 'federation', 'cloudformation', 'permissions'],
});

const l2 = lesson(2, {
  title: 'Plans sur AWS : prérequis par plan, gabarit à jour et coûts de l’autre côté', minutes: 50,
  summary: 'Connaître les prérequis AWS de chaque plan, tenir le gabarit à jour et anticiper les coûts facturés par AWS.',
  objectives: ['Énoncer les prérequis de Servers, CSPM, Containers et Databases sur AWS.', 'Savoir quand mettre à jour le gabarit CloudFormation.', 'Anticiper les coûts côté AWS.'],
  prerequisites: ['Leçon 1', 'Modules 10, 11 et 13'],
  body: md(
    '## Prérequis par plan',
    '**Defender for Servers** : plan activé; instances EC2; **Azure Arc** installé (l’autoprovisionnement est recommandé et demande le rôle **Owner** sur l’abonnement Azure, avec les exigences réseau d’Arc); **agent SSM** avec la politique `AmazonSSMManagedInstanceCore`; extensions Defender for Endpoint et solution d’évaluation des vulnérabilités. Si l’agent SSM manque, l’autoprovisionnement d’Arc ne peut pas se faire; le gabarit crée une vérification d’automatisation de 30 jours des profils IAM. Des étiquettes (`AccountId`, `Cloud`, `InstanceId`, `MDFCSecurityConnector`) gèrent le processus, et les serveurs Arc dont l’instance n’existe plus sont retirés après sept jours.',
    '**Defender CSPM** : rôle Owner sur l’abonnement, permissions IAM pour assumer le rôle de surveillance, et pour le CIEM le rôle Security Admin ainsi qu’**Application Administrator** ou **Cloud Application Administrator** dans Entra. **Defender for Containers** : clusters EKS, ressources de journalisation du plan de contrôle (SQS et Kinesis Data Firehose, compartiment S3, dans la même région) et audit EKS activé. **Defender for Databases** : Arc et agent SSM pour SQL sur EC2 ou RDS Custom; bases libres selon la liste de régions; découverte de données RDS demandant sauvegardes automatiques et accès à la clé KMS (une clé KMS est créée par région avec RDS, ce qui peut engendrer un coût minime côté AWS).',
    '## Garder le gabarit à jour',
    'À chaque nouveau plan activé, changement de configuration (autoprovisionnement, régions) ou nouvelle version du gabarit publiée par Microsoft, il faut **régénérer le gabarit et mettre à jour la pile CloudFormation** existante, en conservant les paramètres. Les erreurs courantes : accès refusé, ressource déjà existante, environnement d’exécution Lambda non pris en charge (gabarit obsolète), « No updates to be performed » (vous n’utilisez pas le nouveau gabarit). Un gabarit ancien est la cause la plus fréquente de santé dégradée après un changement de plan.',
    '## Coûts : deux factures',
    'Les plans Defender sont facturés côté Azure; mais l’analyse déclenche des **appels d’API** vers AWS et des ressources AWS (journalisation, clés KMS, captures, files), dont le coût apparaît **sur la facture AWS**. Lors de l’intégration, le service de découverte lance une analyse immédiate qui exécute de nombreux appels d’API. Budgétez les deux côtés, limitez les régions et choisissez l’intervalle d’analyse en connaissance de cause. Un essai gratuit est accordé par compte AWS.',
    '```text',
    'Fiche de prérequis AWS (exemple fictif)',
    'Servers  : Arc + SSM + MDE; Owner Azure pour l’autoprovisionnement      Coût AWS : minime',
    'Databases: SSM + Arc (SQL EC2); sauvegardes auto (RDS)                  Coût AWS : clé KMS par région',
    'Containers: audit EKS + SQS/Firehose/S3 même région                     Coût AWS : journalisation',
    '```',
    '## Erreurs fréquentes',
    '- Activer un plan sans mettre à jour le gabarit.',
    '- Oublier l’agent SSM sur les instances EC2.',
    '- Ne budgéter que la facture Azure.',
  ),
  demo: { title: 'Plan activé, rien ne remonte', body: md(
    'Constat **fictif** : Servers activé, aucune instance EC2 dans l’inventaire Arc.',
    '```text',
    'Cause 1 : agent SSM absent sur 14 instances      -> installer, attendre l’autoprovisionnement',
    'Cause 2 : gabarit non mis à jour après activation -> régénérer, mettre à jour la pile',
    '```',
    '**Lecture commentée.** Deux causes courantes, deux vérifications avant d’ouvrir un ticket.',
    '**Ce que la démo ne prouve pas.** Aucun environnement réel.') },
  revision: md('## Fiche : plans AWS', '- Servers : Arc, SSM, MDE; Owner pour l’autoprovisionnement.', '- CSPM : Owner; CIEM : Security Admin + Application Administrator.', '- Containers : EKS, SQS/Firehose/S3 même région, audit.', '- Mettre à jour le gabarit à chaque changement.', '- Deux factures : Azure et AWS.'),
  links: ['aws', 'servers-enable', 'containers-deploy-cli', 'databases-enable', 'ciem-enable'], teaches: ['plans-aws', 'prerequis-aws', 'gabarit', 'couts-aws'],
});

const l3 = lesson(3, {
  title: 'Santé du connecteur, dépannage et retour arrière', minutes: 45,
  summary: 'Lire le statut de connectivité, résoudre les erreurs fréquentes (StackSet, SCP, STS) et retirer proprement un plan ou un connecteur.',
  objectives: ['Lire la colonne de statut de connectivité et ses détails.', 'Diagnostiquer une erreur CloudFormation, un SCP ou un STS.', 'Retirer un plan et ses permissions proprement.'],
  prerequisites: ['Leçons 1 et 2', 'Module 25 (aperçu) : exploitation'],
  body: md(
    '## Où lire la santé',
    'Dans **Environment settings**, la colonne **Connectivity status** indique si la connexion est saine; la page de détails liste les problèmes de configuration ou de permission, avec description, étapes de correction et parfois un script. Le classeur de couverture (module 4) montre quels plans sont actifs. Pour un connecteur à l’état « Not connected » ou « Partially connected », la première action documentée est de **redéployer le gabarit CloudFormation** pour rafraîchir les rôles IAM, puis d’attendre jusqu’à 30 minutes. Attendre aussi au moins 12 heures après la création d’un compte racine AWS avant de conclure à une panne.',
    '## Erreurs de déploiement',
    '| Symptôme | Piste |',
    '| --- | --- |',
    '| Accès refusé | Rôle IAM de l’utilisateur AWS, accès approuvé d’Organizations, rôle d’exécution |',
    '| Ressource déjà existante | Déployer d’abord dans une seule région, retirer les doublons |',
    '| Environnement Lambda non pris en charge | Gabarit obsolète : télécharger le dernier |',
    '| No updates to be performed | Vous réutilisez l’ancien gabarit |',
    '| StackSet qui ne démarre pas | Activer l’accès approuvé; mise à jour manuelle du StackSet |',
    '## Causes côté AWS',
    'Une **politique de contrôle de service (SCP)** avec un refus explicite sur STS, IAM ou RDS bloque les actions nécessaires : examiner les SCP du compte et des unités d’organisation parentes et ajuster. **STS doit être actif dans chaque région** où des ressources sont protégées (les rôles IAM sont globaux, mais STS est régional). Pour les bases libres, vérifier le plan, la santé du connecteur et que **toutes** les régions contenant des ressources sont sélectionnées. Pour EKS : l’état de la pile `CREATE_COMPLETE`, le rôle de découverte non modifié, l’entrée d’accès ou le ConfigMap `aws-auth`, la plage d’adresses autorisées de l’API Kubernetes que l’automatisation de l’infrastructure peut écraser, une inscription Arc périmée après recréation d’un cluster, et l’audit EKS activé pour les alertes du plan de contrôle.',
    '## Retour arrière',
    'Pour désactiver un plan : mettre le plan à **Off** dans le connecteur, choisir le niveau d’accès, puis **redéployer** le gabarit ou le script afin de **retirer les permissions** de l’autre côté. Désactiver n’efface pas les ressources de soutien dans AWS : vérifiez-les. Un plan à Off cesse d’afficher ses fonctions, recommandations et alertes; la facturation, elle, se vérifie dans l’analyse des coûts. Supprimer un connecteur peut échouer à cause d’un verrou de ressource Azure : consulter le journal d’activité.',
    '```text',
    'Procédure de dépannage (exemple fictif)',
    '1. Connectivity status -> lire le détail',
    '2. Gabarit à jour ? sinon régénérer et mettre à jour la pile',
    '3. SCP, STS par région, régions sélectionnées',
    '4. Attendre le délai documenté, puis rouvrir si persistant (avec journaux)',
    '```',
    '## Erreurs fréquentes',
    '- Conclure à une panne avant les délais documentés.',
    '- Désactiver un plan sans retirer les permissions AWS.',
    '- Ignorer un SCP qui refuse explicitement.',
  ),
  demo: { title: 'Connecteur partiellement connecté', body: md(
    'Constat **fictif** : statut « Partially connected » après activation de Databases.',
    '```text',
    'Détail : RDS non autorisé -> SCP avec refus explicite sur sts:AssumeRoleWithWebIdentity',
    'Action : demander à l’équipe AWS d’ajuster le SCP; redéployer le gabarit; attendre 30 minutes',
    '```',
    '**Lecture commentée.** Le message de santé pointe la cause; on corrige côté AWS puis on revérifie.',
    '**Ce que la démo ne prouve pas.** Aucun compte réel.') },
  revision: md('## Fiche : santé AWS', '- Connectivity status et page de détails.', '- Redéployer le gabarit, attendre 30 minutes.', '- SCP avec refus explicite; STS actif par région.', '- Retrait : plan Off puis redéploiement.', '- Verrous de ressources bloquent la suppression.'),
  links: ['troubleshoot-connectors', 'aws-db-verify', 'containers-troubleshoot', 'disable-plans', 'workbooks'], teaches: ['sante-connecteur', 'depannage-aws', 'scp', 'retour-arriere'],
});

const exercises = [
  MT('d17-g1', 'guided', 'comprendre', c1, 'Portée', 'Associez chaque choix à son effet.', [['Single account', 'Un compte connecté'], ['Management account', 'Comptes membres provisionnés automatiquement'], ['Accès par défaut', 'Fonctions actuelles et futures'], ['Privilège minimal', 'Permissions actuelles seulement']], 'Portée et accès sont deux décisions distinctes.'),
  WF('d17-a1', 'autonomous', 'fonctionner', c1, 'Connecter un compte de gestion', 'Ordonnez la connexion d\'une organisation AWS.', ['Confirmer le rôle Contributor sur l\'abonnement Azure', 'Créer le connecteur Management account', 'Choisir régions, intervalle et exclusions', 'Choisir l\'accès et le déploiement', 'Exécuter le StackSet CloudFormation', 'Vérifier le statut de connectivité'], [['Utiliser un compte d\'administrateur délégué', 'Non pris en charge.']], 'Rôle, connecteur, réglages, accès, StackSet, vérification.'),
  Q('d17-q1a', 'quiz', 'securiser', c1, 'Secret durable', 'Defender stocke-t-il un secret AWS durable ?', ['Non, fédération et identifiants temporaires.', 'Web identity.'], [['Oui, une clé d\'accès.', 'Faux.'], ['Oui, un mot de passe.', 'Faux.'], ['Oui, dans Git.', 'Faux.']], 'Non.'),
  Q('d17-q1b', 'quiz', 'fonctionner', c1, 'Erreur StackSet', 'Que signifie « enable organizations access » ?', ['L\'accès approuvé d\'Organizations est désactivé.', 'À activer sur la page StackSets.'], [['Le compte est suspendu.', 'Faux.'], ['Le rôle est supprimé.', 'Faux.'], ['Le gabarit est vide.', 'Faux.']], 'Accès approuvé.'),
  Q('d17-q1c', 'quiz', 'comprendre', c1, 'Administrateur délégué', 'Le compte d\'administrateur délégué est-il pris en charge ?', ['Non.', 'Compte de gestion seulement.'], [['Oui.', 'Faux.'], ['Seulement en Terraform.', 'Faux.'], ['Seulement en lecture.', 'Faux.']], 'Non.'),

  MT('d17-g2', 'guided', 'comprendre', c2, 'Prérequis', 'Associez chaque plan à un prérequis.', [['Servers', 'Arc et agent SSM'], ['Containers', 'Audit EKS et SQS/Firehose/S3'], ['CSPM avec CIEM', 'Application Administrator dans Entra'], ['Bases RDS', 'Sauvegardes automatiques et clé KMS']], 'Chaque plan a ses prérequis AWS.'),
  CF('d17-a2', 'autonomous', 'maintenir', c2, 'Mise à jour du gabarit', 'Paramétrez la gestion du gabarit.', [['Régénérer le gabarit après chaque plan', 'on', 'Permissions à jour.'], ['Garder l\'ancien gabarit', 'off', 'Santé dégradée.'], ['Conserver les paramètres de la pile', 'on', 'Évite les régressions.']], 'On régénère et on conserve les paramètres.'),
  Q('d17-q2a', 'quiz', 'fonctionner', c2, 'Agent SSM', 'Que se passe-t-il si l\'agent SSM manque ?', ['L\'autoprovisionnement d\'Arc ne peut pas se faire.', 'Le gabarit le vérifie sur 30 jours.'], [['Rien.', 'Faux.'], ['Le plan est facturé deux fois.', 'Faux.'], ['L\'instance est arrêtée.', 'Faux.']], 'Arc bloqué.'),
  Q('d17-q2b', 'quiz', 'cout', c2, 'Deux factures', 'Où apparaissent les coûts d\'appels d\'API vers AWS ?', ['Sur la facture AWS.', 'Budgéter les deux côtés.'], [['Seulement Azure.', 'Faux.'], ['Nulle part.', 'Faux.'], ['Chez Microsoft Learn.', 'Faux.']], 'Facture AWS.'),
  Q('d17-q2c', 'quiz', 'maintenir', c2, 'Arc périmé', 'Quand les serveurs Arc dont l\'instance n\'existe plus sont-ils retirés ?', ['Après sept jours.', 'Nettoyage automatique.'], [['Immédiatement.', 'Faux.'], ['Jamais.', 'Faux.'], ['Après un an.', 'Faux.']], 'Sept jours.'),

  MT('d17-g3', 'guided', 'comprendre', c3, 'Symptômes', 'Associez chaque symptôme à sa piste.', [['SCP avec refus explicite', 'Ajuster le SCP'], ['STS inactif dans une région', 'Activer STS'], ['Gabarit obsolète', 'Télécharger le dernier'], ['Not connected', 'Redéployer le gabarit']], 'Une piste par symptôme.'),
  OR('d17-a3', 'autonomous', 'verifier', c3, 'Dépanner', 'Ordonnez le dépannage d\'un connecteur.', ['Lire le statut de connectivité et le détail', 'Vérifier que le gabarit est à jour', 'Vérifier SCP, STS et régions', 'Attendre le délai documenté', 'Ouvrir un ticket avec les journaux si persistant'], 'Lire, gabarit, côté AWS, attendre, ticket.'),
  Q('d17-q3a', 'quiz', 'verifier', c3, 'Délai', 'Combien attendre après un redéploiement du gabarit ?', ['Jusqu\'à 30 minutes.', 'Puis revérifier.'], [['Une seconde.', 'Faux.'], ['Une semaine.', 'Faux.'], ['Aucun.', 'Faux.']], '30 minutes.'),
  Q('d17-q3b', 'quiz', 'securiser', c3, 'Retrait', 'Que faut-il faire après avoir mis un plan à Off ?', ['Redéployer pour retirer les permissions.', 'Côté AWS.'], [['Rien.', 'Faux.'], ['Supprimer le compte AWS.', 'Faux.'], ['Redémarrer Azure.', 'Faux.']], 'Redéployer.'),
  Q('d17-q3c', 'quiz', 'maintenir', c3, 'Suppression bloquée', 'Pourquoi la suppression d\'un connecteur échoue-t-elle parfois ?', ['Un verrou de ressource Azure.', 'Journal d\'activité.'], [['Un SCP.', 'Faux.'], ['Un pare-feu.', 'Faux.'], ['Un certificat.', 'Faux.']], 'Verrou.'),

  Q('d17-ev1', 'eval', 'comprendre', c1, 'Cloud gouvernemental', 'Le connecteur AWS est-il disponible dans Azure Government ?', ['Non.', 'Clouds nationaux exclus.'], [['Oui.', 'Faux.'], ['Seulement 21Vianet.', 'Faux.'], ['Seulement en préversion.', 'Faux.']], 'Non.'),
  M('d17-ev2', 'eval', 'securiser', c1, 'Validations AWS', 'Cochez ce qu\'AWS valide avant d\'émettre des identifiants.', [['L\'audience.', 'Oui.'], ['La signature du jeton.', 'Oui.'], ['L\'empreinte du certificat.', 'Oui.']], [['Le mot de passe du compte racine.', 'Faux.']], 'Trois validations.'),
  FX('d17-ev3', 'eval', 'verifier', c3, 'Fiche d\'incident', 'Complétez la fiche d\'incident fictive.', { symptome: '', cause: '', action: '', delai: '' }, { symptome: 'Partially connected', cause: 'SCP avec refus explicite', action: 'ajuster le SCP et redéployer le gabarit', delai: '30 minutes' }, [['symptome', 'Partially connected', 'Nommer le symptôme.', 'comprendre'], ['cause', 'SCP avec refus explicite', 'Identifier la cause.', 'verifier'], ['action', 'ajuster le SCP et redéployer le gabarit', 'Désigner l\'action.', 'securiser'], ['delai', '30 minutes', 'Noter le délai.', 'maintenir']], 'Symptôme, cause, action, délai.'),
  OR('d17-ev4', 'eval', 'fonctionner', c2, 'Activer Servers sur AWS', 'Ordonnez l\'activation de Servers sur AWS.', ['Installer l\'agent SSM', 'Activer le plan Servers sur le connecteur', 'Mettre à jour le gabarit', 'Autoriser l\'autoprovisionnement d\'Arc (Owner)', 'Vérifier les extensions MDE et VA'], 'SSM, plan, gabarit, Arc, extensions.'),
  CF('d17-ev5', 'eval', 'cout', c2, 'Coûts AWS', 'Paramétrez la stratégie de coûts.', [['Limiter les régions aux ressources réelles', 'on', 'Moins d\'appels d\'API.'], ['Budgéter seulement Azure', 'off', 'Coûts AWS ignorés.'], ['Choisir l\'intervalle de 12 heures ou plus', 'on', 'Réduit les appels.']], 'Régions limitées et budget double.'),
  WF('d17-ev6', 'eval', 'maintenir', c3, 'Retrait d\'un plan', 'Ordonnez le retrait d\'un plan.', ['Mettre le plan à Off', 'Choisir le niveau d\'accès', 'Redéployer le gabarit', 'Vérifier les ressources de soutien dans AWS', 'Vérifier la facturation'], [['Supprimer le compte AWS', 'Excessif.']], 'Off, accès, redéploiement, ressources, facturation.'),
  SH('d17-ev7', 'eval', 'verifier', c3, 'Attente après création', 'Combien d\'heures attendre après la création d\'un compte racine AWS ? (nombre)', ['12'], 'Au moins 12 heures.', 12),
  Q('d17-ev8', 'eval', 'comprendre', c2, 'Essai', 'Combien d\'essais gratuits par compte AWS ?', ['Un.', 'Par compte AWS.'], [['Dix.', 'Faux.'], ['Aucun.', 'Faux.'], ['Illimité.', 'Faux.']], 'Un.'),

  IN('d17-cs1', 'case', 'verifier', c1, 'Cas : promesses chez Nordlys', 'Promesses fictives : repérez celles à corriger.', 'text', [['« Un administrateur délégué suffit pour l\'organisation. »', 'Compte de gestion seulement', 'Garder tel quel'], ['« Defender stocke une clé d\'accès AWS chiffrée. »', 'Fédération et identifiants temporaires', 'Garder tel quel']], 'Chaque promesse est corrigée.'),
  MT('d17-cs2', 'case', 'securiser', c3, 'Cas : trois pannes', 'Associez chaque panne à la cause.', [['Erreur StackSet', 'Accès approuvé désactivé'], ['RDS non autorisé', 'SCP avec refus explicite'], ['Région sans protection', 'STS inactif ou région non sélectionnée']], 'Une cause par panne.'),
  WF('d17-cs3', 'case', 'maintenir', c2, 'Cas : nouveau plan', 'Ordonnez l\'activation d\'un nouveau plan sur un connecteur existant.', ['Estimer les coûts Azure et AWS', 'Activer le plan', 'Régénérer le gabarit', 'Mettre à jour la pile', 'Vérifier la connectivité'], [['Activer sans mettre à jour la pile', 'Santé dégradée.']], 'Estimer, activer, régénérer, mettre à jour, vérifier.'),
  OP('d17-cs-open', 'case', 'verifier', c1, 'Cas : AWS chez Nordlys', 'Rédigez le plan de connexion de l\'organisation AWS d\'une organisation fictive.', 'Une page : portée, accès, plans, coûts, santé, retour arrière.', [['La portée et l\'accès sont justifiés.', 'securiser'], ['Les prérequis par plan sont listés.', 'fonctionner'], ['Les coûts des deux côtés sont estimés.', 'cout'], ['Le dépannage et le retour arrière sont prévus.', 'maintenir']], 'Le plan relie portée, prérequis, coûts et exploitation.'),

  Q('d17-rm1', 'remediation', 'comprendre', c1, 'Remédiation : organisation', 'Quel compte pour connecter une organisation ?', ['Le compte de gestion.', 'Pas l\'administrateur délégué.'], [['Un compte membre.', 'Faux.'], ['Le compte racine d\'un membre.', 'Faux.'], ['Aucun.', 'Faux.']], 'Compte de gestion.'),
  Q('d17-rm2', 'remediation', 'maintenir', c2, 'Remédiation : plan activé', 'Que faire après avoir activé un plan ?', ['Mettre à jour le gabarit.', 'Conserver les paramètres.'], [['Rien.', 'Faux.'], ['Supprimer la pile.', 'Faux.'], ['Changer de région.', 'Faux.']], 'Mettre à jour.'),
  Q('d17-rm3', 'remediation', 'verifier', c3, 'Remédiation : SCP', 'Que vérifier si RDS est non autorisé ?', ['Les SCP avec refus explicite.', 'Compte et unités parentes.'], [['La couleur du portail.', 'Faux.'], ['Le nom du compte.', 'Faux.'], ['La langue.', 'Faux.']], 'Les SCP.'),
];

const competencies = comps([
  ['Connecter AWS correctement', 'Portée, accès, fédération.', ['Je choisis la portée.', 'Je justifie l’accès.', 'J’explique la fédération.']],
  ['Maîtriser les plans AWS', 'Prérequis, gabarit, coûts.', ['Je liste les prérequis par plan.', 'Je tiens le gabarit à jour.', 'Je budgète les deux factures.']],
  ['Exploiter et dépanner le connecteur', 'Santé, causes AWS, retrait.', ['Je lis la santé.', 'Je diagnostique les causes AWS.', 'Je retire proprement.']],
]);

const projects = [
  P(1, 'débutant', 'Fiche de connexion AWS', 'Documenter la portée, l\'accès et les régions d\'un connecteur.', 'Tableau portée, accès, régions, intervalle.', ['Choisir la portée.', 'Justifier l\'accès.', 'Lister les régions.'], ['Chaque choix est justifié.'], ['Administrateur délégué.'], ['Ajouter les exclusions.']),
  P(2, 'intermédiaire', 'Matrice de prérequis AWS par plan', 'Concevoir la matrice des prérequis et coûts AWS par plan.', 'Matrice plan, prérequis, coût AWS, vérification.', ['Lister les plans.', 'Noter les prérequis.', 'Estimer les coûts.'], ['Aucun plan sans prérequis vérifié.'], ['Gabarit obsolète.'], ['Ajouter un calendrier de mise à jour.'],
    { connected: { accounts: 'Un compte AWS de laboratoire et un abonnement Azure de test.', permissions: 'Administrateur du compte AWS de laboratoire; Contributor sur l\'abonnement Azure de test.', costs: 'Les plans sont payants côté Azure et des coûts d\'API et de ressources s\'appliquent côté AWS : confirmer l\'essai ou le coût avant activation; aucune activation automatique.', secrets: 'Aucun secret; fédération et identifiants temporaires seulement.', cleanup: 'Mettre les plans à Off, redéployer le gabarit pour retirer les rôles, supprimer la pile et le connecteur.', limits: 'Compte de laboratoire sans charge de production. Statut : non réalisée dans un laboratoire Microsoft réel.' } }),
  P(3, 'avancé', 'Runbook de dépannage du connecteur AWS', 'Rédiger un runbook de dépannage avec arbre de décision.', 'Arbre de décision et tableau des erreurs.', ['Lister les symptômes.', 'Associer les causes.', 'Définir les escalades.'], ['Chaque symptôme a une action.'], ['Conclusions hâtives.'], ['Tester sur un compte de laboratoire.']),
];

export const d17 = assemble({ id: 'd17', level: 4, n: 17, title: 'Defender for Cloud sur AWS',
  summary: 'Connecteur AWS natif, fédération, accès par défaut ou privilège minimal, prérequis par plan, gabarit à jour, coûts des deux côtés, santé, dépannage et retour arrière.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Connecter l’organisation AWS de Nordlys Technologies',
  caseScenario: 'Vous connectez une organisation AWS, activez des plans et dépannez un connecteur partiellement connecté. Données simulées.', caseMinutes: 55 });
