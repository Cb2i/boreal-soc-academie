// Module 8 : Comptes et identifiants (niveau 3).
import type { AiCompetency, AiLesson, AiProject } from '../../agentic/types.ts';
import { assemble } from '../assemble.ts';
import { kit } from '../kit.ts';
import { sref } from '../sources.ts';

const md = (...lines: string[]) => lines.join('\n');
const { a, Q, M } = kit('i08');
const c1 = { comp: 'i08-c1', lesson: 'i08-l1', tags: ['windows-laps', 'groupes-locaux', 'audit-mot-de-passe'] };
const c2 = { comp: 'i08-c2', lesson: 'i08-l2', tags: ['windows-hello', 'credential-guard', 'prerequis-materiel'] };
const c3 = { comp: 'i08-c3', lesson: 'i08-l3', tags: ['epm', 'licence-supplementaire', 'regles-elevation'] };

const l1: AiLesson = {
  id: 'i08-l1', module: 'i08', title: 'Windows LAPS et groupes locaux : mot de passe unique par poste, accès tracé', minutes: 50,
  summary: 'Déployer Windows LAPS avec Intune, contrôler qui lit les mots de passe et verrouiller les groupes locaux d’administration.',
  objectives: ['Configurer une politique Windows LAPS et choisir le répertoire de sauvegarde.', 'Attribuer le droit de lecture du mot de passe au bon rôle et auditer chaque lecture.', 'Utiliser le profil de groupes locaux pour limiter les administrateurs.'],
  prerequisites: ['Modules 2 et 7'],
  body: md(
    '## Le problème que LAPS résout',
    'Chaque appareil Windows possède un compte administrateur local intégré. Si son mot de passe est identique partout, un attaquant qui le vole sur un poste se déplace latéralement vers tous les autres (attaques de type pass-the-hash). **Windows LAPS** génère un mot de passe aléatoire par appareil, le **sauvegarde** dans un répertoire et le **fait pivoter** régulièrement. Il gère aussi le compte du mode de restauration des services d’annuaire sur les contrôleurs de domaine, mais ceux-ci ne se gèrent jamais par CSP.',
    '## Configurer avec Intune',
    'Dans **Endpoint security > Protection des comptes**, profil **Local admin password solution (Windows LAPS)**. Windows LAPS gère **un seul compte administrateur local** par appareil, désigné par le réglage *Administrator Account Name*. Réglages usuels : âge du mot de passe en jours, longueur, complexité (ou phrase de passe), actions après authentification (rotation après usage du compte), et **gestion automatique du compte** (création et activation d’un compte géré). Choisissez **un seul répertoire de sauvegarde** : **Microsoft Entra ID** ou **Active Directory local**, jamais les deux, et il doit correspondre au type de jointure (une politique pointant vers Active Directory sur un appareil non joint au domaine est acceptée mais ne fonctionne pas). Le CSP d’Intune prend le dessus sur d’autres sources de gestion LAPS, y compris l’ancien LAPS.',
    '## Prérequis et exclusions',
    'Versions prises en charge du CSP : Windows 11 22H2 (build 22621.1555 ou plus récent, avec KB5025239), Windows 11 21H2 (22000.1817 ou plus récent, KB5025224) et Windows 10 22H2 (19045.2846 ou plus récent, KB5025221). **Les appareils simplement enregistrés dans Entra ne sont pas pris en charge**, et LAPS n’existe pas sur les plateformes non Windows. Une politique peut prendre jusqu’à environ une heure avant que le mot de passe change.',
    '## Lire un mot de passe : droits et audit',
    'Lire le mot de passe exige l’action `microsoft.directory/deviceLocalCredentials/password/read`. Par défaut, les rôles **Cloud Device Administrator** et **Intune Administrator** l’ont. **Helpdesk Administrator**, **Security Administrator** et **Security Reader** ne lisent que les **métadonnées** (dernière et prochaine rotation). Les rôles personnalisés et les unités administratives permettent d’affiner. L’API Graph renvoie le mot de passe encodé en Base64, à décoder avant usage. Les journaux d’audit Entra consignent trois événements : rotation automatique par politique, rotation manuelle par action d’appareil, et **demande de consultation du mot de passe** (activités « Update device local administrator password » et « Recover device local administrator password »). Des politiques d’accès conditionnel peuvent aussi protéger les rôles qui ont le droit de lecture.',
    '## Rotation avant l’échéance',
    'On peut faire pivoter le mot de passe avec `Reset-LapsPassword` sur l’appareil, avec l’action d’exécution ResetPassword du CSP, avec l’action d’appareil d’Intune, ou automatiquement quand le compte géré sert à s’authentifier. Après une intervention de soutien, la rotation après usage est la bonne pratique.',
    '## Groupes locaux',
    'Le profil **Local user group membership** ajoute, retire ou remplace les membres des groupes locaux intégrés. Avec le mode de remplacement, on verrouille le groupe Administrateurs sur une liste exclusive. Attention : remplacer sans inventaire peut retirer le compte du soutien ou un compte de service ; pilotez toujours et gardez un chemin d’accès d’urgence.',
  ),
  demo: { title: 'Qui lit les mots de passe', body: md(
    'Tableau **fictif** :',
    '```text',
    'Rôle                  Lire le mot de passe   Lire les métadonnées',
    'Cloud Device Admin    Oui                    Oui',
    'Helpdesk Admin        Non                    Oui',
    'Security Reader       Non                    Oui',
    '```',
    '**Lecture commentée.** Le soutien de niveau 1 voit l’état de rotation sans pouvoir lire le mot de passe.',
    '**Ce que la démo ne prouve pas.** Aucun appareil n’a été consulté.') },
  guided: 'i08-g1', autonomous: 'i08-a1', quiz: ['i08-q1a', 'i08-q1b', 'i08-q1c'],
  revision: md('## Fiche : LAPS et groupes locaux', '- Un compte administrateur local par appareil ; un répertoire : Entra ou Active Directory.', '- Appareils enregistrés dans Entra et non-Windows : non pris en charge.', '- Lecture du mot de passe : rôle explicite ; métadonnées pour le soutien.', '- Auditer rotation et consultation.', '- Groupes locaux : le mode de remplacement exige inventaire et pilote.'),
  links: [sref('intune-laps'), sref('intune-laps-monitor'), sref('entra-laps'), sref('win-laps-policy'), sref('intune-account-protection')], teaches: ['windows-laps', 'groupes-locaux', 'audit-mot-de-passe'],
};

const l2: AiLesson = {
  id: 'i08-l2', module: 'i08', title: 'Windows Hello Entreprise et Credential Guard : politique, matériel et preuves', minutes: 45,
  summary: 'Déployer l’authentification sans mot de passe et la protection des identifiants avec leurs prérequis matériels.',
  objectives: ['Choisir entre politique de locataire et politique ciblée pour Windows Hello Entreprise.', 'Énoncer les prérequis matériels de Credential Guard et ses modes de verrouillage.', 'Ne pas déduire l’efficacité du seul statut de la politique.'],
  prerequisites: ['Leçon 1'],
  body: md(
    '## Windows Hello Entreprise',
    'Windows Hello Entreprise remplace les mots de passe par une authentification forte liée à l’appareil (NIP ou biométrie protégés par le TPM). Dans Intune, plusieurs voies existent : la **politique à l’échelle du locataire**, appliquée **seulement à l’enrôlement** (un changement ne touche pas les appareils déjà inscrits et elle s’applique à **tous** les appareils qui s’inscrivent : on la désactive souvent et on cible plutôt un groupe), ou une **politique de configuration** appliquée après l’enrôlement et mise à jour à chaque cycle d’actualisation (catalogue de paramètres, bases de référence, politique personnalisée par le CSP PassportForWork, **politique Account protection**). Le profil Account protection d’Endpoint security est le seul modèle de profil créable pour les nouvelles instances ; les anciens modèles « Identity protection » et « Account protection (Preview) » ont été retirés de la création en juillet 2024 mais les instances existantes restent modifiables. Les réglages sont aussi dans le catalogue.',
    '## Réglages et pièges',
    'On peut exiger la présence d’un dispositif de sécurité matériel, fixer la longueur du NIP, autoriser des gestes (empreinte) et activer les **clés de sécurité** pour la connexion (Windows 10 1903 ou plus récent, ou Windows 11). Piège documenté : à cause de la façon dont Intune détermine l’étendue du réglage, l’appareil peut consigner l’**événement 454**, qu’on peut ignorer quand la politique s’applique avec succès. Un point de conception : bloquer Windows Hello par erreur dans une politique d’inscription de locataire empêche son approvisionnement pour tous.',
    '## Credential Guard',
    'Credential Guard utilise l’hyperviseur Windows pour isoler les secrets d’authentification. Il exige un **matériel** qui prend en charge **Secure Boot** et la protection **DMA** ; sur un appareil qui ne remplit pas ces conditions, le réglage échoue. Deux modes : **activé avec verrou UEFI** (impossible de le désactiver à distance : la configuration persistante UEFI doit être effacée manuellement) et **activé sans verrou UEFI** (peut être désactivé sans accès physique). Le verrou renforce la sécurité mais complique un retour arrière : à réserver aux postes pilotes validés. Le défaut de « Non configuré » est le comportement par défaut de Windows, donc ne comptez pas dessus.',
    '## Preuves',
    'Un statut de réussite Intune prouve la réception. Pour l’efficacité : la présence d’un provisionnement Windows Hello sur l’appareil et l’état de Credential Guard rapporté par le système (par exemple dans les informations système), à vérifier sur un échantillon. Dans le parcours sans locataire, ces vérifications sont simulées à partir de sorties fictives et ne comptent pas comme une validation réelle.',
  ),
  demo: { title: 'Choisir le verrou', body: md(
    'Décision **fictive** :',
    '```text',
    'Postes pilotes validés : Credential Guard avec verrou UEFI',
    'Parc général           : sans verrou, puis verrou après 3 mois',
    'Matériel non conforme  : exclusion documentée',
    '```',
    '**Lecture commentée.** Le verrou n’est posé qu’après validation matérielle, pour garder un retour arrière.',
    '**Ce que la démo ne prouve pas.** Aucun matériel n’a été testé.') },
  guided: 'i08-g2', autonomous: 'i08-a2', quiz: ['i08-q2a', 'i08-q2b', 'i08-q2c'],
  revision: md('## Fiche : Hello et Credential Guard', '- Politique de locataire : seulement à l’enrôlement et pour tous ; préférer un ciblage.', '- Account protection : seul modèle de nouvelle instance depuis juillet 2024.', '- Événement 454 ignorable si la politique s’applique.', '- Credential Guard : Secure Boot et DMA ; verrou UEFI = retour arrière manuel.', '- Statut de réussite n’est pas preuve d’efficacité.'),
  links: [sref('win-hello-configure'), sref('intune-account-protection'), sref('intune-settings-catalog'), sref('intune-baselines')], teaches: ['windows-hello', 'credential-guard', 'prerequis-materiel'],
};

const l3: AiLesson = {
  id: 'i08-l3', module: 'i08', title: 'Endpoint Privilege Management : moindre privilège avec une licence supplémentaire', minutes: 50,
  summary: 'Permettre l’élévation ciblée à des utilisateurs standards, en connaissant le coût de licence et les risques des règles.',
  objectives: ['Situer EPM comme une fonction complémentaire sous licence.', 'Choisir une réponse d’élévation par défaut sûre.', 'Écrire des règles d’élévation sans créer de contournement.'],
  prerequisites: ['Leçons 1 et 2'],
  body: md(
    '## Ce qu’est EPM et ce qu’il coûte',
    'Endpoint Privilege Management (EPM) permet aux utilisateurs de travailler **sans droits administrateur** et d’élever **juste-à-temps** des fichiers précis approuvés par le service informatique (installations, pilotes, diagnostics). Chaque élévation est journalisée avec des métadonnées. **Nature : fonction complémentaire sous licence supplémentaire.** Il faut licencier EPM dans le locataire, seul ou dans la suite Intune ; les offres changent, donc validez la page des fonctions avancées à chaque révision. Windows seulement. Sont pris en charge notamment les machines virtuelles à session unique d’Azure Virtual Desktop et Windows 365 (voir la FAQ).',
    '## Deux politiques',
    'La **politique de paramètres d’élévation** active EPM sur l’appareil, fixe la **réponse par défaut** pour tout fichier sans règle et configure les données envoyées pour les rapports. Ses paramètres sont **à portée appareil** : ils s’appliquent à tous les utilisateurs de l’appareil, même si on l’affecte à un groupe d’utilisateurs. N’affectez donc pas des politiques différentes à des groupes d’utilisateurs pour faire basculer la réponse par défaut selon l’utilisateur. La **politique de règles d’élévation** identifie des fichiers ou scripts précis et l’action associée ; une politique accepte jusqu’à **100 règles**. Les fichiers pris en charge sont les exécutables `.exe`, les installateurs `.msi` et les scripts PowerShell `.ps1`.',
    '## Recommandations de sécurité',
    'Fixez la réponse par défaut à **Exiger l’approbation du soutien** ou **Refuser** plutôt que « confirmation par l’utilisateur », pour que seules les règles connues élèvent. **Exigez un chemin de fichier** dans toute règle, vers un emplacement que les utilisateurs standards ne peuvent pas modifier, pour éviter le remplacement d’un binaire avant élévation ; les **partages réseau ne sont pas pris en charge**. **Distinguez installateur et exécution** : serrez l’élévation des installateurs et minimisez celle de l’exécution. Soyez plus strict pour les applications à large accès (navigateurs, PowerShell : règles propres aux scripts). **Méfiance avec les certificats** : une règle par certificat laisse élever toute application signée par ce certificat, risqué si un éditeur signe tout avec le même. **Commencez par l’audit**, créez ensuite des règles à partir des rapports, et profitez de l’élévation approuvée par le soutien, même en migrant d’un autre produit.',
    '## Limites à ne pas oublier',
    'EPM **ne gère pas** les demandes des utilisateurs qui sont déjà administrateurs : le lancement se fait normalement et est rapporté comme élévation non gérée. Si la politique de paramètres affiche erreur ou non applicable, les causes courantes sont des mises à jour Windows manquantes ou l’impossibilité de joindre les points de terminaison Intune d’EPM. EPM et App Control for Business (module 11) se **complètent** : EPM autorise l’élévation, App Control décide quelles applications peuvent s’exécuter. EPM n’est pas non plus la protection de l’administrateur de Windows, qui protège les comptes administrateurs contre le vol de jetons.',
  ),
  demo: { title: 'Une règle d’élévation prudente', body: md(
    'Règle **fictive** :',
    '```text',
    'Fichier        : installateur_vpn.msi',
    'Chemin         : C:\\Program Files\\Outils\\ (non modifiable par les utilisateurs)',
    'Type           : confirmation par l’utilisateur avec justification',
    'Défaut global  : Refuser',
    '```',
    '**Lecture commentée.** Un fichier précis, un chemin sûr et un défaut restrictif.',
    '**Ce que la démo ne prouve pas.** Aucune élévation n’a été exécutée.') },
  guided: 'i08-g3', autonomous: 'i08-a3', quiz: ['i08-q3a', 'i08-q3b', 'i08-q3c'],
  revision: md('## Fiche : EPM', '- Fonction complémentaire sous licence supplémentaire, Windows.', '- Paramètres à portée appareil ; défaut Refuser ou approbation du soutien.', '- Règles : chemin non modifiable, pas de partage réseau, 100 règles par politique.', '- Certificat = toute application signée : prudence.', '- Utilisateurs déjà administrateurs : élévation non gérée.'),
  links: [sref('intune-epm-overview'), sref('intune-epm-planning'), sref('intune-epm-settings'), sref('intune-epm-faq'), sref('intune-addons')], teaches: ['epm', 'licence-supplementaire', 'regles-elevation'],
};

const exercises = [
  a.match({ id: 'i08-g1', title: 'Rôle et droit', comp: c1.comp, tags: c1.tags, role: 'guided', dim: 'comprendre', lesson: 'i08-l1',
    st: 'Associez chaque rôle à ce qu’il peut faire avec LAPS.', items: [['p1', 'Cloud Device Administrator'], ['p2', 'Helpdesk Administrator'], ['p3', 'Security Reader']],
    options: [['s1', 'Lire le mot de passe et les métadonnées'], ['s2', 'Lire seulement les métadonnées'], ['s3', 'Lire seulement les métadonnées sans autre droit LAPS']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Seul Cloud Device Administrator (et Intune Administrator) lit le mot de passe par défaut.' }),
  a.config({ id: 'i08-a1', title: 'Politique LAPS', comp: c1.comp, tags: c1.tags, role: 'autonomous', dim: 'securiser', lesson: 'i08-l1',
    st: 'Paramétrez Windows LAPS pour des appareils joints à Entra.',
    fields: [
      { id: 'dir', label: 'Répertoire de sauvegarde', kind: 'select', options: [{ id: 'entra', label: 'Microsoft Entra ID' }, { id: 'ad', label: 'Active Directory local' }, { id: 'both', label: 'Les deux' }], accept: ['entra'], why: 'Un seul répertoire, adapté à la jointure.' },
      { id: 'rot', label: 'Rotation après usage du compte', kind: 'toggle', accept: ['on'], why: 'Un mot de passe utilisé est connu.' },
      { id: 'audit', label: 'Auditer les consultations', kind: 'toggle', accept: ['on'], why: 'Lecture sensible.' },
    ], solution: { dir: 'entra', rot: 'on', audit: 'on' }, exp: 'Entra pour des appareils joints à Entra, rotation après usage et audit.' }),
  Q('i08-q1a', 'quiz', 'comprendre', c1, 'Répertoire', 'Peut-on sauvegarder vers Entra et Active Directory à la fois ?', ['Non, un seul répertoire à la fois.', 'Selon la jointure.'], [['Oui, toujours.', 'Faux.'], ['Seulement la nuit.', 'Faux.'], ['Seulement sur macOS.', 'Faux.']], 'Windows LAPS utilise un seul répertoire.'),
  Q('i08-q1b', 'quiz', 'fonctionner', c1, 'Appareils enregistrés', 'Windows LAPS avec Entra est-il pris en charge sur un appareil seulement enregistré dans Entra ?', ['Non.', 'Jointure Entra ou hybride requise.'], [['Oui.', 'Faux.'], ['Seulement Windows 10.', 'Faux.'], ['Seulement les serveurs.', 'Faux.']], 'Les appareils simplement enregistrés ne sont pas pris en charge.'),
  Q('i08-q1c', 'quiz', 'maintenir', c1, 'Audit', 'Quel événement d’audit est le plus sensible ?', ['La demande de consultation du mot de passe.', 'À surveiller.'], [['La rotation automatique.', 'Moins sensible.'], ['La synchronisation.', 'Non.'], ['La connexion au portail.', 'Non.']], 'La consultation expose un secret.'),

  a.match({ id: 'i08-g2', title: 'Mode et conséquence', comp: c2.comp, tags: c2.tags, role: 'guided', dim: 'comprendre', lesson: 'i08-l2',
    st: 'Associez chaque mode de Credential Guard à sa conséquence.', items: [['p1', 'Activé avec verrou UEFI'], ['p2', 'Activé sans verrou UEFI'], ['p3', 'Matériel sans Secure Boot']],
    options: [['s1', 'Impossible de désactiver à distance'], ['s2', 'Peut être désactivé sans accès physique'], ['s3', 'Le réglage échoue']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Le verrou rend le retour arrière manuel, et le matériel insuffisant fait échouer le réglage.' }),
  a.workflow({ id: 'i08-a2', title: 'Déployer Credential Guard', comp: c2.comp, tags: c2.tags, role: 'autonomous', dim: 'securiser', lesson: 'i08-l2',
    st: 'Ordonnez le déploiement de Credential Guard.',
    blocks: [['b1', 'Inventorier le matériel (Secure Boot, DMA)'], ['b2', 'Activer sans verrou sur un pilote'], ['b3', 'Vérifier l’état sur l’appareil'], ['b4', 'Étendre par vagues'], ['b5', 'Poser le verrou après validation'], ['b6', 'Activer le verrou UEFI partout sans pilote']],
    required: ['b1', 'b2', 'b3', 'b4', 'b5'], forbidden: ['b6'], before: [['b1', 'b2'], ['b2', 'b3'], ['b3', 'b4'], ['b4', 'b5']], notes: { b6: 'Retour arrière manuel sur tout le parc.' }, solution: ['b1', 'b2', 'b3', 'b4', 'b5'],
    exp: 'Matériel, pilote sans verrou, vérification, vagues puis verrou.' }),
  Q('i08-q2a', 'quiz', 'comprendre', c2, 'Locataire', 'Quand la politique Hello de locataire s’applique-t-elle ?', ['À l’enrôlement seulement, à tous les appareils qui s’inscrivent.', 'Pas rétroactive.'], [['À chaque synchronisation.', 'Faux.'], ['Jamais.', 'Faux.'], ['Seulement aux serveurs.', 'Faux.']], 'Elle s’applique à l’enrôlement.'),
  Q('i08-q2b', 'quiz', 'fonctionner', c2, 'Événement 454', 'Que faire d’un événement 454 quand la politique réussit ?', ['Il peut être ignoré.', 'Selon la documentation.'], [['Réinstaller Windows.', 'Faux.'], ['Désactiver Hello.', 'Faux.'], ['Supprimer l’appareil.', 'Faux.']], 'L’événement 454 est sans conséquence quand la politique s’applique.'),
  Q('i08-q2c', 'quiz', 'maintenir', c2, 'Preuve', 'Que prouve un statut de réussite de Credential Guard ?', ['La réception, pas l’état réel de l’isolation.', 'Vérifier sur un échantillon.'], [['Que l’isolation est active.', 'Pas garanti.'], ['Que le matériel est neuf.', 'Faux.'], ['Rien.', 'Faux.']], 'Il faut vérifier l’état réel.'),

  a.match({ id: 'i08-g3', title: 'Nature et fonction', comp: c3.comp, tags: c3.tags, role: 'guided', dim: 'comprendre', lesson: 'i08-l3',
    st: 'Associez chaque fonction à sa nature.', items: [['p1', 'EPM'], ['p2', 'Windows LAPS'], ['p3', 'Local user group membership']],
    options: [['s1', 'Licence supplémentaire'], ['s2', 'Fonction Windows gérée nativement par Intune'], ['s3', 'Profil Endpoint security natif']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'EPM exige une licence supplémentaire, LAPS et les groupes locaux sont natifs.' }),
  a.inspect({ id: 'i08-a3', title: 'Relire des règles EPM', comp: c3.comp, tags: c3.tags, role: 'autonomous', dim: 'securiser', lesson: 'i08-l3', language: 'text',
    st: 'Règles fictives. Repérez les défauts.',
    lines: [['p1', 'La réponse par défaut est « confirmation par l’utilisateur ».', { ok: 'a1', fixes: [['a1', 'Passer à Refuser ou approbation du soutien'], ['a2', 'Accepter']] }], ['p2', 'La règle vise un fichier sur un partage réseau.', { ok: 'b1', fixes: [['b1', 'Utiliser un chemin local non modifiable'], ['b2', 'Accepter']] }], ['p3', 'Une règle par certificat d’un éditeur qui signe tout.', { ok: 'c1', fixes: [['c1', 'Utiliser le hachage ou des métadonnées précises'], ['c2', 'Accepter']] }]],
    exp: 'Défaut permissif, partage réseau et certificat trop large sont trois défauts.' }),
  Q('i08-q3a', 'quiz', 'comprendre', c3, 'Portée', 'Quelle est la portée des paramètres d’élévation ?', ['L’appareil : tous les utilisateurs de l’appareil.', 'Même affectés à des utilisateurs.'], [['Chaque utilisateur séparément.', 'Faux.'], ['Le locataire.', 'Faux.'], ['Le groupe seulement.', 'Faux.']], 'Les paramètres sont à portée appareil.'),
  Q('i08-q3b', 'quiz', 'fonctionner', c3, 'Administrateurs', 'Que fait EPM pour un utilisateur déjà administrateur ?', ['Rien : le lancement est normal, rapporté comme élévation non gérée.', 'Documenté.'], [['Il bloque.', 'Faux.'], ['Il supprime ses droits.', 'Faux.'], ['Il chiffre le fichier.', 'Faux.']], 'Les administrateurs ne passent pas par EPM.'),
  Q('i08-q3c', 'quiz', 'maintenir', c3, 'Licence', 'Que faire avant de promettre EPM à une direction ?', ['Vérifier la licence et la page des fonctions avancées.', 'Fonction sous licence.'], [['Rien : inclus partout.', 'Faux.'], ['L’activer sans vérifier.', 'Faux.'], ['Attendre un an.', 'Faux.']], 'EPM exige une licence supplémentaire.'),

  Q('i08-ev1', 'eval', 'comprendre', c1, 'Menace', 'Quelle attaque LAPS aide-t-il à contrer ?', ['Le mouvement latéral par réutilisation du mot de passe administrateur local.', 'Pass-the-hash.'], [['Le hameçonnage.', 'Autre.'], ['Le rançongiciel seulement.', 'Faux.'], ['Les pannes.', 'Faux.']], 'LAPS limite le mouvement latéral.'),
  M('i08-ev2', 'eval', 'securiser', c2, 'Credential Guard', 'Cochez les prérequis ou précautions de Credential Guard.', [['Secure Boot et protection DMA.', 'Prérequis matériels.'], ['Pilote avant le verrou UEFI.', 'Retour arrière.']], [['Verrou UEFI partout sans pilote.', 'Risque.'], ['Aucun prérequis.', 'Faux.']], 'Matériel et pilote.'),
  a.order({ id: 'i08-ev3', title: 'Déployer EPM', comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'fonctionner', lesson: 'i08-l3',
    st: 'Ordonnez le déploiement d’EPM.',
    items: [['s1', 'Licencier et planifier'], ['s2', 'Déployer la politique de paramètres en audit'], ['s3', 'Créer des règles à partir des rapports'], ['s4', 'Passer au défaut restrictif'], ['s5', 'Surveiller et réviser']], correct: ['s1', 's2', 's3', 's4', 's5'],
    exp: 'Licence, audit, règles, défaut restrictif puis suivi.' }),
  a.fix({ id: 'i08-ev4', title: 'Corriger LAPS', comp: c1.comp, tags: c1.tags, role: 'eval', dim: 'securiser', lesson: 'i08-l1', language: 'json',
    st: 'Corrigez : un seul répertoire et audit actif.',
    starter: JSON.stringify({ repertoire: 'entra-et-ad', rotationApresUsage: 'non', audit: 'aucun' }, null, 2),
    rules: [{ kind: 'equals', path: 'repertoire', value: 'entra', message: 'Choisir un seul répertoire.', dim: 'securiser' }, { kind: 'equals', path: 'rotationApresUsage', value: 'oui', message: 'Activer la rotation après usage.', dim: 'securiser' }, { kind: 'equals', path: 'audit', value: 'consultations', message: 'Auditer les consultations.', dim: 'maintenir' }],
    solution: JSON.stringify({ repertoire: 'entra', rotationApresUsage: 'oui', audit: 'consultations' }, null, 2), exp: 'Un répertoire, rotation après usage et audit des consultations.' }),
  a.match({ id: 'i08-ev5', title: 'Symptôme et cause', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'maintenir', lesson: 'i08-l2',
    st: 'Associez chaque symptôme à sa cause probable.', items: [['p1', 'Windows Hello ne s’approvisionne pas'], ['p2', 'Credential Guard échoue sur certains postes'], ['p3', 'Changement de politique de locataire sans effet sur le parc']],
    options: [['s1', 'Hello bloqué dans une politique d’inscription ou ciblée'], ['s2', 'Matériel sans Secure Boot ou DMA'], ['s3', 'La politique de locataire ne s’applique qu’à l’enrôlement']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Blocage de politique, matériel insuffisant et application à l’enrôlement expliquent ces symptômes.' }),
  a.workflow({ id: 'i08-ev6', title: 'Verrouiller le groupe Administrateurs', comp: c1.comp, tags: c1.tags, role: 'eval', dim: 'securiser', lesson: 'i08-l1',
    st: 'Ordonnez le verrouillage du groupe Administrateurs local.',
    blocks: [['b1', 'Inventorier les membres actuels'], ['b2', 'Définir la liste exclusive'], ['b3', 'Piloter le mode de remplacement'], ['b4', 'Vérifier les accès d’urgence'], ['b5', 'Remplacer sur tout le parc sans inventaire']],
    required: ['b1', 'b2', 'b3', 'b4'], forbidden: ['b5'], before: [['b1', 'b2'], ['b2', 'b3'], ['b3', 'b4']], notes: { b5: 'Peut retirer des comptes nécessaires.' }, solution: ['b1', 'b2', 'b3', 'b4'],
    exp: 'Inventaire, liste, pilote puis vérification des accès d’urgence.' }),
  a.short({ id: 'i08-ev7', title: 'Règles par politique', comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'comprendre', lesson: 'i08-l3',
    st: 'Combien de règles d’élévation une politique accepte-t-elle au maximum ? (nombre)', accepted: ['100'], numeric: { value: 100 }, ph: 'un nombre',
    exp: 'Une politique de règles d’élévation accepte jusqu’à 100 règles.' }),
  a.short({ id: 'i08-ev8', title: 'Longueur maximale', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'comprendre', lesson: 'i08-l1',
    st: 'Quelle année la création des anciens modèles Identity protection et Account protection (Preview) a-t-elle été retirée ? (année)', accepted: ['2024'], numeric: { value: 2024 }, ph: 'une année',
    exp: 'La création des anciens modèles a été retirée en juillet 2024.' }),

  a.inspect({ id: 'i08-cs1', title: 'Cas : comptes chez Aurore Logistique', comp: c1.comp, tags: c1.tags, role: 'case', dim: 'securiser', lesson: 'i08-l1', language: 'text',
    st: 'Plan fictif. Repérez les défauts.',
    lines: [['p1', 'Tout le soutien lit les mots de passe LAPS.', { ok: 'a1', fixes: [['a1', 'Limiter le droit de lecture et auditer'], ['a2', 'Accepter']] }], ['p2', 'Le mot de passe administrateur local est le même partout.', { ok: 'b1', fixes: [['b1', 'Déployer LAPS avec rotation'], ['b2', 'Accepter']] }], ['p3', 'LAPS est prévu pour des appareils simplement enregistrés dans Entra.', { ok: 'c1', fixes: [['c1', 'Exiger la jointure Entra ou hybride'], ['c2', 'Accepter']] }]],
    exp: 'Droits trop larges, mot de passe commun et appareils non pris en charge sont trois défauts.' }),
  a.workflow({ id: 'i08-cs2', title: 'Cas : Hello et Credential Guard', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'securiser', lesson: 'i08-l2',
    st: 'Ordonnez le déploiement de Windows Hello et Credential Guard.',
    blocks: [['t1', 'Choisir politique ciblée plutôt que locataire'], ['t2', 'Inventorier le matériel'], ['t3', 'Piloter'], ['t4', 'Vérifier l’état réel sur un échantillon'], ['t5', 'Étendre'], ['t6', 'Bloquer Hello dans la politique d’inscription']],
    required: ['t1', 't2', 't3', 't4', 't5'], forbidden: ['t6'], before: [['t1', 't2'], ['t2', 't3'], ['t3', 't4'], ['t4', 't5']], notes: { t6: 'Empêche l’approvisionnement.' }, solution: ['t1', 't2', 't3', 't4', 't5'],
    exp: 'Ciblage, matériel, pilote, vérification puis extension.' }),
  a.match({ id: 'i08-cs3', title: 'Cas : natures', comp: c3.comp, tags: c3.tags, role: 'case', dim: 'maintenir', lesson: 'i08-l3',
    st: 'Associez chaque besoin à sa nature.', items: [['p1', 'Élévation ciblée pour des utilisateurs standards'], ['p2', 'Rotation du mot de passe administrateur local'], ['p3', 'Protection de l’administrateur contre le vol de jeton']],
    options: [['s1', 'EPM, licence supplémentaire'], ['s2', 'Windows LAPS, natif'], ['s3', 'Fonction Windows distincte d’EPM']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'EPM, LAPS et la protection de l’administrateur sont trois choses différentes.' }),
  a.open({ id: 'i08-cs-open', title: 'Cas : stratégie des comptes privilégiés', comp: c3.comp, tags: c3.tags, role: 'case', dim: 'maintenir', lesson: 'i08-l3',
    st: 'Rédigez la stratégie des comptes privilégiés d’une organisation fictive.',
    deliverable: 'Un document : LAPS, groupes locaux, Hello, Credential Guard, EPM avec licences, rôles de lecture, audit et risques.',
    rubric: [['r1', 'LAPS est configuré avec un répertoire, une rotation et des rôles de lecture.', 'securiser'], ['r2', 'Les prérequis matériels sont traités.', 'fonctionner'], ['r3', 'EPM est présenté avec sa licence supplémentaire.', 'comprendre'], ['r4', 'Les risques de règles d’élévation sont traités.', 'securiser'], ['r5', 'L’audit des accès sensibles est prévu.', 'maintenir']],
    exp: 'Pas de note automatique : on juge la cohérence de la stratégie.' }),

  Q('i08-rm1', 'remediation', 'comprendre', c1, 'Remédiation : LAPS', 'Pourquoi un mot de passe unique par poste ?', ['Pour limiter le mouvement latéral.', 'Un vol ne compromet qu’un poste.'], [['Pour économiser du stockage.', 'Faux.'], ['Pour accélérer Windows.', 'Faux.'], ['Aucune raison.', 'Faux.']], 'Un mot de passe par poste limite le mouvement latéral.'),
  Q('i08-rm2', 'remediation', 'fonctionner', c2, 'Remédiation : verrou', 'Pourquoi un pilote avant le verrou UEFI ?', ['Le retour arrière du verrou est manuel.', 'Réduire le risque.'], [['Pour des raisons de coût.', 'Faux.'], ['Le verrou est facultatif.', 'Faux.'], ['Aucune raison.', 'Faux.']], 'Le verrou rend le retour arrière manuel.'),
  Q('i08-rm3', 'remediation', 'securiser', c3, 'Remédiation : défaut EPM', 'Pourquoi un défaut Refuser ?', ['Seules les règles connues élèvent, ce qui réduit l’élévation arbitraire.', 'Recommandation.'], [['Pour bloquer Windows.', 'Faux.'], ['Pour économiser la licence.', 'Faux.'], ['Aucune raison.', 'Faux.']], 'Un défaut restrictif limite l’élévation aux règles approuvées.'),
];

const competencies: AiCompetency[] = [
  { id: 'i08-c1', module: 'i08', name: 'Gérer les comptes administrateurs locaux', description: 'LAPS, groupes locaux, audit.', criteria: [{ id: 'i08-c1-1', text: 'Je configure LAPS avec un seul répertoire.' }, { id: 'i08-c1-2', text: 'J’attribue et j’audite la lecture des mots de passe.' }, { id: 'i08-c1-3', text: 'Je verrouille les groupes locaux avec précaution.' }] },
  { id: 'i08-c2', module: 'i08', name: 'Protéger les identifiants', description: 'Hello, Credential Guard, preuves.', criteria: [{ id: 'i08-c2-1', text: 'Je choisis une politique ciblée plutôt que de locataire.' }, { id: 'i08-c2-2', text: 'Je connais les prérequis matériels.' }, { id: 'i08-c2-3', text: 'Je vérifie l’état réel.' }] },
  { id: 'i08-c3', module: 'i08', name: 'Appliquer le moindre privilège avec EPM', description: 'Licence, défauts, règles.', criteria: [{ id: 'i08-c3-1', text: 'Je présente EPM avec sa licence supplémentaire.' }, { id: 'i08-c3-2', text: 'Je choisis un défaut sûr.' }, { id: 'i08-c3-3', text: 'J’écris des règles sans contournement.' }] },
];

const projects: AiProject[] = [
  { id: 'i08-p1', module: 'i08', level: 'débutant', title: 'Matrice des rôles de lecture LAPS', problem: 'Dresser la matrice des rôles et de leurs droits sur les mots de passe LAPS.', architecture: 'Tableau d’une page.', tools: ['Tableur'], data: 'Rôles fictifs.', steps: ['Lister les rôles.', 'Attribuer les droits.', 'Définir l’audit.'], success: ['Aucun rôle superflu.'], risks: ['Droit trop large.'], extensions: ['Ajouter l’accès conditionnel.'] },
  { id: 'i08-p2', module: 'i08', level: 'intermédiaire', title: 'Plan de déploiement de Credential Guard', problem: 'Concevoir le plan de déploiement de Credential Guard avec inventaire matériel, pilote et verrou.', architecture: 'Plan par vague avec critères.', tools: ['Tableur'], data: 'Parc fictif.', steps: ['Inventorier le matériel.', 'Définir le pilote.', 'Écrire les critères.', 'Planifier le verrou.'], success: ['Chaque vague a un critère.'], risks: ['Verrou prématuré.'], extensions: ['Ajouter un plan de retour.'],
    connected: { accounts: 'Un locataire de test avec Intune et un appareil Windows de test joint à Entra, sur du matériel compatible.', permissions: 'Endpoint Security Manager dans le locataire de test.', costs: 'Licences de test.', secrets: 'Ne copiez jamais un mot de passe LAPS dans un document.', cleanup: 'Retirer les politiques de test et faire pivoter les mots de passe de test.', limits: 'Facultatif : n’activez pas le verrou UEFI sur un appareil que vous ne pouvez pas remettre à zéro.' } },
  { id: 'i08-p3', module: 'i08', level: 'avancé', title: 'Dossier EPM', problem: 'Rédiger le dossier de décision d’EPM : licence, défaut, règles types, risques et mesures.', architecture: 'Dossier avec décision, règles types et critères de revue.', tools: ['Éditeur de texte'], data: 'Scénarios fictifs.', steps: ['Évaluer le besoin.', 'Chiffrer la licence.', 'Écrire les règles types.', 'Définir la revue.'], success: ['Le dossier est décisionnel.'], risks: ['Règle par certificat trop large.'], extensions: ['Ajouter un plan de migration.'] },
];

export const i08 = assemble({ id: 'i08', level: 3, n: 8, title: 'Comptes et identifiants',
  summary: 'Windows LAPS, groupes locaux, Windows Hello Entreprise, Credential Guard et Endpoint Privilege Management avec ses licences et ses risques.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Protéger les comptes chez Aurore Logistique',
  caseScenario: 'Vous déployez LAPS, planifiez Credential Guard et concevez des règles EPM. Actions simulées.', caseMinutes: 45 });
