// Module 2 : Classifier et étiqueter (niveau 2).
import type { AiProject } from '../../agentic/types.ts';
import { assemble } from '../assemble.ts';
import { kit } from '../kit.ts';
import { comp, lesson, project } from './dsl.ts';

const { a, Q, M } = kit('p02');
const c1 = { comp: 'p02-c1', lesson: 'p02-l1', tags: ['classification', 'sit', 'faux-positifs'] };
const c2 = { comp: 'p02-c2', lesson: 'p02-l2', tags: ['etiquettes', 'priorite', 'publication'] };

const l1 = lesson('p02', {
  n: 1, title: 'Classifier : types d’informations sensibles, EDM et classificateurs', minutes: 50,
  summary: 'Choisir la bonne méthode de classification, tester un type d’information sensible et réduire les faux positifs avant de s’en servir dans une politique.',
  objectives: ['Distinguer type d’information sensible, entité nommée, EDM, empreinte de document et classificateur entraînable.', 'Réduire les faux positifs avec un test et une étendue, plutôt qu’à l’aveugle.', 'Expliquer pourquoi une capacité partagée mal calibrée dégrade plusieurs solutions.'],
  prerequisites: ['Module 1'],
  body: [
    '## Pourquoi classifier avant de protéger',
    'Une politique de protection ne vaut que par la qualité de ce qu’elle détecte. Dans Purview, la **classification** décide quelles données sont considérées sensibles : une fois classées, elles peuvent être étiquetées, surveillées par la DLP, conservées ou retrouvées par l’eDiscovery. Comme les classifiers sont une **capacité partagée**, une détection mal calibrée produit des effets en cascade : trop de faux positifs, des alertes inutiles, des utilisateurs bloqués à tort.',
    '## Les méthodes de classification',
    '| Méthode | Principe | Bon usage |',
    '| --- | --- | --- |',
    '| Type d’information sensible (SIT) | Motif, mots-clés, somme de contrôle et preuves proches | Numéros réguliers : carte, identifiant national, compte |',
    '| Entité nommée | Détection d’éléments de contexte (noms, adresses) | Compléter un SIT par des indices |',
    '| Correspondance exacte de données (EDM) | Comparaison à une table de valeurs réelles hachées avec sel | Données propres à l’organisation (dossiers clients, employés) |',
    '| Empreinte de document | Reconnaissance de formulaires et de modèles | Formulaires standard remplis par des tiers |',
    '| Classificateur entraînable | Modèle appris à partir d’exemples positifs et négatifs | Contenu non structuré (contrats, code source) |',
    'Retenez la logique : un motif fixe se détecte par SIT, une valeur propre à l’organisation par EDM (la table est hachée avec un sel, peut atteindre 100 millions de lignes et se rafraîchir chaque jour), et un type de document qu’on ne sait pas décrire par motif par un classificateur entraînable. La reconnaissance optique de caractères (OCR) permet aussi de lire le texte dans des images, selon la configuration.',
    '## Construire un SIT qui tient',
    'Un SIT fiable combine un **motif principal**, des **éléments de preuve proches** (mots-clés, formats voisins) et un **niveau de confiance** par combinaison. Plus la preuve est forte, plus la confiance monte. Une règle dans une politique choisit ensuite le niveau de confiance qu’elle exige et le nombre d’occurrences minimal avant d’agir. Un seuil trop bas déclenche sur un seul numéro isolé, un seuil trop haut laisse passer des fuites de petite taille.',
    '## Réduire les faux positifs',
    'La documentation propose des leviers concrets : exiger des **preuves de soutien** à proximité, relever le **niveau de confiance** ou le **nombre d’instances**, exclure certains **emplacements ou expéditeurs**, et utiliser les retours *Match* et *Not a match* pour documenter les cas. La fonction **Test SIT** permet d’essayer un fichier d’exemple et exige au moins une licence Exchange Online. Testez sur des données représentatives avant tout déploiement.',
    '## Ordre de travail recommandé',
    '1. Choisir la méthode selon la nature de la donnée. 2. Écrire ou ajuster le SIT. 3. Tester avec des échantillons positifs et négatifs. 4. Mesurer le taux de faux positifs. 5. Seulement ensuite, l’utiliser dans une étiquette automatique ou une règle DLP en **simulation**.',
    '## Limites à nommer',
    'Un classificateur entraînable demande des exemples suffisants et une validation, un EDM demande un processus de gestion de la table source (accès, mise à jour, hachage), et aucun mécanisme n’est parfait. Le SOC doit pouvoir dire pourquoi un élément a été détecté et avec quelle confiance, ce qui rend les tests documentés indispensables.',
    '## Ce que le SOC retient',
    'Une alerte DLP forte au-dessus d’un SIT faible est une alerte à vérifier, pas un incident confirmé. Avant d’escalader, lisez la règle, le niveau de confiance et le nombre d’occurrences.',
  ],
  demo: { title: 'Comparer deux seuils', lines: [
    'Cas **fictif** : Nordlys Technologies détecte des numéros de carte dans les courriels.',
    '```text',
    'Règle A : 1 occurrence, confiance basse    -> 412 correspondances/semaine, 90 % de faux positifs',
    'Règle B : 5 occurrences, confiance haute   ->  18 correspondances/semaine, 11 % de faux positifs',
    '```',
    '**Lecture commentée.** La règle B réduit le bruit, mais risque de laisser passer une fuite de quatre numéros. Le choix doit être documenté.',
    '**Ce que la démo ne prouve pas.** Les chiffres sont inventés pour illustrer le compromis.'] },
  revision: ['## Fiche : classification', '- SIT : motif et preuves ; EDM : valeurs hachées avec sel ; classificateur : modèle entraîné.', '- Réduire les faux positifs : preuves, confiance, nombre d’instances, exclusions.', '- Tester avant d’utiliser ; capacité partagée donc impact multiple.', '- Test SIT : au moins une licence Exchange Online.'],
  links: ['classifiers', 'sit', 'edm', 'false-positives'], teaches: ['classification', 'sit', 'faux-positifs'],
});

const l2 = lesson('p02', {
  n: 2, title: 'Étiquettes de sensibilité : conception, priorité et publication', minutes: 50,
  summary: 'Concevoir une taxonomie d’étiquettes lisible, comprendre la priorité, créer puis publier par politique, et éviter les erreurs classiques.',
  objectives: ['Expliquer la priorité des étiquettes et la règle d’une seule étiquette par élément.', 'Séparer la création d’une étiquette de sa publication par une politique.', 'Citer les limites utiles : 500 étiquettes avec chiffrement, efficacité au-delà de cinq principales.'],
  prerequisites: ['Leçon précédente'],
  body: [
    '## Ce que fait une étiquette',
    'Une **étiquette de sensibilité** classe et protège un élément : elle peut ajouter un marquage visuel, appliquer un **chiffrement** avec des permissions précises, et être lue par d’autres solutions comme la DLP. Un élément ne porte qu’**une seule étiquette de sensibilité** à la fois. L’étiquette voyage avec le fichier, ce qui la rend utile dans les flux hors de Microsoft 365.',
    '## Créer, puis publier',
    'Créer une étiquette ne la rend pas visible aux utilisateurs. Il faut la **publier au moyen d’une politique d’étiquettes**, qui choisit les utilisateurs ou groupes concernés, l’étiquette par défaut et les exigences (justification, étiquette obligatoire). Cette séparation permet un **pilote** : publier à un petit groupe, mesurer, puis élargir.',
    '## La priorité',
    'L’ordre dans la liste compte : l’étiquette placée **en bas** a la priorité la plus **restrictive**. Pour la compatibilité et la clarté, classez des moins sensibles aux plus sensibles. L’ordre sert notamment à résoudre les cas où plusieurs règles ou signaux proposeraient des étiquettes différentes.',
    '| Priorité (haut vers bas) | Exemple d’étiquette | Effet type |',
    '| --- | --- | --- |',
    '| 1 | Public | Aucun marquage |',
    '| 2 | Interne | Marquage d’en-tête |',
    '| 3 | Confidentiel | Marquage et accès limité |',
    '| 4 | Hautement confidentiel | Chiffrement, permissions précises |',
    '## Les limites qui comptent',
    'Si le chiffrement définit les utilisateurs et leurs permissions, la limite est de **500 étiquettes**. L’efficacité diminue au-delà de **cinq étiquettes principales** ou de cinq sous-étiquettes par étiquette : trop de choix paralyse les utilisateurs. Supprimer une étiquette ne la retire pas des contenus déjà étiquetés, et la **version** de l’étiquette appliquée est celle qui est appliquée au moment où l’on protège le contenu.',
    '## Étendues',
    'Une étiquette a des **étendues** (fichiers, courriels, réunions, groupes et sites, ressources de la Data Map). L’étendue **Réunions** exige aussi les fichiers et les courriels. Choisissez l’étendue la plus étroite qui répond au besoin.',
    '## Étiquetage manuel, par défaut, obligatoire, automatique',
    'Un déploiement robuste progresse par étapes : d’abord un étiquetage manuel avec formation, puis une étiquette par défaut, puis un étiquetage obligatoire avec justification si on abaisse une étiquette, enfin un étiquetage automatique testé en simulation. Chaque étape ajoute de la protection, mais aussi de la friction.',
    '## Schéma d’étiquettes moderne',
    'Les locataires créés à partir du 1er octobre 2025 utilisent un schéma d’étiquettes plus récent. Vérifiez le schéma de votre locataire avant de suivre une procédure plus ancienne.',
    '## Erreurs fréquentes',
    '- Créer vingt étiquettes copiant l’organigramme. - Appliquer le chiffrement par défaut sans pilote. - Supprimer une étiquette en croyant nettoyer les contenus. - Oublier de publier.',
    '## Vérifier',
    'Après publication, ouvrez un document avec un compte pilote et un compte hors pilote, et confirmez l’étiquette disponible, le marquage et l’accès.',
  ],
  demo: { title: 'Lire une taxonomie', lines: [
    'Taxonomie **fictive** :',
    '```text',
    'Public < Interne < Confidentiel < Hautement confidentiel',
    'Publication : groupe pilote Finance (50 personnes), étiquette par défaut Interne',
    '```',
    '**Lecture commentée.** Quatre étiquettes principales : sous la limite d’efficacité. Le pilote réduit le risque d’un blocage généralisé.',
    '**Ce que la démo ne prouve pas.** Aucune étiquette réelle n’est publiée.'] },
  revision: ['## Fiche : étiquettes', '- Une seule étiquette par élément ; la plus restrictive est en bas.', '- Créer puis publier par une politique ; pilote d’abord.', '- Limites : 500 avec chiffrement ; efficacité au-delà de cinq principales.', '- Supprimer ne retire pas des contenus.', '- Réunions : exige fichiers et courriels.'],
  links: ['labels', 'labels-start', 'labels-create'], teaches: ['etiquettes', 'priorite', 'publication'],
});

const exercises = [
  a.match({ id: 'p02-l1-g', title: 'Méthode et usage', comp: c1.comp, tags: c1.tags, role: 'guided', dim: 'comprendre', lesson: 'p02-l1',
    st: 'Associez chaque méthode à son bon usage.', items: [['p1', 'Type d’information sensible'], ['p2', 'EDM'], ['p3', 'Classificateur entraînable']],
    options: [['s1', 'Motif régulier comme un numéro de carte'], ['s2', 'Valeurs propres à l’organisation, hachées'], ['s3', 'Contenu non structuré appris par exemples']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Un SIT détecte un motif, l’EDM compare à des valeurs hachées et le classificateur apprend à reconnaître un type de contenu.' }),
  a.inspect({ id: 'p02-l1-a', title: 'Relire un réglage de détection', comp: c1.comp, tags: c1.tags, role: 'autonomous', dim: 'verifier', lesson: 'p02-l1', language: 'text',
    st: 'Plan fictif de détection. Repérez les raisonnements fautifs.',
    lines: [['p1', 'Un seul numéro de carte isolé suffit pour bloquer, sans test préalable.', { ok: 'a1', fixes: [['a1', 'Tester, exiger des preuves et un nombre d’instances adapté'], ['a2', 'Accepter']] }], ['p2', 'La table EDM est hachée avec un sel avant l’envoi.'], ['p3', 'Le SIT sera déployé en production sans échantillon négatif.', { ok: 'b1', fixes: [['b1', 'Tester avec des échantillons positifs et négatifs avant usage'], ['b2', 'Accepter']] }]],
    exp: 'Sans test et sans seuil, on obtient des faux positifs ; l’EDM, lui, hache bien ses valeurs avec un sel.' }),
  Q('p02-l1-qa', 'quiz', 'comprendre', c1, 'EDM', 'Comment les valeurs d’une table EDM sont-elles protégées ?', ['Elles sont hachées avec un sel.', 'Principe documenté.'], [['Elles sont en clair.', 'Faux.'], ['Elles sont chiffrées avec la clé de l’utilisateur.', 'Faux.'], ['Elles ne sont pas stockées.', 'Faux.']], 'L’EDM compare à des valeurs hachées avec un sel.'),
  Q('p02-l1-qb', 'quiz', 'verifier', c1, 'Réduire le bruit', 'Quel levier réduit les faux positifs d’un SIT ?', ['Exiger des preuves de soutien et relever le niveau de confiance.', 'Leviers documentés.'], [['Désactiver tous les tests.', 'Aggrave.'], ['Baisser le seuil à une occurrence.', 'Augmente le bruit.'], ['Supprimer la journalisation.', 'Sans effet sur la détection.']], 'Preuves de soutien, niveau de confiance et nombre d’instances réduisent le bruit.'),
  Q('p02-l1-qc', 'quiz', 'maintenir', c1, 'Test SIT', 'Quel prérequis est cité pour la fonction Test SIT ?', ['Au moins une licence Exchange Online.', 'Prérequis documenté.'], [['Une licence Audit Premium.', 'Non.'], ['Un abonnement Intune.', 'Non.'], ['Aucun prérequis.', 'Faux.']], 'Test SIT exige au moins une licence Exchange Online.'),

  a.order({ id: 'p02-l2-g', title: 'Du plan à la publication', comp: c2.comp, tags: c2.tags, role: 'guided', dim: 'fonctionner', lesson: 'p02-l2',
    st: 'Ordonnez les étapes pour offrir une étiquette aux utilisateurs.', items: [['s1', 'Définir la taxonomie et la priorité'], ['s2', 'Créer l’étiquette avec ses étendues'], ['s3', 'Créer une politique d’étiquettes pour le groupe pilote'], ['s4', 'Publier'], ['s5', 'Vérifier avec un compte pilote']], correct: ['s1', 's2', 's3', 's4', 's5'],
    exp: 'On conçoit, on crée, on prépare la politique, on publie puis on vérifie.' }),
  a.config({ id: 'p02-l2-a', title: 'Paramétrer un pilote', comp: c2.comp, tags: c2.tags, role: 'autonomous', dim: 'securiser', lesson: 'p02-l2',
    st: 'Paramétrez le premier déploiement d’étiquettes.',
    fields: [
      { id: 'pilote', label: 'Publier d’abord à un groupe pilote', kind: 'toggle', accept: ['on'], why: 'Limite l’impact d’une erreur.' },
      { id: 'defaut', label: 'Étiquette par défaut : Interne', kind: 'toggle', accept: ['on'], why: 'Étiquette de base sans friction excessive.' },
      { id: 'chiffre', label: 'Chiffrement par défaut pour tous dès le départ', kind: 'toggle', accept: ['off'], why: 'À introduire après le pilote.' },
      { id: 'dix', label: 'Vingt étiquettes principales', kind: 'toggle', accept: ['off'], why: 'L’efficacité diminue au-delà de cinq.' },
    ], solution: { pilote: 'on', defaut: 'on', chiffre: 'off', dix: 'off' }, exp: 'Pilote, étiquette par défaut simple, chiffrement progressif et taxonomie courte.' }),
  Q('p02-l2-qa', 'quiz', 'comprendre', c2, 'Une étiquette', 'Combien d’étiquettes de sensibilité un élément peut-il porter ?', ['Une seule.', 'Règle documentée.'], [['Deux.', 'Faux.'], ['Autant qu’on veut.', 'Faux.'], ['Aucune par défaut obligatoire.', 'Faux.']], 'Un élément ne porte qu’une étiquette de sensibilité.'),
  Q('p02-l2-qb', 'quiz', 'fonctionner', c2, 'Priorité', 'Où se place l’étiquette la plus restrictive dans l’ordre ?', ['En bas de la liste.', 'La priorité la plus restrictive est en bas.'], [['En haut.', 'Faux.'], ['Au hasard.', 'Faux.'], ['Hors liste.', 'Faux.']], 'L’étiquette du bas a la priorité la plus restrictive.'),
  Q('p02-l2-qc', 'quiz', 'securiser', c2, 'Suppression', 'Que se passe-t-il quand on supprime une étiquette ?', ['Elle reste sur les contenus déjà étiquetés.', 'Pas de nettoyage automatique.'], [['Elle est retirée de tous les contenus.', 'Faux.'], ['Les fichiers sont supprimés.', 'Faux.'], ['Les utilisateurs sont bloqués.', 'Faux.']], 'Supprimer l’étiquette ne la retire pas des contenus.'),

  Q('p02-ev1', 'eval', 'comprendre', c1, 'Choisir la méthode', 'Des dossiers clients propres à l’organisation doivent être détectés avec précision. Quelle méthode ?', ['EDM.', 'Valeurs réelles hachées.'], [['Empreinte de document seule.', 'Pour formulaires.'], ['Classificateur seul.', 'Moins précis pour des valeurs exactes.'], ['Aucune.', 'Faux.']], 'L’EDM convient aux données propres à l’organisation.'),
  M('p02-ev2', 'eval', 'verifier', c1, 'Leviers anti faux positifs', 'Cochez les leviers qui réduisent les faux positifs.', [['Exiger des preuves de soutien.', 'Efficace.'], ['Relever le niveau de confiance.', 'Efficace.'], ['Augmenter le nombre d’instances.', 'Efficace.']], [['Supprimer les journaux.', 'Sans effet.'], ['Désactiver le test.', 'Aggrave.']], 'Preuves, confiance et instances réduisent le bruit.'),
  a.order({ id: 'p02-ev3', title: 'Calibrer un SIT', comp: c1.comp, tags: c1.tags, role: 'eval', dim: 'verifier', lesson: 'p02-l1',
    st: 'Ordonnez le travail de calibrage d’un SIT.', items: [['s1', 'Choisir la méthode'], ['s2', 'Écrire ou ajuster le SIT'], ['s3', 'Tester avec échantillons positifs et négatifs'], ['s4', 'Mesurer les faux positifs'], ['s5', 'Utiliser en simulation']], correct: ['s1', 's2', 's3', 's4', 's5'],
    exp: 'On choisit, on écrit, on teste, on mesure puis on utilise en simulation.' }),
  Q('p02-ev4', 'eval', 'securiser', c2, 'Limite d’efficacité', 'Au-delà de combien d’étiquettes principales l’efficacité diminue-t-elle ?', ['Cinq.', 'Seuil documenté.'], [['Vingt.', 'Faux.'], ['Cent.', 'Faux.'], ['Une.', 'Faux.']], 'L’efficacité diminue au-delà de cinq étiquettes principales.'),
  Q('p02-ev5', 'eval', 'fonctionner', c2, 'Visibilité', 'Une étiquette créée n’apparaît pas aux utilisateurs. Que manque-t-il ?', ['La publication par une politique d’étiquettes.', 'Création et publication sont séparées.'], [['Une licence Audit.', 'Sans rapport.'], ['Un redémarrage du portail.', 'Faux.'], ['Un rôle eDiscovery.', 'Sans rapport.']], 'Il faut publier l’étiquette avec une politique.'),
  a.config({ id: 'p02-ev6', title: 'Étendues d’une étiquette de réunion', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'fonctionner', lesson: 'p02-l2',
    st: 'Configurez une étiquette qui protège les réunions.', fields: [
      { id: 'reun', label: 'Étendue Réunions', kind: 'toggle', accept: ['on'], why: 'Étendue visée.' },
      { id: 'fich', label: 'Étendue Fichiers et courriels', kind: 'toggle', accept: ['on'], why: 'Requise avec l’étendue Réunions.' },
      { id: 'data', label: 'Étendue Data Map', kind: 'toggle', accept: ['off'], why: 'Inutile ici : choisir l’étendue la plus étroite.' },
    ], solution: { reun: 'on', fich: 'on', data: 'off' }, exp: 'Les réunions exigent les fichiers et les courriels ; le reste est inutile.' }),
  Q('p02-ev7', 'eval', 'securiser', c2, 'Limite avec chiffrement', 'Quelle est la limite d’étiquettes quand le chiffrement définit utilisateurs et permissions ?', ['500.', 'Limite documentée.'], [['50.', 'Faux.'], ['5 000.', 'Faux.'], ['Aucune.', 'Faux.']], 'La limite est de 500 étiquettes avec ce type de chiffrement.'),
  a.short({ id: 'p02-ev8', title: 'Étiquettes principales conseillées', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'maintenir', lesson: 'p02-l2',
    st: 'Au plus combien d’étiquettes principales gardent une bonne efficacité ? (nombre)', accepted: ['5', 'cinq'], numeric: { value: 5 }, ph: 'un nombre',
    exp: 'La documentation indique que l’efficacité diminue au-delà de cinq étiquettes principales.' }),

  a.match({ id: 'p02-cs1', title: 'Cas : problèmes et leviers', comp: c1.comp, tags: c1.tags, role: 'case', dim: 'verifier', lesson: 'p02-l1',
    st: 'Associez chaque problème de Nordlys Technologies à un levier.', items: [['p1', 'Trop d’alertes sur un numéro isolé'], ['p2', 'Contrats non structurés à repérer'], ['p3', 'Dossiers clients propres à l’organisation']],
    options: [['s1', 'Relever confiance et instances'], ['s2', 'Classificateur entraînable'], ['s3', 'EDM']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Le seuil règle le bruit, le classificateur couvre le non structuré, l’EDM les valeurs propres.' }),
  a.inspect({ id: 'p02-cs2', title: 'Cas : plan d’étiquettes à relire', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'securiser', lesson: 'p02-l2', language: 'text',
    st: 'Plan fictif. Repérez les failles.',
    lines: [['p1', 'Quinze étiquettes principales pour refléter chaque service.', { ok: 'a1', fixes: [['a1', 'Réduire à cinq principales ou moins'], ['a2', 'Accepter']] }], ['p2', 'Publication d’abord à un groupe pilote.'], ['p3', 'Nous supprimerons l’ancienne étiquette pour nettoyer les contenus.', { ok: 'b1', fixes: [['b1', 'La suppression ne retire rien des contenus : prévoir un autre plan'], ['b2', 'Accepter']] }]],
    exp: 'Trop d’étiquettes et une suppression mal comprise sont deux défauts.' }),
  a.workflow({ id: 'p02-cs3', title: 'Cas : déploiement par étapes', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'fonctionner', lesson: 'p02-l2',
    st: 'Ordonnez le déploiement progressif des étiquettes.',
    blocks: [['t1', 'Étiquetage manuel avec formation'], ['t2', 'Étiquette par défaut'], ['t3', 'Étiquetage obligatoire avec justification'], ['t4', 'Étiquetage automatique testé en simulation'], ['t5', 'Tout activer le même jour pour aller vite']],
    required: ['t1', 't2', 't3', 't4'], forbidden: ['t5'], before: [['t1', 't2'], ['t2', 't3'], ['t3', 't4']], notes: { t5: 'Maximise la friction et les erreurs.' }, solution: ['t1', 't2', 't3', 't4'],
    exp: 'On ajoute la protection par paliers, du manuel à l’automatique.' }),
  a.open({ id: 'p02-cs-open', title: 'Cas : taxonomie et plan de classification', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'maintenir', lesson: 'p02-l2',
    st: 'Rédigez la taxonomie d’étiquettes et le plan de classification d’une organisation fictive.',
    deliverable: 'Un document : étiquettes et priorité, types d’informations sensibles visés avec tests, politique de publication, pilote, mesures de succès et retour arrière.',
    rubric: [['r1', 'La taxonomie reste lisible (cinq principales ou moins).', 'securiser'], ['r2', 'Chaque détection a un test et un seuil.', 'verifier'], ['r3', 'Un pilote précède la publication large.', 'fonctionner'], ['r4', 'Le retour arrière est décrit.', 'maintenir'], ['r5', 'Les sources sont datées.', 'verifier']],
    exp: 'Pas de note automatique : on juge la cohérence du plan.' }),

  Q('p02-rm1', 'remediation', 'comprendre', c1, 'Remédiation : SIT', 'Que combine un SIT fiable ?', ['Un motif, des preuves proches et un niveau de confiance.', 'Définition d’un SIT.'], [['Un seul mot-clé.', 'Insuffisant.'], ['Une règle sans test.', 'Fragile.'], ['Un chiffrement.', 'Hors sujet.']], 'Un SIT combine motif, preuves et confiance.'),
  Q('p02-rm2', 'remediation', 'securiser', c2, 'Remédiation : pilote', 'Pourquoi publier d’abord à un groupe pilote ?', ['Pour limiter l’impact d’une erreur.', 'Réduit le risque.'], [['Pour contourner la licence.', 'Faux.'], ['Pour éviter l’audit.', 'Faux.'], ['Pour supprimer la priorité.', 'Faux.']], 'Le pilote limite l’impact d’une erreur de conception.'),
  Q('p02-rm3', 'remediation', 'maintenir', c2, 'Remédiation : schéma moderne', 'Que faut-il vérifier avant de suivre une procédure ancienne sur les étiquettes ?', ['Le schéma d’étiquettes du locataire.', 'Schéma moderne pour les locataires créés depuis le 1er octobre 2025.'], [['La couleur du portail.', 'Sans rapport.'], ['Le nombre de comptes.', 'Sans rapport.'], ['Rien.', 'Risque d’erreur.']], 'Le schéma d’étiquettes du locataire change la procédure.'),
];

const competencies = [
  comp('p02', 1, 'Classifier avec fiabilité', 'Choisir une méthode, tester et réduire les faux positifs.', ['Je choisis la bonne méthode de classification.', 'Je teste avec des échantillons positifs et négatifs.', 'Je règle confiance et instances avec une justification.']),
  comp('p02', 2, 'Concevoir et publier des étiquettes', 'Taxonomie, priorité, étendues et publication progressive.', ['Je conçois une taxonomie lisible.', 'Je sépare création et publication.', 'Je connais les limites et la portée d’une suppression.']),
];

const projects: AiProject[] = [
  project('p02', 1, 'intermédiaire', 'Taxonomie d’étiquettes et tests de détection', 'Concevoir pour une organisation fictive la taxonomie, les tests de détection et le plan de publication par pilote.', 'Document de deux pages.', ['Inventorier les données.', 'Choisir les méthodes de classification.', 'Écrire les étiquettes et leur priorité.', 'Planifier le pilote.'], ['La taxonomie est courte.', 'Chaque détection a un test.', 'Le retour arrière existe.'], ['Créer trop d’étiquettes.', 'Activer le chiffrement sans pilote.'], ['Ajouter l’étiquetage automatique en simulation.']),
];

export const p02 = assemble({ id: 'p02', level: 2, n: 2, title: 'Classifier et étiqueter',
  summary: 'Types d’informations sensibles, EDM, classificateurs, réduction des faux positifs, conception et publication des étiquettes de sensibilité.',
  lessons: [l1, l2], exercises, competencies, projects,
  caseTitle: 'Calibrer et publier la protection de Nordlys Technologies',
  caseScenario: 'Vous réglez des détections bruyantes et planifiez un déploiement d’étiquettes par pilote. Actions simulées.', caseMinutes: 40 });
