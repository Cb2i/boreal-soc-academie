// Module 8 : Recommandations et remédiation (niveau 2).
import { dsl, md } from './dsl.ts';

const { lesson, Q, M, MT, OR, CF, IN, WF, FX, SH, OP, comps, P, assemble } = dsl('d08');
const c1 = { comp: 'd08-c1', lesson: 'd08-l1', tags: ['recommandations', 'priorisation', 'remediation-sure'] };
const c2 = { comp: 'd08-c2', lesson: 'd08-l2', tags: ['gouvernance', 'proprietaire', 'echeance'] };
const c3 = { comp: 'd08-c3', lesson: 'd08-l3', tags: ['exemptions', 'mitigated', 'waiver', 'verification'] };

const l1 = lesson(1, {
  title: 'Lire, prioriser et corriger une recommandation sans casser la production', minutes: 50,
  summary: 'Utiliser l’onglet Take action, comprendre le bouton Fix et ses limites et appliquer un cycle de correction avec retour arrière.',
  objectives: ['Décrire les quatre actions de l’onglet Take action.', 'Prioriser par niveau de risque et par effet sur le niveau de sécurité.', 'Appliquer une correction avec test hors production et retour arrière.'],
  prerequisites: ['Module 5 : posture de sécurité du cloud', 'Module 6 : chemins d’attaque'],
  body: md(
    '## Ce que contient une recommandation',
    'Une recommandation de Defender for Cloud décrit un écart entre l’état d’une ressource et un standard, avec les ressources touchées, la gravité et les étapes de correction. Dans le portail Azure, **Recommendations**, puis l’onglet **Take action**, on trouve quatre leviers : **Remediate** (étapes manuelles, et pour certaines recommandations un bouton **Fix** avec **View remediation logic** pour lire la logique avant de l’appliquer), **Recommendation owner and set due date** (si une règle de gouvernance est activée), **Exempt** (exemption) et **Workflow automation** (application logique déclenchée par la recommandation). L’onglet **Graph** montre le contexte qui sert à la priorisation par risque, dont les chemins d’attaque.',
    '## Prioriser',
    'Par défaut, les recommandations sont ordonnées par **niveau de risque**. On y ajoute les contrôles du Microsoft cloud security benchmark qui influencent le niveau de sécurité. Avec le nouveau format de **recommandations individuelles**, la gouvernance s’applique au niveau de la découverte, et les recommandations marquées **Preview** n’affectent pas le niveau de sécurité basé sur le risque avant la disponibilité générale. Une priorisation raisonnable croise donc exposition, sensibilité des données, chemin d’attaque et effort, plutôt que le seul nombre de ressources.',
    '## Le bouton Fix et les scripts',
    'Le bouton **Fix** n’existe que pour certaines recommandations : sans lui, on suit les étapes manuelles. Il corrige plusieurs ressources à la fois, ce qui est un avantage et un risque : lisez la logique avant d’appliquer. Pour AWS et GCP, un **script de remédiation automatisé** (langage CLI) est généré, que l’on copie et exécute soi-même. Après la correction, la mise à jour de l’état peut prendre plusieurs minutes, et la réévaluation complète plus longtemps. Une intégration à **Security Copilot** (Summarize with Copilot, Fix with Copilot) existe, mais elle exige Security Copilot et des unités de calcul de sécurité ; elle ne remplace pas la revue humaine.',
    '## Cycle de correction sûr',
    'La documentation destinée aux petites organisations propose une séquence qu’on peut adopter telle quelle : consigner le paramètre initial et la méthode de retour arrière, appliquer le correctif hors production, tester l’application, le déploiement et l’accès administratif, puis passer par le processus de changement pour la production. Les permissions requises sont celles de l’opération sur la ressource : **Security Reader ne suffit pas** pour corriger. Une recommandation peut rester visible jusqu’à la réévaluation, il ne faut pas répéter une modification perturbatrice seulement parce que l’état n’a pas encore changé.',
    '| Étape | Preuve à conserver |',
    '| --- | --- |',
    '| Avant | Paramètre initial, rôle utilisé, méthode de retour arrière |',
    '| Pendant | Changement approuvé, fenêtre, portée exacte |',
    '| Après | Paramètre vérifié sur la ressource, état de la recommandation après réévaluation |',
    '```text',
    'Fiche de correction (exemple fictif)',
    'Recommandation : accès réseau public activé sur un compte de stockage',
    'Avant          : accès public activé ; retour arrière : réactiver la règle précédente',
    'Test           : application de test lit encore le compte via le point de terminaison privé',
    'Production     : changement CHG-1042, fenêtre de mardi soir',
    'Vérification   : paramètre confirmé sur la ressource ; recommandation revue après 24 heures',
    '```',
    '## Erreurs fréquentes',
    '- Appuyer sur Fix sur toute une liste sans lire la logique.',
    '- Conclure à l’échec parce que la recommandation n’a pas changé une heure après.',
    '- Donner Security Reader à l’équipe qui doit corriger.',
  ),
  demo: { title: 'Corriger un accès public', body: md(
    'Situation **fictive** : 6 comptes de stockage exposent un accès réseau public.',
    '```text',
    '1. Take action > Remediate : lire les étapes et View remediation logic',
    '2. Tester sur le compte de test : l’application utilise-t-elle encore le compte ?',
    '3. Consigner le paramètre initial et le retour arrière',
    '4. Appliquer par lots de 2 comptes via le changement approuvé',
    '5. Vérifier le paramètre sur la ressource, puis la recommandation après réévaluation',
    '```',
    '**Lecture commentée.** On avance par petits lots, avec preuve avant et après.',
    '**Ce que la démo ne prouve pas.** Scénario inventé; aucun correctif appliqué.') },
  revision: md('## Fiche : recommandations', '- Take action : Remediate, owner et échéance, Exempt, Workflow automation.', '- Fix n’existe que pour certaines recommandations : lire la logique.', '- Security Reader ne suffit pas pour corriger.', '- Avant, test hors production, retour arrière, vérification.', '- Preview : pas d’effet sur le niveau de sécurité basé sur le risque.'),
  links: ['recos', 'recos-review', 'recos-remediate', 'recos-copilot', 'recos-transition'], teaches: ['recommandations', 'priorisation', 'remediation-sure'],
});

const l2 = lesson(2, {
  title: 'Règles de gouvernance : propriétaires, échéances et suivi', minutes: 45,
  summary: 'Automatiser l’affectation de propriétaires et d’échéances, comprendre les priorités de règles, le délai de grâce et le rapport de gouvernance.',
  objectives: ['Configurer une règle de gouvernance (portée, priorité, condition, propriétaire, délai).', 'Expliquer l’ordre d’application des règles et le délai de grâce.', 'Lire le rapport de gouvernance.'],
  prerequisites: ['Leçon 1'],
  body: md(
    '## Pourquoi une règle',
    'Une recommandation sans propriétaire ni échéance reste ouverte indéfiniment. Les **règles de gouvernance** (Environment settings, Governance rules) affectent automatiquement un **propriétaire** et une **échéance** aux recommandations visées, avec suivi et notifications. Les recommandations apparaissent **On time** jusqu’à l’échéance, puis **Overdue**. Tant qu’une recommandation n’est pas en retard, elle n’affecte pas le niveau de sécurité, et un **délai de grâce** peut aussi être appliqué aux recommandations du MCSB.',
    '## Construire la règle',
    'On nomme la règle et on choisit sa **portée** : les règles à l’échelle d’un groupe de gestion (groupes de gestion Azure, comptes de gestion AWS, organisations GCP) s’appliquent avant celles d’une portée unique. On fixe une **priorité** de 1 (la plus haute) à 1000, et la règle de plus haute priorité affecte le propriétaire quand plusieurs règles visent la même recommandation. Les conditions peuvent cibler la **gravité**, le **niveau de risque**, la **catégorie de recommandation** (format individuel) ou des **recommandations précises**, intégrées ou personnalisées. Les exclusions ne se créent pas dans l’assistant du portail : il faut passer par l’API.',
    '## Propriétaire et délai',
    'Le propriétaire se définit **par étiquette de ressource** (la clé de l’étiquette contient le nom du propriétaire) ou par adresse courriel. Si aucun propriétaire n’est trouvé sur la ressource, le groupe de ressources ou l’abonnement, il s’affiche comme non spécifié. L’échéance se compte en **7, 14, 30 ou 90 jours** après le déclenchement de la règle. Par défaut, le propriétaire reçoit un courriel hebdomadaire des tâches à l’heure et en retard, et son gestionnaire reçoit la liste des retards si son adresse existe dans Microsoft Entra ID.',
    '## Appliquer à l’existant et mesurer',
    'À la création, on peut affecter un propriétaire aux recommandations existantes qui n’en ont pas ou **écraser** les affectations existantes : choisir sciemment. Supprimer ou désactiver une règle **ne retire pas** les affectations ni les notifications déjà créées. Le **rapport de gouvernance** (classeur) présente les recommandations par règle et par propriétaire : à temps, en retard ou non affectées, avec portée, priorité, délai, type de propriétaire, délai de grâce et nuage. Un propriétaire qui change l’échéance prévue doit fournir une justification, mais l’échéance officielle ne change pas.',
    '```text',
    'Règle fictive "Critique en 14 jours"',
    'Portée    : groupe de gestion racine   Priorité : 10',
    'Condition : niveau de risque critique ou élevé',
    'Propriétaire : étiquette "Equipe"      Échéance : 14 jours   Grâce : non',
    'Notifications : hebdomadaires, gestionnaire inclus',
    '```',
    '## Erreurs fréquentes',
    '- Écraser les affectations existantes sans prévenir les équipes.',
    '- Compter sur des étiquettes de propriétaire absentes (propriétaire non spécifié).',
    '- Croire qu’une règle supprimée retire les affectations.',
  ),
  demo: { title: 'Deux règles, un conflit', body: md(
    'Cas **fictif** : une règle d’abonnement (priorité 5, 30 jours) et une règle de groupe de gestion (priorité 50, 14 jours) visent la même recommandation.',
    '```text',
    'Ordre : les règles à la portée de gestion s’appliquent avant celles d’une portée unique',
    'Priorité : parmi les règles applicables, la plus haute priorité (le plus petit nombre) affecte',
    'À vérifier dans le rapport : l’échéance réellement affectée et le propriétaire',
    '```',
    '**Lecture commentée.** On ne devine pas : on vérifie l’affectation obtenue dans le rapport et on documente la règle gagnante.',
    '**Ce que la démo ne prouve pas.** Aucun test de règles réelles.') },
  revision: md('## Fiche : gouvernance', '- Règle : portée, priorité 1 à 1000, condition, propriétaire, délai 7/14/30/90 jours.', '- Portée de gestion appliquée avant la portée unique.', '- Propriétaire par étiquette ou courriel.', '- Supprimer une règle ne retire pas les affectations.', '- Rapport de gouvernance : à temps, en retard, non affecté.'),
  links: ['governance', 'recos-review', 'secure-score', 'workbooks', 'recos'], teaches: ['gouvernance', 'proprietaire', 'echeance'],
});

const l3 = lesson(3, {
  title: 'Exemptions : mitigated, waiver, expiration et vérification', minutes: 45,
  summary: 'Créer des exemptions justifiées et bornées, mesurer leur effet sur le niveau de sécurité et les revoir.',
  objectives: ['Distinguer mitigated et waiver et leur effet sur le niveau de sécurité.', 'Créer une exemption avec justification, expiration et portée.', 'Diagnostiquer une exemption sans effet.'],
  prerequisites: ['Leçons 1 et 2'],
  body: md(
    '## Quand exempter',
    'Une exemption sert quand une recommandation ne s’applique pas à une ressource, qu’elle est déjà couverte autrement, ou que l’organisation accepte le risque. Les **règles de désactivation** (disable rules) sont en retrait : on utilise les **exemptions**. On crée de préférence l’exemption depuis Defender for Cloud (Recommendations, Exempt, ou Environment settings, Exemptions pour le volume) : une exemption créée par l’API Azure Policy peut mal s’intégrer, par exemple en ne se propageant pas à toutes les initiatives concernées.',
    '## Deux catégories, deux effets',
    '**Mitigated** (résolu par un service tiers) : la ressource exemptée compte comme saine et le niveau de sécurité monte, sans points « gagnés » par une correction réelle. **Waiver** (risque accepté) : la ressource est exclue du calcul, l’effet est neutre, et elle peut encore apparaître dans les recommandations. Les recommandations en préversion n’influencent pas le niveau de sécurité, exemptées ou non. La catégorie doit refléter la réalité : déclarer « mitigated » un risque simplement accepté gonfle artificiellement le niveau de sécurité.',
    '## Bien documenter',
    'Chaque exemption précise la portée (groupe de gestion, abonnement ou ressources), la catégorie, une **description** qui nomme la compensation ou le risque accepté, un **propriétaire** et une **date d’expiration**. Une exemption sans échéance finit par masquer un risque pour toujours. À l’expiration, l’objet est conservé à titre de registre mais n’est plus honoré. Supprimer une exemption ramène les ressources à l’état non sain après réévaluation, ce qui peut faire baisser le niveau de sécurité.',
    '## Délais, limites, diagnostic',
    'Un effet peut prendre **jusqu’à 24 heures** (évaluation toutes les 12 à 24 heures). Les ressources exemptées apparaissent dans l’onglet **Not applicable**. Limite documentée : 5 000 exemptions de ressources par abonnement, au-delà de quoi la page peut devenir lente. Si l’état ne change pas après 24 heures : vérifier la portée, les permissions au niveau de la ressource, la catégorie, la bonne politique sous-jacente, la création depuis Defender for Cloud, les conflits d’initiatives, puis recréer l’exemption. Une requête Resource Graph sur `policyresources` permet de lister les exemptions existantes.',
    '```kusto',
    '// Lecture seule : exemptions d\'un abonnement (Resource Graph, portail Azure). Remplacer l\'identifiant.',
    'policyresources',
    '| where type == "microsoft.authorization/policyexemptions"',
    '| where subscriptionId == "<id-abonnement>"',
    '| project name, category = tostring(properties.exemptionCategory), expiresOn = tostring(properties.expiresOn), scope = tostring(properties.policyAssignmentId)',
    '```',
    '## Erreurs fréquentes',
    '- Utiliser mitigated pour un risque simplement accepté.',
    '- Créer une exemption sans date d’expiration ni propriétaire.',
    '- Supprimer une exemption sans prévoir la baisse du niveau de sécurité.',
  ),
  demo: { title: 'Accepter un risque temporairement', body: md(
    'Cas **fictif** : un compte de stockage hérité conserve un accès public jusqu’à sa migration prévue dans 60 jours.',
    '```text',
    'Catégorie   : Waiver (risque accepté), pas Mitigated',
    'Description : migration prévue, aucune donnée sensible, surveillance des accès activée',
    'Expiration  : dans 75 jours (marge de 15 jours après la migration)',
    'Propriétaire : équipe applicative (étiquette Equipe)',
    'Effet attendu : exclusion du calcul du niveau de sécurité, visible dans Not applicable après 24 heures',
    '```',
    '**Lecture commentée.** Le risque est accepté, daté et attribué.',
    '**Ce que la démo ne prouve pas.** Aucune exemption créée.') },
  revision: md('## Fiche : exemptions', '- Mitigated : sain, score monte. Waiver : exclu, neutre.', '- Toujours description, propriétaire, expiration.', '- Effet en 24 heures ; onglet Not applicable.', '- Créer depuis Defender for Cloud plutôt que par l’API.', '- Supprimer une exemption peut baisser le niveau de sécurité.'),
  links: ['exemptions', 'exempt-resource', 'exempt-scale', 'disable-to-exempt', 'policy-exemption', 'resource-graph'], teaches: ['exemptions', 'mitigated', 'waiver', 'verification'],
});

const exercises = [
  MT('d08-g1', 'guided', 'comprendre', c1, 'Take action', 'Associez chaque levier à son rôle.', [['Remediate', 'Étapes de correction ou Fix'], ['Recommendation owner', 'Propriétaire et échéance'], ['Exempt', 'Exclure une ressource ou une recommandation'], ['Workflow automation', 'Application logique déclenchée']], 'Chaque levier a un rôle distinct.'),
  WF('d08-a1', 'autonomous', 'securiser', c1, 'Correction sûre', 'Ordonnez une correction à effet potentiel sur la production.', ['Consigner le paramètre initial et le retour arrière', 'Appliquer en environnement hors production', 'Tester application et accès administratif', 'Appliquer en production via le changement approuvé', 'Vérifier la ressource puis la recommandation'], [['Appliquer Fix sur toute la liste', 'Aucun test ni retour arrière.']], 'On prépare, teste, applique par le changement et vérifie.'),
  Q('d08-q1a', 'quiz', 'securiser', c1, 'Permissions de correction', 'Security Reader suffit-il pour corriger une ressource ?', ['Non, il faut les permissions de l’opération sur la ressource.', 'Lecture seule.'], [['Oui.', 'Faux.'], ['Seulement pour AWS.', 'Faux.'], ['Seulement avec Fix.', 'Faux.']], 'Security Reader est un rôle de lecture.'),
  Q('d08-q1b', 'quiz', 'fonctionner', c1, 'Bouton Fix', 'Le bouton Fix existe-t-il pour toutes les recommandations ?', ['Non, seulement pour certaines.', 'Sinon étapes manuelles.'], [['Oui.', 'Faux.'], ['Seulement les critiques.', 'Faux.'], ['Seulement hors production.', 'Faux.']], 'Fix n’est pas universel.'),
  Q('d08-q1c', 'quiz', 'verifier', c1, 'État inchangé', 'Une recommandation reste visible une heure après la correction. Que faire ?', ['Vérifier le paramètre sur la ressource puis attendre la réévaluation.', 'Éviter de répéter un changement perturbateur.'], [['Répéter la modification.', 'Risqué.'], ['Exempter.', 'Hors sujet.'], ['Désactiver le plan.', 'Hors sujet.']], 'On vérifie la ressource et on attend.'),

  MT('d08-g2', 'guided', 'comprendre', c2, 'Éléments d’une règle', 'Associez chaque élément à sa valeur possible.', [['Priorité', '1 à 1000'], ['Délai', '7, 14, 30 ou 90 jours'], ['Propriétaire', 'Étiquette ou courriel'], ['Exclusions', 'API seulement']], 'Chaque élément a des valeurs précises.'),
  CF('d08-a2', 'autonomous', 'maintenir', c2, 'Règle de gouvernance', 'Paramétrez une règle pour les risques critiques.', [['Portée à l’échelle du groupe de gestion', 'on', 'Appliquée avant les portées uniques.'], ['Écraser les affectations existantes sans prévenir', 'off', 'Perturbe les équipes.'], ['Notifier aussi le gestionnaire', 'on', 'Escalade des retards.']], 'On vise large, sans écraser, avec escalade.'),
  Q('d08-q2a', 'quiz', 'comprendre', c2, 'Priorité', 'Quelle règle affecte le propriétaire quand plusieurs s’appliquent ?', ['Celle de plus haute priorité.', 'Priorité 1 la plus haute.'], [['La plus récente.', 'Faux.'], ['La plus lente.', 'Faux.'], ['Au hasard.', 'Faux.']], 'La plus haute priorité.'),
  Q('d08-q2b', 'quiz', 'maintenir', c2, 'Suppression de règle', 'Que devient une affectation après suppression de la règle ?', ['Elle reste.', 'Documenté.'], [['Elle disparaît.', 'Faux.'], ['Elle est dupliquée.', 'Faux.'], ['Elle devient une exemption.', 'Faux.']], 'Les affectations restent.'),
  Q('d08-q2c', 'quiz', 'verifier', c2, 'Retard', 'Une recommandation en retard affecte-t-elle le niveau de sécurité ?', ['Oui, tant qu’elle est en retard sans délai de grâce.', 'À temps : pas d’effet.'], [['Jamais.', 'Faux.'], ['Seulement en préversion.', 'Faux.'], ['Seulement sur AWS.', 'Faux.']], 'Le retard déclenche l’effet.'),

  MT('d08-g3', 'guided', 'comprendre', c3, 'Catégories d’exemption', 'Associez la catégorie à son effet.', [['Mitigated', 'Compte comme sain, le score monte'], ['Waiver', 'Exclu du calcul, effet neutre']], 'Les deux catégories ont des effets différents.'),
  IN('d08-a3', 'autonomous', 'securiser', c3, 'Relire des exemptions', 'Exemptions fictives : repérez les défauts.', 'text', [['« Mitigated : nous acceptons le risque. »', 'Utiliser Waiver pour un risque accepté', 'Garder tel quel'], ['« Aucune date d’expiration. »', 'Fixer une expiration', 'Garder tel quel'], ['« Description : OK. »', 'Décrire la compensation ou le risque et nommer le propriétaire', 'Garder tel quel']], 'Chaque défaut est corrigé.'),
  Q('d08-q3a', 'quiz', 'securiser', c3, 'Effet du waiver', 'Quel est l’effet d’un waiver sur le niveau de sécurité ?', ['Neutre : la ressource est exclue du calcul.', 'Documenté.'], [['Il monte.', 'C’est mitigated.'], ['Il baisse.', 'Faux.'], ['Il double.', 'Faux.']], 'Effet neutre.'),
  Q('d08-q3b', 'quiz', 'verifier', c3, 'Délai d’effet', 'Quel délai prévoir pour qu’une exemption prenne effet ?', ['Jusqu’à 24 heures.', 'Évaluation toutes les 12 à 24 heures.'], [['Instantané.', 'Faux.'], ['Une semaine.', 'Faux.'], ['Un mois.', 'Faux.']], 'Jusqu’à 24 heures.'),
  Q('d08-q3c', 'quiz', 'maintenir', c3, 'Suppression d’exemption', 'Que se passe-t-il quand on supprime une exemption ?', ['Les ressources non conformes redeviennent non saines après réévaluation.', 'Le niveau de sécurité peut baisser.'], [['Rien.', 'Faux.'], ['Elles sont corrigées.', 'Faux.'], ['Le plan est désactivé.', 'Faux.']], 'Retour à l’état non sain.'),

  Q('d08-ev1', 'eval', 'comprendre', c1, 'Quatre leviers', 'Combien de leviers principaux contient l’onglet Take action ?', ['Quatre : Remediate, propriétaire et échéance, Exempt, Workflow automation.', 'Documenté.'], [['Un.', 'Faux.'], ['Deux.', 'Faux.'], ['Dix.', 'Faux.']], 'Quatre leviers.'),
  M('d08-ev2', 'eval', 'maintenir', c2, 'Conditions d’une règle', 'Cochez les conditions de ciblage d’une règle de gouvernance.', [['Gravité.', 'Oui.'], ['Niveau de risque.', 'Oui.'], ['Catégorie de recommandation.', 'Oui.'], ['Recommandations précises.', 'Oui.']], [['Couleur du portail.', 'Faux.']], 'Quatre conditions documentées.'),
  FX('d08-ev3', 'eval', 'securiser', c3, 'Corriger une exemption', 'Corrigez l’exemption fictive.', { categorie: 'mitigated', expiration: '', description: 'ok', proprietaire: '' }, { categorie: 'waiver', expiration: '2027-01-15', description: 'migration prévue, surveillance active', proprietaire: 'équipe applicative' }, [['categorie', 'waiver', 'Un risque accepté est un waiver.', 'securiser'], ['expiration', '2027-01-15', 'Fixer une expiration.', 'maintenir'], ['description', 'migration prévue, surveillance active', 'Décrire la compensation.', 'verifier'], ['proprietaire', 'équipe applicative', 'Nommer le propriétaire.', 'maintenir']], 'Catégorie juste, expiration, description et propriétaire.'),
  OR('d08-ev4', 'eval', 'fonctionner', c2, 'Créer une règle', 'Ordonnez la création d’une règle de gouvernance.', ['Nommer la règle et choisir la portée', 'Fixer la priorité', 'Choisir la condition', 'Définir le propriétaire', 'Choisir le délai et les notifications'], 'Portée, priorité, condition, propriétaire, délai.'),
  CF('d08-ev5', 'eval', 'cout', c1, 'Copilot et coûts', 'Paramétrez l’usage de Copilot pour la remédiation.', [['Vérifier la capacité de calcul de sécurité disponible', 'on', 'Sans elle, la fonction est inutilisable.'], ['Exécuter les scripts proposés sans revue', 'off', 'Une revue humaine reste nécessaire.']], 'On vérifie la capacité et on relit tout script.'),
  WF('d08-ev6', 'eval', 'maintenir', c3, 'Revue d’exemptions', 'Ordonnez la revue trimestrielle d’exemptions.', ['Lister les exemptions et leurs échéances', 'Contacter les propriétaires', 'Renouveler ou lever', 'Documenter la décision', 'Mesurer l’effet sur le niveau de sécurité'], [['Tout renouveler automatiquement', 'Perpétue des risques.']], 'Liste, contact, décision, preuve, mesure.'),
  SH('d08-ev7', 'eval', 'verifier', c3, 'Délai maximal', 'Jusqu’à combien d’heures peut prendre l’effet d’une exemption ? (nombre)', ['24'], 'Jusqu’à vingt-quatre heures.', 24),
  Q('d08-ev8', 'eval', 'comprendre', c3, 'Désactivation', 'Que remplacent les exemptions ?', ['Les règles de désactivation, en retrait.', 'Transition documentée.'], [['Les plans.', 'Faux.'], ['Les standards.', 'Faux.'], ['Les connecteurs.', 'Faux.']], 'Les exemptions remplacent les disable rules.'),

  IN('d08-cs1', 'case', 'securiser', c3, 'Cas : exemptions chez Nordlys', 'Registre fictif : repérez les pratiques à corriger.', 'text', [['« Mitigated : risque accepté par la direction. »', 'Waiver, pas mitigated', 'Garder tel quel'], ['« Exemption permanente sans propriétaire. »', 'Ajouter expiration et propriétaire', 'Garder tel quel']], 'Chaque ligne est corrigée.'),
  MT('d08-cs2', 'case', 'maintenir', c2, 'Cas : règles de gouvernance', 'Associez chaque besoin à son réglage.', [['Responsables par équipe', 'Propriétaire par étiquette'], ['Escalade des retards', 'Notification au gestionnaire'], ['Règle valable partout', 'Portée groupe de gestion']], 'Chaque besoin a son réglage.'),
  WF('d08-cs3', 'case', 'securiser', c1, 'Cas : correction en production', 'Ordonnez la correction d’un accès public sur 6 comptes.', ['Inventorier les comptes et leurs dépendances', 'Tester sur un compte hors production', 'Consigner l’état initial', 'Appliquer par lots via le changement', 'Vérifier ressource puis recommandation'], [['Tout appliquer d’un coup', 'Risque d’interruption.']], 'Inventaire, test, état initial, lots, vérification.'),
  OP('d08-cs-open', 'case', 'maintenir', c2, 'Cas : programme de remédiation de Nordlys', 'Rédigez le programme de remédiation d’une organisation fictive.', 'Une page : priorisation, règles de gouvernance, correction sûre, exemptions, indicateurs.', [['La priorisation croise risque et effort.', 'comprendre'], ['La correction est sûre et vérifiable.', 'securiser'], ['La gouvernance fixe propriétaires et échéances.', 'maintenir'], ['Les exemptions sont bornées.', 'verifier']], 'Le programme relie priorisation, gouvernance, correction et exemptions.'),

  Q('d08-rm1', 'remediation', 'securiser', c1, 'Remédiation : Fix', 'Que faire avant d’appuyer sur Fix ?', ['Lire la logique de remédiation.', 'View remediation logic.'], [['Rien.', 'Faux.'], ['Désactiver le plan.', 'Faux.'], ['Exempter.', 'Faux.']], 'Lire la logique.'),
  Q('d08-rm2', 'remediation', 'maintenir', c2, 'Remédiation : règle', 'Quelle plage de priorité une règle accepte-t-elle ?', ['1 à 1000.', 'Documenté.'], [['1 à 5.', 'Faux.'], ['0 à 10.', 'Faux.'], ['Libre.', 'Faux.']], '1 à 1000.'),
  Q('d08-rm3', 'remediation', 'securiser', c3, 'Remédiation : catégorie', 'Quelle catégorie pour un risque accepté ?', ['Waiver.', 'Risque accepté.'], [['Mitigated.', 'Autre usage.'], ['Fix.', 'Faux.'], ['Aucune.', 'Faux.']], 'Waiver.'),
];

const competencies = comps([
  ['Corriger sans casser', 'Take action, Fix, retour arrière.', ['Je lis la logique avant d’appliquer.', 'J’ai un retour arrière.', 'Je vérifie la ressource puis la recommandation.']],
  ['Organiser la responsabilité', 'Règles de gouvernance.', ['Je configure portée et priorité.', 'J’attribue un propriétaire.', 'Je lis le rapport de gouvernance.']],
  ['Exempter avec rigueur', 'Mitigated, waiver, expiration.', ['Je choisis la bonne catégorie.', 'Je borne dans le temps.', 'Je diagnostique une exemption sans effet.']],
]);

const projects = [
  P(1, 'débutant', 'Fiche de correction type', 'Concevoir la fiche standard de correction d’une recommandation.', 'Fiche avant, test, application, vérification.', ['Lister les champs.', 'Rédiger un exemple.', 'Valider avec une équipe.'], ['La fiche est utilisable telle quelle.'], ['Fiche trop longue.'], ['Ajouter le retour arrière chiffré.']),
  P(2, 'intermédiaire', 'Règles de gouvernance pour trois niveaux de risque', 'Concevoir trois règles de gouvernance avec propriétaires par étiquette.', 'Tableau règles, portée, priorité, délai.', ['Définir les niveaux.', 'Définir les propriétaires.', 'Prévoir les notifications.'], ['Chaque recommandation a un propriétaire.'], ['Étiquettes manquantes.'], ['Ajouter le rapport de gouvernance.'],
    { connected: { accounts: 'Un abonnement Azure de test sans données de production.', permissions: 'Lecture seule : Security Reader ; aucune création de règle.', costs: 'Aucun frais attendu en lecture seule.', secrets: 'Aucun secret.', cleanup: 'Aucune ressource créée.', limits: 'Lecture de la page Governance rules et de la page Recommendations. Statut : non réalisée dans un laboratoire Microsoft réel.' } }),
  P(3, 'avancé', 'Registre d’exemptions et revue trimestrielle', 'Concevoir un registre d’exemptions avec requête Resource Graph de suivi et procédure de revue.', 'Registre, requête, calendrier de revue.', ['Définir les champs.', 'Rédiger la requête.', 'Définir la revue.', 'Définir les indicateurs.'], ['Aucune exemption sans expiration.'], ['Exemptions orphelines.'], ['Automatiser le rappel par application logique.']),
];

export const d08 = assemble({ id: 'd08', level: 2, n: 8, title: 'Recommandations et remédiation',
  summary: 'Lecture et priorisation des recommandations, correction sûre avec retour arrière, règles de gouvernance, exemptions mitigated et waiver, et vérification après changement.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Piloter la remédiation chez Nordlys Technologies',
  caseScenario: 'Vous corrigez un accès public, configurez la gouvernance et revoyez des exemptions. Données simulées.', caseMinutes: 50 });
