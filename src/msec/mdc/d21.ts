// Module 21 : Alertes, incidents et investigation (niveau 5).
import { dsl, md } from './dsl.ts';

const { lesson, Q, M, MT, OR, CF, IN, WF, FX, SH, OP, comps, P, assemble } = dsl('d21');
const c1 = { comp: 'd21-c1', lesson: 'd21-l1', tags: ['alerte-incident', 'gravite', 'mitre', 'retention-90j'] };
const c2 = { comp: 'd21-c2', lesson: 'd21-l2', tags: ['investigation', 'take-action', 'statut-alerte', 'contexte-ressource'] };
const c3 = { comp: 'd21-c3', lesson: 'd21-l3', tags: ['alertes-test', 'suppression', 'faux-positif', 'gouvernance-regles'] };

const l1 = lesson(1, {
  title: 'Alertes et incidents : ce que Defender for Cloud produit et où cela va', minutes: 50,
  summary: 'Lire une alerte, comprendre la corrélation en incidents, la rétention et ce qui arrive (ou non) dans le portail Defender XDR.',
  objectives: ['Distinguer alerte, incident et recommandation.', 'Lire gravité, statut, ressources touchées et intention MITRE.', 'Dire quelles alertes sont envoyées au portail Defender et lesquelles ne le sont pas.'],
  prerequisites: ['Module 10 à 16 : plans de protection', 'Module 8 : recommandations'],
  body: md(
    '## Trois objets à ne pas confondre',
    'Une **recommandation** décrit un état à corriger (posture). Une **alerte** signale une activité suspecte détectée par un plan de protection (Servers, Containers, Storage, Databases, App Service, API, IA, DevOps…). Un **incident** est un ensemble d’alertes corrélées qui racontent une attaque : il évite au SOC de trier chaque alerte isolément. Defender for Cloud corrèle les alertes et des signaux de faible fidélité en incidents, y compris, selon la documentation, pour des séquences d’attaque qui touchent plusieurs abonnements, et peut écarter des activités qui ressemblent à des étapes d’attaque sans en être. Les types d’incidents qu’il peut produire figurent dans la référence des incidents.',
    '## Lire une alerte',
    'Le panneau d’une alerte donne : la **gravité**, le **statut**, l’heure de l’activité, une **description** de l’activité exacte détectée, les **ressources touchées** et, quand c’est applicable, l’**intention** selon la matrice MITRE ATT&CK. L’onglet de détails ajoute des éléments comme adresses IP, fichiers et processus. Retenez que la gravité vient du plan de détection, pas de votre contexte : une alerte « moyenne » sur un serveur de production critique mérite parfois plus d’attention qu’une alerte « haute » sur un poste de test. C’est le travail de l’analyste d’ajouter le contexte d’affaires.',
    '## Rétention et export',
    'Les alertes de Defender for Cloud sont conservées **90 jours** dans le service. Pour garder plus longtemps ou corréler ailleurs, il faut les **exporter** : export ponctuel en CSV, **export continu** vers un espace de travail Log Analytics ou un Event Hubs, connecteur Microsoft Sentinel ou intégrations tierces (module 22). Si une enquête de conformité exige un historique de plus de 90 jours, la configuration d’export doit exister **avant** l’incident : on ne peut pas exporter rétroactivement ce qui a expiré.',
    '## Vers le portail Defender XDR',
    'L’intégration avec Microsoft Defender XDR amène les alertes et incidents de Defender for Cloud dans le portail Defender : les ressources infonuagiques apparaissent comme actifs, clairement identifiées Azure, Amazon ou Google, associées à un locataire, sans doublon avec les autres charges Defender, et incluses dans l’API publique de Defender XDR. **Les alertes informationnelles ne sont pas envoyées** au portail Defender, pour limiter la fatigue d’alertes. Conséquence pratique : un analyste qui ne travaille que dans le portail Defender ne verra pas ces alertes; si elles ont une valeur d’audit pour vous, utilisez l’export. Les changements de statut sont synchronisés entre les deux services lorsque l’intégration est active.',
    '## Corrélation dans le portail Defender',
    'Dans le portail Defender, des algorithmes distincts corrèlent les alertes de toutes les sources en incidents et peuvent fusionner des incidents quand des entités, des artefacts, des fenêtres de temps ou des séquences d’événements se recoupent. La direction de la fusion est décidée par Defender; l’incident source est fermé et redirigé. Un incident peut donc changer sous vos pieds : documentez l’identifiant de l’incident cible dans vos notes.',
    '```text',
    'Fiche de lecture d’alerte (exemple fictif, Nordlys Technologies)',
    'Alerte : exécution suspecte sur un serveur Arc; gravité haute; intention : exécution',
    'Contexte d’affaires : serveur de paie => priorité relevée',
    'Rétention : 90 jours dans Defender for Cloud; export continu actif vers l’espace de travail SOC',
    '```',
    '## Erreurs fréquentes',
    '- Confondre recommandation (état) et alerte (activité).',
    '- Compter sur le portail Defender pour voir les alertes informationnelles.',
    '- Découvrir après un incident qu’aucun export n’était configuré.',
  ),
  demo: { title: 'Une alerte introuvable', body: md(
    'Constat **fictif** : un analyste ne retrouve pas dans le portail Defender une alerte vue dans Defender for Cloud.',
    '```text',
    'Hypothèse documentée : alerte informationnelle, non envoyée au portail Defender',
    'Vérification : gravité de l’alerte; intégration XDR active ?',
    'Décision : garder l’alerte dans l’export continu pour l’audit',
    '```',
    '**Lecture commentée.** L’absence dans un portail n’est pas l’absence de l’événement.',
    '**Ce que la démo ne prouve pas.** Aucune alerte réelle.') },
  revision: md('## Fiche : alertes et incidents', '- Recommandation = état; alerte = activité; incident = alertes corrélées.', '- Lire gravité, statut, ressources, MITRE; ajouter le contexte d’affaires.', '- Rétention 90 jours; configurer l’export avant l’incident.', '- Alertes informationnelles non envoyées au portail Defender.', '- Fusions d’incidents : noter l’incident cible.'),
  links: ['alerts', 'alerts-manage', 'alerts-reference', 'xdr-integration', 'xdr-correlation', 'continuous-export'], teaches: ['alerte-incident', 'gravite', 'mitre', 'retention-90j'],
});

const l2 = lesson(2, {
  title: 'Enquêter et répondre : de l’alerte à la décision documentée', minutes: 55,
  summary: 'Suivre une méthode d’enquête, utiliser l’onglet Take action sans sauter d’étapes et fermer une alerte avec une trace.',
  objectives: ['Dérouler une enquête en étapes vérifiables.', 'Utiliser les actions proposées avec leurs effets.', 'Fermer une alerte avec un statut et une justification.'],
  prerequisites: ['Leçon 1', 'Module 8 : remédiation'],
  body: md(
    '## Une méthode, pas une improvisation',
    'Une enquête efficace suit toujours la même séquence : **qualifier** (qu’est-ce qui a été détecté, sur quelle ressource, avec quelle gravité), **contextualiser** (qui possède la ressource, est-elle critique, a-t-on un changement planifié), **vérifier** (journaux d’activité, journaux de la ressource, télémétrie du capteur), **décider** (malveillant, bénin confirmé, indéterminé) puis **agir et consigner**. La documentation recommande de contacter le propriétaire de la ressource pour vérifier s’il s’agit d’un faux positif, et d’examiner les journaux bruts générés par la ressource attaquée.',
    '## L’onglet Take action',
    'Depuis le panneau d’une alerte, **View full details** puis **Take action** propose : **Inspect resource context** (journaux d’activité de la ressource qui appuient l’alerte), **Mitigate the threat** (étapes manuelles de remédiation), **Prevent future attacks** (recommandations de sécurité qui réduisent la surface d’attaque), **Trigger automated response** (déclenche une application logique) et **Suppress similar alerts** (règle de suppression, leçon 3). Chaque action a un effet : déclencher une application logique peut exécuter des changements réels, donc réservez-la à des playbooks revus et testés (module 24); créer une suppression change ce que vous verrez demain.',
    '## Statuts et fermeture',
    'Quand l’enquête est terminée, on passe l’alerte à **Dismissed** : elle disparaît de la liste principale mais reste consultable avec le filtre de statut. Un statut ne remplace pas une note : consignez la raison, les vérifications faites, la personne qui a confirmé et le lien vers les éléments de preuve. La documentation invite aussi à donner une **rétroaction** à Microsoft (utile ou non, raison, commentaire) pour améliorer les algorithmes. Quand l’intégration XDR est active, les changements de statut sont synchronisés : coordonnez-vous pour éviter que deux équipes ferment la même alerte avec des raisons différentes.',
    '## Ne pas conclure sur une absence',
    'Si aucune alerte n’apparaît pour une période, cela ne prouve rien : le plan de protection est-il actif sur la ressource, la couverture est-elle complète (module 4), le capteur est-il sain (module 19)? À l’inverse, une alerte isolée de gravité faible peut être la première pièce d’un scénario plus large : cherchez les alertes voisines sur la même ressource ou la même identité, et ouvrez l’incident corrélé si Defender en a créé un.',
    '## Un exemple de note d’enquête',
    '```text',
    'Note d’enquête (exemple fictif)',
    'Alerte : accès inhabituel à un compte de stockage depuis une adresse IP rare',
    'Contexte : stockage de sauvegardes; propriétaire joint; aucun changement planifié',
    'Vérifications : journaux d’activité de la ressource; authentifications des 24 dernières heures; autres alertes sur la ressource',
    'Verdict : indéterminé -> escalade niveau 2; clé d’accès à faire pivoter par le propriétaire',
    'Statut : actif jusqu’à confirmation',
    '```',
    'Le verdict « indéterminé » est légitime; il impose une prochaine étape et un responsable. Évitez « faux positif » sans preuve.',
    '## Erreurs fréquentes',
    '- Déclencher un playbook non testé sur une alerte réelle.',
    '- Fermer une alerte sans noter la raison.',
    '- Conclure à un faux positif sans parler au propriétaire de la ressource.',
  ),
  demo: { title: 'Un verdict prématuré', body: md(
    'Constat **fictif** : une alerte est fermée comme « faux positif » en deux minutes.',
    '```text',
    'Manque : aucun contact avec le propriétaire; aucune vérification des journaux',
    'Correction : rouvrir; qualifier, contextualiser, vérifier, puis décider',
    '```',
    '**Lecture commentée.** La rapidité n’est pas une preuve. La méthode impose les vérifications avant le verdict.',
    '**Ce que la démo ne prouve pas.** Aucune alerte réelle.') },
  revision: md('## Fiche : enquête', '- Qualifier, contextualiser, vérifier, décider, consigner.', '- Take action : contexte, atténuation, prévention, réponse automatisée, suppression.', '- Dismissed + note de raison; rétroaction à Microsoft.', '- Playbooks seulement s’ils sont revus et testés.', '- Une absence d’alerte ne prouve rien.'),
  links: ['alerts-manage', 'alerts', 'xdr-integration', 'recos-remediate', 'alerts-reference'], teaches: ['investigation', 'take-action', 'statut-alerte', 'contexte-ressource'],
});

const l3 = lesson(3, {
  title: 'Valider les alertes sans risque et régler le bruit avec des suppressions', minutes: 55,
  summary: 'Prouver que la chaîne d’alerte fonctionne avec des alertes de test, puis supprimer le bruit de façon bornée, expirable et auditée.',
  objectives: ['Générer des alertes d’exemple et expliquer leur limite.', 'Créer une règle de suppression avec portée, expiration et simulation.', 'Gouverner les règles de suppression pour qu’elles ne cachent pas de vraies attaques.'],
  prerequisites: ['Leçons 1 et 2', 'Module 3 : gouvernance'],
  body: md(
    '## Valider la chaîne, pas seulement la détection',
    'On valide une configuration d’alertes pour savoir que le signal **arrive** : à l’écran, dans le courriel, dans l’export, dans le SIEM, dans l’automatisation. Les **alertes d’exemple** servent à cela : depuis la page Security alerts, l’utilisateur ayant le rôle **Subscription Contributor** choisit **Sample alerts**, l’abonnement et les plans, puis **Create sample alerts**. Après quelques minutes, elles apparaissent à l’écran et partout où vous recevez les alertes (SIEM connecté, notifications par courriel, automatisation). Elles portent sur des **ressources simulées** : elles valident le tuyau, pas la capacité de détection d’une charge réelle.',
    '## Simuler une détection réelle, de façon inoffensive',
    'Pour tester qu’un plan détecte vraiment, la documentation propose des simulations inoffensives : sur une machine de test où l’agent Defender for Endpoint est installé via Defender for Servers et la protection en temps réel activée, un fichier de test **EICAR** (chaîne standard inoffensive reconnue par les antivirus) déclenche une alerte visible dans le portail en une dizaine de minutes; pour Kubernetes, un **outil de simulation d’alertes** documenté; pour App Service, la visite d’une URL de test sur un site de laboratoire (alerte en deux à quatre heures). N’exécutez ces tests que sur des machines de laboratoire, jamais en production, et avertissez le SOC pour éviter une escalade inutile. Dans ce parcours, aucune de ces simulations n’a été exécutée.',
    '## Règles de suppression',
    'Une règle de suppression masque des alertes **qui ne sont pas pertinentes** pour l’organisation. Vous pouvez en créer une pour un ou plusieurs types d’alertes, ou à partir d’une alerte existante (Take action, Suppress similar alerts, Create suppression rule). Portée : abonnements par le portail ou l’API REST; groupes de gestion par **Azure Policy**. Une règle ne s’applique qu’aux types d’alertes **déjà déclenchés au moins une fois**. Les éléments à définir : abonnements, types d’alertes (Custom ou All), **conditions d’entité** pour limiter à des ressources ou valeurs précises, nom (2 à 50 caractères, lettres, chiffres, tirets et soulignés), état activé ou désactivé, raison, commentaire, **expiration** (date personnalisée ou aucune) et l’option **Simulate** pour tester la règle avant de l’appliquer. Supprimer une règle ne change pas le statut des alertes qu’elle a déjà fermées.',
    '## Gouverner les suppressions',
    'Une suppression trop large est un angle mort permanent. Règles de bonne pratique : jamais « All » sans exception documentée; toujours des **conditions d’entité**; **expiration** par défaut (par exemple 90 jours) et revue avant renouvellement; **simulation** avant application; approbation par le propriétaire du risque; registre des règles avec raison, auteur et date; et revue trimestrielle qui compare les règles actives aux alertes évitées. Une suppression ne corrige pas la cause : si une alerte revient chaque semaine, cherchez d’abord la configuration ou le processus qui la produit.',
    '```text',
    'Registre de suppression (exemple fictif)',
    'Règle : sup-scan-vuln-interne; type : analyse réseau interne; condition d’entité : adresse du scanneur autorisé',
    'Raison : scanneur de vulnérabilités approuvé; expiration : 90 jours; approuvée par : responsable SOC',
    'Simulation faite : oui; revue prévue : avant l’expiration',
    '```',
    '## Erreurs fréquentes',
    '- Créer une suppression pour tous les types d’alertes d’un abonnement.',
    '- Oublier l’expiration.',
    '- Tester une détection en production sans avertir le SOC.',
  ),
  demo: { title: 'Un scanneur qui fait du bruit', body: md(
    'Constat **fictif** : un scanneur de vulnérabilités autorisé génère chaque semaine la même alerte.',
    '```text',
    'Décision : suppression bornée à l’adresse du scanneur; expiration 90 jours; simulation avant application',
    'Suivi : revue avant expiration; vérifier qu’aucune autre adresse n’est masquée',
    '```',
    '**Lecture commentée.** La condition d’entité et l’expiration empêchent la règle de devenir un angle mort.',
    '**Ce que la démo ne prouve pas.** Aucun scanneur réel.') },
  revision: md('## Fiche : validation et suppression', '- Alertes d’exemple : valident le tuyau, ressources simulées.', '- Simulations inoffensives en laboratoire seulement; avertir le SOC.', '- Suppression : portée, entités, expiration, simulation.', '- Groupes de gestion via Azure Policy.', '- Registre et revue périodique.'),
  links: ['alerts-validate', 'alerts-suppress', 'alerts-manage', 'continuous-export', 'exemptions'], teaches: ['alertes-test', 'suppression', 'faux-positif', 'gouvernance-regles'],
});

const exercises = [
  MT('d21-g1', 'guided', 'comprendre', c1, 'Trois objets', 'Associez chaque objet à sa définition.', [['Recommandation', 'État à corriger'], ['Alerte', 'Activité suspecte détectée'], ['Incident', 'Alertes corrélées qui racontent une attaque']], 'Trois objets distincts.'),
  WF('d21-a1', 'autonomous', 'fonctionner', c1, 'Préparer l’export', 'Ordonnez la préparation de la conservation des alertes.', ['Constater la rétention de 90 jours', 'Définir la durée de conservation requise', 'Choisir la destination d’export', 'Configurer l’export continu', 'Valider la réception avec des alertes d’exemple'], [['Configurer l’export après l’incident', 'Les données expirées ne sont pas récupérables.']], 'Rétention, besoin, destination, export, validation.'),
  Q('d21-q1a', 'quiz', 'comprendre', c1, 'Rétention', 'Combien de temps les alertes sont-elles conservées dans le service ?', ['90 jours.', 'Exporter pour plus longtemps.'], [['7 jours.', 'Faux.'], ['Un an.', 'Faux.'], ['Indéfiniment.', 'Faux.']], '90 jours.'),
  Q('d21-q1b', 'quiz', 'verifier', c1, 'Informationnelles', 'Les alertes informationnelles vont-elles au portail Defender ?', ['Non.', 'Pour limiter la fatigue d’alertes.'], [['Oui, toutes.', 'Faux.'], ['Seulement le lundi.', 'Faux.'], ['Seulement AWS.', 'Faux.']], 'Non.'),
  Q('d21-q1c', 'quiz', 'comprendre', c1, 'Gravité', 'La gravité tient-elle compte de la criticité d’affaires de votre ressource ?', ['Non, l’analyste ajoute ce contexte.', 'Elle vient du plan.'], [['Oui, toujours.', 'Faux.'], ['Seulement pour Servers.', 'Faux.'], ['Seulement la nuit.', 'Faux.']], 'Non.'),

  MT('d21-g2', 'guided', 'comprendre', c2, 'Onglet Take action', 'Associez chaque section à son rôle.', [['Inspect resource context', 'Journaux d’activité de la ressource'], ['Mitigate the threat', 'Étapes manuelles d’atténuation'], ['Prevent future attacks', 'Recommandations pour réduire la surface'], ['Trigger automated response', 'Application logique']], 'Quatre sections.'),
  OR('d21-a2', 'autonomous', 'verifier', c2, 'Méthode d’enquête', 'Ordonnez l’enquête.', ['Qualifier l’alerte', 'Contextualiser avec le propriétaire', 'Vérifier les journaux', 'Décider du verdict', 'Agir et consigner'], 'Qualifier, contextualiser, vérifier, décider, consigner.'),
  Q('d21-q2a', 'quiz', 'securiser', c2, 'Playbook', 'Quand déclencher une application logique depuis une alerte ?', ['Quand le playbook est revu et testé.', 'Effets réels possibles.'], [['Toujours.', 'Risqué.'], ['Jamais.', 'Trop strict.'], ['Seulement la nuit.', 'Faux.']], 'Revu et testé.'),
  Q('d21-q2b', 'quiz', 'verifier', c2, 'Fermeture', 'Que faut-il en plus du statut Dismissed ?', ['Une note avec la raison et les vérifications.', 'Trace de décision.'], [['Rien.', 'Faux.'], ['Supprimer l’alerte.', 'Faux.'], ['Un courriel au hasard.', 'Faux.']], 'Une note.'),
  Q('d21-q2c', 'quiz', 'verifier', c2, 'Absence', 'L’absence d’alerte sur une période prouve-t-elle l’absence d’attaque ?', ['Non.', 'Plan, couverture et capteur à vérifier.'], [['Oui.', 'Faux.'], ['Seulement en Plan 2.', 'Faux.'], ['Seulement AWS.', 'Faux.']], 'Non.'),

  MT('d21-g3', 'guided', 'comprendre', c3, 'Validation', 'Associez chaque test à ce qu’il prouve.', [['Alertes d’exemple', 'Le tuyau (écran, courriel, export, SIEM)'], ['Fichier EICAR sur machine de test', 'La détection par le capteur'], ['Simulation Kubernetes documentée', 'Les alertes de Containers'], ['Simulation de suppression', 'Ce que la règle masquerait']], 'Chaque test a sa portée.'),
  CF('d21-a3', 'autonomous', 'securiser', c3, 'Règle de suppression', 'Paramétrez une règle de suppression prudente.', [['Limiter par conditions d’entité', 'on', 'Évite l’angle mort.'], ['Fixer une expiration', 'on', 'Force la revue.'], ['Tester avec Simulate', 'on', 'Voir l’effet avant.'], ['Appliquer à tous les types d’alertes', 'off', 'Trop large.']], 'Entités, expiration, simulation, portée étroite.'),
  Q('d21-q3a', 'quiz', 'fonctionner', c3, 'Groupe de gestion', 'Comment supprimer des alertes pour un groupe de gestion ?', ['Avec Azure Policy.', 'Portail et API pour les abonnements.'], [['Dans le portail seulement.', 'Faux.'], ['Impossible.', 'Faux.'], ['Par courriel.', 'Faux.']], 'Azure Policy.'),
  Q('d21-q3b', 'quiz', 'verifier', c3, 'Déjà déclenchée', 'À quels types d’alertes une règle peut-elle s’appliquer ?', ['À ceux déjà déclenchés au moins une fois.', 'Selon la documentation.'], [['À tous les types possibles.', 'Faux.'], ['Seulement aux critiques.', 'Faux.'], ['À aucun.', 'Faux.']], 'Déjà déclenchés.'),
  Q('d21-q3c', 'quiz', 'maintenir', c3, 'Suppression retirée', 'Supprimer une règle rouvre-t-il les alertes déjà fermées ?', ['Non.', 'Statuts inchangés.'], [['Oui.', 'Faux.'], ['Seulement les critiques.', 'Faux.'], ['Seulement le jour même.', 'Faux.']], 'Non.'),

  Q('d21-ev1', 'eval', 'comprendre', c1, 'Intention', 'Quel cadre donne l’intention d’une alerte, quand applicable ?', ['MITRE ATT&CK.', 'Affichée dans le panneau.'], [['PCI DSS.', 'Faux.'], ['ISO 27001.', 'Faux.'], ['ITIL.', 'Faux.']], 'MITRE ATT&CK.'),
  M('d21-ev2', 'eval', 'securiser', c3, 'Contenu d’une règle', 'Cochez les éléments d’une règle de suppression bien gouvernée.', [['Conditions d’entité.', 'Oui.'], ['Expiration.', 'Oui.'], ['Raison documentée.', 'Oui.']], [['Aucune revue.', 'Faux.']], 'Trois éléments.'),
  FX('d21-ev3', 'eval', 'verifier', c2, 'Note d’enquête', 'Complétez la note d’enquête fictive.', { constat: '', contexte: '', verification: '', decision: '' }, { constat: 'accès inhabituel à un compte de stockage', contexte: 'propriétaire joint, aucun changement planifié', verification: 'journaux d’activité et authentifications', decision: 'indéterminé, escalade avec rotation de clé' }, [['constat', 'accès inhabituel à un compte de stockage', 'Nommer le constat.', 'comprendre'], ['contexte', 'propriétaire joint, aucun changement planifié', 'Ajouter le contexte.', 'verifier'], ['verification', 'journaux d’activité et authentifications', 'Citer les vérifications.', 'verifier'], ['decision', 'indéterminé, escalade avec rotation de clé', 'Décider avec prudence.', 'securiser']], 'Constat, contexte, vérifications, décision.'),
  OR('d21-ev4', 'eval', 'fonctionner', c3, 'Créer une suppression', 'Ordonnez la création d’une suppression.', ['Confirmer que l’alerte est bénigne avec le propriétaire', 'Ouvrir Suppression rules', 'Choisir abonnements et type d’alerte', 'Ajouter les conditions d’entité et l’expiration', 'Simuler puis appliquer', 'Inscrire la règle au registre'], 'Confirmation, ouverture, portée, entités, simulation, registre.'),
  CF('d21-ev5', 'eval', 'cout', c1, 'Coût de la rétention', 'Paramétrez la stratégie de conservation.', [['Estimer le coût d’ingestion de l’export', 'on', 'L’ingestion est facturée.'], ['Choisir la durée selon l’exigence', 'on', 'Évite le sur-stockage.'], ['Tout exporter sans filtre', 'off', 'Coût inutile.']], 'Estimer, durée, filtres.'),
  WF('d21-ev6', 'eval', 'maintenir', c3, 'Revue trimestrielle', 'Ordonnez la revue trimestrielle des suppressions.', ['Lister les règles actives', 'Comparer aux alertes évitées', 'Vérifier les raisons et les expirations', 'Renouveler, resserrer ou supprimer', 'Consigner la décision'], [['Renouveler toutes les règles automatiquement', 'Angles morts.']], 'Lister, comparer, vérifier, décider, consigner.'),
  SH('d21-ev7', 'eval', 'verifier', c1, 'Jours de rétention', 'Combien de jours de rétention des alertes dans le service ? (nombre)', ['90'], 'Quatre-vingt-dix jours.', 90),
  Q('d21-ev8', 'eval', 'comprendre', c3, 'Alertes d’exemple', 'Les alertes d’exemple portent sur quelles ressources ?', ['Des ressources simulées.', 'Elles valident le tuyau.'], [['Vos ressources réelles.', 'Faux.'], ['Des clients.', 'Faux.'], ['Aucune.', 'Faux.']], 'Simulées.'),

  IN('d21-cs1', 'case', 'verifier', c3, 'Cas : demande de suppression', 'Éléments d’une demande fictive : repérez ceux à corriger.', 'text', [['« Supprimer toutes les alertes de l’abonnement de production. »', 'Portée trop large, sans entités ni expiration', 'Garder tel quel'], ['« Aucune expiration, c’est permanent. »', 'Prévoir une expiration et une revue', 'Garder tel quel']], 'Chaque élément est corrigé.'),
  MT('d21-cs2', 'case', 'securiser', c2, 'Cas : trois réflexes', 'Associez chaque situation à la bonne réaction.', [['Alerte haute sur serveur de paie', 'Relever la priorité et contacter le propriétaire'], ['Alerte répétée d’un scanneur autorisé', 'Suppression bornée avec expiration'], ['Alerte inconnue sans contexte', 'Verdict indéterminé et escalade']], 'Une réaction par situation.'),
  WF('d21-cs3', 'case', 'maintenir', c3, 'Cas : alerte absente', 'Ordonnez la réaction à une alerte attendue mais absente.', ['Constater l’absence', 'Vérifier que le plan est actif sur la ressource', 'Vérifier le capteur et la couverture', 'Rejouer un test inoffensif en laboratoire', 'Conclure avec preuve'], [['Conclure que tout va bien', 'Absence n’est pas preuve.']], 'Constater, plan, capteur, test, conclusion.'),
  OP('d21-cs-open', 'case', 'verifier', c2, 'Cas : alertes chez Nordlys', 'Rédigez la procédure d’alertes d’une organisation fictive.', 'Une page : lecture, export, enquête, suppression, validation.', [['La méthode d’enquête est claire.', 'verifier'], ['L’export et la rétention sont prévus.', 'maintenir'], ['Les suppressions sont gouvernées.', 'securiser'], ['La validation est inoffensive.', 'fonctionner']], 'La procédure relie enquête, export, suppression et validation.'),

  Q('d21-rm1', 'remediation', 'comprendre', c1, 'Remédiation : objets', 'Qu’est-ce qu’un incident ?', ['Un ensemble d’alertes corrélées.', 'Raconte une attaque.'], [['Une recommandation.', 'Faux.'], ['Un journal.', 'Faux.'], ['Une règle.', 'Faux.']], 'Alertes corrélées.'),
  Q('d21-rm2', 'remediation', 'verifier', c2, 'Remédiation : verdict', 'Que faire sans preuve suffisante ?', ['Verdict indéterminé et escalade.', 'Prochaine étape et responsable.'], [['Faux positif.', 'Sans preuve.'], ['Ignorer.', 'Faux.'], ['Supprimer.', 'Faux.']], 'Indéterminé.'),
  Q('d21-rm3', 'remediation', 'maintenir', c3, 'Remédiation : suppression', 'Comment éviter l’angle mort ?', ['Entités, expiration et revue.', 'Registre des règles.'], [['Règle permanente.', 'Faux.'], ['Tous les types.', 'Faux.'], ['Sans raison.', 'Faux.']], 'Entités, expiration, revue.'),
];

const competencies = comps([
  ['Lire alertes et incidents', 'Objets, gravité, rétention, XDR.', ['Je distingue recommandation, alerte et incident.', 'Je sais ce que le portail Defender reçoit.', 'Je configure l’export avant l’incident.']],
  ['Enquêter avec méthode', 'Qualifier, contextualiser, vérifier, décider.', ['Je suis la séquence d’enquête.', 'Je n’utilise les playbooks que revus.', 'Je consigne chaque décision.']],
  ['Valider et régler le bruit', 'Tests inoffensifs, suppressions gouvernées.', ['Je valide la chaîne avec des alertes d’exemple.', 'Je borne et fais expirer les suppressions.', 'Je tiens un registre revu périodiquement.']],
]);

const projects = [
  P(1, 'débutant', 'Fiche de lecture d’alerte', 'Créer un modèle de fiche de lecture et de verdict.', 'Fiche gravité, ressource, contexte, vérifications, verdict.', ['Lister les champs.', 'Ajouter le contexte d’affaires.', 'Définir les verdicts.'], ['Chaque verdict a une preuve.'], ['Conclure sans contexte.'], ['Ajouter les statuts.']),
  P(2, 'intermédiaire', 'Registre de suppressions', 'Concevoir le registre et la revue trimestrielle des règles.', 'Tableau règle, raison, approbation, expiration, revue.', ['Définir les champs.', 'Définir l’approbation.', 'Planifier la revue.'], ['Aucune règle sans expiration.'], ['Règles trop larges.'], ['Ajouter une requête d’inventaire.'],
    { connected: { accounts: 'Un abonnement Azure de test avec un plan de protection activé.', permissions: 'Subscription Contributor pour les alertes d’exemple; Security Admin pour les règles de suppression.', costs: 'Le plan de protection est payant : confirmer l’essai ou le coût avant activation; l’export vers Log Analytics est facturé à l’ingestion; aucune activation automatique.', secrets: 'Aucun secret.', cleanup: 'Supprimer les règles de test, désactiver l’export de test et mettre le plan à Off.', limits: 'Abonnement de test sans charge de production. Statut : non réalisée dans un laboratoire Microsoft réel.' } }),
  P(3, 'avancé', 'Exercice de validation de la chaîne d’alerte', 'Planifier un exercice inoffensif qui valide écran, courriel, export et automatisation.', 'Plan d’essai, critères de réussite, nettoyage.', ['Choisir les tests.', 'Avertir le SOC.', 'Mesurer les délais.'], ['Chaque maillon est observé.'], ['Test en production.'], ['Répéter chaque trimestre.']),
];

export const d21 = assemble({ id: 'd21', level: 5, n: 21, title: 'Alertes, incidents et investigation',
  summary: 'Alertes, incidents et rétention de 90 jours, intégration au portail Defender, méthode d’enquête, onglet Take action, alertes d’exemple, simulations inoffensives et règles de suppression gouvernées.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Trier les alertes de Nordlys Technologies',
  caseScenario: 'Vous lisez des alertes, enquêtez avec méthode, validez la chaîne d’alertes et réglez le bruit avec des suppressions bornées. Données simulées.', caseMinutes: 55 });
