// Module 3 : Gouvernance, permissions et accès (niveau 1).
import { dsl, md } from './dsl.ts';

const { lesson, Q, M, MT, OR, CF, IN, WF, PL, SH, OP, comps, P, assemble } = dsl('d03');
const c1 = { comp: 'd03-c1', lesson: 'd03-l1', tags: ['roles', 'moindre-privilege', 'rbac-azure'] };
const c2 = { comp: 'd03-c2', lesson: 'd03-l2', tags: ['portails', 'rbac-unifie', 'etendues', 'multilocataire'] };
const c3 = { comp: 'd03-c3', lesson: 'd03-l3', tags: ['identites-provisionnement', 'diagnostic', 'connecteurs'] };

const l1 = lesson(1, {
  title: 'Rôles Azure et moindre privilège pour Defender for Cloud', minutes: 45,
  summary: 'Associer chaque tâche à un rôle minimal : lire, exempter, activer un plan, corriger.',
  objectives: ['Nommer ce que permettent Security Reader, Security Admin, Contributor et Owner dans Defender for Cloud.', 'Choisir le rôle minimal pour une tâche donnée et à la bonne étendue.', 'Expliquer pourquoi Owner est parfois exigé et ce que cela change à la revue d’accès.'],
  prerequisites: ['Module 2 : plans, licences et coûts', 'Notions d’Azure RBAC : rôle, attribution, étendue'],
  body: md(
    '## Quatre rôles qui reviennent partout',
    'Defender for Cloud s’appuie sur **Azure RBAC**. Quatre rôles couvrent l’essentiel des tâches. **Security Reader** lit les recommandations, les alertes, les politiques de sécurité et les états, sans rien modifier. **Security Admin** fait tout ce que fait Security Reader, plus la modification de la politique de sécurité, le rejet d’alertes et de recommandations, l’exemption de ressources et l’activation ou la configuration des plans. **Contributor** sur l’abonnement peut aussi activer des plans, rejeter des alertes et appliquer la correction rapide (Fix) d’une recommandation, parce que ces gestes modifient des ressources Azure. **Owner** cumule tout et reste le seul rôle qui garantit l’accès à **toutes** les capacités d’un plan.',
    '## Pourquoi Owner apparaît dans les prérequis',
    'Certaines capacités créent des attributions de rôle ou des identités. Par exemple, l’analyse sans agent des machines demande un Owner sur l’abonnement au moment d’activer le plan Defender CSPM : sans lui, le plan s’active mais le scanner ne s’active pas, et les chemins d’attaque s’affichent sans informations de vulnérabilités. Ce symptôme ressemble à une panne alors qu’il s’agit d’un prérequis de permission. Le principe pratique : **donnez Owner à l’activation, retirez-le ensuite** par une attribution éligible temporaire (Privileged Identity Management) quand votre organisation le permet.',
    '## Choisir le rôle minimal',
    'Pour **lire** un tableau de bord : Security Reader. Pour **voir la conformité aux politiques** : Reader, car Security Reader n’y a pas accès. Pour **exempter** une recommandation : Security Admin ou Owner. Pour **activer un plan** : Security Admin ou Owner. Pour **appliquer une correction** qui modifie des ressources : Contributor ou Owner sur le groupe de ressources ou l’abonnement, parce que l’action s’exécute avec vos droits. Une personne qui lit et priorise n’a donc jamais besoin d’écrire.',
    '## L’étendue compte autant que le rôle',
    'Une attribution se pose sur un groupe de gestion, un abonnement ou un groupe de ressources. Un rôle large sur un petit périmètre vaut mieux qu’un rôle étroit sur toute l’organisation quand la tâche est ponctuelle. Documentez pour chaque attribution : qui, quel rôle, quelle étendue, quelle raison, quelle date de revue.',
    '| Tâche | Rôle minimal | Remarque |',
    '| --- | --- | --- |',
    '| Lire alertes et recommandations | Security Reader | Lecture seule |',
    '| Voir la conformité des politiques | Reader | Security Reader n’y accède pas |',
    '| Exempter une recommandation | Security Admin | Ou Owner |',
    '| Activer un plan | Security Admin | Ou Owner, ou Contributor selon l’action |',
    '| Analyse sans agent (activation) | Owner | Sinon scanner non activé |',
    '```bash',
    '# Lecture seule : lister les attributions Owner héritées sur un abonnement (Azure CLI).',
    '# Prérequis : droit de lecture des attributions de rôle. Remplacer <id-abonnement>.',
    'az role assignment list --scope /subscriptions/<id-abonnement> --include-inherited \\',
    '  --query "[?roleDefinitionName==\'Owner\'].{qui:principalName, type:principalType, etendue:scope}" -o table',
    '```',
    '## Erreurs fréquentes',
    '- Donner Owner à toute l’équipe sécurité par commodité.',
    '- Croire que Security Reader suffit pour voir la conformité aux politiques.',
    '- Oublier de retirer Owner après une activation ponctuelle.',
  ),
  demo: { title: 'Trois demandes d’accès à traiter', body: md(
    'Demandes **fictives** :',
    '```text',
    'A. Une analyste veut lire les alertes de trois abonnements           -> Security Reader sur le groupe de gestion',
    'B. Un architecte doit activer le plan Stockage sur un abonnement      -> Security Admin sur cet abonnement',
    'C. L’équipe doit activer l’analyse sans agent de Defender CSPM        -> Owner temporaire (PIM) le temps de l’activation',
    '```',
    '**Lecture commentée.** Chaque demande reçoit un rôle, une étendue et une durée. L’analyste n’écrit rien, l’architecte n’a pas besoin d’Owner, et l’activation sans agent justifie un Owner limité dans le temps.',
    '**Ce que la démo ne prouve pas.** Aucun locataire n’a été configuré.') },
  revision: md('## Fiche : rôles', '- Security Reader lit. Security Admin gère politique, exemptions et plans.', '- Contributor active des plans et corrige, Owner donne tout.', '- Reader voit la conformité des politiques, Security Reader non.', '- Owner temporaire pour l’analyse sans agent, puis retrait.', '- Toute attribution : qui, rôle, étendue, raison, revue.'),
  links: ['permissions', 'assign-access', 'cspm-enable', 'exemptions', 'recos'], teaches: ['roles', 'moindre-privilege', 'rbac-azure'],
});

const l2 = lesson(2, {
  title: 'Deux portails, deux modèles d’accès : Azure RBAC, RBAC unifié et multilocataire', minutes: 50,
  summary: 'Comprendre que le portail Azure et le portail Defender n’utilisent pas les mêmes permissions et que les étendues cloud s’y ajoutent.',
  objectives: ['Distinguer Azure RBAC et le RBAC unifié du portail Defender.', 'Décrire les étendues cloud d’accès granulaire.', 'Choisir Azure Lighthouse ou la vue multilocataire selon le besoin.'],
  prerequisites: ['Leçon 1'],
  body: md(
    '## Un produit, deux systèmes de permissions',
    'Dans le portail **Azure**, l’accès repose sur Azure RBAC, attribué sur les abonnements. Dans le portail **Microsoft Defender**, l’accès aux expériences de sécurité repose sur les **rôles globaux Microsoft Entra** et sur le **RBAC unifié** de Defender, qui accorde des permissions par ensemble de données (par exemple « Core security settings » en gestion) et par **étendue cloud**. Les deux systèmes sont indépendants : une personne qui voit tout dans le portail Azure peut ne rien voir dans le portail Defender, et l’inverse. Quand les deux portails sont utilisés, il faut les **deux** jeux de permissions. C’est la cause numéro un de « je ne vois pas mes ressources ».',
    '## Les étendues cloud',
    'Le RBAC unifié permet de limiter un rôle à certains environnements cloud : abonnements Azure, comptes AWS, projets GCP. Une équipe responsable de l’environnement AWS d’une filiale ne verra alors que cet environnement dans l’inventaire et les alertes. Cet accès granulaire s’ajoute aux rôles Entra et se prépare tôt : les équipes, les environnements et les propriétaires doivent exister avant d’attribuer des droits.',
    '## Ce que le portail Defender ne fait pas encore',
    'Le tableau officiel de comparaison indique que plusieurs capacités restent au portail Azure : les classeurs, l’export de données, l’automatisation de flux, les correctifs rapides, la recherche de risques par l’explorateur de sécurité, les annotations de demandes de tirage, l’édition de la gouvernance et les recommandations personnalisées. À l’inverse, le niveau de sécurité fondé sur le risque, l’inventaire de toutes les ressources découvertes et plusieurs expériences d’exposition vivent dans le portail Defender. Lisez ce tableau à chaque revue, il évolue.',
    '## Locataires multiples',
    'Une organisation qui gère plusieurs locataires choisit entre deux mécanismes. **Azure Lighthouse** délègue l’accès à des abonnements d’un autre locataire et reste le mécanisme utilisé pour la posture. La **vue multilocataire** du portail Defender sert d’abord aux incidents et alertes. Le connecteur Defender for Cloud de Sentinel, lui, ne lit pas les abonnements d’autres locataires même avec Lighthouse. Notez ces limites avant de promettre une console unique.',
    '```text',
    'Fiche d’accès (exemple fictif)',
    'Équipe        : SOC filiale Nordlys-Est',
    'Portail Azure : Security Reader sur le groupe de gestion « nordlys-est »',
    'Portail Defender : rôle Entra Security Reader + RBAC unifié, étendue cloud « AWS filiale-est »',
    'Revue         : trimestrielle, propriétaire : responsable sécurité de la filiale',
    '```',
    '## Erreurs fréquentes',
    '- Configurer seulement le portail Azure et s’étonner de l’absence de données dans le portail Defender.',
    '- Croire qu’Azure Lighthouse donne une console unique pour tout.',
    '- Attribuer des rôles Entra globaux là où une étendue cloud suffirait.',
  ),
  demo: { title: 'Pourquoi l’analyste ne voit rien', body: md(
    'Diagnostic **fictif** :',
    '```text',
    'Constat   : l’analyste voit 40 abonnements dans le portail Azure et un inventaire vide dans le portail Defender',
    'Hypothèse : aucun rôle Entra ni permission de RBAC unifié pour le portail Defender',
    'Test      : lui attribuer une permission de lecture de la posture sur l’étendue cloud voulue',
    'Preuve    : l’inventaire affiche les ressources de l’étendue après actualisation',
    '```',
    '**Lecture commentée.** Les deux systèmes de permissions sont indépendants : la solution est dans le second.',
    '**Ce que la démo ne prouve pas.** Scénario inventé, aucun locataire réel.') },
  revision: md('## Fiche : deux modèles d’accès', '- Portail Azure : Azure RBAC. Portail Defender : rôles Entra et RBAC unifié.', '- Les deux sont indépendants : prévoir les deux.', '- Étendues cloud : abonnements, comptes AWS, projets GCP.', '- Lighthouse pour la posture multilocataire, vue multilocataire pour les incidents.', '- Relire le tableau de comparaison des portails à chaque revue.'),
  links: ['portal-defender', 'portal-compare', 'portal-faq', 'plan-mgmt', 'sentinel-connector'], teaches: ['portails', 'rbac-unifie', 'etendues', 'multilocataire'],
});

const l3 = lesson(3, {
  title: 'Identités de provisionnement, connecteurs et diagnostic des permissions', minutes: 50,
  summary: 'Comprendre quelles identités Defender for Cloud utilise pour déployer des composants et diagnostiquer un échec de permission.',
  objectives: ['Expliquer le rôle des identités managées et principaux de service de provisionnement.', 'Lister les permissions d’un connecteur AWS et GCP sans secret long.', 'Diagnostiquer une panne de permission avec une méthode ordonnée.'],
  prerequisites: ['Leçons 1 et 2'],
  body: md(
    '## Qui déploie quoi',
    'Quand vous activez un plan, Defender for Cloud déploie des composants (extensions, capteurs, politiques) avec ses propres identités : **identités managées** et **principaux de service** dotés de rôles au niveau de l’abonnement. Pour Defender for Containers, ces rôles incluent notamment Kubernetes Extension Contributor, Contributor, AKS Contributor et Log Analytics Contributor. Ce que **vous** pouvez faire dans l’interface n’est donc pas ce que **le service** peut faire en votre nom : si une identité de provisionnement perd un rôle, un déploiement échoue alors que votre propre accès est intact.',
    '## Connecteurs AWS et GCP : fédération, pas de secret',
    'Un connecteur **AWS** crée, par un modèle CloudFormation (ou Terraform), un rôle IAM que Defender for Cloud assume par fédération d’identité web avec Microsoft Entra : pas de clé d’accès longue durée. Le choix **Default access** ou **Least privilege access** détermine les permissions accordées. Pour un compte de gestion, un StackSet déploie les rôles aux comptes membres (l’erreur d’accès de confiance à AWS Organizations est classique). Un connecteur **GCP** utilise la fédération d’identité de charge de travail avec un pool, des fournisseurs, des comptes de service et leurs liaisons, et un script gcloud généré. L’utilisateur qui crée le connecteur a besoin du rôle **Contributor** sur l’abonnement Azure qui l’héberge. Quand vous activez un nouveau plan, il faut **ré-exécuter** le modèle CloudFormation ou le script gcloud pour accorder les permissions du plan.',
    '## Permissions particulières',
    'La gestion des droits d’infrastructure du cloud (CIEM) demande Security Admin sur l’étendue concernée et, à l’intégration, un rôle d’administrateur d’application Entra pour créer l’enregistrement d’application. Defender for SQL sur machines demande Owner sur l’abonnement et que le compte de service SQL soit sysadmin. Les connecteurs DevOps demandent des rôles dans la plateforme source (Project Collection Administrator pour Azure DevOps, Organization Owner pour GitHub, Group Owner pour GitLab).',
    '## Diagnostiquer dans l’ordre',
    'Face à un échec, procédez du plus simple au plus rare. **1.** Quel est le message exact et à quel état de la chaîne de cinq états se situe-t-il ? **2.** Qui exécute l’action : un humain ou une identité de service ? **3.** Quel rôle cette identité détient-elle, à quelle étendue ? **4.** Une politique Azure, un verrou ou une exclusion bloque-t-il ? **5.** Pour AWS et GCP, l’état de connectivité de l’environnement et la dernière exécution du modèle. Chaque hypothèse écartée se consigne. Ne donnez jamais Owner « pour voir si ça passe » en production.',
    '```text',
    'Diagnostic (exemple fictif)',
    'Symptôme    : connecteur AWS « Partially connected » après activation de Defender for Containers',
    'Hypothèse 1 : modèle CloudFormation non ré-exécuté pour le nouveau plan -> vérifier la date de la dernière pile',
    'Hypothèse 2 : région non supportée dans la sélection -> relire la liste des régions',
    'Preuve      : page Connectivity status du connecteur',
    '```',
    '## Erreurs fréquentes',
    '- Oublier de ré-exécuter le modèle ou le script après avoir activé un nouveau plan.',
    '- Utiliser un compte personnel comme identité du connecteur.',
    '- Corriger un échec de permission en élargissant les droits sans comprendre la cause.',
  ),
  demo: { title: 'Un déploiement qui échoue', body: md(
    'Cas **fictif** :',
    '```text',
    'Message   : « Provisioning failed » sur l’extension d’un cluster',
    'Étape 2   : l’action est faite par l’identité de service du plan, pas par vous',
    'Étape 3   : le rôle Kubernetes Extension Contributor a été retiré lors d’un nettoyage de rôles',
    'Correction: restaurer le rôle sur l’identité, puis relancer le déploiement',
    '```',
    '**Lecture commentée.** Le diagnostic remonte à l’identité et à son rôle, pas à l’utilisateur.',
    '**Ce que la démo ne prouve pas.** Scénario inventé.') },
  revision: md('## Fiche : identités et diagnostic', '- Les composants sont déployés par des identités de service dotées de rôles.', '- AWS et GCP : fédération, pas de secret long, ré-exécuter le modèle après un nouveau plan.', '- Contributor sur l’abonnement hôte pour créer un connecteur multicloud.', '- CIEM, SQL, DevOps : permissions particulières à lire par plan.', '- Diagnostiquer dans l’ordre et consigner chaque hypothèse.'),
  links: ['permissions', 'aws-auth', 'gcp-auth', 'troubleshoot-connectors', 'ciem'], teaches: ['identites-provisionnement', 'diagnostic', 'connecteurs'],
});

const exercises = [
  MT('d03-g1', 'guided', 'securiser', c1, 'Tâche et rôle', 'Associez chaque tâche au rôle minimal.', [['Lire les alertes et recommandations', 'Security Reader'], ['Exempter une recommandation', 'Security Admin'], ['Activer l’analyse sans agent de Defender CSPM', 'Owner']], 'Lecture, exemption et activation sans agent demandent respectivement Security Reader, Security Admin et Owner.'),
  PL('d03-a1', 'autonomous', 'securiser', c1, 'Répartir les tâches par rôle', 'Placez chaque tâche dans le rôle minimal qui la permet.', [['Security Reader'], ['Security Admin'], ['Owner']], [['Lire les recommandations', 0], ['Consulter les alertes', 0], ['Exempter une ressource', 1], ['Modifier la politique de sécurité', 1], ['Activer le scanner sans agent', 2], ['Garantir l’accès à toutes les capacités d’un plan', 2]], 'La lecture reste à Security Reader, la gestion de la politique à Security Admin et les prérequis larges à Owner.'),
  Q('d03-q1a', 'quiz', 'securiser', c1, 'Conformité des politiques', 'Quel rôle voit les données de conformité aux politiques ?', ['Reader.', 'Security Reader n’y accède pas.'], [['Security Reader.', 'Il ne voit pas ces données.'], ['Aucun rôle.', 'Faux.'], ['Seul Owner.', 'Reader suffit.']], 'Reader accède aux données de conformité aux politiques, Security Reader non.'),
  Q('d03-q1b', 'quiz', 'comprendre', c1, 'Scanner sans agent', 'Pourquoi le scanner sans agent reste-t-il inactif alors que Defender CSPM est « On » ?', ['L’activation a été faite sans le rôle Owner sur l’abonnement.', 'Prérequis de permission.'], [['Le plan est défectueux.', 'Non.'], ['Le scanner est payant à part.', 'Non.'], ['Il faut un redémarrage.', 'Non.']], 'Sans Owner à l’activation, le scanner ne s’active pas.'),
  Q('d03-q1c', 'quiz', 'maintenir', c1, 'Owner temporaire', 'Quelle pratique limite le risque d’un Owner nécessaire à l’activation ?', ['Une attribution éligible temporaire, puis retrait.', 'Principe du moindre privilège.'], [['Garder Owner en permanence.', 'Risque inutile.'], ['Partager un compte.', 'Mauvaise pratique.'], ['Ignorer la revue.', 'Non.']], 'On limite la durée de l’Owner.'),

  MT('d03-g2', 'guided', 'comprendre', c2, 'Portail et permissions', 'Associez chaque portail à son modèle d’accès.', [['Portail Azure', 'Azure RBAC'], ['Portail Defender', 'Rôles Entra et RBAC unifié'], ['Les deux utilisés ensemble', 'Les deux jeux de permissions']], 'Chaque portail a son modèle, et on cumule les deux si on utilise les deux.'),
  CF('d03-a2', 'autonomous', 'securiser', c2, 'Accès d’une équipe de filiale', 'Paramétrez l’accès d’une équipe qui doit voir uniquement son environnement AWS.', [['Rôle global Entra étendu à tout le locataire', 'off', 'Trop large.'], ['Étendue cloud limitée à l’environnement AWS de la filiale', 'on', 'Accès granulaire.'], ['Consigner propriétaire et date de revue', 'on', 'Une attribution sans revue dérive.']], 'On limite l’étendue cloud et on documente le propriétaire et la revue.'),
  Q('d03-q2a', 'quiz', 'comprendre', c2, 'Indépendance des portails', 'Un analyste voit les abonnements dans le portail Azure mais rien dans le portail Defender. Pourquoi ?', ['Les deux portails ont des modèles de permissions indépendants.', 'Il manque les permissions du portail Defender.'], [['Le portail Defender est en panne.', 'Peu probable.'], ['Les abonnements sont supprimés.', 'Non.'], ['Il manque un plan payant.', 'Non.']], 'Les permissions des deux portails sont indépendantes.'),
  Q('d03-q2b', 'quiz', 'fonctionner', c2, 'Posture multilocataire', 'Quel mécanisme sert à déléguer la posture d’un autre locataire ?', ['Azure Lighthouse.', 'Mécanisme de délégation pour la posture.'], [['La vue multilocataire seule.', 'Elle sert d’abord aux incidents.'], ['Un compte partagé.', 'Mauvaise pratique.'], ['Sentinel seul.', 'Il ne lit pas les autres locataires.']], 'Lighthouse reste le mécanisme de posture multilocataire.'),
  Q('d03-q2c', 'quiz', 'maintenir', c2, 'Relire la comparaison', 'Pourquoi relire le tableau de comparaison des portails à chaque revue ?', ['Des capacités arrivent dans le portail Defender au fil du temps.', 'Le tableau évolue.'], [['Il ne change jamais.', 'Faux.'], ['Il remplace la formation.', 'Non.'], ['Il gère les coûts.', 'Non.']], 'Le tableau change avec les mises à jour du produit.'),

  MT('d03-g3', 'guided', 'fonctionner', c3, 'Identité et fonction', 'Associez chaque identité à son usage.', [['Identité managée de provisionnement', 'Déployer des extensions'], ['Rôle IAM assumé par fédération', 'Lire un compte AWS sans secret'], ['Compte de service GCP avec liaisons', 'Lire un projet GCP']], 'Chaque identité de service porte une fonction précise.'),
  WF('d03-a3', 'autonomous', 'verifier', c3, 'Diagnostiquer un échec', 'Ordonnez le diagnostic d’un échec de déploiement.', ['Lire le message exact et situer l’état de la chaîne', 'Identifier qui exécute l’action', 'Lire le rôle et l’étendue de cette identité', 'Chercher une politique, un verrou ou une exclusion', 'Consigner chaque hypothèse écartée'], [['Donner Owner pour voir', 'Contournement dangereux.'], ['Redémarrer sans lire le message', 'Sans méthode.']], 'On lit le message, on identifie l’exécutant, on lit ses droits, on cherche un blocage et on consigne.'),
  Q('d03-q3a', 'quiz', 'securiser', c3, 'Secret long', 'Que fait un connecteur AWS de Defender for Cloud pour éviter un secret long ?', ['Il assume un rôle IAM par fédération d’identité web avec Entra.', 'Pas de clé longue durée.'], [['Il stocke une clé d’accès en clair.', 'Faux.'], ['Il utilise le compte root.', 'Jamais.'], ['Il copie un mot de passe.', 'Faux.']], 'La fédération évite un secret longue durée.'),
  Q('d03-q3b', 'quiz', 'fonctionner', c3, 'Nouveau plan et connecteur', 'Après l’activation d’un nouveau plan sur un connecteur AWS, que faut-il faire ?', ['Ré-exécuter le modèle CloudFormation ou Terraform.', 'Accorder les permissions du plan.'], [['Rien.', 'Les permissions manquent.'], ['Supprimer le compte.', 'Excessif.'], ['Changer de région.', 'Sans rapport.']], 'Les nouveaux plans demandent de ré-exécuter le déploiement des permissions.'),
  Q('d03-q3c', 'quiz', 'maintenir', c3, 'Rôle hôte', 'Quel rôle faut-il sur l’abonnement Azure pour créer un connecteur multicloud ?', ['Contributor.', 'Rôle documenté.'], [['Reader.', 'Insuffisant.'], ['Aucun.', 'Faux.'], ['Billing Reader.', 'Insuffisant.']], 'Contributor est requis sur l’abonnement hôte.'),

  Q('d03-ev1', 'eval', 'securiser', c1, 'Lecture seule', 'Quel rôle suffit pour lire les alertes ?', ['Security Reader.', 'Lecture seule.'], [['Owner.', 'Trop large.'], ['Contributor.', 'Trop large.'], ['Global Administrator.', 'Trop large.']], 'Security Reader suffit pour lire.'),
  M('d03-ev2', 'eval', 'securiser', c1, 'Gestes de Security Admin', 'Cochez les gestes que Security Admin permet.', [['Exempter une recommandation.', 'Oui.'], ['Modifier la politique de sécurité.', 'Oui.'], ['Activer un plan.', 'Oui.']], [['Supprimer l’abonnement.', 'Non.'], ['Gérer la facturation.', 'Non.']], 'Security Admin gère exemptions, politique et plans.'),
  CF('d03-ev3', 'eval', 'securiser', c2, 'Accès granulaire', 'Paramétrez l’accès du SOC d’une filiale.', [['Security Reader sur le groupe de gestion de la filiale', 'on', 'Lecture sur le bon périmètre.'], ['Owner sur tous les abonnements', 'off', 'Excessif.'], ['Revue trimestrielle', 'on', 'Contrôle périodique.']], 'Lecture ciblée avec revue.'),
  OR('d03-ev4', 'eval', 'verifier', c3, 'Diagnostic d’accès', 'Ordonnez les hypothèses du plus simple au plus rare.', ['Rôle manquant sur l’utilisateur', 'Rôle manquant sur l’identité de service', 'Politique ou verrou bloquant', 'Modèle du connecteur obsolète', 'Défaut du service'], 'On élimine d’abord les causes simples et fréquentes.'),
  MT('d03-ev5', 'eval', 'comprendre', c2, 'Outil et portail', 'Associez chaque capacité au portail où elle vit aujourd’hui d’après le tableau officiel.', [['Niveau de sécurité fondé sur le risque', 'Portail Defender'], ['Classeurs', 'Portail Azure'], ['Automatisation de flux', 'Portail Azure']], 'Les classeurs et l’automatisation restent côté Azure, le niveau fondé sur le risque côté Defender.'),
  WF('d03-ev6', 'eval', 'maintenir', c3, 'Cycle d’une attribution', 'Ordonnez la vie d’une attribution Owner temporaire.', ['Justifier le besoin', 'Attribuer en mode éligible avec durée', 'Effectuer l’activation', 'Retirer ou laisser expirer', 'Consigner la preuve'], [['Garder permanent par habitude', 'Risque.']], 'Justifier, attribuer, activer, retirer, consigner.'),
  SH('d03-ev7', 'eval', 'comprendre', c1, 'Rôles de base', 'Combien de rôles de base ont été présentés dans la leçon 1 (Security Reader, Security Admin, Contributor, Owner) ? (nombre)', ['4'], 'Quatre rôles couvrent l’essentiel.', 4),
  CF('d03-ev8', 'eval', 'securiser', c3, 'Connecteur sans secret', 'Paramétrez un connecteur multicloud sûr.', [['Utiliser la fédération d’identité', 'on', 'Pas de secret long.'], ['Stocker une clé longue durée', 'off', 'À éviter.'], ['Ré-exécuter le modèle après un nouveau plan', 'on', 'Accorde les permissions.']], 'Fédération et ré-exécution du modèle.'),

  IN('d03-cs1', 'case', 'securiser', c1, 'Cas : demande d’accès chez Nordlys', 'Demande fictive : repérez ce qu’il faut corriger.', 'text', [['« Donnez Owner à toute l’équipe sécurité. »', 'Attribuer Security Reader ou Security Admin selon la tâche', 'Garder tel quel'], ['« Owner permanent pour l’activation sans agent. »', 'Owner éligible temporaire puis retrait', 'Garder tel quel'], ['« Aucune revue nécessaire. »', 'Prévoir une revue périodique', 'Garder tel quel']], 'Chaque demande est ramenée au moindre privilège.'),
  MT('d03-cs2', 'case', 'fonctionner', c2, 'Cas : deux portails', 'Associez chaque symptôme à sa cause probable.', [['Abonnements visibles dans Azure, inventaire vide dans Defender', 'Permissions du portail Defender manquantes'], ['Classeur introuvable dans le portail Defender', 'Capacité restée au portail Azure'], ['Console unique multilocataire attendue', 'Limite de Lighthouse et du connecteur Sentinel']], 'Les symptômes se rattachent aux modèles d’accès et aux limites documentées.'),
  WF('d03-cs3', 'case', 'verifier', c3, 'Cas : connecteur partiellement connecté', 'Ordonnez les contrôles pour un connecteur AWS partiellement connecté.', ['Lire l’état de connectivité', 'Vérifier la région et le compte', 'Vérifier la date de la dernière exécution du modèle', 'Ré-exécuter si un plan a été ajouté', 'Contrôler l’état de nouveau'], [['Recréer le compte AWS', 'Disproportionné.']], 'On lit l’état, on vérifie la région, on contrôle le modèle, on ré-exécute et on revérifie.'),
  OP('d03-cs-open', 'case', 'securiser', c2, 'Cas : modèle d’accès de Nordlys', 'Rédigez le modèle d’accès de Defender for Cloud pour une organisation fictive à deux filiales.', 'Une page : rôles par équipe, étendues, les deux portails, identités des connecteurs, revue et retrait des droits temporaires, limites multilocataires.', [['Les rôles sont minimaux et justifiés.', 'securiser'], ['Les deux portails sont couverts.', 'comprendre'], ['La revue et le retrait sont prévus.', 'maintenir'], ['Les limites sont explicites.', 'verifier']], 'Le modèle relie équipes, rôles, portails, identités et revue.'),

  Q('d03-rm1', 'remediation', 'securiser', c1, 'Remédiation : lecture', 'Quel rôle lit sans modifier ?', ['Security Reader.', 'Lecture seule.'], [['Owner.', 'Écrit.'], ['Contributor.', 'Écrit.'], ['Security Admin.', 'Écrit.']], 'Security Reader lit sans modifier.'),
  Q('d03-rm2', 'remediation', 'comprendre', c2, 'Remédiation : portails', 'Les permissions des deux portails sont-elles communes ?', ['Non, elles sont indépendantes.', 'Deux modèles.'], [['Oui.', 'Faux.'], ['Seulement le lundi.', 'Faux.'], ['Seulement pour Owner.', 'Faux.']], 'Elles sont indépendantes.'),
  Q('d03-rm3', 'remediation', 'maintenir', c3, 'Remédiation : nouveau plan', 'Que faire du modèle AWS après un nouveau plan ?', ['Le ré-exécuter.', 'Pour accorder les permissions.'], [['L’ignorer.', 'Permissions absentes.'], ['Supprimer le connecteur.', 'Excessif.'], ['Changer de cloud.', 'Absurde.']], 'On ré-exécute le modèle.'),
];

const competencies = comps([
  ['Appliquer le moindre privilège', 'Rôles, étendues et durée des droits.', ['Je choisis le rôle minimal pour une tâche.', 'Je choisis l’étendue adaptée.', 'Je prévois la revue et le retrait.']],
  ['Maîtriser les deux portails', 'Azure RBAC, RBAC unifié et multilocataire.', ['Je distingue les deux modèles d’accès.', 'Je conçois des étendues cloud.', 'Je connais les limites multilocataires.']],
  ['Diagnostiquer les permissions', 'Identités de service, connecteurs et méthode.', ['Je distingue utilisateur et identité de service.', 'Je diagnostique dans l’ordre.', 'Je consigne chaque hypothèse.']],
]);

const projects = [
  P(1, 'débutant', 'Matrice tâche, rôle, étendue', 'Construire une matrice de dix tâches avec rôle minimal et étendue.', 'Tableau tâche, rôle, étendue, durée.', ['Lister dix tâches.', 'Choisir le rôle.', 'Choisir l’étendue.'], ['Aucune tâche n’exige Owner permanent.'], ['Donner Owner par commodité.'], ['Ajouter la revue trimestrielle.']),
  P(2, 'intermédiaire', 'Modèle d’accès à deux portails', 'Décrire l’accès de trois équipes fictives dans les deux portails.', 'Tableau équipe, portail Azure, portail Defender.', ['Lister les équipes.', 'Attribuer les droits de chaque portail.', 'Vérifier les étendues cloud.'], ['Chaque équipe a ses deux jeux de permissions.'], ['Oublier le portail Defender.'], ['Ajouter une filiale multilocataire.'],
    { connected: { accounts: 'Un abonnement Azure de test et un locataire de test.', permissions: 'Reader pour lire les attributions ; aucune écriture.', costs: 'Aucun frais : lecture seule.', secrets: 'Aucun secret.', cleanup: 'Aucune ressource créée.', limits: 'La commande az role assignment list du cours est en lecture seule. Statut : non réalisée dans un laboratoire Microsoft réel.' } }),
  P(3, 'avancé', 'Procédure de diagnostic des permissions', 'Rédiger la procédure de diagnostic d’un échec de déploiement et d’un connecteur multicloud partiellement connecté.', 'Arbre de décision avec preuves.', ['Lister les symptômes.', 'Ordonner les hypothèses.', 'Définir les preuves.', 'Prévoir la correction et le retour arrière.'], ['Chaque hypothèse a une preuve et une action.'], ['Élargir les droits sans comprendre.'], ['Ajouter les cas CIEM et DevOps.']),
];

export const d03 = assemble({ id: 'd03', level: 1, n: 3, title: 'Gouvernance, permissions et accès',
  summary: 'Rôles Azure et moindre privilège, deux modèles d’accès (portail Azure et portail Defender), étendues cloud, multilocataire, identités de provisionnement et diagnostic des permissions.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Concevoir le modèle d’accès de Nordlys Technologies',
  caseScenario: 'Vous traitez des demandes d’accès, expliquez un inventaire vide et diagnostiquez un connecteur partiellement connecté. Données simulées.', caseMinutes: 45 });
