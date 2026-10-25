// Module 6 : Chemins d’attaque, exposition et exploration (niveau 2).
import { dsl, md } from './dsl.ts';

const { lesson, Q, M, MT, OR, CF, IN, WF, PL, SH, OP, comps, P, assemble } = dsl('d06');
const c1 = { comp: 'd06-c1', lesson: 'd06-l1', tags: ['chemin-attaque', 'graphe', 'prerequis', 'joignabilite'] };
const c2 = { comp: 'd06-c2', lesson: 'd06-l2', tags: ['lecture-chemin', 'points-etranglement', 'remediation', 'priorisation'] };
const c3 = { comp: 'd06-c3', lesson: 'd06-l3', tags: ['explorateur', 'exposition-internet', 'requetes-graphe'] };

const l1 = lesson(1, {
  title: 'Qu’est-ce qu’un chemin d’attaque et pourquoi la page peut être vide', minutes: 45,
  summary: 'Comprendre le graphe de sécurité du cloud, la logique entrée, mouvement latéral, cible, et les prérequis pour que des chemins apparaissent.',
  objectives: ['Définir un chemin d’attaque avec ses trois parties : entrée, mouvement latéral, cible.', 'Lister les prérequis de Defender CSPM, de l’analyse sans agent et des extensions de conteneurs.', 'Expliquer pourquoi une page vide ne prouve pas l’absence de risque.'],
  prerequisites: ['Module 5 : posture de sécurité du cloud'],
  body: md(
    '## Une série d’étapes réalistes',
    'Un **chemin d’attaque** est la série d’étapes qu’un attaquant pourrait suivre pour atteindre vos actifs. Il commence à un **point d’entrée externe**, par exemple une ressource vulnérable exposée à Internet. Il suit le **mouvement latéral** disponible dans l’environnement multicloud, par exemple une identité attachée à une machine qui détient des permissions sur d’autres ressources. Il se termine à une **cible critique**, par exemple une base de données contenant des données sensibles. La fonction ne dresse pas la liste de toutes les faiblesses : elle ne retient que les scénarios **externes, réalistes et exploitables**.',
    '## Le graphe de sécurité du cloud',
    'Defender for Cloud construit un **graphe de sécurité du cloud** qui relie les ressources, leurs configurations, leurs identités et leurs vulnérabilités, puis applique un algorithme propriétaire pour chercher les points d’entrée exploitables et les étapes suivantes. Le graphe est un instantané rafraîchi quotidiennement. La documentation précise que le système effectue aussi des **analyses actives de joignabilité** pour vérifier qu’une exposition est réellement accessible de l’extérieur, ce qui réduit les faux positifs. Chaque organisation voit des chemins qui lui sont propres.',
    '## Prérequis, souvent oubliés',
    'Les chemins d’attaque exigent le plan **Defender CSPM** et l’**analyse sans agent** activée. Pour les chemins liés aux conteneurs, activez l’extension de posture de conteneurs sans agent du plan Defender CSPM, ou le plan Defender for Containers avec ses capteurs. Pour activer l’analyse sans agent, l’**Owner** de l’abonnement est requis (module 3). Pour lire, un des rôles Security Reader, Security Admin, Reader, Contributor ou Owner suffit.',
    '## Pourquoi la page peut être vide',
    'Une page vide peut venir de trois causes. **Premier cas :** il n’existe réellement aucun chemin externe exploitable, ce qui est une bonne nouvelle. **Deuxième cas :** un prérequis manque (analyse sans agent inactive, extension de conteneurs fermée), et le graphe ne voit pas les informations nécessaires. **Troisième cas :** le graphe n’a pas encore été rafraîchi après l’activation. Un chemin résolu peut aussi prendre jusqu’à **24 heures** à disparaître de la liste. Concluez donc à l’absence de risque seulement après avoir vérifié les prérequis, jamais sur la seule vue de la page.',
    '| Partie | Rôle | Exemple |',
    '| --- | --- | --- |',
    '| Entrée | Début externe | VM exposée avec vulnérabilité exploitable |',
    '| Mouvement latéral | Rebond via identités ou réseau | Identité attachée avec lecture sur un stockage |',
    '| Cible | Actif critique | Base de données avec données sensibles |',
    '```text',
    'Exemple de chemin (fictif)',
    'VM web exposée (vulnérabilité exploitable) -> identité managée attachée -> lecture sur compte de stockage -> données sensibles',
    'Points de correction : corriger la vulnérabilité, retirer l’exposition ou réduire les permissions de l’identité',
    '```',
    '## Erreurs fréquentes',
    '- Conclure à l’absence de risque sur une page vide sans vérifier les prérequis.',
    '- Croire qu’un chemin d’attaque est une alerte de menace en cours : c’est un risque potentiel.',
    '- Mesurer la disparition d’un chemin dans l’heure qui suit la correction.',
  ),
  demo: { title: 'Expliquer une page vide', body: md(
    'Constat **fictif** : la page des chemins d’attaque est vide après l’activation de Defender CSPM.',
    '```text',
    'Question 1 : l’analyse sans agent est-elle active ? (activation faite par un Owner ?)   -> non : cause probable',
    'Question 2 : l’extension de posture des conteneurs est-elle ouverte ?                   -> non : chemins conteneurs absents',
    'Question 3 : le graphe a-t-il eu un cycle de rafraîchissement ?                         -> pas encore (activation hier)',
    '```',
    '**Lecture commentée.** Trois vérifications précèdent toute conclusion. La page vide est un symptôme, pas une preuve.',
    '**Ce que la démo ne prouve pas.** Scénario inventé.') },
  revision: md('## Fiche : chemins d’attaque', '- Entrée externe, mouvement latéral, cible critique.', '- Graphe de sécurité du cloud rafraîchi chaque jour, joignabilité vérifiée.', '- Prérequis : Defender CSPM, analyse sans agent, extensions de conteneurs.', '- Page vide : vérifier les prérequis avant de conclure.', '- Disparition d’un chemin résolu : jusqu’à 24 heures.'),
  links: ['attack-path-concept', 'attack-path', 'cspm-components', 'cspm-enable', 'risk'], teaches: ['chemin-attaque', 'graphe', 'prerequis', 'joignabilite'],
});

const l2 = lesson(2, {
  title: 'Lire un chemin, trouver les points d’étranglement et remédier', minutes: 50,
  summary: 'Naviguer dans les chemins d’attaque des deux portails, lire la carte, prioriser par risque et corriger le bon maillon.',
  objectives: ['Lire la carte d’un chemin : nœuds vulnérables, entrées, cibles, points d’étranglement.', 'Distinguer recommandations qui corrigent et recommandations additionnelles.', 'Choisir le maillon à corriger pour briser le plus de chemins.'],
  prerequisites: ['Leçon 1'],
  body: md(
    '## Deux emplacements',
    'Dans le portail **Azure**, les chemins se trouvent sous Defender for Cloud, Attack path analysis. Dans le portail **Defender**, ils sont une partie d’**Exposure Management** : Attack surface, Attack paths. Cette seconde expérience offre une vue d’ensemble (chemins dans le temps, cinq principaux points d’étranglement, cinq principaux scénarios, principales cibles et entrées), une liste filtrable (niveau de risque élevé, moyen ou faible, type d’actif, statut de remédiation, période) et un onglet de **points d’étranglement**. Par défaut, les chemins sont triés par niveau de risque, que le moteur de risque calcule à partir des facteurs de chaque ressource.',
    '## Lire la carte',
    'La carte d’un chemin met en évidence les **nœuds vulnérables** (ressources avec des problèmes de sécurité), les **points d’entrée** (accès externes où une attaque pourrait commencer), les **actifs cibles** (ressources critiques visées) et les **points d’étranglement** (nœuds où plusieurs chemins convergent). Survolez un nœud ou un lien pour voir comment le chemin est construit, puis ouvrez le nœud pour lire les détails. La fonction **rayon d’impact** (blast radius) d’un point d’étranglement montre ce que la compromission d’un actif pourrait toucher ensuite. Les chemins peuvent traverser des environnements : une VM cloud, une identité, puis un contrôleur de domaine sur place.',
    '## Choisir le maillon à corriger',
    'Un point d’étranglement vaut généralement mieux qu’un nœud isolé : une seule correction brise plusieurs chemins. Entre deux maillons d’un même chemin, préférez celui qui est le moins coûteux et le moins risqué à corriger, par exemple retirer une exposition réseau inutile avant de remanier une identité. Gardez une trace de la correction et de la date.',
    '## Deux types de recommandations',
    'L’onglet de remédiation d’un chemin regroupe les **recommandations** qui corrigent le chemin et les **recommandations additionnelles** qui réduisent le risque sans le corriger entièrement. Corriger une recommandation additionnelle n’éteint donc pas forcément le chemin. Après la correction, la liste peut mettre jusqu’à 24 heures à se mettre à jour. Le portail Defender suit en plus la progression de la remédiation et peut corréler les actions avec les incidents.',
    '```text',
    'Journal de remédiation (exemple fictif)',
    'Chemin       : VM web exposée -> identité -> stockage sensible',
    'Point d’étranglement : l’identité managée attachée à trois VM (trois chemins convergent)',
    'Action       : retirer le rôle de lecture sur le stockage, remplacer par un rôle limité au conteneur utile',
    'Vérification : chemin disparu après 24 heures ; preuve : capture et identifiant du chemin',
    '```',
    '## Erreurs fréquentes',
    '- Corriger un nœud isolé alors qu’un point d’étranglement briserait plusieurs chemins.',
    '- Croire qu’une recommandation additionnelle suffit à éteindre le chemin.',
    '- Retirer des permissions sans vérifier l’usage légitime de l’identité.',
  ),
  demo: { title: 'Choisir le maillon', body: md(
    'Trois chemins **fictifs** partagent une même identité managée.',
    '```text',
    'Chemin A : VM-1 -> identité X -> stockage S1',
    'Chemin B : VM-2 -> identité X -> stockage S1',
    'Chemin C : VM-3 -> identité X -> base D1',
    'Point d’étranglement : identité X',
    '```',
    '**Lecture commentée.** Réduire les permissions de l’identité X brise les trois chemins. Corriger la vulnérabilité de VM-1 n’en brise qu’un.',
    '**Ce que la démo ne prouve pas.** Scénario inventé.') },
  revision: md('## Fiche : lire et corriger', '- Portail Azure : Attack path analysis. Portail Defender : Exposure Management.', '- Carte : nœuds vulnérables, entrées, cibles, points d’étranglement.', '- Rayon d’impact d’un point d’étranglement.', '- Recommandations qui corrigent et recommandations additionnelles.', '- Disparition jusqu’à 24 heures après correction.'),
  links: ['attack-path', 'attack-path-defender', 'risk', 'portal-compare', 'recos'], teaches: ['lecture-chemin', 'points-etranglement', 'remediation', 'priorisation'],
});

const l3 = lesson(3, {
  title: 'Explorateur de sécurité du cloud et analyse de l’exposition à Internet', minutes: 50,
  summary: 'Interroger le graphe pour chasser des risques et comprendre comment l’exposition à Internet est déterminée.',
  objectives: ['Utiliser les modèles de requête de l’explorateur et construire une requête personnalisée.', 'Expliquer comment l’exposition à Internet est déterminée (configuration et joignabilité).', 'Connaître la limite du portail Defender pour la chasse aux risques par l’explorateur.'],
  prerequisites: ['Leçons 1 et 2'],
  body: md(
    '## L’explorateur : interroger le graphe',
    'L’**explorateur de sécurité du cloud** interroge le graphe pour identifier proactivement des risques. On part d’un **modèle de requête** ou on construit une requête en choisissant un type de ressource, des conditions (vulnérabilités, secrets, exposition, permissions) et des relations. Exemples de modèles documentés : machine virtuelle avec un secret en clair capable de s’authentifier à une autre machine, à un compte de stockage ou à une base SQL. Les requêtes couvrent Azure, AWS et GCP. Comme les chemins, l’explorateur nécessite Defender CSPM et ses composants sans agent (et le plan Defender for Containers pour interroger la couche de données des conteneurs).',
    '## Limite à connaître',
    'Selon le tableau officiel de comparaison des portails, la **chasse aux risques avec l’explorateur** n’est pas disponible dans le portail Defender. Elle se fait dans le portail Azure. À l’inverse, les chemins d’attaque et la priorisation par risque sont accessibles dans le portail Defender. Ne promettez pas à une équipe qui travaille uniquement dans le portail Defender une fonction qui reste côté Azure.',
    '## Comment l’exposition à Internet est déterminée',
    'Defender for Cloud évalue l’**exposition à Internet** par deux analyses : la **configuration du plan de contrôle** (adresses IP publiques, répartiteurs de charge) et la **joignabilité réseau** (routage, règles de sécurité et de pare-feu). Une machine sans adresse publique peut tout de même être exposée derrière un répartiteur de charge. Les ressources évaluées incluent machines virtuelles, groupes de machines virtuelles, bases de données (Azure SQL, PostgreSQL, MySQL, Cosmos DB, Synapse, RDS, bases GCP), stockage (Azure, S3, GCS), services d’IA, conteneurs (AKS, EKS, GKE) et opérations API Management. Les composants réseau évalués incluent passerelles d’application, répartiteurs de charge, Azure Firewall, groupes de sécurité réseau et sous-réseaux, ainsi que les répartiteurs AWS et GCP.',
    '## Un usage discipliné de l’explorateur',
    'L’explorateur sert à poser des **questions précises** : quelles machines exposées détiennent un secret ? quels comptes de stockage accessibles de l’extérieur contiennent des données sensibles ? Chaque question utile mérite d’être documentée (modèle ou description de la requête, date, résultat, action) et rejouée périodiquement. Il ne remplace pas la détection de menaces en cours, qui relève des plans de charge de travail.',
    '```text',
    'Requête de chasse (description, fictive)',
    'Ressources    : machines virtuelles Azure, AWS EC2, GCP',
    'Conditions    : exposées à Internet ET secret en clair détecté',
    'Relation      : le secret peut s’authentifier à une base SQL',
    'Action        : retirer le secret, faire pivoter la clé, restreindre l’exposition',
    '```',
    '## Erreurs fréquentes',
    '- Croire que l’explorateur détecte des attaques en cours : il détecte des risques.',
    '- Promettre l’explorateur dans le portail Defender.',
    '- Oublier qu’un secret trouvé doit être révoqué et remplacé, pas seulement retiré du disque.',
  ),
  demo: { title: 'Construire une requête de risque', body: md(
    'Question **fictive** : « Quelles machines exposées ont un secret qui ouvre l’accès au stockage ? »',
    '```text',
    '1. Type de ressource      : machine virtuelle (Azure, AWS, GCP)',
    '2. Condition 1            : exposée à Internet',
    '3. Condition 2            : contient un secret en clair',
    '4. Relation               : peut s’authentifier à un compte de stockage',
    '5. Résultat attendu       : liste de machines à traiter en priorité',
    '```',
    '**Lecture commentée.** Quatre éléments définissent la requête. Le résultat est une liste de risques, pas d’attaques.',
    '**Ce que la démo ne prouve pas.** Aucune requête n’a été exécutée dans le graphe d’un locataire.') },
  revision: md('## Fiche : explorateur et exposition', '- Explorateur : modèles et requêtes personnalisées sur le graphe.', '- Chasse aux risques par l’explorateur : portail Azure, pas portail Defender.', '- Exposition : configuration du plan de contrôle et joignabilité réseau.', '- Un secret trouvé se révoque et se remplace.', '- Documenter et rejouer les requêtes utiles.'),
  links: ['explorer', 'explorer-howto', 'internet-exposure', 'secrets-vm', 'portal-compare'], teaches: ['explorateur', 'exposition-internet', 'requetes-graphe'],
});

const exercises = [
  PL('d06-g1', 'guided', 'comprendre', c1, 'Parties d’un chemin', 'Placez chaque élément dans la partie du chemin à laquelle il appartient.', [['Entrée'], ['Mouvement latéral'], ['Cible']], [['Machine virtuelle exposée avec vulnérabilité exploitable', 0], ['Compte de stockage ouvert à Internet', 0], ['Identité managée avec permissions sur une autre ressource', 1], ['Rôle de lecture hérité', 1], ['Base de données avec données sensibles', 2], ['Coffre contenant des clés critiques', 2]], 'L’entrée est externe, le mouvement latéral passe par identités et réseau, la cible est un actif critique.'),
  WF('d06-a1', 'autonomous', 'verifier', c1, 'Page vide', 'Ordonnez la démarche devant une page de chemins d’attaque vide.', ['Vérifier le plan Defender CSPM', 'Vérifier l’analyse sans agent et son activation par un Owner', 'Vérifier l’extension de posture des conteneurs', 'Laisser un cycle de rafraîchissement', 'Conclure avec la preuve'], [['Conclure à l’absence de risque tout de suite', 'Prérequis non vérifiés.']], 'On vérifie les prérequis avant de conclure.'),
  Q('d06-q1a', 'quiz', 'comprendre', c1, 'Nature d’un chemin', 'Un chemin d’attaque est :', ['Un risque potentiel externe et exploitable.', 'Pas une attaque en cours.'], [['Une alerte d’attaque en cours.', 'Faux.'], ['Une liste de toutes les faiblesses.', 'Faux.'], ['Un plan de reprise.', 'Faux.']], 'Un chemin décrit un scénario potentiel.'),
  Q('d06-q1b', 'quiz', 'fonctionner', c1, 'Prérequis', 'Quels prérequis sont nécessaires aux chemins d’attaque ?', ['Defender CSPM et l’analyse sans agent.', 'Plus les extensions pour les conteneurs.'], [['Defender for DNS.', 'En retrait.'], ['Aucun.', 'Faux.'], ['Un agent sur chaque poste.', 'Faux.']], 'Defender CSPM et l’analyse sans agent.'),
  Q('d06-q1c', 'quiz', 'maintenir', c1, 'Délai après correction', 'Combien de temps un chemin résolu peut-il rester dans la liste ?', ['Jusqu’à 24 heures.', 'Documenté.'], [['Une minute.', 'Faux.'], ['Une semaine.', 'Faux.'], ['Il ne disparaît jamais.', 'Faux.']], 'Jusqu’à 24 heures.'),

  MT('d06-g2', 'guided', 'comprendre', c2, 'Éléments de la carte', 'Associez chaque élément de la carte à sa signification.', [['Point d’entrée', 'Début externe de l’attaque'], ['Cible', 'Actif critique visé'], ['Point d’étranglement', 'Nœud où plusieurs chemins convergent']], 'La carte met en évidence trois types de nœuds.'),
  IN('d06-a2', 'autonomous', 'securiser', c2, 'Relire un plan de correction', 'Plan fictif : repérez ce qu’il faut corriger.', 'text', [['« Corriger chaque VM une par une. »', 'Corriger d’abord l’identité partagée, point d’étranglement', 'Garder tel quel'], ['« Appliquer la recommandation additionnelle : le chemin disparaîtra. »', 'Elle réduit le risque sans forcément éteindre le chemin', 'Garder tel quel'], ['« Chemin disparu après 10 minutes : succès. »', 'Attendre jusqu’à 24 heures et conserver la preuve', 'Garder tel quel']], 'Chaque ligne est ramenée à la bonne logique.'),
  Q('d06-q2a', 'quiz', 'fonctionner', c2, 'Point d’étranglement', 'Pourquoi corriger un point d’étranglement ?', ['Une seule correction brise plusieurs chemins.', 'Plus rentable.'], [['Il coûte moins cher toujours.', 'Pas toujours.'], ['Il est plus récent.', 'Faux.'], ['Il supprime l’actif.', 'Faux.']], 'Un point d’étranglement concentre plusieurs chemins.'),
  Q('d06-q2b', 'quiz', 'securiser', c2, 'Recommandation additionnelle', 'Que fait une recommandation additionnelle ?', ['Elle réduit le risque sans nécessairement corriger le chemin.', 'Distinction documentée.'], [['Elle corrige toujours.', 'Faux.'], ['Elle supprime la ressource.', 'Faux.'], ['Elle désactive le plan.', 'Faux.']], 'Elle réduit le risque.'),
  Q('d06-q2c', 'quiz', 'comprendre', c2, 'Rayon d’impact', 'Que montre le rayon d’impact d’un point d’étranglement ?', ['Ce que la compromission d’un actif pourrait toucher ensuite.', 'Visualisation de propagation.'], [['Le coût du plan.', 'Faux.'], ['La date de création.', 'Faux.'], ['Les rôles Azure.', 'Faux.']], 'Il visualise la propagation.'),

  MT('d06-g3', 'guided', 'comprendre', c3, 'Exposition et analyse', 'Associez chaque analyse à ce qu’elle examine.', [['Configuration du plan de contrôle', 'Adresses IP publiques et répartiteurs de charge'], ['Joignabilité réseau', 'Routage et règles de pare-feu'], ['Explorateur', 'Questions posées au graphe']], 'L’exposition combine configuration et joignabilité, l’explorateur interroge le graphe.'),
  WF('d06-a3', 'autonomous', 'fonctionner', c3, 'Requête de risque', 'Ordonnez la construction d’une requête de risque.', ['Formuler la question', 'Choisir le type de ressource', 'Ajouter les conditions', 'Ajouter la relation', 'Documenter résultat et action'], [['Lancer sans question précise', 'Résultat inexploitable.']], 'On formule, on choisit, on conditionne, on relie et on documente.'),
  Q('d06-q3a', 'quiz', 'securiser', c3, 'Portail Defender', 'La chasse aux risques par l’explorateur est-elle disponible dans le portail Defender (selon la comparaison officielle) ?', ['Non, elle reste dans le portail Azure.', 'À vérifier à chaque revue.'], [['Oui.', 'Faux selon le tableau.'], ['Seulement pour AWS.', 'Faux.'], ['Seulement pour GCP.', 'Faux.']], 'Elle reste côté portail Azure.'),
  Q('d06-q3b', 'quiz', 'fonctionner', c3, 'Exposition derrière un répartiteur', 'Une VM sans IP publique peut-elle être exposée ?', ['Oui, par exemple derrière un répartiteur de charge.', 'La joignabilité est analysée.'], [['Non, jamais.', 'Faux.'], ['Seulement la nuit.', 'Faux.'], ['Seulement sous Linux.', 'Faux.']], 'L’analyse de joignabilité l’identifie.'),
  Q('d06-q3c', 'quiz', 'maintenir', c3, 'Secret découvert', 'Que faut-il faire d’un secret en clair trouvé sur une machine ?', ['Le révoquer, le remplacer et retirer l’exposition.', 'Le retirer du disque ne suffit pas.'], [['Rien.', 'Faux.'], ['Le copier ailleurs.', 'Faux.'], ['Le publier.', 'Faux.']], 'Un secret exposé doit être remplacé.'),

  Q('d06-ev1', 'eval', 'comprendre', c1, 'Définition', 'Que décrit un chemin d’attaque ?', ['Entrée externe, mouvement latéral, cible critique.', 'Trois parties.'], [['Une facture.', 'Faux.'], ['Un rôle.', 'Faux.'], ['Un plan.', 'Faux.']], 'Un chemin a trois parties.'),
  M('d06-ev2', 'eval', 'verifier', c1, 'Causes d’une page vide', 'Cochez les causes possibles d’une page de chemins vide.', [['Aucun chemin externe exploitable.', 'Possible.'], ['Analyse sans agent inactive.', 'Possible.'], ['Graphe pas encore rafraîchi.', 'Possible.']], [['Le portail est cassé toujours.', 'Faux.'], ['Les plans sont gratuits.', 'Sans rapport.']], 'Plusieurs causes, dont le manque de prérequis.'),
  OR('d06-ev3', 'eval', 'securiser', c2, 'Ordre de remédiation', 'Ordonnez la remédiation d’un chemin.', ['Lire la carte et les recommandations', 'Identifier le point d’étranglement', 'Corriger le maillon le moins risqué qui brise le plus de chemins', 'Attendre la mise à jour de la liste', 'Conserver la preuve'], 'On lit, on identifie, on corrige, on attend et on garde la preuve.'),
  CF('d06-ev4', 'eval', 'securiser', c2, 'Réduire les permissions d’une identité', 'Paramétrez la correction d’un point d’étranglement.', [['Remplacer le rôle large par un rôle limité au conteneur utile', 'on', 'Moindre privilège.'], ['Supprimer toutes les permissions sans analyse', 'off', 'Risque de panne.'], ['Vérifier l’usage légitime avant la correction', 'on', 'Évite de casser une application.']], 'On réduit sans casser l’usage légitime.'),
  MT('d06-ev5', 'eval', 'comprendre', c3, 'Ressources évaluées', 'Associez chaque ressource à sa famille.', [['Amazon S3', 'Stockage'], ['Amazon RDS', 'Base de données'], ['Azure Kubernetes Service', 'Conteneurs']], 'Ces ressources font partie des familles évaluées pour l’exposition.'),
  WF('d06-ev6', 'eval', 'maintenir', c3, 'Cycle de chasse', 'Ordonnez le cycle d’une question de chasse récurrente.', ['Documenter la question', 'Exécuter la requête', 'Traiter les résultats', 'Rejouer à date fixe', 'Mesurer la tendance'], [['Exécuter une fois et oublier', 'Pas de suivi.']], 'On documente, exécute, traite, rejoue et mesure.'),
  SH('d06-ev7', 'eval', 'comprendre', c1, 'Parties d’un chemin', 'Combien de parties compte un chemin d’attaque (entrée, mouvement latéral, cible) ? (nombre)', ['3'], 'Trois parties.', 3),
  Q('d06-ev8', 'eval', 'fonctionner', c3, 'Limite de portail', 'Où fait-on la chasse aux risques par l’explorateur ?', ['Dans le portail Azure.', 'Selon la comparaison officielle.'], [['Dans le portail Defender.', 'Non disponible.'], ['Dans Sentinel.', 'Non.'], ['Dans Intune.', 'Non.']], 'Dans le portail Azure.'),

  IN('d06-cs1', 'case', 'verifier', c1, 'Cas : revue des chemins chez Nordlys', 'Compte rendu fictif : repérez les affirmations insuffisantes.', 'text', [['« Aucun chemin : nous sommes sûrs. »', 'Vérifier les prérequis avant de conclure', 'Garder tel quel'], ['« Le chemin est une attaque en cours. »', 'C’est un risque potentiel, pas une alerte', 'Garder tel quel'], ['« Corrigé hier, toujours listé : échec. »', 'Attendre jusqu’à 24 heures', 'Garder tel quel']], 'Chaque affirmation est corrigée.'),
  MT('d06-cs2', 'case', 'securiser', c2, 'Cas : choix du maillon', 'Associez chaque situation à la meilleure action.', [['Trois chemins passent par une identité managée', 'Réduire les permissions de l’identité'], ['Une VM exposée sans besoin', 'Retirer l’exposition réseau'], ['Une vulnérabilité exploitable sur une seule VM', 'Corriger la vulnérabilité']], 'Chaque maillon a sa correction.'),
  WF('d06-cs3', 'case', 'fonctionner', c3, 'Cas : secret sur machine exposée', 'Ordonnez le traitement d’un secret trouvé sur une machine exposée.', ['Identifier la ressource dans l’inventaire', 'Lire les détails du secret', 'Révoquer et remplacer le secret', 'Retirer l’exposition inutile', 'Vérifier la disparition du risque'], [['Supprimer le fichier seulement', 'Le secret reste valide.']], 'On identifie, on lit, on révoque, on réduit l’exposition et on vérifie.'),
  OP('d06-cs-open', 'case', 'securiser', c2, 'Cas : programme de réduction des chemins', 'Rédigez le programme de réduction des chemins d’attaque d’une organisation fictive.', 'Une page : prérequis, lecture hebdomadaire, critères de priorisation, points d’étranglement ciblés, preuve de correction, revue.', [['Les prérequis sont vérifiés.', 'verifier'], ['La priorisation est fondée sur le risque et les points d’étranglement.', 'securiser'], ['La preuve de correction est prévue.', 'verifier'], ['La revue est planifiée.', 'maintenir']], 'Le programme relie prérequis, lecture, priorisation et preuve.'),

  Q('d06-rm1', 'remediation', 'comprendre', c1, 'Remédiation : entrée', 'Qu’est-ce qu’un point d’entrée ?', ['Le début externe de l’attaque.', 'Ressource exposée.'], [['La cible.', 'Faux.'], ['Un rôle.', 'Faux.'], ['Un plan.', 'Faux.']], 'Le début externe.'),
  Q('d06-rm2', 'remediation', 'securiser', c2, 'Remédiation : étranglement', 'Pourquoi cibler un point d’étranglement ?', ['Il fait converger plusieurs chemins.', 'Une correction, plusieurs chemins.'], [['Il est plus joli.', 'Faux.'], ['Il est gratuit.', 'Faux.'], ['Il est caché.', 'Faux.']], 'Il concentre plusieurs chemins.'),
  Q('d06-rm3', 'remediation', 'fonctionner', c3, 'Remédiation : exposition', 'Quelles deux analyses déterminent l’exposition à Internet ?', ['Configuration du plan de contrôle et joignabilité réseau.', 'Deux angles.'], [['Coût et région.', 'Faux.'], ['Rôles et plans.', 'Faux.'], ['Aucune.', 'Faux.']], 'Configuration et joignabilité.'),
];

const competencies = comps([
  ['Comprendre les chemins d’attaque', 'Définition, graphe, prérequis, page vide.', ['Je définis un chemin avec ses trois parties.', 'Je liste les prérequis.', 'Je ne conclus pas sur une page vide.']],
  ['Lire et corriger un chemin', 'Carte, points d’étranglement, recommandations.', ['Je lis la carte.', 'Je choisis le maillon à corriger.', 'Je distingue les deux types de recommandations.']],
  ['Explorer le graphe', 'Explorateur, exposition à Internet, limites de portail.', ['Je construis une requête de risque.', 'J’explique l’exposition à Internet.', 'Je connais la limite du portail Defender.']],
]);

const projects = [
  P(1, 'débutant', 'Lecture de trois chemins fictifs', 'Lire trois chemins et nommer entrée, mouvement latéral, cible et correction.', 'Tableau chemin, parties, correction.', ['Lire les chemins.', 'Nommer les parties.', 'Proposer une correction.'], ['Chaque chemin est décomposé.'], ['Confondre chemin et alerte.'], ['Ajouter le point d’étranglement.']),
  P(2, 'intermédiaire', 'Plan de réduction de chemins', 'Prioriser et planifier la correction de dix chemins fictifs avec points d’étranglement.', 'Plan de correction avec preuve.', ['Repérer les points d’étranglement.', 'Prioriser par risque.', 'Définir la preuve.', 'Planifier la revue.'], ['Les corrections visent les points d’étranglement.'], ['Corriger au cas par cas.'], ['Ajouter une mesure du nombre de chemins.'],
    { connected: { accounts: 'Un abonnement Azure de test avec Defender CSPM activé en essai (aucune charge réelle).', permissions: 'Security Reader pour lire ; Owner à l’activation de l’analyse sans agent (temporaire).', costs: 'Defender CSPM est payant : utiliser l’essai de 30 jours uniquement après accord sur les coûts, désactiver ensuite.', secrets: 'Aucun secret réel : n’utiliser que des ressources de test.', cleanup: 'Désactiver Defender CSPM, retirer l’attribution Owner temporaire, supprimer les ressources de test.', limits: 'Statut : non réalisée dans un laboratoire Microsoft réel. Le scénario de conteneur vulnérable de la documentation crée des ressources volontairement vulnérables : ne le déployer qu’en abonnement isolé.' } }),
  P(3, 'avancé', 'Programme de chasse aux risques', 'Concevoir un programme de cinq questions de chasse avec modèles de requête, fréquence et actions.', 'Catalogue de questions et journal.', ['Choisir cinq questions.', 'Décrire les requêtes.', 'Définir la fréquence.', 'Définir les actions.'], ['Chaque question est documentée et rejouable.'], ['Promettre l’explorateur dans le portail Defender.'], ['Ajouter AWS et GCP.']),
];

export const d06 = assemble({ id: 'd06', level: 2, n: 6, title: 'Chemins d’attaque, exposition et exploration',
  summary: 'Chemins d’attaque (entrée, mouvement latéral, cible), prérequis, lecture de la carte et remédiation, explorateur de sécurité du cloud et analyse de l’exposition à Internet.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Réduire les chemins d’attaque de Nordlys Technologies',
  caseScenario: 'Vous expliquez une page vide, choisissez le maillon à corriger et traitez un secret sur une machine exposée. Données simulées.', caseMinutes: 50 });
