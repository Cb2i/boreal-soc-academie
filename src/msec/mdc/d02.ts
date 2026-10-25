// Module 2 : Plans, licences et coûts (niveau 1). Aucun prix figé : la méthode d’estimation est enseignée, les chiffres des exercices sont fictifs.
import { dsl, md } from './dsl.ts';

const { lesson, Q, M, MT, OR, CF, IN, WF, FX, PL, SH, OP, comps, P, assemble } = dsl('d02');
const c1 = { comp: 'd02-c1', lesson: 'd02-l1', tags: ['cspm-base', 'defender-cspm', 'plans-charge', 'plans-deprecies'] };
const c2 = { comp: 'd02-c2', lesson: 'd02-l2', tags: ['etendue', 'sous-plan', 'essai', 'surcharge-ressource'] };
const c3 = { comp: 'd02-c3', lesson: 'd02-l3', tags: ['estimation', 'dwu', 'desactivation', 'facturation'] };

const l1 = lesson(1, {
  title: 'Gratuit ou payant : CSPM de base, Defender CSPM, plans de charge et plans en retrait', minutes: 45,
  summary: 'Savoir ce qui est inclus sans frais, ce qui exige un plan payant et quels plans historiques ne se choisissent plus.',
  objectives: ['Nommer les capacités du CSPM de base et celles qui exigent Defender CSPM.', 'Associer un besoin à un plan de protection des charges de travail.', 'Reconnaître les plans consolidés ou en retrait et leur remplaçant.'],
  prerequisites: ['Module 1 : fondamentaux et architecture'],
  body: md(
    '## Trois familles de coûts',
    'Quand on dit « activer Defender for Cloud », on mélange trois choses. Le **CSPM de base** (foundational CSPM) est inclus sans frais pour les abonnements, comptes AWS et projets GCP connectés : inventaire des actifs, recommandations de la référence de sécurité Microsoft, niveau de sécurité classique, couverture multicloud, export, automatisation de flux et classeurs. **Defender CSPM** est un plan **payant** qui ajoute la gouvernance, la conformité aux standards additionnels, l’explorateur de sécurité du cloud, l’analyse des chemins d’attaque, l’analyse sans agent des machines, la gestion de la posture des données et de l’IA, la priorisation par risque et le lien code-vers-cloud. Les **plans de protection des charges de travail** (serveurs, conteneurs, stockage, bases de données, services d’applications, API, services d’IA) sont **payants** et chacun a sa propre unité de facturation.',
    '## Ce que le gratuit permet vraiment',
    'Le CSPM de base suffit pour évaluer une posture : vous voyez les recommandations et le niveau de sécurité classique. Il ne suffit pas pour prioriser par risque ni pour voir les chemins d’attaque : dans le portail, les colonnes de risque apparaissent floutées sans Defender CSPM, et les recommandations s’affichent avec la mention « Not evaluated » pour les ressources non couvertes. Retenez la conséquence de conception : un projet pilote gratuit prouve la collecte et la lecture des recommandations, pas la valeur de la priorisation.',
    '## Associer le besoin au plan',
    'Un serveur exposé à Internet dont il faut surveiller les menaces : Defender for Servers (plan 1 ou plan 2). Un cluster Kubernetes : Defender for Containers. Un compte de stockage qui reçoit des fichiers de tiers : Defender for Storage. Des bases SQL, PostgreSQL ou Cosmos DB : Defender for Databases. Des sites App Service : Defender for App Service. Des API publiées par API Management : Defender for APIs. Des modèles d’IA Azure OpenAI : protection contre les menaces des services d’IA. Le piège classique est d’acheter un plan de charge de travail pour résoudre un problème de **posture**, qui relève de Defender CSPM, ou l’inverse.',
    '## Plans consolidés et plans en retrait',
    'Le portrait change vite, donc datez toujours vos affirmations. Au 2026-10-25, la documentation indique que les plans historiques Defender for AKS et Defender for Container Registries sont remplacés par Defender for Containers, que Key Vault et Resource Manager passent à un modèle de tarification fixe, et que Defender for DNS n’est plus offert seul : les alertes DNS sont incluses dans Defender for Servers plan 2. Depuis le 2026-07-05, l’API de tarification bloque l’**activation** de ces plans en retrait sur de nouveaux abonnements, tandis que les abonnements existants continuent de les utiliser. Dans le portail Defender (préversion), les offres de bases de données sont regroupées en un seul plan. Ne présentez jamais un plan en retrait comme un choix d’achat.',
    '| Besoin | Plan | Remarque |',
    '| --- | --- | --- |',
    '| Posture, inventaire, recommandations | CSPM de base | Sans frais |',
    '| Chemins d’attaque, priorisation par risque | Defender CSPM | Payant |',
    '| Menaces sur serveurs | Defender for Servers P1 ou P2 | Choix du sous-plan |',
    '| Menaces sur conteneurs | Defender for Containers | Remplace AKS et ACR |',
    '| Alertes DNS | Servers P2 | Plan DNS seul en retrait |',
    '```text',
    'Fiche de choix de plan (exemple fictif)',
    'Besoin   : voir les chemins d’attaque vers un compte de stockage sensible',
    'Plan     : Defender CSPM (posture), pas Defender for Storage (menaces)',
    'Preuve   : page de documentation datée 2026-10-25 + inventaire des actifs',
    '```',
    '## Erreurs fréquentes',
    '- Confondre le coût d’un plan avec le coût des ressources qu’il collecte (espace de travail, stockage, calcul).',
    '- Acheter un plan de charge de travail pour un besoin de posture.',
    '- Présenter AKS, ACR, DNS, Key Vault ou Resource Manager comme des plans à choisir aujourd’hui.',
  ),
  demo: { title: 'Choisir le plan de cinq besoins', body: md(
    'Besoins **fictifs** :',
    '```text',
    '1. Voir quelles ressources sont exposées à Internet et sensibles     -> Defender CSPM',
    '2. Détecter un script malveillant lancé sur un serveur Linux           -> Defender for Servers',
    '3. Scanner les fichiers téléversés dans un conteneur de blobs          -> Defender for Storage',
    '4. Lister les recommandations de la référence de sécurité              -> CSPM de base (sans frais)',
    '5. Alertes sur des requêtes DNS suspectes depuis une VM                -> Servers P2 (plan DNS seul en retrait)',
    '```',
    '**Lecture commentée.** Un seul besoin se règle gratuitement. Le besoin 5 illustre un plan retiré dont la capacité survit ailleurs.',
    '**Ce que la démo ne prouve pas.** Aucun abonnement n’a été interrogé, aucun prix n’est cité.') },
  revision: md('## Fiche : gratuit ou payant', '- CSPM de base : sans frais, recommandations et niveau de sécurité classique.', '- Defender CSPM : payant, chemins d’attaque, risque, gouvernance, conformité additionnelle.', '- Plans de charge de travail : payants, chacun avec son unité de facturation.', '- Plans en retrait : AKS, ACR, DNS, Key Vault, Resource Manager (voir leur remplaçant).', '- Un coût de plan n’est pas le coût de ce que le plan collecte.'),
  links: ['cspm', 'pricing', 'servers-plan', 'plan-mgmt-changes', 'release-notes'], teaches: ['cspm-base', 'defender-cspm', 'plans-charge', 'plans-deprecies'],
});

const l2 = lesson(2, {
  title: 'Étendue, sous-plans et essai gratuit : où le plan s’applique', minutes: 45,
  summary: 'Lire la portée d’un plan (abonnement, ressource, groupe de gestion), choisir un sous-plan et comprendre les règles de l’essai.',
  objectives: ['Décrire la portée d’un plan à l’abonnement et la surcharge au niveau de la ressource.', 'Choisir entre Servers plan 1 et plan 2 selon le besoin.', 'Énoncer les règles de l’essai gratuit par cloud et les permissions requises.'],
  prerequisites: ['Leçon 1'],
  body: md(
    '## Le plan se règle à un niveau, pas partout',
    'Un plan s’active par défaut à l’échelle d’un **abonnement Azure**, d’un **compte AWS** (connecteur) ou d’un **projet GCP**. Les ressources en héritent. Certains plans acceptent une **surcharge au niveau de la ressource** : Defender for Servers peut être activé ou désactivé par machine, et Defender for SQL se configure sur la page de la ressource. Cette surcharge est précieuse pour exclure un parc de laboratoire, et dangereuse parce qu’elle cache des trous : une machine peut être « non couverte » alors que le plan est « On » sur l’abonnement.',
    '## Defender for Servers : plan 1 ou plan 2',
    'Le **plan 1** apporte la détection et réponse sur point de terminaison par l’intégration de Defender for Endpoint, l’intégration automatique des machines, les alertes et incidents intégrés, l’inventaire logiciel et l’évaluation des vulnérabilités. Le **plan 2** ajoute l’analyse sans agent (vulnérabilités, logiciels malveillants, secrets), l’évaluation de conformité, la gestion avancée des vulnérabilités, une franchise d’ingestion de 500 Mo par jour et par machine dans l’espace de travail Log Analytics, la surveillance de l’intégrité des fichiers, l’accès juste-à-temps aux machines virtuelles, la carte réseau et les alertes DNS. Retenez la règle d’étendue : le plan 1 s’active par abonnement **ou** par ressource, le plan 2 s’active par abonnement et peut ensuite être désactivé pour certaines ressources, mais il ne s’active pas sur une seule machine.',
    '## Ce qui change selon le cloud',
    'Les machines AWS et GCP passent par **Azure Arc**, que le connecteur déploie automatiquement. L’accès juste-à-temps existe pour Azure et AWS, pas pour GCP. La carte réseau et la détection des menaces de la couche réseau Azure sont propres à Azure. Une machine hors Azure intégrée directement à Defender for Endpoint, sans Arc, n’obtient que les fonctions du plan 1.',
    '## Essai gratuit',
    'La plupart des plans offrent un essai de **30 jours** ou jusqu’à une limite d’usage. Sur Azure, l’essai se compte **par activation d’un nouveau plan sur un abonnement**. Sur AWS, un essai par compte AWS, sur GCP un par projet. Pour **voir** l’état de l’essai il suffit du rôle Reader ; pour **activer** un plan il faut Security Admin ou Owner. Dans le portail Defender (préversion), l’essai est un geste explicite : si vous activez un plan sans le choisir, la facturation commence tout de suite. Un verrouillage empêche les environnements enfants de surcharger le réglage du parent.',
    '## Activer par le portail, la politique ou le code',
    'Le même réglage se pose par l’interface, par Azure Policy, par PowerShell, par Azure CLI, par l’API REST ou par Terraform. L’exemple ci-dessous vient de la documentation du module Az.Security. Il **modifie** l’état de tarification : à exécuter seulement dans un abonnement de test, après accord sur les coûts.',
    '```powershell',
    '# Exemple tiré de la documentation (Set-AzSecurityPricing, module Az.Security). ÉCRITURE : active un plan payant.',
    '# Prérequis : Security Admin ou Owner sur l’abonnement. Non exécuté dans ce parcours.',
    'Set-AzSecurityPricing -Name "VirtualMachines" -PricingTier "Standard" -SubPlan "P2"',
    '# Lecture seule pour vérifier :',
    'Get-AzSecurityPricing | Select-Object Name, PricingTier, SubPlan, FreeTrialRemainingTime',
    '```',
    '## Erreurs fréquentes',
    '- Croire que le plan 2 s’active sur une seule machine : il s’active à l’abonnement.',
    '- Oublier la surcharge au niveau de la ressource en lisant « plan activé ».',
    '- Activer un plan à la fin d’un essai sans lire la facturation qui suit.',
  ),
  demo: { title: 'Lire la portée d’un plan sur trois machines', body: md(
    'Situation **fictive** : Servers P2 « On » sur l’abonnement, trois machines.',
    '```text',
    'srv-web-01  : héritage du plan         -> P2 appliqué',
    'srv-lab-07  : surcharge « désactivé »  -> aucune protection, malgré le plan « On »',
    'srv-arc-12  : machine hors Azure via Arc -> P2 appliqué, JIT non applicable (GCP)',
    '```',
    '**Lecture commentée.** Le plan « On » n’implique pas la couverture. Il faut lister les surcharges avant d’affirmer quoi que ce soit.',
    '**Ce que la démo ne prouve pas.** Les noms de machines sont inventés.') },
  revision: md('## Fiche : portée et essai', '- Portée par défaut : abonnement, compte AWS, projet GCP.', '- Surcharge par ressource pour Servers et SQL : à lister avant d’affirmer.', '- Servers P1 : par abonnement ou par ressource. P2 : par abonnement, désactivable par ressource.', '- Essai : 30 jours ou limite d’usage, par plan et par abonnement, compte ou projet.', '- Voir l’essai : Reader. Activer : Security Admin ou Owner.'),
  links: ['servers-plan', 'servers-enable', 'free-trial', 'set-pricing', 'plan-mgmt'], teaches: ['etendue', 'sous-plan', 'essai', 'surcharge-ressource'],
});

const l3 = lesson(3, {
  title: 'Estimer, suivre et désactiver : coût, facturation et retour arrière', minutes: 50,
  summary: 'Estimer avec le calculateur officiel, comprendre le modèle de facturation en unités de charge (DWU), suivre les coûts et désactiver proprement.',
  objectives: ['Estimer le coût d’un plan avec une méthode reproductible et datée.', 'Distinguer le modèle de tarification existant du modèle DWU en préversion.', 'Désactiver un plan sans laisser de mécanisme de réactivation ni de coût résiduel.'],
  prerequisites: ['Leçons 1 et 2'],
  body: md(
    '## Estimer sans citer de prix',
    'La page officielle de tarification et le **calculateur de coûts** intégré (Environment settings, Cost Calculator) font foi. Le calculateur accepte trois sources d’actifs : les environnements déjà connectés (recommandé pour Azure), un script PowerShell 7 en **lecture seule** pour AWS et GCP non connectés (rôle Reader sur l’abonnement, roles/viewer sur GCP) et des actifs saisis à la main. Il produit une estimation **approximative** exportable en CSV et ne tient pas compte des réservations. Sur les grands environnements, comptez 30 à 60 minutes de découverte. Votre rapport doit contenir la date, la source, les hypothèses de volume et la fourchette, jamais un chiffre sans contexte.',
    '## Deux modèles de facturation',
    'Le modèle **existant** facture chaque plan selon son unité : par serveur, par compte de stockage, par instance de base de données, par vCPU pour les conteneurs, etc. Le modèle en **unités de charge de travail Defender (DWU)**, en préversion dans le portail Defender, unifie l’estimation, le suivi et la facturation. Selon la documentation, il compte les conteneurs par nœud protégé plutôt que par vCPU, facture Key Vault, stockage et Resource Manager par ressource plutôt que par transaction, regroupe les offres de bases de données en un plan et ne conserve plus de plan DNS à part. Déplacer un abonnement vers la gestion des plans du portail Defender n’est pas obligatoire au départ ; la configuration devient en lecture seule dans le portail Azure, **les configurations au niveau de la ressource ne sont pas conservées**, et la facturation DWU s’applique à cet abonnement. Une première synchronisation peut prendre jusqu’à 24 heures.',
    '## Les coûts qu’on oublie',
    'Un plan a des **coûts indirects** : l’espace de travail Log Analytics qui reçoit les journaux au-delà de la franchise, le stockage des résultats, les fonctions et applications logiques d’automatisation, la machine Azure Arc, les journaux AWS CloudTrail ou GCP Cloud Logging, l’agent OS Config sur GCP. Distinguez toujours **coût du plan**, **coût de la collecte**, **coût du calcul** et **coût des autres services**. Pour suivre les dépenses réelles, ouvrez l’analyse des coûts de Cost Management, filtrez par nom de service ou de compteur (Defender for Servers, Storage, App Service, Defender CSPM), ou utilisez le rapport de coûts et d’utilisation du portail Defender. Les chiffres journaliers peuvent fluctuer : lisez des tendances.',
    '## Désactiver proprement',
    'Passer un plan à « Off » arrête ses fonctions, recommandations et alertes, mais **ne supprime pas** les ressources de soutien (espace de travail, compte de stockage) ni les surcharges de ressource restées à « On ». Il faut aussi retirer les mécanismes qui le réactivent : le provisionnement automatique, les attributions Azure Policy comme « Deploy Microsoft Defender for Endpoint… », les réglages au niveau de la ressource. Pour AWS et GCP, passez le plan à Off puis reconfigurez l’accès (modèle CloudFormation ou Terraform, script gcloud) afin de retirer les permissions. Vérifiez trois jours plus tard dans l’analyse des coûts que la ligne de facturation a cessé.',
    '```text',
    'Estimation (exemple fictif, prix NON réels)',
    'Hypothèse : 120 serveurs, dont 20 exclus par balise ; prix fictif 10 unités par serveur par mois',
    'Calcul    : (120 - 20) x 10 = 1000 unités par mois',
    'Hors calcul : espace de travail au-delà de la franchise, Arc, stockage des résultats',
    '```',
    '## Erreurs fréquentes',
    '- Présenter une estimation comme une facture ou un engagement.',
    '- Désactiver le plan sans retirer la politique ou le provisionnement qui le réactive.',
    '- Migrer un abonnement vers la gestion des plans du portail Defender en croyant conserver les surcharges de ressource.',
  ),
  demo: { title: 'Estimer puis désactiver', body: md(
    'Procédure **fictive** pour un abonnement de test :',
    '```text',
    '1. Calculateur : actifs de l’environnement connecté -> export CSV daté',
    '2. Hypothèses : volumes, exclusions, franchise d’ingestion',
    '3. Plan activé le 2026-10-01 -> Cost analysis, filtre « Defender for Servers » le 2026-10-04',
    '4. Désactivation : Off + retrait de la politique + vérification le 2026-10-08',
    '```',
    '**Lecture commentée.** Chaque étape produit une preuve datée. Sans l’étape 4, la facture peut continuer.',
    '**Ce que la démo ne prouve pas.** Aucun abonnement réel, aucun montant réel.') },
  revision: md('## Fiche : coûts', '- Calculateur officiel : approximatif, lecture seule, exportable, sans réservations.', '- Deux modèles : existant et DWU (préversion). Surcharges de ressource non conservées à la migration.', '- Séparer coût du plan, de la collecte, du calcul et des autres services.', '- Suivi réel : Cost Management ou rapport du portail Defender.', '- Désactiver = Off + retirer ce qui réactive + vérifier la facturation.'),
  links: ['cost-calculator', 'dwu', 'disable-plans', 'pricing', 'portal-compare'], teaches: ['estimation', 'dwu', 'desactivation', 'facturation'],
});

const exercises = [
  MT('d02-g1', 'guided', 'comprendre', c1, 'Besoin et plan', 'Associez chaque besoin au plan qui le couvre.', [['Voir les chemins d’attaque vers des données sensibles', 'Defender CSPM'], ['Scanner les fichiers téléversés dans un compte de stockage', 'Defender for Storage'], ['Lister les recommandations de la référence de sécurité', 'CSPM de base']], 'Les chemins d’attaque relèvent de Defender CSPM, l’analyse des fichiers du plan Stockage et les recommandations du CSPM de base sans frais.'),
  PL('d02-a1', 'autonomous', 'comprendre', c1, 'Classer des capacités', 'Placez chaque capacité dans la zone qui la contient : sans frais, Defender CSPM ou plan de charge de travail.', [['Sans frais (CSPM de base)'], ['Defender CSPM (payant)'], ['Plan de charge de travail (payant)']], [['Inventaire des actifs et recommandations', 0], ['Niveau de sécurité classique', 0], ['Analyse des chemins d’attaque', 1], ['Explorateur de sécurité du cloud', 1], ['Alertes de menaces sur un conteneur', 2], ['Analyse de logiciels malveillants au téléversement', 2]], 'Les capacités de posture de base sont gratuites, la priorisation et les chemins relèvent de Defender CSPM, et la détection des menaces des plans de charge de travail.'),
  Q('d02-q1a', 'quiz', 'comprendre', c1, 'Posture ou menace', 'Un directeur veut voir les chemins d’attaque. Quel plan faut-il ?', ['Defender CSPM.', 'C’est une capacité de posture avancée.'], [['Defender for Servers plan 2.', 'Il détecte les menaces sur les machines.'], ['Defender for Storage.', 'Il protège le stockage contre les menaces.'], ['Aucun, c’est gratuit.', 'Faux : les chemins d’attaque sont payants.']], 'Les chemins d’attaque font partie de Defender CSPM.'),
  Q('d02-q1b', 'quiz', 'securiser', c1, 'Plan DNS', 'Un client cherche Defender for DNS. Que répondez-vous au 2026-10-25 ?', ['Les alertes DNS sont incluses dans Defender for Servers plan 2.', 'Le plan DNS seul est en retrait.'], [['Achetez Defender for DNS sur votre nouvel abonnement.', 'L’activation sur de nouveaux abonnements est bloquée depuis 2026-07-05.'], ['Le DNS n’est plus surveillé du tout.', 'Faux, la capacité est incluse ailleurs.'], ['Utilisez Defender for AKS.', 'Sans rapport.']], 'Le plan DNS seul est en retrait et sa valeur est incluse dans Servers P2.'),
  Q('d02-q1c', 'quiz', 'cout', c1, 'Coût du plan', 'Que comprend le coût d’un plan de protection ?', ['Seulement le plan, pas la collecte ni le calcul ni les autres services.', 'Il faut les séparer.'], [['Tout, y compris l’espace de travail.', 'Faux.'], ['Rien du tout.', 'Faux.'], ['Seulement la formation.', 'Absurde.']], 'On sépare toujours le coût du plan des coûts de la collecte et du calcul.'),

  MT('d02-g2', 'guided', 'fonctionner', c2, 'Sous-plan et fonction', 'Associez chaque fonction au sous-plan de Defender for Servers qui l’apporte.', [['Analyse sans agent des logiciels malveillants', 'Plan 2'], ['Intégration automatique de Defender for Endpoint', 'Plan 1'], ['Accès juste-à-temps aux machines', 'Plan 2']], 'Le plan 1 apporte l’EDR intégré, le plan 2 ajoute l’analyse sans agent et l’accès juste-à-temps.'),
  CF('d02-a2', 'autonomous', 'securiser', c2, 'Exclure un parc de laboratoire', 'Paramétrez la démarche pour exclure un parc de laboratoire du plan 2.', [['Activer le plan 2 sur la machine de laboratoire seule', 'off', 'Le plan 2 ne s’active pas sur une seule ressource.'], ['Garder le plan 2 sur l’abonnement et désactiver par ressource', 'on', 'La désactivation par ressource est permise.'], ['Documenter l’exclusion et sa raison', 'on', 'Une exclusion non documentée devient un trou de couverture.']], 'On garde le plan sur l’abonnement, on désactive les ressources de laboratoire et on consigne l’exception.'),
  Q('d02-q2a', 'quiz', 'comprendre', c2, 'Voir ou activer', 'Quel rôle suffit pour consulter l’état de l’essai gratuit ?', ['Reader.', 'Lecture seule.'], [['Security Admin.', 'Nécessaire pour activer, pas pour lire.'], ['Owner.', 'Plus que nécessaire.'], ['Aucun rôle.', 'Faux.']], 'Reader suffit pour voir l’état, Security Admin ou Owner pour activer.'),
  Q('d02-q2b', 'quiz', 'verifier', c2, 'Plan activé et machine nue', 'Servers P2 est « On » sur l’abonnement mais une machine n’est pas protégée. Quelle première hypothèse ?', ['Une surcharge au niveau de la ressource la désactive.', 'Il faut lister les surcharges.'], [['Le plan est cassé pour tout le monde.', 'Peu probable.'], ['Azure a oublié la machine.', 'Non.'], ['La machine est trop petite.', 'Non.']], 'Une surcharge de ressource explique souvent une machine nue sous un plan « On ».'),
  Q('d02-q2c', 'quiz', 'cout', c2, 'Fin d’essai', 'Que faut-il faire avant la fin d’un essai de 30 jours ?', ['Décider d’activer ou non le plan en lisant la facturation qui suit.', 'Sans décision, la facturation peut commencer.'], [['Rien, c’est toujours gratuit.', 'Faux.'], ['Supprimer l’abonnement.', 'Disproportionné.'], ['Activer tous les plans.', 'Coûteux et inutile.']], 'On décide avant la fin de l’essai.'),

  MT('d02-g3', 'guided', 'cout', c3, 'Coût et nature', 'Associez chaque élément à sa catégorie de coût.', [['Espace de travail Log Analytics au-delà de la franchise', 'Collecte'], ['Prix par serveur du plan', 'Plan'], ['Fonction d’automatisation de la réponse', 'Autre service']], 'Plan, collecte et autres services se facturent séparément.'),
  WF('d02-a3', 'autonomous', 'maintenir', c3, 'Désactiver un plan de test', 'Ordonnez la désactivation propre d’un plan sur un abonnement de test.', ['Noter l’état et la facturation avant', 'Passer le plan à Off', 'Retirer la politique ou le provisionnement qui le réactive', 'Contrôler les surcharges de ressource restantes', 'Vérifier l’analyse des coûts quelques jours plus tard'], [['Supprimer l’abonnement', 'Disproportionné et destructeur.'], ['Croire que Off supprime l’espace de travail', 'Il faut le supprimer à part si inutile.']], 'On note l’état, on passe à Off, on retire ce qui réactive, on contrôle les surcharges puis la facture.'),
  Q('d02-q3a', 'quiz', 'comprendre', c3, 'Modèle DWU', 'Que change le modèle DWU pour les conteneurs ?', ['Il compte par nœud protégé et non par vCPU.', 'D’après la documentation en préversion.'], [['Il rend les conteneurs gratuits.', 'Faux.'], ['Il supprime les conteneurs.', 'Absurde.'], ['Il facture au message.', 'Faux.']], 'Le modèle DWU compte les conteneurs par nœud protégé.'),
  Q('d02-q3b', 'quiz', 'securiser', c3, 'Migration vers le portail Defender', 'Que perd-on en déplaçant la gestion des plans d’un abonnement vers le portail Defender ?', ['Les configurations au niveau de la ressource ne sont pas conservées.', 'À vérifier avant migration.'], [['Les alertes.', 'Non.'], ['Le niveau de sécurité.', 'Non.'], ['Les rôles Azure.', 'Non.']], 'Les surcharges de ressource sont à recréer.'),
  Q('d02-q3c', 'quiz', 'cout', c3, 'Source des dépenses réelles', 'Où suit-on les dépenses réelles d’un plan ?', ['Dans l’analyse des coûts de Cost Management ou le rapport de coûts du portail Defender.', 'Les deux montrent la facturation.'], [['Dans le calculateur d’estimation.', 'Il estime, il ne mesure pas.'], ['Dans la matrice de prise en charge.', 'Sans rapport.'], ['Dans les notes de publication.', 'Sans rapport.']], 'On suit les dépenses réelles dans Cost Management ou le rapport du portail Defender.'),

  Q('d02-ev1', 'eval', 'comprendre', c1, 'Gratuit', 'Laquelle de ces capacités est incluse dans le CSPM de base ?', ['Les recommandations de la référence de sécurité.', 'Sans frais.'], [['Les chemins d’attaque.', 'Defender CSPM.'], ['La priorisation par risque complète.', 'Defender CSPM.'], ['L’analyse de logiciels malveillants au téléversement.', 'Plan Stockage.']], 'Les recommandations de base sont gratuites.'),
  M('d02-ev2', 'eval', 'securiser', c1, 'Plans en retrait', 'Cochez les plans historiques dont l’activation est bloquée sur de nouveaux abonnements depuis 2026-07-05.', [['Defender for AKS.', 'Remplacé par Defender for Containers.'], ['Defender for Container Registries.', 'Remplacé par Defender for Containers.'], ['Defender for DNS.', 'Valeur incluse dans Servers P2.']], [['Defender for Storage.', 'Plan actif.'], ['Defender for Servers.', 'Plan actif.']], 'AKS, registres et DNS sont en retrait, le stockage et les serveurs sont actifs.'),
  CF('d02-ev3', 'eval', 'fonctionner', c2, 'Portée du plan 2', 'Paramétrez la règle d’étendue de Servers plan 2.', [['S’active par abonnement', 'on', 'Portée par défaut.'], ['S’active sur une seule machine', 'off', 'Impossible.'], ['Peut être désactivé pour une machine', 'on', 'Si le plan reste On à l’abonnement.']], 'Le plan 2 s’active à l’abonnement et peut être retiré pour certaines machines.'),
  OR('d02-ev4', 'eval', 'verifier', c2, 'Début d’un essai', 'Ordonnez l’activation prudente d’un plan avec essai.', ['Lire les conditions de l’essai', 'Vérifier le rôle Security Admin ou Owner', 'Activer le plan sur un abonnement de test', 'Noter la date de fin de l’essai', 'Décider avant cette date'], 'On lit, on vérifie le rôle, on active en test, on note la fin et on décide avant.'),
  SH('d02-ev5', 'eval', 'cout', c3, 'Estimation à prix fictif', 'Prix FICTIF : 10 unités par serveur par mois. Parc : 120 serveurs dont 20 exclus. Combien d’unités par mois ? (nombre)', ['1000'], 'Cent serveurs couverts fois dix unités donnent mille unités par mois, hors coûts indirects.', 1000),
  WF('d02-ev6', 'eval', 'maintenir', c3, 'Rapport d’estimation', 'Ordonnez les éléments d’un rapport d’estimation.', ['Source et date', 'Hypothèses de volume', 'Fourchette de coût du plan', 'Coûts indirects à ajouter', 'Prochaine revue'], [['Un chiffre unique sans contexte', 'Non vérifiable.']], 'Un rapport d’estimation expose sa source, ses hypothèses, sa fourchette et ses limites.'),
  FX('d02-ev7', 'eval', 'securiser', c3, 'Corriger une procédure de désactivation', 'Corrigez la procédure fictive pour qu’elle soit complète.', { planOff: true, retirerPolitique: false, controlerSurcharges: false, verifierFacturation: false }, { planOff: true, retirerPolitique: true, controlerSurcharges: true, verifierFacturation: true }, [['retirerPolitique', true, 'Retirer la politique qui réactive le plan.', 'securiser'], ['controlerSurcharges', true, 'Contrôler les surcharges de ressource.', 'verifier'], ['verifierFacturation', true, 'Vérifier la facturation après coup.', 'cout']], 'Une désactivation complète ajoute le retrait de la politique, le contrôle des surcharges et la vérification de la facture.'),
  Q('d02-ev8', 'eval', 'cout', c3, 'Prix dans le rapport', 'Pourquoi dater une estimation de coût ?', ['Les prix et les modèles de facturation changent.', 'La date rend l’estimation vérifiable.'], [['Pour faire joli.', 'Non.'], ['Parce que les prix sont stables.', 'Faux.'], ['Pour éviter de citer la source.', 'Faux.']], 'Une estimation sans date est invérifiable.'),

  IN('d02-cs1', 'case', 'verifier', c1, 'Cas : demande d’achat chez Nordlys', 'Demande fictive : repérez les affirmations à corriger.', 'text', [['« Achetons Defender for DNS pour surveiller les requêtes. »', 'Utiliser Servers P2 qui inclut les alertes DNS', 'Garder tel quel'], ['« Le CSPM de base nous donne les chemins d’attaque. »', 'Les chemins d’attaque exigent Defender CSPM', 'Garder tel quel'], ['« Le plan coûte X, point. »', 'Citer source, date, hypothèses et coûts indirects', 'Garder tel quel']], 'Chaque affirmation doit être corrigée ou sourcée.'),
  MT('d02-cs2', 'case', 'fonctionner', c2, 'Cas : portée des plans', 'Associez chaque situation à la lecture correcte.', [['Plan On à l’abonnement et machine en surcharge Off', 'Machine non couverte'], ['Machine AWS via Arc sous Servers P2', 'Couverte si Arc est sain'], ['Machine hors Azure avec EDR direct seulement', 'Fonctions du plan 1']], 'La couverture dépend de la surcharge, d’Arc et du mode d’intégration.'),
  SH('d02-cs3', 'case', 'cout', c3, 'Cas : estimation du pilote', 'Prix FICTIF : 8 unités par serveur par mois. Le pilote couvre 45 serveurs pendant 2 mois. Combien d’unités au total ? (nombre)', ['720'], 'Quarante-cinq serveurs fois huit unités fois deux mois donnent sept cent vingt unités.', 720),
  OP('d02-cs-open', 'case', 'cout', c3, 'Cas : proposition de plans pour Nordlys', 'Rédigez une proposition de plans pour un parc fictif.', 'Une page : besoins, plans retenus, plans écartés (dont un plan en retrait), portée et exclusions, méthode d’estimation datée, plan de désactivation.', [['Les plans correspondent aux besoins.', 'comprendre'], ['Les exclusions sont documentées.', 'securiser'], ['L’estimation est sourcée, datée et sépare les coûts.', 'cout'], ['La désactivation retire les mécanismes de réactivation.', 'maintenir']], 'Le livrable relie besoin, plan, portée, coût et retour arrière.'),

  Q('d02-rm1', 'remediation', 'comprendre', c1, 'Remédiation : gratuit', 'Quelle capacité est gratuite ?', ['Les recommandations du CSPM de base.', 'Posture de base.'], [['Les chemins d’attaque.', 'Payant.'], ['La protection des conteneurs.', 'Payant.'], ['Les alertes de stockage.', 'Payant.']], 'Seul le CSPM de base est gratuit.'),
  Q('d02-rm2', 'remediation', 'securiser', c2, 'Remédiation : surcharge', 'Que cache une surcharge au niveau de la ressource ?', ['Une machine non couverte sous un plan « On ».', 'À lister.'], [['Une facture moins chère toujours.', 'Pas toujours.'], ['Un abonnement supprimé.', 'Non.'], ['Un rôle manquant.', 'Non.']], 'Une surcharge peut cacher un trou de couverture.'),
  Q('d02-rm3', 'remediation', 'cout', c3, 'Remédiation : désactivation', 'Que doit-on faire en plus de passer un plan à Off ?', ['Retirer ce qui le réactive et vérifier la facturation.', 'Politique et provisionnement.'], [['Rien.', 'Insuffisant.'], ['Supprimer le locataire.', 'Disproportionné.'], ['Changer de rôle.', 'Sans rapport.']], 'On retire les mécanismes de réactivation et on contrôle la facture.'),
];

const competencies = comps([
  ['Choisir les plans', 'Associer besoin, plan et alternative gratuite.', ['Je distingue gratuit, Defender CSPM et plans de charge.', 'Je reconnais les plans en retrait.', 'Je justifie un plan par un besoin.']],
  ['Maîtriser la portée', 'Étendue, sous-plans, surcharges et essai.', ['Je lis la portée d’un plan.', 'Je choisis P1 ou P2 selon le besoin.', 'Je liste les surcharges avant d’affirmer.']],
  ['Estimer et contrôler les coûts', 'Estimation datée, suivi réel, désactivation.', ['Je produis une estimation sourcée et datée.', 'Je sépare les coûts du plan, de la collecte et des autres services.', 'Je désactive un plan sans mécanisme de réactivation.']],
]);

const projects = [
  P(1, 'débutant', 'Fiche de choix de plans', 'Choisir les plans pour dix besoins fictifs.', 'Tableau besoin, plan, alternative.', ['Lister dix besoins.', 'Choisir le plan.', 'Signaler les plans en retrait.'], ['Chaque besoin a un plan et une source datée.'], ['Acheter un plan pour un besoin de posture.'], ['Ajouter le sous-plan quand il existe.']),
  P(2, 'intermédiaire', 'Estimation d’un pilote', 'Estimer le coût d’un pilote de 50 serveurs avec des prix fictifs et la méthode du calculateur.', 'Tableur : hypothèses, formule, coûts indirects.', ['Poser les hypothèses.', 'Calculer le coût fictif du plan.', 'Lister les coûts indirects.', 'Rédiger la fourchette datée.'], ['La méthode est reproductible et chaque chiffre fictif est étiqueté.'], ['Confondre estimation et facture.'], ['Ajouter un scénario d’exclusion par balise.'],
    { connected: { accounts: 'Un abonnement Azure de test avec accès au calculateur de coûts de Defender for Cloud.', permissions: 'Reader pour le calculateur ; Cost Management Reader pour lire la facturation.', costs: 'Aucun frais : lecture et estimation seulement. Ne pas activer de plan payant.', secrets: 'Aucun secret.', cleanup: 'Aucune ressource créée.', limits: 'Statut : non réalisée dans un laboratoire Microsoft réel.' } }),
  P(3, 'avancé', 'Procédure d’activation et de retour arrière', 'Rédiger une procédure d’activation d’un plan avec essai, mesure de coûts et désactivation complète.', 'Procédure à trois phases avec preuves datées.', ['Décrire l’activation en test.', 'Définir les mesures de coût.', 'Décrire la désactivation et ses vérifications.', 'Prévoir la migration éventuelle vers la gestion des plans du portail Defender.'], ['Chaque phase a une preuve et un propriétaire.'], ['Oublier la politique qui réactive le plan.'], ['Ajouter une variante AWS et GCP.']),
];

export const d02 = assemble({ id: 'd02', level: 1, n: 2, title: 'Plans, licences et coûts',
  summary: 'Gratuit ou payant, plans de charge de travail et plans en retrait, portée et sous-plans, essai gratuit, estimation datée, modèle DWU et désactivation propre.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Choisir et chiffrer les plans de Nordlys Technologies',
  caseScenario: 'Vous choisissez des plans, lisez des portées, estimez un pilote avec des prix fictifs et planifiez une désactivation. Données et prix simulés.', caseMinutes: 45 });
