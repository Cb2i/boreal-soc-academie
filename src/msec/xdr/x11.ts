// Module 11 : Gestion des incidents (niveau 4).
import type { AiCompetency, AiLesson, AiProject } from '../../agentic/types.ts';
import { assemble } from '../assemble.ts';
import { kit } from '../kit.ts';
import { sref } from '../sources.ts';

const md = (...lines: string[]) => lines.join('\n');
const { a, Q, M } = kit('x11');
const c1 = { comp: 'x11-c1', lesson: 'x11-l1', tags: ['file-incidents', 'priorite', 'classification'] };
const c2 = { comp: 'x11-c2', lesson: 'x11-l2', tags: ['correlation', 'fusion', 'sentinel-defender'] };
const c3 = { comp: 'x11-c3', lesson: 'x11-l3', tags: ['action-center', 'air', 'reglage-alertes'] };

const l1: AiLesson = {
  id: 'x11-l1', module: 'x11', title: 'La file d’incidents : prioriser, assigner, classer', minutes: 40,
  summary: 'Traiter la file avec méthode : score de priorité, filtres, assignation, classification et commentaires.',
  objectives: ['Lire le score de priorité et ses limites.', 'Construire des vues filtrées utiles.', 'Résoudre un incident avec classification et détermination.'],
  prerequisites: ['Module 1'],
  body: md(
    '## Incident, alerte, signal',
    'Un **incident** regroupe des alertes corrélées et les données associées qui racontent l’attaque complète. Une **alerte** est un signal individuel d’une source (Defender for Endpoint, Defender for Identity, Defender for Office 365, Defender for Cloud Apps, Entra ID Protection, détections personnalisées, Sentinel, sources tierces). Le travail d’un SOC se fait à l’échelle de l’incident : on le priorise, on l’assigne, on l’enquête, on le résout. Gérer des alertes isolées revient à relire les pages d’un livre dans le désordre.',
    '## La file et son assistant de priorité',
    'La file se trouve sous Incidents & alerts > Incidents. L’**assistant de file (Queue Assistant)** attribue à chaque incident un **score de priorité de 0 à 100** à l’aide d’un algorithme d’apprentissage automatique qui tient compte, entre autres, des signaux de perturbation d’attaque, de Threat Analytics, de la gravité, du rapport signal/bruit, des techniques MITRE, de la criticité des actifs, de la rareté des types d’alertes et des menaces de grande envergure (rançongiciel, acteurs étatiques). Plages : **rouge** au-dessus de 85, **orange** de 15 à 85, **gris** sous 15. Ce score est une aide au tri, pas un verdict : un incident gris sur un contrôleur de domaine peut mériter votre attention, et un rouge peut être un exercice de l’équipe rouge. Gardez la **gravité** et la **criticité des actifs** dans vos colonnes.',
    '## Des vues qui servent',
    'Par défaut, la file montre la dernière semaine, les incidents nouveaux et en cours, et les gravités élevée, moyenne et faible. Construisez des **ensembles de filtres enregistrés** : nouveaux, gravité élevée non assignés, assignés à moi, par étiquette, par catégorie de menace, par menace associée, par produit source. Sauvegarder l’URL d’un filtre donne un accès en un clic. Filtrez aussi par **état d’enquête automatisée** quand vous cherchez des actions en attente. La recherche accepte le nom, l’identifiant ou un actif impliqué (utilisateur, appareil, boîte aux lettres, application).',
    '## Gérer un incident',
    'Le volet **Manage incident** permet de : modifier le nom (le nom automatique reflète le nombre d’appareils, d’utilisateurs et de sources), ajouter des **étiquettes** qui servent de langage commun aux filtres et à l’automatisation, **assigner** (ce qui rend l’analyste propriétaire de l’incident et de toutes ses alertes), changer l’état, **classer** et commenter. À la résolution, on choisit une **classification** (vrai positif, faux positif, activité informative attendue) et une **détermination** (le type de menace). Cela nourrit l’apprentissage de l’équipe et, selon les produits, la qualité de la corrélation. Résoudre un incident résout les alertes associées dans les portails liés.',
    '## Discipline d’équipe',
    'Définissez un **accord de niveau de service** par gravité (prise en charge, première réponse), une règle de transfert entre quarts de travail et une convention d’étiquettes (par exemple `faux-positif-reglé`, `exercice`, `escalade-n2`). Ne laissez pas les commentaires à la fin : un journal de bord écrit pendant l’enquête vaut mieux qu’un résumé reconstitué. Évitez de résoudre en masse sans classification : vous perdriez la seule donnée qui permet de mesurer le bruit.',
  ),
  demo: { title: 'Trier trois incidents', body: md(
    'Extrait **fictif** :',
    '```text',
    'ID    Priorité  Gravité  Actif              Décision',
    '4812  91        Élevée   Contrôleur de dom. Assigner N2 tout de suite',
    '4813  44        Moyenne  Poste utilisateur  Prendre dans le quart',
    '4814  8         Faible   Poste de test      Étiqueter exercice, résoudre classé',
    '```',
    '**Lecture commentée.** Le score guide, mais la criticité de l’actif (contrôleur de domaine) justifie l’escalade.',
    '**Ce que la démo ne prouve pas.** Aucune file réelle n’a été lue.') },
  guided: 'x11-g1', autonomous: 'x11-a1', quiz: ['x11-q1a', 'x11-q1b', 'x11-q1c'],
  revision: md('## Fiche : la file', '- Incident = alertes corrélées ; alerte = signal.', '- Score 0 à 100 : rouge >85, orange 15 à 85, gris <15 ; aide au tri.', '- Filtres enregistrés et URL sauvegardées.', '- Gérer : nom, étiquettes, assignation, classification, détermination, commentaires.', '- SLA par gravité, convention d’étiquettes.'),
  links: [sref('xdr-incident-queue'), sref('xdr-manage-incidents'), sref('xdr-investigate-incidents'), sref('mdo-sec-ops-incidents')], teaches: ['file-incidents', 'priorite', 'classification'],
};

const l2: AiLesson = {
  id: 'x11-l2', module: 'x11', title: 'Corrélation, fusion d’incidents et intégration Sentinel', minutes: 40,
  summary: 'Comprendre comment les alertes se regroupent, quand les incidents ne fusionnent pas et ce que Sentinel change.',
  objectives: ['Décrire les critères de corrélation et de fusion.', 'Lister les cas où la fusion n’a pas lieu.', 'Adapter l’automatisation Sentinel au moteur d’incidents de Defender.'],
  prerequisites: ['Leçon 1'],
  body: md(
    '## Création et corrélation',
    'Quand une alerte arrive, le portail la place dans un nouvel incident si elle est suffisamment unique dans la fenêtre de temps, ou dans un incident existant si elle est suffisamment reliée à d’autres alertes, de la même source ou de sources différentes. La logique est propriétaire : elle donne aussi son nom à l’incident. Les critères comprennent les **entités** (utilisateurs, appareils, boîtes aux lettres), les **artéfacts** (fichiers, processus, expéditeurs), les **fenêtres de temps** et les **séquences** qui évoquent une attaque en plusieurs étapes (un clic sur un lien suit une détection d’hameçonnage).',
    '## Fusion',
    'La corrélation continue après la création : si deux incidents se ressemblent, ils sont fusionnés. Il n’y a **pas de nouvel incident** : le contenu de l’incident source passe dans l’incident cible, la source est fermée et redirigée (étiquette **Redirected**), les alertes et les étiquettes migrent. Le sens de la fusion est décidé par Defender, pas par vous. L’incident source reste consultable dans Sentinel (portail Azure).',
    '## Quand la fusion n’a pas lieu',
    'Defender ne fusionne pas si : un des incidents est **fermé** (un incident résolu n’est jamais rouvert), les deux sont **assignés à des personnes différentes**, ils ont des **classifications ou déterminations différentes**, la fusion dépasserait le maximum d’entités, ou (si activé) les appareils sont dans des **groupes d’appareils** différents. Vous pouvez fusionner à la main jusqu’à cinq incidents à la fois après avoir corrigé la cause (par exemple retirer une assignation). Fusionner est préférable à déplacer des alertes, car l’historique est préservé. Pour une alerte mal placée, on peut la **déplacer** vers un autre incident, car toute alerte appartient à un incident. L’affichage « tous les incidents associés » élargit le contexte sans changer le regroupement.',
    '## Sentinel dans le portail Defender',
    'Avec le connecteur Defender XDR, alertes et incidents circulent vers Sentinel. Les **règles de création d’incident Microsoft** sont désactivées pour les produits intégrés, car le portail Defender a son propre moteur. Conséquences : (1) le **filtrage des alertes** se fait par le **réglage d’alertes** dans Defender ou par des règles d’automatisation de suppression ; (2) vous ne **prédéterminez plus le titre** des incidents : n’utilisez jamais le nom d’incident comme condition d’une règle d’automatisation, utilisez des **étiquettes** ; (3) pour les produits non intégrés (par exemple Purview Insider Risk), remplacez les règles de création d’incident par des **règles d’analyse planifiées**. Avec plusieurs espaces de travail Sentinel, seul l’**espace principal** est corrélé avec les alertes Defender ; les espaces secondaires gardent leur propre création d’incidents. Pour Defender for Cloud, choisissez les alertes par locataire ou par abonnement et évitez les doublons en déconnectant l’ancien connecteur par abonnement.',
    '## Pratique',
    'Quand deux incidents refusent de fusionner, lisez la liste des causes avant de forcer. Souvent, deux analystes travaillent la même attaque : la bonne décision est d’en choisir un propriétaire et de fusionner.',
  ),
  demo: { title: 'Pourquoi pas de fusion', body: md(
    'Cas **fictif** :',
    '```text',
    'Incident A (assigné à Sam)      Incident B (assigné à Léa)',
    'Même utilisateur, 12 minutes d’écart, mêmes artéfacts',
    'Fusion automatique : non (assignations différentes)',
    'Action : retirer une assignation, puis fusionner manuellement',
    '```',
    '**Lecture commentée.** La corrélation voit le lien, mais la règle sur les assignations bloque la fusion.',
    '**Ce que la démo ne prouve pas.** Aucune fusion réelle n’a eu lieu.') },
  guided: 'x11-g2', autonomous: 'x11-a2', quiz: ['x11-q2a', 'x11-q2b', 'x11-q2c'],
  revision: md('## Fiche : corrélation et fusion', '- Critères : entités, artéfacts, temps, séquences.', '- Fusion : source fermée et redirigée, cible conserve tout.', '- Pas de fusion : fermé, assignés différents, classifications différentes, limite d’entités, groupes d’appareils.', '- Manuel : jusqu’à cinq incidents.', '- Sentinel : étiquettes, pas les noms ; espace principal seulement.'),
  links: [sref('xdr-correlation'), sref('xdr-incident-cases-merge'), sref('sentinel-xdr-integration'), sref('sentinel-defender-portal')], teaches: ['correlation', 'fusion', 'sentinel-defender'],
};

const l3: AiLesson = {
  id: 'x11-l3', module: 'x11', title: 'Action Center, enquête automatisée et réglage des alertes', minutes: 45,
  summary: 'Approuver ou rejeter des actions, comprendre l’évolution de l’AIR et régler le bruit sans perdre de couverture.',
  objectives: ['Décrire le cycle enquête, verdict, action.', 'Approuver, rejeter et annuler des actions.', 'Régler une alerte avec une justification vérifiable.'],
  prerequisites: ['Leçons 1 et 2'],
  body: md(
    '## Enquête et réponse automatisées',
    'Une alerte crée un incident, qui peut démarrer une **enquête automatisée**. Elle produit un **verdict** pour chaque élément de preuve (malveillant, suspect, aucune menace trouvée) et propose des **actions de correction** : mise en quarantaine d’un fichier, arrêt d’un processus, isolement d’un appareil, blocage d’une URL, suppression de courriels. Selon la configuration (niveau d’automatisation des groupes d’appareils), les actions sont prises automatiquement ou après **approbation**. Pendant qu’une enquête est active, les alertes liées s’y ajoutent et, si une entité apparaît ailleurs, la portée s’étend.',
    '**Évolution à connaître.** La documentation annonce qu’à compter du **1er septembre 2026**, l’AIR ne s’exécute plus comme expérience d’enquête distincte ni ne se déclenche manuellement pour les alertes de Defender for Endpoint : ses capacités de détection et de réponse sont intégrées à la pile antivirus par défaut, et une analyse complète peut être lancée au besoin. L’AIR de **Defender for Office 365 demeure**. Votre locataire peut se comporter autrement selon le déploiement : vérifiez ce que vous voyez réellement avant d’écrire une procédure.',
    '## Action Center',
    'Le **centre d’action unifié** (Actions & submissions > Action center) liste les actions en attente et terminées pour les appareils, le courriel et les identités. Onglets : **Pending** (à approuver ou rejeter), **History** (décision, source, administrateur). Actions suivies : collecter un paquet d’enquête, isoler un appareil, retirer des droits d’exécution, restreindre l’exécution de code, lancer un antivirus, arrêter et mettre en quarantaine, contenir un appareil du réseau, libérer de la quarantaine. Approuvez ou rejetez vite : une enquête bloquée en attente retarde tout. On peut aussi décider depuis l’onglet **Evidence and response** d’un incident. Les actions de courriel recommandées ne sont créées que si la dernière destination du courriel malveillant est une boîte aux lettres infonuagique, et seulement pour les menaces les plus critiques (maliciel, hameçonnage à haute confiance, URL ou fichiers malveillants). Plusieurs actions peuvent être **annulées** : documentez qui peut le faire.',
    '## Régler les alertes',
    'Le bruit se traite par le **réglage d’alerte (alert tuning)** : on cible une condition précise (titre, produit, entités, contexte) et on choisit de masquer ou de résoudre automatiquement. Règles de prudence : justifier par une classification réelle, limiter la portée (un appareil, un utilisateur, une signature), poser une **date de revue**, et ne jamais supprimer par titre seul une détection critique. Si le bruit vient d’une règle personnalisée, corrigez la requête. Pour des alertes de Defender for Cloud dupliquées dans Sentinel, désactivez l’ancien connecteur plutôt que de multiplier les suppressions.',
    '## Mesurer',
    'Suivez le temps de prise en charge, le temps de résolution, la proportion de faux positifs par source et le nombre d’actions en attente de plus de 24 heures. Sans ces mesures, le réglage devient une série d’opinions.',
  ),
  demo: { title: 'Décider d’une action en attente', body: md(
    'Action **fictive** :',
    '```text',
    'Action        : Isoler l’appareil PC-0412',
    'Preuve        : processus chiffrant, verdict Malveillant',
    'Impact métier : poste de comptabilité, jour de paie',
    'Décision      : approuver, aviser le responsable, planifier la levée',
    '```',
    '**Lecture commentée.** Le verdict est solide : on approuve et on gère la communication.',
    '**Ce que la démo ne prouve pas.** Aucune action réelle n’a été approuvée.') },
  guided: 'x11-g3', autonomous: 'x11-a3', quiz: ['x11-q3a', 'x11-q3b', 'x11-q3c'],
  revision: md('## Fiche : Action Center et réglage', '- Verdicts : malveillant, suspect, aucune menace.', '- Pending/History ; approuver ou rejeter ; annulation possible pour plusieurs actions.', '- AIR MDE : retrait de l’expérience distincte annoncé au 2026-09-01 ; AIR MDO demeure.', '- Réglage : portée étroite, justification, date de revue.', '- Mesurer prise en charge, résolution, faux positifs.'),
  links: [sref('xdr-autoir'), sref('xdr-action-center'), sref('xdr-autoir-actions'), sref('xdr-alert-tuning'), sref('mdo-air')], teaches: ['action-center', 'air', 'reglage-alertes'],
};

const exercises = [
  a.match({ id: 'x11-g1', title: 'Couleur et priorité', comp: c1.comp, tags: c1.tags, role: 'guided', dim: 'comprendre', lesson: 'x11-l1',
    st: 'Associez chaque couleur à sa plage de score.', items: [['p1', 'Rouge'], ['p2', 'Orange'], ['p3', 'Gris']],
    options: [['s1', 'Au-dessus de 85'], ['s2', 'De 15 à 85'], ['s3', 'Moins de 15']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Le rouge dépasse 85, l’orange va de 15 à 85 et le gris est sous 15.' }),
  a.order({ id: 'x11-a1', title: 'Traiter un incident', comp: c1.comp, tags: c1.tags, role: 'autonomous', dim: 'fonctionner', lesson: 'x11-l1',
    st: 'Ordonnez le traitement d’un incident.',
    items: [['s1', 'Filtrer et lire la priorité et la criticité'], ['s2', 'M’assigner l’incident'], ['s3', 'Enquêter et commenter'], ['s4', 'Corriger'], ['s5', 'Résoudre avec classification et détermination']], correct: ['s1', 's2', 's3', 's4', 's5'],
    exp: 'On trie, on prend la propriété, on enquête, on corrige et on résout avec classification.' }),
  Q('x11-q1a', 'quiz', 'comprendre', c1, 'Score', 'Que représente le score de priorité ?', ['Une aide au tri de 0 à 100, pas un verdict.', 'À combiner avec la criticité.'], [['Un verdict définitif.', 'Non.'], ['Un nombre d’alertes.', 'Non.'], ['Une licence.', 'Non.']], 'Le score aide à trier.'),
  Q('x11-q1b', 'quiz', 'fonctionner', c1, 'Assignation', 'Que fait assigner un incident à soi-même ?', ['Rend propriétaire de l’incident et de ses alertes.', 'Selon la documentation.'], [['Rien.', 'Non.'], ['Le ferme.', 'Non.'], ['Le supprime.', 'Non.']], 'On devient propriétaire de l’incident et de ses alertes.'),
  Q('x11-q1c', 'quiz', 'maintenir', c1, 'Classification', 'Pourquoi classer à la résolution ?', ['Pour apprendre et mesurer le bruit.', 'Sinon la donnée est perdue.'], [['Pour la forme.', 'Non.'], ['Pour supprimer.', 'Non.'], ['Pour facturer.', 'Non.']], 'La classification nourrit l’apprentissage et la mesure.'),

  a.match({ id: 'x11-g2', title: 'Fusion et raison', comp: c2.comp, tags: c2.tags, role: 'guided', dim: 'comprendre', lesson: 'x11-l2',
    st: 'Associez chaque situation à l’effet sur la fusion.', items: [['p1', 'Un incident est fermé'], ['p2', 'Deux assignations différentes'], ['p3', 'Même utilisateur, mêmes artéfacts, même fenêtre']],
    options: [['s1', 'Jamais rouvert ni fusionné'], ['s2', 'Fusion bloquée'], ['s3', 'Fusion probable']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Un incident fermé n’est pas rouvert, des assignations différentes bloquent la fusion et des éléments communs la favorisent.' }),
  a.inspect({ id: 'x11-a2', title: 'Relire une automatisation Sentinel', comp: c2.comp, tags: c2.tags, role: 'autonomous', dim: 'securiser', lesson: 'x11-l2', language: 'text',
    st: 'Plan fictif. Repérez les failles.',
    lines: [['p1', 'La règle d’automatisation se déclenche si le nom de l’incident contient « Multi-stage ».', { ok: 'a1', fixes: [['a1', 'Utiliser des étiquettes plutôt que le nom'], ['a2', 'Accepter']] }], ['p2', 'Nous comptons sur les règles de création d’incident Microsoft pour filtrer.', { ok: 'b1', fixes: [['b1', 'Utiliser le réglage d’alertes dans Defender'], ['b2', 'Accepter']] }], ['p3', 'Les espaces secondaires sont corrélés avec Defender.', { ok: 'c1', fixes: [['c1', 'Seul l’espace principal est corrélé'], ['c2', 'Accepter']] }]],
    exp: 'Le nom n’est pas stable, le filtrage passe par le réglage Defender et seul l’espace principal est corrélé.' }),
  Q('x11-q2a', 'quiz', 'comprendre', c2, 'Fusion', 'Que se passe-t-il à la fusion ?', ['Le contenu de la source passe dans la cible et la source est fermée.', 'Aucun nouvel incident.'], [['Un nouvel incident est créé.', 'Non.'], ['Les alertes sont supprimées.', 'Non.'], ['Rien.', 'Non.']], 'Source fermée, contenu dans la cible.'),
  Q('x11-q2b', 'quiz', 'fonctionner', c2, 'Manuel', 'Combien d’incidents fusionne-t-on à la main à la fois ?', ['Jusqu’à cinq.', 'Après avoir corrigé la cause.'], [['Un seul.', 'Non.'], ['Cent.', 'Non.'], ['Aucun.', 'Possible.']], 'Jusqu’à cinq incidents à la fois.'),
  Q('x11-q2c', 'quiz', 'maintenir', c2, 'Titres', 'Pourquoi éviter le nom d’incident comme condition d’automatisation ?', ['Defender nomme les incidents et le titre peut changer.', 'Utiliser des étiquettes.'], [['Il est secret.', 'Non.'], ['Il est trop long.', 'Non.'], ['Il est chiffré.', 'Non.']], 'Le moteur de Defender nomme les incidents.'),

  a.match({ id: 'x11-g3', title: 'Onglet et usage', comp: c3.comp, tags: c3.tags, role: 'guided', dim: 'comprendre', lesson: 'x11-l3',
    st: 'Associez chaque élément à son usage.', items: [['p1', 'Pending'], ['p2', 'History'], ['p3', 'Evidence and response']],
    options: [['s1', 'Approuver ou rejeter'], ['s2', 'Décisions passées et auteur'], ['s3', 'Décider depuis l’incident']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Pending sert à décider, History à auditer, et Evidence and response à décider depuis l’incident.' }),
  a.config({ id: 'x11-a3', title: 'Règle de réglage prudente', comp: c3.comp, tags: c3.tags, role: 'autonomous', dim: 'securiser', lesson: 'x11-l3',
    st: 'Paramétrez une suppression d’alerte raisonnable.',
    fields: [
      { id: 'scope', label: 'Portée limitée à un appareil et une signature', kind: 'toggle', accept: ['on'], why: 'Évite d’éteindre la détection partout.' },
      { id: 'just', label: 'Justification fondée sur une classification', kind: 'toggle', accept: ['on'], why: 'Traçable.' },
      { id: 'rev', label: 'Date de revue fixée', kind: 'toggle', accept: ['on'], why: 'Une suppression ne doit pas être éternelle.' },
      { id: 'title', label: 'Suppression par titre seul pour tout le locataire', kind: 'toggle', accept: ['off'], why: 'Trop large.' },
    ], solution: { scope: 'on', just: 'on', rev: 'on', title: 'off' }, exp: 'Portée étroite, justification, revue datée, pas de suppression générale.' }),
  Q('x11-q3a', 'quiz', 'comprendre', c3, 'Verdicts', 'Quels sont les verdicts d’une enquête automatisée ?', ['Malveillant, suspect, aucune menace trouvée.', 'Un par élément de preuve.'], [['Oui ou non.', 'Non.'], ['Rouge, jaune, vert.', 'Non.'], ['Aucun.', 'Il y en a.']], 'Trois verdicts existent.'),
  Q('x11-q3b', 'quiz', 'fonctionner', c3, 'AIR MDE', 'Que dit la documentation sur l’AIR de Defender for Endpoint au 1er septembre 2026 ?', ['Elle ne s’exécute plus comme expérience distincte ; MDO demeure.', 'À revérifier dans le locataire.'], [['Elle est élargie.', 'Non.'], ['Elle disparaît pour MDO aussi.', 'Non.'], ['Rien ne change.', 'Non.']], 'Retrait annoncé pour MDE, l’AIR de MDO demeure.'),
  Q('x11-q3c', 'quiz', 'maintenir', c3, 'Mesure', 'Que mesurer pour piloter le réglage ?', ['Faux positifs par source et temps de prise en charge.', 'Sans mesure, des opinions.'], [['Le nombre de clics.', 'Non.'], ['La couleur.', 'Non.'], ['Rien.', 'Non.']], 'On mesure faux positifs et délais.'),

  Q('x11-ev1', 'eval', 'comprendre', c1, 'Incident ou alerte', 'Quelle est la différence ?', ['L’incident regroupe des alertes corrélées.', 'L’alerte est un signal.'], [['Aucune.', 'Elles diffèrent.'], ['L’alerte regroupe les incidents.', 'C’est l’inverse.'], ['Ce sont des licences.', 'Non.']], 'Un incident regroupe des alertes.'),
  M('x11-ev2', 'eval', 'fonctionner', c2, 'Fusion bloquée', 'Cochez les causes qui empêchent la fusion.', [['Un incident est fermé.', 'Cause documentée.'], ['Les classifications diffèrent.', 'Cause documentée.']], [['Les deux ont le même nom.', 'Pas une cause.'], ['Ils sont récents.', 'Pas une cause.']], 'Fermé, assignations ou classifications différentes, limite d’entités, groupes d’appareils.'),
  a.config({ id: 'x11-ev3', title: 'Convention d’équipe', comp: c1.comp, tags: c1.tags, role: 'eval', dim: 'maintenir', lesson: 'x11-l1',
    st: 'Paramétrez la convention de la file.',
    fields: [
      { id: 'sla', label: 'SLA par gravité', kind: 'toggle', accept: ['on'], why: 'Cadre la réponse.' },
      { id: 'tag', label: 'Convention d’étiquettes', kind: 'toggle', accept: ['on'], why: 'Langage commun.' },
      { id: 'bulk', label: 'Résolution en masse sans classification', kind: 'toggle', accept: ['off'], why: 'Perte de donnée.' },
    ], solution: { sla: 'on', tag: 'on', bulk: 'off' }, exp: 'SLA et étiquettes, sans résolution de masse non classée.' }),
  a.fix({ id: 'x11-ev4', title: 'Corriger une règle d’automatisation', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'securiser', lesson: 'x11-l2', language: 'json',
    st: 'Corrigez : condition sur l’étiquette, espace principal, pas de condition sur le nom.',
    starter: JSON.stringify({ condition: 'nom-contient-Multi-stage', espace: 'secondaire' }, null, 2),
    rules: [{ kind: 'equals', path: 'condition', value: 'etiquette-escalade-n2', message: 'Utiliser une étiquette.', dim: 'securiser' }, { kind: 'equals', path: 'espace', value: 'principal', message: 'Cibler l’espace principal.', dim: 'fonctionner' }],
    solution: JSON.stringify({ condition: 'etiquette-escalade-n2', espace: 'principal' }, null, 2), exp: 'Une étiquette est stable et l’espace principal est celui qui est corrélé.' }),
  a.match({ id: 'x11-ev5', title: 'Action et justification', comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'fonctionner', lesson: 'x11-l3',
    st: 'Associez chaque décision à son motif.', items: [['p1', 'Approuver l’isolement'], ['p2', 'Rejeter une quarantaine'], ['p3', 'Annuler une action']],
    options: [['s1', 'Verdict malveillant et impact acceptable'], ['s2', 'Faux positif confirmé'], ['s3', 'Erreur découverte après coup']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Chaque décision se justifie par la preuve et l’impact.' }),
  a.inspect({ id: 'x11-ev6', title: 'Relire un rapport de file', comp: c1.comp, tags: c1.tags, role: 'eval', dim: 'maintenir', lesson: 'x11-l1', language: 'text',
    st: 'Extrait d’un rapport. Repérez les faiblesses.',
    lines: [['r1', 'Nous traitons seulement les incidents rouges.', { ok: 'a1', fixes: [['a1', 'Tenir compte de la criticité des actifs et de la gravité'], ['a2', 'Accepter']] }], ['r2', 'Les incidents d’exercice sont résolus sans étiquette.', { ok: 'b1', fixes: [['b1', 'Étiqueter les exercices'], ['b2', 'Accepter']] }], ['r3', 'Aucune mesure de faux positifs.']],
    exp: 'Le score ne suffit pas, les exercices faussent les mesures et il faut mesurer.' }),
  a.workflow({ id: 'x11-ev7', title: 'Régler une alerte bruyante', comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'securiser', lesson: 'x11-l3',
    st: 'Ordonnez le réglage d’une alerte bruyante.',
    blocks: [['b1', 'Analyser un échantillon et classer'], ['b2', 'Définir une portée étroite'], ['b3', 'Créer la règle avec justification'], ['b4', 'Surveiller l’effet'], ['b5', 'Revoir à la date prévue'], ['b6', 'Supprimer la détection partout']],
    required: ['b1', 'b2', 'b3', 'b4', 'b5'], forbidden: ['b6'], before: [['b1', 'b2'], ['b2', 'b3'], ['b3', 'b4'], ['b4', 'b5']], notes: { b6: 'Trop large, on perd la couverture.' }, solution: ['b1', 'b2', 'b3', 'b4', 'b5'],
    exp: 'On analyse, on circonscrit, on justifie, on surveille et on revoit.' }),
  a.short({ id: 'x11-ev8', title: 'Incidents fusionnés à la main', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'comprendre', lesson: 'x11-l2',
    st: 'Combien d’incidents au maximum peut-on fusionner manuellement à la fois ? (nombre)', accepted: ['5'], numeric: { value: 5 }, ph: 'un nombre',
    exp: 'La fusion manuelle accepte jusqu’à cinq incidents à la fois selon la documentation.' }),

  a.config({ id: 'x11-cs1', title: 'Cas : organiser la file chez Nordlys', comp: c1.comp, tags: c1.tags, role: 'case', dim: 'fonctionner', lesson: 'x11-l1',
    st: 'Paramétrez l’organisation de la file.',
    fields: [
      { id: 'f1', label: 'Filtres enregistrés par priorité et statut', kind: 'toggle', accept: ['on'], why: 'Accès rapide.' },
      { id: 'f2', label: 'Étiquettes standard', kind: 'toggle', accept: ['on'], why: 'Automatisation fiable.' },
      { id: 'f3', label: 'Classification obligatoire à la résolution', kind: 'toggle', accept: ['on'], why: 'Mesure du bruit.' },
    ], solution: { f1: 'on', f2: 'on', f3: 'on' }, exp: 'Filtres enregistrés, étiquettes standard et classification obligatoire.' }),
  a.workflow({ id: 'x11-cs2', title: 'Cas : deux analystes, une attaque', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'fonctionner', lesson: 'x11-l2',
    st: 'Ordonnez la résolution de deux incidents non fusionnés.',
    blocks: [['t1', 'Lire la cause du blocage'], ['t2', 'Choisir un propriétaire'], ['t3', 'Retirer l’assignation de l’autre'], ['t4', 'Fusionner manuellement'], ['t5', 'Vérifier le contenu de la cible'], ['t6', 'Déplacer les alertes une à une sans fusion']],
    required: ['t1', 't2', 't3', 't4', 't5'], forbidden: ['t6'], before: [['t1', 't2'], ['t2', 't3'], ['t3', 't4'], ['t4', 't5']], notes: { t6: 'La fusion préserve l’historique.' }, solution: ['t1', 't2', 't3', 't4', 't5'],
    exp: 'On lit, on choisit, on retire, on fusionne et on vérifie.' }),
  a.match({ id: 'x11-cs3', title: 'Cas : trois actions en attente', comp: c3.comp, tags: c3.tags, role: 'case', dim: 'securiser', lesson: 'x11-l3',
    st: 'Associez chaque action à la décision la plus prudente.', items: [['p1', 'Isoler un poste, verdict malveillant'], ['p2', 'Quarantaine d’un fichier connu et signé interne'], ['p3', 'Suppression de courriel, hameçonnage à haute confiance']],
    options: [['s1', 'Approuver et aviser'], ['s2', 'Rejeter après vérification'], ['s3', 'Approuver rapidement']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'On approuve selon le verdict et l’impact, et on rejette un faux positif confirmé.' }),
  a.open({ id: 'x11-cs-open', title: 'Cas : procédure de gestion des incidents', comp: c3.comp, tags: c3.tags, role: 'case', dim: 'maintenir', lesson: 'x11-l3',
    st: 'Rédigez la procédure de gestion des incidents d’une organisation fictive.',
    deliverable: 'Une procédure : prise en charge, priorisation, étiquettes, fusion, actions en attente, réglage, mesures, limites.',
    rubric: [['r1', 'La priorisation combine score, gravité et criticité.', 'comprendre'], ['r2', 'Les règles de fusion sont comprises.', 'fonctionner'], ['r3', 'Les approbations ont des responsables et délais.', 'maintenir'], ['r4', 'Le réglage est encadré.', 'securiser'], ['r5', 'Les limites et changements annoncés sont reconnus.', 'comprendre']],
    exp: 'Pas de note automatique : on juge la cohérence de la procédure.' }),

  Q('x11-rm1', 'remediation', 'comprendre', c1, 'Remédiation : score', 'Que faut-il combiner au score ?', ['La gravité et la criticité des actifs.', 'Le score est une aide.'], [['Rien.', 'Non.'], ['La couleur seule.', 'Non.'], ['Le nom.', 'Non.']], 'Le score se combine à la gravité et à la criticité.'),
  Q('x11-rm2', 'remediation', 'fonctionner', c2, 'Remédiation : fusion', 'Que faire quand la fusion automatique est bloquée ?', ['Corriger la cause, puis fusionner manuellement.', 'Souvent une assignation.'], [['Rouvrir un incident fermé.', 'Impossible.'], ['Ignorer.', 'Non.'], ['Supprimer.', 'Non.']], 'On corrige la cause puis on fusionne.'),
  Q('x11-rm3', 'remediation', 'maintenir', c3, 'Remédiation : réglage', 'Que doit comporter une règle de réglage ?', ['Portée étroite, justification et date de revue.', 'Pour éviter une perte de couverture.'], [['Rien.', 'Non.'], ['Une portée mondiale.', 'Non.'], ['Aucune trace.', 'Non.']], 'Portée, justification et revue.'),
];

const competencies: AiCompetency[] = [
  { id: 'x11-c1', module: 'x11', name: 'Trier et gérer la file', description: 'Priorité, filtres, assignation, classification.', criteria: [{ id: 'x11-c1-1', text: 'Je lis le score avec ses limites.' }, { id: 'x11-c1-2', text: 'Je construis des vues utiles.' }, { id: 'x11-c1-3', text: 'Je résous avec classification.' }] },
  { id: 'x11-c2', module: 'x11', name: 'Maîtriser corrélation et fusion', description: 'Critères, limites et Sentinel.', criteria: [{ id: 'x11-c2-1', text: 'Je connais les critères de fusion.' }, { id: 'x11-c2-2', text: 'Je liste les cas sans fusion.' }, { id: 'x11-c2-3', text: 'J’adapte l’automatisation Sentinel.' }] },
  { id: 'x11-c3', module: 'x11', name: 'Piloter actions et réglage', description: 'Action Center, AIR et alert tuning.', criteria: [{ id: 'x11-c3-1', text: 'J’approuve et rejette avec justification.' }, { id: 'x11-c3-2', text: 'Je tiens compte des changements de l’AIR.' }, { id: 'x11-c3-3', text: 'Je règle sans perdre la couverture.' }] },
];

const projects: AiProject[] = [
  { id: 'x11-p1', module: 'x11', level: 'débutant', title: 'Guide de la file d’incidents', problem: 'Écrire un guide d’une page pour un nouvel analyste.', architecture: 'Document de deux pages.', tools: ['Éditeur de texte'], data: 'Aucune donnée réelle.', steps: ['Décrire la file.', 'Expliquer le score.', 'Lister les filtres.'], success: ['Un novice peut trier seul.'], risks: ['Se fier au score seul.'], extensions: ['Ajouter des exemples.'] },
  { id: 'x11-p2', module: 'x11', level: 'intermédiaire', title: 'Convention d’étiquettes et SLA', problem: 'Concevoir étiquettes, SLA et règles de transfert pour un SOC.', architecture: 'Tableau étiquette, usage, SLA, propriétaire.', tools: ['Tableur'], data: 'Incidents fictifs.', steps: ['Lister les étiquettes.', 'Définir les SLA.', 'Définir les transferts.', 'Définir les mesures.'], success: ['Toutes les étiquettes ont un propriétaire.'], risks: ['Trop d’étiquettes.'], extensions: ['Ajouter les règles Sentinel.'],
    connected: { accounts: 'Un locataire de test avec Defender XDR.', permissions: 'Security Operator ou Security Administrator dans le locataire de test.', costs: 'Licences de test à votre charge.', secrets: 'Aucun secret.', cleanup: 'Supprimer étiquettes et ensembles de filtres de test.', limits: 'Facultatif : la convention se rédige sur papier.' } },
  { id: 'x11-p3', module: 'x11', level: 'avancé', title: 'Tableau de bord de la qualité des alertes', problem: 'Concevoir les indicateurs de bruit, de délais et d’actions en attente.', architecture: 'Spécification d’indicateurs avec source et fréquence.', tools: ['Tableur'], data: 'Données fictives.', steps: ['Choisir les indicateurs.', 'Définir les sources.', 'Définir les seuils.', 'Décrire les décisions.'], success: ['Chaque indicateur déclenche une décision.'], risks: ['Indicateurs de vanité.'], extensions: ['Ajouter une revue trimestrielle.'] },
];

export const x11 = assemble({ id: 'x11', level: 4, n: 11, title: 'Gestion des incidents',
  summary: 'File et priorité, corrélation et fusion, intégration Sentinel, Action Center, enquête automatisée et réglage des alertes.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Organiser les incidents de Nordlys',
  caseScenario: 'Vous organisez la file, résolvez un blocage de fusion et décidez de trois actions en attente. Tout reste sur papier.', caseMinutes: 45 });
