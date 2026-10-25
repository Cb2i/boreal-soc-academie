// Module 10 : Identités et services connexes (niveau 3).
import type { AiCompetency, AiLesson, AiProject } from '../../agentic/types.ts';
import { assemble } from '../assemble.ts';
import { kit } from '../kit.ts';
import { sref } from '../sources.ts';

const md = (...lines: string[]) => lines.join('\n');
const { a, Q, M } = kit('x10');
const c1 = { comp: 'x10-c1', lesson: 'x10-l1', tags: ['entra-id-protection', 'risque-unifie', 'politiques-risque'] };
const c2 = { comp: 'x10-c2', lesson: 'x10-l2', tags: ['identity-security', 'inventaire-identites', 'idp-tiers'] };
const c3 = { comp: 'x10-c3', lesson: 'x10-l3', tags: ['attack-disruption', 'contain-user', 'exclusions'] };

const l1: AiLesson = {
  id: 'x10-l1', module: 'x10', title: 'Entra ID Protection : détections, politiques de risque et signaux unifiés', minutes: 45,
  summary: 'Lire le risque d’un utilisateur et d’une connexion, l’automatiser par l’accès conditionnel et comprendre le risque composé avec Defender.',
  objectives: ['Distinguer risque de connexion et risque d’utilisateur, en temps réel et hors ligne.', 'Choisir entre remédiation automatique et manuelle.', 'Expliquer les prérequis des signaux de risque unifiés.'],
  prerequisites: ['Modules 1 et 8'],
  body: md(
    '## Deux risques, deux questions',
    'Microsoft Entra ID Protection détecte, investigue et remédie les risques liés aux identités. Il produit deux notions qu’il faut garder distinctes. Le **risque de connexion (sign-in risk)** répond à « cette ouverture de session est-elle probablement le fait du vrai propriétaire du compte ? » et se calcule à chaque connexion. Le **risque d’utilisateur (user risk)** répond à « ce compte est-il probablement compromis ? » et s’accumule dans le temps. Une détection peut être **en temps réel** (évaluée pendant la connexion) ou **hors ligne** (calculée après coup) : une politique d’accès conditionnel ne peut réagir qu’à ce qui a déjà été évalué quand elle s’applique.',
    'Les rapports à connaître sont au nombre de trois : **détections de risque** (chaque détection individuelle), **connexions à risque** (au moins une détection sur la connexion) et **utilisateurs à risque** (au moins une connexion à risque ou une détection). Exemples de détections : usage d’une adresse IP anonyme, pulvérisation de mots de passe, **identifiants divulgués** (confirmés par correspondance avec les empreintes de mots de passe valides du locataire, toujours à risque élevé), renseignement sur les menaces de Microsoft Entra, tentative d’accès à un jeton d’actualisation principal (PRT).',
    '## Licences : ce qui est gratuit et ce qui ne l’est pas',
    'Certaines détections (identifiants divulgués, renseignement sur les menaces d’utilisateur) demandent seulement Entra ID Free ou P1. Le calcul complet du risque de connexion, les politiques de risque et l’accès conditionnel basé sur le risque exigent **Entra ID P2** (inclus dans Microsoft 365 E5). Vérifiez toujours la licence avant de promettre une politique : sans P2, la politique de risque ne s’applique pas.',
    '## Remédiation : automatique d’abord',
    'La première ligne est l’**autoremédiation** : une politique d’accès conditionnel basée sur le risque exige une authentification multifacteur pour un risque de connexion, ou un changement sécurisé de mot de passe pour un risque d’utilisateur. Si l’utilisateur réussit le contrôle, le risque est remédié automatiquement. Sans autoremédiation, un administrateur agit : réinitialiser le mot de passe, exiger de réenregistrer l’authentification multifacteur, bloquer l’utilisateur ou révoquer ses sessions, puis marquer le risque **sûr**, **compromis** ou le **rejeter**. Une réinitialisation par mot de passe infonuagique remédie aussi un risque d’identifiants divulgués pour les mots de passe locaux seulement si la synchronisation des empreintes de mot de passe est activée.',
    '**Piège classique** : exiger le changement de mot de passe sur risque d’utilisateur élevé sans activer la réinitialisation libre-service verrouille les utilisateurs. Prévoyez l’enregistrement préalable aux méthodes d’authentification et un compte d’accès d’urgence exclu des politiques.',
    '## Signaux de risque unifiés',
    'Les **signaux de risque unifiés** corrèlent, dans une même fenêtre de temps, les signaux d’Entra ID Protection et de Defender (identité, point de terminaison, courriel). Un utilisateur d’abord « moyen » peut passer à « élevé » quand plusieurs détections s’additionnent, ce qui peut déclencher vos politiques basées sur le risque. Prérequis documentés : **Entra ID P2**, **Microsoft 365 E5** recommandé pour la corrélation entre produits, et **Defender for Identity configuré** : sans lui, il n’y a aucune composition du risque. Rôles : Security Administrator (gérer), Conditional Access Administrator (appliquer), Security Operator ou Security Reader (investiguer). Dans le portail Defender, l’identité affiche un **score de risque de 0 à 100** et le niveau de risque Entra de chaque compte lié. Une conséquence pratique : le nombre d’utilisateurs à risque élevé peut augmenter après l’activation, ce qui change la charge des politiques de blocage. Mesurez avant de resserrer.',
    '## Investiguer avant de conclure',
    'Comparez la connexion à l’historique de l’utilisateur : application, appareil (inscrit ou conforme), emplacement, adresse IP, agent utilisateur. Cherchez ensuite les alertes corrélées dans Sentinel et dans Defender (filtre de produit **AAD Identity Protection**). Un déplacement légitime et un jeton volé peuvent se ressembler : la décision se prend sur l’ensemble, pas sur une détection isolée.',
  ),
  demo: { title: 'Du signal à la décision', body: md(
    'Situation **fictive** :',
    '```text',
    'Utilisateur      Détection individuelle         Risque   Après signaux unifiés',
    'amelie@nordlys   Adresse IP anonyme              Moyen    Élevé (composé avec alerte MDI)',
    '```',
    '**Lecture commentée.** Deux signaux faibles dans la même fenêtre produisent un risque élevé et peuvent déclencher la politique de changement de mot de passe.',
    '**Ce que la démo ne prouve pas.** Aucun locataire n’a évalué ce risque.') },
  guided: 'x10-g1', autonomous: 'x10-a1', quiz: ['x10-q1a', 'x10-q1b', 'x10-q1c'],
  revision: md('## Fiche : Entra ID Protection', '- Risque de connexion (par ouverture de session) vs risque d’utilisateur (compte).', '- Politiques de risque et risque de connexion complet : P2.', '- Autoremédiation par accès conditionnel d’abord ; sinon réinitialiser, bloquer, révoquer.', '- Signaux unifiés : P2 + Defender for Identity configuré.', '- Prévoir la réinitialisation libre-service et un compte d’urgence exclu.'),
  links: [sref('eid-protection'), sref('eid-risks'), sref('eid-unified'), sref('eid-investigate'), sref('eid-risk-policies'), sref('xdr-investigate-users')], teaches: ['entra-id-protection', 'risque-unifie', 'politiques-risque'],
};

const l2: AiLesson = {
  id: 'x10-l2', module: 'x10', title: 'Sécurité des identités dans Defender : inventaire, fournisseurs tiers et recommandations', minutes: 40,
  summary: 'Utiliser l’inventaire unifié, étendre la visibilité à Okta et aux outils d’accès privilégié et lire les recommandations.',
  objectives: ['Décrire l’inventaire des identités et ses colonnes utiles à un SOC.', 'Expliquer ce que l’intégration d’Okta ajoute et ce qu’elle ne remplace pas.', 'Distinguer posture d’identité (ISPM) et posture SaaS (SSPM).'],
  prerequisites: ['Leçon 1 et module 8'],
  body: md(
    '## Une vue unique des identités',
    'La **sécurité des identités** de Defender regroupe la posture, la détection des menaces et la réponse pour les identités humaines et non humaines. L’**inventaire des identités** (portail Defender, Assets > Identities) consolide les comptes d’Active Directory, de Microsoft Entra ID et, selon la configuration, de fournisseurs tiers. Colonnes utiles pour trier : **environnement d’identité** (local, infonuagique seulement ou hybride), **score de risque** (0 à 100, probabilité de compromission et ampleur des dommages), **niveau de criticité**, **étiquettes** (Sensitive, Honeytoken, comptes privilégiés gérés par PIM), **type** (utilisateur ou compte de service), état du compte et dernière mise à jour. Des onglets séparent les identités humaines et **non humaines** (applications Entra, comptes de service Active Directory, applications Google Workspace et Salesforce, en préversion).',
    '## Fournisseurs tiers',
    'Avec **Defender for Identity**, on peut connecter **Okta** : ses utilisateurs entrent dans l’inventaire et sont corrélés avec les identités AD et Entra correspondantes, des recommandations de posture apparaissent dans Secure Score (authentification multifacteur sur les comptes privilégiés, limiter les super-administrateurs Okta, jetons d’API très privilégiés, comptes privilégiés dormants), des alertes sont générées (accès anonyme, création ou modification de jeton d’API privilégié, attribution de rôle privilégié à une application) et des actions sont possibles depuis Defender (révoquer les sessions, désactiver l’utilisateur dans Okta, définir le risque). L’affichage du score de risque Okta exige la fonction Identity Threat Protection with Okta AI du côté d’Okta. **CyberArk Identity** (préversion) marque les comptes AD gérés comme comptes d’accès privilégié et propose désactiver, réactiver et réinitialiser le mot de passe. La chasse avancée expose les métadonnées dans **IdentityInfo** et les événements dans **IdentityEvents** (préversion).',
    '**Limite à nommer** : connecter un fournisseur ajoute de la visibilité et des actions, mais ne remplace pas la configuration du fournisseur (politiques de session, authentification résistante à l’hameçonnage). Les fonctions en préversion peuvent changer.',
    '## Recommandations unifiées',
    'Deux capacités alimentent Secure Score et Security Exposure Management : l’**ISPM** (identity security posture management) pour Active Directory et les fournisseurs d’identité non Microsoft, et le **SSPM** (SaaS security posture management, dans Defender for Cloud Apps) pour la configuration des applications SaaS. Ne les confondez pas : l’une regarde l’identité, l’autre la configuration de l’application. La page **Coverage and maturity** (préversion) montre des niveaux Connected, Protected, Fortified et Resilient et des tâches d’installation priorisées, mais son déploiement est graduel : elle peut être absente de votre locataire.',
    '## Priorisation SOC',
    'Un bon réflexe de tri : commencer par les identités **critiques et privilégiées** avec risque élevé, puis les comptes de service avec mots de passe anciens, puis les comptes dormants. Les honeytokens étiquetés servent de pièges : toute activité est suspecte. Documentez qui possède chaque compte de service, car sans propriétaire, aucune remédiation ne peut être approuvée.',
  ),
  demo: { title: 'Trier l’inventaire', body: md(
    'Extrait **fictif** :',
    '```text',
    'Compte         Environnement  Type      Criticité  Risque  Étiquette',
    'svc-backup     Local          Service   Élevée     72      Compte de service',
    'adm-lavoie     Hybride        Humain    Élevée     35      Privilégié (PIM)',
    'honey-compta   Local          Humain    Moyenne    0       Honeytoken',
    '```',
    '**Lecture commentée.** On traite d’abord svc-backup (service critique avec risque élevé), puis on surveille toute activité de honey-compta.',
    '**Ce que la démo ne prouve pas.** Aucun inventaire réel n’a été lu.') },
  guided: 'x10-g2', autonomous: 'x10-a2', quiz: ['x10-q2a', 'x10-q2b', 'x10-q2c'],
  revision: md('## Fiche : sécurité des identités', '- Inventaire : AD + Entra + tiers ; humains et non humains.', '- Score de risque 0 à 100 ; étiquettes Sensitive, Honeytoken, PIM.', '- Okta : inventaire, alertes, actions ; ne remplace pas la configuration d’Okta.', '- ISPM = identités ; SSPM = applications SaaS.', '- Fonctions en préversion : revérifier.'),
  links: [sref('xdr-identity-security'), sref('mdi-inventory'), sref('mdi-okta'), sref('mdi-cyberark'), sref('xdr-identity-recs')], teaches: ['identity-security', 'inventaire-identites', 'idp-tiers'],
};

const l3: AiLesson = {
  id: 'x10-l3', module: 'x10', title: 'Perturbation automatique des attaques : désactiver, contenir et exclure', minutes: 45,
  summary: 'Comprendre ce que Defender fait seul sur les identités, comment le vérifier et quand l’exclure.',
  objectives: ['Distinguer désactiver, contenir et révoquer.', 'Décrire où l’action s’exécute selon l’hébergement du compte.', 'Mettre en place des exclusions raisonnées et la vérification par chasse.'],
  prerequisites: ['Leçons 1 et 2'],
  body: md(
    '## Ce que la perturbation fait seule',
    'La **perturbation automatique des attaques (automatic attack disruption)** corrèle les signaux de Defender XDR et utilise l’IA pour contenir une attaque en cours (rançongiciel, compromission de courriel d’entreprise, adversaire au milieu). Côté identités, trois actions se distinguent. **Disable user** (Defender for Identity) suspend le compte pour empêcher de nouvelles connexions. **Contain user** (Defender for Endpoint) applique une politique sur tous les appareils intégrés qui bloque le trafic entrant du compte dans les protocoles d’attaque (ouvertures de session réseau, RPC, SMB, RDP) et met fin aux sessions distantes en cours, **sans désactiver le compte** chez le fournisseur d’identité. Une contention déclenchée par la perturbation est levée automatiquement après **cinq jours**. **Revoke session** et **Suspend user in Entra** coupent l’accès côté Entra. Il existe aussi des actions pour les applications OAuth compromises (Defender for Cloud Apps), pour AWS (politique de refus) et Okta (suspension) via Sentinel.',
    '## Où l’action s’exécute',
    'Pour un compte hébergé dans **Active Directory**, la désactivation passe par les contrôleurs de domaine qui exécutent le capteur Defender for Identity. Pour un compte AD synchronisé, elle passe aussi par les contrôleurs, et la perturbation désactive également le compte dans Entra ID. Pour un compte **infonuagique seulement**, l’action s’exécute dans Entra ID au moyen d’une application d’entreprise gérée par Microsoft qui valide les rôles. Conséquence : sans capteur sain sur un contrôleur de domaine, la désactivation d’un compte local peut échouer. Vérifiez la santé des capteurs (module 8) avant de compter sur l’automatisme. Le contrôle de contention exige des appareils Windows 10 et 11 ou Windows Server pris en charge avec une version de l’agent suffisante.',
    '## Voir ce qui s’est passé',
    'Dans le portail, l’incident porte l’étiquette **Attack Disruption**, une bannière jaune et l’état des actifs (compte désactivé, appareil contenu) ; l’**Action Center** liste les actions. En chasse avancée, la table **DisruptionAndResponseEvents** donne une vue de toute l’organisation. Dans DeviceEvents, les types contenant `ContainedUser` ou `ContainedDevice` montrent les activités **bloquées à cause** de la contention, pas la contention elle-même.',
    '```kusto',
    'DisruptionAndResponseEvents',
    '| where Timestamp > ago(30d)',
    '| project Timestamp, ActionType, AttackDisruptionCategory, DeviceName, AccountUpn, RemoteIP',
    '| order by Timestamp desc',
    '```',
    '## Exclusions : exception, pas confort',
    'Des exclusions existent pour les **comptes d’utilisateur**, les **groupes d’appareils** et les **adresses IP** (Settings > Microsoft Defender XDR > Automated response). On les réserve aux comptes de service critiques, aux comptes d’urgence et aux infrastructures sensibles. Microsoft déconseille d’exclure des actifs sans raison : une exclusion réduit l’efficacité de la perturbation contre des attaques sophistiquées. Pour chaque exclusion, notez le propriétaire, la justification, la date de revue et une **mesure compensatoire** (surveillance dédiée, privilèges réduits). Un compte exclu qui est aussi un administrateur global est un risque, pas une solution.',
    '## Gouvernance',
    'Définissez qui peut annuler une action, dans quel délai un analyste vérifie une désactivation et comment l’entreprise est avertie. Une désactivation automatique d’un compte de service peut interrompre une chaîne d’exploitation : testez en simulation avec les propriétaires avant de les exclure.',
  ),
  demo: { title: 'Lire une perturbation', body: md(
    'Incident **fictif** :',
    '```text',
    'Incident 4812 [Attack Disruption]',
    'Compte amelie@nordlys.example : désactivé (DC avec capteur) + session Entra révoquée',
    'Appareil PC-0412 : contenu (ContainedDevice)',
    '```',
    '**Lecture commentée.** Deux actions distinctes : le compte est désactivé côté identité, l’appareil est contenu côté point de terminaison.',
    '**Ce que la démo ne prouve pas.** Aucune action réelle n’a été exécutée.') },
  guided: 'x10-g3', autonomous: 'x10-a3', quiz: ['x10-q3a', 'x10-q3b', 'x10-q3c'],
  revision: md('## Fiche : perturbation des attaques', '- Disable user (MDI), contain user (MDE, 5 jours, compte non désactivé), revoke session (Entra).', '- Compte local : exécution via DC avec capteur ; infonuagique : via Entra.', '- Vérification : étiquette Attack Disruption, Action Center, DisruptionAndResponseEvents.', '- Exclusions : utilisateurs, appareils, IP ; exception documentée avec mesure compensatoire.'),
  links: [sref('xdr-disruption'), sref('xdr-disruption-excl'), sref('xdr-disruption-results'), sref('mde-respond-actions'), sref('mdi-remediation'), sref('mdi-health')], teaches: ['attack-disruption', 'contain-user', 'exclusions'],
};

const exercises = [
  a.match({ id: 'x10-g1', title: 'Risque et question', comp: c1.comp, tags: c1.tags, role: 'guided', dim: 'comprendre', lesson: 'x10-l1',
    st: 'Associez chaque notion à la question à laquelle elle répond.', items: [['p1', 'Risque de connexion'], ['p2', 'Risque d’utilisateur'], ['p3', 'Signaux unifiés']],
    options: [['s1', 'Cette ouverture de session est-elle légitime ?'], ['s2', 'Ce compte est-il probablement compromis ?'], ['s3', 'Plusieurs signaux faibles s’additionnent-ils ?']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Le risque de connexion vise une session, celui de l’utilisateur vise le compte, et les signaux unifiés les composent.' }),
  a.config({ id: 'x10-a1', title: 'Politique de risque prudente', comp: c1.comp, tags: c1.tags, role: 'autonomous', dim: 'securiser', lesson: 'x10-l1',
    st: 'Paramétrez une politique basée sur le risque d’utilisateur élevé.',
    fields: [
      { id: 'ctl', label: 'Contrôle exigé', kind: 'select', options: [{ id: 'bloquer', label: 'Bloquer' }, { id: 'changer-mot-de-passe', label: 'Changer le mot de passe' }, { id: 'rien', label: 'Rien' }], accept: ['changer-mot-de-passe'], why: 'Permet l’autoremédiation.' },
      { id: 'sspr', label: 'Réinitialisation libre-service activée', kind: 'toggle', accept: ['on'], why: 'Sinon les utilisateurs sont verrouillés.' },
      { id: 'bg', label: 'Compte d’urgence exclu', kind: 'toggle', accept: ['on'], why: 'Évite un verrouillage global.' },
      { id: 'p2', label: 'Licence Entra ID P2 vérifiée', kind: 'toggle', accept: ['on'], why: 'Condition d’application.' },
    ], solution: { ctl: 'changer-mot-de-passe', sspr: 'on', bg: 'on', p2: 'on' }, exp: 'Autoremédiation avec réinitialisation libre-service, exclusion d’urgence et licence vérifiée.' }),
  Q('x10-q1a', 'quiz', 'comprendre', c1, 'Identifiants divulgués', 'Quel est le niveau de risque d’une détection d’identifiants divulgués confirmés ?', ['Toujours élevé.', 'Il s’agit d’une exposition vérifiée.'], [['Toujours faible.', 'Non.'], ['Variable selon l’heure.', 'Non.'], ['Aucun niveau.', 'Il en a un.']], 'La détection est toujours élevée, car l’exposition est vérifiée.'),
  Q('x10-q1b', 'quiz', 'fonctionner', c1, 'Prérequis unifié', 'Que faut-il pour que le risque soit composé ?', ['Entra ID P2 et Defender for Identity configuré.', 'Sans lui, aucune composition.'], [['Seulement Entra Free.', 'Insuffisant.'], ['Intune.', 'Non.'], ['Purview.', 'Non.']], 'P2 et Defender for Identity sont requis.'),
  Q('x10-q1c', 'quiz', 'securiser', c1, 'Première ligne', 'Quelle remédiation tenter en premier ?', ['L’autoremédiation par une politique d’accès conditionnel.', 'Avant l’action manuelle.'], [['Supprimer le compte.', 'Trop radical.'], ['Ignorer.', 'Non.'], ['Désactiver le pare-feu.', 'Non.']], 'On vise d’abord l’autoremédiation.'),

  a.match({ id: 'x10-g2', title: 'Colonne et usage', comp: c2.comp, tags: c2.tags, role: 'guided', dim: 'comprendre', lesson: 'x10-l2',
    st: 'Associez chaque élément de l’inventaire à son usage.', items: [['p1', 'Score de risque'], ['p2', 'Étiquette Honeytoken'], ['p3', 'Environnement d’identité']],
    options: [['s1', 'Prioriser les enquêtes'], ['s2', 'Piège : toute activité est suspecte'], ['s3', 'Local, infonuagique ou hybride']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Le score priorise, le honeytoken sert de piège et l’environnement indique où le compte vit.' }),
  a.order({ id: 'x10-a2', title: 'Trier l’inventaire', comp: c2.comp, tags: c2.tags, role: 'autonomous', dim: 'maintenir', lesson: 'x10-l2',
    st: 'Ordonnez la priorité de traitement des comptes.',
    items: [['s1', 'Comptes critiques et privilégiés à risque élevé'], ['s2', 'Comptes de service à mot de passe ancien'], ['s3', 'Comptes dormants privilégiés'], ['s4', 'Comptes humains à faible risque']], correct: ['s1', 's2', 's3', 's4'],
    exp: 'On traite d’abord l’impact potentiel le plus élevé, puis la dette de configuration.' }),
  Q('x10-q2a', 'quiz', 'comprendre', c2, 'ISPM et SSPM', 'Que couvre le SSPM ?', ['La configuration des applications SaaS.', 'Via Defender for Cloud Apps.'], [['Active Directory.', 'C’est l’ISPM.'], ['Les appareils.', 'Non.'], ['Le réseau.', 'Non.']], 'Le SSPM couvre la configuration SaaS.'),
  Q('x10-q2b', 'quiz', 'fonctionner', c2, 'Okta', 'Que permet l’intégration d’Okta dans Defender ?', ['Voir les comptes, recevoir des alertes et agir (révoquer, désactiver).', 'Avec corrélation AD et Entra.'], [['Remplacer la configuration d’Okta.', 'Non.'], ['Supprimer Okta.', 'Non.'], ['Aucune action.', 'Des actions existent.']], 'Visibilité, alertes et actions, sans remplacer la configuration d’Okta.'),
  Q('x10-q2c', 'quiz', 'maintenir', c2, 'Préversion', 'Comment traiter une fonction annoncée en préversion ?', ['La revérifier avant de s’y engager.', 'Elle peut changer.'], [['La considérer stable.', 'Non.'], ['L’ignorer toujours.', 'Non.'], ['Lui faire confiance.', 'Non.']], 'On revérifie, car la préversion peut changer.'),

  a.match({ id: 'x10-g3', title: 'Action et portée', comp: c3.comp, tags: c3.tags, role: 'guided', dim: 'comprendre', lesson: 'x10-l3',
    st: 'Associez chaque action à son effet.', items: [['p1', 'Disable user'], ['p2', 'Contain user'], ['p3', 'Revoke session']],
    options: [['s1', 'Suspend le compte'], ['s2', 'Bloque le trafic entrant du compte sur les appareils'], ['s3', 'Coupe les sessions actives']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Désactiver suspend le compte, contenir bloque sur les appareils et révoquer coupe les sessions.' }),
  a.inspect({ id: 'x10-a3', title: 'Relire une politique d’exclusion', comp: c3.comp, tags: c3.tags, role: 'autonomous', dim: 'securiser', lesson: 'x10-l3', language: 'text',
    st: 'Plan fictif. Repérez les failles.',
    lines: [['p1', 'Nous excluons tous les administrateurs globaux pour éviter les interruptions.', { ok: 'a1', fixes: [['a1', 'Exclure seulement les comptes d’urgence, avec surveillance dédiée'], ['a2', 'Accepter']] }], ['p2', 'Les exclusions n’ont pas de date de revue.', { ok: 'b1', fixes: [['b1', 'Définir propriétaire, justification et date de revue'], ['b2', 'Accepter']] }], ['p3', 'Nous comptons sur la désactivation automatique sans vérifier les capteurs.', { ok: 'c1', fixes: [['c1', 'Vérifier la santé des capteurs sur les contrôleurs de domaine'], ['c2', 'Accepter']] }]],
    exp: 'Une exclusion large ou sans revue affaiblit la protection, et l’automatisme dépend de capteurs sains.' }),
  Q('x10-q3a', 'quiz', 'comprendre', c3, 'Contain user', 'Que fait l’action contain user ?', ['Bloque le trafic du compte sur les appareils sans désactiver le compte.', 'Levée après cinq jours si automatique.'], [['Supprime le compte.', 'Non.'], ['Change le mot de passe.', 'Non.'], ['Désactive Entra.', 'Non.']], 'La contention agit sur les appareils sans désactiver le compte.'),
  Q('x10-q3b', 'quiz', 'fonctionner', c3, 'Exécution locale', 'Comment un compte Active Directory est-il désactivé ?', ['Via un contrôleur de domaine avec le capteur Defender for Identity.', 'Santé du capteur essentielle.'], [['Via Intune.', 'Non.'], ['Via le navigateur.', 'Non.'], ['Via DNS.', 'Non.']], 'La désactivation passe par les contrôleurs de domaine avec capteur.'),
  Q('x10-q3c', 'quiz', 'maintenir', c3, 'Chasse', 'Quelle table donne une vue organisationnelle des actions de perturbation ?', ['DisruptionAndResponseEvents.', 'En chasse avancée.'], [['DeviceFileEvents.', 'Non.'], ['EmailEvents.', 'Non.'], ['UrlClickEvents.', 'Non.']], 'DisruptionAndResponseEvents liste les actions.'),

  Q('x10-ev1', 'eval', 'comprendre', c1, 'Hors ligne', 'Qu’est-ce qu’une détection hors ligne ?', ['Une détection calculée après la connexion.', 'Elle ne peut pas arrêter la connexion en cours.'], [['Une détection en temps réel.', 'C’est l’inverse.'], ['Une détection locale.', 'Non.'], ['Un journal papier.', 'Non.']], 'Elle est calculée après coup.'),
  M('x10-ev2', 'eval', 'fonctionner', c1, 'Remédiations manuelles', 'Cochez les actions administratives de remédiation d’un risque.', [['Réinitialiser le mot de passe.', 'Action prévue.'], ['Révoquer les sessions.', 'Action prévue.']], [['Supprimer le locataire.', 'Absurde.'], ['Désactiver la journalisation.', 'Dangereux.']], 'Réinitialiser, exiger de réenregistrer, bloquer ou révoquer sont les actions prévues.'),
  a.config({ id: 'x10-ev3', title: 'Inventaire et exploitation', comp: c2.comp, tags: c2.tags, role: 'eval', dim: 'maintenir', lesson: 'x10-l2',
    st: 'Paramétrez le suivi des identités critiques.',
    fields: [
      { id: 'own', label: 'Propriétaire documenté pour chaque compte de service', kind: 'toggle', accept: ['on'], why: 'Sans propriétaire, pas de remédiation.' },
      { id: 'tag', label: 'Honeytokens étiquetés et surveillés', kind: 'toggle', accept: ['on'], why: 'Piège efficace.' },
      { id: 'rev', label: 'Revue périodique des comptes dormants privilégiés', kind: 'toggle', accept: ['on'], why: 'Réduit la surface.' },
    ], solution: { own: 'on', tag: 'on', rev: 'on' }, exp: 'Propriétaires, honeytokens et revue des comptes dormants.' }),
  a.fix({ id: 'x10-ev4', title: 'Corriger une exclusion', comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'securiser', lesson: 'x10-l3', language: 'json',
    st: 'Corrigez : cible restreinte au compte d’urgence, revue datée, mesure compensatoire.',
    starter: JSON.stringify({ cible: 'tous-les-admins', revue: 'aucune', compensation: 'aucune' }, null, 2),
    rules: [{ kind: 'equals', path: 'cible', value: 'compte-urgence', message: 'Restreindre au compte d’urgence.', dim: 'securiser' }, { kind: 'equals', path: 'revue', value: 'trimestrielle', message: 'Planifier une revue.', dim: 'maintenir' }, { kind: 'equals', path: 'compensation', value: 'surveillance-dediee', message: 'Ajouter une surveillance dédiée.', dim: 'securiser' }],
    solution: JSON.stringify({ cible: 'compte-urgence', revue: 'trimestrielle', compensation: 'surveillance-dediee' }, null, 2), exp: 'Une exclusion étroite, revue et compensée limite le risque résiduel.' }),
  a.match({ id: 'x10-ev5', title: 'Hébergement et exécution', comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'fonctionner', lesson: 'x10-l3',
    st: 'Associez chaque compte au lieu d’exécution de la désactivation.', items: [['p1', 'Compte AD seulement'], ['p2', 'Compte AD synchronisé'], ['p3', 'Compte infonuagique seulement']],
    options: [['s1', 'Contrôleur de domaine avec capteur'], ['s2', 'Contrôleur de domaine et Entra ID'], ['s3', 'Entra ID via application gérée']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'L’exécution dépend de l’hébergement du compte : contrôleur de domaine, les deux, ou Entra seulement.' }),
  a.inspect({ id: 'x10-ev6', title: 'Relire un rapport d’identité', comp: c1.comp, tags: c1.tags, role: 'eval', dim: 'securiser', lesson: 'x10-l1', language: 'text',
    st: 'Extrait d’un rapport. Repérez les faiblesses.',
    lines: [['r1', 'La politique de risque est active, sans vérifier la licence P2.', { ok: 'a1', fixes: [['a1', 'Vérifier la licence Entra ID P2'], ['a2', 'Accepter']] }], ['r2', 'Le changement de mot de passe est exigé sans réinitialisation libre-service.', { ok: 'b1', fixes: [['b1', 'Activer la réinitialisation libre-service'], ['b2', 'Accepter']] }], ['r3', 'Les signaux unifiés sont activés sans Defender for Identity.', { ok: 'c1', fixes: [['c1', 'Configurer Defender for Identity d’abord'], ['c2', 'Accepter']] }]],
    exp: 'Trois prérequis manquent : licence, réinitialisation libre-service et Defender for Identity.' }),
  a.workflow({ id: 'x10-ev7', title: 'Répondre à un compte compromis', comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'securiser', lesson: 'x10-l3',
    st: 'Ordonnez la réponse à un compte soupçonné compromis.',
    blocks: [['b1', 'Confirmer le risque dans les rapports et les incidents'], ['b2', 'Révoquer les sessions et contenir ou désactiver'], ['b3', 'Réinitialiser le mot de passe et réenregistrer l’authentification multifacteur'], ['b4', 'Chercher le mouvement latéral'], ['b5', 'Documenter et lever la contention'], ['b6', 'Fermer sans vérifier']],
    required: ['b1', 'b2', 'b3', 'b4', 'b5'], forbidden: ['b6'], before: [['b1', 'b2'], ['b2', 'b3'], ['b3', 'b4'], ['b4', 'b5']], notes: { b6: 'Un compte compromis peut avoir déjà servi.' }, solution: ['b1', 'b2', 'b3', 'b4', 'b5'],
    exp: 'On confirme, on contient, on remédie, on cherche l’étendue puis on documente.' }),
  a.short({ id: 'x10-ev8', title: 'Jours de contention', comp: c3.comp, tags: c3.tags, role: 'eval', dim: 'comprendre', lesson: 'x10-l3',
    st: 'Après combien de jours un utilisateur contenu par la perturbation sort-il automatiquement de contention ? (nombre)', accepted: ['5'], numeric: { value: 5 }, ph: 'un nombre',
    exp: 'La contention déclenchée par la perturbation automatique est levée automatiquement après cinq jours.' }),

  a.config({ id: 'x10-cs1', title: 'Cas : identités à risque chez Nordlys', comp: c1.comp, tags: c1.tags, role: 'case', dim: 'securiser', lesson: 'x10-l1',
    st: 'Paramétrez la réaction au risque.',
    fields: [
      { id: 'si', label: 'Authentification multifacteur sur risque de connexion moyen ou plus', kind: 'toggle', accept: ['on'], why: 'Autoremédiation.' },
      { id: 'ur', label: 'Changement de mot de passe sur risque d’utilisateur élevé', kind: 'toggle', accept: ['on'], why: 'Remédie le compte.' },
      { id: 'mdi', label: 'Defender for Identity configuré pour le risque composé', kind: 'toggle', accept: ['on'], why: 'Prérequis.' },
    ], solution: { si: 'on', ur: 'on', mdi: 'on' }, exp: 'Deux politiques de risque et le prérequis de composition.' }),
  a.workflow({ id: 'x10-cs2', title: 'Cas : brancher un fournisseur tiers', comp: c2.comp, tags: c2.tags, role: 'case', dim: 'fonctionner', lesson: 'x10-l2',
    st: 'Ordonnez le branchement d’Okta.',
    blocks: [['t1', 'Vérifier licences et prérequis'], ['t2', 'Connecter Okta à Defender for Identity'], ['t3', 'Valider les comptes dans l’inventaire'], ['t4', 'Tester une action sur un compte de test'], ['t5', 'Documenter les limites'], ['t6', 'Promettre une couverture complète']],
    required: ['t1', 't2', 't3', 't4', 't5'], forbidden: ['t6'], before: [['t1', 't2'], ['t2', 't3'], ['t3', 't4'], ['t4', 't5']], notes: { t6: 'La configuration d’Okta reste nécessaire.' }, solution: ['t1', 't2', 't3', 't4', 't5'],
    exp: 'On vérifie, on connecte, on valide, on teste sur un compte de test puis on documente.' }),
  a.match({ id: 'x10-cs3', title: 'Cas : trois incidents, trois actions', comp: c3.comp, tags: c3.tags, role: 'case', dim: 'fonctionner', lesson: 'x10-l3',
    st: 'Associez chaque situation à l’action la plus adaptée.', items: [['p1', 'Rançongiciel avec compte AD volé'], ['p2', 'Jeton de session volé dans le nuage'], ['p3', 'Application OAuth malveillante']],
    options: [['s1', 'Désactiver et contenir le compte'], ['s2', 'Révoquer les sessions Entra'], ['s3', 'Mesures sur l’application OAuth']], answer: { p1: 's1', p2: 's2', p3: 's3' },
    exp: 'Chaque situation correspond à une action de perturbation différente.' }),
  a.open({ id: 'x10-cs-open', title: 'Cas : programme de réponse sur les identités', comp: c3.comp, tags: c3.tags, role: 'case', dim: 'maintenir', lesson: 'x10-l3',
    st: 'Rédigez le programme de réponse sur les identités d’une organisation fictive.',
    deliverable: 'Un programme : politiques de risque, sources d’identité, actions automatiques, exclusions justifiées, vérification, gouvernance, limites.',
    rubric: [['r1', 'Les politiques de risque sont justifiées.', 'securiser'], ['r2', 'Les prérequis et licences sont nommés.', 'comprendre'], ['r3', 'Les exclusions sont documentées avec compensation.', 'securiser'], ['r4', 'La vérification par chasse ou Action Center est prévue.', 'maintenir'], ['r5', 'Les limites sont reconnues.', 'comprendre']],
    exp: 'Pas de note automatique : on juge la cohérence du programme.' }),

  Q('x10-rm1', 'remediation', 'comprendre', c1, 'Remédiation : deux risques', 'Quelle est la différence entre risque de connexion et risque d’utilisateur ?', ['Le premier vise une session, le second le compte.', 'Deux questions distinctes.'], [['Aucune.', 'Elles diffèrent.'], ['Le premier vise le compte.', 'C’est l’inverse.'], ['Ce sont des licences.', 'Non.']], 'Une session d’un côté, le compte de l’autre.'),
  Q('x10-rm2', 'remediation', 'securiser', c2, 'Remédiation : Okta', 'Que ne remplace pas l’intégration d’Okta ?', ['La configuration d’Okta lui-même.', 'Elle ajoute visibilité et actions.'], [['La licence Defender.', 'Hors sujet.'], ['Le pare-feu.', 'Non.'], ['Le DNS.', 'Non.']], 'L’intégration n’est pas une configuration d’Okta.'),
  Q('x10-rm3', 'remediation', 'maintenir', c3, 'Remédiation : exclusions', 'Que doit comporter une exclusion de la perturbation ?', ['Propriétaire, justification, date de revue et mesure compensatoire.', 'Elle reste une exception.'], [['Rien.', 'Non.'], ['Un secret partagé.', 'Non.'], ['Une exemption permanente.', 'Non.']], 'Chaque exclusion se documente et se revoit.'),
];

const competencies: AiCompetency[] = [
  { id: 'x10-c1', module: 'x10', name: 'Piloter le risque d’identité', description: 'Détections, politiques et risque composé.', criteria: [{ id: 'x10-c1-1', text: 'Je distingue risque de connexion et d’utilisateur.' }, { id: 'x10-c1-2', text: 'Je conçois une politique de risque avec ses prérequis.' }, { id: 'x10-c1-3', text: 'J’explique le risque composé.' }] },
  { id: 'x10-c2', module: 'x10', name: 'Exploiter l’inventaire d’identités', description: 'Inventaire, tiers et recommandations.', criteria: [{ id: 'x10-c2-1', text: 'Je lis l’inventaire pour prioriser.' }, { id: 'x10-c2-2', text: 'Je connais les apports et limites d’Okta.' }, { id: 'x10-c2-3', text: 'Je distingue ISPM et SSPM.' }] },
  { id: 'x10-c3', module: 'x10', name: 'Encadrer la perturbation automatique', description: 'Actions, vérification et exclusions.', criteria: [{ id: 'x10-c3-1', text: 'Je distingue désactiver, contenir et révoquer.' }, { id: 'x10-c3-2', text: 'Je vérifie l’action par portail et chasse.' }, { id: 'x10-c3-3', text: 'Je justifie chaque exclusion.' }] },
];

const projects: AiProject[] = [
  { id: 'x10-p1', module: 'x10', level: 'débutant', title: 'Carte des signaux d’identité', problem: 'Dessiner d’où viennent les signaux d’identité et où ils se rencontrent.', architecture: 'Schéma d’une page.', tools: ['Éditeur de schémas'], data: 'Aucune donnée réelle.', steps: ['Lister les sources.', 'Tracer les flux.', 'Marquer les prérequis.'], success: ['Chaque flèche cite une source.'], risks: ['Oublier Defender for Identity.'], extensions: ['Ajouter un fournisseur tiers.'] },
  { id: 'x10-p2', module: 'x10', level: 'intermédiaire', title: 'Politiques de risque et exclusions', problem: 'Concevoir les politiques basées sur le risque et la liste d’exclusions de la perturbation.', architecture: 'Matrice politique, contrôle, exclusions, revue.', tools: ['Tableur'], data: 'Comptes fictifs.', steps: ['Définir les seuils.', 'Définir les contrôles.', 'Définir les exclusions.', 'Définir la revue.'], success: ['Aucun verrouillage possible.'], risks: ['Exclure trop de comptes.'], extensions: ['Ajouter les indicateurs.'],
    connected: { accounts: 'Un locataire de test avec Entra ID P2 et Defender for Identity.', permissions: 'Security Administrator et Conditional Access Administrator dans le locataire de test.', costs: 'Licences de test à votre charge.', secrets: 'Aucun secret.', cleanup: 'Supprimer politiques et exclusions de test.', limits: 'Facultatif : la conception se fait sur papier.' } },
  { id: 'x10-p3', module: 'x10', level: 'avancé', title: 'Scénario de compromission d’identité', problem: 'Écrire un scénario de réponse allant du signal à la remédiation et à la levée de contention.', architecture: 'Déroulé avec rôles, décisions et vérifications.', tools: ['Éditeur de texte'], data: 'Incident fictif.', steps: ['Décrire le signal.', 'Décider de l’action.', 'Vérifier.', 'Lever.'], success: ['Chaque action a un responsable.'], risks: ['Oublier la vérification.'], extensions: ['Ajouter une requête de chasse.'] },
];

export const x10 = assemble({ id: 'x10', level: 3, n: 10, title: 'Identités et services connexes',
  summary: 'Entra ID Protection, sécurité des identités dans Defender, fournisseurs tiers, perturbation automatique des attaques sur les comptes et exclusions.',
  lessons: [l1, l2, l3], exercises, competencies, projects,
  caseTitle: 'Identités à risque chez Nordlys',
  caseScenario: 'Vous paramétrez la réaction au risque, branchez un fournisseur tiers et associez trois incidents à leurs actions. Tout reste sur papier.', caseMinutes: 45 });
