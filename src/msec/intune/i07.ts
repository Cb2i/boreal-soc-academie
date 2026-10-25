// Module 7 : Chiffrement et démarrage (niveau 3).
import type { AiCompetency, AiLesson, AiProject } from '../../agentic/types.ts';
import { assemble } from '../assemble.ts';
import { kit } from '../kit.ts';
import { sref } from '../sources.ts';

const md = (...lines: string[]) => lines.join('\n');
const { a, Q, M } = kit('i07');
const c1 = { comp: 'i07-c1', lesson: 'i07-l1', tags: ['bitlocker', 'chiffrement-silencieux', 'prerequis-tpm'] };
const c2 = { comp: 'i07-c2', lesson: 'i07-l2', tags: ['cles-de-recuperation', 'rotation', 'acces-aux-cles'] };
const c3 = { comp: 'i07-c3', lesson: 'i07-l3', tags: ['filevault', 'rapport-de-chiffrement', 'plateformes'] };

const l1: AiLesson = {
  id: 'i07-l1', module: 'i07', title: 'BitLocker avec Intune : politiques, chiffrement silencieux et prérequis', minutes: 50,
  summary: 'Choisir le type de politique BitLocker, activer un chiffrement silencieux en connaissant ses risques et ses prérequis.',
  objectives: ['Choisir entre Endpoint security, configuration d’appareil et catalogue pour BitLocker.', 'Énumérer les réglages d’un chiffrement silencieux et ses risques.', 'Diagnostiquer un chiffrement silencieux qui demande une interaction.'],
  prerequisites: ['Modules 2, 3 et 5'],
  body: md(
    '## Types de politique',
    'La voie recommandée est **Endpoint security > Chiffrement de disque** (disk encryption), qui offre un profil **BitLocker** dédié et un profil **Personal Data Encryption** (chiffrement au niveau des fichiers, pour Windows 11 22H2 ou plus récent, qui s’ajoute à BitLocker pour un chiffrement en couches). Le profil **Endpoint protection** de configuration d’appareil contient aussi des réglages BitLocker au sein d’une configuration plus large. Attention : le **catalogue de paramètres** ne contient **pas** les contrôles d’authentification de démarrage par TPM nécessaires à un chiffrement silencieux fiable ; pour ce scénario, utilisez Endpoint security ou la configuration d’appareil. Appliquez la règle du module 2 : un seul type de politique par réglage.',
    '## Standard ou silencieux',
    'Le chiffrement **standard** peut montrer des invites à l’utilisateur et lui laisse des choix (type de chiffrement, gestion de la clé). Le chiffrement **silencieux** chiffre automatiquement, sans interaction ni droits administrateur sur l’appareil : c’est idéal pour garantir que tous les appareils gérés soient chiffrés sans dépendre de l’utilisateur. Réglages d’une politique Endpoint security pour le silencieux : **Require Device Encryption** à Activé, **Allow Warning For Other Disk Encryption** à Désactivé, et, une fois ce dernier désactivé, **Allow Standard User Encryption** à Activé si les appareils servent à des utilisateurs standards. Il est aussi conseillé de configurer la **rotation du mot de passe de récupération**.',
    '## Le risque du silence',
    'Désactiver l’avertissement sur un autre chiffrement signifie que BitLocker **procède même si un logiciel de chiffrement tiers est détecté**. Risques documentés : **perte de données** par conflit de méthodes, **instabilité** et échecs de démarrage, **récupérations complexes** avec plusieurs couches. Avant tout déploiement silencieux, vérifiez par l’inventaire des appareils qu’aucun chiffrement tiers n’est présent. C’est un exemple type de réglage « pratique » dont le coût de sécurité et de disponibilité se mesure en incidents.',
    '## Prérequis et échecs typiques',
    'Pour le silencieux, les appareils doivent satisfaire : bonne version de **TPM**, mode **UEFI**, appartenance à **Microsoft Entra** (jointure ; l’entiercement automatique en dépend). Si le chiffrement demande une interaction malgré la configuration silencieuse, vérifiez qu’aucun **NIP ou clé de démarrage TPM** n’est activé et qu’aucune base de référence en conflit n’en impose un. Si le chiffrement échoue en silence : journaux d’événements BitLocker, **Secure Boot** activé et **WinRE** correctement configuré. En cas de conflit entre politiques : la détection de conflits d’Intune (module 2) indique les réglages concernés.',
    '## Ce que prouve (ou non) un rapport',
    'Un appareil « chiffré » dans le rapport prouve un état de chiffrement ; il ne prouve ni que la clé est récupérable, ni que la méthode est conforme à votre exigence (algorithme, étendue). La leçon suivante traite la récupération.',
  ),
  demo: { title: 'Réglages silencieux et leurs risques', body: md(
    'Fiche **fictive** :',
    '```text',
    'Require Device Encryption          : Enabled',
    'Allow Warning For Other Disk Enc.  : Disabled   (risque : chiffrement tiers)',
    'Allow Standard User Encryption     : Enabled',
    'Contrôle préalable                 : inventaire sans chiffrement tiers',
    '```',
    '**Lecture commentée.** Les trois réglages rendent le chiffrement silencieux, et le contrôle préalable gère le risque principal.',
    '**Ce que la démo ne prouve pas.** Aucun appareil n’a été chiffré.') },
  guided: 'i07-g1', autonomous: 'i07-a1', quiz: ['i07-q1a', 'i07-q1b', 'i07-q1c'],
  revision: md('## Fiche : BitLocker avec Intune', '- Endpoint security > Chiffrement de disque recommandé ; le catalogue ne suffit pas pour le silencieux.', '- Silencieux : Require Device Encryption, avertissement désactivé, utilisateur standard autorisé.', '- Risque : chiffrement tiers présent (perte de données, démarrage).', '- Prérequis : TPM, UEFI, jointure Entra, Secure Boot, WinRE.', '- Pas de NIP ou clé de démarrage TPM pour un silencieux.'),
  links: [sref('intune-bitlocker'), sref('intune-disk-settings'), sref('intune-encryption-report'), sref('intune-endpoint-security')], teaches: ['bitlocker', 'chiffrement-silencieux', 'prerequis-tpm'],
};

const l2: AiLesson = {
  id: 'i07-l2', module: 'i07', title: 'Clés de récupération : entiercement, rotation, accès et audit', minutes: 50,
  summary: 'Gouverner les clés de récupération BitLocker comme des secrets critiques, de l’entiercement à l’audit des consultations.',
  objectives: ['Expliquer l’entiercement automatique dans Microsoft Entra.', 'Configurer et déclencher la rotation d’une clé de récupération.', 'Appliquer le moindre privilège et l’audit à l’accès aux clés.'],
  prerequisites: ['Leçon 1'],
  body: md(
    '## Pourquoi la clé est un secret critique',
    'Une clé de récupération déverrouille le disque. Perdue, elle rend les données inaccessibles ; mal protégée, elle devient une porte dérobée pour qui obtient l’appareil. Il faut donc la **sauvegarder de façon fiable** et en **limiter l’accès**. Avant d’activer BitLocker, planifiez la récupération : qui peut obtenir une clé, après quelle vérification d’identité, et comment on l’audite.',
    '## Entiercement',
    'Pour le chiffrement silencieux, les clés de récupération sont **sauvegardées automatiquement dans Microsoft Entra ID** au moment du chiffrement. Vérifiez : jointure Entra réussie (condition de l’entiercement automatique), aucun conflit de politique qui bloque la sauvegarde, et fonctionnement de l’entiercement dans le **rapport de chiffrement**. Réglage utile : **Stocker les informations de récupération dans Entra avant d’activer BitLocker** à Requis, de sorte que le chiffrement ne démarre pas sans sauvegarde. Pour les appareils rattachés au locataire, Intune peut afficher les données de clés selon des prérequis de version de Configuration Manager et de rôles.',
    '## Rotation',
    'Une clé de récupération qui a servi une fois est connue d’au moins une personne. La **rotation automatique côté client** remplace le mot de passe de récupération après son utilisation pour déverrouiller le lecteur (appareils joints à Entra ou en jointure hybride). L’action à distance **Rotation de clé BitLocker** d’Intune permet aussi d’en provoquer une. Prérequis : Windows 10 version 1909 ou plus récent, ou Windows 11 ; rotation activée par la politique (« Client-driven recovery password rotation »), « Save BitLocker recovery information to Microsoft Entra ID » activé et « Store recovery information… before enabling BitLocker » requis. Les rôles qui ont le droit **Rotate BitLockerKeys** sous « Remote tasks » incluent Help Desk Operator et Endpoint Security Administrator.',
    '## Accès et audit',
    'Donnez le droit de lire ou de faire pivoter les clés au **plus petit nombre de rôles** nécessaires, et traitez chaque consultation comme un événement sensible à auditer. Le soutien de niveau 1 n’a pas besoin du droit de rotation si une procédure d’escalade existe. Ces choix se documentent dans la fiche de configuration (21 points) sous « récupération ».',
    '## Pièges de cycle de vie',
    'Supprimer l’objet Intune d’un appareil joint à Entra protégé par BitLocker déclenche une synchronisation qui **retire les protecteurs de clé du volume système** et laisse BitLocker **suspendu** sur ce volume : une suppression de nettoyage n’est donc pas anodine. Une **mise à jour du microprogramme** peut déclencher la récupération : suspendre BitLocker avant, puis reprendre la protection ensuite. Si la récupération a lieu, le mot de passe peut être utilisé et le profil de validation de la plateforme est mis à jour pour éviter la récupération suivante.',
  ),
  demo: { title: 'Procédure de récupération', body: md(
    'Procédure **fictive** :',
    '```text',
    '1. Vérifier l’identité de l’utilisateur (appel de rappel)',
    '2. Consulter la clé dans le portail (événement d’audit)',
    '3. Communiquer la clé par un canal convenu',
    '4. Après usage : rotation automatique ou manuelle',
    '```',
    '**Lecture commentée.** La clé n’est jamais donnée sans vérification, et elle est remplacée après usage.',
    '**Ce que la démo ne prouve pas.** Aucune clé n’a été manipulée.') },
  guided: 'i07-g2', autonomous: 'i07-a2', quiz: ['i07-q2a', 'i07-q2b', 'i07-q2c'],
  revision: md('## Fiche : clés de récupération', '- Entiercement automatique dans Entra pour le silencieux ; exiger la sauvegarde avant le chiffrement.', '- Rotation après usage et action à distance (Windows 10 1909+ ou Windows 11).', '- Moindre privilège sur Rotate BitLockerKeys ; auditer les consultations.', '- Supprimer l’objet Intune suspend BitLocker sur le volume système.', '- Suspendre BitLocker avant une mise à jour du microprogramme.'),
  links: [sref('intune-bitlocker'), sref('win-bitlocker-recovery'), sref('intune-encryption-report'), sref('intune-rbac')], teaches: ['cles-de-recuperation', 'rotation', 'acces-aux-cles'],
};

const l3: AiLesson = {
  id: 'i07-l3', module: 'i07', title: 'FileVault sur macOS, rapport de chiffrement et limites par plateforme', minutes: 45,
  summary: 'Chiffrer les Mac avec FileVault, gérer la clé personnelle et savoir ce qu’un administrateur peut voir ou non.',
  objectives: ['Configurer une politique FileVault avec entiercement et rotation.', 'Expliquer la différence appareil d’entreprise et appareil personnel pour l’accès aux clés.', 'Ne pas transposer à macOS les capacités de BitLocker.'],
  prerequisites: ['Leçons 1 et 2'],
  body: md(
    '## La politique FileVault',
    'Dans **Endpoint security > Chiffrement de disque**, plateforme **macOS**, profil **macOS FileVault**. Réglages clés : **Activer FileVault** à Oui (chiffrement XTS-AES 128, pour macOS 10.13 et plus récent ; FileVault est activé quand l’utilisateur ferme sa session), **type de clé de récupération** personnelle, **rotation de la clé personnelle** de 1 à 12 mois, **description de l’emplacement d’entiercement** (message affiché à l’utilisateur à l’écran de connexion s’il oublie son mot de passe), et les réglages d’**expérience utilisateur** : nombre de reports autorisés (1 à 10, ou illimité sans exiger le chiffrement), report jusqu’à la fermeture de session, invite à la fermeture de session. Depuis macOS 10.15, la configuration de FileVault exige une **inscription MDM approuvée par l’utilisateur**.',
    '## Clés et confidentialité',
    'Intune entierce une copie de la clé personnelle quand une politique chiffre l’appareil, ou quand l’utilisateur téléverse la clé d’un appareil chiffré à la main. Les administrateurs peuvent **voir la clé seulement pour les Mac marqués « Entreprise »**, jamais pour les appareils **personnels** (BYOD), ce qui protège la vie privée. Afficher la clé génère une entrée d’**audit** et exige le droit **Rotate FileVault key** sous « Remote tasks ». L’utilisateur la récupère sur le **site Web du portail d’entreprise** (voie la plus fiable) ou dans les applications mobiles. La rotation manuelle n’est possible que pour les appareils d’entreprise ; les appareils personnels utilisent la rotation automatique de la politique.',
    '## Reprendre la gestion d’un Mac déjà chiffré',
    'Deux voies, qui exigent une politique FileVault active : l’utilisateur **téléverse sa clé actuelle** par le portail d’entreprise (Intune la valide puis la fait pivoter), ou il **génère une nouvelle clé** sur l’appareil avec la commande `sudo fdesetup changerecovery -personal` ; l’appareil se synchronise ensuite avec Intune. Vérifiez par le rapport de chiffrement et par un test de récupération de la clé.',
    '## Rapport de chiffrement',
    'Le rapport de chiffrement (Appareils > Surveiller > État du chiffrement) montre l’état de chiffrement, l’accès aux clés et le déploiement de la politique, pour Windows et macOS. Il prouve un état, pas une récupération réussie : testez périodiquement la récupération sur un appareil de test.',
    '## Ne pas transposer',
    'BitLocker et FileVault n’ont pas le même modèle : TPM et Secure Boot concernent Windows ; sur Mac, la protection repose sur le matériel Apple et sur FileVault. Les réglages, les clés, les droits d’accès et les vérifications diffèrent. Pour les autres plateformes (iOS, Android, Linux), le chiffrement se traite au module 14 avec leurs propres mécanismes : n’affirmez jamais qu’une fonction Windows existe ailleurs sans la source.',
  ),
  demo: { title: 'Visibilité des clés', body: md(
    'Tableau **fictif** :',
    '```text',
    'Mac Entreprise : clé visible (audit), rotation manuelle possible',
    'Mac Personnel  : clé non visible par l’administrateur',
    'Utilisateur     : portail d’entreprise > Obtenir la clé',
    '```',
    '**Lecture commentée.** Le statut de propriété décide de ce que l’administrateur peut faire.',
    '**Ce que la démo ne prouve pas.** Aucun Mac réel n’a été interrogé.') },
  guided: 'i07-g3', autonomous: 'i07-a3', quiz: ['i07-q3a', 'i07-q3b', 'i07-q3c'],
  revision: md('## Fiche : FileVault', '- Chiffrement de disque > macOS FileVault ; inscription MDM approuvée par l’utilisateur.', '- Rotation 1 à 12 mois ; message d’emplacement de la clé.', '- Clé visible seulement pour les Mac d’entreprise ; consultation auditée.', '- Reprise de gestion : téléverser la clé ou fdesetup changerecovery -personal.', '- Ne pas transposer BitLocker à macOS.'),
  links: [sref('intune-filevault'), sref('intune-disk-settings'), sref('intune-encryption-report'), sref('intune-bitlocker')], teaches: ['filevault', 'rapport-de-chiffrement', 'plateformes'],
};

const exercises = [
  a.match({ id: 'i07-g1', title: 'Réglage silencieux', comp: c1.comp, tags: c1.tags, role: 'guided', dim: 'comprendre', lesson: 'i07-l1',
    st: 'Associez chaque réglage à son rôle.', items: [['p1', 'Require Device Encryption'], ['p2', 'Allow Warning For Other Disk Encryption = Disabled'], ['p3', 'Allow Standard User Encryption']],
    options: [['s1', 'Exige le chiffrement'], ['s2', 'Chiffre même si un autre chiffrement est détecté'], ['s3', 'Permet le chiffrement par un utilisateur standard']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Exiger, ignorer l’avertissement et permettre l’utilisateur standard sont les trois réglages du silencieux.' }),
  a.config({ id: 'i07-a1', title: 'Chiffrement silencieux sûr', comp: c1.comp, tags: c1.tags, role: 'autonomous', dim: 'securiser', lesson: 'i07-l1',
    st: 'Paramétrez un déploiement silencieux responsable.',
    fields: [
      { id: 'inv', label: 'Vérifier l’absence de chiffrement tiers avant', kind: 'toggle', accept: ['on'], why: 'Principal risque documenté.' },
      { id: 'type', label: 'Type de politique', kind: 'select', options: [{ id: 'es', label: 'Endpoint security (chiffrement de disque)' }, { id: 'cat', label: 'Catalogue de paramètres seul' }], accept: ['es'], why: 'Le catalogue ne contient pas tous les contrôles TPM.' },
      { id: 'pin', label: 'Exiger un NIP au démarrage', kind: 'toggle', accept: ['off'], why: 'Un NIP empêche le silencieux.' },
    ], solution: { inv: 'on', type: 'es', pin: 'off' }, exp: 'Inventaire préalable, Endpoint security et pas de NIP pour rester silencieux.' }),
  Q('i07-q1a', 'quiz', 'comprendre', c1, 'Catalogue', 'Pourquoi éviter le catalogue seul pour BitLocker silencieux ?', ['Il ne contient pas les contrôles d’authentification TPM nécessaires.', 'Utiliser Endpoint security.'], [['Il est interdit.', 'Faux.'], ['Il chiffre trop vite.', 'Faux.'], ['Il n’existe plus.', 'Faux.']], 'Les contrôles TPM manquent dans le catalogue.'),
  Q('i07-q1b', 'quiz', 'fonctionner', c1, 'Interaction', 'BitLocker demande une interaction malgré le silencieux. Que vérifier ?', ['Qu’aucun NIP ou clé de démarrage TPM n’est activé, et les bases de référence en conflit.', 'Cause typique.'], [['La couleur du fond d’écran.', 'Faux.'], ['Le nom du poste.', 'Faux.'], ['Rien.', 'Faux.']], 'Un NIP ou une base de référence en conflit empêche le silence.'),
  Q('i07-q1c', 'quiz', 'maintenir', c1, 'Risque', 'Quel est le risque de désactiver l’avertissement sur un autre chiffrement ?', ['Chiffrer par-dessus un chiffrement tiers : perte de données et instabilité.', 'Documenté.'], [['Aucun.', 'Faux.'], ['Une amende.', 'Faux.'], ['Un chiffrement plus rapide.', 'Faux.']], 'Le conflit de méthodes peut détruire des données.'),

  a.workflow({ id: 'i07-g2', title: 'Récupérer une clé', comp: c2.comp, tags: c2.tags, role: 'guided', dim: 'comprendre', lesson: 'i07-l2',
    st: 'Ordonnez la remise d’une clé de récupération.',
    blocks: [['b1', 'Vérifier l’identité de l’utilisateur'], ['b2', 'Consulter la clé (audit)'], ['b3', 'Remettre la clé par un canal convenu'], ['b4', 'Faire pivoter la clé après usage'], ['b5', 'Envoyer la clé par courriel ordinaire sans vérification']],
    required: ['b1', 'b2', 'b3', 'b4'], forbidden: ['b5'], before: [['b1', 'b2'], ['b2', 'b3'], ['b3', 'b4']], notes: { b5: 'Aucune vérification d’identité.' }, solution: ['b1', 'b2', 'b3', 'b4'],
    exp: 'Vérification, consultation auditée, remise puis rotation.' }),
  a.config({ id: 'i07-a2', title: 'Politique de clés', comp: c2.comp, tags: c2.tags, role: 'autonomous', dim: 'securiser', lesson: 'i07-l2',
    st: 'Paramétrez la gouvernance des clés de récupération.',
    fields: [
      { id: 'escrow', label: 'Exiger la sauvegarde dans Entra avant le chiffrement', kind: 'toggle', accept: ['on'], why: 'Pas de chiffrement sans clé récupérable.' },
      { id: 'rot', label: 'Rotation après usage', kind: 'toggle', accept: ['on'], why: 'Une clé utilisée est connue.' },
      { id: 'rbac', label: 'Droit de rotation à tout le soutien', kind: 'toggle', accept: ['off'], why: 'Moindre privilège.' },
    ], solution: { escrow: 'on', rot: 'on', rbac: 'off' }, exp: 'Sauvegarde exigée, rotation active et droits limités.' }),
  Q('i07-q2a', 'quiz', 'comprendre', c2, 'Entiercement', 'Où sont sauvegardées automatiquement les clés d’un chiffrement silencieux ?', ['Dans Microsoft Entra ID.', 'Jointure Entra requise.'], [['Sur le poste en clair.', 'Faux.'], ['Dans un courriel.', 'Faux.'], ['Nulle part.', 'Faux.']], 'L’entiercement automatique vise Entra ID.'),
  Q('i07-q2b', 'quiz', 'fonctionner', c2, 'Suppression', 'Que provoque la suppression de l’objet Intune d’un appareil joint à Entra protégé par BitLocker ?', ['Le retrait des protecteurs de clé du volume système et la suspension de BitLocker.', 'Piège de nettoyage.'], [['Rien.', 'Faux.'], ['Un chiffrement plus fort.', 'Faux.'], ['Une rotation automatique.', 'Faux.']], 'BitLocker se retrouve suspendu sur le volume.'),
  Q('i07-q2c', 'quiz', 'maintenir', c2, 'Microprogramme', 'Que faire avant une mise à jour du microprogramme ?', ['Suspendre BitLocker puis reprendre ensuite.', 'Évite la récupération.'], [['Désactiver le TPM.', 'Faux.'], ['Supprimer la clé.', 'Faux.'], ['Rien.', 'Faux.']], 'On suspend puis on reprend la protection.'),

  a.match({ id: 'i07-g3', title: 'Statut et visibilité', comp: c3.comp, tags: c3.tags, role: 'guided', dim: 'comprendre', lesson: 'i07-l3',
    st: 'Associez chaque statut de Mac à ce que voit l’administrateur.', items: [['p1', 'Mac Entreprise'], ['p2', 'Mac Personnel (BYOD)'], ['p3', 'Utilisateur final']],
    options: [['s1', 'Clé visible avec audit'], ['s2', 'Clé non visible'], ['s3', 'Récupère sa clé par le portail d’entreprise']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'La clé est visible seulement pour l’entreprise, jamais pour le personnel, et l’utilisateur la récupère par le portail.' }),
  a.order({ id: 'i07-a3', title: 'Reprendre la gestion d’un Mac', comp: c3.comp, tags: c3.tags, role: 'autonomous', dim: 'fonctionner', lesson: 'i07-l3',
    st: 'Ordonnez la reprise de gestion d’un Mac déjà chiffré.',
    items: [['s1', 'Déployer la politique FileVault'], ['s2', 'Faire téléverser la clé ou générer une nouvelle clé'], ['s3', 'Synchroniser l’appareil'], ['s4', 'Vérifier le rapport de chiffrement'], ['s5', 'Tester la récupération de la clé']], correct: ['s1', 's2', 's3', 's4', 's5'],
    exp: 'Politique, clé, synchronisation, rapport puis test de récupération.' }),
  Q('i07-q3a', 'quiz', 'comprendre', c3, 'Rotation FileVault', 'Sur quelle plage se règle la rotation de la clé personnelle ?', ['De 1 à 12 mois.', 'Ou non configurée.'], [['De 1 à 12 jours.', 'Faux.'], ['Jamais.', 'Faux.'], ['Chaque heure.', 'Faux.']], 'La rotation va de 1 à 12 mois.'),
  Q('i07-q3b', 'quiz', 'fonctionner', c3, 'Inscription', 'Quelle inscription exige la configuration de FileVault depuis macOS 10.15 ?', ['Une inscription MDM approuvée par l’utilisateur.', 'Prérequis Apple.'], [['Aucune.', 'Faux.'], ['Un compte administrateur local seulement.', 'Faux.'], ['Une licence Windows.', 'Faux.']], 'L’inscription MDM approuvée est requise.'),
  Q('i07-q3c', 'quiz', 'maintenir', c3, 'Transposition', 'Peut-on affirmer que macOS a un TPM et Secure Boot comme Windows ?', ['Non : les mécanismes diffèrent, ne pas transposer sans source.', 'Chaque plateforme a ses règles.'], [['Oui, identique.', 'Faux.'], ['Oui, via BitLocker.', 'Faux.'], ['Cela n’a pas d’importance.', 'Faux.']], 'On ne transpose pas les capacités entre plateformes.'),

  Q('i07-ev1', 'eval', 'comprendre', c1, 'Profil recommandé', 'Quelle voie de politique est recommandée pour BitLocker ?', ['Endpoint security > Chiffrement de disque.', 'Profil BitLocker dédié.'], [['Le catalogue seul pour le silencieux.', 'Faux.'], ['Un script.', 'Faux.'], ['Aucune.', 'Faux.']], 'Endpoint security est la voie recommandée.'),
  M('i07-ev2', 'eval', 'securiser', c2, 'Gouvernance des clés', 'Cochez les bonnes pratiques de gouvernance des clés.', [['Auditer les consultations.', 'Événements sensibles.'], ['Limiter le droit de rotation.', 'Moindre privilège.']], [['Donner la clé sans vérification.', 'Risque.'], ['Garder la clé dans un fichier partagé.', 'Risque.']], 'Audit et moindre privilège.'),
  a.order({ id: 'i07-ev3', title: 'Déployer BitLocker', comp: c1.comp, tags: c1.tags, role: 'eval', dim: 'fonctionner', lesson: 'i07-l1',
    st: 'Ordonnez le déploiement de BitLocker silencieux.',
    items: [['s1', 'Inventorier les chiffrements tiers'], ['s2', 'Vérifier TPM, UEFI, jointure Entra'], ['s3', 'Créer la politique silencieuse'], ['s4', 'Piloter et lire le rapport'], ['s5', 'Étendre par vagues']], correct: ['s1', 's2', 's3', 's4', 's5'],
    exp: 'Inventaire, prérequis, politique, pilote puis vagues.' }),
  a.fix({ id: 'i07-ev4', title: 'Corriger une politique de clés', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'securiser', lesson: 'i07-l2', language: 'json',
    st: 'Corrigez : sauvegarde exigée, rotation active.',
    starter: JSON.stringify({ sauvegardeAvantChiffrement: 'non-requise', rotation: 'aucune', auditConsultation: 'non' }, null, 2),
    rules: [{ kind: 'equals', path: 'sauvegardeAvantChiffrement', value: 'requise', message: 'Exiger la sauvegarde.', dim: 'securiser' }, { kind: 'equals', path: 'rotation', value: 'apres-usage', message: 'Activer la rotation.', dim: 'securiser' }, { kind: 'equals', path: 'auditConsultation', value: 'oui', message: 'Auditer les consultations.', dim: 'maintenir' }],
    solution: JSON.stringify({ sauvegardeAvantChiffrement: 'requise', rotation: 'apres-usage', auditConsultation: 'oui' }, null, 2), exp: 'Sauvegarde exigée, rotation après usage et audit actif.' }),
  a.match({ id: 'i07-ev5', title: 'Symptôme et cause', comp: c1.comp, tags: c1.tags, role: 'eval', dim: 'maintenir', lesson: 'i07-l1',
    st: 'Associez chaque symptôme à sa cause probable.', items: [['p1', 'BitLocker demande un NIP'], ['p2', 'Chiffrement qui échoue silencieusement'], ['p3', 'Statut de conflit sur BitLocker']],
    options: [['s1', 'Authentification de démarrage TPM activée'], ['s2', 'Secure Boot ou WinRE mal configuré'], ['s3', 'Deux politiques avec des valeurs différentes']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'NIP TPM, Secure Boot ou WinRE et conflit de politiques sont trois causes distinctes.' }),
  a.workflow({ id: 'i07-ev6', title: 'Nettoyer un objet appareil', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'securiser', lesson: 'i07-l2',
    st: 'Ordonnez la mise hors service d’un appareil chiffré.',
    blocks: [['b1', 'Confirmer que les données ne sont plus nécessaires ou sauvegardées'], ['b2', 'Noter l’état BitLocker et la clé de récupération'], ['b3', 'Retirer l’appareil selon la procédure'], ['b4', 'Vérifier l’état du volume'], ['b5', 'Supprimer l’objet sans réflexion']],
    required: ['b1', 'b2', 'b3', 'b4'], forbidden: ['b5'], before: [['b1', 'b2'], ['b2', 'b3'], ['b3', 'b4']], notes: { b5: 'La suppression suspend BitLocker.' }, solution: ['b1', 'b2', 'b3', 'b4'],
    exp: 'On protège les données, on note la clé, on retire puis on vérifie.' }),
  a.short({ id: 'i07-ev7', title: 'Plage de rotation FileVault', comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'comprendre', lesson: 'i07-l3',
    st: 'Quel est le nombre maximal de mois pour la rotation de la clé personnelle FileVault ? (nombre)', accepted: ['12'], numeric: { value: 12 }, ph: 'un nombre',
    exp: 'La rotation de la clé personnelle se règle jusqu’à 12 mois.' }),
  a.short({ id: 'i07-ev8', title: 'Version minimale de rotation', comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'comprendre', lesson: 'i07-l2',
    st: 'Quelle version de Windows 10 est le minimum pour l’action de rotation de clé BitLocker ? (nombre à quatre chiffres)', accepted: ['1909'], numeric: { value: 1909 }, ph: 'un nombre',
    exp: 'L’action exige Windows 10 version 1909 ou plus récent, ou Windows 11.' }),

  a.inspect({ id: 'i07-cs1', title: 'Cas : chiffrement chez Aurore Logistique', comp: c1.comp, tags: c1.tags, role: 'case', dim: 'securiser', lesson: 'i07-l1', language: 'text',
    st: 'Plan fictif. Repérez les défauts.',
    lines: [['p1', 'Le chiffrement silencieux est activé sans inventaire des logiciels tiers.', { ok: 'a1', fixes: [['a1', 'Inventorier les chiffrements tiers avant'], ['a2', 'Accepter']] }], ['p2', 'Le catalogue de paramètres sert de seule source BitLocker.', { ok: 'b1', fixes: [['b1', 'Utiliser Endpoint security pour le silencieux'], ['b2', 'Accepter']] }], ['p3', 'Un rapport « chiffré » prouve que la clé est récupérable.', { ok: 'c1', fixes: [['c1', 'Tester la récupération sur un appareil de test'], ['c2', 'Accepter']] }]],
    exp: 'Inventaire absent, mauvaise source et preuve insuffisante sont trois défauts.' }),
  a.workflow({ id: 'i07-cs2', title: 'Cas : perte d’un portable chiffré', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'securiser', lesson: 'i07-l2',
    st: 'Ordonnez la réponse à la perte d’un portable chiffré.',
    blocks: [['t1', 'Confirmer que le chiffrement était actif dans le rapport'], ['t2', 'Évaluer le risque avec le propriétaire des données'], ['t3', 'Décider des actions à distance selon la politique'], ['t4', 'Documenter l’événement'], ['t5', 'Conclure que le disque est protégé sans vérifier']],
    required: ['t1', 't2', 't3', 't4'], forbidden: ['t5'], before: [['t1', 't2'], ['t2', 't3'], ['t3', 't4']], notes: { t5: 'Aucune preuve.' }, solution: ['t1', 't2', 't3', 't4'],
    exp: 'On vérifie le chiffrement, on évalue, on décide puis on documente.' }),
  a.match({ id: 'i07-cs3', title: 'Cas : plateformes', comp: c3.comp, tags: c3.tags, role: 'case', dim: 'maintenir', lesson: 'i07-l3',
    st: 'Associez chaque plateforme à son chiffrement.', items: [['p1', 'Windows'], ['p2', 'macOS'], ['p3', 'Autre plateforme']],
    options: [['s1', 'BitLocker'], ['s2', 'FileVault'], ['s3', 'Mécanisme propre, à documenter avec sa source']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Chaque plateforme a son mécanisme, et on ne transpose pas sans source.' }),
  a.open({ id: 'i07-cs-open', title: 'Cas : stratégie de chiffrement', comp: c3.comp, tags: c3.tags, role: 'case', dim: 'maintenir', lesson: 'i07-l3',
    st: 'Rédigez la stratégie de chiffrement d’une organisation fictive.',
    deliverable: 'Un document : politiques BitLocker et FileVault, prérequis, clés (entiercement, rotation, accès, audit), preuves et risques.',
    rubric: [['r1', 'Les prérequis et le risque du silencieux sont traités.', 'securiser'], ['r2', 'La gouvernance des clés est complète.', 'maintenir'], ['r3', 'La différence entre appareils d’entreprise et personnels est traitée.', 'comprendre'], ['r4', 'Aucune capacité n’est transposée sans source.', 'comprendre'], ['r5', 'La preuve de récupération est prévue.', 'fonctionner']],
    exp: 'Pas de note automatique : on juge la cohérence de la stratégie.' }),

  Q('i07-rm1', 'remediation', 'comprendre', c1, 'Remédiation : silencieux', 'Pourquoi inventorier avant un déploiement silencieux ?', ['Pour éviter de chiffrer par-dessus un chiffrement tiers.', 'Risque de perte de données.'], [['Pour accélérer.', 'Faux.'], ['Pour économiser du stockage.', 'Faux.'], ['Aucune raison.', 'Faux.']], 'L’inventaire évite le conflit de chiffrements.'),
  Q('i07-rm2', 'remediation', 'fonctionner', c2, 'Remédiation : rotation', 'Pourquoi faire pivoter une clé après usage ?', ['Parce qu’une clé utilisée est connue d’au moins une personne.', 'Réduit l’exposition.'], [['Pour changer la couleur.', 'Faux.'], ['Pour chiffrer plus vite.', 'Faux.'], ['Aucune raison.', 'Faux.']], 'La rotation limite la réutilisation d’une clé connue.'),
  Q('i07-rm3', 'remediation', 'securiser', c3, 'Remédiation : BYOD', 'Pourquoi l’administrateur ne voit-il pas la clé d’un Mac personnel ?', ['Pour protéger la vie privée de l’utilisateur.', 'Règle documentée.'], [['Par oubli.', 'Faux.'], ['Parce que FileVault est désactivé.', 'Faux.'], ['Aucune raison.', 'Faux.']], 'La clé des appareils personnels n’est pas accessible à l’administrateur.'),
];

const competencies: AiCompetency[] = [
  { id: 'i07-c1', module: 'i07', name: 'Déployer BitLocker', description: 'Politiques, silencieux, prérequis.', criteria: [{ id: 'i07-c1-1', text: 'Je choisis la bonne voie de politique.' }, { id: 'i07-c1-2', text: 'Je maîtrise les risques du silencieux.' }, { id: 'i07-c1-3', text: 'Je diagnostique un échec de chiffrement.' }] },
  { id: 'i07-c2', module: 'i07', name: 'Gouverner les clés de récupération', description: 'Entiercement, rotation, accès.', criteria: [{ id: 'i07-c2-1', text: 'J’exige l’entiercement avant le chiffrement.' }, { id: 'i07-c2-2', text: 'Je configure la rotation.' }, { id: 'i07-c2-3', text: 'J’applique le moindre privilège et l’audit.' }] },
  { id: 'i07-c3', module: 'i07', name: 'Chiffrer les Mac et prouver', description: 'FileVault, rapports, limites.', criteria: [{ id: 'i07-c3-1', text: 'Je configure FileVault.' }, { id: 'i07-c3-2', text: 'Je distingue appareils d’entreprise et personnels.' }, { id: 'i07-c3-3', text: 'Je ne transpose pas les capacités entre plateformes.' }] },
];

const projects: AiProject[] = [
  { id: 'i07-p1', module: 'i07', level: 'débutant', title: 'Fiche de prérequis de chiffrement', problem: 'Lister les prérequis de chiffrement par plateforme et leur vérification.', architecture: 'Tableau d’une page.', tools: ['Tableur'], data: 'Parc fictif.', steps: ['Lister les plateformes.', 'Lister les prérequis.', 'Définir la vérification.'], success: ['Chaque plateforme a ses prérequis.'], risks: ['Transposition.'], extensions: ['Ajouter les rôles.'] },
  { id: 'i07-p2', module: 'i07', level: 'intermédiaire', title: 'Procédure de récupération de clé', problem: 'Rédiger la procédure de récupération de clé avec vérification d’identité, audit et rotation.', architecture: 'Procédure en étapes avec rôles.', tools: ['Tableur', 'Éditeur de texte'], data: 'Scénarios fictifs.', steps: ['Définir les rôles.', 'Écrire les étapes.', 'Définir l’audit.', 'Planifier un exercice de récupération.'], success: ['Aucune clé remise sans vérification.'], risks: ['Droits trop larges.'], extensions: ['Ajouter un indicateur.'],
    connected: { accounts: 'Un locataire de test avec Intune, un appareil Windows de test joint à Entra et, si possible, un Mac de test.', permissions: 'Rôle Intune avec Remote tasks sur un appareil de test uniquement.', costs: 'Licences de test.', secrets: 'Ne consignez jamais une clé de récupération dans un document ou une capture.', cleanup: 'Faire pivoter les clés de test puis retirer les appareils de test.', limits: 'Facultatif : ne chiffrez jamais un appareil contenant des données réelles.' } },
  { id: 'i07-p3', module: 'i07', level: 'avancé', title: 'Plan de reprise de gestion', problem: 'Concevoir le plan de reprise de gestion d’appareils déjà chiffrés et de mise hors service sûre.', architecture: 'Plan par plateforme avec risques et vérifications.', tools: ['Tableur'], data: 'Parc fictif.', steps: ['Inventorier les états.', 'Choisir la méthode.', 'Prévoir les vérifications.', 'Documenter la mise hors service.'], success: ['Aucun appareil sans clé récupérable.'], risks: ['Suppression d’objet.'], extensions: ['Ajouter la communication aux utilisateurs.'] },
];

export const i07 = assemble({ id: 'i07', level: 3, n: 7, title: 'Chiffrement et démarrage',
  summary: 'BitLocker avec Intune, chiffrement silencieux et ses risques, clés de récupération (entiercement, rotation, accès), FileVault et limites par plateforme.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Chiffrer le parc d’Aurore Logistique',
  caseScenario: 'Vous planifiez BitLocker et FileVault, la gouvernance des clés et la preuve de récupération. Actions simulées.', caseMinutes: 45 });
