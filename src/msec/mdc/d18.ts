// Module 18 : Defender for Cloud sur GCP (niveau 4).
import { dsl, md } from './dsl.ts';

const { lesson, Q, M, MT, OR, CF, IN, WF, FX, SH, OP, comps, P, assemble } = dsl('d18');
const c1 = { comp: 'd18-c1', lesson: 'd18-l1', tags: ['connecteur-gcp', 'wif', 'script-gcloud', 'domain-restricted'] };
const c2 = { comp: 'd18-c2', lesson: 'd18-l2', tags: ['plans-gcp', 'arc-gcp', 'os-config', 'ecarts-azure'] };
const c3 = { comp: 'd18-c3', lesson: 'd18-l3', tags: ['sante-gcp', 'depannage-gcp', 'mise-a-jour', 'journaux-gcp'] };

const l1 = lesson(1, {
  title: 'Le connecteur GCP : fédération d’identité de charge de travail et script gcloud', minutes: 50,
  summary: 'Connecter un projet ou une organisation GCP, comprendre les ressources créées par le script et lever la politique de partage restreint par domaine.',
  objectives: ['Distinguer projet unique et organisation.', 'Lister les ressources créées par le script gcloud.', 'Résoudre un échec dû au partage restreint par domaine.'],
  prerequisites: ['Module 17 : AWS (comparaison)', 'Module 3 : permissions'],
  body: md(
    '## Même idée qu’AWS, autre mécanique',
    'Le connecteur GCP découvre les ressources, évalue la posture et remonte recommandations et alertes pour un **projet** ou une **organisation** GCP. Les prérequis ressemblent à ceux d’AWS : un abonnement Azure avec Defender for Cloud activé, l’accès à un projet ou une organisation GCP et le rôle **Contributor** sur l’abonnement Azure. Si vous activez le CIEM avec Defender CSPM, la personne qui effectue l’intégration doit aussi avoir **Security Admin** et une autorisation de création d’inscription d’application (Application Administrator ou Cloud Application Administrator dans Entra) pendant l’intégration seulement.',
    '## Authentification fédérée',
    'Defender for Cloud accède aux API GCP par **fédération d’identité de charge de travail** et **emprunt d’identité de compte de service**, sans identifiants durables : des jetons de courte durée sont échangés entre Microsoft Entra ID et le service de jetons de sécurité (STS) de Google. Le script `gcloud` généré selon la portée et les plans choisis crée un **pool d’identités de charge de travail**, un **fournisseur d’identité par plan**, des **comptes de service** et des **liaisons de politique au niveau du projet** (le compte de service n’a accès qu’au projet visé). Exécutez-le dans Cloud Shell ou l’environnement GCP concerné.',
    '## APIs à activer',
    'Cinq API doivent être activées sur le projet où le script s’exécute (sur le projet de gestion pour une organisation) : `iam`, `sts`, `cloudresourcemanager`, `iamcredentials` et `compute`. Le script peut les activer pendant l’exécution si elles ne le sont pas, ce qui suppose les droits correspondants.',
    '## Projet ou organisation',
    'Le choix de la portée détermine les champs demandés : pour une **organisation**, l’identifiant d’organisation et, au besoin, des numéros de projet et des identifiants de dossier à **exclure**; pour un **projet unique**, le numéro et l’identifiant du projet. Comme pour AWS, choisissez l’**intervalle d’analyse** (4, 6, 12 ou 24 heures) en sachant que certains collecteurs ont un intervalle fixe de une heure (instances de calcul, clusters de conteneurs, dépôts et images d’Artifact Registry notamment). Le niveau d’accès est aussi **par défaut** (fonctions actuelles et futures) ou à **privilège minimal**.',
    '## Partage restreint par domaine',
    'Depuis mai 2024, GCP applique par défaut la politique **Domain Restricted Sharing** aux organisations créées après cette date : elle empêche d’attribuer des droits IAM à des comptes de service externes à votre organisation, ce qui peut faire échouer le script. La correction documentée : dans **IAM et administration**, **Politiques d’organisation**, **Domain Restricted Sharing**, **Gérer la politique**, ajouter le principal de Defender for Cloud (`principalSet` d’organisation indiqué dans la documentation) ou l’identifiant client de Defender, puis enregistrer et attendre quelques minutes avant de relancer le script. Cette modification touche une politique d’organisation : faites-la approuver et consignez-la.',
    '```text',
    'Journal d’intégration GCP (exemple fictif)',
    'Portée : organisation; exclusions : dossier sandbox; intervalle : 12 h; accès : privilège minimal',
    'Échec 1 : Domain Restricted Sharing -> principal Defender ajouté (approuvé par l’équipe GCP)',
    'Succès : script relancé; statut de connectivité vérifié',
    '```',
    '## Erreurs fréquentes',
    '- Lancer le script sans les cinq API activées.',
    '- Modifier une politique d’organisation sans approbation.',
    '- Confondre le projet de gestion et le projet visé pour une organisation.',
  ),
  demo: { title: 'Le script échoue', body: md(
    'Constat **fictif** : le script gcloud échoue à l’attribution d’un rôle à un compte de service externe.',
    '```text',
    'Cause probable : Domain Restricted Sharing actif (organisation créée après mai 2024)',
    'Action : autoriser le principal de Defender dans la politique, attendre, relancer',
    '```',
    '**Lecture commentée.** L’échec vient d’une politique de l’organisation, pas d’un défaut du script.',
    '**Ce que la démo ne prouve pas.** Aucun environnement réel.') },
  revision: md('## Fiche : connecteur GCP', '- Fédération d’identité de charge de travail, jetons courts.', '- Script gcloud : pool, fournisseurs, comptes de service, liaisons.', '- Cinq API à activer.', '- Collecteurs à intervalle fixe d’une heure.', '- Domain Restricted Sharing : autoriser le principal de Defender.'),
  links: ['gcp', 'gcp-auth', 'gcp-sharing', 'permissions', 'multicloud-matrix'], teaches: ['connecteur-gcp', 'wif', 'script-gcloud', 'domain-restricted'],
});

const l2 = lesson(2, {
  title: 'Plans sur GCP : ce qui existe, ce qui manque et la mécanique d’Arc', minutes: 50,
  summary: 'Lire la matrice de plans GCP sans transposer Azure, et comprendre l’autoprovisionnement d’Arc par OS Config avec ses coûts.',
  objectives: ['Énoncer les plans pris en charge sur GCP.', 'Expliquer l’autoprovisionnement d’Arc et le coût de l’agent OS Config.', 'Éviter de promettre sur GCP une fonction propre à Azure.'],
  prerequisites: ['Leçon 1', 'Modules 10, 11 et 13'],
  body: md(
    '## La matrice, pas l’intuition',
    'Sur GCP, la matrice multicloud indique en disponibilité générale : **Defender for Servers (P1 et P2)**, **Defender for Containers**, **Defender CSPM**, **Defender for SQL Servers on Machines** et **Defender for DevOps** (qui protège les plateformes de CI/CD plutôt qu’un cloud). Elle indique **non pris en charge** sur GCP : bases relationnelles libres (disponibles en préversion sur AWS), Azure SQL Databases, Azure Cosmos DB, Storage, Key Vault, Resource Manager, DNS, App Service, API et services d’IA. La conclusion pratique : un client GCP n’aura pas la détection de menaces pour ses bases managées Cloud SQL via Defender for Databases, ni de protection équivalente à Defender for Storage pour Cloud Storage; il faut le dire avant de vendre un périmètre.',
    '## Servers : Arc par OS Config',
    'Pour la visibilité complète de Defender for Servers, les VM GCP doivent être connectées à **Azure Arc**. L’autoprovisionnement est activé par défaut et demande le rôle **Owner** sur l’abonnement; il s’appuie sur l’**agent OS Config** (VM Manager) de GCP pour appliquer des politiques aux VM. Attention aux coûts : une VM dont l’agent OS Config est **actif** engendre un coût côté GCP; Defender n’installe pas cet agent, mais il peut faire passer un agent déjà installé de inactif à **actif** en rétablissant sa communication avec le service, ce qui peut augmenter la facture GCP. Alternative : connecter manuellement les VM à Arc via la recommandation « GCP VM instances should be connected to Azure Arc ». Des étiquettes (`Cloud`, `InstanceName`, `MDFCSecurityConnector`, `MachineId`, `ProjectId`, `ProjectNumber`) gèrent le processus et doivent rester en place; les serveurs Arc dont la VM n’existe plus sont retirés après sept jours. Activez ensuite les extensions Defender for Endpoint et d’évaluation des vulnérabilités.',
    '## Permissions créées dans GCP',
    'Chaque plan crée ses rôles et attribue des permissions sur le projet. Defender CSPM crée un rôle personnalisé de lecture et de découverte (organisations, projets, dossiers, plateformes d’IA comme Vertex AI) avec quelques permissions d’écriture limitées comme l’activation de services de découverte et la gestion des métadonnées de projet. Servers et Databases utilisent notamment `compute.viewer`, l’emprunt d’identité de compte de service et des rôles OS Config pour l’autoprovisionnement. Passez ces rôles en revue avec l’équipe GCP : ils figurent dans le script.',
    '## Ne pas transposer Azure',
    '| Besoin du client | Azure | GCP |',
    '| --- | --- | --- |',
    '| Détection des menaces sur le stockage objet | Defender for Storage | Non pris en charge |',
    '| Détection sur bases managées | Defender for Databases | SQL sur machines seulement |',
    '| Posture | Defender CSPM | Defender CSPM (GA) |',
    '| Machines | Servers | Servers, via Arc et OS Config |',
    '```text',
    'Écarts à écrire dans l’offre (exemple fictif)',
    'Stockage Cloud Storage : posture CSPM seulement; pas de détection de menaces dédiée',
    'Cloud SQL : posture CSPM; pas de Defender for Databases managé',
    '```',
    '## Erreurs fréquentes',
    '- Promettre Defender for Storage sur GCP.',
    '- Activer Arc partout sans mesurer l’effet OS Config sur la facture GCP.',
    '- Supprimer les étiquettes de gestion d’Arc.',
  ),
  demo: { title: 'Une promesse à corriger', body: md(
    'Offre **fictive** : « protection des menaces des buckets GCP comme Azure ».',
    '```text',
    'Vérification : matrice multicloud -> Defender for Storage non pris en charge sur GCP',
    'Correction : posture CSPM pour les buckets; détection de menaces à compenser autrement',
    '```',
    '**Lecture commentée.** La matrice tranche; l’offre est réécrite.',
    '**Ce que la démo ne prouve pas.** Aucune facture réelle.') },
  revision: md('## Fiche : plans GCP', '- GA : Servers, Containers, CSPM, SQL sur machines, DevOps.', '- Non pris en charge : Storage, bases managées, Key Vault, ARM, DNS, App Service, API, IA.', '- Arc par OS Config; coût GCP possible.', '- Étiquettes de gestion à conserver.', '- Sept jours avant retrait des Arc périmés.'),
  links: ['multicloud-matrix', 'gcp-plans', 'permissions', 'servers-enable', 'containers-troubleshoot'], teaches: ['plans-gcp', 'arc-gcp', 'os-config', 'ecarts-azure'],
});

const l3 = lesson(3, {
  title: 'Santé, mise à jour du script, journaux et retour arrière sur GCP', minutes: 45,
  summary: 'Maintenir le connecteur à jour, dépanner avec les ressources attendues, mesurer les appels d’API et retirer proprement.',
  objectives: ['Dire quand régénérer et relancer le script.', 'Vérifier les ressources GCP créées et les prérequis réseau.', 'Mesurer les appels d’API de Defender dans les journaux GCP.'],
  prerequisites: ['Leçons 1 et 2', 'Module 17 : dépannage AWS'],
  body: md(
    '## Quand relancer le script',
    'Il faut **régénérer le script gcloud et le relancer** après l’activation d’un nouveau plan, un changement de configuration (autoprovisionnement, portée), la publication par Microsoft d’une nouvelle version du script (nouvelles fonctions, correctifs, permissions) et lors de problèmes de santé liés à des permissions ou ressources manquantes. Contrairement à AWS, il n’y a pas de pile à mettre à jour : on relance le script pour la portée et les plans choisis.',
    '## Lire la santé',
    'Comme pour AWS : la colonne **Connectivity status** d’Environment settings, puis la page de détails avec description et correctif, parfois un script. Le classeur de couverture montre les plans actifs. Une vérification utile avec Resource Graph : la présence de la ressource de connecteur (`microsoft.security/securityconnectors`) et l’affectation de normes au connecteur.',
    '## Pistes propres à GCP',
    '- Le script Cloud Shell s’est-il terminé avec succès ?',
    '- Les ressources `WorkloadIdentityPoolId`, `WorkloadIdentityProviderId` et `ServiceAccountEmail` existent-elles dans le projet ?',
    '- La permission `compute.regions.list` est-elle accordée et l’utilisateur peut-il créer le principal de service côté Entra ?',
    '- Les points de terminaison Azure Arc figurent-ils sur la liste d’autorisation du pare-feu (le connecteur appelle ces points pour récupérer des fichiers d’intégration) ?',
    '- Les clusters GKE sont-ils connectés à Arc pour Kubernetes, et l’envoi des journaux d’audit Kubernetes est-il activé sur le connecteur ?',
    '## Mesurer les appels d’API',
    'À l’intégration, le service de découverte lance une analyse immédiate qui effectue de nombreux appels d’API vers GCP, puis analyse selon l’intervalle choisi. Pour mesurer, ouvrez **Logging**, **Log Explorer**, filtrez la période et recherchez les appels dont l’adresse du principal contient `microsoft-defender`; l’histogramme montre le volume dans le temps. Cela permet de relier une hausse de facture GCP à l’activité de Defender.',
    '## Ingestion de Cloud Logging pour le CIEM',
    'Pour que le CIEM évalue correctement les permissions GCP, activez l’ingestion de Cloud Logging par Pub/Sub (préversion), voir module 16. Depuis le 6 août 2026, la liste des actions inutilisées des identités surdimensionnées GCP n’est plus publiée par Defender : utilisez les informations de politique d’IAM de Google.',
    '## Retour arrière',
    'Mettre le plan à **Off** dans le connecteur, puis **régénérer et relancer le script** afin de retirer les permissions de l’autre côté; vérifier les ressources de soutien et la facturation. Si la suppression du connecteur échoue, chercher un verrou de ressource dans le journal d’activité Azure.',
    '```text',
    'Procédure de dépannage GCP (exemple fictif)',
    '1. Connectivity status -> détail',
    '2. Script à jour relancé ? ressources de fédération présentes ?',
    '3. Pare-feu : points Arc; Entra : création du principal',
    '4. Journaux GCP : appels de Defender (microsoft-defender)',
    '```',
    '## Erreurs fréquentes',
    '- Chercher une pile à mettre à jour au lieu de relancer le script.',
    '- Désactiver un plan sans retirer les permissions GCP.',
    '- Ne pas mesurer l’effet des appels d’API sur la facture GCP.',
  ),
  demo: { title: 'Une facture GCP qui monte', body: md(
    'Constat **fictif** : hausse des appels d’API après l’activation de trois plans.',
    '```text',
    'Mesure : Log Explorer, principal contenant "microsoft-defender", 7 jours',
    'Décision : intervalle 24 h; retirer un plan non utilisé; relancer le script',
    '```',
    '**Lecture commentée.** On mesure avant de réduire; on relance le script pour appliquer.',
    '**Ce que la démo ne prouve pas.** Chiffres inventés.') },
  revision: md('## Fiche : santé GCP', '- Relancer le script après plan, config ou nouvelle version.', '- Vérifier pool, fournisseur, compte de service.', '- Points Arc au pare-feu; compute.regions.list.', '- Log Explorer : principal microsoft-defender.', '- Retrait : Off puis relancer le script.'),
  links: ['troubleshoot-connectors', 'gcp', 'logging-ingestion', 'disable-plans', 'workbooks'], teaches: ['sante-gcp', 'depannage-gcp', 'mise-a-jour', 'journaux-gcp'],
});

const exercises = [
  MT('d18-g1', 'guided', 'comprendre', c1, 'Ressources GCP', 'Associez chaque ressource à son rôle.', [['Pool d\'identités de charge de travail', 'Cadre de la confiance avec Entra'], ['Fournisseur d\'identité (par plan)', 'Accepte les jetons Entra'], ['Compte de service', 'Identité empruntée avec droits limités'], ['Liaison de politique de projet', 'Limite l\'accès au projet visé']], 'Quatre ressources, un modèle de confiance.'),
  WF('d18-a1', 'autonomous', 'fonctionner', c1, 'Connecter un projet', 'Ordonnez la connexion d\'un projet GCP.', ['Confirmer le rôle Contributor sur l\'abonnement Azure', 'Créer le connecteur et choisir la portée', 'Choisir plans et niveau d\'accès', 'Générer le script gcloud', 'Activer les API requises et exécuter le script', 'Vérifier le statut de connectivité'], [['Exécuter le script sans activer les API', 'Échec attendu.']], 'Rôle, connecteur, plans, script, API, vérification.'),
  Q('d18-q1a', 'quiz', 'securiser', c1, 'Secret durable', 'Defender stocke-t-il des clés durables de compte de service ?', ['Non, fédération et jetons courts.', 'Emprunt d\'identité.'], [['Oui, un JSON de clé.', 'Faux.'], ['Oui, un mot de passe.', 'Faux.'], ['Oui, dans Git.', 'Faux.']], 'Non.'),
  Q('d18-q1b', 'quiz', 'fonctionner', c1, 'APIs', 'Combien d\'API doivent être activées avant le script ?', ['Cinq.', 'iam, sts, cloudresourcemanager, iamcredentials, compute.'], [['Une.', 'Faux.'], ['Dix.', 'Faux.'], ['Aucune.', 'Faux.']], 'Cinq.'),
  Q('d18-q1c', 'quiz', 'comprendre', c1, 'Politique de domaine', 'Quelle politique fait parfois échouer le script ?', ['Domain Restricted Sharing.', 'Organisations créées après mai 2024.'], [['VPC Service Controls.', 'Autre.'], ['Allowed Locations.', 'Autre.'], ['Aucune.', 'Faux.']], 'Domain Restricted Sharing.'),

  MT('d18-g2', 'guided', 'comprendre', c2, 'Plans sur GCP', 'Associez chaque plan à son statut sur GCP.', [['Defender for Servers', 'Disponibilité générale'], ['Defender for Storage', 'Non pris en charge'], ['Bases relationnelles libres', 'Non pris en charge'], ['Defender CSPM', 'Disponibilité générale']], 'Statuts de la matrice consultée.'),
  CF('d18-a2', 'autonomous', 'cout', c2, 'Arc et OS Config', 'Paramétrez la stratégie d\'Arc sur GCP.', [['Mesurer l\'effet OS Config sur la facture GCP', 'on', 'Agent actif facturé.'], ['Activer Arc partout sans inventaire', 'off', 'Coûts imprévus.'], ['Conserver les étiquettes de gestion', 'on', 'Nécessaires au processus.']], 'Mesurer, inventorier, conserver les étiquettes.'),
  Q('d18-q2a', 'quiz', 'cout', c2, 'Agent OS Config', 'Que peut faire Defender de l\'agent OS Config déjà installé ?', ['Le passer d\'inactif à actif.', 'Coût côté GCP.'], [['Le supprimer.', 'Faux.'], ['L\'installer partout.', 'Faux.'], ['Rien.', 'Faux.']], 'Inactif à actif.'),
  Q('d18-q2b', 'quiz', 'verifier', c2, 'Détection stockage', 'Defender for Storage est-il pris en charge pour Cloud Storage ?', ['Non.', 'Posture CSPM seulement.'], [['Oui.', 'Faux.'], ['Seulement en préversion.', 'Faux.'], ['Seulement Standard.', 'Faux.']], 'Non.'),
  Q('d18-q2c', 'quiz', 'maintenir', c2, 'Arc périmé', 'Quand sont retirés les serveurs Arc de VM supprimées ?', ['Après sept jours.', 'Nettoyage automatique.'], [['Immédiatement.', 'Faux.'], ['Jamais.', 'Faux.'], ['Après trente jours.', 'Faux.']], 'Sept jours.'),

  MT('d18-g3', 'guided', 'comprendre', c3, 'Vérifications', 'Associez chaque symptôme à sa vérification.', [['Échec d\'intégration', 'compute.regions.list et création du principal Entra'], ['Fichiers d\'intégration inaccessibles', 'Points Arc sur la liste du pare-feu'], ['Connecteur absent', 'Requête Resource Graph sur securityconnectors'], ['Facture GCP en hausse', 'Log Explorer, principal microsoft-defender']], 'Une vérification par symptôme.'),
  OR('d18-a3', 'autonomous', 'verifier', c3, 'Mise à jour', 'Ordonnez la mise à jour d\'un connecteur GCP.', ['Activer le nouveau plan dans le connecteur', 'Régénérer le script gcloud', 'Examiner les permissions ajoutées', 'Relancer le script', 'Vérifier le statut de connectivité'], 'Plan, script, revue, relance, vérification.'),
  Q('d18-q3a', 'quiz', 'fonctionner', c3, 'Équivalent de la pile', 'Que remplace la mise à jour de pile AWS sur GCP ?', ['La relance du script gcloud.', 'Pas de pile.'], [['Un redémarrage.', 'Faux.'], ['Rien.', 'Faux.'], ['Terraform seulement.', 'Faux.']], 'Relancer le script.'),
  Q('d18-q3b', 'quiz', 'securiser', c3, 'Retrait', 'Après avoir mis un plan à Off, que faut-il faire ?', ['Régénérer et relancer le script.', 'Retirer les permissions.'], [['Rien.', 'Faux.'], ['Supprimer le projet.', 'Excessif.'], ['Désactiver GCP.', 'Faux.']], 'Relancer le script.'),
  Q('d18-q3c', 'quiz', 'verifier', c3, 'Cloud Logging', 'Pourquoi ingérer Cloud Logging ?', ['Pour que le CIEM évalue les permissions GCP.', 'Préversion.'], [['Pour réduire les coûts.', 'Faux.'], ['Pour chiffrer.', 'Faux.'], ['Pour le stockage.', 'Faux.']], 'Pour le CIEM.'),

  Q('d18-ev1', 'eval', 'comprendre', c1, 'Portée', 'Que demande-t-on de plus pour une organisation ?', ['L\'identifiant d\'organisation et des exclusions.', 'Projets et dossiers à exclure.'], [['Rien.', 'Faux.'], ['Un mot de passe.', 'Faux.'], ['Une clé.', 'Faux.']], 'Identifiant et exclusions.'),
  M('d18-ev2', 'eval', 'securiser', c1, 'Ressources du script', 'Cochez ce que le script crée.', [['Un pool d\'identités de charge de travail.', 'Oui.'], ['Des fournisseurs d\'identité par plan.', 'Oui.'], ['Des comptes de service.', 'Oui.']], [['Un mot de passe administrateur.', 'Faux.']], 'Trois types de ressources.'),
  FX('d18-ev3', 'eval', 'verifier', c3, 'Fiche d\'incident', 'Complétez la fiche d\'incident fictive.', { symptome: '', cause: '', action: '', suivi: '' }, { symptome: 'script gcloud en échec', cause: 'Domain Restricted Sharing', action: 'autoriser le principal de Defender avec approbation', suivi: 'relancer le script et vérifier la connectivité' }, [['symptome', 'script gcloud en échec', 'Nommer le symptôme.', 'comprendre'], ['cause', 'Domain Restricted Sharing', 'Identifier la cause.', 'verifier'], ['action', 'autoriser le principal de Defender avec approbation', 'Désigner l\'action approuvée.', 'securiser'], ['suivi', 'relancer le script et vérifier la connectivité', 'Prévoir le suivi.', 'maintenir']], 'Symptôme, cause, action approuvée, suivi.'),
  OR('d18-ev4', 'eval', 'fonctionner', c2, 'Servers sur GCP', 'Ordonnez l\'activation de Servers sur GCP.', ['Activer le plan Servers', 'Autoriser l\'autoprovisionnement d\'Arc (Owner)', 'Vérifier l\'agent OS Config', 'Contrôler les étiquettes de gestion', 'Vérifier les extensions MDE et VA'], 'Plan, Arc, OS Config, étiquettes, extensions.'),
  CF('d18-ev5', 'eval', 'cout', c3, 'Coûts GCP', 'Paramétrez la stratégie de coûts.', [['Mesurer les appels d\'API de Defender', 'on', 'Relie hausse et cause.'], ['Choisir un intervalle de 24 heures si possible', 'on', 'Moins d\'appels.'], ['Ignorer la facture GCP', 'off', 'Coût caché.']], 'Mesurer et ajuster.'),
  WF('d18-ev6', 'eval', 'maintenir', c3, 'Retrait d\'un plan', 'Ordonnez le retrait d\'un plan.', ['Mettre le plan à Off', 'Régénérer le script', 'Relancer le script', 'Vérifier les ressources de soutien', 'Vérifier la facturation'], [['Supprimer le projet GCP', 'Excessif.']], 'Off, script, relance, ressources, facturation.'),
  SH('d18-ev7', 'eval', 'verifier', c1, 'Intervalle fixe', 'Quel est l\'intervalle fixe, en heures, de certains collecteurs ? (nombre)', ['1'], 'Une heure.', 1),
  Q('d18-ev8', 'eval', 'comprendre', c2, 'DevOps', 'Defender for DevOps protège-t-il un cloud précis ?', ['Non, les plateformes de CI/CD.', 'Pas spécifique à un cloud.'], [['Oui GCP seulement.', 'Faux.'], ['Oui AWS seulement.', 'Faux.'], ['Oui Azure seulement.', 'Faux.']], 'Plateformes CI/CD.'),

  IN('d18-cs1', 'case', 'verifier', c2, 'Cas : offre chez Nordlys', 'Promesses fictives : repérez celles à corriger.', 'text', [['« Les buckets GCP ont la même détection que le stockage Azure. »', 'Defender for Storage non pris en charge sur GCP', 'Garder tel quel'], ['« Les bases libres GCP sont couvertes. »', 'Non pris en charge selon la matrice', 'Garder tel quel']], 'Chaque promesse est corrigée.'),
  MT('d18-cs2', 'case', 'securiser', c3, 'Cas : trois pannes', 'Associez chaque panne à la cause.', [['Échec d\'attribution de rôle externe', 'Domain Restricted Sharing'], ['Fichiers d\'intégration inaccessibles', 'Points Arc bloqués au pare-feu'], ['Création du principal impossible', 'Autorisation Entra manquante']], 'Une cause par panne.'),
  WF('d18-cs3', 'case', 'maintenir', c2, 'Cas : facture OS Config', 'Ordonnez la réaction à une hausse liée à OS Config.', ['Constater la hausse', 'Identifier les VM à agent actif', 'Évaluer l\'option d\'Arc manuel', 'Décider', 'Documenter'], [['Désinstaller OS Config à l\'aveugle', 'Peut casser Arc.']], 'Constater, identifier, évaluer, décider, documenter.'),
  OP('d18-cs-open', 'case', 'verifier', c1, 'Cas : GCP chez Nordlys', 'Rédigez le plan de connexion d\'une organisation GCP fictive.', 'Une page : portée, accès, plans, écarts avec Azure, coûts, santé.', [['La portée et l\'accès sont justifiés.', 'securiser'], ['Les écarts avec Azure sont écrits.', 'verifier'], ['Les coûts GCP sont estimés.', 'cout'], ['Le dépannage et le retrait sont prévus.', 'maintenir']], 'Le plan relie portée, écarts, coûts et exploitation.'),

  Q('d18-rm1', 'remediation', 'comprendre', c1, 'Remédiation : authentification', 'Comment Defender s\'authentifie-t-il à GCP ?', ['Par fédération et jetons courts.', 'Sans secret durable.'], [['Par clé JSON.', 'Faux.'], ['Par mot de passe.', 'Faux.'], ['Par SMS.', 'Faux.']], 'Fédération.'),
  Q('d18-rm2', 'remediation', 'verifier', c2, 'Remédiation : stockage', 'Que faire pour la détection de menaces des buckets GCP ?', ['La compenser autrement et le dire.', 'Non prise en charge.'], [['L\'ignorer.', 'Faux.'], ['Activer Storage.', 'Impossible.'], ['Promettre l\'équivalent.', 'Faux.']], 'Compenser et le dire.'),
  Q('d18-rm3', 'remediation', 'maintenir', c3, 'Remédiation : mise à jour', 'Après un nouveau plan, que faire ?', ['Régénérer et relancer le script.', 'Permissions à jour.'], [['Rien.', 'Faux.'], ['Supprimer le connecteur.', 'Faux.'], ['Changer de région.', 'Faux.']], 'Relancer.'),
];

const competencies = comps([
  ['Connecter GCP correctement', 'Fédération, script, politique de domaine.', ['Je décris les ressources du script.', 'J’active les API requises.', 'Je lève Domain Restricted Sharing avec approbation.']],
  ['Cadrer les plans GCP sans transposer Azure', 'Matrice, Arc, OS Config.', ['Je cite les plans pris en charge.', 'Je mesure le coût d’OS Config.', 'J’écris les écarts avec Azure.']],
  ['Exploiter et dépanner le connecteur GCP', 'Mise à jour, vérifications, retrait.', ['Je relance le script au bon moment.', 'Je vérifie les ressources et le pare-feu.', 'Je mesure les appels d’API.']],
]);

const projects = [
  P(1, 'débutant', 'Fiche de connexion GCP', 'Documenter portée, accès, exclusions et intervalle d\'un connecteur.', 'Tableau portée, accès, exclusions, intervalle.', ['Choisir la portée.', 'Justifier l\'accès.', 'Lister les exclusions.'], ['Chaque choix est justifié.'], ['Politique de domaine oubliée.'], ['Ajouter la liste des API.']),
  P(2, 'intermédiaire', 'Matrice d\'écarts Azure et GCP', 'Concevoir la matrice des plans et fonctions disponibles par cloud.', 'Matrice besoin, Azure, GCP, compensation.', ['Lister les besoins.', 'Lire la matrice.', 'Définir les compensations.'], ['Aucune promesse hors matrice.'], ['Transposer Azure à GCP.'], ['Dater la matrice.'],
    { connected: { accounts: 'Un projet GCP de laboratoire et un abonnement Azure de test.', permissions: 'Propriétaire du projet GCP de laboratoire; Contributor sur l\'abonnement Azure de test.', costs: 'Les plans sont payants côté Azure et des appels d\'API et l\'agent OS Config peuvent engendrer des coûts côté GCP : confirmer l\'essai ou le coût avant activation; aucune activation automatique.', secrets: 'Aucun secret; fédération et jetons courts seulement.', cleanup: 'Mettre les plans à Off, relancer le script pour retirer les rôles, supprimer le pool d\'identités et le connecteur.', limits: 'Projet de laboratoire sans charge de production. Statut : non réalisée dans un laboratoire Microsoft réel.' } }),
  P(3, 'avancé', 'Runbook de dépannage du connecteur GCP', 'Rédiger un runbook avec arbre de décision et mesure des appels d\'API.', 'Arbre de décision et requêtes de journaux.', ['Lister les symptômes.', 'Associer les causes.', 'Définir les mesures.'], ['Chaque symptôme a une action.'], ['Conclusions hâtives.'], ['Tester sur un projet de laboratoire.']),
];

export const d18 = assemble({ id: 'd18', level: 4, n: 18, title: 'Defender for Cloud sur GCP',
  summary: 'Connecteur GCP par fédération et script gcloud, politique de partage restreint, matrice de plans sans transposer Azure, Arc par OS Config avec coûts, santé, mesure des appels d’API et retrait.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Connecter l’organisation GCP de Nordlys Technologies',
  caseScenario: 'Vous connectez une organisation GCP, corrigez une offre qui transpose Azure et dépannez le connecteur. Données simulées.', caseMinutes: 55 });
