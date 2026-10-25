// Module 14 : Applications, API et autres charges de travail (niveau 3).
import { dsl, md } from './dsl.ts';

const { lesson, Q, M, MT, OR, CF, IN, WF, FX, SH, OP, comps, P, assemble } = dsl('d14');
const c1 = { comp: 'd14-c1', lesson: 'd14-l1', tags: ['app-service', 'serverless', 'dns-orphelin', 'diagnostics'] };
const c2 = { comp: 'd14-c2', lesson: 'd14-l2', tags: ['apis', 'apim', 'forfait', 'integration'] };
const c3 = { comp: 'd14-c3', lesson: 'd14-l3', tags: ['key-vault', 'arm', 'dns', 'plans-deprecies'] };

const l1 = lesson(1, {
  title: 'App Service et protection serverless : ce que chaque plan voit', minutes: 50,
  summary: 'Distinguer Defender for App Service (menaces) de la protection serverless de Defender CSPM (posture), et enquêter avec les bons journaux.',
  objectives: ['Décrire ce que détecte Defender for App Service.', 'Distinguer menace (App Service) et posture (serverless dans CSPM).', 'Expliquer le rôle des paramètres de diagnostic dans l’enquête.'],
  prerequisites: ['Module 5 : CSPM', 'Module 4 : déploiement et couverture'],
  body: md(
    '## Deux plans, deux questions',
    '**Defender for App Service** répond à la question « quelqu’un attaque-t-il mon application maintenant ? ». Il est intégré nativement à App Service : aucun agent à déployer. Il surveille les applications Web et les API hébergées dans App Service, sur Windows et Linux, et alerte sur des activités comme des scanners de vulnérabilités ou d’outils d’attaque en phase de reconnaissance, un accès initial (par exemple une connexion FTP depuis une adresse malveillante) ou des tentatives d’exécution. Il est facturé selon le **nombre total d’instances de calcul** des plans App Service, tous niveaux confondus, et il est disponible seulement dans Azure (pas AWS ni GCP, pas Azure Government selon la matrice de prise en charge consultée).',
    'La **protection serverless**, elle, appartient à **Defender CSPM** et répond à « mes fonctions et applications sont-elles mal configurées, vulnérables ou dépendantes de composants risqués ? ». Elle évalue Web Apps, Functions et AWS Lambda sans agent, génère des recommandations et alimente l’inventaire et les chemins d’attaque. Pour l’obtenir, il faut activer le plan Defender CSPM **et** le composant de protection serverless; la facturation de ce composant est en vigueur depuis le 1er avril 2026 selon la documentation consultée, et d’anciennes recommandations non couvertes ont été retirées. Un plan ne remplace pas l’autre : l’un détecte l’attaque en cours, l’autre réduit la surface d’attaque.',
    '## Dangling DNS',
    'Le plan détecte aussi un risque classique de **prise de contrôle de sous-domaine** : lorsqu’un site App Service est décommissionné et que l’enregistrement DNS qui pointe vers lui n’est pas supprimé, un tiers pourrait revendiquer le nom. L’alerte se déclenche sur la désaffectation du site; elle **n’analyse pas** le registraire ni vos zones DNS. Un inventaire périodique des enregistrements CNAME vers `*.azurewebsites.net` reste une bonne pratique complémentaire.',
    '## Enquêter : activer les diagnostics',
    'Sans journaux, une alerte vous dit qu’il se passe quelque chose, pas quoi. Pour une enquête sérieuse, activez les **paramètres de diagnostic** de la ressource (trafic HTTP, événements d’application, activité de plateforme) vers un espace de travail Log Analytics ou un compte de stockage, en prévoyant le coût selon le volume. C’est un choix de coût délibéré, à documenter par application critique.',
    '## Ordre de grandeur et décisions',
    '| Question | Plan | Type de résultat |',
    '| --- | --- | --- |',
    '| Une attaque est-elle en cours sur l’application ? | Defender for App Service | Alerte |',
    '| L’application est-elle mal configurée ? | Defender CSPM (serverless) | Recommandation |',
    '| Qui a visité l’application ? | Diagnostics App Service | Journal |',
    '## Erreurs fréquentes',
    '- Croire que la protection serverless détecte les attaques en cours.',
    '- Activer App Service sans journaux de diagnostic puis ne pas pouvoir enquêter.',
    '- Oublier de supprimer les enregistrements DNS d’un site retiré.',
  ),
  demo: { title: 'Deux signaux sur la même application', body: md(
    'Application **fictive** `boutique-nordlys` :',
    '```text',
    'Defender for App Service : alerte, scanner de vulnérabilités connu depuis une IP externe',
    'Defender CSPM serverless  : recommandation, version de runtime obsolète',
    'Diagnostics              : journaux HTTP vers Log Analytics (30 jours)',
    '```',
    '**Lecture commentée.** L’alerte parle de l’attaque, la recommandation du terrain favorable, les journaux de la preuve.',
    '**Ce que la démo ne prouve pas.** Aucune application réelle.') },
  revision: md('## Fiche : App Service', '- App Service : menaces, sans agent, Azure seulement.', '- Serverless : posture, dans Defender CSPM, composant à activer.', '- Facturation App Service par instances de calcul.', '- Dangling DNS : alerte à la désaffectation.', '- Diagnostics pour enquêter (coût).'),
  links: ['app-service', 'app-service-enable', 'serverless', 'cspm-components', 'multicloud-matrix'], teaches: ['app-service', 'serverless', 'dns-orphelin', 'diagnostics'],
});

const l2 = lesson(2, {
  title: 'Defender for APIs : intégration en deux étapes et forfait de trafic', minutes: 50,
  summary: 'Activer le plan, intégrer les API d’API Management, choisir le forfait selon le trafic et interpréter les alertes.',
  objectives: ['Énoncer les deux étapes d’intégration.', 'Choisir un forfait à partir du trafic mesuré.', 'Citer les limites (REST seulement, passerelle auto-hébergée, espaces de travail).'],
  prerequisites: ['Leçon 1', 'Module 2 : coûts'],
  body: md(
    '## Deux étapes, pas une',
    'Defender for APIs protège les API publiées dans **Azure API Management** (APIM). L’intégration se fait en deux temps : (1) activer le plan au niveau de l’**abonnement**; (2) **intégrer chaque API** en corrigeant la recommandation « Azure API Management APIs should be onboarded to Defender for APIs ». Activer le plan seul ne protège aucune API. Pour intégrer, il faut le rôle **API Management Service Contributor** en plus des autorisations requises pour activer un plan Defender, et Contributor ou Owner sur la portée visée. Les premières informations de sécurité apparaissent environ 30 minutes après l’intégration, et les API intégrées peuvent prendre jusqu’à 50 minutes à figurer dans les recommandations.',
    '## Prudence sur la charge',
    'Intégrer une API augmente l’utilisation du calcul, de la mémoire et du réseau de l’instance APIM, et peut, dans les cas extrêmes, provoquer une interruption. Si l’instance est déjà très sollicitée, **intégrez progressivement**, surveillez la métrique de capacité et augmentez la taille au besoin. Ce n’est pas un détail : c’est le risque opérationnel principal de ce plan.',
    '## Forfait et facturation',
    'La facturation se fait par abonnement selon le **trafic d’API surveillé dans le mois**; chaque forfait a un seuil de requêtes inclus et des frais de dépassement. Par défaut, un abonnement est inscrit au premier forfait (un million d’appels inclus), ce qui peut générer des dépassements imprévus. La méthode documentée : dans APIM, ouvrir **Metrics**, portée du service, espace de noms des métriques standard, métrique **Requests**, agrégation **Sum**, sur les 30 derniers jours; additionner les instances de l’abonnement; choisir le forfait correspondant. Dans le portail Defender (préversion), le modèle consolidé remplace les forfaits P2 à P5 par un forfait unique : relisez la page de migration avant de comparer des prix.',
    '## Limites et recommandations',
    'Le plan découvre et analyse **les API REST seulement**; il n’intègre pas les API exposées par la **passerelle auto-hébergée** ni gérées dans les **espaces de travail** APIM; certaines détections par apprentissage machine ne sont pas prises en charge dans les régions secondaires d’un déploiement multirégion. Les recommandations couvrent par exemple les API non authentifiées (absence de clé d’abonnement ou de validation JWT, certificat client ou jeton Entra), les points de terminaison inutilisés depuis 30 jours, et des paramètres d’APIM (abonnement portant sur toutes les API, protocoles non chiffrés, secrets hors Key Vault).',
    '## Alertes',
    'Après une période d’apprentissage d’environ 30 jours pour établir une base de comparaison, le service alerte sur des pics de trafic, de la pulvérisation de requêtes, l’énumération de paramètres, des accès depuis des nœuds de sortie Tor ou des adresses suspectes. La majorité des alertes sont informatives : une absence d’alerte durant la période d’apprentissage ne prouve rien.',
    '```text',
    'Plan de déploiement (exemple fictif)',
    'Semaine 1 : activer le plan; mesurer le trafic sur 30 jours; choisir le forfait',
    'Semaine 2 : intégrer 3 API à faible trafic; surveiller la capacité APIM',
    'Semaine 3 : intégrer le reste par lots; revoir les recommandations',
    '```',
    '## Erreurs fréquentes',
    '- Croire que l’activation du plan protège toutes les API.',
    '- Intégrer toutes les API d’un coup sur une instance saturée.',
    '- Laisser le forfait par défaut sans mesurer le trafic.',
  ),
  demo: { title: 'Choisir un forfait', body: md(
    'Mesure **fictive** des 30 derniers jours :',
    '```text',
    'APIM-Nordlys-prod   : 3,2 millions de requêtes',
    'APIM-Nordlys-test   : 0,1 million',
    'Total abonnement    : 3,3 millions  -> dépasse le million inclus du forfait par défaut',
    '```',
    '**Lecture commentée.** Le forfait par défaut engendrerait des dépassements : on compare les forfaits avec le calculateur.',
    '**Ce que la démo ne prouve pas.** Aucun prix n’est cité; chiffres inventés.') },
  revision: md('## Fiche : APIs', '- Deux étapes : plan sur l’abonnement, puis intégration API par API.', '- Rôle APIM Service Contributor requis.', '- Intégrer progressivement; surveiller la capacité.', '- Forfait selon le trafic mesuré (Metrics, Requests, Sum).', '- REST seulement; pas de passerelle auto-hébergée ni d’espaces de travail.'),
  links: ['apis', 'apis-deploy', 'apis-prepare', 'apis-recos', 'apis-alerts', 'apim-defender'], teaches: ['apis', 'apim', 'forfait', 'integration'],
});

const l3 = lesson(3, {
  title: 'Key Vault, Resource Manager et DNS : lire un statut déprécié sans se tromper', minutes: 45,
  summary: 'Comprendre le statut des plans Key Vault, Resource Manager et DNS, leurs voies de migration et comment compenser la détection.',
  objectives: ['Énoncer le statut actuel de ces trois plans.', 'Expliquer ce que couvre chaque plan et sa voie de migration.', 'Éviter de présenter un plan déprécié comme disponible pour un nouveau déploiement.'],
  prerequisites: ['Leçons 1 et 2', 'Module 2 : plans et licences'],
  body: md(
    '## Un statut qui a changé',
    'Defender for **Key Vault**, Defender for **Resource Manager** (ARM) et Defender for **DNS** sont des plans de détection historiques. Depuis le **5 juillet 2026**, l’API d’activation des plans **bloque les nouveaux enrôlements** à cinq plans dépréciés : AKS, Azure Container Registry, Key Vault, DNS et Resource Manager. Les abonnements existants continuent de bénéficier du produit et de la facturation sans changement immédiat, et la documentation consultée précise qu’**aucune date de retrait n’est annoncée**. Les trajectoires de migration indiquées : AKS et ACR vers Defender for Containers; DNS vers Defender for Servers; Key Vault et Resource Manager vers un **modèle de tarification fixe**. Dans la matrice de prise en charge, les trois plans figurent encore comme disponibles dans Azure : la nuance entre « prise en charge pour l’existant » et « disponible pour un nouveau déploiement » doit toujours être écrite dans vos livrables.',
    '## Ce que chacun détecte',
    '**Key Vault** détecte les tentatives inhabituelles ou potentiellement nuisibles d’accès ou d’exploitation de coffres : accès depuis une adresse suspecte, énumération anormale de secrets, opérations par un principal inhabituel. **Resource Manager** analyse les opérations de gestion Azure (par exemple des outils d’attaque comme MicroBurst, la persistance par un compte inutilisé, des opérations de service anormales). **DNS** détecte des activités DNS anormales pour les ressources qui utilisent les résolveurs Azure par défaut; depuis le 1er août 2023, pour les **nouveaux** abonnements, ces alertes sont incluses dans **Defender for Servers P2**. Dans la gestion de plans du portail Defender, DNS n’est pas reporté automatiquement : on peut continuer sans protection DNS ou activer Servers P2 manuellement, avec des frais possibles.',
    '## Compenser sans se raconter d’histoires',
    'Pour un nouveau déploiement, ne comptez pas sur ces plans : appuyez la détection sur ce qui reste disponible. Journaux d’activité Azure et de diagnostic des coffres vers Log Analytics ou Sentinel; règles d’analyse sur les opérations sensibles; Azure Policy et recommandations de posture (purge protection, accès réseau privé, RBAC); Servers P2 pour la détection DNS. Documentez l’écart de détection par rapport à l’ancien plan.',
    '## Key Vault : changements d’API',
    'Indépendamment de Defender, le service Key Vault retire les versions d’API antérieures à 2026-02-01 le 27 février 2027 et prend RBAC comme modèle d’accès par défaut des nouveaux coffres : mettez à jour automatisations, SDK et IaC.',
    '```text',
    'Fiche de statut (exemple fictif)',
    'Plan : Key Vault   Statut : déprécié pour nouveaux enrôlements (2026-07-05); existant inchangé',
    'Voie : modèle de tarification fixe; vérifier à la date de mise en œuvre',
    'Compensation : journaux de diagnostic des coffres vers Log Analytics + règle d’analyse',
    '```',
    '## Erreurs fréquentes',
    '- Présenter ces plans comme choix pour un nouveau déploiement.',
    '- Supposer que « existant » signifie « éternel ».',
    '- Oublier de remplacer la détection DNS par Servers P2.',
  ),
  demo: { title: 'Lire un statut', body: md(
    'Revue **fictive** de trois abonnements :',
    '```text',
    'A (nouveau)   : Key Vault non activable par API -> compenser par journaux et règles',
    'B (existant)  : Key Vault actif, facturé -> conserver, noter la migration à planifier',
    'C (nouveau)   : besoin de détection DNS -> activer Servers P2 et le documenter',
    '```',
    '**Lecture commentée.** Même plan, trois situations, trois décisions.',
    '**Ce que la démo ne prouve pas.** Aucun abonnement réel.') },
  revision: md('## Fiche : plans dépréciés', '- 2026-07-05 : enrôlement par API bloqué pour AKS, ACR, Key Vault, DNS, ARM.', '- Existant inchangé; aucune date de retrait annoncée.', '- DNS inclus dans Servers P2 pour les nouveaux abonnements.', '- Key Vault et ARM : modèle de tarification fixe.', '- Compenser par journaux et règles.'),
  links: ['keyvault', 'arm', 'dns', 'plan-mgmt-changes', 'release-notes'], teaches: ['key-vault', 'arm', 'dns', 'plans-deprecies'],
});

const exercises = [
  MT('d14-g1', 'guided', 'comprendre', c1, 'Deux plans', 'Associez chaque question au plan.', [['Une attaque est-elle en cours ?', 'Defender for App Service'], ['L’application est-elle mal configurée ?', 'Protection serverless (CSPM)'], ['Qui a visité l’application ?', 'Diagnostics App Service']], 'Menace, posture et preuve sont trois sources distinctes.'),
  WF('d14-a1', 'autonomous', 'fonctionner', c1, 'Activer serverless', 'Ordonnez l\'activation de la protection serverless.', ['Activer le plan Defender CSPM', 'Activer le composant de protection serverless', 'Attendre la découverte', 'Lire les recommandations', 'Estimer la facturation'], [['Activer seulement App Service en croyant couvrir la posture', 'Ce plan détecte les menaces, pas la posture.']], 'CSPM, composant, découverte, lecture, coûts.'),
  Q('d14-q1a', 'quiz', 'comprendre', c1, 'Agent', 'Defender for App Service demande-t-il un agent ?', ['Non, intégration native.', 'Aucun déploiement.'], [['Oui, un agent par site.', 'Faux.'], ['Oui, une extension.', 'Faux.'], ['Un pare-feu dédié.', 'Faux.']], 'Natif.'),
  Q('d14-q1b', 'quiz', 'cout', c1, 'Facturation', 'Sur quoi App Service est-il facturé ?', ['Les instances de calcul des plans App Service.', 'Tous niveaux.'], [['Les requêtes HTTP.', 'Faux.'], ['Les domaines.', 'Faux.'], ['Les utilisateurs.', 'Faux.']], 'Instances de calcul.'),
  Q('d14-q1c', 'quiz', 'securiser', c1, 'Dangling DNS', 'Que détecte l\'alerte de DNS orphelin ?', ['Un site décommissionné dont l\'enregistrement DNS reste.', 'Risque de prise de contrôle.'], [['Un certificat expiré.', 'Faux.'], ['Un pic de trafic.', 'Faux.'], ['Un mot de passe faible.', 'Faux.']], 'Site retiré, DNS resté.'),

  MT('d14-g2', 'guided', 'comprendre', c2, 'Étapes APIs', 'Associez chaque étape à son niveau.', [['Activer le plan', 'Abonnement'], ['Intégrer une API', 'API dans APIM'], ['Choisir le forfait', 'Selon le trafic mesuré']], 'Plan, intégration, forfait.'),
  WF('d14-a2', 'autonomous', 'fonctionner', c2, 'Déploiement progressif', 'Ordonnez un déploiement prudent de Defender for APIs.', ['Mesurer le trafic sur 30 jours', 'Choisir le forfait', 'Activer le plan', 'Intégrer quelques API', 'Surveiller la capacité APIM', 'Intégrer le reste par lots'], [['Intégrer toutes les API d’un coup', 'Risque de saturation d’APIM.']], 'Mesurer, choisir, activer, intégrer par lots.'),
  Q('d14-q2a', 'quiz', 'securiser', c2, 'Après activation', 'Après l\'activation du plan, les API sont-elles protégées ?', ['Non, il faut les intégrer une par une.', 'Deuxième étape.'], [['Oui toutes.', 'Faux.'], ['Seulement les publiques.', 'Faux.'], ['Seulement les privées.', 'Faux.']], 'Non.'),
  Q('d14-q2b', 'quiz', 'comprendre', c2, 'Types d\'API', 'Quelles API sont analysées ?', ['Les API REST.', 'Limite documentée.'], [['SOAP.', 'Non.'], ['GraphQL.', 'Non.'], ['Toutes.', 'Faux.']], 'REST seulement.'),
  Q('d14-q2c', 'quiz', 'cout', c2, 'Forfait par défaut', 'Quel risque présente le forfait par défaut ?', ['Des dépassements si le trafic excède l\'inclus.', 'Mesurer d\'abord.'], [['Aucun.', 'Faux.'], ['Une panne d\'APIM.', 'Autre risque.'], ['Une perte de données.', 'Faux.']], 'Dépassements.'),

  MT('d14-g3', 'guided', 'comprendre', c3, 'Statuts', 'Associez chaque plan à sa voie documentée.', [['DNS', 'Defender for Servers P2'], ['Key Vault', 'Modèle de tarification fixe'], ['Resource Manager', 'Modèle de tarification fixe'], ['AKS et ACR', 'Defender for Containers']], 'Voies documentées.'),
  CF('d14-a3', 'autonomous', 'securiser', c3, 'Compensation', 'Paramétrez la compensation pour un nouveau déploiement.', [['Journaux de diagnostic des coffres vers Log Analytics', 'on', 'Base de la détection.'], ['Compter sur le plan Key Vault dépréciée', 'off', 'Non activable par API.'], ['Documenter l\'écart de détection', 'on', 'Évite l\'illusion de couverture.']], 'On compense et on documente.'),
  Q('d14-q3a', 'quiz', 'verifier', c3, 'Date du blocage', 'Quelle date marque le blocage des nouveaux enrôlements par API ?', ['2026-07-05.', 'Pour cinq plans.'], [['2023-08-01.', 'Date DNS.'], ['2027-02-27.', 'API Key Vault.'], ['2026-04-01.', 'Facturation serverless.']], '2026-07-05.'),
  Q('d14-q3b', 'quiz', 'maintenir', c3, 'Existant', 'Que devient un abonnement existant ?', ['Il continue, sans changement immédiat.', 'Aucune date de retrait annoncée.'], [['Il est désactivé.', 'Faux.'], ['Il est migré de force.', 'Faux.'], ['Il perd ses alertes.', 'Faux.']], 'Continue.'),
  Q('d14-q3c', 'quiz', 'securiser', c3, 'DNS nouveaux abonnements', 'Où sont les alertes DNS pour un nouvel abonnement ?', ['Dans Defender for Servers P2.', 'Depuis 2023.'], [['Dans CSPM gratuit.', 'Faux.'], ['Nulle part.', 'Faux.'], ['Dans Storage.', 'Faux.']], 'Servers P2.'),

  Q('d14-ev1', 'eval', 'comprendre', c1, 'Menace ou posture', 'La protection serverless détecte-t-elle une attaque en cours ?', ['Non, elle évalue la posture.', 'Détection = App Service.'], [['Oui.', 'Faux.'], ['Seulement les fonctions.', 'Faux.'], ['Seulement Lambda.', 'Faux.']], 'Non.'),
  M('d14-ev2', 'eval', 'securiser', c2, 'Limites APIs', 'Cochez les limites documentées de Defender for APIs.', [['REST seulement.', 'Oui.'], ['Pas de passerelle auto-hébergée.', 'Oui.'], ['Pas d\'espaces de travail APIM.', 'Oui.']], [['Toutes les API GraphQL sont analysées.', 'Faux.']], 'Trois limites.'),
  FX('d14-ev3', 'eval', 'cout', c2, 'Choisir le forfait', 'Complétez la fiche de forfait fictive.', { mesure: '', periode: '', total: '', decision: '' }, { mesure: 'Metrics, Requests, Sum', periode: '30 jours', total: 'somme des instances', decision: 'forfait selon le trafic' }, [['mesure', 'Metrics, Requests, Sum', 'Nommer la métrique.', 'verifier'], ['periode', '30 jours', 'Fixer la période.', 'verifier'], ['total', 'somme des instances', 'Additionner les instances de l’abonnement.', 'cout'], ['decision', 'forfait selon le trafic', 'Décider selon le trafic.', 'cout']], 'Métrique, période, total, décision.'),
  OR('d14-ev4', 'eval', 'fonctionner', c2, 'Intégrer une API', 'Ordonnez l\'intégration d\'une API.', ['Vérifier le rôle APIM Service Contributor', 'Ouvrir la recommandation d\'intégration', 'Sélectionner les API non saines', 'Corriger et suivre les notifications', 'Attendre les premiers constats'], 'Rôle, recommandation, sélection, correction, attente.'),
  CF('d14-ev5', 'eval', 'maintenir', c1, 'Diagnostics', 'Paramétrez les journaux d\'une application critique.', [['Activer les paramètres de diagnostic', 'on', 'Preuve pour l\'enquête.'], ['Ne rien journaliser pour économiser', 'off', 'Enquête impossible.'], ['Fixer une rétention', 'on', 'Coût maîtrisé.']], 'Journaliser avec rétention.'),
  WF('d14-ev6', 'eval', 'verifier', c3, 'Revue d\'un abonnement', 'Ordonnez la revue de statut d\'un abonnement.', ['Lister les plans activés', 'Relire le statut dans les notes de version', 'Noter existant ou nouveau', 'Décider conserver ou compenser', 'Documenter la date de vérification'], [['Supposer que le plan est disponible', 'Statut à vérifier.']], 'Lister, vérifier, classer, décider, dater.'),
  SH('d14-ev7', 'eval', 'verifier', c2, 'Inclus par défaut', 'Combien de millions d\'appels le forfait par défaut inclut-il ? (nombre)', ['1'], 'Un million.', 1),
  Q('d14-ev8', 'eval', 'comprendre', c3, 'Inclusion', 'Les alertes DNS d\'un nouvel abonnement sont :', ['Incluses dans Servers P2.', 'Depuis 2023-08-01.'], [['Dans un plan DNS autonome.', 'Non.'], ['Gratuites.', 'Faux.'], ['Inexistantes.', 'Faux.']], 'Dans Servers P2.'),

  IN('d14-cs1', 'case', 'verifier', c1, 'Cas : promesses chez Nordlys', 'Promesses fictives : repérez celles à corriger.', 'text', [['« Le plan serverless détecte les attaques sur nos Functions. »', 'Il évalue la posture; la détection relève d’App Service', 'Garder tel quel'], ['« Aucun journal nécessaire, Defender voit tout. »', 'Activer les diagnostics pour enquêter', 'Garder tel quel']], 'Chaque promesse est corrigée.'),
  MT('d14-cs2', 'case', 'securiser', c3, 'Cas : trois abonnements', 'Associez chaque abonnement à la décision.', [['Nouveau, besoin Key Vault', 'Compenser par journaux et règles'], ['Existant, Key Vault actif', 'Conserver et planifier la migration'], ['Nouveau, besoin DNS', 'Activer Servers P2']], 'Une décision par situation.'),
  WF('d14-cs3', 'case', 'fonctionner', c2, 'Cas : instance APIM saturée', 'Ordonnez la réaction à une instance APIM à forte utilisation.', ['Consulter la métrique de capacité', 'Augmenter la taille au besoin', 'Intégrer un petit lot', 'Surveiller', 'Poursuivre par lots'], [['Tout intégrer en une fois', 'Risque d\'interruption.']], 'Mesurer, ajuster, intégrer par lots.'),
  OP('d14-cs-open', 'case', 'verifier', c1, 'Cas : protection des applications de Nordlys', 'Rédigez la stratégie de protection applicative d\'une organisation fictive.', 'Une page : plans, limites, journaux, forfaits, statuts dépréciés.', [['Les plans suivent les questions menace et posture.', 'comprendre'], ['Les limites sont énoncées.', 'verifier'], ['Les journaux et coûts sont décidés.', 'cout'], ['Les statuts dépréciés sont traités.', 'maintenir']], 'La stratégie relie plans, limites, journaux et statuts.'),

  Q('d14-rm1', 'remediation', 'comprendre', c1, 'Remédiation : serverless', 'Où active-t-on la protection serverless ?', ['Dans Defender CSPM, composant dédié.', 'Posture.'], [['Dans App Service.', 'Non.'], ['Dans Storage.', 'Non.'], ['Dans DNS.', 'Non.']], 'Defender CSPM.'),
  Q('d14-rm2', 'remediation', 'securiser', c2, 'Remédiation : intégration', 'Après avoir activé Defender for APIs, que reste-t-il ?', ['Intégrer chaque API.', 'Recommandation d\'intégration.'], [['Rien.', 'Faux.'], ['Redémarrer APIM.', 'Faux.'], ['Désactiver le plan.', 'Faux.']], 'Intégrer les API.'),
  Q('d14-rm3', 'remediation', 'maintenir', c3, 'Remédiation : statut', 'Peut-on activer Key Vault par API pour un nouvel abonnement ?', ['Non, bloqué depuis 2026-07-05.', 'Compenser autrement.'], [['Oui.', 'Faux.'], ['Seulement le lundi.', 'Faux.'], ['Seulement en préversion.', 'Faux.']], 'Non.'),
];

const competencies = comps([
  ['Distinguer menace et posture applicative', 'App Service, serverless, diagnostics.', ['Je distingue les plans App Service et serverless.', 'J’active des journaux d’enquête.', 'Je traite le DNS orphelin.']],
  ['Déployer Defender for APIs', 'Intégration, forfait, limites.', ['Je décris les deux étapes.', 'Je choisis un forfait selon le trafic.', 'J’intègre progressivement.']],
  ['Lire les statuts de plans dépréciés', 'Key Vault, ARM, DNS.', ['Je cite la date et la portée du blocage.', 'Je distingue existant et nouveau.', 'Je documente la compensation.']],
]);

const projects = [
  P(1, 'débutant', 'Matrice menace et posture applicative', 'Dresser la matrice des applications avec plan de menace, posture et journaux.', 'Tableau application, plan, journal, coût.', ['Lister les applications.', 'Associer les plans.', 'Noter les journaux.'], ['Chaque application a une source de preuve.'], ['Journaux sans rétention.'], ['Ajouter les coûts.']),
  P(2, 'intermédiaire', 'Plan de déploiement de Defender for APIs', 'Concevoir un déploiement progressif avec choix du forfait.', 'Plan par lots avec indicateurs de capacité.', ['Mesurer le trafic.', 'Choisir le forfait.', 'Planifier les lots.'], ['Aucune saturation d\'APIM.'], ['Dépassements de forfait.'], ['Ajouter une alerte de capacité.'],
    { connected: { accounts: 'Un abonnement Azure de test avec une instance APIM de développement.', permissions: 'API Management Service Contributor sur l\'instance de test et Security Admin pour le plan.', costs: 'Le plan APIs est payant par abonnement selon le trafic : confirmer le forfait et le coût avant activation; instance APIM facturée à part.', secrets: 'Aucun secret.', cleanup: 'Désactiver le plan et supprimer l\'instance APIM de test.', limits: 'API REST de test sans données réelles. Statut : non réalisée dans un laboratoire Microsoft réel.' } }),
  P(3, 'avancé', 'Registre des plans dépréciés', 'Créer un registre de statuts avec date de vérification et compensation.', 'Registre plan, statut, source, compensation, revue.', ['Lister les plans.', 'Relire les statuts.', 'Définir la revue trimestrielle.'], ['Aucune promesse sur un plan non activable.'], ['Statut périmé.'], ['Automatiser un rappel.']),
];

export const d14 = assemble({ id: 'd14', level: 3, n: 14, title: 'Applications, API et autres charges de travail',
  summary: 'App Service et protection serverless, Defender for APIs avec intégration et forfait, et lecture des statuts des plans Key Vault, Resource Manager et DNS.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Protéger la plateforme applicative de Nordlys Technologies',
  caseScenario: 'Vous cadrez la protection applicative, planifiez Defender for APIs et traitez des statuts dépréciés. Données simulées.', caseMinutes: 50 });
