// Module 6 : Rétention, conformité et exploitation par le SOC (niveau 4).
import type { AiProject } from '../../agentic/types.ts';
import { assemble } from '../assemble.ts';
import { kit } from '../kit.ts';
import { comp, lesson, project } from './dsl.ts';

const { a, Q, M } = kit('p06');
const c1 = { comp: 'p06-c1', lesson: 'p06-l1', tags: ['retention', 'etiquettes-retention', 'compliance-manager'] };
const c2 = { comp: 'p06-c2', lesson: 'p06-l2', tags: ['defender-xdr', 'chasse', 'exploitation-soc'] };

const l1 = lesson('p06', {
  n: 1, title: 'Rétention, étiquettes de rétention et Compliance Manager', minutes: 50,
  summary: 'Décider combien de temps garder ou quand supprimer, choisir entre politique et étiquette de rétention, et lire un score de conformité sans le surinterpréter.',
  objectives: ['Distinguer politique de rétention et étiquette de rétention.', 'Expliquer la primauté d’un blocage et la fonction de verrouillage de préservation.', 'Lire le score, les évaluations et les actions d’amélioration du Compliance Manager avec prudence.'],
  prerequisites: ['Module 5'],
  body: [
    '## Garder ou supprimer, avec une raison',
    'La **gestion du cycle de vie des données** (rétention) répond à deux questions : combien de temps garder, et quand supprimer. Garder trop longtemps augmente le risque et le coût ; supprimer trop tôt expose à des sanctions ou à une perte de preuve. La décision vient d’une règle légale, réglementaire ou d’affaires, jamais d’une habitude.',
    '## Politique ou étiquette',
    '| Critère | Politique de rétention | Étiquette de rétention |',
    '| --- | --- | --- |',
    '| Application | À grande échelle, par emplacement | À un élément précis |',
    '| Visibilité par l’utilisateur | Non | Oui, peut être appliquée manuellement |',
    '| Règle de suppression | Selon la politique | Peut déclencher une revue ou un enregistrement |',
    '| Cas typique | Garder les courriels 7 ans | Contrat à conserver 10 ans |',
    'Un élément ne reçoit qu’**une seule étiquette de rétention** à la fois. L’application **automatique** d’une étiquette (selon un type d’information sensible ou un mot-clé) se teste avant le déploiement, comme la classification du module 2.',
    '## Blocage, rétention et verrouillage',
    'Un blocage d’eDiscovery **prime sur la rétention** (module 5). Le **verrouillage de préservation** (Preservation Lock) rend une politique de rétention **immuable** : même un administrateur ne peut plus la raccourcir ni la supprimer. C’est utile pour une exigence réglementaire stricte, mais c’est une décision irréversible : validez avec le juridique avant de l’activer.',
    '## Vérifier ce qui s’applique',
    'L’outil de **recherche de politique** (Policy lookup) demande des **valeurs exactes** pour répondre : une faute de frappe donne une réponse trompeuse. Quand un contenu se comporte de façon inattendue, comparez rétention, blocage et étiquettes avant de conclure.',
    '## Compliance Manager',
    'Le **Compliance Manager** mesure la posture par rapport à des **réglementations ou normes** au moyen d’**évaluations**. Chaque évaluation contient des **actions d’amélioration** (certaines gérées par Microsoft, d’autres par l’organisation) qui font monter le **score de conformité**. Certaines actions se testent automatiquement, d’autres demandent des preuves manuelles. L’évaluation de base est un point de départ, pas une certification.',
    '## Lire un score avec prudence',
    'Un score élevé ne signifie pas que l’organisation est conforme : il reflète les actions complétées dans l’outil, pas la réalité de chaque contrôle. Utilisez-le pour prioriser et suivre, et conservez la preuve des actions qui comptent. Ne citez jamais le score comme une attestation de conformité.',
    '## Limites à nommer',
    'La rétention ne remplace pas une politique de classification des documents, le score ne remplace pas un audit externe, et chaque étiquette de rétention gagne à être justifiée par une exigence documentée.',
  ],
  demo: { title: 'Choisir un mécanisme', lines: [
    'Cas **fictif** : Nordlys Technologies doit garder les contrats 10 ans et les courriels 7 ans.',
    '```text',
    'Courriels  : politique de rétention 7 ans (tous les utilisateurs)',
    'Contrats   : étiquette de rétention 10 ans (application automatique en test)',
    'Dossier    : blocage eDiscovery prime tant qu’il est en place',
    '```',
    '**Lecture commentée.** La politique couvre le général, l’étiquette l’exception. Le verrouillage de préservation n’est pas activé : décision irréversible à valider.',
    '**Ce que la démo ne prouve pas.** Aucune politique réelle n’existe.'] },
  revision: ['## Fiche : rétention et conformité', '- Politique : large, par emplacement ; étiquette : élément précis, visible.', '- Une seule étiquette de rétention à la fois.', '- Blocage prime ; verrouillage de préservation irréversible.', '- Policy lookup : valeurs exactes.', '- Compliance Manager : score et actions, pas une attestation.'],
  links: ['retention', 'retention-labels', 'retention-auto', 'cm', 'cm-setup', 'cm-scoring', 'cm-actions'], teaches: ['retention', 'etiquettes-retention', 'compliance-manager'],
});

const l2 = lesson('p06', {
  n: 2, title: 'Exploitation par le SOC : Defender XDR, alertes et chasse avancée', minutes: 55,
  summary: 'Traiter les signaux Purview dans Defender, comprendre la règle d’ajustement des alertes et explorer les événements DLP dans la chasse avancée.',
  objectives: ['Expliquer où traiter les alertes DLP et de risques internes.', 'Décrire la règle d’ajustement des alertes qui transforme des signaux DLP en comportements.', 'Écrire une requête exploratoire sur CloudAppEvents sans valeurs inventées.'],
  prerequisites: ['Leçon précédente'],
  body: [
    '## Configuration dans Purview, traitement dans Defender',
    'Les politiques se configurent dans Purview, mais le **traitement** des alertes de DLP et de risques internes se fait de préférence dans le **portail Defender**, dans la file d’**incidents** : l’analyste y voit les alertes de plusieurs produits corrélées dans un même incident. Les alertes DLP sont gardées **30 jours** dans Purview et **six mois** dans Defender, ce qui plaide pour l’enquête côté Defender.',
    '## La règle d’ajustement des alertes',
    'À partir de **début octobre 2026**, une règle d’**ajustement des alertes** transforme par défaut des signaux DLP en **comportements** (tables BehaviorInfo et BehaviorEntities) plutôt qu’en alertes classiques, **sauf si elle est désactivée** dans Paramètres, Defender XDR, Alert tuning. Pour un SOC, cela change ce qu’on voit dans la file d’incidents : vérifiez le réglage de votre locataire avant de conclure qu’une alerte « a disparu ».',
    '| Constat | Hypothèse à vérifier | Où |',
    '| --- | --- | --- |',
    '| Moins d’alertes DLP dans les incidents | Règle d’ajustement active | Alert tuning |',
    '| Pas de données DLP en chasse | Connecteur Defender for Cloud Apps absent | CloudAppEvents |',
    '| Événement ancien introuvable | Fenêtre de 30 jours de la chasse | Journal d’audit |',
    '## Où sont les données DLP en chasse avancée',
    'La table **CloudAppEvents** contient les données d’audit des applications infonuagiques, y compris celles de la DLP, et exige **Defender for Cloud Apps** avec le connecteur Microsoft 365. La chasse avancée couvre environ **30 jours**. Des événements comme *DLP Rule Undo* existent, et un événement *DLP Rule Matched* peut refléter une correspondance partielle : lisez le contexte avant de conclure.',
    '## Une requête exploratoire sûre',
    'Plutôt que de supposer des valeurs d’`ActionType`, on **découvre** ce que contient la table :',
    '```kusto',
    'CloudAppEvents',
    '| where Timestamp > ago(30d)',
    '| where ActionType has "Dlp"',
    '| summarize Evenements = count(), Comptes = dcount(AccountObjectId), PremierEvenement = min(Timestamp), DernierEvenement = max(Timestamp) by ActionType, Application',
    '| order by Evenements desc',
    '```',
    '## Lire le résultat',
    'La requête liste les types d’événements DLP vus, leur volume, le nombre de comptes touchés et la période. Elle sert de **point de départ** : on repère un type inhabituel, puis on affine par compte ou par application. Elle n’a pas été exécutée contre un locataire réel dans ce parcours : validez-la chez vous.',
    '## Boucle d’exploitation',
    'Un SOC mature relie cinq gestes : régler les politiques (Purview), simuler (module 3), traiter dans Defender, enquêter avec la chasse et l’audit (module 5), puis rétroagir sur les politiques. Chaque faux positif récurrent devient un réglage ; chaque cas confirmé, une leçon documentée.',
    '## Limites à nommer',
    'Les tables Purview de chasse (par exemple DataSecurityEvents) sont en préversion pour certaines fonctions et les noms ou colonnes peuvent évoluer. Datez toujours la source et testez la requête sur une courte fenêtre avant de l’automatiser.',
  ],
  demo: { title: 'Lire la requête', lines: [
    'Résultat **fictif** de la requête exploratoire :',
    '```text',
    'ActionType        Application            Evenements  Comptes',
    'DLP… (exemple)    Exchange Online        120         18',
    'DLP… (exemple)    Microsoft SharePoint   45          9',
    '```',
    '**Lecture commentée.** On identifie d’abord où se concentre le volume, puis on affine par compte. Une concentration sur peu de comptes oriente vers l’éducation ou l’escalade, une dispersion vers un réglage de règle.',
    '**Ce que la démo ne prouve pas.** Les noms et valeurs sont illustratifs.'] },
  revision: ['## Fiche : exploitation SOC', '- Configurer dans Purview, traiter dans Defender (incidents).', '- Alertes DLP : 30 jours (Purview), six mois (Defender).', '- Règle d’ajustement : signaux DLP en comportements, sauf si désactivée.', '- CloudAppEvents : exige Defender for Cloud Apps et connecteur M365 ; fenêtre 30 jours.', '- Requête exploratoire avant toute hypothèse.'],
  links: ['dlp-defender', 'dlp-alerts', 'audit-defender', 'hunting-cloudapp', 'irm-defender'], teaches: ['defender-xdr', 'chasse', 'exploitation-soc'],
});

const exercises = [
  a.match({ id: 'p06-l1-g', title: 'Mécanisme et usage', comp: c1.comp, tags: c1.tags, role: 'guided', dim: 'comprendre', lesson: 'p06-l1',
    st: 'Associez chaque mécanisme à son usage.', items: [['p1', 'Politique de rétention'], ['p2', 'Étiquette de rétention'], ['p3', 'Verrouillage de préservation']],
    options: [['s1', 'Règle large par emplacement'], ['s2', 'Règle sur un élément précis'], ['s3', 'Rend la politique immuable']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'La politique est large, l’étiquette précise et le verrouillage rend la politique immuable.' }),
  a.inspect({ id: 'p06-l1-a', title: 'Relire un rapport de conformité', comp: c1.comp, tags: c1.tags, role: 'autonomous', dim: 'verifier', lesson: 'p06-l1', language: 'text',
    st: 'Rapport fictif. Repérez les raisonnements fautifs.',
    lines: [['p1', 'Notre score est de 90 % : nous sommes donc conformes à la loi.', { ok: 'a1', fixes: [['a1', 'Le score n’est pas une attestation de conformité'], ['a2', 'Accepter']] }], ['p2', 'Une seule étiquette de rétention par élément.'], ['p3', 'Nous activerons le verrouillage de préservation sans validation, on pourra revenir en arrière.', { ok: 'b1', fixes: [['b1', 'Décision irréversible : valider avec le juridique'], ['b2', 'Accepter']] }]],
    exp: 'Le score n’atteste rien et le verrouillage est irréversible.' }),
  Q('p06-l1-qa', 'quiz', 'comprendre', c1, 'Étiquettes de rétention', 'Combien d’étiquettes de rétention un élément peut-il porter à la fois ?', ['Une seule.', 'Règle documentée.'], [['Deux.', 'Faux.'], ['Illimité.', 'Faux.'], ['Aucune.', 'Faux.']], 'Un élément porte une seule étiquette de rétention.'),
  Q('p06-l1-qb', 'quiz', 'securiser', c1, 'Verrouillage', 'Que fait le verrouillage de préservation ?', ['Rend la politique de rétention immuable.', 'Même un administrateur ne peut plus la raccourcir.'], [['Supprime les contenus.', 'Faux.'], ['Chiffre les fichiers.', 'Faux.'], ['Désactive l’audit.', 'Faux.']], 'Il rend la politique immuable.'),
  Q('p06-l1-qc', 'quiz', 'verifier', c1, 'Policy lookup', 'Que demande l’outil de recherche de politique ?', ['Des valeurs exactes.', 'Une faute donne une réponse trompeuse.'], [['Des valeurs approximatives.', 'Faux.'], ['Aucune valeur.', 'Faux.'], ['Un mot de passe.', 'Faux.']], 'Il demande des valeurs exactes.'),

  a.match({ id: 'p06-l2-g', title: 'Constat et hypothèse', comp: c2.comp, tags: c2.tags, role: 'guided', dim: 'comprendre', lesson: 'p06-l2',
    st: 'Associez chaque constat à l’hypothèse à vérifier.', items: [['p1', 'Moins d’alertes DLP dans les incidents'], ['p2', 'Pas de données DLP en chasse'], ['p3', 'Événement de 45 jours introuvable en chasse']],
    options: [['s1', 'Règle d’ajustement des alertes active'], ['s2', 'Defender for Cloud Apps ou connecteur absent'], ['s3', 'Fenêtre de 30 jours dépassée']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Chaque constat a une cause plausible à vérifier avant de conclure.' }),
  a.config({ id: 'p06-l2-a', title: 'Préparer le traitement des alertes', comp: c2.comp, tags: c2.tags, role: 'autonomous', dim: 'securiser', lesson: 'p06-l2',
    st: 'Paramétrez le traitement des alertes DLP.', fields: [
      { id: 'inc', label: 'Traiter dans la file d’incidents Defender', kind: 'toggle', accept: ['on'], why: 'Corrélation de plusieurs produits.' },
      { id: 'tune', label: 'Vérifier le réglage Alert tuning', kind: 'toggle', accept: ['on'], why: 'Change ce qui apparaît dans la file.' },
      { id: 'seul', label: 'Traiter seulement dans Purview', kind: 'toggle', accept: ['off'], why: 'Moins de contexte et conservation plus courte.' },
    ], solution: { inc: 'on', tune: 'on', seul: 'off' }, exp: 'On traite dans Defender et on vérifie la règle d’ajustement.' }),
  Q('p06-l2-qa', 'quiz', 'comprendre', c2, 'Table des événements DLP', 'Quelle table de chasse contient les données d’audit des applications infonuagiques, y compris la DLP ?', ['CloudAppEvents.', 'Table citée.'], [['DeviceInfo.', 'Autre usage.'], ['EmailEvents.', 'Autre usage.'], ['IdentityInfo.', 'Autre usage.']], 'CloudAppEvents contient ces données.'),
  Q('p06-l2-qb', 'quiz', 'verifier', c2, 'Fenêtre de chasse', 'Quelle période la chasse avancée couvre-t-elle environ ?', ['30 jours.', 'Fenêtre documentée.'], [['1 an.', 'Faux.'], ['24 heures.', 'Faux.'], ['10 ans.', 'Faux.']], 'La chasse couvre environ 30 jours.'),
  Q('p06-l2-qc', 'quiz', 'maintenir', c2, 'Règle d’ajustement', 'Que fait la règle d’ajustement des alertes par défaut ?', ['Transforme des signaux DLP en comportements, sauf si désactivée.', 'Comportement documenté.'], [['Supprime toutes les alertes.', 'Faux.'], ['Active la DLP.', 'Faux.'], ['Ferme les incidents.', 'Faux.']], 'Elle transforme des signaux DLP en comportements.'),

  Q('p06-ev1', 'eval', 'comprendre', c1, 'Rétention et blocage', 'Qui prime : le blocage ou la rétention ?', ['Le blocage.', 'Règle documentée.'], [['La rétention.', 'Faux.'], ['Les deux sont ignorés.', 'Faux.'], ['Aucune règle.', 'Faux.']], 'Le blocage prime sur la rétention.'),
  M('p06-ev2', 'eval', 'comprendre', c1, 'Compliance Manager', 'Cochez les éléments du Compliance Manager.', [['Évaluations.', 'Composante.'], ['Actions d’amélioration.', 'Composante.'], ['Score de conformité.', 'Composante.']], [['Cas eDiscovery.', 'Autre solution.'], ['Étiquettes de sensibilité.', 'Autre solution.']], 'Évaluations, actions et score font partie du Compliance Manager.'),
  a.order({ id: 'p06-ev3', title: 'Mettre en place la rétention', comp: c1.comp, tags: c1.tags, role: 'eval', dim: 'fonctionner', lesson: 'p06-l1',
    st: 'Ordonnez la mise en place d’une règle de rétention.', items: [['s1', 'Identifier l’exigence légale ou d’affaires'], ['s2', 'Choisir politique ou étiquette'], ['s3', 'Configurer durée et action de fin'], ['s4', 'Tester sur un pilote'], ['s5', 'Déployer et documenter']], correct: ['s1', 's2', 's3', 's4', 's5'],
    exp: 'On part de l’exigence, on choisit, on configure, on teste puis on déploie.' }),
  Q('p06-ev4', 'eval', 'securiser', c1, 'Irréversibilité', 'Pourquoi valider le verrouillage de préservation avant de l’activer ?', ['La décision est irréversible.', 'Même un administrateur ne peut plus la modifier.'], [['Il coûte cher.', 'Faux.'], ['Il bloque l’audit.', 'Faux.'], ['Il est expérimental.', 'Faux.']], 'Le verrouillage est irréversible.'),
  Q('p06-ev5', 'eval', 'verifier', c2, 'Prérequis CloudAppEvents', 'Que faut-il pour voir les données DLP dans CloudAppEvents ?', ['Defender for Cloud Apps avec le connecteur Microsoft 365.', 'Prérequis documenté.'], [['Rien.', 'Faux.'], ['Un abonnement Intune.', 'Faux.'], ['Un cas eDiscovery.', 'Faux.']], 'Defender for Cloud Apps et le connecteur M365 sont requis.'),
  a.config({ id: 'p06-ev6', title: 'Requête exploratoire', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'verifier', lesson: 'p06-l2',
    st: 'Choisissez la bonne approche pour explorer les événements DLP.', fields: [
      { id: 'decouv', label: 'Découvrir les ActionType avec un filtre has', kind: 'toggle', accept: ['on'], why: 'Évite les valeurs inventées.' },
      { id: 'devine', label: 'Deviner des valeurs exactes d’ActionType', kind: 'toggle', accept: ['off'], why: 'Peut donner un résultat vide trompeur.' },
      { id: 'fenetre', label: 'Limiter à une fenêtre de 30 jours', kind: 'toggle', accept: ['on'], why: 'Correspond à la fenêtre de chasse.' },
    ], solution: { decouv: 'on', devine: 'off', fenetre: 'on' }, exp: 'On découvre d’abord, sur la fenêtre disponible.' }),
  Q('p06-ev7', 'eval', 'cout', c2, 'Durée des alertes', 'Où les alertes DLP sont-elles conservées six mois ?', ['Dans Defender.', 'Durée documentée.'], [['Dans Purview.', '30 jours.'], ['Dans Intune.', 'Faux.'], ['Nulle part.', 'Faux.']], 'Defender garde les alertes six mois.'),
  a.short({ id: 'p06-ev8', title: 'Conservation dans Purview', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'maintenir', lesson: 'p06-l2',
    st: 'Combien de jours les alertes DLP sont-elles gardées dans Purview ? (nombre)', accepted: ['30'], numeric: { value: 30 }, ph: 'un nombre',
    exp: 'Les alertes DLP sont gardées 30 jours dans Purview.' }),

  a.match({ id: 'p06-cs1', title: 'Cas : exigence et mécanisme', comp: c1.comp, tags: c1.tags, role: 'case', dim: 'fonctionner', lesson: 'p06-l1',
    st: 'Associez chaque exigence de Nordlys Technologies au mécanisme.', items: [['p1', 'Garder tous les courriels 7 ans'], ['p2', 'Garder un contrat précis 10 ans'], ['p3', 'Préserver un dossier en litige']],
    options: [['s1', 'Politique de rétention'], ['s2', 'Étiquette de rétention'], ['s3', 'Blocage eDiscovery']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'La politique couvre le général, l’étiquette l’élément et le blocage le dossier.' }),
  a.inspect({ id: 'p06-cs2', title: 'Cas : constat SOC à relire', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'verifier', lesson: 'p06-l2', language: 'text',
    st: 'Constat fictif. Repérez les raisonnements fautifs.',
    lines: [['p1', 'Il n’y a plus d’alertes DLP : le problème est réglé.', { ok: 'a1', fixes: [['a1', 'Vérifier la règle d’ajustement et la couverture avant de conclure'], ['a2', 'Accepter']] }], ['p2', 'La chasse couvre environ 30 jours.'], ['p3', 'Nous écrirons la requête avec des valeurs d’ActionType de mémoire.', { ok: 'b1', fixes: [['b1', 'Découvrir les valeurs avec un filtre has'], ['b2', 'Accepter']] }]],
    exp: 'Moins d’alertes peut venir d’un réglage, et il faut éviter les valeurs inventées.' }),
  a.workflow({ id: 'p06-cs3', title: 'Cas : traiter un pic d’alertes DLP', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'maintenir', lesson: 'p06-l2',
    st: 'Ordonnez le traitement d’un pic d’alertes DLP.',
    blocks: [['t1', 'Ouvrir l’incident dans Defender'], ['t2', 'Explorer CloudAppEvents sur 30 jours'], ['t3', 'Identifier la règle et le flux en cause'], ['t4', 'Décider : réglage, éducation ou escalade'], ['t5', 'Désactiver la politique sans analyse']],
    required: ['t1', 't2', 't3', 't4'], forbidden: ['t5'], before: [['t1', 't2'], ['t2', 't3'], ['t3', 't4']], notes: { t5: 'Supprime la protection sans comprendre.' }, solution: ['t1', 't2', 't3', 't4'],
    exp: 'On ouvre, on explore, on identifie puis on décide.' }),
  a.open({ id: 'p06-cs-open', title: 'Cas : plan d’exploitation Purview pour le SOC', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'maintenir', lesson: 'p06-l2',
    st: 'Rédigez le plan d’exploitation Purview d’un SOC fictif.',
    deliverable: 'Un document : traitement des alertes dans Defender, vérification de la règle d’ajustement, requêtes de chasse datées, rétention et conformité, boucle de réglage.',
    rubric: [['r1', 'Le traitement dans Defender est défini.', 'fonctionner'], ['r2', 'La règle d’ajustement est vérifiée.', 'verifier'], ['r3', 'Les requêtes sont exploratoires et datées.', 'verifier'], ['r4', 'La boucle de réglage est décrite.', 'maintenir'], ['r5', 'Les limites sont nommées.', 'securiser']],
    exp: 'Pas de note automatique : on juge la cohérence du plan.' }),

  Q('p06-rm1', 'remediation', 'comprendre', c1, 'Remédiation : rétention', 'À quelles questions répond la rétention ?', ['Combien de temps garder et quand supprimer.', 'Définition.'], [['Qui a fait quoi.', 'C’est l’audit.'], ['Qui est l’administrateur.', 'Faux.'], ['Quel est le prix.', 'Faux.']], 'La rétention répond à combien garder et quand supprimer.'),
  Q('p06-rm2', 'remediation', 'verifier', c1, 'Remédiation : score', 'Que représente un score de conformité ?', ['Les actions complétées dans l’outil, pas une attestation.', 'Lecture prudente.'], [['Une certification.', 'Faux.'], ['Une garantie légale.', 'Faux.'], ['Un audit externe.', 'Faux.']], 'Le score n’est pas une attestation de conformité.'),
  Q('p06-rm3', 'remediation', 'maintenir', c2, 'Remédiation : requête', 'Pourquoi une requête exploratoire ?', ['Pour découvrir les valeurs réelles avant de supposer.', 'Évite les résultats vides trompeurs.'], [['Pour aller plus vite sans vérifier.', 'Faux.'], ['Pour éviter la fenêtre.', 'Faux.'], ['Pour désactiver l’audit.', 'Faux.']], 'On découvre d’abord les valeurs réelles.'),
];

const competencies = [
  comp('p06', 1, 'Gérer rétention et conformité', 'Politiques, étiquettes, verrouillage et Compliance Manager.', ['Je choisis politique ou étiquette de rétention.', 'Je connais la primauté du blocage et l’irréversibilité du verrouillage.', 'Je lis un score sans le surinterpréter.']),
  comp('p06', 2, 'Exploiter Purview dans le SOC', 'Traitement dans Defender, règle d’ajustement et chasse.', ['Je traite les alertes dans Defender.', 'Je vérifie la règle d’ajustement.', 'J’écris une requête exploratoire datée.']),
];

const projects: AiProject[] = [
  project('p06', 1, 'avancé', 'Plan d’exploitation Purview du SOC', 'Rédiger pour un SOC fictif le plan de traitement des signaux Purview dans Defender, avec requêtes et boucle de réglage.', 'Plan de deux pages.', ['Définir le traitement des alertes.', 'Vérifier la règle d’ajustement.', 'Écrire les requêtes exploratoires datées.', 'Décrire la boucle de réglage.'], ['Le traitement est défini.', 'Les requêtes sont datées.', 'Les limites sont nommées.'], ['Conclure à partir d’une alerte absente.', 'Automatiser sans test.'], ['Ajouter la rétention des preuves.']),
];

export const p06 = assemble({ id: 'p06', level: 4, n: 6, title: 'Rétention, conformité et exploitation SOC',
  summary: 'Rétention et étiquettes de rétention, Compliance Manager, traitement des signaux Purview dans Defender XDR et chasse avancée sur CloudAppEvents.',
  lessons: [l1, l2], exercises, competencies, projects,
  caseTitle: 'Exploiter Purview au SOC de Nordlys Technologies',
  caseScenario: 'Vous choisissez des mécanismes de rétention et traitez un pic d’alertes DLP dans Defender. Actions simulées.', caseMinutes: 45 });
