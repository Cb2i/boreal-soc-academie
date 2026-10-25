// Fabrique d’un module de scénario : leçons, exercices, compétences et projets dérivés de la fiche de décision.
import type { AiCompetency, AiExercise, AiLesson, AiProject, ModuleContent } from '../../agentic/types.ts';
import { assemble } from '../assemble.ts';
import { kit } from '../kit.ts';
import { sref } from '../sources.ts';
import { NATURE_LABELS } from '../types.ts';
import type { ScenarioDef } from './def.ts';

const md = (...lines: string[]) => lines.join('\n');

export function buildScenario(d: ScenarioDef): ModuleContent {
  const { a, Q, M } = kit(d.id);
  const s = d.sheet;
  const cx = (i: 0 | 1 | 2) => ({ comp: `${d.id}-c${i + 1}`, lesson: `${d.id}-l${i + 1}`, tags: d.tags[i] });
  const [c1, c2, c3] = [cx(0), cx(1), cx(2)];
  const sheetBlock = [
    '```text',
    `Besoin         : ${s.need}`,
    `Signal         : ${s.signal}`,
    `Décide         : ${s.deciding}`,
    `Applique       : ${s.enforcing}`,
    `Preuve         : ${s.evidence}`,
    `Retour arrière : ${s.rollback}`,
    '```',
  ];
  const demo = (title: string, comment: string) => ({
    title,
    body: md('Fiche **fictive** abrégée :', ...sheetBlock, `**Lecture commentée.** ${comment}`, '**Ce que la démo ne prouve pas.** Aucune politique n’a été créée et aucun appareil n’a été configuré : c’est une lecture de fiche.'),
  });

  const lessons: AiLesson[] = [
    {
      id: c1.lesson, module: d.id, title: `${d.title} : le besoin, la menace et le signal`, minutes: 40,
      summary: 'Cadrer le besoin d’affaires, nommer la menace et trouver d’où vient le signal avant de choisir un produit.',
      objectives: ['Formuler le besoin et la menace sans nommer de produit.', 'Nommer la source du signal qui déclenchera la décision.', 'Distinguer ce qui est un signal de ce qui est une preuve.'],
      prerequisites: ['Modules des parcours Defender XDR et Intune concernés'],
      body: md(
        '## Le besoin',
        `${s.need}`,
        '## La menace visée',
        `${s.threat}`,
        '## D’où vient le signal',
        `${s.signal}`,
        'Un signal n’est pas une preuve. Le signal dit « il se passe peut-être quelque chose » ; la preuve dit « voici la valeur effective, voici l’événement, voici la date ». La rubrique partagée Defender + Intune sert à garder cette distinction visible : dans chaque scénario, on écrit d’abord le besoin et la menace, puis on cherche le signal, et seulement ensuite on choisit le produit qui décide et le composant qui applique.',
        '## Quatre questions avant de choisir un produit',
        'Avant de nommer quoi que ce soit, posez toujours les mêmes quatre questions : quel produit fournit la fonction, quelle licence la permet, de quoi dépend-elle et où voit-on la preuve ? Ces questions évitent deux erreurs fréquentes : promettre une protection qui exige une licence qu’on n’a pas, et déployer une politique dont la dépendance (un connecteur, un composant actif, un portail) n’est pas en place.',
        '## Écrire pour un lecteur qui n’était pas là',
        'Une fiche utile se lit sans son auteur. Écrivez donc le besoin et la menace dans des mots que comprend un gestionnaire, puis réservez le vocabulaire des produits aux rubriques techniques. Si quelqu’un d’autre ne peut pas refaire la vérification à partir de la fiche, la fiche est incomplète.',
        '## Les quatre états à ne pas confondre',
        'Dans toute la rubrique, on distingue quatre états. La **politique créée** existe dans un portail. La **politique assignée** cible un groupe d’utilisateurs ou d’appareils. La **politique reçue** est arrivée sur l’appareil, ce que montrent les rapports de profil. La **protection opérationnelle** signifie que le composant qui applique est actif et que la valeur effective correspond à l’intention. Chaque fiche de décision indique quelle preuve démontre chaque état, parce qu’un rapport vert prouve au mieux le troisième.',
        ...d.extras[0],
      ),
      demo: demo('Début de fiche', 'On commence par le besoin et le signal, jamais par le produit.'),
      guided: `${d.id}-g1`, autonomous: `${d.id}-a1`, quiz: [`${d.id}-q1a`, `${d.id}-q1b`, `${d.id}-q1c`],
      revision: md(`## Fiche : ${d.title}, cadrage`, `- Besoin : ${s.need}`, `- Signal : ${s.signal}`, '- Un signal n’est pas une preuve.', '- On écrit le besoin avant de choisir un produit.', '- Limite connue : ' + s.limits),
      links: d.links[0].map(sref), teaches: d.tags[0],
    },
    {
      id: c2.lesson, module: d.id, title: `${d.title} : qui décide, qui applique, où voit-on la preuve`, minutes: 45,
      summary: 'Attribuer la décision, l’application et la preuve à des produits distincts et lister les dépendances.',
      objectives: ['Distinguer le produit qui décide, le composant qui applique et le produit de preuve.', 'Nommer le portail où se fait la configuration.', 'Lister les connecteurs, licences et dépendances nécessaires.'],
      prerequisites: ['Leçon 1'],
      body: md(
        '## Qui décide',
        `Le produit qui décide : **${s.deciding}** Le portail de configuration : ${s.portal}`,
        '## Qui applique',
        `Le composant qui applique : ${s.enforcing}`,
        '## Où voit-on la preuve',
        `Le produit de preuve : ${s.evidence}`,
        '## Connecteurs et dépendances',
        `${s.dependencies}`,
        'La séparation est volontaire. Quand un même produit décide, applique et prouve, on ne peut pas détecter sa propre panne. Quand la décision se prend dans un portail et l’application dans un autre composant, il faut savoir lequel a le dernier mot en cas de conflit, et lequel affiche la vérité. Pour chaque scénario, la fiche de décision force à répondre à ces questions par écrit.',
        '## Licences, rôles et permissions',
        'Chaque rôle de la fiche suppose des droits : qui peut créer la politique, qui peut la modifier, qui peut lire la preuve. Séparer ces droits est une protection en soi, parce qu’une seule personne qui décide, déploie et prouve peut se tromper sans que personne le voie. Notez aussi les licences : une fonction native d’un produit peut exiger un plan précis, et une intégration entre deux produits peut exiger les deux licences.',
        '## Le test de la panne',
        'Pour vérifier qu’une attribution est saine, posez la question : si le composant qui applique tombe en panne, qui s’en aperçoit, et comment ? Si la réponse est « personne » ou « l’utilisateur, quand il se plaint », la fiche est incomplète. Un bon produit de preuve est indépendant de l’application : il lit l’état réel (inventaire, événements, rapport de santé) au lieu de répéter ce que la politique voulait.',
        ...d.extras[1],
      ),
      demo: demo('Attribution des rôles', 'Trois colonnes distinctes : qui décide, qui applique, qui prouve.'),
      guided: `${d.id}-g2`, autonomous: `${d.id}-a2`, quiz: [`${d.id}-q2a`, `${d.id}-q2b`, `${d.id}-q2c`],
      revision: md(`## Fiche : ${d.title}, rôles`, `- Décide : ${s.deciding}`, `- Applique : ${s.enforcing}`, `- Preuve : ${s.evidence}`, '- Dépendances : ' + s.dependencies, '- Nature dominante : ' + NATURE_LABELS[s.nature] + '.'),
      links: d.links[1].map(sref), teaches: d.tags[1],
    },
    {
      id: c3.lesson, module: d.id, title: `${d.title} : délais, échecs, vérification et retour arrière`, minutes: 45,
      summary: 'Prévoir les délais et les échecs, vérifier la valeur effective et écrire le retour arrière avant de déployer.',
      objectives: ['Énoncer les délais et les conditions qui retardent l’effet.', 'Anticiper les échecs possibles et leur couche d’origine.', 'Écrire la vérification et le retour arrière avant le déploiement.'],
      prerequisites: ['Leçons 1 et 2'],
      body: md(
        '## Délais et conditions',
        `${s.delays}`,
        '## Échecs possibles',
        `${s.failures}`,
        '## Vérification',
        `${s.verification}`,
        '## Retour arrière',
        `${s.rollback}`,
        '## Limites et incertitudes',
        `${s.limits} La nature dominante de cette couverture est : ${NATURE_LABELS[s.nature].toLowerCase()}.`,
        'La règle commune à tous les scénarios : on distingue quatre états (politique créée, assignée, reçue, protection opérationnelle) et on n’affirme que ce qu’on a prouvé. Un échec se localise par couche : le signal, la décision, l’application ou la preuve. Corriger à la mauvaise couche est la première cause de dépannage inutile.',
        '## Les preuves à conserver',
        'Pour chaque vérification, conservez trois choses : ce que vous avez fait (étapes et appareil de test), ce que vous avez observé (valeur effective, événement, capture avec date) et ce que vous en concluez (état atteint parmi les quatre). Une conclusion sans observation n’est qu’une opinion, et une observation sans date vieillit mal. Ces traces permettent à un autre membre de l’équipe de refaire la vérification après un changement.',
        '## Gouvernance de la fiche',
        'Une fiche de décision n’est pas un document qu’on remplit une fois. Elle a un propriétaire, une date de dernière vérification et une liste de sources. Quand la documentation de Microsoft change (nouvelle licence requise, paramètre déprécié, délai différent), on met à jour la fiche, la nature de la couverture et la date, puis on relance les tests de contenu. C’est la procédure de revue du parcours.',
        ...d.extras[2],
      ),
      demo: demo('Fin de fiche', 'La fiche se termine par la vérification et le retour arrière, pas par « déployé ».'),
      guided: `${d.id}-g3`, autonomous: `${d.id}-a3`, quiz: [`${d.id}-q3a`, `${d.id}-q3b`, `${d.id}-q3c`],
      revision: md(`## Fiche : ${d.title}, exploitation`, `- Délais : ${s.delays}`, `- Échecs : ${s.failures}`, `- Vérification : ${s.verification}`, `- Retour arrière : ${s.rollback}`, '- On corrige à la couche en cause.'),
      links: d.links[2].map(sref), teaches: d.tags[2],
    },
  ];

  const pick = <T,>(arr: T[], rot: number): T[] => [...arr.slice(rot), ...arr.slice(0, rot)];
  const q = (i: number, id: string, role: 'quiz' | 'eval', dim: 'comprendre' | 'fonctionner' | 'securiser' | 'maintenir', c: typeof c1): AiExercise => {
    const x = d.quiz[i];
    return Q(id, role, dim, c, x.t, x.q, [x.r, 'Exact pour ce scénario.'], x.w.map((t): [string, string] => [t, 'Inexact pour ce scénario : relisez la leçon.']), x.e);
  };
  const [n1, n2, n3] = d.components;
  const natureOptions: [string, string][] = pick(d.components.map((c, i): [string, string] => [`n${i + 1}`, NATURE_LABELS[c[1]]]), 1);

  const exercises: AiExercise[] = [
    a.match({ id: `${d.id}-g1`, title: 'Situation et réponse', comp: c1.comp, tags: c1.tags, role: 'guided', dim: 'comprendre', lesson: c1.lesson,
      st: 'Associez chaque situation à la réponse la plus juste.', items: d.pairs.map((p, i): [string, string] => [`p${i + 1}`, p[0]]),
      options: pick(d.pairs.map((p, i): [string, string] => [`s${i + 1}`, p[1]]), 1), answer: { p1: 's1', p2: 's2', p3: 's3' },
      exp: 'Chaque situation appelle une réponse précise, fondée sur le signal et sur la fiche de décision.' }),
    a.inspect({ id: `${d.id}-a1`, title: 'Relire un plan de scénario', comp: c1.comp, tags: c1.tags, role: 'autonomous', dim: 'securiser', lesson: c1.lesson, language: 'text',
      st: 'Plan fictif. Repérez les défauts.',
      lines: d.defects.map((x, i): [string, string, { ok: string; fixes: [string, string][] }] => [`p${i + 1}`, x[0], { ok: 'a1', fixes: [['a1', x[1]], ['a2', x[2]]] }]),
      exp: 'Trois défauts à corriger avant de déployer quoi que ce soit : chacun a une correction précise.' }),
    q(0, `${d.id}-q1a`, 'quiz', 'comprendre', c1), q(1, `${d.id}-q1b`, 'quiz', 'fonctionner', c1), q(2, `${d.id}-q1c`, 'quiz', 'securiser', c1),

    a.match({ id: `${d.id}-g2`, title: 'Décide, applique, prouve', comp: c2.comp, tags: c2.tags, role: 'guided', dim: 'comprendre', lesson: c2.lesson,
      st: 'Associez chaque rôle de la fiche à son contenu.', items: [['p1', 'Produit qui décide'], ['p2', 'Composant qui applique'], ['p3', 'Produit de preuve']],
      options: pick<[string, string]>([['s1', s.deciding], ['s2', s.enforcing], ['s3', s.evidence]], 1), answer: { p1: 's1', p2: 's2', p3: 's3' },
      exp: 'La décision, l’application et la preuve sont des rôles distincts dans la fiche de décision.' }),
    a.workflow({ id: `${d.id}-a2`, title: 'Vérifier le scénario', comp: c2.comp, tags: c2.tags, role: 'autonomous', dim: 'maintenir', lesson: c2.lesson,
      st: 'Ordonnez la vérification du scénario.',
      blocks: [...d.steps.ok.map((t, i): [string, string] => [`b${i + 1}`, t]), ['b6', d.steps.forbidden]],
      required: ['b1', 'b2', 'b3', 'b4', 'b5'], forbidden: ['b6'], before: [['b1', 'b2'], ['b2', 'b3'], ['b3', 'b4'], ['b4', 'b5']], notes: { b6: 'Cette étape contourne la vérification.' }, solution: ['b1', 'b2', 'b3', 'b4', 'b5'],
      exp: 'La vérification suit l’ordre : signal, décision, application, preuve puis consignation.' }),
    q(3, `${d.id}-q2a`, 'quiz', 'comprendre', c2), q(4, `${d.id}-q2b`, 'quiz', 'fonctionner', c2), q(5, `${d.id}-q2c`, 'quiz', 'securiser', c2),

    a.match({ id: `${d.id}-g3`, title: 'Délais, échecs, retour', comp: c3.comp, tags: c3.tags, role: 'guided', dim: 'securiser', lesson: c3.lesson,
      st: 'Associez chaque rubrique à son contenu dans la fiche.', items: [['p1', 'Délais et conditions'], ['p2', 'Échecs possibles'], ['p3', 'Retour arrière']],
      options: pick<[string, string]>([['s1', s.delays], ['s2', s.failures], ['s3', s.rollback]], 2), answer: { p1: 's1', p2: 's2', p3: 's3' },
      exp: 'Chaque rubrique de la fiche répond à une question différente avant le déploiement.' }),
    a.fix({ id: `${d.id}-a3`, title: 'Corriger une entrée de fiche', comp: c3.comp, tags: c3.tags, role: 'autonomous', dim: 'maintenir', lesson: c3.lesson, language: 'json',
      st: 'Corrigez l’entrée : sans preuve, on n’affirme que la réception.',
      starter: JSON.stringify({ etat: 'protection-operationnelle', preuve: '', retourArriere: '' }, null, 2),
      rules: [{ kind: 'equals', path: 'etat', value: 'politique-recue', message: 'Sans preuve de la valeur effective, l’état est « politique reçue ».', dim: 'securiser' }, { kind: 'type', path: 'preuve', type: 'string', message: 'Nommer la preuve attendue.', dim: 'maintenir' }, { kind: 'type', path: 'retourArriere', type: 'string', message: 'Écrire le retour arrière.', dim: 'maintenir' }],
      solution: JSON.stringify({ etat: 'politique-recue', preuve: s.evidence, retourArriere: s.rollback }, null, 2), exp: 'L’état réel, la preuve attendue et le retour arrière sont consignés dans l’entrée.' }),
    q(6, `${d.id}-q3a`, 'quiz', 'comprendre', c3), q(7, `${d.id}-q3b`, 'quiz', 'fonctionner', c3), q(8, `${d.id}-q3c`, 'quiz', 'maintenir', c3),

    q(9, `${d.id}-ev1`, 'eval', 'comprendre', c1),
    M(`${d.id}-ev2`, 'eval', 'securiser', c1, 'Contenu de la fiche', 'Cochez ce que la fiche de décision doit contenir.',
      [['La source du signal.', 'Sans signal, rien ne déclenche la décision.'], ['Le retour arrière.', 'Prévu avant le déploiement.']],
      [['Une capture d’écran de succès sans valeur effective.', 'Ce n’est pas une preuve.'], ['Le nombre de clics sur Enregistrer.', 'Sans rapport.']], 'La fiche contient le signal et le retour arrière, pas des indicateurs creux.'),
    a.order({ id: `${d.id}-ev3`, title: 'Ordre de la vérification', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'fonctionner', lesson: c2.lesson,
      st: 'Ordonnez les étapes de vérification du scénario.', items: d.steps.ok.map((t, i): [string, string] => [`s${i + 1}`, t]), correct: ['s1', 's2', 's3', 's4', 's5'],
      exp: 'La vérification suit la chaîne du signal à la preuve, puis consigne le résultat.' }),
    a.match({ id: `${d.id}-ev4`, title: 'Rubriques de la fiche', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'maintenir', lesson: c2.lesson,
      st: 'Associez chaque rubrique à son contenu dans la fiche.', items: [['p1', 'Connecteurs et dépendances'], ['p2', 'Vérification'], ['p3', 'Portail de configuration']],
      options: pick<[string, string]>([['s1', s.dependencies], ['s2', s.verification], ['s3', s.portal]], 1), answer: { p1: 's1', p2: 's2', p3: 's3' },
      exp: 'Les rubriques de la fiche portent chacune une information vérifiable et distincte.' }),
    a.workflow({ id: `${d.id}-ev5`, title: 'Traiter un échec', comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'maintenir', lesson: c3.lesson,
      st: 'Ordonnez le traitement d’un échec constaté.',
      blocks: [['b1', 'Lire l’état par appareil et par paramètre'], ['b2', 'Localiser la couche en cause : signal, décision, application ou preuve'], ['b3', 'Corriger à cette couche'], ['b4', 'Vérifier la valeur effective'], ['b5', 'Consigner dans la fiche'], ['b6', 'Redémarrer tous les appareils sans diagnostic']],
      required: ['b1', 'b2', 'b3', 'b4', 'b5'], forbidden: ['b6'], before: [['b1', 'b2'], ['b2', 'b3'], ['b3', 'b4'], ['b4', 'b5']], notes: { b6: 'Action de masse sans diagnostic.' }, solution: ['b1', 'b2', 'b3', 'b4', 'b5'],
      exp: 'On localise la couche avant de corriger, puis on vérifie et on consigne.' }),
    a.short({ id: `${d.id}-ev6`, title: d.short.title, comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'comprendre', lesson: c3.lesson,
      st: d.short.q, accepted: [String(d.short.value)], numeric: { value: d.short.value }, ph: 'un nombre', exp: d.short.exp }),
    q(10, `${d.id}-ev7`, 'eval', 'maintenir', c3),
    q(11, `${d.id}-ev8`, 'eval', 'securiser', c2),

    a.inspect({ id: `${d.id}-cs1`, title: `Cas : ${d.title}, relecture`, comp: c1.comp, tags: c1.tags, role: 'case', dim: 'securiser', lesson: c1.lesson, language: 'text',
      st: 'Plan fictif. Repérez les défauts.',
      lines: [['p1', 'Le tableau de bord est vert, donc la protection est opérationnelle.', { ok: 'a1', fixes: [['a1', 'Ajouter la valeur effective ou un signal du produit de preuve'], ['a2', 'Accepter']] }], ['p2', 'Une seule personne connaît qui décide et qui applique.', { ok: 'b1', fixes: [['b1', 'Documenter la fiche de décision'], ['b2', 'Accepter']] }], ['p3', 'Aucun retour arrière n’est prévu : on corrigera si ça casse.', { ok: 'c1', fixes: [['c1', 'Écrire le retour arrière avant le déploiement'], ['c2', 'Accepter']] }]],
      exp: 'Trois défauts de méthode communs à tous les scénarios : fausse preuve, savoir isolé et absence de retour.' }),
    a.workflow({ id: `${d.id}-cs2`, title: `Cas : ${d.title}, retour arrière`, comp: c2.comp, tags: c2.tags, role: 'case', dim: 'maintenir', lesson: c2.lesson,
      st: 'Ordonnez la préparation du retour arrière.',
      blocks: [['t1', 'Décrire l’état avant le changement'], ['t2', 'Prévoir l’action de retour'], ['t3', 'Tester le retour sur un pilote'], ['t4', 'Fixer le seuil qui déclenche le retour'], ['t5', 'Communiquer aux responsables'], ['t6', 'Déployer sans retour arrière']],
      required: ['t1', 't2', 't3', 't4', 't5'], forbidden: ['t6'], before: [['t1', 't2'], ['t2', 't3'], ['t3', 't4'], ['t4', 't5']], notes: { t6: 'Aucun filet de sécurité.' }, solution: ['t1', 't2', 't3', 't4', 't5'],
      exp: 'L’état initial, l’action de retour, le test, le seuil et la communication précèdent le déploiement.' }),
    a.match({ id: `${d.id}-cs3`, title: `Cas : ${d.title}, natures`, comp: c3.comp, tags: c3.tags, role: 'case', dim: 'maintenir', lesson: c3.lesson,
      st: 'Associez chaque composant à la nature de sa couverture.', items: [['p1', n1[0]], ['p2', n2[0]], ['p3', n3[0]]], options: natureOptions, answer: { p1: 'n1', p2: 'n2', p3: 'n3' },
      exp: 'La nature décrit honnêtement ce que chaque composant apporte : natif, intégration, dépendance ou autre.' }),
    a.open({ id: `${d.id}-cs-open`, title: `Cas : fiche de décision, ${d.title}`, comp: c3.comp, tags: c3.tags, role: 'case', dim: 'maintenir', lesson: c3.lesson,
      st: `Rédigez la fiche de décision complète du scénario « ${d.title} » pour une organisation fictive.`,
      deliverable: 'Une fiche : besoin, menace, signal, décision, portail, application, preuve, dépendances, délais, échecs, vérification et retour arrière.',
      rubric: [['r1', 'Le besoin et la menace sont écrits sans produit.', 'comprendre'], ['r2', 'Décision, application et preuve sont distinctes.', 'securiser'], ['r3', 'Les dépendances et licences sont listées.', 'fonctionner'], ['r4', 'Les échecs sont localisés par couche.', 'maintenir'], ['r5', 'La vérification et le retour arrière sont écrits.', 'maintenir']],
      exp: 'Pas de note automatique : on juge la complétude et la cohérence de la fiche.' }),

    Q(`${d.id}-rm1`, 'remediation', 'comprendre', c1, 'Remédiation : états', 'Pourquoi distinguer « politique créée » et « protection opérationnelle » ?', ['Créer une politique ne prouve pas qu’elle protège.', 'Quatre états distincts.'], [['Pour la licence.', 'Sans rapport.'], ['Pour le style.', 'Sans rapport.'], ['Aucune raison.', 'Faux.']], 'Seule la valeur effective prouve la protection.'),
    Q(`${d.id}-rm2`, 'remediation', 'fonctionner', c2, 'Remédiation : rôles', 'Pourquoi séparer le produit de preuve du composant qui applique ?', ['Un composant en panne ne peut pas signaler sa propre panne.', 'Indépendance de la preuve.'], [['Pour payer plus.', 'Faux.'], ['Pour la vitesse.', 'Faux.'], ['Aucune raison.', 'Faux.']], 'Une preuve indépendante détecte la panne de l’application.'),
    Q(`${d.id}-rm3`, 'remediation', 'maintenir', c3, 'Remédiation : retour', 'Pourquoi écrire le retour arrière avant de déployer ?', ['Pour pouvoir annuler vite un effet indésirable.', 'Filet de sécurité.'], [['Pour la forme.', 'Faux.'], ['Pour la licence.', 'Faux.'], ['Aucune raison.', 'Faux.']], 'Sans retour prévu, un incident dure plus longtemps.'),
  ];

  const competencies: AiCompetency[] = [
    { id: c1.comp, module: d.id, name: 'Cadrer le besoin, la menace et le signal', description: 'Du besoin d’affaires au signal.', criteria: [{ id: `${c1.comp}-1`, text: 'J’écris le besoin sans nommer de produit.' }, { id: `${c1.comp}-2`, text: 'Je nomme la menace et la source du signal.' }, { id: `${c1.comp}-3`, text: 'Je distingue signal et preuve.' }] },
    { id: c2.comp, module: d.id, name: 'Attribuer décision, application et preuve', description: 'Rôles, portails et dépendances.', criteria: [{ id: `${c2.comp}-1`, text: 'Je sépare qui décide, qui applique et qui prouve.' }, { id: `${c2.comp}-2`, text: 'Je liste connecteurs, licences et dépendances.' }, { id: `${c2.comp}-3`, text: 'Je vérifie dans l’ordre du signal à la preuve.' }] },
    { id: c3.comp, module: d.id, name: 'Anticiper échecs, vérification et retour arrière', description: 'Délais, couches d’échec et filet de sécurité.', criteria: [{ id: `${c3.comp}-1`, text: 'J’énonce les délais et les conditions.' }, { id: `${c3.comp}-2`, text: 'Je localise un échec par couche.' }, { id: `${c3.comp}-3`, text: 'J’écris le retour arrière avant le déploiement.' }] },
  ];

  const projects: AiProject[] = [
    { id: `${d.id}-p1`, module: d.id, level: 'débutant', title: `Fiche de décision : ${d.title}`, problem: `Remplir la fiche de décision complète du scénario « ${d.title} » pour une organisation fictive.`, architecture: 'Fiche d’une page avec les douze rubriques.', tools: ['Éditeur de texte', 'Fiche du catalogue'], data: 'Organisation fictive.', steps: ['Écrire le besoin et la menace.', 'Nommer signal, décision, application et preuve.', 'Écrire délais, échecs, vérification et retour.'], success: ['Aucune rubrique n’est vide.', 'Les rôles sont distincts.'], risks: ['Confondre signal et preuve.'], extensions: ['Ajouter la nature de chaque composant.'] },
    { id: `${d.id}-p2`, module: d.id, level: 'intermédiaire', title: `Plan de déploiement : ${d.title}`, problem: `Concevoir le déploiement par étapes du scénario « ${d.title} », avec pilote, critères de passage et retour arrière.`, architecture: 'Plan documenté avec calendrier, groupes et indicateurs.', tools: ['Éditeur de texte', 'Tableur'], data: 'Parc fictif.', steps: ['Définir les groupes de pilote et de production.', 'Fixer les critères de passage.', 'Écrire la vérification et le retour arrière.', 'Lister les risques résiduels.'], success: ['Chaque étape a un critère mesurable.', 'Le retour arrière est testable.'], risks: ['Déploiement sans pilote.'], extensions: ['Ajouter un plan de communication.'],
      connected: { accounts: 'Un locataire de test avec Defender et Intune, et un appareil de test.', permissions: 'Rôles de gestion des politiques de test dans le locataire de test.', costs: 'Licences de test.', secrets: 'Aucun secret.', cleanup: 'Retirer les politiques de test et réinitialiser ou désinscrire l’appareil de test.', limits: 'Facultatif : le parcours principal reste en simulation avec des données fictives.' } },
    { id: `${d.id}-p3`, module: d.id, level: 'avancé', title: `Test de robustesse : ${d.title}`, problem: `Éprouver le scénario « ${d.title} » : lister les échecs par couche, les tests qui les révéleraient et les preuves à conserver.`, architecture: 'Matrice échec, couche, test, preuve, correction.', tools: ['Tableur', 'Éditeur de texte'], data: 'Cas d’échec fictifs.', steps: ['Lister dix échecs plausibles.', 'Les classer par couche.', 'Écrire le test et la preuve de chacun.', 'Prioriser les corrections.'], success: ['Chaque échec a une couche, un test et une preuve.'], risks: ['Tester seulement le cas favorable.'], extensions: ['Ajouter un indicateur de santé par couche.'] },
  ];

  return assemble({ id: d.id, level: d.level, n: d.n, title: d.title, summary: d.summary, lessons, exercises, competencies, projects,
    caseTitle: `Cas : ${d.title}`, caseScenario: `Vous remplissez la fiche de décision du scénario « ${d.title} » et préparez sa vérification et son retour arrière. Actions simulées, données fictives.`, caseMinutes: 40 });
}
