// Module 4 : Déploiement et couverture (niveau 1).
import { dsl, md } from './dsl.ts';

const { lesson, Q, M, MT, OR, CF, IN, WF, FX, PL, SH, OP, comps, P, assemble } = dsl('d04');
const c1 = { comp: 'd04-c1', lesson: 'd04-l1', tags: ['echelle', 'groupe-gestion', 'azure-policy', 'iac'] };
const c2 = { comp: 'd04-c2', lesson: 'd04-l2', tags: ['composants', 'ama', 'mde', 'arc', 'extensions-cspm'] };
const c3 = { comp: 'd04-c3', lesson: 'd04-l3', tags: ['audit-couverture', 'classeur', 'connectivite', 'requetes'] };

const l1 = lesson(1, {
  title: 'Déployer à l’échelle : groupes de gestion, Azure Policy et code', minutes: 50,
  summary: 'Activer Defender for Cloud et ses plans sur de nombreux abonnements sans passer par chacun, et savoir ce que la politique fait et ne fait pas.',
  objectives: ['Activer Defender for Cloud sur un groupe de gestion avec Azure Policy et une tâche de remédiation.', 'Appliquer la règle « un seul plan Servers par abonnement » à une architecture de groupes de gestion.', 'Choisir entre portail, politique, PowerShell, API REST et Terraform pour un déploiement donné.'],
  prerequisites: ['Modules 2 et 3'],
  body: md(
    '## Pourquoi on évite le portail à grande échelle',
    'Avec trois abonnements, le portail suffit. Avec trois cents, il produit des écarts : un plan oublié, une exclusion non documentée, un abonnement créé après le projet. Le déploiement à l’échelle s’appuie sur trois idées. **Hériter** : on pose le réglage sur un groupe de gestion pour que les abonnements existants et futurs le reçoivent. **Contrôler** : une politique évalue en continu et signale les abonnements qui s’écartent. **Versionner** : le réglage s’écrit en code (Bicep, ARM, Terraform, PowerShell, API REST) et se revoit comme du code.',
    '## Activer Defender for Cloud sur un groupe de gestion',
    'La documentation décrit une approche par **Azure Policy**. Un utilisateur doté de Security Admin affecte la définition « Enable Microsoft Defender for Cloud on your subscription » à l’étendue du **groupe de gestion**, puis crée une **tâche de remédiation** pour que les abonnements existants non enregistrés soient intégrés. Avant cela, le fournisseur de ressources **Microsoft.Security** doit être enregistré pour le groupe de gestion. La définition fournie considère comme conformes les abonnements dont le niveau de tarification est « standard » **ou** « free » : elle vérifie donc l’enregistrement, pas l’activation des plans payants. Pour exiger des plans payants, on modifie la condition d’existence ou on affecte les définitions propres à chaque plan.',
    '## Un seul plan Servers par abonnement',
    'La définition « Configure Azure Defender for Servers to be enabled » active le plan Servers. Un abonnement ne peut porter **qu’un** plan Servers à la fois : plan 1 ou plan 2, pas les deux. Si votre organisation veut les deux, découpez les abonnements en **deux groupes de gestion** et affectez à chacun la politique du plan voulu. C’est une contrainte de conception qui se règle avant la migration des abonnements, pas après. Pour la référence de sécurité (MCSB), on l’affecte à la **racine** du groupe de gestion afin que chaque abonnement existant et futur en hérite.',
    '## Choisir l’outil',
    '| Outil | Quand | Attention |',
    '| --- | --- | --- |',
    '| Portail | Pilote, un abonnement | Non répétable |',
    '| Azure Policy | Parc existant et futur | Remédiation à déclencher |',
    '| PowerShell ou CLI | Scripts ponctuels | Écriture : tester en abonnement de test |',
    '| API REST | Intégration à un outil interne | Version d’API à vérifier |',
    '| Terraform ou Bicep | Infrastructure en code | Revue de code et état partagé |',
    '```bash',
    '# Exemple de la documentation : enregistrer le fournisseur de ressources au niveau du groupe de gestion.',
    '# ÉCRITURE (enregistrement). Prérequis : droits sur le groupe de gestion. Non exécuté dans ce parcours.',
    'az provider register --namespace Microsoft.Security --management-group-id <id-groupe-de-gestion>',
    '```',
    '## Erreurs fréquentes',
    '- Croire que la politique d’activation de base active aussi les plans payants.',
    '- Affecter la politique à un abonnement au lieu du groupe de gestion et oublier les nouveaux abonnements.',
    '- Vouloir Servers P1 et P2 dans le même abonnement.',
  ),
  demo: { title: 'Concevoir les groupes de gestion', body: md(
    'Besoin **fictif** : Servers P2 pour la production, Servers P1 pour le développement.',
    '```text',
    'Racine : MCSB affecté ici (héritage pour tout)',
    '  mg-prod : politique « Configure Azure Defender for Servers to be enabled » -> P2',
    '  mg-dev  : politique d’activation personnalisée -> P1',
    'Chaque nouvel abonnement placé dans mg-prod ou mg-dev hérite du bon plan.',
    '```',
    '**Lecture commentée.** Le découpage en deux groupes de gestion répond à la règle d’un seul plan Servers par abonnement.',
    '**Ce que la démo ne prouve pas.** Aucune politique n’a été affectée dans un locataire réel.') },
  revision: md('## Fiche : échelle', '- Hériter, contrôler, versionner.', '- Politique « Enable Microsoft Defender for Cloud on your subscription » + tâche de remédiation.', '- Enregistrer Microsoft.Security pour le groupe de gestion.', '- Un seul plan Servers par abonnement : deux groupes de gestion si besoin.', '- MCSB à la racine du groupe de gestion.'),
  links: ['onboard-mg', 'servers-scale', 'servers-enable', 'powershell-onboarding', 'set-pricing'], teaches: ['echelle', 'groupe-gestion', 'azure-policy', 'iac'],
});

const l2 = lesson(2, {
  title: 'Composants de collecte : Azure Monitor Agent, Defender for Endpoint, Arc et extensions de Defender CSPM', minutes: 50,
  summary: 'Savoir quel composant sert quel plan, qui le déploie et dans quelles conditions il cesse de fonctionner.',
  objectives: ['Associer chaque plan à ses composants de surveillance.', 'Expliquer le rôle des politiques Deploy If Not Exists de Defender for Cloud.', 'Énumérer les extensions de Defender CSPM et leurs prérequis.'],
  prerequisites: ['Leçon 1'],
  body: md(
    '## Une collecte de données seulement pour le calcul',
    'La collecte par composants ne concerne que les ressources de **calcul** : machines virtuelles, groupes de machines virtuelles, conteneurs IaaS et machines hors Azure. Pour le reste (stockage, bases PaaS, applications), la protection s’active par le plan et ne dépend d’aucun agent à installer. Defender for Cloud fonctionne même sans composants, mais avec une protection limitée : sans agent, la visibilité sur les mises à jour manquantes, l’état de protection des points de terminaison et la configuration du système d’exploitation disparaît.',
    '## Les composants par plan',
    'Defender for Servers s’appuie sur l’agent **Azure Arc** pour les machines hors Azure, sur **Defender for Endpoint** et sur l’évaluation des vulnérabilités. Defender for SQL Servers on Machines utilise Arc, **Azure Monitor Agent** (AMA) et la découverte automatique des serveurs SQL. Defender for Containers utilise Arc pour les clusters hors Azure, le **capteur Defender**, **Azure Policy pour Kubernetes** et les journaux d’audit Kubernetes. L’AMA remplace l’ancien agent Log Analytics (MMA), qui est déprécié. Le rôle **Owner** est exigé sur l’abonnement pour provisionner l’AMA, et la prise en charge couvre les clouds commerciaux.',
    '## Qui déploie : des politiques Deploy If Not Exists',
    'Pour éviter l’installation manuelle, Defender for Cloud affecte à l’abonnement la politique **Deploy If Not Exists** adaptée, qui installe l’extension sur les ressources **existantes et futures** du type visé. Cette mécanique explique deux phénomènes : une extension qui réapparaît après qu’on l’a supprimée, et une extension absente quand la politique n’a pas été évaluée ou remédiée. Pour limiter les extensions sur une machine Arc, l’agent peut passer en **mode surveillance** (`azcmagent config set config.mode monitor`), qui n’autorise que les extensions de surveillance et de sécurité. C’est un durcissement utile, à tester avant la production.',
    '## Les extensions de Defender CSPM',
    'Le plan Defender CSPM se règle composant par composant : **analyse sans agent des machines** (avec balises d’exclusion), **découverte sans agent de Kubernetes** (nécessaire aux chemins d’attaque Kubernetes), **évaluation de vulnérabilités sans agent des conteneurs** (images de registres), **découverte des données sensibles** (échantillonnage intelligent, intégration Purview), **gestion des droits d’infrastructure du cloud** (installation et collecte jusqu’à 24 heures), **protection des charges sans serveur** (Web Apps, Functions, Lambda) et **conteneurs sans serveur** (Container Apps, Container Instances, ECS Fargate, avec l’accès au registre). Activer le plan sans ses composants donne une couverture partielle : c’est l’état 2 ou 3 de la chaîne du module 1.',
    '```kusto',
    '// Requête indicative, non tirée telle quelle de la documentation : valider dans votre environnement.',
    '// Azure Resource Graph, lecture seule. Prérequis : Reader sur les abonnements visés.',
    'resources',
    '| where type =~ "microsoft.compute/virtualmachines/extensions"',
    '| where name in~ ("MDE.Windows", "MDE.Linux")',
    '| extend vmId = tolower(tostring(split(id, "/extensions/")[0]))',
    '| project vmId, extension = name, etat = tostring(properties.provisioningState)',
    '| summarize machines = dcount(vmId) by etat',
    '```',
    '## Erreurs fréquentes',
    '- Croire que le stockage ou une base PaaS exige un agent.',
    '- Supprimer une extension à la main alors que la politique la redéploie.',
    '- Activer Defender CSPM sans ouvrir ses composants.',
  ),
  demo: { title: 'Lire l’état d’un parc fictif', body: md(
    'Résultat **fictif** de la requête :',
    '```text',
    'etat       machines',
    'Succeeded       187',
    'Failed           19',
    'Creating          6',
    '```',
    '**Lecture commentée.** Sur 212 machines équipées de l’extension, 187 sont saines, 19 en échec et 6 en cours. Les 25 non saines sont éligibles mais non couvertes. Reste à chercher les machines sans extension du tout, absentes de ce résultat.',
    '**Ce que la démo ne prouve pas.** Les nombres sont inventés et la requête n’a pas été exécutée.') },
  revision: md('## Fiche : composants', '- Collecte par composants pour le calcul seulement.', '- Servers : Arc, Defender for Endpoint, vulnérabilités. SQL sur machines : AMA. Containers : capteur et Azure Policy pour Kubernetes.', '- Politiques Deploy If Not Exists redéploient les extensions.', '- Mode surveillance de l’agent Arc pour restreindre les extensions.', '- Defender CSPM : composants à ouvrir un par un.'),
  links: ['monitoring-components', 'ama', 'arc-monitor-mode', 'cspm-components', 'mde-integration'], teaches: ['composants', 'ama', 'mde', 'arc', 'extensions-cspm'],
});

const l3 = lesson(3, {
  title: 'Auditer la couverture : classeur, connectivité, inventaire et requêtes', minutes: 55,
  summary: 'Produire un rapport de couverture exact en croisant le classeur de couverture, l’état des connecteurs, l’inventaire et des requêtes.',
  objectives: ['Lire les quatre onglets du classeur de couverture.', 'Contrôler la santé d’un connecteur AWS ou GCP.', 'Écrire un rapport qui distingue plan, éligibilité, couverture et preuve.'],
  prerequisites: ['Leçons 1 et 2, et les cinq états du module 1'],
  body: md(
    '## Le classeur de couverture',
    'Le **classeur de couverture** (Coverage workbook) montre quels plans sont actifs dans quelles parties de l’environnement. Il se choisit par abonnement ou pour tous, et il propose quatre onglets. **Additional information** donne les notes de publication et l’explication de chaque interrupteur. **Relative coverage** affiche le pourcentage d’abonnements ou de connecteurs qui ont un plan donné. **Absolute coverage** montre le statut de chaque plan par abonnement. **Detailed coverage** liste les réglages et extensions à activer pour obtenir la pleine valeur d’un plan. On filtre par Azure, AWS ou GCP. Attention à la portée de sa preuve : le classeur indique des **réglages activés**, pas qu’une fonction opère. Il couvre donc les états 1 et partiellement 3 de la chaîne.',
    '## Santé des connecteurs',
    'Pour AWS et GCP, ouvrez Environment settings et lisez la colonne **Connectivity status**. Un statut autre que sain se détaille : la page de l’environnement liste les problèmes de configuration ou de permission, avec une description et des mesures, parfois un script de correction. Après l’activation d’un plan, le changement d’un réglage de plan ou la sortie d’un nouveau script, il faut régénérer et ré-exécuter le script (GCP) ou le modèle (AWS). Pour les machines hors Azure, vérifiez aussi l’état de l’agent Arc (`azcmagent show`) et celui de l’extension Defender for Endpoint.',
    '## Inventaire, stockage et requêtes',
    'L’**inventaire des actifs** montre les ressources et leurs recommandations. Dans le portail Defender, il affiche **toutes** les ressources découvertes, y compris celles sans problème : le total diffère donc de celui du portail Azure, ce qui est normal. Pour le stockage, **Storage Center** indique quels comptes sont protégés, partiellement protégés ou non protégés, et où le scan de logiciels malveillants, la surveillance d’activité et la découverte de données sensibles sont actifs. Pour les plans, interrogez les paramètres par script de lecture seule : `Get-AzSecurityPricing` (module Az.Security) ou `az security pricing list`.',
    '## Le rapport de couverture',
    'Un bon rapport sépare quatre niveaux et nomme des preuves : **plan** (abonnements avec le plan activé sur le total, source classeur ou script), **éligibilité** (ressources prises en charge, source inventaire et matrice), **couverture** (ressources dotées de composants sains, source requête et connecteur) et **fonction** (test inoffensif, par échantillon). Il liste aussi les exceptions et leur propriétaire. Un rapport sans ces quatre niveaux est un rapport de configuration, pas de couverture. Un résultat de requête vide ne prouve jamais l’absence de problème : il peut venir d’un filtre, d’un droit de lecture manquant ou d’une table non alimentée.',
    '```powershell',
    '# Lecture seule (module Az.Security). Prérequis : Reader sur les abonnements. Non exécuté dans ce parcours.',
    'Get-AzSecurityPricing | Select-Object Name, PricingTier, SubPlan, FreeTrialRemainingTime | Sort-Object Name',
    '```',
    '## Erreurs fréquentes',
    '- Présenter le classeur comme preuve de fonctionnement.',
    '- Comparer le total d’actifs des deux portails sans expliquer la différence de découverte.',
    '- Conclure à l’absence de problème sur un résultat de requête vide.',
  ),
  demo: { title: 'Rédiger le tableau de couverture', body: md(
    'Données **fictives** :',
    '```text',
    'Niveau       Mesure                                  Source                 Preuve',
    'Plan         Servers P2 sur 14 abonnements sur 16    Classeur, absolu       Capture datée',
    'Éligibilité  212 serveurs                            Inventaire             Export daté',
    'Couverture   187 sains, 25 en échec                  Requête Resource Graph Requête jointe',
    'Fonction     alerte de test reçue sur srv-ca-017      Alertes                Identifiant d’alerte',
    '```',
    '**Lecture commentée.** Chaque ligne nomme sa source et sa preuve. Les 25 serveurs en échec forment le plan d’action.',
    '**Ce que la démo ne prouve pas.** Données inventées.') },
  revision: md('## Fiche : audit', '- Classeur : quatre onglets, preuve de réglage seulement.', '- Connectivity status et page d’environnement pour AWS et GCP.', '- Inventaire du portail Defender plus large que celui du portail Azure.', '- Quatre niveaux : plan, éligibilité, couverture, fonction.', '- Un résultat vide ne prouve rien.'),
  links: ['workbooks', 'troubleshoot-connectors', 'aws', 'gcp', 'storage-portal'], teaches: ['audit-couverture', 'classeur', 'connectivite', 'requetes'],
});

const exercises = [
  MT('d04-g1', 'guided', 'comprendre', c1, 'Idée et outil', 'Associez chaque idée du déploiement à l’échelle à son mécanisme.', [['Hériter', 'Réglage au groupe de gestion'], ['Contrôler', 'Évaluation Azure Policy'], ['Versionner', 'Infrastructure en code']], 'Les trois idées se traduisent en groupe de gestion, politique et code.'),
  WF('d04-a1', 'autonomous', 'fonctionner', c1, 'Activer sur un groupe de gestion', 'Ordonnez l’activation de Defender for Cloud sur un groupe de gestion.', ['Enregistrer le fournisseur Microsoft.Security', 'Affecter la définition au groupe de gestion', 'Créer une tâche de remédiation', 'Contrôler les abonnements intégrés', 'Documenter les exceptions'], [['Affecter chaque abonnement à la main', 'Ne passe pas à l’échelle.'], ['Supposer que les plans payants sont activés', 'La définition vérifie l’enregistrement.']], 'On enregistre, on affecte, on remédie, on contrôle et on documente.'),
  Q('d04-q1a', 'quiz', 'fonctionner', c1, 'Deux plans Servers', 'Comment avoir Servers P1 et P2 dans une même organisation ?', ['Deux groupes de gestion, chacun avec sa politique.', 'Un seul plan Servers par abonnement.'], [['Les deux sur le même abonnement.', 'Impossible.'], ['Aucun moyen.', 'Faux.'], ['En doublant les locataires.', 'Disproportionné.']], 'On sépare les abonnements en deux groupes de gestion.'),
  Q('d04-q1b', 'quiz', 'verifier', c1, 'Définition d’activation', 'Que vérifie la définition fournie « Enable Microsoft Defender for Cloud on your subscription » ?', ['L’enregistrement : standard ou free sont conformes.', 'Elle n’active pas les plans payants.'], [['Que tous les plans payants sont actifs.', 'Faux.'], ['Que les alertes sont lues.', 'Faux.'], ['Que le coût est bas.', 'Faux.']], 'La définition fournie vérifie l’enregistrement des abonnements.'),
  Q('d04-q1c', 'quiz', 'maintenir', c1, 'Où affecter la référence', 'Où affecter le MCSB pour qu’il s’applique aux abonnements futurs ?', ['À la racine du groupe de gestion.', 'Héritage.'], [['Sur un abonnement.', 'Pas d’héritage futur.'], ['Sur une ressource.', 'Trop étroit.'], ['Nulle part.', 'Faux.']], 'La racine du groupe de gestion propage l’affectation.'),

  MT('d04-g2', 'guided', 'comprendre', c2, 'Plan et composant', 'Associez chaque plan à un composant de collecte.', [['Defender for SQL Servers on Machines', 'Azure Monitor Agent'], ['Defender for Containers', 'Capteur Defender et Azure Policy pour Kubernetes'], ['Defender for Servers sur machine AWS', 'Agent Azure Arc']], 'Chaque plan s’appuie sur ses composants propres.'),
  PL('d04-a2', 'autonomous', 'comprendre', c2, 'Ranger les composants', 'Placez chaque composant dans la zone du plan qui l’utilise.', [['Defender for Servers'], ['Defender for SQL Servers on Machines'], ['Defender for Containers']], [['Defender for Endpoint', 0], ['Évaluation des vulnérabilités', 0], ['Azure Monitor Agent', 1], ['Découverte automatique des serveurs SQL', 1], ['Capteur Defender', 2], ['Journaux d’audit Kubernetes', 2]], 'Chaque composant se rattache au plan qui l’exige.'),
  Q('d04-q2a', 'quiz', 'securiser', c2, 'Extension supprimée', 'Pourquoi une extension supprimée à la main réapparaît-elle ?', ['Une politique Deploy If Not Exists la redéploie.', 'Elle vise les ressources existantes et futures.'], [['Un bogue du navigateur.', 'Non.'], ['Un virus.', 'Non.'], ['Un doublon d’abonnement.', 'Non.']], 'La politique assure le redéploiement.'),
  Q('d04-q2b', 'quiz', 'fonctionner', c2, 'Ancien agent', 'Quel agent a remplacé l’agent Log Analytics pour Defender for SQL on machines ?', ['Azure Monitor Agent.', 'MMA est déprécié.'], [['Agent Arc seul.', 'Complémentaire, pas remplaçant.'], ['Agent du navigateur.', 'Absurde.'], ['Aucun.', 'Faux.']], 'L’AMA remplace le MMA.'),
  Q('d04-q2c', 'quiz', 'securiser', c2, 'Mode surveillance', 'Que permet le mode surveillance de l’agent Arc ?', ['Seulement les extensions de surveillance et de sécurité.', 'Durcissement.'], [['Toutes les extensions.', 'C’est le mode complet.'], ['Aucune extension.', 'Faux.'], ['L’exécution de scripts arbitraires.', 'Bloquée.']], 'Il restreint les extensions autorisées.'),

  MT('d04-g3', 'guided', 'verifier', c3, 'Onglet et usage', 'Associez chaque onglet du classeur de couverture à son rôle.', [['Relative coverage', 'Pourcentage de couverture'], ['Absolute coverage', 'Statut par abonnement'], ['Detailed coverage', 'Réglages à activer']], 'Les onglets donnent un pourcentage, un statut par abonnement et le détail des réglages.'),
  OR('d04-a3', 'autonomous', 'verifier', c3, 'Rapport à quatre niveaux', 'Ordonnez les niveaux d’un rapport de couverture.', ['Plan', 'Éligibilité', 'Couverture', 'Fonction'], 'On part du plan et on termine par la fonction prouvée.'),
  Q('d04-q3a', 'quiz', 'verifier', c3, 'Preuve du classeur', 'Que prouve le classeur de couverture ?', ['Des réglages activés, pas le fonctionnement.', 'États 1 et partiellement 3.'], [['Que la détection marche.', 'Non.'], ['Que tout est protégé.', 'Non.'], ['Le coût exact.', 'Non.']], 'Il montre les réglages, pas la fonction.'),
  Q('d04-q3b', 'quiz', 'verifier', c3, 'Requête vide', 'Une requête de couverture renvoie zéro ligne. Que concluez-vous ?', ['Rien : vérifier filtre, droits et alimentation avant de conclure.', 'Un vide n’est pas une preuve.'], [['Tout est parfait.', 'Faux.'], ['Le plan est cassé.', 'Hasard.'], ['Il faut supprimer la requête.', 'Non.']], 'Un résultat vide ne prouve jamais l’absence de problème.'),
  Q('d04-q3c', 'quiz', 'comprendre', c3, 'Totaux d’actifs', 'Pourquoi le portail Defender affiche-t-il plus d’actifs que le portail Azure ?', ['Il inventorie toutes les ressources découvertes.', 'Même sans problème.'], [['Il compte deux fois.', 'Non.'], ['Il invente des ressources.', 'Non.'], ['Par erreur.', 'Non.']], 'La découverte du portail Defender est plus large.'),

  Q('d04-ev1', 'eval', 'comprendre', c1, 'Héritage', 'Quel avantage donne l’affectation au groupe de gestion ?', ['Les abonnements existants et futurs en héritent.', 'Évite les oublis.'], [['Elle supprime les coûts.', 'Faux.'], ['Elle remplace les rôles.', 'Faux.'], ['Elle désactive les alertes.', 'Faux.']], 'L’héritage couvre les abonnements futurs.'),
  M('d04-ev2', 'eval', 'fonctionner', c2, 'Extensions de Defender CSPM', 'Cochez les composants de Defender CSPM.', [['Analyse sans agent des machines.', 'Oui.'], ['Découverte sans agent de Kubernetes.', 'Oui.'], ['Découverte des données sensibles.', 'Oui.']], [['Agent de pare-feu local.', 'Non.'], ['Scanner de réseau physique.', 'Non.']], 'Les composants sont sans agent et propres au cloud.'),
  FX('d04-ev3', 'eval', 'verifier', c3, 'Corriger un rapport de couverture', 'Corrigez le rapport fictif pour séparer les niveaux.', { plan: 'ok', eligibles: 212, couverts: 'tous', fonctionTestee: false }, { plan: '14 sur 16', eligibles: 212, couverts: 187, fonctionTestee: true }, [['plan', '14 sur 16', 'Donner le nombre exact d’abonnements.', 'verifier'], ['couverts', 187, 'Donner le nombre de ressources couvertes.', 'verifier'], ['fonctionTestee', true, 'Joindre un test inoffensif.', 'verifier']], 'Un rapport exact donne des nombres et une preuve de fonction.'),
  OR('d04-ev4', 'eval', 'fonctionner', c1, 'Ordre de déploiement', 'Ordonnez un déploiement à l’échelle prudent.', ['Concevoir les groupes de gestion', 'Tester sur un abonnement pilote', 'Affecter la politique à un groupe', 'Remédier les abonnements existants', 'Vérifier la couverture'], 'On conçoit, on pilote, on affecte, on remédie et on vérifie.'),
  WF('d04-ev5', 'eval', 'verifier', c3, 'Audit d’un connecteur', 'Ordonnez l’audit d’un connecteur partiellement connecté.', ['Lire Connectivity status', 'Ouvrir la page de l’environnement', 'Lire la description du problème', 'Appliquer la correction proposée', 'Contrôler l’état de nouveau'], [['Supprimer le connecteur d’emblée', 'Perte de configuration.']], 'On lit, on détaille, on corrige, on revérifie.'),
  CF('d04-ev6', 'eval', 'securiser', c2, 'Restreindre les extensions Arc', 'Paramétrez le durcissement d’une machine Arc.', [['Mode surveillance de l’agent Arc', 'on', 'Restreint aux extensions de surveillance et de sécurité.'], ['Autoriser toute extension', 'off', 'Surface d’attaque inutile.'], ['Tester en préproduction', 'on', 'Évite de casser la collecte.']], 'Le mode surveillance se teste avant la production.'),
  SH('d04-ev7', 'eval', 'verifier', c3, 'Couverture en nombres', 'Il y a 212 serveurs éligibles dont 187 couverts. Combien ne sont pas couverts ? (nombre)', ['25'], 'Deux cent douze moins cent quatre-vingt-sept donnent vingt-cinq.', 25),
  Q('d04-ev8', 'eval', 'maintenir', c1, 'Conformité de la politique', 'Pourquoi modifier la condition d’existence de la politique d’activation ?', ['Pour exiger que les plans soient activés et pas seulement enregistrés.', 'La version fournie accepte free et standard.'], [['Pour supprimer l’héritage.', 'Faux.'], ['Pour cacher des abonnements.', 'Faux.'], ['Pour changer la région.', 'Faux.']], 'On adapte la définition à l’exigence réelle.'),

  IN('d04-cs1', 'case', 'verifier', c3, 'Cas : rapport de Nordlys', 'Rapport fictif : repérez les affirmations insuffisantes.', 'text', [['« Le classeur montre 100 % : tout fonctionne. »', 'Le classeur prouve des réglages, ajouter un test de fonction', 'Garder tel quel'], ['« Aucun problème : la requête est vide. »', 'Vérifier filtre, droits et alimentation avant de conclure', 'Garder tel quel'], ['« 400 actifs ici, 380 dans l’autre portail : erreur. »', 'Expliquer la découverte plus large du portail Defender', 'Garder tel quel']], 'Chaque conclusion est reliée à sa preuve.'),
  MT('d04-cs2', 'case', 'fonctionner', c1, 'Cas : architecture de groupes', 'Associez chaque besoin à la solution.', [['Servers P1 en dev et P2 en prod', 'Deux groupes de gestion'], ['MCSB sur tous les abonnements futurs', 'Affectation à la racine'], ['Intégrer 200 abonnements existants', 'Tâche de remédiation de la politique']], 'Chaque besoin a son mécanisme à l’échelle.'),
  WF('d04-cs3', 'case', 'securiser', c2, 'Cas : extension en échec', 'Ordonnez le traitement d’une extension Defender for Endpoint en échec.', ['Lire l’état de l’extension', 'Lire les journaux de l’extension', 'Vérifier l’agent Arc et le réseau sortant', 'Corriger la cause', 'Contrôler la présence dans le portail Defender'], [['Réinstaller sans lire les journaux', 'Sans diagnostic.']], 'On lit l’état et les journaux, on vérifie l’agent, on corrige et on contrôle.'),
  OP('d04-cs-open', 'case', 'verifier', c3, 'Cas : plan de déploiement et d’audit chez Nordlys', 'Rédigez le plan de déploiement et d’audit de couverture d’un parc fictif de 40 abonnements.', 'Une page : groupes de gestion, politiques, composants, calendrier pilote, rapport de couverture à quatre niveaux, exceptions et propriétaires.', [['Les groupes de gestion respectent un seul plan Servers par abonnement.', 'fonctionner'], ['Le rapport distingue plan, éligibilité, couverture et fonction.', 'verifier'], ['Les exceptions ont un propriétaire.', 'maintenir'], ['Les écritures sont testées en pilote.', 'securiser']], 'Le plan relie architecture, composants et preuves.'),

  Q('d04-rm1', 'remediation', 'comprendre', c1, 'Remédiation : héritage', 'Où poser un réglage pour qu’il s’applique aux futurs abonnements ?', ['Au groupe de gestion.', 'Héritage.'], [['À une ressource.', 'Trop étroit.'], ['À une machine.', 'Trop étroit.'], ['Dans un courriel.', 'Absurde.']], 'Au groupe de gestion.'),
  Q('d04-rm2', 'remediation', 'comprendre', c2, 'Remédiation : calcul seulement', 'Quelles ressources exigent des composants de collecte ?', ['Les ressources de calcul.', 'VM, VMSS, conteneurs IaaS, machines hors Azure.'], [['Les comptes de stockage.', 'Non.'], ['Les bases PaaS.', 'Non.'], ['Les sites App Service.', 'Non.']], 'La collecte par composants concerne le calcul.'),
  Q('d04-rm3', 'remediation', 'verifier', c3, 'Remédiation : classeur', 'Le classeur de couverture prouve-t-il qu’une fonction opère ?', ['Non, il montre des réglages.', 'Il faut un test inoffensif.'], [['Oui.', 'Faux.'], ['Seulement pour AWS.', 'Faux.'], ['Seulement pour GCP.', 'Faux.']], 'Il ne prouve pas le fonctionnement.'),
];

const competencies = comps([
  ['Déployer à l’échelle', 'Groupes de gestion, politiques, outils.', ['J’active sur un groupe de gestion avec remédiation.', 'Je respecte un seul plan Servers par abonnement.', 'Je choisis l’outil adapté.']],
  ['Maîtriser les composants', 'AMA, Defender for Endpoint, Arc, extensions CSPM.', ['J’associe composants et plans.', 'J’explique les politiques Deploy If Not Exists.', 'Je configure les extensions de Defender CSPM.']],
  ['Auditer la couverture', 'Classeur, connectivité, inventaire, requêtes.', ['Je lis les quatre onglets du classeur.', 'Je contrôle la santé d’un connecteur.', 'Je rédige un rapport à quatre niveaux.']],
]);

const projects = [
  P(1, 'débutant', 'Plan de groupes de gestion', 'Concevoir les groupes de gestion d’une organisation fictive de 30 abonnements.', 'Schéma racine, groupes, politiques.', ['Lister les abonnements.', 'Les grouper par plan Servers.', 'Placer le MCSB à la racine.'], ['Aucun abonnement n’a deux plans Servers.'], ['Oublier les nouveaux abonnements.'], ['Ajouter un groupe pour les laboratoires.']),
  P(2, 'intermédiaire', 'Rapport de couverture à quatre niveaux', 'Produire un rapport de couverture pour un parc fictif avec sources et preuves.', 'Tableau à quatre niveaux, source, preuve.', ['Compter les abonnements avec le plan.', 'Compter éligibles et couverts.', 'Définir le test de fonction.', 'Lister les exceptions.'], ['Chaque niveau a une source et une preuve.'], ['Conclure sur un résultat vide.'], ['Ajouter une tendance mensuelle.'],
    { connected: { accounts: 'Un abonnement Azure de test avec Defender for Cloud (CSPM de base).', permissions: 'Reader pour lire ; aucune écriture.', costs: 'Aucun frais attendu : lecture seule, ne pas activer de plan payant.', secrets: 'Aucun secret.', cleanup: 'Aucune ressource créée.', limits: 'Les commandes Get-AzSecurityPricing et az security pricing list sont en lecture seule. Statut : non réalisée dans un laboratoire Microsoft réel.' } }),
  P(3, 'avancé', 'Déploiement à l’échelle en code', 'Rédiger la définition en code (Bicep ou Terraform) d’une activation à l’échelle avec revue et retour arrière.', 'Dépôt de code, revue, pipeline, mesure de couverture.', ['Choisir l’outil.', 'Écrire les ressources de tarification.', 'Prévoir la revue et la validation en pilote.', 'Définir le retour arrière.'], ['Le code est relu, daté et testé en pilote.'], ['Pseudocode présenté comme du code exécutable.'], ['Ajouter la mesure de couverture dans le pipeline.']),
];

export const d04 = assemble({ id: 'd04', level: 1, n: 4, title: 'Déploiement et couverture',
  summary: 'Activation à l’échelle par groupes de gestion et Azure Policy, composants de collecte (Azure Monitor Agent, Defender for Endpoint, Arc, extensions de Defender CSPM) et audit de couverture à quatre niveaux.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Déployer et auditer Defender for Cloud chez Nordlys Technologies',
  caseScenario: 'Vous concevez les groupes de gestion, traitez une extension en échec et corrigez un rapport de couverture. Données simulées.', caseMinutes: 50 });
