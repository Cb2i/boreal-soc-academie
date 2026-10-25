// Module 11 : Applications, scripts et périphériques (niveau 4).
import type { AiCompetency, AiLesson, AiProject } from '../../agentic/types.ts';
import { assemble } from '../assemble.ts';
import { kit } from '../kit.ts';
import { sref } from '../sources.ts';

const md = (...lines: string[]) => lines.join('\n');
const { a, Q, M } = kit('i11');
const c1 = { comp: 'i11-c1', lesson: 'i11-l1', tags: ['app-control', 'applocker', 'installateur-gere'] };
const c2 = { comp: 'i11-c2', lesson: 'i11-l2', tags: ['scripts', 'langage-contraint', 'powershell'] };
const c3 = { comp: 'i11-c3', lesson: 'i11-l3', tags: ['device-control', 'supports-amovibles', 'application-par-defaut'] };

const l1: AiLesson = {
  id: 'i11-l1', module: 'i11', title: 'App Control for Business et AppLocker : autoriser plutôt que deviner', minutes: 55,
  summary: 'Choisir entre App Control for Business et AppLocker, déployer en audit et autoriser les applications par installateur géré.',
  objectives: ['Distinguer App Control for Business d’AppLocker et justifier le choix.', 'Déployer une politique en mode audit avant l’application.', 'Configurer Intune comme installateur géré et vérifier les autorisations.'],
  prerequisites: ['Modules 4 et 5'],
  body: md(
    '## Le changement de modèle',
    'Un antivirus part du principe que tout s’exécute sauf ce qu’il reconnaît comme malveillant. Le contrôle des applications inverse la logique : **le code ne s’exécute que si la politique l’autorise**. Il couvre les exécutables, les bibliothèques, les installateurs MSI, les scripts et même les sessions PowerShell interactives. Il ne remplace pas l’antivirus : il le complète. Windows offre deux technologies. **App Control for Business** (anciennement WDAC) est conçu comme une fonction de sécurité et sert de référence ; **AppLocker** est un héritage encore pris en charge, qui ne reçoit plus que des correctifs de sécurité. Recommandation de Microsoft : privilégier App Control for Business, sauf besoin précis (règles par utilisateur, par exemple) que seul AppLocker comble.',
    '## Comment Intune le déploie',
    'Dans Endpoint security > App Control for Business, deux formats : **XML** (vous fournissez la politique complète) ou **contrôles intégrés** (approuver ce qu’installe un installateur géré, faire confiance aux composants Windows et aux applications du Store). Une politique « XML » vide agit comme Non configurée. Sans règle d’autorisation, tout ce qui n’est pas explicitement permis est bloqué, sauf en **mode audit** où tout s’exécute et les détails sont journalisés localement. Intune s’appuie sur le CSP ApplicationControl. On peut étendre une politique de base par des **politiques supplémentaires** (rédigées en XML). Plusieurs politiques de base et supplémentaires peuvent coexister sur un appareil. Les anciennes instances « Application Control » dans les profils de réduction de la surface d’attaque seront retirées : ne les utilisez plus pour un nouveau projet.',
    '## L’installateur géré',
    'Le mécanisme d’installateur géré désigne un binaire de confiance (l’extension de gestion Intune, ou Configuration Manager) ; tout fichier qu’il écrit est marqué comme provenant d’une source autorisée, et la politique peut faire confiance à ces fichiers (option 13, *Enabled: Managed Installer*). Le suivi repose sur une collection de règles AppLocker de type ManagedInstaller et sur les services AppLocker. Seuls les exécutables peuvent être désignés comme installateurs gérés. Les applications déployées **avant** la désignation ne sont pas marquées : déployez alors en audit pour repérer ce qui manque, puis créez des politiques supplémentaires. Pour vérifier : politique en audit avec installateur géré et Intelligent Security Graph, déployer une application de test, puis lire les événements d’origine 3090, 3091 et 3092 dans Advanced Hunting (types d’action AppControlCodeIntegrityOriginAllowed, Audited, Blocked).',
    '## Intelligent Security Graph',
    'L’option « faire confiance aux applications de bonne réputation » s’appuie sur l’Intelligent Security Graph, la même source que Defender Antivirus et SmartScreen. Elle élargit l’autorisation à ce qui est répandu et réputé : c’est un compromis de commodité, à ne pas choisir si l’objectif est une liste blanche stricte.',
    '## Passer à l’application',
    'La séquence éprouvée est : inventorier la façon dont les applications arrivent chez vous, déployer en **audit**, lire les événements centralement, ajouter les exceptions justifiées par des politiques supplémentaires, puis passer en application par vagues avec un pilote. Les applications métier non signées sont le premier obstacle : signez-les ou utilisez des catalogues signés. Gardez un mode audit disponible comme chemin de retour.',
  ),
  demo: { title: 'Du constat à l’application', body: md(
    'Plan **fictif** :',
    '```text',
    'S1  Intune désigné installateur géré ; politique en audit',
    'S2  Lecture des événements 3091 (audités) dans Advanced Hunting',
    'S3  Politique supplémentaire pour 4 applications métier signées',
    'S4  Application sur le pilote, puis par vagues',
    '```',
    '**Lecture commentée.** On mesure ce qui serait bloqué avant de bloquer.',
    '**Ce que la démo ne prouve pas.** Aucune politique n’a été exécutée.') },
  guided: 'i11-g1', autonomous: 'i11-a1', quiz: ['i11-q1a', 'i11-q1b', 'i11-q1c'],
  revision: md('## Fiche : contrôle des applications', '- Autoriser explicitement plutôt que bloquer le connu.', '- App Control recommandé ; AppLocker en héritage.', '- Audit d’abord, application par vagues.', '- Installateur géré : seuls les fichiers écrits après la désignation sont marqués.', '- Événements 3090, 3091, 3092 pour l’origine.'),
  links: [sref('intune-app-control'), sref('win-appcontrol-overview'), sref('win-appcontrol-managed-installer'), sref('win-appcontrol-design')], teaches: ['app-control', 'applocker', 'installateur-gere'],
};

const l2: AiLesson = {
  id: 'i11-l2', module: 'i11', title: 'Contrôle des scripts : PowerShell, langage contraint et limites réelles', minutes: 45,
  summary: 'Comprendre ce que le contrôle des scripts bloque vraiment, et ce qui échappe à AppLocker.',
  objectives: ['Décrire le mode de langage contraint de PowerShell sous App Control.', 'Énoncer les limites du contrôle des scripts par AppLocker.', 'Planifier les scripts autorisés sans casser l’administration.'],
  prerequisites: ['Leçon 1'],
  body: md(
    '## Qui applique réellement',
    'L’application des scripts repose sur une **poignée de main** entre un hôte de script « éclairé » (PowerShell, Windows Script Host) et App Control. C’est l’hôte qui décide du comportement : bloquer, autoriser ou changer *la manière* d’exécuter. Un événement « bloqué » ne signifie donc pas toujours que le fichier ne s’est pas exécuté. Les événements de script partagent le journal « AppLocker - MSI and Script ».',
    '## PowerShell sous App Control',
    'Les scripts (.ps1), modules (.psm1) et manifestes (.psd1) **autorisés** par la politique s’exécutent en **FullLanguage**. Tout script non autorisé s’exécute quand même, mais en **ConstrainedLanguage**, qui interdit les actions dangereuses (types .NET arbitraires, COM, `Add-Type` dans certains contextes). Dès qu’une politique App Control avec application en mode utilisateur est active et qu’**une** politique active a l’application des scripts, **PowerShell interactif** passe en langage contraint, même si cette politique est en audit seulement. Pour retrouver FullLanguage, il faut désactiver l’application des scripts pour *toutes* les politiques. Les modules dépendants doivent aussi être autorisés, et les fonctions doivent être exportées par nom (pas de caractère générique). Évitez le *dot-sourcing* : utilisez des modules. À partir de PowerShell 7.4, l’audit consigne ce qui serait restreint dans le journal d’événements au lieu de lever des erreurs, ce qui rend le diagnostic possible.',
    '## Autres hôtes',
    'Les scripts VBScript, JScript lancés par wscript.exe ou cscript.exe doivent être autorisés par la politique, sinon ils sont bloqués. **MSHTA et MSXML sont entièrement bloqués** dès qu’une politique avec application des scripts est active, même en audit. Les objets COM suivent une liste d’autorisations restreinte que la politique peut élargir ; l’option qui désactive l’application des scripts n’affecte pas les objets COM. L’option de désactivation de l’application des scripts n’est pas prise en charge sur Windows Server 2016 ni Windows 10 1607 LTSB.',
    '## Ce qu’AppLocker ne contrôle pas',
    'AppLocker contrôle VBScript, JScript, les fichiers .bat et .cmd et les scripts PowerShell, mais **pas tout code interprété**. Les macros Office, les scripts Perl et d’autres langages ne sont contrôlés que si l’hôte appelle AppLocker avant d’exécuter, ce que beaucoup ne font pas. Pour les macros, la bonne mesure est la configuration de sécurité d’Office (macros signées et approuvées), pas AppLocker. AppLocker ne contrôle pas non plus le comportement d’une application après son lancement.',
    '## Conséquence pour l’administration',
    'Verrouiller PowerShell sans plan casse les scripts d’administration, y compris ceux que vous déployez par Intune. Signez les scripts d’administration, listez-les dans la politique, testez en audit avec la version de PowerShell réellement utilisée, et gardez un compte d’exploitation dont l’accès est défini par la politique plutôt que contourné.',
  ),
  demo: { title: 'Lecture d’un résultat', body: md(
    'Journal **fictif** :',
    '```text',
    'Script : inventaire.ps1   Signé : oui   Politique : autorisé   Mode : FullLanguage',
    'Script : test.ps1         Signé : non   Politique : absent     Mode : ConstrainedLanguage',
    '```',
    '**Lecture commentée.** Le script non autorisé s’exécute, mais avec des droits de langage réduits.',
    '**Ce que la démo ne prouve pas.** Aucun script n’a été exécuté.') },
  guided: 'i11-g2', autonomous: 'i11-a2', quiz: ['i11-q2a', 'i11-q2b', 'i11-q2c'],
  revision: md('## Fiche : scripts', '- L’hôte applique, pas App Control seul.', '- Non autorisé = ConstrainedLanguage, pas forcément bloqué.', '- Une politique avec application des scripts, même en audit : PowerShell interactif contraint.', '- MSHTA et MSXML bloqués.', '- AppLocker ne contrôle pas les macros ni tout code interprété.'),
  links: [sref('win-appcontrol-scripts'), sref('ps-appcontrol'), sref('win-applocker-design'), sref('win-appcontrol-overview')], teaches: ['scripts', 'langage-contraint', 'powershell'],
};

const l3: AiLesson = {
  id: 'i11-l3', module: 'i11', title: 'Device Control : supports amovibles, groupes, règles et application par défaut', minutes: 50,
  summary: 'Contrôler l’accès aux supports amovibles avec des groupes et des règles qui se comportent de façon prévisible dans Intune.',
  objectives: ['Définir la portée réelle de Device Control (ce qui est un support amovible).', 'Construire des règles sans dépendre d’un ordre.', 'Choisir l’application par défaut et valider par un test.'],
  prerequisites: ['Leçons 1 et 2'],
  body: md(
    '## Ce que Device Control couvre',
    'Device Control de Defender for Endpoint restreint l’accès aux **appareils portables Windows**, aux **supports amovibles**, aux **CD/DVD** et aux **imprimantes**. Sous Windows, « support amovible » ne signifie pas « tout périphérique USB » : pour être dans la portée, l’appareil **doit créer un disque** (par exemple E:). Une souris ou un clavier USB n’est pas concerné. Pour bloquer d’autres classes, il faut les **restrictions d’installation de périphériques** de Windows (par identifiant d’appareil, d’instance ou classe d’installation) ; ces restrictions bloquent tout ce qui figure au gestionnaire de périphériques, y compris des appareils indispensables, donc à cibler avec soin. Le paramètre CSP de refus d’écriture sur disque amovible existe aussi comme mesure plus simple. Autre voie distincte : la DLP des terminaux (module 10) surveille les actions sur contenu sensible mais n’est pas un contrôle d’accès aux supports.',
    '## Groupes, règles, entrées',
    'Une **politique** définit l’accès pour un ensemble d’appareils. Une **règle** liste des groupes inclus et des groupes exclus : elle s’applique si l’appareil est dans *tous* les groupes inclus et dans *aucun* groupe exclu. Les **entrées** de la règle précisent l’action (autoriser, refuser, auditer), les options de notification et le masque d’accès (lecture, écriture, exécution, impression), éventuellement limités à un utilisateur (identifiant d’objet Entra ou SID) ou à un groupe d’appareils. Si aucune règle ni entrée ne correspond, c’est l’**application par défaut** qui décide.',
    '## Application par défaut et ordre',
    'Par défaut, Device Control est désactivé et tout est autorisé. Activé, il vise tous les types d’appareils, avec une application par défaut qu’on peut passer de Allow à Deny. Piège central d’Intune : **l’ordre des règles n’est pas conservé**. Rédigez donc des règles Allow et Deny **qui ne se recoupent pas**, en excluant explicitement les groupes hors portée. Autre piège : **vous ne pouvez pas changer l’application par défaut dans l’interface graphique d’Intune** ; si vous la passez à Deny par une autre voie (profil personnalisé OMA-URI : DeviceControlEnabled, DefaultEnforcement = 2, SecuredDevicesConfiguration = RemovableMediaDevices) puis créez une règle Allow pour certains appareils, tous les autres sont bloqués. Si vous ne configurez que des règles d’audit, les permissions viennent de l’application par défaut : ajoutez toujours une règle Allow ou Deny avec l’audit.',
    '## Conflits et validation',
    'Si vous gérez Device Control avec Intune, retirez les paramètres de stratégie de groupe en conflit : le paramètre ControlPolicyConflict ne s’applique pas au CSP Defender. Les entrées qui utilisent l’identifiant d’objet Entra nécessitent un accès non interactif à Microsoft Graph pour résoudre l’appartenance aux groupes ; une politique d’accès conditionnel qui exige une authentification interactive peut empêcher la condition de correspondre. Validez avec `Get-MpComputerStatus` (état DeviceControlState et DeviceControlDefaultEnforcement), puis retirez et réinsérez un support de test et vérifiez le refus. Les événements apparaissent dans Advanced Hunting et dans le rapport Device Control.',
  ),
  demo: { title: 'Règles sans recoupement', body: md(
    'Politique **fictive** :',
    '```text',
    'Groupe A : tous les supports amovibles       Groupe B : clés approuvées',
    'Règle 1 : inclut A, exclut B      -> lecture seule',
    'Règle 2 : inclut B                -> lecture et écriture',
    '```',
    '**Lecture commentée.** B est exclu de la règle 1 : le résultat ne dépend pas de l’ordre.',
    '**Ce que la démo ne prouve pas.** Aucun support n’a été inséré.') },
  guided: 'i11-g3', autonomous: 'i11-a3', quiz: ['i11-q3a', 'i11-q3b', 'i11-q3c'],
  revision: md('## Fiche : Device Control', '- Portée : appareils qui créent un disque, CD/DVD, portables, imprimantes.', '- Règle : tous les inclus, aucun exclu.', '- Intune ne conserve pas l’ordre : règles sans recoupement.', '- Application par défaut non modifiable dans l’interface ; attention au Deny.', '- Auditer seul hérite de l’application par défaut.'),
  links: [sref('mde-device-control-overview'), sref('mde-device-control-policies'), sref('mde-device-control-configure'), sref('mde-device-control-walkthrough'), sref('intune-reusable-groups')], teaches: ['device-control', 'supports-amovibles', 'application-par-defaut'],
};

const exercises = [
  a.match({ id: 'i11-g1', title: 'Technologie et statut', comp: c1.comp, tags: c1.tags, role: 'guided', dim: 'comprendre', lesson: 'i11-l1',
    st: 'Associez chaque technologie à sa situation.', items: [['p1', 'App Control for Business'], ['p2', 'AppLocker'], ['p3', 'Mode audit']],
    options: [['s1', 'Fonction de sécurité recommandée'], ['s2', 'Héritage, correctifs de sécurité seulement'], ['s3', 'Tout s’exécute, tout est journalisé']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'App Control est la référence, AppLocker un héritage, et l’audit mesure sans bloquer.' }),
  a.workflow({ id: 'i11-a1', title: 'Passer à l’application', comp: c1.comp, tags: c1.tags, role: 'autonomous', dim: 'fonctionner', lesson: 'i11-l1',
    st: 'Ordonnez le passage d’App Control à l’application.',
    blocks: [['b1', 'Inventorier la distribution des applications'], ['b2', 'Désigner Intune comme installateur géré'], ['b3', 'Déployer en audit'], ['b4', 'Lire les événements dans Advanced Hunting'], ['b5', 'Ajouter des politiques supplémentaires justifiées'], ['b6', 'Appliquer par vagues avec un pilote'], ['b7', 'Appliquer à tout le parc dès le premier jour']],
    required: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'], forbidden: ['b7'], before: [['b1', 'b2'], ['b2', 'b3'], ['b3', 'b4'], ['b4', 'b5'], ['b5', 'b6']], notes: { b7: 'Aucune mesure préalable.' }, solution: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'],
    exp: 'Inventaire, installateur, audit, lecture, exceptions puis vagues.' }),
  Q('i11-q1a', 'quiz', 'comprendre', c1, 'Logique', 'Quelle est la logique du contrôle des applications ?', ['Le code ne s’exécute que s’il est autorisé.', 'Liste d’autorisation.'], [['Tout s’exécute sauf le connu malveillant.', 'C’est l’antivirus.'], ['Aucun code ne s’exécute.', 'Faux.'], ['Seuls les scripts sont visés.', 'Faux.']], 'Le contrôle des applications autorise explicitement.'),
  Q('i11-q1b', 'quiz', 'fonctionner', c1, 'Applications antérieures', 'Que faire des applications déployées avant la désignation de l’installateur géré ?', ['Déployer en audit pour repérer ce qui manque, puis les autoriser.', 'Elles ne sont pas marquées.'], [['Elles sont marquées automatiquement.', 'Faux.'], ['Les supprimer.', 'Faux.'], ['Ignorer.', 'Faux.']], 'Elles ne sont pas marquées : audit puis exceptions.'),
  Q('i11-q1c', 'quiz', 'maintenir', c1, 'Événements', 'Quels événements montrent l’origine par installateur géré ?', ['3090, 3091 et 3092.', 'Dans Advanced Hunting.'], [['4624 et 4625.', 'Authentification.'], ['1 et 2.', 'Faux.'], ['Aucun.', 'Faux.']], 'Les événements 3090, 3091 et 3092 consignent l’origine.'),

  a.match({ id: 'i11-g2', title: 'Hôte et comportement', comp: c2.comp, tags: c2.tags, role: 'guided', dim: 'comprendre', lesson: 'i11-l2',
    st: 'Associez chaque hôte à son comportement sous App Control avec application des scripts.', items: [['p1', 'PowerShell, script non autorisé'], ['p2', 'MSHTA'], ['p3', 'wscript sans autorisation']],
    options: [['s1', 'S’exécute en langage contraint'], ['s2', 'Tout code bloqué'], ['s3', 'Script bloqué']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Chaque hôte applique la politique à sa manière.' }),
  a.inspect({ id: 'i11-a2', title: 'Relire un plan de scripts', comp: c2.comp, tags: c2.tags, role: 'autonomous', dim: 'securiser', lesson: 'i11-l2', language: 'text',
    st: 'Plan fictif. Repérez les défauts.',
    lines: [['p1', 'AppLocker bloquera aussi les macros Office.', { ok: 'a1', fixes: [['a1', 'Configurer la sécurité d’Office (macros signées)'], ['a2', 'Accepter']] }], ['p2', 'Les scripts d’administration non signés resteront en langage complet.', { ok: 'b1', fixes: [['b1', 'Signer et autoriser les scripts d’administration'], ['b2', 'Accepter']] }], ['p3', 'Le test se fera directement en application.', { ok: 'c1', fixes: [['c1', 'Tester en audit d’abord'], ['c2', 'Accepter']] }]],
    exp: 'Macros hors AppLocker, scripts non autorisés en langage contraint et test sans audit.' }),
  Q('i11-q2a', 'quiz', 'comprendre', c2, 'Langage contraint', 'Que devient un script non autorisé sous App Control ?', ['Il s’exécute en ConstrainedLanguage.', 'Pas toujours bloqué.'], [['Il est supprimé.', 'Faux.'], ['Il s’exécute en FullLanguage.', 'Faux.'], ['Il est signé.', 'Faux.']], 'Il s’exécute en langage contraint.'),
  Q('i11-q2b', 'quiz', 'fonctionner', c2, 'Audit et interactif', 'Une politique en audit avec application des scripts change-t-elle PowerShell interactif ?', ['Oui, il passe en langage contraint.', 'Même en audit.'], [['Non.', 'Faux.'], ['Seulement sur serveur.', 'Faux.'], ['Seulement en application.', 'Faux.']], 'L’audit suffit à contraindre PowerShell interactif.'),
  Q('i11-q2c', 'quiz', 'maintenir', c2, 'Limite AppLocker', 'Qu’est-ce qu’AppLocker ne contrôle pas de façon fiable ?', ['Les macros et le code interprété dont l’hôte n’appelle pas AppLocker.', 'Dépend de l’hôte.'], [['Les .exe.', 'Contrôlés.'], ['Les .bat.', 'Contrôlés.'], ['Les .cmd.', 'Contrôlés.']], 'Le code interprété par un hôte non coopératif échappe à AppLocker.'),

  a.match({ id: 'i11-g3', title: 'Appareil et portée', comp: c3.comp, tags: c3.tags, role: 'guided', dim: 'comprendre', lesson: 'i11-l3',
    st: 'Associez chaque appareil à sa portée dans Device Control.', items: [['p1', 'Clé USB qui crée un disque E:'], ['p2', 'Clavier USB'], ['p3', 'Imprimante']],
    options: [['s1', 'Support amovible, dans la portée'], ['s2', 'Hors portée de Device Control'], ['s3', 'Type d’appareil pris en charge']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'La portée dépend du fait que l’appareil crée un disque ou appartient aux types pris en charge.' }),
  a.fix({ id: 'i11-a3', title: 'Corriger les règles', comp: c3.comp, tags: c3.tags, role: 'autonomous', dim: 'securiser', lesson: 'i11-l3', language: 'json',
    st: 'Corrigez : règles sans recoupement et audit accompagné d’une règle.',
    starter: JSON.stringify({ regle1: { inclut: 'A', exclut: 'aucun', action: 'lecture-seule' }, regle2: { inclut: 'B', action: 'ecriture' }, auditSeul: true }, null, 2),
    rules: [{ kind: 'equals', path: 'regle1.exclut', value: 'B', message: 'Exclure B de la règle 1.', dim: 'securiser' }, { kind: 'equals', path: 'auditSeul', value: false, message: 'Ajouter une règle Allow ou Deny avec l’audit.', dim: 'maintenir' }],
    solution: JSON.stringify({ regle1: { inclut: 'A', exclut: 'B', action: 'lecture-seule' }, regle2: { inclut: 'B', action: 'ecriture' }, auditSeul: false }, null, 2), exp: 'B exclu de la règle 1 et audit accompagné d’une règle Allow ou Deny.' }),
  Q('i11-q3a', 'quiz', 'comprendre', c3, 'Ordre', 'Intune conserve-t-il l’ordre des règles Device Control ?', ['Non : écrire des règles sans recoupement.', 'Ordre non garanti.'], [['Oui, de haut en bas.', 'Faux.'], ['Oui, de bas en haut.', 'Faux.'], ['Selon la plateforme.', 'Faux.']], 'L’ordre n’est pas conservé.'),
  Q('i11-q3b', 'quiz', 'fonctionner', c3, 'Défaut Deny', 'Que se passe-t-il si le défaut est Deny et qu’une règle Allow cible quelques appareils ?', ['Tous les autres sont bloqués.', 'Application par défaut.'], [['Tous sont autorisés.', 'Faux.'], ['Rien ne change.', 'Faux.'], ['Seuls les imprimantes sont bloquées.', 'Faux.']], 'Les appareils hors règle suivent le défaut Deny.'),
  Q('i11-q3c', 'quiz', 'maintenir', c3, 'Validation', 'Comment valider localement le défaut ?', ['Get-MpComputerStatus, puis un test avec un support.', 'DeviceControlDefaultEnforcement.'], [['En redémarrant.', 'Insuffisant.'], ['En lisant le portail seulement.', 'Insuffisant.'], ['Impossible.', 'Faux.']], 'Get-MpComputerStatus montre l’état réel.'),

  Q('i11-ev1', 'eval', 'comprendre', c1, 'Choix technologique', 'Quelle technologie est recommandée pour un nouveau projet ?', ['App Control for Business.', 'Fonction de sécurité.'], [['AppLocker.', 'Héritage.'], ['Aucune.', 'Faux.'], ['Une macro.', 'Faux.']], 'App Control for Business est la référence.'),
  M('i11-ev2', 'eval', 'securiser', c3, 'Règles sûres', 'Cochez les bonnes pratiques Device Control dans Intune.', [['Règles Allow et Deny sans recoupement.', 'Ordre non conservé.'], ['Retirer les GPO en conflit.', 'Évite les conflits.']], [['Compter sur l’ordre des règles.', 'Non conservé.'], ['Auditer seul sans règle.', 'Hérite du défaut.']], 'Sans recoupement et sans conflit.'),
  a.order({ id: 'i11-ev3', title: 'Valider Device Control', comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'fonctionner', lesson: 'i11-l3',
    st: 'Ordonnez la validation de Device Control.',
    items: [['s1', 'Définir les groupes'], ['s2', 'Définir les règles sans recoupement'], ['s3', 'Déployer sur un appareil de test'], ['s4', 'Vérifier l’état avec Get-MpComputerStatus'], ['s5', 'Tester avec un support puis lire les événements']], correct: ['s1', 's2', 's3', 's4', 's5'],
    exp: 'Groupes, règles, test, état puis événements.' }),
  a.fix({ id: 'i11-ev4', title: 'Corriger la politique d’application', comp: c1.comp, tags: c1.tags, role: 'eval', dim: 'securiser', lesson: 'i11-l1', language: 'json',
    st: 'Corrigez la politique App Control.',
    starter: JSON.stringify({ mode: 'application', installateurGere: false, politiqueSupplementaire: false }, null, 2),
    rules: [{ kind: 'equals', path: 'mode', value: 'audit', message: 'Commencer en audit.', dim: 'securiser' }, { kind: 'equals', path: 'installateurGere', value: true, message: 'Désigner l’installateur géré.', dim: 'fonctionner' }],
    solution: JSON.stringify({ mode: 'audit', installateurGere: true, politiqueSupplementaire: false }, null, 2), exp: 'Audit d’abord et installateur géré désigné.' }),
  a.match({ id: 'i11-ev5', title: 'Symptôme et cause', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'maintenir', lesson: 'i11-l2',
    st: 'Associez chaque symptôme à sa cause probable.', items: [['p1', 'Un script d’administration échoue sur des types .NET'], ['p2', 'Une application web HTA ne s’exécute plus'], ['p3', 'Une macro Office s’exécute malgré AppLocker']],
    options: [['s1', 'Il s’exécute en langage contraint'], ['s2', 'MSHTA est bloqué avec application des scripts'], ['s3', 'L’hôte n’appelle pas AppLocker']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Chaque symptôme a une cause documentée distincte.' }),
  a.workflow({ id: 'i11-ev6', title: 'Autoriser un script d’administration', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'securiser', lesson: 'i11-l2',
    st: 'Ordonnez l’autorisation d’un script d’administration.',
    blocks: [['b1', 'Signer le script'], ['b2', 'L’ajouter à la politique'], ['b3', 'Tester en audit avec la bonne version de PowerShell'], ['b4', 'Passer à l’application'], ['b5', 'Désactiver l’application des scripts partout']],
    required: ['b1', 'b2', 'b3', 'b4'], forbidden: ['b5'], before: [['b1', 'b2'], ['b2', 'b3'], ['b3', 'b4']], notes: { b5: 'Retire la protection.' }, solution: ['b1', 'b2', 'b3', 'b4'],
    exp: 'Signature, politique, audit puis application.' }),
  a.short({ id: 'i11-ev7', title: 'Option installateur géré', comp: c1.comp, tags: c1.tags, role: 'eval', dim: 'comprendre', lesson: 'i11-l1',
    st: 'Quel numéro d’option active Managed Installer dans une politique App Control ? (nombre)', accepted: ['13'], numeric: { value: 13 }, ph: 'un nombre',
    exp: 'L’option 13 (Enabled: Managed Installer) active la confiance envers l’installateur géré.' }),
  a.short({ id: 'i11-ev8', title: 'Valeur du défaut', comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'comprendre', lesson: 'i11-l3',
    st: 'Quelle valeur entière de DefaultEnforcement correspond à Deny ? (nombre)', accepted: ['2'], numeric: { value: 2 }, ph: 'un nombre',
    exp: 'La valeur 2 correspond à Deny et la valeur 1 à Allow.' }),

  a.inspect({ id: 'i11-cs1', title: 'Cas : contrôle chez Aurore Logistique', comp: c1.comp, tags: c1.tags, role: 'case', dim: 'securiser', lesson: 'i11-l1', language: 'text',
    st: 'Plan fictif. Repérez les défauts.',
    lines: [['p1', 'La politique est appliquée dès la première semaine, sans audit.', { ok: 'a1', fixes: [['a1', 'Auditer d’abord'], ['a2', 'Accepter']] }], ['p2', 'Des applications métier non signées sont prévues telles quelles.', { ok: 'b1', fixes: [['b1', 'Signer ou utiliser des catalogues signés'], ['b2', 'Accepter']] }], ['p3', 'On compte sur AppLocker pour de nouveaux projets.', { ok: 'c1', fixes: [['c1', 'Préférer App Control for Business'], ['c2', 'Accepter']] }]],
    exp: 'Trois défauts : pas d’audit, applications non signées et technologie héritée.' }),
  a.workflow({ id: 'i11-cs2', title: 'Cas : supports amovibles', comp: c3.comp, tags: c3.tags, role: 'case', dim: 'securiser', lesson: 'i11-l3',
    st: 'Ordonnez le déploiement du contrôle des supports.',
    blocks: [['t1', 'Auditer sans bloquer'], ['t2', 'Identifier les clés légitimes'], ['t3', 'Écrire des règles sans recoupement'], ['t4', 'Tester sur un pilote'], ['t5', 'Étendre par vagues'], ['t6', 'Bloquer tout sans inventaire']],
    required: ['t1', 't2', 't3', 't4', 't5'], forbidden: ['t6'], before: [['t1', 't2'], ['t2', 't3'], ['t3', 't4'], ['t4', 't5']], notes: { t6: 'Bloque les usages légitimes.' }, solution: ['t1', 't2', 't3', 't4', 't5'],
    exp: 'Audit, inventaire, règles, pilote puis vagues.' }),
  a.match({ id: 'i11-cs3', title: 'Cas : choisir l’outil', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'maintenir', lesson: 'i11-l2',
    st: 'Associez chaque besoin à l’outil.', items: [['p1', 'Empêcher un exécutable inconnu de s’exécuter'], ['p2', 'Interdire l’écriture sur clé USB'], ['p3', 'Limiter les macros Office']],
    options: [['s1', 'App Control for Business'], ['s2', 'Device Control'], ['s3', 'Sécurité d’Office (macros signées)']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Trois besoins, trois contrôles différents.' }),
  a.open({ id: 'i11-cs-open', title: 'Cas : stratégie d’exécution contrôlée', comp: c3.comp, tags: c3.tags, role: 'case', dim: 'maintenir', lesson: 'i11-l3',
    st: 'Rédigez la stratégie de contrôle des applications, scripts et périphériques d’une organisation fictive.',
    deliverable: 'Un document : choix App Control ou AppLocker, audit, installateur géré, scripts, Device Control, exceptions et retour arrière.',
    rubric: [['r1', 'Le choix technologique est justifié.', 'comprendre'], ['r2', 'L’audit précède l’application.', 'fonctionner'], ['r3', 'Les limites des scripts sont nommées.', 'securiser'], ['r4', 'Les règles Device Control sont sans recoupement.', 'securiser'], ['r5', 'Un retour arrière est prévu.', 'maintenir']],
    exp: 'Pas de note automatique : on juge la cohérence de la stratégie.' }),

  Q('i11-rm1', 'remediation', 'comprendre', c1, 'Remédiation : audit', 'Pourquoi commencer en audit ?', ['Pour voir ce qui serait bloqué sans bloquer.', 'Mesure préalable.'], [['Pour accélérer.', 'Faux.'], ['Pour la licence.', 'Faux.'], ['Aucune raison.', 'Faux.']], 'L’audit mesure l’effet sans bloquer.'),
  Q('i11-rm2', 'remediation', 'fonctionner', c2, 'Remédiation : contraint', 'Pourquoi un script non autorisé peut-il tout de même s’exécuter ?', ['L’hôte le fait tourner en langage contraint.', 'Comportement documenté.'], [['Parce qu’il est signé.', 'Faux.'], ['Parce que la politique est désactivée.', 'Pas forcément.'], ['Aucune raison.', 'Faux.']], 'L’hôte applique le langage contraint.'),
  Q('i11-rm3', 'remediation', 'securiser', c3, 'Remédiation : recoupement', 'Pourquoi éviter les règles qui se recoupent ?', ['Intune ne conserve pas l’ordre.', 'Résultat imprévisible.'], [['Pour la vitesse.', 'Faux.'], ['Pour la licence.', 'Faux.'], ['Aucune raison.', 'Faux.']], 'L’ordre n’est pas garanti.'),
];

const competencies: AiCompetency[] = [
  { id: 'i11-c1', module: 'i11', name: 'Contrôler les applications', description: 'App Control, AppLocker, installateur géré.', criteria: [{ id: 'i11-c1-1', text: 'Je justifie le choix de la technologie.' }, { id: 'i11-c1-2', text: 'Je déploie en audit avant d’appliquer.' }, { id: 'i11-c1-3', text: 'Je configure l’installateur géré.' }] },
  { id: 'i11-c2', module: 'i11', name: 'Contrôler les scripts', description: 'Langage contraint, hôtes, limites.', criteria: [{ id: 'i11-c2-1', text: 'Je décris le langage contraint.' }, { id: 'i11-c2-2', text: 'Je nomme les limites d’AppLocker.' }, { id: 'i11-c2-3', text: 'Je protège les scripts d’administration.' }] },
  { id: 'i11-c3', module: 'i11', name: 'Contrôler les périphériques', description: 'Device Control, règles, défaut.', criteria: [{ id: 'i11-c3-1', text: 'Je définis la portée réelle.' }, { id: 'i11-c3-2', text: 'J’écris des règles sans recoupement.' }, { id: 'i11-c3-3', text: 'Je valide par un test.' }] },
];

const projects: AiProject[] = [
  { id: 'i11-p1', module: 'i11', level: 'débutant', title: 'Tableau de choix technologique', problem: 'Choisir App Control, AppLocker ou un autre contrôle pour six besoins fictifs.', architecture: 'Tableau d’une page.', tools: ['Tableur'], data: 'Besoins fictifs.', steps: ['Lister les besoins.', 'Choisir le contrôle.', 'Justifier.'], success: ['Chaque choix est justifié.'], risks: ['Confondre scripts et macros.'], extensions: ['Ajouter les licences.'] },
  { id: 'i11-p2', module: 'i11', level: 'intermédiaire', title: 'Plan d’audit à application', problem: 'Concevoir le plan qui mène une politique App Control de l’audit à l’application, avec exceptions.', architecture: 'Plan par étapes avec critères.', tools: ['Éditeur de texte'], data: 'Parc fictif.', steps: ['Désigner l’installateur géré.', 'Planifier l’audit.', 'Écrire les critères de sortie.', 'Prévoir le retour arrière.'], success: ['Chaque étape a un critère.'], risks: ['Application trop tôt.'], extensions: ['Ajouter les requêtes Advanced Hunting.'],
    connected: { accounts: 'Un locataire de test avec Intune et une machine Windows de test.', permissions: 'Endpoint Security Manager dans le locataire de test.', costs: 'Licences de test.', secrets: 'Aucun secret requis.', cleanup: 'Retirer les politiques de test et restaurer la machine.', limits: 'Facultatif : ne passez jamais en application sur une machine que vous ne pouvez pas restaurer.' } },
  { id: 'i11-p3', module: 'i11', level: 'avancé', title: 'Politique Device Control sans recoupement', problem: 'Concevoir une politique Device Control complète avec groupes, règles, défaut et validation.', architecture: 'Politique documentée avec tests.', tools: ['Éditeur de texte'], data: 'Groupes fictifs.', steps: ['Définir les groupes.', 'Écrire les règles.', 'Choisir le défaut.', 'Écrire les tests.'], success: ['Aucun recoupement.'], risks: ['Défaut Deny imprévu.'], extensions: ['Ajouter un rapport.'] },
];

export const i11 = assemble({ id: 'i11', level: 4, n: 11, title: 'Applications, scripts et périphériques',
  summary: 'App Control for Business, AppLocker, contrôle des scripts, Device Control et supports amovibles, avec audit préalable et limites assumées.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Contrôler l’exécution chez Aurore Logistique',
  caseScenario: 'Vous planifiez le contrôle des applications, des scripts et des supports amovibles. Actions simulées.', caseMinutes: 45 });
