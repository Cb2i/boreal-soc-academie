// Module 14 : Sécurité par plateforme (niveau 5). Aucune capacité Windows n’est transposée par défaut.
import type { AiCompetency, AiLesson, AiProject } from '../../agentic/types.ts';
import { assemble } from '../assemble.ts';
import { kit } from '../kit.ts';
import { sref } from '../sources.ts';

const md = (...lines: string[]) => lines.join('\n');
const { a, Q, M } = kit('i14');
const c1 = { comp: 'i14-c1', lesson: 'i14-l1', tags: ['macos', 'ios', 'filevault', 'gatekeeper', 'jailbreak'] };
const c2 = { comp: 'i14-c2', lesson: 'i14-l2', tags: ['android-enterprise', 'play-integrity', 'mtd', 'profil-de-travail'] };
const c3 = { comp: 'i14-c3', lesson: 'i14-l3', tags: ['linux', 'matrice-de-plateformes', 'non-transposition'] };

const l1: AiLesson = {
  id: 'i14-l1', module: 'i14', title: 'Apple : macOS, iOS et iPadOS ont leurs propres leviers', minutes: 55,
  summary: 'Chiffrer, filtrer et vérifier un Mac, puis cadrer un iPhone ou un iPad, sans recopier la logique Windows.',
  objectives: ['Citer les trois contrôles de sécurité macOS gérés par Intune : FileVault, pare-feu, Gatekeeper.', 'Expliquer ce que fait et ne fait pas la liste d’applications restreintes sur iOS/iPadOS.', 'Distinguer la détection du jailbreak par Defender de la règle de conformité Intune.'],
  prerequisites: ['Modules 2, 7 et 9'],
  body: md(
    '## Le point de départ : une autre plateforme, d’autres mécanismes',
    'Un poste Windows se durcit avec des profils de sécurité des points de terminaison, des règles ASR, BitLocker et App Control. **Rien de cela n’existe sur un Mac ni sur un iPhone.** Chaque plateforme a ses propres charges utiles de gestion (les *payloads* Apple), ses propres contrôles de conformité et ses propres limites. Un durcissement sérieux commence donc par une question : quel mécanisme natif de cette plateforme couvre le besoin ? Si la réponse est « aucun », on le consigne comme non pris en charge (module 13).',
    '## macOS : FileVault, pare-feu, Gatekeeper',
    'Le guide de démarrage macOS d’Intune présente la sécurité d’un Mac en blocs : conformité et accès conditionnel, Defender for Endpoint, puis trois contrôles intégrés. **FileVault** chiffre le disque complet ; on le configure dans le catalogue de paramètres (*Chiffrement de disque complet*) ou par une politique de chiffrement de disque des points de terminaison, avec le dépôt de la clé de récupération. Le **pare-feu** est un pare-feu applicatif : activation, blocage de toutes les connexions entrantes, mode furtif, applications autorisées ou bloquées. **Gatekeeper** ne laisse s’exécuter que les logiciels de confiance ; dans le catalogue, on active l’évaluation (*Enable Assessment*), on autorise ou non les développeurs identifiés, et on désactive le contournement par l’utilisateur (*Disable Override*).',
    'Le gabarit de profil « protection des points de terminaison macOS » est **déprécié** : les politiques existantes restent, mais on n’en crée plus. On utilise les politiques de sécurité des points de terminaison ou le catalogue de paramètres. Côté conformité, la politique macOS vérifie notamment le chiffrement, le pare-feu (avec les options connexions entrantes et mode furtif) et l’emplacement permis pour les applications (Gatekeeper : App Store seulement, App Store et développeurs identifiés, ou n’importe où, qui est l’option la moins sûre). Un problème connu documenté : des Mac avec le mode furtif peuvent devenir non conformes après la mise à niveau vers macOS 15. Vérifiez les problèmes connus avant d’imposer un réglage à tout le parc.',
    '## iOS et iPadOS : conformité, supervision et applications',
    'Sur iPhone et iPad, la conformité contrôle entre autres le jailbreak (*Bloquer*), le niveau de menace maximal évalué par un service de défense contre les menaces mobiles, la version minimale du système, le mot de passe et le courriel géré. Les exemples de configuration de Microsoft distinguent des appareils **supervisés** (appartenant à l’organisation, plus de contrôles) et des appareils **personnels** (moins de contrôles, plus de vie privée). Un piège fréquent concerne les **applications restreintes** : les listes d’applications approuvées ou interdites **ne bloquent ni l’installation ni l’exécution** ; elles alimentent un rapport et peuvent rendre l’appareil non conforme. Pour réellement empêcher une application, on utilise le catalogue de paramètres (*Restrictions*, identifiants de paquet autorisés ou bloqués), avec les prérequis de supervision que la documentation précise.',
    '## Jailbreak : trois couches à ne pas confondre',
    'Defender for Endpoint sur iOS détecte périodiquement les appareils jailbreakés, gérés ou non : il signale une alerte de risque élevé, efface les données de l’application et supprime son profil VPN de bouclage. La **règle de conformité Intune** (« Appareils jailbreakés : Bloquer ») est une seconde couche recommandée. L’**accès conditionnel** applique la conséquence sur l’accès aux ressources. Si l’une des trois manque, la protection est incomplète : la détection sans conformité n’empêche pas l’accès, et la conformité sans détection fiable repose sur un signal limité.',
    '## Vérifier sans supposer',
    'Pour chaque contrôle, on distingue : politique créée, assignée, reçue par l’appareil, et protection effective. Le rapport de conformité dit qu’un appareil est conforme à *la politique évaluée*, pas qu’il est protégé contre tout. Sur macOS, une valeur effective se lit sur l’appareil ; sur iOS, elle se lit surtout dans les rapports par paramètre et l’état du profil.',
  ),
  demo: { title: 'Fiche de contrôles par plateforme', body: md(
    'Comparaison **fictive** pour une flotte mixte :',
    '```text',
    'Besoin             macOS                    iOS/iPadOS',
    'Chiffrement        FileVault (catalogue)    Natif avec code d’accès',
    'Filtrage réseau    Pare-feu applicatif      Pas de pare-feu à configurer',
    'Applications       Gatekeeper               Liste restreinte = rapport seulement',
    'Intégrité          Conformité + Defender    Jailbreak : conformité + Defender',
    '```',
    '**Lecture commentée.** Les colonnes n’ont pas les mêmes lignes : on ne remplit pas une case par analogie avec Windows.',
    '**Ce que la démo ne prouve pas.** Aucun appareil n’a été configuré et aucune valeur n’a été lue sur un appareil réel.') },
  guided: 'i14-g1', autonomous: 'i14-a1', quiz: ['i14-q1a', 'i14-q1b', 'i14-q1c'],
  revision: md('## Fiche : Apple', '- macOS : FileVault, pare-feu, Gatekeeper par catalogue ou politiques de sécurité.', '- Gabarit de protection macOS : déprécié.', '- iOS : la liste d’applications restreintes alimente un rapport, elle ne bloque pas.', '- Jailbreak : Defender détecte, la conformité signale, l’accès conditionnel applique.', '- Supervisé et personnel n’offrent pas les mêmes contrôles.'),
  links: [sref('intune-macos-e2e'), sref('intune-macos-compliance'), sref('intune-macos-endpoint-protection'), sref('intune-ios-compliance'), sref('intune-ios-restrictions'), sref('mde-ios-features')], teaches: ['macos', 'ios', 'filevault', 'gatekeeper', 'jailbreak'],
};

const l2: AiLesson = {
  id: 'i14-l2', module: 'i14', title: 'Android Enterprise : modes de gestion, Play Integrity et défense mobile', minutes: 50,
  summary: 'Choisir le bon mode de gestion Android, régler la conformité et brancher la défense contre les menaces mobiles.',
  objectives: ['Distinguer les paramètres de conformité du profil entièrement géré et du profil de travail personnel.', 'Expliquer les trois niveaux du verdict Play Integrity et leur effet sur les appareils.', 'Décrire le chemin Defender ou partenaire MTD, conformité et accès conditionnel.'],
  prerequisites: ['Leçon 1', 'Module 9'],
  body: md(
    '## Android n’est pas une seule plateforme',
    'Dans Intune, la politique de conformité **Android Enterprise** se décline en deux types de profil : **entièrement géré, dédié et profil de travail appartenant à l’entreprise** d’un côté, **profil de travail personnel** de l’autre. Les paramètres ne sont pas les mêmes. Le chiffrement, par exemple, est imposé par Android Enterprise, donc le paramètre existe mais n’apporte rien à configurer. Sur un profil de travail personnel, d’autres contrôles s’ajoutent (services Google Play configurés, fournisseur de sécurité à jour), avec une exception documentée pour les appareils gérés par l’API Android Management. L’ancienne gestion par **administrateur d’appareil** est dépréciée et n’est plus disponible pour les appareils avec services mobiles Google : ne bâtissez plus de nouvelle conception dessus.',
    '## Ciblage : utilisateurs ou appareils',
    'Pour les appareils **dédiés** (kiosques, terminaux partagés), il faut cibler les **groupes d’appareils**, pas les utilisateurs, parce que la conformité s’évalue sur l’appareil. Sans mode d’appareil partagé de Microsoft Entra, les utilisateurs d’un appareil dédié ne peuvent pas ouvrir de session sur des ressources protégées par accès conditionnel, même si l’appareil est conforme. Pour les profils entièrement géré et de travail, on peut cibler utilisateurs ou appareils.',
    '## Play Integrity : trois niveaux',
    'Le paramètre **verdict Play Integrity** a trois niveaux. *Vérifier l’intégrité de base* exige que l’appareil passe le contrôle de base : il n’est pas rooté et ne tourne pas sur une ROM personnalisée. *Intégrité de base et de l’appareil* ajoute le contrôle d’appareil. L’option facultative *intégrité forte* exige des preuves **matérielles** : tous les appareils ne la prennent pas en charge, et Intune marque alors ces appareils **non conformes**. Il faut donc pilote et inventaire avant d’imposer l’intégrité forte à un parc varié. Autre limite documentée : Google Play Protect et ces évaluations fonctionnent là où les services mobiles Google sont disponibles ; dans une région ou sur un appareil sans ces services, l’évaluation échoue.',
    '## Niveaux de sécurité recommandés',
    'Microsoft publie des exemples de configuration pour l’entièrement géré en niveaux de base, renforcé et élevé. Le niveau de base exige le verdict de base, un mot de passe, le chiffrement et l’intégrité de l’exécution de l’application Intune. Le niveau renforcé ajoute l’intégrité de base et d’appareil et l’intégrité forte, des durées de mot de passe et un historique. La version minimale du correctif de sécurité n’est pas configurée par défaut : il faut d’abord vérifier que les fabricants livrent réellement des correctifs avant d’en faire une exigence.',
    '## Défense contre les menaces mobiles',
    'Defender for Endpoint sur Android se déploie par Google Play géré avec une politique de configuration d’application, puis la protection web se règle par des politiques Intune. D’autres partenaires MTD (Lookout, Zimperium et d’autres) s’intègrent au même mécanisme : le connecteur MTD est activé dans Intune, le partenaire classe les menaces en niveaux, et une règle de conformité (*niveau de menace maximal*) transforme ce niveau en conformité. L’accès conditionnel bloque ensuite l’accès. La chaîne a **quatre maillons** et elle casse si l’un manque : détection, connecteur, règle de conformité, accès conditionnel.',
  ),
  demo: { title: 'Chaîne MTD', body: md(
    'Chaîne **fictive** pour un téléphone entièrement géré :',
    '```text',
    'Détection       : application malveillante classée « haute »',
    'Connecteur MTD  : activé pour Android',
    'Conformité      : niveau de menace maximal = Faible',
    'Accès           : accès conditionnel exige un appareil conforme',
    'Résultat        : appareil non conforme, accès aux courriels bloqué',
    '```',
    '**Lecture commentée.** Chaque ligne est un maillon à vérifier séparément.',
    '**Ce que la démo ne prouve pas.** Aucune menace n’a été détectée et aucun accès n’a été bloqué.') },
  guided: 'i14-g2', autonomous: 'i14-a2', quiz: ['i14-q2a', 'i14-q2b', 'i14-q2c'],
  revision: md('## Fiche : Android Enterprise', '- Deux types de profil de conformité : entièrement géré et profil de travail personnel.', '- Appareils dédiés : cibler les groupes d’appareils.', '- Play Integrity : base, base et appareil, forte (non prise en charge partout).', '- Pas de services Google : l’évaluation échoue.', '- MTD : détection, connecteur, conformité, accès conditionnel.', '- Administrateur d’appareil : déprécié.'),
  links: [sref('intune-android-compliance'), sref('intune-android-fully-managed'), sref('intune-mtd-overview'), sref('intune-mde-integration'), sref('mde-non-windows')], teaches: ['android-enterprise', 'play-integrity', 'mtd', 'profil-de-travail'],
};

const l3: AiLesson = {
  id: 'i14-l3', module: 'i14', title: 'Linux et la matrice de plateformes : ne rien transposer sans preuve', minutes: 45,
  summary: 'Connaître ce qu’Intune couvre sur Linux et bâtir une matrice qui nomme les écarts entre plateformes.',
  objectives: ['Énoncer les limites d’inscription et de conformité de Linux dans Intune.', 'Distinguer Intune pour Linux de Defender for Endpoint sur Linux.', 'Construire une matrice besoin par plateforme avec la nature de la couverture.'],
  prerequisites: ['Leçons 1 et 2', 'Module 13'],
  body: md(
    '## Ce qu’Intune sait faire sur Linux',
    'Intune gère les **postes de travail** Linux, pas les serveurs. Les distributions prises en charge changent avec les versions : la documentation actuelle liste Ubuntu Desktop en versions LTS récentes et Red Hat Enterprise Linux 9 et 10, avec un environnement graphique GNOME ; **Ubuntu Server n’est pas pris en charge**. Les listes de versions varient d’un article à l’autre et d’une mise à jour à l’autre : c’est une incertitude à revérifier à chaque révision, pas un fait stable. L’inscription passe par l’application Microsoft Intune pour Linux, avec un utilisateur : **pas d’inscription en masse, pas d’appareil sans utilisateur** (kiosque), pas de compte de gestionnaire d’inscription d’appareils. La documentation n’est pas parfaitement cohérente sur la propriété des appareils (corporatif seulement ou aussi personnel) : testez avant de promettre quoi que ce soit.',
    '## Conformité : catalogue et script personnalisé',
    'Pour Linux, il n’y a pas de gabarit de conformité fixe : on **choisit les paramètres dans le catalogue**. S’ajoutent des paramètres personnalisés : un fichier JSON qui définit les règles et un **script** qui s’exécute sur l’appareil pour détecter les valeurs. Les politiques de conformité s’ajoutent aux paramètres de conformité du locataire. Le chiffrement du disque ne se pose pas comme sur Windows ou macOS : il se décide idéalement à l’installation du système, et on le vérifie par la conformité, pas par un profil de chiffrement. Un autre point d’exploitation : les versions 2.0.2 et plus du courtier d’identité Microsoft **réinscrivent** les appareils et créent de **nouveaux identifiants** Intune et Entra ; il faut revoir les affectations, filtres et groupes fondés sur ces identifiants.',
    '## Defender for Endpoint sur Linux : un autre produit, un autre déploiement',
    'Defender for Endpoint sur Linux offre antivirus préventif, EDR et gestion des vulnérabilités pour des distributions listées, avec une interface en ligne de commande, et se déploie avec les outils de gestion de configuration Linux (Puppet, Ansible, etc.) ou la gestion de la sécurité de Defender. Il **n’est pas livré par Intune pour Linux**. La documentation signale aussi qu’une capacité comme la prévention de perte de données n’est pas prise en charge sur Linux. Ne promettez donc pas à la direction qu’un poste Linux « a les mêmes protections » qu’un poste Windows.',
    '## La matrice de plateformes',
    'La bonne pratique est un tableau besoin par plateforme dont chaque case porte une **nature** : natif, intégration, dépendance, licence supplémentaire, non pris en charge. Une case vide n’est pas acceptable : « non pris en charge » est une réponse, « on verra » n’en est pas une. La matrice sert aussi de contrat avec la gouvernance : elle dit ce qu’on garantit, ce qu’on compense et ce qu’on accepte comme risque. Mettez-la à jour après chaque changement de la documentation Microsoft (procédure de revue du module 15).',
  ),
  demo: { title: 'Extrait de matrice', body: md(
    'Extrait **fictif** :',
    '```text',
    'Besoin               Windows    macOS      Android    Linux',
    'Chiffrement          BitLocker  FileVault  Imposé     Installation + conformité',
    'Contrôle applicatif  App Ctrl   Gatekeeper Play géré  Non pris en charge (compensation)',
    'EDR                  Defender   Defender   MTD        Defender (hors Intune)',
    '```',
    '**Lecture commentée.** Les cases Linux nomment la compensation au lieu de copier Windows.',
    '**Ce que la démo ne prouve pas.** Aucune case n’a été validée sur un appareil réel.') },
  guided: 'i14-g3', autonomous: 'i14-a3', quiz: ['i14-q3a', 'i14-q3b', 'i14-q3c'],
  revision: md('## Fiche : Linux et matrice', '- Intune : postes Linux, pas serveurs.', '- Inscription : par utilisateur, pas en masse, pas de kiosque.', '- Conformité : catalogue plus script et JSON personnalisés.', '- Defender sur Linux : autre déploiement, hors Intune.', '- Matrice : chaque case a une nature, jamais vide.', '- Versions prises en charge : à revérifier à chaque révision.'),
  links: [sref('intune-linux-platform'), sref('intune-linux-compliance'), sref('intune-linux-enroll'), sref('mde-non-windows')], teaches: ['linux', 'matrice-de-plateformes', 'non-transposition'],
};

const exercises = [
  a.match({ id: 'i14-g1', title: 'Contrôle et plateforme', comp: c1.comp, tags: c1.tags, role: 'guided', dim: 'comprendre', lesson: 'i14-l1',
    st: 'Associez chaque besoin au mécanisme de la plateforme Apple.', items: [['p1', 'Chiffrer le disque d’un Mac'], ['p2', 'N’exécuter que des logiciels de confiance sur un Mac'], ['p3', 'Signaler un iPhone jailbreaké']],
    options: [['s1', 'FileVault'], ['s2', 'Gatekeeper'], ['s3', 'Règle de conformité Appareils jailbreakés : Bloquer']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Chaque besoin a un mécanisme propre à la plateforme Apple.' }),
  a.config({ id: 'i14-a1', title: 'Politique Mac de base', comp: c1.comp, tags: c1.tags, role: 'autonomous', dim: 'securiser', lesson: 'i14-l1',
    st: 'Paramétrez la politique de sécurité d’un Mac d’entreprise.',
    fields: [
      { id: 'fv', label: 'FileVault', kind: 'toggle', accept: ['on'], why: 'Chiffrement du disque complet.' },
      { id: 'fw', label: 'Pare-feu', kind: 'toggle', accept: ['on'], why: 'Pare-feu applicatif.' },
      { id: 'gk', label: 'Applications permises', kind: 'select', options: [{ id: 'store', label: 'App Store' }, { id: 'ident', label: 'App Store et développeurs identifiés' }, { id: 'any', label: 'N’importe où' }], accept: ['store', 'ident'], why: 'N’importe où est l’option la moins sûre.' },
    ], solution: { fv: 'on', fw: 'on', gk: 'ident' }, exp: 'FileVault et pare-feu activés, jamais « n’importe où ».' }),
  Q('i14-q1a', 'quiz', 'comprendre', c1, 'Gabarit déprécié', 'Que devient le gabarit de profil de protection des points de terminaison macOS ?', ['Il est déprécié : on utilise la sécurité des points de terminaison ou le catalogue.', 'Les politiques existantes restent.'], [['Il est obligatoire.', 'Faux.'], ['Il remplace le catalogue.', 'Faux.'], ['Il est identique à Windows.', 'Faux.']], 'Les nouveaux déploiements passent par le catalogue ou les politiques de sécurité.'),
  Q('i14-q1b', 'quiz', 'fonctionner', c1, 'Applications restreintes', 'Que fait la liste d’applications interdites sur iOS/iPadOS ?', ['Elle alimente un rapport et peut rendre l’appareil non conforme.', 'Elle ne bloque rien.'], [['Elle empêche l’installation.', 'Faux.'], ['Elle désinstalle les applications.', 'Faux.'], ['Elle chiffre l’appareil.', 'Faux.']], 'Pour bloquer, on passe par le catalogue de paramètres.'),
  Q('i14-q1c', 'quiz', 'securiser', c1, 'Jailbreak', 'Quelles couches complètent la détection du jailbreak par Defender ?', ['La règle de conformité et l’accès conditionnel.', 'Trois couches.'], [['Aucune, Defender suffit.', 'Incomplet.'], ['Le pare-feu macOS.', 'Hors sujet.'], ['FileVault.', 'Hors sujet.']], 'Détection, conformité et accès conditionnel forment la chaîne.'),

  a.match({ id: 'i14-g2', title: 'Profil et particularité', comp: c2.comp, tags: c2.tags, role: 'guided', dim: 'comprendre', lesson: 'i14-l2',
    st: 'Associez chaque situation Android à la bonne réponse.', items: [['p1', 'Terminal partagé de kiosque'], ['p2', 'Appareil sans services Google'], ['p3', 'Intégrité forte exigée']],
    options: [['s1', 'Cibler les groupes d’appareils'], ['s2', 'L’évaluation Play Protect échoue'], ['s3', 'Certains appareils sont non conformes']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Chaque situation a une conséquence documentée.' }),
  a.config({ id: 'i14-a2', title: 'Conformité Android entièrement géré', comp: c2.comp, tags: c2.tags, role: 'autonomous', dim: 'securiser', lesson: 'i14-l2',
    st: 'Paramétrez le niveau renforcé d’un parc homogène et récent.',
    fields: [
      { id: 'pi', label: 'Verdict Play Integrity', kind: 'select', options: [{ id: 'none', label: 'Non configuré' }, { id: 'basic', label: 'Base' }, { id: 'device', label: 'Base et appareil' }], accept: ['device'], why: 'Niveau renforcé.' },
      { id: 'strong', label: 'Intégrité forte', kind: 'toggle', accept: ['on'], why: 'Le parc est récent, après pilote.' },
      { id: 'rt', label: 'Intégrité de l’exécution Intune', kind: 'toggle', accept: ['on'], why: 'Présent dès le niveau de base.' },
    ], solution: { pi: 'device', strong: 'on', rt: 'on' }, exp: 'Base et appareil, intégrité forte après pilote et intégrité de l’exécution.' }),
  Q('i14-q2a', 'quiz', 'comprendre', c2, 'Deux profils', 'Pourquoi deux types de profil de conformité Android Enterprise ?', ['Les modes de gestion offrent des contrôles différents.', 'Entièrement géré contre profil de travail personnel.'], [['Pour la licence.', 'Faux.'], ['Pour la langue.', 'Faux.'], ['Aucune raison.', 'Faux.']], 'Les paramètres disponibles dépendent du mode de gestion.'),
  Q('i14-q2b', 'quiz', 'fonctionner', c2, 'Intégrité forte', 'Que se passe-t-il pour un appareil qui ne prend pas en charge l’intégrité forte ?', ['Intune le marque non conforme.', 'Limite documentée.'], [['Il est ignoré.', 'Faux.'], ['Il est chiffré.', 'Faux.'], ['Il est réinitialisé.', 'Faux.']], 'Il faut un pilote et un inventaire avant de l’imposer.'),
  Q('i14-q2c', 'quiz', 'maintenir', c2, 'Chaîne MTD', 'Combien de maillons la chaîne MTD compte-t-elle ?', ['Quatre : détection, connecteur, conformité, accès conditionnel.', 'Chacun se vérifie.'], [['Un seul.', 'Faux.'], ['Deux.', 'Incomplet.'], ['Aucun.', 'Faux.']], 'Si un maillon manque, l’accès n’est pas bloqué.'),

  a.workflow({ id: 'i14-g3', title: 'Remplir une case de matrice', comp: c3.comp, tags: c3.tags, role: 'guided', dim: 'securiser', lesson: 'i14-l3',
    st: 'Ordonnez le traitement d’un besoin pour une nouvelle plateforme.',
    blocks: [['b1', 'Chercher le mécanisme natif de la plateforme'], ['b2', 'Sinon chercher une intégration ou une dépendance'], ['b3', 'Sinon consigner non pris en charge et la compensation'], ['b4', 'Inscrire la nature et la source dans la matrice'], ['b5', 'Copier le réglage Windows par analogie']],
    required: ['b1', 'b2', 'b3', 'b4'], forbidden: ['b5'], before: [['b1', 'b2'], ['b2', 'b3'], ['b3', 'b4']], notes: { b5: 'Transposition sans preuve.' }, solution: ['b1', 'b2', 'b3', 'b4'],
    exp: 'Natif, intégration, non pris en charge puis inscription de la nature.' }),
  a.fix({ id: 'i14-a3', title: 'Corriger une case Linux', comp: c3.comp, tags: c3.tags, role: 'autonomous', dim: 'maintenir', lesson: 'i14-l3', language: 'json',
    st: 'Corrigez la case de matrice pour le contrôle applicatif sur Linux.',
    starter: JSON.stringify({ besoin: 'controle-applicatif', plateforme: 'linux', nature: 'natif', compensation: '' }, null, 2),
    rules: [{ kind: 'equals', path: 'nature', value: 'non-pris-en-charge', message: 'Nommer la nature réelle.', dim: 'securiser' }, { kind: 'type', path: 'compensation', type: 'string', message: 'Décrire la compensation.', dim: 'securiser' }, { kind: 'equals', path: 'revue', value: '6-mois', message: 'Fixer une revue.', dim: 'maintenir' }],
    solution: JSON.stringify({ besoin: 'controle-applicatif', plateforme: 'linux', nature: 'non-pris-en-charge', compensation: 'Defender sur Linux et gestion de configuration', revue: '6-mois' }, null, 2), exp: 'Nature réelle, compensation décrite et revue fixée.' }),
  Q('i14-q3a', 'quiz', 'comprendre', c3, 'Postes et serveurs', 'Intune gère-t-il les serveurs Ubuntu ?', ['Non : seuls les postes de travail Linux sont pris en charge.', 'Ubuntu Server exclu.'], [['Oui, tous.', 'Faux.'], ['Seulement avec Defender.', 'Faux.'], ['Seulement en nuage.', 'Faux.']], 'Ubuntu Server n’est pas pris en charge.'),
  Q('i14-q3b', 'quiz', 'fonctionner', c3, 'Conformité Linux', 'Comment ajoute-t-on une règle de conformité propre à Linux ?', ['Par le catalogue ou un JSON avec un script.', 'Paramètres personnalisés.'], [['Par un gabarit fixe.', 'Il n’y en a pas.'], ['Par BitLocker.', 'Windows.'], ['Par Gatekeeper.', 'macOS.']], 'Le catalogue et la conformité personnalisée couvrent Linux.'),
  Q('i14-q3c', 'quiz', 'maintenir', c3, 'Revalidation', 'Pourquoi revérifier les versions Linux prises en charge à chaque révision ?', ['Les listes changent entre les articles et les versions.', 'Incertitude documentée.'], [['Elles sont fixes.', 'Faux.'], ['Pour la licence.', 'Faux.'], ['Aucune raison.', 'Faux.']], 'La liste évolue : c’est une incertitude à surveiller.'),

  Q('i14-ev1', 'eval', 'comprendre', c1, 'Principe', 'Quelle est la règle de départ d’un durcissement multiplateforme ?', ['Chercher le mécanisme natif de chaque plateforme.', 'Pas de transposition.'], [['Copier les réglages Windows.', 'Faux.'], ['Ignorer les Mac.', 'Faux.'], ['Tout bloquer.', 'Faux.']], 'On cherche le mécanisme natif plutôt que de transposer.'),
  M('i14-ev2', 'eval', 'securiser', c1, 'Contrôles Mac', 'Cochez les contrôles de sécurité macOS gérables par Intune.', [['FileVault.', 'Catalogue ou sécurité des points de terminaison.'], ['Pare-feu applicatif.', 'Catalogue et conformité.'], ['Gatekeeper.', 'Catalogue et conformité.']], [['BitLocker.', 'Windows.'], ['Règles ASR.', 'Windows.']], 'FileVault, pare-feu et Gatekeeper sont les contrôles macOS.'),
  a.order({ id: 'i14-ev3', title: 'Déployer la chaîne jailbreak', comp: c1.comp, tags: c1.tags, role: 'eval', dim: 'fonctionner', lesson: 'i14-l1',
    st: 'Ordonnez la mise en place de la protection contre le jailbreak.',
    items: [['s1', 'Déployer Defender sur iOS'], ['s2', 'Créer la règle de conformité Appareils jailbreakés : Bloquer'], ['s3', 'Ajouter l’exigence d’appareil conforme à l’accès conditionnel'], ['s4', 'Tester avec un appareil pilote'], ['s5', 'Étendre au parc']], correct: ['s1', 's2', 's3', 's4', 's5'],
    exp: 'Détection, conformité, accès, pilote puis extension.' }),
  a.fix({ id: 'i14-ev4', title: 'Corriger une politique Android', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'securiser', lesson: 'i14-l2', language: 'json',
    st: 'Corrigez la politique d’un parc de terminaux dédiés.',
    starter: JSON.stringify({ cible: 'utilisateurs', gestion: 'administrateur-appareil', integrite: 'forte-immediate' }, null, 2),
    rules: [{ kind: 'equals', path: 'cible', value: 'appareils', message: 'Cibler les groupes d’appareils.', dim: 'fonctionner' }, { kind: 'equals', path: 'gestion', value: 'android-enterprise', message: 'Administrateur d’appareil déprécié.', dim: 'securiser' }, { kind: 'equals', path: 'integrite', value: 'base-et-appareil', message: 'Pilote avant l’intégrité forte.', dim: 'maintenir' }],
    solution: JSON.stringify({ cible: 'appareils', gestion: 'android-enterprise', integrite: 'base-et-appareil' }, null, 2), exp: 'Groupes d’appareils, Android Enterprise et intégrité progressive.' }),
  a.match({ id: 'i14-ev5', title: 'Symptôme et cause', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'maintenir', lesson: 'i14-l2',
    st: 'Associez chaque symptôme à sa cause probable.', items: [['p1', 'Appareils neufs non conformes après activation de l’intégrité forte'], ['p2', 'Évaluation Play Protect en échec dans une région'], ['p3', 'Connexion refusée sur un kiosque conforme']],
    options: [['s1', 'Pas de preuve matérielle prise en charge'], ['s2', 'Services mobiles Google indisponibles'], ['s3', 'Pas de mode d’appareil partagé Entra']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Chaque symptôme a une cause documentée distincte.' }),
  a.workflow({ id: 'i14-ev6', title: 'Mettre à jour la matrice', comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'maintenir', lesson: 'i14-l3',
    st: 'Ordonnez la revue de la matrice après un changement de documentation.',
    blocks: [['b1', 'Relire la source et sa date'], ['b2', 'Repérer les cases touchées'], ['b3', 'Mettre à jour nature et source'], ['b4', 'Informer le propriétaire du risque'], ['b5', 'Ignorer le changement']],
    required: ['b1', 'b2', 'b3', 'b4'], forbidden: ['b5'], before: [['b1', 'b2'], ['b2', 'b3'], ['b3', 'b4']], notes: { b5: 'La matrice devient fausse.' }, solution: ['b1', 'b2', 'b3', 'b4'],
    exp: 'Source, cases, mise à jour puis information du propriétaire.' }),
  a.short({ id: 'i14-ev7', title: 'Maillons MTD', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'comprendre', lesson: 'i14-l2',
    st: 'Combien de maillons compte la chaîne de défense mobile décrite ici ? (nombre)', accepted: ['4', 'quatre'], numeric: { value: 4 }, ph: 'un nombre',
    exp: 'Détection, connecteur, conformité et accès conditionnel : quatre maillons.' }),
  a.short({ id: 'i14-ev8', title: 'Natures', comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'comprendre', lesson: 'i14-l3',
    st: 'Combien de natures de couverture la matrice distingue-t-elle ? (nombre)', accepted: ['5', 'cinq'], numeric: { value: 5 }, ph: 'un nombre',
    exp: 'Natif, intégration, dépendance, licence supplémentaire et non pris en charge : cinq natures.' }),

  a.inspect({ id: 'i14-cs1', title: 'Cas : flotte mixte chez Aurore Logistique', comp: c1.comp, tags: c1.tags, role: 'case', dim: 'securiser', lesson: 'i14-l1', language: 'text',
    st: 'Plan fictif. Repérez les défauts.',
    lines: [['p1', 'Les Mac recevront le profil BitLocker du parc Windows.', { ok: 'a1', fixes: [['a1', 'Utiliser FileVault par catalogue'], ['a2', 'Accepter']] }], ['p2', 'La liste d’applications interdites empêchera l’installation sur iPhone.', { ok: 'b1', fixes: [['b1', 'Utiliser le catalogue Restrictions pour bloquer'], ['b2', 'Accepter']] }], ['p3', 'Gatekeeper restera sur « n’importe où » pour éviter les plaintes.', { ok: 'c1', fixes: [['c1', 'Limiter à l’App Store et aux développeurs identifiés'], ['c2', 'Accepter']] }]],
    exp: 'Trois défauts : transposition, fausse promesse de blocage et réglage laxiste.' }),
  a.workflow({ id: 'i14-cs2', title: 'Cas : Android entièrement géré', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'securiser', lesson: 'i14-l2',
    st: 'Ordonnez le déploiement de la sécurité Android.',
    blocks: [['t1', 'Choisir le mode de gestion'], ['t2', 'Déployer Defender par Google Play géré'], ['t3', 'Créer la conformité avec le verdict Play Integrity'], ['t4', 'Activer le connecteur et la règle de niveau de menace'], ['t5', 'Ajouter l’accès conditionnel après le pilote'], ['t6', 'Imposer l’intégrité forte à tous sans pilote']],
    required: ['t1', 't2', 't3', 't4', 't5'], forbidden: ['t6'], before: [['t1', 't2'], ['t2', 't3'], ['t3', 't4'], ['t4', 't5']], notes: { t6: 'Risque de verrouillage massif.' }, solution: ['t1', 't2', 't3', 't4', 't5'],
    exp: 'Mode, Defender, conformité, connecteur puis accès conditionnel.' }),
  a.match({ id: 'i14-cs3', title: 'Cas : natures par plateforme', comp: c3.comp, tags: c3.tags, role: 'case', dim: 'maintenir', lesson: 'i14-l3',
    st: 'Associez chaque situation à la nature à inscrire à la matrice.', items: [['p1', 'FileVault sur macOS'], ['p2', 'EDR sur Linux via Defender hors Intune'], ['p3', 'Contrôle applicatif sans paramètre sur Linux']],
    options: [['s1', 'Natif'], ['s2', 'Dépendance ou intégration'], ['s3', 'Non pris en charge']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'La nature décrit honnêtement ce que chaque plateforme couvre.' }),
  a.open({ id: 'i14-cs-open', title: 'Cas : matrice de plateformes', comp: c3.comp, tags: c3.tags, role: 'case', dim: 'maintenir', lesson: 'i14-l3',
    st: 'Rédigez la matrice de sécurité d’une flotte fictive mixte.',
    deliverable: 'Un document : besoins, plateformes, natures, compensations, sources et revue.',
    rubric: [['r1', 'Aucun contrôle n’est transposé sans preuve.', 'securiser'], ['r2', 'Chaque case a une nature.', 'comprendre'], ['r3', 'Les écarts ont une compensation ou un risque accepté.', 'securiser'], ['r4', 'Les sources et dates sont citées.', 'maintenir'], ['r5', 'La revue est planifiée.', 'maintenir']],
    exp: 'Pas de note automatique : on juge la rigueur de la matrice.' }),

  Q('i14-rm1', 'remediation', 'comprendre', c1, 'Remédiation : Apple', 'Pourquoi ne pas appliquer un profil BitLocker à un Mac ?', ['BitLocker est propre à Windows ; le Mac utilise FileVault.', 'Mécanismes natifs.'], [['Pour la licence.', 'Faux.'], ['Pour la vitesse.', 'Faux.'], ['Aucune raison.', 'Faux.']], 'Chaque plateforme a son mécanisme de chiffrement.'),
  Q('i14-rm2', 'remediation', 'fonctionner', c2, 'Remédiation : Android', 'Pourquoi un pilote avant l’intégrité forte ?', ['Les appareils sans preuve matérielle deviennent non conformes.', 'Limite documentée.'], [['Pour la couleur.', 'Faux.'], ['Pour la licence.', 'Faux.'], ['Aucune raison.', 'Faux.']], 'Le pilote révèle les appareils incompatibles avant l’impact.'),
  Q('i14-rm3', 'remediation', 'securiser', c3, 'Remédiation : Linux', 'Pourquoi inscrire « non pris en charge » plutôt que laisser une case vide ?', ['C’est une réponse honnête qui appelle une compensation.', 'Une case vide cache le risque.'], [['Pour gagner du temps.', 'Faux.'], ['Pour la licence.', 'Faux.'], ['Aucune raison.', 'Faux.']], 'Une case vide cache un risque.'),
];

const competencies: AiCompetency[] = [
  { id: 'i14-c1', module: 'i14', name: 'Sécuriser macOS, iOS et iPadOS', description: 'Contrôles natifs Apple, conformité et limites.', criteria: [{ id: 'i14-c1-1', text: 'Je nomme les contrôles macOS natifs.' }, { id: 'i14-c1-2', text: 'Je distingue rapport et blocage sur iOS.' }, { id: 'i14-c1-3', text: 'Je monte la chaîne jailbreak complète.' }] },
  { id: 'i14-c2', module: 'i14', name: 'Sécuriser Android Enterprise', description: 'Modes de gestion, Play Integrity et MTD.', criteria: [{ id: 'i14-c2-1', text: 'Je choisis le profil de conformité adapté.' }, { id: 'i14-c2-2', text: 'Je règle Play Integrity avec pilote.' }, { id: 'i14-c2-3', text: 'Je vérifie les quatre maillons MTD.' }] },
  { id: 'i14-c3', module: 'i14', name: 'Bâtir une matrice de plateformes honnête', description: 'Linux, natures et non-transposition.', criteria: [{ id: 'i14-c3-1', text: 'Je connais les limites d’Intune sur Linux.' }, { id: 'i14-c3-2', text: 'Je donne une nature à chaque case.' }, { id: 'i14-c3-3', text: 'Je planifie la revue des sources.' }] },
];

const projects: AiProject[] = [
  { id: 'i14-p1', module: 'i14', level: 'débutant', title: 'Tableau comparatif de contrôles', problem: 'Comparer, pour quatre plateformes fictives, les contrôles natifs de chiffrement, de filtrage et d’applications.', architecture: 'Tableau d’une page avec sources.', tools: ['Tableur'], data: 'Plateformes fictives.', steps: ['Lister les besoins.', 'Chercher le mécanisme natif.', 'Inscrire la nature.'], success: ['Aucune case copiée de Windows sans preuve.'], risks: ['Transposition.'], extensions: ['Ajouter une colonne de licences.'] },
  { id: 'i14-p2', module: 'i14', level: 'intermédiaire', title: 'Plan de sécurité d’une flotte mobile', problem: 'Concevoir la sécurité de téléphones Android et iPhone fictifs : conformité, MTD, accès conditionnel et pilote.', architecture: 'Plan documenté avec chaîne de détection à l’accès.', tools: ['Éditeur de texte'], data: 'Parc mobile fictif.', steps: ['Choisir les modes de gestion.', 'Écrire la conformité.', 'Brancher la défense mobile.', 'Planifier le pilote.'], success: ['Les quatre maillons sont nommés et vérifiables.'], risks: ['Verrouillage massif.'], extensions: ['Ajouter une requête de suivi.'],
    connected: { accounts: 'Un locataire de test avec Intune et un appareil Android de test inscrit.', permissions: 'Endpoint Security Manager dans le locataire de test.', costs: 'Licences de test.', secrets: 'Aucun secret requis.', cleanup: 'Retirer les politiques, désinscrire et réinitialiser l’appareil de test.', limits: 'Facultatif : le parcours principal fonctionne sans locataire.' } },
  { id: 'i14-p3', module: 'i14', level: 'avancé', title: 'Matrice de plateformes maintenue', problem: 'Bâtir et réviser une matrice besoin par plateforme avec nature, compensation, source et date de revue.', architecture: 'Matrice versionnée avec propriétaire.', tools: ['Tableur'], data: 'Exigences fictives.', steps: ['Lister les exigences.', 'Remplir les natures.', 'Nommer les compensations.', 'Planifier la revue.'], success: ['Aucune case vide.'], risks: ['Sources périmées.'], extensions: ['Ajouter un indicateur de fraîcheur.'] },
];

export const i14 = assemble({ id: 'i14', level: 5, n: 14, title: 'Sécurité par plateforme',
  summary: 'Contrôles natifs de macOS, iOS/iPadOS, Android Enterprise et Linux, défense mobile, et matrice de plateformes sans transposition des capacités Windows.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Sécuriser une flotte mixte chez Aurore Logistique',
  caseScenario: 'Vous couvrez Mac, iPhone, Android et Linux avec les contrôles natifs de chacun. Actions simulées.', caseMinutes: 45 });
