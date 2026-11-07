// Module 5 : Audit et eDiscovery (niveau 4).
import type { AiProject } from '../../agentic/types.ts';
import { assemble } from '../assemble.ts';
import { kit } from '../kit.ts';
import { comp, lesson, project } from './dsl.ts';

const { a, Q, M } = kit('p05');
const c1 = { comp: 'p05-c1', lesson: 'p05-l1', tags: ['audit', 'retention-audit', 'recherche'] };
const c2 = { comp: 'p05-c2', lesson: 'p05-l2', tags: ['ediscovery', 'blocage', 'export'] };

const l1 = lesson('p05', {
  n: 1, title: 'Audit : Standard, Premium, recherche et conservation', minutes: 50,
  summary: 'Savoir quoi chercher, où et sur quelle période : différences entre Audit Standard et Premium, rôles, délais de disponibilité et limites de recherche.',
  objectives: ['Comparer Audit Standard et Premium (durée, licences, capacités).', 'Citer les rôles, le délai de disponibilité et les limites de la recherche.', 'Décrire l’effet des unités administratives sur la recherche.'],
  prerequisites: ['Module 4'],
  body: [
    '## L’audit répond à « qui a fait quoi, quand et où »',
    'Le **journal d’audit unifié** consigne les activités des utilisateurs et des administrateurs dans de nombreux services Microsoft 365. C’est la source de vérité pour reconstituer une chronologie : accès à un fichier, modification d’une règle de boîte, changement de politique. Pour un SOC, savoir où l’audit commence et où il s’arrête vaut autant que savoir lire une ligne.',
    '## Standard et Premium',
    '| Critère | Audit Standard | Audit Premium |',
    '| --- | --- | --- |',
    '| Activation | Activé par défaut | Selon la licence de l’utilisateur |',
    '| Conservation | 180 jours (90 avant le 17 octobre 2023) | 1 an pour Entra, Exchange, OneDrive et SharePoint (utilisateurs E5), jusqu’à 10 ans avec le complément |',
    '| Politiques de rétention personnalisées | Non | Oui |',
    '| Intelligent insights | Non | Oui, avec E5 et le plan de service Advanced Auditing |',
    '| Bande passante de l’API | Standard | Plus élevée |',
    'Retenez que la durée dépend de la **licence de l’utilisateur concerné**, et que la rétention de 10 ans demande un complément de licence. Les enregistrements sont généralement disponibles après **60 à 90 minutes** : une absence immédiate ne prouve pas l’absence d’activité.',
    '## Rôles',
    'La recherche exige un rôle de lecture de l’audit (*Audit Logs* ou *View-Only Audit Logs*). Les administrateurs **restreints** par unité administrative ne peuvent rechercher que dans les journaux des utilisateurs de leur unité, alors qu’un administrateur non restreint voit tout. Prévoyez un compte non restreint pour les vérifications transversales.',
    '## Rechercher efficacement',
    'Dans le portail, la recherche accepte des plages de dates, des activités, des utilisateurs et des mots-clés. Avec PowerShell, `Search-UnifiedAuditLog` renvoie **100 résultats par défaut** et jusqu’à **50 000** avec `ReturnLargeSet`. Pour de gros volumes, découpez en fenêtres de temps plus petites plutôt que d’élargir une seule requête, et notez la plage exacte utilisée : sans elle, une conclusion n’est pas reproductible.',
    '## Audit et chasse avancée',
    'Les données d’audit de plusieurs charges de travail alimentent aussi la chasse avancée dans Defender (module 6), avec une fenêtre d’environ 30 jours. Pour une enquête plus ancienne, retournez au journal d’audit et à sa conservation.',
    '## Limites à nommer',
    'L’audit ne prouve pas l’intention, une activité non journalisée n’y figure pas, et les durées varient selon la licence. Toute affirmation doit citer la plage de dates et le périmètre.',
    '## Réflexe de rapport',
    'Un rapport d’enquête fondé sur l’audit indique toujours la date de la recherche, la plage de dates, les utilisateurs et les activités filtrés, le rôle utilisé et les limites rencontrées (conservation, délai de disponibilité, étendue de l’unité administrative). Cette discipline rend le résultat reproductible et défendable.',
  ],
  demo: { title: 'Choisir la bonne fenêtre', lines: [
    'Cas **fictif** : enquête sur un partage de fichier il y a 7 mois.',
    '```text',
    'Utilisateur : licence E3, Audit Standard (180 jours)',
    'Constat     : l’activité date de 210 jours : hors conservation',
    '```',
    '**Lecture commentée.** L’audit ne peut pas répondre. On cherche d’autres traces (journaux sauvegardés, autres sources) et on documente la limite.',
    '**Ce que la démo ne prouve pas.** Les dates sont inventées.'] },
  revision: ['## Fiche : audit', '- Standard : activé par défaut, 180 jours.', '- Premium : 1 an (E5) et jusqu’à 10 ans avec complément ; rétention personnalisée.', '- Disponibilité : 60 à 90 minutes.', '- Search-UnifiedAuditLog : 100 par défaut, 50 000 avec ReturnLargeSet.', '- Unités administratives : recherche limitée à l’unité.'],
  links: ['audit', 'audit-start', 'audit-search', 'audit-retention', 'ps-ual'], teaches: ['audit', 'retention-audit', 'recherche'],
});

const l2 = lesson('p05', {
  n: 2, title: 'eDiscovery : cas, blocages, ensembles de révision et exportation', minutes: 50,
  summary: 'Conduire une collecte de preuve : cas, blocages, recherches, révision et exportation, avec les limites et la différence entre blocage et rétention.',
  objectives: ['Décrire le flux : cas, blocage, recherche, révision, exportation.', 'Distinguer blocage eDiscovery et rétention.', 'Citer les limites et l’expiration des exportations.'],
  prerequisites: ['Leçon précédente'],
  body: [
    '## À quoi sert l’eDiscovery',
    'L’**eDiscovery** permet de **préserver, rechercher, réviser et exporter** du contenu pour un dossier juridique, une enquête interne ou une demande réglementaire. Les expériences classiques ont été **retirées le 31 août 2025** : seule la nouvelle expérience est disponible. Si une procédure interne parle encore des expériences classiques, elle est obsolète.',
    '## Le flux de travail',
    '| Étape | Ce qu’on fait | Précaution |',
    '| --- | --- | --- |',
    '| Cas | Créer le conteneur et ajouter les membres | Rôles dédiés (Case Management) |',
    '| Blocage | Préserver le contenu des sources visées | Limites de nombre de boîtes et de sites |',
    '| Recherche | Interroger les sources avec des conditions | Garder la requête et la date |',
    '| Révision | Examiner dans un ensemble de révision (Premium) | Accès restreint |',
    '| Exportation | Remettre le contenu | Les exportations expirent après 14 jours |',
    '## Blocage et rétention',
    'Un **blocage** d’eDiscovery préserve le contenu pour un dossier précis et **prime sur la rétention** : même si une politique de rétention supprimerait l’élément, le blocage le garde. À l’inverse, la rétention est une règle de gestion générale du cycle de vie. Ne confondez pas les deux : retirer un blocage remet le contenu sous la règle de rétention applicable.',
    '## Limites utiles',
    'Selon l’édition, une organisation peut avoir jusqu’à **10 000 politiques de blocage** (Standard) ou **20 000** (Premium), avec **100 ou 200 par cas**, et **1 000 ou 2 000 boîtes ou sites par blocage**. Ces limites changent la façon de structurer les cas : un grand dossier se découpe en blocs gérables plutôt qu’en un blocage unique.',
    '## Lien avec les risques internes',
    'Une alerte de risque interne peut être **escaladée vers un cas eDiscovery** pour conserver et examiner le contenu. Le flux relie ainsi la détection (module 4) à la preuve (ce module).',
    '## Bonnes pratiques',
    'Nommez les cas clairement, limitez les membres, documentez les requêtes et les dates, vérifiez les rôles de chaque personne et fermez le cas quand il est terminé, en levant les blocages devenus inutiles pour ne pas conserver sans fin.',
    '## Clôture d’un dossier',
    'Quand le dossier se termine, confirmez avec le juridique que la conservation n’est plus nécessaire, levez les blocages, fermez le cas, supprimez les exportations devenues inutiles et consignez la date de clôture. Sans cette étape, des données restent gardées sans raison, ce qui augmente le risque et le coût.',
    '## Limites à nommer',
    'La nouvelle expérience ne remplace pas une procédure juridique : la valeur probante dépend de la chaîne de garde et des règles applicables. Faites valider par le juridique.',
  ],
  demo: { title: 'Cas et blocage', lines: [
    'Cas **fictif** : enquête interne chez Nordlys Technologies.',
    '```text',
    'Cas       : ENQ-2026-014   Membres : 2 juristes (Case Management)',
    'Blocage   : 3 boîtes + 1 site SharePoint   Politique de rétention : 3 ans',
    'Résultat  : le contenu est gardé malgré la suppression prévue à 3 ans',
    '```',
    '**Lecture commentée.** Le blocage prime sur la rétention tant qu’il reste en place. Il faut donc le lever à la clôture.',
    '**Ce que la démo ne prouve pas.** Aucun cas réel n’a été créé.'] },
  revision: ['## Fiche : eDiscovery', '- Flux : cas, blocage, recherche, révision, exportation.', '- Expériences classiques retirées le 31 août 2025.', '- Blocage prime sur la rétention.', '- Exportations : expirent après 14 jours.', '- Limites : 10 000 (Standard) ou 20 000 (Premium) politiques de blocage.'],
  links: ['edisc', 'edisc-workflow', 'edisc-limits', 'retention'], teaches: ['ediscovery', 'blocage', 'export'],
});

const exercises = [
  a.match({ id: 'p05-l1-g', title: 'Standard ou Premium', comp: c1.comp, tags: c1.tags, role: 'guided', dim: 'comprendre', lesson: 'p05-l1',
    st: 'Associez chaque caractéristique à l’édition.', items: [['p1', 'Activé par défaut, 180 jours'], ['p2', 'Rétention personnalisée et 1 an pour E5'], ['p3', 'Jusqu’à 10 ans avec complément']],
    options: [['s1', 'Audit Standard'], ['s2', 'Audit Premium'], ['s3', 'Audit Premium avec complément de licence']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Standard garde 180 jours, Premium 1 an pour E5 et 10 ans avec complément.' }),
  a.inspect({ id: 'p05-l1-a', title: 'Relire une conclusion d’enquête', comp: c1.comp, tags: c1.tags, role: 'autonomous', dim: 'verifier', lesson: 'p05-l1', language: 'text',
    st: 'Rapport fictif. Repérez les raisonnements fautifs.',
    lines: [['p1', 'Aucune ligne d’audit après 10 minutes : l’utilisateur n’a rien fait.', { ok: 'a1', fixes: [['a1', 'Attendre 60 à 90 minutes avant de conclure'], ['a2', 'Accepter']] }], ['p2', 'La recherche indique la plage de dates exacte.'], ['p3', 'La requête PowerShell par défaut montre tous les résultats.', { ok: 'b1', fixes: [['b1', 'Par défaut 100 résultats : utiliser ReturnLargeSet ou découper la période'], ['b2', 'Accepter']] }]],
    exp: 'Le délai de disponibilité et la limite par défaut expliquent deux erreurs fréquentes.' }),
  Q('p05-l1-qa', 'quiz', 'comprendre', c1, 'Durée Standard', 'Quelle est la conservation d’Audit Standard ?', ['180 jours.', 'Depuis le 17 octobre 2023.'], [['30 jours.', 'Faux.'], ['10 ans.', 'Faux.'], ['7 jours.', 'Faux.']], 'Audit Standard conserve 180 jours.'),
  Q('p05-l1-qb', 'quiz', 'verifier', c1, 'Disponibilité', 'Quel est le délai habituel de disponibilité d’un enregistrement ?', ['60 à 90 minutes.', 'Délai documenté.'], [['Instantané.', 'Faux.'], ['Deux semaines.', 'Faux.'], ['Un mois.', 'Faux.']], 'Les enregistrements sont généralement disponibles après 60 à 90 minutes.'),
  Q('p05-l1-qc', 'quiz', 'maintenir', c1, 'Résultats PowerShell', 'Combien de résultats Search-UnifiedAuditLog renvoie-t-il par défaut ?', ['100.', 'Valeur par défaut.'], [['50 000.', 'Avec ReturnLargeSet.'], ['10.', 'Faux.'], ['Tous.', 'Faux.']], 'Par défaut 100, jusqu’à 50 000 avec ReturnLargeSet.'),

  a.order({ id: 'p05-l2-g', title: 'Flux eDiscovery', comp: c2.comp, tags: c2.tags, role: 'guided', dim: 'fonctionner', lesson: 'p05-l2',
    st: 'Ordonnez le flux de travail.', items: [['s1', 'Créer le cas et ajouter les membres'], ['s2', 'Placer le blocage'], ['s3', 'Rechercher'], ['s4', 'Réviser'], ['s5', 'Exporter']], correct: ['s1', 's2', 's3', 's4', 's5'],
    exp: 'Cas, blocage, recherche, révision puis exportation.' }),
  a.config({ id: 'p05-l2-a', title: 'Paramétrer un cas', comp: c2.comp, tags: c2.tags, role: 'autonomous', dim: 'securiser', lesson: 'p05-l2',
    st: 'Paramétrez un cas d’enquête interne.', fields: [
      { id: 'mem', label: 'Membres limités avec le rôle Case Management', kind: 'toggle', accept: ['on'], why: 'Moindre privilège.' },
      { id: 'blk', label: 'Blocage sur les sources visées', kind: 'toggle', accept: ['on'], why: 'Préserve le contenu.' },
      { id: 'clo', label: 'Laisser les blocages après la clôture', kind: 'toggle', accept: ['off'], why: 'Conservation sans fin.' },
    ], solution: { mem: 'on', blk: 'on', clo: 'off' }, exp: 'Membres limités, blocage ciblé et levée à la clôture.' }),
  Q('p05-l2-qa', 'quiz', 'comprendre', c2, 'Blocage et rétention', 'Que se passe-t-il quand un blocage et une rétention s’opposent ?', ['Le blocage prime.', 'Règle documentée.'], [['La rétention prime.', 'Faux.'], ['Les deux s’annulent.', 'Faux.'], ['L’élément est supprimé.', 'Faux.']], 'Le blocage prime sur la rétention.'),
  Q('p05-l2-qb', 'quiz', 'maintenir', c2, 'Exportation', 'Après combien de jours une exportation expire-t-elle ?', ['14 jours.', 'Délai documenté.'], [['1 jour.', 'Faux.'], ['365 jours.', 'Faux.'], ['Jamais.', 'Faux.']], 'Les exportations expirent après 14 jours.'),
  Q('p05-l2-qc', 'quiz', 'verifier', c2, 'Expériences classiques', 'Que sait-on des expériences eDiscovery classiques ?', ['Elles ont été retirées le 31 août 2025.', 'Date documentée.'], [['Elles sont toujours recommandées.', 'Faux.'], ['Elles sont en préversion.', 'Faux.'], ['Elles n’ont jamais existé.', 'Faux.']], 'Les expériences classiques ont été retirées le 31 août 2025.'),

  Q('p05-ev1', 'eval', 'comprendre', c1, 'Rôle de lecture', 'Quel rôle permet de rechercher dans l’audit ?', ['View-Only Audit Logs ou Audit Logs.', 'Rôles documentés.'], [['Message Center Reader.', 'Autre usage.'], ['Case Management.', 'Pour eDiscovery.'], ['Aucun.', 'Faux.']], 'Les rôles Audit Logs ou View-Only Audit Logs permettent la recherche.'),
  M('p05-ev2', 'eval', 'comprendre', c1, 'Premium', 'Cochez les capacités propres à Audit Premium.', [['Rétention personnalisée.', 'Propre à Premium.'], ['Intelligent insights.', 'Propres à Premium.'], ['Bande passante d’API plus élevée.', 'Propre à Premium.']], [['Activation par défaut pour tous.', 'C’est Standard.'], ['Suppression automatique du journal.', 'Faux.']], 'Rétention personnalisée, insights et API plus large sont propres à Premium.'),
  a.order({ id: 'p05-ev3', title: 'Enquêter avec l’audit', comp: c1.comp, tags: c1.tags, role: 'eval', dim: 'fonctionner', lesson: 'p05-l1',
    st: 'Ordonnez une recherche d’audit.', items: [['s1', 'Vérifier son rôle et son étendue'], ['s2', 'Fixer la plage de dates'], ['s3', 'Choisir activités et utilisateurs'], ['s4', 'Lancer, puis découper si trop de résultats'], ['s5', 'Documenter plage et périmètre']], correct: ['s1', 's2', 's3', 's4', 's5'],
    exp: 'Rôle, dates, filtres, découpage puis documentation.' }),
  Q('p05-ev4', 'eval', 'securiser', c1, 'Unité administrative', 'Que voit un administrateur restreint à une unité dans l’audit ?', ['Les journaux des utilisateurs de son unité.', 'Étendue limitée.'], [['Tout le locataire.', 'Faux.'], ['Rien.', 'Faux.'], ['Les journaux système seulement.', 'Faux.']], 'Il ne voit que les journaux de son unité.'),
  a.short({ id: 'p05-ev5', title: 'Limite PowerShell', comp: c1.comp, tags: c1.tags, role: 'eval', dim: 'verifier', lesson: 'p05-l1',
    st: 'Quel nombre maximal de résultats avec ReturnLargeSet ? (nombre)', accepted: ['50000', '50 000'], numeric: { value: 50000 }, ph: 'un nombre',
    exp: 'Avec ReturnLargeSet, la commande peut renvoyer jusqu’à 50 000 résultats.' }),
  Q('p05-ev6', 'eval', 'securiser', c2, 'Clôture', 'Que faire d’un blocage devenu inutile ?', ['Le lever à la clôture du cas.', 'Évite la conservation sans fin.'], [['Le garder pour toujours.', 'Risque.'], ['L’ignorer.', 'Risque.'], ['Supprimer le cas sans lever.', 'Risque.']], 'On lève le blocage à la clôture.'),
  a.match({ id: 'p05-ev7', title: 'Édition et limite', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'comprendre', lesson: 'p05-l2',
    st: 'Associez chaque édition à sa limite de politiques de blocage par organisation.', items: [['p1', 'eDiscovery Standard'], ['p2', 'eDiscovery Premium']],
    options: [['s1', '10 000'], ['s2', '20 000']], answer: { p1: 's1', p2: 's2' },
    exp: 'Standard autorise 10 000 politiques de blocage, Premium 20 000.' }),
  Q('p05-ev8', 'eval', 'fonctionner', c2, 'Escalade', 'Comment une alerte de risque interne peut-elle alimenter eDiscovery ?', ['Par escalade vers un cas eDiscovery.', 'Lien documenté.'], [['Elle ne le peut pas.', 'Faux.'], ['Par courriel automatique seulement.', 'Faux.'], ['En supprimant l’alerte.', 'Faux.']], 'Une alerte peut être escaladée vers un cas eDiscovery.'),

  a.match({ id: 'p05-cs1', title: 'Cas : outil et question', comp: c1.comp, tags: c1.tags, role: 'case', dim: 'fonctionner', lesson: 'p05-l1',
    st: 'Associez chaque question de Nordlys Technologies à l’outil.', items: [['p1', 'Qui a modifié cette règle de boîte ?'], ['p2', 'Préserver trois boîtes pour un dossier'], ['p3', 'Remettre un lot de documents au juriste']],
    options: [['s1', 'Recherche d’audit'], ['s2', 'Blocage eDiscovery'], ['s3', 'Exportation eDiscovery']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'L’audit retrace, le blocage préserve et l’exportation remet le contenu.' }),
  a.inspect({ id: 'p05-cs2', title: 'Cas : procédure à relire', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'securiser', lesson: 'p05-l2', language: 'text',
    st: 'Procédure fictive. Repérez les failles.',
    lines: [['p1', 'On confond blocage et rétention : on supprime le blocage pour garder le contenu.', { ok: 'a1', fixes: [['a1', 'Le blocage prime sur la rétention : ne pas le confondre'], ['a2', 'Accepter']] }], ['p2', 'Les membres du cas sont limités.'], ['p3', 'Les exportations restent disponibles indéfiniment.', { ok: 'b1', fixes: [['b1', 'Les exportations expirent après 14 jours'], ['b2', 'Accepter']] }]],
    exp: 'Confusion blocage et rétention, et durée de vie des exportations sont deux erreurs.' }),
  a.workflow({ id: 'p05-cs3', title: 'Cas : dossier de preuve', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'maintenir', lesson: 'p05-l2',
    st: 'Ordonnez la constitution d’un dossier de preuve.',
    blocks: [['t1', 'Rechercher dans l’audit avec dates et accès'], ['t2', 'Créer le cas eDiscovery'], ['t3', 'Placer le blocage'], ['t4', 'Réviser le contenu'], ['t5', 'Exporter dans le délai'], ['t6', 'Supprimer l’audit pour éviter les fuites']],
    required: ['t1', 't2', 't3', 't4', 't5'], forbidden: ['t6'], before: [['t2', 't3'], ['t3', 't4'], ['t4', 't5']], notes: { t6: 'Détruit la preuve.' }, solution: ['t1', 't2', 't3', 't4', 't5'],
    exp: 'On documente l’audit, on crée le cas, on bloque, on révise puis on exporte.' }),
  a.open({ id: 'p05-cs-open', title: 'Cas : procédure d’enquête et de preuve', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'maintenir', lesson: 'p05-l2',
    st: 'Rédigez la procédure d’enquête (audit puis eDiscovery) d’une organisation fictive.',
    deliverable: 'Un document : rôles, recherche d’audit datée, limites de conservation, cas et blocages, révision, exportation, clôture et retour arrière.',
    rubric: [['r1', 'Les limites de conservation de l’audit sont citées.', 'verifier'], ['r2', 'Blocage et rétention sont distingués.', 'comprendre'], ['r3', 'Les rôles sont minimaux.', 'securiser'], ['r4', 'La clôture lève les blocages.', 'maintenir'], ['r5', 'La validation juridique est prévue.', 'verifier']],
    exp: 'Pas de note automatique : on juge la cohérence de la procédure.' }),

  Q('p05-rm1', 'remediation', 'comprendre', c1, 'Remédiation : audit', 'Que consigne le journal d’audit unifié ?', ['Les activités des utilisateurs et administrateurs.', 'Définition.'], [['Seulement les courriels.', 'Faux.'], ['Les mots de passe.', 'Faux.'], ['Rien.', 'Faux.']], 'Le journal consigne les activités des utilisateurs et administrateurs.'),
  Q('p05-rm2', 'remediation', 'securiser', c2, 'Remédiation : blocage', 'À quoi sert un blocage eDiscovery ?', ['À préserver le contenu pour un dossier.', 'Définition.'], [['À supprimer le contenu.', 'Faux.'], ['À chiffrer le contenu.', 'Faux.'], ['À renommer les fichiers.', 'Faux.']], 'Un blocage préserve le contenu pour un dossier.'),
  Q('p05-rm3', 'remediation', 'maintenir', c1, 'Remédiation : limite', 'Que faire quand une activité date d’avant la conservation ?', ['Chercher d’autres traces et documenter la limite.', 'Honnêteté sur les limites.'], [['Conclure à l’absence d’activité.', 'Faux.'], ['Inventer la date.', 'Faux.'], ['Ignorer.', 'Faux.']], 'On cherche d’autres traces et on documente la limite.'),
];

const competencies = [
  comp('p05', 1, 'Exploiter l’audit', 'Éditions, rôles, recherche et limites de conservation.', ['Je compare Standard et Premium.', 'Je cite délai, rôles et limites de recherche.', 'Je documente plage de dates et périmètre.']),
  comp('p05', 2, 'Conduire une collecte eDiscovery', 'Cas, blocages, révision et exportation.', ['Je décris le flux complet.', 'Je distingue blocage et rétention.', 'Je cite les limites et l’expiration des exportations.']),
];

const projects: AiProject[] = [
  project('p05', 1, 'avancé', 'Procédure d’enquête audit et eDiscovery', 'Rédiger pour une organisation fictive la procédure de recherche d’audit puis de collecte eDiscovery.', 'Procédure de deux pages.', ['Définir les rôles.', 'Décrire la recherche d’audit.', 'Décrire cas, blocage, révision, exportation.', 'Prévoir la clôture.'], ['Les limites sont citées.', 'La chaîne de preuve est tracée.', 'La clôture lève les blocages.'], ['Confondre blocage et rétention.', 'Oublier les unités administratives.'], ['Ajouter l’escalade depuis l’IRM.']),
];

export const p05 = assemble({ id: 'p05', level: 4, n: 5, title: 'Audit et eDiscovery',
  summary: 'Audit Standard et Premium, rôles, recherche et conservation ; eDiscovery : cas, blocages, révision, exportation et limites.',
  lessons: [l1, l2], exercises, competencies, projects,
  caseTitle: 'Constituer un dossier de preuve chez Nordlys Technologies',
  caseScenario: 'Vous cherchez dans l’audit, placez un blocage et préparez l’exportation d’un dossier fictif. Actions simulées.', caseMinutes: 45 });
