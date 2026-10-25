// Module 5 : EDR et intégration Defender (niveau 2).
import type { AiCompetency, AiLesson, AiProject } from '../../agentic/types.ts';
import { assemble } from '../assemble.ts';
import { kit } from '../kit.ts';
import { sref } from '../sources.ts';

const md = (...lines: string[]) => lines.join('\n');
const { a, Q, M } = kit('i05');
const c1 = { comp: 'i05-c1', lesson: 'i05-l1', tags: ['connecteur', 'integration-edr', 'rapport-integration'] };
const c2 = { comp: 'i05-c2', lesson: 'i05-l2', tags: ['security-settings-management', 'appareils-non-inscrits', 'limites'] };
const c3 = { comp: 'i05-c3', lesson: 'i05-l3', tags: ['niveau-de-risque', 'conformite-defender', 'delais'] };

const l1: AiLesson = {
  id: 'i05-l1', module: 'i05', title: 'Connecter Intune et Defender for Endpoint, puis intégrer les appareils', minutes: 50,
  summary: 'Établir le lien entre les deux services, intégrer les appareils par une politique EDR et vérifier que le capteur remonte des données.',
  objectives: ['Décrire les quatre étapes de l’intégration Intune et Defender.', 'Choisir une politique EDR plutôt qu’un profil de configuration pour l’intégration.', 'Vérifier l’état d’intégration dans Intune et dans le portail Defender.'],
  prerequisites: ['Modules 1 à 4'],
  body: md(
    '## Le flux en quatre étapes',
    'L’intégration pour des appareils inscrits à Intune suit quatre étapes : (1) établir une **connexion de service à service** entre Intune et Defender for Endpoint ; (2) **intégrer les appareils** avec une politique Intune ; (3) créer une **politique de conformité** qui fixe le niveau de risque acceptable ; (4) configurer une **politique d’accès conditionnel** qui bloque les appareils non conformes. Cette leçon couvre les deux premières étapes, la leçon 3 les deux suivantes. Une fois l’ensemble en place, on peut aussi exploiter la gestion des vulnérabilités de Defender pour corriger des faiblesses repérées.',
    '## Rôles et licences',
    'L’intégration de bout en bout demande des permissions Intune sur trois domaines : **Mobile Threat Defense** (modifier et lire, pour la connexion), **Endpoint Detection and Response** (affecter, créer, lire, mettre à jour, pour intégrer les appareils) et **politiques de conformité** (affecter, créer, lire, mettre à jour). Le rôle intégré **Endpoint Security Manager** est le moins privilégié des rôles intégrés qui les couvre tous. L’accès conditionnel se configure dans Entra ID et exige un rôle Entra distinct, par exemple Conditional Access Administrator. Côté licences, il faut Intune Plan 1 et un abonnement Defender for Endpoint. La séparation des rôles est un contrôle de sécurité : documentez qui peut établir la connexion.',
    '## Plateformes prises en charge',
    'Pour l’intégration de conformité : **Android** et **iOS/iPadOS** gérés par Intune, et **Windows** joint à Microsoft Entra ou en jointure hybride. Les plateformes macOS et Linux ne suivent pas ce flux de conformité : elles relèvent d’autres mécanismes (module 14). Vérifiez toujours la table des plateformes de la page avant de promettre une fonction.',
    '## Politique EDR ou profil de configuration',
    'Une politique **EDR** d’Endpoint security gère l’intégration (installation et configuration du capteur par un paquet d’intégration) et les réglages EDR. Elle offre l’option **« Auto from connector »** qui récupère le paquet depuis la connexion ; cette option peut mettre jusqu’à **15 minutes** à apparaître après l’activation de la connexion, et la connexion doit afficher **Connecté** sous Administration du locataire. On peut aussi intégrer par un profil de configuration d’appareil, mais ce type **ne prend pas en charge les appareils rattachés au locataire**, et mélanger les deux types sur le même réglage crée des conflits. Règle de conception : **une seule source** pour l’intégration.',
    '## Vérifier : trois niveaux de preuve',
    'Dans Intune, **Endpoint security > Détection et réponse des points de terminaison** montre le statut de déploiement de la politique et l’onglet **EDR Onboarding Status** (comptes d’appareils, état d’intégration, santé du capteur). Dans le portail Defender, l’**inventaire des appareils** liste les appareils peu après la réception de la télémétrie, et la **santé du capteur** indique dernière vue, version et communication. L’évaluation du risque ne commence qu’après la première télémétrie. Si un appareil n’apparaît pas : vérifier l’accès réseau aux points de terminaison requis (par exemple `*.securitycenter.windows.com`), le statut de conformité de la politique EDR, et que le service Defender for Endpoint s’exécute.',
  ),
  demo: { title: 'Politique reçue, capteur muet', body: md(
    'Situation **fictive** :',
    '```text',
    'Politique EDR (Intune)   : Réussie sur 118 appareils',
    'Inventaire Defender      : 97 appareils visibles',
    'Santé du capteur         : 21 sans communication depuis 7 jours',
    '```',
    '**Lecture commentée.** Le rapport Intune prouve la réception de la politique, pas la télémétrie. L’écart de 21 appareils pointe vers le réseau, un service arrêté ou un proxy.',
    '**Ce que la démo ne prouve pas.** Aucun appareil n’a été interrogé.') },
  guided: 'i05-g1', autonomous: 'i05-a1', quiz: ['i05-q1a', 'i05-q1b', 'i05-q1c'],
  revision: md('## Fiche : intégration', '- Quatre étapes : connexion, intégration, conformité, accès conditionnel.', '- Endpoint Security Manager couvre les permissions requises ; CA exige un rôle Entra.', '- Une politique EDR, pas de mélange avec un profil de configuration.', '- « Auto from connector » : connexion Connecté, jusqu’à 15 minutes.', '- Preuves : rapport Intune, inventaire et santé du capteur du portail Defender.'),
  links: [sref('intune-mde-overview'), sref('intune-mde-configure'), sref('intune-edr-deploy'), sref('mde-troubleshoot-onboarding'), sref('intune-endpoint-security')], teaches: ['connecteur', 'integration-edr', 'rapport-integration'],
};

const l2: AiLesson = {
  id: 'i05-l2', module: 'i05', title: 'Appareils non inscrits : gestion des paramètres de sécurité par Defender for Endpoint', minutes: 45,
  summary: 'Gérer les paramètres de sécurité d’appareils qui ne sont pas inscrits à Intune, avec leurs limites et leurs risques.',
  objectives: ['Expliquer comment un appareil non inscrit reçoit des politiques Endpoint security.', 'Énoncer les limites : groupes d’appareils, filtres, paramètres non pris en charge.', 'Évaluer les risques particuliers sur les contrôleurs de domaine.'],
  prerequisites: ['Leçon 1'],
  body: md(
    '## Le principe',
    'La **gestion des paramètres de sécurité de Defender for Endpoint** (security settings management) permet d’appliquer des politiques Endpoint security d’Intune à des appareils **intégrés à Defender mais non inscrits à Intune**. On les gère depuis le centre d’administration Intune ou depuis le portail Defender, et on les affecte à des groupes Microsoft Entra. Le composant Defender de l’appareil applique la politique et rapporte l’état, visible dans les deux portails. Plateformes concernées : Windows (y compris Windows Server 2012 R2 et plus récent), Linux et macOS. Si l’appareil est **inscrit à Intune**, il ne traite **pas** ces politiques : on utilise alors les politiques Intune habituelles.',
    '## Identité de l’appareil',
    'Un appareil déjà enregistré dans Entra (par exemple en jointure hybride) utilise cette inscription. Sinon, une **identité synthétique** est créée dans Entra pour que l’appareil récupère ses politiques. Depuis juin 2023, l’exigence de jointure hybride a été retirée grâce à cette identité synthétique : des appareils auparavant en erreur d’inscription peuvent maintenant recevoir les politiques. Ces appareils comptent comme un objet appareil. Dans le portail Defender, la colonne **Géré par** doit indiquer MDE, et l’état **MDE Enrollment** doit afficher **Succès**. Dans Intune, le champ « Géré par » doit aussi indiquer MDE.',
    '## Limites à connaître',
    'Les politiques s’affectent à des **groupes d’appareils**, pas à des groupes d’utilisateurs. Les **filtres d’affectation ne sont pas pris en charge**. Trois réglages en cours d’abandon ne sont pas pris en charge : l’accélération de la fréquence de télémétrie (EDR), `AllowIntrusionPreventionSystem` (Antivirus) et `AllowLocalPolicyMerge`. La fonction **ne fonctionne pas** sur un appareil dont PowerShell est en **mode de langage contraint**. Après un ancien outil de sécurité tiers, la gestion peut être perturbée, et une réinstallation de Defender peut être nécessaire. Un groupe dynamique Entra fondé sur le type de système d’exploitation aide à couvrir automatiquement les nouveaux appareils.',
    '## Contrôleurs de domaine',
    'La fonction est prise en charge sur les contrôleurs de domaine, mais seulement si on l’active dans la **portée d’application** (et après les serveurs Windows). La documentation avertit : une mauvaise configuration peut nuire à la posture et à la continuité. Vérifiez que vos politiques Windows ne ciblent pas par erreur un groupe Entra qui contient des contrôleurs de domaine. Les politiques de **pare-feu ne sont pas prises en charge** sur les contrôleurs de domaine pour limiter le risque. La configuration Defender reste sur l’appareil après son retrait de la gestion : revoyez les politiques avant de retirer l’appareil.',
    '## Rôles',
    'Pour Defender, le rôle **Administrateur de la sécurité** suffit ; pour Intune, **Endpoint Security Manager**. Évitez de déployer plusieurs politiques sur le même réglage : certaines valeurs, comme les exclusions antivirus, fusionnent, mais d’autres entrent en conflit.',
  ),
  demo: { title: 'Un serveur non inscrit', body: md(
    'Fiche **fictive** :',
    '```text',
    'Appareil         : SRV-FICH-01 (Windows Server)',
    'Géré par         : MDE',
    'MDE Enrollment   : Succès',
    'Affectation      : groupe Entra de serveurs',
    'Filtre           : non pris en charge',
    '```',
    '**Lecture commentée.** L’appareil reçoit les politiques par son groupe d’appareils. On ne peut pas le raffiner avec un filtre.',
    '**Ce que la démo ne prouve pas.** Aucune politique n’a été appliquée.') },
  guided: 'i05-g2', autonomous: 'i05-a2', quiz: ['i05-q2a', 'i05-q2b', 'i05-q2c'],
  revision: md('## Fiche : appareils non inscrits', '- Windows, Windows Server, Linux, macOS ; Intune inscrit = politiques Intune.', '- Affectation à des groupes d’appareils ; pas de filtres.', '- Identité synthétique si l’appareil n’est pas enregistré.', '- Trois réglages non pris en charge ; mode de langage contraint bloque.', '- Contrôleurs de domaine : activation explicite, pas de pare-feu, revoir les cibles.'),
  links: [sref('intune-mde-ssm'), sref('mde-configure-machines'), sref('intune-endpoint-security')], teaches: ['security-settings-management', 'appareils-non-inscrits', 'limites'],
};

const l3: AiLesson = {
  id: 'i05-l3', module: 'i05', title: 'Niveau de risque de l’appareil : conformité, accès conditionnel et ses angles morts', minutes: 50,
  summary: 'Transformer le niveau de risque Defender en décision de conformité, comprendre les délais et ne pas bloquer à tort.',
  objectives: ['Configurer un seuil de risque dans une politique de conformité.', 'Expliquer comment la non-conformité mène à un blocage par accès conditionnel.', 'Identifier les angles morts : capteur muet, délais, comptes d’urgence.'],
  prerequisites: ['Leçons 1 et 2'],
  body: md(
    '## Du signal à la décision',
    'Le chemin complet est : le capteur Defender évalue le risque de l’appareil, Intune lit ce niveau, la **politique de conformité** juge l’appareil conforme ou non, et l’**accès conditionnel** (Entra) bloque l’accès aux ressources si la conformité est exigée. Chaque maillon a son propriétaire et son délai. Un incident de sécurité peut ainsi couper automatiquement l’accès d’un appareil compromis, ce qui est le but de l’intégration.',
    '## Choisir le seuil',
    'Dans la politique de conformité (Windows, Android Enterprise ou iOS/iPadOS), section Microsoft Defender for Endpoint, le réglage « Exiger que l’appareil soit au niveau ou sous le score de risque » propose : **Clair** (le plus sûr : tout niveau de menace détecté bloque), **Faible** (seules les menaces faibles sont tolérées), **Moyen** (menaces faibles et moyennes tolérées) et **Élevé** (aucun blocage, rapport seulement). Microsoft indique que **Faible** offre généralement le meilleur équilibre. La décision doit être prise avec les propriétaires métier, parce qu’un seuil trop strict immobilise des utilisateurs sur la base d’une alerte unique.',
    '## Actions et période de grâce',
    'La politique prévoit des **actions en cas de non-conformité** : notification, délai de grâce, et marquage non conforme. Un délai de grâce évite de couper l’accès pour une alerte vite résolue, mais retarde la réponse. Documentez ce compromis par catégorie d’appareils. Validation : les appareils qui dépassent le seuil apparaissent comme **non conformes** dans les rapports de conformité.',
    '## Applications gérées et appareils non inscrits',
    'On peut aussi fixer un niveau de risque dans une **politique de protection des applications**, pour des appareils inscrits ou non. L’accès à des données d’entreprise dans des applications protégées peut alors dépendre de l’évaluation de Defender, même sans inscription complète.',
    '## Angles morts',
    '**Capteur muet** : un appareil dont le capteur ne communique pas n’a pas de niveau de risque fiable. Surveillez la santé du capteur, sinon le contrôle donne une fausse assurance. **Délais** : propagation du risque, synchronisation de conformité et évaluation de l’accès conditionnel s’additionnent ; ne promettez pas un blocage instantané. **Sorties de secours** : excluez des comptes d’urgence de l’accès conditionnel et testez-les, pour éviter de se verrouiller soi-même. **Windows 10** : la fin de support a eu lieu en octobre 2025 ; les appareils restent autorisés dans Intune, mais le comportement des fonctions n’est plus garanti.',
  ),
  demo: { title: 'Choisir un seuil', body: md(
    'Tableau **fictif** de décision :',
    '```text',
    'Catégorie            Seuil    Grâce   Raison',
    'Postes standards     Faible   1 jour  équilibre',
    'Postes de la finance Clair    0       données sensibles',
    'Kiosques             Moyen    2 jours disponibilité',
    '```',
    '**Lecture commentée.** Chaque catégorie justifie son seuil et sa grâce.',
    '**Ce que la démo ne prouve pas.** Aucun appareil n’a été évalué.') },
  guided: 'i05-g3', autonomous: 'i05-a3', quiz: ['i05-q3a', 'i05-q3b', 'i05-q3c'],
  revision: md('## Fiche : risque et conformité', '- Capteur, conformité, accès conditionnel : trois maillons, trois délais.', '- Seuils : Clair, Faible, Moyen, Élevé (rapport seulement).', '- Faible souvent recommandé ; décider avec le métier.', '- Grâce : compromis entre continuité et réponse.', '- Surveiller la santé du capteur ; comptes d’urgence exclus et testés.'),
  links: [sref('intune-mde-configure'), sref('intune-mde-overview'), sref('intune-compliance-create'), sref('intune-edr-deploy')], teaches: ['niveau-de-risque', 'conformite-defender', 'delais'],
};

const exercises = [
  a.order({ id: 'i05-g1', title: 'Étapes d’intégration', comp: c1.comp, tags: c1.tags, role: 'guided', dim: 'comprendre', lesson: 'i05-l1',
    st: 'Ordonnez les étapes de l’intégration.',
    items: [['s1', 'Établir la connexion Intune et Defender'], ['s2', 'Intégrer les appareils par une politique EDR'], ['s3', 'Créer la politique de conformité de risque'], ['s4', 'Configurer l’accès conditionnel']], correct: ['s1', 's2', 's3', 's4'],
    exp: 'Connexion, intégration, conformité puis accès conditionnel.' }),
  a.config({ id: 'i05-a1', title: 'Intégrer les appareils', comp: c1.comp, tags: c1.tags, role: 'autonomous', dim: 'securiser', lesson: 'i05-l1',
    st: 'Paramétrez l’intégration des appareils.',
    fields: [
      { id: 'src', label: 'Source d’intégration', kind: 'select', options: [{ id: 'edr', label: 'Politique EDR uniquement' }, { id: 'both', label: 'EDR et profil de configuration' }, { id: 'none', label: 'Aucune' }], accept: ['edr'], why: 'Une seule source évite les conflits.' },
      { id: 'conn', label: 'Vérifier que la connexion affiche Connecté', kind: 'toggle', accept: ['on'], why: 'Prérequis de l’option automatique.' },
      { id: 'health', label: 'Suivre la santé du capteur', kind: 'toggle', accept: ['on'], why: 'La politique reçue ne prouve pas la télémétrie.' },
    ], solution: { src: 'edr', conn: 'on', health: 'on' }, exp: 'Une source, connexion vérifiée et santé du capteur suivie.' }),
  Q('i05-q1a', 'quiz', 'comprendre', c1, 'Rôle', 'Quel rôle intégré couvre les permissions de l’intégration ?', ['Endpoint Security Manager.', 'Le moins privilégié qui les couvre.'], [['Global Administrator uniquement.', 'Faux.'], ['Help Desk Operator.', 'Faux.'], ['Aucun rôle.', 'Faux.']], 'Endpoint Security Manager suffit.'),
  Q('i05-q1b', 'quiz', 'fonctionner', c1, 'Option automatique', 'Quand « Auto from connector » est-elle disponible ?', ['Quand la connexion affiche Connecté, parfois après jusqu’à 15 minutes.', 'Prérequis de la connexion.'], [['Toujours immédiatement.', 'Faux.'], ['Jamais.', 'Faux.'], ['Seulement sur macOS.', 'Faux.']], 'La connexion doit être établie et propagée.'),
  Q('i05-q1c', 'quiz', 'maintenir', c1, 'Preuve', 'Que prouve le statut réussi d’une politique EDR ?', ['La réception de la politique, pas la télémétrie.', 'Vérifier le capteur.'], [['Que l’appareil est protégé.', 'Faux.'], ['Que l’appareil est à faible risque.', 'Faux.'], ['Que la licence est valide.', 'Faux.']], 'Il faut vérifier la santé du capteur.'),

  a.match({ id: 'i05-g2', title: 'Limite et conséquence', comp: c2.comp, tags: c2.tags, role: 'guided', dim: 'comprendre', lesson: 'i05-l2',
    st: 'Associez chaque situation à sa conséquence.', items: [['p1', 'Affecter avec un filtre d’affectation'], ['p2', 'PowerShell en mode de langage contraint'], ['p3', 'Appareil déjà inscrit à Intune']],
    options: [['s1', 'Non pris en charge'], ['s2', 'La fonction ne marche pas sur l’appareil'], ['s3', 'Il ignore les politiques de gestion des paramètres de sécurité']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Filtres non pris en charge, mode contraint bloquant et appareils inscrits traités par Intune.' }),
  a.inspect({ id: 'i05-a2', title: 'Relire un plan de serveurs', comp: c2.comp, tags: c2.tags, role: 'autonomous', dim: 'securiser', lesson: 'i05-l2', language: 'text',
    st: 'Plan fictif. Repérez les défauts.',
    lines: [['p1', 'Une politique de pare-feu est affectée à un groupe qui contient des contrôleurs de domaine.', { ok: 'a1', fixes: [['a1', 'Retirer les contrôleurs du groupe, le pare-feu n’y est pas pris en charge'], ['a2', 'Accepter']] }], ['p2', 'Nous affectons à des groupes d’utilisateurs.', { ok: 'b1', fixes: [['b1', 'Affecter à des groupes d’appareils'], ['b2', 'Accepter']] }], ['p3', 'Nous utilisons un filtre pour exclure des modèles.', { ok: 'c1', fixes: [['c1', 'Exclure par groupe, les filtres ne sont pas pris en charge'], ['c2', 'Accepter']] }]],
    exp: 'Pare-feu sur contrôleurs, groupes d’utilisateurs et filtres sont trois défauts.' }),
  Q('i05-q2a', 'quiz', 'comprendre', c2, 'Identité', 'Que reçoit un appareil non enregistré dans Entra ?', ['Une identité synthétique pour récupérer ses politiques.', 'Elle compte comme un objet.'], [['Un compte d’utilisateur.', 'Faux.'], ['Aucune identité.', 'Faux.'], ['Une licence.', 'Faux.']], 'Une identité synthétique est créée.'),
  Q('i05-q2b', 'quiz', 'fonctionner', c2, 'Vérification', 'Où confirmer qu’un appareil est géré par cette fonction ?', ['Dans la colonne Géré par du portail Defender, qui doit indiquer MDE.', 'Et MDE Enrollment à Succès.'], [['Dans l’observateur d’événements seulement.', 'Faux.'], ['Dans le pare-feu.', 'Faux.'], ['Nulle part.', 'Faux.']], 'Géré par MDE et enrollment réussi.'),
  Q('i05-q2c', 'quiz', 'maintenir', c2, 'Retrait', 'Que devient la configuration Defender après le retrait de l’appareil de la gestion ?', ['Elle reste sur l’appareil.', 'Revoir les politiques avant de retirer.'], [['Elle disparaît.', 'Faux.'], ['Elle est chiffrée.', 'Faux.'], ['Elle est sauvegardée en ligne.', 'Faux.']], 'La configuration reste en place.'),

  a.match({ id: 'i05-g3', title: 'Seuil et effet', comp: c3.comp, tags: c3.tags, role: 'guided', dim: 'comprendre', lesson: 'i05-l3',
    st: 'Associez chaque seuil à son effet.', items: [['p1', 'Clair'], ['p2', 'Faible'], ['p3', 'Élevé']],
    options: [['s1', 'Tout niveau de menace bloque'], ['s2', 'Bloque les menaces moyennes et élevées'], ['s3', 'Ne bloque pas, rapport seulement']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Clair est le plus strict, Faible tolère les menaces faibles et Élevé ne bloque pas.' }),
  a.workflow({ id: 'i05-a3', title: 'Bloquer un appareil à risque', comp: c3.comp, tags: c3.tags, role: 'autonomous', dim: 'securiser', lesson: 'i05-l3',
    st: 'Ordonnez la mise en place du blocage par niveau de risque.',
    blocks: [['b1', 'Vérifier la santé du capteur sur le pilote'], ['b2', 'Créer la politique de conformité avec le seuil'], ['b3', 'Définir actions et période de grâce'], ['b4', 'Exclure et tester les comptes d’urgence'], ['b5', 'Configurer l’accès conditionnel en mode rapport d’abord'], ['b6', 'Exiger la conformité pour tous dès le premier jour']],
    required: ['b1', 'b2', 'b3', 'b4', 'b5'], forbidden: ['b6'], before: [['b1', 'b2'], ['b2', 'b3'], ['b3', 'b4'], ['b4', 'b5']], notes: { b6: 'Risque de verrouillage généralisé.' }, solution: ['b1', 'b2', 'b3', 'b4', 'b5'],
    exp: 'Capteur, conformité, grâce, comptes d’urgence puis accès conditionnel prudent.' }),
  Q('i05-q3a', 'quiz', 'comprendre', c3, 'Seuil recommandé', 'Quel seuil Microsoft présente-t-il comme le meilleur équilibre général ?', ['Faible.', 'À valider avec le métier.'], [['Élevé.', 'Aucun blocage.'], ['Clair pour tous.', 'Trop strict en général.'], ['Aucun.', 'Faux.']], 'Faible est le réglage recommandé.'),
  Q('i05-q3b', 'quiz', 'fonctionner', c3, 'Délais', 'Pourquoi ne pas promettre un blocage instantané ?', ['Propagation du risque, synchronisation de conformité et accès conditionnel s’additionnent.', 'Trois maillons.'], [['Parce que le blocage est manuel.', 'Faux.'], ['Parce que Defender est lent par conception.', 'Faux.'], ['Aucune raison.', 'Faux.']], 'Les délais de chaque maillon s’additionnent.'),
  Q('i05-q3c', 'quiz', 'maintenir', c3, 'Capteur muet', 'Quel risque pose un capteur qui ne communique plus ?', ['Pas de niveau de risque fiable, donc une fausse assurance.', 'Surveiller la santé.'], [['Aucun risque.', 'Faux.'], ['Le blocage immédiat.', 'Faux.'], ['Une amende.', 'Faux.']], 'Le contrôle devient aveugle.'),

  Q('i05-ev1', 'eval', 'comprendre', c1, 'Quatre étapes', 'Quelle est la première étape de l’intégration ?', ['Établir la connexion de service à service.', 'Avant l’intégration des appareils.'], [['Créer l’accès conditionnel.', 'Dernière.'], ['Créer la conformité.', 'Troisième.'], ['Supprimer des appareils.', 'Faux.']], 'On commence par la connexion.'),
  M('i05-ev2', 'eval', 'securiser', c2, 'Limites', 'Cochez les limites de la gestion des paramètres de sécurité.', [['Pas de filtres d’affectation.', 'Documenté.'], ['Pas de politiques de pare-feu sur les contrôleurs de domaine.', 'Réduit le risque.']], [['Toutes les plateformes sans exception.', 'Faux.'], ['Les groupes d’utilisateurs sont recommandés.', 'Faux.']], 'Filtres et pare-feu des contrôleurs sont des limites.'),
  a.order({ id: 'i05-ev3', title: 'Réponse à un capteur muet', comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'maintenir', lesson: 'i05-l3',
    st: 'Ordonnez le diagnostic d’un appareil sans télémétrie.',
    items: [['s1', 'Lire l’état de la politique EDR'], ['s2', 'Vérifier le service Defender sur l’appareil'], ['s3', 'Vérifier l’accès réseau aux points de terminaison'], ['s4', 'Consulter la santé du capteur dans le portail'], ['s5', 'Documenter la cause et le correctif']], correct: ['s1', 's2', 's3', 's4', 's5'],
    exp: 'On vérifie la politique, le service, le réseau, la santé puis on documente.' }),
  a.fix({ id: 'i05-ev4', title: 'Corriger l’intégration', comp: c1.comp, tags: c1.tags, role: 'eval', dim: 'securiser', lesson: 'i05-l1', language: 'json',
    st: 'Corrigez : une seule source d’intégration et suivi de la santé.',
    starter: JSON.stringify({ sourceIntegration: 'edr-et-profil', suiviSante: 'aucun', connecteur: 'non-verifie' }, null, 2),
    rules: [{ kind: 'equals', path: 'sourceIntegration', value: 'edr', message: 'Garder une seule source.', dim: 'securiser' }, { kind: 'equals', path: 'suiviSante', value: 'capteur', message: 'Suivre la santé du capteur.', dim: 'maintenir' }, { kind: 'equals', path: 'connecteur', value: 'connecte', message: 'Vérifier la connexion.', dim: 'fonctionner' }],
    solution: JSON.stringify({ sourceIntegration: 'edr', suiviSante: 'capteur', connecteur: 'connecte' }, null, 2), exp: 'Une source EDR, connexion vérifiée et santé du capteur suivie.' }),
  a.match({ id: 'i05-ev5', title: 'Symptôme et cause', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'maintenir', lesson: 'i05-l2',
    st: 'Associez chaque symptôme à sa cause probable.', items: [['p1', 'Un appareil inscrit ne traite pas la politique de gestion des paramètres'], ['p2', 'Aucune politique reçue, PowerShell restreint'], ['p3', 'Un contrôleur de domaine reçoit une politique inattendue']],
    options: [['s1', 'Il est inscrit à Intune et suit les politiques Intune'], ['s2', 'Mode de langage contraint'], ['s3', 'Groupe Entra qui le contient']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Inscription, mode contraint et appartenance de groupe expliquent ces symptômes.' }),
  a.workflow({ id: 'i05-ev6', title: 'Retirer un appareil de la gestion', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'securiser', lesson: 'i05-l2',
    st: 'Ordonnez le retrait d’un contrôleur de domaine de la gestion.',
    blocks: [['b1', 'Revoir toutes les politiques ciblant l’appareil'], ['b2', 'Faire les configurations nécessaires avant'], ['b3', 'Retirer l’appareil de la gestion'], ['b4', 'Vérifier que la configuration est conservée'], ['b5', 'Retirer sans revue']],
    required: ['b1', 'b2', 'b3', 'b4'], forbidden: ['b5'], before: [['b1', 'b2'], ['b2', 'b3'], ['b3', 'b4']], notes: { b5: 'Peut laisser une configuration inattendue.' }, solution: ['b1', 'b2', 'b3', 'b4'],
    exp: 'On revoit, on configure, on retire puis on vérifie.' }),
  a.short({ id: 'i05-ev7', title: 'Délai de l’option automatique', comp: c1.comp, tags: c1.tags, role: 'eval', dim: 'comprendre', lesson: 'i05-l1',
    st: 'Combien de minutes au maximum pour que « Auto from connector » apparaisse après l’activation de la connexion ? (nombre)', accepted: ['15'], numeric: { value: 15 }, ph: 'un nombre',
    exp: 'La page indique jusqu’à 15 minutes pour que l’option apparaisse.' }),
  a.short({ id: 'i05-ev8', title: 'Nombre de réglages non pris en charge', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'comprendre', lesson: 'i05-l2',
    st: 'Combien de réglages en cours d’abandon la gestion des paramètres de sécurité ne prend-elle pas en charge selon la leçon ? (nombre)', accepted: ['3', 'trois'], numeric: { value: 3 }, ph: 'un nombre',
    exp: 'Trois réglages ne sont pas pris en charge : télémétrie accélérée, AllowIntrusionPreventionSystem et AllowLocalPolicyMerge.' }),

  a.inspect({ id: 'i05-cs1', title: 'Cas : intégration chez Aurore Logistique', comp: c1.comp, tags: c1.tags, role: 'case', dim: 'securiser', lesson: 'i05-l1', language: 'text',
    st: 'Plan fictif. Repérez les défauts.',
    lines: [['p1', 'L’intégration est faite par un profil de configuration et une politique EDR.', { ok: 'a1', fixes: [['a1', 'Garder une seule source'], ['a2', 'Accepter']] }], ['p2', 'Le tableau de bord Intune vert prouve la télémétrie.', { ok: 'b1', fixes: [['b1', 'Vérifier inventaire et santé du capteur'], ['b2', 'Accepter']] }], ['p3', 'Tous les administrateurs peuvent établir la connexion.', { ok: 'c1', fixes: [['c1', 'Limiter par RBAC'], ['c2', 'Accepter']] }]],
    exp: 'Double source, preuve insuffisante et RBAC trop large sont trois défauts.' }),
  a.match({ id: 'i05-cs2', title: 'Cas : choix de gestion', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'fonctionner', lesson: 'i05-l2',
    st: 'Associez chaque appareil à la voie de gestion.', items: [['p1', 'Portable inscrit à Intune'], ['p2', 'Serveur Linux intégré à Defender, non inscrit'], ['p3', 'Serveur Windows non inscrit en mode de langage contraint']],
    options: [['s1', 'Politiques Intune habituelles'], ['s2', 'Gestion des paramètres de sécurité'], ['s3', 'Autre mécanisme, la fonction ne marche pas']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Intune pour l’inscrit, gestion des paramètres pour le non inscrit, autre voie en mode contraint.' }),
  a.workflow({ id: 'i05-cs3', title: 'Cas : accès conditionnel par risque', comp: c3.comp, tags: c3.tags, role: 'case', dim: 'securiser', lesson: 'i05-l3',
    st: 'Ordonnez la mise en production du contrôle par risque.',
    blocks: [['t1', 'Valider la santé du capteur sur le pilote'], ['t2', 'Choisir le seuil avec le métier'], ['t3', 'Définir la grâce'], ['t4', 'Tester comptes d’urgence'], ['t5', 'Activer en mode rapport puis imposer'], ['t6', 'Imposer sans pilote']],
    required: ['t1', 't2', 't3', 't4', 't5'], forbidden: ['t6'], before: [['t1', 't2'], ['t2', 't3'], ['t3', 't4'], ['t4', 't5']], notes: { t6: 'Verrouillage possible.' }, solution: ['t1', 't2', 't3', 't4', 't5'],
    exp: 'Pilote, seuil, grâce, comptes d’urgence puis mise en production prudente.' }),
  a.open({ id: 'i05-cs-open', title: 'Cas : intégration Intune et Defender', comp: c3.comp, tags: c3.tags, role: 'case', dim: 'maintenir', lesson: 'i05-l3',
    st: 'Rédigez le plan d’intégration Intune et Defender d’une organisation fictive.',
    deliverable: 'Un document : rôles, connexion, intégration, appareils non inscrits, seuils de risque, délais et preuves.',
    rubric: [['r1', 'Les rôles et le RBAC sont décrits.', 'securiser'], ['r2', 'Une seule source d’intégration est retenue.', 'fonctionner'], ['r3', 'Les appareils non inscrits sont traités avec leurs limites.', 'comprendre'], ['r4', 'Les seuils et la grâce sont justifiés.', 'maintenir'], ['r5', 'Les angles morts (capteur muet, délais, comptes d’urgence) sont couverts.', 'securiser']],
    exp: 'Pas de note automatique : on juge la cohérence du plan.' }),

  Q('i05-rm1', 'remediation', 'comprendre', c1, 'Remédiation : source', 'Pourquoi une seule source d’intégration ?', ['Pour éviter les conflits sur les mêmes réglages.', 'Évite les statuts de conflit.'], [['Pour économiser des licences.', 'Non.'], ['Pour accélérer le réseau.', 'Non.'], ['Aucune raison.', 'Non.']], 'Les types mélangés créent des conflits.'),
  Q('i05-rm2', 'remediation', 'fonctionner', c2, 'Remédiation : filtres', 'Que faire quand les filtres ne sont pas pris en charge ?', ['Utiliser des groupes d’appareils dédiés.', 'Segmenter par groupe.'], [['Ignorer le besoin.', 'Non.'], ['Utiliser un filtre quand même.', 'Non pris en charge.'], ['Supprimer la politique.', 'Non.']], 'On segmente par groupes d’appareils.'),
  Q('i05-rm3', 'remediation', 'securiser', c3, 'Remédiation : urgence', 'Pourquoi exclure des comptes d’urgence ?', ['Pour éviter un verrouillage total de l’administration.', 'Et les tester.'], [['Pour contourner la sécurité.', 'Non.'], ['Pour économiser des licences.', 'Non.'], ['Aucune raison.', 'Non.']], 'Les comptes d’urgence évitent le verrouillage.'),
];

const competencies: AiCompetency[] = [
  { id: 'i05-c1', module: 'i05', name: 'Intégrer Intune et Defender', description: 'Connexion, EDR, preuves.', criteria: [{ id: 'i05-c1-1', text: 'Je décris les quatre étapes.' }, { id: 'i05-c1-2', text: 'Je choisis une seule source d’intégration.' }, { id: 'i05-c1-3', text: 'Je prouve la télémétrie, pas seulement la politique.' }] },
  { id: 'i05-c2', module: 'i05', name: 'Gérer les appareils non inscrits', description: 'Gestion des paramètres de sécurité et limites.', criteria: [{ id: 'i05-c2-1', text: 'Je choisis la voie de gestion selon l’appareil.' }, { id: 'i05-c2-2', text: 'Je connais les limites documentées.' }, { id: 'i05-c2-3', text: 'Je protège les contrôleurs de domaine.' }] },
  { id: 'i05-c3', module: 'i05', name: 'Piloter le risque par la conformité', description: 'Seuils, grâce, angles morts.', criteria: [{ id: 'i05-c3-1', text: 'Je choisis un seuil justifié.' }, { id: 'i05-c3-2', text: 'Je comprends les délais cumulés.' }, { id: 'i05-c3-3', text: 'Je prévois comptes d’urgence et surveillance du capteur.' }] },
];

const projects: AiProject[] = [
  { id: 'i05-p1', module: 'i05', level: 'débutant', title: 'Carte des voies de gestion', problem: 'Classer les appareils d’une organisation selon leur voie de gestion et leur preuve de santé.', architecture: 'Tableau d’une page.', tools: ['Tableur'], data: 'Parc fictif.', steps: ['Lister les types d’appareils.', 'Choisir la voie.', 'Définir la preuve.'], success: ['Chaque appareil a une voie et une preuve.'], risks: ['Appareil oublié.'], extensions: ['Ajouter un propriétaire.'] },
  { id: 'i05-p2', module: 'i05', level: 'intermédiaire', title: 'Plan de seuils de risque', problem: 'Concevoir les seuils de risque, la grâce et les exceptions par catégorie d’appareils.', architecture: 'Tableau de décision avec justification.', tools: ['Tableur'], data: 'Catégories fictives.', steps: ['Lister les catégories.', 'Choisir le seuil.', 'Définir la grâce.', 'Prévoir les comptes d’urgence.'], success: ['Chaque seuil est justifié.'], risks: ['Seuil trop strict.'], extensions: ['Ajouter des indicateurs.'],
    connected: { accounts: 'Un locataire de test avec Intune, Defender for Endpoint et un appareil de test.', permissions: 'Endpoint Security Manager dans le locataire de test, et un rôle d’accès conditionnel en mode rapport.', costs: 'Licences de test.', secrets: 'Aucun secret.', cleanup: 'Supprimer les politiques de conformité et d’accès conditionnel de test.', limits: 'Facultatif : n’activez jamais l’application de l’accès conditionnel sur des comptes de production.' } },
  { id: 'i05-p3', module: 'i05', level: 'avancé', title: 'Revue des angles morts', problem: 'Analyser les angles morts d’un contrôle par risque et proposer des mesures de surveillance.', architecture: 'Matrice angle mort par mesure.', tools: ['Tableur'], data: 'Scénario fictif.', steps: ['Lister les angles morts.', 'Choisir une surveillance.', 'Définir un seuil d’alerte.', 'Planifier la revue.'], success: ['Chaque angle mort a une surveillance.'], risks: ['Fausse assurance.'], extensions: ['Ajouter un tableau de bord.'] },
];

export const i05 = assemble({ id: 'i05', level: 2, n: 5, title: 'EDR et intégration Defender',
  summary: 'Connexion Intune et Defender, intégration par politique EDR, appareils non inscrits, seuils de risque, conformité, accès conditionnel et angles morts.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Intégrer Intune et Defender chez Aurore Logistique',
  caseScenario: 'Vous planifiez l’intégration, la gestion des appareils non inscrits et les seuils de risque. Actions simulées.', caseMinutes: 45 });
