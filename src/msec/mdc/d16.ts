// Module 16 : Données et identités cloud (DSPM et CIEM) (niveau 3).
import { dsl, md } from './dsl.ts';

const { lesson, Q, M, MT, OR, CF, IN, WF, FX, SH, OP, comps, P, assemble } = dsl('d16');
const c1 = { comp: 'd16-c1', lesson: 'd16-l1', tags: ['dspm', 'echantillonnage', 'sensibilite', 'delais'] };
const c2 = { comp: 'd16-c2', lesson: 'd16-l2', tags: ['risque-donnees', 'exposition', 'explorer', 'priorisation'] };
const c3 = { comp: 'd16-c3', lesson: 'd16-l3', tags: ['ciem', 'identites-inactives', 'journaux', 'moindre-privilege'] };

const l1 = lesson(1, {
  title: 'Découverte des données sensibles : ce qui est échantillonné, quand et où', minutes: 50,
  summary: 'Comprendre le fonctionnement de la découverte des données sensibles, ses prérequis, ses délais et ses limites avant de promettre une couverture.',
  objectives: ['Décrire l’échantillonnage intelligent et ses limites.', 'Énoncer les ressources prises en charge et les délais.', 'Configurer ce qui est « sensible » avec les paramètres de sensibilité.'],
  prerequisites: ['Module 5 : CSPM', 'Module 12 : Defender for Storage'],
  body: md(
    '## Ce que fait la découverte',
    'La gestion de la posture de sécurité des données (DSPM) découvre automatiquement les magasins de données qui contiennent des informations sensibles, évalue leur exposition et fait remonter les risques. Elle repose sur l’extension de **découverte des données sensibles**, incluse dans les plans **Defender CSPM** et **Defender for Storage** (et disponible dans Defender for Databases). Elle fonctionne par **échantillonnage intelligent** : pour le stockage d’objets, l’algorithme choisit des conteneurs susceptibles de contenir des données sensibles et échantillonne jusqu’à 20 Mo par fichier; pour les bases, il sélectionne certaines tables et échantillonne entre 300 et 1 024 lignes par requêtes non bloquantes. L’échantillon permet de conclure avec une bonne confiance sans balayer chaque actif, mais il **ne détecte pas tous les types** de données : pour un catalogage complet, utilisez les analyses de Microsoft Purview.',
    '## Ressources prises en charge',
    'Dans Azure : comptes de stockage de blocs de blobs (v1 et v2), Azure Files par SMB seulement, Data Lake Gen2 et Azure SQL Database chiffrée par TDE; les comptes derrière des réseaux privés et chiffrés par clé gérée par le client sont pris en charge, mais **pas** ceux dont le point de terminaison a un domaine personnalisé. Dans AWS : compartiments S3 (chiffrement KMS accepté, pas SSE-C) et bases Aurora, RDS PostgreSQL, MySQL, MariaDB, SQL Server et Oracle (non personnalisés), avec sauvegardes automatiques activées et un rôle IAM autorisé sur la clé KMS. Les types de fichiers sont fixes (documents Office, PDF, CSV, JSON, Parquet, Avro et autres) et on ne peut pas en choisir un sous-ensemble. La liste de régions Azure est longue : vérifiez la vôtre.',
    '## Délais et permissions',
    'Les premiers résultats pour le stockage d’objets arrivent en 24 heures; après la mise à jour d’un fichier, la donnée se rafraîchit en huit jours; un nouveau compte Azure est découvert en 24 heures ou moins, un nouveau compartiment AWS ou GCP en 48 heures; les bases sont analysées **chaque semaine**. Pour analyser le stockage Azure, Defender crée une ressource `storageDataScanner` à laquelle il attribue le rôle **Storage Blob Data Reader**. L’analyse se fait **dans votre région** : seules les métadonnées (noms de ressources, étiquettes, noms des types détectés) sont transmises à Defender for Cloud. Si la découverte est activée sans Defender CSPM, seules les ressources de stockage sont analysées.',
    '## Définir « sensible »',
    'Les **paramètres de sensibilité** définissent ce qui est sensible pour votre organisation : types d’informations sensibles prédéfinis de Purview (certains activés par défaut), types et étiquettes personnalisés importés de Purview, et **seuils de confiance** pour les étiquettes. Un changement prend effet à la prochaine découverte. Quand Defender CSPM est activé, le résultat de Defender remplace celui d’une analyse Purview sur les mêmes ressources.',
    '```text',
    'Registre de couverture (exemple fictif)',
    'Stockage Azure : découvert 24 h; fichiers .pdf, .csv, .parquet    Limite : domaine personnalisé exclu',
    'Bases Azure SQL : hebdomadaire; TDE                                Limite : échantillon de lignes',
    'S3 : 48 h; KMS accepté, SSE-C non                                  Limite : étiquettes personnalisées à tester',
    '```',
    '## Erreurs fréquentes',
    '- Déclarer qu’un magasin « ne contient aucune donnée sensible » parce que l’échantillon n’en a pas trouvé.',
    '- Oublier le domaine personnalisé ou le chiffrement SSE-C.',
    '- Ne pas ajuster les seuils de confiance.',
  ),
  demo: { title: 'Lire un résultat de découverte', body: md(
    'Résultat **fictif** :',
    '```text',
    'compte stockclients : contient des données sensibles (numéro d’assurance sociale, confiance élevée)',
    'compte archives-web : aucune donnée sensible trouvée dans l’échantillon',
    '```',
    '**Lecture commentée.** Le premier est un signal fiable; le second signifie « non trouvé dans l’échantillon », pas « absent ».',
    '**Ce que la démo ne prouve pas.** Aucune donnée réelle.') },
  revision: md('## Fiche : découverte', '- Échantillonnage : 20 Mo par fichier; 300 à 1 024 lignes.', '- Stockage 24 h, rafraîchissement 8 jours; bases hebdomadaires.', '- Domaine personnalisé et SSE-C non pris en charge.', '- Analyse dans la région; métadonnées seulement.', '- Seuils et types de sensibilité configurables.'),
  links: ['dspm', 'dspm-prepare', 'dspm-enable', 'dspm-sensitivity', 'storage-sensitive'], teaches: ['dspm', 'echantillonnage', 'sensibilite', 'delais'],
});

const l2 = lesson(2, {
  title: 'Du risque sur les données à la priorité : exposition, chemins et explorateur', minutes: 50,
  summary: 'Croiser sensibilité et exposition pour prioriser, avec l’explorateur de sécurité infonuagique et les chemins d’attaque.',
  objectives: ['Croiser sensibilité, exposition et accès.', 'Utiliser des modèles de requêtes sur les données sensibles.', 'Distinguer un signal fiable d’une absence de signal.'],
  prerequisites: ['Leçon 1', 'Module 6 : chemins d’attaque'],
  body: md(
    '## La sensibilité seule ne suffit pas',
    'Un magasin sensible, mais privé et peu accessible, n’a pas la même urgence qu’un magasin sensible accessible depuis Internet ou lisible par une identité surdimensionnée. Le DSPM de Defender CSPM combine la sensibilité des données avec le contexte du graphe de sécurité infonuagique : exposition à Internet, contrôles d’accès, flux de données, réplication. C’est ce croisement qui transforme une longue liste de magasins en quelques priorités.',
    '## Chemins d’attaque et explorateur',
    'L’analyse des chemins d’attaque met en évidence, par exemple, une machine virtuelle exposée sur Internet qui a accès à un magasin de données sensibles : un attaquant peut l’exploiter puis se déplacer latéralement. L’**explorateur de sécurité infonuagique** exécute des requêtes de graphe : des modèles prêts à l’emploi trouvent les ressources de données mal configurées (publiques et sensibles, par exemple) et vous pouvez bâtir vos requêtes. Dans l’explorateur, les conteneurs de blobs apparaissent s’ils contiennent des données sensibles, ont un accès public ou une règle de réplication; les partages de fichiers n’apparaissent que s’ils contiennent des données sensibles. Cette règle d’affichage explique pourquoi un élément « manque » dans une requête.',
    '## Les bases hébergées',
    'La découverte des bases hébergées et des flux de données dans l’explorateur et les chemins d’attaque relève de Defender CSPM et ne dépend pas de l’extension de découverte des données sensibles. Cette nuance évite de désactiver l’extension en pensant perdre la cartographie.',
    '## Defender for Storage : prioriser les alertes',
    'Dans Defender for Storage, les types et étiquettes de sensibilité appliqués aux ressources servent à prioriser alertes et recommandations : une alerte d’accès anormal sur un compte contenant des données sensibles passe avant les autres. C’est la même idée, côté menace.',
    '## Une absence de signal n’est pas une preuve',
    'Ni l’absence de magasin sensible dans une requête ni un tableau de bord vide ne prouvent que tout va bien : l’échantillonnage, les délais, les ressources non prises en charge et les filtres d’affichage peuvent masquer des données. Validez avec un échantillon de contrôle : un compte de test contenant des données fictives connues (jamais de données réelles) doit apparaître comme sensible après les délais documentés.',
    '```text',
    'Priorisation (exemple fictif)',
    'P1 : stockclients  sensible + accès public + règle de réplication   -> corriger aujourd’hui',
    'P2 : bd-rh         sensible + accessible par identité surdimensionnée -> réduire les droits (module CIEM)',
    'P3 : archives-web  non sensible dans l’échantillon                   -> contrôle par compte de test',
    '```',
    '## Erreurs fréquentes',
    '- Prioriser par sensibilité seule.',
    '- Conclure à l’absence de données sensibles sur la foi d’une requête vide.',
    '- Utiliser des données réelles pour tester la découverte.',
  ),
  demo: { title: 'Croiser pour prioriser', body: md(
    'Trois magasins **fictifs** :',
    '```text',
    'A : sensible, public, répliqué   -> priorité 1',
    'B : sensible, privé, un seul accès légitime -> priorité 3',
    'C : non sensible, public        -> posture à corriger, urgence moindre',
    '```',
    '**Lecture commentée.** La sensibilité et l’exposition s’additionnent.',
    '**Ce que la démo ne prouve pas.** Aucun environnement réel.') },
  revision: md('## Fiche : risque données', '- Sensibilité + exposition + accès = priorité.', '- Explorateur : modèles et requêtes personnalisées.', '- Règles d’affichage des conteneurs et partages.', '- Bases hébergées : CSPM, sans extension.', '- Contrôle avec compte de test fictif.'),
  links: ['dspm-risks', 'explorer-howto', 'attack-path', 'internet-exposure', 'storage-sensitive'], teaches: ['risque-donnees', 'exposition', 'explorer', 'priorisation'],
});

const l3 = lesson(3, {
  title: 'CIEM : identités inactives, droits excessifs et journaux nécessaires', minutes: 50,
  summary: 'Activer et lire le CIEM sur Azure, AWS et GCP, comprendre ses changements de logique de 2026 et appliquer le moindre privilège.',
  objectives: ['Énoncer les prérequis du CIEM.', 'Décrire la logique d’inactivité et ses changements.', 'Choisir l’outil natif du fournisseur pour les permissions inutilisées sur AWS et GCP.'],
  prerequisites: ['Leçons 1 et 2', 'Modules 17 et 18 (aperçu)'],
  body: md(
    '## Ce que fait le CIEM',
    'La gestion des droits d’infrastructure infonuagique (CIEM) est une extension de Defender CSPM, appelée **Permissions Management**. Elle suit les droits sur Azure, AWS et GCP dans une vue unifiée, analyse les **droits effectifs** (qui peut atteindre des ressources sensibles ou exposées), propose des recommandations (retirer les comptes inactifs, invités ou bloqués qui ont encore un accès; limiter les droits d’administration; ajuster les droits des identités surdimensionnées; imposer l’authentification multifacteur aux utilisateurs IAM) et relie les risques d’identité aux chemins d’attaque pour signaler un mouvement latéral possible.',
    '## Prérequis',
    'Il faut le plan **Defender CSPM** et le rôle **Security Admin** : au niveau de l’abonnement pour Azure, au niveau du compte ou de l’organisation pour AWS et GCP. AWS et GCP doivent d’abord être connectés (modules 17 et 18). À l’activation sur AWS, on met à jour le gabarit CloudFormation; sur GCP, on exécute le script Cloud Shell ou Terraform. Les recommandations apparaissent en quelques heures; le premier cycle peut prendre jusqu’à 24 heures. Depuis février 2026, l’intégration ne demande plus de droits élevés à haut risque.',
    '## Logique d’inactivité (2026)',
    'Depuis le 2 février 2026, une identité **inactive** est évaluée d’après les **attributions de rôles inutilisées** plutôt que l’activité de connexion; la fenêtre d’observation passe à **90 jours** (45 auparavant) et les identités créées depuis moins de 90 jours ne sont pas évaluées. La métrique **Permissions Creep Index** est retirée. Sur Azure, l’évaluation inclut les droits de lecture. Sur AWS, les identités SAML et SSO demandent l’**ingestion de CloudTrail** (préversion) et les identités serverless et de calcul sont exclues de l’inactivité, ce qui change les décomptes. Sur GCP, l’évaluation demande l’**ingestion de Cloud Logging** (préversion). Sans ces journaux, une identité active peut sembler inactive, ou l’inverse.',
    '## Changement du 6 août 2026',
    'Depuis le 6 août 2026, Defender ne publie plus la **liste des actions inutilisées** pour les recommandations d’identités surdimensionnées sur AWS et GCP; la recommandation continue d’identifier les identités, mais pour le détail il faut utiliser les outils du fournisseur : sur AWS, l’onglet des derniers accès d’IAM; sur GCP, les informations de politique et les recommandations de rôles d’IAM. Tout flux de travail qui lisait cette liste dans Defender doit être adapté.',
    '```text',
    'Plan de revue des identités (exemple fictif)',
    'Revue mensuelle : identités surdimensionnées et inactives, par propriétaire',
    'Avant retrait : vérifier journaux (CloudTrail / Cloud Logging) et dépendances',
    'Retrait par étapes : désactiver, attendre 14 jours, supprimer; conserver un plan de retour arrière',
    '```',
    '## Erreurs fréquentes',
    '- Retirer des droits sur la foi d’une recommandation sans journaux d’activité.',
    '- Chercher la liste d’actions inutilisées dans Defender après le 6 août 2026.',
    '- Oublier que l’inactivité se calcule maintenant sur 90 jours.',
  ),
  demo: { title: 'Une identité « inactive »', body: md(
    'Identité **fictive** `svc-rapports` sur AWS :',
    '```text',
    'Recommandation : permissions d’une identité inactive à révoquer',
    'Vérification : CloudTrail non ingéré -> l’activité SSO peut être invisible',
    'Décision : activer l’ingestion, attendre un cycle, puis désactiver (pas supprimer) l’identité',
    '```',
    '**Lecture commentée.** On vérifie la source de données avant d’agir.',
    '**Ce que la démo ne prouve pas.** Aucun compte réel.') },
  revision: md('## Fiche : CIEM', '- Extension de Defender CSPM; Security Admin.', '- Inactivité : rôles inutilisés, 90 jours (depuis 2026-02-02).', '- AWS : CloudTrail pour SSO/SAML; GCP : Cloud Logging (préversions).', '- 2026-08-06 : plus de liste d’actions inutilisées pour AWS et GCP.', '- Retrait par étapes avec retour arrière.'),
  links: ['ciem', 'ciem-enable', 'cloudtrail', 'logging-ingestion', 'release-notes'], teaches: ['ciem', 'identites-inactives', 'journaux', 'moindre-privilege'],
});

const exercises = [
  MT('d16-g1', 'guided', 'comprendre', c1, 'Délais', 'Associez chaque ressource à son délai de découverte.', [['Stockage Azure, première découverte', '24 heures'], ['Nouveau compartiment AWS', '48 heures'], ['Bases de données', 'Hebdomadaire'], ['Fichier mis à jour', 'Huit jours']], 'Les délais sont documentés par type de ressource.'),
  CF('d16-a1', 'autonomous', 'securiser', c1, 'Paramètres de sensibilité', 'Paramétrez la définition de « sensible ».', [['Importer les types et étiquettes de Purview', 'on', 'Cohérence avec la classification existante.'], ['Garder le seuil par défaut sans revue', 'off', 'Faux positifs ou négatifs.'], ['Tester avec des données fictives', 'on', 'Validation sans risque.']], 'On configure, on teste avec des données fictives.'),
  Q('d16-q1a', 'quiz', 'comprendre', c1, 'Échantillon', 'Combien de lignes sont échantillonnées dans une base ?', ['300 à 1 024 lignes.', 'Par requêtes non bloquantes.'], [['Toutes.', 'Faux.'], ['10.', 'Faux.'], ['Aucune.', 'Faux.']], '300 à 1 024.'),
  Q('d16-q1b', 'quiz', 'fonctionner', c1, 'Domaine personnalisé', 'Un compte avec domaine personnalisé est-il pris en charge ?', ['Non.', 'Limite documentée.'], [['Oui.', 'Faux.'], ['Seulement en lecture.', 'Faux.'], ['Seulement avec Purview.', 'Faux.']], 'Non.'),
  Q('d16-q1c', 'quiz', 'securiser', c1, 'Ce qui sort de la région', 'Que transmet l\'analyse hors de la région ?', ['Les métadonnées seulement.', 'Pas le contenu.'], [['Le contenu des fichiers.', 'Faux.'], ['Les clés.', 'Faux.'], ['Les mots de passe.', 'Faux.']], 'Métadonnées.'),

  MT('d16-g2', 'guided', 'comprendre', c2, 'Priorités', 'Associez chaque magasin à sa priorité.', [['Sensible, public, répliqué', 'Priorité 1'], ['Sensible, privé, un accès légitime', 'Priorité 3'], ['Sensible, identité surdimensionnée', 'Priorité 2']], 'Sensibilité et exposition s\'additionnent.'),
  WF('d16-a2', 'autonomous', 'verifier', c2, 'Contrôle de la découverte', 'Ordonnez le contrôle de la découverte avec un compte de test.', ['Créer un compte de test sans données réelles', 'Y déposer des données fictives connues', 'Attendre les délais documentés', 'Vérifier l\'apparition comme sensible', 'Supprimer le compte de test'], [['Tester avec des données réelles', 'Risque inutile.']], 'Créer, déposer, attendre, vérifier, supprimer.'),
  Q('d16-q2a', 'quiz', 'securiser', c2, 'Requête vide', 'Une requête vide prouve-t-elle l\'absence de données sensibles ?', ['Non.', 'Échantillon, délais, filtres.'], [['Oui.', 'Faux.'], ['Seulement la nuit.', 'Faux.'], ['Seulement pour Azure.', 'Faux.']], 'Non.'),
  Q('d16-q2b', 'quiz', 'comprendre', c2, 'Partages de fichiers', 'Quand un partage de fichiers apparaît-il dans l\'explorateur ?', ['S\'il contient des données sensibles.', 'Règle d\'affichage.'], [['Toujours.', 'Faux.'], ['Jamais.', 'Faux.'], ['S\'il est public.', 'Faux.']], 'Données sensibles seulement.'),
  Q('d16-q2c', 'quiz', 'fonctionner', c2, 'Bases hébergées', 'La cartographie des bases hébergées dépend-elle de l\'extension de découverte ?', ['Non, elle relève de Defender CSPM.', 'Indépendante.'], [['Oui.', 'Faux.'], ['Seulement sur AWS.', 'Faux.'], ['Seulement sur GCP.', 'Faux.']], 'Non.'),

  MT('d16-g3', 'guided', 'comprendre', c3, 'Journaux CIEM', 'Associez chaque cloud à ses besoins de journaux.', [['AWS SSO/SAML', 'Ingestion CloudTrail (préversion)'], ['GCP', 'Ingestion Cloud Logging (préversion)'], ['Azure', 'Évaluation incluant les droits de lecture']], 'Les journaux dépendent du cloud.'),
  OR('d16-a3', 'autonomous', 'securiser', c3, 'Retrait par étapes', 'Ordonnez le retrait d\'une identité inactive.', ['Vérifier les journaux et dépendances', 'Désactiver l\'identité', 'Attendre une période d\'observation', 'Supprimer ou révoquer', 'Documenter le retour arrière'], 'Vérifier, désactiver, attendre, supprimer, documenter.'),
  Q('d16-q3a', 'quiz', 'verifier', c3, 'Fenêtre', 'Quelle est la fenêtre d\'inactivité du CIEM ?', ['90 jours.', 'Avant : 45 jours.'], [['7 jours.', 'Faux.'], ['30 jours.', 'Faux.'], ['365 jours.', 'Faux.']], '90 jours.'),
  Q('d16-q3b', 'quiz', 'securiser', c3, 'Rôle', 'Quel rôle active le CIEM sur Azure ?', ['Security Admin au niveau de l\'abonnement.', 'Plan Defender CSPM requis.'], [['Reader.', 'Faux.'], ['Billing Reader.', 'Faux.'], ['Aucun.', 'Faux.']], 'Security Admin.'),
  Q('d16-q3c', 'quiz', 'maintenir', c3, 'Actions inutilisées', 'Où voir les actions inutilisées sur AWS depuis le 6 août 2026 ?', ['Dans les derniers accès d\'IAM chez AWS.', 'Outil du fournisseur.'], [['Dans Defender.', 'Retiré.'], ['Dans Sentinel.', 'Faux.'], ['Nulle part.', 'Faux.']], 'Chez AWS.'),

  Q('d16-ev1', 'eval', 'comprendre', c1, 'Contenu complet', 'La découverte détecte-t-elle tous les types de données ?', ['Non, utiliser Purview pour un catalogage complet.', 'Échantillonnage.'], [['Oui.', 'Faux.'], ['Seulement les cartes.', 'Faux.'], ['Seulement les mots de passe.', 'Faux.']], 'Non.'),
  M('d16-ev2', 'eval', 'securiser', c2, 'Éléments de priorisation', 'Cochez ce qui entre dans la priorisation d\'un magasin sensible.', [['Exposition à Internet.', 'Oui.'], ['Contrôles d\'accès.', 'Oui.'], ['Règle de réplication.', 'Oui.']], [['La couleur du portail.', 'Faux.']], 'Trois éléments.'),
  FX('d16-ev3', 'eval', 'verifier', c1, 'Fiche de couverture', 'Complétez la fiche de couverture fictive.', { ressource: '', delai: '', limite: '', controle: '' }, { ressource: 'stockage Azure', delai: '24 heures', limite: 'domaine personnalisé exclu', controle: 'compte de test fictif' }, [['ressource', 'stockage Azure', 'Nommer la ressource.', 'comprendre'], ['delai', '24 heures', 'Noter le délai.', 'verifier'], ['limite', 'domaine personnalisé exclu', 'Noter la limite.', 'verifier'], ['controle', 'compte de test fictif', 'Prévoir un contrôle.', 'maintenir']], 'Ressource, délai, limite, contrôle.'),
  OR('d16-ev4', 'eval', 'fonctionner', c3, 'Activer le CIEM', 'Ordonnez l\'activation du CIEM sur AWS.', ['Connecter le compte AWS', 'Activer Defender CSPM', 'Activer Permissions Management', 'Mettre à jour le gabarit CloudFormation', 'Attendre les recommandations'], 'Connecter, CSPM, CIEM, gabarit, attente.'),
  CF('d16-ev5', 'eval', 'cout', c1, 'Coûts de la découverte', 'Paramétrez la stratégie de coûts.', [['Activer l\'extension seulement où nécessaire', 'on', 'Coûts de découverte.'], ['Analyser tous les comptes sans inventaire', 'off', 'Coûts imprévus.'], ['Estimer avec le calculateur', 'on', 'Planification.']], 'Cibler et estimer.'),
  WF('d16-ev6', 'eval', 'maintenir', c3, 'Revue mensuelle', 'Ordonnez la revue mensuelle des identités.', ['Exporter les recommandations', 'Regrouper par propriétaire', 'Vérifier les journaux', 'Décider retrait ou exception', 'Documenter'], [['Retirer sans vérifier les journaux', 'Risque d\'interruption.']], 'Exporter, regrouper, vérifier, décider, documenter.'),
  SH('d16-ev7', 'eval', 'verifier', c3, 'Fenêtre en jours', 'Combien de jours d\'observation pour l\'inactivité CIEM ? (nombre)', ['90'], '90 jours.', 90),
  Q('d16-ev8', 'eval', 'comprendre', c2, 'Priorité', 'Qu\'est-ce qui rend un magasin sensible plus urgent ?', ['Son exposition ou ses accès excessifs.', 'Croisement.'], [['Sa taille.', 'Non.'], ['Son nom.', 'Non.'], ['Sa région.', 'Non.']], 'Exposition et accès.'),

  IN('d16-cs1', 'case', 'verifier', c1, 'Cas : promesses chez Nordlys', 'Promesses fictives : repérez celles à corriger.', 'text', [['« La découverte voit toutes les données sensibles. »', 'Échantillonnage et types limités', 'Garder tel quel'], ['« Aucun résultat veut dire aucune donnée sensible. »', 'Peut être un artefact d\'échantillon ou de délai', 'Garder tel quel']], 'Chaque promesse est corrigée.'),
  MT('d16-cs2', 'case', 'securiser', c2, 'Cas : trois magasins', 'Associez chaque magasin à l\'action.', [['Sensible, public, répliqué', 'Corriger aujourd\'hui'], ['Sensible, identité surdimensionnée', 'Réduire les droits'], ['Non sensible dans l\'échantillon', 'Contrôle par compte de test']], 'Une action par situation.'),
  WF('d16-cs3', 'case', 'securiser', c3, 'Cas : identité de service', 'Ordonnez le traitement d\'une identité de service « inactive ».', ['Vérifier l\'ingestion des journaux', 'Rechercher les dépendances', 'Désactiver sans supprimer', 'Observer', 'Supprimer ou rétablir'], [['Supprimer immédiatement', 'Risque d\'interruption.']], 'Vérifier, chercher, désactiver, observer, décider.'),
  OP('d16-cs-open', 'case', 'verifier', c1, 'Cas : données et identités de Nordlys', 'Rédigez la stratégie de protection des données et identités d\'une organisation fictive.', 'Une page : découverte, priorisation, CIEM, journaux, limites.', [['La découverte et ses limites sont décrites.', 'comprendre'], ['La priorisation croise exposition et sensibilité.', 'securiser'], ['Les journaux du CIEM sont planifiés.', 'fonctionner'], ['Les coûts et revues sont définis.', 'cout']], 'La stratégie relie découverte, priorités, CIEM et revues.'),

  Q('d16-rm1', 'remediation', 'comprendre', c1, 'Remédiation : échantillon', 'Que signifie « aucune donnée sensible trouvée » ?', ['Rien trouvé dans l\'échantillon.', 'Pas une preuve d\'absence.'], [['Absence certaine.', 'Faux.'], ['Erreur de portail.', 'Faux.'], ['Plan désactivé.', 'Faux.']], 'Non trouvé.'),
  Q('d16-rm2', 'remediation', 'securiser', c2, 'Remédiation : priorité', 'Que combine-t-on avec la sensibilité pour prioriser ?', ['L\'exposition et les accès.', 'Contexte du graphe.'], [['La couleur.', 'Faux.'], ['Le nom.', 'Faux.'], ['L\'heure.', 'Faux.']], 'Exposition et accès.'),
  Q('d16-rm3', 'remediation', 'maintenir', c3, 'Remédiation : retrait', 'Quelle première étape avant de retirer une identité ?', ['Vérifier les journaux et dépendances.', 'Avec retour arrière.'], [['Supprimer.', 'Dangereux.'], ['Ignorer.', 'Faux.'], ['Désactiver CIEM.', 'Faux.']], 'Vérifier les journaux.'),
];

const competencies = comps([
  ['Gérer la découverte des données sensibles', 'Échantillonnage, délais, limites.', ['J’énonce l’échantillonnage et ses limites.', 'Je note les délais.', 'Je configure la sensibilité.']],
  ['Prioriser le risque sur les données', 'Exposition, chemins, explorateur.', ['Je croise sensibilité et exposition.', 'J’utilise l’explorateur.', 'Je contrôle avec des données fictives.']],
  ['Exploiter le CIEM', 'Prérequis, journaux, retrait par étapes.', ['J’énonce les prérequis.', 'Je connais la logique de 90 jours.', 'Je retire par étapes avec retour arrière.']],
]);

const projects = [
  P(1, 'débutant', 'Registre de couverture des données', 'Dresser le registre des magasins avec délai, limites et contrôle.', 'Tableau magasin, délai, limite, contrôle.', ['Lister les magasins.', 'Noter les limites.', 'Prévoir un contrôle.'], ['Chaque magasin a un contrôle.'], ['Domaines personnalisés oubliés.'], ['Ajouter les coûts.']),
  P(2, 'intermédiaire', 'Plan de priorisation des magasins sensibles', 'Concevoir la priorisation croisant sensibilité, exposition et accès.', 'Grille de priorité et plan d\'action.', ['Définir les critères.', 'Classer.', 'Planifier les corrections.'], ['Aucune priorité sans exposition.'], ['Requêtes vides mal interprétées.'], ['Ajouter une requête de l\'explorateur.'],
    { connected: { accounts: 'Un abonnement Azure de test avec un compte de stockage de laboratoire contenant des données fictives.', permissions: 'Security Admin sur l\'abonnement de test; Storage Blob Data Contributor sur le compte de laboratoire.', costs: 'Defender CSPM est payant : confirmer l\'essai ou le coût avant activation; aucune activation automatique.', secrets: 'Aucun secret; données fictives seulement.', cleanup: 'Désactiver l\'extension et supprimer le compte de laboratoire.', limits: 'Aucune donnée réelle. Statut : non réalisée dans un laboratoire Microsoft réel.' } }),
  P(3, 'avancé', 'Programme de revue CIEM', 'Mettre en place la revue mensuelle des identités avec journaux et retour arrière.', 'Procédure, indicateurs, registre.', ['Activer les journaux.', 'Définir la revue.', 'Définir le retrait par étapes.'], ['Aucun retrait sans journaux.'], ['Interruptions de services.'], ['Automatiser l\'export.']),
];

export const d16 = assemble({ id: 'd16', level: 3, n: 16, title: 'Données et identités cloud',
  summary: 'Découverte des données sensibles et ses limites, priorisation par exposition et accès, et CIEM avec journaux, logique d’inactivité de 2026 et retrait par étapes.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Protéger les données et identités de Nordlys Technologies',
  caseScenario: 'Vous évaluez la découverte de données sensibles, priorisez des magasins et traitez des identités inactives. Données simulées.', caseMinutes: 50 });
