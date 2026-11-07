// Module 4 : Risques internes et communications (niveau 3).
import type { AiProject } from '../../agentic/types.ts';
import { assemble } from '../assemble.ts';
import { kit } from '../kit.ts';
import { comp, lesson, project } from './dsl.ts';

const { a, Q, M } = kit('p04');
const c1 = { comp: 'p04-c1', lesson: 'p04-l1', tags: ['irm', 'risques-internes', 'confidentialite'] };
const c2 = { comp: 'p04-c2', lesson: 'p04-l2', tags: ['communication-compliance', 'echantillonnage', 'stockage'] };

const l1 = lesson('p04', {
  n: 1, title: 'Insider Risk Management : politiques, déclencheurs et vie privée', minutes: 50,
  summary: 'Comprendre comment la gestion des risques internes détecte des comportements à risque, quels prérequis elle exige et comment elle protège la vie privée.',
  objectives: ['Expliquer le rôle des modèles de politique, des événements déclencheurs et des indicateurs.', 'Citer les prérequis (connecteur RH, Defender for Endpoint) selon le modèle.', 'Décrire la pseudonymisation et la séparation des rôles qui protègent la vie privée.'],
  prerequisites: ['Module 3'],
  body: [
    '## Un angle différent de la DLP',
    'La DLP agit sur un **élément** qui correspond à une règle. La **gestion des risques internes** (Insider Risk Management, IRM) observe des **comportements d’utilisateurs** dans le temps : téléchargements massifs, envoi vers des destinations personnelles, activité inhabituelle avant un départ. Elle ne prouve pas une intention malveillante : elle signale un risque à examiner, avec un processus d’enquête encadré.',
    '## Modèles de politique et indicateurs',
    'On crée une politique à partir d’un **modèle** qui détermine les activités surveillées et les scénarios (vol de données par des utilisateurs qui partent, fuite de données générale, comportements à risque). Chaque modèle active des **indicateurs** (activités sur les fichiers, courriels, appareils, services infonuagiques) et des seuils. Certains modèles exigent des prérequis : un **connecteur RH** pour les départs, l’intégration à **Microsoft Defender for Endpoint** pour les activités sur les appareils.',
    '| Besoin | Prérequis typique |',
    '| --- | --- |',
    '| Départ d’un employé | Connecteur RH |',
    '| Activités sur les appareils | Intégration à Defender for Endpoint |',
    '| Signaux de DLP | Partage des alertes DLP avec IRM |',
    '| Corrélation avec les incidents | Partage de données avec Defender XDR |',
    '## Événements déclencheurs et comportement cumulatif',
    'Un **événement déclencheur** (départ prévu, alerte DLP) fait entrer l’utilisateur dans le périmètre de la politique. La détection de **sortie cumulative de données** compare l’activité de l’utilisateur à sa propre norme et à celle de ses pairs sur une période de **30 jours** : un volume ordinaire pour un rôle peut être anormal pour un autre. Les **politiques rapides** (quick policies) offrent un démarrage plus simple, mais moins personnalisable.',
    '## Vie privée et séparation des tâches',
    'Par défaut, les utilisateurs sont **pseudonymisés** dans l’interface : les analystes voient d’abord des identifiants masqués. Des groupes de rôles distincts séparent l’administration, l’analyse et l’enquête. Une alerte montre des activités, pas une preuve de faute : le dossier est transmis aux ressources humaines ou au juridique selon un processus défini. L’escalade vers un cas **eDiscovery** est possible pour conserver et examiner le contenu (module 5).',
    '## Santé de la politique',
    'Des **avertissements de santé** signalent un problème : prérequis manquant, indicateur désactivé, connecteur en erreur. Un SOC qui lit les alertes sans vérifier cette santé risque de croire à une couverture qui n’existe pas.',
    '## Lien avec le SOC',
    'Le partage des signaux avec Defender XDR (en préversion pour certaines fonctions) permet d’enrichir un incident avec le contexte de risque interne. Le SOC reste prudent : un indicateur de risque est une piste, pas une conclusion.',
    '## Limites à nommer',
    'L’IRM dépend des signaux activés, de la qualité des connecteurs et des seuils. Elle ne couvre pas un comportement qu’aucun indicateur n’observe, et elle exige un cadre juridique et RH clair avant le déploiement.',
  ],
  demo: { title: 'Lire un signal', lines: [
    'Signal **fictif** : un utilisateur pseudonymisé envoie 40 fichiers vers un stockage personnel après un événement de départ.',
    '```text',
    'Déclencheur   : départ planifié (connecteur RH)',
    'Indicateur    : sortie cumulative 30 jours, au-dessus de la norme des pairs',
    'Décision      : examiner dans le cadre du processus, ne pas conclure',
    '```',
    '**Lecture commentée.** On valide d’abord la santé de la politique, puis on examine le contexte. On ne conclut pas à une faute à partir d’un seul signal.',
    '**Ce que la démo ne prouve pas.** Aucune politique réelle n’existe.'] },
  revision: ['## Fiche : IRM', '- Observe des comportements dans le temps, pas un élément isolé.', '- Modèle de politique, indicateurs, déclencheurs, sortie cumulative (30 jours, pairs).', '- Prérequis : connecteur RH, Defender for Endpoint selon le cas.', '- Pseudonymisation par défaut, rôles séparés.', '- Avertissements de santé à surveiller.'],
  links: ['irm', 'irm-policies', 'irm-templates', 'irm-share', 'irm-defender'], teaches: ['irm', 'risques-internes', 'confidentialite'],
});

const l2 = lesson('p04', {
  n: 2, title: 'Communication Compliance : politiques, échantillonnage et stockage', minutes: 45,
  summary: 'Configurer une politique de conformité des communications, mesurer ce qu’elle examine et respecter les limites de stockage.',
  objectives: ['Décrire les scénarios et conditions (direction, échantillonnage, filtre des envois en masse).', 'Citer la limite de stockage et le comportement à l’atteinte.', 'Séparer les rôles et respecter les contraintes d’administration.'],
  prerequisites: ['Leçon précédente'],
  body: [
    '## À quoi sert la solution',
    '**Communication Compliance** aide à détecter des communications qui enfreignent des politiques de conduite ou de réglementation : langage inapproprié, partage d’informations sensibles, conflits d’intérêts. Elle examine des messages (Exchange, Teams, Viva Engage et autres sources) selon des **conditions** et envoie les correspondances à des **réviseurs** habilités.',
    '## Concevoir une politique',
    'Une politique précise la **portée** (utilisateurs ou groupes surveillés, et reviseurs), les **sources** de communication, les **conditions** (mots-clés, types d’informations sensibles, classificateurs, étiquette) et les **options**. Une condition de **direction** limite l’examen aux messages entrants, sortants ou internes. Un **pourcentage d’échantillonnage** réduit le volume de messages revus. L’option **Filter email blasts** écarte les envois en masse (infolettres) pour réduire le bruit.',
    '| Réglage | Effet | Risque si mal réglé |',
    '| --- | --- | --- |',
    '| Direction | Limite entrant, sortant ou interne | Angle mort ou trop de bruit |',
    '| Échantillonnage | Réduit le volume revu | Manquer un cas rare |',
    '| Filtre des envois en masse | Écarte les infolettres | Écarter par erreur un message utile |',
    '| Étendue des utilisateurs | Limite aux personnes visées | Surveillance trop large |',
    '## Stockage et limites',
    'Chaque politique stocke ses messages correspondants jusqu’à **100 Go ou un million de messages**. Des notifications sont envoyées à **80 %, 90 % et 95 %**, puis la politique est **désactivée** à l’atteinte de la limite. Surveillez le volume : une politique trop large s’éteint sans bruit si personne ne lit les notifications.',
    '## Rôles et contraintes',
    'L’accès repose sur des **groupes de rôles** dédiés (administrateurs, analystes, enquêteurs, réviseurs). La gestion des politiques ne se fait **pas** par PowerShell, et une politique **ne peut pas être renommée** après création : choisissez un nom clair. Les choix de portée et de réviseurs doivent respecter le cadre légal et les ententes avec les représentants du personnel.',
    '## Boucle de traitement',
    'Un message est signalé, un réviseur le classe (question, résolu, escalade) et, si nécessaire, le cas est transmis aux RH, au juridique ou à un autre processus. L’efficacité se mesure au taux de correspondances utiles, pas au volume brut.',
    '## Lien avec le reste de Purview',
    'La solution utilise les types d’informations sensibles et les classificateurs du module 2, ce qui renforce l’intérêt de les tester avant usage. Elle partage aussi des signaux avec d’autres solutions de risque.',
    '## Limites à nommer',
    'Elle ne couvre que les sources configurées et peut produire des faux positifs linguistiques. Un réglage mal pensé crée un risque de surveillance disproportionnée.',
  ],
  demo: { title: 'Calibrer une politique', lines: [
    'Cas **fictif** : politique sur les communications sortantes vers l’extérieur.',
    '```text',
    'Direction : sortant   Échantillonnage : 30 %   Filtre envois en masse : activé',
    'Stockage : 62 Go sur 100 Go après six semaines',
    '```',
    '**Lecture commentée.** À ce rythme, la limite de 100 Go sera atteinte dans environ 4 semaines : réduire la portée ou l’échantillonnage avant les notifications à 80 %.',
    '**Ce que la démo ne prouve pas.** Les volumes sont inventés.'] },
  revision: ['## Fiche : Communication Compliance', '- Conditions : mots-clés, SIT, classificateurs, direction.', '- Échantillonnage et filtre des envois en masse réduisent le volume.', '- Limite : 100 Go ou un million de messages ; avis à 80/90/95 %, puis désactivation.', '- Pas de PowerShell pour les politiques ; pas de renommage.'],
  links: ['cc', 'cc-policies', 'cc-plan'], teaches: ['communication-compliance', 'echantillonnage', 'stockage'],
});

const exercises = [
  a.match({ id: 'p04-l1-g', title: 'Besoin et prérequis', comp: c1.comp, tags: c1.tags, role: 'guided', dim: 'comprendre', lesson: 'p04-l1',
    st: 'Associez chaque besoin à son prérequis.', items: [['p1', 'Détecter un départ d’employé'], ['p2', 'Observer les activités sur les appareils'], ['p3', 'Enrichir un incident Defender']],
    options: [['s1', 'Connecteur RH'], ['s2', 'Intégration à Defender for Endpoint'], ['s3', 'Partage de données avec Defender XDR']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Le connecteur RH fournit les départs, Defender for Endpoint les appareils et le partage XDR l’enrichissement.' }),
  a.inspect({ id: 'p04-l1-a', title: 'Relire une conclusion hâtive', comp: c1.comp, tags: c1.tags, role: 'autonomous', dim: 'verifier', lesson: 'p04-l1', language: 'text',
    st: 'Note fictive d’un analyste. Repérez les raisonnements fautifs.',
    lines: [['p1', 'Le signal de sortie cumulative prouve que l’employé a volé des données.', { ok: 'a1', fixes: [['a1', 'C’est un risque à examiner, pas une preuve'], ['a2', 'Accepter']] }], ['p2', 'Les utilisateurs sont pseudonymisés par défaut.'], ['p3', 'Pas besoin de vérifier la santé de la politique.', { ok: 'b1', fixes: [['b1', 'Vérifier les avertissements de santé avant de se fier à la couverture'], ['b2', 'Accepter']] }]],
    exp: 'Un signal n’est pas une preuve et la santé de la politique conditionne la couverture.' }),
  Q('p04-l1-qa', 'quiz', 'comprendre', c1, 'Objet', 'Que l’IRM observe-t-elle surtout ?', ['Des comportements d’utilisateurs dans le temps.', 'Approche comportementale.'], [['Un seul élément isolé.', 'C’est plutôt la DLP.'], ['Les licences.', 'Faux.'], ['Les rôles.', 'Faux.']], 'L’IRM observe des comportements dans le temps.'),
  Q('p04-l1-qb', 'quiz', 'securiser', c1, 'Vie privée', 'Comment les utilisateurs apparaissent-ils par défaut ?', ['Pseudonymisés.', 'Protection de la vie privée.'], [['Avec leur nom complet.', 'Faux.'], ['Avec leur mot de passe.', 'Faux.'], ['Jamais.', 'Faux.']], 'Les utilisateurs sont pseudonymisés par défaut.'),
  Q('p04-l1-qc', 'quiz', 'verifier', c1, 'Période de référence', 'Sur quelle période compare-t-on la sortie cumulative aux pairs ?', ['30 jours.', 'Période documentée.'], [['24 heures.', 'Faux.'], ['5 ans.', 'Faux.'], ['Jamais.', 'Faux.']], 'La comparaison porte sur 30 jours.'),

  a.match({ id: 'p04-l2-g', title: 'Réglage et effet', comp: c2.comp, tags: c2.tags, role: 'guided', dim: 'comprendre', lesson: 'p04-l2',
    st: 'Associez chaque réglage à son effet.', items: [['p1', 'Direction'], ['p2', 'Échantillonnage'], ['p3', 'Filter email blasts']],
    options: [['s1', 'Limite aux messages entrants, sortants ou internes'], ['s2', 'Réduit le volume de messages revus'], ['s3', 'Écarte les envois en masse']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Chaque réglage réduit une partie du volume examiné.' }),
  a.config({ id: 'p04-l2-a', title: 'Paramétrer une politique', comp: c2.comp, tags: c2.tags, role: 'autonomous', dim: 'securiser', lesson: 'p04-l2',
    st: 'Paramétrez une politique sur les messages sortants vers l’extérieur.', fields: [
      { id: 'dir', label: 'Direction : sortant', kind: 'toggle', accept: ['on'], why: 'Limite le périmètre au besoin.' },
      { id: 'ech', label: 'Échantillonnage adapté au volume', kind: 'toggle', accept: ['on'], why: 'Évite de saturer le stockage.' },
      { id: 'tout', label: 'Surveiller tous les employés sans motif', kind: 'toggle', accept: ['off'], why: 'Surveillance disproportionnée.' },
    ], solution: { dir: 'on', ech: 'on', tout: 'off' }, exp: 'On limite la direction, on échantillonne et on évite la surveillance générale.' }),
  Q('p04-l2-qa', 'quiz', 'comprendre', c2, 'Limite de stockage', 'Quelle est la limite de stockage d’une politique ?', ['100 Go ou un million de messages.', 'Limite documentée.'], [['1 Go.', 'Faux.'], ['10 To.', 'Faux.'], ['Aucune.', 'Faux.']], 'La limite est de 100 Go ou un million de messages.'),
  Q('p04-l2-qb', 'quiz', 'maintenir', c2, 'Atteinte de la limite', 'Que se passe-t-il à l’atteinte de la limite ?', ['La politique est désactivée.', 'Après des avis à 80, 90 et 95 %.'], [['Elle continue sans limite.', 'Faux.'], ['Elle supprime les messages.', 'Faux.'], ['Elle change de nom.', 'Faux.']], 'La politique est désactivée à l’atteinte de la limite.'),
  Q('p04-l2-qc', 'quiz', 'fonctionner', c2, 'Contraintes', 'Laquelle de ces affirmations est exacte ?', ['Une politique ne peut pas être renommée.', 'Contrainte documentée.'], [['On gère les politiques par PowerShell.', 'Non pris en charge.'], ['Le nom peut changer à volonté.', 'Faux.'], ['Les rôles ne comptent pas.', 'Faux.']], 'Les politiques ne se renomment pas et ne se gèrent pas par PowerShell.'),

  Q('p04-ev1', 'eval', 'comprendre', c1, 'Différence avec la DLP', 'Quelle différence principale entre IRM et DLP ?', ['L’IRM observe des comportements dans le temps, la DLP agit sur des éléments.', 'Deux approches complémentaires.'], [['Aucune.', 'Faux.'], ['L’IRM bloque les courriels.', 'Faux.'], ['La DLP observe les pairs.', 'Faux.']], 'L’IRM est comportementale, la DLP porte sur des éléments.'),
  M('p04-ev2', 'eval', 'comprendre', c1, 'Prérequis possibles', 'Cochez les prérequis cités selon le modèle.', [['Connecteur RH.', 'Pour les départs.'], ['Defender for Endpoint.', 'Pour les appareils.'], ['Partage avec Defender XDR.', 'Pour l’enrichissement.']], [['Une licence Audit Premium obligatoire pour tout.', 'Faux.'], ['Un script PowerShell.', 'Faux.']], 'Connecteur RH, Defender for Endpoint et partage XDR sont des prérequis selon le cas.'),
  a.order({ id: 'p04-ev3', title: 'Examiner un signal IRM', comp: c1.comp, tags: c1.tags, role: 'eval', dim: 'verifier', lesson: 'p04-l1',
    st: 'Ordonnez l’examen d’un signal.', items: [['s1', 'Vérifier la santé de la politique'], ['s2', 'Lire le déclencheur et l’indicateur'], ['s3', 'Comparer à la norme de l’utilisateur et des pairs'], ['s4', 'Décider : classer, examiner ou escalader'], ['s5', 'Documenter sans conclure à une faute']], correct: ['s1', 's2', 's3', 's4', 's5'],
    exp: 'On valide la couverture, on lit le contexte, on compare, on décide puis on documente.' }),
  Q('p04-ev4', 'eval', 'securiser', c1, 'Séparation des rôles', 'Pourquoi séparer administration, analyse et enquête ?', ['Pour limiter l’accès aux données personnelles et assurer l’impartialité.', 'Principe du moindre privilège.'], [['Pour compliquer le travail.', 'Faux.'], ['Pour éviter l’audit.', 'Faux.'], ['Par tradition.', 'Faux.']], 'La séparation limite l’accès aux données et protège la vie privée.'),
  a.short({ id: 'p04-ev5', title: 'Seuil d’alerte de stockage', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'maintenir', lesson: 'p04-l2',
    st: 'À quel premier pourcentage de la limite reçoit-on une notification ? (nombre)', accepted: ['80'], numeric: { value: 80 }, ph: 'un nombre',
    exp: 'Les notifications arrivent à 80, 90 et 95 % de la limite.' }),
  a.config({ id: 'p04-ev6', title: 'Réduire le volume', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'cout', lesson: 'p04-l2',
    st: 'Une politique approche 80 % du stockage. Que faire ?', fields: [
      { id: 'ech', label: 'Réduire l’échantillonnage ou la portée', kind: 'toggle', accept: ['on'], why: 'Réduit le volume.' },
      { id: 'filtre', label: 'Activer le filtre des envois en masse', kind: 'toggle', accept: ['on'], why: 'Écarte le bruit.' },
      { id: 'rien', label: 'Ignorer les notifications', kind: 'toggle', accept: ['off'], why: 'La politique serait désactivée.' },
    ], solution: { ech: 'on', filtre: 'on', rien: 'off' }, exp: 'On réduit le volume avant la désactivation.' }),
  Q('p04-ev7', 'eval', 'verifier', c2, 'Direction', 'Quelle condition limite l’examen aux messages sortants ?', ['La direction.', 'Condition documentée.'], [['L’échantillonnage.', 'Réduit le volume.'], ['Le nom de la politique.', 'Faux.'], ['Le stockage.', 'Faux.']], 'La condition de direction limite aux messages sortants.'),
  Q('p04-ev8', 'eval', 'securiser', c2, 'Surveillance proportionnée', 'Quelle pratique évite une surveillance disproportionnée ?', ['Limiter la portée, documenter le motif et respecter le cadre légal.', 'Bonne pratique.'], [['Surveiller tout le monde.', 'Disproportionné.'], ['Cacher la politique.', 'Risqué.'], ['Garder tout indéfiniment.', 'Risqué.']], 'On limite la portée, on documente le motif et on respecte le cadre légal.'),

  a.match({ id: 'p04-cs1', title: 'Cas : situation et solution', comp: c1.comp, tags: c1.tags, role: 'case', dim: 'fonctionner', lesson: 'p04-l1',
    st: 'Associez chaque situation de Nordlys Technologies à la solution.', items: [['p1', 'Un élément contient 30 numéros de carte'], ['p2', 'Un employé qui part télécharge massivement'], ['p3', 'Des messages sortants contiennent du langage inapproprié']],
    options: [['s1', 'DLP'], ['s2', 'Insider Risk Management'], ['s3', 'Communication Compliance']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'La DLP agit sur l’élément, l’IRM sur le comportement et Communication Compliance sur le contenu des échanges.' }),
  a.inspect({ id: 'p04-cs2', title: 'Cas : configuration à relire', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'securiser', lesson: 'p04-l2', language: 'text',
    st: 'Plan fictif. Repérez les failles.',
    lines: [['p1', 'Nous surveillons tous les employés sur toutes les sources, sans échantillonnage.', { ok: 'a1', fixes: [['a1', 'Limiter la portée et échantillonner'], ['a2', 'Accepter']] }], ['p2', 'Les notifications de stockage sont suivies par l’équipe.'], ['p3', 'Nous renommerons la politique plus tard au besoin.', { ok: 'b1', fixes: [['b1', 'Choisir un nom clair dès la création : le renommage n’est pas possible'], ['b2', 'Accepter']] }]],
    exp: 'Portée excessive et renommage impossible sont deux défauts.' }),
  a.workflow({ id: 'p04-cs3', title: 'Cas : traiter un signal de risque', comp: c1.comp, tags: c1.tags, role: 'case', dim: 'maintenir', lesson: 'p04-l1',
    st: 'Ordonnez le traitement d’un signal de départ.',
    blocks: [['t1', 'Vérifier la santé de la politique'], ['t2', 'Lire le contexte pseudonymisé'], ['t3', 'Évaluer l’écart à la norme'], ['t4', 'Escalader au processus RH et juridique si nécessaire'], ['t5', 'Accuser l’employé dans un message à l’équipe']],
    required: ['t1', 't2', 't3', 't4'], forbidden: ['t5'], before: [['t1', 't2'], ['t2', 't3'], ['t3', 't4']], notes: { t5: 'Un signal n’est pas une preuve.' }, solution: ['t1', 't2', 't3', 't4'],
    exp: 'On vérifie, on lit, on évalue puis on escalade dans un cadre défini.' }),
  a.open({ id: 'p04-cs-open', title: 'Cas : cadre de surveillance proportionnée', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'maintenir', lesson: 'p04-l2',
    st: 'Rédigez le cadre de gouvernance des risques internes et des communications d’une organisation fictive.',
    deliverable: 'Un document : politiques choisies, portée, prérequis, rôles séparés, limites de stockage, processus d’escalade et retour arrière.',
    rubric: [['r1', 'La portée est justifiée et proportionnée.', 'securiser'], ['r2', 'Les prérequis sont listés.', 'verifier'], ['r3', 'Les rôles sont séparés.', 'securiser'], ['r4', 'Les limites de stockage sont suivies.', 'maintenir'], ['r5', 'Le cadre légal est mentionné.', 'verifier']],
    exp: 'Pas de note automatique : on juge la cohérence du cadre.' }),

  Q('p04-rm1', 'remediation', 'comprendre', c1, 'Remédiation : IRM', 'Qu’est-ce qu’un événement déclencheur ?', ['Un événement qui fait entrer l’utilisateur dans le périmètre de la politique.', 'Définition.'], [['Un mot de passe.', 'Faux.'], ['Une licence.', 'Faux.'], ['Un rôle.', 'Faux.']], 'Un événement déclencheur fait entrer l’utilisateur dans la politique.'),
  Q('p04-rm2', 'remediation', 'securiser', c1, 'Remédiation : signal', 'Un signal IRM est-il une preuve de faute ?', ['Non, c’est un risque à examiner.', 'Principe d’impartialité.'], [['Oui, toujours.', 'Faux.'], ['Seulement le vendredi.', 'Faux.'], ['Oui si deux fois.', 'Faux.']], 'Un signal est une piste, pas une preuve.'),
  Q('p04-rm3', 'remediation', 'maintenir', c2, 'Remédiation : stockage', 'Que surveiller pour éviter la désactivation d’une politique ?', ['Le volume de stockage et les notifications à 80, 90 et 95 %.', 'Limite documentée.'], [['La couleur du portail.', 'Faux.'], ['Le nom du réviseur.', 'Faux.'], ['Rien.', 'Risque de désactivation.']], 'On surveille le stockage et les avis de seuil.'),
];

const competencies = [
  comp('p04', 1, 'Comprendre la gestion des risques internes', 'Modèles, déclencheurs, prérequis et vie privée.', ['Je distingue IRM et DLP.', 'Je cite les prérequis et la pseudonymisation.', 'Je traite un signal sans conclure à une faute.']),
  comp('p04', 2, 'Cadrer Communication Compliance', 'Conditions, échantillonnage, stockage et contraintes.', ['Je règle direction et échantillonnage.', 'Je surveille la limite de stockage.', 'Je respecte rôles et contraintes d’administration.']),
];

const projects: AiProject[] = [
  project('p04', 1, 'avancé', 'Cadre de gouvernance des risques internes', 'Rédiger pour une organisation fictive le cadre IRM et Communication Compliance : portée, prérequis, rôles, escalade et limites.', 'Document de deux pages.', ['Définir les scénarios.', 'Lister les prérequis.', 'Séparer les rôles.', 'Définir l’escalade et le retour arrière.'], ['La portée est proportionnée.', 'Les rôles sont séparés.', 'L’escalade est définie.'], ['Surveillance excessive.', 'Conclure sur un seul signal.'], ['Ajouter l’escalade vers eDiscovery.']),
];

export const p04 = assemble({ id: 'p04', level: 3, n: 4, title: 'Risques internes et communications',
  summary: 'Insider Risk Management : modèles, déclencheurs, prérequis et vie privée ; Communication Compliance : conditions, échantillonnage et limites de stockage.',
  lessons: [l1, l2], exercises, competencies, projects,
  caseTitle: 'Encadrer la surveillance chez Nordlys Technologies',
  caseScenario: 'Vous traitez un signal de risque interne et cadrez une politique de communications de façon proportionnée. Actions simulées.', caseMinutes: 40 });
