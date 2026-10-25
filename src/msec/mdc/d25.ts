// Module 25 : Exploitation, santé et dépannage (niveau 5).
import { dsl, md } from './dsl.ts';

const { lesson, Q, M, MT, OR, CF, IN, WF, FX, SH, OP, comps, P, assemble } = dsl('d25');
const c1 = { comp: 'd25-c1', lesson: 'd25-l1', tags: ['sante-connecteurs', 'rythme-exploitation', 'couverture', 'notes-publication'] };
const c2 = { comp: 'd25-c2', lesson: 'd25-l2', tags: ['depannage-multicloud', 'cloudformation', 'delais', 'verrous'] };
const c3 = { comp: 'd25-c3', lesson: 'd25-l3', tags: ['methode-depannage', 'extension-mde', 'escalade-support', 'registre-ecarts'] };

const l1 = lesson(1, {
  title: 'Exploiter au quotidien : santé des connecteurs, couverture et rythme de revue', minutes: 50,
  summary: 'Installer un rythme d’exploitation qui détecte les trous de couverture avant qu’un incident ne les révèle.',
  objectives: ['Lire l’état de connectivité d’un connecteur AWS ou GCP.', 'Distinguer problème d’installation et problème de battement de coeur sur Defender for Endpoint.', 'Planifier une revue hebdomadaire, mensuelle et trimestrielle.'],
  prerequisites: ['Module 4 : déploiement et couverture', 'Module 23 : requêtes'],
  body: md(
    '## Exploiter, c’est vérifier que la protection existe encore',
    'Une fois les plans activés, le travail change de nature : il faut s’assurer que la couverture **reste vraie**. Un connecteur perd une permission, une extension cesse de se mettre à jour, un abonnement est ajouté sans plan, une recommandation disparaît des notes de publication. Aucun de ces événements ne produit d’alerte de sécurité; ils produisent du **silence**. Or une absence d’alerte n’est jamais une preuve de sécurité : elle peut être un trou de couverture. L’exploitation consiste à rendre ces silences visibles.',
    '## La santé d’un connecteur multicloud',
    'Pour un compte AWS ou un projet GCP, la documentation indique la marche à suivre : dans le portail Azure, **Defender for Cloud**, **Environment settings**, repérer l’environnement, lire la colonne **Connectivity status**, puis ouvrir la valeur pour voir les problèmes de configuration ou de permissions détectés. Chaque problème a une description et des étapes de remédiation, parfois un script. Faites de cette lecture un geste hebdomadaire plutôt qu’un réflexe après incident. Pour GCP, quand vous activez un nouveau plan, changez la configuration, que Microsoft publie un script d’intégration mis à jour ou que la santé signale des permissions manquantes, **régénérez le script `gcloud`** pour votre portée et rejouez-le.',
    '## La santé de Defender for Endpoint sur les serveurs',
    'Defender for Servers donne de la visibilité sur les agents Defender for Endpoint installés. Deux familles de problèmes sont distinguées : les **problèmes d’installation** (erreurs pendant l’installation de l’agent) et les **problèmes de battement de coeur** (l’agent est installé mais ne rapporte pas correctement). Certains appareils, comme un système d’exploitation client, sont « non applicables » et demandent une licence utilisateur Defender for Endpoint. L’état de santé se met à jour **toutes les quatre heures** : un correctif appliqué il y a vingt minutes ne se verra pas tout de suite. Le security explorer permet de lister les machines en mauvaise santé, en bonne santé ou non applicables, et un classeur de suivi du déploiement existe dans le dépôt GitHub de Microsoft.',
    '## Un rythme de revue',
    '| Fréquence | Vérification | Preuve |',
    '| --- | --- | --- |',
    '| Hebdomadaire | Connectivité des connecteurs; machines en mauvaise santé; nouveaux abonnements sans plan | Capture datée ou export de requête |',
    '| Mensuelle | Classeur de couverture; exceptions arrivées à échéance; coûts par plan | Rapport avec périmètre et limites |',
    '| Trimestrielle | Notes de publication; recommandations remplacées; automatisations actives; retraits de plans | Registre des écarts mis à jour |',
    'Les notes de publication de Defender for Cloud sont mises à jour en continu et mélangent des fonctions en préversion : rattachez chaque changement à un propriétaire et à une action, ou à la mention « aucun impact ».',
    '## Ce que l’exploitation ne fait pas',
    'Elle ne remplace pas les tests de détection (module 21) ni la preuve de couverture par ressource. Elle signale ce qui a changé et ce qui ne rapporte plus. Les chiffres de couverture d’un classeur ne prouvent pas, à eux seuls, qu’un agent fonctionne : croisez avec l’état de santé et, pour les cas critiques, avec une simulation inoffensive.',
    '```text',
    'Fiche de revue hebdomadaire (exemple fictif, Nordlys Technologies)',
    'Connecteurs : 6 vérifiés, 1 avec permission manquante (ouvert, responsable : infonuagique AWS)',
    'Serveurs : 14 en problème de battement de coeur depuis plus de 4 h; 3 non applicables',
    'Nouveaux abonnements sans plan : 2 (propriétaires avisés)',
    'Limites : état de santé mis à jour aux 4 h; données simulées',
    '```',
    '## Erreurs fréquentes',
    '- Conclure que tout va bien parce qu’aucune alerte n’est arrivée.',
    '- Corriger un problème et vérifier l’état de santé avant le prochain cycle de quatre heures.',
    '- Ne jamais relire les notes de publication.',
  ),
  demo: { title: 'Le silence qui cachait un trou', body: md(
    'Constat **fictif** : aucune alerte AWS depuis trois semaines.',
    '```text',
    'Vérification : colonne Connectivity status du connecteur AWS',
    'Résultat : permission manquante signalée; script de remédiation proposé',
    '```',
    '**Lecture commentée.** Le calme venait d’un connecteur dégradé, pas d’un compte sain.',
    '**Ce que la démo ne prouve pas.** Aucun compte AWS réel n’a été interrogé.') },
  revision: md('## Fiche : exploitation', '- Connectivity status par environnement, chaque semaine.', '- Installation et battement de coeur : deux problèmes distincts.', '- Santé de Defender for Endpoint mise à jour aux 4 heures.', '- Revue hebdomadaire, mensuelle, trimestrielle.', '- Le silence n’est pas une preuve.'),
  links: ['aws', 'gcp', 'mde-health', 'workbooks', 'release-notes'], teaches: ['sante-connecteurs', 'rythme-exploitation', 'couverture', 'notes-publication'],
});

const l2 = lesson(2, {
  title: 'Dépanner les connecteurs multicloud : CloudFormation, permissions, délais et verrous', minutes: 55,
  summary: 'Diagnostiquer dans l’ordre les causes les plus fréquentes d’un connecteur muet ou dégradé.',
  objectives: ['Appliquer la liste de vérifications des connecteurs.', 'Interpréter les erreurs CloudFormation courantes.', 'Reconnaître les causes liées à Sentinel, aux délais et aux verrous.'],
  prerequisites: ['Leçon 1', 'Modules 17 et 18'],
  body: md(
    '## Les vérifications communes',
    'Le guide de dépannage des connecteurs propose une liste à parcourir **dans l’ordre**, de la cause la moins coûteuse à la plus coûteuse. Les points communs : l’abonnement associé au connecteur est sélectionné dans le filtre **Directories + subscriptions**; des **standards** sont assignés au connecteur (Environment settings, le connecteur, Settings); la ressource de connecteur existe dans Resource Graph; l’envoi des journaux d’audit Kubernetes est activé si vous attendez des alertes du plan de contrôle; les extensions Defender et Azure Policy pour Kubernetes compatibles Azure Arc sont installées sur les clusters EKS et GKE; et des charges de travail existent bien dans le compte ou le projet.',
    '```kusto',
    '// Lecture seule : la ressource de connecteur existe-t-elle ?',
    'resources',
    '| where [\'type\'] =~ "microsoft.security/securityconnectors"',
    '| project name, location, subscriptionId, resourceGroup',
    '```',
    '## Les points propres à AWS',
    'Vérifiez que le déploiement du modèle **CloudFormation** s’est terminé avec succès, et **attendez au moins douze heures** après la création du compte racine AWS avant de conclure à un échec. Le guide fournit un tableau des erreurs de déploiement : accès refusé (vérifier le rôle IAM et la confiance du StackSet), ressource déjà existante (déployer d’abord dans une seule région, retirer les doublons), exécution Lambda non prise en charge (modèle périmé : télécharger le plus récent), aucune mise à jour à effectuer (confirmer le modèle utilisé), StackSet qui ne démarre pas (activer l’accès de confiance de l’organisation) et incohérence entre les configurations Azure et AWS (aligner les noms de pile).',
    '## Connecté à Sentinel d’abord',
    'Si le compte AWS a **d’abord été connecté à Microsoft Sentinel**, le connecteur de Defender for Cloud ne fonctionnera pas tel quel : il faut modifier le modèle CloudFormation et appliquer des étapes de remédiation, décrites dans la page « compte AWS connecté à Sentinel ». C’est un piège classique des environnements qui ont de l’historique SIEM.',
    '## Cas EKS documentés',
    'Quand l’approvisionnement automatique est activé mais que le capteur n’est pas installé, trois causes sont documentées. **Le rôle IAM d’approvisionnement a été recréé** : même nom, identité différente; une entrée d’accès EKS plus ancienne que le rôle indique le problème, et on ne supprime que l’entrée d’accès de ce rôle, jamais le rôle ni d’autres entrées. **Un outil de gestion de cluster retire des plages réseau requises** de la liste d’autorisation du point de terminaison de l’API Kubernetes : la configuration déclarée doit les conserver. **Un ancien enregistrement Azure Arc subsiste** après la recréation d’un cluster du même nom : on supprime l’enregistrement obsolète après confirmation, pas seulement l’extension. Dans chaque cas : consigner l’état avant de supprimer, ne pas ouvrir le point de terminaison à tout Internet et garder l’approvisionnement automatique activé.',
    '## Suppression impossible et verrous',
    'Si la suppression d’un connecteur échoue, consultez le journal d’activité Azure pour une opération refusée à cause d’un **verrou de ressource**; retirez le verrou en suivant la gestion des verrous, puis recommencez. Notez le verrou et son propriétaire avant de le lever.',
    '## Coût des appels d’API vers AWS',
    'À l’intégration d’un compte AWS, le service de découverte exécute immédiatement des appels d’API pour recenser les ressources; ces appels peuvent générer des coûts côté AWS. Prévenez l’équipe infonuagique avant d’intégrer un grand compte.',
    '## Erreurs fréquentes',
    '- Conclure à l’échec avant les douze heures documentées.',
    '- Supprimer le rôle IAM au lieu de l’entrée d’accès obsolète.',
    '- Ouvrir le point de terminaison EKS à tout Internet pour « faire passer » l’installation.',
  ),
  demo: { title: 'Le rôle recréé', body: md(
    'Constat **fictif** : le capteur n’est pas installé sur un cluster EKS malgré l’approvisionnement automatique.',
    '```text',
    'Comparaison : date de création du rôle plus récente que celle de l’entrée d’accès EKS',
    'Action : consigner les réglages, supprimer uniquement cette entrée d’accès; garder le rôle',
    '```',
    '**Lecture commentée.** L’identité du rôle a changé; l’ancienne entrée ne correspond plus.',
    '**Ce que la démo ne prouve pas.** Aucun cluster réel n’a été modifié.') },
  revision: md('## Fiche : dépannage multicloud', '- Liste commune : abonnement, standards, ressource connecteur, journaux, extensions, charges.', '- AWS : CloudFormation terminé; 12 h d’attente; tableau d’erreurs.', '- Sentinel d’abord : modèle à modifier.', '- EKS : rôle recréé, plages retirées, Arc obsolète.', '- Suppression bloquée : verrou.'),
  links: ['troubleshoot-connectors', 'containers-troubleshoot', 'aws-sentinel', 'aws', 'gcp'], teaches: ['depannage-multicloud', 'cloudformation', 'delais', 'verrous'],
});

const l3 = lesson(3, {
  title: 'Méthode de dépannage, extension Defender for Endpoint et escalade au soutien', minutes: 50,
  summary: 'Appliquer une méthode reproductible, conserver les preuves et escalader avec les bons éléments.',
  objectives: ['Suivre une méthode de dépannage en étapes.', 'Utiliser les journaux de l’extension Defender for Endpoint sous Linux.', 'Préparer un dossier d’escalade complet et tenir un registre des écarts.'],
  prerequisites: ['Leçons 1 et 2', 'Module 10 : Servers'],
  body: md(
    '## Une méthode avant les outils',
    '1. **Énoncer le symptôme** avec la ressource, la portée et l’heure. 2. **Vérifier les prérequis** : plan activé, permissions, version, réseau. 3. **Tenir compte des délais documentés** (santé aux 4 h, 12 h pour un nouveau compte AWS, 1 h ou 12 h selon le composant Arc). 4. **Lire l’état exposé par le produit** (statut de connectivité, santé, recommandation d’installation). 5. **Collecter les journaux** locaux ou cloud. 6. **Changer une seule chose à la fois** et noter le résultat. 7. **Revenir à l’état initial** si le changement n’a rien réglé. 8. **Escalader** avec un dossier complet.',
    '## L’extension Defender for Endpoint sous Linux',
    'La documentation d’intégration liste des emplacements précis : les journaux de l’extension (`/var/log/azure/Microsoft.Azure.AzureDefenderForServers.MDE.Linux/`), le journal d’installation (`/var/log/microsoft/mdatp/install.log`), le journal du système (`sudo journalctl --no-pager | grep \'microsoft-mdatp\'`), la santé du capteur (`mdatp health`), et, pour une machine Azure Arc, `azcmagent show`. Un paquet de diagnostic se crée avec `sudo mdatp diagnostic create`. Ces commandes sont **en lecture ou en collecte** : elles ne changent pas la configuration. Les problèmes de dépendances, de compte de service, de systemd, de SELinux et de montage `noexec` ont une page dédiée.',
    '**Avertissement documenté.** Ne désactivez pas la stratégie de groupe, SELinux, les protections de montage ni un autre contrôle de sécurité comme **premier réflexe générique**. Confirmez la cause, suivez la gestion des changements de l’organisation et, si un test désactive temporairement un contrôle, **rétablissez-le immédiatement** après.',
    '## L’accès au portail Defender',
    'Si le portail ne s’ouvre pas depuis Defender for Cloud, vérifiez les permissions d’accès au portail et le proxy ou le pare-feu : le capteur se connecte depuis le **contexte système**, donc le trafic anonyme doit être permis, et les URL de service doivent être autorisées sur le proxy.',
    '## Le dossier d’escalade',
    '| Élément | Exemple fictif |',
    '| --- | --- |',
    '| Symptôme et portée | Capteur absent sur 1 cluster EKS, compte 123456789012 simulé |',
    '| Chronologie | Rôle recréé le 2026-10-20; constat le 2026-10-22 |',
    '| Vérifications faites | Statut de connectivité, entrées d’accès, plages réseau |',
    '| Journaux joints | Sorties datées, sans secret ni jeton |',
    '| Changements tentés | Un seul, annulé |',
    '| Données demandées par le soutien | Nom du cluster, espace de noms, charge, image, condensat |',
    'Caviardez secrets, jetons et identifiants avant d’envoyer quoi que ce soit.',
    '## Le registre des écarts',
    'Chaque cause trouvée alimente un **registre des écarts de plateforme** : symptôme, cause, source documentaire consultée, date, correctif, propriétaire, revérification prévue. Ce registre rend les prochains dépannages plus rapides et alimente le plan de revue trimestriel.',
    '## Erreurs fréquentes',
    '- Changer cinq choses à la fois et ne plus savoir laquelle a fonctionné.',
    '- Désactiver un contrôle de sécurité comme première réponse.',
    '- Envoyer des journaux contenant des secrets.',
  ),
  demo: { title: 'Le dossier incomplet', body: md(
    'Constat **fictif** : un billet de soutien reste sans réponse utile pendant une semaine.',
    '```text',
    'Cause : aucun nom de ressource, aucune chronologie, aucun journal joint',
    'Correction : renvoyer un dossier avec symptôme, chronologie, vérifications et journaux caviardés',
    '```',
    '**Lecture commentée.** Un dossier complet évite les allers-retours.',
    '**Ce que la démo ne prouve pas.** Aucun billet réel n’a été ouvert.') },
  revision: md('## Fiche : méthode de dépannage', '- Symptôme, prérequis, délais, état du produit, journaux.', '- Un changement à la fois; retour à l’état initial.', '- mdatp health, journaux d’installation, azcmagent show.', '- Ne pas désactiver un contrôle par réflexe.', '- Dossier d’escalade caviardé et registre des écarts.'),
  links: ['mde-integration', 'mde-health', 'arc-troubleshoot', 'troubleshoot-connectors', 'release-notes'], teaches: ['methode-depannage', 'extension-mde', 'escalade-support', 'registre-ecarts'],
});

const exercises = [
  MT('d25-g1', 'guided', 'comprendre', c1, 'Rythme de revue', 'Associez chaque fréquence à sa vérification principale.', [['Hebdomadaire', 'Connectivité des connecteurs et machines en mauvaise santé'], ['Mensuelle', 'Classeur de couverture et exceptions échues'], ['Trimestrielle', 'Notes de publication et automatisations actives']], 'Trois rythmes.'),
  WF('d25-a1', 'autonomous', 'verifier', c1, 'Lire la santé d’un connecteur', 'Ordonnez la lecture de la santé d’un connecteur AWS.', ['Ouvrir Defender for Cloud', 'Aller dans Environment settings', 'Repérer le compte AWS', 'Lire la colonne Connectivity status', 'Ouvrir les détails et lire la remédiation', 'Consigner le constat daté'], [['Conclure que tout va bien faute d’alertes', 'Le silence n’est pas une preuve.']], 'Ouvrir, paramètres, compte, statut, détails, consigner.'),
  Q('d25-q1a', 'quiz', 'fonctionner', c1, 'Mise à jour de la santé', 'À quelle fréquence l’état de santé de Defender for Endpoint est-il mis à jour ?', ['Aux quatre heures.', 'Selon la documentation consultée.'], [['À la seconde.', 'Faux.'], ['Une fois par semaine.', 'Faux.'], ['Jamais.', 'Faux.']], 'Quatre heures.'),
  Q('d25-q1b', 'quiz', 'comprendre', c1, 'Deux familles de problèmes', 'Quelles deux familles de problèmes de santé sont distinguées ?', ['Installation et battement de coeur.', 'Agent installé mais muet, ou non installé.'], [['Réseau et disque.', 'Faux.'], ['Coût et licence.', 'Faux.'], ['Jour et nuit.', 'Faux.']], 'Installation et battement de coeur.'),
  Q('d25-q1c', 'quiz', 'verifier', c1, 'Silence', 'Que prouve l’absence d’alerte ?', ['Rien à elle seule : elle peut cacher un trou de couverture.', 'Il faut vérifier la couverture.'], [['Que tout est sain.', 'Faux.'], ['Que le coût est nul.', 'Faux.'], ['Que le plan est inutile.', 'Faux.']], 'Rien à elle seule.'),

  MT('d25-g2', 'guided', 'comprendre', c2, 'Erreurs CloudFormation', 'Associez chaque erreur à son premier réflexe.', [['Accès refusé', 'Vérifier le rôle IAM et la confiance du StackSet'], ['Ressource déjà existante', 'Déployer d’abord dans une seule région'], ['Exécution Lambda non prise en charge', 'Télécharger le modèle le plus récent']], 'Trois erreurs.'),
  OR('d25-a2', 'autonomous', 'fonctionner', c2, 'Ordre des vérifications', 'Ordonnez les vérifications d’un connecteur muet.', ['Abonnement sélectionné dans le filtre', 'Standards assignés au connecteur', 'Ressource de connecteur présente dans Resource Graph', 'Déploiement CloudFormation terminé', 'Attente de douze heures respectée', 'Ouvrir un dossier de soutien'], 'Du moins coûteux au plus coûteux.'),
  Q('d25-q2a', 'quiz', 'fonctionner', c2, 'Délai AWS', 'Combien de temps attendre après la création du compte racine AWS ?', ['Au moins douze heures.', 'Avant de conclure à un échec.'], [['Une minute.', 'Faux.'], ['Une semaine.', 'Faux.'], ['Aucun délai.', 'Faux.']], 'Douze heures.'),
  Q('d25-q2b', 'quiz', 'securiser', c2, 'Entrée d’accès EKS', 'Que supprime-t-on quand le rôle d’approvisionnement a été recréé ?', ['Seulement l’entrée d’accès obsolète de ce rôle.', 'Jamais le rôle ni d’autres entrées.'], [['Le rôle IAM.', 'Faux.'], ['Toutes les entrées.', 'Faux.'], ['Le cluster.', 'Faux.']], 'L’entrée obsolète.'),
  Q('d25-q2c', 'quiz', 'verifier', c2, 'Sentinel d’abord', 'Que se passe-t-il si le compte AWS a d’abord été connecté à Sentinel ?', ['Le connecteur de Defender for Cloud ne fonctionne pas sans remédiation du modèle.', 'Page dédiée.'], [['Tout fonctionne.', 'Faux.'], ['Le compte est supprimé.', 'Faux.'], ['Le coût disparaît.', 'Faux.']], 'Remédiation nécessaire.'),

  MT('d25-g3', 'guided', 'comprendre', c3, 'Journaux', 'Associez chaque commande à son rôle.', [['mdatp health', 'Santé du capteur'], ['azcmagent show', 'État de la machine Arc'], ['mdatp diagnostic create', 'Paquet de diagnostic']], 'Trois commandes.'),
  WF('d25-a3', 'autonomous', 'maintenir', c3, 'Dossier d’escalade', 'Ordonnez la préparation d’un dossier d’escalade.', ['Énoncer symptôme et portée', 'Écrire la chronologie', 'Lister les vérifications faites', 'Joindre les journaux caviardés', 'Noter l’unique changement tenté', 'Envoyer au soutien'], [['Envoyer les journaux avec les jetons', 'Fuite de secrets.']], 'Symptôme, chronologie, vérifications, journaux, changement, envoi.'),
  Q('d25-q3a', 'quiz', 'securiser', c3, 'Contrôles de sécurité', 'Peut-on désactiver SELinux comme premier réflexe ?', ['Non : confirmer la cause et suivre la gestion des changements.', 'Rétablir immédiatement après un test.'], [['Oui.', 'Faux.'], ['Seulement la nuit.', 'Faux.'], ['Toujours.', 'Faux.']], 'Non.'),
  Q('d25-q3b', 'quiz', 'fonctionner', c3, 'Un changement à la fois', 'Pourquoi changer une seule chose à la fois ?', ['Pour savoir ce qui a fonctionné.', 'Et revenir en arrière.'], [['Pour aller plus vite.', 'Faux.'], ['Pour économiser.', 'Faux.'], ['Aucune raison.', 'Faux.']], 'Savoir ce qui a fonctionné.'),
  Q('d25-q3c', 'quiz', 'maintenir', c3, 'Registre', 'À quoi sert le registre des écarts ?', ['À accélérer les dépannages futurs et alimenter la revue.', 'Cause, source, correctif, propriétaire.'], [['À décorer.', 'Faux.'], ['À remplacer le soutien.', 'Faux.'], ['À cacher les erreurs.', 'Faux.']], 'Mémoire d’exploitation.'),

  Q('d25-ev1', 'eval', 'comprendre', c1, 'Où lire la connectivité', 'Où lit-on la connectivité d’un connecteur ?', ['Colonne Connectivity status dans Environment settings.', 'Puis détails.'], [['Dans la facturation.', 'Faux.'], ['Dans Power BI seulement.', 'Faux.'], ['Nulle part.', 'Faux.']], 'Environment settings.'),
  M('d25-ev2', 'eval', 'verifier', c1, 'Revue hebdomadaire', 'Cochez les éléments d’une revue hebdomadaire.', [['Connectivité des connecteurs.', 'Oui.'], ['Machines en mauvaise santé.', 'Oui.'], ['Nouveaux abonnements sans plan.', 'Oui.']], [['Renégocier le contrat.', 'Hors sujet.']], 'Trois éléments.'),
  FX('d25-ev3', 'eval', 'verifier', c2, 'Fiche de dépannage EKS', 'Complétez la fiche de dépannage fictive.', { symptome: '', cause: '', action: '', suivi: '' }, { symptome: 'capteur absent malgré l’approvisionnement automatique', cause: 'rôle IAM recréé et entrée d’accès obsolète', action: 'supprimer uniquement l’entrée d’accès obsolète', suivi: 'consigner dans le registre des écarts' }, [['symptome', 'capteur absent malgré l’approvisionnement automatique', 'Nommer le symptôme.', 'comprendre'], ['cause', 'rôle IAM recréé et entrée d’accès obsolète', 'Identifier la cause.', 'verifier'], ['action', 'supprimer uniquement l’entrée d’accès obsolète', 'Corriger sans excès.', 'securiser'], ['suivi', 'consigner dans le registre des écarts', 'Capitaliser.', 'maintenir']], 'Symptôme, cause, action, suivi.'),
  OR('d25-ev4', 'eval', 'fonctionner', c3, 'Méthode', 'Ordonnez la méthode de dépannage.', ['Énoncer le symptôme', 'Vérifier les prérequis', 'Tenir compte des délais', 'Lire l’état du produit', 'Collecter les journaux', 'Changer une chose et noter'], 'Du constat à l’essai.'),
  CF('d25-ev5', 'eval', 'cout', c2, 'Coût de l’intégration AWS', 'Paramétrez la préparation d’une intégration AWS.', [['Prévenir l’équipe infonuagique des appels d’API de découverte', 'on', 'Coûts côté AWS possibles.'], ['Intégrer un grand compte sans prévenir', 'off', 'Surprise de coûts.']], 'Prévenir avant d’intégrer.'),
  WF('d25-ev6', 'eval', 'securiser', c3, 'Suppression d’un verrou', 'Ordonnez la levée d’un verrou qui bloque la suppression.', ['Lire le journal d’activité', 'Identifier le verrou et son propriétaire', 'Obtenir l’accord', 'Retirer le verrou', 'Supprimer le connecteur'], [['Retirer tous les verrous du groupe de ressources', 'Portée excessive.']], 'Journal, verrou, accord, retrait, suppression.'),
  SH('d25-ev7', 'eval', 'verifier', c1, 'Heures minimales AWS', 'Combien d’heures minimales attendre après la création du compte racine AWS ? (nombre)', ['12'], 'Douze.', 12),
  Q('d25-ev8', 'eval', 'comprendre', c3, 'Commande de santé', 'Quelle commande affiche la santé du capteur Linux ?', ['mdatp health.', 'Lecture seule.'], [['rm -rf.', 'Faux.'], ['shutdown.', 'Faux.'], ['mdatp delete.', 'Faux.']], 'mdatp health.'),

  IN('d25-cs1', 'case', 'verifier', c1, 'Cas : rapport de santé', 'Éléments d’un rapport fictif : repérez ceux à corriger.', 'text', [['« Aucune alerte depuis un mois : tout est sain. »', 'Une absence d’alerte n’est pas une preuve; vérifier la couverture', 'Garder tel quel'], ['« Santé corrigée il y a 20 minutes, toujours rouge : le correctif a échoué. »', 'Attendre le cycle de mise à jour de quatre heures', 'Garder tel quel']], 'Chaque élément est corrigé.'),
  MT('d25-cs2', 'case', 'securiser', c2, 'Cas : trois réactions', 'Associez chaque réaction à l’évaluation.', [['Supprimer l’entrée d’accès obsolète après consignation', 'Appropriée'], ['Ouvrir le point de terminaison EKS à tout Internet', 'À refuser'], ['Supprimer le rôle IAM entier', 'À refuser : portée excessive']], 'Une évaluation par réaction.'),
  WF('d25-cs3', 'case', 'maintenir', c3, 'Cas : billet de soutien', 'Ordonnez la reprise d’un billet de soutien sans réponse.', ['Relire le billet', 'Ajouter chronologie et portée', 'Joindre les journaux caviardés', 'Préciser le changement tenté', 'Relancer le soutien'], [['Fermer le billet', 'Problème non résolu.']], 'Relire, compléter, joindre, préciser, relancer.'),
  OP('d25-cs-open', 'case', 'verifier', c3, 'Cas : exploitation chez Nordlys', 'Rédigez le plan d’exploitation d’une organisation fictive.', 'Une page : revues, dépannage, escalade, registre.', [['Les revues ont un rythme et des preuves.', 'verifier'], ['La méthode de dépannage est en étapes.', 'fonctionner'], ['L’escalade est caviardée et complète.', 'securiser'], ['Le registre des écarts est tenu.', 'maintenir']], 'Le plan relie revues, méthode, escalade et registre.'),

  Q('d25-rm1', 'remediation', 'comprendre', c1, 'Remédiation : silence', 'Que faire face à un silence prolongé ?', ['Vérifier la connectivité et la couverture.', 'Sans conclure à la sécurité.'], [['Ignorer.', 'Faux.'], ['Désactiver le plan.', 'Faux.'], ['Attendre sans fin.', 'Faux.']], 'Vérifier.'),
  Q('d25-rm2', 'remediation', 'verifier', c2, 'Remédiation : connecteur muet', 'Par quoi commencer pour un connecteur muet ?', ['Par les vérifications communes, du moins au plus coûteux.', 'Puis AWS ou GCP.'], [['Par le soutien.', 'Prématuré.'], ['Par la suppression.', 'Risqué.'], ['Par rien.', 'Faux.']], 'Vérifications communes.'),
  Q('d25-rm3', 'remediation', 'maintenir', c3, 'Remédiation : méthode', 'Que faire si un changement n’a rien réglé ?', ['Revenir à l’état initial.', 'Puis tester une autre hypothèse.'], [['Empiler d’autres changements.', 'Risqué.'], ['Tout désactiver.', 'Risqué.'], ['Ignorer.', 'Faux.']], 'Retour à l’état initial.'),
];

const competencies = comps([
  ['Exploiter la couverture', 'Santé des connecteurs, rythme de revue, silence.', ['Je lis le statut de connectivité.', 'Je distingue installation et battement de coeur.', 'Je planifie un rythme de revue.']],
  ['Dépanner un connecteur multicloud', 'Vérifications communes, CloudFormation, EKS, Sentinel.', ['J’applique les vérifications dans l’ordre.', 'Je respecte les délais documentés.', 'Je corrige sans suppression excessive.']],
  ['Escalader et capitaliser', 'Méthode, journaux, dossier, registre des écarts.', ['Je suis une méthode en étapes.', 'Je prépare un dossier caviardé et complet.', 'Je tiens un registre des écarts.']],
]);

const projects = [
  P(1, 'débutant', 'Fiche de revue hebdomadaire', 'Concevoir une fiche de revue hebdomadaire de la couverture avec preuves.', 'Fiche à cinq lignes avec preuve et limites.', ['Lister les contrôles.', 'Définir la preuve.', 'Définir le propriétaire.'], ['Chaque ligne a une preuve datée.'], ['Conclure sur le silence.'], ['Ajouter une requête Resource Graph.']),
  P(2, 'intermédiaire', 'Arbre de dépannage multicloud', 'Rédiger un arbre de décision de dépannage d’un connecteur AWS ou GCP.', 'Arbre avec vérifications, délais et escalade.', ['Lister les vérifications.', 'Ordonner par coût.', 'Ajouter l’escalade.'], ['Aucune étape destructive sans accord.'], ['Délais oubliés.'], ['Ajouter les cas EKS.'],
    { connected: { accounts: 'Un compte AWS ou un projet GCP de test dédié, sans charge de production.', permissions: 'Droits d’administration limités au compte de test; Security Admin sur l’abonnement de test.', costs: 'Appels d’API de découverte possibles côté cloud tiers et plans payants : confirmer avant activation; aucune activation automatique.', secrets: 'Aucun secret ni jeton dans les captures; caviardage systématique.', cleanup: 'Supprimer le connecteur, la pile CloudFormation ou les ressources GCP créées, et remettre les plans à Free.', limits: 'Environnement de test uniquement. Statut : non réalisée dans un laboratoire Microsoft réel.' } }),
  P(3, 'avancé', 'Registre des écarts de plateforme', 'Concevoir un registre des écarts avec revérification trimestrielle.', 'Registre avec symptôme, cause, source, correctif, propriétaire, date.', ['Définir les champs.', 'Alimenter avec trois cas.', 'Planifier la revérification.'], ['Chaque écart a une source datée.'], ['Registre jamais relu.'], ['Relier aux notes de publication.']),
];

export const d25 = assemble({ id: 'd25', level: 5, n: 25, title: 'Exploitation, santé et dépannage',
  summary: 'Santé des connecteurs et des agents, rythme de revue, dépannage AWS et GCP, cas EKS, extension Defender for Endpoint, dossier d’escalade et registre des écarts.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Tenir la couverture de Nordlys Technologies',
  caseScenario: 'Vous installez un rythme de revue, dépannez un connecteur muet, préparez un dossier d’escalade complet et tenez un registre des écarts. Données simulées.', caseMinutes: 55 });
