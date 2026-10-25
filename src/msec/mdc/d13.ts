// Module 13 : Defender for Databases (niveau 3).
import { dsl, md } from './dsl.ts';

const { lesson, Q, M, MT, OR, CF, IN, WF, FX, SH, OP, comps, P, assemble } = dsl('d13');
const c1 = { comp: 'd13-c1', lesson: 'd13-l1', tags: ['offres', 'portee', 'roles', 'prerequis'] };
const c2 = { comp: 'd13-c2', lesson: 'd13-l2', tags: ['sql-va', 'baseline', 'atp'] };
const c3 = { comp: 'd13-c3', lesson: 'd13-l3', tags: ['cosmos', 'open-source', 'injection', 'limites'] };

const l1 = lesson(1, {
  title: 'Quatre offres, quatre moteurs : ne pas transposer les fonctions', minutes: 50,
  summary: 'Distinguer les offres Azure SQL, SQL sur machines, bases relationnelles libres et Cosmos DB, leurs prérequis, rôles et limites.',
  objectives: ['Nommer les quatre offres et leurs moteurs pris en charge.', 'Énoncer les prérequis propres à SQL sur machines.', 'Éviter de transposer une fonction d’un moteur à un autre.'],
  prerequisites: ['Module 2 : plans, licences et coûts', 'Module 4 : déploiement et couverture'],
  body: md(
    '## Un plan, quatre offres facturées séparément',
    'Le plan **Defender for Databases** regroupe quatre offres, chacune tarifée à part : **Azure SQL Databases** (évaluation des vulnérabilités et protection avancée contre les menaces), **SQL Servers on Machines** (machines virtuelles ou physiques, y compris hors Azure), **bases relationnelles libres** (PostgreSQL, MySQL, MariaDB) et **Azure Cosmos DB**. Dans le portail Defender, le plan Databases est consolidé et facturé par instance; dans le portail Azure, il reste en quatre offres. Estimez chaque offre avec le calculateur (module 2) et ne supposez pas qu’activer l’une couvre les autres.',
    '## Ne pas transposer',
    'Chaque offre a sa couverture. **Azure SQL Databases** : bases uniques, pools élastiques, instances gérées et pools SQL dédiés Synapse (pas les pools serverless ni Spark). **SQL sur machines** : Azure, AWS, GCP et sur site, avec des analyses de vulnérabilités environ toutes les 12 heures. **Bases libres** : Azure en disponibilité générale, AWS en préversion, GCP non pris en charge. **Cosmos DB** : l’API **NoSQL** seulement (pas Cassandra, MongoDB, Table ni Gremlin), seulement dans Azure, et le service **n’accède pas aux données** du compte. Une fonction documentée pour un moteur (par exemple l’évaluation des vulnérabilités SQL) ne s’applique pas aux autres : vérifiez la matrice de prise en charge avant de promettre une couverture.',
    '## Prérequis et rôles',
    'Pour Azure SQL, activer et gérer les paramètres demande le rôle **SQL Security Manager** ou un rôle d’administrateur de base ou de serveur. Pour **SQL sur machines**, les prérequis sont plus lourds : rôle **Owner** sur l’abonnement, compte de service SQL membre du rôle **sysadmin**, SQL Server 2012 ou plus, extension Azure Arc pour les machines hors Azure, extensions de protection (par exemple `AdvancedThreatProtection.Windows`, l’agent IaaS SQL) et connexion HTTPS sortante (443) vers `*.<région>.arcdataservices.com`; **un proxy Azure Arc n’est pas pris en charge** pour ce flux. Sur AWS, les prérequis ajoutent l’agent SSM et des rôles IAM (module 17).',
    '## Données et coûts',
    'Le plan peut aussi s’activer sur un **espace de travail** pour SQL sur machines. Les journaux d’audit de base (écrits dans un compte de stockage ou Log Analytics) donnent une enquête complète : activez-les là où la protection avancée est active, en prévoyant leur coût de stockage.',
    '| Offre | Moteurs | Nuages | Point d’attention |',
    '| --- | --- | --- | --- |',
    '| Azure SQL Databases | SQL Database, MI, Synapse dédié | Azure | SQL Security Manager |',
    '| SQL sur machines | SQL Server 2012+ | Azure, AWS, GCP, site | Arc, sysadmin, 443 sortant |',
    '| Libres | PostgreSQL, MySQL, MariaDB | Azure GA, AWS préversion | GCP non pris en charge |',
    '| Cosmos DB | API NoSQL | Azure | Ne lit pas les données |',
    '## Erreurs fréquentes',
    '- Promettre l’évaluation des vulnérabilités sur Cosmos DB.',
    '- Oublier l’extension Arc ou la sortie 443 pour SQL sur machines.',
    '- Utiliser un proxy Arc pour le flux SQL.',
  ),
  demo: { title: 'Que couvre le plan par moteur', body: md(
    'Parc **fictif** :',
    '```text',
    'SQL Database (Azure)    -> évaluation des vulnérabilités + protection contre les menaces',
    'SQL Server sur VM EC2   -> Arc, agent SSM, extensions; analyses d’environ 12 heures',
    'PostgreSQL sur AWS      -> préversion; ne pas inclure dans un engagement ferme',
    'Cosmos DB for MongoDB   -> non pris en charge; compenser autrement',
    '```',
    '**Lecture commentée.** Quatre moteurs, quatre promesses différentes.',
    '**Ce que la démo ne prouve pas.** Aucun déploiement réel.') },
  revision: md('## Fiche : Databases', '- Quatre offres, facturées séparément.', '- Cosmos : API NoSQL seulement, ne lit pas les données.', '- Libres : Azure GA, AWS préversion, GCP non.', '- SQL sur machines : Owner, sysadmin, Arc, 443 vers arcdataservices.', '- Azure SQL : SQL Security Manager.'),
  links: ['databases', 'databases-enable', 'sql-intro', 'sql-machines', 'osrdb'], teaches: ['offres', 'portee', 'roles', 'prerequis'],
});

const l2 = lesson(2, {
  title: 'Évaluation des vulnérabilités SQL et protection avancée contre les menaces', minutes: 50,
  summary: 'Utiliser l’évaluation des vulnérabilités SQL (express ou classique, références) et lire les alertes de protection avancée.',
  objectives: ['Distinguer les modes express et classique.', 'Choisir entre corriger, approuver comme référence ou exempter.', 'Lister les alertes de menaces SQL et l’apport de l’audit.'],
  prerequisites: ['Leçon 1', 'Module 8 : exemptions'],
  body: md(
    '## Évaluation des vulnérabilités SQL',
    'L’évaluation des vulnérabilités SQL analyse la configuration des bases par rapport aux bonnes pratiques de Microsoft et à des exigences réglementaires courantes, et rapporte chaque contrôle comme **recommandation** sur la base analysée. Deux modes existent : **express** (recommandé, géré par Microsoft, sans compte de stockage à gérer, disponible pour SQL Database, Managed Instance et Synapse sans frais supplémentaires) et **classique** (compte de stockage géré par le client). Les deux partagent la logique, les conseils de correction et la gestion des références; la différence pratique concerne le **moment où une référence prend effet**. Une API REST unifiée en préversion gère l’évaluation sur Azure SQL, Managed Instance, Synapse et SQL sur machines : une préversion n’est pas une base de production.',
    '## Trois façons de traiter un constat',
    'Un résultat non sain signale un écart par rapport à une bonne pratique : il peut s’agir d’une mauvaise configuration involontaire **ou** d’un choix intentionnel. On peut (1) **corriger** en appliquant les étapes ou le script de remédiation; (2) **approuver comme référence** (baseline) si l’état actuel est voulu : la référence est définie **par règle et par ressource** et le constat passe au vert jusqu’à ce qu’une analyse détecte un écart futur; (3) **exempter** la recommandation à l’échelle de l’abonnement ou du groupe de gestion si le contrôle ne s’applique pas (module 8). Documentez la raison de chaque référence : une référence sans justification masque un risque.',
    '## Protection avancée contre les menaces',
    'La protection avancée (ATP) surveille en continu et alerte sur des activités anormales : **injection SQL potentielle**, **accès depuis un emplacement ou un centre de données inhabituel**, **accès par un principal inconnu ou une application potentiellement malveillante**, **force brute sur les identifiants SQL**. Les alertes s’intègrent à Defender for Cloud et indiquent les mesures d’investigation. Pour une enquête complète, activez l’**audit**, qui écrit les événements de base dans un journal : sans audit, vous voyez l’alerte mais pas toute la séquence de requêtes.',
    '## Version de portée du score',
    'Depuis juillet 2026, les recommandations d’évaluation des vulnérabilités SQL **par base** sont en disponibilité générale et affectent le score de sécurité **basé sur le risque**, pas le score classique : rappelez le modèle de score utilisé quand vous communiquez un chiffre (module 5).',
    '```text',
    'Registre de références (exemple fictif)',
    'Règle : "Les connexions SQL sans mot de passe fort"   Base : appli-legacy',
    'Décision : référence approuvée jusqu’à la migration (90 jours); propriétaire équipe applicative',
    'Compensation : accès réseau restreint par pare-feu de serveur; audit activé',
    '```',
    '## Erreurs fréquentes',
    '- Approuver des références en masse pour « nettoyer le tableau de bord ».',
    '- Activer la protection avancée sans audit et s’étonner de l’enquête incomplète.',
    '- Mélanger score classique et score basé sur le risque.',
  ),
  demo: { title: 'Un constat à traiter', body: md(
    'Constat **fictif** : une règle d’évaluation échoue sur 3 bases.',
    '```text',
    'Base A : écart involontaire        -> corriger avec le script, tester en préproduction',
    'Base B : écart voulu, migration prévue -> référence approuvée 90 jours, propriétaire nommé',
    'Base C : contrôle non pertinent    -> exemption à l’échelle de l’abonnement, expiration fixée',
    '```',
    '**Lecture commentée.** Trois constats identiques, trois décisions différentes, chacune justifiée.',
    '**Ce que la démo ne prouve pas.** Données inventées.') },
  revision: md('## Fiche : SQL', '- Express recommandé; classique avec compte de stockage.', '- Constat : corriger, référence (par règle et ressource), exempter.', '- ATP : injection, lieu inhabituel, principal inconnu, force brute.', '- Audit pour l’enquête complète.', '- Recommandations par base : score basé sur le risque.'),
  links: ['sql-va', 'sql-atp', 'sql-intro', 'sql-troubleshoot', 'exemptions'], teaches: ['sql-va', 'baseline', 'atp'],
});

const l3 = lesson(3, {
  title: 'Cosmos DB et bases libres : détections, limites et réponse applicative', minutes: 45,
  summary: 'Comprendre les détections propres à Cosmos DB et aux bases libres, ce qu’elles ne voient pas et comment réagir.',
  objectives: ['Décrire les détections Cosmos DB (injection, accès anormal, extraction de clés).', 'Énoncer ce que le service ne fait pas (lire les données).', 'Associer une alerte d’injection à une correction applicative.'],
  prerequisites: ['Leçons 1 et 2'],
  body: md(
    '## Defender for Azure Cosmos DB',
    'Pour l’API NoSQL, le service détecte les **injections SQL potentielles** (tentatives réussies ou échouées), les **accès anormaux** (nœud de sortie Tor, adresses suspectes connues, applications ou emplacements inhabituels) et les **activités suspectes**, comme des motifs d’extraction de clés ressemblant au mouvement latéral. Il s’appuie sur la veille de menaces de Microsoft et ne lit pas les données du compte ni n’affecte ses performances. Exemples d’alertes : extraction suspecte des clés d’accès du compte (impact potentiellement élevé, car la clé donne le contrôle complet), injection SQL avec exfiltration potentielle, et tentative d’« fuzzing » de faible gravité qui indique tout de même qu’un acteur sonde l’application.',
    '## Réponse : l’alerte pointe l’application',
    'Une alerte d’injection est rarement un problème de base de données : elle indique que **l’application** construit mal ses requêtes. Une tentative échouée reste un signal : la correction durable est l’utilisation de **requêtes paramétrées**. Pour l’extraction de clés suspecte : confirmez la légitimité de la source, **régénérez** les clés si elle est douteuse (en planifiant la mise à jour des applications), et préférez l’authentification par identité managée aux clés. Les alertes se transmettent à Sentinel ou à un autre SIEM (modules 21 et 22).',
    '## Bases relationnelles libres',
    'La protection des bases PostgreSQL, MySQL et MariaDB offre la détection de menaces et la **découverte de données sensibles** pour les moteurs pris en charge dans Azure et AWS (préversion sur AWS, non pris en charge sur GCP selon les notes consultées). Les limites de disponibilité changent : lisez la matrice à la date de mise en œuvre et notez-la.',
    '## Ce que les alertes ne disent pas',
    'Aucune alerte ne prouve l’absence d’attaque, et une injection « échouée » aujourd’hui peut réussir avec une variante demain. Associez la détection à des mesures préventives : moindre privilège sur les comptes d’application, pare-feu et points de terminaison privés, rotation des clés, revue des requêtes générées.',
    '```text',
    'Fiche d\'alerte (exemple fictif)',
    'Alerte : CosmosDB_SqlInjection.FailedFuzzingAttempt (gravité faible)',
    'Lecture : un acteur sonde l’application; aucune exfiltration confirmée',
    'Actions : revue des requêtes de l’application, passage aux requêtes paramétrées, surveillance des alertes suivantes',
    '```',
    '## Erreurs fréquentes',
    '- Traiter une alerte d’injection comme un incident de base de données seulement.',
    '- Régénérer des clés sans plan de mise à jour des applications.',
    '- Supposer que MongoDB sur Cosmos DB est protégé.',
  ),
  demo: { title: 'Extraction de clés suspecte', body: md(
    'Alerte **fictive** : extraction suspecte des clés d’un compte Cosmos DB.',
    '```text',
    '1. Identifier le principal et l’appelant; confirmer si une automatisation légitime existe',
    '2. Si douteux : régénérer la clé secondaire, basculer l’application, régénérer la primaire',
    '3. Remplacer les clés par une identité managée quand c’est possible',
    '4. Documenter et surveiller les alertes liées',
    '```',
    '**Lecture commentée.** On confirme avant d’agir, puis on régénère dans l’ordre qui évite une interruption.',
    '**Ce que la démo ne prouve pas.** Aucune alerte réelle.') },
  revision: md('## Fiche : Cosmos et libres', '- Cosmos : injection, accès anormal, extraction de clés; API NoSQL.', '- Ne lit pas les données du compte.', '- Injection : corriger l’application (requêtes paramétrées).', '- Extraction de clés : confirmer, régénérer, identité managée.', '- Libres : Azure GA, AWS préversion.'),
  links: ['cosmos', 'cosmos-alerts', 'osrdb', 'databases', 'siem-export'], teaches: ['cosmos', 'open-source', 'injection', 'limites'],
});

const exercises = [
  MT('d13-g1', 'guided', 'comprendre', c1, 'Offres', 'Associez chaque offre à son périmètre.', [['Azure SQL Databases', 'SQL Database, MI, Synapse dédié'], ['SQL sur machines', 'Azure, AWS, GCP et site'], ['Cosmos DB', 'API NoSQL seulement'], ['Bases libres', 'PostgreSQL, MySQL, MariaDB']], 'Chaque offre a son périmètre.'),
  WF('d13-a1', 'autonomous', 'fonctionner', c1, 'Activer SQL sur machines', 'Ordonnez l\'activation de la protection de SQL sur machines.', ['Vérifier le rôle Owner et le compte de service sysadmin', 'Connecter la machine à Azure Arc', 'Autoriser le HTTPS 443 sortant vers arcdataservices', 'Activer l\'offre', 'Vérifier les extensions'], [['Utiliser un proxy Azure Arc', 'Non pris en charge pour ce flux.']], 'Rôles, Arc, réseau, activation, extensions.'),
  Q('d13-q1a', 'quiz', 'securiser', c1, 'Cosmos DB et données', 'Defender for Cosmos DB lit-il les données du compte ?', ['Non.', 'Il n\'accède pas aux données.'], [['Oui.', 'Faux.'], ['Seulement en lecture seule.', 'Faux.'], ['Seulement les clés.', 'Faux.']], 'Non.'),
  Q('d13-q1b', 'quiz', 'fonctionner', c1, 'API prises en charge', 'Quelle API Cosmos DB est prise en charge ?', ['NoSQL.', 'Les autres ne le sont pas.'], [['MongoDB.', 'Non pris en charge.'], ['Cassandra.', 'Non pris en charge.'], ['Gremlin.', 'Non pris en charge.']], 'NoSQL.'),
  Q('d13-q1c', 'quiz', 'securiser', c1, 'Rôle SQL', 'Quel rôle gère les paramètres Defender for SQL côté Azure SQL ?', ['SQL Security Manager.', 'Ou admin de base ou de serveur.'], [['Reader.', 'Faux.'], ['Billing Reader.', 'Faux.'], ['Aucun.', 'Faux.']], 'SQL Security Manager.'),

  MT('d13-g2', 'guided', 'comprendre', c2, 'Traitement d\'un constat', 'Associez chaque situation à la décision.', [['Écart involontaire', 'Corriger'], ['Écart voulu et temporaire', 'Référence approuvée'], ['Contrôle non pertinent', 'Exemption']], 'Trois situations, trois décisions.'),
  IN('d13-a2', 'autonomous', 'securiser', c2, 'Registre de références', 'Registre fictif : repérez les défauts.', 'text', [['« Références approuvées en masse pour nettoyer le tableau. »', 'Une référence par règle, justifiée', 'Garder tel quel'], ['« Aucun audit activé. »', 'Activer l’audit pour l’enquête', 'Garder tel quel'], ['« Aucune échéance de revue. »', 'Fixer une revue', 'Garder tel quel']], 'Chaque défaut est corrigé.'),
  Q('d13-q2a', 'quiz', 'comprendre', c2, 'Mode recommandé', 'Quel mode d\'évaluation SQL est recommandé ?', ['Express.', 'Sans compte de stockage client.'], [['Classique.', 'Possible, non recommandé.'], ['Aucun.', 'Faux.'], ['Manuel.', 'Faux.']], 'Express.'),
  Q('d13-q2b', 'quiz', 'securiser', c2, 'Référence', 'Une référence (baseline) est définie :', ['Par règle et par ressource.', 'Documenté.'], [['Pour tout le locataire.', 'Faux.'], ['Pour un seul utilisateur.', 'Faux.'], ['Pour un seul port.', 'Faux.']], 'Par règle et ressource.'),
  Q('d13-q2c', 'quiz', 'verifier', c2, 'Rôle de l\'audit', 'Pourquoi activer l\'audit avec la protection avancée ?', ['Pour une enquête complète.', 'Écrit les événements de base.'], [['Pour réduire les coûts.', 'Faux.'], ['Pour désactiver les alertes.', 'Faux.'], ['Pour chiffrer.', 'Faux.']], 'Enquête complète.'),

  MT('d13-g3', 'guided', 'comprendre', c3, 'Alertes Cosmos', 'Associez chaque alerte à sa lecture.', [['Extraction de clés suspecte', 'Impact potentiellement élevé, contrôle complet'], ['Injection avec exfiltration', 'Peut avoir réussi'], ['Fuzzing échoué', 'Sondage de l\'application']], 'Chaque alerte a sa lecture.'),
  CF('d13-a3', 'autonomous', 'securiser', c3, 'Réponse à une injection', 'Paramétrez la réponse à une alerte d\'injection.', [['Passer aux requêtes paramétrées', 'on', 'Correction durable.'], ['Traiter comme un incident de base seulement', 'off', 'Le défaut est dans l\'application.'], ['Surveiller les alertes suivantes', 'on', 'Une variante peut réussir.']], 'On corrige l\'application et on surveille.'),
  Q('d13-q3a', 'quiz', 'securiser', c3, 'Clés suspectes', 'Que faire si l\'extraction de clés est douteuse ?', ['Régénérer les clés dans l\'ordre prévu et migrer vers l\'identité managée.', 'Planifier la mise à jour des applications.'], [['Ignorer.', 'Dangereux.'], ['Supprimer le compte.', 'Excessif.'], ['Désactiver l\'alerte.', 'Faux.']], 'Régénérer avec plan.'),
  Q('d13-q3b', 'quiz', 'verifier', c3, 'Bases libres sur GCP', 'Les bases libres sont-elles prises en charge sur GCP ?', ['Non, selon les notes consultées.', 'À revérifier à la date de mise en œuvre.'], [['Oui.', 'Faux.'], ['Seulement MySQL.', 'Faux.'], ['Seulement le week-end.', 'Faux.']], 'Non.'),
  Q('d13-q3c', 'quiz', 'comprendre', c3, 'Fuzzing', 'Une tentative de fuzzing échouée est-elle sans importance ?', ['Non, un acteur sonde l\'application.', 'Signal à suivre.'], [['Oui.', 'Faux.'], ['Elle prouve la sécurité.', 'Faux.'], ['Elle supprime la base.', 'Faux.']], 'Non.'),

  Q('d13-ev1', 'eval', 'comprendre', c1, 'Facturation', 'Les quatre offres sont-elles facturées ensemble ?', ['Non, séparément.', 'Estimer chacune.'], [['Oui.', 'Faux.'], ['Gratuites.', 'Faux.'], ['Une seule.', 'Faux.']], 'Séparément.'),
  M('d13-ev2', 'eval', 'securiser', c2, 'Alertes ATP', 'Cochez les menaces détectées par la protection avancée SQL.', [['Injection SQL potentielle.', 'Oui.'], ['Accès depuis un emplacement inhabituel.', 'Oui.'], ['Force brute sur les identifiants.', 'Oui.']], [['Mise à jour Windows manquante.', 'Faux.']], 'Trois menaces documentées.'),
  FX('d13-ev3', 'eval', 'securiser', c2, 'Corriger une référence', 'Corrigez la fiche de référence fictive.', { decision: 'référence', duree: '', proprietaire: '', compensation: '' }, { decision: 'référence approuvée', duree: '90 jours', proprietaire: 'équipe applicative', compensation: 'pare-feu de serveur et audit' }, [['decision', 'référence approuvée', 'Nommer la décision.', 'securiser'], ['duree', '90 jours', 'Borner dans le temps.', 'maintenir'], ['proprietaire', 'équipe applicative', 'Nommer un propriétaire.', 'maintenir'], ['compensation', 'pare-feu de serveur et audit', 'Documenter la compensation.', 'securiser']], 'Décision, durée, propriétaire, compensation.'),
  OR('d13-ev4', 'eval', 'fonctionner', c2, 'Traiter un constat', 'Ordonnez le traitement d\'un constat SQL.', ['Lire le constat dans son contexte', 'Décider : corriger, référence ou exemption', 'Appliquer la décision', 'Documenter la justification', 'Vérifier à la prochaine analyse'], 'Lire, décider, appliquer, documenter, vérifier.'),
  CF('d13-ev5', 'eval', 'cout', c1, 'Coûts des bases', 'Paramétrez la stratégie de coûts.', [['Estimer chaque offre séparément', 'on', 'Facturation distincte.'], ['Activer partout sans inventaire', 'off', 'Coûts imprévus.'], ['Activer l\'audit avec un budget de stockage', 'on', 'L\'audit a un coût.']], 'Estimation par offre et budget d\'audit.'),
  WF('d13-ev6', 'eval', 'maintenir', c3, 'Revue des clés', 'Ordonnez la gestion d\'une alerte de clés.', ['Identifier le principal et l\'appelant', 'Confirmer la légitimité', 'Régénérer la clé secondaire et basculer', 'Régénérer la primaire', 'Migrer vers l\'identité managée'], [['Régénérer sans prévenir', 'Interruption.']], 'Identifier, confirmer, régénérer dans l\'ordre, migrer.'),
  SH('d13-ev7', 'eval', 'verifier', c1, 'Port sortant', 'Quel port de sortie SQL sur machines utilise-t-il vers arcdataservices ? (nombre)', ['443'], 'Le port 443.', 443),
  Q('d13-ev8', 'eval', 'comprendre', c1, 'Synapse', 'Quels pools Synapse sont couverts ?', ['Les pools SQL dédiés.', 'Pas serverless ni Spark.'], [['Serverless.', 'Non couverts.'], ['Spark.', 'Non couverts.'], ['Tous.', 'Faux.']], 'Dédiés seulement.'),

  IN('d13-cs1', 'case', 'verifier', c1, 'Cas : promesses de couverture chez Nordlys', 'Promesses fictives : repérez celles à corriger.', 'text', [['« Cosmos DB for MongoDB est protégé. »', 'Seule l’API NoSQL est prise en charge', 'Garder tel quel'], ['« Les bases libres sur GCP sont couvertes. »', 'Non pris en charge selon la matrice consultée', 'Garder tel quel']], 'Chaque promesse est corrigée.'),
  MT('d13-cs2', 'case', 'securiser', c3, 'Cas : alertes et réponses', 'Associez chaque alerte à la réponse.', [['Injection potentielle', 'Requêtes paramétrées'], ['Extraction de clés suspecte', 'Régénération planifiée'], ['Accès Tor', 'Restreindre le réseau']], 'Chaque alerte a sa réponse.'),
  WF('d13-cs3', 'case', 'securiser', c2, 'Cas : référence temporaire', 'Ordonnez l\'approbation d\'une référence temporaire.', ['Confirmer que l\'écart est voulu', 'Définir la compensation', 'Approuver la référence avec échéance', 'Planifier la revue', 'Mesurer à la prochaine analyse'], [['Approuver sans échéance', 'Risque masqué.']], 'Confirmer, compenser, approuver, planifier, mesurer.'),
  OP('d13-cs-open', 'case', 'verifier', c1, 'Cas : protection des bases de Nordlys', 'Rédigez la stratégie de protection des bases d\'une organisation fictive.', 'Une page : offres par moteur, limites, constats, alertes, coûts.', [['Les offres suivent les moteurs.', 'comprendre'], ['Les limites sont énoncées.', 'verifier'], ['Les décisions de constats sont justifiées.', 'securiser'], ['Les coûts sont estimés.', 'cout']], 'La stratégie relie moteurs, limites, décisions et coûts.'),

  Q('d13-rm1', 'remediation', 'comprendre', c1, 'Remédiation : Cosmos', 'Quelle API Cosmos est prise en charge ?', ['NoSQL.', 'Seule.'], [['MongoDB.', 'Non.'], ['Table.', 'Non.'], ['Gremlin.', 'Non.']], 'NoSQL.'),
  Q('d13-rm2', 'remediation', 'securiser', c2, 'Remédiation : constat', 'Un écart voulu et temporaire se traite par :', ['Une référence approuvée avec échéance.', 'Documentée.'], [['Une suppression.', 'Faux.'], ['Rien.', 'Faux.'], ['Une exemption permanente.', 'Non.']], 'Référence avec échéance.'),
  Q('d13-rm3', 'remediation', 'securiser', c3, 'Remédiation : injection', 'Quelle correction durable pour une injection ?', ['Les requêtes paramétrées.', 'Corriger l\'application.'], [['Supprimer la base.', 'Faux.'], ['Désactiver l\'alerte.', 'Faux.'], ['Changer de région.', 'Faux.']], 'Requêtes paramétrées.'),
];

const competencies = comps([
  ['Cadrer les offres de bases de données', 'Offres, moteurs, prérequis.', ['Je nomme les quatre offres.', 'Je ne transpose pas les fonctions.', 'Je connais les prérequis SQL sur machines.']],
  ['Traiter les constats SQL', 'Vulnérabilités, références, ATP.', ['Je distingue express et classique.', 'Je choisis corriger, référence ou exemption.', 'J’active l’audit.']],
  ['Répondre aux alertes Cosmos et bases libres', 'Alertes et réponses.', ['Je lis les alertes Cosmos.', 'Je corrige l’application.', 'Je note les limites de disponibilité.']],
]);

const projects = [
  P(1, 'débutant', 'Inventaire des bases par moteur', 'Dresser l\'inventaire des bases avec moteur, nuage et offre applicable.', 'Tableau base, moteur, offre, limite.', ['Lister les bases.', 'Associer les offres.', 'Noter les limites.'], ['Chaque base a une offre ou une limite.'], ['Moteurs non pris en charge.'], ['Ajouter les coûts.']),
  P(2, 'intermédiaire', 'Registre de décisions de constats SQL', 'Concevoir le registre de décisions pour les constats d\'évaluation.', 'Registre constat, décision, propriétaire, échéance.', ['Définir les champs.', 'Définir la revue.', 'Définir les indicateurs.'], ['Aucune référence sans échéance.'], ['Références en masse.'], ['Ajouter une requête Resource Graph.'],
    { connected: { accounts: 'Un abonnement Azure de test avec une base SQL de laboratoire.', permissions: 'SQL Security Manager sur le serveur de laboratoire seulement.', costs: 'L\'offre Azure SQL est payante : confirmer l\'essai ou le coût avant activation; l\'évaluation express n\'ajoute pas de frais selon la documentation consultée.', secrets: 'Aucun secret.', cleanup: 'Désactiver la protection et supprimer le serveur et la base de laboratoire.', limits: 'Base de laboratoire sans données réelles. Statut : non réalisée dans un laboratoire Microsoft réel.' } }),
  P(3, 'avancé', 'Plan de réponse aux alertes Cosmos DB', 'Concevoir la réponse aux alertes d\'injection et d\'extraction de clés.', 'Procédure de réponse et de rotation des clés.', ['Lister les alertes.', 'Définir les actions.', 'Planifier la rotation.', 'Définir les mesures préventives.'], ['Rotation sans interruption.'], ['Applications qui cassent.'], ['Migrer vers l\'identité managée.']),
];

export const d13 = assemble({ id: 'd13', level: 3, n: 13, title: 'Defender for Databases',
  summary: 'Quatre offres par moteur, prérequis de SQL sur machines, évaluation des vulnérabilités SQL et références, protection avancée, Cosmos DB et bases libres, et réponse applicative.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Protéger les bases de Nordlys Technologies',
  caseScenario: 'Vous cadrez la couverture par moteur, traitez des constats SQL et répondez à une alerte Cosmos DB. Données simulées.', caseMinutes: 50 });
