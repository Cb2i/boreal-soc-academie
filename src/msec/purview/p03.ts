// Module 3 : Prévention des pertes de données (niveau 2).
import type { AiProject } from '../../agentic/types.ts';
import { assemble } from '../assemble.ts';
import { kit } from '../kit.ts';
import { comp, lesson, project } from './dsl.ts';

const { a, Q, M } = kit('p03');
const c1 = { comp: 'p03-c1', lesson: 'p03-l1', tags: ['dlp', 'emplacements', 'regles'] };
const c2 = { comp: 'p03-c2', lesson: 'p03-l2', tags: ['simulation', 'deploiement', 'reglage'] };

const l1 = lesson('p03', {
  n: 1, title: 'Anatomie d’une politique DLP : emplacements, règles et actions', minutes: 50,
  summary: 'Lire une politique DLP comme un SOC : emplacements, conditions, actions, priorité des règles et délai d’application.',
  objectives: ['Décomposer une politique en emplacements et règles (conditions, actions, notifications, priorité).', 'Prédire le résultat quand plusieurs règles correspondent.', 'Citer le délai d’application et les actions disponibles.'],
  prerequisites: ['Module 2'],
  body: [
    '## Ce que fait la DLP',
    'La **prévention des pertes de données** (DLP) détecte et limite le partage ou le transfert d’éléments sensibles. Une **politique** associe des **emplacements** (où elle s’applique) à des **règles** (quoi détecter et que faire). Les emplacements couvrent notamment Exchange, SharePoint, OneDrive, Teams, les **appareils** (Windows et macOS), les partages **sur site**, Fabric et Power BI, et, en préversion, Copilot. Plus la liste est large, plus le besoin de tests et d’exceptions augmente.',
    '## Les composantes d’une règle',
    'Une règle contient des **conditions** (type d’information sensible, étiquette, destinataire externe, nombre d’instances), des **actions**, des **notifications aux utilisateurs**, des **remplacements** (justification) et des **rapports d’incident**. Elle porte aussi une **priorité**. Les actions disponibles incluent *Audit only*, *Block with override* (blocage avec contournement justifié) et *Block*. L’action *Allow* n’existe que pour les appareils.',
    '| Action | Effet | Cas d’usage |',
    '| --- | --- | --- |',
    '| Audit only | Journalise sans bloquer | Mesure initiale |',
    '| Block with override | Bloque, mais l’utilisateur peut justifier | Éducation et friction contrôlée |',
    '| Block | Bloque sans contournement | Données les plus sensibles |',
    '| Allow (appareils) | Autorise explicitement | Exception sur les terminaux |',
    '## Quand plusieurs règles correspondent',
    'Quand un élément correspond à plusieurs règles, c’est l’**action la plus restrictive de la règle de plus haute priorité** qui s’applique. L’ordre des règles est donc une décision de conception, pas un détail : une règle large placée trop haut peut masquer une règle plus fine. Notez que *Stop processing more rules* ne fonctionne pas en mode simulation.',
    '## Délai et portée',
    'Une politique commence à agir environ **une heure** après son activation. Prévoir ce délai évite de conclure trop vite qu’une règle ne marche pas. Les appareils ont des prérequis propres (intégration à Defender for Endpoint, ensemble de conditions) à vérifier avant d’en promettre la couverture.',
    '## Lire une politique comme un analyste',
    'Quand une alerte arrive, posez cinq questions : quel **emplacement** ? quelle **règle** et quelle **priorité** ? quelle **condition** a déclenché ? quelle **action** a été appliquée ? quelle **justification** l’utilisateur a-t-il donnée ? La réponse oriente la suite : faux positif à régler, comportement à éduquer ou fuite à escalader.',
    '## Partage avec le reste de Purview',
    'La DLP lit les étiquettes de sensibilité et les types d’informations sensibles du module 2. Une étiquette bien appliquée simplifie une règle (condition sur l’étiquette plutôt que sur un motif), ce qui réduit le bruit. Les événements d’audit de la DLP alimentent aussi l’investigation et la chasse avancée (module 6).',
    '## Limites à retenir',
    'La DLP ne remplace pas la classification : elle applique une décision sur ce qui a été détecté. Elle est aussi limitée par l’emplacement : un canal non couvert n’est pas protégé.',
  ],
  demo: { title: 'Prédire le résultat', lines: [
    'Cas **fictif** : deux règles s’appliquent au même courriel.',
    '```text',
    'Règle 1 (priorité 0) : carte >= 1 instance        -> Block with override',
    'Règle 2 (priorité 1) : carte >= 10 instances      -> Block',
    '```',
    '**Lecture commentée.** La règle de plus haute priorité (0) l’emporte pour l’action la plus restrictive de celle-ci : le message reçoit un blocage avec contournement, même avec 12 numéros. La règle stricte devrait avoir la priorité la plus haute.',
    '**Ce que la démo ne prouve pas.** Aucune politique réelle n’a été exécutée.'] },
  revision: ['## Fiche : DLP', '- Politique = emplacements + règles.', '- Règle = conditions, actions, notifications, remplacements, rapports, priorité.', '- Actions : Audit only, Block with override, Block (Allow : appareils seulement).', '- Plusieurs règles : action la plus restrictive de la règle de plus haute priorité.', '- Environ une heure avant effet.'],
  links: ['dlp-learn', 'dlp-ref', 'dlp-create'], teaches: ['dlp', 'emplacements', 'regles'],
});

const l2 = lesson('p03', {
  n: 2, title: 'Déployer et régler une DLP : mode simulation et quatre temps', minutes: 55,
  summary: 'Passer du plan à l’application sans casser le travail : simulation, conseils de politique, activation et réglage, avec les limites du mode simulation.',
  objectives: ['Décrire les quatre temps : planifier, simuler, simuler avec conseils, appliquer.', 'Citer les limites du mode simulation (15 jours, 100 éléments, règles).', 'Relier les alertes DLP au traitement par le SOC.'],
  prerequisites: ['Leçon précédente'],
  body: [
    '## Pourquoi un déploiement par étapes',
    'Une politique appliquée d’emblée bloque du travail légitime, génère des tickets et pousse les utilisateurs à contourner. Le mode **simulation** évalue l’effet d’une politique **sans appliquer d’action** : on mesure les correspondances, on règle, puis on active. Le cycle recommandé comporte **quatre temps** : planifier, simuler, simuler avec conseils de politique, appliquer.',
    '| Temps | Ce qu’on fait | Ce qu’on mesure |',
    '| --- | --- | --- |',
    '| 1. Planifier | Choisir données, emplacements, règles | Périmètre clair |',
    '| 2. Simuler | Activer sans action | Correspondances, faux positifs |',
    '| 3. Simuler avec conseils | Afficher des conseils aux utilisateurs | Réactions, contournements |',
    '| 4. Appliquer | Activer les actions | Impact et alertes |',
    '## Les limites du mode simulation',
    'La simulation dure **jusqu’à 15 jours** et les données sont conservées **30 jours**. Pour SharePoint et OneDrive, elle évalue les éléments **existants et nouveaux** ; pour Exchange, Teams et les appareils, seulement les **nouveaux**. La liste *Items for review* est limitée à **100 éléments par site et par règle**. *Stop processing more rules* ne fonctionne pas en simulation. Avec les conseils de politique, une action *Block* devient *Block with override* afin de ne pas empêcher les utilisateurs de travailler.',
    '## Régler pendant la simulation',
    'Regardez d’abord les règles les plus bruyantes : un type d’information sensible trop large, un emplacement où les faux positifs dominent, un échange interne légitime. Ajustez la confiance, le nombre d’instances, les exclusions ou la condition (par exemple, étiquette plutôt que motif), puis comparez avant de passer à l’étape suivante. Notez les décisions : elles justifient le passage.',
    '## Critères de passage',
    'Passez de la simulation à l’application quand les faux positifs sont acceptables, quand les propriétaires des données ont validé les exceptions et quand le processus de traitement des alertes est prêt. Sinon, la politique appliquée créera une file d’attente que personne ne traite.',
    '## Traiter les alertes',
    'Les alertes de DLP sont conservées **30 jours** dans Purview et **six mois** dans Defender. Le **portail Defender** et sa file d’incidents sont recommandés pour le traitement, car ils regroupent les alertes de plusieurs produits. Définissez qui trie, qui enquête et en combien de temps, avant l’application.',
    '## Communication',
    'Informez les utilisateurs avant les conseils de politique : un message de conseil sans contexte est perçu comme une panne. Prévoyez un canal d’aide et un moyen de signaler les faux positifs.',
    '## Retour arrière',
    'Gardez toujours la possibilité de repasser en simulation ou d’abaisser l’action (de *Block* à *Block with override*) si l’impact est trop fort. Documentez le déclencheur du retour arrière.',
  ],
  demo: { title: 'Décider du passage', lines: [
    'Bilan **fictif** après 12 jours de simulation :',
    '```text',
    'Correspondances : 640   Faux positifs estimés : 38 %   Contournements prévus : élevés',
    'Décision : ajuster la confiance, exclure la liste interne de paie, prolonger de 3 jours',
    '```',
    '**Lecture commentée.** Un taux de faux positifs de 38 % ne justifie pas l’application. On règle, on prolonge dans la limite de 15 jours et on remesure.',
    '**Ce que la démo ne prouve pas.** Les chiffres sont inventés.'] },
  revision: ['## Fiche : déploiement DLP', '- Quatre temps : planifier, simuler, simuler avec conseils, appliquer.', '- Simulation : 15 jours max, données gardées 30 jours.', '- Items for review : 100 par site et par règle.', '- Alertes : 30 jours dans Purview, six mois dans Defender.', '- Retour arrière documenté.'],
  links: ['dlp-plan', 'dlp-sim', 'dlp-sim-start', 'dlp-alerts'], teaches: ['simulation', 'deploiement', 'reglage'],
});

const exercises = [
  a.match({ id: 'p03-l1-g', title: 'Action et effet', comp: c1.comp, tags: c1.tags, role: 'guided', dim: 'comprendre', lesson: 'p03-l1',
    st: 'Associez chaque action à son effet.', items: [['p1', 'Audit only'], ['p2', 'Block with override'], ['p3', 'Block']],
    options: [['s1', 'Journalise sans bloquer'], ['s2', 'Bloque, mais l’utilisateur peut justifier'], ['s3', 'Bloque sans contournement']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Audit only mesure, Block with override éduque et Block interdit.' }),
  a.inspect({ id: 'p03-l1-a', title: 'Relire un ordre de règles', comp: c1.comp, tags: c1.tags, role: 'autonomous', dim: 'verifier', lesson: 'p03-l1', language: 'text',
    st: 'Plan fictif de règles DLP. Repérez les raisonnements fautifs.',
    lines: [['p1', 'La règle large est en priorité 0 et la règle stricte en priorité 5 : tout ira bien.', { ok: 'a1', fixes: [['a1', 'Placer la règle stricte avant la règle large'], ['a2', 'Accepter']] }], ['p2', 'Une politique commence à agir environ une heure après son activation.'], ['p3', 'L’action Allow est disponible pour Exchange.', { ok: 'b1', fixes: [['b1', 'Allow n’existe que pour les appareils'], ['b2', 'Accepter']] }]],
    exp: 'L’ordre des priorités et le champ de l’action Allow sont deux pièges classiques.' }),
  Q('p03-l1-qa', 'quiz', 'comprendre', c1, 'Composition', 'De quoi une politique DLP est-elle faite ?', ['D’emplacements et de règles.', 'Définition de la politique.'], [['D’étiquettes seulement.', 'Faux.'], ['D’un script.', 'Faux.'], ['D’un cas eDiscovery.', 'Faux.']], 'Une politique associe emplacements et règles.'),
  Q('p03-l1-qb', 'quiz', 'fonctionner', c1, 'Priorité', 'Plusieurs règles correspondent. Que s’applique-t-il ?', ['L’action la plus restrictive de la règle de plus haute priorité.', 'Règle documentée.'], [['La plus permissive.', 'Faux.'], ['Toutes à la fois.', 'Faux.'], ['Une au hasard.', 'Faux.']], 'On applique l’action la plus restrictive de la règle de plus haute priorité.'),
  Q('p03-l1-qc', 'quiz', 'maintenir', c1, 'Délai', 'Combien de temps environ après activation une politique prend-elle effet ?', ['Environ une heure.', 'Délai documenté.'], [['Immédiatement.', 'Faux.'], ['Une semaine.', 'Faux.'], ['Un mois.', 'Faux.']], 'Une politique commence à agir environ une heure après son activation.'),

  a.order({ id: 'p03-l2-g', title: 'Les quatre temps', comp: c2.comp, tags: c2.tags, role: 'guided', dim: 'fonctionner', lesson: 'p03-l2',
    st: 'Ordonnez le déploiement.', items: [['s1', 'Planifier'], ['s2', 'Simuler'], ['s3', 'Simuler avec conseils de politique'], ['s4', 'Appliquer']], correct: ['s1', 's2', 's3', 's4'],
    exp: 'On planifie, on simule, on simule avec conseils puis on applique.' }),
  a.config({ id: 'p03-l2-a', title: 'Paramétrer la simulation', comp: c2.comp, tags: c2.tags, role: 'autonomous', dim: 'securiser', lesson: 'p03-l2',
    st: 'Paramétrez la première phase de la politique.', fields: [
      { id: 'sim', label: 'Mode simulation avec journalisation', kind: 'toggle', accept: ['on'], why: 'Mesure sans appliquer d’action.' },
      { id: 'app', label: 'Application directe sans simulation', kind: 'toggle', accept: ['off'], why: 'Risque de blocage du travail légitime.' },
      { id: 'proc', label: 'Processus de traitement des alertes prêt', kind: 'toggle', accept: ['on'], why: 'Évite une file d’attente non traitée.' },
    ], solution: { sim: 'on', app: 'off', proc: 'on' }, exp: 'On simule, on prépare le traitement des alertes et on n’applique pas directement.' }),
  Q('p03-l2-qa', 'quiz', 'comprendre', c2, 'Durée max', 'Quelle est la durée maximale de la simulation ?', ['15 jours.', 'Limite documentée.'], [['24 heures.', 'Faux.'], ['90 jours.', 'Faux.'], ['Illimitée.', 'Faux.']], 'La simulation dure jusqu’à 15 jours.'),
  Q('p03-l2-qb', 'quiz', 'verifier', c2, 'Éléments pour revue', 'Quelle limite s’applique à la liste Items for review ?', ['100 éléments par site et par règle.', 'Limite documentée.'], [['10 éléments.', 'Faux.'], ['Illimitée.', 'Faux.'], ['1 000 par règle.', 'Faux.']], 'La liste est limitée à 100 éléments par site et par règle.'),
  Q('p03-l2-qc', 'quiz', 'maintenir', c2, 'Conservation des alertes', 'Où et combien de temps les alertes DLP sont-elles conservées ?', ['30 jours dans Purview et six mois dans Defender.', 'Durées documentées.'], [['Un an partout.', 'Faux.'], ['7 jours partout.', 'Faux.'], ['Indéfiniment.', 'Faux.']], 'Les alertes sont gardées 30 jours dans Purview et six mois dans Defender.'),

  Q('p03-ev1', 'eval', 'comprendre', c1, 'Action Allow', 'Pour quels emplacements l’action Allow est-elle disponible ?', ['Les appareils.', 'Seule exception.'], [['Exchange.', 'Faux.'], ['Teams.', 'Faux.'], ['Tous.', 'Faux.']], 'Allow existe seulement pour les appareils.'),
  M('p03-ev2', 'eval', 'comprendre', c1, 'Emplacements DLP', 'Cochez les emplacements couverts par la DLP.', [['Exchange.', 'Couvert.'], ['SharePoint et OneDrive.', 'Couverts.'], ['Appareils.', 'Couverts.']], [['Le navigateur de l’utilisateur seul.', 'Pas un emplacement listé ainsi.'], ['La corbeille du poste.', 'Pas un emplacement.']], 'Exchange, SharePoint, OneDrive, Teams et appareils font partie des emplacements.'),
  a.order({ id: 'p03-ev3', title: 'Traiter une alerte DLP', comp: c1.comp, tags: c1.tags, role: 'eval', dim: 'fonctionner', lesson: 'p03-l1',
    st: 'Ordonnez le traitement d’une alerte DLP.', items: [['s1', 'Lire l’emplacement et la règle'], ['s2', 'Vérifier la condition et la priorité'], ['s3', 'Lire l’action et la justification'], ['s4', 'Décider : faux positif, éducation ou escalade'], ['s5', 'Documenter']], correct: ['s1', 's2', 's3', 's4', 's5'],
    exp: 'On lit le contexte, on comprend le déclenchement, on décide puis on documente.' }),
  Q('p03-ev4', 'eval', 'securiser', c2, 'Block en simulation avec conseils', 'En simulation avec conseils de politique, que devient une action Block ?', ['Block with override.', 'Pour ne pas empêcher le travail.'], [['Elle reste Block.', 'Faux.'], ['Elle devient Allow.', 'Faux.'], ['Elle est ignorée.', 'Faux.']], 'Block devient Block with override pendant cette phase.'),
  Q('p03-ev5', 'eval', 'verifier', c2, 'Portée de la simulation', 'Quels éléments la simulation évalue-t-elle pour SharePoint et OneDrive ?', ['Les éléments existants et nouveaux.', 'Comportement documenté.'], [['Seulement les nouveaux.', 'C’est le cas d’Exchange.'], ['Seulement les anciens.', 'Faux.'], ['Aucun.', 'Faux.']], 'SharePoint et OneDrive évaluent existants et nouveaux.'),
  a.config({ id: 'p03-ev6', title: 'Critères de passage', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'securiser', lesson: 'p03-l2',
    st: 'Cochez les conditions avant d’appliquer.', fields: [
      { id: 'fp', label: 'Faux positifs jugés acceptables', kind: 'toggle', accept: ['on'], why: 'Condition de passage.' },
      { id: 'own', label: 'Exceptions validées par les propriétaires', kind: 'toggle', accept: ['on'], why: 'Évite de bloquer du travail légitime.' },
      { id: 'q', label: 'Aucun processus de traitement des alertes', kind: 'toggle', accept: ['off'], why: 'Il doit exister avant l’application.' },
    ], solution: { fp: 'on', own: 'on', q: 'off' }, exp: 'On applique quand le bruit est acceptable, les exceptions validées et le traitement prêt.' }),
  a.short({ id: 'p03-ev7', title: 'Durée de conservation', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'maintenir', lesson: 'p03-l2',
    st: 'Combien de jours les données de simulation sont-elles conservées ? (nombre)', accepted: ['30'], numeric: { value: 30 }, ph: 'un nombre',
    exp: 'Les données de simulation sont conservées 30 jours.' }),
  Q('p03-ev8', 'eval', 'cout', c2, 'Où traiter', 'Où recommande-t-on de traiter les alertes DLP ?', ['Dans la file d’incidents du portail Defender.', 'Regroupe plusieurs produits.'], [['Dans une boîte courriel personnelle.', 'Non recommandé.'], ['Sur papier.', 'Non.'], ['Nulle part.', 'Faux.']], 'La file d’incidents Defender est recommandée.'),

  a.match({ id: 'p03-cs1', title: 'Cas : symptôme et action', comp: c1.comp, tags: c1.tags, role: 'case', dim: 'fonctionner', lesson: 'p03-l1',
    st: 'Associez chaque situation de Nordlys Technologies à la bonne action.', items: [['p1', 'Mesurer sans bloquer'], ['p2', 'Éduquer avec justification'], ['p3', 'Interdire un envoi de données très sensibles']],
    options: [['s1', 'Audit only'], ['s2', 'Block with override'], ['s3', 'Block']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Audit only mesure, Block with override éduque et Block interdit.' }),
  a.inspect({ id: 'p03-cs2', title: 'Cas : plan de déploiement à relire', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'securiser', lesson: 'p03-l2', language: 'text',
    st: 'Plan fictif. Repérez les failles.',
    lines: [['p1', 'Nous activons Block directement sur tous les emplacements.', { ok: 'a1', fixes: [['a1', 'Passer par la simulation et les conseils de politique'], ['a2', 'Accepter']] }], ['p2', 'Le traitement des alertes est confié à la file d’incidents Defender.'], ['p3', 'Nous ne préviendrons pas les utilisateurs.', { ok: 'b1', fixes: [['b1', 'Informer avant les conseils de politique'], ['b2', 'Accepter']] }]],
    exp: 'L’application directe et l’absence de communication sont deux défauts.' }),
  a.workflow({ id: 'p03-cs3', title: 'Cas : régler une règle bruyante', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'verifier', lesson: 'p03-l2',
    st: 'Ordonnez le réglage d’une règle bruyante.',
    blocks: [['t1', 'Identifier la règle la plus bruyante'], ['t2', 'Analyser la cause (seuil, emplacement, flux interne)'], ['t3', 'Ajuster confiance, instances ou exclusions'], ['t4', 'Remesurer en simulation'], ['t5', 'Désactiver la journalisation']],
    required: ['t1', 't2', 't3', 't4'], forbidden: ['t5'], before: [['t1', 't2'], ['t2', 't3'], ['t3', 't4']], notes: { t5: 'Supprime la preuve.' }, solution: ['t1', 't2', 't3', 't4'],
    exp: 'On identifie, on comprend, on ajuste puis on remesure.' }),
  a.open({ id: 'p03-cs-open', title: 'Cas : plan de déploiement DLP', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'maintenir', lesson: 'p03-l2',
    st: 'Rédigez le plan de déploiement DLP en quatre temps d’une organisation fictive.',
    deliverable: 'Un document : périmètre, règles et priorités, durées de simulation, critères de passage, traitement des alertes et retour arrière.',
    rubric: [['r1', 'Les quatre temps sont présents avec une mesure à chaque étape.', 'fonctionner'], ['r2', 'Les limites de la simulation sont citées.', 'verifier'], ['r3', 'Le traitement des alertes est défini.', 'maintenir'], ['r4', 'Le retour arrière existe.', 'securiser'], ['r5', 'Les sources sont datées.', 'verifier']],
    exp: 'Pas de note automatique : on juge la cohérence du plan.' }),

  Q('p03-rm1', 'remediation', 'comprendre', c1, 'Remédiation : politique', 'Qu’associe une politique DLP ?', ['Des emplacements à des règles.', 'Structure de base.'], [['Des étiquettes à des cas.', 'Faux.'], ['Des rôles à des licences.', 'Faux.'], ['Des SIT à des audits.', 'Faux.']], 'Une politique associe des emplacements et des règles.'),
  Q('p03-rm2', 'remediation', 'securiser', c2, 'Remédiation : simulation', 'Pourquoi simuler avant d’appliquer ?', ['Pour mesurer l’effet sans appliquer d’action.', 'Réduit le risque.'], [['Pour éviter la licence.', 'Faux.'], ['Pour supprimer l’audit.', 'Faux.'], ['Pour accélérer le blocage.', 'Faux.']], 'La simulation mesure l’effet sans action.'),
  Q('p03-rm3', 'remediation', 'maintenir', c2, 'Remédiation : retour arrière', 'Que faut-il toujours prévoir ?', ['Un retour arrière : repasser en simulation ou abaisser l’action.', 'Bonne pratique.'], [['Aucun plan.', 'Risqué.'], ['Un blocage définitif.', 'Risqué.'], ['La suppression de la politique sans trace.', 'Perd la preuve.']], 'On documente le retour arrière avant d’appliquer.'),
];

const competencies = [
  comp('p03', 1, 'Lire une politique DLP', 'Emplacements, règles, actions, priorité et délai.', ['Je décompose une politique.', 'Je prédis le résultat de plusieurs règles.', 'Je connais le délai d’application.']),
  comp('p03', 2, 'Déployer et régler la DLP', 'Quatre temps, limites de simulation et traitement des alertes.', ['Je planifie les quatre temps.', 'Je cite les limites de la simulation.', 'Je prévois traitement des alertes et retour arrière.']),
];

const projects: AiProject[] = [
  project('p03', 1, 'avancé', 'Plan de déploiement d’une politique DLP', 'Planifier pour une organisation fictive une politique DLP du plan à l’application, avec critères de passage.', 'Plan d’une page par temps.', ['Cadrer données et emplacements.', 'Définir règles et priorités.', 'Planifier simulation et conseils.', 'Définir le traitement des alertes.'], ['Chaque temps a un critère mesurable.', 'Les limites sont citées.', 'Le retour arrière existe.'], ['Appliquer sans simuler.', 'Ignorer les faux positifs.'], ['Relier au portail Defender.']),
];

export const p03 = assemble({ id: 'p03', level: 2, n: 3, title: 'Prévention des pertes de données',
  summary: 'Anatomie d’une politique DLP, priorité des règles, mode simulation, quatre temps de déploiement et traitement des alertes.',
  lessons: [l1, l2], exercises, competencies, projects,
  caseTitle: 'Déployer la DLP chez Nordlys Technologies',
  caseScenario: 'Vous réglez des règles, planifiez un déploiement en quatre temps et prévoyez le traitement des alertes. Actions simulées.', caseMinutes: 45 });
